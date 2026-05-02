/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        void:    '#080611',
        deep:    '#0f0c1e',
        surface: '#161228',
        card:    '#1e1833',
        gold:    '#c9a84c',
        gold2:   '#e8c97a',
        pink:    '#d4618a',
        purple:  '#4a2d8a',
      },
      fontFamily: {
        serif:   ['Playfair Display', 'Georgia', 'serif'],
        display: ['Syne', 'sans-serif'],
        mono:    ['IBM Plex Mono', 'monospace'],
        sans:    ['DM Sans', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gold-grad': 'linear-gradient(135deg, #c9a84c, #e8c97a)',
        'purple-grad': 'linear-gradient(135deg, #2a1060, #4a2d8a)',
        'dark-grad': 'linear-gradient(160deg, #120820 0%, #070510 60%)',
      },
      animation: {
        float:          'float 5s ease-in-out infinite',
        shimmer:        'shimmer 1.5s infinite',
        pulse2:         'pulse2 3s ease-in-out infinite',
        'spin-slow':    'spin 25s linear infinite',
        'spin-slow-r':  'spin 20s linear infinite reverse',
        'spin-medium':  'spin 15s linear infinite',
      },
      keyframes: {
        float:   { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        shimmer: { '0%': { backgroundPosition: '200% 0' }, '100%': { backgroundPosition: '-200% 0' } },
        pulse2:  { '0%,100%': { opacity: '0.6' }, '50%': { opacity: '1' } },
      },
    },
  },
  plugins: [],
}
