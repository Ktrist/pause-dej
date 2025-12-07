import { Spinner, VStack, Text } from '@chakra-ui/react'

export default function LoadingSpinner({ message = 'Chargement...' }) {
  return (
    <VStack spacing={4} py={12}>
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.200"
        color="brand.500"
        size="xl"
      />
      <Text color="gray.600" fontSize="sm">
        {message}
      </Text>
    </VStack>
  )
}
