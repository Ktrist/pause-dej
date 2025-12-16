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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  useColorModeValue,
  Textarea,
  Select,
  FormControl,
  FormLabel
} from '@chakra-ui/react'
import {
  FiRefreshCw,
  FiEye,
  FiCheck,
  FiX
} from 'react-icons/fi'
import { useQuoteRequests } from '../../hooks/useB2B'
import { useAuth } from '../../context/AuthContext'

const QuoteDetailModal = ({ isOpen, onClose, quote, onUpdate }) => {
  const toast = useToast()
  const { user } = useAuth()
  const [adminNotes, setAdminNotes] = useState(quote?.admin_notes || '')
  const [status, setStatus] = useState(quote?.status || 'new')
  const [saving, setSaving] = useState(false)

  const handleUpdate = async () => {
    setSaving(true)

    const updates = {
      admin_notes: adminNotes,
      status,
      contacted_at: status !== 'new' && !quote.contacted_at ? new Date().toISOString() : quote.contacted_at,
      contacted_by: status !== 'new' && !quote.contacted_by ? user.id : quote.contacted_by
    }

    const { error } = await onUpdate(quote.id, updates)

    if (error) {
      toast({
        title: 'Erreur',
        description: error,
        status: 'error',
        duration: 5000
      })
    } else {
      toast({
        title: 'Mis à jour',
        status: 'success',
        duration: 3000
      })
      onClose()
    }

    setSaving(false)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Demande de devis</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* Company Info */}
            <Box>
              <Heading size="sm" mb={2}>Entreprise</Heading>
              <VStack align="start" spacing={1}>
                <Text><strong>{quote?.company_name}</strong></Text>
                {quote?.siret && <Text fontSize="sm" color="gray.600">SIRET: {quote.siret}</Text>}
                <Text fontSize="sm" color="gray.600">{quote?.employee_count} employés</Text>
                {quote?.industry && <Text fontSize="sm" color="gray.600">Secteur: {quote.industry}</Text>}
                {quote?.estimated_monthly_orders && (
                  <Text fontSize="sm" color="gray.600">
                    Estimé: {quote.estimated_monthly_orders} commandes/mois
                  </Text>
                )}
              </VStack>
            </Box>

            {/* Contact Info */}
            <Box>
              <Heading size="sm" mb={2}>Contact</Heading>
              <VStack align="start" spacing={1}>
                <Text>{quote?.contact_name}</Text>
                <Text fontSize="sm" color="blue.600">{quote?.contact_email}</Text>
                <Text fontSize="sm" color="gray.600">{quote?.contact_phone}</Text>
              </VStack>
            </Box>

            {/* Message */}
            {quote?.message && (
              <Box>
                <Heading size="sm" mb={2}>Message</Heading>
                <Text fontSize="sm" color="gray.700" whiteSpace="pre-wrap">
                  {quote.message}
                </Text>
              </Box>
            )}

            {/* Status */}
            <FormControl>
              <FormLabel>Statut</FormLabel>
              <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="new">Nouveau</option>
                <option value="contacted">Contacté</option>
                <option value="quoted">Devis envoyé</option>
                <option value="converted">Converti en client</option>
                <option value="rejected">Refusé</option>
              </Select>
            </FormControl>

            {/* Admin Notes */}
            <FormControl>
              <FormLabel>Notes internes</FormLabel>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Notes, suivi, actions..."
                rows={4}
              />
            </FormControl>

            {/* Metadata */}
            <Box fontSize="xs" color="gray.500">
              <Text>Reçu le: {new Date(quote?.created_at).toLocaleString('fr-FR')}</Text>
              {quote?.contacted_at && (
                <Text>Contacté le: {new Date(quote.contacted_at).toLocaleString('fr-FR')}</Text>
              )}
            </Box>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Fermer
          </Button>
          <Button colorScheme="brand" onClick={handleUpdate} isLoading={saving}>
            Mettre à jour
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default function AdminB2BQuotes() {
  const { quoteRequests, loading, error, refresh, updateQuoteRequest } = useQuoteRequests()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedQuote, setSelectedQuote] = useState(null)
  const bgColor = useColorModeValue('white', 'gray.800')

  const handleViewDetails = (quote) => {
    setSelectedQuote(quote)
    onOpen()
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      new: { label: 'Nouveau', colorScheme: 'blue' },
      contacted: { label: 'Contacté', colorScheme: 'purple' },
      quoted: { label: 'Devis envoyé', colorScheme: 'orange' },
      converted: { label: 'Client', colorScheme: 'green' },
      rejected: { label: 'Refusé', colorScheme: 'red' }
    }

    const config = statusConfig[status] || { label: status, colorScheme: 'gray' }

    return (
      <Badge colorScheme={config.colorScheme} fontSize="xs">
        {config.label}
      </Badge>
    )
  }

  return (
    <VStack spacing={8} align="stretch">
      {/* Header */}
      <HStack justify="space-between">
        <Box>
          <Heading size="lg">Demandes de devis B2B</Heading>
          <Text color="gray.600" mt={1}>
            Gérer les demandes des entreprises
          </Text>
        </Box>
        <Button
          leftIcon={<FiRefreshCw />}
          onClick={refresh}
          variant="outline"
          isLoading={loading}
        >
          Actualiser
        </Button>
      </HStack>

      {/* Error Alert */}
      {error && (
        <Alert status="error" rounded="lg">
          <AlertIcon />
          {error}
        </Alert>
      )}

      {/* Quote Requests Table */}
      <Card bg={bgColor}>
        <CardHeader>
          <Heading size="md">Demandes ({quoteRequests.length})</Heading>
        </CardHeader>
        <CardBody>
          {loading ? (
            <Box textAlign="center" py={10}>
              <Spinner size="xl" color="brand.500" />
            </Box>
          ) : quoteRequests.length === 0 ? (
            <Box textAlign="center" py={10}>
              <Text color="gray.500">Aucune demande de devis pour le moment</Text>
            </Box>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Date</Th>
                    <Th>Entreprise</Th>
                    <Th>Contact</Th>
                    <Th>Employés</Th>
                    <Th>Secteur</Th>
                    <Th>Statut</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {quoteRequests.map((quote) => (
                    <Tr key={quote.id}>
                      <Td fontSize="sm">
                        {new Date(quote.created_at).toLocaleDateString('fr-FR')}
                      </Td>
                      <Td>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm" fontWeight="medium">
                            {quote.company_name}
                          </Text>
                          {quote.siret && (
                            <Text fontSize="xs" color="gray.500">
                              {quote.siret}
                            </Text>
                          )}
                        </VStack>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm">{quote.contact_name}</Text>
                          <Text fontSize="xs" color="gray.500">
                            {quote.contact_email}
                          </Text>
                        </VStack>
                      </Td>
                      <Td fontSize="sm">{quote.employee_count}</Td>
                      <Td fontSize="sm">{quote.industry || '-'}</Td>
                      <Td>{getStatusBadge(quote.status)}</Td>
                      <Td>
                        <IconButton
                          icon={<FiEye />}
                          size="sm"
                          colorScheme="brand"
                          variant="ghost"
                          onClick={() => handleViewDetails(quote)}
                          aria-label="View details"
                        />
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </CardBody>
      </Card>

      {/* Detail Modal */}
      {selectedQuote && (
        <QuoteDetailModal
          isOpen={isOpen}
          onClose={onClose}
          quote={selectedQuote}
          onUpdate={updateQuoteRequest}
        />
      )}
    </VStack>
  )
}
