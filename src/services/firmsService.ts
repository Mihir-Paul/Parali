export interface FirmsFireRecord {
  latitude: number;
  longitude: number;
  acq_date: string;
  acq_time: string;
  confidence: string;
  frp: number | null;
  bright_ti4: number | null;
  bright_ti5: number | null;
  scan: number | null;
  track: number | null;
  satellite: string;
  instrument: string;
  daynight: string;
  version?: string;
}

export interface FirmsApiResponse {
  source: string;
  sensor: string;
  sensor_description: string;
  count: number;
  area: string;
  days: number;
  fires: FirmsFireRecord[];
  message: string;
}

import { BACKEND_URL } from '../config/api';

/**
 * Fetches real satellite fire / thermal anomaly detection data from FastAPI backend NASA FIRMS endpoint.
 */
export async function fetchFirmsData(
  days: number = 1,
  source: string = 'VIIRS_SNPP_NRT',
  area: string = '73.8,27.6,77.6,32.5'
): Promise<FirmsApiResponse> {
  console.log('[FIRMS] Requesting satellite fire data...');
  console.log(`[FIRMS] Source: ${source}`);
  console.log(`[FIRMS] Bounding box: ${area}`);
  console.log(`[FIRMS] Days: ${days}`);

  const url = `${BACKEND_URL}/api/firms/test?days=${days}&source=${encodeURIComponent(source)}&area=${encodeURIComponent(area)}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
  } catch (networkError: any) {
    // Network-level failure: backend unreachable, CORS, DNS, etc.
    console.error('[FIRMS] Network error — backend unreachable:', networkError);
    throw new Error(
      `Backend server unreachable at ${BACKEND_URL}. Ensure the FastAPI backend is running (python -m uvicorn backend.main:app --port 8000).`
    );
  }

  if (!response.ok) {
    let errorDetail = `NASA FIRMS backend request failed (HTTP ${response.status})`;
    try {
      const errorText = await response.text();
      const errorJson = JSON.parse(errorText);
      if (errorJson && errorJson.detail) {
        errorDetail = errorJson.detail;
      }
    } catch {
      // Fallback to default message
    }

    // Map HTTP status codes to structured, user-actionable messages
    if (response.status === 401 || response.status === 403) {
      errorDetail = `NASA FIRMS authentication failed — the API key is invalid or unauthorized (HTTP ${response.status}).`;
    } else if (response.status === 429) {
      errorDetail = 'NASA FIRMS rate limit reached. Satellite data will be available again shortly — please retry in a few minutes.';
    } else if (response.status === 504) {
      errorDetail = 'NASA FIRMS service timed out. The satellite data service may be temporarily slow — please retry.';
    }

    console.error(`[FIRMS] HTTP ${response.status} error from backend:`, errorDetail);
    throw new Error(errorDetail);
  }

  const data: FirmsApiResponse = await response.json();
  console.log(`[FIRMS] Records returned: ${data.count}`);
  return data;
}

/**
 * Safely normalizes NASA FIRMS confidence values into standard categories: 'high', 'nominal', 'low', or 'unknown'.
 * Supports VIIRS ('h'/'high', 'n'/'nominal', 'l'/'low') and MODIS numeric (0-100).
 */
export type NormalizedConfidence = 'high' | 'nominal' | 'low' | 'unknown';

export function normalizeFirmsConfidence(raw: string | number | undefined | null): NormalizedConfidence {
  if (raw === undefined || raw === null) return 'unknown';

  const str = String(raw).trim().toLowerCase();
  if (str === 'high' || str === 'h') return 'high';
  if (str === 'nominal' || str === 'n') return 'nominal';
  if (str === 'low' || str === 'l') return 'low';

  const num = Number(str);
  if (!isNaN(num)) {
    if (num >= 80) return 'high';
    if (num >= 30) return 'nominal';
    if (num >= 0) return 'low';
  }

  return 'unknown';
}

/**
 * Calculates Haversine distance in kilometers between two geographic coordinates.
 */
export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

