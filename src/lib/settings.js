// ============================================================
// OMRAN TOYS — Site Settings (لوحة التحكم)
// إعدادات الموقع محفوظة في localStorage. تُستخدم هذه الإعدادات
// فعلياً في مكونات حقيقية عند التوفر (مثل رقم WhatsApp واسم الموقع).
// ============================================================

const KEY = 'omran_toys_site_settings';

export const defaultSettings = {
  general: {
    siteName: 'عمران للألعاب',
    siteNameEn: 'Omran Toys',
    tagline: 'شركة عمران التجارية • لعب أطفال ومستلزمات حفلات',
    description: 'وجهتكم الأولى في مصر لألعاب الأطفال ومستلزماتهم. تشكيلة مختارة وأسعار واضحة بالجنيه وتوصيل سريع.',
    email: '',
    phone: '201555570269',
    address: 'طنطا — ميدان السيد البدوي',
    businessHours: 'يومياً 10:00 صباحاً – 12:00 منتصف الليل',
  },
  whatsapp: {
    phone: '201555570269',
    defaultMessage: 'مرحباً، أحتاج مساعدة في اختيار لعبة',
    productTemplate: 'مرحباً، أريد طلب هذه اللعبة: {product} — السعر: {price}',
  },
  social: {
    facebook: '',
    instagram: '',
    tiktok: '',
    twitter: '',
  },
  seo: {
    globalTitle: 'شركة عمران التجارية | لعب أطفال - هدايا',
    metaDescription: 'شركة عمران التجارية — لعب أطفال وهدايا. اكتشف ألعابًا تعليمية وترفيهية مختارة واطلب مباشرة عبر WhatsApp.',
    globalKeywords: 'لعب أطفال, ألعاب تعليمية, عمران, مصر, هدايا',
    canonicalEnabled: true,
    robotsEnabled: true,
    openGraphEnabled: true,
    twitterEnabled: false,
    structuredDataEnabled: true,
  },
  analytics: {
    ga4Id: '',
    searchConsoleVerification: '',
    eventTracking: true,
  },
  appearance: {
    primaryColor: '#FF4D6D',
    announcement: 'الشحن متاح لكل محافظات مصر',
    announcementEnabled: true,
    showWhatsAppButton: true,
  },
  navigation: {
    showCategories: true,
    showSearch: true,
    showCart: true,
  },
  store: {
    freeShippingThreshold: 1000,
    lowStockThreshold: 12,
    vatRate: 0.14,
    currency: 'EGP',
  },
};

export function getSettings() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw);
    // دمج افتراضيات حتى لا تُفقد الحقول الجديدة
    return merge(defaultSettings, parsed);
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings) {
  localStorage.setItem(KEY, JSON.stringify(settings));
  return true;
}

export function resetSettings() {
  localStorage.removeItem(KEY);
  return defaultSettings;
}

function merge(base, override) {
  const out = Array.isArray(base) ? base : { ...base };
  for (const key of Object.keys(base)) {
    if (override && override[key] !== undefined) {
      if (
        base[key] &&
        typeof base[key] === 'object' &&
        !Array.isArray(base[key]) &&
        override[key] &&
        typeof override[key] === 'object'
      ) {
        out[key] = merge(base[key], override[key]);
      } else {
        out[key] = override[key];
      }
    }
  }
  return out;
}
