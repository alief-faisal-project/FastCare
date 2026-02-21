# 🔐 SUPABASE RLS - STEP BY STEP FIX GUIDE

## 📋 Problem Summary

Error: `"new row violates row-level security policy for table "hero_banners"`

Terjadi saat: Menambahkan banner ke-2 atau lebih

Sebab: RLS (Row-Level Security) policy pada table `hero_banners` terlalu restrictive atau belum dikonfigurasi dengan benar untuk allow authenticated users melakukan INSERT/UPDATE/DELETE.

---

## 🚀 QUICK FIX (2 MENIT)

### PALING CEPAT - Disable RLS

**Via Dashboard:**

1. Buka: https://supabase.com/dashboard
2. Masuk ke project FastCare
3. Left sidebar → Klik `hero_banners` table
4. Tab `RLS`
5. Klik tombol besar "Disable RLS"
6. Refresh browser
7. Test tambah banner ke-2 lagi

**Done!** ✅

---

## 💻 ALTERNATIVE - Via SQL (Jika Dashboard tidak berhasil)

**Copy-paste ke Supabase SQL Editor:**

1. Buka: https://supabase.com/dashboard
2. Left sidebar → Click `SQL Editor`
3. Click `New query`
4. Copy-paste script ini:

```sql
-- Disable RLS pada table hero_banners
ALTER TABLE "public"."hero_banners" DISABLE ROW LEVEL SECURITY;
```

5. Click `Run` button
6. Wait for success message
7. Refresh browser
8. Test tambah banner lagi

**Done!** ✅

---

## ✅ VERIFY - Check if RLS Disabled

### Method 1: Via Dashboard

1. Go to table `hero_banners`
2. Tab `RLS`
3. Should show "0 active policies" or "RLS disabled"

### Method 2: Via SQL

1. Go to SQL Editor
2. Run query:

```sql
-- Check if RLS enabled
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname = 'hero_banners';
```

3. Result: `relrowsecurity = false` means RLS is disabled ✅

---

## 🧪 TEST

After fix, test:

```
1. Admin Panel → Hero Banner tab
2. Click "Tambah Banner"
3. Fill form:
   - Judul: "Banner Test 2"
   - Gambar: Upload atau URL
   - Aktif: ✓ Check
   - Urutan: 2
4. Click "Tambah"
5. EXPECTED: Modal tutup, no error ✅
6. Banner muncul di list ✅
7. Check Supabase dashboard - data ada? ✅
```

---

## 🛡️ PRODUCTION FIX (Safe - Use Later)

Jika ingin tetap enable RLS dengan policy yang benar:

**Run this SQL:**

```sql
-- Enable RLS
ALTER TABLE "public"."hero_banners" ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow anyone to READ
DROP POLICY IF EXISTS "Allow read" ON "public"."hero_banners";
CREATE POLICY "Allow read" ON "public"."hero_banners"
FOR SELECT
USING (true);

-- Policy 2: Allow authenticated to INSERT
DROP POLICY IF EXISTS "Allow insert" ON "public"."hero_banners";
CREATE POLICY "Allow insert" ON "public"."hero_banners"
FOR INSERT
WITH CHECK (auth.role() = 'authenticated_user');

-- Policy 3: Allow authenticated to UPDATE
DROP POLICY IF EXISTS "Allow update" ON "public"."hero_banners";
CREATE POLICY "Allow update" ON "public"."hero_banners"
FOR UPDATE
USING (auth.role() = 'authenticated_user')
WITH CHECK (auth.role() = 'authenticated_user');

-- Policy 4: Allow authenticated to DELETE
DROP POLICY IF EXISTS "Allow delete" ON "public"."hero_banners";
CREATE POLICY "Allow delete" ON "public"."hero_banners"
FOR DELETE
USING (auth.role() = 'authenticated_user');
```

---

## ❓ FAQ

**Q: Apakah harus disable RLS?**
A: Untuk development/testing sekarang, yes. Untuk production, sebaiknya gunakan proper policies.

**Q: Apakah aman disable RLS?**
A: Untuk development, aman. Untuk production, tidak - gunakan policies.

**Q: Bagaimana caranya test setelah fix?**
A: Buka Admin Panel, coba tambah 2-5 banner, semuanya harus bisa tanpa error.

**Q: Masih error setelah disable RLS?**
A:

- Refresh browser (Ctrl+Shift+R)
- Clear cache (Ctrl+Shift+Del)
- Check console (F12) untuk error lain
- Verify auth session exist

**Q: Bagaimana jika user tidak authenticated?**
A: Pastikan user sudah login sebelum access admin panel.

---

## 🎯 CHECKLIST

- [ ] I understand RLS error
- [ ] I disabled RLS (via dashboard atau SQL)
- [ ] I refreshed browser
- [ ] I tested adding 2nd banner
- [ ] No error appears
- [ ] Banner saved to Supabase
- [ ] Website shows new banner

If all checked ✅ → **DONE!**

---

## 📞 IF STILL ERROR

1. **Clear everything:**
   - Close browser completely
   - Clear cache: Ctrl+Shift+Del (select all)
   - Reopen browser
   - Go to admin panel again

2. **Check in Supabase:**
   - Go to `hero_banners` table
   - Tab `RLS`
   - Confirm no policies exist or RLS is OFF

3. **Check logs:**
   - Supabase Dashboard
   - Go to `Logs` section
   - Look for recent errors
   - Take screenshot

4. **Last resort:**
   - Drop all policies manually
   - Disable RLS completely
   - Test again

---

## 🔗 HELPFUL LINKS

- Supabase Dashboard: https://supabase.com/dashboard
- Docs on RLS: https://supabase.com/docs/guides/auth/row-level-security

---

**Status:** Ready to fix in 2 minutes ⏱️
**Difficulty:** Easy ⭐
**Time to implement:** 2-5 minutes

**NEXT STEP:** Follow "QUICK FIX" section above!
