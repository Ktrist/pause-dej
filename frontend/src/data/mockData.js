// Données mockées pour le développement

export const categories = [
  { id: 'all', name: 'Tous', icon: '🍽️' },
  { id: 'entrees', name: 'Entrées', icon: '🥗' },
  { id: 'plats', name: 'Plats principaux', icon: '🍛' },
  { id: 'salades', name: 'Salades', icon: '🥙' },
  { id: 'burgers', name: 'Burgers', icon: '🍔' },
  { id: 'desserts', name: 'Desserts', icon: '🍰' },
  { id: 'boissons', name: 'Boissons', icon: '🥤' }
]

export const allDishes = [
  // Entrées
  {
    id: 1,
    name: 'Soupe Miso',
    description: 'Soupe japonaise traditionnelle, tofu soyeux, algues wakame, oignons verts',
    longDescription: 'Une soupe miso authentique préparée avec du miso blanc et rouge, du tofu soyeux, des algues wakame et des oignons verts. Un délice chaud et réconfortant qui réveillera vos papilles.',
    price: 5.90,
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&h=400&fit=crop',
    category: 'entrees',
    categoryLabel: 'Entrée',
    stock: 25,
    isPopular: false,
    allergens: ['Soja', 'Gluten'],
    nutritionInfo: { calories: 84, protein: 6, carbs: 8, fat: 3 },
    vegetarian: true,
    vegan: true
  },
  {
    id: 2,
    name: 'Houmous & Crudités',
    description: 'Houmous maison, légumes croquants de saison, pita grillé',
    longDescription: 'Notre houmous fait maison servi avec des bâtonnets de légumes frais et croquants (carottes, concombre, poivrons) et du pain pita grillé.',
    price: 6.50,
    image: 'https://images.unsplash.com/photo-1571558722275-d70ce7e9f300?w=500&h=400&fit=crop',
    category: 'entrees',
    categoryLabel: 'Entrée',
    stock: 20,
    isPopular: false,
    allergens: ['Sésame', 'Gluten'],
    nutritionInfo: { calories: 220, protein: 7, carbs: 22, fat: 12 },
    vegetarian: true,
    vegan: true
  },
  // Plats principaux
  {
    id: 3,
    name: 'Poke Bowl Saumon',
    description: 'Riz sushi, saumon frais, avocat, edamame, sauce soja',
    longDescription: 'Un poke bowl généreux avec du saumon frais de Norvège, riz sushi, avocat crémeux, edamame, concombre, radis, graines de sésame et notre sauce soja-sésame maison.',
    price: 12.90,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=400&fit=crop',
    category: 'plats',
    categoryLabel: 'Plat principal',
    stock: 15,
    isPopular: true,
    allergens: ['Poisson', 'Soja', 'Sésame'],
    nutritionInfo: { calories: 520, protein: 28, carbs: 54, fat: 18 },
    vegetarian: false,
    vegan: false
  },
  {
    id: 4,
    name: 'Burger Végétarien',
    description: 'Steak de légumes, cheddar, salade, tomate, sauce maison',
    longDescription: 'Un burger savoureux avec notre steak de légumes maison (betterave, haricots noirs, quinoa), cheddar affiné, salade croquante, tomate, oignons rouges et notre sauce barbecue végétarienne. Servi avec frites de patates douces.',
    price: 10.50,
    image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=500&h=400&fit=crop',
    category: 'burgers',
    categoryLabel: 'Burger',
    stock: 20,
    isPopular: true,
    allergens: ['Gluten', 'Lait', 'Soja'],
    nutritionInfo: { calories: 680, protein: 22, carbs: 78, fat: 28 },
    vegetarian: true,
    vegan: false
  },
  {
    id: 5,
    name: 'Pad Thaï Crevettes',
    description: 'Nouilles de riz, crevettes, cacahuètes, sauce tamarin',
    longDescription: 'Le classique thaïlandais ! Nouilles de riz sautées au wok, crevettes tigres, omelette, pousses de soja, ciboulette, cacahuètes grillées et notre sauce tamarin épicée.',
    price: 13.50,
    image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=500&h=400&fit=crop',
    category: 'plats',
    categoryLabel: 'Plat principal',
    stock: 10,
    isPopular: true,
    allergens: ['Crustacés', 'Arachides', 'Œuf', 'Soja'],
    nutritionInfo: { calories: 590, protein: 26, carbs: 72, fat: 20 },
    vegetarian: false,
    vegan: false
  },
  {
    id: 6,
    name: 'Tartare de Bœuf',
    description: 'Bœuf Label Rouge, câpres, cornichons, frites maison',
    longDescription: 'Tartare de bœuf Label Rouge haché minute, assaisonné avec câpres, cornichons, échalotes, moutarde à l\'ancienne, sauce Worcestershire. Servi avec frites maison et salade verte.',
    price: 14.90,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&h=400&fit=crop',
    category: 'plats',
    categoryLabel: 'Plat principal',
    stock: 8,
    isPopular: true,
    allergens: ['Moutarde', 'Œuf'],
    nutritionInfo: { calories: 620, protein: 38, carbs: 42, fat: 32 },
    vegetarian: false,
    vegan: false
  },
  {
    id: 7,
    name: 'Buddha Bowl',
    description: 'Quinoa, falafels, houmous, légumes grillés',
    longDescription: 'Bowl équilibré et coloré : quinoa bio, falafels croustillants, houmous crémeux, légumes grillés de saison, avocat, graines de courge, sauce tahini-citron.',
    price: 11.50,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=400&fit=crop',
    category: 'plats',
    categoryLabel: 'Plat principal',
    stock: 18,
    isPopular: true,
    allergens: ['Sésame', 'Gluten'],
    nutritionInfo: { calories: 520, protein: 16, carbs: 62, fat: 22 },
    vegetarian: true,
    vegan: true
  },
  // Salades
  {
    id: 8,
    name: 'Salade César',
    description: 'Poulet grillé, parmesan, croûtons, sauce César',
    longDescription: 'La grande classique ! Salade romaine croquante, poulet grillé mariné, copeaux de parmesan AOP, croûtons maison, œuf mollet et notre sauce César onctueuse.',
    price: 9.90,
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=500&h=400&fit=crop',
    category: 'salades',
    categoryLabel: 'Salade',
    stock: 12,
    isPopular: true,
    allergens: ['Lait', 'Gluten', 'Œuf', 'Poisson (anchois)'],
    nutritionInfo: { calories: 420, protein: 32, carbs: 18, fat: 24 },
    vegetarian: false,
    vegan: false
  },
  {
    id: 9,
    name: 'Salade Méditerranéenne',
    description: 'Feta, olives, tomates, concombre, vinaigrette citron',
    longDescription: 'Salade fraîche et ensoleillée : tomates cerises, concombre, poivrons, olives Kalamata, feta AOP, oignons rouges, persil frais, vinaigrette citron-huile d\'olive.',
    price: 8.90,
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500&h=400&fit=crop',
    category: 'salades',
    categoryLabel: 'Salade',
    stock: 15,
    isPopular: false,
    allergens: ['Lait'],
    nutritionInfo: { calories: 280, protein: 12, carbs: 14, fat: 20 },
    vegetarian: true,
    vegan: false
  },
  // Burgers
  {
    id: 10,
    name: 'Classic Cheeseburger',
    description: 'Bœuf 180g, cheddar, laitue, tomate, oignons, sauce burger',
    longDescription: 'Le burger classique parfait : steak de bœuf français 180g, cheddar fondu, laitue iceberg, tomate, oignons rouges, pickles, notre sauce burger signature. Avec frites.',
    price: 11.90,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=400&fit=crop',
    category: 'burgers',
    categoryLabel: 'Burger',
    stock: 22,
    isPopular: true,
    allergens: ['Gluten', 'Lait', 'Œuf', 'Moutarde'],
    nutritionInfo: { calories: 720, protein: 36, carbs: 58, fat: 38 },
    vegetarian: false,
    vegan: false
  },
  {
    id: 11,
    name: 'Chicken Burger',
    description: 'Poulet pané croustillant, coleslaw, sauce mayo-miel',
    longDescription: 'Burger gourmand avec blanc de poulet pané croustillant, coleslaw croquant, cheddar, bacon, sauce mayo-miel. Servi avec frites.',
    price: 10.90,
    image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=500&h=400&fit=crop',
    category: 'burgers',
    categoryLabel: 'Burger',
    stock: 18,
    isPopular: false,
    allergens: ['Gluten', 'Lait', 'Œuf'],
    nutritionInfo: { calories: 680, protein: 32, carbs: 62, fat: 34 },
    vegetarian: false,
    vegan: false
  },
  // Desserts
  {
    id: 12,
    name: 'Tiramisu Maison',
    description: 'Mascarpone, biscuits imbibés de café, cacao',
    longDescription: 'Notre tiramisu fait maison selon la recette traditionnelle : mascarpone onctueux, biscuits à la cuillère imbibés d\'espresso, saupoudré de cacao amer.',
    price: 5.50,
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&h=400&fit=crop',
    category: 'desserts',
    categoryLabel: 'Dessert',
    stock: 30,
    isPopular: true,
    allergens: ['Lait', 'Gluten', 'Œuf'],
    nutritionInfo: { calories: 380, protein: 8, carbs: 42, fat: 20 },
    vegetarian: true,
    vegan: false
  },
  {
    id: 13,
    name: 'Brownie Chocolat',
    description: 'Brownie fondant au chocolat noir, noix de pécan',
    longDescription: 'Brownie ultra-fondant au chocolat noir 70%, noix de pécan torréfiées, légèrement croustillant à l\'extérieur et coulant à l\'intérieur.',
    price: 4.90,
    image: 'https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=500&h=400&fit=crop',
    category: 'desserts',
    categoryLabel: 'Dessert',
    stock: 25,
    isPopular: false,
    allergens: ['Lait', 'Gluten', 'Œuf', 'Fruits à coque'],
    nutritionInfo: { calories: 420, protein: 6, carbs: 48, fat: 24 },
    vegetarian: true,
    vegan: false
  },
  // Boissons
  {
    id: 14,
    name: 'Jus Détox Vert',
    description: 'Pomme, concombre, céleri, citron, gingembre',
    longDescription: 'Jus pressé à froid riche en vitamines : pomme verte, concombre, céleri, citron vert, une pointe de gingembre frais. Désaltérant et revitalisant.',
    price: 4.50,
    image: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=500&h=400&fit=crop',
    category: 'boissons',
    categoryLabel: 'Boisson',
    stock: 40,
    isPopular: false,
    allergens: [],
    nutritionInfo: { calories: 85, protein: 1, carbs: 20, fat: 0 },
    vegetarian: true,
    vegan: true
  },
  {
    id: 15,
    name: 'Smoothie Fruits Rouges',
    description: 'Fraises, framboises, myrtilles, banane, lait d\'amande',
    longDescription: 'Smoothie onctueux aux fruits rouges : fraises, framboises, myrtilles, banane, lait d\'amande bio. Sans sucre ajouté, naturellement doux.',
    price: 5.20,
    image: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=500&h=400&fit=crop',
    category: 'boissons',
    categoryLabel: 'Boisson',
    stock: 35,
    isPopular: true,
    allergens: ['Fruits à coque'],
    nutritionInfo: { calories: 180, protein: 3, carbs: 38, fat: 2 },
    vegetarian: true,
    vegan: true
  }
]

export const popularDishes = allDishes.filter(dish => dish.isPopular)

export const getDishById = (id) => {
  return allDishes.find(dish => dish.id === parseInt(id))
}

export const getDishesByCategory = (categoryId) => {
  if (categoryId === 'all') return allDishes
  return allDishes.filter(dish => dish.category === categoryId)
}

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
    comment: 'Gain de temps incroyable ! Je commande en 2 clics et je reçois mon repas frais le lendemain matin.',
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
