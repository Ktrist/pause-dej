import { useState } from 'react'
import {
  Box,
  Container,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  HStack,
  VStack,
  Text,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Card,
  CardBody,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Select,
  Switch,
  Textarea,
  Alert,
  AlertIcon,
  useToast,
  SimpleGrid
} from '@chakra-ui/react'
import {
  FiTruck,
  FiClock,
  FiMapPin,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiMap
} from 'react-icons/fi'
import {
  useDeliveryZones,
  useDeliverySlots,
  useDeliveryRoutes,
  getDayName,
  formatTime
} from '../../hooks/useAdminDelivery'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function AdminDelivery() {
  return (
    <Box bg="gray.50" minH="100vh" py={8}>
      <Container maxW="container.xl">
        <VStack spacing={6} align="stretch">
          <Heading size="lg">
            <HStack spacing={3}>
              <FiTruck />
              <Text>Gestion des Livraisons</Text>
            </HStack>
          </Heading>

          <Tabs colorScheme="brand" variant="enclosed">
            <TabList>
              <Tab>
                <HStack spacing={2}>
                  <FiMapPin />
                  <Text>Zones de Livraison</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <FiClock />
                  <Text>Créneaux Horaires</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <FiTruck />
                  <Text>Tournées</Text>
                </HStack>
              </Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <DeliveryZonesPanel />
              </TabPanel>
              <TabPanel>
                <DeliverySlotsPanel />
              </TabPanel>
              <TabPanel>
                <DeliveryRoutesPanel />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Container>
    </Box>
  )
}

/**
 * Panel pour gérer les zones de livraison - A4.3
 */
function DeliveryZonesPanel() {
  const { zones, loading, error, refetch, createZone, updateZone, deleteZone, toggleZoneActive } =
    useDeliveryZones()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [editingZone, setEditingZone] = useState(null)
  const [zoneForm, setZoneForm] = useState({
    name: '',
    postal_codes: '',
    city: '',
    delivery_fee: 0,
    min_order_amount: 0,
    is_active: true
  })
  const toast = useToast()

  const handleOpenModal = (zone = null) => {
    if (zone) {
      setEditingZone(zone)
      setZoneForm({
        name: zone.name,
        postal_codes: zone.postal_codes.join(', '),
        city: zone.city || '',
        delivery_fee: zone.delivery_fee,
        min_order_amount: zone.min_order_amount,
        is_active: zone.is_active
      })
    } else {
      setEditingZone(null)
      setZoneForm({
        name: '',
        postal_codes: '',
        city: '',
        delivery_fee: 0,
        min_order_amount: 0,
        is_active: true
      })
    }
    onOpen()
  }

  const handleSave = async () => {
    const postalCodesArray = zoneForm.postal_codes
      .split(',')
      .map((code) => code.trim())
      .filter((code) => code !== '')

    const zoneData = {
      name: zoneForm.name,
      postal_codes: postalCodesArray,
      city: zoneForm.city,
      delivery_fee: parseFloat(zoneForm.delivery_fee),
      min_order_amount: parseFloat(zoneForm.min_order_amount),
      is_active: zoneForm.is_active
    }

    let result
    if (editingZone) {
      result = await updateZone(editingZone.id, zoneData)
    } else {
      result = await createZone(zoneData)
    }

    if (result.error) {
      toast({
        title: 'Erreur',
        description: result.error,
        status: 'error',
        duration: 3000
      })
    } else {
      toast({
        title: editingZone ? 'Zone mise à jour' : 'Zone créée',
        status: 'success',
        duration: 2000
      })
      onClose()
    }
  }

  const handleDelete = async (zoneId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette zone ?')) return

    const result = await deleteZone(zoneId)
    if (result.error) {
      toast({
        title: 'Erreur',
        description: result.error,
        status: 'error',
        duration: 3000
      })
    } else {
      toast({
        title: 'Zone supprimée',
        status: 'info',
        duration: 2000
      })
    }
  }

  const handleToggleActive = async (zoneId, isActive) => {
    const result = await toggleZoneActive(zoneId, !isActive)
    if (result.error) {
      toast({
        title: 'Erreur',
        description: result.error,
        status: 'error',
        duration: 3000
      })
    }
  }

  if (loading) return <LoadingSpinner message="Chargement des zones..." />
  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    )
  }

  return (
    <VStack spacing={4} align="stretch">
      <HStack justify="space-between">
        <Text fontSize="lg" fontWeight="600">
          Zones de livraison ({zones.length})
        </Text>
        <Button leftIcon={<FiPlus />} colorScheme="brand" onClick={() => handleOpenModal()}>
          Nouvelle zone
        </Button>
      </HStack>

      <Card>
        <CardBody p={0}>
          <Table variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th>Nom</Th>
                <Th>Ville</Th>
                <Th>Codes Postaux</Th>
                <Th isNumeric>Frais Livraison</Th>
                <Th isNumeric>Commande Min.</Th>
                <Th>Statut</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {zones.map((zone) => (
                <Tr key={zone.id}>
                  <Td fontWeight="600">{zone.name}</Td>
                  <Td>{zone.city || '-'}</Td>
                  <Td>
                    <Text fontSize="sm" noOfLines={1}>
                      {zone.postal_codes.join(', ')}
                    </Text>
                  </Td>
                  <Td isNumeric>{zone.delivery_fee.toFixed(2)}€</Td>
                  <Td isNumeric>{zone.min_order_amount.toFixed(2)}€</Td>
                  <Td>
                    <Switch
                      isChecked={zone.is_active}
                      onChange={() => handleToggleActive(zone.id, zone.is_active)}
                      colorScheme="brand"
                    />
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton
                        icon={<FiEdit2 />}
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenModal(zone)}
                      />
                      <IconButton
                        icon={<FiTrash2 />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => handleDelete(zone.id)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>

      {/* Zone Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingZone ? 'Modifier la zone' : 'Nouvelle zone'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Nom de la zone</FormLabel>
                <Input
                  value={zoneForm.name}
                  onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })}
                  placeholder="Paris Centre"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Ville</FormLabel>
                <Input
                  value={zoneForm.city}
                  onChange={(e) => setZoneForm({ ...zoneForm, city: e.target.value })}
                  placeholder="Paris"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Codes postaux (séparés par des virgules)</FormLabel>
                <Textarea
                  value={zoneForm.postal_codes}
                  onChange={(e) => setZoneForm({ ...zoneForm, postal_codes: e.target.value })}
                  placeholder="75001, 75002, 75003"
                  rows={3}
                />
              </FormControl>

              <SimpleGrid columns={2} spacing={4} w="full">
                <FormControl>
                  <FormLabel>Frais de livraison (€)</FormLabel>
                  <Input
                    type="number"
                    step="0.01"
                    value={zoneForm.delivery_fee}
                    onChange={(e) =>
                      setZoneForm({ ...zoneForm, delivery_fee: e.target.value })
                    }
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Commande minimum (€)</FormLabel>
                  <Input
                    type="number"
                    step="0.01"
                    value={zoneForm.min_order_amount}
                    onChange={(e) =>
                      setZoneForm({ ...zoneForm, min_order_amount: e.target.value })
                    }
                  />
                </FormControl>
              </SimpleGrid>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb={0}>Zone active</FormLabel>
                <Switch
                  isChecked={zoneForm.is_active}
                  onChange={(e) => setZoneForm({ ...zoneForm, is_active: e.target.checked })}
                  colorScheme="brand"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Annuler
            </Button>
            <Button colorScheme="brand" onClick={handleSave}>
              {editingZone ? 'Mettre à jour' : 'Créer'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  )
}

/**
 * Panel pour gérer les créneaux horaires - A4.2
 */
function DeliverySlotsPanel() {
  const { slots, loading, error, refetch, createSlot, updateSlot, deleteSlot, toggleSlotActive } =
    useDeliverySlots()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [editingSlot, setEditingSlot] = useState(null)
  const [slotForm, setSlotForm] = useState({
    day_of_week: 1,
    start_time: '',
    end_time: '',
    max_orders: 20,
    delivery_fee: 0,
    is_active: true
  })
  const toast = useToast()

  const handleOpenModal = (slot = null) => {
    if (slot) {
      setEditingSlot(slot)
      setSlotForm({
        day_of_week: slot.day_of_week,
        start_time: formatTime(slot.start_time),
        end_time: formatTime(slot.end_time),
        max_orders: slot.max_orders,
        delivery_fee: slot.delivery_fee,
        is_active: slot.is_active
      })
    } else {
      setEditingSlot(null)
      setSlotForm({
        day_of_week: 1,
        start_time: '',
        end_time: '',
        max_orders: 20,
        delivery_fee: 0,
        is_active: true
      })
    }
    onOpen()
  }

  const handleSave = async () => {
    const slotData = {
      day_of_week: parseInt(slotForm.day_of_week),
      start_time: slotForm.start_time,
      end_time: slotForm.end_time,
      max_orders: parseInt(slotForm.max_orders),
      delivery_fee: parseFloat(slotForm.delivery_fee),
      is_active: slotForm.is_active
    }

    let result
    if (editingSlot) {
      result = await updateSlot(editingSlot.id, slotData)
    } else {
      result = await createSlot(slotData)
    }

    if (result.error) {
      toast({
        title: 'Erreur',
        description: result.error,
        status: 'error',
        duration: 3000
      })
    } else {
      toast({
        title: editingSlot ? 'Créneau mis à jour' : 'Créneau créé',
        status: 'success',
        duration: 2000
      })
      onClose()
    }
  }

  const handleDelete = async (slotId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce créneau ?')) return

    const result = await deleteSlot(slotId)
    if (result.error) {
      toast({
        title: 'Erreur',
        description: result.error,
        status: 'error',
        duration: 3000
      })
    } else {
      toast({
        title: 'Créneau supprimé',
        status: 'info',
        duration: 2000
      })
    }
  }

  const handleToggleActive = async (slotId, isActive) => {
    const result = await toggleSlotActive(slotId, !isActive)
    if (result.error) {
      toast({
        title: 'Erreur',
        description: result.error,
        status: 'error',
        duration: 3000
      })
    }
  }

  // Group slots by day
  const slotsByDay = slots.reduce((acc, slot) => {
    if (!acc[slot.day_of_week]) {
      acc[slot.day_of_week] = []
    }
    acc[slot.day_of_week].push(slot)
    return acc
  }, {})

  if (loading) return <LoadingSpinner message="Chargement des créneaux..." />
  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    )
  }

  return (
    <VStack spacing={4} align="stretch">
      <HStack justify="space-between">
        <Text fontSize="lg" fontWeight="600">
          Créneaux horaires ({slots.length})
        </Text>
        <Button leftIcon={<FiPlus />} colorScheme="brand" onClick={() => handleOpenModal()}>
          Nouveau créneau
        </Button>
      </HStack>

      {/* Grouped by day */}
      <VStack spacing={4} align="stretch">
        {[1, 2, 3, 4, 5, 6, 0].map((day) => {
          const daySlots = slotsByDay[day] || []
          if (daySlots.length === 0) return null

          return (
            <Card key={day}>
              <CardBody>
                <Heading size="sm" mb={4}>
                  {getDayName(day)}
                </Heading>
                <Table size="sm" variant="simple">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th>Horaire</Th>
                      <Th isNumeric>Commandes Max</Th>
                      <Th isNumeric>Frais</Th>
                      <Th>Statut</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {daySlots.map((slot) => (
                      <Tr key={slot.id}>
                        <Td fontWeight="600">
                          {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                        </Td>
                        <Td isNumeric>{slot.max_orders}</Td>
                        <Td isNumeric>{slot.delivery_fee.toFixed(2)}€</Td>
                        <Td>
                          <Switch
                            isChecked={slot.is_active}
                            onChange={() => handleToggleActive(slot.id, slot.is_active)}
                            colorScheme="brand"
                            size="sm"
                          />
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <IconButton
                              icon={<FiEdit2 />}
                              size="sm"
                              variant="ghost"
                              onClick={() => handleOpenModal(slot)}
                            />
                            <IconButton
                              icon={<FiTrash2 />}
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => handleDelete(slot.id)}
                            />
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
          )
        })}
      </VStack>

      {/* Slot Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingSlot ? 'Modifier le créneau' : 'Nouveau créneau'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Jour de la semaine</FormLabel>
                <Select
                  value={slotForm.day_of_week}
                  onChange={(e) => setSlotForm({ ...slotForm, day_of_week: e.target.value })}
                >
                  <option value="1">Lundi</option>
                  <option value="2">Mardi</option>
                  <option value="3">Mercredi</option>
                  <option value="4">Jeudi</option>
                  <option value="5">Vendredi</option>
                  <option value="6">Samedi</option>
                  <option value="0">Dimanche</option>
                </Select>
              </FormControl>

              <SimpleGrid columns={2} spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel>Heure début</FormLabel>
                  <Input
                    type="time"
                    value={slotForm.start_time}
                    onChange={(e) => setSlotForm({ ...slotForm, start_time: e.target.value })}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Heure fin</FormLabel>
                  <Input
                    type="time"
                    value={slotForm.end_time}
                    onChange={(e) => setSlotForm({ ...slotForm, end_time: e.target.value })}
                  />
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={2} spacing={4} w="full">
                <FormControl>
                  <FormLabel>Commandes maximum</FormLabel>
                  <Input
                    type="number"
                    value={slotForm.max_orders}
                    onChange={(e) => setSlotForm({ ...slotForm, max_orders: e.target.value })}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Frais (€)</FormLabel>
                  <Input
                    type="number"
                    step="0.01"
                    value={slotForm.delivery_fee}
                    onChange={(e) => setSlotForm({ ...slotForm, delivery_fee: e.target.value })}
                  />
                </FormControl>
              </SimpleGrid>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb={0}>Créneau actif</FormLabel>
                <Switch
                  isChecked={slotForm.is_active}
                  onChange={(e) => setSlotForm({ ...slotForm, is_active: e.target.checked })}
                  colorScheme="brand"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Annuler
            </Button>
            <Button colorScheme="brand" onClick={handleSave}>
              {editingSlot ? 'Mettre à jour' : 'Créer'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  )
}

/**
 * Panel pour gérer les tournées de livraison - A4.1
 */
function DeliveryRoutesPanel() {
  const { routes, loading, error, refetch } = useDeliveryRoutes()

  if (loading) return <LoadingSpinner message="Chargement des tournées..." />
  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    )
  }

  return (
    <VStack spacing={4} align="stretch">
      <HStack justify="space-between">
        <Text fontSize="lg" fontWeight="600">
          Tournées de livraison ({routes.length})
        </Text>
        <Alert status="info" variant="left-accent">
          <AlertIcon />
          <Text fontSize="sm">
            Fonctionnalité de planification des tournées - À venir dans une prochaine version
          </Text>
        </Alert>
      </HStack>

      {routes.length === 0 ? (
        <Card>
          <CardBody textAlign="center" py={12}>
            <VStack spacing={4}>
              <FiMap size={48} color="gray" />
              <Text color="gray.500">Aucune tournée planifiée pour le moment</Text>
            </VStack>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody p={0}>
            <Table variant="simple">
              <Thead bg="gray.50">
                <Tr>
                  <Th>Nom de la tournée</Th>
                  <Th>Date</Th>
                  <Th>Zone</Th>
                  <Th>Créneau</Th>
                  <Th>Chauffeur</Th>
                  <Th isNumeric>Commandes</Th>
                  <Th>Statut</Th>
                </Tr>
              </Thead>
              <Tbody>
                {routes.map((route) => (
                  <Tr key={route.id}>
                    <Td fontWeight="600">{route.route_name}</Td>
                    <Td>{new Date(route.delivery_date).toLocaleDateString('fr-FR')}</Td>
                    <Td>{route.delivery_zones?.name || '-'}</Td>
                    <Td>
                      {route.delivery_slots
                        ? `${formatTime(route.delivery_slots.start_time)} - ${formatTime(route.delivery_slots.end_time)}`
                        : '-'}
                    </Td>
                    <Td>{route.driver_name || '-'}</Td>
                    <Td isNumeric>{route.total_orders}</Td>
                    <Td>
                      <Badge
                        colorScheme={
                          route.status === 'completed'
                            ? 'green'
                            : route.status === 'in_progress'
                            ? 'blue'
                            : route.status === 'cancelled'
                            ? 'red'
                            : 'gray'
                        }
                      >
                        {route.status}
                      </Badge>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      )}
    </VStack>
  )
}
