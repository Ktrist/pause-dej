import { useState } from 'react'
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Input,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Link,
  useToast,
  Icon
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { FiMail, FiArrowLeft } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const { resetPassword } = useAuth()
  const toast = useToast()

  const validateEmail = (email) => {
    if (!email) return 'Email requis'
    if (!/\S+@\S+\.\S+/.test(email)) return 'Email invalide'
    return ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const emailError = validateEmail(email)
    if (emailError) {
      setError(emailError)
      return
    }

    setLoading(true)
    setError('')

    const { error: resetError } = await resetPassword(email)
    setLoading(false)

    if (resetError) {
      toast({
        title: 'Erreur',
        description: resetError.message,
        status: 'error',
        duration: 4000,
        isClosable: true
      })
    } else {
      setEmailSent(true)
      toast({
        title: 'Email envoyé !',
        description: 'Vérifiez votre boîte mail pour réinitialiser votre mot de passe',
        status: 'success',
        duration: 6000,
        isClosable: true
      })
    }
  }

  if (emailSent) {
    return (
      <Box bg="gray.50" minH="calc(100vh - 64px)" py={16}>
        <Container maxW="md">
          <VStack spacing={8}>
            <Box fontSize="6xl">📧</Box>
            <VStack spacing={4} textAlign="center">
              <Heading size="lg" color="gray.800">
                Email envoyé !
              </Heading>
              <Text color="gray.600" maxW="md">
                Nous avons envoyé un lien de réinitialisation à <strong>{email}</strong>.
                Vérifiez votre boîte mail (et vos spams).
              </Text>
              <Text color="gray.500" fontSize="sm">
                Le lien est valide pendant 1 heure.
              </Text>
            </VStack>
            <VStack spacing={3} w="full">
              <Button
                as={RouterLink}
                to="/login"
                colorScheme="brand"
                size="lg"
                w="full"
              >
                Retour à la connexion
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setEmailSent(false)
                  setEmail('')
                }}
              >
                Renvoyer l'email
              </Button>
            </VStack>
          </VStack>
        </Container>
      </Box>
    )
  }

  return (
    <Box bg="gray.50" minH="calc(100vh - 64px)" py={16}>
      <Container maxW="md">
        <VStack spacing={8}>
          <VStack spacing={2}>
            <Heading size="xl" color="gray.800">
              Mot de passe oublié
            </Heading>
            <Text color="gray.600" textAlign="center">
              Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe
            </Text>
          </VStack>

          <Box bg="white" p={8} borderRadius="xl" boxShadow="lg" w="full">
            <form onSubmit={handleSubmit}>
              <VStack spacing={6}>
                <FormControl isInvalid={error}>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError('')
                    }}
                    size="lg"
                  />
                  <FormErrorMessage>{error}</FormErrorMessage>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="brand"
                  size="lg"
                  w="full"
                  isLoading={loading}
                  leftIcon={<Icon as={FiMail} />}
                >
                  Envoyer le lien
                </Button>

                <Link
                  as={RouterLink}
                  to="/login"
                  color="brand.500"
                  fontSize="sm"
                  display="flex"
                  alignItems="center"
                  gap={2}
                >
                  <Icon as={FiArrowLeft} />
                  Retour à la connexion
                </Link>
              </VStack>
            </form>
          </Box>

          <Text fontSize="sm" color="gray.500" textAlign="center">
            Vous n'avez pas encore de compte ?{' '}
            <Link as={RouterLink} to="/signup" color="brand.500" fontWeight="600">
              Créer un compte
            </Link>
          </Text>
        </VStack>
      </Container>
    </Box>
  )
}
