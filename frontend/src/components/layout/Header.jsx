import {
  Box,
  Container,
  Flex,
  HStack,
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Badge,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  Text,
  Image
} from '@chakra-ui/react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { FiShoppingCart, FiMenu, FiUser, FiLogOut, FiSettings } from 'react-icons/fi'
import { APP_NAME } from '../../config'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { getPersonalizedGreeting } from '../../utils/greeting'
import { useCartDrawer } from '../../context/CartDrawerContext'
import CartDrawer from '../cart/CartDrawer'
import logo from '../../assets/logo.jpg'

export default function Header() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isCartDrawerOpen, openCartDrawer, closeCartDrawer } = useCartDrawer()
  const { cartItemsCount } = useCart()
  const { user, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()

  console.log('🛒 Header - isCartDrawerOpen:', isCartDrawerOpen)

  const handleCartClick = () => {
    console.log('🛒 Cart button clicked!')
    openCartDrawer()
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const navLinks = [
    { name: 'A la carte', path: '/catalogue' },
    { name: 'Comment ça marche', path: '/how-it-works' },
    { name: 'Pause Dej\' At Work', path: '/b2b' },
    { name: 'Contact', path: '/contact' },
  ]

  return (
    <Box
      as="header"
      bg="white"
      boxShadow="sm"
      position="sticky"
      top={0}
      zIndex={1000}
    >
      <Container maxW="container.xl">
        <Flex h={16} alignItems="center" justifyContent="space-between">
          {/* Logo */}
          <RouterLink to="/">
            <Image
              src={logo}
              alt={APP_NAME}
              h={{ base: '50px', md: '65px' }}
              objectFit="contain"
              _hover={{ opacity: 0.8 }}
              transition="opacity 0.2s"
            />
          </RouterLink>

          {/* Desktop Navigation */}
          <HStack spacing={5} display={{ base: 'none', md: 'flex' }}>
            {navLinks.map((link) => (
              <RouterLink key={link.path} to={link.path}>
                <Text
                  fontSize="sm"
                  fontWeight="500"
                  color="gray.700"
                  _hover={{ color: 'brand.500' }}
                  transition="color 0.2s"
                  whiteSpace="nowrap"
                >
                  {link.name}
                </Text>
              </RouterLink>
            ))}
          </HStack>

          {/* Actions */}
          <HStack spacing={4}>
            {/* Cart */}
            <Box position="relative">
              <IconButton
                icon={<FiShoppingCart />}
                variant="ghost"
                colorScheme="brand"
                aria-label="Panier"
                fontSize="20px"
                onClick={handleCartClick}
              />
              {cartItemsCount > 0 && (
                <Badge
                  position="absolute"
                  top="-1"
                  right="-1"
                  colorScheme="red"
                  borderRadius="full"
                  fontSize="xs"
                  minW="20px"
                  h="20px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  pointerEvents="none"
                >
                  {cartItemsCount}
                </Badge>
              )}
            </Box>

            {/* User Menu */}
            {user ? (
              <HStack spacing={3} display={{ base: 'none', md: 'flex' }}>
                <Menu>
                  <MenuButton
                    as={IconButton}
                    icon={<FiUser />}
                    variant="ghost"
                    colorScheme="brand"
                    aria-label="Mon compte"
                    fontSize="20px"
                  />
                  <MenuList>
                    {isAdmin && (
                      <>
                        <MenuItem
                          as={RouterLink}
                          to="/admin/dashboard"
                          icon={<FiSettings />}
                          fontWeight="600"
                          color="brand.600"
                        >
                          Dashboard Admin
                        </MenuItem>
                        <MenuDivider />
                      </>
                    )}
                    <MenuItem as={RouterLink} to="/compte">Mon compte</MenuItem>
                    <MenuItem as={RouterLink} to="/compte?tab=orders">Mes commandes</MenuItem>
                    <MenuItem as={RouterLink} to="/compte?tab=addresses">Mes adresses</MenuItem>
                    <MenuItem icon={<FiLogOut />} onClick={handleSignOut}>
                      Se déconnecter
                    </MenuItem>
                  </MenuList>
                </Menu>
                <Box
                  px={3}
                  py={1.5}
                  bg="primary.50"
                  borderRadius="full"
                  borderWidth="1px"
                  borderColor="primary.200"
                >
                  <Text
                    fontSize="sm"
                    color="primary.700"
                    fontWeight="600"
                    letterSpacing="tight"
                  >
                    {getPersonalizedGreeting(user)}
                  </Text>
                </Box>
              </HStack>
            ) : (
              <Button
                as={RouterLink}
                to="/login"
                variant="ghost"
                colorScheme="brand"
                size="md"
                display={{ base: 'none', md: 'flex' }}
              >
                Connexion
              </Button>
            )}

            {/* CTA Button */}
            <Button
              as={RouterLink}
              to="/catalogue"
              colorScheme="brand"
              size="md"
              display={{ base: 'none', md: 'flex' }}
            >
              Commander
            </Button>

            {/* Mobile Menu Button */}
            <IconButton
              icon={<FiMenu />}
              variant="ghost"
              onClick={onOpen}
              aria-label="Menu"
              display={{ base: 'flex', md: 'none' }}
            />
          </HStack>
        </Flex>
      </Container>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            {user ? getPersonalizedGreeting(user) : 'Menu'}
          </DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="stretch" pt={4}>
              {navLinks.map((link) => (
                <RouterLink key={link.path} to={link.path} onClick={onClose}>
                  <Text
                    fontSize="lg"
                    fontWeight="500"
                    color="gray.700"
                    _hover={{ color: 'brand.500' }}
                    py={2}
                  >
                    {link.name}
                  </Text>
                </RouterLink>
              ))}
              <Button
                as={RouterLink}
                to="/catalogue"
                colorScheme="brand"
                size="lg"
                mt={4}
                onClick={onClose}
              >
                Commander
              </Button>

              {user ? (
                <>
                  {isAdmin && (
                    <Button
                      as={RouterLink}
                      to="/admin/dashboard"
                      variant="solid"
                      colorScheme="brand"
                      size="lg"
                      onClick={onClose}
                      leftIcon={<FiSettings />}
                    >
                      Dashboard Admin
                    </Button>
                  )}
                  <Button
                    as={RouterLink}
                    to="/compte"
                    variant="outline"
                    colorScheme="brand"
                    size="lg"
                    onClick={onClose}
                  >
                    Mon compte
                  </Button>
                  <Button
                    variant="ghost"
                    colorScheme="red"
                    size="lg"
                    onClick={() => {
                      handleSignOut()
                      onClose()
                    }}
                    leftIcon={<FiLogOut />}
                  >
                    Se déconnecter
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    as={RouterLink}
                    to="/login"
                    variant="outline"
                    colorScheme="brand"
                    size="lg"
                    onClick={onClose}
                  >
                    Connexion
                  </Button>
                  <Button
                    as={RouterLink}
                    to="/signup"
                    colorScheme="brand"
                    size="lg"
                    onClick={onClose}
                  >
                    Créer un compte
                  </Button>
                </>
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartDrawerOpen} onClose={closeCartDrawer} />
    </Box>
  )
}
