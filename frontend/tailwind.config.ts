import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0A0A0C',
        'bg-1': '#0E0E12',
        'bg-2': '#141419',
        't-default': '#EDEDEE',
        'text-mute': '#8B8B93',
        'text-dim': '#55555C',
        danger: '#F2614E',
        warn: '#F2C14E',
      },
      fontFamily: {
        sans: ['var(--font-geist)', 'Inter', '-apple-system', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'JetBrains Mono', 'IBM Plex Mono', 'monospace'],
      },
      borderRadius: {
        sm: '8px',
        md: '14px',
        lg: '22px',
        xl: '32px',
        pill: '999px',
      },
      animation: {
        'mesh-drift': 'mesh-drift 24s ease-in-out infinite alternate',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'screen-in': 'screen-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'caret-blink': 'caret-blink 1s steps(1) infinite',
        'float-a': 'float-a 4.5s ease-in-out infinite alternate',
        'float-b': 'float-b 5.2s ease-in-out infinite alternate',
        'float-c': 'float-c 6.1s ease-in-out infinite alternate',
      },
      keyframes: {
        'mesh-drift': {
          '0%': { transform: 'translate(0, 0) rotate(0deg)' },
          '100%': { transform: 'translate(4%, -3%) rotate(4deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(0.85)' },
        },
        'screen-in': {
          from: { opacity: '0', transform: 'translateY(8px)', filter: 'blur(8px)' },
          to: { opacity: '1', transform: 'translateY(0)', filter: 'blur(0)' },
        },
        'caret-blink': {
          '50%': { opacity: '0' },
        },
        'float-a': {
          from: { transform: 'translate(-50%, -50%) translate(0, 0)' },
          to: { transform: 'translate(-50%, -50%) translate(-6px, 5px)' },
        },
        'float-b': {
          from: { transform: 'translate(-50%, -50%) translate(0, 0)' },
          to: { transform: 'translate(-50%, -50%) translate(6px, -4px)' },
        },
        'float-c': {
          from: { transform: 'translate(-50%, -50%) translate(0, 0)' },
          to: { transform: 'translate(-50%, -50%) translate(-4px, -6px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
