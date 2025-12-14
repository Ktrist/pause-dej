import { useState } from 'react'
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Input,
  Button,
  useToast,
  FormControl,
  FormLabel,
  Checkbox,
  Stack
} from '@chakra-ui/react'
import { FiMail, FiCheck } from 'react-icons/fi'
import { useNewsletterSubscription } from '../../hooks/useNewsletter'

export default function NewsletterSubscribe({ variant = 'inline' }) {
  const [email, setEmail] = useState('')
  const [preferences, setPreferences] = useState({
    weekly_newsletter: true,
    promotions: true,
    product_updates: true
  })
  const { subscribe, loading } = useNewsletterSubscription()
  const toast = useToast()

  const handleSubscribe = async (e) => {
    e.preventDefault()

    if (!email || !email.includes('@')) {
      toast({
        title: 'Email invalide',
        description: 'Veuillez entrer une adresse email valide',
        status: 'error',
        duration: 3000
      })
      return
    }

    const { error } = await subscribe(email, 'homepage', preferences)

    if (error) {
      toast({
        title: 'Erreur',
        description: error,
        status: 'error',
        duration: 4000
      })
    } else {
      toast({
        title: 'Inscription confirmée !',
        description: 'Merci de vous être inscrit à notre newsletter',
        status: 'success',
        duration: 4000,
        icon: <FiCheck />
      })
      setEmail('')
    }
  }

  if (variant === 'inline') {
    return (
      <Box
        as="form"
        onSubmit={handleSubscribe}
        bg="gradient.brand"
        py={12}
        px={6}
        borderRadius="xl"
      >
        <VStack spacing={6} maxW="600px" mx="auto">
          <VStack spacing={2} textAlign="center">
            <FiMail size={40} color="var(--chakra-colors-brand-600)" />
            <Heading size="lg" color="gray.800">
              Restez informé !
            </Heading>
            <Text color="gray.600" fontSize="md">
              Recevez nos dernières offres, nouveaux plats et conseils nutrition
            </Text>
          </VStack>

          <HStack w="full" spacing={3}>
            <Input
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              bg="white"
              size="lg"
              required
            />
            <Button
              type="submit"
              colorScheme="brand"
              size="lg"
              px={8}
              isLoading={loading}
            >
              S'inscrire
            </Button>
          </HStack>

          <Text fontSize="xs" color="gray.500" textAlign="center">
            En vous inscrivant, vous acceptez de recevoir nos emails marketing.
            Vous pouvez vous désabonner à tout moment.
          </Text>
        </VStack>
      </Box>
    )
  }

  if (variant === 'footer') {
    return (
      <Box as="form" onSubmit={handleSubscribe}>
        <VStack align="start" spacing={4}>
          <VStack align="start" spacing={1}>
            <Heading size="sm" color="white">
              Newsletter
            </Heading>
            <Text fontSize="sm" color="gray.300">
              Recevez nos offres et nouveautés
            </Text>
          </VStack>

          <HStack w="full">
            <Input
              type="email"
              placeholder="Votre email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              bg="whiteAlpha.200"
              border="none"
              color="white"
              _placeholder={{ color: 'gray.400' }}
              required
            />
            <Button
              type="submit"
              colorScheme="brand"
              isLoading={loading}
            >
              OK
            </Button>
          </HStack>

          <Text fontSize="xs" color="gray.400">
            Désabonnement possible à tout moment
          </Text>
        </VStack>
      </Box>
    )
  }

  if (variant === 'modal') {
    return (
      <Box as="form" onSubmit={handleSubscribe}>
        <VStack spacing={6} align="stretch">
          <VStack spacing={2}>
            <FiMail size={48} color="var(--chakra-colors-brand-600)" />
            <Heading size="md">Rejoignez notre newsletter</Heading>
            <Text color="gray.600" textAlign="center" fontSize="sm">
              Restez informé de nos nouveaux plats, offres spéciales et conseils nutrition
            </Text>
          </VStack>

          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormControl>

          <VStack align="start" spacing={2}>
            <Text fontWeight="600" fontSize="sm">
              Je souhaite recevoir :
            </Text>
            <Stack spacing={2}>
              <Checkbox
                isChecked={preferences.weekly_newsletter}
                onChange={(e) =>
                  setPreferences({ ...preferences, weekly_newsletter: e.target.checked })
                }
                colorScheme="brand"
              >
                <Text fontSize="sm">Newsletter hebdomadaire</Text>
              </Checkbox>
              <Checkbox
                isChecked={preferences.promotions}
                onChange={(e) =>
                  setPreferences({ ...preferences, promotions: e.target.checked })
                }
                colorScheme="brand"
              >
                <Text fontSize="sm">Offres promotionnelles</Text>
              </Checkbox>
              <Checkbox
                isChecked={preferences.product_updates}
                onChange={(e) =>
                  setPreferences({ ...preferences, product_updates: e.target.checked })
                }
                colorScheme="brand"
              >
                <Text fontSize="sm">Nouveaux plats et mises à jour</Text>
              </Checkbox>
            </Stack>
          </VStack>

          <Button
            type="submit"
            colorScheme="brand"
            size="lg"
            w="full"
            isLoading={loading}
          >
            S'inscrire à la newsletter
          </Button>

          <Text fontSize="xs" color="gray.500" textAlign="center">
            Vos données sont protégées. Vous pouvez vous désabonner à tout moment.
          </Text>
        </VStack>
      </Box>
    )
  }

  return null
}
