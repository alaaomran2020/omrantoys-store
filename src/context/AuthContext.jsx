import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isMockMode } from '../lib/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('omran_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('omran_auth_profile');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(true);
  const [isMerchant, setIsMerchant] = useState(() => {
    try {
      const saved = localStorage.getItem('omran_auth_profile');
      if (!saved) return false;
      const p = JSON.parse(saved);
      return p?.user_type === 'wholesale';
    } catch { return false; }
  });

  // Persist
  useEffect(() => {
    if (user) localStorage.setItem('omran_auth_user', JSON.stringify(user));
    else localStorage.removeItem('omran_auth_user');
  }, [user]);

  useEffect(() => {
    if (profile) {
      localStorage.setItem('omran_auth_profile', JSON.stringify(profile));
      setIsMerchant(profile.user_type === 'wholesale');
    } else {
      localStorage.removeItem('omran_auth_profile');
      setIsMerchant(false);
    }
  }, [profile]);

  // Initialize auth
  useEffect(() => {
    const initAuth = async () => {
      if (isMockMode()) {
        setLoading(false);
        return;
      }
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
          if (prof) setProfile(prof);
        }
      } catch (e) {
        console.warn('Auth init error', e);
      } finally {
        setLoading(false);
      }
    };
    initAuth();

    if (!isMockMode()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
          if (prof) setProfile(prof);
        } else {
          setUser(null);
          setProfile(null);
        }
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  const signUp = async ({ email, password, fullName, phone, userType = 'retail', businessName, governorate }) => {
    if (isMockMode()) {
      // Mock signup for dev without Supabase
      const mockUser = {
        id: `mock_${Date.now()}`,
        email,
        user_metadata: { full_name: fullName },
      };
      const mockProfile = {
        id: mockUser.id,
        email,
        full_name: fullName,
        phone,
        user_type: userType,
        business_name: businessName,
        governorate,
        is_verified_merchant: userType === 'wholesale' ? false : true,
        wholesale_tier: 'tier1',
        discount_rate: userType === 'wholesale' ? 15 : 0,
        created_at: new Date().toISOString(),
      };
      setUser(mockUser);
      setProfile(mockProfile);
      return { success: true, user: mockUser, profile: mockProfile };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, user_type: userType } },
      });
      if (error) throw error;

      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          email,
          full_name: fullName,
          phone,
          user_type: userType,
          business_name: businessName,
          governorate,
          is_verified_merchant: userType === 'retail',
        });
        if (profileError) throw profileError;
      }

      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signIn = async ({ email, password }) => {
    if (isMockMode()) {
      // Allow any login in mock mode - determine type by email
      const isWholesale = email.includes('wholesale') || email.includes('merchant') || email.includes('tاجر');
      const mockUser = { id: `mock_${Date.now()}`, email };
      const mockProfile = {
        id: mockUser.id,
        email,
        full_name: isWholesale ? 'متجر السعادة للألعاب' : 'عميل قطاعي',
        phone: '01555570269',
        user_type: isWholesale ? 'wholesale' : 'retail',
        business_name: isWholesale ? 'متجر السعادة - طنطا' : null,
        governorate: 'طنطا (الغربية)',
        is_verified_merchant: true,
        wholesale_tier: isWholesale ? 'tier2' : 'tier1',
        discount_rate: isWholesale ? 20 : 0,
        created_at: new Date().toISOString(),
      };
      setUser(mockUser);
      setProfile(mockProfile);
      return { success: true, user: mockUser, profile: mockProfile };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
      if (prof) setProfile(prof);
      setUser(data.user);
      return { success: true, user: data.user, profile: prof };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signOut = async () => {
    if (isMockMode()) {
      setUser(null);
      setProfile(null);
      return { success: true };
    }
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setProfile(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateProfile = async (updates) => {
    if (isMockMode()) {
      setProfile(prev => ({ ...prev, ...updates }));
      return { success: true };
    }
    try {
      const { data, error } = await supabase.from('profiles').update(updates).eq('id', user.id).select().single();
      if (error) throw error;
      setProfile(data);
      return { success: true, profile: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Pricing helper: get price based on user type
  const getPriceForUser = (product) => {
    if (!product) return 0;
    if (isMerchant && profile?.is_verified_merchant) {
      const tier = profile?.wholesale_tier || 'tier1';
      if (tier === 'tier3' && product.wholesale_price_tier3) return product.wholesale_price_tier3;
      if (tier === 'tier2' && product.wholesale_price_tier2) return product.wholesale_price_tier2;
      if (product.wholesale_price) return product.wholesale_price;
      // Fallback: retail with discount_rate
      if (product.price && profile?.discount_rate) {
        return Math.round(product.price * (1 - profile.discount_rate / 100));
      }
    }
    return product.price || product.retail_price || 0;
  };

  const getOriginalPriceForUser = (product) => {
    return product.originalPrice || product.retail_price || product.price || 0;
  };

  const value = {
    user,
    profile,
    isAuthenticated: !!user,
    isMerchant,
    isVerifiedMerchant: profile?.is_verified_merchant || false,
    wholesaleTier: profile?.wholesale_tier || 'tier1',
    discountRate: profile?.discount_rate || 0,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    getPriceForUser,
    getOriginalPriceForUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
