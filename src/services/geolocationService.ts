export interface GeolocationPositionResult {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface GeolocationErrorResult {
  code: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'UNSUPPORTED';
  message: string;
}

/**
 * Acquires live user device location via Web Browser Geolocation API.
 * Uses high accuracy where supported.
 * Does NOT return dummy or hardcoded fallback coordinates upon failure.
 */
export function getCurrentPosition(): Promise<GeolocationPositionResult> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        code: 'UNSUPPORTED',
        message: 'Geolocation is not supported by your browser.'
      } as GeolocationErrorResult);
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        });
      },
      (err) => {
        let code: GeolocationErrorResult['code'] = 'POSITION_UNAVAILABLE';
        let message = 'Unable to acquire device location.';

        if (err.code === err.PERMISSION_DENIED) {
          code = 'PERMISSION_DENIED';
          message = 'Location permission was denied. Please enter your farm/facility location manually or enable location access.';
        } else if (err.code === err.TIMEOUT) {
          code = 'TIMEOUT';
          message = 'Location request timed out. Please try again or enter location manually.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          code = 'POSITION_UNAVAILABLE';
          message = 'Position unavailable. Please ensure location services are enabled on your device.';
        }

        reject({ code, message } as GeolocationErrorResult);
      },
      options
    );
  });
}

/**
 * Validates whether latitude and longitude are valid geographic numbers.
 * Latitude must be within [-90, 90].
 * Longitude must be within [-180, 180].
 */
export function validateCoordinates(lat: any, lng: any): boolean {
  if (lat === null || lat === undefined || lng === null || lng === undefined) {
    return false;
  }
  const parsedLat = Number(lat);
  const parsedLng = Number(lng);

  if (isNaN(parsedLat) || isNaN(parsedLng)) {
    return false;
  }

  if (parsedLat < -90 || parsedLat > 90) {
    return false;
  }

  if (parsedLng < -180 || parsedLng > 180) {
    return false;
  }

  return true;
}
