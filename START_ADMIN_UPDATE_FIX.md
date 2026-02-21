# 🎯 LANGKAH SINGKAT: FIX UPDATE ADMIN PANEL

## ⚡ 5 MENIT QUICK FIX

### Step 1: Setup RLS (2 menit)

1. Buka: https://app.supabase.com
2. Pilih project
3. Menu: **SQL Editor**
4. Buka file: `RLS_POLICIES_SETUP.sql` (di folder project)
5. Copy semua isi
6. Paste di SQL Editor
7. Klik **RUN**
8. Tunggu sampai selesai (status: blue/success)

### Step 2: Refresh Admin Panel (1 menit)

1. Buka: http://localhost:5173/admin
2. Tekan **Ctrl+Shift+Delete** (clear cache)
3. Refresh halaman (F5)

### Step 3: Test Update (2 menit)

1. Klik **Edit** pada salah satu hospital
2. Ubah **Nama** saja
3. Klik **SIMPAN**
4. Harapan:
   - Toast notification hijau: "✅ Rumah sakit berhasil diupdate!"
   - Modal tutup otomatis
   - List ter-update

### Step 4: Verifikasi Real-time (extra)

1. Buka 2 tab:
   - Tab 1: Admin panel
   - Tab 2: Hospital list (http://localhost:5173)
2. Di Tab 1, edit & simpan hospital
3. Lihat Tab 2, seharusnya auto-update
4. ✅ Selesai!

## 🐛 Jika Masih Error

### Error 1: "permission denied"

**Penyebab:** RLS policies belum setup

**Fix:**

```
Ulangi Step 1 (RLS Setup)
Pastikan SQL sudah RUN sampai selesai
Check Supabase untuk status "OK"
```

### Error 2: "Toast tidak muncul"

**Penyebab:** Toaster component hilang

**Fix:**

```
Buka: src/App.tsx
Pastikan ada: <Toaster position="top-center" />
Jika tidak ada, tambahkan di akhir JSX
Restart dev server
```

### Error 3: "Modal tidak tutup"

**Penyebab:** Update berhasil tapi ada error di response

**Cek:**

1. Buka DevTools: F12
2. Tab Console
3. Cari error message
4. Screenshot dan check di guide troubleshooting

### Error 4: "Network error"

**Penyebab:** Koneksi Supabase

**Fix:**

```
1. Cek .env.local
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
2. Jangan ada typo
3. Restart dev server: npm run dev
```

## ✅ Tanda Sukses

Saat berhasil:

- ✅ Toast notification muncul (hijau)
- ✅ Modal form tertutup
- ✅ List ter-update
- ✅ Console: ada log 📝 ✅ 🔔

## 📞 Jika Tidak Berfungsi

1. Screenshot console error (F12 → Console)
2. Copy error message
3. Cek file: `ADMIN_UPDATE_QUICK_FIX.md` untuk troubleshooting lengkap

---

**Time:** 5 menit
**Difficulty:** ⭐ Easy
**Status:** Ready to Test
