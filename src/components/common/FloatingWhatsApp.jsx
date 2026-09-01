import { MessageCircle } from 'lucide-react';

const WHATSAPP_URL = 'https://wa.me/201555570269?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D8%8C%20أحتاج%20مساعدة%20في%20اختيار%20لعبة';

export default function FloatingWhatsApp() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noreferrer"
      aria-label="تواصل مع شركة عمران التجارية عبر WhatsApp"
      className="hidden sm:inline-flex fixed bottom-5 left-5 z-40 items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-black text-white shadow-xl shadow-green-900/20 transition-all hover:-translate-y-1 hover:bg-[#1ebe5d] focus:outline-none focus:ring-4 focus:ring-green-300"
    >
      <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
        <MessageCircle className="h-5 w-5" />
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#25D366] bg-white" />
      </span>
      <span className="hidden sm:inline">اطلب عبر WhatsApp</span>
    </a>
  );
}
