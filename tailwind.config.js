function withOpacity(variableName, fallback) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `color-mix(in srgb, var(${variableName}, ${fallback}) calc(${opacityValue} * 100%), transparent)`
    }
    return `var(${variableName}, ${fallback})`
  }
}

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: withOpacity('--color-bg', '#0b0b10'),
          card: withOpacity('--color-bg-card', '#16161d'),
          field: withOpacity('--color-bg-field', '#1e1e28'),
        },
        border: {
          DEFAULT: withOpacity('--color-border', '#212129'),
          field: withOpacity('--color-border-field', '#2b2b38'),
        },
        lavender: {
          DEFAULT: withOpacity('--color-lavender', '#8b7cf6'),
          hover: withOpacity('--color-lavender-hover', '#7c6df0'),
          light: withOpacity('--color-lavender-light', '#efeafe'),
        },
        text: {
          primary: withOpacity('--color-text-primary', '#f2f1f7'),
          secondary: withOpacity('--color-text-secondary', '#9a99a8'),
          muted: withOpacity('--color-text-muted', '#6b6a78'),
        },
        priority: {
          high: '#f0655f',
          medium: '#f2a93b',
          low: '#4fbf6b',
        },
      },
      borderColor: {
        DEFAULT: 'var(--color-border, #212129)',
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
