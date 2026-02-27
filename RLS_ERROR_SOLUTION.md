# SOLUSI RLS ERROR - Upload Gambar Lokal

## 🔴 ERROR: "RLS Policy Error"

```
Gagal upload gambar: RLS Policy Error: Hubungi admin untuk setup bucket policy
```

## ✅ PENYEBAB & SOLUSI

**Penyebab**: Supabase bucket ada tapi Row-Level Security (RLS) policy belum di-setup

**Solusi**: Setup RLS policy di Supabase Dashboard (5 menit)

---

## 🚀 LANGKAH-LANGKAH FIX

### STEP 1: Buka Supabase Dashboard

```
https://app.supabase.com
→ Login
→ Pilih Project: FastCare
```

### STEP 2: Jalankan SQL Script

**Pilih salah satu cara:**

#### CARA A: Via SQL Editor (PALING CEPAT - RECOMMENDED ⭐)

1. Sidebar kiri → SQL Editor
2. Click: New Query
3. COPY semua SQL di bawah
4. PASTE ke SQL Editor
5. Click: RUN (atau Ctrl+Enter)
6. Tunggu: ✅ Success

**SQL SCRIPT:**

```sql
-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- HOSPITAL IMAGES BUCKET
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

-- BANNER IMAGES BUCKET
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

#### CARA B: Via UI (Manual, tapi lebih panjang)

1. Storage → Pilih bucket: hospital-bimagaes
2. Tab: Policies
3. New Policy → Template: SELECT → For public read
4. New Policy → Template: INSERT → For authenticated users
5. New Policy → Template: UPDATE → For authenticated users
6. New Policy → Template: DELETE → For authenticated users
7. Repeat untuk bucket: banner-images

### STEP 3: Verifikasi

1. Refresh browser: Ctrl+F5
2. Login Admin Panel
3. Rumah Sakit → Tambah RS (atau Edit)
4. Upload gambar
5. Should work! ✅

---

## ✨ SETELAH FIX

### Fitur Baru di Admin Panel:

**Hospital Form:**

```
Gambar Rumah Sakit
├─ Upload Gambar Lokal [File Input] 📤
├─ Image Preview
└─ Auto-upload ke Supabase
```

**Banner Form:**

```
Gambar
├─ Upload Gambar Lokal [File Input] 📤
├─ Image Preview
└─ Auto-upload ke Supabase
```

### Features:

✅ Upload file lokal (max 5MB)
✅ Image preview sebelum submit
✅ Auto-upload saat pilih file
✅ Loading indicator
✅ Error handling yang jelas

---

## 📱 WORKFLOW BARU

### SEBELUMNYA (Old):

```
Admin input URL gambar → Validate URL → Submit
(Risk: broken links, slow, unreliable)
```

### SEKARANG (New):

```
Admin upload file → Auto preview → Submit
(Reliable: stored di Supabase CDN, fast, validated)
```

---

## 🔧 INFO TEKNIS

| Item             | Detail                                                     |
| ---------------- | ---------------------------------------------------------- |
| Bucket Hospital  | `hospital-bimagaes`                                        |
| Bucket Banner    | `banner-images`                                            |
| Max File Size    | 5MB                                                        |
| Supported Format | JPG, PNG, GIF, WebP, AVIF                                  |
| Access           | Public read (siapa saja), Authenticated write (only admin) |
| Storage          | Supabase Storage (CDN, fast)                               |

---

## ❓ FAQ

**Q: Berapa lama upload?**
A: Tergantung ukuran file & internet speed. Biasa 1-3 detik.

**Q: Gambar lama di-delete otomatis?**
A: Tidak. Manual cleanup di Storage jika perlu.

**Q: Bisa upload gambar lain format?**
A: Ya, semua format image (JPG, PNG, GIF, WebP, SVG, HEIC, dll)

**Q: Berapa max size?**
A: 5MB per file.

**Q: Gambar hilang jika server down?**
A: Tidak, stored di Supabase (cloud, reliable).

---

## 🆘 TROUBLESHOOTING

| Masalah                | Solusi                                          |
| ---------------------- | ----------------------------------------------- |
| Error RLS masih muncul | Refresh browser (Ctrl+F5), jalankan SQL lagi    |
| Bucket not found       | Create bucket: hospital-bimagaes, banner-images |
| Auth error             | Login Admin Panel dulu sebelum upload           |
| Upload lambat          | Compress gambar dulu, atau check internet       |
| Gambar tidak muncul    | Refresh (Ctrl+F5), check console (F12)          |

---

## 📚 DOKUMENTASI LENGKAP

- `QUICK_FIX_RLS_ERROR.md` - File ini (quick reference)
- `SUPABASE_RLS_SETUP_GUIDE.md` - Detail step-by-step
- `SUPABASE_BUCKET_RLS_FIX.md` - SQL script reference
- `ADMIN_PANEL_UPLOAD_SUMMARY.md` - Fitur summary
- `IMPLEMENTATION_REPORT.md` - Technical details

---

## ✅ CHECKLIST

Sebelum bisa upload:

- [ ] RLS Policy sudah di-setup (run SQL script di atas)
- [ ] Browser di-refresh (Ctrl+F5)
- [ ] Login Admin Panel
- [ ] Test upload gambar hospital
- [ ] Test upload gambar banner

---

**Status**: ✅ Ready  
**Waktu Setup**: ~5 menit  
**Difficulty**: Easy (copy-paste SQL)

**Need Help?** Read: SUPABASE_RLS_SETUP_GUIDE.md untuk detail lebih lengkap
