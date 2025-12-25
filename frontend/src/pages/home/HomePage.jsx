import { Box, Container } from '@chakra-ui/react'
import SEO from '../../components/common/SEO'
import { LocalBusinessSchema, OrganizationSchema } from '../../components/common/StructuredData'
import HeroSection from '../../components/home/HeroSection'
import HowItWorks from '../../components/home/HowItWorks'
import ForYouSection from '../../components/home/ForYouSection'
import PopularDishes from '../../components/home/PopularDishes'
import Testimonials from '../../components/home/Testimonials'
import NewsletterSubscribe from '../../components/newsletter/NewsletterSubscribe'
import B2BReassuranceBanner from '../../components/home/B2BReassuranceBanner'

export default function HomePage() {
  return (
    <>
      <SEO
        title="Pause Dej' - Livraison de repas frais à Annecy | Commandez avant minuit"
        description="Commandez des plats frais avant minuit, recevez-les le lendemain matin entre 7h et 9h à Annecy. Cuisine locale, produits de qualité, livraison rapide."
        url="/"
        keywords="livraison repas Annecy, plats frais Annecy, cuisine locale, livraison matin, restaurant Annecy, commande repas"
      />
      <LocalBusinessSchema />
      <OrganizationSchema />

      <Box>
        <HeroSection />
        <HowItWorks />
        <ForYouSection />
        <PopularDishes />
        <Testimonials />
        <Container maxW="container.xl" py={20}>
          <NewsletterSubscribe variant="inline" />
        </Container>
        <B2BReassuranceBanner />
      </Box>
    </>
  )
}
