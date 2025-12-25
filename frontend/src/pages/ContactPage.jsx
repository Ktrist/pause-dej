import { useState } from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  Card,
  CardBody,
  Icon,
  useToast,
  useColorModeValue
} from '@chakra-ui/react'
import { FiMail, FiPhone, FiMapPin, FiClock } from 'react-icons/fi'
import SEO from '../components/common/SEO'

const ContactInfoCard = ({ icon, title, children }) => {
  const bgColor = useColorModeValue('white', 'gray.800')
  const iconBg = useColorModeValue('brand.50', 'brand.900')

  return (
    <Card bg={bgColor}>
      <CardBody>
        <VStack align="start" spacing={3}>
          <Box p={3} bg={iconBg} borderRadius="lg">
            <Icon as={icon} boxSize={6} color="brand.600" />
          </Box>
          <Text fontWeight="600" fontSize="lg">
            {title}
          </Text>
          <Text color="gray.600">{children}</Text>
        </VStack>
      </CardBody>
    </Card>
  )
}

export default function ContactPage() {
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const toast = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate sending message (replace with actual API call)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: 'Message envoyé !',
      description: 'Nous vous répondrons dans les plus brefs délais.',
      status: 'success',
      duration: 5000,
      isClosable: true
    })

    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    })
    setIsSubmitting(false)
  }

  return (
    <>
      <SEO
        title="Nous Contacter - Pause Dej' Annecy"
        description="Une question ? Besoin d'aide ? Contactez notre équipe. Nous sommes là pour vous aider du lundi au vendredi."
        url="/contact"
      />
      <Box bg={bgColor} minH="calc(100vh - 64px)" py={16}>
        <Container maxW="container.xl">
          <VStack spacing={12} align="stretch">
            {/* Header */}
          <VStack spacing={4} textAlign="center" maxW="2xl" mx="auto">
            <Heading size="2xl">Contactez-nous</Heading>
            <Text fontSize="xl" color="gray.600">
              Une question ? Une suggestion ? Notre équipe est à votre écoute pour vous
              accompagner.
            </Text>
          </VStack>

          {/* Contact Info Cards */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            <ContactInfoCard icon={FiMail} title="Email">
              contact@pausedej.fr
            </ContactInfoCard>
            <ContactInfoCard icon={FiPhone} title="Téléphone">
              +33 4 50 12 34 56
            </ContactInfoCard>
            <ContactInfoCard icon={FiMapPin} title="Adresse">
              123 Rue de la Paix
              <br />
              74000 Annecy, France
            </ContactInfoCard>
            <ContactInfoCard icon={FiClock} title="Horaires de livraison">
              Lun - Ven: 7h - 9h
              <br />
              (Livraison matin uniquement)
            </ContactInfoCard>
          </SimpleGrid>

          {/* Contact Form */}
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={12}>
            {/* Form */}
            <Card>
              <CardBody>
                <form onSubmit={handleSubmit}>
                  <VStack spacing={6} align="stretch">
                    <Heading size="md">Envoyez-nous un message</Heading>

                    <FormControl isRequired>
                      <FormLabel>Nom complet</FormLabel>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Jean Dupont"
                      />
                    </FormControl>

                    <SimpleGrid columns={2} spacing={4}>
                      <FormControl isRequired>
                        <FormLabel>Email</FormLabel>
                        <Input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="jean@example.com"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Téléphone</FormLabel>
                        <Input
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+33 6 12 34 56 78"
                        />
                      </FormControl>
                    </SimpleGrid>

                    <FormControl isRequired>
                      <FormLabel>Sujet</FormLabel>
                      <Input
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Question sur une commande"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Message</FormLabel>
                      <Textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Votre message..."
                        rows={6}
                      />
                    </FormControl>

                    <Button
                      type="submit"
                      colorScheme="brand"
                      size="lg"
                      w="full"
                      isLoading={isSubmitting}
                    >
                      Envoyer le message
                    </Button>
                  </VStack>
                </form>
              </CardBody>
            </Card>

            {/* Map or Additional Info */}
            <Card>
              <CardBody>
                <VStack spacing={6} align="stretch" h="full">
                  <Heading size="md">Pourquoi nous contacter ?</Heading>
                  <VStack align="start" spacing={4}>
                    <Text color="gray.600">
                      ✓ Informations sur nos services de livraison
                    </Text>
                    <Text color="gray.600">✓ Questions sur votre commande</Text>
                    <Text color="gray.600">✓ Suggestions et feedback</Text>
                    <Text color="gray.600">✓ Offres B2B pour entreprises</Text>
                    <Text color="gray.600">✓ Partenariats et collaborations</Text>
                  </VStack>

                  <Box
                    flex={1}
                    bg="gray.100"
                    borderRadius="lg"
                    minH="300px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text color="gray.500" fontSize="sm">
                      📍 Carte interactive Google Maps
                    </Text>
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>
        </VStack>
      </Container>
      </Box>
    </>
  )
}
