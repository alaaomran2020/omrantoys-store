import React, { useMemo, useState } from 'react';
import { ShoppingBag, Search, Package } from 'lucide-react';
import { SectionHeader, Card, EmptyState, Badge, Button } from '../ui';

const STATUSES = ['قيد الانتظار', 'قيد التجهيز', 'تم الشحن', 'تم التوصيل', 'ملغي', 'مرتجع'];

export default function Orders({ ctx }) {
  const { orders, updateOrderStatus, formatPrice, notify } = ctx;
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const normalizePhone = (v) => String(v || '').replace(/\D/g, '');

  const filtered = useMemo(() => {
    let list = [...orders];
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((o) =>
        o.id?.toLowerCase().includes(q) ||
        o.customerName?.toLowerCase().includes(q) ||
        normalizePhone(o.phone).includes(normalizePhone(q))
      );
    }
    if (statusFilter !== 'all') list = list.filter((o) => o.status === statusFilter);
    return list;
  }, [orders, search, statusFilter]);

  const totalSales = orders.reduce((s, o) => s + (o.total || 0), 0);

  return (
    <div>
      <SectionHeader title="إدارة الطلبات" subtitle={`${orders.length} طلب • إجمالي ${formatPrice(totalSales)}`} icon={ShoppingBag} />

      <Card className="p-3 mb-4">
        <div className="flex flex-col md:flex-row gap-2.5 md:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث: رقم الطلب، اسم العميل، الهاتف..." className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-toy-red" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold cursor-pointer">
            <option value="all">كل الحالات</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </Card>

      {orders.length === 0 ? (
        <Card><EmptyState icon={ShoppingBag} title="لا توجد طلبات حتى الآن" hint="ستظهر الطلبات هنا بعد إنشائها من المتجر." /></Card>
      ) : filtered.length === 0 ? (
        <Card><EmptyState icon={Search} title="لا يوجد طلب مطابق للبحث" hint="جرّب البحث بكلمة أخرى." /></Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">رقم الطلب</th>
                  <th className="p-3">العميل</th>
                  <th className="p-3">المحافظة</th>
                  <th className="p-3">عدد الأصناف</th>
                  <th className="p-3">المجموع</th>
                  <th className="p-3">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <span className="font-mono font-bold text-slate-900">#{o.id}</span>
                      <span className="block text-[10px] text-slate-400">{o.date}</span>
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-slate-800 block">{o.customerName}</span>
                      <span className="text-[10px] text-slate-400 font-mono" dir="ltr">{o.phone}</span>
                    </td>
                    <td className="p-3 text-slate-600">{o.city || o.governorate}</td>
                    <td className="p-3 text-slate-700 font-semibold">{o.items?.length || 1}</td>
                    <td className="p-3 font-black text-toy-red">{formatPrice(o.total)}</td>
                    <td className="p-3">
                      <select value={o.status} onChange={(e) => updateOrderStatus(o.id, e.target.value)} className="text-xs font-bold bg-white border border-slate-200 rounded-lg p-1 text-slate-800 cursor-pointer">
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
