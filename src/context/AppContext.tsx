import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
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
    const channel = supabase
      .channel("realtime-hospitals")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "hospitals" },
        (payload) => {
          fetchInitialData();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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
      const mappedBanners = bannerData.map((b: any) => ({
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
     HOSPITAL CRUD
     ========================================================= */

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

  const addHospital = async (
    hospital: Partial<Hospital>,
  ): Promise<{ error: PostgrestError | null }> => {
    try {
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
        latitude: hospital.latitude ?? -6.1185,
        longitude: hospital.longitude ?? 106.1564,
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
        setHospitals((prev) => [mapHospital(data[0]), ...prev]);
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
  };

  const updateHospital = async (
    id: string,
    hospital: Partial<Hospital>,
  ): Promise<{ error: PostgrestError | null }> => {
    try {
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
        latitude: hospital.latitude,
        longitude: hospital.longitude,
        facilities: hospital.facilities
          ? normalizeArray(hospital.facilities)
          : undefined,
        services: hospital.services
          ? normalizeArray(hospital.services)
          : undefined,
      });

      console.log("Update payload untuk ID " + id + ":", payload);

      const { data, error } = await supabase
        .from("hospitals")
        .update(payload)
        .eq("id", id)
        .select();

      if (error) {
        console.error("Supabase Error - Update Hospital:", error);
        return { error };
      }

      if (data && data.length > 0) {
        console.log("Hospital berhasil diupdate:", data[0]);
        setHospitals((prev) =>
          prev.map((h) => (h.id === id ? mapHospital(data[0]) : h)),
        );
      }

      return { error: null };
    } catch (err) {
      console.error("Unexpected error in updateHospital:", err);
      return {
        error: {
          message: err instanceof Error ? err.message : "Error tidak diketahui",
          details: "",
          hint: "",
          code: "ERROR",
        } as PostgrestError,
      };
    }
  };

  const deleteHospital = async (
    id: string,
  ): Promise<{ error: PostgrestError | null }> => {
    const { error } = await supabase.from("hospitals").delete().eq("id", id);

    if (!error) {
      setHospitals((prev) => prev.filter((h) => h.id !== id));
    }

    return { error };
  };

  const getHospitalById = (id: string): Hospital | undefined =>
    hospitals.find((h) => h.id === id);

  /* =========================================================
     HERO BANNER CRUD
     ========================================================= */

  const addHeroBanner = async (banner: Partial<HeroBanner>): Promise<void> => {
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
  };

  const updateHeroBanner = async (
    id: string,
    banner: Partial<HeroBanner>,
  ): Promise<void> => {
    try {
      console.log("📤 Update banner ID " + id + ":", banner);
      console.log(
        "banner.isActive:",
        banner.isActive,
        "Type:",
        typeof banner.isActive,
      );

      // Map camelCase to snake_case for Supabase
      const isActiveBool = Boolean(banner.isActive);
      const bannerPayload = {
        title: banner.title,
        subtitle: banner.subtitle,
        image: banner.image || null,
        link: banner.link || null,
        is_active: isActiveBool,
        order: banner.order ?? 0,
      };

      console.log("Final payload to Supabase:", bannerPayload);

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
  };

  const deleteHeroBanner = async (id: string): Promise<void> => {
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
  };

  /* =========================================================
     IMAGE UPLOAD FUNCTIONS
     ========================================================= */

  const uploadBannerImage = async (file: File): Promise<string> => {
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
  };

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

  return (
    <AppContext.Provider
      value={{
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
        detectLocation: async () => {},
        isAuthenticated,
        currentUser,
        login,
        logout,
        isLoading,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

/* =========================================================
   CUSTOM HOOK
   ========================================================= */

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
