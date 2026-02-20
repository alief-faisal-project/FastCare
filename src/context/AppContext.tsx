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
  const [heroBanners] = useState<HeroBanner[]>([]);
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
     FETCH DATA AWAL
     ========================================================= */

  const fetchInitialData = async () => {
    setIsLoading(true);

    const { data, error } = await supabase
      .from("hospitals")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch Error:", error);
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
        rating: h.rating,
        operatingHours: h.operating_hours,
        googleMapsLink: h.google_maps_link,

        // Pastikan facilities & services selalu ARRAY
        facilities: Array.isArray(h.facilities) ? h.facilities : [],
        services: Array.isArray(h.services) ? h.services : [],
      }));

      setHospitals(mapped);
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
     HELPER: HAPUS VALUE UNDEFINED (AMAN UNTUK SUPABASE)
     ========================================================= */

  const cleanObject = <T extends Record<string, unknown>>(obj: T): T => {
    return Object.fromEntries(
      Object.entries(obj).filter(([, value]) => value !== undefined),
    ) as T;
  };

  /* =========================================================
     HELPER: NORMALISASI ARRAY (INI KUNCI MASALAHMU)
     - Mencegah string masuk ke kolom text[]
     - Aman untuk input admin panel
     ========================================================= */

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

  const addHospital = async (
    hospital: Partial<Hospital>,
  ): Promise<{ error: PostgrestError | null }> => {
    const payload = cleanObject({
      name: hospital.name ?? "",
      type: hospital.type ?? "RS Umum",
      class: hospital.class ?? "C",
      address: hospital.address ?? "",
      city: hospital.city ?? "",
      district: hospital.district ?? "",
      phone: hospital.phone ?? "",
      email: hospital.email ?? "",
      website: hospital.website ?? "",
      image: hospital.image ?? "",
      description: hospital.description ?? "",
      has_icu: hospital.hasICU ?? false,
      has_igd: hospital.hasIGD ?? false,
      total_beds: hospital.totalBeds ?? 0,
      operating_hours: hospital.operatingHours ?? "24 Jam",
      latitude: hospital.latitude ?? 0,
      longitude: hospital.longitude ?? 0,
      google_maps_link: hospital.googleMapsLink ?? "",
      rating: hospital.rating ?? 0,

      // PENTING: normalisasi agar Supabase benar-benar insert
      facilities: normalizeArray(hospital.facilities),
      services: normalizeArray(hospital.services),
    });

    console.log("ADD HOSPITAL PAYLOAD:", payload);

    const { error } = await supabase.from("hospitals").insert([payload]);

    if (!error) await fetchInitialData();

    return { error };
  };

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
      latitude: hospital.latitude,
      longitude: hospital.longitude,
      google_maps_link: hospital.googleMapsLink,
      rating: hospital.rating,

      // UPDATE juga wajib dinormalisasi
      facilities:
        hospital.facilities !== undefined
          ? normalizeArray(hospital.facilities)
          : undefined,

      services:
        hospital.services !== undefined
          ? normalizeArray(hospital.services)
          : undefined,
    });

    console.log("UPDATE HOSPITAL PAYLOAD:", payload);

    const { error } = await supabase
      .from("hospitals")
      .update(payload)
      .eq("id", id);

    if (!error) await fetchInitialData();

    return { error };
  };

  const deleteHospital = async (
    id: string,
  ): Promise<{ error: PostgrestError | null }> => {
    const { error } = await supabase.from("hospitals").delete().eq("id", id);

    if (!error) await fetchInitialData();

    return { error };
  };

  const getHospitalById = (id: string): Hospital | undefined =>
    hospitals.find((h) => h.id === id);

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
        addHeroBanner: async () => {},
        updateHeroBanner: async () => {},
        deleteHeroBanner: async () => {},
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
