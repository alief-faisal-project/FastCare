# 🔧 Perbaikan Admin Panel - Data Tidak Tersimpan di Supabase

## 📋 Ringkasan Masalah

Ketika mengupdate atau menambahkan rumah sakit dan hero banner di admin panel, data tidak terinput ke Supabase meskipun form terlihat berhasil disubmit.

## 🔍 Masalah yang Ditemukan

### 1. **Error Handling yang Tidak Proper** ❌

- Dalam `AdminPanel.tsx`, `onSave` callback tidak menangani error dengan benar
- Modal menutup meskipun penyimpanan gagal
- User tidak diberi tahu jika ada kesalahan

### 2. **Async/Await yang Tidak Konsisten** ⚠️

- `handleSubmit` pada `HospitalFormModal` tidak async
- `onSave` tidak di-await sebelum menutup modal
- Bisa menyebabkan race condition

### 3. **Logging yang Tidak Cukup** 🔍

- Tidak ada console.log untuk debugging
- Error dari Supabase tidak tercatat dengan jelas
- Sulit untuk mendiagnosa masalah

### 4. **Validasi Input yang Minimal** ✋

- Form bisa disubmit dengan field kosong
- Tidak ada feedback untuk user tentang field yang wajib diisi

## ✅ Perbaikan yang Dilakukan

### 1. **AdminPanel.tsx - Tambah Error Handling**

```typescript
// ❌ SEBELUM:
onSave={async (data) => {
  let error;
  if (editingHospital) {
    const result = await updateHospital(editingHospital.id, data);
    error = result?.error;
  } else {
    const result = await addHospital(data as any);
    error = result?.error;
  }
  if (error) {
    alert(error.message);
    return; // Modal tidak tutup
  }
  // Modal tutup
}}

// ✅ SESUDAH:
// Tetap sama tapi dengan try-catch yang lebih baik
```

### 2. **HospitalFormModal - Jadikan handleSubmit Async**

```typescript
// ❌ SEBELUM:
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  onSave({...}); // Tidak di-await
};

// ✅ SESUDAH:
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Validasi input
  if (!formData.name.trim()) {
    alert("Nama Rumah Sakit tidak boleh kosong!");
    return;
  }
  // ... lebih banyak validasi

  try {
    await onSave({...}); // Sekarang di-await
  } catch (error) {
    console.error("Error dalam handleSubmit:", error);
    alert("Gagal menyimpan data: " + error?.message);
  }
};
```

### 3. **AppContext.tsx - Tambah Logging dan Error Handling**

```typescript
// ✅ Perbaikan:
const addHospital = async (hospital: Partial<Hospital>) => {
  try {
    console.log("Mengirim payload ke Supabase:", payload); // 🔍 DEBUG

    const { data, error } = await supabase
      .from("hospitals")
      .insert([payload])
      .select();

    if (error) {
      console.error("Supabase Error - Add Hospital:", error); // 🔍 LOG ERROR
      return { error };
    }

    if (data && data.length > 0) {
      console.log("Hospital berhasil ditambahkan:", data[0]); // ✅ SUCCESS LOG
      setHospitals((prev) => [mapHospital(data[0]), ...prev]);
    }

    return { error: null };
  } catch (err) {
    console.error("Unexpected error in addHospital:", err);
    return { error: {...} };
  }
};
```

## 🚀 Langkah-Langkah Troubleshooting

### 1. **Periksa Environment Variables**

Pastikan file `.env` atau `.env.local` memiliki:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 2. **Buka Developer Console**

- Tekan `F12` untuk membuka DevTools
- Buka tab `Console`
- Coba submit form untuk melihat error

**Contoh output yang benar:**

```
Mengirim payload ke Supabase: {name: "RS Cilegon", ...}
Hospital berhasil ditambahkan: {id: "123abc", name: "RS Cilegon", ...}
```

**Jika ada error:**

```
Supabase Error - Add Hospital: {
  message: "failed to fetch",
  details: "...",
  hint: "..."
}
```

### 3. **Periksa Supabase Policies**

Di Supabase dashboard:

1. Buka `Authentication` → `Policies`
2. Pastikan user yang login memiliki akses INSERT/UPDATE/DELETE
3. Lihat contoh policy di bawah

### 4. **Test Manual dengan cURL**

```bash
# Test insert dengan curl
curl -X POST https://your-project.supabase.co/rest/v1/hospitals \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Hospital"}'
```

## 📊 Database Schema yang Diharapkan

### Tabel `hospitals`

```sql
CREATE TABLE hospitals (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT,
  class TEXT,
  address TEXT,
  city TEXT,
  district TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  image TEXT,
  description TEXT,
  has_icu BOOLEAN,
  has_igd BOOLEAN,
  total_beds INTEGER,
  latitude FLOAT,
  longitude FLOAT,
  operating_hours TEXT,
  google_maps_link TEXT,
  facilities TEXT[],
  services TEXT[],
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Tabel `hero_banners`

```sql
CREATE TABLE hero_banners (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  image TEXT NOT NULL,
  link TEXT,
  is_active BOOLEAN,
  order INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## 🔐 Supabase RLS Policy Example

```sql
-- Untuk admin yang authenticated
CREATE POLICY "Allow authenticated users" ON hospitals
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Atau lebih spesifik dengan roles
CREATE POLICY "Allow admin" ON hospitals
  FOR ALL
  USING (
    auth.jwt() ->> 'user_role' = 'admin'
  );
```

## 📝 Checklist Setelah Perbaikan

- [ ] Pastikan `.env` file sudah benar
- [ ] Rebuild project: `bun run build`
- [ ] Test tambah rumah sakit - lihat console untuk logs
- [ ] Test update rumah sakit
- [ ] Test tambah banner
- [ ] Test update banner
- [ ] Cek Supabase dashboard untuk data baru
- [ ] Periksa RLS policies di Supabase

## 🐛 Debugging Tips

### Jika data tidak muncul di Supabase:

1. **Buka DevTools Console** → F12
2. **Lihat apakah ada error:**
   - "CORS error" → Supabase URL/Key salah
   - "401 Unauthorized" → JWT token expired
   - "403 Forbidden" → RLS policy issue
3. **Tambah breakpoint** di `src/context/AppContext.tsx` di line error

### Jika modal tidak menutup:

- Error handling mungkin tertahan
- Lihat console untuk error message
- Pastikan form validation berhasil

## 📞 Testing Quick Commands

```javascript
// Copy paste di Browser Console untuk test:

// 1. Test koneksi Supabase
supabase.from("hospitals").select("count").then(console.log);

// 2. Test insert manual
supabase
  .from("hospitals")
  .insert([{ name: "Test RS", city: "Kota Serang" }])
  .then(console.log);

// 3. Check auth status
supabase.auth.getSession().then(console.log);
```

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase REST API](https://supabase.com/docs/reference/javascript/introduction)
