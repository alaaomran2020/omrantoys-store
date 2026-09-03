# تقرير Stabilization + Architecture Cleanup — `omrantoys-store`

**التاريخ:** 2026-09-03  
**النطاق:** تدقيق قبل التعديل (Read-only audit)  
**مصدر التطوير:** نسخة `omrantoys-store-main.zip` + حالة مستودع GitHub `alaaomran2020/omrantoys-store`  
**مرجع المقارنة فقط:** `omran-store-live-main.zip` + `alaaomran2020/omran-store-live`  
**قاعدة الأمان:** لم تُجرَ أي تغييرات وظيفية على `omran-store-live`، ولم يُعدّل أي ملف مصدر في `omrantoys-store` أثناء هذا التدقيق.

## النتيجة التنفيذية

الكود **يبني بنجاح** ويمر من `oxlint`، واختبارات D1 المحلية الحالية تمر (`15/15`). لكن المشروع **غير مستقر معماريًا للنشر** بسبب تعارض ملكية `/api/*`، حلقة استدعاء ذاتي محتملة في بوابة المنتجات، اختلاف عقد استجابة المنتجات بين الواجهة وD1 Worker، وعدم وجود حقول أو إنفاذ لبوابة النشر `active=true + PUBLISHED + PASS` في مخطط D1 ومساراته العامة.

**قرار المرحلة:** لا ينبغي ترقية `omrantoys-store` إلى Production بصورته الحالية. يبدأ الإصلاح على فرع Stabilization مستقل، ويظل `omran-store-live` بلا تغيير وظيفي حتى اجتياز بوابات التحقق.

## خط الأساس المثبت

| الفحص | النتيجة | الملاحظة |
|---|---:|---|
| `npm ci` | PASS | 150 حزمة ثبتت من lockfile |
| `npm run lint` | PASS | نجاح `oxlint`، لكنه لا يغطي عقود API أو التدفق المعماري |
| `npm run build` | PASS | JS رئيسي `760.38 kB` / `203.08 kB gzip`؛ لا يوجد code splitting فعلي |
| `npm run db:d1:test` | PASS | 15 ناجح / 0 فاشل، لكن الاختبارات لا تغطي بوابة النشر الجديدة |
| `node --check` لمسارات Worker/API | PASS | صحة نحوية فقط |
| فحص أنماط الأسرار | PASS | لم تظهر مفاتيح خاصة معروفة داخل الملفات المفحوصة |
| اختبارات وحدات/تكامل حقيقية | FAIL | لا يوجد `test` script؛ بوابة CI تعتمد غالبًا على regex/assertions على النص |
| Type checking | N/A | المشروع JavaScript/JSX ولا توجد بوابة TypeScript أو JSDoc checking |

## الأخطاء الحرجة حسب الأولوية

| ID | الشدة | الملفات | الخطأ | الأثر |
|---|---|---|---|---|
| C-01 | Critical | `functions/api/products.js`, `.github/workflows/deploy-pages.yml` | دالة Pages على `/api/products` تستدعي `https://omrantoys.store/api/products` أولًا؛ إذا كانت Pages هي المالكة للمسار فهذا استدعاء ذاتي متكرر حتى timeout. | منتجات فارغة/502، ضغط طلبات متضاعف، وفشل غير حتمي حسب ترتيب Routes. |
| C-02 | Critical | `functions/api/products.js`, `worker/index.js`, `src/lib/productEngine.js` | الواجهة تتطلب `{status:'ok', products:[...]}`؛ D1 Worker يعيد `{success:true, products:[...]}`. | الرد الصحيح من D1 يُرفض كأنه غير صالح. |
| C-03 | Critical | `migrations/0001_init.sql`, `cloudflare/d1-schema.sql`, `worker/index.js` | لا توجد `workflow_status` أو `qa_status` في جدول D1، والمسار العام يرشح `is_active=1` فقط. | لا يمكن إثبات أو إنفاذ `active=true + PUBLISHED + PASS`؛ احتمال نشر صفوف غير مراجعة. |
| C-04 | Critical | `wrangler.toml`, `package.json`, `.github/workflows/deploy-pages.yml` | ثلاث صور ملكية متعارضة للنشر: Worker + Assets في `wrangler.toml`، Pages + Functions في workflow، واسم script `deploy:legacy-worker`. | نفس الكود قد يعمل بعقود مختلفة حسب أمر النشر، مع خطر استحواذ Worker على الواجهة أو فقدان Admin API. |
| H-01 | High | `src/lib/productEngine.js` | Adapter يمرر `workflowStatus` و`qaStatus` لكنه لا يرفض المنتج غير المنشور؛ يرشح `active` فقط. | الاعتماد الكامل على upstream رغم أن هدف المشروع Fail-Closed. |
| H-02 | High | `src/context/StoreContext.jsx` | cache بلا version/TTL/signature؛ أي cache قديم من Product Engine يبقى قابلًا للعرض بلا انتهاء. | منتجات مسحوبة أو تغيرت حالتها قد تستمر على جهاز العميل. |
| H-03 | High | `src/context/StoreContext.jsx`, `src/components/admin/**` | يوجد نظاما Admin مختلفان: Admin حقيقي عبر Worker وControl Center محلي يعدل state/localStorage فقط. | واجهة توحي بنجاح تعديلات لم تصل لقاعدة البيانات. |
| H-04 | High | `src/context/StoreContext.jsx`, `CheckoutModal.jsx` | الطلبات تُنشأ محليًا داخل `localStorage` ولا يظهر إرسال موثوق إلى API قبل اعتبار الطلب منشأ. | فقدان طلبات واختلاف حالة العميل عن النظام الخلفي. |
| H-05 | High | `worker/whatsapp.js` | `isDevMode()` يعود true تلقائيًا عند غياب WhatsApp token؛ حماية الإنتاج تعتمد على صحة الأسرار بدل fail-closed صريح. | خطر إظهار OTP في السجلات/الاستجابة إذا فُعل `AUTH_DEV_MODE` أو أخطئت البيئة. |
| H-06 | High | `supabase/schema.sql`, `src/lib/supabaseClient.js`, D1 files | مصدران خلفيان كاملان (Supabase وD1) بعقود وأنواع مختلفة، دون قرار Source of Truth منفذ. | schema drift وصعوبة الصيانة واحتمال الكتابة لمصدر والقراءة من آخر. |
| M-01 | Medium | `.github/workflows/pr-quality.yml` | “Regression tests” تفحص وجود نصوص وregex، لا تنفذ سلوك API أو React. | نجاح CI كاذب عند كسر السلوك مع بقاء النص. |
| M-02 | Medium | `.github/workflows/deploy-pages.yml` | النشر يحدث على كل push إلى `main` من غير staging promotion أو artifact immutability. | صعوبة rollback ومزج التحقق بالنشر المباشر. |
| M-03 | Medium | `vite.config.js`, `src/App.jsx` | لا يوجد route-level lazy loading؛ الحزمة الرئيسية 203 kB gzip. | تحميل أولي أثقل خصوصًا على الهاتف. |
| M-04 | Medium | `public/imported/*.png` | خمس صور كبيرة جدًا، قرابة 4–5.4 MB للصورة. | بطء LCP واستهلاك بيانات مرتفع. |
| M-05 | Medium | `cloudflare/d1-schema.sql` | يبدأ بـDROP شامل ومناسب لإعادة التهيئة لا migration إنتاجي. | تشغيل الأمر الخطأ على remote قد يمحو البيانات. |
| M-06 | Medium | `.env.example`, `src/lib/paymentGateways.js` | مفاتيح Paymob/Fawry موصوفة كـ`VITE_*`، ما يعني تضمينها في المتصفح إن استُخدمت. | تسريب أسرار مزود الدفع؛ يجب أن تبقى العمليات السرية خلف API. |
| L-01 | Low | `project.zip`, `src/assets/react.svg`, `src/assets/vite.svg` | مخلفات/أصول template داخل الريبو. | ضوضاء وزيادة احتمالات الالتباس. |
| L-02 | Low | `README.md`, التعليقات | أجزاء من الوثائق تصف أكثر من معمارية حالية. | onboarding وتشغيل غير موثوقين. |

## تدقيق ملفًا بملف

### الجذر، الإعدادات، والنشر

| الملف | الحالة | الملاحظة المطلوبة |
|---|---|---|
| `.env.example` | MODIFY | فصل public env عن secrets، إزالة أي تصور أن مفاتيح الدفع السرية تصلح كـ`VITE_*`، وإضافة تحقق Production fail-closed. |
| `.gitignore` | REVIEW | التأكد من تجاهل `dist/`, `.wrangler/`, `.dev.vars`, وملفات البيئة المحلية. |
| `README.md` | REWRITE | توثيق Source of Truth واحد، أوامر dev/test/deploy، وحدود الريبو مقابل Live. |
| `brand-spec.md` | KEEP | لا علاقة مباشرة بالاستقرار؛ يحفظ كمرجع هوية. |
| `index.html` | MODIFY | مراجعة metadata/CSP/bootstrap فقط؛ لا خطأ تجميع حالي. |
| `package.json` | MODIFY | إضافة `test`, `check`, وفصل واضح `deploy:staging`/`promote`; إزالة غموض Pages مقابل Worker. |
| `package-lock.json` | KEEP/REGENERATE | يبقى مصدر تثبيت npm، ويعاد توليده فقط عند تغيير dependencies. |
| `postcss.config.js` | KEEP | لا خطأ مثبت. |
| `tailwind.config.js` | REVIEW | مراجعة content paths وعدم تضمين مسارات غير مستخدمة. |
| `vite.config.js` | MODIFY | code splitting، proxy صريح لمصدر API محلي واحد، ومنع `allowedHosts: true` بلا حاجة. |
| `wrangler.toml` | CRITICAL MODIFY | تحديد ملكية API-only أو full Worker بصورة واحدة؛ لا يبقى متعارضًا مع Pages workflow. |
| `project.zip` | REMOVE | أرشيف مكرر داخل المصدر وغير مطلوب للبناء. |

### GitHub Actions

| الملف | الحالة | الملاحظة المطلوبة |
|---|---|---|
| `.github/workflows/deploy-pages.yml` | CRITICAL MODIFY | منع self-routing، إضافة tests حقيقية وstaging gate، وتحديد مصدر API لا يملكه نفس Pages Function. |
| `.github/workflows/pr-quality.yml` | MODIFY | استبدال regex tests باختبارات runtime لعقد المنتج، filtering، timeout، cache، والـgateway. |

### Product Engine وواجهات API

| الملف | الحالة | الملاحظة المطلوبة |
|---|---|---|
| `functions/api/products.js` | CRITICAL REWRITE | إزالة primary self-call، endpoint عبر env/binding واضح، timeout مستقل لكل محاولة، وإنفاذ العقد/بوابة النشر. |
| `src/lib/productEngine.js` | CRITICAL MODIFY | validator schema فعلي، إنفاذ `active/PUBLISHED/PASS`، وتوحيد أسماء الحقول. |
| `worker/index.js` | CRITICAL MODIFY | توحيد envelope إلى `status:'ok'`، إضافة publication gate، pagination metadata، وأخطاء متسقة. |
| `worker/admin.js` | MODIFY | ربط الحقول الإدارية بالمخطط النهائي، اختبارات صلاحيات وتزامن، وعدم فرض سعر معروف على منتج inquiry-only إن كانت هذه قاعدة العمل. |
| `worker/auth.js` | MODIFY | إلزام `AUTH_PEPPER` في Production، اختبار cookie flags/rate limits، وتحديد trusted proxy/IP. |
| `worker/whatsapp.js` | MODIFY | Production fail-closed عند نقص الإعدادات، توحيد Meta template payload، وعدم تسجيل OTP خارج dev مصرح. |

### السياق والبيانات والمكتبات

| الملف | الحالة | الملاحظة المطلوبة |
|---|---|---|
| `src/context/StoreContext.jsx` | CRITICAL REFACTOR | تفكيك catalog/cart/order/UI state، cache version+TTL، وإزالة admin mutations المحلية المضللة. |
| `src/context/AuthContext.jsx` | MODIFY | اختيار D1 أو Supabase للعملاء؛ منع dual-write الصامت وإضافة validation/rate/error states. |
| `src/lib/supabaseClient.js` | REMOVE أو ISOLATE | لا يبقى في production path إن كان D1/Worker هو المصدر المعتمد. |
| `src/data/products.js` | ARCHIVE/TEST FIXTURE | لا يستخدم fallback؛ ينقل إلى fixtures أو archive حتى لا يبدو Source of Truth. |
| `src/data/categories.js` | MODIFY | توحيد taxonomy مع قاعدة البيانات بدل قائمة منفصلة قابلة للانحراف. |
| `src/lib/adminAuth.js` | MODIFY | توحيد error contract وCSRF/origin behavior واختبارات session expiry. |
| `src/lib/adminUtils.js` | REVIEW | حسابات الصحة تعتمد جزئيًا على local state؛ يجب ربطها بالمصدر الحقيقي. |
| `src/lib/analytics.js` | MODIFY | إخراج transport موثوق، consent/privacy، وتعريف product_id/SKU/category موحد. |
| `src/lib/exporters.js` | REVIEW | منع تصدير حقول غير موثقة وتمييز المصدر/وقت الالتقاط. |
| `src/lib/paymentGateways.js` | SECURITY REWRITE | لا توقيع أو secret داخل المتصفح؛ إنشاء intent والتحقق خلف API فقط. |
| `src/lib/settings.js` | MODIFY | localStorage مناسب للتفضيلات فقط، لا لإعدادات تشغيل/تجارة يفترض أن تكون مشتركة. |
| `src/lib/shippingCalculator.js` | MODIFY | توحيد قواعد الشحن مع Backend وإضافة اختبارات حدود وأوزان/محافظات. |

### نقطة الدخول والواجهات الأساسية

| الملف | الحالة | الملاحظة المطلوبة |
|---|---|---|
| `src/main.jsx` | KEEP | نقطة دخول سليمة؛ يضاف Error Boundary في المستوى الأعلى. |
| `src/App.jsx` | MODIFY | lazy-load لمسار Admin والـmodals، واعتماد router واضح بدل hash parsing اليدوي. |
| `src/App.css` | REVIEW | دمج/حذف التكرار مع `index.css` بعد visual regression. |
| `src/index.css` | REVIEW | لا تغيير قبل visual baseline؛ مراجعة accessibility وreduced motion. |
| `src/assets/hero.png` | OPTIMIZE | الملف غير ثنائي فعليًا في snapshot (محتوى نصي/placeholder بحسب الحجم)؛ التحقق والاستبدال بأصل صحيح. |
| `src/assets/react.svg` | REMOVE | مخلف template فارغ. |
| `src/assets/vite.svg` | REMOVE | مخلف template صغير/غير مستخدم. |

### واجهة المتجر

| الملف | الحالة | الملاحظة المطلوبة |
|---|---|---|
| `src/components/layout/Header.jsx` | REVIEW | فصل البحث/التنقل وتقليل حجم المكون؛ اختبار الهاتف وRTL. |
| `src/components/layout/Footer.jsx` | REVIEW | توحيد بيانات الاتصال من config واحد. |
| `src/components/layout/MobileBottomNav.jsx` | REVIEW | accessibility وحالة الـmodals. |
| `src/components/layout/StoreFeaturesBanner.jsx` | KEEP/REVIEW | محتوى ثابت؛ تحقق claims قبل النشر. |
| `src/components/home/HeroBanner.jsx` | OPTIMIZE | media responsive وLCP وحجم الصورة. |
| `src/components/home/CategoryShowcase.jsx` | MODIFY | taxonomy من المصدر المعتمد، لا ملف ثابت مستقل. |
| `src/components/home/NewProductsSection.jsx` | REVIEW | يعتمد على flags لا يملؤها adapter حاليًا، فتظل النتيجة فارغة غالبًا. |
| `src/components/home/FlashDeals.jsx` | REVIEW | adapter يضع discount=0 دائمًا؛ القسم غير متصل فعليًا بعقد Product Engine. |
| `src/components/home/ComingSoonSection.jsx` | REVIEW | محتوى ثابت؛ لا خطأ حرج. |
| `src/components/home/ImportedProductsSection.jsx` | REMOVE أو INTEGRATE | مكون غير ظاهر في `App.jsx` ويكرر مفهوم المنتجات المستوردة. |
| `src/components/home/PoliciesSection.jsx` | VERIFY COPY | تحقق من صحة سياسات الشحن/الاسترجاع قبل اعتبارها claims. |
| `src/components/home/FaqSection.jsx` | VERIFY COPY | نفس الملاحظة؛ لا خطأ تقني حرج مثبت. |
| `src/components/product/ProductGrid.jsx` | MODIFY | التعامل الصريح مع loading/degraded/empty، وعدم مساواة فشل API بعدم وجود منتجات. |
| `src/components/product/ProductCard.jsx` | MODIFY | حالات السعر/المخزون المجهول واختبارات CTA/analytics. |
| `src/components/product/ProductDetailModal.jsx` | MODIFY | مشاركة URL لا تحمل product route ثابتًا؛ accessibility/focus management. |
| `src/components/product/AdvancedFilters.jsx` | MODIFY | filters لحقول يفرغها adapter (`brand`, `ageGroup`)؛ مزامنة العقد مطلوبة. |
| `src/components/product/StockNotification.jsx` | MODIFY | التأكد من persistence/API بدل state محلي فقط. |
| `src/components/cart/CartDrawer.jsx` | MODIFY | cart item snapshots قد تصبح stale؛ revalidate قبل checkout. |
| `src/components/checkout/CheckoutModal.jsx` | CRITICAL MODIFY | إرسال الطلب إلى Backend idempotently قبل النجاح؛ عدم الاكتفاء بـlocalStorage. |
| `src/components/common/FloatingWhatsApp.jsx` | MODIFY | event payload موحد مع product/context عند الإمكان. |
| `src/components/common/CustomerSignupModal.jsx` | MODIFY | توحيد lead endpoint والعقد مع بيئة النشر المختارة. |
| `src/components/common/LiveSalesNotification.jsx` | REMOVE أو BACKEND | لا تعرض نشاط مبيعات تمثيلي/محلي كحدث حقيقي. |
| `src/components/common/OrderTrackingModal.jsx` | MODIFY | الطلبات المحلية ليست مصدرًا صالحًا للتتبع الإنتاجي. |
| `src/components/common/WishlistModal.jsx` | REVIEW | local-only مقبول كميزة جهاز؛ وضح عدم المزامنة. |
| `src/components/common/Toast.jsx` | KEEP/REVIEW | لا خطأ حرج؛ إضافة aria-live إن لم تكن موجودة. |

### نظاما الإدارة

| الملف | الحالة | الملاحظة المطلوبة |
|---|---|---|
| `src/admin/AdminApp.jsx` | KEEP AS CANONICAL | هذا مسار الإدارة الحقيقي المرشح؛ يوحد routing/error boundary. |
| `src/admin/AdminLoginPage.jsx` | MODIFY | اختبارات OTP، حالات provider، rate-limit، وعدم إظهار تفاصيل حساسة. |
| `src/admin/AdminProductsPage.jsx` | MODIFY | schema موحد وpagination/error/loading. |
| `src/admin/EditProductPage.jsx` | MODIFY | مطابقة حقول publication gate وinquiry-only، مع optimistic concurrency. |
| `src/admin/ui.jsx` | CONSOLIDATE | يوجد أيضًا `src/components/admin/ui.jsx`؛ اختيار design system واحد. |
| `src/components/admin/AdminDashboardModal.jsx` | REMOVE/REDIRECT | بوابة لنظام Control Center المحلي؛ تسبب ازدواج الإدارة. |
| `src/components/admin/ControlCenter.jsx` | DEPRECATE | يعتمد على state/localStorage وليس قاعدة البيانات. |
| `src/components/admin/BulkImport.jsx` | MODIFY | validation حقيقي، preview، dry-run، ومصدر كتابة واحد. |
| `src/components/admin/ui.jsx` | CONSOLIDATE | يتداخل مع `src/admin/ui.jsx`. |
| `src/components/admin/sections/Overview.jsx` | REWIRE | الإحصاءات محلية وليست production metrics. |
| `src/components/admin/sections/Products.jsx` | DEPRECATE/REWIRE | عمليات CRUD محلية؛ لا تعتبر إدارة حقيقية. |
| `src/components/admin/sections/Media.jsx` | REWIRE | media state محلي؛ يحتاج storage/backend. |
| `src/components/admin/sections/Design.jsx` | LOCAL PREFERENCES ONLY | لا يوحي بأنه يغير الموقع المنشور ما لم يوجد backend/config deploy. |
| `src/components/admin/sections/Control.jsx` | REWIRE | إجراءات التشغيل يجب أن تكون APIs مصرحًا بها ومراقبة. |
| `src/components/admin/sections/Health.jsx` | REWIRE | health مبني على client state؛ يلزم `/api/health` الحقيقي. |
| `src/components/admin/sections/Analytics.jsx` | REWIRE | لا تعتمد على event log محلي كتحليلات المتجر. |
| `src/components/admin/sections/Visibility.jsx` | REWIRE | visibility يجب أن تكتب Source of Truth وتخضع publication gate. |
| `src/components/admin/sections/Data.jsx` | REWIRE | توضيح المصدر ومنع استعادة محلية فوق كتالوج محرك المنتجات. |
| `src/components/admin/sections/Export.jsx` | REVIEW | التصدير من source snapshot موثق، لا من state مختلط. |
| `src/components/admin/sections/Backup.jsx` | DEPRECATE | backup في localStorage ليس نسخة احتياطية تشغيلية. |
| `src/components/admin/sections/Import.jsx` | REWIRE | حاليًا واجهة/مدخل محلي؛ يحتاج server validation وaudit. |
| `src/components/admin/sections/Orders.jsx` | REWIRE | الطلبات المحلية ليست نظام طلبات إنتاجي. |
| `src/components/admin/sections/Settings.jsx` | REWIRE | فصل تفضيلات الجهاز عن إعدادات المتجر المشتركة. |

### قواعد البيانات، migrations، والاختبارات

| الملف | الحالة | الملاحظة المطلوبة |
|---|---|---|
| `migrations/0001_init.sql` | CRITICAL MODIFY | إضافة publication fields/constraints/indexes أو استبداله بمخطط canonical جديد دون تعديل migration مطبق تاريخيًا. |
| `migrations/0002_b2b_articles.sql` | REVIEW | خارج الأولوية الحالية؛ لا يدخل متجر الأطفال العام بلا حاجة مثبتة. |
| `migrations/0003_admin_whatsapp_auth.sql` | MODIFY | إضافة قيود/فهارس واختبارات lifecycle للتحديات والجلسات. |
| `cloudflare/d1-schema.sql` | DEV-ONLY | يحتوي DROP شامل؛ وسمه بوضوح ومنع remote execution في scripts. |
| `cloudflare/d1-seed-products.sql` | REGENERATE | seed من fixture موثق وبحقول publication gate، لا من catalog قديم. |
| `cloudflare/d1-tests.sql` | EXPAND | إضافة اختبارات `PUBLISHED/PASS/active`، contracts، وinquiry-only. |
| `cloudflare/test-d1.sh` | MODIFY | عزل أسرع، cleanup مضمون، واختبار migrations الفعلية لا schema reset فقط. |
| `cloudflare/D1-TEST-REPORT.md` | REGENERATE | تقرير مولد من CI مع commit SHA بدل نتيجة ثابتة قابلة للتقادم. |
| `supabase/schema.sql` | ARCHIVE أو REMOVE | لا يبقى مخططًا تشغيليًا موازيًا إذا اعتمد D1. |
| `scripts/seed-d1-products.mjs` | MODIFY | لا يولد من `src/data/products.js` كمرجع تجاري؛ استخدم source موثق وvalidation. |
| `scripts/prepare-logo.cjs` | KEEP/ISOLATE | أداة أصول؛ لا تدخل production pipeline إلا عند تغيير الهوية. |

### الأصول العامة والوثائق

| الملف/المجموعة | الحالة | الملاحظة المطلوبة |
|---|---|---|
| `public/imported/omran-product-01.png` | OPTIMIZE | ~4.3 MB؛ تحويل WebP/AVIF وأبعاد responsive دون تغيير تصميم المنتج. |
| `public/imported/omran-product-02.png` | OPTIMIZE | ~5.1 MB. |
| `public/imported/omran-product-03.png` | OPTIMIZE | ~3.9 MB. |
| `public/imported/omran-product-04.png` | OPTIMIZE | ~4.1 MB. |
| `public/imported/omran-product-05.png` | OPTIMIZE | ~5.4 MB. |
| `public/brand/logo-original.png` | KEEP SOURCE | أصل مرجعي؛ لا يقدم مباشرة للويب بالحجم الكامل. |
| `public/brand/logo.png` | REVIEW | تحقق dimensions/format/cache. |
| `public/brand/logo-256.png` | KEEP/OPTIMIZE | لا خطأ حرج. |
| `public/brand/favicon.png`, `favicon-32.png`, `apple-touch-icon.png` | KEEP | تحقق فقط من manifest وMIME. |
| `public/favicon.svg` | REVIEW | تجنب هوية مزدوجة مع PNG. |
| `public/icons.svg` | REVIEW | تحقق من الاستخدام الفعلي وإزالة الرموز الميتة. |
| `public/manifest.webmanifest` | MODIFY | تحقق start_url/icons/theme/name وPWA behavior. |
| `docs/STOREFRONT-PRODUCT-ENGINE-AUDIT.md` | SUPERSEDE | يُربط بهذا التقرير ويُحدّث بعد الإصلاح. |
| `docs/TARGET-ARCHITECTURE.md` | MODIFY | تحويله إلى قرار منفذ: ownership matrix + source of truth + promotion flow. |
| `docs/database-schema.md` | MODIFY | مطابقته بالمخطط canonical بعد القرار. |
| `docs/whatsapp-auth-architecture.md` | MODIFY | توثيق fail-closed، الأسرار، rollback، وبيئة الاختبار. |

## مقارنة الدور مع `omran-store-live` (دون تعديل)

| البند | `omrantoys-store` | `omran-store-live` | القرار |
|---|---|---|---|
| الواجهة | Vite React JS + Pages | Vite React TS + Pages/Node build | التطوير يبدأ في الأساسي، لكن لا نسخ عشوائي بين معماريتين. |
| API | D1 Worker + Pages Function + Supabase remnants | Edge Worker + VPS origin/MySQL | يلزم عقد واحد وحدود ملكية واضحة قبل الترقية. |
| Product Source | متعارض بين D1/Google Sheet gateway/static archive | Google Sheet publication gate + origin | اعتماد Contract محايد أولًا ثم adapter لكل بيئة. |
| Admin | نظام Worker حقيقي + Control Center محلي | Server/MySQL admin | اختيار مسار canonical واحد في الأساسي. |
| Production ownership | غير محسوم | Live يوثق Pages للواجهة وWorker للـAPI | لا تغيير Live حتى نجاح staging في الأساسي. |

## خطة الإصلاح المعتمدة بعد التقرير

1. **S0 — Freeze & Baseline:** فرع `stabilization/architecture-cleanup`، إضافة هذا التقرير، وتثبيت اختبارات العقد الحالية.
2. **S1 — Ownership:** اختيار Pages للواجهة وAPI Worker بمسار/hostname صريح غير دائري؛ إزالة self-call وغموض أوامر النشر.
3. **S2 — Product Contract:** schema واحد لـProduct Engine؛ إنفاذ `active=true + workflowStatus=PUBLISHED + qaStatus=PASS` في المصدر والبوابة والعميل.
4. **S3 — Data Source:** اعتماد مصدر تشغيل واحد في الريبو؛ عزل Supabase/static archive، وترحيل آمن غير هدّام.
5. **S4 — Admin & Orders:** إزالة الإدارة المحلية المضللة، جعل CRUD/Orders/Backups server-backed، وإضافة idempotency/audit.
6. **S5 — Security:** production env validation، OTP fail-closed، payment secrets server-only، واختبارات auth/rate-limit.
7. **S6 — Performance & QA:** lazy loading، ضغط الصور، accessibility، mobile/RTL، واختبارات E2E.
8. **S7 — Promotion Gate:** staging مستقل، parity tests للعقد، rollback موثق، ثم فقط إعداد ترقية إلى `omran-store-live` دون تغييره قبل الموافقة.

## معايير السماح بالترقية

- لا يوجد request من `/api/products` إلى نفسه.
- apex وwww يعيدان نفس build، وAPI له مالك واحد واضح.
- كل منتج عام يحقق `active === true`, `workflowStatus === 'PUBLISHED'`, `qaStatus === 'PASS'`.
- failure modes تعيد JSON صريحًا ولا تعرض catalog قديمًا بلا TTL.
- lint + build + unit + integration + contract + E2E ناجحة.
- Admin mutations والطلبات مثبتة بقراءة لاحقة من المصدر الحقيقي.
- لا أسرار دفع/مصادقة ضمن bundle.
- تقرير staging وrollback مكتملان قبل أي تغيير وظيفي في Live.

## الخلاصة

التقييم الحالي لـ`omrantoys-store`: **البناء سليم، لكن الاستقرار المعماري غير مكتمل**. أعلى أولوية ليست تحسين التصميم أو إضافة المنتجات؛ بل حل ملكية API وعقد المنتجات وبوابة النشر، ثم توحيد مصدر البيانات والإدارة. يبقى `omran-store-live` مرجعًا ولا يُعدل وظيفيًا في هذه المرحلة.
