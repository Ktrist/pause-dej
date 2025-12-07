# Backlog Produit - Pause Dej'

> **Note pour l'IA (Claude Code) :**
> Ce document est la source de vérité pour les spécifications fonctionnelles.
> Chaque ticket est identifié par un ID unique (ex: M1.1).
> Avant d'implémenter une fonctionnalité, réfère-toi toujours aux critères d'acceptance et aux dépendances listés ici.

---

## 📱 Mobile App (React Native / Expo)

| ID | Epic | Titre | Priorité | Est. | User Story (As/Want/So That) | Critères d'acceptance & Tech | Dépendances |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **M1.1** | Authentification | Onboarding au premier lancement | 🔴 Critique | M | **En tant que** utilisateur nouveau **je veux** voir un onboarding **afin de** comprendre le concept | Slides swipe horizontal, Btn Passer, Btn Commencer. Stockage local (AsyncStorage) pour ne plus afficher. | Aucune |
| **M1.2** | Authentification | Inscription email/mot de passe | 🔴 Critique | M | **En tant que** utilisateur **je veux** m'inscrire avec email **afin de** créer un compte | Formulaire (Nom, Email, Tel, Pass). Validation temps réel. Email confirm. Auto-login. | M1.1 |
| **M1.3** | Authentification | Connexion avec Apple/Google | 🟡 Important | L | **En tant que** utilisateur **je veux** me connecter via social **afin de** gagner du temps | Modal Apple/Google, Création profil auto, Link si email existe déjà. | M1.2 |
| **M1.4** | Authentification | Session persistante & biométrie | 🔴 Critique | S | **En tant que** utilisateur **je veux** rester connecté (TouchID) **afin de** accéder vite | Session Supabase persistante. Auth biométrique au lancement. Fallback password. | M1.2/1.3 |
| **M1.5** | Authentification | Réinitialisation mot de passe | 🔴 Critique | S | **En tant que** utilisateur **je veux** reset mon mdp **afin de** récupérer l'accès | Lien "Oublié", Email avec lien/token, Deep link app, Form nouveau mdp. | Service Email |
| **M2.1** | Navigation | Bottom tab bar navigation | 🔴 Critique | S | **En tant que** utilisateur **je veux** une nav bar **afin de** naviguer facilement | 4 onglets (Accueil, Catalogue, Panier, Compte). Badge panier. Sticky. | Écrans créés |
| **M2.2** | Navigation | Splash screen | 🔴 Critique | XS | **En tant que** utilisateur **je veux** un splash screen **afin de** attendre agréablement | Logo centré, Animation fade/scale. Loader si >3s. | Assets |
| **M2.3** | UX | Animations & gestures | 🟡 Important | M | **En tant que** utilisateur **je veux** fluidité **afin de** expérience native | Transitions page, Swipe back iOS, Micro-interactions. Lib: reanimated. | React-Native |
| **M3.1** | Accueil | Plats du jour en carousel | 🔴 Critique | M | **En tant que** utilisateur **je veux** voir les plats du jour **afin de** choisir vite | Carousel 5-10 plats. Photo, Nom, Prix, Stock. Tap=Détails, Btn +=Ajout. | API Plats |
| **M3.2** | Accueil | Zone de livraison et créneau | 🔴 Critique | S | **En tant que** utilisateur **je veux** voir ma zone/créneau **afin de** savoir quand je reçois | Header adresse. Btn changer. Affichage prochain créneau. | M2.1 |
| **M3.3** | Accueil | Catégories rapides | 🔴 Critique | S | **En tant que** utilisateur **je veux** accès catégories **afin de** filtrer vite | Grid 2x3 icons. Tap = filtre catalogue. Scroll horiz si >6. | M2.1 |
| **M3.4** | Accueil | Promotions du jour | 🟡 Important | XS | **En tant que** utilisateur **je veux** voir les promos **afin de** économiser | Bannière haut/milieu. Code visible. Badge %. | Aucune |
| **M4.1** | Catalogue | Liste verticale de plats | 🔴 Critique | M | **En tant que** utilisateur **je veux** scroller les plats **afin de** tout voir | Liste cards verticales. Photo large. Nom, prix, desc courte. Badge stock. | API Cat. |
| **M4.2** | Catalogue | Filtres par catégorie | 🔴 Critique | S | **En tant que** utilisateur **je veux** filtrer par chips **afin de** trouver vite | Chips horizontaux (Tous, Entrées, etc.). Scrollable. Actif surligné. | M4.1 |
| **M4.3** | Catalogue | Détails plat en modal | 🔴 Critique | M | **En tant que** utilisateur **je veux** voir détails **afin de** vérifier allergènes | Modal Bottom Sheet. Photo, Desc complète, Nutri, Allergènes. Btn Sticky. | M4.1 |
| **M4.4** | Catalogue | Ajout rapide au panier | 🔴 Critique | S | **En tant que** utilisateur **je veux** ajouter direct **afin de** gagner du temps | Btn + sur cards. Anim ajout. Haptic feedback. Badge panier update. | M4.1 |
| **M4.5** | Catalogue | Recherche de plats | 🟡 Important | M | **En tant que** utilisateur **je veux** rechercher **afin de** trouver un plat précis | Barre recherche top. Temps réel. Suggestions. Highlight résultats. | M4.1 |
| **M5.1** | Panier | Liste des items | 🔴 Critique | M | **En tant que** utilisateur **je veux** voir mon panier **afin de** vérifier commande | Liste items (mini photo, nom, px, qté). Swipe left delete. | Context Panier |
| **M5.2** | Panier | Ajuster quantités | 🔴 Critique | S | **En tant que** utilisateur **je veux** changer qté **afin de** ajuster | Stepper +/-. Update total instantané. | M5.1 |
| **M5.3** | Panier | Récapitulatif coûts | 🔴 Critique | S | **En tant que** utilisateur **je veux** voir total **afin de** savoir ce que je paie | Sous-total, Livraison, Réduction, Total gras. | M5.1 |
| **M5.4** | Panier | Code promo | 🟡 Important | M | **En tant que** utilisateur **je veux** mettre un code **afin de** réduire prix | Input code. Valid temps réel. Message succès/erreur. | M5.3 |
| **M5.5** | Panier | Bouton commander | 🔴 Critique | XS | **En tant que** utilisateur **je veux** bouton final **afin de** passer au paiement | Sticky bottom. Disabled si vide. Nav vers Checkout. | M5.1 |
| **M6.1** | Checkout | Choix adresse livraison | 🔴 Critique | M | **En tant que** utilisateur **je veux** choisir adresse **afin de** être livré au bon endroit | Liste adresses enregistrées. Btn nouvelle adresse. Valid zone. | Profil |
| **M6.2** | Checkout | Choix créneau horaire | 🔴 Critique | M | **En tant que** utilisateur **je veux** choisir créneau **afin de** planifier | Liste créneaux Today/Tomorrow. Indication "Complet". | API Créneaux |
| **M6.3** | Checkout | Apple Pay / Google Pay | 🔴 Critique | L | **En tant que** utilisateur **je veux** payer natif **afin de** aller très vite | Btn Pay natif. Confirmation OS. One-tap. | Stripe SDK |
| **M6.4** | Checkout | Paiement carte bancaire | 🔴 Critique | M | **En tant que** utilisateur **je veux** payer CB **afin de** alternative | Form Stripe Elements. Save card option. | Stripe |
| **M6.5** | Checkout | Confirmation commande | 🔴 Critique | S | **En tant que** utilisateur **je veux** récap final **afin de** valider | Écran récap complet. Btn "Payer X€". Page succès avec ID. | M6.1-4 |
| **M7.1** | Suivi | Statut en temps réel | 🟡 Important | M | **En tant que** utilisateur **je veux** suivre statut **afin de** savoir où ça en est | Statuts: Confirmée > Prépa > En route > Livrée. Barre progression. | API Cmd |
| **M7.2** | Suivi | Notifications push | 🟡 Important | M | **En tant que** utilisateur **je veux** notifs **afin de** être alerté | Push aux changements de statuts. | FCM |
| **M7.3** | Suivi | Contact support | 🟡 Important | S | **En tant que** utilisateur **je veux** aide **afin de** résoudre pb | Btn "Besoin d'aide". Chat ou Tel. | M7.1 |
| **M8.1** | Compte | Informations personnelles | 🔴 Critique | M | **En tant que** utilisateur **je veux** gérer profil **afin de** garder infos à jour | Nom, Email, Tel. Photo (opt). Mode édition. | Auth |
| **M8.2** | Compte | Gestion adresses | 🔴 Critique | M | **En tant que** utilisateur **je veux** CRUD adresses **afin de** gérer lieux | Liste, Add, Edit, Delete, Default. | M8.1 |
| **M8.3** | Compte | Historique commandes | 🔴 Critique | M | **En tant que** utilisateur **je veux** voir historique **afin de** retrouver plats | Liste chrono. Tap détails. Btn "Recommander". | API Cmd |
| **M8.4** | Compte | Moyens de paiement | 🔴 Critique | S | **En tant que** utilisateur **je veux** gérer CB **afin de** payer vite | Liste cartes save. Delete. Default. | Stripe |
| **M8.5** | Compte | Déconnexion | 🔴 Critique | XS | **En tant que** utilisateur **je veux** logout **afin de** sécurité | Btn Logout. Confirm. Retour Login. | M8.1 |
| **M9.1** | Favoris | Plats favoris | 🟢 Nice-to-have | M | **En tant que** utilisateur **je veux** liker plats **afin de** retrouver vite | Icon cœur. Liste favoris dans compte. | M8.1 |
| **M9.2** | Préférences | Allergies et régimes | 🟢 Nice-to-have | M | **En tant que** utilisateur **je veux** set allergies **afin de** filtrer auto | Select allergènes/régimes. Filtre auto catalogue. | M8.1 |
| **M9.3** | Recommandations | Suggestions personnalisées | 🟢 Nice-to-have | L | **En tant que** utilisateur **je veux** suggestions **afin de** découvrir | Algo basé sur historique. Section "Pour vous". | M8.3 |
| **M10.1** | Fidélité | Points de fidélité | 🟢 Nice-to-have | M | **En tant que** utilisateur **je veux** gagner points **afin de** récompense | X points = 1€. Solde visible. Historique gains. | M8.3 |
| **M10.2** | Fidélité | Utilisation des points | 🟢 Nice-to-have | S | **En tant que** utilisateur **je veux** dépenser points **afin de** réduction | Toggle utiliser points au checkout. | M10.1 |
| **M10.3** | Fidélité | Badges et niveaux | 🟢 Nice-to-have | M | **En tant que** utilisateur **je veux** gamification **afin de** motivation | Niveaux Bronze/Silver/Gold. Avantages associés. | M10.1 |

---

## 💻 Web App (Client & B2B)

| ID | Section | Titre | Priorité | Description / Critères | Dépendances |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **W1.1** | Homepage | Hero section | 🔴 Critique | Hero impactant, CTA Commander, mention 30min. | Aucune |
| **W1.2** | Homepage | Comment ça marche | 🔴 Critique | 3 étapes visuelles (Commander, Cuisiné, Livré). | W1.1 |
| **W1.3** | Homepage | Plats populaires | 🔴 Critique | Carousel bestsellers (API). | API Plats |
| **W1.4** | Homepage | Avis clients | 🟡 Important | Témoignages rassurants. | Aucune |
| **W1.5** | Homepage | Section B2B | 🟡 Important | Lien vers offre entreprise dédiée. | Aucune |
| **W2.1** | Catalogue | Grille de plats | 🔴 Critique | Grid responsive (4col desktop, 1col mobile). Hover effects. | API Cat. |
| **W2.2** | Catalogue | Filtres et tri | 🔴 Critique | Sidebar gauche: Catégories, Prix, Allergènes. Tri: Prix, Pop. | W2.1 |
| **W2.3** | Catalogue | Recherche avancée | 🔴 Critique | Header search bar avec autocomplete. | W2.1 |
| **W2.4** | Catalogue | Page produit | 🔴 Critique | Vue détaillée, nutrition, avis, suggestions. | W2.1 |
| **W3.1** | Panier | Panier sidebar | 🔴 Critique | Overlay droite. Ajout/suppression rapide. | Context |
| **W3.2** | Checkout | Checkout étapes | 🔴 Critique | 3 steps: Adresse > Créneau > Paiement. Progress bar. | W3.1 |
| **W3.3** | Panier | Panier persistant | 🔴 Critique | Sauvegarde LocalStorage si fermeture onglet. | W3.1 |
| **W4.1** | Compte | Dashboard compte | 🔴 Critique | Sidebar navigation (Profil, Commandes, Factures). | Auth |
| **W4.2** | Compte | Export factures | 🟡 Important | Liste factures, btn download PDF. | W4.1 |

### Spécifique B2B
| ID | Section | Titre | Priorité | Description / Critères | Dépendances |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **B1.1** | Landing | Landing B2B | 🟡 Important | Page marketing dédiée entreprises. Avantages. | Aucune |
| **B1.2** | Landing | Demande devis | 🟡 Important | Formulaire contact pro (SIRET, nb employés). | B1.1 |
| **B1.3** | Landing | Grille tarifaire | 🟡 Important | Tableaux tarifs dégressifs. | B1.1 |
| **B2.1** | Compte | Création compte Ent. | 🟡 Important | Inscription gestionnaire, validation manuelle admin. | B1.2 |
| **B2.2** | Compte | Budget mensuel | 🟡 Important | Plafond global ou par employé. Alertes. | B2.1 |
| **B2.3** | Compte | Gestion employés | 🟡 Important | Import CSV emails, invitations, droits. | B2.1 |
| **B2.4** | Analytics | Stats conso | 🟡 Important | Dashboard dépenses par département/employé. | B2.1 |
| **B3.1** | Commande | Commande employé | 🟡 Important | Login email pro, décompte budget entreprise (pas de CB perso). | B2.3 |
| **B3.2** | Commande | Commande groupée | 🟡 Important | Manager commande pour équipe. Livraison unique. | B2.1 |
| **B3.3** | Facturation | Facture mensuelle | 🟡 Important | Facture unique fin de mois + détail CSV. | B2.1 |

---

## 🔧 Admin Dashboard (Web)

| ID | Section | Titre | Priorité | User Story / Fonction |
| :--- | :--- | :--- | :--- | :--- |
| **A1.1** | Dash | KPIs temps réel | 🔴 Critique | CA jour, Nb commandes (en cours/livrées), Alertes ruptures. |
| **A1.2** | Dash | Live Commandes | 🔴 Critique | Liste auto-refresh des commandes entrantes. |
| **A2.1** | Produits | Créer plat | 🔴 Critique | Formulaire complet (IMG, Desc, Prix, Taxe, Allergènes). |
| **A2.2** | Produits | Gérer stock | 🔴 Critique | Stock initial + Ajustement manuel + Alerte seuil bas. |
| **A2.3** | Produits | Toggle dispo | 🔴 Critique | Switch On/Off immédiat pour cacher plat. |
| **A2.4** | Produits | Menu du jour | 🔴 Critique | Sélectionner les "Stars" du jour (top liste). |
| **A3.1** | Commandes | Vue Cuisine | 🔴 Critique | Vue optimisée tablette cuisine. Groupage (ex: 12 Burgers). |
| **A3.2** | Commandes | Changement statut | 🔴 Critique | Workflow: Reçue > Prépa > Prête > Livrée. Notif auto. |
| **A3.3** | Commandes | Annuler/Refund | 🔴 Critique | Action annulation avec remboursement Stripe auto. |
| **A3.4** | Commandes | Détail Commande | 🔴 Critique | Vue complète (Client, Tel, Adresse, Items, Historique). |
| **A4.1** | Livraisons | Planifier tournées | 🟡 Important | Regroupement par zones pour optimiseurs (optionnel V1). |
| **A4.2** | Livraisons | Gérer créneaux | 🟡 Important | Ouvrir/Fermer créneaux, définir max commandes/créneau. |
| **A4.3** | Livraisons | Gérer zones | 🟡 Important | Liste codes postaux éligibles + frais livraison. |
| **A5.1** | Clients | Liste clients | 🟡 Important | Table clients, recherche, filtres, indicateur VIP. |
| **A5.2** | Clients | Détail client | 🟡 Important | Historique complet, LTV (Life Time Value), Notes internes. |
| **A5.3** | Clients | Offrir bon | 🟡 Important | Génération code promo unique pour geste commercial. |
| **A6.1** | Marketing | Créer codes promo | 🟢 Nice-to-have | Moteur règles (% ou €, min commande, dates, usage unique). |
| **A6.2** | Marketing | Campagnes email | 🟢 Nice-to-have | Envoi newsletter ou promo ciblée. |
| **A6.3** | Marketing | Bannières | 🟢 Nice-to-have | Upload images carrousel accueil + liens. |
| **A7.1** | Analytics | Rapports ventes | 🟡 Important | Graphiques CA, Panier moyen, Rétention. |
| **A7.2** | Analytics | Top plats | 🟡 Important | Classement bestsellers et "flops". |
| **A7.3** | Analytics | Export compta | 🟡 Important | CSV formaté pour logiciel compta (TVA ventilée). |

---

## 📧 Email / Notifications / SMS

| ID | Type | Sujet | Déclencheur | Contenu |
| :--- | :--- | :--- | :--- | :--- |
| **N1.1** | Email | Confirmation Compte | Inscription | Lien validation, Bienvenue. |
| **N1.2** | Email | Confirmation Commande | Paiement OK | Récap items, total, adresse, créneau. |
| **N1.3** | Email | Commande Préparation | Statut Cuisine | "On s'active aux fourneaux". |
| **N1.4** | Email | En Livraison | Statut Route | "Le livreur arrive". |
| **N1.5** | Email | Livrée | Statut Livré | "Bon appétit" + Lien facture. |
| **N1.6** | Email | Demande Avis | Livré + 2h | Notation étoiles + commentaire. |
| **N1.7** | Email | Reset Password | Demande user | Lien temporaire token. |
| **N2.1** | Email | Newsletter Hebdo | Vendredi | Menu semaine prochaine. |
| **N2.2** | Email | Marketing Promo | Ponctuel | Offre spéciale, Code promo. |
| **N2.3** | Email | Réactivation | Inactif 30j | "Vous nous manquez" + Promo. |
| **N3.1** | Push | Commande Reçue | Paiement OK | "Commande validée !". |
| **N3.2** | Push | Préparation | Cuisine Start | "Ça chauffe en cuisine 🔥". |
| **N3.3** | Push | En route | Livreur Start | "Arrivée dans ~10 min 🚴". |
| **N3.4** | Push | Livrée | Livreur End | "C'est livré ! Régalez-vous 😋". |
| **N3.5** | Push | Menu du jour | 11h00 | "Découvrez les plats du jour". |
| **N3.6** | Push | Flash Promo | Admin | Alertes promos limitées. |
| **N4.1** | SMS | Code 2FA | Login/Sign | Code 6 chiffres. |
| **N4.2** | SMS | Livraison Proche | 5 min avant | "Je suis en bas dans 5 min". |
| **N4.3** | SMS | Problème | Retard/Erreur | Message service client proactif. |