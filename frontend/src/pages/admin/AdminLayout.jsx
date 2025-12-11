import { useEffect } from 'react'
import {
  Box,
  Container,
  Flex,
  VStack,
  HStack,
  Heading,
  Icon,
  Text,
  Button,
  useColorModeValue,
  Divider
} from '@chakra-ui/react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  FiHome,
  FiPackage,
  FiShoppingBag,
  FiUsers,
  FiTrendingUp,
  FiSettings,
  FiLogOut,
  FiTruck,
  FiBriefcase
} from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'

const SidebarLink = ({ to, icon, children }) => {
  const activeBg = useColorModeValue('brand.50', 'brand.900')
  const activeColor = useColorModeValue('brand.600', 'brand.200')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')

  return (
    <NavLink to={to}>
      {({ isActive }) => (
        <Flex
          align="center"
          px={4}
          py={3}
          rounded="lg"
          cursor="pointer"
          bg={isActive ? activeBg : 'transparent'}
          color={isActive ? activeColor : 'gray.600'}
          _hover={{
            bg: isActive ? activeBg : hoverBg,
            color: isActive ? activeColor : 'gray.900'
          }}
          fontWeight={isActive ? 'semibold' : 'normal'}
          transition="all 0.2s"
        >
          <Icon as={icon} boxSize={5} mr={3} />
          <Text>{children}</Text>
        </Flex>
      )}
    </NavLink>
  )
}

export default function AdminLayout() {
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  // Check if user is authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login')
    }
  }, [user, loading, navigate])

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  if (loading) {
    return null
  }

  if (!user) {
    return null
  }

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      <Flex>
        {/* Sidebar */}
        <Box
          w="280px"
          h="100vh"
          position="sticky"
          top={0}
          bg={bgColor}
          borderRight="1px"
          borderColor={borderColor}
          py={6}
          px={4}
        >
          <VStack spacing={8} align="stretch" h="full">
            {/* Logo / Title */}
            <Box px={4}>
              <Heading size="lg" color="brand.500">
                Pause Dej'
              </Heading>
              <Text fontSize="sm" color="gray.500" mt={1}>
                Administration
              </Text>
            </Box>

            <Divider />

            {/* Navigation */}
            <VStack spacing={1} align="stretch" flex={1}>
              <SidebarLink to="/admin/dashboard" icon={FiHome}>
                Dashboard
              </SidebarLink>
              <SidebarLink to="/admin/orders" icon={FiShoppingBag}>
                Commandes
              </SidebarLink>
              <SidebarLink to="/admin/dishes" icon={FiPackage}>
                Plats
              </SidebarLink>
              <SidebarLink to="/admin/customers" icon={FiUsers}>
                Clients
              </SidebarLink>
              <SidebarLink to="/admin/delivery" icon={FiTruck}>
                Livraisons
              </SidebarLink>
              <SidebarLink to="/admin/analytics" icon={FiTrendingUp}>
                Analytics
              </SidebarLink>
              <SidebarLink to="/admin/b2b" icon={FiBriefcase}>
                B2B
              </SidebarLink>
              <SidebarLink to="/admin/settings" icon={FiSettings}>
                Paramètres
              </SidebarLink>
            </VStack>

            <Divider />

            {/* User Info & Logout */}
            <VStack spacing={3} align="stretch">
              <Box px={4}>
                <Text fontSize="sm" fontWeight="medium" color="gray.700">
                  {user.email}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  Administrateur
                </Text>
              </Box>
              <Button
                leftIcon={<FiLogOut />}
                variant="ghost"
                colorScheme="red"
                size="sm"
                onClick={handleLogout}
              >
                Se déconnecter
              </Button>
            </VStack>
          </VStack>
        </Box>

        {/* Main Content */}
        <Box flex={1} overflowY="auto">
          <Container maxW="container.xl" py={8}>
            <Outlet />
          </Container>
        </Box>
      </Flex>
    </Box>
  )
}
