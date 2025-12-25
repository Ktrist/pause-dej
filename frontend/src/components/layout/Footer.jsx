import {
  Box,
  Container,
  Stack,
  SimpleGrid,
  Text,
  Link,
  VStack,
  HStack,
  Icon,
  Divider,
  Heading
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { FiMail, FiPhone, FiMapPin, FiFacebook, FiInstagram } from 'react-icons/fi'
import { APP_NAME, CONTACT_EMAIL } from '../../config'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <Box bg="primary.500" color="white">
      <Container maxW="container.xl" py={12}>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
          {/* Company Info */}
          <VStack align="start" spacing={4}>
            <Heading size="md" color="white" fontWeight="extrabold">
              {APP_NAME}
            </Heading>
            <Text fontSize="sm" color="whiteAlpha.800" fontWeight="medium">
              Des plats frais livrés chaque matin.
              Votre pause déjeuner réinventée.
            </Text>
            <HStack spacing={3}>
              <Link href="#" _hover={{ color: 'brand.400' }} transition="color 0.2s">
                <Icon as={FiFacebook} boxSize={5} />
              </Link>
              <Link href="#" _hover={{ color: 'brand.400' }} transition="color 0.2s">
                <Icon as={FiInstagram} boxSize={5} />
              </Link>
            </HStack>
          </VStack>

          {/* Quick Links */}
          <VStack align="start" spacing={3}>
            <Heading size="sm" mb={2} color="white" fontWeight="bold">
              Liens rapides
            </Heading>
            <Link
              as={RouterLink}
              to="/"
              fontSize="sm"
              color="whiteAlpha.800"
              fontWeight="medium"
              _hover={{ color: 'brand.400', textDecoration: 'none' }}
              transition="color 0.2s"
            >
              Accueil
            </Link>
            <Link
              as={RouterLink}
              to="/a-la-carte"
              fontSize="sm"
              color="whiteAlpha.800"
              fontWeight="medium"
              _hover={{ color: 'brand.400', textDecoration: 'none' }}
              transition="color 0.2s"
            >
              A la carte
            </Link>
            <Link
              as={RouterLink}
              to="/comment-ca-marche"
              fontSize="sm"
              color="whiteAlpha.800"
              fontWeight="medium"
              _hover={{ color: 'brand.400', textDecoration: 'none' }}
              transition="color 0.2s"
            >
              Comment ça marche
            </Link>
            <Link
              as={RouterLink}
              to="/pause-dej-at-work"
              fontSize="sm"
              color="whiteAlpha.800"
              fontWeight="medium"
              _hover={{ color: 'brand.400', textDecoration: 'none' }}
              transition="color 0.2s"
            >
              Pause Dej' At Work
            </Link>
          </VStack>

          {/* Legal */}
          <VStack align="start" spacing={3}>
            <Heading size="sm" mb={2} color="white" fontWeight="bold">
              Informations légales
            </Heading>
            <Link
              as={RouterLink}
              to="/legal/mentions-legales"
              fontSize="sm"
              color="whiteAlpha.800"
              fontWeight="medium"
              _hover={{ color: 'brand.400', textDecoration: 'none' }}
              transition="color 0.2s"
            >
              Mentions légales
            </Link>
            <Link
              as={RouterLink}
              to="/legal/cgv"
              fontSize="sm"
              color="whiteAlpha.800"
              fontWeight="medium"
              _hover={{ color: 'brand.400', textDecoration: 'none' }}
              transition="color 0.2s"
            >
              CGV
            </Link>
            <Link
              as={RouterLink}
              to="/legal/confidentialite"
              fontSize="sm"
              color="whiteAlpha.800"
              fontWeight="medium"
              _hover={{ color: 'brand.400', textDecoration: 'none' }}
              transition="color 0.2s"
            >
              Politique de confidentialité
            </Link>
            <Link
              as={RouterLink}
              to="/legal/cookies"
              fontSize="sm"
              color="whiteAlpha.800"
              fontWeight="medium"
              _hover={{ color: 'brand.400', textDecoration: 'none' }}
              transition="color 0.2s"
            >
              Cookies
            </Link>
          </VStack>

          {/* Contact */}
          <VStack align="start" spacing={3}>
            <Heading size="sm" mb={2} color="white" fontWeight="bold">
              Contact
            </Heading>
            <HStack spacing={2} align="start">
              <Icon as={FiMail} boxSize={4} color="brand.400" mt={1} />
              <Link
                href={`mailto:${CONTACT_EMAIL}`}
                fontSize="sm"
                color="whiteAlpha.800"
                fontWeight="medium"
                _hover={{ color: 'brand.400' }}
                transition="color 0.2s"
              >
                {CONTACT_EMAIL}
              </Link>
            </HStack>
            <HStack spacing={2} align="start">
              <Icon as={FiPhone} boxSize={4} color="brand.400" mt={1} />
              <Text fontSize="sm" color="whiteAlpha.800" fontWeight="medium">
                01 23 45 67 89
              </Text>
            </HStack>
            <HStack spacing={2} align="start">
              <Icon as={FiMapPin} boxSize={4} color="brand.400" mt={1} />
              <Text fontSize="sm" color="whiteAlpha.800" fontWeight="medium">
                Annecy
              </Text>
            </HStack>
          </VStack>
        </SimpleGrid>

        <Divider my={8} borderColor="whiteAlpha.300" />

        <Stack
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align="center"
          fontSize="sm"
          color="whiteAlpha.700"
          spacing={{ base: 4, md: 0 }}
        >
          <Text fontWeight="medium">
            © {currentYear} {APP_NAME}. Tous droits réservés.
          </Text>
          <Text fontWeight="medium" display={{ base: 'block', md: 'block' }}>
            Fait avec ❤️ à Annecy
          </Text>
          <HStack spacing={4}>
            <Link
              as={RouterLink}
              to="/support"
              fontWeight="medium"
              _hover={{ color: 'brand.400' }}
              transition="color 0.2s"
            >
              FAQ & Support
            </Link>
            <Link
              as={RouterLink}
              to="/contact"
              fontWeight="medium"
              _hover={{ color: 'brand.400' }}
              transition="color 0.2s"
            >
              Contact
            </Link>
          </HStack>
        </Stack>
      </Container>
    </Box>
  )
}
