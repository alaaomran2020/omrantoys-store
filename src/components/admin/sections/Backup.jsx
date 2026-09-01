import React, { useState } from 'react';
import { DatabaseBackup, Download, Trash2, RotateCcw, Plus, Clock } from 'lucide-react';
import { SectionHeader, Card, CardHeader, Button, EmptyState, ConfirmDialog, Badge } from '../ui';
import { getSettings } from '../../../lib/settings';
import { downloadJSON } from '../../../lib/exporters';

const BACKUP_KEY = 'omran_toys_backups';

export default function Backup({ ctx }) {
  const { products, orders, notify, restore } = ctx;
  const [confirmRestore, setConfirmRestore] = useState(null);

  const getBackups = () => {
    try { return JSON.parse(localStorage.getItem(BACKUP_KEY) || '[]'); } catch { return []; }
  };
  const [backups, setBackups] = useState(getBackups());

  const createBackup = () => {
    const data = {
      id: `bk-${Date.now()}`,
      createdAt: new Date().toISOString(),
      products,
      orders,
      settings: getSettings(),
      version: '1.0',
    };
    const next = [data, ...getBackups()].slice(0, 20);
    localStorage.setItem(BACKUP_KEY, JSON.stringify(next));
    setBackups(next);
    notify('تم إنشاء نسخة احتياطية بنجاح 💾');
  };

  const downloadBackup = (b) => {
    downloadJSON(b, `omran-backup-${new Date(b.createdAt).toISOString().slice(0, 10)}`);
    notify('تم تنزيل النسخة الاحتياطية');
  };

  const deleteBackup = (id) => {
    const next = backups.filter((b) => b.id !== id);
    localStorage.setItem(BACKUP_KEY, JSON.stringify(next));
    setBackups(next);
    notify('تم حذف النسخة الاحتياطية', 'info');
  };

  const restoreBackup = () => {
    restore(confirmRestore);
    notify('تمت استعادة النسخة الاحتياطية');
    setConfirmRestore(null);
  };

  return (
    <div>
      <SectionHeader title="مركز النسخ الاحتياطي" subtitle="إنشاء وتنزيل واستعادة نسخ احتياطية" icon={DatabaseBackup}
        action={<Button onClick={createBackup}><Plus className="w-4 h-4" /> إنشاء نسخة احتياطية</Button>} />

      <div className="mb-4 rounded-2xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-500 leading-6">
        <p className="font-black text-slate-700 mb-1 flex items-center gap-1.5"><Clock className="w-4 h-4" /> ماذا تُخزَّن النسخة الاحتياطية؟</p>
        <p>تُحفظ البيانات محلياً على هذا المتصفح (المنتجات، الطلبات، الإعدادات). الاستعادة تعيد البيانات المحفوظة — لا تُرسل أي بيانات لخوادم خارجية.</p>
      </div>

      <Card>
        <CardHeader title="سجل النسخ الاحتياطية" subtitle="آخر 20 نسخة" icon={DatabaseBackup} />
        <div className="p-4">
          {backups.length === 0 ? (
            <EmptyState icon={DatabaseBackup} title="لا توجد نسخ احتياطية بعد" hint='اضغط "إنشاء نسخة احتياطية" للبدء' action={<Button onClick={createBackup}><Plus className="w-4 h-4" /> إنشاء نسخة</Button>} />
          ) : (
            <div className="space-y-2">
              {backups.map((b) => (
                <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white">
                  <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600"><DatabaseBackup className="w-4 h-4" /></span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-700">{new Date(b.createdAt).toLocaleString('ar-EG')}</p>
                    <p className="text-[10px] text-slate-400">{b.products?.length || 0} منتج • {b.orders?.length || 0} طلب</p>
                  </div>
                  <Badge tone="green">v{b.version}</Badge>
                  <Button variant="outline" onClick={() => downloadBackup(b)}><Download className="w-4 h-4" /> تنزيل</Button>
                  <Button variant="ghost" onClick={() => setConfirmRestore(b)}><RotateCcw className="w-4 h-4" /> استعادة</Button>
                  <Button variant="ghost" onClick={() => deleteBackup(b.id)}><Trash2 className="w-4 h-4 text-rose-500" /></Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <ConfirmDialog open={!!confirmRestore} title="استعادة نسخة احتياطية" message={`هل أنت متأكد؟ ستُستبدل البيانات الحالية ببيانات النسخة المحفوظة بتاريخ ${confirmRestore ? new Date(confirmRestore.createdAt).toLocaleString('ar-EG') : ''}.`} danger onCancel={() => setConfirmRestore(null)} onConfirm={restoreBackup} />
    </div>
  );
}
