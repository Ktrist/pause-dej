import { Box, Container, Heading, Text, VStack, Divider, UnorderedList, ListItem } from '@chakra-ui/react'
import { APP_NAME } from '../../config'

export default function CGVPage() {
  return (
    <Box bg="gray.50" minH="calc(100vh - 64px)" py={12}>
      <Container maxW="container.md">
        <VStack spacing={8} align="stretch">
          <Heading as="h1" size="xl" color="gray.800">
            Conditions Générales de Vente
          </Heading>

          <Text color="gray.600" fontSize="sm">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </Text>

          <VStack spacing={6} align="stretch">
            {/* Article 1 */}
            <Box>
              <Heading as="h2" size="md" mb={3} color="primary.500">
                Article 1 - Objet
              </Heading>
              <Text color="gray.700">
                Les présentes conditions générales de vente (CGV) régissent les ventes de plats préparés
                proposées par {APP_NAME} à des clients professionnels et particuliers.
              </Text>
            </Box>

            <Divider />

            {/* Article 2 */}
            <Box>
              <Heading as="h2" size="md" mb={3} color="primary.500">
                Article 2 - Commandes
              </Heading>
              <Text color="gray.700" mb={3}>
                Les commandes peuvent être passées :
              </Text>
              <UnorderedList spacing={2} color="gray.700" ml={6}>
                <ListItem>En ligne sur notre site web</ListItem>
                <ListItem>Par téléphone au 01 23 45 67 89</ListItem>
                <ListItem>Pour les entreprises, via un compte B2B dédié</ListItem>
              </UnorderedList>
              <Text color="gray.700" mt={3}>
                Toute commande implique l'acceptation sans réserve des présentes CGV.
              </Text>
            </Box>

            <Divider />

            {/* Article 3 */}
            <Box>
              <Heading as="h2" size="md" mb={3} color="primary.500">
                Article 3 - Prix
              </Heading>
              <Text color="gray.700">
                Les prix sont indiqués en euros TTC. Ils incluent la TVA applicable au jour de la commande.
                {APP_NAME} se réserve le droit de modifier ses prix à tout moment, mais s'engage à facturer
                les produits commandés au prix indiqué lors de la validation de la commande.
              </Text>
            </Box>

            <Divider />

            {/* Article 4 */}
            <Box>
              <Heading as="h2" size="md" mb={3} color="primary.500">
                Article 4 - Livraison
              </Heading>
              <Text color="gray.700" mb={3}>
                Les livraisons sont effectuées :
              </Text>
              <UnorderedList spacing={2} color="gray.700" ml={6}>
                <ListItem>Du lundi au vendredi</ListItem>
                <ListItem>Entre 11h30 et 13h30</ListItem>
                <ListItem>Dans un rayon de 10 km autour d'Annecy</ListItem>
              </UnorderedList>
              <Text color="gray.700" mt={3}>
                Frais de livraison : Gratuits dès 30€ d'achat, sinon 3,90€
              </Text>
            </Box>

            <Divider />

            {/* Article 5 */}
            <Box>
              <Heading as="h2" size="md" mb={3} color="primary.500">
                Article 5 - Paiement
              </Heading>
              <Text color="gray.700">
                Le paiement est exigible immédiatement lors de la commande. Les moyens de paiement acceptés sont :
                carte bancaire, Apple Pay, Google Pay. Pour les entreprises avec compte B2B, un paiement différé (NET 30) peut être accordé.
              </Text>
            </Box>

            <Divider />

            {/* Article 6 */}
            <Box>
              <Heading as="h2" size="md" mb={3} color="primary.500">
                Article 6 - Droit de rétractation
              </Heading>
              <Text color="gray.700">
                Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne peut être exercé
                pour les denrées alimentaires périssables. Les commandes ne peuvent donc pas être annulées une fois validées.
              </Text>
            </Box>

            <Divider />

            {/* Article 7 */}
            <Box>
              <Heading as="h2" size="md" mb={3} color="primary.500">
                Article 7 - Réclamations
              </Heading>
              <Text color="gray.700">
                Toute réclamation relative à la qualité ou à la conformité d'un produit doit être formulée dans un délai
                de 48 heures suivant la livraison, accompagnée de justificatifs (photos).
              </Text>
            </Box>

            <Divider />

            {/* Article 8 */}
            <Box>
              <Heading as="h2" size="md" mb={3} color="primary.500">
                Article 8 - Données personnelles
              </Heading>
              <Text color="gray.700">
                Les données personnelles collectées sont nécessaires à la gestion de votre commande et à la relation commerciale.
                Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données.
              </Text>
            </Box>

            <Divider />

            {/* Article 9 */}
            <Box>
              <Heading as="h2" size="md" mb={3} color="primary.500">
                Article 9 - Litiges
              </Heading>
              <Text color="gray.700">
                Les présentes CGV sont soumises au droit français. En cas de litige, une solution amiable sera recherchée
                avant toute action judiciaire. À défaut, les tribunaux français seront seuls compétents.
              </Text>
            </Box>
          </VStack>
        </VStack>
      </Container>
    </Box>
  )
}
