# 🖼️ SETUP SUPABASE STORAGE UNTUK BANNER IMAGES

## 🚨 ERROR YANG TERJADI

**Error Message:** "Gagal upload gambar: Bucket not found"

**Penyebab:** Bucket `banner-images` di Supabase Storage belum dibuat

---

## 📋 SOLUSI: CREATE BUCKET DI SUPABASE

### ✅ CARA 1: Melalui Dashboard (Recommended)

#### Step 1: Buka Supabase Dashboard
1. Go to: https://supabase.com/dashboard
2. Login dengan akun Anda
3. Pilih project FastCare

#### Step 2: Create Storage Bucket
1. Sidebar kiri → Cari **"Storage"** atau **"Buckets"**
2. Klik **"Create a new bucket"**
3. Isi form:
   ```
   Bucket Name: banner-images
   Privacy: Public (PENTING!)
   ```
4. Klik **"Create Bucket"**

#### Step 3: Setup Public Access
Jika Bucket dibuat tapi masih private:

1. Klik bucket `banner-images`
2. Cari tab **"Policies"** atau **"Access Control"**
3. Klik **"New Policy"**
4. Pilih template: **"For public access (no RLS)"**
5. Set operation: **SELECT** (untuk read/download)
6. Role: **public**
7. Condition: `true` (allow all)
8. Klik **"Save"**

#### Verify Success
```
Storage → banner-images → Buka
✅ Ada file? Berarti bucket siap!
❌ Error? Ulangi step di atas
```

---

### ✅ CARA 2: Melalui SQL (Advanced)

Jika dashboard tidak berfungsi, gunakan SQL Editor:

```sql
-- Buat bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('banner-images', 'banner-images', true);

-- Set policy (allow public read)
INSERT INTO storage.s3_multipart_uploads (bucket_id, key)
SELECT id, id FROM storage.buckets WHERE name = 'banner-images';
```

---

## 🔐 RLS POLICIES (SECURITY SETTINGS)

### Recommended Policy Setup

```
Table: storage.objects
Policy Name: Public read access
Target roles: public
Expression (USING): bucket_id = 'banner-images'
Grant: SELECT
```

Atau lebih lengkap:

```sql
-- Allow public to read all files in banner-images bucket
CREATE POLICY "Public read" ON storage.objects
FOR SELECT
USING (bucket_id = 'banner-images');

-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated upload" ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'banner-images' 
  AND auth.role() = 'authenticated'
);
```

---

## 📝 DATABASE SCHEMA

### hero_banners table (sudah ada atau perlu ditambah?)

Pastikan kolom ini ada:

```sql
CREATE TABLE hero_banners (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  image TEXT,                    -- URL gambar (dari upload atau link)
  link TEXT,                     -- Link optional
  is_active BOOLEAN DEFAULT true,
  order INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**TIDAK perlu kolom baru!** Kolom `image` sudah cukup untuk:
- Link gambar eksternal: `https://example.com/image.jpg`
- URL dari Supabase Storage: `https://[project].supabase.co/storage/v1/object/public/banner-images/banner-xxx.jpg`

---

## 🧪 TEST UPLOAD GAMBAR

### Test Manual

**Prerequisites:**
1. Bucket `banner-images` sudah dibuat
2. Bucket set ke Public
3. RLS Policy allow public read

**Test Steps:**

1. Admin Panel → Hero Banner tab
2. Klik "Tambah Banner"
3. Isi form:
   - Judul: "Test Banner"
   - Subtitle: "Testing upload"
   - Link: https://example.com
   - Aktif: checked
   - Order: 1
4. Klik area upload gambar (jangan URL input)
5. Pilih gambar dari komputer
6. Tunggu upload selesai
7. Klik "Tambah"

**Expected Result:**
- No error message
- Modal tutup
- Banner muncul di list
- Banner ada di Supabase
- Gambar terupload ke Storage

**If Error "Bucket not found":**
- Bucket belum dibuat → Create bucket
- Bucket private → Set ke Public
- RLS policy blocking → Set policy

---

## ✅ QUICK SETUP GUIDE

1. **Buka Supabase Dashboard**
   - https://supabase.com/dashboard
   - Select project FastCare

2. **Go to Storage Section**
   - Left sidebar → Storage

3. **Create New Bucket**
   - Name: `banner-images`
   - Privacy: **PUBLIC** (important!)

4. **Add Public Read Policy**
   - Bucket → Policies
   - New Policy
   - For SELECT (read)
   - Role: public
   - Allow all

5. **Test Upload**
   - Admin Panel
   - Upload banner image
   - Should work!

---

**Status:** Follow this guide to fix "Bucket not found" error
