# Supabase Bucket RLS Policy Fix

## Problem

Error: `new row violates row-level security policy` ketika upload gambar ke bucket Supabase.

## Solution

Perlu mengatur RLS (Row-Level Security) policy di bucket agar authenticated users dapat upload dan public dapat read.

## Steps untuk Perbaiki di Supabase Dashboard

### 1. Untuk Bucket: hospital-bimagaes

Pergi ke Supabase Dashboard → Storage → hospital-bimagaes → Policies

Buat 2 policy:

#### Policy 1: Allow Public Read (SELECT)

```
Name: "Allow Public Read"
Roles: (pilih anon dan authenticated)
Using expression: true
WITH CHECK expression: (leave empty)
```

Atau gunakan SQL di SQL Editor:

```sql
-- Allow public read for hospital images
CREATE POLICY "Allow public read hospital images"
ON storage.objects FOR SELECT
USING (bucket_id = 'hospital-bimagaes');

-- Allow authenticated users to upload to hospital-bimagaes
CREATE POLICY "Allow authenticated users upload to hospital"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'hospital-bimagaes'
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update their own uploads
CREATE POLICY "Allow authenticated users update hospital images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'hospital-bimagaes' AND auth.role() = 'authenticated')
WITH CHECK (bucket_id = 'hospital-bimagaes' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete their own uploads
CREATE POLICY "Allow authenticated users delete hospital images"
ON storage.objects FOR DELETE
USING (bucket_id = 'hospital-bimagaes' AND auth.role() = 'authenticated');
```

### 2. Untuk Bucket: banner-images

Pergi ke Supabase Dashboard → Storage → banner-images → Policies

```sql
-- Allow public read for banner images
CREATE POLICY "Allow public read banner images"
ON storage.objects FOR SELECT
USING (bucket_id = 'banner-images');

-- Allow authenticated users to upload to banner-images
CREATE POLICY "Allow authenticated users upload to banner"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'banner-images'
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update banner images
CREATE POLICY "Allow authenticated users update banner images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'banner-images' AND auth.role() = 'authenticated')
WITH CHECK (bucket_id = 'banner-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete banner images
CREATE POLICY "Allow authenticated users delete banner images"
ON storage.objects FOR DELETE
USING (bucket_id = 'banner-images' AND auth.role() = 'authenticated');
```

## Cara Execute SQL Script

1. Buka Supabase Dashboard
2. Pilih Project
3. Pergi ke SQL Editor
4. Klik "New Query"
5. Paste salah satu SQL script di atas
6. Klik "Run" atau tekan Ctrl+Enter

## Atau Gunakan UI (Lebih Simple)

1. Pergi ke Storage → Pilih Bucket
2. Klik "Policies" tab
3. Klik "New Policy" → "For full customization" atau "Get started with a template"
4. Pilih template yang sesuai:
   - SELECT: untuk public read
   - INSERT: untuk authenticated upload
   - UPDATE: untuk authenticated update
   - DELETE: untuk authenticated delete

## Verifikasi

Setelah execute SQL script:

1. Refresh page
2. Buka Admin Panel
3. Coba upload gambar hospital
4. Coba upload gambar banner
5. Seharusnya berhasil tanpa error RLS

## Troubleshooting

Jika masih error:

1. Pastikan user sudah authenticated (login)
2. Pastikan bucket sudah exist dengan nama yang tepat
3. Cek RLS policy di bucket - pastikan ada policy untuk INSERT dengan auth.role() = 'authenticated'
4. Lihat error log di browser console (F12 → Console tab)
