import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#172033',
        navy: { 50: '#f2f6fb', 100: '#e6edf7', 500: '#2f5f99', 600: '#254f85', 700: '#1d416f', 800: '#18375f', 900: '#142c4e' },
      },
      boxShadow: { panel: '0 1px 2px rgba(15, 23, 42, 0.04), 0 2px 8px rgba(15, 23, 42, 0.025)' },
    },
  },
  plugins: [],
} satisfies Config;
