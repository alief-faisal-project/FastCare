# 🔐 FIX: Row-Level Security (RLS) Error

## ❌ Error yang Muncul

```
Error: new row violates row-level security policy for table "hero_banners"
```

**Kapan terjadi:** Ketika menambahkan banner kedua (atau update banner)

**Penyebab:** Supabase RLS policy terlalu strict atau belum dikonfigurasi dengan benar

---

## 🔧 SOLUSI

Ada 2 pilihan:

### Option 1: Disable RLS (Untuk Development/Testing)
Paling cepat, cocok untuk development/testing

**Steps:**
1. Buka Supabase Dashboard
2. Go to: `Authentication` → `Policies`
3. Find table: `hero_banners`
4. Click "Disable RLS" button
5. Confirm

**Kelebihan:** Cepat, semua user bisa access
**Kekurangan:** Tidak aman untuk production

### Option 2: Fix RLS Policy (Untuk Production - RECOMMENDED)
Lebih aman, allow authenticated users

**Steps:**
1. Buka Supabase Dashboard
2. Go to: `Authentication` → `Policies`
3. Find table: `hero_banners`
4. Click "New policy" atau edit existing policy
5. Create policy:

```sql
-- Policy Name: "Allow authenticated users to manage hero_banners"

CREATE POLICY "Allow authenticated users" ON "public"."hero_banners"
FOR ALL
USING (auth.role() = 'authenticated_user')
WITH CHECK (auth.role() = 'authenticated_user');
```

Atau lebih detail:

```sql
-- CREATE - Allow authenticated to insert
CREATE POLICY "Allow insert" ON "public"."hero_banners"
FOR INSERT
WITH CHECK (auth.role() = 'authenticated_user');

-- READ - Allow anyone to read (untuk website)
CREATE POLICY "Allow read" ON "public"."hero_banners"
FOR SELECT
USING (true);

-- UPDATE - Allow authenticated to update
CREATE POLICY "Allow update" ON "public"."hero_banners"
FOR UPDATE
USING (auth.role() = 'authenticated_user')
WITH CHECK (auth.role() = 'authenticated_user');

-- DELETE - Allow authenticated to delete
CREATE POLICY "Allow delete" ON "public"."hero_banners"
FOR DELETE
USING (auth.role() = 'authenticated_user');
```

---

## 📋 QUICK FIX (FASTEST - Development)

1. Supabase Dashboard
2. Click table `hero_banners`
3. Tab "RLS"
4. Click "Disable RLS"
5. Done!

Test again, sekarang seharusnya bisa tambah banner ke 2, 3, 4, 5.

---

## 🔍 HOW TO CHECK

**Check RLS Status:**
1. Supabase Dashboard
2. Select table `hero_banners`
3. Check tab "RLS" - ada toggle button
4. If green = enabled, if grey = disabled

**Check Policies:**
1. Go to `Authentication` → `Policies`
2. Find table name
3. See all policies for that table

---

## 💻 SQL SCRIPT (Run in Supabase SQL Editor)

If you want to fix via SQL:

```sql
-- Option 1: Disable RLS (Quick)
ALTER TABLE "public"."hero_banners" DISABLE ROW LEVEL SECURITY;

-- Option 2: Enable RLS with policies (Production)
ALTER TABLE "public"."hero_banners" ENABLE ROW LEVEL SECURITY;

-- Create read policy (allow anyone)
CREATE POLICY "Public read access" ON "public"."hero_banners"
FOR SELECT
USING (true);

-- Create insert policy (allow authenticated)
CREATE POLICY "Authenticated insert" ON "public"."hero_banners"
FOR INSERT
WITH CHECK (auth.role() = 'authenticated_user');

-- Create update policy (allow authenticated)
CREATE POLICY "Authenticated update" ON "public"."hero_banners"
FOR UPDATE
USING (auth.role() = 'authenticated_user')
WITH CHECK (auth.role() = 'authenticated_user');

-- Create delete policy (allow authenticated)
CREATE POLICY "Authenticated delete" ON "public"."hero_banners"
FOR DELETE
USING (auth.role() = 'authenticated_user');
```

---

## ✅ VERIFICATION

Setelah apply fix, test:

```
1. Open Admin Panel
2. Try add banner 2nd time
3. Should work tanpa error RLS
4. Check Supabase - data ada?
5. Refresh website - banner muncul?
```

---

## 🎯 RECOMMENDED APPROACH

1. **Untuk development sekarang:** Use Option 1 (Disable RLS) - faster
2. **Sebelum production:** Use Option 2 (Proper RLS Policies) - safer

---

## 📊 COMPARISON

| Approach | Speed | Security | Best For |
|----------|-------|----------|----------|
| Disable RLS | ⚡⚡⚡ | ⚠️ Low | Development |
| RLS Policies | ⚡ Slow | ✅ High | Production |

---

## 🚨 IF STILL ERROR AFTER FIX

Check:
1. Are you logged in? (Check Auth tab in Supabase)
2. Is user authenticated? (Check Auth session)
3. Did RLS actually disable? (Refresh browser)
4. Try clear cache: Ctrl+Shift+Del

If still error:
- Screenshot the error
- Check Supabase logs (Logs tab)
- Verify RLS toggle is OFF

---

**Quick Command:** Disable RLS di Supabase Dashboard → hero_banners table → RLS tab → Click disable toggle

Done! 🎉
