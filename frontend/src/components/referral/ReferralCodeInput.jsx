import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Icon
} from '@chakra-ui/react'
import { FiGift } from 'react-icons/fi'
import { useState } from 'react'
import { useApplyReferralCode, useWasReferred } from '../../hooks/useReferral'

export default function ReferralCodeInput({ onSuccess }) {
  const [code, setCode] = useState('')
  const { applyCode, loading, error } = useApplyReferralCode()
  const { wasReferred, referralInfo, loading: checkingReferral } = useWasReferred()
  const [applied, setApplied] = useState(false)
  const toast = useToast()

  const handleApply = async () => {
    if (!code.trim()) {
      toast({
        title: 'Code requis',
        description: 'Veuillez entrer un code de parrainage',
        status: 'warning',
        duration: 3000
      })
      return
    }

    try {
      await applyCode(code)
      setApplied(true)
      toast({
        title: 'Code appliqué ! 🎉',
        description: 'Vous recevrez votre récompense après votre première commande',
        status: 'success',
        duration: 5000,
        isClosable: true
      })

      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      toast({
        title: 'Erreur',
        description: err.message || 'Code de parrainage invalide',
        status: 'error',
        duration: 4000,
        isClosable: true
      })
    }
  }

  // If user was already referred, show success message
  if (wasReferred || applied) {
    return (
      <Alert
        status="success"
        variant="subtle"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        borderRadius="lg"
        p={6}
      >
        <Icon as={FiGift} boxSize={10} color="green.500" mb={3} />
        <AlertTitle fontSize="lg" mb={2}>
          Code de parrainage appliqué !
        </AlertTitle>
        <AlertDescription fontSize="sm">
          Vous recevrez 10€ de crédit après votre première commande livrée.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Box
      p={6}
      borderWidth={2}
      borderColor="brand.200"
      borderRadius="lg"
      bg="brand.50"
    >
      <VStack spacing={4} align="stretch">
        <HStack>
          <Icon as={FiGift} boxSize={6} color="brand.600" />
          <VStack align="start" spacing={0}>
            <Text fontWeight="600" fontSize="lg">
              Vous avez un code de parrainage ?
            </Text>
            <Text fontSize="sm" color="gray.600">
              Obtenez 10€ de crédit sur votre première commande
            </Text>
          </VStack>
        </HStack>

        <FormControl isInvalid={!!error}>
          <FormLabel fontSize="sm">Code de parrainage</FormLabel>
          <HStack>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="XXXXXX"
              size="lg"
              maxLength={20}
              bg="white"
            />
            <Button
              onClick={handleApply}
              colorScheme="brand"
              size="lg"
              isLoading={loading}
              minW="120px"
            >
              Appliquer
            </Button>
          </HStack>
          {error && (
            <FormErrorMessage>{error}</FormErrorMessage>
          )}
        </FormControl>

        <Alert status="info" borderRadius="md" size="sm">
          <AlertIcon />
          <Box fontSize="sm">
            <AlertDescription>
              Le crédit sera automatiquement ajouté après la livraison de votre première commande
            </AlertDescription>
          </Box>
        </Alert>
      </VStack>
    </Box>
  )
}
