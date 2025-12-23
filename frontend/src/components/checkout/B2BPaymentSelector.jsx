import {
  Box,
  VStack,
  HStack,
  Radio,
  RadioGroup,
  Card,
  CardBody,
  Text,
  Badge,
  Icon,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Progress,
  Button
} from '@chakra-ui/react'
import { FiCreditCard, FiBriefcase, FiAlertCircle } from 'react-icons/fi'
import { Elements } from '@stripe/react-stripe-js'
import PaymentForm from '../payment/PaymentForm'
import getStripe from '../../stripeClient'

const stripePromise = getStripe()

/**
 * B2B Payment Selector Component
 * Allows employees to choose between budget payment or personal card payment
 */
export default function B2BPaymentSelector({
  employee,
  budget,
  business,
  total,
  orderTotal, // For backward compatibility
  selectedMethod,
  paymentMethod, // For backward compatibility
  onSelectMethod,
  onPaymentMethodChange, // For backward compatibility
  onPlaceOrder,
  disabled
}) {
  // Support both old and new prop names
  const amount = total || orderTotal
  const method = selectedMethod || paymentMethod
  const onMethodChange = onSelectMethod || onPaymentMethodChange
  if (!employee || !budget) return null

  const employeeBudget = budget.employee_budget
  const canUseBudget = employeeBudget && employeeBudget.remaining >= amount
  const budgetWarningLevel = getBudgetWarningLevel(employeeBudget)

  function getBudgetWarningLevel(employeeBudget) {
    if (!employeeBudget) return null
    const percentageUsed = employeeBudget.percentage_used
    if (percentageUsed >= 90) return 'critical'
    if (percentageUsed >= 75) return 'warning'
    return 'normal'
  }

  return (
    <Box>
      <Text fontSize="lg" fontWeight="600" mb={4}>
        Mode de paiement
      </Text>

      <RadioGroup value={method} onChange={onMethodChange}>
        <VStack spacing={4} align="stretch">
          {/* Budget Payment Option */}
          <Card
            variant="outline"
            borderWidth={2}
            borderColor={method === 'budget' ? 'brand.500' : 'gray.200'}
            cursor="pointer"
            onClick={() => canUseBudget && onMethodChange('budget')}
            opacity={canUseBudget ? 1 : 0.6}
            _hover={canUseBudget ? { borderColor: 'brand.400', shadow: 'md' } : {}}
          >
            <CardBody>
              <HStack justify="space-between" align="start">
                <HStack spacing={3} flex={1}>
                  <Radio
                    value="budget"
                    isDisabled={!canUseBudget}
                    colorScheme="brand"
                  />
                  <Icon as={FiBriefcase} boxSize={6} color="brand.500" />
                  <VStack align="start" spacing={1} flex={1}>
                    <HStack>
                      <Text fontWeight="600">Budget Entreprise</Text>
                      {canUseBudget && (
                        <Badge colorScheme="green" fontSize="xs">
                          Disponible
                        </Badge>
                      )}
                      {!canUseBudget && (
                        <Badge colorScheme="red" fontSize="xs">
                          Insuffisant
                        </Badge>
                      )}
                    </HStack>
                    <Text fontSize="sm" color="gray.600">
                      {business?.company_name}
                    </Text>

                    {/* Budget Info */}
                    {employeeBudget && (
                      <Box w="full" mt={2}>
                        <HStack justify="space-between" mb={1}>
                          <Text fontSize="xs" color="gray.600">
                            Utilisé ce mois-ci
                          </Text>
                          <Text fontSize="xs" fontWeight="600">
                            {employeeBudget.spent_this_month.toFixed(2)}€ /{' '}
                            {employeeBudget.monthly_budget.toFixed(2)}€
                          </Text>
                        </HStack>
                        <Progress
                          value={employeeBudget.percentage_used}
                          size="sm"
                          colorScheme={
                            budgetWarningLevel === 'critical'
                              ? 'red'
                              : budgetWarningLevel === 'warning'
                              ? 'orange'
                              : 'green'
                          }
                          borderRadius="full"
                        />
                        <HStack justify="space-between" mt={1}>
                          <Text fontSize="xs" color="gray.500">
                            Reste: {employeeBudget.remaining.toFixed(2)}€
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {employeeBudget.percentage_used.toFixed(0)}% utilisé
                          </Text>
                        </HStack>
                      </Box>
                    )}

                    {/* Order total check */}
                    {amount && canUseBudget && (
                      <Text fontSize="xs" color="green.600" mt={1}>
                        ✓ Cette commande ({amount.toFixed(2)}€) sera déduite de votre budget
                      </Text>
                    )}
                    {amount && !canUseBudget && (
                      <Text fontSize="xs" color="red.600" mt={1}>
                        ✗ Budget insuffisant pour cette commande ({amount.toFixed(2)}€)
                      </Text>
                    )}
                  </VStack>
                </HStack>
              </HStack>
            </CardBody>
          </Card>

          {/* Personal Card Payment Option */}
          <Card
            variant="outline"
            borderWidth={2}
            borderColor={method === 'card' ? 'brand.500' : 'gray.200'}
            cursor="pointer"
            onClick={() => onMethodChange('card')}
            _hover={{ borderColor: 'brand.400', shadow: 'md' }}
          >
            <CardBody>
              <HStack spacing={3}>
                <Radio value="card" colorScheme="brand" />
                <Icon as={FiCreditCard} boxSize={6} color="blue.500" />
                <VStack align="start" spacing={0}>
                  <Text fontWeight="600">Carte Bancaire Personnelle</Text>
                  <Text fontSize="sm" color="gray.600">
                    Paiement sécurisé par Stripe
                  </Text>
                </VStack>
              </HStack>
            </CardBody>
          </Card>
        </VStack>
      </RadioGroup>

      {/* Budget Warning Alerts */}
      {budgetWarningLevel === 'critical' && method === 'budget' && (
        <Alert status="error" mt={4} borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle fontSize="sm">Budget presque épuisé</AlertTitle>
            <AlertDescription fontSize="xs">
              Vous avez utilisé {employeeBudget.percentage_used.toFixed(0)}% de votre budget mensuel.
            </AlertDescription>
          </Box>
        </Alert>
      )}

      {budgetWarningLevel === 'warning' && method === 'budget' && (
        <Alert status="warning" mt={4} borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle fontSize="sm">Budget limité</AlertTitle>
            <AlertDescription fontSize="xs">
              Vous avez utilisé {employeeBudget.percentage_used.toFixed(0)}% de votre budget mensuel.
            </AlertDescription>
          </Box>
        </Alert>
      )}

      {!canUseBudget && (
        <Alert status="info" mt={4} borderRadius="md">
          <AlertIcon as={FiAlertCircle} />
          <Box>
            <AlertTitle fontSize="sm">Budget insuffisant</AlertTitle>
            <AlertDescription fontSize="xs">
              Votre budget est insuffisant pour cette commande. Vous pouvez payer avec votre carte personnelle.
            </AlertDescription>
          </Box>
        </Alert>
      )}

      {/* Business Status Warning */}
      {business?.status !== 'active' && (
        <Alert status="warning" mt={4} borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle fontSize="sm">Compte entreprise inactif</AlertTitle>
            <AlertDescription fontSize="xs">
              Le compte de votre entreprise est actuellement {business?.status}. Veuillez contacter votre administrateur.
            </AlertDescription>
          </Box>
        </Alert>
      )}

      {/* Payment Action - Only show if onPlaceOrder is provided */}
      {onPlaceOrder && (
        <Box mt={6}>
          {method === 'budget' ? (
            // Budget Payment - Direct order placement
            <Button
              colorScheme="brand"
              size="lg"
              width="full"
              onClick={onPlaceOrder}
              isDisabled={disabled || !canUseBudget || business?.status !== 'active'}
              isLoading={disabled}
              loadingText="Commande en cours..."
            >
              Valider la commande
            </Button>
          ) : method === 'card' ? (
            // Card Payment - Stripe form
            <Elements stripe={stripePromise}>
              <PaymentForm
                amount={amount}
                onSuccess={onPlaceOrder}
                onError={(error) => {
                  console.error('Payment error:', error)
                }}
                disabled={disabled}
              />
            </Elements>
          ) : null}
        </Box>
      )}
    </Box>
  )
}
