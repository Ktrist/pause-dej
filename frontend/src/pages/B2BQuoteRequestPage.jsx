import { useState } from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Button,
  Card,
  CardBody,
  useToast,
  SimpleGrid,
  Icon,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useColorModeValue
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { FiCheckCircle, FiBuilding, FiMail, FiPhone, FiUsers } from 'react-icons/fi'
import { supabase } from '../supabaseClient'

export default function B2BQuoteRequestPage() {
  const toast = useToast()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [formData, setFormData] = useState({
    company_name: '',
    siret: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    employee_count: '',
    estimated_monthly_orders: '',
    industry: '',
    message: ''
  })

  const [errors, setErrors] = useState({})

  const bg = useColorModeValue('white', 'gray.800')

  const validateForm = () => {
    const newErrors = {}

    if (!formData.company_name.trim()) {
      newErrors.company_name = 'Le nom de l\'entreprise est requis'
    }

    if (!formData.contact_name.trim()) {
      newErrors.contact_name = 'Le nom du contact est requis'
    }

    if (!formData.contact_email.trim()) {
      newErrors.contact_email = 'L\'email est requis'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      newErrors.contact_email = 'Email invalide'
    }

    if (!formData.contact_phone.trim()) {
      newErrors.contact_phone = 'Le téléphone est requis'
    }

    if (!formData.employee_count || formData.employee_count < 1) {
      newErrors.employee_count = 'Le nombre d\'employés est requis'
    }

    if (formData.siret && formData.siret.length !== 14) {
      newErrors.siret = 'Le SIRET doit contenir 14 chiffres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: 'Erreur de validation',
        description: 'Veuillez corriger les erreurs dans le formulaire',
        status: 'error',
        duration: 5000
      })
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase
        .from('business_quote_requests')
        .insert([{
          company_name: formData.company_name,
          siret: formData.siret || null,
          contact_name: formData.contact_name,
          contact_email: formData.contact_email,
          contact_phone: formData.contact_phone,
          employee_count: parseInt(formData.employee_count),
          estimated_monthly_orders: formData.estimated_monthly_orders ?
            parseInt(formData.estimated_monthly_orders) : null,
          industry: formData.industry || null,
          message: formData.message || null
        }])

      if (error) throw error

      setSubmitted(true)
      toast({
        title: 'Demande envoyée !',
        description: 'Nous vous contacterons sous 24h',
        status: 'success',
        duration: 5000
      })

      // Reset form
      setFormData({
        company_name: '',
        siret: '',
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        employee_count: '',
        estimated_monthly_orders: '',
        industry: '',
        message: ''
      })
    } catch (err) {
      console.error('Error submitting quote request:', err)
      toast({
        title: 'Erreur',
        description: err.message || 'Une erreur est survenue',
        status: 'error',
        duration: 5000
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  if (submitted) {
    return (
      <Container maxW="container.md" py={20}>
        <Card bg={bg} shadow="xl">
          <CardBody>
            <VStack spacing={6} textAlign="center" py={8}>
              <Icon as={FiCheckCircle} boxSize={20} color="green.500" />
              <Heading size="xl">Demande envoyée !</Heading>
              <Text fontSize="lg" color="gray.600">
                Merci pour votre intérêt. Un de nos experts vous contactera sous 24h
                pour discuter de vos besoins et vous proposer une offre personnalisée.
              </Text>
              <Text fontSize="sm" color="gray.500">
                Vous recevrez également un email de confirmation à {formData.contact_email}
              </Text>
              <HStack spacing={4} pt={4}>
                <Button
                  colorScheme="brand"
                  onClick={() => navigate('/')}
                >
                  Retour à l'accueil
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSubmitted(false)}
                >
                  Faire une nouvelle demande
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    )
  }

  return (
    <Box py={20}>
      <Container maxW="container.lg">
        <VStack spacing={12}>
          {/* Header */}
          <VStack spacing={4} textAlign="center" maxW="3xl">
            <Heading size="2xl">Demande de devis B2B</Heading>
            <Text fontSize="lg" color="gray.600">
              Remplissez ce formulaire et nous vous contacterons sous 24h avec une offre
              personnalisée pour votre entreprise.
            </Text>
          </VStack>

          {/* Form */}
          <Card bg={bg} shadow="xl" w="full">
            <CardBody>
              <form onSubmit={handleSubmit}>
                <VStack spacing={8} align="stretch">
                  {/* Company Information */}
                  <Box>
                    <HStack spacing={2} mb={6}>
                      <Icon as={FiBuilding} color="brand.500" boxSize={6} />
                      <Heading size="md">Informations sur l'entreprise</Heading>
                    </HStack>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <FormControl isRequired isInvalid={errors.company_name}>
                        <FormLabel>Nom de l'entreprise</FormLabel>
                        <Input
                          value={formData.company_name}
                          onChange={(e) => handleChange('company_name', e.target.value)}
                          placeholder="Ex: Acme Corporation"
                        />
                        {errors.company_name && (
                          <Text fontSize="sm" color="red.500" mt={1}>{errors.company_name}</Text>
                        )}
                      </FormControl>

                      <FormControl isInvalid={errors.siret}>
                        <FormLabel>SIRET (optionnel)</FormLabel>
                        <Input
                          value={formData.siret}
                          onChange={(e) => handleChange('siret', e.target.value.replace(/\D/g, '').slice(0, 14))}
                          placeholder="12345678901234"
                          maxLength={14}
                        />
                        {errors.siret && (
                          <Text fontSize="sm" color="red.500" mt={1}>{errors.siret}</Text>
                        )}
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          14 chiffres
                        </Text>
                      </FormControl>

                      <FormControl isRequired isInvalid={errors.employee_count}>
                        <FormLabel>Nombre d'employés</FormLabel>
                        <NumberInput
                          value={formData.employee_count}
                          onChange={(value) => handleChange('employee_count', value)}
                          min={1}
                        >
                          <NumberInputField placeholder="Ex: 50" />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                        {errors.employee_count && (
                          <Text fontSize="sm" color="red.500" mt={1}>{errors.employee_count}</Text>
                        )}
                      </FormControl>

                      <FormControl>
                        <FormLabel>Commandes mensuelles estimées</FormLabel>
                        <NumberInput
                          value={formData.estimated_monthly_orders}
                          onChange={(value) => handleChange('estimated_monthly_orders', value)}
                          min={0}
                        >
                          <NumberInputField placeholder="Ex: 200" />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          Optionnel - nous aide à vous proposer la meilleure offre
                        </Text>
                      </FormControl>

                      <FormControl gridColumn={{ base: 'span 1', md: 'span 2' }}>
                        <FormLabel>Secteur d'activité</FormLabel>
                        <Select
                          value={formData.industry}
                          onChange={(e) => handleChange('industry', e.target.value)}
                          placeholder="Sélectionnez un secteur"
                        >
                          <option value="tech">Technologie / IT</option>
                          <option value="finance">Finance / Banque</option>
                          <option value="health">Santé</option>
                          <option value="retail">Commerce / Retail</option>
                          <option value="industry">Industrie</option>
                          <option value="services">Services</option>
                          <option value="education">Éducation</option>
                          <option value="other">Autre</option>
                        </Select>
                      </FormControl>
                    </SimpleGrid>
                  </Box>

                  {/* Contact Information */}
                  <Box>
                    <HStack spacing={2} mb={6}>
                      <Icon as={FiUsers} color="brand.500" boxSize={6} />
                      <Heading size="md">Contact principal</Heading>
                    </HStack>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <FormControl isRequired isInvalid={errors.contact_name}>
                        <FormLabel>Nom complet</FormLabel>
                        <Input
                          value={formData.contact_name}
                          onChange={(e) => handleChange('contact_name', e.target.value)}
                          placeholder="Ex: Jean Dupont"
                        />
                        {errors.contact_name && (
                          <Text fontSize="sm" color="red.500" mt={1}>{errors.contact_name}</Text>
                        )}
                      </FormControl>

                      <FormControl isRequired isInvalid={errors.contact_email}>
                        <FormLabel>Email professionnel</FormLabel>
                        <Input
                          type="email"
                          value={formData.contact_email}
                          onChange={(e) => handleChange('contact_email', e.target.value)}
                          placeholder="jean.dupont@entreprise.fr"
                        />
                        {errors.contact_email && (
                          <Text fontSize="sm" color="red.500" mt={1}>{errors.contact_email}</Text>
                        )}
                      </FormControl>

                      <FormControl isRequired isInvalid={errors.contact_phone} gridColumn={{ base: 'span 1', md: 'span 2' }}>
                        <FormLabel>Téléphone</FormLabel>
                        <Input
                          type="tel"
                          value={formData.contact_phone}
                          onChange={(e) => handleChange('contact_phone', e.target.value)}
                          placeholder="+33 1 23 45 67 89"
                        />
                        {errors.contact_phone && (
                          <Text fontSize="sm" color="red.500" mt={1}>{errors.contact_phone}</Text>
                        )}
                      </FormControl>
                    </SimpleGrid>
                  </Box>

                  {/* Additional Information */}
                  <Box>
                    <FormControl>
                      <FormLabel>Message (optionnel)</FormLabel>
                      <Textarea
                        value={formData.message}
                        onChange={(e) => handleChange('message', e.target.value)}
                        placeholder="Avez-vous des besoins spécifiques ? Des questions ? Parlez-nous de votre projet..."
                        rows={5}
                      />
                    </FormControl>
                  </Box>

                  {/* Info Alert */}
                  <Alert status="info" rounded="lg">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Réponse rapide garantie</AlertTitle>
                      <AlertDescription fontSize="sm">
                        Notre équipe vous contactera sous 24h (jours ouvrés) pour discuter
                        de vos besoins et vous proposer une offre personnalisée.
                      </AlertDescription>
                    </Box>
                  </Alert>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    colorScheme="brand"
                    size="lg"
                    isLoading={loading}
                    loadingText="Envoi en cours..."
                  >
                    Envoyer la demande
                  </Button>
                </VStack>
              </form>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  )
}
