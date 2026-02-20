# 🎉 PERBAIKAN SUPABASE UPDATE - PENJELASAN LENGKAP

## 📋 Ringkasan Masalah

Anda mengalami error:

```
Cannot coerce the result to a single JSON object
```

Ketika mencoba menambah atau update data di Admin Panel.

---

## 🔍 AKAR PENYEBAB

### Masalah 1: Penggunaan `.single()` yang Tidak Tepat

**`.single()` adalah method Supabase yang:**

- Mengharapkan query mengembalikan **TEPAT 1 baris**
- Jika mengembalikan 0 baris → Error
- Jika mengembalikan > 1 baris → Error
- Jika response structure tidak sesuai → Error

**Kenapa terjadi error?**

Saat melakukan `.insert()` dan `.select()`:

```typescript
// ❌ WRONG - Ini yang menyebabkan error
await supabase.from("hospitals").insert([payload]).select().single(); // ← Masalah di sini!
```

Response dari Supabase bisa:

1. Kosong/null (jika ada validation error)
2. Array dengan data, tapi `.single()` hanya bisa handle single object

**Solusi:**

```typescript
// ✅ CORRECT - Hapus .single()
const { data, error } = await supabase
  .from("hospitals")
  .insert([payload])
  .select(); // ← Ini return array

// Handle array response
if (!error && data && data.length > 0) {
  setHospitals((prev) => [mapHospital(data[0]), ...prev]);
}
```

---

## 🛠️ PERUBAHAN YANG DILAKUKAN

### 1. **AppContext.tsx - Function `addHospital`**

```typescript
// SEBELUM (❌ Error)
const { data, error } = await supabase
  .from("hospitals")
  .insert([payload])
  .select()
  .single();

if (!error && data) {
  setHospitals((prev) => [mapHospital(data), ...prev]);
}

// SESUDAH (✅ Bekerja)
const { data, error } = await supabase
  .from("hospitals")
  .insert([payload])
  .select(); // ← Hapus .single()

if (!error && data && data.length > 0) {
  // ← Check array length
  setHospitals((prev) => [mapHospital(data[0]), ...prev]); // ← Akses array[0]
}
```

**Penjelasan:**

- `.select()` return array `data[]`
- Kita check `data.length > 0` untuk pastikan ada data
- Akses `data[0]` untuk get first item

---

### 2. **AppContext.tsx - Function `updateHospital`**

Sama seperti di atas:

```typescript
// SEBELUM
.select().single();

// SESUDAH
.select();
if (!error && data && data.length > 0) {
  setHospitals((prev) =>
    prev.map((h) => (h.id === id ? mapHospital(data[0]) : h))
  );
}
```

---

### 3. **AppContext.tsx - Function `addHeroBanner` & `updateHeroBanner`**

Sama dengan hospital:

```typescript
// SEBELUM
.select().single();

// SESUDAH
.select();
if (data && data.length > 0) {
  setHeroBanners((prev) => [...prev, data[0]]);
}
```

---

### 4. **AppContext.tsx - Tambah Default Values**

Untuk field yang sering hilang:

```typescript
const payload = {
  // ... field lainnya
  latitude: hospital.latitude ?? -6.1185, // ← Default Serang
  longitude: hospital.longitude ?? 106.1564, // ← Default Serang
  rating: hospital.rating ?? 0, // ← Default 0
};
```

Ini memastikan field tidak undefined saat insert.

---

### 5. **AdminPanel.tsx - Better Error Handling**

```typescript
// SEBELUM
onSave={(data) => {
  if (editingBanner) {
    updateHeroBanner(editingBanner.id, data);
  } else {
    addHeroBanner(data as any);
  }
  setShowBannerForm(false);  // ← Close langsung, mungkin belum selesai
}}

// SESUDAH
onSave={async (data) => {
  try {
    if (editingBanner) {
      await updateHeroBanner(editingBanner.id, data);  // ← Tunggu selesai
    } else {
      await addHeroBanner(data as HeroBanner);  // ← Tunggu selesai
    }
    setShowBannerForm(false);  // ← Close hanya kalau sukses
    setEditingBanner(null);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Gagal menyimpan banner";
    alert("Error: " + errorMessage);  // ← Show error message
  }
}}
```

**Benefit:**

- ✅ Async/await - pastikan operation selesai
- ✅ Try-catch - tangkap error
- ✅ Modal tidak close kalau ada error
- ✅ User tahu masalahnya apa

---

### 6. **AdminPanel.tsx - TypeScript Types**

Ganti `as any` dengan proper types:

```typescript
// SEBELUM
onChange={(e) => setFormData({ ...formData, type: e.target.value as any })

// SESUDAH
onChange={(e) => setFormData({
  ...formData,
  type: e.target.value as Hospital["type"]  // ← Type-safe
})
```

---

## 🧪 TESTING CHECKLIST

Lakukan testing dengan urutan ini:

### Test 1: Tambah Rumah Sakit

```
1. Buka http://localhost:5173/admin
2. Login dengan credential admin
3. Klik "Tambah RS"
4. Isi semua field yang required:
   - Nama Rumah Sakit
   - Tipe (pilih dari dropdown)
   - Kelas (pilih dari dropdown)
   - Kota
   - Alamat
   - Telepon
   - URL Gambar
   - Deskripsi
5. Klik "Tambah Rumah Sakit"
6. ✅ Hasil:
   - Modal menutup
   - Data muncul di table
   - Data muncul di Supabase
```

### Test 2: Edit Rumah Sakit

```
1. Di Admin Panel, klik tombol edit (pensil icon)
2. Ubah beberapa field
3. Klik "Simpan Perubahan"
4. ✅ Hasil:
   - Modal menutup
   - Table terupdate
   - Supabase terupdate
```

### Test 3: Hapus Rumah Sakit

```
1. Klik tombol hapus (trash icon)
2. Confirm di alert
3. ✅ Hasil:
   - Data hilang dari table
   - Data hilang dari Supabase
```

### Test 4: Tambah Banner

```
1. Klik tab "Hero Banner"
2. Klik "Tambah Banner"
3. Isi form:
   - Judul
   - Subjudul
   - URL Gambar
   - Link (optional)
   - Urutan
   - Check "Aktif"
4. Klik "Tambah"
5. ✅ Hasil:
   - Banner muncul di list
   - Banner tersimpan di Supabase
```

### Test 5: Edit Banner

```
1. Klik tombol edit banner
2. Ubah judul atau field lain
3. Klik "Simpan"
4. ✅ Hasil:
   - List terupdate
   - Supabase terupdate
```

---

## 📊 FLOW DIAGRAM - SEBELUM vs SESUDAH

### SEBELUM (Bermasalah)

```
User Input Form
    ↓
OnSave Triggered
    ↓
addHospital() / addHeroBanner()
    ↓
Supabase .insert().select().single()
    ↓
❌ ERROR: "Cannot coerce to single JSON"
    ↓
Modal tetap terbuka
UI tidak terupdate
Data tidak tersimpan
```

### SESUDAH (Fixed)

```
User Input Form
    ↓
OnSave Triggered
    ↓
try {
  addHospital() / addHeroBanner()
    ↓
  Supabase .insert().select()  [Array response]
    ↓
  ✅ Handle data[0]
    ↓
  setHospitals([...]) / setHeroBanners([...])
    ↓
  Modal close
  UI terupdate immediately
  Data tersimpan di Supabase
} catch (error) {
  Show error alert
  Modal tetap terbuka
}
```

---

## 💡 KEY LEARNINGS

### `.select()` vs `.select().single()`

| Method               | Return       | Gunakan Kapan                    |
| -------------------- | ------------ | -------------------------------- |
| `.select()`          | `Array<T>`   | Bisa return 0, 1, atau >1 baris  |
| `.select().single()` | `T` (single) | **HARUS** return exactly 1 baris |

### Best Practice untuk CRUD

```typescript
// CREATE (Insert)
const { data, error } = await supabase.from("table").insert([payload]).select(); // ← Array

// READ (Fetch)
const { data, error } = await supabase.from("table").select(); // ← Array

// READ One (Fetch by ID)
const { data, error } = await supabase
  .from("table")
  .select()
  .eq("id", id)
  .single(); // ← Single, karena ID unique

// UPDATE
const { data, error } = await supabase
  .from("table")
  .update(payload)
  .eq("id", id)
  .select(); // ← Array

// DELETE
const { error } = await supabase.from("table").delete().eq("id", id); // ← Tidak perlu .select()
```

---

## 🚀 DEPLOYMENT

Setelah fix ini, silakan jalankan:

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview build
npm run preview
```

Semua data baru yang ditambahkan akan tersimpan dengan baik di Supabase! 🎉

---

## 📞 SUPPORT

Kalau masih ada error:

1. **Cek Supabase Console** untuk melihat actual error
2. **Cek Browser Console** (F12) untuk melihat error detail
3. **Pastikan field names sesuai** di database schema
4. **Cek Row-level Security** policies di Supabase

Happy coding! 💻✨
