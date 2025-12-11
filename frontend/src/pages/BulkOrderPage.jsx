import { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  SimpleGrid,
  Card,
  CardBody,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Badge,
  useColorModeValue,
  useToast,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Alert,
  AlertIcon,
  Divider,
  Image
} from '@chakra-ui/react'
import { FiPlus, FiMinus, FiTrash2, FiShoppingCart } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { useDishes } from '../hooks/useDishes'
import { useB2BAccount, useB2BTeam } from '../hooks/useB2BQuotes'
import { useAuth } from '../context/AuthContext'

export default function BulkOrderPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const bgColor = useColorModeValue('gray.50', 'gray.900')

  const { account, isB2BCustomer } = useB2BAccount()
  const { teamMembers } = useB2BTeam(account?.id)
  const { availableDishes } = useDishes()

  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')
  const [orders, setOrders] = useState([])

  useEffect(() => {
    // Set default date to tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setSelectedDate(tomorrow.toISOString().split('T')[0])
  }, [])

  // Redirect if not B2B customer
  if (!isB2BCustomer) {
    return (
      <Container maxW="container.xl" py={16}>
        <Alert status="warning">
          <AlertIcon />
          Cette fonctionnalité est réservée aux comptes B2B. Contactez-nous pour en savoir plus.
        </Alert>
      </Container>
    )
  }

  const addOrder = () => {
    setOrders([
      ...orders,
      {
        id: Date.now(),
        member: '',
        dish: '',
        quantity: 1,
        notes: ''
      }
    ])
  }

  const removeOrder = (orderId) => {
    setOrders(orders.filter((o) => o.id !== orderId))
  }

  const updateOrder = (orderId, field, value) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, [field]: value } : order
      )
    )
  }

  const calculateTotal = () => {
    return orders.reduce((total, order) => {
      if (!order.dish) return total
      const dish = availableDishes.find((d) => d.id === order.dish)
      if (!dish) return total
      return total + dish.price * order.quantity
    }, 0)
  }

  const handleSubmitBulkOrder = async () => {
    if (!selectedDate || !selectedSlot) {
      toast({
        title: 'Informations manquantes',
        description: 'Veuillez sélectionner une date et un créneau',
        status: 'warning',
        duration: 3000
      })
      return
    }

    if (orders.length === 0) {
      toast({
        title: 'Aucune commande',
        description: 'Veuillez ajouter au moins une commande',
        status: 'warning',
        duration: 3000
      })
      return
    }

    // Validate all orders have member and dish selected
    const invalidOrders = orders.filter((o) => !o.member || !o.dish)
    if (invalidOrders.length > 0) {
      toast({
        title: 'Commandes incomplètes',
        description: 'Tous les membres et plats doivent être sélectionnés',
        status: 'warning',
        duration: 3000
      })
      return
    }

    // TODO: Submit to Supabase
    toast({
      title: 'Commande groupée envoyée',
      description: `${orders.length} commandes créées avec succès`,
      status: 'success',
      duration: 3000
    })

    // Reset
    setOrders([])
    navigate('/b2b/dashboard')
  }

  const activeMembers = teamMembers.filter((m) => m.is_active)

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <VStack spacing={2} align="start">
            <Heading size="lg">Commande Groupée</Heading>
            <Text color="gray.600">
              Créez plusieurs commandes en une seule fois pour votre équipe
            </Text>
          </VStack>

          {/* Delivery Info */}
          <Card>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Date de livraison</FormLabel>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Créneau horaire</FormLabel>
                  <Select
                    value={selectedSlot}
                    onChange={(e) => setSelectedSlot(e.target.value)}
                    placeholder="Sélectionner un créneau"
                  >
                    <option value="11:30-12:30">11:30 - 12:30</option>
                    <option value="12:30-13:30">12:30 - 13:30</option>
                    <option value="13:30-14:30">13:30 - 14:30</option>
                  </Select>
                </FormControl>
              </SimpleGrid>
            </CardBody>
          </Card>

          {/* Orders Table */}
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Heading size="md">Commandes ({orders.length})</Heading>
                  <Button leftIcon={<FiPlus />} colorScheme="brand" onClick={addOrder}>
                    Ajouter une commande
                  </Button>
                </HStack>

                {orders.length === 0 ? (
                  <VStack py={8} spacing={4}>
                    <Text color="gray.500">Aucune commande ajoutée</Text>
                    <Button leftIcon={<FiPlus />} colorScheme="brand" onClick={addOrder}>
                      Ajouter la première commande
                    </Button>
                  </VStack>
                ) : (
                  <Box overflowX="auto">
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>Membre</Th>
                          <Th>Plat</Th>
                          <Th>Quantité</Th>
                          <Th>Prix</Th>
                          <Th>Notes</Th>
                          <Th></Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {orders.map((order) => {
                          const selectedDish = availableDishes.find(
                            (d) => d.id === order.dish
                          )
                          const subtotal = selectedDish
                            ? selectedDish.price * order.quantity
                            : 0

                          return (
                            <Tr key={order.id}>
                              <Td>
                                <Select
                                  size="sm"
                                  value={order.member}
                                  onChange={(e) =>
                                    updateOrder(order.id, 'member', e.target.value)
                                  }
                                  placeholder="Sélectionner"
                                >
                                  {activeMembers.map((member) => (
                                    <option key={member.id} value={member.id}>
                                      {member.full_name || member.email}
                                    </option>
                                  ))}
                                </Select>
                              </Td>
                              <Td>
                                <Select
                                  size="sm"
                                  value={order.dish}
                                  onChange={(e) =>
                                    updateOrder(order.id, 'dish', e.target.value)
                                  }
                                  placeholder="Sélectionner"
                                >
                                  {availableDishes.map((dish) => (
                                    <option key={dish.id} value={dish.id}>
                                      {dish.name} - {dish.price.toFixed(2)}€
                                    </option>
                                  ))}
                                </Select>
                              </Td>
                              <Td>
                                <NumberInput
                                  size="sm"
                                  value={order.quantity}
                                  onChange={(value) =>
                                    updateOrder(order.id, 'quantity', parseInt(value) || 1)
                                  }
                                  min={1}
                                  max={10}
                                  maxW="80px"
                                >
                                  <NumberInputField />
                                  <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                  </NumberInputStepper>
                                </NumberInput>
                              </Td>
                              <Td fontWeight="600">{subtotal.toFixed(2)}€</Td>
                              <Td>
                                <Input
                                  size="sm"
                                  value={order.notes}
                                  onChange={(e) =>
                                    updateOrder(order.id, 'notes', e.target.value)
                                  }
                                  placeholder="Notes..."
                                />
                              </Td>
                              <Td>
                                <IconButton
                                  icon={<FiTrash2 />}
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="red"
                                  onClick={() => removeOrder(order.id)}
                                  aria-label="Supprimer"
                                />
                              </Td>
                            </Tr>
                          )
                        })}
                      </Tbody>
                    </Table>
                  </Box>
                )}
              </VStack>
            </CardBody>
          </Card>

          {/* Summary */}
          {orders.length > 0 && (
            <Card>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Heading size="md">Récapitulatif</Heading>
                  <Divider />
                  <HStack justify="space-between">
                    <Text>Nombre de commandes:</Text>
                    <Text fontWeight="600">{orders.length}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>Nombre de membres:</Text>
                    <Text fontWeight="600">
                      {new Set(orders.map((o) => o.member).filter(Boolean)).size}
                    </Text>
                  </HStack>
                  <HStack justify="space-between" fontSize="lg">
                    <Text fontWeight="bold">Total:</Text>
                    <Text fontWeight="bold" color="brand.600">
                      {calculateTotal().toFixed(2)}€
                    </Text>
                  </HStack>
                  {account?.discount_rate > 0 && (
                    <HStack justify="space-between" color="green.600">
                      <Text>Remise B2B ({account.discount_rate}%):</Text>
                      <Text fontWeight="600">
                        -{(calculateTotal() * account.discount_rate / 100).toFixed(2)}€
                      </Text>
                    </HStack>
                  )}
                  <Button
                    colorScheme="brand"
                    size="lg"
                    leftIcon={<FiShoppingCart />}
                    onClick={handleSubmitBulkOrder}
                    isDisabled={orders.length === 0}
                  >
                    Valider la commande groupée
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          )}

          {/* Team Budget Info */}
          {activeMembers.length > 0 && (
            <Alert status="info">
              <AlertIcon />
              {activeMembers.length} membres actifs disponibles pour cette commande groupée
            </Alert>
          )}
        </VStack>
      </Container>
    </Box>
  )
}
