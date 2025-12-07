// Données mockées pour le développement

export const popularDishes = [
  {
    id: 1,
    name: 'Poke Bowl Saumon',
    description: 'Riz sushi, saumon frais, avocat, edamame, sauce soja',
    price: 12.90,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=400&fit=crop',
    category: 'Plat principal',
    stock: 15,
    isPopular: true
  },
  {
    id: 2,
    name: 'Burger Végétarien',
    description: 'Steak de légumes, cheddar, salade, tomate, sauce maison',
    price: 10.50,
    image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=500&h=400&fit=crop',
    category: 'Plat principal',
    stock: 20,
    isPopular: true
  },
  {
    id: 3,
    name: 'Salade César',
    description: 'Poulet grillé, parmesan, croûtons, sauce César',
    price: 9.90,
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=500&h=400&fit=crop',
    category: 'Salade',
    stock: 12,
    isPopular: true
  },
  {
    id: 4,
    name: 'Pad Thaï Crevettes',
    description: 'Nouilles de riz, crevettes, cacahuètes, sauce tamarin',
    price: 13.50,
    image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=500&h=400&fit=crop',
    category: 'Plat principal',
    stock: 10,
    isPopular: true
  },
  {
    id: 5,
    name: 'Tartare de Bœuf',
    description: 'Bœuf Label Rouge, câpres, cornichons, frites maison',
    price: 14.90,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&h=400&fit=crop',
    category: 'Plat principal',
    stock: 8,
    isPopular: true
  },
  {
    id: 6,
    name: 'Buddha Bowl',
    description: 'Quinoa, falafels, houmous, légumes grillés',
    price: 11.50,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=400&fit=crop',
    category: 'Plat principal',
    stock: 18,
    isPopular: true
  }
]

export const testimonials = [
  {
    id: 1,
    name: 'Sophie Martin',
    role: 'Manager RH',
    company: 'TechCorp',
    comment: 'Enfin une solution rapide et saine pour ma pause déj ! Les plats sont délicieux et toujours livrés à temps.',
    rating: 5,
    avatar: 'https://i.pravatar.cc/150?img=1'
  },
  {
    id: 2,
    name: 'Thomas Dubois',
    role: 'Développeur',
    company: 'StartupXYZ',
    comment: 'Gain de temps incroyable ! Je commande en 2 clics et je reçois mon repas en moins de 30 minutes.',
    rating: 5,
    avatar: 'https://i.pravatar.cc/150?img=2'
  },
  {
    id: 3,
    name: 'Marie Lefevre',
    role: 'Designer',
    company: 'Creative Agency',
    comment: 'La qualité est au rendez-vous ! Des plats frais, variés et à prix raisonnable. Je recommande à 100%.',
    rating: 5,
    avatar: 'https://i.pravatar.cc/150?img=3'
  }
]

export const howItWorksSteps = [
  {
    id: 1,
    title: 'Commandez',
    description: 'Choisissez vos plats parmi notre sélection quotidienne',
    icon: '🛒'
  },
  {
    id: 2,
    title: 'On cuisine',
    description: 'Nos chefs préparent votre repas avec des produits frais',
    icon: '👨‍🍳'
  },
  {
    id: 3,
    title: 'Livré en 30min',
    description: 'Recevez votre commande chaude et prête à déguster',
    icon: '🚴'
  }
]
