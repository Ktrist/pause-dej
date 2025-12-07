import { Box } from '@chakra-ui/react'
import HeroSection from '../../components/home/HeroSection'
import HowItWorks from '../../components/home/HowItWorks'
import PopularDishes from '../../components/home/PopularDishes'
import Testimonials from '../../components/home/Testimonials'

export default function HomePage() {
  return (
    <Box>
      <HeroSection />
      <HowItWorks />
      <PopularDishes />
      <Testimonials />
    </Box>
  )
}
