/**
 * Shipping Calculator - Dynamic cost based on governorate, weight, volume
 * For Omran Toys Store - Egypt nationwide
 */

// Egyptian governorates shipping zones
export const shippingZones = {
  'القاهرة': { base: 50, freeThreshold: 1000, extraPerKg: 10, days: '1-2', region: 'القاهرة الكبرى' },
  'الجيزة': { base: 50, freeThreshold: 1000, extraPerKg: 10, days: '1-2', region: 'القاهرة الكبرى' },
  'القليوبية': { base: 50, freeThreshold: 900, extraPerKg: 10, days: '1-2', region: 'القاهرة الكبرى' },
  'طنطا (الغربية)': { base: 40, freeThreshold: 800, extraPerKg: 8, days: '1-2', region: 'الدلتا' },
  'الغربية': { base: 40, freeThreshold: 800, extraPerKg: 8, days: '1-2', region: 'الدلتا' },
  'المحلة الكبرى': { base: 40, freeThreshold: 800, extraPerKg: 8, days: '1-2', region: 'الدلتا' },
  'المنصورة (الدقهلية)': { base: 50, freeThreshold: 900, extraPerKg: 10, days: '1-3', region: 'الدلتا' },
  'الدقهلية': { base: 50, freeThreshold: 900, extraPerKg: 10, days: '1-3', region: 'الدلتا' },
  'الشرقية': { base: 55, freeThreshold: 900, extraPerKg: 10, days: '1-3', region: 'الدلتا' },
  'الزقازيق (الشرقية)': { base: 55, freeThreshold: 900, extraPerKg: 10, days: '1-3', region: 'الدلتا' },
  'البحيرة': { base: 60, freeThreshold: 1000, extraPerKg: 12, days: '2-3', region: 'الدلتا' },
  'كفر الشيخ': { base: 55, freeThreshold: 900, extraPerKg: 10, days: '2-3', region: 'الدلتا' },
  'دمياط': { base: 60, freeThreshold: 1000, extraPerKg: 12, days: '2-3', region: 'القناة' },
  'بورسعيد': { base: 65, freeThreshold: 1000, extraPerKg: 12, days: '2-3', region: 'القناة' },
  'الإسماعيلية': { base: 65, freeThreshold: 1000, extraPerKg: 12, days: '2-3', region: 'القناة' },
  'السويس': { base: 65, freeThreshold: 1000, extraPerKg: 12, days: '2-3', region: 'القناة' },
  'الإسكندرية': { base: 60, freeThreshold: 1000, extraPerKg: 12, days: '1-2', region: 'الإسكندرية' },
  'الفيوم': { base: 60, freeThreshold: 1000, extraPerKg: 12, days: '2-3', region: 'شمال الصعيد' },
  'بني سويف': { base: 60, freeThreshold: 1000, extraPerKg: 12, days: '2-3', region: 'شمال الصعيد' },
  'المنيا': { base: 70, freeThreshold: 1100, extraPerKg: 15, days: '2-4', region: 'شمال الصعيد' },
  'أسيوط': { base: 75, freeThreshold: 1100, extraPerKg: 15, days: '2-4', region: 'جنوب الصعيد' },
  'سوهاج': { base: 80, freeThreshold: 1200, extraPerKg: 15, days: '3-4', region: 'جنوب الصعيد' },
  'قنا': { base: 85, freeThreshold: 1200, extraPerKg: 18, days: '3-5', region: 'جنوب الصعيد' },
  'الأقصر': { base: 85, freeThreshold: 1200, extraPerKg: 18, days: '3-5', region: 'جنوب الصعيد' },
  'أسوان': { base: 90, freeThreshold: 1300, extraPerKg: 20, days: '3-5', region: 'جنوب الصعيد' },
  'البحر الأحمر (الغردقة)': { base: 90, freeThreshold: 1300, extraPerKg: 20, days: '3-5', region: 'البحر الأحمر' },
  'جنوب سيناء (شرم الشيخ)': { base: 95, freeThreshold: 1300, extraPerKg: 20, days: '3-6', region: 'سيناء' },
  'مرسى مطروح': { base: 80, freeThreshold: 1200, extraPerKg: 15, days: '2-4', region: 'الساحل الشمالي' },
  'شمال سيناء': { base: 95, freeThreshold: 1300, extraPerKg: 20, days: '3-6', region: 'سيناء' },
  'الوادي الجديد': { base: 90, freeThreshold: 1300, extraPerKg: 20, days: '3-5', region: 'الوادي الجديد' },
};

// Normalize governorate name
const normalizeGov = (gov) => {
  if (!gov) return 'القاهرة';
  const g = gov.trim();
  // Handle variations
  if (g.includes('طنطا') || g.includes('غربية')) return 'طنطا (الغربية)';
  if (g.includes('قاهرة')) return 'القاهرة';
  if (g.includes('جيزة')) return 'الجيزة';
  if (g.includes('اسكندرية') || g.includes('الإسكندرية')) return 'الإسكندرية';
  return shippingZones[g] ? g : 'القاهرة';
};

/**
 * Calculate shipping cost dynamically
 * @param {Object} params
 * @param {string} params.governorate - Egyptian governorate
 * @param {number} params.totalWeightGrams - Total order weight in grams
 * @param {number} params.subtotal - Order subtotal in EGP
 * @param {string} params.userType - 'retail' | 'wholesale'
 * @param {number} params.totalVolume - Optional volume factor
 * @returns {Object} { cost, isFree, estimatedDays, zone, breakdown }
 */
export function calculateShippingCost({ governorate, totalWeightGrams = 1000, subtotal = 0, userType = 'retail', totalVolume = 0 }) {
  const normalizedGov = normalizeGov(governorate);
  const zone = shippingZones[normalizedGov] || shippingZones['القاهرة'];

  // Empty cart has no shipping fee
  if (subtotal === 0) {
    return {
      cost: 0,
      isFree: true,
      estimatedDays: zone.days,
      zone: normalizedGov,
      region: zone.region,
      breakdown: {
        base: zone.base,
        extraWeight: 0,
        volumeExtra: 0,
        totalWeightGrams,
        extraKg: 0,
        remainingForFree: 0,
      },
    };
  }

  // Weight calculation: first 1kg included in base, extra per kg
  const extraWeightGrams = Math.max(0, totalWeightGrams - 1000);
  const extraKg = Math.ceil(extraWeightGrams / 1000);
  const extraWeightCost = extraKg * zone.extraPerKg;

  // Volume surcharge for bulky items (balloons, large toys)
  let volumeExtra = 0;
  if (totalVolume > 0.05) { // > 0.05 cubic meter
    volumeExtra = Math.ceil(totalVolume / 0.05) * 15;
  }

  const totalCost = zone.base + extraWeightCost + volumeExtra;

  return {
    cost: totalCost,
    isFree: false,
    estimatedDays: zone.days,
    zone: normalizedGov,
    region: zone.region,
    breakdown: {
      base: zone.base,
      extraWeight: extraWeightCost,
      volumeExtra,
      totalWeightGrams,
      extraKg,
      remainingForFree: 0,
    },
  };
}

/**
 * Calculate total cart weight
 */
export function calculateCartWeight(cartItems) {
  return cartItems.reduce((total, item) => {
    const weight = item.product?.weight_grams || item.product?.weight || 500; // default 500g per item
    return total + weight * item.quantity;
  }, 0);
}

/**
 * Calculate cart volume (for balloons and large items)
 */
export function calculateCartVolume(cartItems) {
  return cartItems.reduce((total, item) => {
    // Estimate volume from dimensions if available
    const dims = item.product?.dimensions;
    if (dims && typeof dims === 'string') {
      // Parse "20x30x15 cm" format
      const match = dims.match(/(\d+)\s*[×x]\s*(\d+)\s*[×x]\s*(\d+)/);
      if (match) {
        const vol = (parseInt(match[1]) * parseInt(match[2]) * parseInt(match[3])) / 1000000; // cubic meters
        return total + vol * item.quantity;
      }
    }
    // Default volume estimates by category
    const categoryVolumes = {
      'outdoor': 0.08,
      'building': 0.02,
      'dolls-figures': 0.03,
      'balloons': 0.05,
      'party': 0.02,
    };
    const defaultVol = categoryVolumes[item.product?.category] || 0.01;
    return total + defaultVol * item.quantity;
  }, 0);
}

export function getAllGovernorates() {
  return Object.keys(shippingZones).map(key => ({
    value: key,
    label: key,
    region: shippingZones[key].region,
    base: shippingZones[key].base,
    days: shippingZones[key].days,
  }));
}

export function getRegions() {
  const regions = {};
  Object.entries(shippingZones).forEach(([gov, data]) => {
    if (!regions[data.region]) regions[data.region] = [];
    regions[data.region].push(gov);
  });
  return regions;
}
