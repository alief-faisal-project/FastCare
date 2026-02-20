# 📋 EXACT CHANGES REFERENCE

## FILE: src/context/AppContext.tsx

### CHANGE 1: addHeroBanner - Remove .single() & Fix Error

**LOCATION:** Line ~355

```diff
  const addHeroBanner = async (banner: Partial<HeroBanner>): Promise<void> => {
    const { data, error } = await supabase
      .from("hero_banners")
      .insert([banner])
      .select()
-     .single();
+     // Removed .single() - returns array

    if (error) {
      console.error("Add Banner Error:", error);
-     a;  // TYPO FIXED
-     return;
+     throw error;  // Changed to throw
    }

-   if (data) {
-     setHeroBanners((prev) => [...prev, data]);
+   if (data && data.length > 0) {  // Added length check
+     setHeroBanners((prev) => [...prev, data[0]]);  // Access [0]
    }
  };
```

---

### CHANGE 2: updateHeroBanner - Remove .single() & Fix Error

**LOCATION:** Line ~368

```diff
  const updateHeroBanner = async (
    id: string,
    banner: Partial<HeroBanner>,
  ): Promise<void> => {
    const { data, error } = await supabase
      .from("hero_banners")
      .update(banner)
      .eq("id", id)
      .select()
-     .single();
+     // Removed .single()

    if (error) {
      console.error("Update Banner Error:", error);
-     return;
+     throw error;  // Changed to throw
    }

-   if (data) {
-     setHeroBanners((prev) => prev.map((b) => (b.id === id ? data : b)));
+   if (data && data.length > 0) {  // Added length check
+     setHeroBanners((prev) => prev.map((b) => (b.id === id ? data[0] : b)));
    }
  };
```

---

### CHANGE 3: addHospital - Remove .single() & Add Default Values

**LOCATION:** Line ~285

```diff
  const addHospital = async (
    hospital: Partial<Hospital>,
  ): Promise<{ error: PostgrestError | null }> => {
    const payload = cleanObject({
      name: hospital.name,
      type: hospital.type,
      class: hospital.class,
      address: hospital.address,
      city: hospital.city,
      district: hospital.district,
      phone: hospital.phone,
      email: hospital.email,
      website: hospital.website,
      image: hospital.image,
      description: hospital.description,
      has_icu: hospital.hasICU ?? false,
      has_igd: hospital.hasIGD ?? false,
      total_beds: hospital.totalBeds ?? 0,
      operating_hours: hospital.operatingHours ?? "24 Jam",
      google_maps_link: hospital.googleMapsLink ?? "",
+     latitude: hospital.latitude ?? -6.1185,     // ADDED
+     longitude: hospital.longitude ?? 106.1564,  // ADDED
+     rating: hospital.rating ?? 0,               // ADDED
      facilities: normalizeArray(hospital.facilities),
      services: normalizeArray(hospital.services),
    });

    const { data, error } = await supabase
      .from("hospitals")
      .insert([payload])
      .select()
-     .single();  // REMOVED
+     // Removed .single()

    if (!error && data && data.length > 0) {  // Changed condition
      setHospitals((prev) => [mapHospital(data[0]), ...prev]);  // Access [0]
    }

    return { error };
  };
```

---

### CHANGE 4: updateHospital - Remove .single() & Add Location Fields

**LOCATION:** Line ~310

```diff
  const updateHospital = async (
    id: string,
    hospital: Partial<Hospital>,
  ): Promise<{ error: PostgrestError | null }> => {
    const payload = cleanObject({
      name: hospital.name,
      type: hospital.type,
      class: hospital.class,
      address: hospital.address,
      city: hospital.city,
      district: hospital.district,
      phone: hospital.phone,
      email: hospital.email,
      website: hospital.website,
      image: hospital.image,
      description: hospital.description,
      has_icu: hospital.hasICU,
      has_igd: hospital.hasIGD,
      total_beds: hospital.totalBeds,
      operating_hours: hospital.operatingHours,
      google_maps_link: hospital.googleMapsLink,
+     latitude: hospital.latitude,        // ADDED
+     longitude: hospital.longitude,      // ADDED
+     rating: hospital.rating,            // ADDED
      facilities: hospital.facilities
        ? normalizeArray(hospital.facilities)
        : undefined,
      services: hospital.services
        ? normalizeArray(hospital.services)
        : undefined,
    });

    const { data, error } = await supabase
      .from("hospitals")
      .update(payload)
      .eq("id", id)
      .select()
-     .single();  // REMOVED

    if (!error && data && data.length > 0) {  // Changed condition
      setHospitals((prev) =>
-       prev.map((h) => (h.id === id ? mapHospital(data) : h)),
+       prev.map((h) => (h.id === id ? mapHospital(data[0]) : h)),  // Access [0]
      );
    }

    return { error };
  };
```

---

## FILE: src/pages/AdminPanel.tsx

### CHANGE 1: Banner Form Modal - Improve Error Handling

**LOCATION:** Line ~490

```diff
      {/* Banner Form Modal */}
      {showBannerForm && (
        <BannerFormModal
          banner={editingBanner}
          onClose={() => {
            setShowBannerForm(false);
            setEditingBanner(null);
          }}
-         onSave={(data) => {
+         onSave={async (data) => {  // Added async
+           try {  // Added try-catch
              if (editingBanner) {
-               updateHeroBanner(editingBanner.id, data);
+               await updateHeroBanner(editingBanner.id, data);  // Added await
              } else {
-               addHeroBanner(data as any);
+               await addHeroBanner(data as HeroBanner);  // Added await, fixed type
              }
              setShowBannerForm(false);
              setEditingBanner(null);
+           } catch (error: unknown) {  // Added catch
+             const errorMessage =
+               error instanceof Error ? error.message : "Gagal menyimpan banner";
+             alert("Error: " + errorMessage);
+           }
          }}
        />
      )}
```

---

### CHANGE 2: Hospital Form - Fix TypeScript Types

**LOCATION:** Line ~620

```diff
            <div>
              <label className="block text-sm font-medium mb-1">Tipe</label>
              <select
                value={formData.type}
                onChange={(e) =>
-                 setFormData({ ...formData, type: e.target.value as any })
+                 setFormData({
+                   ...formData,
+                   type: e.target.value as Hospital["type"],
+                 })
                }
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
              >
```

---

### CHANGE 3: Hospital Form - Fix TypeScript Types (Class)

**LOCATION:** Line ~636

```diff
            <div>
              <label className="block text-sm font-medium mb-1">Kelas</label>
              <select
                value={formData.class}
                onChange={(e) =>
-                 setFormData({ ...formData, class: e.target.value as any })
+                 setFormData({
+                   ...formData,
+                   class: e.target.value as Hospital["class"],
+                 })
                }
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
              >
```

---

## SUMMARY OF CHANGES

### AppContext.tsx

- ✅ 4 Functions fixed (addHospital, updateHospital, addHeroBanner, updateHeroBanner)
- ✅ Removed all `.single()` calls
- ✅ Added proper array handling with `data[0]`
- ✅ Added default values for latitude, longitude, rating
- ✅ Changed error handling from `return` to `throw error`

### AdminPanel.tsx

- ✅ Added async/await to Banner Form Modal
- ✅ Added try-catch error handling
- ✅ Fixed TypeScript `as any` → proper types
- ✅ Better error messages to user

---

## TESTING

```bash
# Build
npm run build

# Dev
npm run dev

# Visit http://localhost:5173/admin
```

All operations should now work correctly! ✅
