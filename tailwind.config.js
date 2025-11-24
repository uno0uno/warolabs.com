/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue'
  ],
  theme: {
    extend: {
      colors: {
        // Background colors
        'body': 'var(--bg-body)',
        'surface': 'var(--bg-surface)',
        'pattern': 'var(--bg-pattern)',
        'glass': 'var(--glass-bg)',

        // Text colors
        'main': 'var(--text-main)',
        'text-body': 'var(--text-body)',
        'secondary': 'var(--text-secondary)',

        // Accent colors
        'accent': {
          DEFAULT: 'var(--accent-text)',  // Uses readable version
          lime: 'var(--accent-lime)',     // Brand lime (constant)
          text: 'var(--accent-text)',     // Readable text version
        },

        // Button colors
        'btn': {
          bg: 'var(--btn-bg)',
          text: 'var(--btn-text)',
        },

        // Border/Glass
        'glass-border': 'var(--glass-border)',

        // Hero gradient endpoints
        'hero': {
          start: 'var(--hero-gradient-start)',
          end: 'var(--hero-gradient-end)',
        }
      },

      fontFamily: {
        'sans': ['Chivo', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        'display': ['Asul', 'Georgia', 'serif'],
        'mono': ['SF Mono', 'Roboto Mono', 'Menlo', 'monospace'],
      },

      backdropBlur: {
        'glass': '16px',
      },

      backgroundImage: {
        'dot-pattern': 'radial-gradient(var(--bg-pattern) 1px, transparent 1px)',
        'hero-gradient': 'linear-gradient(180deg, var(--hero-gradient-start) 20%, var(--hero-gradient-end) 100%)',
        'mask-radial': 'radial-gradient(circle at center, transparent 0%, var(--bg-body) 100%)',
        'glow-light': 'radial-gradient(circle, rgba(39, 201, 63, 0.05) 0%, rgba(255, 255, 255, 0) 60%)',
        'glow-dark': 'radial-gradient(circle, rgba(39, 201, 63, 0.1) 0%, rgba(0, 0, 0, 0) 70%)',
      },

      backgroundSize: {
        'dot': '24px 24px',
      },

      animation: {
        'blink': 'blink 1s step-end infinite',
      },

      keyframes: {
        blink: {
          '50%': { opacity: '0' },
        },
      },

      transitionDuration: {
        'theme': '300ms',
      },
    },
  },
  plugins: [],
}
