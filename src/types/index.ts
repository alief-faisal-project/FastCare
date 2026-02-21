export interface Hospital {
  id: string;
  name: string;
  type: "RS Umum" | "RS Khusus" | "RS Ibu & Anak" | "RS Jiwa" | "Klinik";
  class: "A" | "B" | "C" | "D" | "Tidak Berkelas";
  address: string;
  city: string; // Kabupaten/Kota
  district: string; // Kecamatan
  phone: string;
  email?: string;
  website?: string;
  image: string;
  description: string;
  facilities: string[];
  services: string[];
  totalBeds: number;
  hasIGD: boolean;
  hasICU: boolean;
  operatingHours: string;
  // allow nullable coordinates because some records may not provide exact lat/lng
  // when adding via admin panel (we can parse Google Maps link instead)
  latitude?: number | null;
  longitude?: number | null;
  googleMapsLink?: string;
  distance?: number; // km from user location
  createdAt: string;
  updatedAt: string;
}

export interface HeroBanner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link?: string;
  isActive: boolean;
  order: number;
}

export interface AdminUser {
  id: string;
  username: string;
  password: string; // In real app, this would be hashed
  name: string;
  role: "admin" | "superadmin";
}

export interface UserLocation {
  lat: number;
  lng: number;
  city?: string;
  address?: string;
}

export const BANTEN_CITIES = [
  "Kota Serang",
  "Kota Cilegon",
  "Kota Tangerang",
  "Kota Tangerang Selatan",
  "Kabupaten Serang",
  "Kabupaten Tangerang",
  "Kabupaten Pandeglang",
  "Kabupaten Lebak",
] as const;

export type BantenCity = (typeof BANTEN_CITIES)[number];
