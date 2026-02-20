# Perbaikan Admin Panel - Hospital & Banner Update Issues

## Masalah yang Diperbaiki ✅

### 1. Error: "Could not find the 'googleMapsLink' column"

**Penyebab:** Field `googleMapsLink` sedang dikirim ke Supabase dalam payload insert/update, padahal kolom di database menggunakan nama berbeda atau tidak ada.

**Solusi:**

- Di `AppContext.tsx`, ubah mapping dari `google_Maps_Link` → `googleMapsLink` (typo fix)
- Di `AdminPanel.tsx`, hapus field `googleMapsLink` dari payload yang dikirim ke Supabase
- Field ini tetap ada di form untuk user input (latitude/longitude), tapi tidak dikirim ke DB

### 2. Banner tidak terupdate (Functions kosong)

**Penyebab:** Functions `addHeroBanner`, `updateHeroBanner`, `deleteHeroBanner` di context hanya return empty functions.

**Solusi:**

- Implementasikan semua 3 functions dengan proper Supabase queries
- Tambahkan `setHeroBanners` state (sebelumnya hanya const empty array)
- Tambahkan fetch hero_banners di `fetchInitialData()`
- Update provider value untuk menggunakan real functions

### 3. Hospital tidak terinput (Form data spreading)

**Penyebab:** Di `addHospital` dan `updateHospital`, menggunakan `...hospital` yang spread semua field, termasuk field dengan nama format camelCase yang tidak match database field names.

**Solusi:**

- Eksplisit map setiap field dengan transformation dari camelCase ke snake_case:
  - `hasICU` → `has_icu`
  - `hasIGD` → `has_igd`
  - `totalBeds` → `total_beds`
  - `operatingHours` → `operating_hours`
  - `googleMapsLink` → `google_maps_link`

## File yang Diubah 📝

### 1. `/src/context/AppContext.tsx`

- ✅ Fixed typo: `google_Maps_Link` → `googleMapsLink`
- ✅ Added `createdAt`, `updatedAt` to mapHospital
- ✅ Fixed addHospital: explicit field mapping instead of spread
- ✅ Fixed updateHospital: explicit field mapping instead of spread
- ✅ Added `setHeroBanners` state (removed `const`)
- ✅ Added hero_banners fetch in `fetchInitialData()`
- ✅ Implemented `addHeroBanner()` with Supabase insert
- ✅ Implemented `updateHeroBanner()` with Supabase update
- ✅ Implemented `deleteHeroBanner()` with Supabase delete
- ✅ Updated provider value to use real functions

### 2. `/src/pages/AdminPanel.tsx`

- ✅ Fixed handleSubmit: removed spread, explicit field mapping
- ✅ Removed `googleMapsLink` dari payload
- ✅ Kept form fields but only send valid DB fields

## Database Schema Check 🔍

Pastikan Supabase Anda memiliki kolom yang benar di table `hospitals`:

```
- name (text)
- type (text)
- class (text)
- address (text)
- city (text)
- district (text)
- phone (text)
- email (text)
- website (text)
- image (text)
- description (text)
- has_icu (boolean)
- has_igd (boolean)
- total_beds (integer)
- operating_hours (text)
- google_maps_link (text) ← OPTIONAL/REMOVE if not needed
- latitude (float)
- longitude (float)
- rating (float) ← OPTIONAL
- facilities (json/array)
- services (json/array)
- created_at (timestamp)
- updated_at (timestamp)
```

Dan table `hero_banners`:

```
- id (uuid/primary key)
- title (text)
- subtitle (text)
- image (text)
- link (text)
- is_active (boolean)
- order (integer)
```

## Testing Checklist ✅

- [ ] Build: `npm run build` ✅ Success
- [ ] Add Hospital: Form tidak boleh show error
- [ ] Update Hospital: Data harus tersimpan ke Supabase
- [ ] Delete Hospital: Data harus terhapus
- [ ] Add Banner: Banner muncul di homepage
- [ ] Update Banner: Changes tersimpan
- [ ] Delete Banner: Banner hilang dari homepage

## Notes 📌

1. Field `googleMapsLink` masih di-form tetapi tidak dikirim ke database
   - Jika ingin save ke database, tambahkan kolom `google_maps_link` di Supabase
   - Jika tidak perlu, hapus field dari form

2. Error handling sudah proper:
   - Hospital modal tidak tertutup jika ada error
   - Banner modal tutup langsung (bisa ditambahkan error handling jika perlu)

3. Semua field di-map eksplisit untuk avoid mismatch dengan database schema
