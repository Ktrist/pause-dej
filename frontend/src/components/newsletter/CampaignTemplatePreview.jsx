import {
  Box,
  VStack,
  HStack,
  Text,
  Image,
  Badge,
  Radio,
  RadioGroup,
  Stack,
  Card,
  CardBody,
  Heading,
  SimpleGrid
} from '@chakra-ui/react'
import { FiMail, FiSmartphone } from 'react-icons/fi'

const EMAIL_TEMPLATES = {
  newsletter: {
    id: 'newsletter',
    name: 'Newsletter Hebdomadaire',
    description: 'Template moderne avec header gradient et sections pour les plats',
    preview: '/templates/newsletter-preview.png',
    channel: 'email',
    category: 'newsletter',
    fields: {
      subtitle: 'Sous-titre personnalisé',
      content: 'Contenu HTML principal',
      featuredDishes: 'Liste des plats à mettre en avant'
    }
  },
  promo: {
    id: 'promo',
    name: 'Offre Promotionnelle',
    description: 'Template accrocheur avec code promo en évidence',
    preview: '/templates/promo-preview.png',
    channel: 'email',
    category: 'promo',
    fields: {
      title: 'Titre de l\'offre',
      discount: 'Pourcentage ou montant',
      promoCode: 'Code promo',
      expiryDate: 'Date d\'expiration',
      description: 'Description de l\'offre'
    }
  },
  reactivation: {
    id: 'reactivation',
    name: 'Réactivation Client',
    description: 'Template personnalisé pour reconquérir les clients inactifs',
    preview: '/templates/reactivation-preview.png',
    channel: 'email',
    category: 'reactivation',
    fields: {
      customerName: 'Nom du client',
      daysSinceOrder: 'Jours depuis dernière commande',
      welcomeBackOffer: 'Offre de retour',
      lastFavoriteDish: 'Dernier plat favori'
    }
  },
  announcement: {
    id: 'announcement',
    name: 'Annonce Importante',
    description: 'Template simple et direct pour les communications importantes',
    preview: '/templates/announcement-preview.png',
    channel: 'email',
    category: 'announcement',
    fields: {
      title: 'Titre de l\'annonce',
      content: 'Contenu de l\'annonce',
      ctaText: 'Texte du bouton',
      ctaUrl: 'Lien du bouton'
    }
  }
}

const SMS_TEMPLATES = {
  'sms-promo': {
    id: 'sms-promo',
    name: 'SMS Promo',
    description: 'Message court avec code promo',
    preview: null,
    channel: 'sms',
    category: 'promo',
    maxLength: 160,
    example: '🎉 PAUSE DEJ: -20% avec le code PAUSE20 valable jusqu\'au 31/01. Commander: pause-dej.fr',
    fields: {
      discount: 'Réduction',
      promoCode: 'Code',
      expiryDate: 'Expiration',
      url: 'Lien court'
    }
  },
  'sms-order': {
    id: 'sms-order',
    name: 'SMS Commande',
    description: 'Notification de statut de commande',
    preview: null,
    channel: 'sms',
    category: 'announcement',
    maxLength: 160,
    example: 'Votre commande #1234 est en route! Livraison dans 15 min. Suivre: pause-dej.fr/track/1234',
    fields: {
      orderNumber: 'N° commande',
      status: 'Statut',
      eta: 'Temps estimé',
      trackingUrl: 'Lien suivi'
    }
  },
  'sms-reactivation': {
    id: 'sms-reactivation',
    name: 'SMS Réactivation',
    description: 'Message pour clients inactifs',
    preview: null,
    channel: 'sms',
    category: 'reactivation',
    maxLength: 160,
    example: 'Ça faisait longtemps! 😊 -15% sur votre retour avec RETOUR15. On vous a manqué? pause-dej.fr',
    fields: {
      customerName: 'Prénom',
      offer: 'Offre',
      promoCode: 'Code',
      url: 'Lien'
    }
  }
}

export default function CampaignTemplatePreview({
  campaignType,
  selectedTemplate,
  onTemplateSelect,
  channel = 'email'
}) {
  const templates = channel === 'email' ? EMAIL_TEMPLATES : SMS_TEMPLATES
  const availableTemplates = Object.values(templates).filter(
    t => !campaignType || t.category === campaignType
  )

  if (availableTemplates.length === 0) {
    return (
      <Box py={8} textAlign="center">
        <Text color="gray.500">Aucun template disponible pour ce type de campagne</Text>
      </Box>
    )
  }

  return (
    <VStack spacing={4} align="stretch">
      <HStack justify="space-between">
        <Heading size="sm">Choisissez un template</Heading>
        <Badge colorScheme={channel === 'email' ? 'blue' : 'green'} fontSize="sm">
          <HStack spacing={1}>
            {channel === 'email' ? <FiMail /> : <FiSmartphone />}
            <Text>{channel === 'email' ? 'Email' : 'SMS'}</Text>
          </HStack>
        </Badge>
      </HStack>

      <RadioGroup value={selectedTemplate} onChange={onTemplateSelect}>
        <Stack spacing={3}>
          {availableTemplates.map((template) => (
            <Card
              key={template.id}
              variant="outline"
              borderWidth={2}
              borderColor={selectedTemplate === template.id ? 'brand.500' : 'gray.200'}
              bg={selectedTemplate === template.id ? 'brand.50' : 'white'}
              cursor="pointer"
              onClick={() => onTemplateSelect(template.id)}
              _hover={{
                borderColor: 'brand.500',
                transform: 'translateY(-2px)',
                boxShadow: 'md'
              }}
              transition="all 0.2s"
            >
              <CardBody>
                <HStack spacing={4} align="start">
                  <Radio value={template.id} colorScheme="brand" />

                  {channel === 'email' ? (
                    <>
                      {/* Email Template Preview */}
                      <VStack align="start" flex={1} spacing={2}>
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="600" fontSize="md">
                            {template.name}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            {template.description}
                          </Text>
                        </VStack>

                        {/* Template Fields */}
                        <Box>
                          <Text fontSize="xs" fontWeight="600" color="gray.700" mb={1}>
                            Champs requis:
                          </Text>
                          <HStack spacing={2} flexWrap="wrap">
                            {Object.entries(template.fields).map(([key, label]) => (
                              <Badge key={key} size="sm" colorScheme="purple" fontSize="xs">
                                {label}
                              </Badge>
                            ))}
                          </HStack>
                        </Box>
                      </VStack>

                      {/* Preview Image */}
                      {template.preview && (
                        <Box
                          w="120px"
                          h="160px"
                          borderRadius="md"
                          overflow="hidden"
                          border="1px solid"
                          borderColor="gray.200"
                          flexShrink={0}
                        >
                          <Image
                            src={template.preview}
                            alt={template.name}
                            w="full"
                            h="full"
                            objectFit="cover"
                            fallback={
                              <Box
                                w="full"
                                h="full"
                                bg="gray.100"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                              >
                                <FiMail size={32} color="var(--chakra-colors-gray-400)" />
                              </Box>
                            }
                          />
                        </Box>
                      )}
                    </>
                  ) : (
                    <>
                      {/* SMS Template Preview */}
                      <VStack align="start" flex={1} spacing={3}>
                        <VStack align="start" spacing={1}>
                          <HStack>
                            <Text fontWeight="600" fontSize="md">
                              {template.name}
                            </Text>
                            <Badge colorScheme="orange" fontSize="xs">
                              Max {template.maxLength} caractères
                            </Badge>
                          </HStack>
                          <Text fontSize="sm" color="gray.600">
                            {template.description}
                          </Text>
                        </VStack>

                        {/* SMS Example */}
                        <Box
                          bg="gray.50"
                          p={3}
                          borderRadius="md"
                          border="1px solid"
                          borderColor="gray.200"
                          w="full"
                        >
                          <Text fontSize="sm" fontFamily="monospace" color="gray.800">
                            {template.example}
                          </Text>
                          <Text fontSize="xs" color="gray.500" mt={2}>
                            {template.example.length} caractères
                          </Text>
                        </Box>

                        {/* Template Fields */}
                        <Box>
                          <Text fontSize="xs" fontWeight="600" color="gray.700" mb={1}>
                            Variables disponibles:
                          </Text>
                          <HStack spacing={2} flexWrap="wrap">
                            {Object.entries(template.fields).map(([key, label]) => (
                              <Badge key={key} size="sm" colorScheme="purple" fontSize="xs">
                                {`{${key}}`}
                              </Badge>
                            ))}
                          </HStack>
                        </Box>
                      </VStack>
                    </>
                  )}
                </HStack>
              </CardBody>
            </Card>
          ))}
        </Stack>
      </RadioGroup>
    </VStack>
  )
}

export { EMAIL_TEMPLATES, SMS_TEMPLATES }
