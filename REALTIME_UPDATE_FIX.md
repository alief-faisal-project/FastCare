# 🔄 Panduan Perbaikan Real-time Update Admin Panel

## 📋 Masalah yang Diperbaiki

Sebelumnya, ketika mengupdate data hospital di admin panel:

- ✗ Data di Supabase berubah tetapi UI tidak update otomatis
- ✗ Harus refresh manual halaman untuk melihat perubahan
- ✗ Tidak ada feedback yang jelas apakah update berhasil atau gagal
- ✗ Real-time subscription kurang responsif terhadap perubahan

## ✅ Solusi yang Diimplementasikan

### 1. **Peningkatan Real-time Subscription** (AppContext.tsx)

#### Sebelumnya (Kurang Efisien):

```tsx
useEffect(() => {
  const channel = supabase
    .channel("realtime-hospitals")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "hospitals" },
      (payload) => {
        fetchInitialData(); // ⚠️ Refetch semua data
      },
    )
    .subscribe();
  // ...
});
```

#### Sesudahnya (Lebih Responsif):

```tsx
useEffect(() => {
  // Subscribe ke INSERT events
  const hospitalChannel = supabase
    .channel("realtime-hospitals")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "hospitals" },
      (payload) => {
        console.log("🔔 Hospital INSERT detected:", payload.new);
        const newHospital = mapHospital(payload.new);
        setHospitals((prev) => [newHospital, ...prev]); // ✅ Langsung update state
      },
    )
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "hospitals" },
      (payload) => {
        console.log("🔔 Hospital UPDATE detected:", payload.new);
        const updatedHospital = mapHospital(payload.new);
        setHospitals(
          (prev) =>
            prev.map((h) =>
              h.id === updatedHospital.id ? updatedHospital : h,
            ), // ✅ Update item spesifik
        );
      },
    )
    .on(
      "postgres_changes",
      { event: "DELETE", schema: "public", table: "hospitals" },
      (payload) => {
        console.log("🔔 Hospital DELETE detected:", payload.old);
        setHospitals((prev) => prev.filter((h) => h.id !== payload.old.id));
      },
    )
    .subscribe();

  // Subscribe ke hero_banners juga
  const bannerChannel = supabase
    .channel("realtime-banners")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "hero_banners" },
      (payload) => {
        // Update state langsung
      },
    )
    // ... lebih banyak event handlers
    .subscribe();

  return () => {
    supabase.removeChannel(hospitalChannel);
    supabase.removeChannel(bannerChannel);
  };
}, []);
```

**Keuntungan:**

- ✅ Update state secara langsung tanpa refetch semua data
- ✅ Lebih cepat dan responsif
- ✅ Mengurangi beban database
- ✅ Perubahan terlihat instant di UI

### 2. **Tambahan Toast Notifications** (AdminPanel.tsx)

#### Sebelumnya (Alert Biasa):

```tsx
onSave={async (data) => {
  try {
    if (editingHospital) {
      const result = await updateHospital(editingHospital.id, data);
      if (result?.error) {
        alert("Gagal mengupdate: " + result.error.message); // ⚠️ Alert agak mengganggu
        return;
      }
    }
    // ...
  } catch (error) {
    alert("Error: " + error.message);
  }
}}
```

#### Sesudahnya (Toast Notifications):

```tsx
import { toast } from "sonner"; // ✅ Import toast

onSave={async (data) => {
  try {
    if (editingHospital) {
      const result = await updateHospital(editingHospital.id, data);
      if (result?.error) {
        toast.error("Gagal mengupdate: " + result.error.message); // ✅ Toast error
        return;
      }
      toast.success("✅ Rumah sakit berhasil diupdate!", {
        description: `${data.name} telah diperbarui di database`,
      }); // ✅ Toast success dengan deskripsi
    } else {
      const result = await addHospital(data);
      if (result?.error) {
        toast.error("Gagal menambah: " + result.error.message);
        return;
      }
      toast.success("✅ Rumah sakit berhasil ditambahkan!", {
        description: `${data.name} telah ditambahkan ke database`,
      });
    }
    setShowHospitalForm(false);
    setEditingHospital(null);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Error tidak diketahui";
    toast.error("Error: " + errorMsg);
  }
}}
```

**Keuntungan:**

- ✅ Notifikasi lebih halus (tidak mengganggu)
- ✅ User dapat lihat status operasi (success/error)
- ✅ Deskripsi detail tentang apa yang terjadi
- ✅ Auto-dismiss setelah beberapa detik

## 🎯 Cara Kerja Real-time Update Sekarang

### Alur Update Hospital:

```
1. Admin mengubah data di form → handleSubmit()
   ↓
2. updateHospital() dipanggil → Kirim update ke Supabase
   ↓
3. Supabase menerima update → Update database
   ↓
4. Realtime subscription mendeteksi UPDATE event
   ↓
5. Payload diterima dengan data baru
   ↓
6. mapHospital() convert snake_case → camelCase
   ↓
7. setHospitals() update state React → Re-render UI
   ↓
8. Toast notification tampil → User tahu update berhasil
   ↓
9. Modal form tertutup → UI kembali ke list
```

### Contoh Payload dari Supabase Real-time:

```json
{
  "type": "postgres_changes",
  "schema": "public",
  "table": "hospitals",
  "commit_timestamp": "2025-02-21T10:30:45Z",
  "eventType": "UPDATE",
  "new": {
    "id": "123abc",
    "name": "RS Mitra Sehat",
    "city": "Kota Serang",
    "total_beds": 150,
    "has_igd": true,
    "has_icu": true
  },
  "old": {
    "id": "123abc",
    "name": "RS Mitra Sehat",
    "city": "Kota Serang",
    "total_beds": 100,
    "has_igd": false,
    "has_icu": false
  }
}
```

## 🔧 Setup Real-time di Supabase

Pastikan Real-time sudah enabled di Supabase:

### 1. **Enable Realtime Publication**

```sql
-- Di Supabase SQL Editor
ALTER PUBLICATION supabase_realtime ADD TABLE hospitals;
ALTER PUBLICATION supabase_realtime ADD TABLE hero_banners;
```

### 2. **Verify RLS Policies**

```sql
-- Pastikan ada policy untuk SELECT yang memungkinkan authenticated users
CREATE POLICY "Enable select for authenticated users on hospitals"
  ON hospitals FOR SELECT
  USING (true);

CREATE POLICY "Enable select for authenticated users on banners"
  ON hero_banners FOR SELECT
  USING (true);
```

## 📱 Testing Real-time Update

### Cara Test:

1. **Buka 2 Tab/Window:**
   - Tab 1: Admin Panel (http://localhost:5173/admin)
   - Tab 2: Hospital Detail atau Index (http://localhost:5173)

2. **Update Hospital di Tab 1:**
   - Klik Edit pada salah satu hospital
   - Ubah nama/data
   - Klik Simpan
   - Lihat toast notification "✅ Berhasil diupdate"

3. **Cek Tab 2:**
   - Data seharusnya langsung berubah
   - Tidak perlu refresh halaman
   - List hospital atau detail harus updated real-time

4. **Cek Console:**
   ```
   🔔 Hospital UPDATE detected: {id: '123abc', name: 'RS Baru', ...}
   ```

## 🎨 Toast Notifications Types

### Success Toast

```tsx
toast.success("✅ Operasi berhasil!", {
  description: "Detail tentang apa yang berhasil",
  duration: 3000, // Auto dismiss dalam 3 detik
});
```

### Error Toast

```tsx
toast.error("❌ Terjadi error!", {
  description: "Detail tentang error yang terjadi",
  duration: 5000, // Lebih lama untuk error
});
```

### Info Toast

```tsx
toast.info("ℹ️ Informasi", {
  description: "Pesan informasi",
});
```

### Warning Toast

```tsx
toast.warning("⚠️ Peringatan", {
  description: "Pesan peringatan",
});
```

## 🚀 Tips Troubleshooting

### Real-time Tidak Update?

**Solusi 1: Check Console Logs**

```
Buka DevTools → Console
Cari log: "🔔 Hospital UPDATE detected"
Jika tidak ada, berarti subscription tidak bekerja
```

**Solusi 2: Restart Connection**

```tsx
// Dalam browser console
// Refresh halaman → reconnect ke realtime
window.location.reload();
```

**Solusi 3: Check Supabase RLS Policies**

- Login ke dashboard Supabase
- Pastikan RLS policies allow SELECT pada hospitals & hero_banners
- Pastikan authenticated users punya akses

**Solusi 4: Check Network Tab**

```
DevTools → Network → WebSocket
Cari connection ke supabase (wss://...)
Status harus "101 Switching Protocols"
```

## 📊 Performance Monitoring

### Cek Real-time Lag:

```tsx
// Di console:
const start = Date.now();
console.log("Start update:", start);

// Setelah data update di Supabase:
// Buka console realtime subscriber
// Lihat timestamp di log

// Lag = timestamp realtime - start
```

Idealnya:

- ✅ Lag < 1 detik: Sempurna
- ✅ Lag 1-3 detik: Baik
- ⚠️ Lag > 5 detik: Ada masalah

## 📝 Checklist Implementasi

- [x] Real-time subscription di AppContext setup untuk INSERT/UPDATE/DELETE
- [x] Toast notifications imported dan digunakan
- [x] Success toast tampil saat update berhasil
- [x] Error toast tampil saat ada error
- [x] Console logs untuk debugging
- [x] Modal form tertutup setelah sukses
- [x] Modal form tetap terbuka jika ada error
- [ ] Test di multiple tabs/windows
- [ ] Test connection recovery
- [ ] Monitor performance di production

## 🔐 Security Notes

- Pastikan authenticated users hanya bisa update/delete data mereka sendiri
- RLS policies harus restrict akses ke hanya admin
- Real-time subscription menggunakan authenticated session
- Data mapping dilakukan dengan hati-hati (snake_case ↔ camelCase)

## 📞 Support & Questions

Jika ada masalah:

1. Check console logs (🔔 atau 📤 icons)
2. Verify Supabase connection
3. Check RLS policies di Supabase dashboard
4. Restart dev server
5. Clear browser cache

---

**Update terakhir:** Feb 21, 2025
**Version:** 2.0 (Real-time Optimized)
