import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { saveFarmerProfile, saveBuyerProfile } from '../services/profileService';
import { FarmType, BuyerType } from '../types/profile';
import { LocationPicker, LocationData } from '../components/LocationPicker';
import {
  Sprout,
  Briefcase,
  User,
  MapPin,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Check
} from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const { user, setFullProfileState } = useAuth();

  // Role selection state
  const [selectedRole, setSelectedRole] = useState<'farmer' | 'buyer' | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Submitting and error state
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);

  // Common Fields
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('Punjab');
  const [district, setDistrict] = useState('');
  const [village, setVillage] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);

  // Farmer Fields
  const [primaryCrop, setPrimaryCrop] = useState('Wheat');
  const [landArea, setLandArea] = useState<string>('5');
  const [farmType, setFarmType] = useState<FarmType>('smallholder');
  const [selectedResidueTypes, setSelectedResidueTypes] = useState<string[]>(['Wheat Straw']);
  const [estimatedResidueTonnes, setEstimatedResidueTonnes] = useState<string>('10');

  // Buyer Fields
  const [businessName, setBusinessName] = useState('');
  const [buyerType, setBuyerType] = useState<BuyerType>('mushroom_farm');
  const [businessDescription, setBusinessDescription] = useState('');
  const [requiredResidueTypes, setRequiredResidueTypes] = useState<string[]>(['Wheat Straw', 'Rice Straw']);
  const [requiredQuantityTonnes, setRequiredQuantityTonnes] = useState<string>('100');
  const [procurementRadiusKm, setProcurementRadiusKm] = useState<number>(50);

  // Available options
  const residueOptions = [
    { id: 'Wheat Straw', label: 'Wheat straw' },
    { id: 'Rice/Paddy Residue', label: 'Rice / Paddy residue' },
    { id: 'Maize Residue', label: 'Maize residue' },
    { id: 'Sugarcane Residue', label: 'Sugarcane trash' },
    { id: 'Cotton Residue', label: 'Cotton stalks' },
    { id: 'Other', label: 'Other residue' }
  ];

  const farmTypeOptions: { id: FarmType; label: string; desc: string }[] = [
    { id: 'smallholder', label: 'Smallholder', desc: 'Under 5 acres' },
    { id: 'medium', label: 'Medium farm', desc: '5 to 20 acres' },
    { id: 'large', label: 'Large farm', desc: 'Over 20 acres' },
    { id: 'cooperative', label: 'Cooperative / FPO', desc: 'Group of farmers' }
  ];

  const buyerTypeOptions: { id: BuyerType; label: string }[] = [
    { id: 'mushroom_farm', label: 'Mushroom cultivation farm' },
    { id: 'paper_mill', label: 'Paper & pulp mill' },
    { id: 'biomass_plant', label: 'Biomass power plant' },
    { id: 'biofuel', label: 'Bio-CNG / Biofuel plant' },
    { id: 'cattle_feed', label: 'Cattle feed manufacturing' },
    { id: 'compost', label: 'Organic compost facility' },
    { id: 'other', label: 'Other biomass user' }
  ];

  // Geolocation fetch
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }
    setLocationLoading(true);
    setErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setLocationLoading(false);
        setLocationSuccess(true);
      },
      (err) => {
        setLocationLoading(false);
        console.warn('Geolocation denied or error:', err.message);
        setErrorMsg('Location permission denied. You can continue by entering your manual location.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Toggle multi-select residue
  const toggleResidueType = (type: string, isBuyer: boolean) => {
    if (isBuyer) {
      setRequiredResidueTypes((prev) =>
        prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
      );
    } else {
      setSelectedResidueTypes((prev) =>
        prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
      );
    }
  };

  // Validation per step
  const validateCurrentStep = (): boolean => {
    setErrorMsg(null);

    if (currentStep === 1) {
      if (!selectedRole) {
        setErrorMsg('Please select whether you are a Farmer or a Buyer.');
        return false;
      }
      return true;
    }

    if (selectedRole === 'farmer') {
      if (currentStep === 2) {
        if (!fullName.trim()) {
          setErrorMsg('Please enter your full name.');
          return false;
        }
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phone.trim() || !phoneRegex.test(phone.trim().replace(/\D/g, ''))) {
          setErrorMsg('Please enter a valid 10-digit Indian phone number.');
          return false;
        }
        if (!state.trim() || !district.trim() || !village.trim()) {
          setErrorMsg('Please fill in State, District, and Village.');
          return false;
        }
      } else if (currentStep === 3) {
        const areaNum = parseFloat(landArea);
        if (isNaN(areaNum) || areaNum <= 0) {
          setErrorMsg('Please enter a valid positive land area in acres.');
          return false;
        }
      } else if (currentStep === 4) {
        if (selectedResidueTypes.length === 0) {
          setErrorMsg('Please select at least one crop residue type.');
          return false;
        }
        const tonnesNum = parseFloat(estimatedResidueTonnes);
        if (isNaN(tonnesNum) || tonnesNum <= 0) {
          setErrorMsg('Please enter a valid estimated residue quantity in tonnes.');
          return false;
        }
      }
    } else if (selectedRole === 'buyer') {
      if (currentStep === 2) {
        if (!fullName.trim()) {
          setErrorMsg('Please enter your full contact name.');
          return false;
        }
        if (!businessName.trim()) {
          setErrorMsg('Please enter your business or company name.');
          return false;
        }
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phone.trim() || !phoneRegex.test(phone.trim().replace(/\D/g, ''))) {
          setErrorMsg('Please enter a valid 10-digit Indian phone number.');
          return false;
        }
      } else if (currentStep === 3) {
        if (requiredResidueTypes.length === 0) {
          setErrorMsg('Please select at least one required residue type.');
          return false;
        }
        const qtyNum = parseFloat(requiredQuantityTonnes);
        if (isNaN(qtyNum) || qtyNum <= 0) {
          setErrorMsg('Please enter a valid required quantity in tonnes.');
          return false;
        }
      } else if (currentStep === 4) {
        if (!state.trim() || !district.trim()) {
          setErrorMsg('Please provide State and District.');
          return false;
        }
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setErrorMsg(null);
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    if (!user) {
      setErrorMsg('Session lost. Please log in with Google again.');
      return;
    }
    if (!validateCurrentStep()) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      if (selectedRole === 'farmer') {
        const fullProfileData = await saveFarmerProfile(user, {
          full_name: fullName.trim(),
          phone: phone.trim().replace(/\D/g, ''),
          state: state.trim(),
          district: district.trim(),
          village: village.trim(),
          address: address.trim(),
          latitude,
          longitude,
          primary_crop: primaryCrop,
          land_area_acres: parseFloat(landArea) || 0,
          farm_type: farmType,
          residue_types: selectedResidueTypes,
          estimated_residue_tonnes: parseFloat(estimatedResidueTonnes) || 0
        });

        setFullProfileState(fullProfileData);
      } else if (selectedRole === 'buyer') {
        const fullProfileData = await saveBuyerProfile(user, {
          full_name: fullName.trim(),
          phone: phone.trim().replace(/\D/g, ''),
          state: state.trim(),
          district: district.trim(),
          village: village.trim(),
          address: address.trim(),
          latitude,
          longitude,
          business_name: businessName.trim(),
          buyer_type: buyerType,
          business_description: businessDescription.trim(),
          required_residue_types: requiredResidueTypes,
          required_quantity_tonnes: parseFloat(requiredQuantityTonnes) || 0,
          procurement_radius_km: procurementRadiusKm
        });

        setFullProfileState(fullProfileData);
      }

      onComplete();
    } catch (err: any) {
      console.error('Error during onboarding submission:', err);
      setErrorMsg(err.message || 'We could not create your profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const maxSteps = selectedRole === 'farmer' ? 6 : 5;

  return (
    <div className="min-h-[90vh] flex flex-col justify-center items-center px-4 py-8 bg-paper-50 font-sans">
      <div className="max-w-3xl w-full bg-surface-0 border border-line-200 rounded-card p-6 md:p-8 shadow-card relative">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-line-200">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wide text-pine-700 bg-pine-100 px-2.5 py-0.5 rounded-card">
              Account onboarding
            </span>
            <h1 className="text-xl md:text-2xl font-display font-bold text-ink-900 mt-1">
              Welcome to Parali
            </h1>
            <p className="text-xs text-ink-500 mt-0.5">
              Set up your profile to start trading agricultural residue.
            </p>
          </div>

          {user && (
            <div className="flex items-center gap-2.5 bg-paper-50 border border-line-200 p-2 rounded-card shrink-0">
              {user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt={user.user_metadata.full_name || 'Google User'}
                  className="w-8 h-8 rounded-full border border-line-200 object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-pine-900 text-white flex items-center justify-center font-bold text-xs">
                  <User className="h-4 w-4" />
                </div>
              )}
              <div className="text-left">
                <p className="text-xs font-semibold text-ink-900 leading-tight">
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </p>
                <p className="text-[10px] text-ink-500 font-mono leading-tight">
                  {user.email}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Step Progress Bar */}
        {selectedRole && (
          <div className="mb-6 font-mono text-xs">
            <div className="flex items-center justify-between text-ink-500 mb-1.5">
              <span>Step {currentStep - 1} of {maxSteps - 1}</span>
              <span className="capitalize font-sans">{selectedRole} registration</span>
            </div>
            <div className="w-full bg-paper-50 h-1.5 rounded-card overflow-hidden border border-line-200">
              <div
                className="bg-pine-700 h-full transition-all duration-300"
                style={{ width: `${((currentStep - 1) / (maxSteps - 1)) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="w-full bg-ember-600/10 border border-ember-600/30 text-ember-600 text-xs p-3.5 rounded-card mb-6 font-medium flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: ROLE SELECTION */}
        {currentStep === 1 && (
          <div>
            <h2 className="text-lg font-display font-bold text-ink-900 mb-1">
              How will you use Parali?
            </h2>
            <p className="text-xs text-ink-500 mb-6">
              Select your account type to personalize your experience.
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div
                tabIndex={0}
                role="button"
                onClick={() => {
                  setSelectedRole('farmer');
                  setCurrentStep(2);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setSelectedRole('farmer');
                    setCurrentStep(2);
                  }
                }}
                className={`p-5 rounded-card border transition-all cursor-pointer flex flex-col justify-between ${
                  selectedRole === 'farmer'
                    ? 'border-pine-700 bg-pine-100/40 shadow-card'
                    : 'border-line-200 bg-surface-0 hover:border-pine-700/30'
                }`}
              >
                {selectedRole === 'farmer' && (
                  <div className="absolute top-4 right-4 bg-pine-700 text-white rounded-full p-0.5">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                )}
                <div>
                  <div className={`w-10 h-10 rounded-card flex items-center justify-center mb-3 transition-colors ${
                    selectedRole === 'farmer' ? 'bg-pine-900 text-white' : 'bg-pine-100 text-pine-700'
                  }`}>
                    <Sprout className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-display font-bold text-ink-900 mb-1">Farmer</h3>
                  <p className="text-xs text-ink-500 leading-relaxed mt-1">
                    Sell your crop residue, find buyers, request on-field baling, and turn stubble into revenue.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-line-200 flex items-center justify-between text-xs font-semibold text-pine-700">
                  <span>Farmer portal</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>

              <div
                tabIndex={0}
                role="button"
                onClick={() => {
                  setSelectedRole('buyer');
                  setCurrentStep(2);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setSelectedRole('buyer');
                    setCurrentStep(2);
                  }
                }}
                className={`p-5 rounded-card border transition-all cursor-pointer flex flex-col justify-between ${
                  selectedRole === 'buyer'
                    ? 'border-soil-700 bg-soil-100/40 shadow-card'
                    : 'border-line-200 bg-surface-0 hover:border-soil-700/30'
                }`}
              >
                {selectedRole === 'buyer' && (
                  <div className="absolute top-4 right-4 bg-soil-700 text-white rounded-full p-0.5">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                )}
                <div>
                  <div className={`w-10 h-10 rounded-card flex items-center justify-center mb-3 transition-colors ${
                    selectedRole === 'buyer' ? 'bg-soil-700 text-white' : 'bg-soil-100 text-soil-700'
                  }`}>
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-display font-bold text-ink-900 mb-1">Buyer / Business</h3>
                  <p className="text-xs text-ink-500 leading-relaxed mt-1">
                    Source bulk agricultural biomass, post plant requirements, and optimize collection logistics.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-line-200 flex items-center justify-between text-xs font-semibold text-soil-700">
                  <span>Buyer portal</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-line-200">
              <button
                onClick={() => {
                  if (selectedRole) {
                    setCurrentStep(2);
                  } else {
                    setErrorMsg('Please select whether you are a Farmer or a Buyer.');
                  }
                }}
                className="bg-pine-900 hover:bg-pine-700 text-white font-semibold text-xs px-6 py-2.5 rounded-card transition-all flex items-center gap-1.5 shadow-card"
              >
                <span>Continue setup</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* FARMER REGISTRATION STEPS */}
        {selectedRole === 'farmer' && currentStep > 1 && (
          <>
            {currentStep === 2 && (
              <div className="space-y-4 text-xs">
                <div>
                  <h2 className="text-base font-display font-bold text-ink-900">Personal & contact details</h2>
                  <p className="text-xs text-ink-500 mt-0.5">Your contact info will be shared with buyers during confirmed pickups.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-medium text-ink-500 uppercase tracking-wide mb-1">Full name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full text-xs p-2.5 rounded-card border border-line-200 font-medium text-ink-900 outline-none focus:ring-1 focus:ring-pine-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-ink-500 uppercase tracking-wide mb-1">Phone number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-digit phone number"
                      className="w-full text-xs p-2.5 rounded-card border border-line-200 font-mono font-semibold text-ink-900 outline-none focus:ring-1 focus:ring-pine-700"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-medium text-ink-500 uppercase tracking-wide mb-1">State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-card border border-line-200 font-medium text-ink-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-ink-500 uppercase tracking-wide mb-1">District</label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="e.g. Sangrur"
                      className="w-full text-xs p-2.5 rounded-card border border-line-200 font-medium text-ink-900 outline-none focus:ring-1 focus:ring-pine-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-ink-500 uppercase tracking-wide mb-1">Village / Town</label>
                    <input
                      type="text"
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      placeholder="e.g. Badrukhan"
                      className="w-full text-xs p-2.5 rounded-card border border-line-200 font-medium text-ink-900 outline-none focus:ring-1 focus:ring-pine-700"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4 text-xs">
                <div>
                  <h2 className="text-base font-display font-bold text-ink-900">Farm details</h2>
                  <p className="text-xs text-ink-500 mt-0.5">Helps Parali estimate available crop stubble volume.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-medium text-ink-500 uppercase tracking-wide mb-1">Primary crop</label>
                    <select
                      value={primaryCrop}
                      onChange={(e) => setPrimaryCrop(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-card border border-line-200 font-medium text-ink-900 bg-surface-0 outline-none"
                    >
                      <option value="Wheat">Wheat</option>
                      <option value="Rice">Rice / Paddy</option>
                      <option value="Maize">Maize</option>
                      <option value="Sugarcane">Sugarcane</option>
                      <option value="Cotton">Cotton</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-ink-500 uppercase tracking-wide mb-1">Land holding (acres)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={landArea}
                      onChange={(e) => setLandArea(e.target.value)}
                      placeholder="e.g. 5"
                      className="w-full text-xs p-2.5 rounded-card border border-line-200 font-mono font-semibold text-ink-900 outline-none focus:ring-1 focus:ring-pine-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-ink-500 uppercase tracking-wide mb-2">Farm type</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {farmTypeOptions.map((opt) => (
                      <div
                        key={opt.id}
                        onClick={() => setFarmType(opt.id)}
                        className={`p-3 rounded-card border text-center cursor-pointer transition-all ${
                          farmType === opt.id
                            ? 'border-pine-700 bg-pine-100/50 text-pine-700 font-semibold'
                            : 'border-line-200 hover:border-pine-700/30 text-ink-900'
                        }`}
                      >
                        <div className="font-semibold text-xs">{opt.label}</div>
                        <div className="text-[10px] text-ink-500 font-normal mt-0.5">{opt.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4 text-xs">
                <div>
                  <h2 className="text-base font-display font-bold text-ink-900">Crop residue details</h2>
                  <p className="text-xs text-ink-500 mt-0.5">Select the stubble types you plan to sell.</p>
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-ink-500 uppercase tracking-wide mb-2">Residue types</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                    {residueOptions.map((opt) => {
                      const isSelected = selectedResidueTypes.includes(opt.id);
                      return (
                        <div
                          key={opt.id}
                          onClick={() => toggleResidueType(opt.id, false)}
                          className={`p-3 rounded-card border cursor-pointer flex items-center justify-between transition-all ${
                            isSelected
                              ? 'border-pine-700 bg-pine-100/50 text-pine-700 font-semibold'
                              : 'border-line-200 text-ink-900 hover:border-pine-700/30'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {isSelected && <CheckCircle2 className="h-4 w-4 text-pine-700 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-ink-500 uppercase tracking-wide mb-1">
                    Estimated seasonal residue (tonnes)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={estimatedResidueTonnes}
                    onChange={(e) => setEstimatedResidueTonnes(e.target.value)}
                    placeholder="e.g. 10"
                    className="w-full text-xs p-2.5 rounded-card border border-line-200 font-mono font-semibold text-ink-900 outline-none focus:ring-1 focus:ring-pine-700"
                  />
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-4 text-xs">
                <div>
                  <h2 className="text-lg font-extrabold text-forest-950">Field Location Verification</h2>
                  <p className="text-xs text-forest-700 mt-1">Acquire exact GPS coordinates for automated logistics routing and buyer matching.</p>
                </div>

                <LocationPicker
                  label="Farm Field Location"
                  helperText="Acquire GPS coordinates for your primary stubble harvesting field."
                  initialLocation={{
                    latitude: latitude || undefined,
                    longitude: longitude || undefined,
                    district,
                    state,
                    village
                  }}
                  onLocationChange={(loc: LocationData) => {
                    if (loc.latitude != null) setLatitude(loc.latitude);
                    if (loc.longitude != null) setLongitude(loc.longitude);
                    if (loc.district) setDistrict(loc.district);
                    if (loc.state) setState(loc.state);
                    if (loc.village) setVillage(loc.village);
                  }}
                />
              </div>
            )}

            {currentStep === 6 && (
              <div className="space-y-4 text-xs">
                <div>
                  <h2 className="text-base font-display font-bold text-ink-900">Review your farmer profile</h2>
                  <p className="text-xs text-ink-500 mt-0.5">Verify details before creating your account.</p>
                </div>

                <div className="bg-paper-50 border border-line-200 rounded-card p-4 space-y-3 font-mono">
                  <div className="grid grid-cols-2 gap-4 pb-2 border-b border-line-200">
                    <div>
                      <span className="text-[10px] font-sans text-ink-500 uppercase">Name</span>
                      <p className="font-semibold text-ink-900">{fullName}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-sans text-ink-500 uppercase">Phone</span>
                      <p className="font-semibold text-ink-900">{phone}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pb-2 border-b border-line-200">
                    <div>
                      <span className="text-[10px] font-sans text-ink-500 uppercase">Location</span>
                      <p className="font-semibold text-ink-900">{village}, {district}, {state}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-sans text-ink-500 uppercase">Land & crop</span>
                      <p className="font-semibold text-ink-900">{landArea} acres ({primaryCrop})</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-sans text-ink-500 uppercase">Residues</span>
                    <p className="font-semibold text-ink-900">{selectedResidueTypes.join(', ')} ({estimatedResidueTonnes} tonnes est.)</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* BUYER REGISTRATION STEPS */}
        {selectedRole === 'buyer' && currentStep > 1 && (
          <>
            {currentStep === 2 && (
              <div className="space-y-4 text-xs">
                <div>
                  <h2 className="text-base font-display font-bold text-ink-900">Company & contact details</h2>
                  <p className="text-xs text-ink-500 mt-0.5">Provide business credentials for biomass contracts.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-medium text-ink-500 uppercase tracking-wide mb-1">Company / Facility name</label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. GreenGrow Bio-Energy"
                      className="w-full text-xs p-2.5 rounded-card border border-line-200 font-medium text-ink-900 outline-none focus:ring-1 focus:ring-pine-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-ink-500 uppercase tracking-wide mb-1">Facility industry type</label>
                    <select
                      value={buyerType}
                      onChange={(e) => setBuyerType(e.target.value as BuyerType)}
                      className="w-full text-xs p-2.5 rounded-card border border-line-200 font-medium text-ink-900 bg-surface-0 outline-none"
                    >
                      {buyerTypeOptions.map((b) => (
                        <option key={b.id} value={b.id}>{b.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-medium text-ink-500 uppercase tracking-wide mb-1">Contact person name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Contact person full name"
                      className="w-full text-xs p-2.5 rounded-card border border-line-200 font-medium text-ink-900 outline-none focus:ring-1 focus:ring-pine-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-ink-500 uppercase tracking-wide mb-1">Contact phone number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-digit phone number"
                      className="w-full text-xs p-2.5 rounded-card border border-line-200 font-mono font-semibold text-ink-900 outline-none focus:ring-1 focus:ring-pine-700"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4 text-xs">
                <div>
                  <h2 className="text-base font-display font-bold text-ink-900">Biomass requirements</h2>
                  <p className="text-xs text-ink-500 mt-0.5">Specify what residue types and tonnage you want to procure.</p>
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-ink-500 uppercase tracking-wide mb-2">Required residue types</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                    {residueOptions.map((opt) => {
                      const isSelected = requiredResidueTypes.includes(opt.id);
                      return (
                        <div
                          key={opt.id}
                          onClick={() => toggleResidueType(opt.id, true)}
                          className={`p-3 rounded-card border cursor-pointer flex items-center justify-between transition-all ${
                            isSelected
                              ? 'border-soil-700 bg-soil-100/50 text-soil-700 font-semibold'
                              : 'border-line-200 text-ink-900 hover:border-soil-700/30'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {isSelected && <CheckCircle2 className="h-4 w-4 text-soil-700 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-ink-500 uppercase tracking-wide mb-1">
                    Required quantity (tonnes)
                  </label>
                  <input
                    type="number"
                    step="10"
                    min="1"
                    value={requiredQuantityTonnes}
                    onChange={(e) => setRequiredQuantityTonnes(e.target.value)}
                    placeholder="e.g. 100"
                    className="w-full text-xs p-2.5 rounded-card border border-line-200 font-mono font-semibold text-ink-900 outline-none focus:ring-1 focus:ring-pine-700"
                  />
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4 text-xs">
                <div>
                  <h2 className="text-base font-display font-bold text-ink-900">Procurement logistics & location</h2>
                  <p className="text-xs text-ink-500 mt-0.5">Set your operational radius and facility location.</p>
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-ink-500 uppercase tracking-wide mb-2">Procurement radius (km)</label>
                  <div className="grid grid-cols-4 gap-2 font-mono">
                    {[10, 25, 50, 100].map((radius) => (
                      <div
                        key={radius}
                        onClick={() => setProcurementRadiusKm(radius)}
                        className={`p-2.5 rounded-card border text-center cursor-pointer text-xs transition-all ${
                          procurementRadiusKm === radius
                            ? 'border-soil-700 bg-soil-100/50 text-soil-700 font-semibold'
                            : 'border-line-200 text-ink-900'
                        }`}
                      >
                        {radius} km
                      </div>
                    ))}
                  </div>
                </div>

                <LocationPicker
                  label="Buyer Processing Facility / Depot Location"
                  helperText="Acquire GPS coordinates for your biomass receiving plant or processing depot."
                  initialLocation={{
                    latitude: latitude || undefined,
                    longitude: longitude || undefined,
                    district,
                    state,
                    village
                  }}
                  onLocationChange={(loc: LocationData) => {
                    if (loc.latitude != null) setLatitude(loc.latitude);
                    if (loc.longitude != null) setLongitude(loc.longitude);
                    if (loc.district) setDistrict(loc.district);
                    if (loc.state) setState(loc.state);
                    if (loc.village) setVillage(loc.village);
                  }}
                />
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-4 text-xs">
                <div>
                  <h2 className="text-base font-display font-bold text-ink-900">Review buyer profile</h2>
                  <p className="text-xs text-ink-500 mt-0.5">Verify details before creating your buyer account.</p>
                </div>

                <div className="bg-paper-50 border border-line-200 rounded-card p-4 space-y-3 font-mono">
                  <div className="grid grid-cols-2 gap-4 pb-2 border-b border-line-200">
                    <div>
                      <span className="text-[10px] font-sans text-ink-500 uppercase">Business</span>
                      <p className="font-semibold text-ink-900">{businessName}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-sans text-ink-500 uppercase">Contact</span>
                      <p className="font-semibold text-ink-900">{fullName} ({phone})</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pb-2 border-b border-line-200">
                    <div>
                      <span className="text-[10px] font-sans text-ink-500 uppercase">Location & radius</span>
                      <p className="font-semibold text-ink-900">{district}, {state} ({procurementRadiusKm} km)</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-sans text-ink-500 uppercase">Target quantity</span>
                      <p className="font-semibold text-ink-900">{requiredQuantityTonnes} tonnes</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-sans text-ink-500 uppercase">Residues</span>
                    <p className="font-semibold text-ink-900">{requiredResidueTypes.join(', ')}</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Footer Navigation Buttons */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-line-200">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={submitting}
              className="text-xs font-medium text-ink-500 hover:text-ink-900 flex items-center gap-1 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
          ) : (
            <div></div>
          )}

          {currentStep > 1 && (
            currentStep === maxSteps ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-pine-900 hover:bg-pine-700 text-white font-semibold text-xs py-2.5 px-6 rounded-card shadow-card transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? (
                  <span>Saving profile…</span>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{selectedRole === 'farmer' ? 'Create farmer profile' : 'Create buyer profile'}</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="bg-pine-900 hover:bg-pine-700 text-white font-semibold text-xs py-2.5 px-6 rounded-card shadow-card transition-all flex items-center gap-2"
              >
                Next step <ChevronRight className="h-4 w-4" />
              </button>
            )
          )}
        </div>

      </div>
    </div>
  );
};
