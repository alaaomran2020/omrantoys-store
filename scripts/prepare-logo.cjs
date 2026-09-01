/**
 * تجهيز شعار المتجر:
 * 1) إزالة الخلفية الفاتحة (flood fill من الحدود حتى لا تتأثر الأجزاء الفاتحة داخل الشعار)
 * 2) قص الحواف الفارغة حول المحتوى
 * 3) توليد كل المقاسات المعتمدة في public/brand
 *
 * الاستخدام:
 *   npm i -D sharp
 *   node scripts/prepare-logo.cjs public/brand/logo-original.png
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SRC = process.argv[2] || 'public/brand/logo-original.png';
const OUT = 'public/brand';

// عتبات اكتشاف الخلفية (فاتح + قليل التشبع)
const MIN_CHANNEL = 205;
const MAX_SATURATION = 30;
const MIN_MAX = 225;

(async () => {
  if (!fs.existsSync(SRC)) throw new Error(`الملف غير موجود: ${SRC}`);

  const { width: W, height: H } = await sharp(SRC).metadata();
  const { data } = await sharp(SRC).raw().toBuffer({ resolveWithObject: true });
  const at = (x, y) => { const i = (y * W + x) * 3; return [data[i], data[i + 1], data[i + 2]]; };
  const isBg = (x, y) => {
    const [r, g, b] = at(x, y);
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    return min > MIN_CHANNEL && (max - min) < MAX_SATURATION && max > MIN_MAX;
  };

  // فيض من حدود الصورة
  const bg = new Uint8Array(W * H);
  const stack = [];
  for (let x = 0; x < W; x++) stack.push([x, 0], [x, H - 1]);
  for (let y = 0; y < H; y++) stack.push([0, y], [W - 1, y]);
  while (stack.length) {
    const [x, y] = stack.pop();
    if (x < 0 || y < 0 || x >= W || y >= H) continue;
    const idx = y * W + x;
    if (bg[idx] || !isBg(x, y)) continue;
    bg[idx] = 1;
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }

  // حدود المحتوى
  let minX = W, minY = H, maxX = -1, maxY = -1;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (!bg[y * W + x]) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) throw new Error('لم يتم العثور على محتوى بعد إزالة الخلفية - راجع عتبات الألوان');

  const bw = maxX - minX + 1, bh = maxY - minY + 1;
  console.log(`المحتوى: ${bw}×${bh} من ${W}×${H}`);

  // قناع ألفا مع تنعيم بسيط للحواف
  const alpha = Buffer.alloc(W * H);
  for (let i = 0; i < W * H; i++) alpha[i] = bg[i] ? 0 : 255;
  const mask = await sharp(alpha, { raw: { width: W, height: H, channels: 1 } }).blur(0.7).png().toBuffer();

  const cropped = await sharp(SRC)
    .joinChannel(mask)
    .extract({ left: minX, top: minY, width: bw, height: bh })
    .png()
    .toBuffer();

  const fit = (size) => ({ fit: 'contain', background: '#00000000', width: size, height: size });

  const master = await sharp(cropped)
    .resize(fit(512))
    .png({ palette: true, colours: 160, effort: 10, compressionLevel: 9 })
    .toBuffer();
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, 'logo.png'), master);

  const sizes = { 'logo-256.png': 256, 'apple-touch-icon.png': 180, 'favicon.png': 64, 'favicon-32.png': 32 };
  for (const [name, size] of Object.entries(sizes)) {
    fs.writeFileSync(path.join(OUT, name), await sharp(master).resize(fit(size)).png().toBuffer());
  }

  // favicon.svg يغلّف نسخة 64 كـ data URI
  const b64 = fs.readFileSync(path.join(OUT, 'favicon.png')).toString('base64');
  fs.writeFileSync('public/favicon.svg',
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 64 64" width="64" height="64">\n  <image width="64" height="64" xlink:href="data:image/png;base64,${b64}"/>\n</svg>\n`);

  console.log(`✔ تم التحديث - logo.png ${(master.length / 1024).toFixed(0)} كيلوبايت`);
})();
