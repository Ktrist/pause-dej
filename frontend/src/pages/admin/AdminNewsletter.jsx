import { useState } from 'react'
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Button,
  Card,
  CardBody,
  Text,
  Badge,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  useToast,
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
  Textarea,
  Select,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Alert,
  AlertIcon,
  Divider
} from '@chakra-ui/react'
import { FiPlus, FiSend, FiEdit2, FiTrash2, FiMail, FiUsers, FiTrendingUp } from 'react-icons/fi'
import {
  useNewsletterCampaigns,
  useSubscriberStats,
  useCampaignStats
} from '../../hooks/useNewsletter'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const CAMPAIGN_STATUS_COLORS = {
  draft: 'gray',
  scheduled: 'blue',
  sending: 'orange',
  sent: 'green',
  cancelled: 'red'
}

const CAMPAIGN_TYPES = [
  { value: 'newsletter', label: 'Newsletter hebdomadaire' },
  { value: 'promo', label: 'Promotion / Offre spéciale' },
  { value: 'reactivation', label: 'Réactivation clients inactifs' },
  { value: 'announcement', label: 'Annonce importante' }
]

export default function AdminNewsletter() {
  const { campaigns, loading, createCampaign, updateCampaign, deleteCampaign, sendCampaign } =
    useNewsletterCampaigns()
  const { stats: subscriberStats, loading: loadingStats } = useSubscriberStats()
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [editingCampaign, setEditingCampaign] = useState(null)
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    campaign_type: 'newsletter',
    subject: '',
    preview_text: '',
    content: ''
  })

  const handleOpenModal = (campaign = null) => {
    if (campaign) {
      setEditingCampaign(campaign)
      setCampaignForm({
        name: campaign.name,
        campaign_type: campaign.campaign_type,
        subject: campaign.subject,
        preview_text: campaign.preview_text || '',
        content: campaign.content
      })
    } else {
      setEditingCampaign(null)
      setCampaignForm({
        name: '',
        campaign_type: 'newsletter',
        subject: '',
        preview_text: '',
        content: ''
      })
    }
    onOpen()
  }

  const handleSaveCampaign = async () => {
    if (editingCampaign) {
      const { error } = await updateCampaign(editingCampaign.id, campaignForm)
      if (error) {
        toast({
          title: 'Erreur',
          description: error,
          status: 'error',
          duration: 3000
        })
      } else {
        toast({
          title: 'Campagne mise à jour',
          status: 'success',
          duration: 2000
        })
        onClose()
      }
    } else {
      const { error } = await createCampaign(campaignForm)
      if (error) {
        toast({
          title: 'Erreur',
          description: error,
          status: 'error',
          duration: 3000
        })
      } else {
        toast({
          title: 'Campagne créée',
          status: 'success',
          duration: 2000
        })
        onClose()
      }
    }
  }

  const handleDeleteCampaign = async (campaignId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette campagne ?')) {
      return
    }

    const { error } = await deleteCampaign(campaignId)
    if (error) {
      toast({
        title: 'Erreur',
        description: error,
        status: 'error',
        duration: 3000
      })
    } else {
      toast({
        title: 'Campagne supprimée',
        status: 'info',
        duration: 2000
      })
    }
  }

  const handleSendCampaign = async (campaignId, campaignName) => {
    if (!confirm(`Envoyer la campagne "${campaignName}" à tous les abonnés ?`)) {
      return
    }

    const { error } = await sendCampaign(campaignId)
    if (error) {
      toast({
        title: 'Erreur lors de l\'envoi',
        description: error,
        status: 'error',
        duration: 4000
      })
    } else {
      toast({
        title: 'Campagne envoyée !',
        description: 'Les emails sont en cours d\'envoi',
        status: 'success',
        duration: 4000
      })
    }
  }

  if (loading || loadingStats) {
    return <LoadingSpinner message="Chargement des newsletters..." />
  }

  return (
    <Box bg="gray.50" minH="100vh" py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <HStack justify="space-between">
            <Heading size="xl" color="gray.800">
              Newsletter & Marketing
            </Heading>
            <Button
              leftIcon={<FiPlus />}
              colorScheme="brand"
              onClick={() => handleOpenModal()}
            >
              Nouvelle campagne
            </Button>
          </HStack>

          {/* Stats Cards */}
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>
                    <HStack spacing={2}>
                      <FiUsers />
                      <Text>Abonnés actifs</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber color="brand.600">{subscriberStats.active}</StatNumber>
                  <StatHelpText>
                    {subscriberStats.total} total
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Newsletter hebdo</StatLabel>
                  <StatNumber>{subscriberStats.weekly_newsletter}</StatNumber>
                  <StatHelpText>abonnés</StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Promotions</StatLabel>
                  <StatNumber>{subscriberStats.promotions}</StatNumber>
                  <StatHelpText>abonnés</StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Campagnes envoyées</StatLabel>
                  <StatNumber>{campaigns.filter(c => c.status === 'sent').length}</StatNumber>
                  <StatHelpText>{campaigns.length} total</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Campaigns Table */}
          <Card>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Heading size="md">Campagnes</Heading>

                {campaigns.length === 0 ? (
                  <Box textAlign="center" py={12}>
                    <VStack spacing={4}>
                      <FiMail size={48} color="var(--chakra-colors-gray-400)" />
                      <Heading size="md" color="gray.600">
                        Aucune campagne
                      </Heading>
                      <Text color="gray.500">
                        Créez votre première campagne newsletter
                      </Text>
                    </VStack>
                  </Box>
                ) : (
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Nom</Th>
                        <Th>Type</Th>
                        <Th>Sujet</Th>
                        <Th>Statut</Th>
                        <Th isNumeric>Envoyés</Th>
                        <Th isNumeric>Taux ouverture</Th>
                        <Th>Date</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {campaigns.map((campaign) => {
                        const openRate =
                          campaign.total_sent > 0
                            ? ((campaign.total_opened / campaign.total_sent) * 100).toFixed(1)
                            : 0

                        return (
                          <Tr key={campaign.id}>
                            <Td>
                              <Text fontWeight="600">{campaign.name}</Text>
                            </Td>
                            <Td>
                              <Badge colorScheme="purple" fontSize="xs">
                                {CAMPAIGN_TYPES.find(t => t.value === campaign.campaign_type)?.label}
                              </Badge>
                            </Td>
                            <Td>
                              <Text fontSize="sm" noOfLines={1} maxW="200px">
                                {campaign.subject}
                              </Text>
                            </Td>
                            <Td>
                              <Badge colorScheme={CAMPAIGN_STATUS_COLORS[campaign.status]}>
                                {campaign.status}
                              </Badge>
                            </Td>
                            <Td isNumeric>{campaign.total_sent || 0}</Td>
                            <Td isNumeric>
                              {campaign.status === 'sent' ? `${openRate}%` : '-'}
                            </Td>
                            <Td>
                              <Text fontSize="sm" color="gray.600">
                                {new Date(campaign.created_at).toLocaleDateString('fr-FR')}
                              </Text>
                            </Td>
                            <Td>
                              <HStack spacing={1}>
                                {campaign.status === 'draft' && (
                                  <IconButton
                                    icon={<FiSend />}
                                    size="sm"
                                    colorScheme="green"
                                    variant="ghost"
                                    onClick={() => handleSendCampaign(campaign.id, campaign.name)}
                                    aria-label="Envoyer"
                                  />
                                )}
                                <IconButton
                                  icon={<FiEdit2 />}
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleOpenModal(campaign)}
                                  aria-label="Modifier"
                                  isDisabled={campaign.status !== 'draft'}
                                />
                                <IconButton
                                  icon={<FiTrash2 />}
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="red"
                                  onClick={() => handleDeleteCampaign(campaign.id)}
                                  aria-label="Supprimer"
                                  isDisabled={campaign.status === 'sending'}
                                />
                              </HStack>
                            </Td>
                          </Tr>
                        )
                      })}
                    </Tbody>
                  </Table>
                )}
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>

      {/* Campaign Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingCampaign ? 'Modifier la campagne' : 'Nouvelle campagne'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Nom de la campagne</FormLabel>
                <Input
                  placeholder="Newsletter janvier 2024"
                  value={campaignForm.name}
                  onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Type de campagne</FormLabel>
                <Select
                  value={campaignForm.campaign_type}
                  onChange={(e) =>
                    setCampaignForm({ ...campaignForm, campaign_type: e.target.value })
                  }
                >
                  {CAMPAIGN_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Sujet de l'email</FormLabel>
                <Input
                  placeholder="Découvrez nos nouveaux plats !"
                  value={campaignForm.subject}
                  onChange={(e) => setCampaignForm({ ...campaignForm, subject: e.target.value })}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Texte d'aperçu</FormLabel>
                <Input
                  placeholder="Texte visible dans la preview de l'email"
                  value={campaignForm.preview_text}
                  onChange={(e) =>
                    setCampaignForm({ ...campaignForm, preview_text: e.target.value })
                  }
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Contenu HTML</FormLabel>
                <Textarea
                  placeholder="Contenu HTML de l'email..."
                  value={campaignForm.content}
                  onChange={(e) => setCampaignForm({ ...campaignForm, content: e.target.value })}
                  rows={10}
                  fontFamily="monospace"
                  fontSize="sm"
                />
              </FormControl>

              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <VStack align="start" spacing={0}>
                  <Text fontSize="sm" fontWeight="600">
                    Templates disponibles
                  </Text>
                  <Text fontSize="xs">
                    Utilisez les templates dans l'Edge Function send-newsletter pour un design
                    professionnel
                  </Text>
                </VStack>
              </Alert>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Annuler
            </Button>
            <Button colorScheme="brand" onClick={handleSaveCampaign} isLoading={loading}>
              {editingCampaign ? 'Mettre à jour' : 'Créer'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}
