/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Stolzl"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Нейтрали под бренд 25/7: текст #282828, слейт #424a5d, приглушённый сине-серый #9ca4b7
        ink: {
          900: '#282828',
          700: '#424a5d',
          500: '#6b7488',
          400: '#9ca4b7',
        },
        steel: {
          50: '#f7f8fa',
          100: '#eef0f3',
          150: '#e7ecf2',
          200: '#dce0e6',
          300: '#c7ccd5',
        },
        // Акцент бренда 25/7 — лайм #ccf56b (фон-заливки), тёмный шартрез для текста на белом
        moss: {
          50: '#f4fbe4',
          100: '#eaf8c9',
          200: '#dcf3a3',
          400: '#ccf56b',
          500: '#b6e84f',
          600: '#6a8a1e',
          700: '#51691a',
        },
        amber: {
          400: '#f5b544',
          500: '#e69a1f',
          600: '#c47d12',
        },
      },
      boxShadow: {
        ambient: '0 1px 2px rgba(20,23,28,.04), 0 18px 40px -24px rgba(20,23,28,.22)',
        'ambient-lg': '0 2px 4px rgba(20,23,28,.05), 0 40px 80px -40px rgba(20,23,28,.28)',
        metal: 'inset 0 1px 0 rgba(255,255,255,.9), inset 0 -1px 1px rgba(20,23,28,.10), 0 1px 2px rgba(20,23,28,.10), 0 8px 18px -10px rgba(20,23,28,.30)',
        'metal-press': 'inset 0 2px 4px rgba(20,23,28,.18), inset 0 1px 0 rgba(255,255,255,.4)',
        inset: 'inset 0 1px 2px rgba(20,23,28,.07), inset 0 1px 0 rgba(255,255,255,.6)',
        glow: '0 8px 26px -8px rgba(166,224,79,.7), inset 0 1px 0 rgba(255,255,255,.5)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.32,0.72,0,1)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)', filter: 'blur(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)', filter: 'blur(0)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-44px)' },
          '100%': { transform: 'translateY(44px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up .7s cubic-bezier(0.32,0.72,0,1) both',
        scanline: 'scanline 1.6s cubic-bezier(0.45,0,0.55,1) infinite alternate',
        shimmer: 'shimmer 2.4s linear infinite',
      },
    },
  },
  plugins: [],
}
