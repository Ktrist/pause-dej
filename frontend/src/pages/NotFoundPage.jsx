import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Button,
  HStack,
  Link as ChakraLink
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { FiHome, FiShoppingCart } from 'react-icons/fi'

export default function NotFoundPage() {
  return (
    <Box bg="gray.50" minH="calc(100vh - 64px)" py={16}>
      <Container maxW="container.md">
        <VStack spacing={8} py={12}>
          <Box fontSize="8xl" fontWeight="800" color="brand.500">
            404
          </Box>

          <VStack spacing={4}>
            <Heading size="xl" color="gray.800" textAlign="center">
              Page introuvable
            </Heading>
            <Text color="gray.600" textAlign="center" maxW="md">
              Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
            </Text>
          </VStack>

          <HStack spacing={4} pt={4}>
            <Button
              as={RouterLink}
              to="/"
              leftIcon={<FiHome />}
              colorScheme="brand"
              size="lg"
            >
              Retour à l'accueil
            </Button>
            <Button
              as={RouterLink}
              to="/a-la-carte"
              leftIcon={<FiShoppingCart />}
              variant="outline"
              colorScheme="brand"
              size="lg"
            >
              Voir la carte
            </Button>
          </HStack>

          <Box pt={8}>
            <Text fontSize="sm" color="gray.500" textAlign="center">
              Besoin d'aide ? <ChakraLink as={RouterLink} to="/support" color="brand.500">Contactez-nous</ChakraLink>
            </Text>
          </Box>
        </VStack>
      </Container>
    </Box>
  )
}
