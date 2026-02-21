# ✅ SOLUTION - RLS ERROR FIX

## 🎯 MASALAH

Ketika menambahkan banner ke-2, muncul error:

```
"Error: new row violates row-level security policy for table hero_banners"
```

---

## ✨ SOLUSI (PILIH SATU)

### ✅ CARA 1: CEPAT (2-3 MENIT) - RECOMMENDED SEKARANG

1. Buka Supabase Dashboard: https://supabase.com
2. Login & select project "FastCare"
3. Left sidebar → Click table "hero_banners"
4. Click tab "RLS"
5. Click toggle button → DISABLE (tutup toggle)
6. Refresh browser
7. Go back to app, try add banner 2 lagi
8. **DONE!** Should work now ✅

### ✅ CARA 2: VIA SQL (JIKA DASHBOARD TIDAK BERHASIL)

1. Supabase Dashboard
2. Left sidebar → Click "SQL Editor"
3. Click "New query"
4. Copy-paste:

```sql
ALTER TABLE "public"."hero_banners" DISABLE ROW LEVEL SECURITY;
```

5. Click "Run"
6. Success ✅
7. Back to app, test

---

## 🧪 TEST SETELAH FIX

```
1. Admin Panel → Hero Banner tab
2. Click "Tambah Banner"
3. Fill form (judul, gambar, dll)
4. Click "Tambah"
5. Expected: ✅ Success, no error

6. Go to website home page
7. Banner should show di carousel
8. Multiple banners = carousel works ✅
```

---

## 📖 DETAILED GUIDES (OPTIONAL)

Untuk penjelasan lebih detail:

- `QUICK_FIX_RLS_5MIN.md` - Step-by-step dengan screenshot
- `SUPABASE_RLS_SOLUTION.md` - Penjelasan detail + production fix
- `BANNER_END_TO_END_TEST.md` - Cara test setelah fix

---

## 🎯 SUMMARY

| Langkah   | Action           | Waktu      |
| --------- | ---------------- | ---------- |
| 1         | Buka Supabase    | 1 min      |
| 2         | Disable RLS      | 1 min      |
| 3         | Test banner      | 1 min      |
| **Total** | **Fix Complete** | **~3 min** |

---

**NEXT STEP:**

1. Follow Cara 1 atau Cara 2 di atas
2. Test add banner ke-2
3. Verify banner muncul di website
4. Done! ✅

**Any issues?** Check console (F12) atau read detailed guides.
