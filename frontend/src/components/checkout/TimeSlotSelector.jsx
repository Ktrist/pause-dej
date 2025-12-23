import { useState, useEffect } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  SimpleGrid,
  Badge,
  Icon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Flex
} from '@chakra-ui/react'
import { FiClock, FiCalendar, FiZap } from 'react-icons/fi'

// Generate time slots for a given date (Monday to Friday, 7h-9h morning delivery)
const generateTimeSlots = (date) => {
  const dayOfWeek = date.getDay()

  // Only Monday (1) to Friday (5)
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return [] // No delivery on weekends
  }

  const slots = []

  // Single morning slot: Livraison entre 7h et 9h
  const slotDate = new Date(date)
  slotDate.setHours(7, 0, 0, 0) // Set to 7:00 AM for display purposes

  // Check if slot is in the past
  const now = new Date()
  const isPast = slotDate < now

  // Simulate availability (random for demo)
  const available = Math.random() > 0.2 // 80% available

  slots.push({
    id: `${date.toISOString().split('T')[0]}-morning`,
    time: 'Livraison entre 7h et 9h',
    displayTime: '7h - 9h',
    timeValue: '07:00:00', // Format for database (HH:MM:SS)
    date: slotDate,
    available: !isPast && available,
    spotsLeft: available ? Math.floor(Math.random() * 15) + 5 : 0
  })

  return slots
}

export default function TimeSlotSelector({ selectedTimeSlot, onSelectTimeSlot }) {
  const [selectedDay, setSelectedDay] = useState(0)
  const [days, setDays] = useState([])

  useEffect(() => {
    // Generate next 7 days (only weekdays will have slots)
    const nextDays = []
    for (let i = 0; i < 7; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      const slots = generateTimeSlots(date)

      // Only add days with available slots (weekdays)
      if (slots.length > 0) {
        nextDays.push({
          date,
          label: i === 0 ? 'Aujourd\'hui' : i === 1 ? 'Demain' : date.toLocaleDateString('fr-FR', { weekday: 'long' }),
          fullLabel: date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }),
          slots
        })
      }
    }
    setDays(nextDays)
  }, [])

  if (days.length === 0) {
    return null
  }

  const currentDay = days[selectedDay]

  return (
    <Box bg="white" p={6} rounded="lg" shadow="sm">
      <VStack align="stretch" spacing={6}>
        <Box>
          <Text fontSize="xl" fontWeight="bold" mb={1}>
            Créneau de livraison
          </Text>
          <Text fontSize="sm" color="gray.600">
            Choisissez quand vous souhaitez être livré
          </Text>
        </Box>

        <Flex gap={4} direction={{ base: 'column', lg: 'row' }} align={{ base: 'stretch', lg: 'center' }}>
          {/* Day Tabs */}
          <Box flex="1">
            <Tabs
              index={selectedDay}
              onChange={setSelectedDay}
              colorScheme="brand"
              variant="soft-rounded"
            >
              <TabList
                overflowX="auto"
                css={{
                  '&::-webkit-scrollbar': { display: 'none' },
                  scrollbarWidth: 'none'
                }}
              >
                {days.map((day, index) => (
                  <Tab
                    key={index}
                    minW="fit-content"
                    px={6}
                    _selected={{
                      bg: 'brand.500',
                      color: 'white'
                    }}
                  >
                    <VStack spacing={0}>
                      <Text fontWeight="bold" fontSize="sm">
                        {day.label}
                      </Text>
                      <Text fontSize="xs" opacity={0.8}>
                        {day.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </Text>
                    </VStack>
                  </Tab>
                ))}
              </TabList>

          <TabPanels>
            {days.map((day, dayIndex) => (
              <TabPanel key={dayIndex} px={0} pt={6}>
                <VStack align="stretch" spacing={4}>
                  <HStack spacing={2} color="gray.600">
                    <Icon as={FiCalendar} />
                    <Text fontSize="sm" fontWeight="medium">
                      {day.fullLabel}
                    </Text>
                  </HStack>

                  {/* Morning Delivery Slot */}
                  <Box>
                    <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={3}>
                      🌅 Livraison du matin
                    </Text>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                      {day.slots.map(slot => (
                        <TimeSlotButton
                          key={slot.id}
                          slot={slot}
                          isSelected={selectedTimeSlot?.id === slot.id}
                          onSelect={() => onSelectTimeSlot(slot)}
                        />
                      ))}
                    </SimpleGrid>
                  </Box>
                </VStack>
              </TabPanel>
            ))}
          </TabPanels>
            </Tabs>
          </Box>

          {/* Coming Soon - New Time Slots */}
          <Box
            minW={{ base: 'full', lg: '280px' }}
            maxW={{ base: 'full', lg: '320px' }}
            bgGradient="linear(to-br, purple.50, pink.50)"
            p={5}
            rounded="xl"
            border="2px solid"
            borderColor="purple.200"
            shadow="md"
            position="relative"
            overflow="hidden"
          >
            <Badge
              colorScheme="purple"
              fontSize="xs"
              px={2}
              py={1}
              mb={3}
              position="absolute"
              top={3}
              right={3}
            >
              Bientôt
            </Badge>

            <VStack align="start" spacing={3} mt={2}>
              <HStack spacing={2}>
                <Icon as={FiZap} color="purple.600" boxSize={6} />
                <Text fontSize="lg" fontWeight="bold" color="purple.900">
                  Nouveaux créneaux
                </Text>
              </HStack>

              <Text fontSize="sm" color="purple.800" fontWeight="medium">
                Livraisons par tranches de 30 min
              </Text>

              <Box
                bg="white"
                p={3}
                rounded="lg"
                w="full"
                border="1px solid"
                borderColor="purple.200"
              >
                <HStack spacing={2} mb={2}>
                  <Icon as={FiClock} color="purple.600" boxSize={4} />
                  <Text fontSize="sm" fontWeight="bold" color="purple.900">
                    Horaires disponibles
                  </Text>
                </HStack>
                <Text fontSize="sm" color="gray.700" fontWeight="semibold">
                  De 7h00 à 13h30
                </Text>
                <Text fontSize="xs" color="gray.600" mt={1}>
                  Toutes les 30 minutes
                </Text>
              </Box>

              <Text fontSize="xs" color="purple.700" fontStyle="italic">
                Plus de flexibilité pour vos livraisons ! 🎉
              </Text>
            </VStack>
          </Box>
        </Flex>

        {/* Info Banner - Commented out as requested */}
        {/* <Box bg="blue.50" p={4} rounded="lg" border="1px solid" borderColor="blue.200">
          <HStack spacing={3}>
            <Icon as={FiClock} color="blue.600" boxSize={5} />
            <VStack align="start" spacing={0} flex="1">
              <Text fontSize="sm" fontWeight="bold" color="blue.900">
                Livraison du lundi au vendredi uniquement
              </Text>
              <Text fontSize="xs" color="blue.700">
                Livraison entre 7h et 9h le matin. Commandez avant minuit pour une livraison le lendemain !
              </Text>
            </VStack>
          </HStack>
        </Box> */}
      </VStack>
    </Box>
  )
}

function TimeSlotButton({ slot, isSelected, onSelect }) {
  if (!slot.available) {
    return (
      <Button
        size="lg"
        variant="outline"
        isDisabled
        opacity={0.5}
        cursor="not-allowed"
        h="auto"
        py={3}
      >
        <VStack spacing={1}>
          <Text fontSize="md" fontWeight="bold">{slot.time}</Text>
          <Badge colorScheme="red" fontSize="xs">Complet</Badge>
        </VStack>
      </Button>
    )
  }

  return (
    <Button
      size="lg"
      variant={isSelected ? 'solid' : 'outline'}
      colorScheme={isSelected ? 'brand' : 'gray'}
      onClick={onSelect}
      h="auto"
      py={3}
      border="2px solid"
      borderColor={isSelected ? 'brand.500' : 'gray.200'}
      _hover={{
        borderColor: 'brand.400',
        transform: 'translateY(-2px)',
        shadow: 'md'
      }}
      transition="all 0.2s"
    >
      <VStack spacing={1}>
        <Text fontSize="md" fontWeight="bold">{slot.time}</Text>
        {slot.spotsLeft <= 5 && (
          <Badge colorScheme="orange" fontSize="xs">
            {slot.spotsLeft} places
          </Badge>
        )}
      </VStack>
    </Button>
  )
}
