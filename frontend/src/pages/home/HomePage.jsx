import { Box, Container } from '@chakra-ui/react'
import HeroSection from '../../components/home/HeroSection'
import SearchFiltersBar from '../../components/home/SearchFiltersBar'
import HowItWorks from '../../components/home/HowItWorks'
import ForYouSection from '../../components/home/ForYouSection'
import PopularDishes from '../../components/home/PopularDishes'
import Testimonials from '../../components/home/Testimonials'
import NewsletterSubscribe from '../../components/newsletter/NewsletterSubscribe'
import B2BReassuranceBanner from '../../components/home/B2BReassuranceBanner'

export default function HomePage() {
  return (
    <Box>
      <HeroSection />
      <SearchFiltersBar />
      <HowItWorks />
      <ForYouSection />
      <PopularDishes />
      <Testimonials />
      <Container maxW="container.xl" py={20}>
        <NewsletterSubscribe variant="inline" />
      </Container>
      <B2BReassuranceBanner />
    </Box>
  )
}
