import { Box, Container, Heading, Text, VStack, Divider, UnorderedList, ListItem, Table, Thead, Tbody, Tr, Th, Td, Link } from '@chakra-ui/react'
import { APP_NAME, CONTACT_EMAIL } from '../../config'

export default function CookiesPage() {
  return (
    <Box bg="gray.50" minH="calc(100vh - 64px)" py={12}>
      <Container maxW="container.md">
        <VStack spacing={8} align="stretch">
          <Heading as="h1" size="xl" color="gray.800">
            Politique de Cookies
          </Heading>

          <Text color="gray.600" fontSize="sm">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </Text>

          <VStack spacing={6} align="stretch">
            {/* Introduction */}
            <Box>
              <Text color="gray.700">
                Cette politique explique comment {APP_NAME} utilise les cookies et technologies similaires
                sur notre site web. En utilisant notre site, vous acceptez l'utilisation de cookies conformément à cette politique.
              </Text>
            </Box>

            <Divider />

            {/* Qu'est-ce qu'un cookie */}
            <Box>
              <Heading as="h2" size="md" mb={3} color="primary.500">
                1. Qu'est-ce qu'un cookie ?
              </Heading>
              <Text color="gray.700">
                Un cookie est un petit fichier texte déposé sur votre appareil (ordinateur, smartphone, tablette)
                lors de la visite d'un site web. Il permet au site de mémoriser vos actions et préférences
                (comme la langue, la taille de police, etc.) pendant une période donnée.
              </Text>
            </Box>

            <Divider />

            {/* Types de cookies */}
            <Box>
              <Heading as="h2" size="md" mb={3} color="primary.500">
                2. Types de cookies utilisés
              </Heading>

              <VStack spacing={4} align="stretch" mt={4}>
                <Box>
                  <Heading as="h3" size="sm" mb={2} color="gray.700">
                    Cookies strictement nécessaires
                  </Heading>
                  <Text color="gray.700">
                    Ces cookies sont indispensables au fonctionnement du site. Ils vous permettent de naviguer
                    et d'utiliser les fonctionnalités essentielles (authentification, panier, paiement).
                    Sans ces cookies, certains services ne peuvent pas être fournis.
                  </Text>
                </Box>

                <Box>
                  <Heading as="h3" size="sm" mb={2} color="gray.700">
                    Cookies de fonctionnalité
                  </Heading>
                  <Text color="gray.700">
                    Ces cookies permettent au site de mémoriser vos choix (langue, région, préférences alimentaires)
                    pour vous offrir une expérience plus personnalisée.
                  </Text>
                </Box>

                <Box>
                  <Heading as="h3" size="sm" mb={2} color="gray.700">
                    Cookies de performance
                  </Heading>
                  <Text color="gray.700">
                    Ces cookies collectent des informations anonymes sur la façon dont les visiteurs utilisent le site,
                    nous permettant d'améliorer son fonctionnement et votre expérience.
                  </Text>
                </Box>

                <Box>
                  <Heading as="h3" size="sm" mb={2} color="gray.700">
                    Cookies de ciblage/publicitaires
                  </Heading>
                  <Text color="gray.700">
                    Ces cookies sont utilisés pour diffuser des publicités pertinentes pour vous et vos intérêts.
                    Ils limitent également le nombre de fois où vous voyez une publicité et aident à mesurer
                    l'efficacité des campagnes publicitaires.
                  </Text>
                </Box>
              </VStack>
            </Box>

            <Divider />

            {/* Liste des cookies */}
            <Box>
              <Heading as="h2" size="md" mb={3} color="primary.500">
                3. Liste des cookies utilisés
              </Heading>

              <Box overflowX="auto" mt={4}>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Nom</Th>
                      <Th>Type</Th>
                      <Th>Durée</Th>
                      <Th>Objectif</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    <Tr>
                      <Td>pause-dej-auth</Td>
                      <Td>Nécessaire</Td>
                      <Td>Session</Td>
                      <Td>Authentification utilisateur</Td>
                    </Tr>
                    <Tr>
                      <Td>pause-dej-cart</Td>
                      <Td>Nécessaire</Td>
                      <Td>7 jours</Td>
                      <Td>Mémorisation du panier</Td>
                    </Tr>
                    <Tr>
                      <Td>pause-dej-preferences</Td>
                      <Td>Fonctionnel</Td>
                      <Td>1 an</Td>
                      <Td>Préférences alimentaires</Td>
                    </Tr>
                    <Tr>
                      <Td>_ga</Td>
                      <Td>Analytique</Td>
                      <Td>2 ans</Td>
                      <Td>Google Analytics - ID visiteur</Td>
                    </Tr>
                    <Tr>
                      <Td>_gid</Td>
                      <Td>Analytique</Td>
                      <Td>24 heures</Td>
                      <Td>Google Analytics - ID session</Td>
                    </Tr>
                  </Tbody>
                </Table>
              </Box>
            </Box>

            <Divider />

            {/* Cookies tiers */}
            <Box>
              <Heading as="h2" size="md" mb={3} color="primary.500">
                4. Cookies tiers
              </Heading>
              <Text color="gray.700" mb={3}>
                Nous utilisons également des services tiers qui peuvent déposer des cookies :
              </Text>
              <UnorderedList spacing={2} color="gray.700" ml={6}>
                <ListItem>
                  <strong>Google Analytics</strong> : pour analyser l'utilisation du site et améliorer nos services
                </ListItem>
                <ListItem>
                  <strong>Stripe</strong> : pour le traitement sécurisé des paiements
                </ListItem>
                <ListItem>
                  <strong>Réseaux sociaux</strong> : pour partager du contenu (Facebook, Instagram)
                </ListItem>
              </UnorderedList>
            </Box>

            <Divider />

            {/* Gestion des cookies */}
            <Box>
              <Heading as="h2" size="md" mb={3} color="primary.500">
                5. Comment gérer les cookies ?
              </Heading>

              <Text color="gray.700" mb={3}>
                Vous pouvez contrôler et/ou supprimer les cookies comme vous le souhaitez.
                Vous pouvez supprimer tous les cookies déjà présents sur votre ordinateur et configurer
                la plupart des navigateurs pour qu'ils les bloquent.
              </Text>

              <Heading as="h3" size="sm" mb={2} color="gray.700">
                Configuration par navigateur :
              </Heading>
              <UnorderedList spacing={2} color="gray.700" ml={6}>
                <ListItem>
                  <Link href="https://support.google.com/chrome/answer/95647" isExternal color="brand.500">
                    Google Chrome
                  </Link>
                </ListItem>
                <ListItem>
                  <Link href="https://support.mozilla.org/fr/kb/activer-desactiver-cookies" isExternal color="brand.500">
                    Mozilla Firefox
                  </Link>
                </ListItem>
                <ListItem>
                  <Link href="https://support.apple.com/fr-fr/guide/safari/sfri11471/mac" isExternal color="brand.500">
                    Safari
                  </Link>
                </ListItem>
                <ListItem>
                  <Link href="https://support.microsoft.com/fr-fr/windows/supprimer-et-g%C3%A9rer-les-cookies" isExternal color="brand.500">
                    Microsoft Edge
                  </Link>
                </ListItem>
              </UnorderedList>

              <Text color="gray.700" mt={3} fontStyle="italic">
                Attention : Si vous bloquez les cookies nécessaires, certaines fonctionnalités du site
                ne seront plus disponibles (connexion, panier, paiement).
              </Text>
            </Box>

            <Divider />

            {/* Contact */}
            <Box>
              <Heading as="h2" size="md" mb={3} color="primary.500">
                6. Contact
              </Heading>
              <Text color="gray.700">
                Pour toute question concernant notre utilisation des cookies :
              </Text>
              <Text color="gray.700" mt={2}>
                Email : <Link href={`mailto:${CONTACT_EMAIL}`} color="brand.500">{CONTACT_EMAIL}</Link><br />
                Téléphone : 01 23 45 67 89
              </Text>
            </Box>
          </VStack>
        </VStack>
      </Container>
    </Box>
  )
}
