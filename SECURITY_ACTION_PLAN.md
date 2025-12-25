# 🔒 Plan d'Action Sécurité - URGENT

**Date** : 24 Décembre 2025
**Statut** : ⚠️ **VULNÉRABILITÉS CRITIQUES** - Ne pas déployer avant correction

---

## ⚠️ RÉSUMÉ EXÉCUTIF

**Score Sécurité Actuel : 5/10**
**Score Après Corrections : 8/10**
**Temps Estimé pour Corrections : 2-4 heures**

### Vulnérabilités Critiques Bloquantes
1. ❌ Clés API exposées dans git (Supabase + Stripe)
2. ❌ Pas de vérification du rôle admin
3. ❌ Politiques RLS trop permissives
4. ❌ Mots de passe faibles (6 caractères minimum)
5. ❌ Pas de séparation dev/production

---

## 🚨 VULNÉRABILITÉS CRITIQUES

### 1. 🔴 CRITIQUE : Clés API Exposées dans Git

**Fichier** : `frontend/.env`
**Gravité** : CRITIQUE
**Impact** : Compromission totale du backend

#### Problème
```env
# ❌ EXPOSÉ PUBLIQUEMENT DANS GIT
VITE_SUPABASE_URL=https://toiyclibmidzctmwhfxn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51ScAGuILZ6Gj6Trpcn6...
```

**Conséquences** :
- ✅ Clé Supabase ANON visible = accès lecture/écriture base de données
- ✅ Clé Stripe visible = potentiel abus
- ✅ Historique git = même si supprimé, toujours accessible

#### Solution Immédiate (À FAIRE MAINTENANT)

**Étape 1 : Ajouter .env au .gitignore**
```bash
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore
```

**Étape 2 : Supprimer .env du git**
```bash
git rm --cached frontend/.env
git commit -m "chore(security): Remove .env from git tracking"
git push
```

**Étape 3 : ROTATER les clés Supabase**
1. Aller sur https://supabase.com/dashboard/project/toiyclibmidzctmwhfxn/settings/api
2. **Révoquer** l'ancienne clé anon
3. **Générer** une nouvelle clé anon
4. **Mettre à jour** le fichier .env local (non-commité)

**Étape 4 : Créer .env.example**
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# App Configuration
VITE_APP_NAME=Pause Dej'
VITE_DELIVERY_FEE=3.90
VITE_FREE_DELIVERY_THRESHOLD=30

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
```

**Étape 5 : Documentation**
```bash
# Créer un README.security.md
echo "## Configuration Sécurisée" >> README.security.md
echo "1. Copier .env.example vers .env" >> README.security.md
echo "2. Remplir avec vos vraies clés" >> README.security.md
echo "3. Ne JAMAIS commiter .env" >> README.security.md
```

---

### 2. 🔴 CRITIQUE : Pas de Vérification Rôle Admin

**Fichier** : `frontend/src/pages/admin/AdminLayout.jsx` (ligne 71-75)
**Gravité** : CRITIQUE
**Impact** : N'importe quel utilisateur authentifié peut accéder à /admin

#### Problème Actuel
```javascript
// ❌ VULNERABLE - Vérifie seulement si l'utilisateur existe
useEffect(() => {
  if (!loading && !user) {
    navigate('/login')
  }
}, [user, loading, navigate])
```

#### Solution
```javascript
// ✅ CORRECT - Vérifie le rôle admin
useEffect(() => {
  if (!loading) {
    if (!user) {
      navigate('/login')
    } else if (!profile || profile.role !== 'admin') {
      navigate('/')  // Rediriger si pas admin
      toast({
        title: 'Accès refusé',
        description: 'Vous n\'avez pas les permissions administrateur',
        status: 'error',
        duration: 5000
      })
    }
  }
}, [user, profile, loading, navigate])
```

#### Fichiers à Modifier
1. `frontend/src/pages/admin/AdminLayout.jsx` - Ajouter vérification rôle
2. `frontend/src/App.jsx` - Ajouter route protection

---

### 3. 🔴 CRITIQUE : Politiques RLS Trop Permissives

**Fichier** : `supabase/migrations/fix_all_admin_permissions.sql`
**Gravité** : CRITIQUE
**Impact** : N'importe quel utilisateur = admin dans la base de données

#### Problème Actuel
```sql
-- ❌ VULNERABLE - N'importe quel utilisateur authentifié = admin
CREATE POLICY "Admins can view all dishes"
  ON dishes FOR SELECT
  USING (auth.role() = 'authenticated');
```

**auth.role()** retourne 'authenticated' pour TOUS les utilisateurs connectés, pas juste les admins.

#### Solution
```sql
-- ✅ CORRECT - Vérifie le rôle réel dans la table profiles
CREATE POLICY "Admins can view all dishes"
  ON dishes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

#### Migration à Créer
Créer `supabase/migrations/fix_admin_rls_policies.sql` :
```sql
-- Supprimer toutes les policies incorrectes
DROP POLICY IF EXISTS "Admins can view all dishes" ON dishes;
DROP POLICY IF EXISTS "Admins can insert dishes" ON dishes;
DROP POLICY IF EXISTS "Admins can update dishes" ON dishes;
DROP POLICY IF EXISTS "Admins can delete dishes" ON dishes;

-- Créer les policies correctes
CREATE POLICY "Admins can view all dishes"
  ON dishes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert dishes"
  ON dishes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update dishes"
  ON dishes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete dishes"
  ON dishes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

**Appliquer avec** :
```bash
# Via Supabase Dashboard
# SQL Editor → Paste migration → Run
```

---

### 4. 🔴 CRITIQUE : Mots de Passe Faibles

**Fichiers** :
- `frontend/src/pages/auth/LoginPage.jsx` (ligne 41)
- `frontend/src/pages/auth/SignupPage.jsx` (ligne 59)

**Gravité** : HAUTE
**Impact** : Comptes utilisateurs faciles à pirater

#### Problème
```javascript
// ❌ TROP FAIBLE - 6 caractères minimum
if (password.length < 6) {
  setError('Le mot de passe doit contenir au moins 6 caractères')
  return
}
```

#### Solution
```javascript
// ✅ SÉCURISÉ - 8+ caractères avec complexité
const validatePassword = (password) => {
  if (password.length < 8) {
    return 'Le mot de passe doit contenir au moins 8 caractères'
  }
  if (!/[A-Z]/.test(password)) {
    return 'Le mot de passe doit contenir au moins une majuscule'
  }
  if (!/[a-z]/.test(password)) {
    return 'Le mot de passe doit contenir au moins une minuscule'
  }
  if (!/[0-9]/.test(password)) {
    return 'Le mot de passe doit contenir au moins un chiffre'
  }
  if (!/[!@#$%^&*]/.test(password)) {
    return 'Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*)'
  }
  return null
}

// Utilisation
const errorMsg = validatePassword(password)
if (errorMsg) {
  setError(errorMsg)
  return
}
```

---

## 🔒 SÉCURITÉ DES MOTS DE PASSE

### ✅ Bonne Nouvelle : Supabase Gère Tout

**Vous n'avez RIEN à faire** pour le hachage des mots de passe :

1. **Hachage Automatique** : Supabase utilise bcrypt avec salt
2. **Stockage Sécurisé** : Jamais en clair, jamais accessible
3. **Transit Sécurisé** : HTTPS uniquement
4. **Aucun Code Custom** : Délégué à Supabase Auth

#### Vérification
```javascript
// ✅ Ce code est SÉCURISÉ
const { data, error } = await supabase.auth.signUp({
  email,
  password  // ← Supabase le hache automatiquement avec bcrypt
})
```

**Vous ne stockez pas**, **ne gérez pas**, **ne hachez pas** les mots de passe vous-même.

---

## 🔐 HTTPS / CERTIFICATS SSL

### ✅ Automatique avec Vercel

**Rien à configurer manuellement** :

1. **Certificat SSL** : Généré automatiquement par Vercel
2. **HTTPS Forcé** : Redirection HTTP → HTTPS automatique
3. **Renouvellement** : Automatique (Let's Encrypt)
4. **CDN Global** : Edge network avec TLS 1.3

#### Configuration Vercel
```bash
# Aucune action requise - Vercel le fait automatiquement
# Lors du déploiement :
# 1. Vercel génère le certificat SSL
# 2. Configure HTTPS
# 3. Redirige tout vers HTTPS
```

#### Vérification Post-Déploiement
```bash
# Tester le certificat
curl -I https://pause-dej.fr

# Vérifier le score SSL
# https://www.ssllabs.com/ssltest/analyze.html?d=pause-dej.fr
```

---

## 🛡️ DONNÉES SENSIBLES - STATUS

### ✅ Bien Protégé

| Donnée | Stockage | Protection | Status |
|--------|----------|------------|--------|
| **Mots de passe** | Supabase Auth | bcrypt + salt | ✅ Sécurisé |
| **Cartes bancaires** | Stripe | Tokenization | ✅ PCI-DSS |
| **JWT Tokens** | localStorage | Encrypted | ⚠️ Vulnérable XSS |
| **API Keys** | .env | Aucune (exposé) | ❌ À corriger |
| **Paiements** | Stripe API | TLS 1.3 | ✅ Sécurisé |

### ⚠️ À Améliorer

| Donnée | Stockage Actuel | Protection | Recommandation |
|--------|-----------------|------------|----------------|
| **Téléphones** | PostgreSQL | Texte clair | ⏳ Acceptable (faible sensibilité) |
| **Adresses** | PostgreSQL | Texte clair | ⏳ Acceptable |
| **Emails** | PostgreSQL | Texte clair | ⏳ Acceptable |

**Note** : Pour une app de livraison, stocker téléphones/adresses en clair est acceptable. Pas besoin de chiffrement au repos pour ces données.

---

## 📋 CHECKLIST SÉCURITÉ PRÉ-PRODUCTION

### CRITIQUE (À faire MAINTENANT)
- [ ] Supprimer .env du git
- [ ] Ajouter .env au .gitignore
- [ ] Rotater clés Supabase
- [ ] Créer .env.example
- [ ] Fixer vérification admin (AdminLayout.jsx)
- [ ] Corriger policies RLS admin
- [ ] Améliorer validation mots de passe (8+ chars, complexité)

### HAUTE (Avant déploiement)
- [ ] Tester policies RLS avec utilisateur non-admin
- [ ] Vérifier que admin est inaccessible pour users normaux
- [ ] Tester création compte avec mot de passe faible (doit échouer)
- [ ] Configurer variables d'environnement Vercel
- [ ] Activer 2FA sur compte Supabase
- [ ] Activer 2FA sur compte Stripe

### MOYENNE (Post-déploiement)
- [ ] Configurer CSP headers
- [ ] Activer HSTS
- [ ] Supprimer console.log en production
- [ ] Configurer monitoring erreurs (Sentry)
- [ ] Configurer rate limiting Supabase
- [ ] Audit logs pour actions admin

### BASSE (Améliorations futures)
- [ ] Implémenter TOTP 2FA pour utilisateurs
- [ ] Ajouter captcha sur signup
- [ ] Implémenter rotation automatique clés
- [ ] Chiffrement téléphones/adresses (optionnel)
- [ ] Audit trail complet

---

## 🚀 TIMELINE CORRECTIONS

### Jour 1 (2-3 heures) - URGENT
1. **30 min** : Corriger exposition clés API
2. **30 min** : Fixer vérification admin
3. **1h** : Corriger RLS policies
4. **30 min** : Améliorer validation mots de passe
5. **30 min** : Tests sécurité

### Jour 2 (1 heure) - IMPORTANT
1. Configurer environnement production
2. Tester avec utilisateur non-admin
3. Vérifier toutes les routes protégées

### Post-Déploiement (Continu)
1. Monitoring sécurité
2. Audit réguliers
3. Mises à jour dépendances

---

## 🔍 TESTS DE SÉCURITÉ

### Test 1 : Vérifier Exposition Clés
```bash
# Après correction, cette commande ne doit rien retourner
git log --all --full-history -- "*/.env"

# Vérifier .gitignore
cat .gitignore | grep ".env"  # Doit afficher .env
```

### Test 2 : Vérifier Admin Protection
```bash
# Se connecter avec utilisateur normal
# Essayer d'accéder à /admin
# Doit rediriger vers / avec message d'erreur
```

### Test 3 : Vérifier RLS
```sql
-- Dans Supabase SQL Editor, en tant qu'utilisateur non-admin
-- Cette requête doit échouer
INSERT INTO dishes (name, price) VALUES ('Test', 10.00);
-- Erreur attendue : "new row violates row-level security policy"
```

### Test 4 : Mots de Passe Faibles
```javascript
// Tenter de créer un compte avec "123456"
// Doit être rejeté avec message "8 caractères minimum"
```

---

## 📞 SUPPORT SÉCURITÉ

### Ressources
- **Supabase Security Best Practices** : https://supabase.com/docs/guides/auth/row-level-security
- **OWASP Top 10** : https://owasp.org/www-project-top-ten/
- **Vercel Security** : https://vercel.com/docs/security

### En Cas de Brèche
1. Révoquer immédiatement toutes les clés
2. Forcer déconnexion tous les utilisateurs
3. Analyser logs Supabase
4. Notifier utilisateurs si données compromises (RGPD)

---

## ✅ VALIDATION FINALE

Avant de déployer en production, valider :

- [ ] `.env` n'est PAS dans git
- [ ] Nouvelles clés Supabase générées
- [ ] Admin routes protégées (testé avec user normal)
- [ ] RLS policies testées (user normal ne peut pas modifier dishes)
- [ ] Mot de passe "test123" rejeté à l'inscription
- [ ] HTTPS actif sur domaine (Vercel)
- [ ] Certificat SSL valide (A+ sur SSL Labs)
- [ ] Aucune clé API visible dans le code source

---

**SCORE SÉCURITÉ APRÈS CORRECTIONS : 8/10** ✅

**Prochaine révision** : 1 mois après production
**Audit externe** : Recommandé à 6 mois

**Dernière mise à jour** : 24 Décembre 2025
