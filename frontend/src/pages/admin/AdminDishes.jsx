import { useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  VStack,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  Image,
  Switch,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  useDisclosure,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  useColorModeValue
} from '@chakra-ui/react'
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiStar,
  FiRefreshCw
} from 'react-icons/fi'
import { useAdminDishes } from '../../hooks/useAdminDishes'

const CATEGORIES = [
  'Entrées',
  'Plats',
  'Desserts',
  'Boissons',
  'Accompagnements'
]

const DishModal = ({ isOpen, onClose, dish, onSave }) => {
  const toast = useToast()
  const [formData, setFormData] = useState(
    dish || {
      name: '',
      description: '',
      category: 'Plats',
      price: '',
      image_url: '',
      stock_quantity: 10,
      is_available: true,
      is_featured: false,
      allergens: '',
      nutritional_info: ''
    }
  )
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    const dishData = {
      ...formData,
      price: parseFloat(formData.price),
      stock_quantity: parseInt(formData.stock_quantity)
    }

    const { error } = await onSave(dishData)

    setSaving(false)

    if (error) {
      toast({
        title: 'Erreur',
        description: error,
        status: 'error',
        duration: 5000
      })
    } else {
      toast({
        title: 'Succès',
        description: dish ? 'Plat mis à jour' : 'Plat créé',
        status: 'success',
        duration: 3000
      })
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            {dish ? 'Modifier le plat' : 'Nouveau plat'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Nom du plat</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Burger Classique"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description détaillée du plat"
                  rows={3}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Catégorie</FormLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Prix (€)</FormLabel>
                <NumberInput
                  value={formData.price}
                  onChange={(value) => setFormData({ ...formData, price: value })}
                  min={0}
                  step={0.1}
                  precision={2}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel>URL de l'image</FormLabel>
                <Input
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://..."
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Stock initial</FormLabel>
                <NumberInput
                  value={formData.stock_quantity}
                  onChange={(value) => setFormData({ ...formData, stock_quantity: value })}
                  min={0}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel>Allergènes</FormLabel>
                <Input
                  value={formData.allergens}
                  onChange={(e) => setFormData({ ...formData, allergens: e.target.value })}
                  placeholder="Gluten, Lactose, Fruits à coque..."
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb={0}>Plat du jour (featured)</FormLabel>
                <Switch
                  isChecked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb={0}>Disponible</FormLabel>
                <Switch
                  isChecked={formData.is_available}
                  onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Annuler
            </Button>
            <Button colorScheme="brand" type="submit" isLoading={saving}>
              {dish ? 'Mettre à jour' : 'Créer'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

export default function AdminDishes() {
  const {
    dishes,
    loading,
    error,
    refresh,
    createDish,
    updateDish,
    deleteDish,
    toggleAvailability,
    updateStock,
    toggleFeatured
  } = useAdminDishes()

  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedDish, setSelectedDish] = useState(null)
  const toast = useToast()
  const bgColor = useColorModeValue('white', 'gray.800')

  const handleCreate = () => {
    setSelectedDish(null)
    onOpen()
  }

  const handleEdit = (dish) => {
    setSelectedDish(dish)
    onOpen()
  }

  const handleSave = async (dishData) => {
    if (selectedDish) {
      return await updateDish(selectedDish.id, dishData)
    } else {
      return await createDish(dishData)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Supprimer "${name}" ?`)) return

    const { error } = await deleteDish(id)

    if (error) {
      toast({
        title: 'Erreur',
        description: error,
        status: 'error',
        duration: 5000
      })
    } else {
      toast({
        title: 'Plat supprimé',
        status: 'success',
        duration: 3000
      })
    }
  }

  const handleToggleAvailability = async (id, currentStatus) => {
    const { error } = await toggleAvailability(id, !currentStatus)

    if (error) {
      toast({
        title: 'Erreur',
        description: error,
        status: 'error',
        duration: 3000
      })
    }
  }

  const handleToggleFeatured = async (id, currentStatus) => {
    const { error } = await toggleFeatured(id, !currentStatus)

    if (error) {
      toast({
        title: 'Erreur',
        description: error,
        status: 'error',
        duration: 3000
      })
    }
  }

  const handleStockChange = async (id, newStock) => {
    const { error } = await updateStock(id, parseInt(newStock))

    if (error) {
      toast({
        title: 'Erreur',
        description: error,
        status: 'error',
        duration: 3000
      })
    }
  }

  return (
    <VStack spacing={8} align="stretch">
      {/* Header */}
      <HStack justify="space-between">
        <Box>
          <Heading size="lg">Gestion des plats</Heading>
          <Text color="gray.600" mt={1}>
            Créer, modifier et gérer le stock des plats
          </Text>
        </Box>
        <HStack>
          <Button
            leftIcon={<FiRefreshCw />}
            onClick={refresh}
            variant="outline"
            isLoading={loading}
          >
            Actualiser
          </Button>
          <Button
            leftIcon={<FiPlus />}
            colorScheme="brand"
            onClick={handleCreate}
          >
            Nouveau plat
          </Button>
        </HStack>
      </HStack>

      {/* Error Alert */}
      {error && (
        <Alert status="error" rounded="lg">
          <AlertIcon />
          {error}
        </Alert>
      )}

      {/* Dishes Table */}
      <Card bg={bgColor}>
        <CardHeader>
          <Heading size="md">Liste des plats ({dishes.length})</Heading>
        </CardHeader>
        <CardBody>
          {loading ? (
            <Box textAlign="center" py={10}>
              <Spinner size="xl" color="brand.500" />
            </Box>
          ) : dishes.length === 0 ? (
            <Box textAlign="center" py={10}>
              <Text color="gray.500">Aucun plat pour le moment</Text>
              <Button
                mt={4}
                colorScheme="brand"
                onClick={handleCreate}
              >
                Créer le premier plat
              </Button>
            </Box>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Image</Th>
                    <Th>Nom</Th>
                    <Th>Catégorie</Th>
                    <Th>Prix</Th>
                    <Th>Stock</Th>
                    <Th>Statut</Th>
                    <Th>Featured</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {dishes.map((dish) => (
                    <Tr key={dish.id}>
                      <Td>
                        {dish.image_url ? (
                          <Image
                            src={dish.image_url}
                            alt={dish.name}
                            boxSize="50px"
                            objectFit="cover"
                            rounded="md"
                          />
                        ) : (
                          <Box
                            boxSize="50px"
                            bg="gray.200"
                            rounded="md"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <Text fontSize="xs">No img</Text>
                          </Box>
                        )}
                      </Td>
                      <Td>
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="medium" fontSize="sm">
                            {dish.name}
                          </Text>
                          <Text fontSize="xs" color="gray.500" noOfLines={1} maxW="200px">
                            {dish.description}
                          </Text>
                        </VStack>
                      </Td>
                      <Td>
                        <Badge colorScheme="purple" fontSize="xs">
                          {dish.category}
                        </Badge>
                      </Td>
                      <Td fontWeight="semibold">{dish.price}€</Td>
                      <Td>
                        <NumberInput
                          size="sm"
                          maxW="100px"
                          value={dish.stock_quantity}
                          min={0}
                          onChange={(value) => handleStockChange(dish.id, value)}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                        {dish.stock_quantity <= 5 && (
                          <Badge colorScheme="red" fontSize="xs" mt={1}>
                            Stock faible
                          </Badge>
                        )}
                      </Td>
                      <Td>
                        <Switch
                          size="sm"
                          isChecked={dish.is_available}
                          onChange={() => handleToggleAvailability(dish.id, dish.is_available)}
                          colorScheme="green"
                        />
                      </Td>
                      <Td>
                        <IconButton
                          icon={<FiStar />}
                          size="sm"
                          variant={dish.is_featured ? 'solid' : 'ghost'}
                          colorScheme="yellow"
                          onClick={() => handleToggleFeatured(dish.id, dish.is_featured)}
                          aria-label="Toggle featured"
                        />
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            icon={<FiEdit />}
                            size="sm"
                            colorScheme="blue"
                            variant="ghost"
                            onClick={() => handleEdit(dish)}
                            aria-label="Edit"
                          />
                          <IconButton
                            icon={<FiTrash2 />}
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => handleDelete(dish.id, dish.name)}
                            aria-label="Delete"
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </CardBody>
      </Card>

      {/* Create/Edit Modal */}
      <DishModal
        isOpen={isOpen}
        onClose={onClose}
        dish={selectedDish}
        onSave={handleSave}
      />
    </VStack>
  )
}
