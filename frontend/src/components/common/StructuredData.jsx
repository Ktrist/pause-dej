import { Helmet } from 'react-helmet-async'
import PropTypes from 'prop-types'

/**
 * Schema.org LocalBusiness pour le référencement local
 */
export function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": "Pause Dej'",
    "image": "https://pause-dej.fr/logo.jpg",
    "logo": "https://pause-dej.fr/logo.jpg",
    "@id": "https://pause-dej.fr",
    "url": "https://pause-dej.fr",
    "telephone": "+33650772334",
    "priceRange": "€€",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Annecy",
      "addressLocality": "Annecy",
      "addressRegion": "Haute-Savoie",
      "postalCode": "74000",
      "addressCountry": "FR"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 45.8992,
      "longitude": 6.1294
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday"
        ],
        "opens": "07:00",
        "closes": "09:00"
      }
    ],
    "servesCuisine": "French",
    "acceptsReservations": "True",
    "menu": "https://pause-dej.fr/a-la-carte",
    "areaServed": [
      {
        "@type": "City",
        "name": "Annecy"
      },
      {
        "@type": "City",
        "name": "Annecy-le-Vieux"
      },
      {
        "@type": "City",
        "name": "Argonay"
      }
    ]
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  )
}

/**
 * Schema.org Product pour les plats
 */
export function ProductSchema({ dish }) {
  if (!dish) return null

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": dish.name,
    "image": dish.image,
    "description": dish.description || dish.long_description,
    "offers": {
      "@type": "Offer",
      "url": `https://pause-dej.fr/a-la-carte?dish=${dish.id}`,
      "priceCurrency": "EUR",
      "price": dish.price,
      "availability": dish.stock > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Restaurant",
        "name": "Pause Dej'"
      }
    }
  }

  // Ajouter les avis si disponibles
  if (dish.rating_avg && dish.rating_count > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": dish.rating_avg,
      "reviewCount": dish.rating_count,
      "bestRating": 5,
      "worstRating": 1
    }
  }

  // Ajouter les informations nutritionnelles si disponibles
  if (dish.nutrition_info) {
    schema.nutrition = {
      "@type": "NutritionInformation",
      "calories": dish.nutrition_info.calories ? `${dish.nutrition_info.calories} calories` : undefined,
      "proteinContent": dish.nutrition_info.protein ? `${dish.nutrition_info.protein}g` : undefined,
      "carbohydrateContent": dish.nutrition_info.carbs ? `${dish.nutrition_info.carbs}g` : undefined,
      "fatContent": dish.nutrition_info.fat ? `${dish.nutrition_info.fat}g` : undefined
    }
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  )
}

ProductSchema.propTypes = {
  dish: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    image: PropTypes.string,
    description: PropTypes.string,
    long_description: PropTypes.string,
    price: PropTypes.number.isRequired,
    stock: PropTypes.number,
    rating_avg: PropTypes.number,
    rating_count: PropTypes.number,
    nutrition_info: PropTypes.shape({
      calories: PropTypes.number,
      protein: PropTypes.number,
      carbs: PropTypes.number,
      fat: PropTypes.number
    })
  })
}

/**
 * Schema.org FAQPage pour la page Comment ça marche
 */
export function FAQPageSchema({ faqs }) {
  if (!faqs || faqs.length === 0) return null

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  )
}

FAQPageSchema.propTypes = {
  faqs: PropTypes.arrayOf(
    PropTypes.shape({
      question: PropTypes.string.isRequired,
      answer: PropTypes.string.isRequired
    })
  )
}

/**
 * Schema.org BreadcrumbList pour la navigation
 */
export function BreadcrumbSchema({ items }) {
  if (!items || items.length === 0) return null

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `https://pause-dej.fr${item.url}`
    }))
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  )
}

BreadcrumbSchema.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired
    })
  )
}

/**
 * Schema.org Organization pour la page d'accueil
 */
export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Pause Dej'",
    "url": "https://pause-dej.fr",
    "logo": "https://pause-dej.fr/logo.jpg",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+33650772334",
      "contactType": "customer service",
      "areaServed": "FR",
      "availableLanguage": "French"
    },
    "sameAs": [
      // Ajouter liens réseaux sociaux quand disponibles
      // "https://www.facebook.com/pausedej",
      // "https://www.instagram.com/pausedej"
    ]
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  )
}
