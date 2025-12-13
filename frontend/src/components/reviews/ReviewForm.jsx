import { useState } from 'react'
import {
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  Text,
  useToast,
  Alert,
  AlertIcon,
  Box
} from '@chakra-ui/react'
import { StarRatingInput } from './StarRating'
import { useCreateReview } from '../../hooks/useReviews'

export default function ReviewForm({ dishId, dishName, onSuccess, onCancel }) {
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const { createReview, loading } = useCreateReview()
  const toast = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (rating === 0) {
      toast({
        title: 'Note requise',
        description: 'Veuillez sélectionner une note',
        status: 'warning',
        duration: 3000
      })
      return
    }

    if (!comment.trim()) {
      toast({
        title: 'Commentaire requis',
        description: 'Veuillez écrire un commentaire',
        status: 'warning',
        duration: 3000
      })
      return
    }

    const { data, error } = await createReview({
      dishId,
      rating,
      title: title.trim() || null,
      comment: comment.trim()
    })

    if (error) {
      if (error.includes('unique')) {
        toast({
          title: 'Avis déjà soumis',
          description: 'Vous avez déjà laissé un avis pour ce plat',
          status: 'error',
          duration: 4000
        })
      } else {
        toast({
          title: 'Erreur',
          description: error,
          status: 'error',
          duration: 4000
        })
      }
    } else {
      toast({
        title: 'Avis publié !',
        description: 'Merci pour votre retour',
        status: 'success',
        duration: 3000
      })

      // Reset form
      setRating(0)
      setTitle('')
      setComment('')

      if (onSuccess) onSuccess(data)
    }
  }

  return (
    <Box
      as="form"
      onSubmit={handleSubmit}
      p={6}
      bg="white"
      borderRadius="lg"
      borderWidth="1px"
      borderColor="gray.200"
    >
      <VStack spacing={5} align="stretch">
        <Text fontSize="lg" fontWeight="600" color="gray.800">
          Donnez votre avis sur {dishName}
        </Text>

        <Alert status="info" borderRadius="md" fontSize="sm">
          <AlertIcon />
          Votre avis aidera d'autres clients à faire leur choix
        </Alert>

        {/* Rating Input */}
        <FormControl isRequired>
          <FormLabel>Votre note</FormLabel>
          <StarRatingInput rating={rating} onRatingChange={setRating} required />
        </FormControl>

        {/* Title Input */}
        <FormControl>
          <FormLabel>Titre de l'avis (optionnel)</FormLabel>
          <Input
            placeholder="Ex: Délicieux et copieux !"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
          />
        </FormControl>

        {/* Comment Input */}
        <FormControl isRequired>
          <FormLabel>Votre commentaire</FormLabel>
          <Textarea
            placeholder="Partagez votre expérience avec ce plat..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={5}
            maxLength={1000}
          />
          <Text fontSize="xs" color="gray.500" mt={1}>
            {comment.length}/1000 caractères
          </Text>
        </FormControl>

        {/* Actions */}
        <HStack spacing={3} pt={2}>
          <Button
            type="submit"
            colorScheme="brand"
            isLoading={loading}
            loadingText="Publication..."
            flex={1}
          >
            Publier l'avis
          </Button>
          {onCancel && (
            <Button
              variant="ghost"
              onClick={onCancel}
              isDisabled={loading}
            >
              Annuler
            </Button>
          )}
        </HStack>
      </VStack>
    </Box>
  )
}
