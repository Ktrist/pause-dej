import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { FiUsers } from 'react-icons/fi'

export default function B2BReassuranceBanner() {
  return (
    <Box
      bg="background.alt"
      py={{ base: 16, md: 20 }}
      position="relative"
      overflow="hidden"
    >
      {/* Decorative background pattern */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        opacity="0.03"
        bgImage="repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 11px)"
        color="primary.500"
        pointerEvents="none"
      />

      <Container maxW="container.xl" position="relative">
        <VStack spacing={6} textAlign="center" maxW="700px" mx="auto">
          {/* Headline */}
          <Heading
            as="h2"
            fontSize={{ base: '2xl', md: '3xl', lg: '4xl' }}
            fontWeight="extrabold"
            color="primary.500"
            lineHeight="1.2"
          >
            La pause est meilleure ensemble
          </Heading>

          {/* Subtext */}
          <Text
            fontSize={{ base: 'lg', md: 'xl' }}
            color="text.secondary"
            fontWeight="medium"
            maxW="600px"
            whiteSpace="nowrap"
          >
            Livraison offerte pour les commandes groupées (dès 3 plats) !
          </Text>

          {/* CTA Button */}
          <HStack spacing={4} pt={4} flexWrap="wrap" justify="center">
            <Button
              as={RouterLink}
              to="/pause-dej-at-work"
              size="lg"
              variant="outline"
              borderColor="brand.500"
              color="brand.500"
              borderWidth="2px"
              leftIcon={<FiUsers />}
              _hover={{
                bg: 'brand.50',
                transform: 'translateY(-2px)',
                boxShadow: 'lg'
              }}
              _active={{
                bg: 'brand.100'
              }}
              px={8}
              py={7}
              fontSize="md"
              fontWeight="semibold"
              borderRadius="12px"
              transition="all 0.2s"
            >
              Inviter mes collègues
            </Button>
            <Button
              as={RouterLink}
              to="/comment-ca-marche"
              size="lg"
              variant="ghost"
              color="primary.500"
              _hover={{
                bg: 'primary.50'
              }}
              px={8}
              py={7}
              fontSize="md"
              fontWeight="semibold"
              borderRadius="12px"
              borderWidth="1px"
              borderColor="primary.500"
            >
              En savoir plus
            </Button>
          </HStack>

          {/* Additional trust indicators */}
          <HStack
            spacing={2}
            pt={6}
            fontSize="sm"
            color="text.light"
            fontWeight="medium"
            flexWrap="wrap"
            justify="center"
          >
            <Text whiteSpace="nowrap">✓ Livraison gratuite dès 3 plats   ✓ Facture mensuelle pour les entreprises   ✓ Tickets restaurant acceptés</Text>
          </HStack>
        </VStack>
      </Container>
    </Box>
  )
}
