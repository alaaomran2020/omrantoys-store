// ============================================================
// OMRAN TOYS — Analytics Events
// تسجيل أحداث حقيقية داخل المتصفح (localStorage) وعرضها في
// لوحة التحكم. لا تُرسل أي بيانات شخصية حساسة.
// ملاحظة: البيانات تبدأ من لحظة تفعيل هذا الملف وليست تاريخية.
// ============================================================

const KEY = 'omran_toys_events';

export const EVENTS = {
  productView: 'product_view',
  productSearch: 'product_search',
  categoryView: 'category_view',
  whatsappClick: 'whatsapp_click',
  addToCart: 'add_to_cart',
  orderPlaced: 'order_placed',
  filterUsed: 'filter_used',
  productShare: 'product_share',
  bannerClick: 'banner_click',
  navigationClick: 'navigation_click',
};

export function getEvents() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

/** تسجيل حدث حقيقي */
export function track(type, data = {}) {
  try {
    const events = getEvents();
    events.push({
      type,
      data: { ...data },
      ts: Date.now(),
    });
    localStorage.setItem(KEY, JSON.stringify(events.slice(-8000)));
  } catch {
    /* تجاهل أخطاء التخزين */
  }
}

/** إحصائيات أحداث خلال فترة محددة بالأيام */
export function getEventStats(days = 30) {
  const now = Date.now();
  const cutoff = now - days * 86400000;
  const inWindow = getEvents().filter((e) => e.ts >= cutoff);

  const byType = {};
  for (const e of inWindow) {
    byType[e.type] = (byType[e.type] || 0) + 1;
  }

  // سلسلة يومية لآخر N يوم
  const dayMap = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(now - i * 86400000);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    dayMap[key] = 0;
  }
  for (const e of inWindow) {
    const d = new Date(e.ts);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    if (key in dayMap) dayMap[key] += 1;
  }
  const daily = Object.entries(dayMap)
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([label, count]) => ({ label, count }));

  return { byType, total: inWindow.length, daily, events: inWindow };
}

/** أكثر المنتجات مشاهدة */
export function getTopViewedProducts(limit = 5) {
  const counts = {};
  for (const e of getEvents()) {
    if (e.type === EVENTS.productView && e.data.productId) {
      counts[e.data.productId] = (counts[e.data.productId] || 0) + 1;
    }
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([productId, count]) => ({ productId, count }));
}

/** أكثر التصنيفات مشاهدة */
export function getTopCategories(limit = 5) {
  const counts = {};
  for (const e of getEvents()) {
    if (e.type === EVENTS.categoryView && e.data.category) {
      const c = e.data.category;
      counts[c] = (counts[c] || 0) + 1;
    }
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([category, count]) => ({ category, count }));
}

export function clearEvents() {
  localStorage.removeItem(KEY);
}
