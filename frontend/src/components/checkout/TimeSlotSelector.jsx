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
  TabPanel
} from '@chakra-ui/react'
import { FiClock, FiCalendar } from 'react-icons/fi'

// Generate time slots for a given date
const generateTimeSlots = (date) => {
  const slots = []
  const times = [
    '12:00', '12:30', '13:00', '13:30',
    '19:00', '19:30', '20:00', '20:30'
  ]

  times.forEach(time => {
    const [hours, minutes] = time.split(':')
    const slotDate = new Date(date)
    slotDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)

    // Check if slot is in the past
    const now = new Date()
    const isPast = slotDate < now

    // Simulate availability (random for demo)
    const available = Math.random() > 0.2 // 80% available

    slots.push({
      id: `${date.toISOString().split('T')[0]}-${time}`,
      time,
      date: slotDate,
      available: !isPast && available,
      spotsLeft: available ? Math.floor(Math.random() * 15) + 5 : 0
    })
  })

  return slots
}

export default function TimeSlotSelector({ selectedTimeSlot, onSelectTimeSlot }) {
  const [selectedDay, setSelectedDay] = useState(0)
  const [days, setDays] = useState([])

  useEffect(() => {
    // Generate next 7 days
    const nextDays = []
    for (let i = 0; i < 7; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      nextDays.push({
        date,
        label: i === 0 ? 'Aujourd\'hui' : i === 1 ? 'Demain' : date.toLocaleDateString('fr-FR', { weekday: 'long' }),
        fullLabel: date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }),
        slots: generateTimeSlots(date)
      })
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

        {/* Day Tabs */}
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

                  {/* Lunch Slots */}
                  <Box>
                    <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={3}>
                      🌞 Déjeuner
                    </Text>
                    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
                      {day.slots
                        .filter(slot => parseInt(slot.time.split(':')[0]) < 15)
                        .map(slot => (
                          <TimeSlotButton
                            key={slot.id}
                            slot={slot}
                            isSelected={selectedTimeSlot?.id === slot.id}
                            onSelect={() => onSelectTimeSlot(slot)}
                          />
                        ))}
                    </SimpleGrid>
                  </Box>

                  {/* Dinner Slots */}
                  <Box>
                    <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={3}>
                      🌙 Dîner
                    </Text>
                    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
                      {day.slots
                        .filter(slot => parseInt(slot.time.split(':')[0]) >= 15)
                        .map(slot => (
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

        {/* Info Banner */}
        <Box bg="blue.50" p={4} rounded="lg" border="1px solid" borderColor="blue.200">
          <HStack spacing={3}>
            <Icon as={FiClock} color="blue.600" boxSize={5} />
            <VStack align="start" spacing={0} flex="1">
              <Text fontSize="sm" fontWeight="bold" color="blue.900">
                Livraison express en 30 minutes
              </Text>
              <Text fontSize="xs" color="blue.700">
                Dès la confirmation de votre commande, nous préparons vos plats !
              </Text>
            </VStack>
          </HStack>
        </Box>
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
