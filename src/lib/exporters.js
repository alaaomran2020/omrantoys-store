// ============================================================
// OMRAN TOYS — Export & Reports
// تصدير حقيقي بالصيغ: CSV, JSON, TXT, Markdown, HTML, XLSX(HTML-based)
// و PDF عبر نافذة الطباعة (نهج حقيقي قابل للطباعة والمشاركة).
// لا تُنفَّذ أي صيغة بشكل وهمي.
// ============================================================

export function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeCsv(value) {
  const v = value === null || value === undefined ? '' : String(value);
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

export function toCSV(rows) {
  if (!rows || rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.map(escapeCsv).join(','),
    ...rows.map((r) => headers.map((h) => escapeCsv(r[h])).join(',')),
  ];
  // BOM لدعم العربية في Excel
  return '\uFEFF' + lines.join('\r\n');
}

export function toJSON(data, pretty = true) {
  return pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
}

export function toTXT(sections) {
  const parts = [];
  for (const s of sections || []) {
    parts.push(`====================`);
    parts.push(s.title);
    parts.push(`====================`);
    parts.push('');
    for (const line of s.lines || []) parts.push(line);
    parts.push('');
  }
  return parts.join('\n');
}

export function toMarkdown(sections) {
  const parts = [];
  for (const s of sections || []) {
    parts.push(`## ${s.title}`);
    parts.push('');
    if (s.table) {
      const rows = s.table;
      const headers = Object.keys(rows[0] || {});
      parts.push('| ' + headers.join(' | ') + ' |');
      parts.push('| ' + headers.map(() => '---').join(' | ') + ' |');
      rows.forEach((r) => parts.push('| ' + headers.map((h) => String(r[h] ?? '').replace(/\|/g, '/')).join(' | ') + ' |'));
      parts.push('');
    }
    for (const line of s.lines || []) parts.push('- ' + line);
    parts.push('');
  }
  return parts.join('\n');
}

export function toHTML(title, sections) {
  const rowsToHtml = (rows) => {
    if (!rows || rows.length === 0) return '';
    const headers = Object.keys(rows[0]);
    return (
      `<table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>` +
      rows.map((r) => `<tr>${headers.map((h) => `<td>${r[h] ?? ''}</td>`).join('')}</tr>`).join('') +
      `</tbody></table>`
    );
  };
  const body = sections
    .map(
      (s) => `
      <section>
        <h2>${s.title}</h2>
        ${s.table ? rowsToHtml(s.table) : ''}
        ${s.lines ? `<ul>${s.lines.map((l) => `<li>${l}</li>`).join('')}</ul>` : ''}
      </section>`
    )
    .join('');
  return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>${title}</title>
  <style>body{font-family:Cairo,Arial,sans-serif;padding:24px;color:#1e293b;background:#fff}
  h1{color:#FF4D6D}table{border-collapse:collapse;width:100%;margin:10px 0 20px}
  th,td{border:1px solid #e2e8f0;padding:8px 10px;text-align:right;font-size:13px}
  th{background:#f1f5f9}section{margin-bottom:20px}</style></head>
  <body><h1>${title}</h1>${body}</body></html>`;
}

/** XLSX عبر جدول HTML (يفتح في Excel مباشرة) — نهج حقيقي بدون مكتبات ثقيلة */
export function toXLSX(title, sections) {
  return toHTML(title, sections);
}

export function exportProducts(products, format) {
  const rows = products.map((p) => ({
    id: p.id,
    name: p.name,
    nameEn: p.nameEn || '',
    sku: p.sku || '',
    category: p.category || '',
    brand: p.brand || '',
    price: p.price ?? p.retail_price ?? '',
    originalPrice: p.originalPrice ?? p.original_price ?? '',
    discountPercent: p.discountPercent ?? '',
    stock: p.stock ?? '',
    ageGroup: p.ageGroup || '',
    isVisible: p.is_visible === false ? 'hidden' : 'active',
    featured: p.isFeatured ? 'yes' : 'no',
    description: p.description || '',
  }));
  const base = `omran-products`;
  exportRows(rows, format, base);
}

export function exportRows(rows, format, base) {
  const date = new Date().toISOString().slice(0, 10);
  const filename = `${base}-${date}`;
  if (format === 'csv') return downloadBlob(toCSV(rows), `${filename}.csv`, 'text/csv;charset=utf-8');
  if (format === 'json') return downloadBlob(toJSON(rows), `${filename}.json`, 'application/json');
  if (format === 'txt') {
    const sections = [{ title: base, lines: rows.map((r) => Object.entries(r).map(([k, v]) => `${k}: ${v}`).join(' | ')) }];
    return downloadBlob(toTXT(sections), `${filename}.txt`, 'text/plain;charset=utf-8');
  }
  if (format === 'md') {
    const sections = [{ title: base, table: rows }];
    return downloadBlob(toMarkdown(sections), `${filename}.md`, 'text/markdown;charset=utf-8');
  }
  if (format === 'html') {
    return downloadBlob(toHTML(base, [{ title: base, table: rows }]), `${filename}.html`, 'text/html;charset=utf-8');
  }
  if (format === 'xlsx') {
    return downloadBlob(toXLSX(base, [{ title: base, table: rows }]), `${filename}.xls`, 'application/vnd.ms-excel');
  }
  if (format === 'pdf') {
    printReport(base, [{ title: base, table: rows }]);
  }
  return null;
}

/** تقرير PDF عبر نافذة الطباعة (نهج حقيقي ومناسب للمشاركة/الطباعة) */
export function printReport(title, sections) {
  const html = toHTML(title, sections);
  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
}

export function exportSiteData(products, settings, events) {
  const data = {
    exportedAt: new Date().toISOString(),
    settings,
    products,
    events,
    stats: {
      products: products.length,
      active: products.filter((p) => p.stock > 0).length,
      events: events.length,
    },
  };
  downloadBlob(toJSON(data), `omran-full-export-${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
}

export function downloadJSON(data, base) {
  downloadBlob(toJSON(data), `${base}-${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
}
