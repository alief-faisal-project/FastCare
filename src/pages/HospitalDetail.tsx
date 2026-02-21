import { useParams, Link, useNavigate } from "react-router-dom";
import { sanitizeInput } from "@/lib/security";
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

  const directionsUrl = hospital.latitude && hospital.longitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`
    : hospital.googleMapsLink
    ? hospital.googleMapsLink
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        hospital.name + ' ' + hospital.address,
      )}`;

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
        {/* DESKTOP LAYOUT */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info (Desktop) */}
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
                    <span className="px-3 py-1 bg-red-600 text-white text-sm font-semibold">
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
                {(hospital.facilities ?? []).map((facility, index) => (
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

            {/* Description - Desktop (Below Facilities) */}
            {hospital.description && (
              <div className="bg-card border border-border p-6 rounded-3xl">
                <h2 className="text-lg font-semibold text-foreground mb-4 font-heading flex items-center gap-2">
                  <i className="fa-solid fa-align-left text-primary" />
                  Deskripsi
                </h2>
                <p className="text-foreground leading-relaxed">
                  {hospital.description}
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar (Desktop) */}
          <div className="space-y-6">
            {/* Information */}
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
                    Total Kamar
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

            {/* Action Buttons (Desktop) */}
            <div className="flex flex-col gap-3">
              <a
                href={`tel:${(hospital.phone || "").replace(/\s+/g, "")}`}
                className="flex items-center justify-center gap-2 py-3 rounded-3xl 
               bg-gradient-to-r from-green-700 via-green-600 to-white
               text-white border border-green-200
               font-medium transition-all duration-300
               hover:from-green-700 hover:via-green-500 hover:to-green-700"
              >
                <i className="fa-solid fa-phone-volume" />
                <span>Telepon</span>
              </a>

              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 rounded-3xl 
               bg-secondary/10 text-foreground border border-border font-medium hover:bg-secondary/20 transition-colors"
              >
                <i className="fa-solid fa-location-arrow" />
                <span>Peta Lokasi</span>
              </a>
              {/* Email Button (show if email exists) */}
              {hospital.email && (
                <a
                  href={`mailto:${encodeURIComponent(sanitizeInput(hospital.email))}`}
                  className="flex items-center justify-center gap-2 py-3 rounded-3xl 
               bg-secondary/10 text-foreground border border-border font-medium hover:bg-secondary/20 transition-colors"
                >
                  <i className="fa-solid fa-envelope" />
                  <span>Email</span>
                </a>
              )}
            </div>
          </div>
        </div>
        <div className="lg:hidden space-y-6">
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
                  <span className="px-3 py-1 bg-red-600 text-white text-sm font-semibold">
                    IGD 24 Jam
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-white font-heading">
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
            <div className="grid grid-cols-2 gap-3">
              {(hospital.facilities ?? []).map((facility, index) => (
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

          {/* Information & Actions Row (Mobile) */}
          <div className="grid grid-cols-3 gap-3">
            {/* Information - Wider on Mobile (Left 2 Columns) */}
            <div className="col-span-2 bg-card border border-border p-4 rounded-2xl">
              <h3 className="text-base font-semibold text-foreground mb-3 font-heading flex items-center gap-2">
                <i className="fa-solid fa-circle-info text-primary" />
                <span>Informasi</span>
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">
                    Kelas RS
                  </span>
                  <span className="font-medium text-primary text-sm">
                    Tipe {hospital.class}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">
                    Total Kamar
                  </span>
                  <span className="font-medium text-primary text-sm">
                    {hospital.totalBeds}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Kota</span>
                  <span className="font-medium text-primary text-sm">
                    {hospital.city}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">
                    Kepemilikan
                  </span>
                  <span className="font-medium text-primary text-sm">
                    {getOwnership()}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">
                    IGD 24 Jam
                  </span>
                  <span
                    className={`font-medium text-sm ${hospital.hasIGD ? "text-primary" : "text-muted-foreground"}`}
                  >
                    {hospital.hasIGD ? "Tersedia" : "Tidak Tersedia"}
                  </span>
                </div>
              </div>
            </div>

            {/* Phone & Maps Stack (Right 1 Column - Compact) */}

            <div className="col-span-1 flex flex-col gap-2">
              {/* Phone Button */}
              <a
                href={`tel:${hospital.phone}`}
                className="flex flex-row items-center justify-center gap-2 p-2 rounded-lg bg-secondary/10 text-foreground border border-border hover:bg-secondary/20"
              >
                <i className="fa-solid fa-phone-volume" />
                <span className="text-xs text-center">Telepon</span>
              </a>

              {/* Maps Button */}
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-row items-center justify-center gap-2 p-2 rounded-lg bg-secondary/10 text-foreground border border-border hover:bg-secondary/20"
              >
                <i className="fa-solid fa-location-arrow" />
                <span className="text-xs text-center">Peta</span>
              </a>

              {/* Email button (mobile) */}
              {hospital.email && (
                <a
                  href={`mailto:${encodeURIComponent(sanitizeInput(hospital.email))}`}
                  className="flex flex-row items-center justify-center gap-2 p-2 rounded-lg bg-secondary/10 text-foreground border border-border hover:bg-secondary/20"
                >
                  <i className="fa-solid fa-envelope" />
                  <span className="text-xs">Email</span>
                </a>
              )}
            </div>
          </div>

          {/* Description - Mobile (Below Everything) */}
          {hospital.description && (
            <div className="bg-card border border-border p-6 rounded-3xl">
              <h2 className="text-lg font-semibold text-foreground mb-4 font-heading flex items-center gap-2">
                <i className="fa-solid fa-align-left text-primary" />
                Deskripsi
              </h2>
              <p className="text-foreground leading-relaxed text-sm">
                {hospital.description}
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <FloatingContact />
    </div>
  );
};

export default HospitalDetail;
