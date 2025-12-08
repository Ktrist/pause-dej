-- =====================================================
-- PAUSE DEJ' - SEED DATA: DISHES
-- =====================================================
-- Importation des 15 plats mockés dans Supabase
-- Version: 1.0
-- Date: 2025-12-08
-- =====================================================

-- Récupérer les IDs des catégories
DO $$
DECLARE
  entrees_id UUID;
  plats_id UUID;
  salades_id UUID;
  burgers_id UUID;
  desserts_id UUID;
  boissons_id UUID;
BEGIN
  -- Obtenir les IDs des catégories
  SELECT id INTO entrees_id FROM categories WHERE slug = 'entrees';
  SELECT id INTO plats_id FROM categories WHERE slug = 'plats';
  SELECT id INTO salades_id FROM categories WHERE slug = 'salades';
  SELECT id INTO burgers_id FROM categories WHERE slug = 'bowls'; -- Note: pas de catégorie "burgers" dans schema, utiliser "bowls" ou créer
  SELECT id INTO desserts_id FROM categories WHERE slug = 'desserts';
  SELECT id INTO boissons_id FROM categories WHERE slug = 'boissons';

  -- Créer la catégorie Burgers si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'burgers') THEN
    INSERT INTO categories (name, slug, display_order)
    VALUES ('Burgers', 'burgers', 4)
    RETURNING id INTO burgers_id;
  END IF;

  -- Créer la catégorie Salades si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'salades') THEN
    INSERT INTO categories (name, slug, display_order)
    VALUES ('Salades', 'salades', 5)
    RETURNING id INTO salades_id;
  END IF;

  -- Vider la table dishes (optionnel - décommenter si vous voulez repartir de zéro)
  -- DELETE FROM dishes;

  -- Insérer les 15 plats
  INSERT INTO dishes (
    name,
    slug,
    description,
    long_description,
    price,
    image_url,
    category_id,
    stock,
    is_available,
    is_popular,
    allergens,
    calories,
    protein,
    carbs,
    fat,
    is_vegetarian,
    is_vegan
  ) VALUES

  -- ENTRÉES (2 plats)
  (
    'Soupe Miso',
    'soupe-miso',
    'Soupe japonaise traditionnelle, tofu soyeux, algues wakame, oignons verts',
    'Une soupe miso authentique préparée avec du miso blanc et rouge, du tofu soyeux, des algues wakame et des oignons verts. Un délice chaud et réconfortant qui réveillera vos papilles.',
    5.90,
    'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&h=400&fit=crop',
    entrees_id,
    25,
    true,
    false,
    ARRAY['Soja', 'Gluten'],
    84,
    6,
    8,
    3,
    true,
    true
  ),
  (
    'Houmous & Crudités',
    'houmous-crudites',
    'Houmous maison, légumes croquants de saison, pita grillé',
    'Notre houmous fait maison servi avec des bâtonnets de légumes frais et croquants (carottes, concombre, poivrons) et du pain pita grillé.',
    6.50,
    'https://images.unsplash.com/photo-1571558722275-d70ce7e9f300?w=500&h=400&fit=crop',
    entrees_id,
    20,
    true,
    false,
    ARRAY['Sésame', 'Gluten'],
    220,
    7,
    22,
    12,
    true,
    true
  ),

  -- PLATS PRINCIPAUX (5 plats)
  (
    'Poke Bowl Saumon',
    'poke-bowl-saumon',
    'Riz sushi, saumon frais, avocat, edamame, sauce soja',
    'Un poke bowl généreux avec du saumon frais de Norvège, riz sushi, avocat crémeux, edamame, concombre, radis, graines de sésame et notre sauce soja-sésame maison.',
    12.90,
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=400&fit=crop',
    plats_id,
    15,
    true,
    true,
    ARRAY['Poisson', 'Soja', 'Sésame'],
    520,
    28,
    54,
    18,
    false,
    false
  ),
  (
    'Pad Thaï Crevettes',
    'pad-thai-crevettes',
    'Nouilles de riz, crevettes, cacahuètes, sauce tamarin',
    'Le classique thaïlandais ! Nouilles de riz sautées au wok, crevettes tigres, omelette, pousses de soja, ciboulette, cacahuètes grillées et notre sauce tamarin épicée.',
    13.50,
    'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=500&h=400&fit=crop',
    plats_id,
    10,
    true,
    true,
    ARRAY['Crustacés', 'Arachides', 'Œuf', 'Soja'],
    590,
    26,
    72,
    20,
    false,
    false
  ),
  (
    'Tartare de Bœuf',
    'tartare-boeuf',
    'Bœuf Label Rouge, câpres, cornichons, frites maison',
    'Tartare de bœuf Label Rouge haché minute, assaisonné avec câpres, cornichons, échalotes, moutarde à l''ancienne, sauce Worcestershire. Servi avec frites maison et salade verte.',
    14.90,
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&h=400&fit=crop',
    plats_id,
    8,
    true,
    true,
    ARRAY['Moutarde', 'Œuf'],
    620,
    38,
    42,
    32,
    false,
    false
  ),
  (
    'Buddha Bowl',
    'buddha-bowl',
    'Quinoa, falafels, houmous, légumes grillés',
    'Bowl équilibré et coloré : quinoa bio, falafels croustillants, houmous crémeux, légumes grillés de saison, avocat, graines de courge, sauce tahini-citron.',
    11.50,
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=400&fit=crop',
    plats_id,
    18,
    true,
    true,
    ARRAY['Sésame', 'Gluten'],
    520,
    16,
    62,
    22,
    true,
    true
  ),

  -- SALADES (2 plats)
  (
    'Salade César',
    'salade-cesar',
    'Poulet grillé, parmesan, croûtons, sauce César',
    'La grande classique ! Salade romaine croquante, poulet grillé mariné, copeaux de parmesan AOP, croûtons maison, œuf mollet et notre sauce César onctueuse.',
    9.90,
    'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=500&h=400&fit=crop',
    salades_id,
    12,
    true,
    true,
    ARRAY['Lait', 'Gluten', 'Œuf', 'Poisson (anchois)'],
    420,
    32,
    18,
    24,
    false,
    false
  ),
  (
    'Salade Méditerranéenne',
    'salade-mediterraneenne',
    'Feta, olives, tomates, concombre, vinaigrette citron',
    'Salade fraîche et ensoleillée : tomates cerises, concombre, poivrons, olives Kalamata, feta AOP, oignons rouges, persil frais, vinaigrette citron-huile d''olive.',
    8.90,
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500&h=400&fit=crop',
    salades_id,
    15,
    true,
    false,
    ARRAY['Lait'],
    280,
    12,
    14,
    20,
    true,
    false
  ),

  -- BURGERS (3 plats)
  (
    'Burger Végétarien',
    'burger-vegetarien',
    'Steak de légumes, cheddar, salade, tomate, sauce maison',
    'Un burger savoureux avec notre steak de légumes maison (betterave, haricots noirs, quinoa), cheddar affiné, salade croquante, tomate, oignons rouges et notre sauce barbecue végétarienne. Servi avec frites de patates douces.',
    10.50,
    'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=500&h=400&fit=crop',
    burgers_id,
    20,
    true,
    true,
    ARRAY['Gluten', 'Lait', 'Soja'],
    680,
    22,
    78,
    28,
    true,
    false
  ),
  (
    'Classic Cheeseburger',
    'classic-cheeseburger',
    'Bœuf 180g, cheddar, laitue, tomate, oignons, sauce burger',
    'Le burger classique parfait : steak de bœuf français 180g, cheddar fondu, laitue iceberg, tomate, oignons rouges, pickles, notre sauce burger signature. Avec frites.',
    11.90,
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=400&fit=crop',
    burgers_id,
    22,
    true,
    true,
    ARRAY['Gluten', 'Lait', 'Œuf', 'Moutarde'],
    720,
    36,
    58,
    38,
    false,
    false
  ),
  (
    'Chicken Burger',
    'chicken-burger',
    'Poulet pané croustillant, coleslaw, sauce mayo-miel',
    'Burger gourmand avec blanc de poulet pané croustillant, coleslaw croquant, cheddar, bacon, sauce mayo-miel. Servi avec frites.',
    10.90,
    'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=500&h=400&fit=crop',
    burgers_id,
    18,
    true,
    false,
    ARRAY['Gluten', 'Lait', 'Œuf'],
    680,
    32,
    62,
    34,
    false,
    false
  ),

  -- DESSERTS (2 plats)
  (
    'Tiramisu Maison',
    'tiramisu-maison',
    'Mascarpone, biscuits imbibés de café, cacao',
    'Notre tiramisu fait maison selon la recette traditionnelle : mascarpone onctueux, biscuits à la cuillère imbibés d''espresso, saupoudré de cacao amer.',
    5.50,
    'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&h=400&fit=crop',
    desserts_id,
    30,
    true,
    true,
    ARRAY['Lait', 'Gluten', 'Œuf'],
    380,
    8,
    42,
    20,
    true,
    false
  ),
  (
    'Brownie Chocolat',
    'brownie-chocolat',
    'Brownie fondant au chocolat noir, noix de pécan',
    'Brownie ultra-fondant au chocolat noir 70%, noix de pécan torréfiées, légèrement croustillant à l''extérieur et coulant à l''intérieur.',
    4.90,
    'https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=500&h=400&fit=crop',
    desserts_id,
    25,
    true,
    false,
    ARRAY['Lait', 'Gluten', 'Œuf', 'Fruits à coque'],
    420,
    6,
    48,
    24,
    true,
    false
  ),

  -- BOISSONS (2 plats)
  (
    'Jus Détox Vert',
    'jus-detox-vert',
    'Pomme, concombre, céleri, citron, gingembre',
    'Jus pressé à froid riche en vitamines : pomme verte, concombre, céleri, citron vert, une pointe de gingembre frais. Désaltérant et revitalisant.',
    4.50,
    'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=500&h=400&fit=crop',
    boissons_id,
    40,
    true,
    false,
    ARRAY[]::TEXT[],
    85,
    1,
    20,
    0,
    true,
    true
  ),
  (
    'Smoothie Fruits Rouges',
    'smoothie-fruits-rouges',
    'Fraises, framboises, myrtilles, banane, lait d''amande',
    'Smoothie onctueux aux fruits rouges : fraises, framboises, myrtilles, banane, lait d''amande bio. Sans sucre ajouté, naturellement doux.',
    5.20,
    'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=500&h=400&fit=crop',
    boissons_id,
    35,
    true,
    true,
    ARRAY['Fruits à coque'],
    180,
    3,
    38,
    2,
    true,
    true
  );

  -- Afficher un message de succès
  RAISE NOTICE '✅ 15 plats importés avec succès !';
  RAISE NOTICE '📊 Répartition:';
  RAISE NOTICE '   - 2 Entrées';
  RAISE NOTICE '   - 5 Plats principaux';
  RAISE NOTICE '   - 2 Salades';
  RAISE NOTICE '   - 3 Burgers';
  RAISE NOTICE '   - 2 Desserts';
  RAISE NOTICE '   - 2 Boissons';
  RAISE NOTICE '🌟 8 plats populaires marqués';

END $$;

-- Afficher le résultat
SELECT
  c.name AS categorie,
  COUNT(*) AS nombre_plats,
  COUNT(*) FILTER (WHERE d.is_popular) AS plats_populaires
FROM dishes d
JOIN categories c ON d.category_id = c.id
GROUP BY c.name
ORDER BY c.display_order;
