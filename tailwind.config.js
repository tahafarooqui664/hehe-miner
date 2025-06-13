/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'mining-pulse': 'mining-pulse 1.5s ease-in-out infinite',
        'bounce-in': 'bounce-in 0.6s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'rotate-glow': 'rotate-glow 4s linear infinite',
        'coin-flip': 'coin-flip 1s ease-in-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(251, 191, 36, 0.3)',
            transform: 'scale(1)',
          },
          '50%': {
            boxShadow: '0 0 40px rgba(251, 191, 36, 0.6)',
            transform: 'scale(1.02)',
          },
        },
        'mining-pulse': {
          '0%, 100%': {
            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
            boxShadow: '0 0 30px rgba(251, 191, 36, 0.4)',
          },
          '50%': {
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            boxShadow: '0 0 50px rgba(251, 191, 36, 0.7)',
          },
        },
        'bounce-in': {
          '0%': {
            opacity: '0',
            transform: 'scale(0.3) translateY(50px)',
          },
          '50%': {
            opacity: '1',
            transform: 'scale(1.05) translateY(-10px)',
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1) translateY(0)',
          },
        },
        'slide-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(30px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'rotate-glow': {
          '0%': {
            transform: 'rotate(0deg)',
            filter: 'hue-rotate(0deg)',
          },
          '100%': {
            transform: 'rotate(360deg)',
            filter: 'hue-rotate(360deg)',
          },
        },
        'coin-flip': {
          '0%': { transform: 'rotateY(0deg)' },
          '50%': { transform: 'rotateY(180deg)' },
          '100%': { transform: 'rotateY(360deg)' },
        },
      },
    },
  },
  plugins: [],
}
