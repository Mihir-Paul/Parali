import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AuthSectionThree from '../components/ui/auth-section-3';
import { AlertCircle } from 'lucide-react';

export const AuthLogin: React.FC = () => {
  const { signInWithGoogle, signInWithSandbox } = useAuth();
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

  const handleSandboxLogin = async () => {
    if (submitting) return;
    setSubmitting(true);
    setErrorMsg(null);

    try {
      await signInWithSandbox();
    } catch (err: any) {
      console.error(err);
      setErrorMsg("We couldn't complete Sandbox sign-in. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="relative">
      {errorMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-full bg-clay-50 border border-clay-200 text-clay-800 text-xs p-3.5 rounded-xl shadow-lg font-semibold flex items-start gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-clay-700 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}
      <AuthSectionThree 
        onGoogleSignUp={handleGoogleLogin} 
        onSandboxSignUp={handleSandboxLogin} 
        submitting={submitting} 
      />
    </div>
  );
};
