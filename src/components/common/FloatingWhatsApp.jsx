import { MessageCircle } from 'lucide-react';
import { getSettings } from '../../lib/settings';
import { track, EVENTS } from '../../lib/analytics';

export default function FloatingWhatsApp() {
  const settings = getSettings();
  if (settings.appearance?.showWhatsAppButton === false) return null;
  const url = `https://wa.me/${settings.whatsapp.phone}?text=${encodeURIComponent(settings.whatsapp.defaultMessage || 'مرحباً، أحتاج مساعدة في اختيار لعبة')}`;
  return (
    <a
      href={url}
      onClick={() => track(EVENTS.whatsappClick, { source: 'floating_button' })}
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
