import React from 'react'
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Card,
  CardHeader,
  CardBody,
  SimpleGrid,
  FormControl,
  FormLabel,
  Input,
  Switch,
  Button,
  Divider,
  useToast,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Select,
  Textarea,
  Badge,
  Icon
} from '@chakra-ui/react'
import {
  FiSettings,
  FiUser,
  FiMail,
  FiCreditCard,
  FiBell,
  FiShield,
  FiGlobe
} from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'

export default function AdminSettings() {
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const toast = useToast()
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'
  const [isLoading, setIsLoading] = React.useState(false)
  const [settings, setSettings] = React.useState({
    // General
    siteName: 'Pause Dej\'',
    siteEmail: 'contact@pausedej.fr',
    sitePhone: '+33 4 50 12 34 56',
    siteAddress: '123 Rue de la Paix, 74000 Annecy',

    // Delivery
    deliveryFeeAnnecy: 3.50,
    deliveryFeeAnnecyLeVieux: 3.50,
    deliveryFeeArgonay: 4.00,
    freeDeliveryThreshold: 30.00,

    // Notifications
    emailNotifications: true,
    orderNotifications: true,
    stockAlerts: true,
    reviewNotifications: true,

    // Business Hours
    deliveryDays: 'Lundi - Vendredi',
    deliveryTimeStart: '07:00',
    deliveryTimeEnd: '09:00',

    // Payment
    stripeEnabled: true,
    applePayEnabled: false,
    googlePayEnabled: false,

    // Maintenance
    maintenanceMode: false,
    maintenanceMessage: 'Site en maintenance. Nous revenons bientôt !'
  })

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: 'Paramètres sauvegardés',
      description: 'Vos modifications ont été enregistrées avec succès.',
      status: 'success',
      duration: 3000,
      isClosable: true
    })

    setIsLoading(false)
  }

  return (
    <Box bg={bgColor} minH="100vh">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <HStack spacing={3}>
            <Icon as={FiSettings} boxSize={6} />
            <Heading size="lg">
              {isAdmin ? 'Paramètres' : 'Mes Paramètres'}
            </Heading>
          </HStack>
          <Button
            colorScheme="brand"
            onClick={handleSave}
            isLoading={isLoading}
          >
            Enregistrer les modifications
          </Button>
        </HStack>

        {/* Settings Tabs */}
        <Tabs colorScheme="brand">
          <TabList>
            <Tab>
              <HStack>
                <Icon as={FiUser} />
                <Text>Mon Profil</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack>
                <Icon as={FiBell} />
                <Text>Notifications</Text>
              </HStack>
            </Tab>
            {isAdmin && (
              <>
                <Tab>
                  <HStack>
                    <Icon as={FiGlobe} />
                    <Text>Général</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack>
                    <Icon as={FiUser} />
                    <Text>Livraison</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack>
                    <Icon as={FiCreditCard} />
                    <Text>Paiement</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack>
                    <Icon as={FiShield} />
                    <Text>Maintenance</Text>
                  </HStack>
                </Tab>
              </>
            )}
          </TabList>

          <TabPanels>
            {/* User Profile Settings */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Card>
                  <CardHeader>
                    <Heading size="md">Informations personnelles</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4}>
                      <FormControl>
                        <FormLabel>Nom complet</FormLabel>
                        <Input
                          defaultValue={profile?.full_name || ''}
                          placeholder="Jean Dupont"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Email</FormLabel>
                        <Input
                          type="email"
                          defaultValue={profile?.email || ''}
                          isReadOnly
                          bg="gray.50"
                        />
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          L'email ne peut pas être modifié
                        </Text>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Téléphone</FormLabel>
                        <Input
                          defaultValue={profile?.phone || ''}
                          placeholder="+33 6 12 34 56 78"
                        />
                      </FormControl>
                    </VStack>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <Heading size="md">Préférences alimentaires</Heading>
                  </CardHeader>
                  <CardBody>
                    <Text fontSize="sm" color="gray.600" mb={4}>
                      Gérez vos préférences alimentaires dans votre{' '}
                      <Text as="span" color="brand.600" fontWeight="600">
                        compte utilisateur
                      </Text>
                      .
                    </Text>
                    <Button as="a" href="/compte?tab=preferences" variant="outline" colorScheme="brand">
                      Gérer mes préférences
                    </Button>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* Notifications Settings */}
            <TabPanel>
              <Card>
                <CardHeader>
                  <Heading size="md">Préférences de notifications</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={6} align="stretch">
                    <HStack justify="space-between">
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="600">Notifications par email</Text>
                        <Text fontSize="sm" color="gray.600">
                          Recevoir des emails pour les événements importants
                        </Text>
                      </VStack>
                      <Switch
                        isChecked={settings.emailNotifications}
                        onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                        colorScheme="brand"
                      />
                    </HStack>

                    <Divider />

                    <HStack justify="space-between">
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="600">Mes commandes</Text>
                        <Text fontSize="sm" color="gray.600">
                          Être notifié de l'état de mes commandes
                        </Text>
                      </VStack>
                      <Switch
                        isChecked={settings.orderNotifications}
                        onChange={(e) => handleChange('orderNotifications', e.target.checked)}
                        colorScheme="brand"
                      />
                    </HStack>

                    {isAdmin && (
                      <>
                        <Divider />

                        <HStack justify="space-between">
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="600">Alertes de stock</Text>
                            <Text fontSize="sm" color="gray.600">
                              Alertes pour les stocks faibles (Admin)
                            </Text>
                          </VStack>
                          <Switch
                            isChecked={settings.stockAlerts}
                            onChange={(e) => handleChange('stockAlerts', e.target.checked)}
                            colorScheme="brand"
                          />
                        </HStack>

                        <Divider />

                        <HStack justify="space-between">
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="600">Nouveaux avis</Text>
                            <Text fontSize="sm" color="gray.600">
                              Être notifié des nouveaux avis clients (Admin)
                            </Text>
                          </VStack>
                          <Switch
                            isChecked={settings.reviewNotifications}
                            onChange={(e) => handleChange('reviewNotifications', e.target.checked)}
                            colorScheme="brand"
                          />
                        </HStack>
                      </>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            </TabPanel>

            {/* General Settings - Admin Only */}
            {isAdmin && (
              <TabPanel>
              <VStack spacing={6} align="stretch">
                <Card>
                  <CardHeader>
                    <Heading size="md">Informations du site</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4}>
                      <FormControl>
                        <FormLabel>Nom du site</FormLabel>
                        <Input
                          value={settings.siteName}
                          onChange={(e) => handleChange('siteName', e.target.value)}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Email de contact</FormLabel>
                        <Input
                          type="email"
                          value={settings.siteEmail}
                          onChange={(e) => handleChange('siteEmail', e.target.value)}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Téléphone</FormLabel>
                        <Input
                          value={settings.sitePhone}
                          onChange={(e) => handleChange('sitePhone', e.target.value)}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Adresse</FormLabel>
                        <Input
                          value={settings.siteAddress}
                          onChange={(e) => handleChange('siteAddress', e.target.value)}
                        />
                      </FormControl>
                    </VStack>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <Heading size="md">Horaires de livraison</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <FormControl>
                        <FormLabel>Jours de livraison</FormLabel>
                        <Input
                          value={settings.deliveryDays}
                          onChange={(e) => handleChange('deliveryDays', e.target.value)}
                          isReadOnly
                          bg="gray.50"
                        />
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          Actuellement : Lundi au Vendredi uniquement
                        </Text>
                      </FormControl>

                      <Divider />

                      <Text fontWeight="600">Créneau de livraison du matin</Text>

                      <SimpleGrid columns={2} spacing={4}>
                        <FormControl>
                          <FormLabel fontSize="sm">Heure de début</FormLabel>
                          <Input
                            type="time"
                            size="sm"
                            value={settings.deliveryTimeStart}
                            onChange={(e) => handleChange('deliveryTimeStart', e.target.value)}
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel fontSize="sm">Heure de fin</FormLabel>
                          <Input
                            type="time"
                            size="sm"
                            value={settings.deliveryTimeEnd}
                            onChange={(e) => handleChange('deliveryTimeEnd', e.target.value)}
                          />
                        </FormControl>
                      </SimpleGrid>

                      <Box bg="blue.50" p={3} borderRadius="md">
                        <Text fontSize="sm" color="blue.800">
                          📦 Les clients peuvent commander jusqu'à minuit pour une livraison le lendemain matin entre{' '}
                          <Text as="span" fontWeight="600">{settings.deliveryTimeStart.substring(0, 5)}</Text>
                          {' '}et{' '}
                          <Text as="span" fontWeight="600">{settings.deliveryTimeEnd.substring(0, 5)}</Text>.
                        </Text>
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>
            )}

            {/* Delivery Settings - Admin Only */}
            {isAdmin && (
            <TabPanel>
              <Card>
                <CardHeader>
                  <Heading size="md">Paramètres de livraison</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={6}>
                    <FormControl>
                      <FormLabel>Seuil de livraison gratuite (€)</FormLabel>
                      <Input
                        type="number"
                        step="0.01"
                        value={settings.freeDeliveryThreshold}
                        onChange={(e) => handleChange('freeDeliveryThreshold', parseFloat(e.target.value))}
                      />
                    </FormControl>

                    <Divider />

                    <VStack spacing={4} align="stretch" w="full">
                      <Text fontWeight="600">Frais de livraison par zone</Text>

                      <FormControl>
                        <FormLabel fontSize="sm">Annecy (74000)</FormLabel>
                        <Input
                          type="number"
                          step="0.01"
                          size="sm"
                          value={settings.deliveryFeeAnnecy}
                          onChange={(e) => handleChange('deliveryFeeAnnecy', parseFloat(e.target.value))}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="sm">Annecy-le-Vieux (74940)</FormLabel>
                        <Input
                          type="number"
                          step="0.01"
                          size="sm"
                          value={settings.deliveryFeeAnnecyLeVieux}
                          onChange={(e) => handleChange('deliveryFeeAnnecyLeVieux', parseFloat(e.target.value))}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="sm">Argonay (74370)</FormLabel>
                        <Input
                          type="number"
                          step="0.01"
                          size="sm"
                          value={settings.deliveryFeeArgonay}
                          onChange={(e) => handleChange('deliveryFeeArgonay', parseFloat(e.target.value))}
                        />
                      </FormControl>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>
            </TabPanel>
            )}

            {/* Payment Settings - Admin Only */}
            {isAdmin && (
            <TabPanel>
              <Card>
                <CardHeader>
                  <Heading size="md">Méthodes de paiement</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={6} align="stretch">
                    <HStack justify="space-between">
                      <VStack align="start" spacing={0}>
                        <HStack>
                          <Text fontWeight="600">Stripe</Text>
                          <Badge colorScheme="green">Actif</Badge>
                        </HStack>
                        <Text fontSize="sm" color="gray.600">
                          Paiement par carte bancaire
                        </Text>
                      </VStack>
                      <Switch
                        isChecked={settings.stripeEnabled}
                        onChange={(e) => handleChange('stripeEnabled', e.target.checked)}
                        colorScheme="brand"
                      />
                    </HStack>

                    <Divider />

                    <HStack justify="space-between">
                      <VStack align="start" spacing={0}>
                        <HStack>
                          <Text fontWeight="600">Apple Pay</Text>
                          <Badge colorScheme="gray">Bientôt disponible</Badge>
                        </HStack>
                        <Text fontSize="sm" color="gray.600">
                          Paiement via Apple Pay
                        </Text>
                      </VStack>
                      <Switch
                        isChecked={settings.applePayEnabled}
                        onChange={(e) => handleChange('applePayEnabled', e.target.checked)}
                        colorScheme="brand"
                        isDisabled
                      />
                    </HStack>

                    <Divider />

                    <HStack justify="space-between">
                      <VStack align="start" spacing={0}>
                        <HStack>
                          <Text fontWeight="600">Google Pay</Text>
                          <Badge colorScheme="gray">Bientôt disponible</Badge>
                        </HStack>
                        <Text fontSize="sm" color="gray.600">
                          Paiement via Google Pay
                        </Text>
                      </VStack>
                      <Switch
                        isChecked={settings.googlePayEnabled}
                        onChange={(e) => handleChange('googlePayEnabled', e.target.checked)}
                        colorScheme="brand"
                        isDisabled
                      />
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            </TabPanel>
            )}

            {/* Maintenance Settings - Admin Only */}
            {isAdmin && (
            <TabPanel>
              <Card>
                <CardHeader>
                  <Heading size="md">Mode maintenance</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={6} align="stretch">
                    <HStack
                      justify="space-between"
                      p={4}
                      bg={settings.maintenanceMode ? 'red.50' : 'gray.50'}
                      borderRadius="md"
                    >
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="600">Activer le mode maintenance</Text>
                        <Text fontSize="sm" color="gray.600">
                          {settings.maintenanceMode
                            ? 'Le site est en maintenance - Les utilisateurs ne peuvent pas commander'
                            : 'Le site fonctionne normalement'}
                        </Text>
                      </VStack>
                      <Switch
                        isChecked={settings.maintenanceMode}
                        onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                        colorScheme="red"
                        size="lg"
                      />
                    </HStack>

                    <FormControl>
                      <FormLabel>Message de maintenance</FormLabel>
                      <Textarea
                        value={settings.maintenanceMessage}
                        onChange={(e) => handleChange('maintenanceMessage', e.target.value)}
                        rows={4}
                        placeholder="Message affiché aux utilisateurs pendant la maintenance"
                      />
                    </FormControl>
                  </VStack>
                </CardBody>
              </Card>
            </TabPanel>
            )}
          </TabPanels>
        </Tabs>
      </VStack>
    </Box>
  )
}
