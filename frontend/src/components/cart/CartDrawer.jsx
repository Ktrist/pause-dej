import { useEffect } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  IconButton,
  Button,
  Image,
  Divider,
  Badge,
  useColorModeValue,
  Heading,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Flex
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiMinus, FiPlus, FiTrash2, FiShoppingBag } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'

const MotionBox = motion(Box)

/**
 * CartDrawer - Panier latéral style Frichti
 *
 * Features:
 * - Slide-in animation from right
 * - Backdrop overlay with blur
 * - Responsive (400px desktop, 100% mobile)
 * - Smooth animations with Framer Motion
 */
export default function CartDrawer({ isOpen, onClose }) {
  const navigate = useNavigate()
  const bgColor = useColorModeValue('white', 'gray.800')
  const overlayBg = useColorModeValue('rgba(0, 0, 0, 0.5)', 'rgba(0, 0, 0, 0.7)')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const itemHoverBg = useColorModeValue('gray.50', 'gray.700')
  const footerBg = useColorModeValue('gray.50', 'gray.900')

  console.log('🛒 CartDrawer - isOpen:', isOpen)

  const {
    cart,
    getCartTotal,
    getCartCount,
    updateQuantity,
    removeFromCart,
    clearCart
  } = useCart()

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleCheckout = () => {
    onClose()
    navigate('/checkout')
  }

  const deliveryFee = getCartTotal() >= 30 ? 0 : 3.90
  const total = getCartTotal() + deliveryFee

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay avec blur */}
          <MotionBox
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg={overlayBg}
            backdropFilter="blur(2px)"
            zIndex={999}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* Drawer Container */}
          <MotionBox
            position="fixed"
            top={0}
            right={0}
            bottom={0}
            width={{ base: '100%', md: '400px' }}
            maxW="100vw"
            bg={bgColor}
            boxShadow="-4px 0 24px rgba(0, 0, 0, 0.15)"
            zIndex={1000}
            display="flex"
            flexDirection="column"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 300
            }}
          >
            {/* Header */}
            <Flex
              p={4}
              borderBottomWidth="1px"
              borderColor={borderColor}
              align="center"
              justify="space-between"
            >
              <HStack spacing={3}>
                <FiShoppingBag size={24} />
                <Box>
                  <Heading size="md">Panier</Heading>
                  <Text fontSize="sm" color="gray.600">
                    {getCartCount()} article{getCartCount() > 1 ? 's' : ''}
                  </Text>
                </Box>
              </HStack>
              <IconButton
                icon={<FiX />}
                variant="ghost"
                onClick={onClose}
                aria-label="Fermer le panier"
                size="lg"
              />
            </Flex>

            {/* Cart Items */}
            <VStack
              flex={1}
              overflowY="auto"
              spacing={0}
              divider={<Divider />}
              align="stretch"
            >
              {cart.length === 0 ? (
                <VStack spacing={4} py={12} px={4}>
                  <FiShoppingBag size={48} color="gray" />
                  <Text color="gray.500" textAlign="center">
                    Votre panier est vide
                  </Text>
                  <Button
                    colorScheme="brand"
                    onClick={() => {
                      onClose()
                      navigate('/a-la-carte')
                    }}
                  >
                    Découvrir nos plats
                  </Button>
                </VStack>
              ) : (
                cart.map((item) => (
                  <Box key={item.id} p={4} _hover={{ bg: itemHoverBg }}>
                    <HStack align="start" spacing={3}>
                      {/* Image */}
                      <Image
                        src={item.image}
                        alt={item.name}
                        boxSize="80px"
                        objectFit="cover"
                        borderRadius="md"
                        fallbackSrc="https://via.placeholder.com/80"
                      />

                      {/* Details */}
                      <VStack align="start" flex={1} spacing={2}>
                        <Text fontWeight="600" fontSize="sm">
                          {item.name}
                        </Text>

                        {/* Quantity Controls */}
                        <HStack spacing={2}>
                          <IconButton
                            icon={<FiMinus />}
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            isDisabled={item.quantity <= 1}
                          />
                          <Text fontWeight="600" minW="30px" textAlign="center">
                            {item.quantity}
                          </Text>
                          <IconButton
                            icon={<FiPlus />}
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          />
                          <IconButton
                            icon={<FiTrash2 />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => removeFromCart(item.id)}
                            ml={2}
                          />
                        </HStack>

                        {/* Price */}
                        <Text fontWeight="700" color="brand.600">
                          {(item.price * item.quantity).toFixed(2)}€
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                ))
              )}
            </VStack>

            {/* Footer - Summary & Checkout */}
            {cart.length > 0 && (
              <Box
                p={4}
                borderTopWidth="1px"
                borderColor={borderColor}
                bg={footerBg}
              >
                <VStack spacing={3} align="stretch">
                  {/* Subtotal */}
                  <HStack justify="space-between">
                    <Text>Sous-total</Text>
                    <Text fontWeight="600">{getCartTotal().toFixed(2)}€</Text>
                  </HStack>

                  {/* Delivery Fee */}
                  <HStack justify="space-between">
                    <Text fontSize="sm">Frais de livraison</Text>
                    <HStack spacing={2}>
                      {deliveryFee === 0 && (
                        <Badge colorScheme="green" fontSize="xs">
                          OFFERTS
                        </Badge>
                      )}
                      <Text fontSize="sm" fontWeight="600">
                        {deliveryFee === 0 ? '0.00€' : `${deliveryFee.toFixed(2)}€`}
                      </Text>
                    </HStack>
                  </HStack>

                  {deliveryFee > 0 && (
                    <Text fontSize="xs" color="gray.600">
                      Livraison gratuite dès 30€
                    </Text>
                  )}

                  <Divider />

                  {/* Total */}
                  <HStack justify="space-between" fontSize="lg">
                    <Text fontWeight="700">Total</Text>
                    <Text fontWeight="700" color="brand.600">
                      {total.toFixed(2)}€
                    </Text>
                  </HStack>

                  {/* Checkout Button */}
                  <Button
                    colorScheme="brand"
                    size="lg"
                    width="full"
                    onClick={handleCheckout}
                    leftIcon={<FiShoppingBag />}
                  >
                    Commander
                  </Button>

                  {/* Clear Cart */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearCart}
                    color="red.500"
                  >
                    Vider le panier
                  </Button>
                </VStack>
              </Box>
            )}
          </MotionBox>
        </>
      )}
    </AnimatePresence>
  )
}
