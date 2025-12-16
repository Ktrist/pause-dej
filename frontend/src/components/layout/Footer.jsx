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
import { FiMail, FiPhone, FiMapPin, FiFacebook, FiInstagram, FiTwitter } from 'react-icons/fi'
import { APP_NAME, CONTACT_EMAIL } from '../../config'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <Box bg="gray.900" color="white">
      <Container maxW="container.xl" py={12}>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
          {/* Company Info */}
          <VStack align="start" spacing={4}>
            <Heading size="md" color="brand.500">
              {APP_NAME}
            </Heading>
            <Text fontSize="sm" color="gray.400">
              Des plats frais livrés chaque matin.
              Votre pause déjeuner réinventée.
            </Text>
            <HStack spacing={3}>
              <Link href="#" _hover={{ color: 'brand.500' }}>
                <Icon as={FiFacebook} boxSize={5} />
              </Link>
              <Link href="#" _hover={{ color: 'brand.500' }}>
                <Icon as={FiInstagram} boxSize={5} />
              </Link>
              <Link href="#" _hover={{ color: 'brand.500' }}>
                <Icon as={FiTwitter} boxSize={5} />
              </Link>
            </HStack>
          </VStack>

          {/* Quick Links */}
          <VStack align="start" spacing={3}>
            <Heading size="sm" mb={2}>
              Liens rapides
            </Heading>
            <Link
              as={RouterLink}
              to="/"
              fontSize="sm"
              color="gray.400"
              _hover={{ color: 'white', textDecoration: 'none' }}
            >
              Accueil
            </Link>
            <Link
              as={RouterLink}
              to="/catalogue"
              fontSize="sm"
              color="gray.400"
              _hover={{ color: 'white', textDecoration: 'none' }}
            >
              Catalogue
            </Link>
            <Link
              as={RouterLink}
              to="/how-it-works"
              fontSize="sm"
              color="gray.400"
              _hover={{ color: 'white', textDecoration: 'none' }}
            >
              Comment ça marche
            </Link>
            <Link
              as={RouterLink}
              to="/b2b"
              fontSize="sm"
              color="gray.400"
              _hover={{ color: 'white', textDecoration: 'none' }}
            >
              Offre B2B
            </Link>
          </VStack>

          {/* Legal */}
          <VStack align="start" spacing={3}>
            <Heading size="sm" mb={2}>
              Informations légales
            </Heading>
            {['Mentions légales', 'CGV', 'Politique de confidentialité', 'Cookies'].map((item) => (
              <Link
                key={item}
                href="#"
                fontSize="sm"
                color="gray.400"
                _hover={{ color: 'white', textDecoration: 'none' }}
              >
                {item}
              </Link>
            ))}
          </VStack>

          {/* Contact */}
          <VStack align="start" spacing={3}>
            <Heading size="sm" mb={2}>
              Contact
            </Heading>
            <HStack spacing={2} align="start">
              <Icon as={FiMail} boxSize={4} color="brand.500" mt={1} />
              <Link
                href={`mailto:${CONTACT_EMAIL}`}
                fontSize="sm"
                color="gray.400"
                _hover={{ color: 'white' }}
              >
                {CONTACT_EMAIL}
              </Link>
            </HStack>
            <HStack spacing={2} align="start">
              <Icon as={FiPhone} boxSize={4} color="brand.500" mt={1} />
              <Text fontSize="sm" color="gray.400">
                01 23 45 67 89
              </Text>
            </HStack>
            <HStack spacing={2} align="start">
              <Icon as={FiMapPin} boxSize={4} color="brand.500" mt={1} />
              <Text fontSize="sm" color="gray.400">
                75001 Paris, France
              </Text>
            </HStack>
          </VStack>
        </SimpleGrid>

        <Divider my={8} borderColor="gray.700" />

        <Stack
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align="center"
          fontSize="sm"
          color="gray.400"
        >
          <Text>
            © {currentYear} {APP_NAME}. Tous droits réservés.
          </Text>
          <HStack spacing={4}>
            <Link as={RouterLink} to="/support" _hover={{ color: 'white' }}>
              Aide
            </Link>
            <Link as={RouterLink} to="/support" _hover={{ color: 'white' }}>
              FAQ
            </Link>
            <Link as={RouterLink} to="/contact" _hover={{ color: 'white' }}>
              Contact
            </Link>
          </HStack>
        </Stack>
      </Container>
    </Box>
  )
}
