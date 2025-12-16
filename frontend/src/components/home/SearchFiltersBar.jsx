import { useState } from 'react'
import {
  Box,
  Container,
  Input,
  InputGroup,
  InputLeftElement,
  HStack,
  Button,
  useColorModeValue
} from '@chakra-ui/react'
import { FiSearch } from 'react-icons/fi'

const FILTER_CATEGORIES = [
  { id: 'hot', label: '🔥 Plats Chauds', emoji: '🔥' },
  { id: 'salads', label: '🥗 Salades Fraîches', emoji: '🥗' },
  { id: 'desserts', label: '🍰 Desserts', emoji: '🍰' },
  { id: 'drinks', label: '🥤 Boissons Locales', emoji: '🥤' }
]

export default function SearchFiltersBar({ onSearch, onFilterChange }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState(null)

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchQuery(value)
    if (onSearch) {
      onSearch(value)
    }
  }

  const handleFilterClick = (filterId) => {
    const newFilter = activeFilter === filterId ? null : filterId
    setActiveFilter(newFilter)
    if (onFilterChange) {
      onFilterChange(newFilter)
    }
  }

  return (
    <Box
      bg="background.main"
      py={8}
      borderBottom="1px"
      borderColor={borderColor}
    >
      <Container maxW="container.xl">
        <Box>
          {/* Search Bar */}
          <InputGroup size="lg" mb={6}>
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray" />
            </InputLeftElement>
            <Input
              placeholder="De quoi avez-vous envie ? (ex: Crozets...)"
              value={searchQuery}
              onChange={handleSearchChange}
              bg={bgColor}
              border="2px"
              borderColor="gray.300"
              _hover={{
                borderColor: 'primary.400'
              }}
              _focus={{
                borderColor: 'primary.500',
                boxShadow: '0 0 0 1px var(--chakra-colors-primary-500)'
              }}
              borderRadius="12px"
              fontSize="md"
              fontWeight="medium"
              color="text.primary"
              _placeholder={{
                color: 'text.light'
              }}
            />
          </InputGroup>

          {/* Filter Pills */}
          <HStack
            spacing={3}
            overflowX="auto"
            pb={2}
            css={{
              '&::-webkit-scrollbar': {
                display: 'none'
              },
              scrollbarWidth: 'none'
            }}
          >
            {FILTER_CATEGORIES.map((category) => (
              <Button
                key={category.id}
                onClick={() => handleFilterClick(category.id)}
                size="md"
                variant={activeFilter === category.id ? 'solid' : 'outline'}
                bg={activeFilter === category.id ? 'primary.500' : bgColor}
                color={activeFilter === category.id ? 'white' : 'primary.600'}
                borderColor="primary.300"
                borderWidth="2px"
                borderRadius="full"
                px={6}
                py={2}
                fontWeight="semibold"
                fontSize="sm"
                whiteSpace="nowrap"
                _hover={{
                  bg: activeFilter === category.id ? 'primary.600' : 'primary.50',
                  transform: 'translateY(-2px)',
                  boxShadow: 'sm'
                }}
                _active={{
                  bg: activeFilter === category.id ? 'primary.700' : 'primary.100'
                }}
                transition="all 0.2s"
              >
                {category.label}
              </Button>
            ))}
          </HStack>
        </Box>
      </Container>
    </Box>
  )
}
