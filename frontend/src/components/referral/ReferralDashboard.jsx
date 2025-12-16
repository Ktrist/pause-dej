import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Icon,
  Card,
  CardBody,
  SimpleGrid,
  Badge,
  Divider,
  useToast,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td
} from '@chakra-ui/react'
import { FiCopy, FiUsers, FiCheck, FiClock, FiGift, FiShare2 } from 'react-icons/fi'
import { useState } from 'react'
import { useReferral, useReferralsList, useReferralRewards } from '../../hooks/useReferral'
import LoadingSpinner from '../common/LoadingSpinner'

export default function ReferralDashboard() {
  const { referralCode, stats, loading: loadingCode } = useReferral()
  const { referrals, loading: loadingReferrals } = useReferralsList()
  const { rewards, loading: loadingRewards } = useReferralRewards()
  const toast = useToast()
  const [copied, setCopied] = useState(false)

  const referralUrl = referralCode 
    ? `${window.location.origin}/signup?ref=${referralCode.code}`
    : ''

  const handleCopyCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode.code)
      setCopied(true)
      toast({
        title: 'Code copié !',
        description: 'Le code de parrainage a été copié',
        status: 'success',
        duration: 2000,
        isClosable: true
      })
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralUrl)
    toast({
      title: 'Lien copié !',
      description: 'Le lien de parrainage a été copié',
      status: 'success',
      duration: 2000,
      isClosable: true
    })
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Rejoins Pause Dej\' !',
          text: `Utilise mon code ${referralCode.code} pour obtenir ${referralCode.bonus_per_referral}€ de réduction sur ta première commande !`,
          url: referralUrl
        })
      } catch (err) {
        console.error('Error sharing:', err)
      }
    } else {
      handleCopyLink()
    }
  }

  if (loadingCode) {
    return <LoadingSpinner message="Chargement du programme de parrainage..." />
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Header Card */}
      <Card bg="gradient.brand" borderWidth={2} borderColor="brand.200">
        <CardBody>
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Heading size="md">Programme de Parrainage</Heading>
                <Text fontSize="sm" color="gray.600">
                  Parrainez vos amis et gagnez des récompenses
                </Text>
              </VStack>
              <Icon as={FiGift} boxSize={10} color="brand.500" />
            </HStack>

            <Divider />

            {/* Referral Code */}
            <VStack align="stretch" spacing={3}>
              <Text fontWeight="600">Votre code de parrainage :</Text>
              <InputGroup size="lg">
                <Input
                  value={referralCode?.code || ''}
                  isReadOnly
                  bg="white"
                  fontSize="2xl"
                  fontWeight="bold"
                  textAlign="center"
                  letterSpacing="wider"
                  color="brand.600"
                />
                <InputRightElement>
                  <IconButton
                    icon={copied ? <FiCheck /> : <FiCopy />}
                    onClick={handleCopyCode}
                    colorScheme={copied ? 'green' : 'brand'}
                    aria-label="Copier le code"
                  />
                </InputRightElement>
              </InputGroup>

              {/* Share Buttons */}
              <SimpleGrid columns={2} spacing={3}>
                <Button
                  leftIcon={<FiCopy />}
                  onClick={handleCopyLink}
                  variant="outline"
                  colorScheme="brand"
                >
                  Copier le lien
                </Button>
                <Button
                  leftIcon={<FiShare2 />}
                  onClick={handleShare}
                  colorScheme="brand"
                >
                  Partager
                </Button>
              </SimpleGrid>
            </VStack>

            <Divider />

            {/* How it works */}
            <VStack align="start" spacing={2}>
              <Text fontWeight="600" fontSize="sm">
                Comment ça marche ?
              </Text>
              <VStack align="start" spacing={1} fontSize="sm" color="gray.600">
                <HStack>
                  <Text>1️⃣</Text>
                  <Text>Partagez votre code avec vos amis</Text>
                </HStack>
                <HStack>
                  <Text>2️⃣</Text>
                  <Text>Ils obtiennent {referralCode?.bonus_per_referral || 10}€ sur leur 1ère commande</Text>
                </HStack>
                <HStack>
                  <Text>3️⃣</Text>
                  <Text>Vous recevez {referralCode?.referrer_bonus || 10}€ après leur commande</Text>
                </HStack>
              </VStack>
            </VStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Stats Grid */}
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>
                <HStack>
                  <Icon as={FiUsers} />
                  <Text>Total parrainés</Text>
                </HStack>
              </StatLabel>
              <StatNumber>{stats.totalReferrals}</StatNumber>
              <StatHelpText>Amis inscrits</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>
                <HStack>
                  <Icon as={FiClock} />
                  <Text>En attente</Text>
                </HStack>
              </StatLabel>
              <StatNumber>{stats.pendingReferrals}</StatNumber>
              <StatHelpText>Première commande en attente</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>
                <HStack>
                  <Icon as={FiCheck} />
                  <Text>Complétés</Text>
                </HStack>
              </StatLabel>
              <StatNumber>{stats.completedReferrals}</StatNumber>
              <StatHelpText>Parrainages validés</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg="green.50" borderColor="green.200" borderWidth={2}>
          <CardBody>
            <Stat>
              <StatLabel>
                <HStack>
                  <Icon as={FiGift} color="green.600" />
                  <Text>Total gagné</Text>
                </HStack>
              </StatLabel>
              <StatNumber color="green.600">{stats.totalEarned.toFixed(2)}€</StatNumber>
              <StatHelpText>Depuis le début</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Referrals List */}
      <Card>
        <CardBody>
          <VStack align="stretch" spacing={4}>
            <Heading size="md">Vos parrainages</Heading>

            {loadingReferrals ? (
              <LoadingSpinner message="Chargement..." />
            ) : referrals.length === 0 ? (
              <Box py={8} textAlign="center">
                <Icon as={FiUsers} boxSize={12} color="gray.400" mb={3} />
                <Text color="gray.500">
                  Vous n'avez pas encore parrainé d'amis
                </Text>
                <Text fontSize="sm" color="gray.400" mt={2}>
                  Commencez à partager votre code pour gagner des récompenses !
                </Text>
              </Box>
            ) : (
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Date</Th>
                      <Th>Statut</Th>
                      <Th>Récompense</Th>
                      <Th>Première commande</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {referrals.map((referral) => (
                      <Tr key={referral.id}>
                        <Td>
                          {new Date(referral.created_at).toLocaleDateString('fr-FR')}
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={
                              referral.status === 'completed' ? 'green' :
                              referral.status === 'pending' ? 'orange' :
                              'gray'
                            }
                          >
                            {referral.status === 'pending' && 'En attente'}
                            {referral.status === 'completed' && 'Complété'}
                            {referral.status === 'cancelled' && 'Annulé'}
                          </Badge>
                        </Td>
                        <Td>
                          <Text fontWeight="600" color="green.600">
                            {referral.referrer_reward_amount}€
                          </Text>
                        </Td>
                        <Td>
                          {referral.first_order_completed_at ? (
                            <Text fontSize="sm" color="gray.600">
                              {new Date(referral.first_order_completed_at).toLocaleDateString('fr-FR')}
                            </Text>
                          ) : (
                            <Text fontSize="sm" color="gray.400">
                              Pas encore
                            </Text>
                          )}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Rewards Earned */}
      <Card>
        <CardBody>
          <VStack align="stretch" spacing={4}>
            <Heading size="md">Récompenses gagnées</Heading>

            {loadingRewards ? (
              <LoadingSpinner message="Chargement..." />
            ) : rewards.length === 0 ? (
              <Box py={8} textAlign="center">
                <Icon as={FiGift} boxSize={12} color="gray.400" mb={3} />
                <Text color="gray.500">
                  Aucune récompense pour le moment
                </Text>
              </Box>
            ) : (
              <VStack spacing={3} align="stretch">
                {rewards.map((reward) => (
                  <Card key={reward.id} variant="outline" borderColor={reward.is_claimed ? 'gray.200' : 'green.200'}>
                    <CardBody>
                      <HStack justify="space-between">
                        <VStack align="start" spacing={1}>
                          <HStack>
                            <Icon as={FiGift} color="green.600" />
                            <Text fontWeight="600">{reward.reward_amount}€ de crédit</Text>
                            {reward.is_claimed && <Badge colorScheme="gray">Utilisé</Badge>}
                          </HStack>
                          <Text fontSize="sm" color="gray.600">
                            Via le code {reward.referral?.code_used}
                          </Text>
                          {reward.expires_at && !reward.is_claimed && (
                            <Text fontSize="xs" color="orange.600">
                              Expire le {new Date(reward.expires_at).toLocaleDateString('fr-FR')}
                            </Text>
                          )}
                        </VStack>
                        <VStack align="end" spacing={0}>
                          <Text fontSize="sm" color="gray.500">
                            {new Date(reward.created_at).toLocaleDateString('fr-FR')}
                          </Text>
                          {reward.claimed_at && (
                            <Text fontSize="xs" color="gray.500">
                              Utilisé le {new Date(reward.claimed_at).toLocaleDateString('fr-FR')}
                            </Text>
                          )}
                        </VStack>
                      </HStack>
                    </CardBody>
                  </Card>
                ))}
              </VStack>
            )}
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  )
}
