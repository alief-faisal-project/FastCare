# QUICK REFERENCE: Upload Gambar Lokal - Admin Panel

## 🚨 MASALAH: "RLS Policy Error"

Jika muncul error:

```
Gagal upload gambar: RLS Policy Error: Hubungi admin untuk setup bucket policy
```

## ✅ SOLUSI CEPAT (3 Langkah)

### Langkah 1: Buka Supabase Dashboard

- Kunjungi: https://app.supabase.com
- Login dengan akun Anda
- Pilih project: **FastCare**

### Langkah 2: Jalankan SQL Script

#### Option A: Via SQL Editor (RECOMMENDED)

1. Sidebar kiri → **SQL Editor**
2. Klik **New Query**
3. **COPY semua code di bawah:**

```sql
-- Enable RLS if not already
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- HOSPITAL IMAGES BUCKET POLICIES
CREATE POLICY "Allow public read hospital images"
ON storage.objects FOR SELECT
USING (bucket_id = 'hospital-bimagaes');

CREATE POLICY "Allow authenticated users upload hospital"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'hospital-bimagaes' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users update hospital images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'hospital-bimagaes' AND auth.role() = 'authenticated')
WITH CHECK (bucket_id = 'hospital-bimagaes' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users delete hospital images"
ON storage.objects FOR DELETE
USING (bucket_id = 'hospital-bimagaes' AND auth.role() = 'authenticated');

-- BANNER IMAGES BUCKET POLICIES
CREATE POLICY "Allow public read banner images"
ON storage.objects FOR SELECT
USING (bucket_id = 'banner-images');

CREATE POLICY "Allow authenticated users upload banner"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'banner-images' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users update banner images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'banner-images' AND auth.role() = 'authenticated')
WITH CHECK (bucket_id = 'banner-images' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users delete banner images"
ON storage.objects FOR DELETE
USING (bucket_id = 'banner-images' AND auth.role() = 'authenticated');
```

4. **PASTE** ke SQL Editor
5. Klik **Run** (atau Ctrl + Enter)
6. Tunggu sampai ✅ Success

#### Option B: Via UI (Manual)

1. Sidebar → **Storage**
2. Pilih bucket: **hospital-bimagaes**
3. Tab: **Policies**
4. Click: **New Policy**
5. Create 4 policies:
   - ✅ SELECT (public read)
   - ✅ INSERT (authenticated upload)
   - ✅ UPDATE (authenticated update)
   - ✅ DELETE (authenticated delete)
6. Repeat untuk bucket **banner-images**

**[Lebih detail? Buka: SUPABASE_RLS_SETUP_GUIDE.md]**

### Langkah 3: Test & Verify

1. Refresh browser: **Ctrl + F5**
2. Login Admin Panel (jika belum)
3. Buka: **Admin Panel** → **Rumah Sakit**
4. Klik: **Tambah RS** (atau Edit yang ada)
5. Scroll ke: **Gambar Rumah Sakit**
6. Upload file gambar
7. Seharusnya berhasil ✅

---

## 📋 CHECKLIST

Sebelum memulai:

- [ ] Sudah login ke Supabase Dashboard
- [ ] Sudah membuat/verify bucket: `hospital-bimagaes`
- [ ] Sudah membuat/verify bucket: `banner-images`
- [ ] Sudah install FastCare app ke local

Setelah execute SQL:

- [ ] Run SQL berhasil (✅ Success)
- [ ] Refresh browser
- [ ] Login ke FastCare Admin
- [ ] Test upload gambar hospital
- [ ] Test upload gambar banner
- [ ] Seharusnya berhasil tanpa error RLS

---

## 🔍 TROUBLESHOOTING

| Error                    | Solusi                                                            |
| ------------------------ | ----------------------------------------------------------------- |
| "Policy violates RLS"    | Execute SQL script di atas                                        |
| "Bucket tidak ditemukan" | Create bucket: `hospital-bimagaes` dan `banner-images` di Storage |
| "Anda harus login"       | Login Admin Panel dulu                                            |
| "File terlalu besar"     | Max 5MB. Compress gambar dulu                                     |
| Gambar tidak muncul      | Refresh (Ctrl+F5), cek console error (F12)                        |

---

## 📝 FILE STORAGE INFO

- **Bucket 1**: `hospital-bimagaes` → untuk gambar rumah sakit
- **Bucket 2**: `banner-images` → untuk gambar hero banner
- **Max File**: 5MB per file
- **Format**: JPG, PNG, GIF, WebP, AVIF, HEIC, SVG
- **Path**: `hospitals/{auto-generated-filename}` atau `banners/{auto-generated-filename}`
- **Access**: Public read (siapa saja bisa lihat URL), write-restricted (hanya authenticated)

---

## 💡 QUICK TIPS

- Upload otomatis, tidak perlu manual submit URL lagi ✨
- Gambar preview muncul sebelum submit form ✨
- Filename auto-generated, aman dari duplikat ✨
- Public CDN, akses cepat dari mana saja ✨

---

**Status**: Ready to Use (setelah setup RLS Policy)  
**Last Updated**: Feb 27, 2026  
**Need Help?**: Check SUPABASE_RLS_SETUP_GUIDE.md untuk detail lengkap
