/**
 * src/lib/adminAuth.js — عميل الـ API الإداري للمتصفح.
 *
 * كل الطلبات:
 *  - credentials: 'include' لتدفّق كوكي الجلسة HttpOnly
 *  - رأس X-Requested-With (يستخدمه الـ Worker كطبقة إضافية ضد CSRF)
 *  - لا يوجد أي توكن في localStorage — الجلسة كلها داخل Cookie HttpOnly
 *
 * مهم: فحوصات الصلاحيات هنا (canEdit...) تجري لتحسين تجربة المستخدم
 * فقط. الإنفاذ الحقيقي يتم في الـ Worker على الخادم (worker/admin.js).
 */

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

async function request(path, { method = 'GET', body } = {}) {
  const res = await fetch(path, {
    method,
    credentials: 'include',
    headers: {
      ...(body ? { 'Content-Type': 'application/json; charset=utf-8' } : {}),
      'X-Requested-With': 'XMLHttpRequest',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  let data = null;
  try { data = await res.json(); } catch { /* استجابة غير JSON */ }
  if (!res.ok) {
    throw new ApiError(data?.error || `خطأ ${res.status}`, res.status, data);
  }
  return data;
}

/** فحص الجلسة الحالية — يعيد بيانات المدير أو يرمي 401 */
export const fetchMe = () => request('/api/admin/auth/me');

/** طلب إرسال كود OTP إلى واتساب المدير */
export const requestCode = (phone) => request('/api/admin/auth/request-code', { method: 'POST', body: { phone } });

/** التحقق من الكود (أو الرابط السحري عبر token) */
export const verifyCode = ({ phone, code, token }) =>
  request('/api/admin/auth/verify', { method: 'POST', body: { phone, code, token } });

export const logout = () => request('/api/admin/auth/logout', { method: 'POST' });

/** المنتجات (إداري) */
export const fetchAdminProducts = ({ search = '', limit = 20, offset = 0 } = {}) =>
  request(`/api/admin/products?search=${encodeURIComponent(search)}&limit=${limit}&offset=${offset}`);
export const fetchAdminProduct = (id) => request(`/api/admin/products/${encodeURIComponent(id)}`);
export const patchAdminProduct = (id, fields) =>
  request(`/api/admin/products/${encodeURIComponent(id)}`, { method: 'PATCH', body: fields });

/** سجل نشاطي الأخير */
export const fetchMyActivity = () => request('/api/admin/activity');

// --------------------- مساعدات صلاحيات (UX فقط) ---------------------

export const can = (admin, permission) =>
  !!admin && (admin.permissions.includes('*') || admin.permissions.includes(permission));

/** الحقول القابلة للتحرير بحسب الصلاحيات — تُستخدم لتعطيل الواجهة */
export const editableFields = (admin) => ({
  name: can(admin, 'products.name'),
  price: can(admin, 'products.price'),
  description: can(admin, 'products.description'),
  images: can(admin, 'products.images'),
});

/** تنسيق الجنيه المصري */
export const formatEGP = (value) =>
  `${Number(value ?? 0).toLocaleString('ar-EG', { maximumFractionDigits: 2 })} ج.م`;
