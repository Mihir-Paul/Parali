import React, { useState } from 'react';
import { MapPin, Navigation, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { getCurrentPosition, validateCoordinates } from '../services/geolocationService';

export interface LocationData {
  latitude?: number;
  longitude?: number;
  district?: string;
  state?: string;
  village?: string;
  pickup_location?: string;
}

interface LocationPickerProps {
  initialLocation?: LocationData;
  label?: string;
  helperText?: string;
  onLocationChange: (location: LocationData) => void;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  initialLocation,
  label = 'Farm / Facility Location',
  helperText = 'Acquire GPS coordinates for automated logistics routing.',
  onLocationChange
}) => {
  const [lat, setLat] = useState<string>(
    initialLocation?.latitude != null ? String(initialLocation.latitude) : ''
  );
  const [lng, setLng] = useState<string>(
    initialLocation?.longitude != null ? String(initialLocation.longitude) : ''
  );
  const [district, setDistrict] = useState<string>(initialLocation?.district || '');
  const [stateName, setStateName] = useState<string>(initialLocation?.state || '');
  const [village, setVillage] = useState<string>(initialLocation?.village || initialLocation?.pickup_location || '');

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleAcquireGps = async () => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const pos = await getCurrentPosition();
      const newLat = pos.latitude.toFixed(6);
      const newLng = pos.longitude.toFixed(6);

      setLat(newLat);
      setLng(newLng);

      const parsedLat = Number(newLat);
      const parsedLng = Number(newLng);

      const updated: LocationData = {
        latitude: parsedLat,
        longitude: parsedLng,
        district: district || 'Detected Location',
        state: stateName || 'Local Region',
        village,
        pickup_location: village || `${district}, ${stateName}`
      };

      onLocationChange(updated);
      setSuccessMsg(`GPS coordinates acquired: ${parsedLat.toFixed(4)}°, ${parsedLng.toFixed(4)}°`);
    } catch (err: any) {
      console.warn('[LocationPicker] Geolocation error:', err.message);
      setErrorMsg(err.message || 'Location permission was denied. Please enter your location manually.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualCoordinateChange = (newLatStr: string, newLngStr: string) => {
    setLat(newLatStr);
    setLng(newLngStr);

    const parsedLat = Number(newLatStr);
    const parsedLng = Number(newLngStr);

    if (validateCoordinates(parsedLat, parsedLng)) {
      setErrorMsg(null);
      onLocationChange({
        latitude: parsedLat,
        longitude: parsedLng,
        district,
        state: stateName,
        village,
        pickup_location: village || `${district}, ${stateName}`
      });
    }
  };

  const handleAddressChange = (newDistrict: string, newState: string, newVillage: string) => {
    setDistrict(newDistrict);
    setStateName(newState);
    setVillage(newVillage);

    const parsedLat = Number(lat);
    const parsedLng = Number(lng);

    onLocationChange({
      latitude: validateCoordinates(parsedLat, parsedLng) ? parsedLat : undefined,
      longitude: validateCoordinates(parsedLat, parsedLng) ? parsedLng : undefined,
      district: newDistrict,
      state: newState,
      village: newVillage,
      pickup_location: newVillage || `${newDistrict}, ${newState}`
    });
  };

  return (
    <div className="bg-white border border-forest-150 p-6 rounded-3xl shadow-sm space-y-4 font-sans">
      <div>
        <label className="block text-xs font-black text-forest-950 uppercase tracking-wider">
          {label}
        </label>
        <p className="text-xs text-forest-700 font-medium mt-0.5">{helperText}</p>
      </div>

      {/* GPS Button */}
      <button
        type="button"
        onClick={handleAcquireGps}
        disabled={loading}
        className="w-full bg-forest-600 hover:bg-forest-700 text-white font-extrabold text-xs py-3 px-4 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-white" />
            <span>Acquiring GPS location...</span>
          </>
        ) : (
          <>
            <Navigation className="h-4 w-4 text-emerald-300" />
            <span>Use My Current Location</span>
          </>
        )}
      </button>

      {/* Success Banner */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold p-3 rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Error / Denied Banner */}
      {errorMsg && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold p-3.5 rounded-2xl flex items-start gap-2.5">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-950">{errorMsg}</p>
            <p className="text-[11px] text-amber-800 mt-0.5">
              You can manually enter latitude & longitude or state/district details below.
            </p>
          </div>
        </div>
      )}

      {/* Coordinates Inputs */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <div>
          <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
            Latitude (°N)
          </label>
          <input
            type="number"
            step="any"
            placeholder="e.g. 22.5726"
            value={lat}
            onChange={(e) => handleManualCoordinateChange(e.target.value, lng)}
            className="w-full bg-cream-50 border border-forest-200 rounded-xl px-3 py-2 text-xs font-bold text-forest-950 focus:outline-none focus:border-forest-600"
          />
        </div>
        <div>
          <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
            Longitude (°E)
          </label>
          <input
            type="number"
            step="any"
            placeholder="e.g. 88.3639"
            value={lng}
            onChange={(e) => handleManualCoordinateChange(lat, e.target.value)}
            className="w-full bg-cream-50 border border-forest-200 rounded-xl px-3 py-2 text-xs font-bold text-forest-950 focus:outline-none focus:border-forest-600"
          />
        </div>
      </div>

      {/* Address Fields */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        <div>
          <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
            State
          </label>
          <input
            type="text"
            placeholder="State"
            value={stateName}
            onChange={(e) => handleAddressChange(district, e.target.value, village)}
            className="w-full bg-cream-50 border border-forest-200 rounded-xl px-3 py-2 text-xs font-bold text-forest-950 focus:outline-none focus:border-forest-600"
          />
        </div>
        <div>
          <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
            District
          </label>
          <input
            type="text"
            placeholder="District"
            value={district}
            onChange={(e) => handleAddressChange(e.target.value, stateName, village)}
            className="w-full bg-cream-50 border border-forest-200 rounded-xl px-3 py-2 text-xs font-bold text-forest-950 focus:outline-none focus:border-forest-600"
          />
        </div>
        <div>
          <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
            Village / Area
          </label>
          <input
            type="text"
            placeholder="Village / Hub"
            value={village}
            onChange={(e) => handleAddressChange(district, stateName, e.target.value)}
            className="w-full bg-cream-50 border border-forest-200 rounded-xl px-3 py-2 text-xs font-bold text-forest-950 focus:outline-none focus:border-forest-600"
          />
        </div>
      </div>
    </div>
  );
};
