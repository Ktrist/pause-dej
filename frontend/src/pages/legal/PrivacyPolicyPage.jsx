import { Box, Container, Heading, Text, VStack, Divider, UnorderedList, ListItem, Link } from '@chakra-ui/react'
import { APP_NAME, CONTACT_EMAIL } from '../../config'

export default function PrivacyPolicyPage() {
  return (
    <Box bg="gray.50" minH="calc(100vh - 64px)" py={12}>
      <Container maxW="container.md">
        <VStack spacing={8} align="stretch">
          <Heading as="h1" size="xl" color="gray.800">
            Politique de Confidentialité
          </Heading>

          <Text color="gray.600" fontSize="sm">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </Text>

          <VStack spacing={6} align="stretch">
            {/* Introduction */}
            <Box>
              <Text color="gray.700">
                {APP_NAME} accorde une grande importance à la protection de vos données personnelles.
                Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations
                conformément au Règlement Général sur la Protection des Données (RGPD).
              </Text>
            </Box>

            <Divider />

            {/* Données collectées */}
            <Box>
              <Heading as="h2" size="md" mb={3} color="primary.500">
                1. Données collectées
              </Heading>
              <Text color="gray.700" mb={3}>
                Nous collectons les informations suivantes :
              </Text>
              <UnorderedList spacing={2} color="gray.700" ml={6}>
                <ListItem>Données d'identification : nom, prénom, adresse email</ListItem>
                <ListItem>Données de contact : adresse de livraison, numéro de téléphone</ListItem>
                <ListItem>Données de commande : historique des achats, préférences alimentaires</ListItem>
                <ListItem>Données de paiement : traitées de manière sécurisée par notre prestataire Stripe</ListItem>
                <ListItem>Données de navigation : cookies, adresse IP, type de navigateur</ListItem>
              </UnorderedList>
            </Box>

            <Divider />

            {/* Finalités */}
            <Box>
              <Heading as="h2" size="md" mb={3} color="primary.500">
                2. Finalités du traitement
              </Heading>
              <Text color="gray.700" mb={3}>
                Vos données sont utilisées pour :
              </Text>
              <UnorderedList spacing={2} color="gray.700" ml={6}>
                <ListItem>Traiter et livrer vos commandes</ListItem>
                <ListItem>Gérer votre compte client</ListItem>
                <ListItem>Vous envoyer des communications relatives à vos commandes</ListItem>
                <ListItem>Améliorer nos services et personnaliser votre expérience</ListItem>
                <ListItem>Respecter nos obligations légales et réglementaires</ListItem>
                <ListItem>Avec votre consentement, vous envoyer des offres promotionnelles</ListItem>
              </UnorderedList>
            </Box>

            <Divider />

            {/* Base légale */}
            <Box>
              <Heading as="h2" size="md" mb={3} color="primary.500">
                3. Base légale du traitement
              </Heading>
              <Text color="gray.700">
                Le traitement de vos données repose sur :
              </Text>
              <UnorderedList spacing={2} color="gray.700" ml={6} mt={3}>
                <ListItem>L'exécution du contrat de vente (commande et livraison)</ListItem>
                <ListItem>Votre consentement (newsletters, marketing)</ListItem>
                <ListItem>Nos intérêts légitimes (amélioration du service)</ListItem>
                <ListItem>Le respect d'obligations légales (comptabilité, fiscalité)</ListItem>
              </UnorderedList>
            </Box>

            <Divider />

            {/* Durée de conservation */}
            <Box>
              <Heading as="h2" size="md" mb={3} color="primary.500">
                4. Durée de conservation
              </Heading>
              <Text color="gray.700">
                Vos données sont conservées pendant :
              </Text>
              <UnorderedList spacing={2} color="gray.700" ml={6} mt={3}>
                <ListItem>Données de compte : durée de la relation commerciale + 3 ans</ListItem>
                <ListItem>Données de commande : 10 ans (obligations comptables)</ListItem>
                <ListItem>Données de paiement : jamais stockées (gérées par Stripe)</ListItem>
                <ListItem>Données marketing : 3 ans après le dernier contact</ListItem>
              </UnorderedList>
            </Box>

            <Divider />

            {/* Partage des données */}
            <Box>
              <Heading as="h2" size="md" mb={3} color="primary.500">
                5. Partage des données
              </Heading>
              <Text color="gray.700">
                Vos données peuvent être partagées avec :
              </Text>
              <UnorderedList spacing={2} color="gray.700" ml={6} mt={3}>
                <ListItem>Notre prestataire de paiement (Stripe) pour le traitement sécurisé des paiements</ListItem>
                <ListItem>Nos prestataires de livraison pour assurer la livraison de vos commandes</ListItem>
                <ListItem>Nos sous-traitants techniques (hébergement, support client)</ListItem>
              </UnorderedList>
              <Text color="gray.700" mt={3}>
                Nous ne vendons jamais vos données à des tiers.
              </Text>
            </Box>

            <Divider />

            {/* Vos droits */}
            <Box>
              <Heading as="h2" size="md" mb={3} color="primary.500">
                6. Vos droits
              </Heading>
              <Text color="gray.700" mb={3}>
                Conformément au RGPD, vous disposez des droits suivants :
              </Text>
              <UnorderedList spacing={2} color="gray.700" ml={6}>
                <ListItem><strong>Droit d'accès</strong> : obtenir une copie de vos données</ListItem>
                <ListItem><strong>Droit de rectification</strong> : corriger vos données inexactes</ListItem>
                <ListItem><strong>Droit à l'effacement</strong> : supprimer vos données sous certaines conditions</ListItem>
                <ListItem><strong>Droit à la limitation</strong> : limiter le traitement de vos données</ListItem>
                <ListItem><strong>Droit à la portabilité</strong> : récupérer vos données dans un format structuré</ListItem>
                <ListItem><strong>Droit d'opposition</strong> : vous opposer au traitement de vos données</ListItem>
                <ListItem><strong>Droit de retirer votre consentement</strong> : à tout moment</ListItem>
              </UnorderedList>
              <Text color="gray.700" mt={4}>
                Pour exercer vos droits, contactez-nous à : <Link href={`mailto:${CONTACT_EMAIL}`} color="brand.500">{CONTACT_EMAIL}</Link>
              </Text>
            </Box>

            <Divider />

            {/* Sécurité */}
            <Box>
              <Heading as="h2" size="md" mb={3} color="primary.500">
                7. Sécurité des données
              </Heading>
              <Text color="gray.700">
                Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données
                contre la perte, l'utilisation abusive, l'accès non autorisé, la divulgation, l'altération ou la destruction.
                Cela inclut le chiffrement SSL, des pare-feu, des sauvegardes régulières et un accès restreint aux données.
              </Text>
            </Box>

            <Divider />

            {/* Cookies */}
            <Box>
              <Heading as="h2" size="md" mb={3} color="primary.500">
                8. Cookies
              </Heading>
              <Text color="gray.700">
                Notre site utilise des cookies pour améliorer votre expérience. Pour en savoir plus, consultez notre
                <Link href="/legal/cookies" color="brand.500" ml={1}>Politique de cookies</Link>.
              </Text>
            </Box>

            <Divider />

            {/* Contact */}
            <Box>
              <Heading as="h2" size="md" mb={3} color="primary.500">
                9. Contact
              </Heading>
              <Text color="gray.700">
                Pour toute question concernant cette politique de confidentialité ou vos données personnelles :
              </Text>
              <Text color="gray.700" mt={2}>
                Email : <Link href={`mailto:${CONTACT_EMAIL}`} color="brand.500">{CONTACT_EMAIL}</Link><br />
                Téléphone : 01 23 45 67 89<br />
                Adresse : {APP_NAME}, Annecy, France
              </Text>
              <Text color="gray.700" mt={3}>
                Vous avez également le droit de déposer une plainte auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés).
              </Text>
            </Box>
          </VStack>
        </VStack>
      </Container>
    </Box>
  )
}
