/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          cream:  '#FAF3E1',
          sand:   '#F5E7C6',
          orange: '#FA8112',
          dark:   '#0a0a0a',
          purple: '#7c3aed',
          dpurple:'#1e0040',
          pink:   '#F72585',
          lav:    '#e9d5ff',
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        marquee: 'marquee 30s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':       { transform: 'translateY(-12px)' },
        },
        marquee: {
          '0%':   { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}
