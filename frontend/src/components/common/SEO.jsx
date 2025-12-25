import { Helmet } from 'react-helmet-async'
import PropTypes from 'prop-types'

export default function SEO({
  title = "Pause Dej' - Livraison de repas frais à Annecy",
  description = "Commandez des plats frais et savoureux livrés le matin à Annecy. Cuisine locale, produits de qualité, livraison rapide entre 7h et 9h.",
  image = '/og-image.jpg',
  url,
  type = 'website',
  noindex = false,
  keywords = 'livraison repas, Annecy, plats frais, cuisine locale, livraison matin, restauration'
}) {
  const siteUrl = 'https://pause-dej.fr'
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.pathname : '/')
  const fullUrl = currentUrl.startsWith('http') ? currentUrl : `${siteUrl}${currentUrl}`
  const fullImage = image.startsWith('http') ? image : `${siteUrl}${image}`

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* Viewport - Mobile Optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />

      {/* Language */}
      <html lang="fr" />

      {/* Open Graph (Facebook, LinkedIn) */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="fr_FR" />
      <meta property="og:site_name" content="Pause Dej'" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />

      {/* Additional SEO */}
      <link rel="canonical" href={fullUrl} />

      {/* Preconnect to external domains for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    </Helmet>
  )
}

SEO.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  image: PropTypes.string,
  url: PropTypes.string,
  type: PropTypes.string,
  noindex: PropTypes.bool,
  keywords: PropTypes.string
}
