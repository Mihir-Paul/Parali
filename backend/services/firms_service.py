import os
import csv
import io
import logging
from typing import Dict, Any, List, Optional
import requests
from dotenv import load_dotenv

# Load root or backend .env file if available
root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
dotenv_path = os.path.join(root_dir, '.env')
backend_dotenv = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')

if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path, override=True)
elif os.path.exists(backend_dotenv):
    load_dotenv(backend_dotenv, override=True)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("firms_service")
logger.setLevel(logging.INFO)

# Supported NASA FIRMS VIIRS/MODIS sensor sources
VALID_SOURCES = {
  "VIIRS_SNPP_NRT": "Suomi NPP VIIRS Near Real Time",
  "VIIRS_NOAA20_NRT": "NOAA-20 VIIRS Near Real Time",
  "VIIRS_NOAA21_NRT": "NOAA-21 VIIRS Near Real Time",
  "MODIS_NRT": "Terra/Aqua MODIS Near Real Time"
}

# Default Punjab / Haryana bounding box: [West, South, East, North]
DEFAULT_PUNJAB_HARYANA_BBOX = "73.8,27.6,77.6,32.5"


class FirmsRateLimitError(Exception):
    """Raised when NASA FIRMS API returns HTTP 429 Rate Limit Exceeded."""
    pass


class FirmsService:
    def __init__(self):
        self.api_base_url = "https://firms.modaps.eosdis.nasa.gov/api/area/csv"

    def get_map_key(self) -> Optional[str]:
        if os.path.exists(dotenv_path):
            load_dotenv(dotenv_path, override=True)
        elif os.path.exists(backend_dotenv):
            load_dotenv(backend_dotenv, override=True)

        key = os.getenv("NASA_FIRMS_MAP_KEY")
        if not key or key.strip() == "" or key.strip() == "your_nasa_firms_map_key_here":
            return None
        return key.strip()

    def _mask_sensitive_data(self, text: str, map_key: Optional[str]) -> str:
        if map_key and map_key in text:
            return text.replace(map_key, "***MASKED_KEY***")
        return text

    def fetch_fire_data(
        self,
        area_bbox: str = DEFAULT_PUNJAB_HARYANA_BBOX,
        source: str = "VIIRS_SNPP_NRT",
        day_range: int = 1
    ) -> Dict[str, Any]:
        map_key = self.get_map_key()
        if not map_key:
            logger.error("NASA FIRMS key loaded: NO")
            raise ValueError("NASA FIRMS API key is not configured.")

        logger.info("NASA FIRMS key loaded: YES")

        if source not in VALID_SOURCES:
            source = "VIIRS_SNPP_NRT"

        # FIRMS NRT Area CSV API allows 1 to 5 days range
        day_range = max(1, min(day_range, 5))

        url = f"{self.api_base_url}/{map_key}/{source}/{area_bbox}/{day_range}"
        headers = {
            "User-Agent": "Parali-AI-Engine/1.0 (Smart India Hackathon Valorization Platform)"
        }

        try:
            logger.info("NASA FIRMS request params | Source: %s | Bounding box: %s | Day range: %d", source, area_bbox, day_range)
            response = requests.get(url, headers=headers, timeout=15)
            
            logger.info("NASA FIRMS HTTP status code: %d", response.status_code)
            logger.info("NASA FIRMS response content-type: %s", response.headers.get("Content-Type", "unknown"))
            logger.info("NASA FIRMS response size: %d bytes", len(response.content))
            logger.info("NASA FIRMS first small portion of response: %s", repr(response.text[:300]))

            if response.status_code in (401, 403):
                logger.error("NASA FIRMS authentication failed (HTTP %d)", response.status_code)
                raise PermissionError("Invalid or unauthorized NASA FIRMS MAP_KEY.")
            
            if response.status_code == 429:
                logger.warning("NASA FIRMS rate limit exceeded (HTTP 429)")
                raise FirmsRateLimitError("NASA FIRMS rate limit reached. Please retry shortly.")

            if response.status_code != 200:
                logger.error("NASA FIRMS API returned HTTP status %d", response.status_code)
                raise RuntimeError(f"NASA FIRMS API returned error status {response.status_code}")

            raw_csv = response.text.strip()
            return self.parse_firms_csv(raw_csv, source=source, area=area_bbox, days=day_range)

        except requests.exceptions.Timeout:
            logger.error("NASA FIRMS API request timed out (15s)")
            raise TimeoutError("NASA FIRMS service is temporarily unavailable (connection timeout).")
        except (PermissionError, FirmsRateLimitError, RuntimeError, ValueError):
            raise
        except requests.exceptions.RequestException as req_err:
            masked_msg = self._mask_sensitive_data(str(req_err), map_key)
            logger.error("NASA FIRMS request failed: %s", masked_msg)
            raise RuntimeError("NASA FIRMS service network request failed.")

    def parse_firms_csv(
        self,
        csv_content: str,
        source: str = "VIIRS_SNPP_NRT",
        area: str = DEFAULT_PUNJAB_HARYANA_BBOX,
        days: int = 1
    ) -> Dict[str, Any]:
        sensor_short = "VIIRS" if "VIIRS" in source else ("MODIS" if "MODIS" in source else source)

        csv_lower = csv_content.lower() if csv_content else ""

        if "invalid map_key" in csv_lower or "invalid map key" in csv_lower or ("map key" in csv_lower and "invalid" in csv_lower):
            logger.error("NASA FIRMS returned invalid MAP_KEY message in CSV body")
            raise PermissionError("Invalid or unauthorized NASA FIRMS MAP_KEY.")

        if "transaction limit" in csv_lower or "rate limit" in csv_lower:
            logger.warning("NASA FIRMS transaction limit reached in CSV body")
            raise FirmsRateLimitError("NASA FIRMS rate limit reached. Please retry shortly.")

        if not csv_content or "latitude" not in csv_lower:
            # Zero detections or empty response
            return {
                "source": "NASA FIRMS",
                "sensor": sensor_short,
                "sensor_description": VALID_SOURCES.get(source, source),
                "count": 0,
                "area": area,
                "days": days,
                "fires": [],
                "message": "No active fire observations found for the selected area and period."
            }

        fires: List[Dict[str, Any]] = []
        
        try:
            reader = csv.DictReader(io.StringIO(csv_content))
            for row in reader:
                record = self.clean_fire_record(row)
                if record:
                    fires.append(record)
        except Exception as e:
            logger.error("Failed to parse FIRMS CSV response: %s", str(e))
            raise ValueError("Unable to parse NASA FIRMS response.")

        if not fires:
            return {
                "source": "NASA FIRMS",
                "sensor": sensor_short,
                "sensor_description": VALID_SOURCES.get(source, source),
                "count": 0,
                "area": area,
                "days": days,
                "fires": [],
                "message": "No active fire observations found for the selected area and period."
            }

        return {
            "source": "NASA FIRMS",
            "sensor": sensor_short,
            "sensor_description": VALID_SOURCES.get(source, source),
            "count": len(fires),
            "area": area,
            "days": days,
            "fires": fires,
            "message": f"Successfully retrieved {len(fires)} active fire hotspot observation(s)."
        }

    def clean_fire_record(self, row: Dict[str, str]) -> Optional[Dict[str, Any]]:
        try:
            lat = float(row.get("latitude", 0.0))
            lng = float(row.get("longitude", 0.0))
            if lat == 0.0 and lng == 0.0:
                return None

            def safe_float(val: Any) -> Optional[float]:
                try:
                    return float(val) if val is not None and str(val).strip() != "" else None
                except (ValueError, TypeError):
                    return None

            # Normalize acquisition time to HHMM (4 digits)
            raw_time = row.get("acq_time", "").strip()
            if raw_time.isdigit() and len(raw_time) < 4:
                acq_time = raw_time.zfill(4)
            else:
                acq_time = raw_time

            # Normalize confidence ('n' -> 'nominal', 'l' -> 'low', 'h' -> 'high')
            raw_conf = row.get("confidence", "nominal").strip()
            conf_lower = raw_conf.lower()
            if conf_lower == "n":
                confidence = "nominal"
            elif conf_lower == "l":
                confidence = "low"
            elif conf_lower == "h":
                confidence = "high"
            else:
                confidence = raw_conf

            instrument = row.get("instrument", "").strip()
            if not instrument:
                instrument = "VIIRS" if "bright_ti4" in row else "MODIS"

            return {
                "latitude": lat,
                "longitude": lng,
                "acq_date": row.get("acq_date", "").strip(),
                "acq_time": acq_time,
                "confidence": confidence,
                "frp": safe_float(row.get("frp")),
                "bright_ti4": safe_float(row.get("bright_ti4") or row.get("brightness")),
                "bright_ti5": safe_float(row.get("bright_ti5")),
                "scan": safe_float(row.get("scan")),
                "track": safe_float(row.get("track")),
                "satellite": row.get("satellite", "").strip(),
                "instrument": instrument,
                "daynight": row.get("daynight", "").strip(),
                "version": row.get("version", "").strip()
            }
        except Exception:
            return None

