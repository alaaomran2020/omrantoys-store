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
          red: '#FF4D6D',
          orange: '#FF7B00',
          yellow: '#FFB703',
          green: '#06D6A0',
          blue: '#118AB2',
          navy: '#073B4C',
          purple: '#8338EC',
          pink: '#FF006E',
          cream: '#FFFDF9',
        }
      },
      fontFamily: {
        cairo: ['Cairo', 'Tajawal', 'sans-serif'],
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
