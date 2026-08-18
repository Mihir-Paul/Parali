import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { saveFarmerProfile, saveBuyerProfile } from '../services/profileService';
import { FarmType, BuyerType } from '../types/profile';
import {
  Sprout,
  Briefcase,
  User,
  MapPin,
  Phone,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Navigation,
  Check
} from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const { user, setFullProfileState } = useAuth();

  // Role selection state
  const [selectedRole, setSelectedRole] = useState<'farmer' | 'buyer' | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1); // 1 = Role Selection / Welcome

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
    { id: 'Wheat Straw', label: 'Wheat Straw' },
    { id: 'Rice/Paddy Residue', label: 'Rice / Paddy Residue' },
    { id: 'Maize Residue', label: 'Maize Residue' },
    { id: 'Sugarcane Residue', label: 'Sugarcane Trash' },
    { id: 'Cotton Residue', label: 'Cotton Stalks' },
    { id: 'Other', label: 'Other Residue' }
  ];

  const farmTypeOptions: { id: FarmType; label: string; desc: string }[] = [
    { id: 'smallholder', label: 'Smallholder', desc: 'Under 5 acres' },
    { id: 'medium', label: 'Medium Farm', desc: '5 to 20 acres' },
    { id: 'large', label: 'Large Farm', desc: 'Over 20 acres' },
    { id: 'cooperative', label: 'Cooperative / FPO', desc: 'Group of farmers' }
  ];

  const buyerTypeOptions: { id: BuyerType; label: string }[] = [
    { id: 'mushroom_farm', label: 'Mushroom Cultivation Farm' },
    { id: 'paper_mill', label: 'Paper & Pulp Mill' },
    { id: 'biomass_plant', label: 'Biomass Power Plant' },
    { id: 'biofuel', label: 'Bio-CNG / Biofuel Plant' },
    { id: 'cattle_feed', label: 'Cattle Feed Manufacturing' },
    { id: 'compost', label: 'Organic Compost Facility' },
    { id: 'other', label: 'Other Biomass User' }
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
        // Step 1 for Farmer: Personal info
        if (!fullName.trim()) {
          setErrorMsg('Please enter your full name.');
          return false;
        }
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phone.trim() || !phoneRegex.test(phone.trim().replace(/\D/g, ''))) {
          setErrorMsg('Please enter a valid 10-digit Indian phone number (e.g. 9876543210).');
          return false;
        }
        if (!state.trim() || !district.trim() || !village.trim()) {
          setErrorMsg('Please fill in State, District, and Village.');
          return false;
        }
      } else if (currentStep === 3) {
        // Step 2 for Farmer: Farm info
        const areaNum = parseFloat(landArea);
        if (isNaN(areaNum) || areaNum <= 0) {
          setErrorMsg('Please enter a valid positive land area in acres.');
          return false;
        }
      } else if (currentStep === 4) {
        // Step 3 for Farmer: Residue info
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
        // Step 1 for Buyer: Business Info & Personal Info
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
        // Step 2 for Buyer: Residue Needs
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
        // Step 3 for Buyer: Location & Procurement
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

  // Submit onboarding form to Supabase
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
      setErrorMsg(err.message || 'We could not create your profile. Please check your internet connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const maxSteps = selectedRole === 'farmer' ? 6 : 5;

  return (
    <div className="min-h-[90vh] flex flex-col justify-center items-center px-4 py-8 bg-cream-50 font-sans selection:bg-forest-200">
      <div className="max-w-3xl w-full bg-white border border-forest-100 rounded-3xl p-6 md:p-10 shadow-lg relative overflow-hidden">
        
        {/* Subtle decorative background accent */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-forest-100/50 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header with User Info */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-forest-100">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-forest-700 bg-forest-50 px-3 py-1 rounded-full border border-forest-200">
              Account Onboarding
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-forest-950 mt-2">
              Welcome to Parali
            </h1>
            <p className="text-xs md:text-sm text-forest-800 mt-1">
              Let's set up your verified profile to start trading agricultural residue.
            </p>
          </div>

          {/* User Google Badge */}
          {user && (
            <div className="flex items-center gap-3 bg-cream-50 border border-forest-150 p-2.5 rounded-2xl shrink-0">
              {user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt={user.user_metadata.full_name || 'Google User'}
                  className="w-10 h-10 rounded-full border border-forest-200 object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-forest-100 text-forest-700 flex items-center justify-center font-bold">
                  <User className="h-5 w-5" />
                </div>
              )}
              <div className="text-left">
                <p className="text-xs font-bold text-forest-950 leading-tight">
                  {user.user_metadata?.full_name || user.email?.split('@')[0] || 'Authenticated User'}
                </p>
                <p className="text-[10px] text-forest-600 font-semibold leading-tight mt-0.5">
                  {user.email}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Step Progress Bar (Shown after role selection) */}
        {selectedRole && (
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs font-bold text-forest-800 mb-2">
              <span>Step {currentStep - 1} of {maxSteps - 1}</span>
              <span className="capitalize">{selectedRole} Registration</span>
            </div>
            <div className="w-full bg-forest-50 h-2 rounded-full overflow-hidden border border-forest-100">
              <div
                className="bg-forest-600 h-full transition-all duration-500 ease-out"
                style={{ width: `${((currentStep - 1) / (maxSteps - 1)) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Error Alert Message */}
        {errorMsg && (
          <div className="w-full bg-clay-50 border border-clay-200 text-clay-900 text-xs p-4 rounded-2xl mb-6 font-semibold flex items-start gap-3 shadow-sm">
            <AlertCircle className="h-4 w-4 shrink-0 text-clay-700 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 1: WELCOME & ROLE SELECTION */}
        {/* ============================================================ */}
        {currentStep === 1 && (
          <div>
            <h2 className="text-lg md:text-xl font-extrabold text-forest-950 mb-2">
              How will you use Parali?
            </h2>
            <p className="text-xs text-forest-750 mb-6">
              Select your account type to personalize your experience.
            </p>

            <div className="grid md:grid-cols-2 gap-5 mb-8">
              {/* FARMER CARD */}
              <div
                tabIndex={0}
                role="button"
                onClick={() => setSelectedRole('farmer')}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelectedRole('farmer')}
                className={`group relative p-6 rounded-3xl border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                  selectedRole === 'farmer'
                    ? 'border-forest-600 bg-forest-50/60 shadow-md ring-2 ring-forest-200'
                    : 'border-forest-100 bg-white hover:border-forest-300 hover:shadow-sm'
                }`}
              >
                {selectedRole === 'farmer' && (
                  <div className="absolute top-4 right-4 bg-forest-600 text-white rounded-full p-1 shadow">
                    <Check className="h-4 w-4" />
                  </div>
                )}
                <div>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                    selectedRole === 'farmer' ? 'bg-forest-600 text-white' : 'bg-forest-100 text-forest-700 group-hover:bg-forest-600 group-hover:text-white'
                  }`}>
                    <Sprout className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-extrabold text-forest-950 mb-1">Farmer</h3>
                  <p className="text-xs text-forest-700 leading-relaxed mt-2">
                    Sell your crop residue, find buyers, request on-field baling, and turn agricultural stubble into income.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-forest-100/60 flex items-center justify-between text-xs font-bold text-forest-800">
                  <span>Farmer Portal</span>
                  <ChevronRight className="h-4 w-4 text-forest-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* BUYER CARD */}
              <div
                tabIndex={0}
                role="button"
                onClick={() => setSelectedRole('buyer')}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelectedRole('buyer')}
                className={`group relative p-6 rounded-3xl border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                  selectedRole === 'buyer'
                    ? 'border-clay-600 bg-clay-50/60 shadow-md ring-2 ring-clay-200'
                    : 'border-forest-100 bg-white hover:border-clay-300 hover:shadow-sm'
                }`}
              >
                {selectedRole === 'buyer' && (
                  <div className="absolute top-4 right-4 bg-clay-600 text-white rounded-full p-1 shadow">
                    <Check className="h-4 w-4" />
                  </div>
                )}
                <div>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                    selectedRole === 'buyer' ? 'bg-clay-600 text-white' : 'bg-clay-100 text-clay-700 group-hover:bg-clay-600 group-hover:text-white'
                  }`}>
                    <Briefcase className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-extrabold text-forest-950 mb-1">Buyer</h3>
                  <p className="text-xs text-forest-700 leading-relaxed mt-2">
                    Source agricultural residue directly from farmers, manage procurement orders, and coordinate regional logistics.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-forest-100/60 flex items-center justify-between text-xs font-bold text-clay-800">
                  <span>Buyer Portal</span>
                  <ChevronRight className="h-4 w-4 text-clay-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleNext}
                disabled={!selectedRole}
                className="bg-forest-600 hover:bg-forest-700 text-white font-extrabold text-xs py-3.5 px-8 rounded-2xl flex items-center gap-2 shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* FARMER ONBOARDING STEPS */}
        {/* ============================================================ */}
        {selectedRole === 'farmer' && (
          <>
            {/* FARMER STEP 1: PERSONAL INFORMATION */}
            {currentStep === 2 && (
              <div className="flex flex-col gap-5">
                <div>
                  <h2 className="text-lg font-extrabold text-forest-950">Personal Information</h2>
                  <p className="text-xs text-forest-700 mt-1">Please provide your contact and location details.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-forest-800 uppercase tracking-wider mb-1">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full text-xs p-3.5 rounded-xl border border-forest-200 focus:ring-2 focus:ring-forest-500 font-semibold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-forest-800 uppercase tracking-wider mb-1">Email Address (Google Account)</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      readOnly
                      className="w-full text-xs p-3.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-600 cursor-not-allowed outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-forest-800 uppercase tracking-wider mb-1">Mobile Phone Number</label>
                    <div className="relative">
                      <Phone className="h-4 w-4 text-forest-400 absolute left-3.5 top-3.5" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="10-digit mobile number (e.g. 9876543210)"
                        className="w-full text-xs p-3.5 pl-10 rounded-xl border border-forest-200 focus:ring-2 focus:ring-forest-500 font-bold outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-forest-800 uppercase tracking-wider mb-1">State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="State (e.g. Punjab)"
                      className="w-full text-xs p-3.5 rounded-xl border border-forest-200 focus:ring-2 focus:ring-forest-500 font-semibold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-forest-800 uppercase tracking-wider mb-1">District</label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="e.g. Sangrur"
                      className="w-full text-xs p-3.5 rounded-xl border border-forest-200 focus:ring-2 focus:ring-forest-500 font-semibold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-forest-800 uppercase tracking-wider mb-1">Village / City</label>
                    <input
                      type="text"
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      placeholder="e.g. Kila Raipur"
                      className="w-full text-xs p-3.5 rounded-xl border border-forest-200 focus:ring-2 focus:ring-forest-500 font-semibold outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-forest-800 uppercase tracking-wider mb-1">Farm / Residence Address (Optional)</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Landmark or specific field address"
                    className="w-full text-xs p-3.5 rounded-xl border border-forest-200 focus:ring-2 focus:ring-forest-500 font-semibold outline-none"
                  />
                </div>
              </div>
            )}

            {/* FARMER STEP 2: FARM INFORMATION */}
            {currentStep === 3 && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-lg font-extrabold text-forest-950">Farm Details</h2>
                  <p className="text-xs text-forest-700 mt-1">Tell us about your agricultural land and primary crop.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-bold text-forest-800 uppercase tracking-wider mb-1">Primary Harvest Crop</label>
                    <select
                      value={primaryCrop}
                      onChange={(e) => setPrimaryCrop(e.target.value)}
                      className="w-full text-xs p-3.5 rounded-xl border border-forest-200 bg-white font-bold text-forest-900 outline-none focus:ring-2 focus:ring-forest-500"
                    >
                      <option value="Wheat">Wheat</option>
                      <option value="Rice/Paddy">Rice / Paddy</option>
                      <option value="Maize">Maize</option>
                      <option value="Sugarcane">Sugarcane</option>
                      <option value="Cotton">Cotton</option>
                      <option value="Other">Other Crop</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-forest-800 uppercase tracking-wider mb-1">Land Area (Acres)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.1"
                      value={landArea}
                      onChange={(e) => setLandArea(e.target.value)}
                      placeholder="e.g. 5"
                      className="w-full text-xs p-3.5 rounded-xl border border-forest-200 font-bold outline-none focus:ring-2 focus:ring-forest-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-forest-800 uppercase tracking-wider mb-2">Farm Classification</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {farmTypeOptions.map((opt) => (
                      <div
                        key={opt.id}
                        onClick={() => setFarmType(opt.id)}
                        className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                          farmType === opt.id
                            ? 'border-forest-600 bg-forest-50 text-forest-950 font-bold shadow-sm'
                            : 'border-forest-100 hover:border-forest-200 text-forest-800'
                        }`}
                      >
                        <p className="text-xs font-extrabold">{opt.label}</p>
                        <p className="text-[10px] text-forest-600 mt-0.5">{opt.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* FARMER STEP 3: RESIDUE INFORMATION */}
            {currentStep === 4 && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-lg font-extrabold text-forest-950">Crop Residue Details</h2>
                  <p className="text-xs text-forest-700 mt-1">Specify what stubble or biomass you produce after harvest.</p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-forest-800 uppercase tracking-wider mb-2">
                    Residue Types Generated (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {residueOptions.map((opt) => {
                      const isSelected = selectedResidueTypes.includes(opt.id);
                      return (
                        <div
                          key={opt.id}
                          onClick={() => toggleResidueType(opt.id, false)}
                          className={`p-3.5 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                            isSelected
                              ? 'border-forest-600 bg-forest-50 text-forest-950 font-bold shadow-sm'
                              : 'border-forest-100 hover:border-forest-200 text-forest-800'
                          }`}
                        >
                          <span className="text-xs">{opt.label}</span>
                          {isSelected && <CheckCircle2 className="h-4 w-4 text-forest-600 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-forest-800 uppercase tracking-wider mb-1">
                    Estimated Residue Generation (Tonnes per season)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={estimatedResidueTonnes}
                    onChange={(e) => setEstimatedResidueTonnes(e.target.value)}
                    placeholder="e.g. 10"
                    className="w-full text-xs p-3.5 rounded-xl border border-forest-200 font-bold text-forest-950 outline-none focus:ring-2 focus:ring-forest-500"
                  />
                  <p className="text-[10px] text-forest-500 mt-1">Rule of thumb: ~1.5 to 2.5 tonnes of residue is produced per acre of wheat/paddy.</p>
                </div>
              </div>
            )}

            {/* FARMER STEP 4: GEOLOCATION */}
            {currentStep === 5 && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-lg font-extrabold text-forest-950">Field Location Verification</h2>
                  <p className="text-xs text-forest-700 mt-1">Optimize biomass pickup routing and buyer matching.</p>
                </div>

                <div className="bg-cream-100 border border-forest-200 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-forest-600 text-white rounded-2xl shrink-0">
                      <Navigation className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-forest-950">Detect Farm Coordinates</h4>
                      <p className="text-xs text-forest-800 mt-1 leading-relaxed max-w-md">
                        Your location helps us find nearby buyers, calculate transport costs, and optimize residue pickup.
                      </p>
                      {latitude && longitude && (
                        <p className="text-xs font-bold text-forest-700 mt-2 bg-forest-100 px-3 py-1 rounded-lg inline-block">
                          📍 Coordinates: {latitude.toFixed(4)}°, {longitude.toFixed(4)}°
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={locationLoading}
                    className="bg-forest-600 hover:bg-forest-700 text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow transition-all shrink-0 flex items-center gap-2"
                  >
                    {locationLoading ? (
                      <span>Locating...</span>
                    ) : locationSuccess ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" /> Location Saved
                      </>
                    ) : (
                      <>
                        <MapPin className="h-4 w-4" /> Use Current Location
                      </>
                    )}
                  </button>
                </div>

                <div className="text-xs text-forest-600 bg-white border border-forest-100 p-4 rounded-2xl">
                  <strong>Manual Location Summary:</strong> {village}, {district}, {state}
                </div>
              </div>
            )}

            {/* FARMER STEP 5: REVIEW & SUBMIT */}
            {currentStep === 6 && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-lg font-extrabold text-forest-950">Review Your Farmer Profile</h2>
                  <p className="text-xs text-forest-700 mt-1">Please confirm your details before creating your account.</p>
                </div>

                <div className="bg-cream-50 border border-forest-150 rounded-3xl p-6 space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4 pb-4 border-b border-forest-150">
                    <div>
                      <span className="text-[10px] text-forest-500 font-bold uppercase">Name</span>
                      <p className="font-extrabold text-forest-950">{fullName}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-forest-500 font-bold uppercase">Phone</span>
                      <p className="font-extrabold text-forest-950">{phone}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pb-4 border-b border-forest-150">
                    <div>
                      <span className="text-[10px] text-forest-500 font-bold uppercase">Location</span>
                      <p className="font-bold text-forest-900">{village}, {district}, {state}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-forest-500 font-bold uppercase">Primary Crop & Land</span>
                      <p className="font-bold text-forest-900">{primaryCrop} • {landArea} Acres ({farmType})</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-forest-500 font-bold uppercase">Residue Types & Tonnes</span>
                    <p className="font-extrabold text-forest-950">{selectedResidueTypes.join(', ')} (~{estimatedResidueTonnes} tonnes)</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ============================================================ */}
        {/* BUYER ONBOARDING STEPS */}
        {/* ============================================================ */}
        {selectedRole === 'buyer' && (
          <>
            {/* BUYER STEP 1: BUSINESS DETAILS */}
            {currentStep === 2 && (
              <div className="flex flex-col gap-5">
                <div>
                  <h2 className="text-lg font-extrabold text-forest-950">Business Information</h2>
                  <p className="text-xs text-forest-700 mt-1">Provide your business credentials and point of contact.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-clay-800 uppercase tracking-wider mb-1">Contact Person Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Anish Gupta"
                      className="w-full text-xs p-3.5 rounded-xl border border-clay-200 focus:ring-2 focus:ring-clay-500 font-semibold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-clay-800 uppercase tracking-wider mb-1">Business / Entity Name</label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. GreenGrow Bio-Energy Pvt Ltd"
                      className="w-full text-xs p-3.5 rounded-xl border border-clay-200 focus:ring-2 focus:ring-clay-500 font-bold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-clay-800 uppercase tracking-wider mb-1">Buyer Industry Type</label>
                    <select
                      value={buyerType}
                      onChange={(e) => setBuyerType(e.target.value as BuyerType)}
                      className="w-full text-xs p-3.5 rounded-xl border border-clay-200 bg-white font-bold text-clay-950 outline-none focus:ring-2 focus:ring-clay-500"
                    >
                      {buyerTypeOptions.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-clay-800 uppercase tracking-wider mb-1">Contact Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-digit phone number"
                      className="w-full text-xs p-3.5 rounded-xl border border-clay-200 focus:ring-2 focus:ring-clay-500 font-bold outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-clay-800 uppercase tracking-wider mb-1">Business Description (Optional)</label>
                  <textarea
                    rows={2}
                    value={businessDescription}
                    onChange={(e) => setBusinessDescription(e.target.value)}
                    placeholder="Describe your plant capacity, stubble utilization method, or procurement guidelines..."
                    className="w-full text-xs p-3.5 rounded-xl border border-clay-200 focus:ring-2 focus:ring-clay-500 font-semibold outline-none"
                  />
                </div>
              </div>
            )}

            {/* BUYER STEP 2: RESIDUE REQUIREMENTS */}
            {currentStep === 3 && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-lg font-extrabold text-forest-950">Biomass Requirements</h2>
                  <p className="text-xs text-forest-700 mt-1">Specify what residue types and tonnage you want to procure.</p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-clay-800 uppercase tracking-wider mb-2">
                    Required Residue Types (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {residueOptions.map((opt) => {
                      const isSelected = requiredResidueTypes.includes(opt.id);
                      return (
                        <div
                          key={opt.id}
                          onClick={() => toggleResidueType(opt.id, true)}
                          className={`p-3.5 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                            isSelected
                              ? 'border-clay-600 bg-clay-50 text-clay-950 font-bold shadow-sm'
                              : 'border-forest-100 hover:border-clay-200 text-forest-800'
                          }`}
                        >
                          <span className="text-xs">{opt.label}</span>
                          {isSelected && <CheckCircle2 className="h-4 w-4 text-clay-600 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-clay-800 uppercase tracking-wider mb-1">
                    Required Quantity (Tonnes per month / season)
                  </label>
                  <input
                    type="number"
                    step="10"
                    min="1"
                    value={requiredQuantityTonnes}
                    onChange={(e) => setRequiredQuantityTonnes(e.target.value)}
                    placeholder="e.g. 100"
                    className="w-full text-xs p-3.5 rounded-xl border border-clay-200 font-bold text-clay-950 outline-none focus:ring-2 focus:ring-clay-500"
                  />
                </div>
              </div>
            )}

            {/* BUYER STEP 3: PROCUREMENT RADIUS & LOCATION */}
            {currentStep === 4 && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-lg font-extrabold text-forest-950">Procurement Logistics & Location</h2>
                  <p className="text-xs text-forest-700 mt-1">Set your operational radius and facility location.</p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-clay-800 uppercase tracking-wider mb-2">
                    Procurement Radius (km)
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {[10, 25, 50, 100].map((radius) => (
                      <div
                        key={radius}
                        onClick={() => setProcurementRadiusKm(radius)}
                        className={`p-3 rounded-xl border-2 text-center cursor-pointer font-bold text-xs transition-all ${
                          procurementRadiusKm === radius
                            ? 'border-clay-600 bg-clay-50 text-clay-900 shadow-sm'
                            : 'border-forest-100 hover:border-clay-200 text-forest-800'
                        }`}
                      >
                        {radius} km
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-clay-800 uppercase tracking-wider mb-1">Facility State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full text-xs p-3.5 rounded-xl border border-clay-200 font-semibold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-clay-800 uppercase tracking-wider mb-1">Facility District</label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="e.g. Patiala"
                      className="w-full text-xs p-3.5 rounded-xl border border-clay-200 font-semibold outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between bg-cream-50 p-4 rounded-2xl border border-forest-150">
                  <div className="text-xs text-forest-800 font-semibold">
                    Optional Browser Geolocation for Plant Site
                  </div>
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={locationLoading}
                    className="bg-clay-600 hover:bg-clay-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all"
                  >
                    {locationSuccess ? 'Location Saved ✓' : 'Detect Location'}
                  </button>
                </div>
              </div>
            )}

            {/* BUYER STEP 4: REVIEW & SUBMIT */}
            {currentStep === 5 && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-lg font-extrabold text-forest-950">Review Buyer Profile</h2>
                  <p className="text-xs text-forest-700 mt-1">Verify details before creating your buyer account.</p>
                </div>

                <div className="bg-clay-50/70 border border-clay-200 rounded-3xl p-6 space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4 pb-4 border-b border-clay-200">
                    <div>
                      <span className="text-[10px] text-clay-600 font-bold uppercase">Business Name</span>
                      <p className="font-extrabold text-clay-950">{businessName}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-clay-600 font-bold uppercase">Contact Person</span>
                      <p className="font-extrabold text-clay-950">{fullName} ({phone})</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pb-4 border-b border-clay-200">
                    <div>
                      <span className="text-[10px] text-clay-600 font-bold uppercase">Location & Radius</span>
                      <p className="font-bold text-clay-900">{district}, {state} ({procurementRadiusKm} km radius)</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-clay-600 font-bold uppercase">Target Quantity</span>
                      <p className="font-bold text-clay-900">{requiredQuantityTonnes} Tonnes</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-clay-600 font-bold uppercase">Residue Types</span>
                    <p className="font-extrabold text-clay-950">{requiredResidueTypes.join(', ')}</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Footer Navigation Buttons */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-forest-100">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={submitting}
              className="text-xs font-extrabold text-forest-700 hover:text-forest-950 flex items-center gap-1 transition-colors"
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
                className="bg-forest-600 hover:bg-forest-700 text-white font-extrabold text-xs py-3.5 px-8 rounded-2xl shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{selectedRole === 'farmer' ? 'Create My Parali Profile' : 'Create Buyer Profile'}</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="bg-forest-600 hover:bg-forest-700 text-white font-extrabold text-xs py-3.5 px-8 rounded-2xl shadow-md transition-all flex items-center gap-2"
              >
                Next Step <ChevronRight className="h-4 w-4" />
              </button>
            )
          )}
        </div>

      </div>
    </div>
  );
};
