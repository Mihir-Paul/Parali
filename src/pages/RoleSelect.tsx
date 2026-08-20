import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Sprout, Briefcase, Cpu, ArrowRight } from 'lucide-react';
import SpotlightCard from '../components/ui/SpotlightCard';
import BorderGlow from '../components/ui/BorderGlow';

export const RoleSelect: React.FC = () => {
  const { setRole, loginAsFarmer, loginAsBuyer } = useAppStore();

  return (
    <div
      style={{
        minHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '48px 24px',
        backgroundColor: '#0F1A12',
        fontFamily: "'Manrope', sans-serif",
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background orb */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 700, height: 700,
        background: 'radial-gradient(circle, rgba(226,144,63,0.08) 0%, transparent 70%)',
        filter: 'blur(80px)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 860, width: '100%', textAlign: 'center', marginBottom: 40, position: 'relative' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          padding: '5px 14px', borderRadius: 999,
          background: 'rgba(226,144,63,0.1)', border: '1px solid rgba(226,144,63,0.2)',
          marginBottom: 18,
          fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 600,
          color: '#E2903F', letterSpacing: '0.1em', textTransform: 'uppercase' as const,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#E2903F', display: 'inline-block' }} />
          Parali Platform
        </div>
        <h2 style={{
          fontFamily: "'Sora', sans-serif",
          fontWeight: 800,
          fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
          color: '#F6F2E7',
          margin: '0 0 12px',
          letterSpacing: '-0.02em',
        }}>
          Access the Parali ecosystem
        </h2>
        <p style={{ fontSize: 15, color: '#9BA695', maxWidth: 500, marginInline: 'auto' }}>
          Select your portal to interact with the stubble marketplace, logistics planning, or regional air quality tracking.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, maxWidth: 900, width: '100%', position: 'relative' }}>

        {/* Farmer Card */}
        <SpotlightCard spotlightColor="rgba(127,163,119,0.18)" className="role-card">
          <div style={{ padding: '32px 28px', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: 'rgba(127,163,119,0.15)',
              border: '1px solid rgba(127,163,119,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 20,
            }}>
              <Sprout style={{ width: 24, height: 24, color: '#7FA377' }} />
            </div>
            <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 20, color: '#F6F2E7', margin: '0 0 10px' }}>
              Farmer portal
            </h3>
            <p style={{ fontSize: 13, color: '#9BA695', lineHeight: 1.7, margin: '0 0 auto', flexGrow: 1 }}>
              Sell wheat, paddy, or sugarcane residue. Request free on-field baling, get instant AI valuations, and receive direct payments.
            </p>
            <button
              onClick={() => loginAsFarmer('9999999999')}
              style={{
                marginTop: 28, width: '100%', padding: '12px 16px',
                background: 'rgba(127,163,119,0.12)',
                border: '1px solid rgba(127,163,119,0.3)',
                borderRadius: 10,
                color: '#7FA377',
                fontFamily: "'Sora', sans-serif",
                fontWeight: 700, fontSize: 13,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = '#7FA377';
                (e.currentTarget as HTMLButtonElement).style.color = '#0F1A12';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(127,163,119,0.12)';
                (e.currentTarget as HTMLButtonElement).style.color = '#7FA377';
              }}
            >
              Proceed to dashboard <ArrowRight style={{ width: 14, height: 14 }} />
            </button>
          </div>
        </SpotlightCard>

        {/* Buyer Card — center, wrapped in BorderGlow for hero treatment */}
        <BorderGlow
          borderRadius={16}
          glowColor="28 70 62"
          backgroundColor="#17271B"
          glowIntensity={1.2}
          animated={true}
          colors={['#E2903F', '#7FA377', '#F2B77A']}
          edgeSensitivity={20}
        >
          <div style={{ padding: '32px 28px', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: 'rgba(226,144,63,0.15)',
              border: '1px solid rgba(226,144,63,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 20,
            }}>
              <Briefcase style={{ width: 24, height: 24, color: '#E2903F' }} />
            </div>
            <div style={{
              display: 'inline-block', marginBottom: 12,
              fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
              color: '#E2903F', textTransform: 'uppercase' as const, letterSpacing: '0.1em',
              background: 'rgba(226,144,63,0.1)', border: '1px solid rgba(226,144,63,0.2)',
              borderRadius: 999, padding: '3px 10px',
            }}>Most Popular</div>
            <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 20, color: '#F6F2E7', margin: '0 0 10px' }}>
              Buyer portal
            </h3>
            <p style={{ fontSize: 13, color: '#9BA695', lineHeight: 1.7, margin: '0 0 auto', flexGrow: 1 }}>
              Source bulk agricultural biomass. Post volume requirements, accept matches, and track scheduled regional shipments.
            </p>
            <button
              onClick={() => loginAsBuyer('buyer@parali.demo')}
              style={{
                marginTop: 28, width: '100%', padding: '12px 16px',
                background: '#E2903F',
                border: 'none',
                borderRadius: 10,
                color: '#0F1A12',
                fontFamily: "'Sora', sans-serif",
                fontWeight: 700, fontSize: 13,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                transition: 'all 0.2s ease',
                boxShadow: '0 0 20px rgba(226,144,63,0.3)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 24px rgba(226,144,63,0.45)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 20px rgba(226,144,63,0.3)';
              }}
            >
              Proceed to dashboard <ArrowRight style={{ width: 14, height: 14 }} />
            </button>
          </div>
        </BorderGlow>

        {/* Admin Card */}
        <SpotlightCard spotlightColor="rgba(155,166,149,0.12)" className="role-card">
          <div style={{ padding: '32px 28px', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: 'rgba(155,166,149,0.1)',
              border: '1px solid rgba(155,166,149,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 20,
            }}>
              <Cpu style={{ width: 24, height: 24, color: '#9BA695' }} />
            </div>
            <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 20, color: '#F6F2E7', margin: '0 0 10px' }}>
              Operations center
            </h3>
            <p style={{ fontSize: 13, color: '#9BA695', lineHeight: 1.7, margin: '0 0 auto', flexGrow: 1 }}>
              Access NASA FIRMS burn intelligence, trigger OR-Tools vehicle routing, and monitor MRV carbon offset data.
            </p>
            <button
              onClick={() => setRole('Admin')}
              style={{
                marginTop: 28, width: '100%', padding: '12px 16px',
                background: 'rgba(155,166,149,0.08)',
                border: '1px solid rgba(155,166,149,0.2)',
                borderRadius: 10,
                color: '#9BA695',
                fontFamily: "'Sora', sans-serif",
                fontWeight: 700, fontSize: 13,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(155,166,149,0.18)';
                (e.currentTarget as HTMLButtonElement).style.color = '#F6F2E7';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(155,166,149,0.08)';
                (e.currentTarget as HTMLButtonElement).style.color = '#9BA695';
              }}
            >
              Open operations dashboard <ArrowRight style={{ width: 14, height: 14 }} />
            </button>
          </div>
        </SpotlightCard>
      </div>

      <style>{`
        .role-card {
          border: 1px solid rgba(246,242,231,0.07) !important;
          background: #17271B !important;
          border-radius: 16px !important;
          padding: 0 !important;
          display: flex;
          flex-direction: column;
        }
        @media (max-width: 720px) {
          .role-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};
