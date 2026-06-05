import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0B0B0F',          // fondo casi negro
        surface: '#15151D',     // superficies
        card: '#15151D',        // tarjetas
        primary: '#FFD400',     // amarillo de marca (Super Empanada)
        'primary-dark': '#E6BF00',
        accent: '#FFD400',      // acento amarillo
        'accent-red': '#E53935',
        'accent-blue': '#1976D2',
        muted: '#A0A0A0',
      },
      borderRadius: { xl: '1rem', '2xl': '1.5rem', '3xl': '1.75rem' },
    },
  },
  plugins: [],
} satisfies Config;
