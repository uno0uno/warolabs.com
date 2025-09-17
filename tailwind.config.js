/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
    "./app.vue",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    fontFamily: {
      principal: ['Lato', 'sans-serif'],
      secondary: ['Instrument Serif', 'serif'],
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(340 82% 52%)",
          foreground: "hsl(210 40% 98%)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Colores adicionales para la aplicación
        success: {
          50: '#f0fdf4',
          100: '#dcfce7', 
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          DEFAULT: '#10b981',
          foreground: '#ffffff',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b', 
          600: '#d97706',
          700: '#b45309',
          DEFAULT: '#f59e0b',
          foreground: '#ffffff',
        },
        info: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#06b6d4',
          600: '#0891b2', 
          700: '#0e7490',
          DEFAULT: '#06b6d4',
          foreground: '#ffffff',
        },
        // Colores para estados de engagement
        engagement: {
          'highly-engaged': '#10b981',
          'engaged': '#8b5cf6',
          'interested': '#f59e0b',
          'cold': '#6b7280',
        },
        // Colores de marca y interfaz
        brand: {
          black: '#1a1a2e',
          'black-hover': '#16213e',
          overlay: 'rgba(26, 26, 46, 0.5)',
          'loading-overlay': 'rgba(26, 26, 46, 0.4)',
        },
        // Estados de campaña
        status: {
          draft: '#f59e0b',
          active: '#059669',
          paused: '#9ca3af',
          completed: '#8b5cf6',
          cancelled: '#dc2626',
        },
        // Colores de fondo para estados
        statusBg: {
          draft: '#fef3c7',
          active: '#d1fae5',
          paused: '#f3f4f6',
          completed: '#dbeafe',
          cancelled: '#fee2e2',
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      // Espaciado adicional para componentes específicos
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        'table-cell': '1rem 1.5rem',
      },
      // Alturas específicas para componentes
      height: {
        'button-sm': '2rem',
        'button-md': '2.5rem', 
        'button-lg': '3rem',
        'input': '2.5rem',
        'table-row': '3.5rem',
      },
      // Anchos específicos
      width: {
        'sidebar': '16rem',
        'modal-sm': '32rem',
        'modal-md': '48rem',
        'modal-lg': '64rem',
      },
      // Animaciones personalizadas
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 0.6s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-3px)' },
          '60%': { transform: 'translateY(-2px)' },
        },
      },
      // Sombras personalizadas
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'modal': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}