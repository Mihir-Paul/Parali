"use client";

import { FlutedGlass } from "@paper-design/shaders-react";
import { Sprout, Award } from "lucide-react";
import { motion } from "motion/react";

interface AuthSectionThreeProps {
  onGoogleSignUp?: () => void;
  submitting?: boolean;
}

export default function AuthSectionThree({ onGoogleSignUp, submitting = false }: AuthSectionThreeProps) {
  return (
    <section className="min-h-screen bg-cream-50 p-3 text-forest-950 antialiased selection:bg-forest-200">
      <div className="grid min-h-[calc(100vh-1.5rem)] gap-6 lg:grid-cols-[0.94fr_1.06fr]">
        {/* Left Side - Clean Google Sign-Up Box */}
        <div className="flex min-h-[500px] items-center justify-center rounded-3xl border border-forest-150 bg-white px-6 py-12 shadow-sm lg:min-h-0 lg:px-14 lg:py-20 xl:px-20">
          <div className="mx-auto w-full max-w-[420px]">
            
            {/* Brand Logo Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-forest-100 text-forest-700 rounded-2xl border border-forest-200">
                <Sprout className="h-6 w-6" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-forest-950 block leading-none">
                  Parali
                </span>
                <span className="text-[10px] text-clay-600 font-extrabold uppercase tracking-widest block leading-none mt-1">
                  Waste to Value
                </span>
              </div>
            </div>

            <div>
              <h1 className="text-3xl font-black tracking-tight text-forest-950 sm:text-4xl">
                Welcome to Parali
              </h1>
              <p className="mt-2 text-xs text-forest-700 leading-relaxed">
                Connect directly with biomass buyers, run route optimization, and track environmental offset points.
              </p>
            </div>

            {/* Social Signup Button - Google Only */}
            <div className="mt-8">
              <button
                type="button"
                onClick={onGoogleSignUp}
                disabled={submitting}
                className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-forest-200 bg-white px-4 text-sm font-bold text-forest-950 shadow-sm transition-all hover:bg-forest-50 hover:border-forest-300 disabled:opacity-50 cursor-pointer active:scale-[0.99]"
              >
                <GoogleIcon />
                <span className="whitespace-nowrap">
                  {submitting ? "Connecting to Google..." : "Continue with Google"}
                </span>
              </button>
            </div>

            <div className="mt-10 border-t border-forest-100 pt-5 text-center">
              <span className="inline-flex items-center gap-1.5 text-[10px] bg-clay-100 text-clay-800 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                <Award className="h-3.5 w-3.5" /> SIH 2026 Sandbox Login
              </span>
            </div>
          </div>
        </div>

        {/* Right Side - Agricultural Marketing Testimonial and Mockup */}
        <div className="relative flex min-h-[500px] flex-col overflow-hidden rounded-3xl bg-gradient-to-b from-forest-950 via-forest-900 to-forest-950 p-8 text-white sm:p-12 lg:min-h-0 lg:p-16 border border-forest-800 shadow-md">
          {/* Background Shader */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
            <FlutedGlass
              size={0.89}
              shape="lines"
              angle={0}
              distortionShape="prism"
              distortion={0.5}
              shift={0}
              blur={0}
              edges={0.25}
              stretch={0}
              scale={1.11}
              fit="cover"
              highlights={0.15}
              shadows={0.3}
              grainMixer={0.1}
              grainOverlay={0.1}
              colorBack="#0D2920"
              colorHighlight="#2F6B4F"
              colorShadow="#0F1A12"
              className="w-full h-full bg-transparent"
            />
          </div>

          <div className="relative z-10 h-full w-full">
            <div className="max-w-[480px] lg:pt-8">
              <motion.div
                initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center gap-2.5"
              >
                <div className="p-2 bg-forest-800/80 border border-forest-700 rounded-xl text-forest-400">
                  <Sprout className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-bold text-sm leading-tight text-white">
                    Bio-Energy Plant Operations
                  </div>
                  <div className="mt-0.5 text-[11px] text-forest-300 font-medium">
                    Bathinda, Punjab • Verified Partner Hub
                  </div>
                </div>
              </motion.div>

              <motion.blockquote
                initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{
                  duration: 0.8,
                  delay: 0.12,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="mt-7 text-2xl font-light leading-tight tracking-[-0.03em] text-cream-100 sm:text-3xl lg:text-[32px]"
              >
                “Parali connected our bio-energy plant with 40+ local farmers, routing 1,400+ tonnes of straw and eliminating stubble burning entirely.”
              </motion.blockquote>
            </div>

            <div className="mt-10 w-full translate-y-[24%] overflow-hidden rounded-2xl border border-forest-600/40 bg-forest-950/80 p-2 shadow-[0_30px_90px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:translate-y-[22%] lg:absolute lg:left-[10%] lg:-bottom-24 lg:mt-0 lg:w-[105%] lg:max-w-none lg:origin-bottom-left lg:translate-y-0 lg:-rotate-2 xl:left-[12%] xl:-bottom-[140px] xl:w-[108%] 2xl:-bottom-[160px] 2xl:w-[110%]">
              <motion.div
                initial={{ opacity: 0, y: 72, filter: "blur(10px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{
                  duration: 1,
                  delay: 0.22,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="overflow-hidden rounded-xl border border-forest-700/60 bg-forest-950"
              >
                <div className="flex items-center gap-1.5 border-b border-forest-800 bg-forest-950/90 px-4 py-3 select-none">
                  <div className="size-2.5 rounded-full bg-red-500/80" />
                  <div className="size-2.5 rounded-full bg-amber-500/80" />
                  <div className="size-2.5 rounded-full bg-emerald-500/80" />
                  <span className="ml-4 text-[9px] font-mono tracking-wider text-forest-300">
                    parali.in/marketplace/dashboard
                  </span>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=1000&auto=format&fit=crop&q=80"
                  alt="Slick Modern Agriculture & Harvesting"
                  className="h-64 sm:h-80 w-full object-cover object-center opacity-90"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function GoogleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
        fill="#EB4335"
      />
    </svg>
  );
}
