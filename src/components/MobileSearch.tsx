import { useState, useRef, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { BANTEN_CITIES, BantenCity } from "@/types";

const MobileSearch = () => {
  const {
    selectedCity,
    setSelectedCity,
    detectLocation,
    searchQuery,
    setSearchQuery,
  } = useApp();
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const locationRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        locationRef.current &&
        !locationRef.current.contains(event.target as Node)
      ) {
        setIsLocationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDetectLocation = async () => {
    setIsDetecting(true);
    try {
      await detectLocation();
      setIsLocationOpen(false);
    } catch (error) {
      console.error("Failed to detect location", error);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleCitySelect = (city: BantenCity | "Semua") => {
    setSelectedCity(city);
    setIsLocationOpen(false);
  };

  return (
    <div className="md:hidden px-4 py-3 bg-background border-b border-border">
      <div className="flex flex-col gap-3">
        {/* Location Dropdown */}
        <div className="relative" ref={locationRef}>
          <button
            onClick={() => setIsLocationOpen(!isLocationOpen)}
            className="w-full flex items-center space-x-2 px-4 py-3 rounded-xl border border-border hover:border-primary/50 transition-colors bg-card"
          >
            <i className="fa-solid fa-location-arrow text-primary" />
            <span className="text-sm text-foreground truncate flex-1 text-left">
              {selectedCity === "Lokasi Terdekat"
                ? "Lokasi Terdekat"
                : selectedCity}
            </span>
            <i
              className={`fa-solid fa-chevron-down text-x text-muted-foreground transition-transform ${isLocationOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isLocationOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border shadow-lg z-50 py-2 animate-scale-in">
              {/* Detect Location */}
              <button
                onClick={handleDetectLocation}
                disabled={isDetecting}
                className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-accent transition-colors text-left"
              >
                <i
                  className={`fa-solid ${isDetecting ? "fa-spinner fa-spin" : "fa-street-view"} text-primary w-5`}
                />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Lokasi Terdekat
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Deteksi lokasi perangkat
                  </p>
                </div>
              </button>

              <div className="border-t border-border my-2" />

              {/* All */}
              <button
                onClick={() => handleCitySelect("Semua")}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-accent transition-colors text-left ${
                  selectedCity === "Semua" ? "bg-accent" : ""
                }`}
              >
                <span className="text-sm text-foreground">Semua Wilayah</span>
              </button>

              <div className="border-t border-border my-2" />

              {/* Cities */}
              <div className="max-h-48 overflow-y-auto">
                {BANTEN_CITIES.map((city) => (
                  <button
                    key={city}
                    onClick={() => handleCitySelect(city)}
                    className={`w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-accent transition-colors text-left ${
                      selectedCity === city ? "bg-accent" : ""
                    }`}
                  >
                    <span className="text-sm text-foreground">{city}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Temukan rumah sakit di Banten..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-card text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default MobileSearch;
