import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0B0B0F',
        surface: '#15151D',
        card: '#15151D',
        'surface-2': '#22222B',
        'surface-3': '#2C2C36',
        primary: '#FFD400',
        'primary-dark': '#E6BF00',
        accent: '#FFD400',
        'accent-red': '#E53935',
        'accent-blue': '#1976D2',
        muted: '#A0A0A0',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',      // 16px botones, inputs
        '2xl': '1.5rem', // 24px tarjetas, sheets
        '3xl': '1.75rem',// 28px
      },
      boxShadow: {
        // Elevacion neutra
        card: '0 1px 2px rgba(0, 0, 0, 0.4)',
        pop: '0 8px 24px rgba(0, 0, 0, 0.45)',
        nav: '0 -2px 16px rgba(0, 0, 0, 0.4)',
        // Glow amarillo de marca — solo acciones primarias
        primary: '0 10px 24px rgba(255, 212, 0, 0.30)',
        'primary-sm': '0 6px 16px rgba(255, 212, 0, 0.40)',
      },
    },
  },
  plugins: [],
} satisfies Config;
