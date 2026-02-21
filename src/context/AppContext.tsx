import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
  useCallback,
} from "react";
import { supabase } from "@/lib/supabase";
import { Hospital, HeroBanner, UserLocation, BantenCity } from "@/types";
import { User, PostgrestError } from "@supabase/supabase-js";

/* =========================================================
   INTERFACE CONTEXT TYPE
   ========================================================= */

interface AppContextType {
  hospitals: Hospital[];

  addHospital: (
    hospital: Partial<Hospital>,
  ) => Promise<{ error: PostgrestError | null }>;

  updateHospital: (
    id: string,
    hospital: Partial<Hospital>,
  ) => Promise<{ error: PostgrestError | null }>;

  deleteHospital: (id: string) => Promise<{ error: PostgrestError | null }>;

  getHospitalById: (id: string) => Hospital | undefined;

  heroBanners: HeroBanner[];
  addHeroBanner: (banner: Partial<HeroBanner>) => Promise<void>;
  updateHeroBanner: (id: string, banner: Partial<HeroBanner>) => Promise<void>;
  deleteHeroBanner: (id: string) => Promise<void>;

  uploadBannerImage: (file: File) => Promise<string>;

  userLocation: UserLocation | null;
  setUserLocation: (location: UserLocation | null) => void;

  selectedCity: BantenCity | "Semua" | "Lokasi Terdekat";
  setSelectedCity: (city: BantenCity | "Semua" | "Lokasi Terdekat") => void;

  detectLocation: () => Promise<void>;

  isAuthenticated: boolean;
  currentUser: User | null;

  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;

  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

/* =========================================================
   CREATE CONTEXT
   ========================================================= */

const AppContext = createContext<AppContextType | undefined>(undefined);

/* =========================================================
   PROVIDER
   ========================================================= */

export function AppProvider({ children }: { children: ReactNode }) {
  /* ================= STATE ================= */

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [heroBanners, setHeroBanners] = useState<HeroBanner[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [selectedCity, setSelectedCity] = useState<
    BantenCity | "Semua" | "Lokasi Terdekat"
  >("Semua");

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  /* =========================================================
     INITIAL LOAD & AUTH LISTENER
     ========================================================= */

  useEffect(() => {
    fetchInitialData();
    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      setCurrentUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /* =========================================================
     REALTIME SUBSCRIPTION
     ========================================================= */

  useEffect(() => {
    // Subscribe ke changes di hospital table
    const hospitalChannel = supabase
      .channel("realtime-hospitals")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "hospitals" },
        (payload) => {
          console.log("🔔 Hospital INSERT detected:", payload.new);
          const newHospital = mapHospital(payload.new);
          setHospitals((prev) => [newHospital, ...prev]);
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "hospitals" },
        (payload) => {
          console.log("🔔 Hospital UPDATE detected:", payload.new);
          const updatedHospital = mapHospital(payload.new);
          setHospitals((prev) =>
            prev.map((h) =>
              h.id === updatedHospital.id ? updatedHospital : h,
            ),
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

    // Subscribe ke changes di hero_banners table
    const bannerChannel = supabase
      .channel("realtime-banners")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "hero_banners" },
        (payload) => {
          console.log("🔔 Banner INSERT detected:", payload.new);
          const newBanner = {
            id: payload.new.id,
            title: payload.new.title,
            subtitle: payload.new.subtitle,
            image: payload.new.image,
            link: payload.new.link,
            isActive: payload.new.is_active,
            order: payload.new.order,
          };
          setHeroBanners((prev) => [...prev, newBanner]);
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "hero_banners" },
        (payload) => {
          console.log("🔔 Banner UPDATE detected:", payload.new);
          const updatedBanner = {
            id: payload.new.id,
            title: payload.new.title,
            subtitle: payload.new.subtitle,
            image: payload.new.image,
            link: payload.new.link,
            isActive: payload.new.is_active,
            order: payload.new.order,
          };
          setHeroBanners((prev) =>
            prev.map((b) => (b.id === updatedBanner.id ? updatedBanner : b)),
          );
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "hero_banners" },
        (payload) => {
          console.log("🔔 Banner DELETE detected:", payload.old);
          setHeroBanners((prev) => prev.filter((b) => b.id !== payload.old.id));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(hospitalChannel);
      supabase.removeChannel(bannerChannel);
    };
  }, []);

  /* =========================================================
     FETCH DATA AWAL
     ========================================================= */

  const fetchInitialData = async () => {
    setIsLoading(true);

    const { data, error } = await supabase
      .from("hospitals")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch Hospitals Error:", error);
      setIsLoading(false);
      return;
    }

    if (data) {
      const mapped: Hospital[] = data.map((h) => ({
        id: h.id,
        name: h.name,
        type: h.type,
        class: h.class,
        address: h.address,
        city: h.city,
        district: h.district,
        phone: h.phone,
        email: h.email,
        website: h.website,
        image: h.image,
        description: h.description,
        hasICU: h.has_icu,
        hasIGD: h.has_igd,
        totalBeds: h.total_beds,
        latitude: h.latitude,
        longitude: h.longitude,
        operatingHours: h.operating_hours,
        googleMapsLink: h.google_maps_link,
        facilities: Array.isArray(h.facilities) ? h.facilities : [],
        services: Array.isArray(h.services) ? h.services : [],
        createdAt: h.created_at,
        updatedAt: h.updated_at,
      }));

      setHospitals(mapped);
    }

    // Fetch HeroBanners
    const { data: bannerData, error: bannerError } = await supabase
      .from("hero_banners")
      .select("*")
      .order("order", { ascending: true });

    if (bannerError) {
      console.error("Fetch Banners Error:", bannerError);
    } else if (bannerData) {
      // Map snake_case from Supabase to camelCase for frontend
  const mappedBanners = (bannerData as any[]).map((b) => ({
        id: b.id,
        title: b.title,
        subtitle: b.subtitle,
        image: b.image,
        link: b.link,
        isActive: b.is_active, // ← Map snake_case to camelCase
        order: b.order,
      }));
      setHeroBanners(mappedBanners);
    }

    setIsLoading(false);
  };

  /* =========================================================
     AUTH CHECK
     ========================================================= */

  const initializeAuth = async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      setIsAuthenticated(true);
      setCurrentUser(data.session.user);
    }
  };

  /* =========================================================
     HELPER FUNCTIONS
     ========================================================= */

  const cleanObject = <T extends Record<string, unknown>>(obj: T): T => {
    return Object.fromEntries(
      Object.entries(obj).filter(([, value]) => value !== undefined),
    ) as T;
  };

  const normalizeArray = (value?: string[] | string) => {
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
      return value
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
    }
    return [];
  };

  /* =========================================================
     GEO helpers
     ========================================================= */

  const haversineDistanceKm = React.useCallback(
    (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const deg2rad = (deg: number) => (deg * Math.PI) / 180;
      const R = 6371; // Earth radius km
      const dLat = deg2rad(lat2 - lat1);
      const dLon = deg2rad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) *
          Math.cos(deg2rad(lat2)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    },
    [],
  );

  const parseGoogleMapsLink = React.useCallback((link?: string) => {
    if (!link) return undefined;
    try {
      const atMatch = link.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (atMatch) return { lat: Number(atMatch[1]), lng: Number(atMatch[2]) };

      const qMatch = link.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (qMatch) return { lat: Number(qMatch[1]), lng: Number(qMatch[2]) };

      const destMatch = link.match(/destination=(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (destMatch)
        return { lat: Number(destMatch[1]), lng: Number(destMatch[2]) };

      // Fallback: look for any two consecutive decimal coordinates in the URL
      const anyMatch = link.match(/(-?\d+\.\d+)[,|/ ]+(-?\d+\.\d+)/);
      if (anyMatch)
        return { lat: Number(anyMatch[1]), lng: Number(anyMatch[2]) };
    } catch (err) {
      console.warn("Failed to parse maps link", err);
    }
    return undefined;
  }, []);

  /* =========================================================
     HOSPITAL CRUD
     ========================================================= */

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapHospital = (data: any): Hospital => ({
    id: data.id,
    name: data.name,
    type: data.type,
    class: data.class,
    address: data.address,
    city: data.city,
    district: data.district,
    phone: data.phone,
    email: data.email,
    website: data.website,
    image: data.image,
    description: data.description,
    hasICU: data.has_icu,
    hasIGD: data.has_igd,
    totalBeds: data.total_beds,
    latitude: data.latitude,
    longitude: data.longitude,
    operatingHours: data.operating_hours,
    googleMapsLink: data.google_maps_link,
    facilities: Array.isArray(data.facilities) ? data.facilities : [],
    services: Array.isArray(data.services) ? data.services : [],
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  });

  const addHospital = useCallback(async (
    hospital: Partial<Hospital>,
  ): Promise<{ error: PostgrestError | null }> => {
    try {
      // if google maps link present but lat/lng missing, try to parse coords
      const parsed = parseGoogleMapsLink(hospital.googleMapsLink || undefined);

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
  // only include latitude/longitude when available (from form or parsed maps link)
  latitude: hospital.latitude ?? (parsed ? parsed.lat : undefined),
  longitude: hospital.longitude ?? (parsed ? parsed.lng : undefined),
        facilities: normalizeArray(hospital.facilities),
        services: normalizeArray(hospital.services),
      });

      console.log("Mengirim payload ke Supabase:", payload);

      const { data, error } = await supabase
        .from("hospitals")
        .insert([payload])
        .select();

      if (error) {
        console.error("Supabase Error - Add Hospital:", error);
        return { error };
      }

      if (data && data.length > 0) {
        console.log("Hospital berhasil ditambahkan:", data[0]);
        const newHospital = mapHospital(data[0]);
        // compute distance if we have userLocation
        if (
          userLocation &&
          newHospital.latitude != null &&
          newHospital.longitude != null
        ) {
          const dist = haversineDistanceKm(
            userLocation.lat,
            userLocation.lng,
            Number(newHospital.latitude),
            Number(newHospital.longitude),
          );
          newHospital.distance = Math.round(dist * 10) / 10;
        }
        setHospitals((prev) => [newHospital, ...prev]);
      }

      return { error: null };
    } catch (err) {
      console.error("Unexpected error in addHospital:", err);
      return {
        error: {
          message: err instanceof Error ? err.message : "Error tidak diketahui",
          details: "",
          hint: "",
          code: "ERROR",
        } as PostgrestError,
      };
    }
  }, [parseGoogleMapsLink, userLocation, haversineDistanceKm]);

  const updateHospital = useCallback(async (
    id: string,
    hospital: Partial<Hospital>,
  ): Promise<{ error: PostgrestError | null }> => {
    try {
      // try to extract coords from google maps link if provided
      const parsed = parseGoogleMapsLink(hospital.googleMapsLink || undefined);

      const updatePayload = cleanObject({
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
        latitude: hospital.latitude ?? (parsed ? parsed.lat : undefined),
        longitude: hospital.longitude ?? (parsed ? parsed.lng : undefined),
        facilities: hospital.facilities
          ? normalizeArray(hospital.facilities)
          : undefined,
        services: hospital.services
          ? normalizeArray(hospital.services)
          : undefined,
      });

      console.log("🔄 Update payload untuk ID " + id + ":", updatePayload);

      const { data, error } = await supabase
        .from("hospitals")
        .update(updatePayload)
        .eq("id", id)
        .select();

      if (error) {
        console.error("❌ Supabase Error - Update Hospital:", error);
        return { error };
      }

      if (data && data.length > 0) {
        console.log("✅ Hospital berhasil diupdate:", data[0]);
        const updated = mapHospital(data[0]);
        if (
          userLocation &&
          updated.latitude != null &&
          updated.longitude != null
        ) {
          const dist = haversineDistanceKm(
            userLocation.lat,
            userLocation.lng,
            Number(updated.latitude),
            Number(updated.longitude),
          );
          updated.distance = Math.round(dist * 10) / 10;
        }
        setHospitals((prev) => prev.map((h) => (h.id === id ? updated : h)));
      }

      return { error: null };
    } catch (err) {
      console.error("💥 Unexpected error in updateHospital:", err);
      return {
        error: {
          message: err instanceof Error ? err.message : "Error tidak diketahui",
          details: "",
          hint: "",
          code: "ERROR",
        } as PostgrestError,
      };
    }
  }, [parseGoogleMapsLink, userLocation, haversineDistanceKm]);

  /* =========================================================
     Location detection and distance recomputation
     ========================================================= */

  const detectLocation = useCallback(async (): Promise<void> => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      throw new Error("Geolocation not supported");
    }

  // Always attempt to call getCurrentPosition. Browser will prompt when permission state is 'prompt'.

  return new Promise((resolve, reject) => {
      // call getCurrentPosition which will prompt when permission is 'prompt'
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude: lat, longitude: lng } = pos.coords;

          // set user location immediately so components can show a detecting state
          setUserLocation({ lat, lng });

          // compute distances and sort by distance; always set mode to 'Lokasi Terdekat'
          setHospitals((prev) => {
            const computed = prev.map((h) => {
              if (h.latitude != null && h.longitude != null) {
                const dist = haversineDistanceKm(
                  lat,
                  lng,
                  Number(h.latitude),
                  Number(h.longitude),
                );
                const rounded = Math.round(dist * 10) / 10;
                return { ...h, distance: rounded };
              }
              return { ...h, distance: undefined };
            });

            computed.sort((a, b) => (a.distance ?? 9999) - (b.distance ?? 9999));

            // set selectedCity to nearest-location mode
            setSelectedCity("Lokasi Terdekat");

            return computed;
          });

          resolve();
        },
        (err) => {
          // normalize permission denied error message
          if (err && (err.code === 1 || err.message === "Permission denied")) {
            reject(new Error("Permission denied"));
            return;
          }
          reject(err);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
      );
    });
  }, [haversineDistanceKm]);

  // recompute distances whenever hospitals or userLocation change
  useEffect(() => {
    if (!userLocation) return;
    setHospitals((prev) =>
      prev.map((h) => {
        if (h.latitude != null && h.longitude != null) {
          const dist = haversineDistanceKm(
            userLocation.lat,
            userLocation.lng,
            Number(h.latitude),
            Number(h.longitude),
          );
          return { ...h, distance: Math.round(dist * 10) / 10 };
        }
        return { ...h, distance: undefined };
      }),
    );
  }, [userLocation, hospitals.length, haversineDistanceKm]);

  const deleteHospital = useCallback(async (
    id: string,
  ): Promise<{ error: PostgrestError | null }> => {
    const { error } = await supabase.from("hospitals").delete().eq("id", id);

    if (!error) {
      setHospitals((prev) => prev.filter((h) => h.id !== id));
    }

    return { error };
  }, []);

  const getHospitalById = useCallback((id: string): Hospital | undefined =>
    hospitals.find((h) => h.id === id), [hospitals]);

  /* =========================================================
     HERO BANNER CRUD
     ========================================================= */

  const addHeroBanner = useCallback(async (banner: Partial<HeroBanner>): Promise<void> => {
    try {
      console.log("📤 Menambahkan banner:", banner);

      // Map camelCase to snake_case for Supabase
      const bannerPayload = {
        title: banner.title,
        subtitle: banner.subtitle,
        image: banner.image || null,
        link: banner.link || null,
        is_active: banner.isActive ?? false,
        order: banner.order ?? 0,
      };

      const { data, error } = await supabase
        .from("hero_banners")
        .insert([bannerPayload])
        .select();

      if (error) {
        console.error("❌ Supabase Error - Add Banner:", error);
        throw new Error(error.message || "Gagal menambahkan banner");
      }

      console.log("✅ Banner berhasil ditambahkan:", data);

      if (data && data.length > 0) {
        // Map snake_case response to camelCase
        const newBanner = {
          id: data[0].id,
          title: data[0].title,
          subtitle: data[0].subtitle,
          image: data[0].image,
          link: data[0].link,
          isActive: data[0].is_active,
          order: data[0].order,
        };
        setHeroBanners((prev) => [...prev, newBanner]);
      }
    } catch (err) {
      console.error("💥 Unexpected error in addHeroBanner:", err);
      throw err;
    }
  }, []);

  const updateHeroBanner = useCallback(async (
    id: string,
    banner: Partial<HeroBanner>,
  ): Promise<void> => {
    try {
      console.log("📤 Update banner ID " + id + ":", banner);

      // Map camelCase to snake_case for Supabase
      const bannerPayload = {
        title: banner.title,
        subtitle: banner.subtitle,
        image: banner.image || null,
        link: banner.link || null,
        is_active: banner.isActive ?? false,
        order: banner.order ?? 0,
      };

      const { data, error } = await supabase
        .from("hero_banners")
        .update(bannerPayload)
        .eq("id", id)
        .select();

      if (error) {
        console.error("❌ Supabase Error - Update Banner:", error);
        throw new Error(error.message || "Gagal mengupdate banner");
      }

      console.log("✅ Banner berhasil diupdate:", data);

      if (data && data.length > 0) {
        // Map snake_case response to camelCase
        const updatedBanner = {
          id: data[0].id,
          title: data[0].title,
          subtitle: data[0].subtitle,
          image: data[0].image,
          link: data[0].link,
          isActive: data[0].is_active,
          order: data[0].order,
        };
        setHeroBanners((prev) =>
          prev.map((b) => (b.id === id ? updatedBanner : b)),
        );
      }
    } catch (err) {
      console.error("💥 Unexpected error in updateHeroBanner:", err);
      throw err;
    }
  }, []);

  const deleteHeroBanner = useCallback(async (id: string): Promise<void> => {
    try {
      console.log("Menghapus banner ID:", id);

      const { error } = await supabase
        .from("hero_banners")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Supabase Error - Delete Banner:", error);
        throw error;
      }

      console.log("Banner berhasil dihapus");

      setHeroBanners((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error("Unexpected error in deleteHeroBanner:", err);
      throw err;
    }
  }, []);

  /* =========================================================
     IMAGE UPLOAD FUNCTIONS
     ========================================================= */

  const uploadBannerImage = useCallback(async (file: File): Promise<string> => {
    try {
      console.log("📤 Uploading banner image:", file.name);

      // Generate unique filename
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const filename = `banner-${timestamp}-${randomStr}-${file.name}`;
      const filepath = `banners/${filename}`;

      // Upload ke Supabase Storage
      const { data, error } = await supabase.storage
        .from("banner-images")
        .upload(filepath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("❌ Supabase Storage Error:", error);
        throw new Error(error.message || "Gagal upload gambar");
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("banner-images")
        .getPublicUrl(filepath);

      const imageUrl = urlData.publicUrl;
      console.log("✅ Banner image uploaded successfully:", imageUrl);

      return imageUrl;
    } catch (err) {
      console.error("💥 Unexpected error in uploadBannerImage:", err);
      throw err;
    }
  }, []);

  /* =========================================================
     AUTH FUNCTIONS
     ========================================================= */

  const login = async (email: string, password: string): Promise<boolean> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) return false;

    setIsAuthenticated(true);
    setCurrentUser(data.user);
    return true;
  };

  const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  /* =========================================================
     PROVIDER VALUE
     ========================================================= */

  const value = useMemo(
    () => ({
      hospitals,
      addHospital,
      updateHospital,
      deleteHospital,
      getHospitalById,
      heroBanners,
      addHeroBanner,
      updateHeroBanner,
      deleteHeroBanner,
      uploadBannerImage,
      userLocation,
      setUserLocation,
      selectedCity,
      setSelectedCity,
      detectLocation: detectLocation,
      isAuthenticated,
      currentUser,
      login,
      logout,
      isLoading,
      searchQuery,
      setSearchQuery,
    }),
    [
      hospitals,
      heroBanners,
      userLocation,
      selectedCity,
      isAuthenticated,
      currentUser,
      isLoading,
      searchQuery,
      addHospital,
      updateHospital,
      deleteHospital,
      getHospitalById,
      addHeroBanner,
      updateHeroBanner,
      deleteHeroBanner,
      uploadBannerImage,
      detectLocation,
      setUserLocation,
      setSelectedCity,
      setSearchQuery,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/* =========================================================
   CUSTOM HOOK
   ========================================================= */

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
