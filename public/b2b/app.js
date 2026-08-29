/* =========================================================
   Omran Trading Co. — B2B Wholesale Portal
   Vanilla JS: Supabase Auth + بحث/تصفية فوري + سلة جملة
   ========================================================= */
'use strict';

const { PRODUCTS, CATEGORIES, MIN_ORDER_VALUE, CURRENCY } = window.OMRAN_B2B;

/* ---------------- Supabase ---------------- */
const CFG = window.OMRAN_B2B_CONFIG || {};
const SUPABASE_READY =
  /^https:\/\/[\w-]+\.supabase\.co\/?$/.test(CFG.supabaseUrl || '') &&
  /^eyJ/.test(CFG.supabaseAnonKey || '');
const supabase = SUPABASE_READY
  ? window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey)
  : null;

/* ---------------- الحالة ---------------- */
const CART_KEY = 'omran_b2b_cart_v1';
const USER_KEY = 'omran_b2b_user_v1';

const state = {
  user: null,                 // { name, email }
  authMode: 'login',
  query: '',
  category: 'all',
  stock: 'all',
  cart: loadCart(),           // [{ sku, cartons }]
};
const gridQty = {};           // sku -> الكمية المختارة في الجدول (صناديق)

function loadCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}
function saveCart() { localStorage.setItem(CART_KEY, JSON.stringify(state.cart)); }

/* ---------------- أدوات ---------------- */
const $ = (id) => document.getElementById(id);
const bySku = (sku) => PRODUCTS.find((p) => p.sku === sku);
const fmt = (n) => n.toLocaleString('en-US');
const cartonPrice = (p) => p.unitPrice * p.cartonSize;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* =========================================================
   1) المصادقة (B2B Auth)
   ========================================================= */
function openAuth(mode = 'login', note = '') {
  setTab(mode);
  const noteEl = $('authNote');
  noteEl.textContent = note;
  noteEl.classList.toggle('hidden', !note);
  $('authError').classList.add('hidden');
  $('authForm').reset();
  $('authModal').classList.remove('hidden');
}
function closeAuth() { $('authModal').classList.add('hidden'); }

function setTab(mode) {
  state.authMode = mode;
  const login = mode === 'login';
  $('loginTab').className = tabCls(login);
  $('signupTab').className = tabCls(!login);
  $('authCompanyRow').classList.toggle('hidden', login);
  $('authSubmit').textContent = login ? 'تسجيل الدخول' : 'إنشاء حساب تجاري';
}
function tabCls(active) {
  return 'py-2.5 font-extrabold text-sm transition-colors ' +
    (active ? 'bg-electric text-black' : 'bg-bg text-muted hover:text-ink');
}

async function handleAuth(e) {
  e.preventDefault();
  const email = $('authEmail').value.trim();
  const password = $('authPassword').value;
  const company = $('authCompany').value.trim();
  const errEl = $('authError');
  const btn = $('authSubmit');

  errEl.classList.add('hidden');
  if (!/^\S+@\S+\.\S+$/.test(email)) return authErr('أدخل بريداً إلكترونياً صحيحاً');
  if (password.length < 6) return authErr('كلمة المرور 6 أحرف على الأقل');
  if (!SUPABASE_READY && state.authMode === 'signup' && !company) return authErr('أدخل اسم الشركة / الموزع');

  btn.disabled = true;
  const prev = btn.textContent;
  btn.textContent = 'جارٍ التحقق…';

  try {
    if (SUPABASE_READY) {
      if (state.authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw new Error(errMsg(error));
      } else {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { data: { company } },
        });
        if (error) throw new Error(errMsg(error));
        if (!data.session) { // بانتظار تأكيد البريد
          closeAuth();
          toast('تم إنشاء الحساب — تحقق من بريدك لتأكيد التسجيل', 'ok');
          return;
        }
      }
      const u = (await supabase.auth.getUser()).data.user;
      setUser({ name: u.user_metadata?.company || u.email, email: u.email });
      toast('مرحباً بك في بوابة الجملة', 'ok');
    } else {
      /* وضع تجريبي بدون خادم */
      await new Promise((r) => setTimeout(r, 450));
      setUser({ name: company || email.split('@')[0], email });
      toast('تم تسجيل الدخول (وضع تجريبي)', 'ok');
    }
    closeAuth();
    if (state.cart.length) openCart(); // عرض السلة بعد الدخول إن كانت ممتلئة
  } catch (err) {
    authErr('فشل تسجيل الدخول: ' + (err.message || 'خطأ غير متوقع'));
  } finally {
    btn.disabled = false;
    btn.textContent = prev;
  }
}
function authErr(msg) {
  const el = $('authError');
  el.textContent = msg;
  el.classList.remove('hidden');
}
function errMsg(e) {
  return (e && (e.error_description || e.message)) || 'خطأ غير متوقع';
}

function setUser(u) {
  state.user = u;
  localStorage.setItem(USER_KEY, JSON.stringify(u));
  renderUser();
}
function clearUser() {
  state.user = null;
  localStorage.removeItem(USER_KEY);
  renderUser();
}
async function logout() {
  if (SUPABASE_READY) await supabase.auth.signOut();
  clearUser();
  toast('تم تسجيل الخروج');
}

function renderUser() {
  const area = $('authArea');
  if (state.user) {
    area.innerHTML =
      `<div class="flex items-center gap-3">
        <div class="hidden sm:block text-left">
          <div class="text-sm font-extrabold leading-tight">${esc(state.user.name)}</div>
          <div class="text-[11px] font-mono text-muted">${esc(state.user.email)}</div>
        </div>
        <button id="logoutBtn" class="btn-line !py-2 !px-3 text-sm">تسجيل الخروج</button>
      </div>`;
    $('logoutBtn').onclick = logout;
  } else {
    area.innerHTML = `<button id="loginBtn" class="btn-primary !py-2.5 text-sm">تسجيل دخول الموزعين</button>`;
    $('loginBtn').onclick = () => openAuth('login');
  }
}

/* =========================================================
   2) البحث والتصفية الفورية
   ========================================================= */
function visibleProducts() {
  const q = state.query.trim().toLowerCase();
  return PRODUCTS.filter((p) =>
    (state.category === 'all' || p.category === state.category) &&
    (state.stock === 'all' || p.stockCartons > 0) &&
    (!q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
  );
}

function renderGrid() {
  const list = visibleProducts();
  $('gridEmpty').classList.toggle('hidden', list.length > 0);
  $('resultCount').textContent = `عرض ${fmt(list.length)} من ${fmt(PRODUCTS.length)} صنفاً`;
  $('gridBody').innerHTML = list.map(rowHtml).join('');

  $('gridBody').querySelectorAll('[data-add]').forEach((b) => (b.onclick = () => addToCart(b.dataset.add)));
  $('gridBody').querySelectorAll('[data-step]').forEach((b) => (b.onclick = () => stepGrid(b)));
}

function stepGrid(btn) {
  const p = bySku(btn.dataset.step);
  let q = (gridQty[p.sku] ?? p.minCartons) + Number(btn.dataset.delta);
  q = Math.max(p.minCartons, Math.min(p.stockCartons, q));
  gridQty[p.sku] = q;
  const box = btn.closest('[data-stepbox]');
  box.dataset.q = q;
  box.querySelector('[data-qval]').textContent = q;
}

function rowHtml(p) {
  const inCart = state.cart.find((c) => c.sku === p.sku);
  const out = p.stockCartons === 0;
  const locked = out || !!inCart;
  const q = gridQty[p.sku] ?? p.minCartons;

  return `<tr class="border-b border-line/60 hover:bg-raised/50 transition-colors">
    <td class="px-4 py-3 align-middle">
      <div class="font-extrabold text-[15px] leading-snug">${esc(p.name)}</div>
      <div class="text-[11px] text-muted font-bold mt-1">أدنى طلب: ${p.minCartons} صناديق · ${p.cartonSize} قطعة/صندوق</div>
    </td>
    <td class="px-4 py-3 font-mono text-xs text-electric2 whitespace-nowrap" dir="ltr">${p.sku}</td>
    <td class="px-4 py-3"><span class="badge">${CATEGORIES[p.category]}</span></td>
    <td class="px-4 py-3 font-mono whitespace-nowrap">${fmt(p.unitPrice)} ${CURRENCY}</td>
    <td class="px-4 py-3 font-mono font-bold text-electric2 whitespace-nowrap">${fmt(cartonPrice(p))} ${CURRENCY}</td>
    <td class="px-4 py-3 whitespace-nowrap">${
      out ? '<span class="stamp-bad">غير متوفر</span>'
          : `<span class="stamp-ok">متوفر · ${p.stockCartons}</span>`
    }</td>
    <td class="px-4 py-3">
      <div data-stepbox data-q="${q}" class="inline-flex items-center border-2 border-line bg-bg">
        <button data-step="${p.sku}" data-delta="-1" ${locked ? 'disabled' : ''} class="stepper-btn" aria-label="إنقاص الكمية">−</button>
        <span data-qval class="w-10 text-center font-mono text-sm font-bold">${q}</span>
        <button data-step="${p.sku}" data-delta="1" ${locked ? 'disabled' : ''} class="stepper-btn" aria-label="زيادة الكمية">+</button>
      </div>
    </td>
    <td class="px-4 py-3 text-left">
      ${
        out
          ? `<button disabled class="btn-line w-full !py-2 text-sm">نفذ المخزون</button>`
          : inCart
            ? `<button disabled class="btn-line w-full !py-2 text-sm !border-ok/60 text-ok">في السلة (${inCart.cartons} ص)</button>`
            : `<button data-add="${p.sku}" class="btn-primary w-full !py-2 text-sm">أضف للسلة</button>`
      }
    </td>
  </tr>`;
}

/* =========================================================
   3) سلة الطلبيات (بالصناديق)
   ========================================================= */
function cartLines() {
  return state.cart.map((c) => ({ ...c, p: bySku(c.sku) })).filter((l) => l.p);
}
function cartTotals() {
  const lines = cartLines();
  return {
    subtotal: lines.reduce((s, l) => s + cartonPrice(l.p) * l.cartons, 0),
    cartons: lines.reduce((s, l) => s + l.cartons, 0),
    pieces: lines.reduce((s, l) => s + l.cartons * l.p.cartonSize, 0),
  };
}

function addToCart(sku) {
  const p = bySku(sku);
  if (!p || p.stockCartons === 0) return;
  /* الكمية المختارة في صف الجدول (عدّاد الصناديق) */
  const row = document.querySelector(`[data-add="${sku}"]`)?.closest('tr');
  const box = row?.querySelector('[data-stepbox]');
  const q = box ? Number(box.dataset.q) : p.minCartons;
  state.cart.push({ sku, cartons: Math.max(p.minCartons, Math.min(p.stockCartons, q)) });
  saveCart();
  renderGrid();
  renderCart();
  const badge = $('cartBadge');
  badge.classList.remove('pop'); void badge.offsetWidth; badge.classList.add('pop');
  toast(`تمت إضافة ${q} صناديق — «${p.name}»`, 'ok');
}

function stepCart(sku, delta) {
  const p = bySku(sku);
  const line = state.cart.find((c) => c.sku === sku);
  if (!p || !line) return;
  let q = line.cartons + delta;
  if (q < p.minCartons) {
    toast(`أدنى طلب لهذا الصنف ${p.minCartons} صناديق`, 'warn');
    q = p.minCartons;
  } else if (q > p.stockCartons) {
    toast(`المتاح ${p.stockCartons} صناديق فقط`, 'warn');
    q = p.stockCartons;
  }
  line.cartons = q;
  saveCart();
  renderCart();
  renderGrid();
}

function removeLine(sku) {
  state.cart = state.cart.filter((c) => c.sku !== sku);
  saveCart();
  renderCart();
  renderGrid();
}
function clearCart() {
  if (!state.cart.length) return;
  state.cart = [];
  saveCart();
  renderCart();
  renderGrid();
  toast('تم إفراغ السلة');
}

function cartItemHtml(l) {
  const p = l.p;
  const out = p.stockCartons === 0;
  const lineTotal = cartonPrice(p) * l.cartons;
  return `<div class="border-b-2 border-line p-4">
    <div class="flex justify-between gap-3">
      <div class="min-w-0">
        <div class="font-extrabold text-sm leading-snug">${esc(p.name)}</div>
        <div class="font-mono text-[11px] text-muted mt-1" dir="ltr">${p.sku} · ${p.cartonSize} pcs/ctn</div>
      </div>
      <button data-remove="${p.sku}" class="shrink-0 w-8 h-8 grid place-items-center border-2 border-line font-black text-muted hover:border-bad hover:text-bad transition-colors" aria-label="حذف الصنف">✕</button>
    </div>
    <div class="flex items-center justify-between mt-3">
      <div class="inline-flex items-center border-2 border-line bg-bg">
        <button data-cstep="${p.sku}" data-delta="-1" ${out ? 'disabled' : ''} class="stepper-btn" aria-label="إنقاص">−</button>
        <span data-cq class="w-10 text-center font-mono text-sm font-bold">${l.cartons}</span>
        <button data-cstep="${p.sku}" data-delta="1" ${out ? 'disabled' : ''} class="stepper-btn" aria-label="زيادة">+</button>
      </div>
      <div class="text-left">
        <div class="font-mono font-bold text-electric2 text-sm">${fmt(lineTotal)} ${CURRENCY}</div>
        <div class="text-[10px] text-muted font-bold">${l.cartons} صندوق · ${fmt(l.cartons * p.cartonSize)} قطعة</div>
      </div>
    </div>
  </div>`;
}

function renderCart() {
  const lines = cartLines();
  const t = cartTotals();

  $('cartBadge').textContent = t.cartons;
  $('cartItems').innerHTML = lines.length
    ? lines.map(cartItemHtml).join('')
    : `<div class="p-10 text-center text-muted font-extrabold">السلة فارغة — أضف أصنافاً من الكتالوج للبدء</div>`;

  $('cartItems').querySelectorAll('[data-cstep]').forEach((b) => (b.onclick = () => stepCart(b.dataset.cstep, Number(b.dataset.delta))));
  $('cartItems').querySelectorAll('[data-remove]').forEach((b) => (b.onclick = () => removeLine(b.dataset.remove)));

  $('cartTotals').innerHTML = `
    <div class="flex justify-between text-sm font-bold text-muted"><span>عدد الصناديق</span><span class="font-mono text-ink">${fmt(t.cartons)}</span></div>
    <div class="flex justify-between text-sm font-bold text-muted"><span>عدد القطع</span><span class="font-mono text-ink">${fmt(t.pieces)}</span></div>
    <div class="flex justify-between items-center text-lg font-black pt-2 border-t-2 border-line">
      <span>الإجمالي</span>
      <span class="font-mono text-electric2">${fmt(t.subtotal)} ${CURRENCY}</span>
    </div>`;

  /* قاعدة الحد الأدنى للطلب */
  const met = t.subtotal >= MIN_ORDER_VALUE;
  const pct = Math.min(100, (t.subtotal / MIN_ORDER_VALUE) * 100);
  $('minOrderFill').style.width = pct + '%';
  const mo = $('minOrderText');
  mo.textContent = met
    ? '✓ تم بلوغ الحد الأدنى للطلب'
    : `أضف ${fmt(MIN_ORDER_VALUE - t.subtotal)} ${CURRENCY} إضافية لبلوغ الحد الأدنى (${fmt(MIN_ORDER_VALUE)} ${CURRENCY})`;
  mo.className = met ? 'text-ok' : 'text-warn';
  $('checkoutBtn').disabled = !(lines.length && met);
}

/* ---------------- إتمام الطلب ---------------- */
async function checkout() {
  const t = cartTotals();
  if (!state.cart.length || t.subtotal < MIN_ORDER_VALUE) return;

  if (!state.user) {
    openAuth('login', 'سجّل دخولك كموزع معتمد لإتمام الطلب');
    return;
  }

  const btn = $('checkoutBtn');
  btn.disabled = true;
  btn.textContent = 'جارٍ إرسال الطلب…';

  const order = {
    client_email: state.user.email,
    client_name: state.user.name,
    items: cartLines().map((l) => ({
      sku: l.p.sku,
      name: l.p.name,
      cartons: l.cartons,
      pieces: l.cartons * l.p.cartonSize,
      unit_price: l.p.unitPrice,
      line_total: cartonPrice(l.p) * l.cartons,
    })),
    total: t.subtotal,
    status: 'pending',
  };

  try {
    let ref;
    if (SUPABASE_READY) {
      const { error } = await supabase.from('orders').insert(order);
      if (error) throw new Error(errMsg(error));
      ref = 'OMR-B2B-' + Date.now().toString(36).toUpperCase().slice(-6);
    } else {
      await new Promise((r) => setTimeout(r, 600));
      ref = 'OMR-B2B-' + Math.random().toString(36).slice(2, 8).toUpperCase();
    }
    state.cart = [];
    saveCart();
    renderCart();
    renderGrid();
    closeCart();
    $('successRef').textContent = ref;
    $('successModal').classList.remove('hidden');
  } catch (err) {
    toast('تعذّر حفظ الطلب: ' + (err.message || 'خطأ غير متوقع'), 'bad');
  } finally {
    btn.textContent = 'إتمام الطلب';
    renderCart(); // يعيد حالة الزر حسب الحد الأدنى
  }
}

/* ---------------- السلة: فتح/إغلاق ---------------- */
function openCart() {
  $('cartDrawer').classList.remove('-translate-x-full');
  $('overlay').classList.remove('hidden');
}
function closeCart() {
  $('cartDrawer').classList.add('-translate-x-full');
  $('overlay').classList.add('hidden');
}

/* ---------------- التنبيهات ---------------- */
function toast(msg, type = 'info') {
  const colors = {
    ok: 'bg-ok text-black',
    bad: 'bg-bad text-white',
    warn: 'bg-warn text-black',
    info: 'bg-raised text-ink',
  };
  const el = document.createElement('div');
  el.className = `toast px-4 py-2.5 font-extrabold text-sm border-2 border-line shadow-bruteSm max-w-xs ${colors[type] || colors.info}`;
  el.textContent = msg;
  $('toasts').appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity .3s';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 320);
  }, 2600);
}

/* ---------------- التهيئة ---------------- */
function init() {
  /* الوضع التجريبي */
  $('demoBanner').classList.toggle('hidden', SUPABASE_READY);
  $('authDemoBox').classList.toggle('hidden', SUPABASE_READY);

  /* الفلاتر */
  const cf = $('categoryFilter');
  Object.entries(CATEGORIES).forEach(([id, name]) => {
    const o = document.createElement('option');
    o.value = id;
    o.textContent = name;
    cf.appendChild(o);
  });
  cf.onchange = (e) => { state.category = e.target.value; renderGrid(); };
  $('stockFilter').onchange = (e) => { state.stock = e.target.value; renderGrid(); };
  $('searchInput').oninput = (e) => { state.query = e.target.value; renderGrid(); };

  /* السلة */
  $('cartBtn').onclick = openCart;
  $('closeCart').onclick = closeCart;
  $('overlay').onclick = closeCart;
  $('clearCartBtn').onclick = clearCart;
  $('checkoutBtn').onclick = checkout;

  /* المصادقة */
  $('loginTab').onclick = () => setTab('login');
  $('signupTab').onclick = () => setTab('signup');
  $('authForm').onsubmit = handleAuth;
  $('closeAuth').onclick = closeAuth;
  $('authModal').addEventListener('click', (e) => { if (e.target === e.currentTarget) closeAuth(); });
  $('demoFill').onclick = () => {
    $('authEmail').value = 'demo@omran-b2b.com';
    $('authPassword').value = 'demo1234';
    $('authCompany').value = 'موزع تجريبي';
  };
  $('successClose').onclick = () => $('successModal').classList.add('hidden');

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeCart(); closeAuth(); }
  });

  /* استعادة الجلسة */
  if (SUPABASE_READY) {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user;
      if (u) setUser({ name: u.user_metadata?.company || u.email, email: u.email });
    });
    supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user;
      if (u) setUser({ name: u.user_metadata?.company || u.email, email: u.email });
      else clearUser();
    });
  } else {
    try {
      const u = JSON.parse(localStorage.getItem(USER_KEY));
      if (u && u.email) state.user = u;
    } catch { /* ignore */ }
  }

  renderUser();
  renderGrid();
  renderCart();
}

/* مقبض فحص/اختبار خارجي (قراءة حالة + إعادة عرض) */
window.__OMRAN_B2B__ = {
  get state() { return state; },
  renderCart,
  renderGrid,
  SUPABASE_READY,
};

document.addEventListener('DOMContentLoaded', init);
