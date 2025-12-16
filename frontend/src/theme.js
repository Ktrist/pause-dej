import { extendTheme } from '@chakra-ui/react'

// Pause Dej "Alpin Moderne" Design System
const colors = {
  // Primary: Deep Lake Blue - for headings and primary text
  primary: {
    50: '#E6F2F5',
    100: '#B3D9E3',
    200: '#80C0D1',
    300: '#4DA7BF',
    400: '#268EAD',
    500: '#004E64', // Main Deep Lake Blue
    600: '#003E50',
    700: '#002E3C',
    800: '#001F28',
    900: '#000F14',
  },
  // Accent: Roasted Orange - for CTAs and highlights
  brand: {
    50: '#FEF2E8',
    100: '#FCD9BC',
    200: '#FAC090',
    300: '#F8A764',
    400: '#F68E38',
    500: '#E85D04', // Main Roasted Orange
    600: '#BA4A03',
    700: '#8B3802',
    800: '#5D2502',
    900: '#2E1301',
  },
  // Background colors
  background: {
    main: '#F8F9FA', // Off-white/light cream
    card: '#FFFFFF', // Pure white for cards
    alt: '#FBF9F7', // Light beige for alternating sections
  },
  // Text colors
  text: {
    primary: '#004E64', // Deep Lake Blue
    secondary: '#6B7280', // Grey for descriptions
    light: '#9CA3AF', // Light grey
  }
}

const theme = extendTheme({
  colors,
  fonts: {
    heading: `'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
    body: `'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
  },
  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  styles: {
    global: {
      body: {
        bg: 'background.main', // Off-white background
        color: 'text.primary', // Deep Lake Blue text
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'semibold',
        borderRadius: '10px', // Rounded corners 8-12px
      },
      variants: {
        solid: {
          bg: 'brand.500', // Roasted Orange
          color: 'white',
          _hover: {
            bg: 'brand.600',
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
          },
          _active: {
            bg: 'brand.700',
          },
        },
        outline: {
          borderColor: 'brand.500',
          color: 'brand.500',
          _hover: {
            bg: 'brand.50',
          },
        },
        ghost: {
          color: 'primary.500',
          _hover: {
            bg: 'primary.50',
          },
        },
      },
      defaultProps: {
        colorScheme: 'brand',
      },
    },
    Card: {
      baseStyle: {
        container: {
          bg: 'background.card', // Pure white
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)', // Soft subtle shadow
          overflow: 'hidden',
        },
      },
    },
    Heading: {
      baseStyle: {
        color: 'text.primary', // Deep Lake Blue
        fontWeight: 'bold',
      },
    },
    Badge: {
      baseStyle: {
        borderRadius: '20px', // Pill style
        fontWeight: 'medium',
      },
    },
  },
  shadows: {
    card: '0 2px 8px rgba(0, 0, 0, 0.06)',
    cardHover: '0 4px 16px rgba(0, 0, 0, 0.1)',
  },
})

export default theme
