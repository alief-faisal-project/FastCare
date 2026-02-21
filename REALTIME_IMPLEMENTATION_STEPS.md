# 🎯 Step-by-Step: Real-time Update Implementation

## Langkah 1: Verifikasi Supabase Real-time sudah Enabled

### Di Supabase Dashboard:

1. Buka: `https://app.supabase.com`
2. Pilih project FastCare
3. Ke menu **Database** → **Publications**
4. Pastikan `supabase_realtime` sudah ada
5. Di row tersebut, klik untuk expand
6. Pastikan table `hospitals` dan `hero_banners` sudah di-enable

### Jika belum, jalankan SQL di SQL Editor:

```sql
-- Enable realtime untuk hospitals
ALTER PUBLICATION supabase_realtime ADD TABLE hospitals;

-- Enable realtime untuk hero_banners
ALTER PUBLICATION supabase_realtime ADD TABLE hero_banners;
```

## Langkah 2: Verifikasi RLS Policies

Di Supabase Dashboard → **Authentication** → **Policies**:

### Untuk Table `hospitals`:

Pastikan ada policy:

```sql
-- Allow anyone to read hospitals
CREATE POLICY "Read hospitals"
  ON hospitals
  FOR SELECT
  USING (true);

-- Allow authenticated users to update
CREATE POLICY "Update hospitals for authenticated users"
  ON hospitals
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete
CREATE POLICY "Delete hospitals for authenticated users"
  ON hospitals
  FOR DELETE
  USING (auth.role() = 'authenticated');
```

### Untuk Table `hero_banners`:

```sql
-- Allow anyone to read banners
CREATE POLICY "Read banners"
  ON hero_banners
  FOR SELECT
  USING (true);

-- Allow authenticated users to update
CREATE POLICY "Update banners for authenticated users"
  ON hero_banners
  FOR UPDATE
  USING (auth.role() = 'authenticated');
```

## Langkah 3: Test Koneksi Real-time

### Di AdminPanel, buka DevTools Console:

```javascript
// Paste ini di console
const supabase = window.__supabase_client;

supabase
  .channel("test-channel")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "hospitals" },
    (payload) => {
      console.log("✅ Real-time Working!", payload);
    },
  )
  .subscribe((status) => {
    console.log("Subscription status:", status);
  });

// Jika melihat "Subscription status: SUBSCRIBED" → Real-time OK
```

## Langkah 4: Verifikasi Code Changes

### File yang sudah diubah:

#### ✅ `src/context/AppContext.tsx`

Real-time subscription sekarang handle:

- `INSERT` → Tambah ke list
- `UPDATE` → Update item existing
- `DELETE` → Hapus dari list

**Cek di console saat test:**

```
🔔 Hospital UPDATE detected: {id: '...', name: '...'}
🔔 Hospital INSERT detected: {id: '...', name: '...'}
🔔 Hospital DELETE detected: {id: '...'}
```

#### ✅ `src/pages/AdminPanel.tsx`

Toast notifications sudah ditambahkan:

- `toast.success()` saat update/add berhasil
- `toast.error()` saat ada error
- `toast.warning()` untuk aksi penting

## Langkah 5: Test End-to-End

### Scenario 1: Simple Update

1. Buka http://localhost:5173/admin
2. Klik Edit pada hospital pertama
3. Ubah nama: "RS Mitra Sehat" → "RS Mitra Sehat Updated"
4. Klik Simpan
5. **Expected:**
   - ✅ Toast success: "✅ Rumah sakit berhasil diupdate!"
   - ✅ Modal tertutup
   - ✅ List updated langsung
   - ✅ Di console: `🔔 Hospital UPDATE detected: ...`

### Scenario 2: Multiple Tabs Update

1. **Tab 1**: Buka Admin Panel (http://localhost:5173/admin)
2. **Tab 2**: Buka Hospital List (http://localhost:5173)
3. **Di Tab 1**: Edit hospital, ubah nama, klik Simpan
4. **Di Tab 2**: Lihat list berubah otomatis tanpa refresh
5. **Expected:**
   - ✅ Tab 2 update real-time
   - ✅ Tidak perlu refresh
   - ✅ Data sinkron

### Scenario 3: Error Handling

1. Buka Admin Panel
2. Buat Hospital baru dengan data incomplete
3. Klik Simpan
4. **Expected:**
   - ✅ Toast error: "❌ Gagal menambah: ..."
   - ✅ Modal tetap terbuka
   - ✅ User bisa retry

## Langkah 6: Monitoring & Debugging

### Enable Detailed Logging

Di console:

```javascript
// Cek subscription status
const channel = supabase.channel("realtime-hospitals");
console.log("Channel:", channel);

// Monitor all events
channel
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "hospitals" },
    (payload) => {
      console.log("🔔 Event:", payload.eventType);
      console.log("   Data:", payload.new);
      console.log("   Timestamp:", new Date().toLocaleTimeString());
    },
  )
  .subscribe();
```

### Check Network Activity

1. DevTools → Network
2. Filter: WS (WebSocket)
3. Cari connection ke `wss://xxxxx.supabase.co/realtime/v1?...`
4. Status: `101` = Switching Protocols (OK)

## Langkah 7: Production Considerations

### Sebelum Deploy:

- [ ] Real-time publications enabled di Supabase production
- [ ] RLS policies tested & verified
- [ ] Toast notifications styling matches design
- [ ] Network resilience tested (disconnect/reconnect)
- [ ] Multi-tab synchronization working
- [ ] Error messages user-friendly
- [ ] Performance acceptable (< 1s update lag)

### Monitoring di Production:

```typescript
// src/context/AppContext.tsx - tambahkan analytics
useEffect(() => {
  const channel = supabase.channel("realtime-hospitals");

  channel
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "hospitals" },
      (payload) => {
        const lag = Date.now() - new Date(payload.commit_timestamp).getTime();
        console.log(`⏱️ Update lag: ${lag}ms`);

        // Send ke analytics jika lag > 5000ms
        if (lag > 5000) {
          console.warn("⚠️ High latency detected:", lag);
          // analytics.track('realtime_high_latency', { lag });
        }
      },
    )
    .subscribe();
}, []);
```

## Langkah 8: Common Issues & Solutions

### Issue 1: Real-time tidak update

**Diagnosis:**

```javascript
// Cek apakah ada 🔔 log saat update
// Jika tidak ada → subscription tidak aktif
```

**Solusi:**

1. Refresh halaman (F5)
2. Check console untuk errors
3. Verify di Supabase RLS policies
4. Restart dev server

### Issue 2: Duplicate data di list

**Diagnosis:**

- List hospital muncul 2x setelah add

**Solusi:**

```typescript
// Di AppContext, pastikan checking existing id
setHospitals((prev) => {
  // Check jika id sudah ada
  if (prev.some((h) => h.id === newHospital.id)) {
    return prev; // Don't add duplicate
  }
  return [newHospital, ...prev];
});
```

### Issue 3: Modal tidak tertutup setelah save

**Diagnosis:**

- Form modal masih terbuka setelah klik Simpan

**Solusi:**

```typescript
// Di AdminPanel onSave handler
try {
  const result = await updateHospital(...);
  if (result?.error) {
    toast.error(...);
    return; // Jangan tutup modal
  }
  toast.success(...);
  setShowHospitalForm(false); // ✅ Baru tutup jika sukses
  setEditingHospital(null);
}
```

### Issue 4: Toast notifications tidak muncul

**Diagnosis:**

- Save berhasil tapi tidak ada notifikasi

**Solusi:**

1. Check import: `import { toast } from "sonner"`
2. Check apakah `<Toaster />` ada di App.tsx
3. Check console untuk errors

```typescript
// Di App.tsx, pastikan ada:
import { Toaster } from "sonner";

export function App() {
  return (
    <>
      {/* Routes */}
      <Toaster position="top-center" /> {/* ✅ Tambahkan ini */}
    </>
  );
}
```

## Langkah 9: Performance Optimization

### Optimasi 1: Batch Updates

```typescript
// Jika ada multiple updates cepat, batch mereka
const updateQueue = [];
const batchUpdateHospitals = debounce(async () => {
  // Process updates
}, 500);
```

### Optimasi 2: Unsubscribe saat tidak perlu

```typescript
// Di AdminPanel, bisa unsubscribe saat tab inactive
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      // Pause realtime
    } else {
      // Resume realtime
    }
  };
  document.addEventListener("visibilitychange", handleVisibilityChange);
  return () => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
}, []);
```

### Optimasi 3: Selective Subscription

```typescript
// Hanya subscribe ke data yang dibutuhkan
useEffect(() => {
  const channel = supabase
    .channel("realtime-hospitals")
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "hospitals",
        filter: `city=eq.Kota Serang`, // ✅ Filter
      },
      (payload) => {
        // Handle hanya Kota Serang
      },
    )
    .subscribe();
}, []);
```

## Langkah 10: Testing Checklist

- [ ] Update hospital → real-time update di list
- [ ] Add hospital → appear di list real-time
- [ ] Delete hospital → disappear dari list real-time
- [ ] Multiple tabs → sync otomatis
- [ ] Toast success muncul saat berhasil
- [ ] Toast error muncul saat gagal
- [ ] Modal tertutup otomatis setelah sukses
- [ ] Modal tetap terbuka jika error
- [ ] Console logs menunjukkan 🔔 events
- [ ] Lag < 1 detik untuk update

---

**Testing Date:** Sesuai kebutuhan
**Last Updated:** Feb 21, 2025
