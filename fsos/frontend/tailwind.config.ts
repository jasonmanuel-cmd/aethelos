import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        aethelos: {
          primary: '#2B4C7C',
          'primary-light': '#3B6B9E',
          secondary: '#4A7C6E',
          'secondary-light': '#6B9E8E',
          accent: '#D4726A',
          'accent-light': '#E08A82',
          bg: '#F8F6F2',
          surface: '#FFFFFF',
          card: '#FAF9F7',
          border: 'rgba(0, 0, 0, 0.06)',
          text: '#1E1B18',
          'text-secondary': '#5A5450',
          muted: '#8C8680',
        },
        safe: {
          blue: '#3B82F6',
          green: '#4A7C6E',
          amber: '#C4956A',
          red: '#D46560',
        },
      },
      fontFamily: {
        display: ['Cabinet Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        soft: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)',
        card: '0 4px 12px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.03)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
