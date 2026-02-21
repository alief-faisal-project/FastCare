-- 🔒 RLS POLICIES UNTUK HOSPITALS TABLE
-- Jalankan query ini di Supabase SQL Editor untuk fix RLS issues

-- Enable RLS pada hospitals table
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies jika ada
DROP POLICY IF EXISTS "Allow select for all users" ON hospitals;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON hospitals;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON hospitals;
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON hospitals;

-- CREATE POLICIES
-- 1. SELECT: Allow semua orang baca (public)
CREATE POLICY "Allow select for all users"
  ON hospitals
  FOR SELECT
  USING (true);

-- 2. INSERT: Allow authenticated users (admin)
CREATE POLICY "Allow insert for authenticated users"
  ON hospitals
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- 3. UPDATE: Allow authenticated users (admin)
CREATE POLICY "Allow update for authenticated users"
  ON hospitals
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 4. DELETE: Allow authenticated users (admin)
CREATE POLICY "Allow delete for authenticated users"
  ON hospitals
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- 🔒 RLS POLICIES UNTUK HERO_BANNERS TABLE

ALTER TABLE hero_banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select for all users" ON hero_banners;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON hero_banners;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON hero_banners;
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON hero_banners;

CREATE POLICY "Allow select for all users"
  ON hero_banners
  FOR SELECT
  USING (true);

CREATE POLICY "Allow insert for authenticated users"
  ON hero_banners
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow update for authenticated users"
  ON hero_banners
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow delete for authenticated users"
  ON hero_banners
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Verify policies
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('hospitals', 'hero_banners')
ORDER BY tablename, policyname;
