# ✅ VERIFICATION & TESTING GUIDE

## 🎯 OBJECTIVE

Verify bahwa semua fixes sudah diterapkan dan berfungsi dengan baik:

1. ✅ Update Hospital - works
2. ✅ Banner Add/Edit/Delete - works
3. ✅ Error messages - clear & visible

---

## 📋 BUILD STATUS

**Last Build:** ✅ SUCCESS (Feb 20, 2026)

```
✓ 1763 modules transformed
✓ built in 5.97s
```

---

## 🧪 TEST PROTOCOL

### STEP 1: Open Admin Panel

1. Start dev server: `npm run dev`
2. Open browser: `http://localhost:5173`
3. Go to Admin Panel (menu → Admin)
4. Open DevTools: Press `F12`
5. Go to Console tab
6. Filter logs: Search for emoji logs (📤, ❌, ✅, 💥)

---

### STEP 2: Test Hospital Update

```
Action:
1. Rumah Sakit tab
2. Find any hospital
3. Click Edit (pencil icon)
4. Change any field (nama, alamat, phone, etc)
5. Click "Simpan Perubahan"

Expected Result:
✅ Modal closes automatically
✅ Hospital data updated in list
✅ Data updated in Supabase dashboard
✅ No error alert
✅ Console shows: "Update error:" or success message

Console Output EXPECTED:
"Update payload untuk ID [id]: {...}"
"Hospital berhasil diupdate: {...}"

Console Output IF ERROR:
"Update error: {message: '...'}"
"Gagal mengupdate: [error message]"
```

---

### STEP 3: Test Banner Add

```
Action:
1. Hero Banner tab
2. Click "Tambah Banner" button
3. Fill form:
   - Judul: "Test Banner"
   - Subtitle: "Testing"
   - Image: Valid URL (e.g., https://picsum.photos/1200/400)
   - Link: https://example.com
   - Aktif: ✓ (checked)
   - Urutan: 1
4. Click "Tambah"

Expected Result:
✅ Modal closes
✅ Banner appears in list
✅ No error alert
✅ Data in Supabase

Console Output EXPECTED:
"Sending banner payload: {title: 'Test Banner', subtitle: '...', is_active: true, order: 1, ...}"
"✅ Banner berhasil ditambahkan: [...]"

Console Output IF ERROR:
"Sending banner payload: {...}"
"❌ Supabase Error - Add Banner: {message: '...'}"
"Error: Gagal menambahkan banner"
```

---

### STEP 4: Test Banner Edit

```
Action:
1. Click Edit (pencil) on any banner
2. Change judul or subtitle
3. Click "Simpan"

Expected Result:
✅ Modal closes
✅ Banner updated in list
✅ No error alert
✅ Data updated in Supabase

Console Output:
"Update banner ID [id]: {...}"
"✅ Banner berhasil diupdate: [...]"
```

---

### STEP 5: Test Banner Delete

```
Action:
1. Click Delete (trash icon) on any banner
2. Confirm deletion

Expected Result:
✅ Banner removed from list
✅ No error alert
✅ Data deleted from Supabase
```

---

## 🔍 CONSOLE LOG PATTERNS

### SUCCESS PATTERNS

**Hospital Add:**

```
"Mengirim payload ke Supabase: {name: '...', address: '...', ...}"
"Hospital berhasil ditambahkan: {id: '...', ...}"
```

**Hospital Update:**

```
"Update payload untuk ID abc123: {name: '...', ...}"
"Hospital berhasil diupdate: {id: 'abc123', ...}"
```

**Banner Add:**

```
"Sending banner payload: {title: '...', is_active: true, order: 1, ...}"
"✅ Banner berhasil ditambahkan: {id: '...', ...}"
```

**Banner Update:**

```
"Update banner ID abc123: {title: '...', is_active: true, ...}"
"✅ Banner berhasil diupdate: {id: 'abc123', ...}"
```

### ERROR PATTERNS

**Banner Field Mismatch (OLD - should NOT see):**

```
❌ Would show if fields not mapped to snake_case
Supabase would return error about unknown field
```

**Proper Error (NEW - should see):**

```
"❌ Supabase Error - Add Banner: {code: 'PGRST102', message: 'Invalid input...'}"
"Error: Gagal menambahkan banner"
Alert: "Error: Gagal menambahkan banner"
```

---

## 📊 VERIFICATION CHECKLIST

| Feature         | Status | Console Logs                       | Supabase Data              |
| --------------- | ------ | ---------------------------------- | -------------------------- |
| Hospital Update | ✅     | "Hospital berhasil diupdate"       | Check `hospitals` table    |
| Hospital Delete | ✅     | No error                           | Row deleted                |
| Banner Add      | 🔄     | "Banner berhasil ditambahkan"      | Check `hero_banners` table |
| Banner Update   | 🔄     | "Banner berhasil diupdate"         | Check `hero_banners` table |
| Banner Delete   | ✅     | No error                           | Row deleted                |
| Error Messages  | ✅     | "❌ Error: ..."                    | N/A                        |
| Field Mapping   | ✅     | "is_active: true" (not "isActive") | snake_case columns         |

---

## 🚨 IF TESTS FAIL

### Symptom: "Error: Gagal menyimpan banner" still appears

**Action:**

1. Check console for detailed error: Look for "❌ Supabase Error"
2. Take screenshot of error
3. Check database schema:

   ```sql
   -- In Supabase SQL Editor:
   SELECT column_name FROM information_schema.columns
   WHERE table_name = 'hero_banners'
   ORDER BY ordinal_position;
   ```

   Should show: `title`, `subtitle`, `image`, `link`, `is_active`, `order`

4. Check RLS policies:
   Supabase Dashboard → Authentication → Policies
   - `hero_banners` table should allow INSERT, UPDATE, DELETE for authenticated users

---

### Symptom: Hospital update doesn't work

**Action:**

1. Check console error message
2. Check if error contains details about field name
3. Try updating a single field first
4. Check Supabase RLS policies for `hospitals` table

---

### Symptom: Modal closes but data not saved

**Action:**

1. F12 → Console → Look for success log
2. F12 → Network → Check Supabase request
3. Check if data actually in Supabase
4. If success log shows but data not in DB:
   - Check RLS policies
   - Check if authenticated user has permission
   - Try disable RLS and test again

---

## 📞 DEBUG COMMANDS

```typescript
// In Console (F12):

// Check hospitals state
document.querySelector('[data-testid="hospitals-list"]');

// Check banners state
document.querySelector('[data-testid="banners-list"]');

// Force refresh from Supabase
window.location.reload();
```

---

## ✅ SUCCESS CRITERIA

All tests must show:

1. ✅ No error alerts (unless intentionally causing error)
2. ✅ Data updates immediately in UI
3. ✅ Data visible in Supabase dashboard
4. ✅ Console shows success logs with emoji (✅)
5. ✅ Modal closes after successful save
6. ✅ Modal stays open if error occurs

---

**Next Step:** Run tests above and report results!
