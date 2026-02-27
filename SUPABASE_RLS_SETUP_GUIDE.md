# Setup Guide: Memperbaiki RLS Policy Error di Supabase

## Error yang Muncul

```
Gagal upload gambar: RLS Policy Error: Hubungi admin untuk setup bucket policy.
Lihat SUPABASE_BUCKET_RLS_FIX.md
```

## Penyebab

Row-Level Security (RLS) policy di bucket Supabase belum dikonfigurasi. Bucket mungkin sudah ada, tapi tidak ada policy yang mengizinkan authenticated users untuk upload file.

---

## SOLUSI: Setup RLS Policy

### Langkah 1: Buka Supabase Dashboard

1. Buka https://app.supabase.com
2. Login dengan akun Supabase Anda
3. Pilih project FastCare

### Langkah 2: Setup Policy untuk Bucket `hospital-bimagaes`

1. Di sidebar kiri, klik **Storage**
2. Pilih bucket **hospital-bimagaes**
3. Klik tab **Policies**

#### Jika sudah ada policy, lihat apa saja yang ada. Jika belum, ikuti langkah di bawah:

#### Membuat Policy via UI (Recommended - Paling Mudah)

**Policy 1: Allow Public Read**

- Klik **New Policy** → pilih template **For SELECT** → klik **Get Started**
- Roles: Centang **anon** dan **authenticated**
- USING expression: Biarkan kosong (atau tulis `true`)
- Klik **Review** → **Save policy**

**Policy 2: Allow Authenticated Upload**

- Klik **New Policy** → pilih template **For INSERT** → klik **Get Started**
- Roles: Centang **authenticated**
- WITH CHECK expression: Tulis `true` atau biarkan kosong
- Klik **Review** → **Save policy**

**Policy 3: Allow Authenticated Update**

- Klik **New Policy** → pilih template **For UPDATE** → klik **Get Started**
- Roles: Centang **authenticated**
- USING: tulis `true`
- WITH CHECK: tulis `true`
- Klik **Review** → **Save policy**

**Policy 4: Allow Authenticated Delete**

- Klik **New Policy** → pilih template **For DELETE** → klik **Get Started**
- Roles: Centang **authenticated**
- USING: tulis `true`
- Klik **Review** → **Save policy**

#### Atau Membuat Policy via SQL (Lebih Cepat jika ada banyak policy)

1. Pergi ke **SQL Editor** (di sidebar)
2. Klik **New Query**
3. Copy & paste kode di bawah:

```sql
-- Enable RLS jika belum diaktifkan
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read hospital images
CREATE POLICY "Allow public read hospital images"
ON storage.objects FOR SELECT
USING (bucket_id = 'hospital-bimagaes');

-- Policy: Allow authenticated users upload to hospital
CREATE POLICY "Allow authenticated users upload hospital"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'hospital-bimagaes' AND auth.role() = 'authenticated');

-- Policy: Allow authenticated users update hospital images
CREATE POLICY "Allow authenticated users update hospital images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'hospital-bimagaes' AND auth.role() = 'authenticated')
WITH CHECK (bucket_id = 'hospital-bimagaes' AND auth.role() = 'authenticated');

-- Policy: Allow authenticated users delete hospital images
CREATE POLICY "Allow authenticated users delete hospital images"
ON storage.objects FOR DELETE
USING (bucket_id = 'hospital-bimagaes' AND auth.role() = 'authenticated');
```

4. Klik **Run** atau tekan **Ctrl + Enter**
5. Tunggu sampai success ✅

### Langkah 3: Setup Policy untuk Bucket `banner-images`

Ulangi langkah 2, tapi ganti `hospital-bimagaes` dengan `banner-images`.

**SQL untuk banner-images:**

```sql
-- Policy: Allow public read banner images
CREATE POLICY "Allow public read banner images"
ON storage.objects FOR SELECT
USING (bucket_id = 'banner-images');

-- Policy: Allow authenticated users upload to banner
CREATE POLICY "Allow authenticated users upload banner"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'banner-images' AND auth.role() = 'authenticated');

-- Policy: Allow authenticated users update banner images
CREATE POLICY "Allow authenticated users update banner images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'banner-images' AND auth.role() = 'authenticated')
WITH CHECK (bucket_id = 'banner-images' AND auth.role() = 'authenticated');

-- Policy: Allow authenticated users delete banner images
CREATE POLICY "Allow authenticated users delete banner images"
ON storage.objects FOR DELETE
USING (bucket_id = 'banner-images' AND auth.role() = 'authenticated');
```

---

## VERIFIKASI

Setelah setup selesai:

1. Refresh browser (Ctrl + F5)
2. Login ke Admin Panel (jika belum)
3. Buka **Admin Panel** → **Rumah Sakit** tab
4. Klik **Tambah RS** (atau edit RS yang ada)
5. Scroll ke bagian **Gambar Rumah Sakit**
6. Upload file gambar lokal
7. Seharusnya upload berhasil ✅

---

## Troubleshooting

### Error: "Policy belum ada"

→ Pastikan Anda sudah execute SQL script atau create policy via UI. Refresh page dan coba lagi.

### Error: "Bucket tidak ditemukan"

→ Pastikan bucket `hospital-bimagaes` dan `banner-images` sudah dibuat di Storage:

1. Pergi ke Storage
2. Lihat list buckets
3. Jika tidak ada, klik **Create new bucket**
4. Isikan nama: `hospital-bimagaes` atau `banner-images`
5. Pilih **Public** (atau private, tapi pastikan policy-nya allow read dari public)

### Error: "Anda harus login"

→ Pastikan Anda sudah login ke aplikasi Admin Panel sebelum upload.

### Upload masih error setelah setup?

1. Buka Browser Console (F12 → Console tab)
2. Lihat error message lengkapnya
3. Screenshot error dan konsultasikan dengan admin

---

## File Terkait

- `SUPABASE_BUCKET_RLS_FIX.md` - Dokumentasi teknis
- `src/context/AppContext.tsx` - Implementasi uploadHospitalImage dan uploadBannerImage
- `src/pages/AdminPanel.tsx` - Form upload gambar
