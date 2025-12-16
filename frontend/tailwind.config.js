/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Pause Dej Color Palette
        'bg-cream': '#F8F9FA',
        'deep-blue': '#004E64',
        'roasted-orange': '#E85D04',
        'pure-white': '#FFFFFF',
        'light-grey': '#6B7280',
        'light-beige': '#F5F2ED',

        // Primary palette (Deep Lake Blue)
        primary: {
          50: '#E6F2F5',
          100: '#B3D9E3',
          200: '#80C0D1',
          300: '#4DA7BF',
          400: '#268EAD',
          500: '#004E64',
          600: '#003E50',
          700: '#002E3C',
          800: '#001F28',
          900: '#000F14',
        },
        // Brand palette (Roasted Orange)
        brand: {
          50: '#FEF2E8',
          100: '#FCD9BC',
          200: '#FAC090',
          300: '#F8A764',
          400: '#F68E38',
          500: '#E85D04',
          600: '#BA4A03',
          700: '#8B3802',
          800: '#5D2502',
          900: '#2E1301',
        },
      },
      fontFamily: {
        sans: ['Montserrat', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
      },
      borderRadius: {
        'card': '12px',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 16px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}
