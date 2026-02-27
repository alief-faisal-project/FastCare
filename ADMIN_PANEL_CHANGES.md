# Admin Panel Image Upload Changes

## Overview

Mengubah sistem upload gambar di Admin Panel dari menggunakan URL link menjadi upload file lokal yang terintegrasi dengan Supabase Storage Buckets.

## Changes Made

### 1. **AppContext.tsx** - Menambah fungsi upload untuk hospital images

#### Perubahan:

- **Menambah `uploadHospitalImage` function** (lines 779-818):
  - Upload file gambar rumah sakit ke bucket `hospital-bimagaes`
  - Generate unique filename dengan timestamp dan random string
  - Folder path: `hospitals/{filename}`
  - Return public URL dari Supabase Storage

- **Menambah `uploadHospitalImage` ke interface `AppContextType`** (line 41):
  - Export function untuk digunakan di AdminPanel

- **Menambah `uploadHospitalImage` ke context value** (line 895, 925):
  - Include di useMemo value
  - Include di dependency array

#### Implementation Details:

```typescript
const uploadHospitalImage = useCallback(async (file: File): Promise<string> => {
  // Generate unique filename: hospital-{timestamp}-{randomStr}-{originalName}
  // Upload to bucket: hospital-bimagaes
  // Folder: hospitals/{filename}
  // Return: public URL
}, []);
```

### 2. **AdminPanel.tsx** - Hospital Form Updates

#### Perubahan:

##### A. Import changes (line 2):

- **Removed**: `isValidUrl` (tidak diperlukan lagi karena menggunakan file upload)
- **Keep**: `sanitizeInput` untuk validasi input

##### B. HospitalFormModal Component (lines 564-1002):

- **Menambah props**: `const { uploadHospitalImage } = useApp();`
- **Menambah fileInputRef**: Untuk track file input element
- **Menambah state**:
  - `isUploading`: boolean untuk track upload status
  - `imagePreview`: string untuk preview gambar

##### C. Image Handling Function (lines 610-645):

- **Menambah `handleImageChange` function**:
  - Validate file type (hanya image)
  - Validate file size (max 5MB)
  - Call `uploadHospitalImage()` ke Supabase
  - Update formData dengan URL yang dikembalikan
  - Update preview
  - Show toast notification
  - Handle errors dengan graceful

##### D. Form Validation (line 662):

- **Perubahan validasi image**:
  - **Sebelum**: Validasi URL dan check valid URL dengan `isValidUrl()`
  - **Sesudah**: Check gambar tidak kosong saja (validasi file terjadi di upload)

##### E. Form UI - Image Section (lines 835-863):

- **Sebelum**:
  - URL input field
  - Button "Ambil dari Google" untuk search gambar
- **Sesudah**:
  - Image preview (jika ada)
  - File input untuk upload lokal
  - Upload status indicator ("📤 Uploading...")
  - File size dan type validation

##### F. Submit Button (lines 996-1002):

- **Menambah disabled state** ketika `isUploading === true`
- **Menambah loading class**: opacity-50, cursor-not-allowed

### 3. **Banner Form - Already Working** (BannerFormModal)

#### Status: ✅ Already implemented correctly

- File input untuk upload gambar ke bucket `banner-images`
- Image preview
- Upload status indicator
- Same pattern sebagai Hospital form baru

## Bucket Configuration

### Hospital Images

- **Bucket Name**: `hospital-bimagaes`
- **Folder Path**: `hospitals/{timestamp}-{randomStr}-{filename}`
- **File Type**: .jpg, .jpeg, .png, .gif, .webp, dll
- **Max Size**: 5MB

### Banner Images

- **Bucket Name**: `banner-images`
- **Folder Path**: `banners/{timestamp}-{randomStr}-{filename}`
- **File Type**: .jpg, .jpeg, .png, .gif, .webp, dll
- **Max Size**: 5MB

## Features

### Upload Hospital Image

1. Click "Tambah RS" atau edit existing RS
2. Di section "Gambar Rumah Sakit":
   - Pilih file dari komputer
   - File akan di-upload ke Supabase Storage
   - Preview akan tampil setelah upload berhasil
   - Toast notification akan confirm success/error
3. Submit form untuk save RS dengan gambar

### Upload Banner Image

1. Click "Tambah Banner" atau edit existing banner
2. Di section "Gambar":
   - Upload file lokal ATAU
   - Input URL (alternatif)
   - File akan di-upload ke Supabase Storage
   - Preview akan tampil
3. Submit form untuk save banner

## Error Handling

### Validation

- ✅ File type check (harus image)
- ✅ File size check (max 5MB)
- ✅ Upload status indicator
- ✅ Error toast notifications
- ✅ Form field validation

### Upload Failures

- Error message di-display ke user
- Form tetap terbuka agar user bisa retry
- Console logging untuk debug

## Performance

### Optimizations

- Unique filename generation untuk prevent collision
- Folder structure (hospitals/banners) untuk organization
- Cache control (3600s) untuk CDN efficiency
- Async upload dengan loading indicator

## Testing Checklist

- [ ] Admin login works
- [ ] Hospital form opens correctly
- [ ] File upload works for hospital images
- [ ] Image preview displays after upload
- [ ] Hospital data saves with uploaded image URL
- [ ] Banner form file upload works
- [ ] Banner image preview displays
- [ ] Banner data saves with uploaded image
- [ ] Error handling works (invalid file, too large, etc)
- [ ] Toast notifications display correctly
- [ ] Uploaded images are accessible via Supabase Storage URL
- [ ] Mobile responsiveness maintained

## Notes

- Semua file yang di-upload akan memiliki unique filename untuk prevent overwrite
- Timestamp + random string digunakan untuk unique ID
- Public URL dari Supabase Storage langsung di-store di database
- Image dapat di-preview sebelum submit form
- Upload dibatalkan jika ada error, form tetap open untuk retry
