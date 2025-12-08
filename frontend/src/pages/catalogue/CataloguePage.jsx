import { useState, useMemo } from 'react'
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Button,
  Select,
  Text,
  useDisclosure,
  Alert,
  AlertIcon,
  AlertTitle
} from '@chakra-ui/react'
import { FiSearch } from 'react-icons/fi'
import { useDishes, useCategories } from '../../hooks/useDishes'
import DishCard from '../../components/catalogue/DishCard'
import DishDetailModal from '../../components/catalogue/DishDetailModal'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function CataloguePage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('popular')
  const [selectedDish, setSelectedDish] = useState(null)
  const { isOpen, onOpen, onClose } = useDisclosure()

  // Fetch data from Supabase
  const { dishes: allDishes, loading: loadingDishes, error: errorDishes } = useDishes()
  const { categories, loading: loadingCategories, error: errorCategories } = useCategories()

  // Filter and sort dishes
  const filteredDishes = useMemo(() => {
    let dishes = [...allDishes]

    // Filter by category
    if (selectedCategory !== 'all') {
      dishes = dishes.filter((dish) => dish.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      dishes = dishes.filter(
        (dish) =>
          dish.name.toLowerCase().includes(query) ||
          dish.description.toLowerCase().includes(query) ||
          dish.categoryLabel.toLowerCase().includes(query)
      )
    }

    // Sort dishes
    switch (sortBy) {
      case 'price-asc':
        dishes.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        dishes.sort((a, b) => b.price - a.price)
        break
      case 'name':
        dishes.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'popular':
      default:
        dishes.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0))
        break
    }

    return dishes
  }, [allDishes, selectedCategory, searchQuery, sortBy])

  const handleViewDetails = (dish) => {
    setSelectedDish(dish)
    onOpen()
  }

  // Loading state
  if (loadingDishes || loadingCategories) {
    return (
      <Box bg="gray.50" minH="calc(100vh - 64px)" py={8}>
        <Container maxW="container.xl">
          <LoadingSpinner message="Chargement du catalogue..." />
        </Container>
      </Box>
    )
  }

  // Error state
  if (errorDishes || errorCategories) {
    return (
      <Box bg="gray.50" minH="calc(100vh - 64px)" py={8}>
        <Container maxW="container.xl">
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <AlertTitle>Erreur de chargement du catalogue</AlertTitle>
          </Alert>
        </Container>
      </Box>
    )
  }

  return (
    <Box bg="gray.50" minH="calc(100vh - 64px)" py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <VStack spacing={4} align="start">
            <Heading as="h1" size="xl" color="gray.800">
              Notre Catalogue
            </Heading>
            <Text color="gray.600">
              Découvrez nos {allDishes.length} plats frais et savoureux
            </Text>
          </VStack>

          {/* Search and Filters */}
          <VStack spacing={4} align="stretch">
            {/* Search Bar */}
            <InputGroup size="lg">
              <InputLeftElement pointerEvents="none">
                <FiSearch color="gray" />
              </InputLeftElement>
              <Input
                placeholder="Rechercher un plat, une catégorie..."
                bg="white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                _focus={{ borderColor: 'brand.500' }}
              />
            </InputGroup>

            {/* Category Filters */}
            <HStack spacing={2} overflowX="auto" pb={2}>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  size="md"
                  variant={selectedCategory === category.id ? 'solid' : 'outline'}
                  colorScheme={selectedCategory === category.id ? 'brand' : 'gray'}
                  onClick={() => setSelectedCategory(category.id)}
                  flexShrink={0}
                  leftIcon={<span>{category.icon}</span>}
                >
                  {category.name}
                </Button>
              ))}
            </HStack>

            {/* Sort */}
            <HStack justify="space-between" align="center">
              <Text fontSize="sm" color="gray.600">
                {filteredDishes.length} plat{filteredDishes.length > 1 ? 's' : ''} trouvé{filteredDishes.length > 1 ? 's' : ''}
              </Text>
              <HStack>
                <Text fontSize="sm" color="gray.600">
                  Trier par:
                </Text>
                <Select
                  size="sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  bg="white"
                  w="auto"
                >
                  <option value="popular">Popularité</option>
                  <option value="price-asc">Prix croissant</option>
                  <option value="price-desc">Prix décroissant</option>
                  <option value="name">Nom (A-Z)</option>
                </Select>
              </HStack>
            </HStack>
          </VStack>

          {/* Dishes Grid */}
          {filteredDishes.length > 0 ? (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
              {filteredDishes.map((dish) => (
                <DishCard
                  key={dish.id}
                  dish={dish}
                  onViewDetails={() => handleViewDetails(dish)}
                />
              ))}
            </SimpleGrid>
          ) : (
            <VStack py={20} spacing={4}>
              <Text fontSize="4xl">🔍</Text>
              <Heading size="md" color="gray.600">
                Aucun plat trouvé
              </Heading>
              <Text color="gray.500">
                Essayez de modifier vos filtres ou votre recherche
              </Text>
              <Button
                colorScheme="brand"
                onClick={() => {
                  setSelectedCategory('all')
                  setSearchQuery('')
                }}
              >
                Réinitialiser les filtres
              </Button>
            </VStack>
          )}
        </VStack>
      </Container>

      {/* Dish Detail Modal */}
      <DishDetailModal dish={selectedDish} isOpen={isOpen} onClose={onClose} />
    </Box>
  )
}
