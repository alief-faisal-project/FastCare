import { useParams, Link, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";

const HospitalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { getHospitalById } = useApp();
  const navigate = useNavigate();

  const hospital = getHospitalById(id || "");

  if (!hospital) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <i className="fa-solid fa-hospital text-6xl text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Rumah Sakit Tidak Ditemukan
            </h1>
            <p className="text-muted-foreground mb-6">
              Data rumah sakit yang Anda cari tidak tersedia.
            </p>
            <Link
              to="/"
              className="px-6 py-3 bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${hospital.coordinates.lat},${hospital.coordinates.lng}`;

  // Determine ownership type based on hospital name
  const getOwnership = () => {
    if (hospital.name.includes("RSUD") || hospital.name.includes("RSU "))
      return "Pemerintah";
    return "Swasta";
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">
            Beranda
          </Link>
          <i className="fa-solid fa-chevron-right text-xs" />
          <span className="text-foreground">{hospital.name}</span>
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <div className="relative aspect-video overflow-hidden rounded-3xl">
              <img
                src={hospital.image}
                alt={hospital.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex flex-wrap gap-2 mb-3">
                  {hospital.hasIGD && (
                    <span className="px-3 py-1 bg-red-600 rounded-r-xl text-white text-sm font-semibold">
                      IGD 24 Jam
                    </span>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-white font-heading">
                  {hospital.name}
                </h1>
              </div>
            </div>

            {/* Facilities & Services */}
            <div className="bg-card border border-border p-6 rounded-3xl">
              <h2 className="text-lg font-semibold text-foreground mb-4 font-heading flex items-center gap-2">
                <i className="fa-solid fa-stethoscope text-primary" />
                Fasilitas & Layanan
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {hospital.facilities.map((facility, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 rounded-xl bg-accent/50"
                  >
                    <i className="fa-solid fa-circle-check text-primary" />
                    <span className="text-sm text-foreground">{facility}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Information - Now on top */}
            <div className="bg-card border border-border p-6 rounded-3xl">
              <h3 className="text-lg font-semibold text-foreground mb-4 font-heading flex items-center gap-2">
                <i className="fa-solid fa-circle-info text-primary" />
                Informasi
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">
                    Kelas RS
                  </span>
                  <span className="font-medium text-primary">
                    Tipe {hospital.class}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">
                    Tempat Tidur
                  </span>
                  <span className="font-medium text-primary">
                    {hospital.totalBeds}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Kota</span>
                  <span className="font-medium text-primary">
                    {hospital.city}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">
                    Kepemilikan
                  </span>
                  <span className="font-medium text-primary">
                    {getOwnership()}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">
                    IGD 24 Jam
                  </span>
                  <span
                    className={`font-medium ${hospital.hasIGD ? "text-primary" : "text-muted-foreground"}`}
                  >
                    {hospital.hasIGD ? "Tersedia" : "Tidak Tersedia"}
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop: Action Buttons in a row */}
            <div className="hidden md:flex flex-col gap-3">
              <a
                href={`tel:${hospital.phone}`}
                className="flex items-center justify-center gap-2 py-3 rounded-xl border border-primary text-primary font-medium transition-colors"
              >
                <i className="fa-solid fa-phone-volume" />
                <span>Telepon</span>
              </a>

              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 rounded-xl border border-primary text-primary font-medium transition-colors"
              >
                <i className="fa-solid fa-location-arrow" />
                <span>Maps</span>
              </a>
            </div>

            {/* Mobile: Stacked buttons */}
            <div className="md:hidden space-y-3">
              <a
                href={`tel:${hospital.phone}`}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-3xl  border border-primary text-primary font-medium transition-colors"
              >
                <i className="fa-solid fa-phone-volume" />
                <span>{hospital.phone}</span>
              </a>
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-3xl border border-primary text-primary font-medium transition-colors"
              >
                <i className="fa-solid fa-location-arrow" />
                <span>Buka di Google Maps</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <FloatingContact />
    </div>
  );
};

export default HospitalDetail;
