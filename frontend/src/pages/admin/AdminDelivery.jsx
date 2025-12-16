import {
  Box,
  Container,
  Heading,
  VStack,
  Text,
  HStack,
  Card,
  CardBody,
  SimpleGrid,
  Badge,
  Icon,
  Alert,
  AlertIcon,
  Divider,
  List,
  ListItem,
  ListIcon
} from '@chakra-ui/react'
import {
  FiTruck,
  FiClock,
  FiMapPin,
  FiCalendar,
  FiCheckCircle,
  FiInfo
} from 'react-icons/fi'

export default function AdminDelivery() {
  return (
    <Box bg="gray.50" minH="100vh" py={8}>
      <Container maxW="container.xl">
        <VStack spacing={6} align="stretch">
          <Heading size="lg">
            <HStack spacing={3}>
              <Icon as={FiTruck} />
              <Text>Gestion des Livraisons</Text>
            </HStack>
          </Heading>

          <Alert status="info" rounded="lg">
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">Système de livraison simplifié</Text>
              <Text fontSize="sm">
                Les livraisons sont effectuées du lundi au vendredi, entre 7h et 9h le matin.
                Les clients peuvent commander jusqu'à minuit pour une livraison le lendemain.
              </Text>
            </Box>
          </Alert>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {/* Horaires de Livraison */}
            <Card>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <HStack spacing={3}>
                    <Box p={3} bg="blue.50" rounded="lg">
                      <Icon as={FiClock} boxSize={6} color="blue.600" />
                    </Box>
                    <Box>
                      <Text fontWeight="bold" fontSize="lg">Horaires</Text>
                      <Text fontSize="sm" color="gray.600">Créneau de livraison</Text>
                    </Box>
                  </HStack>
                  <Divider />
                  <VStack align="start" spacing={2}>
                    <HStack>
                      <Badge colorScheme="blue" px={3} py={1}>7h - 9h</Badge>
                    </HStack>
                    <Text fontSize="sm" color="gray.700">
                      Livraison matinale uniquement
                    </Text>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>

            {/* Jours de Livraison */}
            <Card>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <HStack spacing={3}>
                    <Box p={3} bg="green.50" rounded="lg">
                      <Icon as={FiCalendar} boxSize={6} color="green.600" />
                    </Box>
                    <Box>
                      <Text fontWeight="bold" fontSize="lg">Jours Actifs</Text>
                      <Text fontSize="sm" color="gray.600">Disponibilité</Text>
                    </Box>
                  </HStack>
                  <Divider />
                  <List spacing={2}>
                    <ListItem fontSize="sm">
                      <ListIcon as={FiCheckCircle} color="green.500" />
                      Lundi
                    </ListItem>
                    <ListItem fontSize="sm">
                      <ListIcon as={FiCheckCircle} color="green.500" />
                      Mardi
                    </ListItem>
                    <ListItem fontSize="sm">
                      <ListIcon as={FiCheckCircle} color="green.500" />
                      Mercredi
                    </ListItem>
                    <ListItem fontSize="sm">
                      <ListIcon as={FiCheckCircle} color="green.500" />
                      Jeudi
                    </ListItem>
                    <ListItem fontSize="sm">
                      <ListIcon as={FiCheckCircle} color="green.500" />
                      Vendredi
                    </ListItem>
                  </List>
                </VStack>
              </CardBody>
            </Card>

            {/* Zone de Livraison */}
            <Card>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <HStack spacing={3}>
                    <Box p={3} bg="orange.50" rounded="lg">
                      <Icon as={FiMapPin} boxSize={6} color="orange.600" />
                    </Box>
                    <Box>
                      <Text fontWeight="bold" fontSize="lg">Zone Couverte</Text>
                      <Text fontSize="sm" color="gray.600">Périmètre</Text>
                    </Box>
                  </HStack>
                  <Divider />
                  <VStack align="start" spacing={2}>
                    <Text fontSize="sm" color="gray.700">
                      Annecy et proche banlieue
                    </Text>
                    <Badge colorScheme="orange">Zone active</Badge>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Informations supplémentaires */}
          <Card>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <HStack spacing={3}>
                  <Icon as={FiInfo} color="brand.600" boxSize={5} />
                  <Text fontWeight="bold" fontSize="lg">Fonctionnement</Text>
                </HStack>
                <Divider />
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <VStack align="start" spacing={3}>
                    <Text fontWeight="600" color="gray.700">
                      📦 Commandes
                    </Text>
                    <List spacing={2} fontSize="sm" color="gray.600">
                      <ListItem>• Commandes jusqu'à minuit</ListItem>
                      <ListItem>• Livraison le lendemain matin</ListItem>
                      <ListItem>• Notification de préparation</ListItem>
                      <ListItem>• Notification de départ</ListItem>
                    </List>
                  </VStack>
                  <VStack align="start" spacing={3}>
                    <Text fontWeight="600" color="gray.700">
                      🚴 Livraison
                    </Text>
                    <List spacing={2} fontSize="sm" color="gray.600">
                      <ListItem>• Créneau 7h-9h le matin</ListItem>
                      <ListItem>• Du lundi au vendredi</ListItem>
                      <ListItem>• Pas de livraison le week-end</ListItem>
                      <ListItem>• Suivi en temps réel</ListItem>
                    </List>
                  </VStack>
                </SimpleGrid>
              </VStack>
            </CardBody>
          </Card>

          {/* Message d'information */}
          <Alert status="success" variant="left-accent" rounded="lg">
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">Système opérationnel</Text>
              <Text fontSize="sm">
                Le système de livraison est configuré et opérationnel. Les clients peuvent commander et sélectionner leur créneau de livraison.
              </Text>
            </Box>
          </Alert>
        </VStack>
      </Container>
    </Box>
  )
}
