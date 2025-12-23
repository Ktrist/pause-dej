-- Simply delete existing invalid rows and re-insert sample data
DELETE FROM business_pricing_tiers WHERE price_per_person IS NULL OR tier_name IS NULL;

-- Re-insert sample data
INSERT INTO business_pricing_tiers (tier_name, tier_description, price_per_person, min_employees, max_employees, features, discount_rate, free_delivery, is_active, display_order)
VALUES
    (
        'Starter',
        'Parfait pour les petites équipes qui démarrent',
        8.50,
        5,
        20,
        '["Livraison offerte dès 30€", "Support client prioritaire", "Facturation mensuelle"]'::jsonb,
        5.0,
        false,
        true,
        1
    ),
    (
        'Professional',
        'Idéal pour les équipes en croissance',
        7.50,
        21,
        50,
        '["Livraison offerte dès 30€", "Support client dédié", "Budgets individuels personnalisables", "Facturation mensuelle", "Remise de 10%"]'::jsonb,
        10.0,
        true,
        true,
        2
    ),
    (
        'Enterprise',
        'Pour les grandes organisations',
        6.50,
        51,
        NULL,
        '["Livraison toujours offerte", "Account manager dédié", "Budgets personnalisés par employé", "Facturation flexible", "Remise de 15%", "Menus personnalisés"]'::jsonb,
        15.0,
        true,
        true,
        3
    )
ON CONFLICT DO NOTHING;
