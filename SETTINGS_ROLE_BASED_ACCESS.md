# Contrôle d'Accès Basé sur les Rôles - Page Paramètres

## Modifications Apportées

La page `/admin/settings` a été mise à jour pour afficher différentes sections selon le rôle de l'utilisateur.

## Structure des Onglets

### Pour les Utilisateurs Normaux (role = "user")

Les utilisateurs normaux ont accès à **2 onglets uniquement** :

#### 1. Mon Profil
- **Informations personnelles**:
  - Nom complet (modifiable)
  - Email (lecture seule, non modifiable)
  - Téléphone (modifiable)

- **Préférences alimentaires**:
  - Lien vers la page compte utilisateur (`/compte?tab=preferences`)
  - Bouton "Gérer mes préférences"

#### 2. Notifications
- **Notifications par email** : Activer/désactiver les emails importants
- **Mes commandes** : Notifications sur l'état des commandes

### Pour les Administrateurs (role = "admin")

Les administrateurs ont accès à **6 onglets** :

#### 1. Mon Profil
(Identique aux utilisateurs normaux)

#### 2. Notifications
- **Notifications par email** : Emails importants
- **Mes commandes** : État des commandes
- **Alertes de stock** : Notifications stocks faibles (Admin uniquement)
- **Nouveaux avis** : Notifications nouveaux avis clients (Admin uniquement)

#### 3. Général (Admin uniquement)
- **Informations du site**:
  - Nom du site
  - Email de contact
  - Téléphone
  - Adresse

- **Horaires d'ouverture**:
  - Ouverture/Fermeture
  - Créneaux de livraison (Midi: 11h-14h, Soir: 18h-21h)

#### 4. Livraison (Admin uniquement)
- **Seuil de livraison gratuite** : 30€
- **Frais de livraison par zone**:
  - Annecy (74000): 3.50€
  - Annecy-le-Vieux (74940): 3.50€
  - Argonay (74370): 4.00€

#### 5. Paiement (Admin uniquement)
- **Stripe** : Actif (paiement par carte)
- **Apple Pay** : Désactivé (bientôt disponible)
- **Google Pay** : Désactivé (bientôt disponible)

#### 6. Maintenance (Admin uniquement)
- **Mode maintenance** : Activer/désactiver
- **Message de maintenance** : Message personnalisé affiché aux utilisateurs

## Code Implémenté

### Vérification du Rôle
```javascript
import { useAuth } from '../../context/AuthContext'

const { profile } = useAuth()
const isAdmin = profile?.role === 'admin'
```

### Affichage Conditionnel des Onglets
```javascript
<TabList>
  {/* Onglets visibles pour tous */}
  <Tab>Mon Profil</Tab>
  <Tab>Notifications</Tab>

  {/* Onglets admin uniquement */}
  {isAdmin && (
    <>
      <Tab>Général</Tab>
      <Tab>Livraison</Tab>
      <Tab>Paiement</Tab>
      <Tab>Maintenance</Tab>
    </>
  )}
</TabList>
```

### Notifications Conditionnelles
```javascript
{/* Notifications utilisateur */}
<Switch>Mes commandes</Switch>

{/* Notifications admin uniquement */}
{isAdmin && (
  <>
    <Switch>Alertes de stock (Admin)</Switch>
    <Switch>Nouveaux avis (Admin)</Switch>
  </>
)}
```

## Comportement

1. **Utilisateur normal se connecte** :
   - Voit "Mes Paramètres" comme titre
   - Accès à 2 onglets : Mon Profil, Notifications
   - Peut modifier ses informations personnelles
   - Peut gérer ses notifications de commandes

2. **Administrateur se connecte** :
   - Voit "Paramètres" comme titre
   - Accès à 6 onglets complets
   - Peut modifier toutes les informations du site
   - Peut gérer les zones de livraison, paiements, maintenance

3. **Sécurité** :
   - Les onglets admin ne s'affichent pas pour les utilisateurs normaux
   - Le contrôle est basé sur `profile.role` depuis AuthContext
   - Authentification requise pour accéder à `/admin/settings`

## URL d'Accès

- **URL** : `http://localhost:5175/admin/settings`
- **Authentification** : Requise
- **Navigation** :
  - Sidebar admin : Lien "Paramètres"
  - Menu utilisateur : (peut être ajouté si besoin)

## Fichier Modifié

- `frontend/src/pages/admin/AdminSettings.jsx`

## Avantages

✅ **Séparation claire des responsabilités**
- Utilisateurs : gèrent leur profil et notifications
- Admins : contrôle total du site

✅ **Interface adaptée au rôle**
- Pas de confusion pour les utilisateurs normaux
- Toutes les options pour les admins

✅ **Sécurité renforcée**
- Affichage conditionnel côté client
- (TODO: Ajouter validation côté serveur pour sauvegardes)

✅ **Expérience utilisateur optimisée**
- Titre adapté au rôle
- Onglets pertinents seulement
- Indications claires (badges "Admin")

## Prochaines Étapes

1. **Backend** : Implémenter la sauvegarde réelle des paramètres en base
2. **Validation** : Ajouter validation côté serveur pour les modifications admin
3. **Permissions** : Créer une table de permissions pour gérer plus finement les accès
4. **Audit** : Logger les modifications de paramètres par les admins
