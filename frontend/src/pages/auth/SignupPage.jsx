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
  Checkbox,
  useToast
} from '@chakra-ui/react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useNewsletterSubscription } from '../../hooks/useNewsletter'

export default function SignupPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [newsletterOptIn, setNewsletterOptIn] = useState(true)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const { signUp, signInWithGoogle } = useAuth()
  const { subscribe } = useNewsletterSubscription()
  const navigate = useNavigate()
  const toast = useToast()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.fullName) newErrors.fullName = 'Nom requis'
    if (!formData.email) {
      newErrors.email = 'Email requis'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide'
    }
    if (!formData.phone) {
      newErrors.phone = 'Téléphone requis'
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Numéro invalide (10 chiffres)'
    }
    if (!formData.password) {
      newErrors.password = 'Mot de passe requis'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Minimum 6 caractères'
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    const { error } = await signUp(formData.email, formData.password, {
      full_name: formData.fullName,
      phone: formData.phone
    })

    // Subscribe to newsletter if opted in
    if (!error && newsletterOptIn) {
      await subscribe(formData.email, 'signup')
    }

    setLoading(false)

    if (error) {
      toast({
        title: 'Erreur d\'inscription',
        description: error.message,
        status: 'error',
        duration: 4000,
        isClosable: true
      })
    } else {
      toast({
        title: 'Compte créé !',
        description: 'Vérifiez votre email pour confirmer votre compte',
        status: 'success',
        duration: 5000,
        isClosable: true
      })
      navigate('/login')
    }
  }

  const handleGoogleSignup = async () => {
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
              Créer un compte
            </Heading>
            <Text color="gray.600">
              Rejoignez Pause Dej' et profitez de nos plats
            </Text>
          </VStack>

          <Box bg="white" p={8} borderRadius="xl" boxShadow="lg" w="full">
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl isInvalid={errors.fullName}>
                  <FormLabel>Nom complet</FormLabel>
                  <Input
                    name="fullName"
                    placeholder="Jean Dupont"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                  <FormErrorMessage>{errors.fullName}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={errors.email}>
                  <FormLabel>Email</FormLabel>
                  <Input
                    name="email"
                    type="email"
                    placeholder="jean.dupont@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  <FormErrorMessage>{errors.email}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={errors.phone}>
                  <FormLabel>Téléphone</FormLabel>
                  <Input
                    name="phone"
                    type="tel"
                    placeholder="06 12 34 56 78"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                  <FormErrorMessage>{errors.phone}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={errors.password}>
                  <FormLabel>Mot de passe</FormLabel>
                  <Input
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <FormErrorMessage>{errors.password}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={errors.confirmPassword}>
                  <FormLabel>Confirmer le mot de passe</FormLabel>
                  <Input
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
                </FormControl>

                <Checkbox
                  isChecked={newsletterOptIn}
                  onChange={(e) => setNewsletterOptIn(e.target.checked)}
                  colorScheme="brand"
                  w="full"
                >
                  <Text fontSize="sm">
                    Je souhaite recevoir la newsletter et les offres promotionnelles
                  </Text>
                </Checkbox>

                <Button
                  type="submit"
                  colorScheme="brand"
                  size="lg"
                  w="full"
                  isLoading={loading}
                >
                  Créer mon compte
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
                  onClick={handleGoogleSignup}
                  leftIcon={<Text>🔍</Text>}
                >
                  Continuer avec Google
                </Button>

                <Text fontSize="sm" color="gray.600" textAlign="center">
                  Déjà un compte ?{' '}
                  <Link as={RouterLink} to="/login" color="brand.500" fontWeight="600">
                    Se connecter
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
