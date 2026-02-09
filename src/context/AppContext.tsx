import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Hospital, HeroBanner, AdminUser, UserLocation, BantenCity } from '@/types';
import { initialHospitals, initialHeroBanners, demoAdminUsers } from '@/data/initialData';

interface AppContextType {
  // Hospitals
  hospitals: Hospital[];
  addHospital: (hospital: Omit<Hospital, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateHospital: (id: string, hospital: Partial<Hospital>) => void;
  deleteHospital: (id: string) => void;
  getHospitalById: (id: string) => Hospital | undefined;
  
  // Hero Banners
  heroBanners: HeroBanner[];
  addHeroBanner: (banner: Omit<HeroBanner, 'id'>) => void;
  updateHeroBanner: (id: string, banner: Partial<HeroBanner>) => void;
  deleteHeroBanner: (id: string) => void;
  
  // Location
  userLocation: UserLocation | null;
  setUserLocation: (location: UserLocation | null) => void;
  selectedCity: BantenCity | 'Semua' | 'Lokasi Terdekat';
  setSelectedCity: (city: BantenCity | 'Semua' | 'Lokasi Terdekat') => void;
  detectLocation: () => Promise<void>;
  
  // Auth
  isAuthenticated: boolean;
  currentUser: AdminUser | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  
  // UI
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  HOSPITALS: 'fastcare_hospitals',
  BANNERS: 'fastcare_banners',
  AUTH: 'fastcare_auth',
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [heroBanners, setHeroBanners] = useState<HeroBanner[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [selectedCity, setSelectedCity] = useState<BantenCity | 'Semua' | 'Lokasi Terdekat'>('Semua');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Initialize data from localStorage or use initial data
  useEffect(() => {
    const storedHospitals = localStorage.getItem(STORAGE_KEYS.HOSPITALS);
    const storedBanners = localStorage.getItem(STORAGE_KEYS.BANNERS);
    const storedAuth = localStorage.getItem(STORAGE_KEYS.AUTH);

    if (storedHospitals) {
      setHospitals(JSON.parse(storedHospitals));
    } else {
      setHospitals(initialHospitals);
      localStorage.setItem(STORAGE_KEYS.HOSPITALS, JSON.stringify(initialHospitals));
    }

    if (storedBanners) {
      setHeroBanners(JSON.parse(storedBanners));
    } else {
      setHeroBanners(initialHeroBanners);
      localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(initialHeroBanners));
    }

    if (storedAuth) {
      const auth = JSON.parse(storedAuth);
      setIsAuthenticated(true);
      setCurrentUser(auth);
    }

    // Simulate loading
    setTimeout(() => setIsLoading(false), 2000);
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    if (hospitals.length > 0) {
      localStorage.setItem(STORAGE_KEYS.HOSPITALS, JSON.stringify(hospitals));
    }
  }, [hospitals]);

  useEffect(() => {
    if (heroBanners.length > 0) {
      localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(heroBanners));
    }
  }, [heroBanners]);

  // Calculate distance for hospitals
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Detect user location
  const detectLocation = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location: UserLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          setSelectedCity('Lokasi Terdekat');
          
          // Update hospitals with distance after setting location
          setHospitals(prev => prev.map(hospital => ({
            ...hospital,
            distance: calculateDistance(
              location.lat,
              location.lng,
              hospital.coordinates.lat,
              hospital.coordinates.lng
            ),
          })));
          
          resolve();
        },
        (error) => {
          console.error('Error getting location:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  };

  // Hospital CRUD
  const addHospital = (hospital: Omit<Hospital, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newHospital: Hospital = {
      ...hospital,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setHospitals(prev => [...prev, newHospital]);
  };

  const updateHospital = (id: string, updates: Partial<Hospital>) => {
    setHospitals(prev =>
      prev.map(hospital =>
        hospital.id === id
          ? { ...hospital, ...updates, updatedAt: new Date().toISOString().split('T')[0] }
          : hospital
      )
    );
  };

  const deleteHospital = (id: string) => {
    setHospitals(prev => prev.filter(hospital => hospital.id !== id));
  };

  const getHospitalById = (id: string) => {
    return hospitals.find(h => h.id === id);
  };

  // Banner CRUD
  const addHeroBanner = (banner: Omit<HeroBanner, 'id'>) => {
    const newBanner: HeroBanner = {
      ...banner,
      id: Date.now().toString(),
    };
    setHeroBanners(prev => [...prev, newBanner]);
  };

  const updateHeroBanner = (id: string, updates: Partial<HeroBanner>) => {
    setHeroBanners(prev =>
      prev.map(banner => (banner.id === id ? { ...banner, ...updates } : banner))
    );
  };

  const deleteHeroBanner = (id: string) => {
    setHeroBanners(prev => prev.filter(banner => banner.id !== id));
  };

  // Auth
  const login = (username: string, password: string): boolean => {
    const user = demoAdminUsers.find(
      u => u.username === username && u.password === password
    );
    if (user) {
      setIsAuthenticated(true);
      setCurrentUser(user);
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.AUTH);
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
        setIsLoading,
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
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
