/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0b0b10',
          card: '#16161d',
          field: '#1e1e28',
        },
        border: {
          DEFAULT: '#212129',
          field: '#2b2b38',
        },
        lavender: {
          DEFAULT: 'var(--color-lavender, #8b7cf6)',
          hover: 'var(--color-lavender-hover, #7c6df0)',
          light: 'var(--color-lavender-light, #efeafe)',
        },
        text: {
          primary: '#f2f1f7',
          secondary: '#9a99a8',
          muted: '#6b6a78',
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
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
