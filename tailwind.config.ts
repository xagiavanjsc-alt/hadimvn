/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        // Đồng bộ màu nền chính
        colors: {
          'app-bg': '#0f1117',
          'app-surface': '#1a1d24',
          'app-card': '#22262d',
          'app-border': 'rgba(255,255,255,0.1)',
          'app-text': {
            primary: '#ffffff',
            secondary: 'rgba(255,255,255,0.7)',
            muted: 'rgba(255,255,255,0.5)',
          },
          'app-accent': {
            primary: '#e8c84a', // Gold - main accent used throughout site
            secondary: '#8b5cf6', // Violet
            success: '#22c55e',
            warning: '#eab308',
            error: '#ef4444',
          }
        },
        // Đồng bộ font
        fontFamily: {
          'app': ['"Be Vietnam Pro"', 'sans-serif'],
        },
        // Animation durations
        transitionDuration: {
          'app': '200ms',
        },
      },
    },
    plugins: [],
  }