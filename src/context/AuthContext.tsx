import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { FullUserProfile, UserProfile, FarmerProfile, BuyerProfile } from '../types/profile';
import { fetchFullUserProfile } from '../services/profileService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  fullProfile: FullUserProfile | null;
  profile: UserProfile | null;
  farmerProfile: FarmerProfile | null;
  buyerProfile: BuyerProfile | null;
  onboardingCompleted: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithSandbox: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setFullProfileState: (updated: FullUserProfile | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [fullProfile, setFullProfile] = useState<FullUserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (userId: string) => {
    try {
      const data = await fetchFullUserProfile(userId);
      setFullProfile(data);
    } catch (err) {
      console.error('Error loading user profile:', err);
      setFullProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user.id);
    }
  };

  const setFullProfileState = (updated: FullUserProfile | null) => {
    setFullProfile(updated);
  };

  useEffect(() => {
    let mounted = true;

    // Check active session on initial load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id).finally(() => {
          if (mounted) setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      const newUser = newSession?.user ?? null;
      setUser(newUser);

      if (newUser) {
        setLoading(true);
        await loadProfile(newUser.id);
        if (mounted) setLoading(false);
      } else {
        setFullProfile(null);
        if (mounted) setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth/callback'
        }
      });
      if (error) throw error;
    } catch (err: any) {
      console.error('OAuth sign in error:', err.message);
      throw err;
    }
  };

  const signInWithSandbox = async () => {
    const sandboxUser = {
      id: 'sih-sandbox-user-id',
      email: 'sandbox@parali.in',
      user_metadata: { full_name: 'Sandbox Demo User' }
    } as any;
    
    setUser(sandboxUser);
    setSession({
      user: sandboxUser,
      access_token: 'sandbox-access-token'
    } as any);
    
    setFullProfile({
      profile: {
        id: 'sih-sandbox-user-id',
        role: 'admin',
        full_name: 'Sandbox Demo User',
        onboarding_completed: true,
        village: 'Sangrur',
        district: 'Sangrur',
        state: 'Punjab'
      },
      farmerProfile: {
        primary_crop: 'Paddy',
        land_area_acres: 10,
        estimated_residue_tonnes: 15
      },
      buyerProfile: {
        business_name: 'Bathinda Biomass Power Plant',
        buyer_type: 'bio_power_plant',
        required_quantity_tonnes: 500,
        procurement_radius_km: 75
      }
    } as any);
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
      setFullProfile(null);
    } catch (err: any) {
      console.error('Sign out error:', err.message);
    }
  };

  const profile = fullProfile?.profile ?? null;
  const farmerProfile = fullProfile?.farmerProfile ?? null;
  const buyerProfile = fullProfile?.buyerProfile ?? null;
  const onboardingCompleted = Boolean(profile && profile.onboarding_completed);

  return (
    <AuthContext.Provider value={{
      user,
      session,
      fullProfile,
      profile,
      farmerProfile,
      buyerProfile,
      onboardingCompleted,
      loading,
      signInWithGoogle,
      signInWithSandbox,
      signOut,
      refreshProfile,
      setFullProfileState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
