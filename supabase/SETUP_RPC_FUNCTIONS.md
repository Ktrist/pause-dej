# 🔧 Configuration des Fonctions RPC Supabase

Ce guide explique comment configurer les fonctions RPC (Remote Procedure Call) nécessaires pour l'application Pause Dej'.

## 📋 Prérequis

- Compte Supabase configuré
- Tables `promo_codes` déjà créées (via schema.sql)

---

## 🚀 Installation

### Étape 1 : Accéder à l'éditeur SQL

1. Connectez-vous à votre projet Supabase (https://supabase.com/dashboard)
2. Dans le menu de gauche, cliquez sur **"SQL Editor"**
3. Cliquez sur **"New query"** pour créer une nouvelle requête

### Étape 2 : Exécuter les fonctions RPC

1. Copiez **tout le contenu** du fichier `rpc_functions.sql`
2. Collez-le dans l'éditeur SQL
3. Cliquez sur **"Run"** (ou appuyez sur `Ctrl+Enter` / `Cmd+Enter`)

### Étape 3 : Vérifier l'installation

Pour vérifier que la fonction a été créée correctement :

```sql
-- Liste toutes les fonctions
SELECT proname, prosrc
FROM pg_proc
WHERE proname = 'increment_promo_code_usage';
```

Vous devriez voir la fonction listée.

---

## 📝 Fonctions Disponibles

### `increment_promo_code_usage(promo_id UUID)`

**Description** : Incrémente le compteur d'utilisation d'un code promo

**Paramètres** :
- `promo_id` (UUID) : L'ID du code promo à incrémenter

**Utilisation dans l'application** :
Cette fonction est appelée automatiquement lors de la création d'une commande avec un code promo appliqué.

**Exemple de test manuel** :
```sql
-- Remplacez 'your-promo-id-here' par un vrai UUID de code promo
SELECT increment_promo_code_usage('your-promo-id-here');

-- Vérifier que le compteur a été incrémenté
SELECT code, usage_count FROM promo_codes WHERE id = 'your-promo-id-here';
```

---

## ✅ Vérification

Après installation, testez que tout fonctionne :

1. Créez un code promo de test dans votre application
2. Passez une commande en utilisant ce code
3. Vérifiez que `usage_count` a été incrémenté :

```sql
SELECT code, usage_count, usage_limit
FROM promo_codes
WHERE code = 'VOTRE-CODE';
```

---

## 🔒 Sécurité

- Les fonctions utilisent `SECURITY DEFINER` pour s'exécuter avec les privilèges du créateur
- Seuls les utilisateurs authentifiés peuvent exécuter ces fonctions
- Les RLS policies sur la table `promo_codes` continuent de s'appliquer

---

## 🐛 Dépannage

### Erreur : "function does not exist"

**Solution** : Vérifiez que vous avez bien exécuté le script `rpc_functions.sql` dans l'éditeur SQL.

### Erreur : "permission denied"

**Solution** : Assurez-vous d'être connecté en tant qu'utilisateur avec les bons privilèges. Essayez de vous reconnecter à Supabase.

### Le compteur n'augmente pas

**Solution** :
1. Vérifiez les logs Supabase pour voir s'il y a des erreurs
2. Testez manuellement la fonction avec la requête SQL ci-dessus
3. Vérifiez que le `promo_code_id` est bien passé lors de la création de la commande

---

## 📚 Ressources

- [Documentation Supabase Functions](https://supabase.com/docs/guides/database/functions)
- [PostgreSQL PL/pgSQL](https://www.postgresql.org/docs/current/plpgsql.html)

---

**Note** : Ces fonctions sont essentielles pour le bon fonctionnement des codes promo dans l'application. Assurez-vous de les configurer avant de tester le système de codes promo.
