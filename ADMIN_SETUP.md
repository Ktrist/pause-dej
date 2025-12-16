# Admin Access Setup Guide

This guide explains how to configure admin access for users in Pause Dej'.

## 🔐 Admin Role System

The admin system uses a `role` column in the `profiles` table to determine user permissions.

### Roles:
- **`user`** - Default role for all users (customers)
- **`admin`** - Admin role with access to admin dashboard

---

## ✅ What's Implemented

### Admin Dashboard Link

**Desktop Menu**:
- Click on user icon → Dropdown menu
- **If admin**: "Dashboard Admin" link appears at the top (with settings icon)
- Styled in brand color (600) with bold font
- Divider separates admin link from regular menu items

**Mobile Menu**:
- Open mobile drawer menu
- **If admin**: "Dashboard Admin" button appears (brand colored with settings icon)
- Positioned before "Mon compte" button

### Admin Features Access

The `isAdmin` flag is available throughout the app via `useAuth()`:

```javascript
const { user, isAdmin } = useAuth()

// Use in components
{isAdmin && (
  <AdminOnlyFeature />
)}
```

---

## 🛠️ How to Set a User as Admin

### Option 1: SQL Query in Supabase Dashboard

1. **Go to Supabase Dashboard**:
   - Visit https://supabase.com/dashboard
   - Select your project: `pause-dej`

2. **Open SQL Editor**:
   - Click on "SQL Editor" in left sidebar
   - Click "New Query"

3. **Run this SQL**:
   ```sql
   -- Set user as admin by email
   UPDATE profiles
   SET role = 'admin'
   WHERE email = 'your-admin@email.com';

   -- Verify it worked
   SELECT id, email, role
   FROM profiles
   WHERE role = 'admin';
   ```

4. **Replace** `your-admin@email.com` with the actual admin email

5. **Click "Run"**

6. **User must log out and log back in** to see the changes

### Option 2: SQL Query via psql

If you have direct database access:

```bash
# Connect to your Supabase database
psql postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres

# Set user as admin
UPDATE profiles
SET role = 'admin'
WHERE email = 'your-admin@email.com';

# Verify
SELECT email, role FROM profiles WHERE role = 'admin';
```

### Option 3: Update via Supabase Table Editor

1. **Go to Supabase Dashboard** → **Table Editor**
2. Select `profiles` table
3. Find the user by email
4. Click on the `role` cell
5. Change from `user` to `admin`
6. Save changes

---

## 🧪 Testing Admin Access

### Test as Admin User

1. **Set your account as admin** (use one of the methods above)

2. **Log out and log back in** (important! profile is loaded on login)

3. **Check desktop header**:
   - Click on user icon (top right)
   - You should see "Dashboard Admin" at the top of the dropdown
   - It should have a settings icon and be styled in brand color

4. **Check mobile menu**:
   - Open mobile menu (hamburger icon)
   - You should see "Dashboard Admin" button
   - Should be before "Mon compte"

5. **Click "Dashboard Admin"**:
   - Should navigate to `/admin/dashboard`
   - (Currently: `http://localhost:5173/admin/dashboard`)

### Test as Regular User

1. **Use a regular user account** (role = 'user')

2. **Check menus**:
   - Desktop dropdown: NO "Dashboard Admin" link
   - Mobile drawer: NO "Dashboard Admin" button
   - Only regular menu items visible

---

## 🔒 Security Considerations

### Row Level Security (RLS)

The admin role is already protected by RLS policies in various tables:

**Example** (from `add_admin_role_to_profiles.sql`):
```sql
-- Only admins can manage newsletter campaigns
CREATE POLICY "Admins can manage campaigns"
  ON newsletter_campaigns FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

### Frontend Protection

The admin link is hidden from non-admin users, but this is **client-side only**.

**Important**: Always protect admin routes and API endpoints with **server-side** checks:

```javascript
// Example: Admin-only edge function
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single()

if (profile?.role !== 'admin') {
  return new Response('Unauthorized', { status: 403 })
}
```

---

## 📋 Admin Dashboard Routes

Current admin routes (from your existing admin system):

| Route | Description |
|-------|-------------|
| `/admin/dashboard` | Main admin dashboard |
| `/admin/orders` | Manage orders |
| `/admin/products` | Manage dishes/products |
| `/admin/customers` | View customers |
| `/admin/analytics` | View analytics |
| `/admin/newsletter` | Newsletter campaigns |

All these routes should be protected with admin role checks.

---

## 🔄 How It Works

### 1. User Login

```javascript
// In AuthContext.jsx
const loadUserProfile = async (userId) => {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  setProfile(data) // Includes role field
}
```

### 2. Check Admin Status

```javascript
// In AuthContext value
isAdmin: profile?.role === 'admin'
```

### 3. Conditional Rendering

```javascript
// In Header.jsx
{isAdmin && (
  <MenuItem
    as={RouterLink}
    to="/admin/dashboard"
    icon={<FiSettings />}
  >
    Dashboard Admin
  </MenuItem>
)}
```

---

## 📝 Database Schema

### profiles Table

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  role VARCHAR(50) DEFAULT 'user' NOT NULL, -- 'user' or 'admin'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster role lookups
CREATE INDEX idx_profiles_role ON profiles(role);
```

---

## 🎯 Future Enhancements

### Multiple Admin Roles

Add more granular roles:

```sql
-- Update role enum to support multiple admin types
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles
ADD CONSTRAINT profiles_role_check
CHECK (role IN ('user', 'admin', 'super_admin', 'manager', 'support'));
```

**Role hierarchy**:
- `user` - Regular customer
- `support` - Customer support team
- `manager` - Restaurant manager (kitchen, orders)
- `admin` - Full admin access
- `super_admin` - System administrator

### Permissions System

Create a permissions table for fine-grained control:

```sql
CREATE TABLE admin_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  permission VARCHAR(100) NOT NULL, -- 'manage_orders', 'view_analytics', etc.
  granted_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## ✅ Quick Setup Checklist

- [ ] Identify admin user email
- [ ] Run SQL to set user role to 'admin'
- [ ] Verify in profiles table (role = 'admin')
- [ ] Admin user logs out
- [ ] Admin user logs back in
- [ ] Check desktop menu for "Dashboard Admin"
- [ ] Check mobile menu for "Dashboard Admin"
- [ ] Click link to verify navigation works
- [ ] Test with regular user (link should NOT appear)

---

**Status**: ✅ Admin link fully implemented!

**Files Modified**:
- `frontend/src/context/AuthContext.jsx` - Added profile loading and isAdmin flag
- `frontend/src/components/layout/Header.jsx` - Added admin dashboard link to menus

**Ready to use**: Set a user's role to 'admin' and they'll see the dashboard link!
