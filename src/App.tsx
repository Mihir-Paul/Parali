import React, { useState, useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { Navbar } from './components/Navbar';
import { DemoController } from './components/DemoController';
import { LandingPage } from './pages/LandingPage';
import { RoleSelect } from './pages/RoleSelect';
import { FarmerDashboard } from './pages/FarmerDashboard';
import { FarmerSell } from './pages/FarmerSell';
import { BuyerDashboard } from './pages/BuyerDashboard';
import { BuyerMarketplace } from './pages/BuyerMarketplace';
import { BuyerDemand } from './pages/BuyerDemand';
import { BuyerMatches } from './pages/BuyerMatches';
import { BuyerRequests } from './pages/BuyerRequests';
import { RouteOptimizer } from './pages/RouteOptimizer';
import { BurnIntelligence } from './pages/BurnIntelligence';
import { ImpactDashboard } from './pages/ImpactDashboard';
import { ProfilePage } from './pages/ProfilePage';
import { useAuth } from './context/AuthContext';
import { AuthLogin } from './pages/AuthLogin';
import { Onboarding } from './pages/Onboarding';
import { BuyerDemandItem } from './types/marketplace';
import {
  LayoutDashboard,
  Compass,
  Flame,
  Heart,
  ShoppingBag,
  Sprout,
  UserCheck,
  PlusCircle,
  Sparkles,
  Clock
} from 'lucide-react';

export default function App() {
  const { currentRole, setRole, demoStep } = useAppStore();
  const { user, profile, onboardingCompleted, loading } = useAuth();
  
  const [showLanding, setShowLanding] = useState(true);
  const [isCallback, setIsCallback] = useState(false);
  const [currentView, setCurrentView] = useState<'main' | 'profile'>('main');
  
  // Tab routing for Farmer / Buyer / Admin
  const [farmerView, setFarmerView] = useState<'dashboard' | 'sell'>('dashboard');
  const [buyerView, setBuyerView] = useState<'dashboard' | 'marketplace' | 'demand' | 'matches' | 'requests'>('dashboard');
  const [adminTab, setAdminTab] = useState<'optimizer' | 'burns' | 'impact'>('optimizer');

  // Active demand passed to matching engine
  const [activeDemandForMatches, setActiveDemandForMatches] = useState<BuyerDemandItem | null>(null);

  // Handle OAuth callback paths
  useEffect(() => {
    if (window.location.pathname === '/auth/callback' || window.location.hash.includes('access_token')) {
      setIsCallback(true);
      const timer = setTimeout(() => {
        setIsCallback(false);
        window.history.replaceState({}, document.title, '/');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Sync role state with authenticated user's DB profile
  useEffect(() => {
    if (profile && profile.onboarding_completed) {
      const dbRole = profile.role === 'farmer' ? 'Farmer' : profile.role === 'buyer' ? 'Buyer' : 'none';
      if (dbRole !== 'none') {
        setRole(dbRole);
        setShowLanding(false);
      }
    }
  }, [profile, setRole]);

  // Demo step synchronization for judge walkthrough
  useEffect(() => {
    if (currentRole !== 'none') {
      setShowLanding(false);
    }
    
    if (demoStep === 1) {
      setFarmerView('dashboard');
    } else if (demoStep === 2) {
      setFarmerView('sell');
    } else if (demoStep === 3) {
      setFarmerView('dashboard');
    } else if (demoStep === 4) {
      setBuyerView('dashboard');
    } else if (demoStep === 5) {
      setAdminTab('optimizer');
    } else if (demoStep === 6) {
      setAdminTab('optimizer');
    } else if (demoStep === 7) {
      setFarmerView('dashboard');
      setRole('Farmer');
    } else if (demoStep === 8) {
      setAdminTab('impact');
      setRole('Admin');
    } else if (demoStep === 9) {
      setAdminTab('burns');
      setRole('Admin');
    }
  }, [demoStep, currentRole, setRole]);

  const handleStart = () => {
    setShowLanding(false);
  };

  // Auth Loading and Callback states
  if (loading || isCallback) {
    return (
      <div className="min-h-screen bg-cream-50 flex flex-col justify-center items-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-forest-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-forest-800">
            {isCallback ? 'Completing Google authorization...' : 'Checking session...'}
          </p>
        </div>
      </div>
    );
  }

  // Unauthenticated Flow
  if (!user) {
    if (showLanding) {
      return <LandingPage onStart={handleStart} />;
    }
    return <AuthLogin />;
  }

  // Authenticated, but no completed profile -> Onboarding Flow
  if (!onboardingCompleted) {
    return <Onboarding onComplete={() => setShowLanding(false)} />;
  }

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col font-sans selection:bg-forest-200">
      <Navbar
        currentView={currentView}
        onNavigateProfile={() => setCurrentView(currentView === 'profile' ? 'main' : 'profile')}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {currentView === 'profile' ? (
          <ProfilePage />
        ) : currentRole === 'none' ? (
          <RoleSelect />
        ) : (
          <div className="flex-1 flex flex-col md:flex-row">
            
            {/* Sidebar for Admin / Ops view */}
            {currentRole === 'Admin' && (
              <aside className="w-full md:w-64 bg-white border-r border-forest-100 p-6 flex flex-col gap-2">
                <div className="mb-4">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Operations Panel</h4>
                </div>
                
                <button
                  onClick={() => setAdminTab('optimizer')}
                  className={`w-full text-left font-bold text-xs p-3 rounded-xl flex items-center gap-2.5 transition-all ${
                    adminTab === 'optimizer' 
                      ? 'bg-forest-600 text-white shadow-sm' 
                      : 'text-forest-800 hover:bg-forest-50'
                  }`}
                >
                  <Compass className="h-4 w-4" /> AI Route Optimizer
                </button>

                <button
                  onClick={() => setAdminTab('burns')}
                  className={`w-full text-left font-bold text-xs p-3 rounded-xl flex items-center gap-2.5 transition-all ${
                    adminTab === 'burns' 
                      ? 'bg-forest-600 text-white shadow-sm' 
                      : 'text-forest-800 hover:bg-forest-50'
                  }`}
                >
                  <Flame className="h-4 w-4" /> Burn Intelligence
                </button>

                <button
                  onClick={() => setAdminTab('impact')}
                  className={`w-full text-left font-bold text-xs p-3 rounded-xl flex items-center gap-2.5 transition-all ${
                    adminTab === 'impact' 
                      ? 'bg-forest-600 text-white shadow-sm' 
                      : 'text-forest-800 hover:bg-forest-50'
                  }`}
                >
                  <Heart className="h-4 w-4" /> Impact & Offsets
                </button>

                <div className="mt-auto pt-6 border-t border-forest-100">
                  <button
                    onClick={() => setCurrentView('profile')}
                    className="w-full text-left font-bold text-xs p-3 rounded-xl flex items-center gap-2.5 text-forest-800 hover:bg-forest-50"
                  >
                    <UserCheck className="h-4 w-4 text-forest-600" /> Account Settings
                  </button>
                </div>
              </aside>
            )}

            {/* Sidebar for Buyer view */}
            {currentRole === 'Buyer' && (
              <aside className="w-full md:w-64 bg-white border-r border-forest-100 p-6 flex flex-col gap-2">
                <div className="mb-4">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Buyer Actions</h4>
                </div>

                <button
                  onClick={() => setBuyerView('dashboard')}
                  className={`w-full text-left font-bold text-xs p-3 rounded-xl flex items-center gap-2.5 transition-all ${
                    buyerView === 'dashboard' 
                      ? 'bg-clay-600 text-white shadow-sm' 
                      : 'text-forest-800 hover:bg-forest-50'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" /> Sourcing Overview
                </button>

                <button
                  onClick={() => setBuyerView('marketplace')}
                  className={`w-full text-left font-bold text-xs p-3 rounded-xl flex items-center gap-2.5 transition-all ${
                    buyerView === 'marketplace' 
                      ? 'bg-clay-600 text-white shadow-sm' 
                      : 'text-forest-800 hover:bg-forest-50'
                  }`}
                >
                  <ShoppingBag className="h-4 w-4" /> Biomass Marketplace
                </button>

                <button
                  onClick={() => setBuyerView('demand')}
                  className={`w-full text-left font-bold text-xs p-3 rounded-xl flex items-center gap-2.5 transition-all ${
                    buyerView === 'demand' 
                      ? 'bg-clay-600 text-white shadow-sm' 
                      : 'text-forest-800 hover:bg-forest-50'
                  }`}
                >
                  <PlusCircle className="h-4 w-4" /> Post Requirement
                </button>

                <button
                  onClick={() => setBuyerView('matches')}
                  className={`w-full text-left font-bold text-xs p-3 rounded-xl flex items-center gap-2.5 transition-all ${
                    buyerView === 'matches' 
                      ? 'bg-clay-600 text-white shadow-sm' 
                      : 'text-forest-800 hover:bg-forest-50'
                  }`}
                >
                  <Sparkles className="h-4 w-4" /> Matched Farmers
                </button>

                <button
                  onClick={() => setBuyerView('requests')}
                  className={`w-full text-left font-bold text-xs p-3 rounded-xl flex items-center gap-2.5 transition-all ${
                    buyerView === 'requests' 
                      ? 'bg-clay-600 text-white shadow-sm' 
                      : 'text-forest-800 hover:bg-forest-50'
                  }`}
                >
                  <Clock className="h-4 w-4" /> Purchase Requests
                </button>

                <div className="mt-auto pt-6 border-t border-forest-100">
                  <button
                    onClick={() => setCurrentView('profile')}
                    className="w-full text-left font-bold text-xs p-3 rounded-xl flex items-center gap-2.5 text-forest-800 hover:bg-forest-50"
                  >
                    <UserCheck className="h-4 w-4 text-clay-600" /> Buyer Profile
                  </button>
                </div>
              </aside>
            )}

            {/* Sidebar for Farmer view */}
            {currentRole === 'Farmer' && (
              <aside className="w-full md:w-64 bg-white border-r border-forest-100 p-6 flex flex-col gap-2">
                <div className="mb-4">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Farmer Actions</h4>
                </div>

                <button
                  onClick={() => setFarmerView('dashboard')}
                  className={`w-full text-left font-bold text-xs p-3 rounded-xl flex items-center gap-2.5 transition-all ${
                    farmerView === 'dashboard' 
                      ? 'bg-forest-600 text-white shadow-sm' 
                      : 'text-forest-800 hover:bg-forest-50'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" /> My Farm Dashboard
                </button>

                <button
                  onClick={() => setFarmerView('sell')}
                  className={`w-full text-left font-bold text-xs p-3 rounded-xl flex items-center gap-2.5 transition-all ${
                    farmerView === 'sell' 
                      ? 'bg-forest-600 text-white shadow-sm' 
                      : 'text-forest-800 hover:bg-forest-50'
                  }`}
                >
                  <Sprout className="h-4 w-4" /> Sell Residue
                </button>

                <div className="mt-auto pt-6 border-t border-forest-100">
                  <button
                    onClick={() => setCurrentView('profile')}
                    className="w-full text-left font-bold text-xs p-3 rounded-xl flex items-center gap-2.5 text-forest-800 hover:bg-forest-50"
                  >
                    <UserCheck className="h-4 w-4 text-forest-600" /> Farm Profile
                  </button>
                </div>
              </aside>
            )}

            {/* Page content switcher */}
            <div className="flex-1 bg-cream-50">
              {currentRole === 'Farmer' && (
                farmerView === 'dashboard' ? (
                  <FarmerDashboard onNavigateToSell={() => setFarmerView('sell')} />
                ) : (
                  <FarmerSell onBack={() => setFarmerView('dashboard')} />
                )
              )}

              {currentRole === 'Buyer' && (
                buyerView === 'dashboard' ? (
                  <BuyerDashboard
                    onNavigateToMarketplace={() => setBuyerView('marketplace')}
                    onNavigateToDemand={() => setBuyerView('demand')}
                    onNavigateToMatches={() => setBuyerView('matches')}
                    onNavigateToRequests={() => setBuyerView('requests')}
                  />
                ) : buyerView === 'marketplace' ? (
                  <BuyerMarketplace
                    onNavigateToDemand={() => setBuyerView('demand')}
                    onNavigateToRequests={() => setBuyerView('requests')}
                  />
                ) : buyerView === 'demand' ? (
                  <BuyerDemand
                    onRequirementCreated={(createdDemand) => {
                      setActiveDemandForMatches(createdDemand);
                      setBuyerView('matches');
                    }}
                    onCancel={() => setBuyerView('dashboard')}
                  />
                ) : buyerView === 'matches' ? (
                  <BuyerMatches
                    activeDemand={activeDemandForMatches}
                    onNavigateToMarketplace={() => setBuyerView('marketplace')}
                    onNavigateToRequests={() => setBuyerView('requests')}
                  />
                ) : (
                  <BuyerRequests
                    onBackToMarketplace={() => setBuyerView('marketplace')}
                  />
                )
              )}

              {currentRole === 'Admin' && (
                adminTab === 'optimizer' ? (
                  <RouteOptimizer />
                ) : adminTab === 'burns' ? (
                  <BurnIntelligence />
                ) : (
                  <ImpactDashboard />
                )
              )}
            </div>
          </div>
        )}
      </main>

      {/* Floating Demo Control panel */}
      {!showLanding && <DemoController />}
    </div>
  );
}
