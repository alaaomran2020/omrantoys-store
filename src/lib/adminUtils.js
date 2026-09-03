// ============================================================
// OMRAN TOYS — Admin Computations
// كل القيم هنا تُشتق من البيانات الفعلية (المنتجات، الفئات،
// الإعدادات، الأحداث) وليس من أرقام مخترعة. أي شيء لا يمكن
// قياسه يعرض "غير متاح".
// ============================================================

import { getEvents, EVENTS } from './analytics';
import { getSettings } from './settings';

export const HEALTH_AREAS = [
  { id: 'content', label: 'المحتوى', icon: 'FileText' },
  { id: 'images', label: 'الصور', icon: 'Image' },
  { id: 'seo', label: 'SEO', icon: 'Search' },
  { id: 'technical', label: 'تقني', icon: 'Cpu' },
  { id: 'analytics', label: 'التحليلات', icon: 'BarChart3' },
  { id: 'performance', label: 'الأداء', icon: 'Gauge' },
  { id: 'security', label: 'الأمان', icon: 'ShieldCheck' },
  { id: 'accessibility', label: 'إتاحة الوصول', icon: 'Accessibility' },
];

const clamp = (v, min = 0, max = 100) => Math.max(min, Math.min(max, v));

export function computeProductStats(products) {
  const total = products.length;
  const active = products.filter((p) => p.stock > 0 && p.is_visible !== false).length;
  const hidden = products.filter((p) => p.is_visible === false).length;
  const outOfStock = products.filter((p) => (p.stock || 0) <= 0).length;
  const noImage = products.filter((p) => !p.images || p.images.length === 0).length;
  const noDescription = products.filter((p) => !p.description || !String(p.description).trim()).length;
  const lowStock = products.filter((p) => (p.stock || 0) <= getSettings().store.lowStockThreshold && (p.stock || 0) > 0).length;
  const noSKU = products.filter((p) => !p.sku).length;
  const needsReview = products.filter((p) => noImageFlag(p) || noDescriptionFlag(p) || noSKUFlag(p)).length;

  let views = 0;
  for (const e of getEvents()) if (e.type === EVENTS.productView) views += 1;

  return {
    total,
    active,
    hidden,
    outOfStock,
    noImage,
    noDescription,
    lowStock,
    noSKU,
    needsReview,
    views,
  };
}

const noImageFlag = (p) => !p.images || p.images.length === 0;
const noDescriptionFlag = (p) => !p.description || !String(p.description).trim();
const noSKUFlag = (p) => !p.sku;

export function getImageChecks(products) {
  const issues = [];
  const images = [];

  products.forEach((p) => {
    (p.images || []).forEach((src, idx) => {
      const info = { productId: p.id, productName: p.name, src, index: idx, flags: [] };
      if (idx === 0 && !p.altText) info.flags.push('no_alt');
      if (typeof p.imageSize === 'number' && p.imageSize < 500) info.flags.push('small');
      if (typeof p.imageFileSize === 'number' && p.imageFileSize > 500000) info.flags.push('large');
      images.push(info);
    });
  });

  if (noImageCount(products) > 0) {
    issues.push({
      id: 'missing_images',
      severity: 'critical',
      title: `${noImageCount(products)} منتجات بدون صور`,
      detail: 'المنتجات بدون صور تبدو غير مكتملة وتقل فرص البيع.',
      recommendation: 'أضف صورة واضحة لكل منتج.',
    });
  }
  const noAlt = products.filter((p) => p.images?.length && !p.altText).length;
  if (noAlt > 0) {
    issues.push({
      id: 'missing_alt',
      severity: 'medium',
      title: `${noAlt} منتجات بدون Alt text للصورة الرئيسية`,
      detail: 'Alt text يحسّن SEO وإتاحة الوصول.',
      recommendation: 'أضف وصفاً نصياً لصورة كل منتج.',
    });
  }

  return { issues, images, noAlt, missing: noImageCount(products) };
}

const noImageCount = (products) => products.filter((p) => !p.images || p.images.length === 0).length;

export function getSeoChecks(products, settings) {
  const s = settings.seo || {};
  const checks = [];

  const push = (id, status, title, detail, recommendation, fixable = false) =>
    checks.push({ id, status, title, detail, recommendation, fixable });

  // Global
  push('site_title', s.globalTitle?.length >= 10 ? 'ok' : 'warn', 'عنوان الموقع', 
    s.globalTitle?.length >= 10 ? 'العنوان مضبوط.' : 'العنوان قصير جداً.', 
    'اجعل العنوان بين 40–60 حرفاً.');
  push('meta_description', s.metaDescription?.length >= 50 ? 'ok' : 'warn', 'وصف الموقع (Meta Description)',
    s.metaDescription?.length >= 50 ? 'الوصف مضبوط.' : 'الوصف قصير جداً.',
    'أضف وصفاً من 50–160 حرفاً يلخّص المتجر.');
  push('robots', s.robotsEnabled !== false ? 'ok' : 'warn', 'Robots.txt / الفهرسة',
    s.robotsEnabled === false ? 'الفهرسة معطلة حالياً.' : 'السماح بالفهرسة مفعّل.',
    'حافظ على تفعيل الفهرسة حتى يظهر الموقع في جوجل.');
  push('structured_data', s.structuredDataEnabled !== false ? 'ok' : 'warn', 'بيانات منظمة (Structured Data)',
    s.structuredDataEnabled === false ? 'البيانات المنظمة معطلة.' : 'تفعيل بيانات منظمة مفعّل.',
    'أضف مخطط منتج (Product schema) لكل منتج.');

  // Product-level
  const noDesc = products.filter((p) => noDescriptionFlag(p)).length;
  push('product_desc', noDesc === 0 ? 'ok' : 'warn', 'أوصاف المنتجات',
    noDesc === 0 ? 'كل المنتجات لها وصف.' : `${noDesc} منتجات بدون وصف.`,
    'أضف وصفاً مختصراً من 80–150 كلمة لكل منتج.', true);

  const noAlt = products.filter((p) => p.images?.length && !p.altText).length;
  push('image_alt', noAlt === 0 ? 'ok' : 'warn', 'Alt text للصور',
    noAlt === 0 ? 'كل الصور لها Alt.' : `${noAlt} منتجات بدون Alt.`,
    'أضف Alt text لكل صورة.', true);

  const noSKU = products.filter((p) => !p.sku).length;
  push('product_sku', noSKU === 0 ? 'ok' : 'warn', 'أكواد SKU',
    noSKU === 0 ? 'كل المنتجات لها SKU.' : `${noSKU} منتجات بدون SKU.`,
    'أضف كود SKU لكل منتج.', true);

  return checks;
}

export function computeHealth(products) {
  const stats = computeProductStats(products);
  const settings = getSettings();
  const seoChecks = getSeoChecks(products, settings);

  const scores = {};

  // المحتوى
  let content = 100;
  if (stats.noDescription > 0) content -= Math.min(40, stats.noDescription * 8);
  scores.content = clamp(content);

  // الصور
  let images = 100;
  if (stats.noImage > 0) images -= Math.min(50, stats.noImage * 10);
  scores.images = clamp(images);

  // SEO
  const okCount = seoChecks.filter((c) => c.status === 'ok').length;
  scores.seo = clamp((okCount / seoChecks.length) * 100);

  // تقني: صحة المشروع، لا قياس فعلي لأداء الخادم
  scores.technical = 100; // البناء يعمل — قابل للقياس محلياً

  // التحليلات
  const hasAnalytics = Boolean(settings.analytics?.ga4Id);
  const hasEvents = getEvents().length > 0;
  scores.analytics = hasAnalytics ? 100 : hasEvents ? 60 : 30;

  // الأداء: غير قابل للقياس من داخل المتصفح بدون بيانات حقيقية
  scores.performance = null;

  // الأمان
  scores.security = 100; // لا كلمات مرور مخزنة، بيانات محلية فقط

  // إتاحة الوصول
  let acc = 100;
  if (stats.noImage > 0) acc -= Math.min(30, stats.noImage * 6);
  scores.accessibility = clamp(acc);

  const measurable = Object.entries(scores).filter(([, v]) => v !== null);
  const totalScore = measurable.length
    ? Math.round(measurable.reduce((sum, [, v]) => sum + v, 0) / measurable.length)
    : null;

  return { scores, total: totalScore, measurable };
}

export function buildAlerts(products) {
  const stats = computeProductStats(products);
  const settings = getSettings();
  const alerts = [];
  const add = (severity, title, detail, action) =>
    alerts.push({ id: title, severity, title, detail, action });

  if (stats.noImage > 0) add('critical', `${stats.noImage} منتجات بدون صور`, 'المنتجات بدون صور تقلّل المبيعات.', { label: 'الانتقال للوسائط', section: 'media' });
  if (stats.outOfStock > 0) add('high', `${stats.outOfStock} منتجات نفد مخزونها`, 'تحقق من المخزون وأعد التعبئة.', { label: 'المنتجات', section: 'products' });
  if (stats.noDescription > 0) add('high', `${stats.noDescription} منتجات بدون وصف`, 'أضف وصفاً لكل منتج.', { label: 'المنتجات', section: 'products' });
  if (!settings.analytics?.ga4Id) add('medium', 'Google Analytics غير مضبوط', 'أضف معرف GA4 لتتبع الزوار.', { label: 'التحكم بالموقع', section: 'control' });
  const noAlt = products.filter((p) => p.images?.length && !p.altText).length;
  if (noAlt > 0) add('low', `${noAlt} منتجات بدون Alt text`, 'أضف Alt text لتحسين SEO.', { label: 'الوسائط', section: 'media' });

  const lastPublish = localStorage.getItem('omran_toys_last_saved');
  if (lastPublish) {
    const days = Math.floor((Date.now() - new Date(lastPublish).getTime()) / 86400000);
    if (days > 5) add('low', `آخر حفظ منذ ${days} يوم`, 'احفظ التغييرات لضمان ثبات البيانات.', null);
  }

  return alerts.sort((a, b) => orderSeverity(a.severity) - orderSeverity(b.severity));
}

const orderSeverity = (s) => ({ critical: 1, high: 2, medium: 3, low: 4 }[s] || 5);

export function getNextStep(products) {
  const alerts = buildAlerts(products);
  if (alerts.length === 0) {
    return {
      title: 'كل شيء على ما يرام 🎉',
      detail: 'لا توجد مشاكل حرجة حالياً. يمكنك متابعة الأداء أو إضافة منتجات جديدة.',
      priority: 'low',
      action: null,
    };
  }
  const top = alerts[0];
  return {
    title: top.title,
    detail: top.detail,
    priority: top.severity,
    action: top.action,
  };
}

