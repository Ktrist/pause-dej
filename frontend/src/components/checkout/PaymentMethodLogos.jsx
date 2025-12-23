import { Box, HStack, Text, VStack, Image, SimpleGrid } from '@chakra-ui/react'

export default function PaymentMethodLogos() {
  const cardLogos = [
    { name: 'Visa', color: '#1434CB' },
    { name: 'Mastercard', color: '#EB001B' },
    { name: 'Amex', color: '#006FCF' }
  ]

  const ticketRestaurantLogos = [
    { name: 'Swile', color: '#FF6B6B' },
    { name: 'Edenred', color: '#E31E24' },
    { name: 'Sodexo', color: '#E20074' }
  ]

  return (
    <VStack spacing={4} align="stretch" w="full">
      {/* Credit Cards */}
      <Box>
        <Text fontSize="xs" fontWeight="600" color="gray.600" mb={2}>
          Cartes bancaires acceptées
        </Text>
        <HStack spacing={3}>
          <Box
            px={3}
            py={2}
            bg="white"
            borderRadius="md"
            borderWidth="1px"
            borderColor="gray.200"
            display="flex"
            alignItems="center"
            justifyContent="center"
            minW="60px"
            h="38px"
          >
            <svg viewBox="0 0 48 32" width="32" height="22">
              <rect width="48" height="32" rx="4" fill="#1434CB"/>
              <path d="M18 10h12v12h-12z" fill="white"/>
              <text x="24" y="22" fontSize="8" fill="white" textAnchor="middle" fontFamily="Arial" fontWeight="bold">VISA</text>
            </svg>
          </Box>
          <Box
            px={3}
            py={2}
            bg="white"
            borderRadius="md"
            borderWidth="1px"
            borderColor="gray.200"
            display="flex"
            alignItems="center"
            justifyContent="center"
            minW="60px"
            h="38px"
          >
            <svg viewBox="0 0 48 32" width="32" height="22">
              <rect width="48" height="32" rx="4" fill="white"/>
              <circle cx="18" cy="16" r="10" fill="#EB001B"/>
              <circle cx="30" cy="16" r="10" fill="#F79E1B" opacity="0.8"/>
            </svg>
          </Box>
          <Box
            px={3}
            py={2}
            bg="white"
            borderRadius="md"
            borderWidth="1px"
            borderColor="gray.200"
            display="flex"
            alignItems="center"
            justifyContent="center"
            minW="60px"
            h="38px"
          >
            <svg viewBox="0 0 48 32" width="32" height="22">
              <rect width="48" height="32" rx="4" fill="#006FCF"/>
              <text x="24" y="20" fontSize="7" fill="white" textAnchor="middle" fontFamily="Arial" fontWeight="bold">AMEX</text>
            </svg>
          </Box>
        </HStack>
      </Box>

      {/* Tickets Restaurant */}
      <Box>
        <Text fontSize="xs" fontWeight="600" color="gray.600" mb={2}>
          Titres-restaurant acceptés
        </Text>
        <HStack spacing={3} flexWrap="wrap">
          <Box
            px={3}
            py={2}
            bg="white"
            borderRadius="md"
            borderWidth="1px"
            borderColor="gray.200"
            display="flex"
            alignItems="center"
            justifyContent="center"
            minW="65px"
            h="38px"
          >
            <Text fontSize="xs" fontWeight="bold" color="#FF6B6B">
              Swile
            </Text>
          </Box>
          <Box
            px={3}
            py={2}
            bg="white"
            borderRadius="md"
            borderWidth="1px"
            borderColor="gray.200"
            display="flex"
            alignItems="center"
            justifyContent="center"
            minW="65px"
            h="38px"
          >
            <Text fontSize="xs" fontWeight="bold" color="#E31E24">
              Edenred
            </Text>
          </Box>
          <Box
            px={3}
            py={2}
            bg="white"
            borderRadius="md"
            borderWidth="1px"
            borderColor="gray.200"
            display="flex"
            alignItems="center"
            justifyContent="center"
            minW="65px"
            h="38px"
          >
            <Text fontSize="xs" fontWeight="bold" color="#E20074">
              Sodexo
            </Text>
          </Box>
        </HStack>
      </Box>

      {/* Security badge */}
      <HStack spacing={2} pt={2}>
        <Text fontSize="2xs" color="gray.500">🔒</Text>
        <Text fontSize="2xs" color="gray.500">
          Paiement 100% sécurisé avec Stripe
        </Text>
      </HStack>
    </VStack>
  )
}
