import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  HStack,
  Text,
  Icon,
  CloseButton,
  Slide,
  useToast
} from '@chakra-ui/react'
import { FiDownload, FiSmartphone } from 'react-icons/fi'
import { usePWA } from '../../hooks/usePWA'

export default function PWAInstallPrompt() {
  const { isInstallable, isInstalled, installApp, updateAvailable, updateApp } = usePWA()
  const [showPrompt, setShowPrompt] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const toast = useToast()

  useEffect(() => {
    // Check if user previously dismissed
    const wasDismissed = localStorage.getItem('pwa-install-dismissed')
    if (wasDismissed) {
      setDismissed(true)
      return
    }

    // Show prompt after 30 seconds if installable and not installed
    if (isInstallable && !isInstalled) {
      const timer = setTimeout(() => {
        setShowPrompt(true)
      }, 30000) // 30 seconds

      return () => clearTimeout(timer)
    }
  }, [isInstallable, isInstalled])

  const handleInstall = async () => {
    const success = await installApp()
    if (success) {
      setShowPrompt(false)
      toast({
        title: 'Installation réussie !',
        description: 'Pause Dej\' est maintenant installé sur votre appareil',
        status: 'success',
        duration: 5000,
        isClosable: true
      })
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setDismissed(true)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  const handleUpdate = () => {
    updateApp()
    toast({
      title: 'Mise à jour en cours...',
      description: 'L\'application va se recharger',
      status: 'info',
      duration: 2000,
      isClosable: true
    })
  }

  // Update banner
  if (updateAvailable) {
    return (
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bg="blue.500"
        color="white"
        px={4}
        py={3}
        zIndex={9999}
        boxShadow="md"
      >
        <HStack justify="space-between" maxW="container.xl" mx="auto">
          <Text fontSize="sm" fontWeight="medium">
            🎉 Une nouvelle version est disponible !
          </Text>
          <Button
            size="sm"
            colorScheme="whiteAlpha"
            onClick={handleUpdate}
          >
            Mettre à jour
          </Button>
        </HStack>
      </Box>
    )
  }

  // Install prompt
  if (!showPrompt || dismissed || isInstalled || !isInstallable) {
    return null
  }

  return (
    <Slide direction="bottom" in={showPrompt} style={{ zIndex: 1000 }}>
      <Box
        bg="white"
        boxShadow="2xl"
        borderTopRadius="xl"
        border="1px solid"
        borderColor="gray.200"
        p={4}
        mx={4}
        mb={4}
      >
        <HStack justify="space-between" align="start">
          <HStack spacing={3} flex={1}>
            <Box
              p={3}
              bg="brand.50"
              borderRadius="lg"
            >
              <Icon as={FiSmartphone} boxSize={6} color="brand.600" />
            </Box>
            <Box flex={1}>
              <Text fontWeight="bold" fontSize="md" mb={1}>
                Installer Pause Dej'
              </Text>
              <Text fontSize="sm" color="gray.600" mb={3}>
                Accédez rapidement à vos commandes depuis votre écran d'accueil
              </Text>
              <HStack spacing={2}>
                <Button
                  size="sm"
                  colorScheme="brand"
                  leftIcon={<FiDownload />}
                  onClick={handleInstall}
                >
                  Installer
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDismiss}
                >
                  Plus tard
                </Button>
              </HStack>
            </Box>
          </HStack>
          <CloseButton size="sm" onClick={handleDismiss} />
        </HStack>
      </Box>
    </Slide>
  )
}
