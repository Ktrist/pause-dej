import { useState, useEffect } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Radio,
  RadioGroup,
  Stack,
  Icon,
  Badge,
  useDisclosure,
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
  useToast
} from '@chakra-ui/react'
import { FiMapPin, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'

export default function AddressSelector({ selectedAddress, onSelectAddress }) {
  const { user } = useAuth()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  // Mock addresses (will be replaced with Supabase data)
  const [addresses, setAddresses] = useState([
    {
      id: '1',
      label: 'Domicile',
      street_address: '123 Rue de la Paix',
      city: 'Paris',
      postal_code: '75001',
      additional_info: 'Appartement 4B, Code: 1234',
      is_default: true
    },
    {
      id: '2',
      label: 'Bureau',
      street_address: '456 Avenue des Champs-Élysées',
      city: 'Paris',
      postal_code: '75008',
      additional_info: 'Réception, 3ème étage',
      is_default: false
    }
  ])

  const [editingAddress, setEditingAddress] = useState(null)
  const [formData, setFormData] = useState({
    label: '',
    street_address: '',
    city: '',
    postal_code: '',
    additional_info: ''
  })

  // Set default address on mount
  useEffect(() => {
    const defaultAddr = addresses.find(addr => addr.is_default)
    if (defaultAddr && !selectedAddress) {
      onSelectAddress(defaultAddr)
    }
  }, [addresses, selectedAddress, onSelectAddress])

  const handleOpenModal = (address = null) => {
    if (address) {
      setEditingAddress(address)
      setFormData(address)
    } else {
      setEditingAddress(null)
      setFormData({
        label: '',
        street_address: '',
        city: '',
        postal_code: '',
        additional_info: ''
      })
    }
    onOpen()
  }

  const handleSaveAddress = () => {
    if (editingAddress) {
      // Update existing
      setAddresses(addresses.map(addr =>
        addr.id === editingAddress.id ? { ...formData, id: addr.id } : addr
      ))
      toast({
        title: 'Adresse modifiée',
        status: 'success',
        duration: 2000
      })
    } else {
      // Add new
      const newAddress = {
        ...formData,
        id: Date.now().toString(),
        is_default: addresses.length === 0
      }
      setAddresses([...addresses, newAddress])

      // Auto-select if first address
      if (addresses.length === 0) {
        onSelectAddress(newAddress)
      }

      toast({
        title: 'Adresse ajoutée',
        status: 'success',
        duration: 2000
      })
    }
    onClose()
  }

  const handleDeleteAddress = (addressId) => {
    setAddresses(addresses.filter(addr => addr.id !== addressId))
    if (selectedAddress?.id === addressId) {
      onSelectAddress(null)
    }
    toast({
      title: 'Adresse supprimée',
      status: 'info',
      duration: 2000
    })
  }

  return (
    <Box bg="white" p={6} rounded="lg" shadow="sm">
      <VStack align="stretch" spacing={6}>
        <HStack justify="space-between">
          <Box>
            <Text fontSize="xl" fontWeight="bold">Adresse de livraison</Text>
            <Text fontSize="sm" color="gray.600" mt={1}>
              Où souhaitez-vous être livré ?
            </Text>
          </Box>
          <Button
            leftIcon={<FiPlus />}
            colorScheme="brand"
            variant="outline"
            onClick={() => handleOpenModal()}
          >
            Ajouter
          </Button>
        </HStack>

        {addresses.length === 0 ? (
          <Box
            p={12}
            textAlign="center"
            border="2px dashed"
            borderColor="gray.300"
            rounded="lg"
          >
            <Icon as={FiMapPin} boxSize={12} color="gray.400" mb={4} />
            <Text color="gray.600" mb={4}>
              Aucune adresse enregistrée
            </Text>
            <Button
              leftIcon={<FiPlus />}
              colorScheme="brand"
              onClick={() => handleOpenModal()}
            >
              Ajouter une adresse
            </Button>
          </Box>
        ) : (
          <RadioGroup
            value={selectedAddress?.id}
            onChange={(id) => {
              const addr = addresses.find(a => a.id === id)
              onSelectAddress(addr)
            }}
          >
            <Stack spacing={3}>
              {addresses.map((address) => (
                <Box
                  key={address.id}
                  p={4}
                  border="2px solid"
                  borderColor={selectedAddress?.id === address.id ? 'brand.500' : 'gray.200'}
                  rounded="lg"
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{
                    borderColor: 'brand.300',
                    shadow: 'sm'
                  }}
                  onClick={() => onSelectAddress(address)}
                >
                  <HStack align="start" spacing={3}>
                    <Radio value={address.id} mt={1} colorScheme="brand" />

                    <Box flex="1">
                      <HStack mb={2}>
                        <Text fontWeight="bold">{address.label}</Text>
                        {address.is_default && (
                          <Badge colorScheme="green" fontSize="xs">Par défaut</Badge>
                        )}
                      </HStack>

                      <VStack align="start" spacing={1} fontSize="sm" color="gray.700">
                        <Text>{address.street_address}</Text>
                        <Text>{address.postal_code} {address.city}</Text>
                        {address.additional_info && (
                          <Text color="gray.600" fontSize="xs">
                            {address.additional_info}
                          </Text>
                        )}
                      </VStack>
                    </Box>

                    <HStack spacing={2}>
                      <Button
                        size="sm"
                        variant="ghost"
                        leftIcon={<FiEdit2 />}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenModal(address)
                        }}
                      >
                        Modifier
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        leftIcon={<FiTrash2 />}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteAddress(address.id)
                        }}
                      >
                        Supprimer
                      </Button>
                    </HStack>
                  </HStack>
                </Box>
              ))}
            </Stack>
          </RadioGroup>
        )}
      </VStack>

      {/* Add/Edit Address Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingAddress ? 'Modifier l\'adresse' : 'Nouvelle adresse'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Libellé</FormLabel>
                <Input
                  placeholder="Domicile, Bureau, etc."
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Adresse</FormLabel>
                <Input
                  placeholder="123 Rue de la Paix"
                  value={formData.street_address}
                  onChange={(e) => setFormData({ ...formData, street_address: e.target.value })}
                />
              </FormControl>

              <HStack spacing={4} w="full">
                <FormControl isRequired flex="1">
                  <FormLabel>Code postal</FormLabel>
                  <Input
                    placeholder="75001"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                  />
                </FormControl>

                <FormControl isRequired flex="2">
                  <FormLabel>Ville</FormLabel>
                  <Input
                    placeholder="Paris"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>Informations complémentaires</FormLabel>
                <Textarea
                  placeholder="Appartement, étage, code d'accès..."
                  value={formData.additional_info}
                  onChange={(e) => setFormData({ ...formData, additional_info: e.target.value })}
                  rows={3}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Annuler
            </Button>
            <Button
              colorScheme="brand"
              onClick={handleSaveAddress}
              isDisabled={
                !formData.label ||
                !formData.street_address ||
                !formData.city ||
                !formData.postal_code
              }
            >
              {editingAddress ? 'Modifier' : 'Ajouter'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}
