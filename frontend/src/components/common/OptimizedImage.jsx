import { useState } from 'react'
import { Box, Skeleton } from '@chakra-ui/react'
import PropTypes from 'prop-types'

/**
 * Composant Image optimisé avec lazy loading et skeleton
 * Supporte Cloudinary pour optimisation automatique
 */
export default function OptimizedImage({
  src,
  alt,
  width = '100%',
  height = 'auto',
  objectFit = 'cover',
  borderRadius,
  lazy = true,
  priority = false,
  aspectRatio,
  fallback,
  onLoad,
  onError,
  ...props
}) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  /**
   * Optimise l'URL de l'image avec Cloudinary si disponible
   * Ajoute transformations automatiques : format auto, qualité auto, width responsive
   */
  const getOptimizedUrl = (url) => {
    if (!url) return fallback || ''

    // Si c'est déjà une URL Cloudinary, ajouter transformations
    if (url.includes('cloudinary.com')) {
      // Remplacer /upload/ par /upload/f_auto,q_auto,w_auto/
      return url.replace('/upload/', '/upload/f_auto,q_auto,w_auto/')
    }

    // Si c'est une URL externe, retourner telle quelle
    if (url.startsWith('http')) {
      return url
    }

    // Si c'est un chemin local, retourner tel quel
    return url
  }

  const handleLoad = (e) => {
    setLoaded(true)
    if (onLoad) onLoad(e)
  }

  const handleError = (e) => {
    setError(true)
    setLoaded(true)
    if (onError) onError(e)
  }

  const optimizedSrc = error && fallback ? fallback : getOptimizedUrl(src)

  return (
    <Box
      position="relative"
      width={width}
      height={height}
      aspectRatio={aspectRatio}
      overflow="hidden"
      {...props}
    >
      {/* Skeleton loader pendant le chargement */}
      {!loaded && (
        <Skeleton
          position="absolute"
          top={0}
          left={0}
          width="100%"
          height="100%"
          borderRadius={borderRadius}
          startColor="gray.100"
          endColor="gray.300"
        />
      )}

      {/* Image principale */}
      <Box
        as="img"
        src={optimizedSrc}
        alt={alt}
        width="100%"
        height="100%"
        objectFit={objectFit}
        borderRadius={borderRadius}
        loading={priority ? 'eager' : lazy ? 'lazy' : 'auto'}
        decoding={priority ? 'sync' : 'async'}
        onLoad={handleLoad}
        onError={handleError}
        opacity={loaded ? 1 : 0}
        transition="opacity 0.3s ease-in-out"
        // Attributs pour améliorer les performances
        fetchpriority={priority ? 'high' : 'auto'}
      />
    </Box>
  )
}

OptimizedImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  objectFit: PropTypes.oneOf(['cover', 'contain', 'fill', 'none', 'scale-down']),
  borderRadius: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  lazy: PropTypes.bool,
  priority: PropTypes.bool,
  aspectRatio: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  fallback: PropTypes.string,
  onLoad: PropTypes.func,
  onError: PropTypes.func
}

/**
 * Hook pour précharger des images critiques
 */
export function usePreloadImage(src) {
  if (typeof window === 'undefined') return

  const img = new Image()
  img.src = src
}

/**
 * Composant pour générer une image responsive avec srcset
 */
export function ResponsiveImage({
  src,
  alt,
  sizes = '100vw',
  widths = [320, 640, 960, 1280, 1920],
  ...props
}) {
  // Générer srcset pour différentes tailles
  const generateSrcSet = () => {
    if (!src.includes('cloudinary.com')) {
      return undefined
    }

    return widths
      .map(width => {
        const url = src.replace('/upload/', `/upload/w_${width},f_auto,q_auto/`)
        return `${url} ${width}w`
      })
      .join(', ')
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      srcSet={generateSrcSet()}
      sizes={sizes}
      {...props}
    />
  )
}

ResponsiveImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  sizes: PropTypes.string,
  widths: PropTypes.arrayOf(PropTypes.number)
}
