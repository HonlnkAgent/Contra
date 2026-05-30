import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'contra': {
          primary: '#00ff00',
          secondary: '#ff6600',
          danger: '#ff0000',
          dark: '#1a1a2e',
          darker: '#0f0f1a',
        },
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config
