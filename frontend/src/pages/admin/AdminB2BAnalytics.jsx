import { useState } from 'react'
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Select,
  useColorModeValue,
  Icon,
  Progress
} from '@chakra-ui/react'
import {
  FiDollarSign,
  FiUsers,
  FiFileText,
  FiTrendingUp,
  FiPackage,
  FiShoppingBag
} from 'react-icons/fi'
import { useAdminB2BAnalytics } from '../../hooks/useB2BAnalytics'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function AdminB2BAnalytics() {
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const [period, setPeriod] = useState(30)
  const { analytics, loading, refetch } = useAdminB2BAnalytics(period)

  if (loading || !analytics) {
    return <LoadingSpinner message="Chargement des analytics B2B..." />
  }

  const handlePeriodChange = (newPeriod) => {
    setPeriod(parseInt(newPeriod))
  }

  return (
    <Box bg={bgColor} minH="100vh">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <Heading size="lg">Analytics B2B</Heading>
          <Select
            w="200px"
            value={period}
            onChange={(e) => handlePeriodChange(e.target.value)}
          >
            <option value="7">7 derniers jours</option>
            <option value="30">30 derniers jours</option>
            <option value="90">90 derniers jours</option>
            <option value="365">1 an</option>
          </Select>
        </HStack>

        {/* Key Metrics */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>
                  <HStack>
                    <Icon as={FiUsers} />
                    <Text>Comptes B2B</Text>
                  </HStack>
                </StatLabel>
                <StatNumber>{analytics.totalAccounts}</StatNumber>
                <StatHelpText>{analytics.activeAccounts} actifs</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>
                  <HStack>
                    <Icon as={FiDollarSign} />
                    <Text>CA B2B</Text>
                  </HStack>
                </StatLabel>
                <StatNumber>{analytics.totalRevenue.toFixed(2)}€</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {analytics.invoiceCount} factures
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>
                  <HStack>
                    <Icon as={FiUsers} />
                    <Text>Membres</Text>
                  </HStack>
                </StatLabel>
                <StatNumber>{analytics.totalTeamMembers}</StatNumber>
                <StatHelpText>Total utilisateurs B2B</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>
                  <HStack>
                    <Icon as={FiFileText} />
                    <Text>Taux conversion</Text>
                  </HStack>
                </StatLabel>
                <StatNumber>{analytics.quoteStats.conversionRate.toFixed(1)}%</StatNumber>
                <StatHelpText>
                  {analytics.quoteStats.accepted}/{analytics.quoteStats.total} devis
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Revenue Stats */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>CA Payé</StatLabel>
                <StatNumber color="green.500">{analytics.totalRevenue.toFixed(2)}€</StatNumber>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>CA En attente</StatLabel>
                <StatNumber color="blue.500">{analytics.pendingRevenue.toFixed(2)}€</StatNumber>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>CA En retard</StatLabel>
                <StatNumber color="red.500">{analytics.overdueRevenue.toFixed(2)}€</StatNumber>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          {/* Top Accounts by Revenue */}
          <Card>
            <CardHeader>
              <Heading size="md">Top 10 Clients par CA</Heading>
            </CardHeader>
            <CardBody>
              {analytics.topAccounts.length === 0 ? (
                <Text color="gray.500" textAlign="center" py={8}>
                  Aucune donnée disponible
                </Text>
              ) : (
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Entreprise</Th>
                      <Th isNumeric>Factures</Th>
                      <Th isNumeric>CA</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {analytics.topAccounts.map((account, index) => (
                      <Tr key={account.accountId}>
                        <Td>
                          <HStack>
                            <Badge colorScheme="brand">{index + 1}</Badge>
                            <Text fontWeight="600">{account.companyName}</Text>
                          </HStack>
                        </Td>
                        <Td isNumeric>{account.invoiceCount}</Td>
                        <Td isNumeric fontWeight="600">
                          {account.revenue.toFixed(2)}€
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </CardBody>
          </Card>

          {/* Quote Stats */}
          <Card>
            <CardHeader>
              <Heading size="md">Demandes de Devis</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Text>Total</Text>
                  <Badge fontSize="lg" colorScheme="gray">
                    {analytics.quoteStats.total}
                  </Badge>
                </HStack>

                <Box>
                  <HStack justify="space-between" mb={2}>
                    <Text fontSize="sm">En attente</Text>
                    <Text fontSize="sm" fontWeight="600">
                      {analytics.quoteStats.pending}
                    </Text>
                  </HStack>
                  <Progress
                    value={(analytics.quoteStats.pending / analytics.quoteStats.total) * 100}
                    colorScheme="yellow"
                    size="sm"
                  />
                </Box>

                <Box>
                  <HStack justify="space-between" mb={2}>
                    <Text fontSize="sm">Acceptés</Text>
                    <Text fontSize="sm" fontWeight="600">
                      {analytics.quoteStats.accepted}
                    </Text>
                  </HStack>
                  <Progress
                    value={(analytics.quoteStats.accepted / analytics.quoteStats.total) * 100}
                    colorScheme="green"
                    size="sm"
                  />
                </Box>

                <Box>
                  <HStack justify="space-between" mb={2}>
                    <Text fontSize="sm">Refusés</Text>
                    <Text fontSize="sm" fontWeight="600">
                      {analytics.quoteStats.rejected}
                    </Text>
                  </HStack>
                  <Progress
                    value={(analytics.quoteStats.rejected / analytics.quoteStats.total) * 100}
                    colorScheme="red"
                    size="sm"
                  />
                </Box>

                <Box pt={4} borderTop="1px" borderColor="gray.200">
                  <HStack justify="space-between">
                    <Text fontWeight="600">Taux de conversion</Text>
                    <Badge fontSize="lg" colorScheme="green">
                      {analytics.quoteStats.conversionRate.toFixed(1)}%
                    </Badge>
                  </HStack>
                </Box>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Revenue Timeline */}
        <Card>
          <CardHeader>
            <Heading size="md">Évolution du CA (par mois)</Heading>
          </CardHeader>
          <CardBody>
            {analytics.timeline.length === 0 ? (
              <Text color="gray.500" textAlign="center" py={8}>
                Aucune donnée disponible
              </Text>
            ) : (
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Mois</Th>
                    <Th isNumeric>Factures</Th>
                    <Th isNumeric>CA</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {analytics.timeline.map((item) => (
                    <Tr key={item.month}>
                      <Td fontWeight="600">
                        {new Date(item.month + '-01').toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long'
                        })}
                      </Td>
                      <Td isNumeric>{item.count}</Td>
                      <Td isNumeric fontWeight="600">
                        {item.revenue.toFixed(2)}€
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </CardBody>
        </Card>

        {/* Package Stats */}
        <Card>
          <CardHeader>
            <Heading size="md">Packages Disponibles</Heading>
          </CardHeader>
          <CardBody>
            {analytics.packageStats.length === 0 ? (
              <Text color="gray.500" textAlign="center" py={8}>
                Aucun package créé
              </Text>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                {analytics.packageStats.map((pkg) => (
                  <Card key={pkg.id} variant="outline">
                    <CardBody>
                      <VStack align="start" spacing={2}>
                        <HStack justify="space-between" w="full">
                          <Text fontWeight="600">{pkg.name}</Text>
                          <Badge colorScheme={pkg.isActive ? 'green' : 'gray'}>
                            {pkg.isActive ? 'Actif' : 'Inactif'}
                          </Badge>
                        </HStack>
                        <Text fontSize="2xl" fontWeight="700" color="brand.500">
                          {pkg.pricePerPerson.toFixed(2)}€
                          <Text as="span" fontSize="sm" color="gray.600" fontWeight="400">
                            {' '}
                            / personne
                          </Text>
                        </Text>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            )}
          </CardBody>
        </Card>
      </VStack>
    </Box>
  )
}
