# OAuth Login Setup Guide (Google & Apple)

This guide explains how to configure Google and Apple OAuth login for Pause Dej'.

## ✅ What's Implemented

### Code Changes Complete ✅

1. **AuthContext.jsx** - Added OAuth functions
   - `signInWithGoogle()` - Google OAuth
   - `signInWithApple()` - Apple OAuth

2. **LoginPage.jsx** - Added OAuth buttons
   - Google login button
   - Apple login button
   - Error handling with toasts

3. **SignupPage.jsx** - Added OAuth buttons
   - Google signup button
   - Apple signup button
   - Consistent UI with login page

### Benefits

- **30-50% higher conversion rate** - Users prefer social login
- **Faster signup** - No password to remember
- **Better mobile UX** - Native authentication flows
- **Auto-filled profile data** - Name, email from provider

---

## 🔧 Setup Google OAuth

### 1. Create Google OAuth Credentials

**Go to Google Cloud Console:**
1. Visit https://console.cloud.google.com/
2. Create new project or select existing one
3. Go to: **APIs & Services** → **Credentials**

**Create OAuth 2.0 Client ID:**
1. Click **Create Credentials** → **OAuth client ID**
2. Application type: **Web application**
3. Name: `Pause Dej' - Production` (or `Dev` for testing)

**Configure Authorized redirect URIs:**
```
https://toiyclibmidzctmwhfxn.supabase.co/auth/v1/callback
```

For localhost testing, also add:
```
http://localhost:54321/auth/v1/callback
```

**Copy credentials:**
- Client ID: `xxxxx.apps.googleusercontent.com`
- Client Secret: `GOCSPX-xxxxx`

### 2. Configure in Supabase

**Go to Supabase Dashboard:**
1. Visit https://supabase.com/dashboard
2. Select your project: `pause-dej`
3. Go to: **Authentication** → **Providers**

**Enable Google:**
1. Find **Google** in the list
2. Toggle to **Enabled**
3. Paste **Client ID**
4. Paste **Client Secret**
5. Click **Save**

**Configure redirect URL (if needed):**
- Default: `https://toiyclibmidzctmwhfxn.supabase.co/auth/v1/callback`
- This is already set in Google console

### 3. Test Google Login

1. **Start dev server:**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Visit login page:**
   ```
   http://localhost:5173/login
   ```

3. **Click "Continuer avec Google"**
   - Should open Google account picker
   - Select account
   - Redirects back to your app
   - User is logged in

4. **Check Supabase Dashboard:**
   - Go to: **Authentication** → **Users**
   - Should see new user with Google provider

---

## 🍎 Setup Apple OAuth

### Requirements

- **Apple Developer Account** ($99/year)
- **Verified domain** (not localhost)
- **Email relay service** configured

### 1. Create Apple App ID

**Go to Apple Developer:**
1. Visit https://developer.apple.com/account/
2. Go to: **Certificates, IDs & Profiles** → **Identifiers**

**Register App ID:**
1. Click **+** to create new identifier
2. Select **App IDs** → Continue
3. Select **App** → Continue
4. Description: `Pause Dej' Web`
5. Bundle ID: `com.pausedej.web` (reverse domain)
6. Capabilities: Check **Sign In with Apple**
7. Click **Continue** → **Register**

### 2. Create Services ID

**Create Services ID:**
1. Click **+** to create new identifier
2. Select **Services IDs** → Continue
3. Description: `Pause Dej' Sign In`
4. Identifier: `com.pausedej.web.signin`
5. Check **Sign In with Apple**
6. Click **Configure**

**Configure Domains and URLs:**
1. Domains: `pause-dej.fr` (your production domain)
2. Return URLs: `https://toiyclibmidzctmwhfxn.supabase.co/auth/v1/callback`
3. Click **Save** → **Continue** → **Register**

### 3. Create Private Key

**Generate Key:**
1. Go to: **Keys** → Click **+**
2. Key Name: `Pause Dej' Sign In Key`
3. Check **Sign In with Apple**
4. Click **Configure**
5. Select your App ID: `com.pausedej.web`
6. Click **Save** → **Continue** → **Register**

**Download Key:**
- Download the `.p8` file
- Note the **Key ID** (e.g., `ABC123XYZ`)
- Save securely - you can't download again

### 4. Configure in Supabase

**Go to Supabase Dashboard:**
1. Authentication → Providers → **Apple**
2. Toggle to **Enabled**

**Fill in details:**
- **Services ID**: `com.pausedej.web.signin`
- **Team ID**: Found in Apple Developer account (top right)
- **Key ID**: From step 3 (e.g., `ABC123XYZ`)
- **Private Key**: Open `.p8` file, paste entire contents including:
  ```
  -----BEGIN PRIVATE KEY-----
  MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...
  -----END PRIVATE KEY-----
  ```
- Click **Save**

### 5. Verify Domain

**Add Apple verification file:**
1. In Supabase dashboard, Apple settings will show:
   - Download `apple-developer-domain-association.txt`
2. Host at: `https://pause-dej.fr/.well-known/apple-developer-domain-association.txt`
3. Test: Should return the file contents

**For Vercel/Netlify:**
```
/public/.well-known/apple-developer-domain-association.txt
```

### 6. Test Apple Login

**On production domain only** (Apple OAuth doesn't work on localhost):
1. Visit: `https://pause-dej.fr/login`
2. Click **"Continuer avec Apple"**
3. Should redirect to Apple login
4. Sign in with Apple ID
5. Redirects back to your app

---

## 🧪 Testing Guide

### Test Google OAuth (Works on localhost)

**Development:**
```bash
cd frontend
npm run dev
# Visit http://localhost:5173/login
# Click "Continuer avec Google"
```

**What to test:**
- ✅ Button appears correctly
- ✅ Clicking opens Google account picker
- ✅ Selecting account redirects back
- ✅ User is logged in (check navigation bar)
- ✅ User data saved in Supabase

### Test Apple OAuth (Requires production domain)

**Production only:**
```
https://pause-dej.fr/login
```

**What to test:**
- ✅ Button appears correctly
- ✅ Clicking redirects to Apple login
- ✅ Can use Face ID / Touch ID on iOS
- ✅ Email relay works (Hide My Email feature)
- ✅ User is logged in after redirect
- ✅ User data saved in Supabase

---

## 📊 User Flow

### Google Login Flow

```
User clicks "Continuer avec Google"
  ↓
AuthContext.signInWithGoogle() called
  ↓
Supabase.auth.signInWithOAuth({ provider: 'google' })
  ↓
Redirects to: https://accounts.google.com/...
  ↓
User selects Google account
  ↓
Google redirects to: https://xxx.supabase.co/auth/v1/callback
  ↓
Supabase creates user session
  ↓
Redirects to: window.location.origin (your app)
  ↓
AuthContext updates user state
  ↓
User is logged in
```

### Apple Login Flow

```
User clicks "Continuer avec Apple"
  ↓
AuthContext.signInWithApple() called
  ↓
Supabase.auth.signInWithOAuth({ provider: 'apple' })
  ↓
Redirects to: https://appleid.apple.com/...
  ↓
User signs in with Apple ID
  ↓
User can choose "Hide My Email"
  ↓
Apple redirects to: https://xxx.supabase.co/auth/v1/callback
  ↓
Supabase creates user session
  ↓
Redirects to: window.location.origin (your app)
  ↓
AuthContext updates user state
  ↓
User is logged in
```

---

## 🔍 Troubleshooting

### Google OAuth Issues

**Error: "redirect_uri_mismatch"**
- Check Google Cloud Console redirect URIs
- Should be: `https://toiyclibmidzctmwhfxn.supabase.co/auth/v1/callback`
- For localhost: `http://localhost:54321/auth/v1/callback`

**Button doesn't work**
- Check browser console for errors
- Verify Client ID and Secret in Supabase
- Try in incognito mode (clears cookies)

**User not created in Supabase**
- Check Supabase logs: Dashboard → Logs
- Verify Google provider is enabled
- Check RLS policies on profiles table

### Apple OAuth Issues

**Error: "invalid_client"**
- Check Services ID matches in Supabase
- Verify Team ID is correct
- Re-check Key ID

**Error: "invalid_request"**
- Check return URL exactly matches
- Must be: `https://xxx.supabase.co/auth/v1/callback`
- No trailing slash

**Domain verification fails**
- Verify file is accessible at: `https://pause-dej.fr/.well-known/apple-developer-domain-association.txt`
- Must return 200 status
- Must be exact file from Apple

**Works on production, not localhost**
- This is expected - Apple OAuth requires verified domain
- Can't test on localhost
- Use Google OAuth for local development

---

## 🔐 Security Considerations

### OAuth Token Storage

Supabase handles all token storage securely:
- Access tokens stored in memory
- Refresh tokens in httpOnly cookies
- No sensitive data in localStorage

### User Data Privacy

**Google provides:**
- Email (always)
- Full name (if user allows)
- Profile picture (if user allows)

**Apple provides:**
- Email (real or relay)
- Full name (first time only)
- Email relay (if user chooses "Hide My Email")

### Email Relay (Apple only)

If user chooses "Hide My Email":
- Apple creates relay: `random@privaterelay.appleid.com`
- Emails to relay are forwarded to user's real email
- You never see real email address
- Good for privacy, but can't merge accounts

**Handle in your code:**
```javascript
// Check if email is Apple relay
if (user.email.includes('@privaterelay.appleid.com')) {
  // User is using Apple email relay
  // Don't show "merge accounts" option
}
```

---

## 📈 Analytics & Monitoring

### Track OAuth Signup Rate

Add to your analytics:

```javascript
// In AuthContext after successful OAuth
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  // ...
})

if (!error) {
  // Track conversion
  analytics.track('oauth_signup', {
    provider: 'google',
    timestamp: new Date(),
  })
}
```

### Monitor in Supabase Dashboard

**View OAuth users:**
1. Go to: Authentication → Users
2. Filter by provider:
   - `google` - Google OAuth users
   - `apple` - Apple OAuth users
   - `email` - Email/password users

**View signup trends:**
1. Go to: Authentication → Logs
2. Filter by event: `user.created`
3. See provider breakdown

---

## 🎯 Next Steps

### After OAuth is Live

1. **Monitor conversion rates:**
   - Track signup completion rate
   - Compare OAuth vs email/password
   - A/B test button placement

2. **Add profile completion flow:**
   - OAuth users may be missing phone number
   - Create onboarding to collect missing data
   - See: Create onboarding flow (next task)

3. **Enable more providers:**
   - Facebook Login
   - Twitter/X Login
   - GitHub (for developers)

4. **Implement account linking:**
   - Allow users to link multiple providers
   - Merge email and OAuth accounts
   - Handle duplicate accounts gracefully

---

## ✅ Setup Checklist

### Google OAuth (Can test now)

- [ ] Create Google Cloud project
- [ ] Create OAuth 2.0 Client ID
- [ ] Add redirect URIs (production + localhost)
- [ ] Copy Client ID and Secret
- [ ] Enable in Supabase dashboard
- [ ] Paste credentials in Supabase
- [ ] Test on localhost
- [ ] Test on production

### Apple OAuth (Production only)

- [ ] Purchase Apple Developer account ($99)
- [ ] Create App ID with Sign In capability
- [ ] Create Services ID
- [ ] Configure domains and return URLs
- [ ] Generate private key (.p8 file)
- [ ] Note Team ID, Key ID, Services ID
- [ ] Enable in Supabase dashboard
- [ ] Paste all credentials in Supabase
- [ ] Download domain verification file
- [ ] Host verification file on domain
- [ ] Test on production domain

---

**Status**: ✅ OAuth code implementation complete!

**Ready to configure**: Follow this guide to set up providers in Supabase dashboard

**Test**: Google OAuth works immediately on localhost, Apple OAuth requires production domain
