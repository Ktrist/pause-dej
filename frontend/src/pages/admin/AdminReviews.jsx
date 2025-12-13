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
  Select,
  Checkbox,
  Alert,
  AlertIcon,
  useToast,
  Spinner,
  useColorModeValue,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Avatar,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure
} from '@chakra-ui/react'
import {
  FiRefreshCw,
  FiTrash2,
  FiCheck,
  FiX,
  FiCheckCircle,
  FiStar,
  FiThumbsUp,
  FiThumbsDown,
  FiEye
} from 'react-icons/fi'
import { useAdminReviews } from '../../hooks/useAdminReviews'
import { StarRating } from '../../components/reviews/StarRating'

const ReviewDetailModal = ({ review, isOpen, onClose }) => {
  if (!review) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Détails de l'avis</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* Dish Info */}
            <HStack spacing={3}>
              <Image
                src={review.dish?.image_url}
                alt={review.dish?.name}
                boxSize="60px"
                objectFit="cover"
                rounded="md"
              />
              <Box>
                <Text fontWeight="600">{review.dish?.name}</Text>
                <Badge colorScheme="purple" fontSize="xs">
                  {review.dish?.category}
                </Badge>
              </Box>
            </HStack>

            {/* User Info */}
            <Box p={3} bg="gray.50" rounded="md">
              <HStack spacing={3}>
                <Avatar
                  size="sm"
                  name={review.user?.user_metadata?.full_name || review.user?.email}
                  bg="brand.500"
                />
                <VStack align="start" spacing={0}>
                  <Text fontWeight="600" fontSize="sm">
                    {review.user?.user_metadata?.full_name || 'Utilisateur'}
                  </Text>
                  <Text fontSize="xs" color="gray.600">
                    {review.user?.email}
                  </Text>
                </VStack>
              </HStack>
            </Box>

            {/* Rating */}
            <Box>
              <Text fontSize="sm" color="gray.600" mb={2}>Note</Text>
              <StarRating rating={review.rating} size="lg" showValue />
            </Box>

            {/* Title */}
            {review.title && (
              <Box>
                <Text fontSize="sm" color="gray.600" mb={1}>Titre</Text>
                <Text fontWeight="600">{review.title}</Text>
              </Box>
            )}

            {/* Comment */}
            <Box>
              <Text fontSize="sm" color="gray.600" mb={1}>Commentaire</Text>
              <Text fontSize="sm" lineHeight="tall">{review.comment}</Text>
            </Box>

            {/* Metadata */}
            <SimpleGrid columns={2} spacing={3}>
              <Box>
                <Text fontSize="xs" color="gray.500">Achat vérifié</Text>
                <Badge colorScheme={review.is_verified_purchase ? 'green' : 'gray'} mt={1}>
                  {review.is_verified_purchase ? 'Oui' : 'Non'}
                </Badge>
              </Box>
              <Box>
                <Text fontSize="xs" color="gray.500">Statut</Text>
                <Badge colorScheme={review.is_approved ? 'green' : 'orange'} mt={1}>
                  {review.is_approved ? 'Approuvé' : 'En attente'}
                </Badge>
              </Box>
              <Box>
                <Text fontSize="xs" color="gray.500">Utile</Text>
                <HStack spacing={1} mt={1}>
                  <FiThumbsUp size={12} />
                  <Text fontSize="sm" fontWeight="600">{review.helpful_count}</Text>
                </HStack>
              </Box>
              <Box>
                <Text fontSize="xs" color="gray.500">Pas utile</Text>
                <HStack spacing={1} mt={1}>
                  <FiThumbsDown size={12} />
                  <Text fontSize="sm" fontWeight="600">{review.not_helpful_count}</Text>
                </HStack>
              </Box>
            </SimpleGrid>

            {/* Date */}
            <Box>
              <Text fontSize="xs" color="gray.500">
                Publié le {new Date(review.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </Box>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Fermer</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default function AdminReviews() {
  const {
    reviews,
    stats,
    loading,
    error,
    refresh,
    updateReviewStatus,
    deleteReview,
    bulkApprove,
    bulkDelete
  } = useAdminReviews()

  const [selectedReviews, setSelectedReviews] = useState([])
  const [filterStatus, setFilterStatus] = useState('all') // all, approved, pending
  const [filterRating, setFilterRating] = useState('all') // all, 5, 4, 3, 2, 1
  const [selectedReview, setSelectedReview] = useState(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  const bgColor = useColorModeValue('white', 'gray.800')

  // Filter reviews
  const filteredReviews = reviews.filter(review => {
    if (filterStatus === 'approved' && !review.is_approved) return false
    if (filterStatus === 'pending' && review.is_approved) return false
    if (filterRating !== 'all' && review.rating !== parseInt(filterRating)) return false
    return true
  })

  const handleToggleSelect = (reviewId) => {
    setSelectedReviews(prev =>
      prev.includes(reviewId)
        ? prev.filter(id => id !== reviewId)
        : [...prev, reviewId]
    )
  }

  const handleSelectAll = () => {
    if (selectedReviews.length === filteredReviews.length) {
      setSelectedReviews([])
    } else {
      setSelectedReviews(filteredReviews.map(r => r.id))
    }
  }

  const handleApprove = async (reviewId) => {
    const { error } = await updateReviewStatus(reviewId, true)

    if (error) {
      toast({
        title: 'Erreur',
        description: error,
        status: 'error',
        duration: 3000
      })
    } else {
      toast({
        title: 'Avis approuvé',
        status: 'success',
        duration: 2000
      })
    }
  }

  const handleReject = async (reviewId) => {
    const { error } = await updateReviewStatus(reviewId, false)

    if (error) {
      toast({
        title: 'Erreur',
        description: error,
        status: 'error',
        duration: 3000
      })
    } else {
      toast({
        title: 'Avis rejeté',
        status: 'success',
        duration: 2000
      })
    }
  }

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Supprimer cet avis définitivement ?')) return

    const { error } = await deleteReview(reviewId)

    if (error) {
      toast({
        title: 'Erreur',
        description: error,
        status: 'error',
        duration: 3000
      })
    } else {
      toast({
        title: 'Avis supprimé',
        status: 'success',
        duration: 2000
      })
    }
  }

  const handleBulkApprove = async () => {
    if (selectedReviews.length === 0) return

    const { error } = await bulkApprove(selectedReviews)

    if (error) {
      toast({
        title: 'Erreur',
        description: error,
        status: 'error',
        duration: 3000
      })
    } else {
      toast({
        title: `${selectedReviews.length} avis approuvé(s)`,
        status: 'success',
        duration: 2000
      })
      setSelectedReviews([])
    }
  }

  const handleBulkDelete = async () => {
    if (selectedReviews.length === 0) return
    if (!window.confirm(`Supprimer ${selectedReviews.length} avis définitivement ?`)) return

    const { error } = await bulkDelete(selectedReviews)

    if (error) {
      toast({
        title: 'Erreur',
        description: error,
        status: 'error',
        duration: 3000
      })
    } else {
      toast({
        title: `${selectedReviews.length} avis supprimé(s)`,
        status: 'success',
        duration: 2000
      })
      setSelectedReviews([])
    }
  }

  const handleViewDetails = (review) => {
    setSelectedReview(review)
    onOpen()
  }

  return (
    <VStack spacing={8} align="stretch">
      {/* Header */}
      <HStack justify="space-between">
        <Box>
          <Heading size="lg">Gestion des avis</Heading>
          <Text color="gray.600" mt={1}>
            Modérer et gérer les avis clients
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

      {/* Stats */}
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
        <Card bg={bgColor}>
          <CardBody>
            <Stat>
              <StatLabel>Total des avis</StatLabel>
              <StatNumber>{stats.total}</StatNumber>
              <StatHelpText>
                <HStack spacing={1}>
                  <FiStar />
                  <Text>{stats.averageRating.toFixed(1)} moyenne</Text>
                </HStack>
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={bgColor}>
          <CardBody>
            <Stat>
              <StatLabel>Approuvés</StatLabel>
              <StatNumber color="green.500">{stats.approved}</StatNumber>
              <StatHelpText>
                {stats.total > 0 && `${((stats.approved / stats.total) * 100).toFixed(0)}%`}
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={bgColor}>
          <CardBody>
            <Stat>
              <StatLabel>En attente</StatLabel>
              <StatNumber color="orange.500">{stats.pending}</StatNumber>
              <StatHelpText>
                {stats.pending > 0 ? 'À modérer' : 'Aucun'}
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={bgColor}>
          <CardBody>
            <Stat>
              <StatLabel>Sélectionnés</StatLabel>
              <StatNumber>{selectedReviews.length}</StatNumber>
              <StatHelpText>
                {selectedReviews.length > 0 && 'Actions groupées'}
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Error Alert */}
      {error && (
        <Alert status="error" rounded="lg">
          <AlertIcon />
          {error}
        </Alert>
      )}

      {/* Filters and Bulk Actions */}
      <Card bg={bgColor}>
        <CardBody>
          <HStack spacing={4} wrap="wrap">
            <Box>
              <Text fontSize="sm" mb={2} fontWeight="500">Statut</Text>
              <Select
                size="sm"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                w="auto"
              >
                <option value="all">Tous les avis</option>
                <option value="approved">Approuvés</option>
                <option value="pending">En attente</option>
              </Select>
            </Box>

            <Box>
              <Text fontSize="sm" mb={2} fontWeight="500">Note</Text>
              <Select
                size="sm"
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                w="auto"
              >
                <option value="all">Toutes les notes</option>
                <option value="5">⭐ 5 étoiles</option>
                <option value="4">⭐ 4 étoiles</option>
                <option value="3">⭐ 3 étoiles</option>
                <option value="2">⭐ 2 étoiles</option>
                <option value="1">⭐ 1 étoile</option>
              </Select>
            </Box>

            {selectedReviews.length > 0 && (
              <>
                <Box borderLeft="2px" borderColor="gray.200" pl={4} ml="auto">
                  <Text fontSize="sm" mb={2} fontWeight="500">Actions groupées</Text>
                  <HStack spacing={2}>
                    <Button
                      size="sm"
                      leftIcon={<FiCheck />}
                      colorScheme="green"
                      onClick={handleBulkApprove}
                    >
                      Approuver ({selectedReviews.length})
                    </Button>
                    <Button
                      size="sm"
                      leftIcon={<FiTrash2 />}
                      colorScheme="red"
                      variant="outline"
                      onClick={handleBulkDelete}
                    >
                      Supprimer ({selectedReviews.length})
                    </Button>
                  </HStack>
                </Box>
              </>
            )}
          </HStack>
        </CardBody>
      </Card>

      {/* Reviews Table */}
      <Card bg={bgColor}>
        <CardHeader>
          <HStack justify="space-between">
            <Heading size="md">
              Avis ({filteredReviews.length})
            </Heading>
            {filteredReviews.length > 0 && (
              <Checkbox
                isChecked={selectedReviews.length === filteredReviews.length}
                isIndeterminate={
                  selectedReviews.length > 0 &&
                  selectedReviews.length < filteredReviews.length
                }
                onChange={handleSelectAll}
              >
                Tout sélectionner
              </Checkbox>
            )}
          </HStack>
        </CardHeader>
        <CardBody>
          {loading ? (
            <Box textAlign="center" py={10}>
              <Spinner size="xl" color="brand.500" />
            </Box>
          ) : filteredReviews.length === 0 ? (
            <Box textAlign="center" py={10}>
              <Text fontSize="4xl" mb={3}>⭐</Text>
              <Text color="gray.500">
                {reviews.length === 0
                  ? 'Aucun avis pour le moment'
                  : 'Aucun avis ne correspond aux filtres'}
              </Text>
            </Box>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th w="40px"></Th>
                    <Th>Plat</Th>
                    <Th>Utilisateur</Th>
                    <Th>Note</Th>
                    <Th>Avis</Th>
                    <Th>Votes</Th>
                    <Th>Statut</Th>
                    <Th>Date</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredReviews.map((review) => (
                    <Tr key={review.id}>
                      <Td>
                        <Checkbox
                          isChecked={selectedReviews.includes(review.id)}
                          onChange={() => handleToggleSelect(review.id)}
                        />
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <Image
                            src={review.dish?.image_url}
                            alt={review.dish?.name}
                            boxSize="40px"
                            objectFit="cover"
                            rounded="md"
                          />
                          <VStack align="start" spacing={0}>
                            <Text fontSize="xs" fontWeight="600" noOfLines={1} maxW="150px">
                              {review.dish?.name}
                            </Text>
                            <Badge colorScheme="purple" fontSize="2xs">
                              {review.dish?.category}
                            </Badge>
                          </VStack>
                        </HStack>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <Avatar
                            size="xs"
                            name={review.user?.user_metadata?.full_name || review.user?.email}
                            bg="brand.500"
                          />
                          <VStack align="start" spacing={0}>
                            <Text fontSize="xs" fontWeight="500">
                              {review.user?.user_metadata?.full_name || 'Utilisateur'}
                            </Text>
                            {review.is_verified_purchase && (
                              <HStack spacing={1}>
                                <FiCheckCircle size={10} color="green" />
                                <Text fontSize="2xs" color="green.600">
                                  Vérifié
                                </Text>
                              </HStack>
                            )}
                          </VStack>
                        </HStack>
                      </Td>
                      <Td>
                        <StarRating rating={review.rating} size="sm" />
                      </Td>
                      <Td>
                        <VStack align="start" spacing={0}>
                          {review.title && (
                            <Text fontSize="xs" fontWeight="600" noOfLines={1} maxW="200px">
                              {review.title}
                            </Text>
                          )}
                          <Text fontSize="xs" color="gray.600" noOfLines={2} maxW="200px">
                            {review.comment}
                          </Text>
                        </VStack>
                      </Td>
                      <Td>
                        <VStack spacing={0} align="start">
                          <HStack spacing={1}>
                            <FiThumbsUp size={10} />
                            <Text fontSize="xs">{review.helpful_count}</Text>
                          </HStack>
                          <HStack spacing={1}>
                            <FiThumbsDown size={10} />
                            <Text fontSize="xs">{review.not_helpful_count}</Text>
                          </HStack>
                        </VStack>
                      </Td>
                      <Td>
                        <Switch
                          size="sm"
                          isChecked={review.is_approved}
                          onChange={() =>
                            review.is_approved
                              ? handleReject(review.id)
                              : handleApprove(review.id)
                          }
                          colorScheme="green"
                        />
                      </Td>
                      <Td>
                        <Text fontSize="xs" color="gray.600">
                          {new Date(review.created_at).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit'
                          })}
                        </Text>
                      </Td>
                      <Td>
                        <HStack spacing={1}>
                          <Tooltip label="Voir les détails">
                            <IconButton
                              icon={<FiEye />}
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewDetails(review)}
                              aria-label="View"
                            />
                          </Tooltip>
                          <Tooltip label={review.is_approved ? 'Rejeter' : 'Approuver'}>
                            <IconButton
                              icon={review.is_approved ? <FiX /> : <FiCheck />}
                              size="sm"
                              colorScheme={review.is_approved ? 'orange' : 'green'}
                              variant="ghost"
                              onClick={() =>
                                review.is_approved
                                  ? handleReject(review.id)
                                  : handleApprove(review.id)
                              }
                              aria-label={review.is_approved ? 'Reject' : 'Approve'}
                            />
                          </Tooltip>
                          <Tooltip label="Supprimer">
                            <IconButton
                              icon={<FiTrash2 />}
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => handleDelete(review.id)}
                              aria-label="Delete"
                            />
                          </Tooltip>
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

      {/* Review Detail Modal */}
      <ReviewDetailModal
        review={selectedReview}
        isOpen={isOpen}
        onClose={onClose}
      />
    </VStack>
  )
}
