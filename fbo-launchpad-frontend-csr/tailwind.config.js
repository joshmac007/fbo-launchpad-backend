/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        'primary-hover': 'var(--primary-hover)',
        'primary-foreground': 'var(--primary-foreground)',

        secondary: 'var(--secondary)',
        'secondary-hover': 'var(--secondary-hover)',
        'secondary-foreground': 'var(--secondary-foreground)',

        ring: {
          DEFAULT: 'var(--primary-focus-ring)',
          dark: 'var(--primary-focus-ring-dark)',
        },
        
        input: {
          DEFAULT: 'var(--neutral-surface)',
          border: 'var(--neutral-border)',
          dark: 'var(--input-background-dark)',
        },

        neutral: {
          background: 'var(--neutral-background)',
          'background-subtle': 'var(--neutral-background-subtle)',
          surface: 'var(--neutral-surface)',
          border: 'var(--neutral-border)',
          'text-primary': 'var(--neutral-text-primary)',
          'text-secondary': 'var(--neutral-text-secondary)',
          'text-disabled': 'var(--neutral-text-disabled)',
        },
        status: {
          success: 'var(--status-success)',
          warning: 'var(--status-warning)',
          error: 'var(--status-error)',
          info: 'var(--status-info)',
        },
      },
      fontFamily: {
        sans: ['Montserrat', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'xs': '0.75rem',      // 12px
        'caption': '0.8125rem', // 13px
        'sm': '0.875rem',      // 14px
        'input-label': '0.875rem', // 14px
        'base': '1rem',        // 16px
        'lg': '1.125rem',      // 18px
        'page-title': '1.625rem', // 26px
        'xl': '1.25rem',       // 20px
        '2xl': '1.5rem',        // 24px
        '3xl': '1.875rem',      // 30px
        '4xl': '2.25rem',       // 36px
        '5xl': '3rem',          // 48px
      },
      lineHeight: {
        'tight': '1.25',
        'normal': '1.5',
        'relaxed': '1.75',
      },
      spacing: {
        'xs': '0.25rem',  // 4px
        'sm': '0.5rem',   // 8px
        'md': '1rem',     // 16px
        'lg': '1.5rem',   // 24px
        'xl': '2rem',     // 32px
        '2xl': '2.5rem', // 40px
        '3xl': '3rem',   // 48px
      },
    }
  },
  plugins: [],
} 