import { Box, Container } from '@chakra-ui/react'
import HeroSection from '../../components/home/HeroSection'
import HowItWorks from '../../components/home/HowItWorks'
import ForYouSection from '../../components/home/ForYouSection'
import PopularDishes from '../../components/home/PopularDishes'
import Testimonials from '../../components/home/Testimonials'
import NewsletterSubscribe from '../../components/newsletter/NewsletterSubscribe'
import B2BSection from '../../components/home/B2BSection'

export default function HomePage() {
  return (
    <Box>
      <HeroSection />
      <HowItWorks />
      <ForYouSection />
      <PopularDishes />
      <Testimonials />
      <Container maxW="container.xl" py={20}>
        <NewsletterSubscribe variant="inline" />
      </Container>
      <B2BSection />
    </Box>
  )
}
