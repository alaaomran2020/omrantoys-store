import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isMockMode } from '../lib/supabaseClient';

const STORAGE_KEY = 'omran_customer';

// توحيد صيغة رقم الموبايل المصري
export const normalizePhone = (value) => {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits.startsWith('20')) return digits;
  if (digits.startsWith('0')) return `20${digits.slice(1)}`;
  return digits;
};

// التحقق من رقم موبايل مصري (01XXXXXXXXX)
export const isValidEgyptianPhone = (value) => {
  const digits = normalizePhone(value);
  const local = digits.startsWith('20') ? `0${digits.slice(2)}` : digits;
  return /^01[0125]\d{8}$/.test(local);
};

const readStoredCustomer = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(readStoredCustomer);

  // حفظ بيانات العميل محلياً
  useEffect(() => {
    try {
      if (customer) localStorage.setItem(STORAGE_KEY, JSON.stringify(customer));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* تجاهل أخطاء التخزين */
    }
  }, [customer]);

  // تسجيل بيانات العميل (الاسم + الموبايل + حساب الفيسبوك)
  const registerCustomer = async ({ fullName, phone, facebook }) => {
    const record = {
      fullName: String(fullName || '').trim(),
      phone: normalizePhone(phone),
      facebook: String(facebook || '').trim(),
      createdAt: new Date().toISOString(),
    };

    setCustomer(record);

    // حفظ في Supabase لو مُعدّ (جدول leads)
    if (!isMockMode()) {
      try {
        await supabase.from('leads').insert({
          full_name: record.fullName,
          phone: record.phone,
          facebook: record.facebook,
          source: 'website-signup',
        });
      } catch (e) {
        console.warn('Lead save error', e);
      }
    }

    return { success: true, customer: record };
  };

  const updateCustomer = (updates) => {
    setCustomer(prev => (prev ? { ...prev, ...updates } : prev));
    return { success: true };
  };

  const clearCustomer = () => setCustomer(null);

  // السعر الموحد للجميع (لا يوجد تسجيل دخول تجار)
  const getPriceForUser = (product) => product?.price || product?.retail_price || 0;
  const getOriginalPriceForUser = (product) => product?.originalPrice || product?.retail_price || product?.price || 0;

  const value = {
    customer,
    isRegistered: !!customer,
    registerCustomer,
    updateCustomer,
    clearCustomer,
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
