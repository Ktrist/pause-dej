import {
  Box,
  VStack,
  HStack,
  Text,
  Switch,
  Button,
  Icon,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Divider
} from '@chakra-ui/react'
import { FiBell, FiBellOff, FiCheck } from 'react-icons/fi'
import { useNotifications } from '../../hooks/useNotifications'

export default function NotificationSettings() {
  const {
    permission,
    isSupported,
    isSubscribed,
    loading,
    requestPermission,
    unsubscribe,
    sendTestNotification
  } = useNotifications()
  const toast = useToast()

  const handleEnableNotifications = async () => {
    const granted = await requestPermission()
    if (granted) {
      toast({
        title: 'Notifications activées !',
        description: 'Vous recevrez maintenant les notifications de vos commandes',
        status: 'success',
        duration: 5000,
        isClosable: true
      })
    } else {
      toast({
        title: 'Permission refusée',
        description: 'Vous pouvez activer les notifications dans les paramètres de votre navigateur',
        status: 'warning',
        duration: 5000,
        isClosable: true
      })
    }
  }

  const handleDisableNotifications = async () => {
    const success = await unsubscribe()
    if (success) {
      toast({
        title: 'Notifications désactivées',
        description: 'Vous ne recevrez plus de notifications',
        status: 'info',
        duration: 3000,
        isClosable: true
      })
    }
  }

  const handleTestNotification = () => {
    sendTestNotification()
    toast({
      title: 'Notification de test envoyée',
      description: 'Vérifiez votre système de notifications',
      status: 'info',
      duration: 3000,
      isClosable: true
    })
  }

  if (!isSupported) {
    return (
      <Alert status="warning" rounded="md">
        <AlertIcon />
        <Box>
          <AlertTitle>Notifications non supportées</AlertTitle>
          <AlertDescription fontSize="sm">
            Votre navigateur ne supporte pas les notifications push.
          </AlertDescription>
        </Box>
      </Alert>
    )
  }

  return (
    <VStack spacing={4} align="stretch">
      {/* Status */}
      <Box
        p={4}
        bg={isSubscribed ? 'green.50' : 'gray.50'}
        rounded="lg"
        border="1px solid"
        borderColor={isSubscribed ? 'green.200' : 'gray.200'}
      >
        <HStack spacing={3}>
          <Icon
            as={isSubscribed ? FiBell : FiBellOff}
            boxSize={6}
            color={isSubscribed ? 'green.600' : 'gray.600'}
          />
          <Box flex={1}>
            <Text fontWeight="600" fontSize="md">
              {isSubscribed ? 'Notifications activées' : 'Notifications désactivées'}
            </Text>
            <Text fontSize="sm" color="gray.600" mt={1}>
              {isSubscribed
                ? 'Vous recevez les notifications de vos commandes'
                : 'Activez les notifications pour ne rien manquer'}
            </Text>
          </Box>
          <Switch
            size="lg"
            colorScheme="green"
            isChecked={isSubscribed}
            isDisabled={loading || permission === 'denied'}
            onChange={isSubscribed ? handleDisableNotifications : handleEnableNotifications}
          />
        </HStack>
      </Box>

      {/* Permission denied warning */}
      {permission === 'denied' && (
        <Alert status="error" rounded="md">
          <AlertIcon />
          <Box fontSize="sm">
            <AlertTitle>Permission refusée</AlertTitle>
            <AlertDescription>
              Les notifications ont été bloquées. Vous devez les autoriser dans les paramètres de votre navigateur.
            </AlertDescription>
          </Box>
        </Alert>
      )}

      <Divider />

      {/* Notification types */}
      <VStack spacing={3} align="stretch">
        <Text fontWeight="600" fontSize="sm" color="gray.700">
          Types de notifications
        </Text>

        <NotificationType
          label="Confirmation de commande"
          description="Reçevez une notification après chaque commande"
          enabled={isSubscribed}
          icon={FiCheck}
        />

        <NotificationType
          label="Préparation en cours"
          description="Soyez informé quand votre commande est en préparation"
          enabled={isSubscribed}
          icon={FiCheck}
        />

        <NotificationType
          label="Livraison en route"
          description="Notification quand le livreur part"
          enabled={isSubscribed}
          icon={FiCheck}
        />

        <NotificationType
          label="Livraison effectuée"
          description="Confirmation de la livraison de votre commande"
          enabled={isSubscribed}
          icon={FiCheck}
        />

        <NotificationType
          label="Promotions et offres"
          description="Recevez nos meilleures offres"
          enabled={isSubscribed}
          icon={FiCheck}
        />
      </VStack>

      {/* Test button */}
      {isSubscribed && (
        <>
          <Divider />
          <Button
            variant="outline"
            size="sm"
            leftIcon={<FiBell />}
            onClick={handleTestNotification}
          >
            Envoyer une notification de test
          </Button>
        </>
      )}
    </VStack>
  )
}

function NotificationType({ label, description, enabled, icon }) {
  return (
    <HStack
      p={3}
      bg="gray.50"
      rounded="md"
      opacity={enabled ? 1 : 0.5}
    >
      <Icon as={icon} color={enabled ? 'brand.600' : 'gray.400'} />
      <Box flex={1}>
        <Text fontSize="sm" fontWeight="500">{label}</Text>
        <Text fontSize="xs" color="gray.600">{description}</Text>
      </Box>
      <Switch
        size="sm"
        colorScheme="brand"
        isChecked={enabled}
        isDisabled
      />
    </HStack>
  )
}
