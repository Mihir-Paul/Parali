import React, { useState, useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { Navbar } from './components/Navbar';
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
import { ErrorBoundary } from './components/ErrorBoundary';
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
  const { currentRole, setRole } = useAppStore();
  const { user, profile, onboardingCompleted, loading } = useAuth();
  
  const [showLanding, setShowLanding] = useState(true);
  const [isCallback, setIsCallback] = useState(false);
  const [currentView, setCurrentView] = useState<'main' | 'profile'>('main');
  
  // Tab routing for Farmer / Buyer / Admin
  const [farmerView, setFarmerView] = useState<'dashboard' | 'sell' | 'impact'>('dashboard');
  const [buyerView, setBuyerView] = useState<'dashboard' | 'marketplace' | 'demand' | 'matches' | 'requests' | 'optimizer' | 'impact'>('dashboard');
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

  const hasSyncedInitialRole = React.useRef(false);

  // Sync role state with authenticated user's DB profile strictly ONCE on initial load
  useEffect(() => {
    if (profile && profile.onboarding_completed && !hasSyncedInitialRole.current) {
      hasSyncedInitialRole.current = true;
      const dbRole = profile.role === 'farmer' ? 'Farmer' : profile.role === 'buyer' ? 'Buyer' : 'none';
      if (dbRole !== 'none') {
        setRole(dbRole);
        setShowLanding(false);
      }
    }
  }, [profile, setRole]);

  useEffect(() => {
    if (currentRole !== 'none') {
      setShowLanding(false);
    }
  }, [currentRole]);

  const handleStart = () => {
    setShowLanding(false);
  };

  // Auth Loading and Callback states — skeleton instead of spinner
  if (loading || isCallback) {
    return (
      <div className="min-h-screen bg-paper-50 flex flex-col justify-center items-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-pine-700 skeleton" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 rounded-full bg-pine-700 skeleton" style={{ animationDelay: '200ms' }}></div>
            <div className="w-3 h-3 rounded-full bg-pine-700 skeleton" style={{ animationDelay: '400ms' }}></div>
          </div>
          <p className="text-sm font-medium text-ink-500">
            {isCallback ? 'Completing Google authorization…' : 'Checking session…'}
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

  // Sidebar button component for consistency
  const SidebarButton = ({ active, onClick, icon: Icon, label, accent = 'pine' }: {
    active: boolean;
    onClick: () => void;
    icon: React.ElementType;
    label: string;
    accent?: 'pine' | 'soil';
  }) => (
    <button
      onClick={onClick}
      className={`w-full text-left text-xs p-2.5 rounded-card flex items-center gap-2.5 transition-all font-medium ${
        active
          ? accent === 'soil'
            ? 'bg-soil-700 text-white'
            : 'bg-pine-900 text-white'
          : 'text-ink-900 hover:bg-pine-100/50'
      }`}
    >
      <Icon className="h-4 w-4" /> {label}
    </button>
  );

  // Mobile bottom nav button
  const BottomNavButton = ({ active, onClick, icon: Icon, label }: {
    active: boolean;
    onClick: () => void;
    icon: React.ElementType;
    label: string;
  }) => (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-card transition-all text-[10px] font-medium min-w-[56px] ${
        active ? 'text-pine-900' : 'text-ink-500'
      }`}
    >
      <Icon className={`h-5 w-5 ${active ? 'text-pine-900' : 'text-ink-500'}`} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-paper-50 flex flex-col font-sans">
      <Navbar
        currentView={currentView}
        onNavigateProfile={() => setCurrentView(currentView === 'profile' ? 'main' : 'profile')}
        farmerView={farmerView}
        setFarmerView={setFarmerView}
        buyerView={buyerView}
        setBuyerView={setBuyerView}
        adminTab={adminTab}
        setAdminTab={setAdminTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col pb-16 md:pb-0">
        {currentView === 'profile' ? (
          <ProfilePage />
        ) : currentRole === 'none' ? (
          <RoleSelect />
        ) : (
          <div className="flex-1 flex flex-col">
            {/* Page content switcher */}
            <div className="flex-1 bg-cream-50">
              <ErrorBoundary fallbackTitle="Operations View Unavailable">
                {currentRole === 'Farmer' && (
                  farmerView === 'dashboard' ? (
                    <FarmerDashboard onNavigateToSell={() => setFarmerView('sell')} />
                  ) : farmerView === 'sell' ? (
                    <FarmerSell onBack={() => setFarmerView('dashboard')} />
                  ) : (
                    <ImpactDashboard />
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
                  ) : buyerView === 'requests' ? (
                    <BuyerRequests
                      onBackToMarketplace={() => setBuyerView('marketplace')}
                      onNavigateToOptimizer={() => setBuyerView('optimizer')}
                    />
                  ) : buyerView === 'optimizer' ? (
                    <RouteOptimizer />
                  ) : (
                    <ImpactDashboard />
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
              </ErrorBoundary>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation — visible only on mobile */}
      {currentRole !== 'none' && currentView === 'main' && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-0 border-t border-line-200 flex items-center justify-around px-2 py-1 safe-area-pb">
          {currentRole === 'Farmer' && (
            <>
              <BottomNavButton active={farmerView === 'dashboard'} onClick={() => setFarmerView('dashboard')} icon={LayoutDashboard} label="Farm" />
              <BottomNavButton active={farmerView === 'sell'} onClick={() => setFarmerView('sell')} icon={Sprout} label="List" />
              <BottomNavButton active={farmerView === 'impact'} onClick={() => setFarmerView('impact')} icon={Heart} label="Impact" />
              <BottomNavButton active={(currentView as string) === 'profile'} onClick={() => setCurrentView('profile')} icon={UserCheck} label="Profile" />
            </>
          )}
          {currentRole === 'Buyer' && (
            <>
              <BottomNavButton active={buyerView === 'dashboard'} onClick={() => setBuyerView('dashboard')} icon={LayoutDashboard} label="Overview" />
              <BottomNavButton active={buyerView === 'marketplace'} onClick={() => setBuyerView('marketplace')} icon={ShoppingBag} label="Market" />
              <BottomNavButton active={buyerView === 'demand'} onClick={() => setBuyerView('demand')} icon={PlusCircle} label="Post" />
              <BottomNavButton active={buyerView === 'matches'} onClick={() => setBuyerView('matches')} icon={Sparkles} label="Matches" />
              <BottomNavButton active={(currentView as string) === 'profile'} onClick={() => setCurrentView('profile')} icon={UserCheck} label="Profile" />
            </>
          )}
          {currentRole === 'Admin' && (
            <>
              <BottomNavButton active={adminTab === 'optimizer'} onClick={() => setAdminTab('optimizer')} icon={Compass} label="Routes" />
              <BottomNavButton active={adminTab === 'burns'} onClick={() => setAdminTab('burns')} icon={Flame} label="Burns" />
              <BottomNavButton active={adminTab === 'impact'} onClick={() => setAdminTab('impact')} icon={Heart} label="Impact" />
              <BottomNavButton active={(currentView as string) === 'profile'} onClick={() => setCurrentView('profile')} icon={UserCheck} label="Profile" />
            </>
          )}
        </nav>
      )}
    </div>
  );
}
