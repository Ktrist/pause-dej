import { Box } from '@chakra-ui/react'
import HeroSection from '../../components/home/HeroSection'
import HowItWorks from '../../components/home/HowItWorks'
import ForYouSection from '../../components/home/ForYouSection'
import PopularDishes from '../../components/home/PopularDishes'
import Testimonials from '../../components/home/Testimonials'
import B2BSection from '../../components/home/B2BSection'

export default function HomePage() {
  return (
    <Box>
      <HeroSection />
      <HowItWorks />
      <ForYouSection />
      <PopularDishes />
      <Testimonials />
      <B2BSection />
    </Box>
  )
}
