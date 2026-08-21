import React, { useState } from 'react';
import { 
  Sprout, ArrowRight, Flame, ShieldAlert, Award, TrendingUp, Compass, 
  Clock, Wind, TrendingDown, ClipboardList, Network, Truck, IndianRupee, Leaf, Factory
} from 'lucide-react';
import ScrollReveal from '../components/ui/ScrollReveal';
import ScrollStack, { ScrollStackItem } from '../components/ui/ScrollStack';
import { motion, useMotionValue, useTransform, useReducedMotion, useSpring, useScroll } from 'framer-motion';
import CountUp from '../components/ui/CountUp';
import { useTheme } from '../context/ThemeContext';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [activeStory, setActiveStory] = useState<'before' | 'after'>('before');
  const prefersReducedMotion = useReducedMotion() ?? undefined;

  const beforeData = [
    { icon: Sprout, title: '1. Crop Residue', desc: 'Millions of tonnes of residue left after harvest.', highlight: false },
    { icon: Clock, title: '2. Sowing Pressure', desc: 'Farmers have only 15–20 days to clear fields for next crop.', highlight: false },
    { icon: Flame, title: '3. Crop Burning', desc: 'Stubble is lit on fire to clear the field quickly.', highlight: true },
    { icon: Wind, title: '4. Air Pollution', desc: 'Dense smog covers regions, creating public health crises.', highlight: false },
    { icon: TrendingDown, title: '5. Zero Income', desc: 'Farmers incur soil nutrient loss and gain no revenue.', highlight: false },
  ];
  
  const afterData = [
    { icon: ClipboardList, title: '1. Residue Listed', desc: 'Farmer listings uploaded with photo and details in seconds.', highlight: false },
    { icon: Network, title: '2. AI Matching', desc: 'AI pairs listings with nearby bio-energy & paper manufacturers.', highlight: false },
    { icon: Truck, title: '3. Smart Logistics', desc: 'Collection routes are automatically batched to minimize cost.', highlight: false },
    { icon: IndianRupee, title: '4. Farmer Earnings', desc: 'Direct payouts transferred upon verified residue collection.', highlight: false },
    { icon: Leaf, title: '5. Green Impact', desc: 'Carbon avoidance offsets logged and certified on dashboard.', highlight: true },
  ];

  // 3D Hero Card Mouse Tilt logic
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 300 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], ["3deg", "-3deg"]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], ["-3deg", "4deg"]), springConfig);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };
  
  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }
  };

  const { scrollY } = useScroll();
  const backgroundY = useSpring(useTransform(scrollY, [0, 2000], [0, -16]), { stiffness: 40, damping: 20 });

  return (
    <div
      className="landing-page-root"
      style={{
        minHeight: '100vh',
        backgroundColor: isDark ? '#0D1713' : '#FAFAF7',
        color: isDark ? '#F1F5F2' : '#102F24',
        fontFamily: "'Manrope', sans-serif",
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Background Parallax Shapes */}
      <motion.div 
        style={{ 
          position: 'absolute', top: '-10%', right: '-10%', width: '120%', height: '120%', 
          zIndex: 1, pointerEvents: 'none', opacity: isDark ? 0.15 : 0.06,
          y: prefersReducedMotion ? 0 : backgroundY 
        }}
      >
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
          <path d="M0,50 Q25,30 50,50 T100,50 L100,100 L0,100 Z" fill="rgba(111, 175, 138, 0.08)" />
          <path d="M0,80 Q30,60 70,90 T100,70 L100,100 L0,100 Z" fill="rgba(139, 199, 163, 0.06)" />
        </svg>
      </motion.div>

      <div style={{ position: 'relative', zIndex: 2 }}>
        {/* Top Banner */}
        <div style={{
          background: isDark ? '#101F18' : '#EAF3ED',
          borderBottom: isDark ? '1px solid #294237' : '1px solid #D8E2DC',
          padding: '10px 24px',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          fontWeight: 600,
          color: isDark ? '#8BC7A3' : '#174C38',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}>
          <Award style={{ width: 14, height: 14 }} />
          Smart India Hackathon 2026 — Prevent Crop Stubble Burning &amp; Double Farmer Income
        </div>

        {/* Hero Section */}
        <motion.header 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 32px 60px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <motion.div variants={itemVariants} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 14px', borderRadius: 999,
              background: isDark ? '#14251D' : '#EAF3ED',
              border: isDark ? '1px solid #294237' : '1px solid #D8E2DC',
              marginBottom: 28,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: isDark ? '#8BC7A3' : '#174C38' }} />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, color: isDark ? '#8BC7A3' : '#174C38', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                AI-Powered Agritech Platform
              </span>
            </motion.div>

            <motion.h1 variants={itemVariants} style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              color: isDark ? '#F1F5F2' : '#102F24',
              margin: 0,
            }}>
              Turn crop waste into{' '}
              <span style={{ color: isDark ? '#E2903F' : '#174C38' }}>
                farmer income.
              </span>
            </motion.h1>

            <motion.p variants={itemVariants} style={{ fontSize: 18, color: isDark ? '#B8C8BF' : '#40594D', marginTop: 20, maxWidth: 500, lineHeight: 1.7 }}>
              Parali connects farmers with industrial buyers who value crop residue, while AI optimizes collection routes, prices materials, and tracks direct CO₂ prevention.
            </motion.p>

            <motion.div variants={itemVariants} style={{ display: 'flex', gap: 12, marginTop: 36, flexWrap: 'wrap' }}>
              <button
                onClick={onStart}
                className="primary-cta"
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: isDark ? '#24563E' : '#174C38',
                  color: '#FFFFFF',
                  fontFamily: "'Sora', sans-serif",
                  fontWeight: 700,
                  fontSize: 15,
                  padding: '14px 28px',
                  borderRadius: 12,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                Start with Parali <ArrowRight style={{ width: 16, height: 16 }} />
              </button>
              <button
                onClick={() => document.getElementById('storytelling')?.scrollIntoView({ behavior: 'smooth' })}
                className="secondary-cta"
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: isDark ? '#14251D' : '#FFFFFF',
                  color: isDark ? '#F1F5F2' : '#102F24',
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 600,
                  fontSize: 15,
                  padding: '14px 28px',
                  borderRadius: 12,
                  border: isDark ? '1px solid #294237' : '1px solid #D8E2DC',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                Explore Transformation
              </button>
            </motion.div>

            {/* Stats row */}
            <motion.div variants={itemVariants} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginTop: 48, paddingTop: 32, borderTop: isDark ? '1px solid #294237' : '1px solid #D8E2DC', width: '100%' }}>
              <div className="stat-card-hover" style={{ padding: '8px', borderRadius: '12px' }}>
                <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 26, color: isDark ? '#F1F5F2' : '#102F24' }}>
                  <CountUp to={1284} suffix=" t" useReducedMotion={prefersReducedMotion} />
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: isDark ? '#B8C8BF' : '#687B72', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Residue Diverted</div>
              </div>
              <div className="stat-card-hover" style={{ padding: '8px', borderRadius: '12px' }}>
                <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 26, color: isDark ? '#F1F5F2' : '#102F24' }}>
                  <CountUp prefix="₹" to={18.7} decimals={1} suffix="L+" delay={0.2} useReducedMotion={prefersReducedMotion} />
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: isDark ? '#B8C8BF' : '#687B72', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Farmer Income Generated</div>
              </div>
              <div className="stat-card-hover" style={{ padding: '8px', borderRadius: '12px' }}>
                <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 26, color: isDark ? '#F1F5F2' : '#102F24' }}>
                  <CountUp to={1926} suffix=" t" delay={0.4} useReducedMotion={prefersReducedMotion} />
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: isDark ? '#B8C8BF' : '#687B72', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Estimated CO₂e Avoided</div>
              </div>
              <div style={{ gridColumn: 'span 3', fontSize: 11, color: isDark ? '#81958A' : '#687B72', marginTop: 8 }}>
                * Metrics are based on sample projected data.
              </div>
            </motion.div>
          </div>

          {/* Hero visual */}
          <motion.div 
            variants={itemVariants}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              perspective: '1000px',
              transformStyle: 'preserve-3d'
            }}
          >
            <motion.div 
              className="clean-card" 
              style={{ 
                padding: 32, width: '100%', maxWidth: 460, 
                rotateX: prefersReducedMotion ? 0 : rotateX, 
                rotateY: prefersReducedMotion ? 0 : rotateY,
                transformStyle: 'preserve-3d',
                background: isDark ? '#14251D' : '#FFFFFF',
                border: isDark ? '1px solid #294237' : '1px solid #D8E2DC',
                boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 16px rgba(16, 47, 36, 0.06)'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0, transformStyle: 'preserve-3d' }}>
                {/* Farmer Node */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, transform: 'translateZ(12px)' }}
                >
                  <div style={{ flex: 1, padding: 16, background: isDark ? '#183328' : '#F1F6F3', borderRadius: 12, border: isDark ? '1px solid #294237' : '1px solid #D8E2DC', display: 'flex', alignItems: 'center', gap: 12 }}>
                     <div className="icon-wrapper" style={{ width: 36, height: 36, borderRadius: 8, background: isDark ? '#101F18' : '#EAF3ED', display: 'flex', alignItems: 'center', justifyContent: 'center', border: isDark ? '1px solid #294237' : '1px solid #D8E2DC' }}>
                       <Sprout className="icon-sprout" style={{ color: isDark ? '#8BC7A3' : '#174C38', width: 20, height: 20 }} />
                     </div>
                     <div>
                       <div style={{ fontSize: 12, color: isDark ? '#B8C8BF' : '#40594D', fontWeight: 600 }}>Source</div>
                       <div style={{ fontSize: 14, color: isDark ? '#F1F5F2' : '#102F24', fontWeight: 700 }}>Farm A (Punjab)</div>
                     </div>
                  </div>
                </motion.div>
                
                <div style={{ display: 'flex', paddingLeft: 34 }}>
                  <motion.div 
                    initial={{ height: 0 }} animate={{ height: 24 }} transition={{ delay: 0.7, duration: 0.4 }}
                    style={{ width: 2, background: isDark ? '#294237' : '#D8E2DC', transform: 'translateZ(6px)' }}
                  />
                </div>
                
                {/* Parali Engine Node */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.5 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, transform: 'translateZ(16px)' }}
                >
                  <div style={{ flex: 1, padding: 16, background: isDark ? '#1C3429' : '#EAF3ED', borderRadius: 12, border: isDark ? '1px solid #294237' : '1px solid #D8E2DC', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
                     <div className="icon-wrapper" style={{ width: 36, height: 36, borderRadius: 8, background: isDark ? '#101F18' : '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', border: isDark ? '1px solid #294237' : '1px solid #D8E2DC' }}>
                       <Network className="icon-compass" style={{ color: '#E2903F', width: 20, height: 20 }} />
                     </div>
                     <div>
                       <div style={{ fontSize: 12, color: isDark ? '#8BC7A3' : '#174C38', fontWeight: 600 }}>Parali Engine</div>
                       <div style={{ fontSize: 14, color: isDark ? '#F1F5F2' : '#102F24', fontWeight: 700 }}>Optimizing Route...</div>
                     </div>
                  </div>
                </motion.div>
                
                <div style={{ display: 'flex', paddingLeft: 34 }}>
                  <motion.div 
                    initial={{ height: 0 }} animate={{ height: 24 }} transition={{ delay: 1.1, duration: 0.4 }}
                    style={{ width: 2, background: isDark ? '#294237' : '#D8E2DC', transform: 'translateZ(6px)' }}
                  />
                </div>

                {/* Buyer Node */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3, duration: 0.5 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, transform: 'translateZ(12px)' }}
                >
                  <div style={{ flex: 1, padding: 16, background: isDark ? '#183328' : '#F1F6F3', borderRadius: 12, border: isDark ? '1px solid #294237' : '1px solid #D8E2DC', display: 'flex', alignItems: 'center', gap: 12 }}>
                     <div className="icon-wrapper" style={{ width: 36, height: 36, borderRadius: 8, background: isDark ? '#101F18' : '#EAF3ED', display: 'flex', alignItems: 'center', justifyContent: 'center', border: isDark ? '1px solid #294237' : '1px solid #D8E2DC' }}>
                       <Factory className="icon-truck" style={{ color: isDark ? '#8BC7A3' : '#174C38', width: 20, height: 20 }} />
                     </div>
                     <div>
                       <div style={{ fontSize: 12, color: isDark ? '#B8C8BF' : '#40594D', fontWeight: 600 }}>Destination</div>
                       <div style={{ fontSize: 14, color: isDark ? '#F1F5F2' : '#102F24', fontWeight: 700 }}>Bio-Energy Plant</div>
                     </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </motion.header>

        {/* ScrollReveal tagline section */}
        <section style={{ maxWidth: 900, margin: '0 auto', padding: '20px 32px 60px' }}>
          <ScrollReveal
            baseOpacity={0.2}
            enableBlur={true}
            baseRotation={2}
            blurStrength={4}
            containerClassName="landing-scroll-reveal"
          >
            India burns 35 million tonnes of crop residue every year. Parali turns it into income for farmers and feedstock for industry — ending the cycle of burning, one field at a time.
          </ScrollReveal>
        </section>

        {/* Storytelling Before/After */}
        <section id="storytelling" style={{ padding: '80px 32px', background: isDark ? '#0D1713' : '#FAFAF7', borderTop: isDark ? '1px solid #294237' : '1px solid #D8E2DC', borderBottom: isDark ? '1px solid #294237' : '1px solid #D8E2DC' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', color: isDark ? '#F1F5F2' : '#102F24', margin: 0 }}>
              How Parali Alters the Lifecycle of Crop Residue
            </h2>
            <p style={{ color: isDark ? '#B8C8BF' : '#40594D', marginTop: 12, maxWidth: 520, marginInline: 'auto', fontSize: 15 }}>
              Stubble burning is a result of tight sowing timelines and lack of market routes. Parali creates the alternative.
            </p>

            <div style={{ display: 'inline-flex', background: isDark ? '#101F18' : '#EAF3ED', border: isDark ? '1px solid #294237' : '1px solid #D8E2DC', borderRadius: 14, padding: 5, marginTop: 32, marginBottom: 48 }}>
              <button
                onClick={() => setActiveStory('before')}
                style={{
                  padding: '10px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700, fontFamily: "'Manrope', sans-serif",
                  display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                  background: activeStory === 'before' ? (isDark ? '#14251D' : '#FFFFFF') : 'transparent',
                  color: activeStory === 'before' ? '#E2903F' : (isDark ? '#81958A' : '#687B72'),
                  boxShadow: activeStory === 'before' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                <Flame style={{ width: 16, height: 16 }} /> Before Parali
              </button>
              <button
                onClick={() => setActiveStory('after')}
                style={{
                  padding: '10px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700, fontFamily: "'Manrope', sans-serif",
                  display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                  background: activeStory === 'after' ? (isDark ? '#14251D' : '#FFFFFF') : 'transparent',
                  color: activeStory === 'after' ? (isDark ? '#8BC7A3' : '#174C38') : (isDark ? '#81958A' : '#687B72'),
                  boxShadow: activeStory === 'after' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                <Sprout style={{ width: 16, height: 16 }} /> After Parali
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, perspective: '1200px' }}>
              {beforeData.map((beforeItem, i) => {
                const afterItem = afterData[i];
                return (
                  <div key={i} style={{ position: 'relative', width: '100%', minHeight: '220px' }}>
                    <motion.div
                      style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        transformStyle: 'preserve-3d'
                      }}
                      initial={false}
                      animate={{ rotateY: activeStory === 'after' && !prefersReducedMotion ? 180 : 0 }}
                      transition={{ 
                        duration: 0.6, 
                        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
                        delay: i * 0.08
                      }}
                    >
                      {/* FRONT FACE (BEFORE) */}
                      <div 
                        className={`clean-card ${beforeItem.highlight ? 'story-card-highlight-bad' : ''}`} 
                        style={{ 
                          position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                          padding: '22px 18px', textAlign: 'left',
                          background: beforeItem.highlight ? (isDark ? '#2A1D1A' : '#FEF3F2') : (isDark ? '#14251D' : '#FFFFFF'),
                          border: beforeItem.highlight ? (isDark ? '1px solid #5C2D24' : '1px solid #FECDCA') : (isDark ? '1px solid #294237' : '1px solid #D8E2DC'),
                          zIndex: activeStory === 'before' || prefersReducedMotion ? 2 : 1,
                          opacity: prefersReducedMotion && activeStory === 'after' ? 0 : 1
                        }}
                      >
                        <div className="icon-wrapper" style={{ marginBottom: 14, width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isDark ? '#101F18' : '#F1F6F3' }}>
                          <beforeItem.icon style={{ width: 22, height: 22, color: beforeItem.highlight ? (isDark ? '#E2903F' : '#B84A3A') : (isDark ? '#81958A' : '#687B72') }} />
                        </div>
                        <h4 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 12, color: beforeItem.highlight ? (isDark ? '#E2903F' : '#B84A3A') : (isDark ? '#F1F5F2' : '#102F24'), textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>{beforeItem.title}</h4>
                        <p style={{ fontSize: 12, color: isDark ? '#B8C8BF' : '#40594D', lineHeight: 1.6, margin: 0 }}>{beforeItem.desc}</p>
                      </div>

                      {/* BACK FACE (AFTER) */}
                      <div 
                        className={`clean-card ${afterItem.highlight ? 'story-card-highlight-good' : ''}`} 
                        style={{ 
                          position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                          transform: prefersReducedMotion ? 'none' : 'rotateY(180deg)',
                          padding: '22px 18px', textAlign: 'left',
                          background: afterItem.highlight ? (isDark ? '#183328' : '#EAF3ED') : (isDark ? '#14251D' : '#FFFFFF'),
                          border: afterItem.highlight ? (isDark ? '1px solid #294237' : '1px solid #D8E2DC') : (isDark ? '1px solid #294237' : '1px solid #D8E2DC'),
                          zIndex: activeStory === 'after' || prefersReducedMotion ? 2 : 1,
                          opacity: prefersReducedMotion && activeStory === 'before' ? 0 : 1
                        }}
                      >
                        <div className="icon-wrapper" style={{ marginBottom: 14, width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isDark ? '#101F18' : '#F1F6F3' }}>
                          <afterItem.icon style={{ width: 22, height: 22, color: afterItem.highlight ? (isDark ? '#8BC7A3' : '#174C38') : (isDark ? '#81958A' : '#687B72') }} />
                        </div>
                        <h4 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 12, color: afterItem.highlight ? (isDark ? '#8BC7A3' : '#174C38') : (isDark ? '#F1F5F2' : '#102F24'), textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>{afterItem.title}</h4>
                        <p style={{ fontSize: 12, color: isDark ? '#B8C8BF' : '#40594D', lineHeight: 1.6, margin: 0 }}>{afterItem.desc}</p>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Core Features */}
        <section style={{ padding: '80px 32px', maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
             <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', color: isDark ? '#F1F5F2' : '#102F24', margin: 0 }}>
               Core Technology
             </h2>
          </div>
          <div style={{ position: 'relative' }}>
            <ScrollStack useWindowScroll={true} itemDistance={120} itemStackDistance={40}>
              {[
                { Icon: TrendingUp, title: 'AI Valuation & Marketplace', desc: 'Eliminate price uncertainty. Parali AI checks crop type, quantity, moisture indices, and buyer demands to predict a fair market price for stubble.' },
                { Icon: Compass, title: 'Route Optimization Engine', desc: 'Logistics constitutes 60% of residue valorization costs. Our route batching algorithms cluster farms, saving substantial truck fuel and turnaround times.' },
                { Icon: ShieldAlert, title: 'Satellite Fire Spotting', desc: 'Automated alerts connect local burning fire regions with instant commercial procurement teams, offering a financial incentive to stop the burn.' },
              ].map(({ Icon, title, desc }) => (
                <ScrollStackItem key={title} itemClassName="clean-card" >
                  <div style={{ padding: '32px 28px', height: '100%', background: isDark ? '#14251D' : '#FFFFFF', border: isDark ? '1px solid #294237' : '1px solid #D8E2DC', borderRadius: '16px' }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 12,
                      background: isDark ? '#1C3429' : '#EAF3ED',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: 20,
                    }}>
                      <Icon style={{ width: 22, height: 22, color: isDark ? '#8BC7A3' : '#174C38' }} />
                    </div>
                    <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 17, color: isDark ? '#F1F5F2' : '#102F24', margin: '0 0 12px' }}>{title}</h3>
                    <p style={{ fontSize: 14, color: isDark ? '#B8C8BF' : '#40594D', lineHeight: 1.7, margin: 0 }}>{desc}</p>
                  </div>
                </ScrollStackItem>
              ))}
            </ScrollStack>
          </div>
        </section>

        {/* CTA Footer */}
        <motion.footer 
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          style={{ padding: '80px 32px', textAlign: 'center' }}
        >
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <div className="clean-card" style={{ padding: '52px 40px', background: isDark ? '#101F18' : '#FFFFFF', border: isDark ? '1px solid #294237' : '1px solid #D8E2DC', boxShadow: isDark ? 'none' : '0 4px 16px rgba(16, 47, 36, 0.06)' }}>
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', color: isDark ? '#F1F5F2' : '#102F24', margin: '0 0 12px' }}>
                The next harvest shouldn't end in a fire.
              </h2>
              <p style={{ color: isDark ? '#B8C8BF' : '#40594D', fontSize: 15, marginBottom: 32 }}>
                Join progressive farmers and sustainable buyers across Punjab &amp; Haryana today.
              </p>
              <button
                onClick={onStart}
                className="primary-cta"
                style={{
                  background: isDark ? '#24563E' : '#174C38',
                  color: '#FFFFFF',
                  fontFamily: "'Sora', sans-serif",
                  fontWeight: 700,
                  fontSize: 15,
                  padding: '14px 32px',
                  borderRadius: 12,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                Launch Demo Dashboard <ArrowRight style={{ width: 16, height: 16 }} />
              </button>
            </div>
          </div>
        </motion.footer>
      </div>

      <style>{`
        /* Global Typography Resets */
        .landing-page-root h1, .landing-page-root h2, .landing-page-root h3, .landing-page-root h4, .landing-page-root h5, .landing-page-root h6, .landing-page-root p {
          color: inherit;
        }

        /* 1. Global Motion System */
        @media (prefers-reduced-motion: no-preference) {
          .clean-card {
            transition: transform 300ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 300ms cubic-bezier(0.22, 1, 0.36, 1), border-color 300ms ease;
          }
          .primary-cta, .secondary-cta {
            transition: transform 200ms cubic-bezier(0.22, 1, 0.36, 1), background-color 200ms ease, box-shadow 200ms ease;
          }
          .primary-cta svg {
            transition: transform 200ms cubic-bezier(0.22, 1, 0.36, 1);
          }
          .primary-cta:hover svg {
            transform: translateX(4px);
          }
        }

        /* 4. Card Hover Effects */
        .clean-card {
          border-radius: 16px;
        }
        
        /* Scroll Reveal Overrides */
        .landing-scroll-reveal .scroll-reveal-text {
          font-size: clamp(1.4rem, 2.5vw, 2.2rem) !important;
          color: ${isDark ? '#F1F5F2' : '#102F24'} !important;
          font-weight: 600 !important;
          line-height: 1.6 !important;
        }

        /* Responsive Layout Updates */
        @media (max-width: 900px) {
          header { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 768px) {
          #storytelling > div > div:last-child {
            grid-template-columns: 1fr;
          }
          section > div {
             grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
