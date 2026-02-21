# 🔧 QUICK FIX: Update Hospital Admin Panel Tidak Bekerja

## ✅ Yang Sudah Diperbaiki

1. **updateHospital function** - Improved error handling dan logging
2. **Form submit** - Better data preparation sebelum dikirim ke Supabase
3. **Number parsing** - Fixed parseInt/parseFloat dengan Number.parseInt/Number.parseFloat
4. **Toast notifications** - Feedback lebih jelas saat sukses/error

## 🔍 Checklist: Apakah Update Sudah Berfungsi?

### Step 1: Pastikan RLS Policies Benar

**Di Supabase Dashboard:**

1. Buka `https://app.supabase.com`
2. Pilih project
3. Ke **SQL Editor**
4. Copy-paste seluruh isi file: `RLS_POLICIES_SETUP.sql`
5. Klik **RUN**
6. Tunggu sampai selesai

**Expected Output:**

```
✅ 4 rows affected
```

### Step 2: Test di Admin Panel

1. Buka `http://localhost:5173/admin` (sudah login)
2. Klik Edit pada salah satu hospital
3. **Ubah SATU field saja** (misal nama)
4. Klik **Simpan**
5. **Cek DevTools Console (F12)**

**Yang seharusnya muncul di console:**

```
📝 Submitting data: {
  name: "RS Baru",
  address: "...",
  ...
}

🔄 Update payload untuk ID abc123: {
  name: "RS Baru"
}

✅ Hospital berhasil diupdate: {
  id: "abc123",
  name: "RS Baru",
  ...
}
```

### Step 3: Verifikasi Toast Notification

Setelah klik Simpan, seharusnya muncul:

- ✅ **"✅ Rumah sakit berhasil diupdate!"** di kanan atas
- Modal form tertutup otomatis
- List hospital ter-update

## 🐛 Troubleshooting: Jika Masih Error

### Error: "Gagal mengupdate: permission denied"

**Solusi:**

Jalankan SQL ini di Supabase SQL Editor:

```sql
-- Cek RLS policies yang ada
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'hospitals'
ORDER BY policyname;

-- Jika tidak ada policy UPDATE untuk authenticated users:
CREATE POLICY "Allow update for authenticated users"
  ON hospitals
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
```

### Error: "Network error" atau tidak ada response

**Solusi:**

1. Refresh halaman (Ctrl+F5)
2. Cek Supabase connection string di `.env.local`:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJxxx...
   ```
3. Pastikan login dulu sebelum edit

### Error: "Toast notification tidak muncul"

**Solusi:**

Pastikan `<Toaster />` ada di App.tsx:

```tsx
import { Toaster } from "sonner";

export function App() {
  return (
    <>
      <Router>{/* Routes */}</Router>
      <Toaster position="top-center" />
    </>
  );
}
```

### Error: Data tidak update real-time di tab lain

**Solusi:**

Pastikan real-time subscription aktif (sudah di-fix di AppContext):

```typescript
useEffect(() => {
  const hospitalChannel = supabase
    .channel("realtime-hospitals")
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "hospitals" },
      (payload) => {
        console.log("🔔 Hospital UPDATE detected:", payload.new);
        setHospitals((prev) =>
          prev.map((h) =>
            h.id === payload.new.id ? mapHospital(payload.new) : h,
          ),
        );
      },
    )
    .subscribe();
}, []);
```

## 📝 Step-by-Step Test Update

### Scenario: Update nama hospital dari "RS Sehat" menjadi "RS Sukses"

```
1. Buka http://localhost:5173/admin
   ↓
2. Cari hospital bernama "RS Sehat"
   ↓
3. Klik tombol Edit (pensil icon)
   ↓
4. Form modal terbuka
   ↓
5. Hapus field "Nama Rumah Sakit" sebelumnya
   ↓
6. Ketik "RS Sukses"
   ↓
7. Klik tombol "SIMPAN"
   ↓
8. DevTools → Console: Cari log 📝 dan ✅
   ↓
9. Toast notification muncul: "✅ Rumah sakit berhasil diupdate!"
   ↓
10. Modal form tertutup otomatis
    ↓
11. List hospital ter-update: "RS Sukses" muncul di list
    ↓
12. ✅ SUCCESS!
```

## 🚨 Critical Checklist Sebelum Production

- [ ] RLS policies sudah di-setup di Supabase
- [ ] Test update di admin panel berhasil
- [ ] Toast notifications muncul
- [ ] Real-time subscription working (cek console untuk 🔔 logs)
- [ ] Multi-tab sync working (buka 2 tab, update di satu, lihat di tab lain)
- [ ] Error handling works (test dengan invalid data)
- [ ] No console errors saat update

## 📊 Expected Console Output

**Saat berhasil:**

```
📝 Submitting data: Object
🔄 Update payload untuk ID... : Object
✅ Hospital berhasil diupdate: Object
🔔 Hospital UPDATE detected: Object
```

**Saat error:**

```
📝 Submitting data: Object
❌ Supabase Error - Update Hospital: Error
❌ Supabase Error - Update Hospital: {code: "PGRST301", ...}
```

## 💡 Tips

- Jika tidak ada 🔔 log saat update, berarti real-time tidak working
- Jika ada 📝 tapi tidak ada ✅, berarti update ke Supabase gagal (cek RLS)
- Jika ada ✅ tapi list tidak update, berarti state React tidak update (refresh)

## 📞 Jika Masih Tidak Berfungsi

1. **Screenshot error** dari console
2. **Copy full error message**
3. **Check Supabase RLS policies** pastikan sudah di-setup
4. **Restart dev server** (stop/start Vite)
5. **Clear browser cache** (Ctrl+Shift+Delete)
6. **Test di incognito mode**

---

**Updated:** Feb 21, 2025
**Version:** Fixed & Ready
