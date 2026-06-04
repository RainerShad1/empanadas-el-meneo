import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0f0f12',
        surface: '#1a1a20',
        card: '#22222b',
        primary: '#ff4d2d',     // rojo-naranja apetitoso
        'primary-dark': '#e63916',
        accent: '#ffd23f',
        muted: '#8b8b95',
      },
      borderRadius: { xl: '1rem', '2xl': '1.5rem' },
    },
  },
  plugins: [],
} satisfies Config;
