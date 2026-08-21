import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateFullUserProfile } from '../services/profileService';
import { UserAvatar } from '../components/UserAvatar';
import { LocationPicker, LocationData } from '../components/LocationPicker';
import { User, Sprout, Briefcase, MapPin, Phone, Mail, Edit3, X, CheckCircle2, AlertCircle, Navigation } from 'lucide-react';
import { FarmType, BuyerType } from '../types/profile';

export const ProfilePage: React.FC = () => {
  const { user, profile, farmerProfile, buyerProfile, setFullProfileState, refreshProfile } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Edit Form Fields
  const [fullName, setFullName] = useState(profile?.full_name || user?.user_metadata?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [state, setState] = useState(profile?.state || '');
  const [district, setDistrict] = useState(profile?.district || '');
  const [village, setVillage] = useState(profile?.village || '');
  const [address, setAddress] = useState(profile?.address || '');
  const [latitude, setLatitude] = useState<number | undefined>(profile?.latitude ?? undefined);
  const [longitude, setLongitude] = useState<number | undefined>(profile?.longitude ?? undefined);

  // Farmer specific edit fields
  const [primaryCrop, setPrimaryCrop] = useState(farmerProfile?.primary_crop || 'Wheat');
  const [landArea, setLandArea] = useState<number>(farmerProfile?.land_area_acres || 5);
  const [farmType, setFarmType] = useState<FarmType>(farmerProfile?.farm_type || 'smallholder');
  const [estimatedTonnes, setEstimatedTonnes] = useState<number>(farmerProfile?.estimated_residue_tonnes || 10);

  // Buyer specific edit fields
  const [businessName, setBusinessName] = useState(buyerProfile?.business_name || '');
  const [buyerType, setBuyerType] = useState<BuyerType>(buyerProfile?.buyer_type || 'mushroom_farm');
  const [requiredQuantity, setRequiredQuantity] = useState<number>(buyerProfile?.required_quantity_tonnes || 100);
  const [procurementRadius, setProcurementRadius] = useState<number>(buyerProfile?.procurement_radius_km || 50);
  const [businessDescription, setBusinessDescription] = useState(buyerProfile?.business_description || '');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const profileUpdates: Record<string, any> = {
        full_name: fullName.trim(),
        phone: phone.trim(),
        state: state.trim(),
        district: district.trim(),
        village: village.trim(),
        address: address.trim(),
        latitude: latitude ?? null,
        longitude: longitude ?? null
      };

      let roleUpdates: any = null;
      if (profile.role === 'farmer') {
        roleUpdates = {
          primary_crop: primaryCrop,
          land_area_acres: Number(landArea),
          farm_type: farmType,
          estimated_residue_tonnes: Number(estimatedTonnes)
        };
      } else if (profile.role === 'buyer') {
        roleUpdates = {
          business_name: businessName.trim(),
          buyer_type: buyerType,
          required_quantity_tonnes: Number(requiredQuantity),
          procurement_radius_km: Number(procurementRadius),
          business_description: businessDescription.trim()
        };
      }

      const updatedFullProfile = await updateFullUserProfile(user.id, profileUpdates, roleUpdates);
      if (updatedFullProfile) {
        setFullProfileState(updatedFullProfile);
      } else {
        await refreshProfile();
      }

      setSuccessMsg('Profile updated successfully!');
      setIsEditing(false);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-center font-sans">
        <p className="text-sm text-forest-700">No active profile found. Please complete onboarding.</p>
      </div>
    );
  }

  const isFarmer = profile.role === 'farmer';

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 font-sans">
      
      {/* Messages */}
      {successMsg && (
        <div className="bg-forest-100 border border-forest-300 text-forest-900 text-xs p-4 rounded-2xl mb-6 font-bold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-forest-700" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Profile Header Card */}
      <div className="bg-white border border-forest-100 rounded-3xl p-8 shadow-md mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-forest-50 rounded-full blur-2xl opacity-60"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <UserAvatar
              profileAvatarUrl={profile.avatar_url}
              userMetadata={user?.user_metadata}
              name={profile.full_name}
              email={profile.email}
              size="xl"
            />

            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-extrabold text-forest-950">{profile.full_name}</h1>
                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                  isFarmer ? 'bg-forest-100 text-forest-800' : 'bg-clay-100 text-clay-800'
                }`}>
                  {isFarmer ? '🌾 Farmer' : '🏭 Buyer'}
                </span>
              </div>
              <p className="text-xs text-forest-700 font-medium flex items-center gap-1.5 mt-1">
                <Mail className="h-3.5 w-3.5 text-forest-500" /> {profile.email}
              </p>
              <p className="text-xs text-forest-700 font-medium flex items-center gap-1.5 mt-0.5">
                <Phone className="h-3.5 w-3.5 text-forest-500" /> {profile.phone || 'Phone not added'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="bg-forest-600 hover:bg-forest-700 text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow transition-all flex items-center gap-2"
          >
            <Edit3 className="h-4 w-4" /> Edit Profile
          </button>
        </div>
      </div>

      {/* Grid: Master Location & Role Details */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Location Details Card */}
        <div className="bg-white border border-forest-100 rounded-3xl p-6 shadow-sm">
          <h3 className="text-base font-extrabold text-forest-950 mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-forest-600" /> Location Details
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-forest-50">
              <span className="text-forest-600 font-semibold">State</span>
              <span className="font-extrabold text-forest-950">{profile.state || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-forest-50">
              <span className="text-forest-600 font-semibold">District</span>
              <span className="font-extrabold text-forest-950">{profile.district || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-forest-50">
              <span className="text-forest-600 font-semibold">Village / City</span>
              <span className="font-extrabold text-forest-950">{profile.village || 'N/A'}</span>
            </div>
            {profile.address && (
              <div className="flex justify-between py-2 border-b border-forest-50">
                <span className="text-forest-600 font-semibold">Address</span>
                <span className="font-bold text-forest-900 text-right">{profile.address}</span>
              </div>
            )}
            <div className="flex justify-between py-2">
              <span className="text-forest-600 font-semibold flex items-center gap-1"><Navigation className="h-3 w-3" /> GPS Coordinates</span>
              {profile.latitude != null && profile.longitude != null ? (
                <span className="font-extrabold text-forest-950">{Number(profile.latitude).toFixed(4)}°N, {Number(profile.longitude).toFixed(4)}°E</span>
              ) : (
                <span className="font-bold text-amber-600">Location required</span>
              )}
            </div>
          </div>
        </div>

        {/* Role-Specific Details Card */}
        {isFarmer ? (
          <div className="bg-white border border-forest-100 rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-extrabold text-forest-950 mb-4 flex items-center gap-2">
              <Sprout className="h-5 w-5 text-forest-600" /> Farm & Residue Info
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-forest-50">
                <span className="text-forest-600 font-semibold">Primary Crop</span>
                <span className="font-extrabold text-forest-950">{farmerProfile?.primary_crop || 'Wheat'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-forest-50">
                <span className="text-forest-600 font-semibold">Land Area</span>
                <span className="font-extrabold text-forest-950">{farmerProfile?.land_area_acres || 0} Acres</span>
              </div>
              <div className="flex justify-between py-2 border-b border-forest-50">
                <span className="text-forest-600 font-semibold">Farm Type</span>
                <span className="font-extrabold text-forest-950 capitalize">{farmerProfile?.farm_type || 'smallholder'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-forest-50">
                <span className="text-forest-600 font-semibold">Residue Types</span>
                <span className="font-extrabold text-forest-950">{farmerProfile?.residue_types?.join(', ') || 'Wheat Straw'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-forest-600 font-semibold">Est. Season Quantity</span>
                <span className="font-extrabold text-forest-950">{farmerProfile?.estimated_residue_tonnes || 0} Tonnes</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-forest-100 rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-extrabold text-forest-950 mb-4 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-clay-600" /> Business & Sourcing Info
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-forest-50">
                <span className="text-forest-600 font-semibold">Business Name</span>
                <span className="font-extrabold text-forest-950">{buyerProfile?.business_name || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-forest-50">
                <span className="text-forest-600 font-semibold">Buyer Type</span>
                <span className="font-extrabold text-forest-950 capitalize">{buyerProfile?.buyer_type?.replace('_', ' ') || 'Mushroom Farm'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-forest-50">
                <span className="text-forest-600 font-semibold">Target Quantity</span>
                <span className="font-extrabold text-forest-950">{buyerProfile?.required_quantity_tonnes || 0} Tonnes</span>
              </div>
              <div className="flex justify-between py-2 border-b border-forest-50">
                <span className="text-forest-600 font-semibold">Procurement Radius</span>
                <span className="font-extrabold text-forest-950">{buyerProfile?.procurement_radius_km || 50} km</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-forest-600 font-semibold">Residue Required</span>
                <span className="font-extrabold text-forest-950">{buyerProfile?.required_residue_types?.join(', ') || 'Wheat Straw'}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-forest-100 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setIsEditing(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-extrabold text-forest-950 mb-1">Edit Profile Details</h2>
            <p className="text-xs text-forest-700 mb-6">Updates will sync with Supabase database.</p>

            {errorMsg && (
              <div className="bg-clay-50 text-clay-900 text-xs p-3.5 rounded-xl mb-4 font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-clay-700" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-forest-800 mb-1 uppercase text-[10px]">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-forest-200 font-semibold outline-none focus:ring-2 focus:ring-forest-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-forest-800 mb-1 uppercase text-[10px]">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3 rounded-xl border border-forest-200 font-semibold outline-none focus:ring-2 focus:ring-forest-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-forest-800 mb-1 uppercase text-[10px]">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full p-3 rounded-xl border border-forest-200 font-semibold outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-forest-800 mb-1 uppercase text-[10px]">District</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full p-3 rounded-xl border border-forest-200 font-semibold outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-forest-800 mb-1 uppercase text-[10px]">Village / City</label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full p-3 rounded-xl border border-forest-200 font-semibold outline-none"
                  required
                />
              </div>

              {/* Farm / Facility Location Section */}
              <div className="border-t border-forest-100 pt-4">
                <LocationPicker
                  initialLocation={{
                    latitude: latitude,
                    longitude: longitude,
                    district: district,
                    state: state,
                    village: village
                  }}
                  label={isFarmer ? 'Farm Location' : 'Facility Location'}
                  helperText={isFarmer ? 'Set your farm GPS coordinates for logistics route optimization.' : 'Set your facility GPS coordinates for depot routing.'}
                  onLocationChange={(loc: LocationData) => {
                    if (loc.latitude != null) setLatitude(loc.latitude);
                    if (loc.longitude != null) setLongitude(loc.longitude);
                    if (loc.district) setDistrict(loc.district);
                    if (loc.state) setState(loc.state);
                    if (loc.village) setVillage(loc.village);
                  }}
                />
              </div>

              {isFarmer ? (
                <>
                  <div className="grid grid-cols-2 gap-3 border-t border-forest-100 pt-4">
                    <div>
                      <label className="block font-bold text-forest-800 mb-1 uppercase text-[10px]">Primary Crop</label>
                      <input
                        type="text"
                        value={primaryCrop}
                        onChange={(e) => setPrimaryCrop(e.target.value)}
                        className="w-full p-3 rounded-xl border border-forest-200 font-semibold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-forest-800 mb-1 uppercase text-[10px]">Land Area (Acres)</label>
                      <input
                        type="number"
                        value={landArea}
                        onChange={(e) => setLandArea(parseFloat(e.target.value) || 0)}
                        className="w-full p-3 rounded-xl border border-forest-200 font-bold outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-forest-800 mb-1 uppercase text-[10px]">Estimated Residue (Tonnes)</label>
                    <input
                      type="number"
                      value={estimatedTonnes}
                      onChange={(e) => setEstimatedTonnes(parseFloat(e.target.value) || 0)}
                      className="w-full p-3 rounded-xl border border-forest-200 font-bold outline-none"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="border-t border-forest-100 pt-4">
                    <label className="block font-bold text-forest-800 mb-1 uppercase text-[10px]">Business Name</label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full p-3 rounded-xl border border-forest-200 font-bold outline-none"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-forest-800 mb-1 uppercase text-[10px]">Required Tonnes</label>
                      <input
                        type="number"
                        value={requiredQuantity}
                        onChange={(e) => setRequiredQuantity(parseFloat(e.target.value) || 0)}
                        className="w-full p-3 rounded-xl border border-forest-200 font-bold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-forest-800 mb-1 uppercase text-[10px]">Procurement Radius (km)</label>
                      <input
                        type="number"
                        value={procurementRadius}
                        onChange={(e) => setProcurementRadius(parseFloat(e.target.value) || 0)}
                        className="w-full p-3 rounded-xl border border-forest-200 font-bold outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-forest-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-forest-600 hover:bg-forest-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
