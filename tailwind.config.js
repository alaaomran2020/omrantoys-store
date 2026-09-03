/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        toy: {
          red: '#FF4D6D',      // Coral - اللون الأساسي والأزرار
          orange: '#FF7B00',   // برتقالي مرح
          yellow: '#FFC017',   // ذهبي - العروض والشارات
          gold: '#F6C945',
          green: '#06D6A0',    // نعناعي - النجاح والتوفر
          mint: '#16E0B0',
          blue: '#16A6B6',     // تركوازي - الشحن والروابط
          navy: '#10152F',     // كحلي - العناوين والفوتر
          ink: '#2B2D42',
          purple: '#8338EC',   // بنفسجي - لمسات مرحة
          pink: '#FF006E',
          cream: '#FFFDF8',    // أبيض دافئ للخلفيات
        },
        // ============================================
        // Admin Console — Dark Digital Brutalism
        // خلفية رمادي مزرق (Slate) + أزرق كهربائي للعناصر
        // النشطة + أصفر Sunbeam حصرياً لأزرار الإجراء الأساسية
        // ============================================
        electric: {
          DEFAULT: '#2E62FF',  // Electric Blue — العناصر النشطة/التركيز/الروابط
          hover:   '#1F4FE0',
          soft:    '#9DB4FF',
        },
        sunbeam: {
          DEFAULT: '#FFD60A',  // Sunbeam Yellow — أزرار الحفظ/الإجراء الأساسي فقط
          hover:   '#FFC300',
          ink:     '#1A1B25',
        },
        ink: {
          DEFAULT: '#0B1220',  // خطوط/ظلال Brutalist
          deep:    '#050A18',
        },
      },
      boxShadow: {
        // ظلال Brutalist صلبة بإزاحة (بدون Blur)
        brutal:        '6px 6px 0 0 #050A18',
        'brutal-sm':   '3px 3px 0 0 #050A18',
        'brutal-lg':   '10px 10px 0 0 #050A18',
        'brutal-blue': '6px 6px 0 0 #2E62FF',
        'brutal-yellow':'6px 6px 0 0 #B8860B',
        'brutal-inset': 'inset 3px 3px 0 0 rgba(255,255,255,0.06)',
        soft: '0 10px 30px -12px rgba(16, 21, 47, 0.12)',
        'soft-lg': '0 22px 48px -20px rgba(16, 21, 47, 0.22)',
        pop: '0 6px 0 0 rgba(16, 21, 47, 0.12)',
      },
      fontFamily: {
        cairo: ['Cairo', 'Tajawal', 'sans-serif'],
        display: ['"Baloo Bhaijaan 2"', 'Cairo', 'Tajawal', 'sans-serif'],
      },
      borderRadius: {
        blob: '2rem',
      },
      animation: {
        'bounce-slow': 'bounce 2.5s infinite',
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        }
      }
    },
  },
  plugins: [],
}
