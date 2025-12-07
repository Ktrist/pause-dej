import { extendTheme } from '@chakra-ui/react'

const colors = {
  brand: {
    500: '#FFA500',
    600: '#CC8400',
  },
  primary: {
    500: '#00A991',
    600: '#008774',
  }
}

const theme = extendTheme({
  colors,
  fonts: {
    heading: `'Inter', sans-serif`,
    body: `'Inter', sans-serif`,
  }
})

export default theme
