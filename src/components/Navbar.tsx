import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { UserAvatar } from './UserAvatar';
import { PillNav, PillNavItem } from './ui/PillNav';
import { Sprout, LogOut, ArrowLeftRight, ShieldAlert, Award, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  currentView?: string;
  onNavigateProfile?: () => void;
  onNavigateLanding?: () => void;
  farmerView?: string;
  setFarmerView?: (view: 'dashboard' | 'sell' | 'impact') => void;
  buyerView?: string;
  setBuyerView?: (view: 'dashboard' | 'marketplace' | 'demand' | 'matches' | 'requests' | 'optimizer' | 'impact') => void;
  adminTab?: string;
  setAdminTab?: (tab: 'optimizer' | 'burns' | 'impact') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigateProfile,
  onNavigateLanding,
  farmerView,
  setFarmerView,
  buyerView,
  setBuyerView,
  adminTab,
  setAdminTab,
}) => {
  const { currentRole, setRole } = useAppStore();
  const { profile, user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await signOut();
    setRole('none');
  };

  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'User';

  // Build nav items based on current role
  const navItems: PillNavItem[] = (() => {
    if (currentRole === 'Farmer' && setFarmerView) {
      return [
        { label: 'My Farm', href: '#dashboard', onClick: () => setFarmerView('dashboard') },
        { label: 'List Residue', href: '#sell', onClick: () => setFarmerView('sell') },
        { label: 'Impact', href: '#impact', onClick: () => setFarmerView('impact') },
      ];
    }
    if (currentRole === 'Buyer' && setBuyerView) {
      return [
        { label: 'Overview', href: '#dashboard', onClick: () => setBuyerView('dashboard') },
        { label: 'Marketplace', href: '#marketplace', onClick: () => setBuyerView('marketplace') },
        { label: 'Post Need', href: '#demand', onClick: () => setBuyerView('demand') },
        { label: 'Matches', href: '#matches', onClick: () => setBuyerView('matches') },
        { label: 'Requests', href: '#requests', onClick: () => setBuyerView('requests') },
        { label: 'Impact', href: '#impact', onClick: () => setBuyerView('impact') },
      ];
    }
    if (currentRole === 'Admin' && setAdminTab) {
      return [
        { label: 'Route Optimizer', href: '#optimizer', onClick: () => setAdminTab('optimizer') },
        { label: 'Burn Intel', href: '#burns', onClick: () => setAdminTab('burns') },
        { label: 'Impact', href: '#impact', onClick: () => setAdminTab('impact') },
      ];
    }
    return [];
  })();

  // Determine the active href
  const activeHref = (() => {
    if (currentRole === 'Farmer') return `#${farmerView || 'dashboard'}`;
    if (currentRole === 'Buyer') return `#${buyerView || 'dashboard'}`;
    if (currentRole === 'Admin') {
      if (adminTab === 'burns') return '#burns';
      if (adminTab === 'impact') return '#impact';
      return '#optimizer';
    }
    return undefined;
  })();

  // Logo SVG as data URI (Sprout icon approximation)
  const logoSvg = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23E2903F' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><path d='M12 22V12'/><path d='M17 7c0-2.76-2.24-5-5-5s-5 2.24-5 5c0 3 3 7 5 7s5-4 5-7z'/><path d='M5 11c-2.21 0-4 1.79-4 4 0 2.21 1.79 4 4 4'/><path d='M19 11c2.21 0 4 1.79 4 4 0 2.21-1.79 4-4 4'/></svg>`;

  const isDark = theme === 'dark';

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        backgroundColor: isDark ? '#101F18' : '#FFFFFF',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: isDark ? '1px solid #294237' : '1px solid #D8E2DC',
        boxShadow: isDark ? 'none' : '0 2px 12px rgba(16, 47, 36, 0.05)',
        padding: '10px 24px',
        transition: 'all 0.2s ease',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        {/* Brand Logo — clicking opens landing page */}
        <div
          onClick={() => {
            if (onNavigateLanding) onNavigateLanding();
            else setRole('none');
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flexShrink: 0 }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: isDark ? 'rgba(226, 144, 63, 0.15)' : '#EAF3ED',
              border: isDark ? '1px solid rgba(226, 144, 63, 0.35)' : '1px solid #D8E2DC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isDark ? '0 0 12px rgba(226, 144, 63, 0.2)' : 'none',
            }}
          >
            <Sprout style={{ width: 20, height: 20, color: isDark ? '#E2903F' : '#174C38' }} />
          </div>
          <div style={{ lineHeight: 1 }}>
            <div
              style={{
                fontFamily: "'Sora', sans-serif",
                fontWeight: 800,
                fontSize: 20,
                color: isDark ? '#F1F5F2' : '#102F24',
                letterSpacing: '-0.5px',
              }}
            >
              Parali
            </div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 600,
                fontSize: 9,
                color: isDark ? '#8BC7A3' : '#174C38',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}
            >
              Waste to Value
            </div>
          </div>
        </div>

        {/* PillNav — only shown when a role is active */}
        {currentRole !== 'none' && navItems.length > 0 && (
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <PillNav
              logo={logoSvg}
              logoAlt="Parali"
              items={navItems}
              activeHref={activeHref}
              baseColor={isDark ? '#183328' : '#EAF3ED'}
              pillColor={isDark ? '#14251D' : '#FFFFFF'}
              hoveredPillTextColor={isDark ? '#8BC7A3' : '#174C38'}
              pillTextColor={isDark ? '#B8C8BF' : '#29483A'}
              initialLoadAnimation={false}
              onLogoClick={() => {
                if (onNavigateLanding) onNavigateLanding();
                else setRole('none');
              }}
            />
          </div>
        )}

        {/* Right side actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>

          {/* Role indicator for no-nav states */}
          {currentRole === 'Admin' && (
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                fontWeight: 600,
                color: isDark ? '#E2903F' : '#174C38',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                background: isDark ? 'rgba(226, 144, 63, 0.1)' : '#EAF3ED',
                border: isDark ? '1px solid rgba(226, 144, 63, 0.2)' : '1px solid #D8E2DC',
                borderRadius: 999,
                padding: '4px 10px',
              }}
            >
              <ShieldAlert style={{ width: 13, height: 13 }} />
              Ops Center
            </span>
          )}

          {/* Profile button */}
          {user && onNavigateProfile && (
            <button
              onClick={onNavigateProfile}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '6px 12px 6px 6px',
                borderRadius: 999,
                border: isDark ? '1px solid #294237' : '1px solid #D8E2DC',
                background: isDark ? '#14251D' : '#F1F6F3',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 600,
                fontSize: 12,
                color: isDark ? '#F1F5F2' : '#102F24',
              }}
            >
              <UserAvatar
                profileAvatarUrl={profile?.avatar_url}
                userMetadata={user?.user_metadata}
                name={displayName}
                email={user?.email}
                size="sm"
              />
              <span>{displayName.split(' ')[0]}</span>
            </button>
          )}

          {/* Switch role */}
          {currentRole !== 'none' && (
            <button
              onClick={() => setRole('none')}
              title="Switch Role"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '7px 12px',
                borderRadius: 999,
                border: isDark ? '1px solid #294237' : '1px solid #D8E2DC',
                background: isDark ? '#14251D' : '#F1F6F3',
                cursor: 'pointer',
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 600,
                fontSize: 12,
                color: isDark ? '#B8C8BF' : '#40594D',
                transition: 'all 0.2s ease',
              }}
            >
              <ArrowLeftRight style={{ width: 13, height: 13 }} />
              Switch
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              border: isDark ? '1px solid #294237' : '1px solid #D8E2DC',
              background: isDark ? '#183328' : '#EAF3ED',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: isDark ? '#8BC7A3' : '#174C38',
              transition: 'all 0.2s ease',
            }}
          >
            {isDark ? <Sun style={{ width: 15, height: 15 }} /> : <Moon style={{ width: 15, height: 15 }} />}
          </button>

          {/* Sign out */}
          {currentRole !== 'none' && (
            <button
              onClick={handleLogout}
              title="Sign Out"
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                border: isDark ? '1px solid #294237' : '1px solid #D8E2DC',
                background: isDark ? '#14251D' : '#F1F6F3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: isDark ? '#B8C8BF' : '#40594D',
                transition: 'all 0.2s ease',
              }}
            >
              <LogOut style={{ width: 14, height: 14 }} />
            </button>
          )}

          {/* SIH badge — unauthenticated landing state */}
          {currentRole === 'none' && !user && (
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                fontWeight: 600,
                background: 'rgba(226, 144, 63, 0.12)',
                color: '#E2903F',
                border: '1px solid rgba(226, 144, 63, 0.25)',
                borderRadius: 999,
                padding: '4px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <Award style={{ width: 12, height: 12 }} />
              SIH 2026
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
