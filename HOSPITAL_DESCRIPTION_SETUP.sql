-- 📋 HOSPITAL DESCRIPTION COLUMN - DATABASE SETUP

-- 1️⃣ CHECK JIKA KOLOM DESCRIPTION SUDAH ADA
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name='hospitals' AND column_name='description';

-- 2️⃣ JIKA BELUM ADA, TAMBAHKAN KOLOM
-- Run jika query diatas return 0 rows
ALTER TABLE hospitals
ADD COLUMN description TEXT;

-- 3️⃣ VERIFY COLUMN SUDAH BERHASIL DITAMBAH
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name='hospitals' 
ORDER BY ordinal_position;

-- 4️⃣ ENABLE RLS JIK BELUM
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;

-- 5️⃣ CREATE/VERIFY RLS POLICIES UNTUK UPDATE
-- Select Policy (Public Read)
DROP POLICY IF EXISTS "Allow select for all users" ON hospitals;
CREATE POLICY "Allow select for all users"
  ON hospitals
  FOR SELECT
  USING (true);

-- Update Policy (Authenticated Users - Admin)
DROP POLICY IF EXISTS "Allow update for authenticated users" ON hospitals;
CREATE POLICY "Allow update for authenticated users"
  ON hospitals
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 6️⃣ ENABLE REALTIME UNTUK HOSPITALS TABLE
ALTER PUBLICATION supabase_realtime ADD TABLE hospitals;

-- 7️⃣ VERIFY REALTIME PUBLICATION
SELECT * FROM pg_publication WHERE pubname = 'supabase_realtime';

-- 8️⃣ LIST TABLES IN REALTIME PUBLICATION
SELECT * FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';

-- 9️⃣ VERIFY POLICIES
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'hospitals'
ORDER BY policyname;

-- 🔟 TEST: Sample Data dengan Description
UPDATE hospitals 
SET description = 'Rumah sakit modern dengan fasilitas kesehatan terlengkap di wilayah Banten. Melayani rawat jalan, rawat inap, dan darurat 24 jam.'
WHERE id = (SELECT id FROM hospitals LIMIT 1);

-- 1️⃣1️⃣ VERIFY DATA
SELECT id, name, description 
FROM hospitals 
LIMIT 5;

-- 1️⃣2️⃣ UPDATE MULTIPLE DESCRIPTIONS (SAMPLE)
UPDATE hospitals SET description = 'RS terkemuka dengan dokter spesialis berpengalaman'
WHERE name LIKE '%Sehat%';

UPDATE hospitals SET description = 'Klinik kesehatan modern dengan layanan terpadu'
WHERE class = 'C' OR class = 'D';

-- 1️⃣3️⃣ VIEW HOSPITALS WITH DESCRIPTION
SELECT 
  id,
  name,
  city,
  class,
  description,
  created_at,
  updated_at
FROM hospitals
WHERE description IS NOT NULL
ORDER BY updated_at DESC;

-- 1️⃣4️⃣ COUNT HOSPITALS WITH DESCRIPTION
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN description IS NOT NULL THEN 1 END) as with_description,
  COUNT(CASE WHEN description IS NULL THEN 1 END) as without_description
FROM hospitals;

-- 1️⃣5️⃣ RLS POLICY VERIFICATION - ENSURE SELECT
-- Should allow all users to read
SELECT
  policyname,
  CASE 
    WHEN qual IS NULL OR qual = 'true' THEN 'PUBLIC ACCESS'
    ELSE qual
  END as access_level
FROM pg_policies
WHERE tablename = 'hospitals' AND cmd = 'SELECT';

-- 1️⃣6️⃣ TESTING - Simulate UPDATE via Real-time
-- Update description untuk hospital tertentu
UPDATE hospitals 
SET description = 'Updated description dengan real-time test'
WHERE id = 'hospital-id-disini';

-- NOTE: Real-time event akan trigger setelah query diatas
-- Check DevTools Console di HospitalDetail page untuk:
-- "🔔 Hospital UPDATE detected: ..."

-- 1️⃣7️⃣ CLEANUP - Reset Description (if needed)
UPDATE hospitals 
SET description = NULL 
WHERE description = 'Test description';

-- 1️⃣8️⃣ VIEW TABLE STRUCTURE
\d+ hospitals

-- NOTES:
-- - Description column harus TEXT type
-- - RLS policies MUST enable authenticated users untuk UPDATE
-- - Realtime publication HARUS include hospitals table
-- - Jika ada error "permission denied", check RLS policies
-- - Untuk public read + authenticated update: 
--   * SELECT policy: USING (true)
--   * UPDATE policy: USING (auth.role() = 'authenticated')
