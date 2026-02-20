# 🛠️ Debugging Guide - Admin Panel Data Tidak Masuk Supabase

## Quick Diagnostic Steps

### Step 1: Check Console for Errors (F12)
```
1. Buka browser DevTools → Tekan F12
2. Klik tab "Console"
3. Coba submit form di admin panel
4. Lihat apakah ada error message
```

**Contoh error yang mungkin muncul:**
- `CORS error: blocked by CORS policy` → Supabase URL salah
- `401 Unauthorized` → JWT token expired atau tidak valid
- `403 Forbidden` → RLS policy tidak allow insert
- `failed to fetch` → Network error atau server down

### Step 2: Verify Environment Variables
```bash
# Buka file .env di root project
# Pastikan ada:
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxx

# Restart dev server setelah mengubah .env
```

### Step 3: Check Supabase Connection
Copy-paste ini di browser Console:
```javascript
// Cek koneksi ke Supabase
const { supabase } = await import('/src/lib/supabase.ts');
supabase.auth.getSession().then(r => {
  console.log('Session:', r);
  if (r.data?.session) {
    console.log('✅ Authenticated as:', r.data.session.user.email);
  } else {
    console.log('❌ Not authenticated - please login first');
  }
});
```

### Step 4: Test Insert Manually
```javascript
// Test insert ke hospitals table
const { supabase } = await import('/src/lib/supabase.ts');
const { data, error } = await supabase.from('hospitals').insert([{
  name: 'Test RS Manual',
  type: 'RS Umum',
  class: 'C',
  address: 'Jl. Test',
  city: 'Kota Serang',
  district: 'Test',
  phone: '0274123456',
  image: 'https://via.placeholder.com/300x200',
  description: 'Test'
}]).select();

if (error) {
  console.error('❌ Error:', error);
} else {
  console.log('✅ Success:', data);
}
```

## Common Issues & Solutions

### ❌ Issue: "Error: Multiple objects in state update"
**Penyebab:** Form data tidak di-serialize dengan benar
```javascript
// ❌ SALAH:
onSave(formData); // Promise tidak di-await

// ✅ BENAR:
await onSave(formData); // Wait for Promise
```

### ❌ Issue: "CORS Error: blocked by CORS policy"
**Penyebab:** Supabase URL atau ANON KEY tidak cocok
```bash
# Solusi:
1. Buka Supabase Dashboard
2. Project Settings → API
3. Copy URL dan anon key yang benar
4. Update .env file
5. Restart server: Ctrl+C, lalu bun run dev
```

### ❌ Issue: "401 Unauthorized"
**Penyebab:** User tidak ter-authenticate atau session expired
```javascript
// Check di console:
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);

// Jika null, perlu login terlebih dahulu
// Buka halaman login: http://localhost:5173/login
```

### ❌ Issue: "403 Forbidden"
**Penyebab:** RLS (Row Level Security) policy tidak allow insert
```sql
-- Solusi di Supabase SQL Editor:
-- Disable RLS untuk testing (JANGAN di production!)
ALTER TABLE hospitals DISABLE ROW LEVEL SECURITY;

-- Atau buat policy yang allow authenticated users:
CREATE POLICY "Allow authenticated" ON hospitals
  FOR ALL
  USING (auth.role() = 'authenticated');
```

### ❌ Issue: Data submit tapi tidak muncul di Supabase
**Penyebab:** Mungkin belum tersimpan atau error tidak ditampilkan
```javascript
// Debug dengan menambah logs:
console.log('Form submitted with:', formData);
await onSave(formData);
console.log('Saved successfully');

// Cek di browser console untuk melihat output
```

## Detailed Payload Structure

### Hospital Insert Payload
```javascript
{
  name: "RS Cilegon",                          // ✅ Required
  type: "RS Umum",                             // ✅ Required
  class: "C",                                  // ✅ Required
  address: "Jl. Ahmad Yani No 1",             // ✅ Required
  city: "Kota Serang",                         // ✅ Required
  district: "Kecamatan Serang",               // Optional
  phone: "0254-200000",                        // ✅ Required
  email: "rs@example.com",                     // Optional
  website: "https://example.com",              // Optional
  image: "https://example.com/image.jpg",     // ✅ Required (must be valid URL)
  description: "Rumah Sakit Terkemuka",       // ✅ Required
  has_icu: true,                               // Boolean (default: false)
  has_igd: true,                               // Boolean (default: false)
  total_beds: 150,                             // Number (default: 0)
  operating_hours: "24 Jam",                   // String (default: "24 Jam")
  google_maps_link: "https://maps.app.goo.gl/xxx", // Optional
  latitude: -6.1185,                           // Float (default: -6.1185)
  longitude: 106.1564,                         // Float (default: 106.1564)
  facilities: ["IGD", "ICU", "Laboratorium"],  // Array of strings
  services: ["Rawat Inap", "Rawat Jalan"],    // Array of strings
}
```

### Banner Insert Payload
```javascript
{
  title: "Selamat Datang",                     // ✅ Required
  subtitle: "Cari rumah sakit terbaik",       // Optional
  image: "https://example.com/banner.jpg",   // ✅ Required
  link: "https://example.com",                // Optional (for button link)
  is_active: true,                            // Boolean
  order: 1,                                   // Number (for display order)
}
```

## Browser Console Debugging

### Print Current Form State
```javascript
// Lihat state form saat ini
console.table({
  name: "RS Cilegon",
  city: "Kota Serang",
  phone: "0254-200000",
  image: "https://via.placeholder.com/300x200",
  description: "Test RS"
});
```

### Check Network Activity
1. DevTools → Network tab
2. Filter untuk "supabase" atau "hospitals"
3. Klik pada request yang POST/INSERT
4. Lihat:
   - **Request Headers**: Authorization token ada?
   - **Request Body**: Data apa yang dikirim?
   - **Response**: Ada error message?
   - **Status**: 200 (success), 401 (auth), 403 (permission), 500 (server error)

### Capture Full Error Details
```javascript
// Cek error dengan detail lengkap
try {
  const { data, error } = await supabase.from('hospitals').insert([{
    name: 'Test'
  }]).select();
  
  if (error) {
    console.error('🔴 SUPABASE ERROR DETAILS:');
    console.error('Message:', error.message);
    console.error('Details:', error.details);
    console.error('Hint:', error.hint);
    console.error('Code:', error.code);
  }
} catch (e) {
  console.error('🔴 UNEXPECTED ERROR:', e);
}
```

## Supabase Dashboard Checks

### Check if Table Exists
1. Buka Supabase Dashboard → Projects
2. Klik project Anda
3. Sidebar → Database → Tables
4. Pastikan ada: `hospitals` dan `hero_banners`

### Check RLS Policies
1. Dashboard → Authentication → Policies
2. Tab "Hospitals" table
3. Lihat policy list - pastikan ada yang allow INSERT

### Check Realtime Subscription
1. Dashboard → Database → Realtime
2. Pastikan `hospitals` dan `hero_banners` ada di list
3. Jika tidak ada, toggle on

### Check Auth Status
1. Dashboard → Authentication → Users
2. Pastikan user (email) ada di list
3. Verifikasi email status (verified/unverified)

## Performance Check

### Check if Request is Slow
```javascript
const start = performance.now();
const { data, error } = await supabase.from('hospitals').insert([{...}]).select();
const end = performance.now();
console.log(`Request took ${end - start}ms`);

// Jika > 5000ms, mungkin ada network issue
```

### Check Database Query
1. Supabase Dashboard → SQL Editor
2. Jalankan query manual:
```sql
-- Cek data terbaru
SELECT * FROM hospitals 
ORDER BY created_at DESC 
LIMIT 10;

-- Cek data spesifik
SELECT * FROM hospitals 
WHERE name = 'RS Cilegon';
```

## Production Troubleshooting

### Issue: Works locally but not on production
**Solusi:**
1. Pastikan `.env.production` ada dan benar
2. Build ulang: `bun run build`
3. Deploy ulang kode
4. Clear browser cache

### Issue: Data hilang setelah redeploy
**Penyebab:** Mungkin database credentials reset
```bash
# Cek credentials di production
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Pastikan sama dengan Supabase dashboard
```

## Getting Help

### Collect Information untuk Support
```
1. Screenshot error message
2. Copy full console error
3. Network tab screenshot
4. Current .env values (tanpa sensitive keys)
5. Steps untuk reproduce issue
```

### Useful Supabase Links
- [Supabase Status](https://status.supabase.com/)
- [API Reference](https://supabase.com/docs/reference/javascript/introduction)
- [Auth Docs](https://supabase.com/docs/guides/auth)
- [RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

**⚠️ Remember:**
- Always check Console (F12) first
- Network tab shows what data is being sent
- RLS policies control who can do what
- Environment variables must be correct
- Restart server after changing .env
