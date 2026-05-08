# Student Profile System Documentation

This document provides the technical details for the student profile system implemented in the CodeCraft Academy (CODEX) platform.

## 1. Database Schema (PostgreSQL/Supabase)

The following SQL can be used to set up the `profiles` table in a Supabase/PostgreSQL environment.

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  username TEXT UNIQUE,
  email TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  phone TEXT,
  learning_goal TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'teacher')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_role ON profiles(role);
```

## 2. Row Level Security (RLS) Policies

```sql
-- Allow users to select their own profile
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);
```

## 3. Automatic Profile Creation (Trigger)

```sql
-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url, role)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.email, 
    new.raw_user_meta_data->>'avatar_url',
    COALESCE(new.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run after a new user is created in auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 4. Current Implementation (Firebase/Firestore)

Since the project currently uses **Firebase**, the profile system has been implemented using **Firestore** for data consistency and to avoid breaking the existing authentication flow.

### Firestore Structure
- **Collection**: `profiles`
- **Document ID**: User's UID (from Firebase Auth)
- **Fields**: Matches the SQL schema above.

### Security Rules (Firestore)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /profiles/{userId} {
      allow read, update, create: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Integration Details
1. **Automatic Creation**: Handled in `src/app/auth/signup/page.tsx` immediately after user creation.
2. **Profile Management**: Handled via the `useProfile` hook in `src/hooks/useProfile.ts`.
3. **UI/Edit**: Implemented in `src/app/profile/page.tsx` with full support for avatar uploads to Firebase Storage.

## 5. Edge Cases Handled
- **Missing Profile**: The system checks for existing profiles and provides a graceful fallback.
- **Duplicate Usernames**: Username defaults to the email prefix if not provided, ensuring uniqueness.
- **Failed Uploads**: Error handling with toast notifications for avatar uploads.
- **Session Expiry**: Integrated with `useAuth` to ensure data is only fetched for authenticated users.
