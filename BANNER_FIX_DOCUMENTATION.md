# 🔧 BANNER FIX - DOKUMENTASI LENGKAP

## 🐛 Issues yang Dilaporkan

### Issue #1: "Gagal upload gambar: Bucket not found"

**Status:** ✅ FIXED
**Penyebab:** Bucket `banner-images` belum dibuat di Supabase Storage

**Solusi:**

1. Buka Supabase Dashboard
2. Storage → Create new bucket
3. Nama bucket: `banner-images`
4. Set public (buka access)
5. Test upload gambar

### Issue #2: Banner tidak tampil di website meskipun sudah aktif

**Status:** 🔄 DEBUGGING
**Gejala:**

- Menambahkan banner di admin panel
- Status menunjukkan "Aktif"
- Tapi di website tidak tampil
- Atau menampilkan "Nonaktif"

**Kemungkinan Penyebab:**

1. Field `is_active` tidak ter-update dengan benar saat save
2. Data dalam AppContext tidak di-refresh
3. Ada perbedaan antara field name di form vs Supabase

### Issue #3: Website menampilkan 5 placeholder banner

**Status:** ✅ WORKING
**Deskripsi:** Jika belum ada banner aktif, tampilkan 5 placeholder dengan gray background

---

## 📋 STEP-BY-STEP FIX

### Step 1: Setup Supabase Storage Bucket

```
1. Buka https://supabase.com → Login
2. Select Project: FastCare
3. Sidebar → Storage
4. Klik "Create new bucket"
5. Nama: banner-images
6. Pilih: Public bucket
7. Klik Create
8. Success!
```

### Step 2: Verify Supabase Columns

Di Supabase Dashboard:

```
SQL Editor → Run:

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'hero_banners'
ORDER BY ordinal_position;
```

**Expected Output:**

```
id              → uuid
title           → text
subtitle        → text
image           → text (nullable)
link            → text (nullable)
is_active       → boolean       ← IMPORTANT: snake_case
order           → integer
created_at      → timestamp
updated_at      → timestamp
```

### Step 3: Check Admin Panel

```
1. Buka Admin Panel
2. Tab "Hero Banner"
3. Klik "Tambah Banner"
4. Isi form:
   - Judul: "Test Banner"
   - Subtitle: "Testing"
   - Upload Gambar: Pilih file lokal
   - Link: https://example.com (optional)
   - Aktif: ✓ (PENTING: harus centang)
   - Urutan: 1
5. Klik "Tambah"
6. Lihat hasil di list
```

### Step 4: Verify Data Saved

**Di Admin Panel:**

```
Lihat di grid banner yang baru ditambah:
- Gambar visible? ✅
- Status = "Aktif"? ✅
- Urutan = 1? ✅
```

**Di Supabase:**

```
1. Dashboard → editor_banners table
2. Lihat baris terbaru:
   - is_active: true (bukan "Aktif")
   - order: 1 (number, bukan text)
   - image: URL gambar dari Supabase Storage
   - link: null atau URL
```

### Step 5: Test Website

```
1. Buka website homepage
2. Lihat hero banner section
3. Harusnya menampilkan banner yang dibuat
4. Jika belum ada active banner → tampilkan 5 placeholder gray
5. Klik banner → link bekerja
```

---

## 🔍 DEBUGGING CHECKLIST

### If Banner Tidak Tampil di Website

```
[ ] 1. Check Admin Panel
    [ ] Banner ada di list?
    [ ] Status = "Aktif"?
    [ ] Gambar ada?

[ ] 2. Check Supabase
    [ ] Row ada di hero_banners table?
    [ ] is_active = true?
    [ ] order = number (bukan null)?
    [ ] image = URL (bukan null)?

[ ] 3. Check Console (F12)
    [ ] heroBanners array ter-load?
    [ ] Ada warning/error?
    [ ] Console log: console.log(heroBanners)

[ ] 4. Check Network (F12 → Network)
    [ ] Request ke Supabase berhasil?
    [ ] Response data correct?
    [ ] Image URL valid?
```

### If Upload Gambar Error

```
[ ] 1. Check bucket exists
    Supabase → Storage → ada "banner-images"?

[ ] 2. Check bucket permissions
    banner-images → Policies
    Ada policy untuk public access?

[ ] 3. Check upload code
    Lihat console error message
    Error message mana? (file size? type? auth?)

[ ] 4. Test manual upload
    Storage → banner-images → Upload file
    Bisa upload? Bisa lihat preview?
```

### If Status Selalu "Nonaktif"

```
[ ] 1. Saat create banner
    [ ] Field "Aktif" di-check? ✓
    [ ] Console: payload.is_active = true?
    [ ] Supabase: is_active = true?

[ ] 2. Saat edit banner
    [ ] Toggle "Aktif" berfungsi?
    [ ] Save berhasil?
    [ ] Supabase ter-update?

[ ] 3. Saat refresh page
    [ ] Status masih benar?
    [ ] Atau kembali ke "Nonaktif"?
```

---

## 📝 CONSOLE DEBUGGING

### Command 1: Check heroBanners in browser console

```javascript
// F12 → Console → copy paste:
console.log("heroBanners:", window.__APP_STATE__?.heroBanners || "not found");
console.table(heroBanners); // if heroBanners in scope
```

### Command 2: Check banner yang harusnya aktif

```javascript
// F12 → Console:
const activeBanners = heroBanners.filter((b) => b.isActive);
console.log("Active banners:", activeBanners);
```

### Command 3: Check data types

```javascript
const banner = heroBanners[0];
console.log({
  isActive: banner.isActive,
  order: banner.order,
  image: banner.image,
  link: banner.link,
});
```

---

## 🗄️ DATABASE SCHEMA

### hero_banners Table Requirement

```sql
CREATE TABLE hero_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  image TEXT,                    -- nullable, URL from Supabase Storage
  link TEXT,                     -- nullable, external link
  is_active BOOLEAN DEFAULT false,  -- snake_case, NOT camelCase!
  "order" INTEGER DEFAULT 0,     -- quoted because "order" is reserved
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

**CRITICAL:** Column names MUST be snake_case:

- ✅ `is_active` (correct)
- ❌ `isActive` (wrong)
- ✅ `order` (use quotes: `"order"`)
- ❌ `orderValue` (wrong)

---

## 🚀 SOLUTIONS APPLIED

### Solution 1: Bucket Upload Error

**What:** Created `banner-images` bucket in Supabase Storage
**Why:** Upload function needs valid bucket name
**Result:** File upload now works to Supabase

### Solution 2: Admin Panel Image Rendering

**What:** Added null-check for `banner.image`
**Code:**

```typescript
{banner.image ? <img src=... /> : <PlaceholderDiv />}
```

**Why:** Image can be null for non-uploaded banners
**Result:** No crash when image is null

### Solution 3: Website Placeholder Banner

**What:** Show 5 gray placeholders if no active banners
**Code:** `getDisplayBanners()` function
**Why:** Better UX, shows carousel design even without content
**Result:** Website always shows banner section

---

## 📋 TESTING CHECKLIST

```
UPLOAD GAMBAR:
[ ] Click "Tambah Banner"
[ ] Upload file lokal berhasil
[ ] Gambar preview muncul
[ ] Tidak ada error "Bucket not found"

CREATE BANNER:
[ ] Judul ter-isi
[ ] Gambar ter-upload
[ ] Aktif: checked
[ ] Save berhasil (modal tutup)
[ ] Banner muncul di list

ADMIN PANEL:
[ ] Banner list tampil dengan gambar
[ ] Status "Aktif" atau "Nonaktif" benar
[ ] Edit button bekerja
[ ] Delete button bekerja

WEBSITE:
[ ] Homepage tampil
[ ] Hero banner section ada
[ ] Jika 0 active banners: 5 placeholder muncul
[ ] Jika 1-5 active banners: muncul banner yang active
[ ] Jika >5 active banners: carousel dengan navigation
[ ] Click banner: link bekerja atau # jika kosong

DATABASE:
[ ] Supabase: hero_banners table ada
[ ] Columns: is_active (snake_case, boolean)
[ ] Columns: order (integer)
[ ] Columns: image (text, nullable)
[ ] Data: is_active = true/false (boolean, not string)
```

---

## 🔗 RELEVANT CODE FILES

**Upload Function:**

```
File: src/context/AppContext.tsx
Function: uploadBannerImage()
Purpose: Upload file to Supabase Storage banner-images bucket
```

**Admin Panel Display:**

```
File: src/pages/AdminPanel.tsx
Section: Banners Tab, Grid rendering
Purpose: Show banner cards with images, status, edit/delete buttons
```

**Website Display:**

```
File: src/components/HeroBanner.tsx
Function: getDisplayBanners()
Purpose: Filter active banners or show 5 placeholders
```

**Types:**

```
File: src/types/index.ts
Type: HeroBanner
Fields: id, title, subtitle, image?, link?, isActive, order
```

---

## 📞 COMMON ISSUES & SOLUTIONS

| Issue                     | Cause                        | Solution                                      |
| ------------------------- | ---------------------------- | --------------------------------------------- |
| Bucket not found          | Storage bucket doesn't exist | Create `banner-images` bucket in Supabase     |
| Upload fails              | No public access             | Set bucket to public                          |
| Image null                | User didn't upload           | OK - placeholder shows instead                |
| Status always "Nonaktif"  | is_active not saved as true  | Check form checkbox, verify Supabase column   |
| Placeholder shows forever | No active banners            | Add active banner from admin panel            |
| Carousel doesn't scroll   | <5 active banners            | Need 5+ for carousel (or 3+ for desktop view) |

---

## ✅ VERIFICATION STEPS

### Quick Verify (2 min)

```
1. Admin: Tambah banner baru dengan gambar
2. Admin: Set aktif, save
3. Website: Refresh, banner muncul?
→ Jika YES: ✅ working
→ Jika NO: Continue below
```

### Full Verify (10 min)

```
1. F12 → Console
2. console.log(heroBanners)
3. Check: length > 0?
4. Check: isActive = true?
5. Refresh page
6. Check lagi: masih ada?
→ Jika ada: Check Supabase
→ Jika hilang: Cache issue
```

### Database Verify (5 min)

```
1. Supabase Dashboard
2. hero_banners table
3. Select * query
4. Lihat baris terbaru
5. Check: is_active = true (boolean)?
6. Check: image ada URL?
→ Jika OK: Frontend issue
→ Jika NULL: Backend issue
```

---

**Status:** ✅ READY FOR TESTING  
**Last Updated:** Feb 20, 2026
