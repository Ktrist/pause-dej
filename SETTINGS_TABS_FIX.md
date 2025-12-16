# Correction des Onglets - Page Paramètres

## Problème Identifié

Les TabPanel (Général, Livraison, Paiement, Maintenance) s'affichaient tous dans l'onglet "Général" au lieu d'avoir chacun leur propre onglet séparé.

**Cause** : Les TabPanel admin étaient tous enveloppés dans un seul bloc `{isAdmin && <> ... </>}`, ce qui causait un problème d'indexation avec Chakra UI Tabs.

## Solution Appliquée

Au lieu d'envelopper tous les TabPanel admin dans un seul bloc conditionnel, chaque TabPanel est maintenant individuellement conditionné :

### Avant (Incorrect)
```jsx
{isAdmin && (
  <>
    <TabPanel>General</TabPanel>
    <TabPanel>Delivery</TabPanel>
    <TabPanel>Payment</TabPanel>
    <TabPanel>Maintenance</TabPanel>
  </>
)}
```

### Après (Correct)
```jsx
{/* General Settings - Admin Only */}
{isAdmin && (
  <TabPanel>General content</TabPanel>
)}

{/* Delivery Settings - Admin Only */}
{isAdmin && (
  <TabPanel>Delivery content</TabPanel>
)}

{/* Payment Settings - Admin Only */}
{isAdmin && (
  <TabPanel>Payment content</TabPanel>
)}

{/* Maintenance Settings - Admin Only */}
{isAdmin && (
  <TabPanel>Maintenance content</TabPanel>
)}
```

## Structure Finale des Onglets

### Pour les Utilisateurs (role = "user")

**2 onglets visibles** :

1. **Mon Profil**
   - Informations personnelles (nom, email, téléphone)
   - Lien vers préférences alimentaires

2. **Notifications**
   - Notifications par email
   - Notifications mes commandes

### Pour les Administrateurs (role = "admin")

**6 onglets visibles** :

1. **Mon Profil**
   - Informations personnelles (nom, email, téléphone)
   - Lien vers préférences alimentaires

2. **Notifications**
   - Notifications par email
   - Notifications mes commandes
   - Alertes de stock (Admin uniquement)
   - Nouveaux avis (Admin uniquement)

3. **Général** (Admin uniquement)
   - Informations du site (nom, email, téléphone, adresse)
   - Horaires d'ouverture
   - Créneaux de livraison (midi et soir)

4. **Livraison** (Admin uniquement)
   - Seuil de livraison gratuite (30€)
   - Frais par zone :
     - Annecy (74000): 3.50€
     - Annecy-le-Vieux (74940): 3.50€
     - Argonay (74370): 4.00€

5. **Paiement** (Admin uniquement)
   - Stripe (actif)
   - Apple Pay (désactivé)
   - Google Pay (désactivé)

6. **Maintenance** (Admin uniquement)
   - Mode maintenance (on/off)
   - Message de maintenance personnalisé

## Comportement Vérifié

### Utilisateur Normal (role = "user")
✅ Voit uniquement 2 onglets : "Mon Profil" et "Notifications"
✅ Ne voit pas les onglets admin (Général, Livraison, Paiement, Maintenance)
✅ Titre : "Mes Paramètres"

### Administrateur (role = "admin")
✅ Voit tous les 6 onglets
✅ Chaque onglet affiche son contenu correct
✅ Onglet "Général" affiche uniquement les infos du site
✅ Onglet "Livraison" affiche uniquement les paramètres de livraison
✅ Onglet "Paiement" affiche uniquement les méthodes de paiement
✅ Onglet "Maintenance" affiche uniquement le mode maintenance
✅ Titre : "Paramètres"

## Test de Validation

Pour tester :

1. **Créer un compte utilisateur normal**
   ```sql
   -- Vérifier le role dans Supabase
   SELECT id, email, role FROM profiles WHERE email = 'user@test.com';
   -- Devrait avoir role = 'user'
   ```

2. **Se connecter et aller sur `/admin/settings`**
   - Doit voir 2 onglets seulement
   - Mon Profil et Notifications

3. **Créer/utiliser un compte admin**
   ```sql
   -- Mettre à jour le role en admin
   UPDATE profiles SET role = 'admin' WHERE email = 'admin@test.com';
   ```

4. **Se connecter comme admin et aller sur `/admin/settings`**
   - Doit voir 6 onglets
   - Cliquer sur chaque onglet doit afficher le bon contenu
   - "Général" ne doit PAS contenir Livraison/Paiement/Maintenance

## Fichier Modifié

- `frontend/src/pages/admin/AdminSettings.jsx`

## Statut

✅ **Problème résolu**
- Chaque TabPanel s'affiche dans son propre onglet
- Séparation correcte User/Admin
- Navigation fluide entre les onglets

## Notes Techniques

**Chakra UI Tabs** fonctionne par index :
- Tab 0 → TabPanel 0
- Tab 1 → TabPanel 1
- Tab 2 → TabPanel 2
- etc.

En enveloppant plusieurs TabPanel dans un seul bloc conditionnel, on créait un décalage d'index qui causait le problème d'affichage. La solution est de conditionner chaque TabPanel individuellement pour maintenir la correspondance correcte entre Tab et TabPanel.
