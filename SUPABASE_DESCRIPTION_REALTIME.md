# 📱 Hospital Detail Description - Real-time Update Setup

## 🎯 Overview

Fitur ini memungkinkan deskripsi hospital yang ditambahkan/diubah di Admin Panel langsung terlihat di Hospital Detail Page secara real-time tanpa perlu refresh halaman.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Admin Panel                          │
│         (Edit/Add Hospital Description)                 │
│                                                         │
│              ↓ updateHospital()                         │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ↓
        ┌──────────────────────┐
        │   Supabase Database  │
        │   (hospitals table)  │
        │                      │
        │  description: TEXT   │
        └──────────┬───────────┘
                   │
                   ↓
      ┌─────────────────────────┐
      │  Real-time Subscription │
      │   (postgres_changes)    │
      │   event: UPDATE         │
      └────────────┬────────────┘
                   │
                   ↓
        ┌──────────────────────┐
        │  HospitalDetail.tsx  │
        │  Update State        │
        │  Re-render UI        │
        └──────────────────────┘
```

## 📋 Requirements

### Database Table Structure

Pastikan tabel `hospitals` di Supabase memiliki kolom:

```sql
CREATE TABLE hospitals (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,  -- ← Kolom untuk deskripsi
  phone TEXT,
  address TEXT,
  city TEXT,
  class TEXT,
  image TEXT,
  has_igd BOOLEAN DEFAULT false,
  has_icu BOOLEAN DEFAULT false,
  total_beds INTEGER DEFAULT 0,
  -- ... kolom lainnya
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### RLS Policies

Setup RLS untuk memungkinkan realtime updates:

```sql
-- Enable RLS
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;

-- Select policy (public read)
CREATE POLICY "Allow select for all users"
  ON hospitals FOR SELECT
  USING (true);

-- Update policy (authenticated admin only)
CREATE POLICY "Allow update for authenticated users"
  ON hospitals FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
```

### Real-time Publication

Enable realtime untuk hospitals table:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE hospitals;
```

## 💻 Code Implementation

### 1. Hospital Type Definition

File: `src/types/index.ts`

```typescript
export interface Hospital {
  id: string;
  name: string;
  description: string; // ← Tambahkan
  phone: string;
  address: string;
  city: string;
  class: string;
  image: string;
  hasIGD: boolean;
  hasICU: boolean;
  totalBeds: number;
  // ... field lainnya
  createdAt: string;
  updatedAt: string;
}
```

### 2. AppContext Real-time Subscription

File: `src/context/AppContext.tsx`

Real-time subscription sudah di-setup untuk mendeteksi UPDATE events:

```typescript
useEffect(() => {
  const hospitalChannel = supabase
    .channel("realtime-hospitals")
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "hospitals" },
      (payload) => {
        console.log("🔔 Hospital UPDATE detected:", payload.new);
        const updatedHospital = mapHospital(payload.new);
        setHospitals((prev) =>
          prev.map((h) => (h.id === updatedHospital.id ? updatedHospital : h)),
        );
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(hospitalChannel);
  };
}, []);
```

**Cara kerja:**

1. Ketika description diupdate di Admin Panel
2. Supabase mendeteksi UPDATE event
3. Payload berisi data hospital terbaru (including description)
4. `setHospitals()` update state React
5. Component re-render dengan description baru
6. UI langsung ter-update tanpa refresh

### 3. HospitalDetail Component

File: `src/pages/HospitalDetail.tsx`

```typescript
// Komponen sudah di-update dengan layout:
//
// DESKTOP:
// - Left (2/3): Hero + Facilities + Description
// - Right (1/3): Info + Phone + Maps
//
// MOBILE:
// - Hero
// - Facilities
// - Small Info Box
// - Phone + Maps (2 column, side by side)
// - Description

const HospitalDetail = () => {
  const { getHospitalById } = useApp();
  const { id } = useParams<{ id: string }>();
  const hospital = getHospitalById(id || "");

  // Description ditampilkan dari hospital.description
  // yang sudah ter-sync melalui real-time subscription

  return (
    <>
      {/* Description - Desktop (Below Facilities) */}
      {hospital.description && (
        <div className="bg-card border border-border p-6 rounded-3xl">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Deskripsi
          </h2>
          <p className="text-foreground leading-relaxed">
            {hospital.description}
          </p>
        </div>
      )}

      {/* Description - Mobile (Below All) */}
      {hospital.description && (
        <div className="bg-card border border-border p-6 rounded-3xl">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Deskripsi
          </h2>
          <p className="text-foreground leading-relaxed text-sm">
            {hospital.description}
          </p>
        </div>
      )}
    </>
  );
};
```

### 4. Admin Panel Update

File: `src/pages/AdminPanel.tsx`

Form sudah include description field:

```typescript
const HospitalFormModal = ({ hospital, onSave }) => {
  const [formData, setFormData] = useState({
    name: hospital?.name || "",
    description: hospital?.description || "",  // ← Description field
    // ... field lainnya
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    await onSave({
      name: formData.name,
      description: formData.description,  // ← Kirim ke Supabase
      // ... field lainnya
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Description Input */}
      <div>
        <label>Deskripsi</label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Masukkan deskripsi rumah sakit..."
          rows={5}
        />
      </div>
      {/* ... field lainnya */}
    </form>
  );
};
```

## 🔄 Real-time Update Flow

### Skenario: Admin menambah description

````
1. Admin buka Admin Panel
   ↓
2. Klik Edit Hospital
   ↓
3. Isi field Description: "RS modern dengan fasilitas lengkap"
   ↓
4. Klik Simpan
   ↓
5. AdminPanel → updateHospital(id, { description: "..." })
   ↓
6. updateHospital() call:
   ```typescript
   const { data, error } = await supabase
     .from("hospitals")
     .update({ description: "RS modern..." })
     .eq("id", id)
     .select();
````

↓ 7. Supabase Database: UPDATE hospitals SET description = "..."
↓ 8. Supabase Realtime: Broadcast UPDATE event ke semua subscribers
↓ 9. HospitalDetail subscriber receive payload:

```json
{
  "type": "postgres_changes",
  "schema": "public",
  "table": "hospitals",
  "eventType": "UPDATE",
  "new": {
    "id": "123",
    "name": "RS Sehat",
    "description": "RS modern dengan fasilitas lengkap",
    ...
  }
}
```

↓ 10. AppContext: setHospitals() update state
↓ 11. Hospital object ter-update dengan description baru
↓ 12. HospitalDetail re-render
↓ 13. UI menampilkan deskripsi baru ✅

```

## 🧪 Testing

### Test 1: Update Description Real-time

1. **Setup:**
   - Buka 2 tab browser
   - Tab 1: Admin Panel
   - Tab 2: Hospital Detail page

2. **Test:**
   - Di Tab 1: Edit hospital, tambah description
   - Klik Simpan
   - Tab 2: Description seharusnya langsung update (tanpa refresh)

3. **Verify:**
   - Description muncul di Desktop (bawah Fasilitas)
   - Description muncul di Mobile (paling bawah)
   - DevTools Console: Lihat 🔔 logs

### Test 2: Add Hospital dengan Description

1. Admin Panel → Tambah Hospital baru
2. Isi description di field
3. Klik Simpan
4. Hospital list → lihat hospital baru
5. Klik untuk lihat detail
6. Description sudah ter-populate ✅

### Test 3: Multi-user Sync

1. **User A:** Buka Hospital Detail
2. **User B:** Admin Panel → Edit description
3. **User A:** Lihat description auto-update tanpa refresh

## 📊 Console Logs Expected

**Saat update description:**

```

📝 Submitting data: {name: "...", description: "...", ...}
🔄 Update payload untuk ID abc123: {description: "..."}
✅ Hospital berhasil diupdate: {id: "abc123", description: "...", ...}
🔔 Hospital UPDATE detected: {id: "abc123", description: "...", ...}

````

Jika tidak ada 🔔 log → realtime tidak working → check RLS policies

## 🔐 Security Considerations

- ✅ RLS ensures hanya authenticated users (admin) bisa update
- ✅ SELECT terbuka untuk public (show data)
- ✅ Description field bisa contain HTML-escaped content
- ✅ Real-time subscription menggunakan authenticated session

### XSS Prevention

Pastikan deskripsi di-sanitize jika menerima user input:

```typescript
import DOMPurify from 'dompurify';

<p>{DOMPurify.sanitize(hospital.description)}</p>
````

Atau dengan simple text escape:

```typescript
<p>{hospital.description}</p>  // React auto-escape by default
```

## 🐛 Troubleshooting

### Issue: Description tidak muncul di Hospital Detail

**Diagnosis:**

```
1. Buka DevTools → Network
2. Cari call ke supabase untuk get hospital
3. Check apakah description field ada di response
```

**Solusi:**

```
1. Verify database:
   SELECT id, name, description FROM hospitals LIMIT 1;
2. Pastikan description tidak NULL atau empty
3. Refresh halaman
```

### Issue: Real-time tidak update saat edit description

**Diagnosis:**

```
1. DevTools → Console
2. Cari log: "🔔 Hospital UPDATE detected"
3. Jika tidak ada → subscription tidak aktif
```

**Solusi:**

```
1. Verify RLS policies:
   ALTER PUBLICATION supabase_realtime ADD TABLE hospitals;
2. Verify subscription di AppContext sudah running
3. Restart dev server
4. Clear browser cache (Ctrl+Shift+Delete)
```

### Issue: Description muncul tapi tidak ter-update saat edit

**Diagnosis:**

```
1. Check console untuk errors
2. Lihat apakah ✅ log muncul (update sukses)
3. Tapi 🔔 log tidak muncul (realtime fail)
```

**Solusi:**

```
1. Manual refresh page untuk verify data di DB
2. Check Supabase RLS policies
3. Verify browser support WebSocket (untuk realtime)
```

## 📈 Performance Tips

1. **Lazy Load Description** - Jika description panjang, bisa lazy load
2. **Truncate Display** - Tampilkan 200 chars first, bisa expand
3. **Debounce Updates** - Jika banyak updates rapid, debounce rendering

```typescript
// Example: Truncate description
const truncateDescription = (text, limit = 200) => {
  if (text.length > limit) {
    return text.substring(0, limit) + '...';
  }
  return text;
};

<p>{truncateDescription(hospital.description)}</p>
```

## 📝 Field Mapping

Database ↔ Frontend mapping untuk description:

```typescript
// Supabase (snake_case)
{
  description: "RS modern...";
}

// Frontend (camelCase)
interface Hospital {
  description: string;
}

// Mapping di AppContext
const mapHospital = (data: any): Hospital => ({
  description: data.description, // No mapping needed
  // ... field lainnya
});
```

## 🚀 Deployment Checklist

- [ ] Description kolom sudah di Supabase database
- [ ] RLS policies di-setup
- [ ] Realtime publication enabled
- [ ] AppContext subscription running
- [ ] HospitalDetail menampilkan description
- [ ] Admin Panel form include description field
- [ ] Real-time sync tested (2 tabs)
- [ ] Mobile layout tested
- [ ] Desktop layout tested
- [ ] Error handling verified

## 📚 Related Files

- `src/pages/HospitalDetail.tsx` - Display layout
- `src/pages/AdminPanel.tsx` - Edit form
- `src/context/AppContext.tsx` - Real-time subscription
- `src/types/index.ts` - Type definitions

## 📞 Support

Jika ada issue, check:

1. Browser console untuk error logs
2. Supabase dashboard → Realtime status
3. RLS policies di Supabase
4. Database schema untuk description column

---

**Updated:** Feb 21, 2025
**Version:** 1.0 - Real-time Ready
