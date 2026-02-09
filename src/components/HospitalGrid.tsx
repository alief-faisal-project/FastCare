import { useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import HospitalCard from './HospitalCard';

const HospitalGrid = () => {
  const { hospitals, selectedCity, searchQuery, userLocation } = useApp();

  const filteredHospitals = useMemo(() => {
    let result = [...hospitals];

    // Filter by city
    if (selectedCity !== 'Semua' && selectedCity !== 'Lokasi Terdekat') {
      result = result.filter(h => h.city === selectedCity);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        h =>
          h.name.toLowerCase().includes(query) ||
          h.address.toLowerCase().includes(query) ||
          h.city.toLowerCase().includes(query) ||
          h.facilities.some(f => f.toLowerCase().includes(query)) ||
          h.services.some(s => s.toLowerCase().includes(query))
      );
    }

    // cari berdasarkan lokasi
    if (selectedCity === 'Lokasi Terdekat' && userLocation) {
      result.sort((a, b) => (a.distance || 999) - (b.distance || 999));
    }

    return result;
  }, [hospitals, selectedCity, searchQuery, userLocation]);

  return (
    <section className="container mx-auto px-4 py-6" id="hospitals">
      {/* Section Header */}
      <div className="mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-foreground font-heading">
          {selectedCity === 'Semua'
            ? 'Temukan Rumah Sakit Terdekat'
            : selectedCity === 'Lokasi Terdekat'
            ? 'Rumah Sakit Terdekat'
            : `Rumah Sakit di ${selectedCity}`}
        </h2>
      </div>

      {/* Grid Rumah Sakit - 5 columns di desktop, 2-3 di mobile/tablet */}
      {filteredHospitals.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {filteredHospitals.map((hospital, index) => (
            <div
              key={hospital.id}
              className="fade-in"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <HospitalCard hospital={hospital} />
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <div className="w-16 h-16 mx-auto mb-3 bg-secondary rounded-full flex items-center justify-center">
            <i className="fa-solid fa-hospital text-2xl text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1.5">
            Tidak ada rumah sakit ditemukan
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Coba ubah filter lokasi atau kata kunci pencarian.
          </p>
        </div>
      )}
    </section>
  );
};

export default HospitalGrid;