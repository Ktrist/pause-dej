import { extendTheme } from '@chakra-ui/react'

// Pause Dej "Alpin Moderne" Design System
// Adapted from Tailwind CSS design tokens
const colors = {
  // Primary: Deep Lake Blue - for headings and primary text
  primary: {
    50: '#E6F2F5',
    100: '#B3D9E3',
    200: '#80C0D1',
    300: '#4DA7BF',
    400: '#268EAD',
    500: '#004E64', // --color-deep-blue
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
    500: '#E85D04', // --color-roasted-orange
    600: '#BA4A03',
    700: '#8B3802',
    800: '#5D2502',
    900: '#2E1301',
  },
  // Background colors
  background: {
    main: '#F8F9FA', // --color-bg-cream (off-white/light cream)
    card: '#FFFFFF', // --color-pure-white (pure white for cards)
    alt: '#F5F2ED', // --color-light-beige (light beige for alternating sections)
  },
  // Text colors
  text: {
    primary: '#004E64', // --color-deep-blue (Deep Lake Blue)
    secondary: '#6B7280', // --color-light-grey (grey for descriptions)
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
    normal: 400,  // p tags
    medium: 500,
    semibold: 600, // buttons
    bold: 700,     // h2, h3
    extrabold: 800, // h1
  },
  fontSizes: {
    // Matching Tailwind CSS specifications
    '3xl': '3.5rem',  // h1: 56px
    '2xl': '2.25rem', // h2: 36px
    'xl': '1.25rem',  // h3: 20px
    'md': '1rem',     // p: 16px
  },
  lineHeights: {
    // Matching Tailwind CSS specifications
    h1: '1.1',
    h2: '1.2',
    h3: '1.3',
    normal: '1.6', // p tags
  },
  styles: {
    global: {
      body: {
        bg: 'background.main', // #F8F9FA - bg-cream
        color: 'text.primary', // #004E64 - deep-blue
        margin: 0,
        padding: 0,
      },
      h1: {
        fontWeight: 800,
        fontSize: '3.5rem',
        lineHeight: '1.1',
        color: 'text.primary',
      },
      h2: {
        fontWeight: 700,
        fontSize: '2.25rem',
        lineHeight: '1.2',
        color: 'text.primary',
      },
      h3: {
        fontWeight: 700,
        fontSize: '1.25rem',
        lineHeight: '1.3',
        color: 'text.primary',
      },
      p: {
        fontWeight: 400,
        fontSize: '1rem',
        lineHeight: '1.6',
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontFamily: `'Montserrat', sans-serif`,
        fontWeight: 600, // semibold - matching button specification
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
