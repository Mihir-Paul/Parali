import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { useAuth } from '../context/AuthContext';
import { Sprout, LogOut, ArrowLeftRight, UserCheck, ShieldAlert, Award } from 'lucide-react';

interface NavbarProps {
  currentView?: string;
  onNavigateProfile?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigateProfile }) => {
  const { currentRole, setRole } = useAppStore();
  const { profile, user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    setRole('none');
  };

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Authenticated User';
  const displayAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url;

  return (
    <header className="sticky top-0 z-40 bg-cream-50/90 backdrop-blur-md border-b border-forest-100 px-6 py-4 transition-all font-sans">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <div
          onClick={() => setRole('none')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="p-2 bg-forest-100 text-forest-700 rounded-xl group-hover:bg-forest-600 group-hover:text-white transition-all">
            <Sprout className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-2xl tracking-tight text-forest-900 group-hover:text-forest-700 transition-colors">
              Parali
            </h1>
            <p className="text-[10px] text-clay-600 font-bold uppercase tracking-widest leading-none">
              Waste to Value
            </p>
          </div>
        </div>

        {/* Dynamic Navigation Links based on role */}
        <nav className="hidden md:flex items-center gap-6">
          {currentRole === 'Farmer' && (
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-forest-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-forest-600 animate-pulse"></span>
                Farmer Portal: <span className="font-extrabold text-forest-950">{displayName}</span>
              </span>
            </div>
          )}
          {currentRole === 'Buyer' && (
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-forest-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-clay-600 animate-pulse"></span>
                Buyer Portal: <span className="font-extrabold text-forest-950">{displayName}</span>
              </span>
            </div>
          )}
          {currentRole === 'Admin' && (
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-forest-800 flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-clay-600" />
                Intelligence & Operations Center
              </span>
            </div>
          )}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          {user && onNavigateProfile && (
            <button
              onClick={onNavigateProfile}
              className={`flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-xl transition-all border ${
                currentView === 'profile'
                  ? 'bg-forest-600 text-white border-forest-600 shadow-sm'
                  : 'bg-white text-forest-850 border-forest-200 hover:bg-forest-50'
              }`}
            >
              {displayAvatar ? (
                <img src={displayAvatar} alt={displayName} className="w-5 h-5 rounded-full object-cover border border-forest-300" />
              ) : (
                <UserCheck className="h-4 w-4 text-forest-600" />
              )}
              <span>My Profile</span>
            </button>
          )}

          {currentRole !== 'none' && (
            <>
              <button
                onClick={() => setRole('none')}
                className="flex items-center gap-1.5 text-xs font-semibold text-forest-800 hover:text-forest-950 px-3 py-2 rounded-xl bg-forest-50 border border-forest-200 transition-all hover:bg-forest-100"
              >
                <ArrowLeftRight className="h-3.5 w-3.5" />
                Switch Role
              </button>

              <button
                onClick={handleLogout}
                className="p-2.5 text-clay-700 hover:text-clay-900 hover:bg-clay-50 rounded-xl transition-all"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}

          {currentRole === 'none' && !user && (
            <div className="flex items-center gap-2">
              <span className="text-xs bg-clay-100 text-clay-800 font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <Award className="h-3.5 w-3.5" /> SIH 2026 Sandbox
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
