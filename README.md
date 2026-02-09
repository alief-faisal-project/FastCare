# FastCare.id - Pencarian Rumah Sakit Terdekat di Banten

Platform pencarian rumah sakit terdekat di Provinsi Banten dengan informasi lengkap fasilitas kesehatan.

## 🏥 Fitur Utama

- **Pencarian Rumah Sakit** - Cari berdasarkan nama, lokasi, atau fasilitas
- **Deteksi Lokasi** - Temukan RS terdekat berdasarkan lokasi perangkat
- **Filter Wilayah** - Filter berdasarkan kabupaten/kota di Banten
- **Informasi Lengkap** - Detail RS: fasilitas, layanan, kamar, IGD, ICU
- **Integrasi Google Maps** - Lihat lokasi dan petunjuk arah
- **Admin Panel** - Kelola data RS dengan CRUD lengkap

## 🚀 Quick Start

```bash
npm install
npm run dev
```

## 🔐 Login

- **Admin:** admin / admin123
- **Operator:** operator / operator123

## 💾 Koneksi MySQL (Production)

### 1. Buat Database

```sql
CREATE DATABASE fastcare_db;

CREATE TABLE hospitals (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type ENUM('RS Umum', 'RS Khusus', 'RS Ibu & Anak', 'RS Jiwa', 'Klinik'),
  class ENUM('A', 'B', 'C', 'D', 'Tidak Berkelas'),
  address TEXT, city VARCHAR(100), phone VARCHAR(50),
  facilities JSON, services JSON,
  total_beds INT, available_beds INT,
  has_igd BOOLEAN, has_icu BOOLEAN,
  latitude DECIMAL(10,8), longitude DECIMAL(11,8),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hero_banners (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255), subtitle VARCHAR(500),
  image TEXT, is_active BOOLEAN, sort_order INT
);

CREATE TABLE admin_users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  password_hash VARCHAR(255),
  name VARCHAR(255), role ENUM('admin', 'superadmin')
);
```

### 2. Backend API (Express.js)

```bash
mkdir backend && cd backend
npm init -y
npm install express mysql2 cors dotenv bcryptjs jsonwebtoken
```

Buat file `backend/index.js` dengan REST API endpoints untuk CRUD hospitals, banners, dan auth.

### 3. Update Frontend

Modifikasi `AppContext.tsx` untuk fetch dari API alih-alih localStorage.

## ☁️ Deploy ke Cloud Sendiri

### VPS (DigitalOcean/Vultr)
```bash
npm run build
# Serve dist/ dengan Nginx
# Jalankan backend dengan PM2
```

### Docker
```yaml
version: '3.8'
services:
  frontend:
    build: .
    ports: ["80:80"]
  api:
    build: ./backend
    ports: ["3001:3001"]
  db:
    image: mysql:8
```

## 📊 Sumber Data

- [SIRS Kemkes RI](https://sirs.kemkes.go.id/fo/home/dashboard_rs)
- [BPS API](https://webapi.bps.go.id)

## 📝 Tech Stack

React 18, TypeScript, Vite, Tailwind CSS, Font Awesome 6

---
Made with ❤️ for Provinsi Banten
