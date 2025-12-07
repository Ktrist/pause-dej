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
  HStack,
  Divider,
  useToast
} from '@chakra-ui/react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { FiMail, FiLock } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const { signIn, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const validateForm = () => {
    const newErrors = {}
    if (!email) {
      newErrors.email = 'Email requis'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email invalide'
    }
    if (!password) {
      newErrors.password = 'Mot de passe requis'
    } else if (password.length < 6) {
      newErrors.password = 'Minimum 6 caractères'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)

    if (error) {
      toast({
        title: 'Erreur de connexion',
        description: error.message,
        status: 'error',
        duration: 4000,
        isClosable: true
      })
    } else {
      toast({
        title: 'Connexion réussie',
        description: 'Bienvenue !',
        status: 'success',
        duration: 2000,
        isClosable: true
      })
      navigate('/')
    }
  }

  const handleGoogleLogin = async () => {
    const { error } = await signInWithGoogle()
    if (error) {
      toast({
        title: 'Erreur',
        description: error.message,
        status: 'error',
        duration: 4000,
        isClosable: true
      })
    }
  }

  return (
    <Box bg="gray.50" minH="calc(100vh - 64px)" py={16}>
      <Container maxW="md">
        <VStack spacing={8}>
          <VStack spacing={2}>
            <Heading size="xl" color="gray.800">
              Connexion
            </Heading>
            <Text color="gray.600">
              Connectez-vous pour accéder à votre compte
            </Text>
          </VStack>

          <Box bg="white" p={8} borderRadius="xl" boxShadow="lg" w="full">
            <form onSubmit={handleSubmit}>
              <VStack spacing={6}>
                <FormControl isInvalid={errors.email}>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    leftIcon={<FiMail />}
                  />
                  <FormErrorMessage>{errors.email}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={errors.password}>
                  <FormLabel>Mot de passe</FormLabel>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    leftIcon={<FiLock />}
                  />
                  <FormErrorMessage>{errors.password}</FormErrorMessage>
                </FormControl>

                <Link
                  as={RouterLink}
                  to="/forgot-password"
                  color="brand.500"
                  fontSize="sm"
                  alignSelf="flex-end"
                >
                  Mot de passe oublié ?
                </Link>

                <Button
                  type="submit"
                  colorScheme="brand"
                  size="lg"
                  w="full"
                  isLoading={loading}
                >
                  Se connecter
                </Button>

                <HStack w="full">
                  <Divider />
                  <Text fontSize="sm" color="gray.500" whiteSpace="nowrap">
                    ou
                  </Text>
                  <Divider />
                </HStack>

                <Button
                  variant="outline"
                  size="lg"
                  w="full"
                  onClick={handleGoogleLogin}
                  leftIcon={<Text>🔍</Text>}
                >
                  Continuer avec Google
                </Button>

                <Text fontSize="sm" color="gray.600" textAlign="center">
                  Pas encore de compte ?{' '}
                  <Link as={RouterLink} to="/signup" color="brand.500" fontWeight="600">
                    Créer un compte
                  </Link>
                </Text>
              </VStack>
            </form>
          </Box>
        </VStack>
      </Container>
    </Box>
  )
}
