# Bug Fixes - Profile Loading Issues

## 🐛 Issues Fixed

### 1. Infinite Loading on Catalogue Page
### 2. Unable to Disconnect Account

---

## 🔍 Root Cause Analysis

### Issue: Missing Profile Handling

When implementing the admin role system, we added profile loading to `AuthContext`. However, there were issues with how missing profiles were handled:

**Problems identified**:

1. **AuthContext profile loading**: Used `.single()` which throws error if profile doesn't exist
2. **useProfile hook**: Also used `.single()` which causes errors for new users
3. **Missing error handling**: No graceful fallback when profiles don't exist
4. **Infinite loading**: Profile fetch errors weren't setting `loading` to false properly

**Why this happened**:
- New users from OAuth (Google) don't have profiles created immediately
- Profile creation might be delayed or async
- When profile doesn't exist, `.single()` throws "PGRST116" error

---

## ✅ Fixes Applied

### Fix 1: AuthContext Profile Loading

**File**: `frontend/src/context/AuthContext.jsx`

**Changes**:
- Changed `.single()` to `.maybeSingle()` - doesn't error if profile missing
- Added try-catch error handling
- Set default profile `{ id: userId, role: 'user' }` if profile doesn't exist
- Ensures `isAdmin` always has a safe value (defaults to false for non-existent profiles)

**Before**:
```javascript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single() // ❌ Throws error if profile doesn't exist

if (!error && data) {
  setProfile(data)
}
```

**After**:
```javascript
try {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle() // ✅ Returns null if profile doesn't exist

  if (error) {
    console.error('Error loading profile:', error)
    setProfile({ id: userId, role: 'user' }) // ✅ Default profile
    return
  }

  if (data) {
    setProfile(data)
  } else {
    setProfile({ id: userId, role: 'user' }) // ✅ Default for missing profile
  }
} catch (err) {
  console.error('Profile load error:', err)
  setProfile({ id: userId, role: 'user' }) // ✅ Fallback on error
}
```

### Fix 2: useProfile Hook

**File**: `frontend/src/hooks/useProfile.js`

**Changes**:
- Changed `.single()` to `.maybeSingle()`
- Improved error handling to always set loading to false
- Set profile to null instead of throwing when profile doesn't exist
- Fixed dependency array to only re-fetch when user ID changes (not on every user object change)

**Before**:
```javascript
const { data, error: fetchError } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single() // ❌ Throws error if profile doesn't exist

if (fetchError) throw fetchError // ❌ Throws, doesn't set loading to false
```

**After**:
```javascript
const { data, error: fetchError } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .maybeSingle() // ✅ Returns null if profile doesn't exist

if (fetchError) {
  console.error('Error fetching profile:', fetchError)
  setError(fetchError.message)
  setProfile(null) // ✅ Safe state
  return
}

// Set profile even if null (user might not have a profile yet)
setProfile(data)

// finally block ensures loading is always set to false ✅
```

**Dependency fix**:
```javascript
// Before
}, [user]) // ❌ Re-runs on any user object change

// After
}, [user?.id]) // ✅ Only re-runs when user ID changes
```

---

## 🧪 Testing the Fixes

### Test 1: New User Login (No Profile)

**Scenario**: User signs in via Google OAuth but profile doesn't exist yet

**Steps**:
1. Clear browser cache/localStorage
2. Sign in with Google
3. Navigate to `/catalogue`

**Expected Result**:
- ✅ Page loads successfully
- ✅ No infinite loading
- ✅ Profile defaults to `{ id: userId, role: 'user' }`
- ✅ `isAdmin` is `false`
- ✅ No "Dashboard Admin" link in menu

### Test 2: Existing User Login (With Profile)

**Scenario**: User has existing profile in database

**Steps**:
1. Sign in with account that has profile
2. Navigate to `/catalogue`
3. Check user menu

**Expected Result**:
- ✅ Page loads successfully
- ✅ Profile loads from database
- ✅ Greeting shows user's name
- ✅ If admin role: "Dashboard Admin" link appears

### Test 3: Disconnect Account

**Scenario**: User wants to sign out

**Steps**:
1. Sign in
2. Click user icon
3. Click "Se déconnecter"

**Expected Result**:
- ✅ User is signed out successfully
- ✅ Redirected to home page
- ✅ User menu disappears
- ✅ Profile set to null
- ✅ No errors in console

### Test 4: Admin User

**Scenario**: User with `role = 'admin'` in profiles table

**Steps**:
1. Set user role to admin in database
2. Sign out and sign in again
3. Click user icon

**Expected Result**:
- ✅ "Dashboard Admin" link appears
- ✅ Link goes to `/admin/dashboard`
- ✅ Regular menu items still visible

---

## 🔧 Additional Safety Measures

### Profile Default Values

When profile doesn't exist or can't be loaded:

```javascript
{
  id: userId,
  role: 'user' // Always defaults to 'user', never 'admin'
}
```

This ensures:
- `isAdmin` calculation is safe: `profile?.role === 'admin'` → `false`
- No accidental admin access
- Application continues to function

### Error Logging

All profile loading errors are logged to console:

```javascript
console.error('Error loading profile:', error)
```

**Benefits**:
- Easier debugging
- Identify profile creation issues
- Track missing profiles

---

## 📋 Profile Creation Flow

**When is a profile created?**

Profiles are typically created by:
1. **Database trigger** on `auth.users` insert
2. **Signup flow** in application
3. **First login** via OAuth (depends on implementation)

**Migration to check**: Look for profile creation triggers in `supabase/migrations/`

**Example trigger**:
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**If this trigger doesn't exist**, profiles won't be auto-created and these fixes are essential.

---

## ✅ Verification Checklist

After deploying these fixes, verify:

- [ ] New users can sign up without errors
- [ ] Google OAuth login works
- [ ] Catalogue page loads without infinite spinner
- [ ] Can sign out successfully
- [ ] Admin users see "Dashboard Admin" link
- [ ] Regular users don't see admin link
- [ ] Console shows no profile errors
- [ ] Greeting displays correctly for all users

---

## 🚀 Deployment Notes

**Files changed**:
- `frontend/src/context/AuthContext.jsx`
- `frontend/src/hooks/useProfile.js`

**No migration needed** - these are frontend-only fixes

**Recommended**:
1. Deploy these fixes
2. Monitor console for profile errors
3. Check if profile creation trigger exists
4. If profiles aren't being created, add trigger or create profiles on signup

---

**Status**: ✅ Both issues fixed!

**Impact**:
- Infinite loading: Fixed ✅
- Can't disconnect: Fixed ✅
- Safer profile handling for all users
- Graceful degradation when profiles don't exist
