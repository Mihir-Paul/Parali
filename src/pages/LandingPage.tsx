import React, { useState } from 'react';
import { Sprout, ArrowRight, Flame, ShieldAlert, Award, TrendingUp, Compass, Heart } from 'lucide-react';
import ScrollReveal from '../components/ui/ScrollReveal';
import SpotlightCard from '../components/ui/SpotlightCard';
import BorderGlow from '../components/ui/BorderGlow';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [activeStory, setActiveStory] = useState<'before' | 'after'>('before');

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0F1A12',
        color: '#F6F2E7',
        fontFamily: "'Manrope', sans-serif",
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '-10%', left: '-5%',
          width: 600, height: 600,
          background: 'radial-gradient(circle, rgba(226,144,63,0.22) 0%, transparent 70%)',
          filter: 'blur(90px)',
          animation: 'orbDrift1 22s ease-in-out infinite alternate',
        }} />
        <div style={{
          position: 'absolute', top: '40%', right: '-8%',
          width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(127,163,119,0.18) 0%, transparent 70%)',
          filter: 'blur(90px)',
          animation: 'orbDrift2 26s ease-in-out infinite alternate',
        }} />
        <div style={{
          position: 'absolute', bottom: '5%', left: '30%',
          width: 450, height: 450,
          background: 'radial-gradient(circle, rgba(226,144,63,0.12) 0%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'orbDrift3 19s ease-in-out infinite alternate',
        }} />
      </div>

      {/* Grain overlay */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1,
        opacity: 0.035, mixBlendMode: 'overlay',
      }}>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>
      </div>

      <div style={{ position: 'relative', zIndex: 2 }}>
        {/* Top Banner */}
        <div style={{
          background: 'rgba(23, 39, 27, 0.9)',
          borderBottom: '1px solid rgba(246,242,231,0.06)',
          padding: '10px 24px',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          fontWeight: 600,
          color: '#E2903F',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}>
          <Award style={{ width: 14, height: 14 }} />
          Smart India Hackathon 2026 — Prevent Crop Stubble Burning &amp; Double Farmer Income
        </div>

        {/* Hero Section */}
        <header style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 32px 60px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 14px', borderRadius: 999,
              background: 'rgba(226,144,63,0.1)',
              border: '1px solid rgba(226,144,63,0.25)',
              marginBottom: 28,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#E2903F', animation: 'pulse 2s infinite' }} />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 600, color: '#E2903F', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                AI-Powered Agritech Platform
              </span>
            </div>

            <h1 style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              color: '#F6F2E7',
              margin: 0,
            }}>
              Turn crop waste into{' '}
              <span style={{
                background: 'linear-gradient(135deg, #E2903F 0%, #F2B77A 50%, #E2903F 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'shimmer 3s linear infinite',
              }}>
                farmer income
              </span>
              .
            </h1>

            <p style={{ fontSize: 18, color: '#C9CFC1', marginTop: 20, maxWidth: 500, lineHeight: 1.7 }}>
              Parali connects farmers with industrial buyers who value crop residue, while AI optimizes collection routes, prices materials, and tracks direct CO₂ prevention.
            </p>

            <div style={{ display: 'flex', gap: 12, marginTop: 36, flexWrap: 'wrap' }}>
              <button
                onClick={onStart}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: '#E2903F',
                  color: '#0F1A12',
                  fontFamily: "'Sora', sans-serif",
                  fontWeight: 700,
                  fontSize: 15,
                  padding: '14px 28px',
                  borderRadius: 12,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 0 24px rgba(226,144,63,0.35)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 32px rgba(226,144,63,0.5)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 24px rgba(226,144,63,0.35)'; }}
              >
                Start with Parali <ArrowRight style={{ width: 16, height: 16 }} />
              </button>
              <button
                onClick={() => document.getElementById('storytelling')?.scrollIntoView({ behavior: 'smooth' })}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'rgba(246,242,231,0.05)',
                  color: '#C9CFC1',
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 600,
                  fontSize: 15,
                  padding: '14px 28px',
                  borderRadius: 12,
                  border: '1px solid rgba(246,242,231,0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(246,242,231,0.09)'; (e.currentTarget as HTMLButtonElement).style.color = '#F6F2E7'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(246,242,231,0.05)'; (e.currentTarget as HTMLButtonElement).style.color = '#C9CFC1'; }}
              >
                Explore Transformation
              </button>
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginTop: 48, paddingTop: 32, borderTop: '1px solid rgba(246,242,231,0.08)', width: '100%' }}>
              {[
                { num: '1,284 t', label: 'Residue Diverted' },
                { num: '₹18.7L+', label: 'Paid to Farmers' },
                { num: '1,926 t', label: 'CO₂e Diverted' },
              ].map(stat => (
                <div key={stat.label}>
                  <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 26, color: '#E2903F' }}>{stat.num}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#9BA695', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero visual */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <BorderGlow
              borderRadius={24}
              glowColor="28 70 62"
              backgroundColor="#17271B"
              glowIntensity={0.8}
              animated={true}
              colors={['#E2903F', '#7FA377', '#F2B77A']}
              className="hero-visual-card"
            >
              <div style={{ padding: 28 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, height: 280 }}>
                  {[
                    { label: 'Farm A', bg: 'rgba(127,163,119,0.15)', border: 'rgba(127,163,119,0.2)', text: '#7FA377' },
                    { label: 'Pickup', bg: 'rgba(226,144,63,0.12)', border: 'rgba(226,144,63,0.2)', text: '#E2903F' },
                    { label: 'Buffer Zone', bg: 'rgba(127,163,119,0.08)', border: 'rgba(127,163,119,0.12)', text: '#9BA695', span: 2 },
                    { label: 'Residue Available', bg: 'rgba(246,242,231,0.05)', border: 'rgba(246,242,231,0.08)', text: '#C9CFC1', span: 2, icon: true },
                    { label: '', bg: 'rgba(127,163,119,0.06)', border: 'rgba(127,163,119,0.1)', text: '' },
                    { label: '', bg: 'rgba(226,144,63,0.08)', border: 'rgba(226,144,63,0.12)', text: '' },
                  ].map((cell, i) => (
                    <div key={i} style={{
                      gridColumn: cell.span ? `span ${cell.span}` : undefined,
                      background: cell.bg,
                      border: `1px solid ${cell.border}`,
                      borderRadius: 10,
                      padding: 10,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                    }}>
                      {cell.icon && <Sprout style={{ width: 18, height: 18, color: '#7FA377', marginBottom: 4 }} />}
                      {cell.label && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: cell.text, fontWeight: 600 }}>{cell.label}</span>}
                    </div>
                  ))}
                  <div style={{ gridColumn: 'span 4', background: '#0F1A12', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#E2903F', textTransform: 'uppercase', letterSpacing: '0.1em' }}>AI Route Optimization</div>
                      <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 16, color: '#F6F2E7', marginTop: 3 }}>14 Farms Optimized</div>
                    </div>
                    <div style={{
                      width: 44, height: 44, borderRadius: 10,
                      background: 'rgba(226,144,63,0.15)',
                      border: '1px solid rgba(226,144,63,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 13, color: '#E2903F',
                    }}>-33%</div>
                  </div>
                </div>
              </div>
            </BorderGlow>
          </div>
        </header>

        {/* ScrollReveal tagline section */}
        <section style={{ maxWidth: 900, margin: '0 auto', padding: '20px 32px 60px' }}>
          <ScrollReveal
            baseOpacity={0}
            enableBlur={true}
            baseRotation={4}
            blurStrength={8}
            containerClassName="landing-scroll-reveal"
          >
            India burns 35 million tonnes of crop residue every year. Parali turns it into income for farmers and feedstock for industry — ending the cycle of burning, one field at a time.
          </ScrollReveal>
        </section>

        {/* Storytelling Before/After */}
        <section id="storytelling" style={{ padding: '80px 32px', background: 'rgba(23,39,27,0.6)', borderTop: '1px solid rgba(246,242,231,0.06)', borderBottom: '1px solid rgba(246,242,231,0.06)' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', color: '#F6F2E7', margin: 0 }}>
              How Parali Alters the Lifecycle of Crop Residue
            </h2>
            <p style={{ color: '#9BA695', marginTop: 12, maxWidth: 520, marginInline: 'auto', fontSize: 15 }}>
              Stubble burning is a result of tight sowing timelines and lack of market routes. Parali creates the alternative.
            </p>

            <div style={{ display: 'inline-flex', background: 'rgba(15,26,18,0.8)', border: '1px solid rgba(246,242,231,0.08)', borderRadius: 14, padding: 5, marginTop: 32, marginBottom: 48 }}>
              <button
                onClick={() => setActiveStory('before')}
                style={{
                  padding: '10px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700, fontFamily: "'Manrope', sans-serif",
                  display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                  background: activeStory === 'before' ? 'rgba(193,97,74,0.2)' : 'transparent',
                  color: activeStory === 'before' ? '#C1614A' : '#9BA695',
                }}
              >
                <Flame style={{ width: 15, height: 15 }} /> Before Parali
              </button>
              <button
                onClick={() => setActiveStory('after')}
                style={{
                  padding: '10px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700, fontFamily: "'Manrope', sans-serif",
                  display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                  background: activeStory === 'after' ? 'rgba(127,163,119,0.15)' : 'transparent',
                  color: activeStory === 'after' ? '#7FA377' : '#9BA695',
                }}
              >
                <Sprout style={{ width: 15, height: 15 }} /> After Parali
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
              {activeStory === 'before' ? (
                <>
                  {[
                    { emoji: '🌾', title: '1. Crop Residue', desc: 'Millions of tonnes of residue left after harvest.' },
                    { emoji: '⏳', title: '2. Sowing Pressure', desc: 'Farmers have only 15–20 days to clear fields for next crop.' },
                    { emoji: '🔥', title: '3. Crop Burning', desc: 'Stubble is lit on fire to clear the field quickly.', highlight: true },
                    { emoji: '💨', title: '4. Air Pollution', desc: 'Dense smog covers regions, creating public health crises.' },
                    { emoji: '📉', title: '5. Zero Income', desc: 'Farmers incur soil nutrient loss and gain no revenue.' },
                  ].map((card, i) => (
                    <SpotlightCard key={i} spotlightColor="rgba(193,97,74,0.15)" className={`story-card ${card.highlight ? 'story-card-highlight-bad' : ''}`}>
                      <div style={{ padding: '22px 18px' }}>
                        <div style={{ fontSize: 28, marginBottom: 14 }}>{card.emoji}</div>
                        <h4 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 12, color: card.highlight ? '#C1614A' : '#C9CFC1', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>{card.title}</h4>
                        <p style={{ fontSize: 12, color: '#9BA695', lineHeight: 1.6, margin: 0 }}>{card.desc}</p>
                      </div>
                    </SpotlightCard>
                  ))}
                </>
              ) : (
                <>
                  {[
                    { emoji: '🌾', title: '1. Residue Listed', desc: 'Farmer listings uploaded with photo and details in seconds.' },
                    { emoji: '🤖', title: '2. AI Matching', desc: 'AI pairs listings with nearby bio-energy & paper manufacturers.' },
                    { emoji: '🚛', title: '3. Smart Logistics', desc: 'Collection routes are automatically batched to minimize cost.' },
                    { emoji: '💰', title: '4. Farmer Earnings', desc: 'Direct payouts transferred upon verified residue collection.' },
                    { emoji: '🌱', title: '5. Green Impact', desc: 'Carbon avoidance offsets logged and certified on dashboard.', highlight: true },
                  ].map((card, i) => (
                    <SpotlightCard key={i} spotlightColor="rgba(127,163,119,0.15)" className={`story-card ${card.highlight ? 'story-card-highlight-good' : ''}`}>
                      <div style={{ padding: '22px 18px' }}>
                        <div style={{ fontSize: 28, marginBottom: 14 }}>{card.emoji}</div>
                        <h4 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 12, color: card.highlight ? '#7FA377' : '#C9CFC1', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>{card.title}</h4>
                        <p style={{ fontSize: 12, color: '#9BA695', lineHeight: 1.6, margin: 0 }}>{card.desc}</p>
                      </div>
                    </SpotlightCard>
                  ))}
                </>
              )}
            </div>
          </div>
        </section>

        {/* Core Features */}
        <section style={{ padding: '80px 32px', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[
              { Icon: TrendingUp, title: 'AI Valuation & Marketplace', desc: 'Eliminate price uncertainty. Parali AI checks crop type, quantity, moisture indices, and buyer demands to predict a fair market price for stubble.' },
              { Icon: Compass, title: 'Route Optimization Engine', desc: 'Logistics constitutes 60% of residue valorization costs. Our route batching algorithms cluster farms, saving substantial truck fuel and turnaround times.' },
              { Icon: ShieldAlert, title: 'Satellite Fire Spotting', desc: 'Automated alerts connect local burning fire regions with instant commercial procurement teams, offering a financial incentive to stop the burn.' },
            ].map(({ Icon, title, desc }) => (
              <SpotlightCard key={title} spotlightColor="rgba(226,144,63,0.12)" className="feature-card">
                <div style={{ padding: '32px 28px' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: 'rgba(226,144,63,0.12)',
                    border: '1px solid rgba(226,144,63,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 20,
                  }}>
                    <Icon style={{ width: 22, height: 22, color: '#E2903F' }} />
                  </div>
                  <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 17, color: '#F6F2E7', margin: '0 0 12px' }}>{title}</h3>
                  <p style={{ fontSize: 14, color: '#9BA695', lineHeight: 1.7, margin: 0 }}>{desc}</p>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </section>

        {/* CTA Footer */}
        <footer style={{ padding: '80px 32px', textAlign: 'center' }}>
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <BorderGlow
              borderRadius={24}
              glowColor="28 70 62"
              backgroundColor="#17271B"
              glowIntensity={1.2}
              animated={true}
              colors={['#E2903F', '#7FA377', '#F2B77A']}
            >
              <div style={{ padding: '52px 40px' }}>
                <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', color: '#F6F2E7', margin: '0 0 12px' }}>
                  The next harvest shouldn't end in a fire.
                </h2>
                <p style={{ color: '#9BA695', fontSize: 15, marginBottom: 32 }}>
                  Join progressive farmers and sustainable buyers across Punjab &amp; Haryana today.
                </p>
                <button
                  onClick={onStart}
                  style={{
                    background: '#E2903F',
                    color: '#0F1A12',
                    fontFamily: "'Sora', sans-serif",
                    fontWeight: 700,
                    fontSize: 15,
                    padding: '14px 32px',
                    borderRadius: 12,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 0 28px rgba(226,144,63,0.4)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
                >
                  Launch Demo Dashboard <ArrowRight style={{ width: 16, height: 16 }} />
                </button>
              </div>
            </BorderGlow>
          </div>
        </footer>
      </div>

      <style>{`
        @keyframes orbDrift1 {
          from { transform: translate(0, 0) scale(1); }
          to { transform: translate(60px, 40px) scale(1.1); }
        }
        @keyframes orbDrift2 {
          from { transform: translate(0, 0) scale(1); }
          to { transform: translate(-50px, 60px) scale(0.95); }
        }
        @keyframes orbDrift3 {
          from { transform: translate(0, 0) scale(1); }
          to { transform: translate(40px, -50px) scale(1.05); }
        }
        @keyframes shimmer {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
        .landing-scroll-reveal .scroll-reveal-text {
          font-size: clamp(1.4rem, 2.5vw, 2.2rem) !important;
          color: #C9CFC1 !important;
          font-weight: 600 !important;
          line-height: 1.6 !important;
        }
        .story-card {
          border: 1px solid rgba(246,242,231,0.06) !important;
          background: rgba(23,39,27,0.7) !important;
          border-radius: 14px !important;
          padding: 0 !important;
        }
        .story-card-highlight-bad {
          border-color: rgba(193,97,74,0.25) !important;
          box-shadow: 0 0 20px rgba(193,97,74,0.08);
        }
        .story-card-highlight-good {
          border-color: rgba(127,163,119,0.3) !important;
          box-shadow: 0 0 20px rgba(127,163,119,0.1);
        }
        .feature-card {
          border: 1px solid rgba(246,242,231,0.06) !important;
          background: rgba(23,39,27,0.8) !important;
          border-radius: 16px !important;
          padding: 0 !important;
        }
        .hero-visual-card {
          width: 100%;
          max-width: 460px;
        }
        @media (max-width: 900px) {
          header { grid-template-columns: 1fr !important; }
          .hero-visual-card { display: none; }
        }
      `}</style>
    </div>
  );
};
