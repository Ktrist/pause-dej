import { Box, Container, Heading, Text, VStack, Link, Divider } from '@chakra-ui/react'
import { APP_NAME, CONTACT_EMAIL } from '../../config'

export default function MentionsLegalesPage() {
  return (
    <Box bg="gray.50" minH="calc(100vh - 64px)" py={12}>
      <Container maxW="container.md">
        <VStack spacing={8} align="stretch">
          <Heading as="h1" size="xl" color="gray.800">
            Mentions Légales
          </Heading>

          <VStack spacing={6} align="stretch">
            {/* Éditeur */}
            <Box>
              <Heading as="h2" size="md" mb={3} color="primary.500">
                Éditeur du site
              </Heading>
              <Text color="gray.700">
                <strong>{APP_NAME}</strong><br />
                Forme juridique : SAS<br />
                Capital social : 10 000 €<br />
                Siège social : Annecy, France<br />
                Email : {CONTACT_EMAIL}<br />
                Téléphone : 01 23 45 67 89
              </Text>
            </Box>

            <Divider />

            {/* Directeur de publication */}
            <Box>
              <Heading as="h2" size="md" mb={3} color="primary.500">
                Directeur de la publication
              </Heading>
              <Text color="gray.700">
                Le directeur de la publication du site est le représentant légal de {APP_NAME}.
              </Text>
            </Box>

            <Divider />

            {/* Hébergement */}
            <Box>
              <Heading as="h2" size="md" mb={3} color="primary.500">
                Hébergement
              </Heading>
              <Text color="gray.700">
                Le site est hébergé par :<br />
                <strong>Vercel Inc.</strong><br />
                340 S Lemon Ave #4133<br />
                Walnut, CA 91789, USA
              </Text>
            </Box>

            <Divider />

            {/* Propriété intellectuelle */}
            <Box>
              <Heading as="h2" size="md" mb={3} color="primary.500">
                Propriété intellectuelle
              </Heading>
              <Text color="gray.700">
                L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle.
                Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
              </Text>
            </Box>

            <Divider />

            {/* CNIL */}
            <Box>
              <Heading as="h2" size="md" mb={3} color="primary.500">
                Protection des données personnelles
              </Heading>
              <Text color="gray.700">
                Conformément à la loi "Informatique et Libertés" du 6 janvier 1978 modifiée et au Règlement Général sur la Protection des Données (RGPD),
                vous disposez d'un droit d'accès, de rectification et de suppression des données vous concernant.
              </Text>
              <Text color="gray.700" mt={2}>
                Pour exercer ces droits, vous pouvez nous contacter à l'adresse : <Link href={`mailto:${CONTACT_EMAIL}`} color="brand.500">{CONTACT_EMAIL}</Link>
              </Text>
            </Box>
          </VStack>
        </VStack>
      </Container>
    </Box>
  )
}
