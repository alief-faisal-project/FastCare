import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import { Hospital, HeroBanner, UserLocation, BantenCity } from "@/types";

interface AppContextType {
  hospitals: Hospital[];
  addHospital: (hospital: Partial<Hospital>) => Promise<void>;
  updateHospital: (id: string, hospital: Partial<Hospital>) => Promise<void>;
  deleteHospital: (id: string) => Promise<void>;
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
  currentUser: any;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;

  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [heroBanners, setHeroBanners] = useState<HeroBanner[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [selectedCity, setSelectedCity] = useState<
    BantenCity | "Semua" | "Lokasi Terdekat"
  >("Semua");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // =============================
  // INITIAL LOAD
  // =============================

  useEffect(() => {
    fetchInitialData();
    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log("AUTH CHANGED:", session);

        setIsAuthenticated(!!session);
        setCurrentUser(session?.user ?? null);
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    const { data, error } = await supabase.auth.getSession();

    console.log("SESSION:", data);
    console.log("SESSION ERROR:", error);

    if (data.session) {
      setIsAuthenticated(true);
      setCurrentUser(data.session.user);
    } else {
      setIsAuthenticated(false);
      setCurrentUser(null);
    }
  };

  const fetchInitialData = async () => {
    setIsLoading(true);

    const { data: hospitalsData, error: hospitalsError } = await supabase
      .from("hospitals")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: bannersData, error: bannersError } = await supabase
      .from("hero_banners")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (hospitalsError) console.error("FETCH HOSPITAL ERROR:", hospitalsError);
    if (bannersError) console.error("FETCH BANNER ERROR:", bannersError);

    if (hospitalsData) setHospitals(hospitalsData as Hospital[]);
    if (bannersData) setHeroBanners(bannersData as HeroBanner[]);

    setIsLoading(false);
  };

  // =============================
  // HOSPITAL CRUD
  // =============================

  const addHospital = async (hospital: Partial<Hospital>) => {
    const { data, error } = await supabase
      .from("hospitals")
      .insert([hospital])
      .select();

    if (error) {
      console.error("INSERT ERROR:", error);
      alert(error.message);
      return;
    }

    if (data) {
      setHospitals((prev) => [data[0], ...prev]);
    }
  };

  const updateHospital = async (id: string, hospital: Partial<Hospital>) => {
    const { error } = await supabase
      .from("hospitals")
      .update(hospital)
      .eq("id", id);

    if (error) {
      console.error("UPDATE ERROR:", error);
      alert(error.message);
      return;
    }

    fetchInitialData();
  };

  const deleteHospital = async (id: string) => {
    const { error } = await supabase.from("hospitals").delete().eq("id", id);

    if (error) {
      console.error("DELETE ERROR:", error);
      alert(error.message);
      return;
    }

    setHospitals((prev) => prev.filter((h) => h.id !== id));
  };

  const getHospitalById = (id: string) => {
    return hospitals.find((h) => h.id === id);
  };

  // =============================
  // HERO BANNER CRUD
  // =============================

  const addHeroBanner = async (banner: Partial<HeroBanner>) => {
    const { error } = await supabase.from("hero_banners").insert([banner]);

    if (error) {
      console.error("BANNER INSERT ERROR:", error);
      alert(error.message);
      return;
    }

    fetchInitialData();
  };

  const updateHeroBanner = async (id: string, banner: Partial<HeroBanner>) => {
    const { error } = await supabase
      .from("hero_banners")
      .update(banner)
      .eq("id", id);

    if (error) {
      console.error("BANNER UPDATE ERROR:", error);
      alert(error.message);
      return;
    }

    fetchInitialData();
  };

  const deleteHeroBanner = async (id: string) => {
    const { error } = await supabase.from("hero_banners").delete().eq("id", id);

    if (error) {
      console.error("BANNER DELETE ERROR:", error);
      alert(error.message);
      return;
    }

    fetchInitialData();
  };

  // =============================
  // GEO LOCATION
  // =============================

  const detectLocation = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: UserLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          setUserLocation(location);
          setSelectedCity("Lokasi Terdekat");
          resolve();
        },
        (error) => reject(error),
      );
    });
  };

  // =============================
  // AUTH
  // =============================

  const login = async (email: string, password: string): Promise<boolean> => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("LOGIN ERROR:", error);
      return false;
    }

    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

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
        userLocation,
        setUserLocation,
        selectedCity,
        setSelectedCity,
        detectLocation,
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

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
