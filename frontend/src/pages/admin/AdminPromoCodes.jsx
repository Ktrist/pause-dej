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
  Switch,
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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
  useDisclosure,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  useColorModeValue,
  Checkbox,
  Divider
} from '@chakra-ui/react'
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiRefreshCw,
  FiCopy
} from 'react-icons/fi'
import { useAdminPromoCodes } from '../../hooks/useAdminPromoCodes'

const PromoCodeModal = ({ isOpen, onClose, promoCode, onSave }) => {
  const toast = useToast()
  const [formData, setFormData] = useState(
    promoCode || {
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 10,
      min_order_amount: 0,
      max_discount_amount: null,
      max_uses: null,
      max_uses_per_user: 1,
      valid_from: new Date().toISOString().split('T')[0],
      valid_until: null,
      is_active: true,
      applies_to_delivery: false
    }
  )
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    // Validate code format (uppercase, alphanumeric)
    const codeRegex = /^[A-Z0-9]+$/
    if (!codeRegex.test(formData.code)) {
      toast({
        title: 'Code invalide',
        description: 'Le code doit contenir uniquement des lettres majuscules et des chiffres',
        status: 'error',
        duration: 5000
      })
      setSaving(false)
      return
    }

    const promoData = {
      ...formData,
      discount_value: parseFloat(formData.discount_value),
      min_order_amount: parseFloat(formData.min_order_amount) || 0,
      max_discount_amount: formData.max_discount_amount ? parseFloat(formData.max_discount_amount) : null,
      max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
      max_uses_per_user: parseInt(formData.max_uses_per_user),
      valid_until: formData.valid_until || null
    }

    const { error } = await onSave(promoData)

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
        description: promoCode ? 'Code promo mis à jour' : 'Code promo créé',
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
            {promoCode ? 'Modifier le code promo' : 'Nouveau code promo'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Code promo</FormLabel>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="Ex: BIENVENUE10"
                  textTransform="uppercase"
                  isDisabled={!!promoCode} // Can't change code after creation
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Lettres majuscules et chiffres uniquement
                </Text>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Description</FormLabel>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ex: 10% de réduction pour les nouveaux clients"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Type de réduction</FormLabel>
                <Select
                  value={formData.discount_type}
                  onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                >
                  <option value="percentage">Pourcentage (%)</option>
                  <option value="fixed">Montant fixe (€)</option>
                  <option value="free_delivery">Livraison gratuite</option>
                </Select>
              </FormControl>

              {formData.discount_type !== 'free_delivery' && (
                <FormControl isRequired>
                  <FormLabel>
                    Valeur de la réduction {formData.discount_type === 'percentage' ? '(%)' : '(€)'}
                  </FormLabel>
                  <NumberInput
                    value={formData.discount_value}
                    onChange={(value) => setFormData({ ...formData, discount_value: value })}
                    min={0}
                    max={formData.discount_type === 'percentage' ? 100 : undefined}
                    step={formData.discount_type === 'percentage' ? 1 : 0.5}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              )}

              <Divider />

              <FormControl>
                <FormLabel>Montant minimum de commande (€)</FormLabel>
                <NumberInput
                  value={formData.min_order_amount}
                  onChange={(value) => setFormData({ ...formData, min_order_amount: value })}
                  min={0}
                  step={1}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  0 = pas de minimum
                </Text>
              </FormControl>

              {formData.discount_type === 'percentage' && (
                <FormControl>
                  <FormLabel>Réduction maximale (€)</FormLabel>
                  <NumberInput
                    value={formData.max_discount_amount || ''}
                    onChange={(value) => setFormData({ ...formData, max_discount_amount: value })}
                    min={0}
                    step={1}
                  >
                    <NumberInputField placeholder="Illimité" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Optionnel : plafond de réduction en euros
                  </Text>
                </FormControl>
              )}

              <Divider />

              <FormControl>
                <FormLabel>Nombre d'utilisations maximum</FormLabel>
                <NumberInput
                  value={formData.max_uses || ''}
                  onChange={(value) => setFormData({ ...formData, max_uses: value })}
                  min={1}
                >
                  <NumberInputField placeholder="Illimité" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Nombre total d'utilisations possibles
                </Text>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Utilisations par utilisateur</FormLabel>
                <NumberInput
                  value={formData.max_uses_per_user}
                  onChange={(value) => setFormData({ ...formData, max_uses_per_user: value })}
                  min={1}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <Divider />

              <FormControl isRequired>
                <FormLabel>Valide à partir du</FormLabel>
                <Input
                  type="date"
                  value={formData.valid_from}
                  onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Valide jusqu'au</FormLabel>
                <Input
                  type="date"
                  value={formData.valid_until || ''}
                  onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Optionnel : laisser vide pour aucune limite
                </Text>
              </FormControl>

              <Divider />

              <FormControl display="flex" alignItems="center">
                <Checkbox
                  isChecked={formData.applies_to_delivery}
                  onChange={(e) => setFormData({ ...formData, applies_to_delivery: e.target.checked })}
                >
                  Appliquer la réduction aux frais de livraison
                </Checkbox>
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb={0}>Actif</FormLabel>
                <Switch
                  isChecked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Annuler
            </Button>
            <Button colorScheme="brand" type="submit" isLoading={saving}>
              {promoCode ? 'Mettre à jour' : 'Créer'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

export default function AdminPromoCodes() {
  const {
    promoCodes,
    loading,
    error,
    refresh,
    createPromoCode,
    updatePromoCode,
    deletePromoCode,
    toggleActive
  } = useAdminPromoCodes()

  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedPromoCode, setSelectedPromoCode] = useState(null)
  const toast = useToast()
  const bgColor = useColorModeValue('white', 'gray.800')

  const handleCreate = () => {
    setSelectedPromoCode(null)
    onOpen()
  }

  const handleEdit = (promoCode) => {
    setSelectedPromoCode(promoCode)
    onOpen()
  }

  const handleSave = async (promoData) => {
    if (selectedPromoCode) {
      return await updatePromoCode(selectedPromoCode.id, promoData)
    } else {
      return await createPromoCode(promoData)
    }
  }

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Supprimer le code "${code}" ?`)) return

    const { error } = await deletePromoCode(id)

    if (error) {
      toast({
        title: 'Erreur',
        description: error,
        status: 'error',
        duration: 5000
      })
    } else {
      toast({
        title: 'Code supprimé',
        status: 'success',
        duration: 3000
      })
    }
  }

  const handleToggleActive = async (id, currentStatus) => {
    const { error } = await toggleActive(id, !currentStatus)

    if (error) {
      toast({
        title: 'Erreur',
        description: error,
        status: 'error',
        duration: 3000
      })
    }
  }

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code)
    toast({
      title: 'Code copié',
      description: `Le code "${code}" a été copié dans le presse-papiers`,
      status: 'success',
      duration: 2000
    })
  }

  const getDiscountDisplay = (promoCode) => {
    if (promoCode.discount_type === 'free_delivery') {
      return 'Livraison gratuite'
    } else if (promoCode.discount_type === 'percentage') {
      return `${promoCode.discount_value}%${promoCode.max_discount_amount ? ` (max ${promoCode.max_discount_amount}€)` : ''}`
    } else {
      return `${promoCode.discount_value}€`
    }
  }

  return (
    <VStack spacing={8} align="stretch">
      {/* Header */}
      <HStack justify="space-between">
        <Box>
          <Heading size="lg">Codes Promo</Heading>
          <Text color="gray.600" mt={1}>
            Créer et gérer les codes promotionnels
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
            Nouveau code
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

      {/* Promo Codes Table */}
      <Card bg={bgColor}>
        <CardHeader>
          <Heading size="md">Liste des codes promo ({promoCodes.length})</Heading>
        </CardHeader>
        <CardBody>
          {loading ? (
            <Box textAlign="center" py={10}>
              <Spinner size="xl" color="brand.500" />
            </Box>
          ) : promoCodes.length === 0 ? (
            <Box textAlign="center" py={10}>
              <Text color="gray.500">Aucun code promo pour le moment</Text>
              <Button
                mt={4}
                colorScheme="brand"
                onClick={handleCreate}
              >
                Créer le premier code
              </Button>
            </Box>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Code</Th>
                    <Th>Description</Th>
                    <Th>Réduction</Th>
                    <Th>Conditions</Th>
                    <Th>Utilisations</Th>
                    <Th>Validité</Th>
                    <Th>Statut</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {promoCodes.map((promo) => (
                    <Tr key={promo.id}>
                      <Td>
                        <HStack>
                          <Text fontFamily="mono" fontWeight="bold" fontSize="sm">
                            {promo.code}
                          </Text>
                          <IconButton
                            icon={<FiCopy />}
                            size="xs"
                            variant="ghost"
                            onClick={() => handleCopyCode(promo.code)}
                            aria-label="Copy code"
                          />
                        </HStack>
                      </Td>
                      <Td>
                        <Text fontSize="sm" maxW="200px" noOfLines={2}>
                          {promo.description}
                        </Text>
                      </Td>
                      <Td>
                        <Badge colorScheme="green" fontSize="xs">
                          {getDiscountDisplay(promo)}
                        </Badge>
                      </Td>
                      <Td fontSize="xs" color="gray.600">
                        {promo.min_order_amount > 0 && (
                          <Text>Min: {promo.min_order_amount}€</Text>
                        )}
                        {promo.applies_to_delivery && (
                          <Text color="blue.600">Livraison incluse</Text>
                        )}
                      </Td>
                      <Td fontSize="xs">
                        <Text>
                          {promo.times_used} / {promo.max_uses || '∞'}
                        </Text>
                        <Text color="gray.500">
                          Max/user: {promo.max_uses_per_user}
                        </Text>
                      </Td>
                      <Td fontSize="xs">
                        <VStack align="start" spacing={0}>
                          <Text>
                            Du {new Date(promo.valid_from).toLocaleDateString('fr-FR')}
                          </Text>
                          <Text>
                            {promo.valid_until
                              ? `Au ${new Date(promo.valid_until).toLocaleDateString('fr-FR')}`
                              : 'Sans limite'
                            }
                          </Text>
                        </VStack>
                      </Td>
                      <Td>
                        <Switch
                          size="sm"
                          isChecked={promo.is_active}
                          onChange={() => handleToggleActive(promo.id, promo.is_active)}
                          colorScheme="green"
                        />
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            icon={<FiEdit />}
                            size="sm"
                            colorScheme="blue"
                            variant="ghost"
                            onClick={() => handleEdit(promo)}
                            aria-label="Edit"
                          />
                          <IconButton
                            icon={<FiTrash2 />}
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => handleDelete(promo.id, promo.code)}
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
      <PromoCodeModal
        isOpen={isOpen}
        onClose={onClose}
        promoCode={selectedPromoCode}
        onSave={handleSave}
      />
    </VStack>
  )
}
