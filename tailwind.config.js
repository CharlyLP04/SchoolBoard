/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: 'var(--color-bg, #0b0b10)',
          card: 'var(--color-bg-card, #16161d)',
          field: 'var(--color-bg-field, #1e1e28)',
        },
        border: {
          DEFAULT: 'var(--color-border, #212129)',
          field: 'var(--color-border-field, #2b2b38)',
        },
        lavender: {
          DEFAULT: 'var(--color-lavender, #8b7cf6)',
          hover: 'var(--color-lavender-hover, #7c6df0)',
          light: 'var(--color-lavender-light, #efeafe)',
        },
        text: {
          primary: 'var(--color-text-primary, #f2f1f7)',
          secondary: 'var(--color-text-secondary, #9a99a8)',
          muted: 'var(--color-text-muted, #6b6a78)',
        },
        priority: {
          high: '#f0655f',
          medium: '#f2a93b',
          low: '#4fbf6b',
        },
      },
      borderRadius: {
        xl: '14px',
        '2xl': '18px',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Outfit"', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
