import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sprout, AlertCircle, Award } from 'lucide-react';

export const AuthLogin: React.FC = () => {
  const { signInWithGoogle } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    if (submitting) return;
    setSubmitting(true);
    setErrorMsg(null);

    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error(err);
      setErrorMsg("We couldn't complete Google sign-in. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-cream-50 px-6 py-12 font-sans">
      <div className="max-w-md w-full bg-white border border-forest-100 rounded-3xl p-8 shadow-md flex flex-col items-center">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="p-3 bg-forest-100 text-forest-700 rounded-2xl">
            <Sprout className="h-7 w-7" />
          </div>
          <div>
            <h1 className="font-extrabold text-2xl tracking-tight text-forest-900 leading-none">
              Parali
            </h1>
            <p className="text-[10px] text-clay-600 font-bold uppercase tracking-widest leading-none mt-1">
              Waste to Value
            </p>
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-xl font-extrabold text-forest-950">Welcome to the Marketplace</h2>
          <p className="text-xs text-forest-700 mt-2 max-w-[280px] mx-auto leading-relaxed">
            Connect directly with biomass buyers, run route optimization, and track environmental offset points.
          </p>
        </div>

        {errorMsg && (
          <div className="w-full bg-clay-50 border border-clay-200 text-clay-800 text-xs p-3.5 rounded-xl mb-6 font-semibold flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-clay-700" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Google Authentication Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={submitting}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm py-4 border border-slate-200 rounded-2xl transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
        >
          {/* Custom vector SVG Google Logo */}
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
          </svg>
          <span>{submitting ? 'Signing you in...' : 'Continue with Google'}</span>
        </button>

        {/* SIH Info Badge */}
        <div className="mt-8 border-t border-slate-100 pt-6 w-full text-center">
          <span className="inline-flex items-center gap-1.5 text-[10px] bg-clay-100 text-clay-800 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
            <Award className="h-3.5 w-3.5" /> SIH 2026 Sandbox Login
          </span>
        </div>
      </div>
    </div>
  );
};
