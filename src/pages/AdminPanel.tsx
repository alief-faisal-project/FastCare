import { useState, useEffect, useRef } from "react";
import { sanitizeInput, isValidEmail, isValidUrl } from "@/lib/security";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Hospital, HeroBanner, BANTEN_CITIES } from "@/types";
import fastcareLogo from "@/assets/fastcare-logo.png";
import { toast } from "sonner";

type AdminTab = "hospitals" | "banners" | "settings";

const AdminPanel = () => {
  const {
    isAuthenticated,
    currentUser,
    logout,
    hospitals,
    addHospital,
    updateHospital,
    deleteHospital,
    heroBanners,
    addHeroBanner,
    updateHeroBanner,
    deleteHeroBanner,
  } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<AdminTab>("hospitals");
  const [showHospitalForm, setShowHospitalForm] = useState(false);
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  const filteredHospitals = hospitals.filter(
    (h) =>
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.city.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleDeleteHospital = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus rumah sakit ini?")) {
      deleteHospital(id);
    }
  };

  const handleDeleteBanner = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus banner ini?")) {
      deleteHeroBanner(id);
    }
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Top Bar */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <img src={fastcareLogo} alt="FastCare.id" className="h-8" />
            </Link>
            <span className="text-muted-foreground">|</span>
            <span className="font-semibold text-foreground">Admin Panel</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground hidden md:block">
              <i className="fa-solid fa-user mr-2" />
              {currentUser?.email}
            </span>
            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-muted-foreground hover:text-destructive transition-colors"
            >
              <i className="fa-solid fa-right-from-bracket" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="bg-card border border-border rounded-xl p-2 sticky top-24">
              <button
                onClick={() => setActiveTab("hospitals")}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === "hospitals"
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-accent"
                }`}
              >
                <i className="fa-solid fa-hospital w-5" />
                <span className="font-medium">Rumah Sakit</span>
                <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  {hospitals.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab("banners")}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === "banners"
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-accent"
                }`}
              >
                <i className="fa-solid fa-images w-5" />
                <span className="font-medium">Hero Banner</span>
                <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  {heroBanners.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === "settings"
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-accent"
                }`}
              >
                <i className="fa-solid fa-gear w-5" />
                <span className="font-medium">Pengaturan</span>
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Hospitals Tab */}
            {activeTab === "hospitals" && (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground font-heading">
                      Kelola Rumah Sakit
                    </h1>
                    <p className="text-muted-foreground">
                      Tambah, edit, atau hapus data rumah sakit
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingHospital(null);
                      setShowHospitalForm(true);
                    }}
                    className="flex items-center space-x-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    <i className="fa-solid fa-plus" />
                    <span>Tambah RS</span>
                  </button>
                </div>

                {/* Search */}
                <div className="relative">
                  <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Cari rumah sakit..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Hospital List */}
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border bg-secondary/50">
                          <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">
                            Rumah Sakit
                          </th>
                          <th className="text-left px-4 py-3 text-sm font-semibold text-foreground hidden md:table-cell">
                            Kota
                          </th>
                          <th className="text-left px-4 py-3 text-sm font-semibold text-foreground hidden lg:table-cell">
                            Tipe
                          </th>
                          <th className="text-left px-4 py-3 text-sm font-semibold text-foreground hidden lg:table-cell">
                            Kelas
                          </th>
                          <th className="text-left px-4 py-3 text-sm font-semibold text-foreground hidden md:table-cell">
                            Bed
                          </th>
                          <th className="text-right px-4 py-3 text-sm font-semibold text-foreground">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredHospitals.map((hospital) => (
                          <tr
                            key={hospital.id}
                            className="border-b border-border hover:bg-accent/50 transition-colors"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-3">
                                <img
                                  src={hospital.image}
                                  alt={hospital.name}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                                <div>
                                  <p className="font-medium text-foreground">
                                    {hospital.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground md:hidden">
                                    {hospital.city}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                              {hospital.city}
                            </td>
                            <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">
                              {hospital.type}
                            </td>
                            <td className="px-4 py-3 hidden lg:table-cell">
                              <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                                Kelas {hospital.class}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm hidden md:table-cell">
                              <span className="text-foreground font-medium">
                                {hospital.totalBeds}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => {
                                    setEditingHospital(hospital);
                                    setShowHospitalForm(true);
                                  }}
                                  className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <i className="fa-solid fa-pen-to-square" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteHospital(hospital.id)
                                  }
                                  className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                  title="Hapus"
                                >
                                  <i className="fa-solid fa-trash" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {filteredHospitals.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                      <i className="fa-solid fa-hospital text-3xl mb-2" />
                      <p>Tidak ada data rumah sakit</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Banners Tab */}
            {activeTab === "banners" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground font-heading">
                      Kelola Hero Banner
                    </h1>
                    <p className="text-muted-foreground">
                      Atur banner yang tampil di halaman utama
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingBanner(null);
                      setShowBannerForm(true);
                    }}
                    className="flex items-center space-x-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    <i className="fa-solid fa-plus" />
                    <span>Tambah Banner</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {heroBanners.map((banner) => (
                    <div
                      key={banner.id}
                      className="bg-card border border-border rounded-xl overflow-hidden"
                    >
                      <div className="aspect-video relative bg-gray-300">
                        {banner.image ? (
                          <img
                            src={banner.image}
                            alt={banner.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-400">
                            <div className="text-center text-white/70">
                              <i className="fa-solid fa-image text-4xl mb-2" />
                              <p className="text-sm">No Image</p>
                            </div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        {/* Overlay text removed per request; only image displayed */}
                        <div className="absolute top-3 right-3 flex items-center space-x-2">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${
                              banner.isActive
                                ? "bg-success text-success-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {banner.isActive ? "Aktif" : "Nonaktif"}
                          </span>
                        </div>
                      </div>
                      <div className="p-4 flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Urutan: {banner.order}
                        </span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setEditingBanner(banner);
                              setShowBannerForm(true);
                            }}
                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          >
                            <i className="fa-solid fa-pen-to-square" />
                          </button>
                          <button
                            onClick={() => handleDeleteBanner(banner.id)}
                            className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                          >
                            <i className="fa-solid fa-trash" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-foreground font-heading">
                    Pengaturan
                  </h1>
                  <p className="text-muted-foreground">
                    Konfigurasi sistem dan informasi akun
                  </p>
                </div>

                <div className="bg-card border border-border rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">
                    Informasi Akun
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Nama
                      </label>
                      <p className="font-medium text-foreground">
                        {currentUser?.email}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Username
                      </label>
                      <p className="font-medium text-foreground">
                        {currentUser?.username}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Role
                      </label>
                      <p className="font-medium text-foreground capitalize">
                        {currentUser?.role}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">
                    Statistik
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-accent rounded-lg">
                      <p className="text-2xl font-bold text-primary">
                        {hospitals.length}
                      </p>
                      <p className="text-sm text-muted-foreground">Total RS</p>
                    </div>
                    <div className="p-4 bg-accent rounded-lg">
                      <p className="text-2xl font-bold text-primary">
                        {heroBanners.filter((b) => b.isActive).length}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Banner Aktif
                      </p>
                    </div>
                    <div className="p-4 bg-accent rounded-lg">
                      <p className="text-2xl font-bold text-primary">
                        {hospitals.reduce((a, b) => a + b.totalBeds, 0)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Total Kamar
                      </p>
                    </div>
                    <div className="p-4 bg-accent rounded-lg">
                      <p className="text-2xl font-bold text-success">
                        {hospitals.filter((h) => h.googleMapsLink).length}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Dengan Maps
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Hospital Form Modal */}
      {showHospitalForm && (
        <HospitalFormModal
          hospital={editingHospital}
          onClose={() => {
            setShowHospitalForm(false);
            setEditingHospital(null);
          }}
          onSave={async (data) => {
            try {
              if (editingHospital) {
                const result = await updateHospital(editingHospital.id, data);
                if (result?.error) {
                  console.error("Update error:", result.error);
                  toast.error("Gagal mengupdate: " + result.error.message);
                  return;
                }
                toast.success("✅ Rumah sakit berhasil diupdate!", {
                  description: `${data.name} telah diperbarui di database`,
                });
              } else {
                const result = await addHospital(data as any);
                if (result?.error) {
                  console.error("Add error:", result.error);
                  toast.error("Gagal menambah: " + result.error.message);
                  return;
                }
                toast.success("✅ Rumah sakit berhasil ditambahkan!", {
                  description: `${data.name} telah ditambahkan ke database`,
                });
              }

              // hanya tutup jika sukses
              setShowHospitalForm(false);
              setEditingHospital(null);
            } catch (error) {
              console.error("Unexpected error:", error);
              const errorMsg =
                error instanceof Error
                  ? error.message
                  : "Error tidak diketahui";
              toast.error("Error: " + errorMsg);
            }
          }}
        />
      )}

      {/* Banner Form Modal */}
      {showBannerForm && (
        <BannerFormModal
          banner={editingBanner}
          onClose={() => {
            setShowBannerForm(false);
            setEditingBanner(null);
          }}
          onSave={async (data) => {
            try {
              if (editingBanner) {
                await updateHeroBanner(editingBanner.id, data);
                toast.success("✅ Banner berhasil diupdate!", {
                  description: "Perubahan telah disimpan ke database",
                });
              } else {
                await addHeroBanner(data as HeroBanner);
                toast.success("✅ Banner berhasil ditambahkan!", {
                  description: "Banner baru telah ditambahkan",
                });
              }
              setShowBannerForm(false);
              setEditingBanner(null);
            } catch (error: unknown) {
              console.error("Banner error:", error);
              const errorMessage =
                error instanceof Error
                  ? error.message
                  : "Gagal menyimpan banner";
              toast.error("Error: " + errorMessage);
              // Jangan tutup modal jika ada error, biarkan user retry
            }
          }}
        />
      )}
    </div>
  );
};

// Hospital Form Modal Component
interface HospitalFormModalProps {
  hospital: Hospital | null;
  onClose: () => void;
  onSave: (data: Partial<Hospital>) => Promise<void>;
}

const HospitalFormModal = ({
  hospital,
  onClose,
  onSave,
}: HospitalFormModalProps) => {
  type FormState = {
    name: string;
    type: Hospital["type"];
    class: Hospital["class"];
    address: string;
    city: string;
    district: string;
    phone: string;
    email: string;
    image: string;
    description: string;
    facilities: string;
    services: string;
    totalBeds: number;
    hasIGD: boolean;
    hasICU: boolean;
    operatingHours: string;
    googleMapsLink: string;
    latitude: string;
    longitude: string;
  };

  const [formData, setFormData] = useState<FormState>({
    name: hospital?.name || "",
    type: hospital?.type || "RS Umum",
    class: hospital?.class || "C",
    address: hospital?.address || "",
    city: hospital?.city || "Kota Serang",
    district: hospital?.district || "",
    phone: hospital?.phone || "",
    email: hospital?.email || "",
    image: hospital?.image || "",
    description: hospital?.description || "",
    facilities: Array.isArray(hospital?.facilities)
      ? hospital!.facilities.join(", ")
      : "",
    services: Array.isArray(hospital?.services)
      ? hospital!.services.join(", ")
      : "",
    totalBeds: hospital?.totalBeds || 100,
    hasIGD: hospital?.hasIGD ?? true,
    hasICU: hospital?.hasICU ?? true,
    operatingHours: hospital?.operatingHours || "24 Jam",
    // removed website, latitude and longitude — we only keep googleMapsLink
    googleMapsLink: hospital?.googleMapsLink || "",
    latitude: hospital?.latitude != null ? String(hospital.latitude) : "",
    longitude: hospital?.longitude != null ? String(hospital.longitude) : "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi input
    if (!formData.name.trim()) {
      alert("Nama Rumah Sakit tidak boleh kosong!");
      return;
    }
    if (!formData.address.trim()) {
      alert("Alamat tidak boleh kosong!");
      return;
    }
    // Telepon: allow free text (some entries include extensions or notes)
    if (!formData.phone.trim()) {
      alert("Telepon tidak boleh kosong!");
      return;
    }
    if (!formData.image.trim() || !isValidUrl(formData.image)) {
      alert("URL Gambar tidak boleh kosong dan harus berupa URL yang valid");
      return;
    }
    if (!formData.description.trim()) {
      alert("Deskripsi tidak boleh kosong!");
      return;
    }
    if (formData.email && !isValidEmail(formData.email)) {
      alert("Format email tidak valid");
      return;
    }

    // convert string "IGD, ICU" → ["IGD", "ICU"]
    const formattedFacilities = formData.facilities
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);

    const formattedServices = formData.services
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const dataToSave: Partial<Hospital> = {
      name: formData.name.trim(),
      type: formData.type,
      class: formData.class,
      address: formData.address.trim(),
      city: formData.city,
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      image: formData.image.trim(),
      description: formData.description.trim(),
      facilities: formattedFacilities,
      services: formattedServices,
      totalBeds: formData.totalBeds || 0,
      hasIGD: formData.hasIGD,
      hasICU: formData.hasICU,
      operatingHours: formData.operatingHours,
      // only include googleMapsLink; website/latitude/longitude removed per request
      googleMapsLink: formData.googleMapsLink?.trim() || "",
      // include latitude/longitude if provided by admin (convert to number)
      latitude: formData.latitude.trim()
        ? Number.parseFloat(formData.latitude.trim())
        : undefined,
      longitude: formData.longitude.trim()
        ? Number.parseFloat(formData.longitude.trim())
        : undefined,
    };

    // Sanitize text fields before sending
    if (dataToSave.name) dataToSave.name = sanitizeInput(dataToSave.name);
    if (dataToSave.address)
      dataToSave.address = sanitizeInput(dataToSave.address);
    if (dataToSave.description)
      dataToSave.description = sanitizeInput(dataToSave.description);

    console.log("📝 Submitting data:", dataToSave);

    try {
      await onSave(dataToSave);
    } catch (error) {
      console.error("❌ Error dalam handleSubmit:", error);
      alert(
        "Gagal menyimpan data: " +
          (error instanceof Error ? error.message : "Error tidak diketahui"),
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground font-heading">
            {hospital ? "Edit Rumah Sakit" : "Tambah Rumah Sakit"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg">
            <i className="fa-solid fa-xmark text-xl" />
          </button>
        </div>
        <form
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Nama Rumah Sakit *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tipe</label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as Hospital["type"],
                  })
                }
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
              >
                <option value="RS Umum">RS Umum</option>
                <option value="RS Khusus">RS Khusus</option>
                <option value="RS Ibu & Anak">RS Ibu & Anak</option>
                <option value="RS Jiwa">RS Jiwa</option>
                <option value="Klinik">Klinik</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Kelas</label>
              <select
                value={formData.class}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    class: e.target.value as Hospital["class"],
                  })
                }
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
              >
                <option value="A">Kelas A</option>
                <option value="B">Kelas B</option>
                <option value="C">Kelas C</option>
                <option value="D">Kelas D</option>
                <option value="Tidak Berkelas">Tidak Berkelas</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Kota/Kabupaten *
              </label>
              <select
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                required
              >
                {BANTEN_CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
            {/* Kecamatan removed from admin form because column removed in Supabase */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Alamat *</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Telepon *
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
            {/* Website removed per request - use Google Maps link field instead */}
            <div>
              <label className="block text-sm font-medium mb-1">
                URL Gambar *
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                  required
                />
                <button
                  type="button"
                  onClick={() =>
                    window.open(
                      `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(
                        formData.name + " " + formData.city,
                      )}`,
                      "_blank",
                    )
                  }
                  className="px-3 py-2 bg-secondary/20 rounded-lg text-sm"
                >
                  Ambil dari Google
                </button>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Deskripsi *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                rows={3}
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Fasilitas (pisahkan dengan koma)
              </label>
              <input
                type="text"
                value={formData.facilities}
                onChange={(e) =>
                  setFormData({ ...formData, facilities: e.target.value })
                }
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                placeholder="IGD 24 Jam, ICU, Laboratorium, ..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Layanan (pisahkan dengan koma)
              </label>
              <input
                type="text"
                value={formData.services}
                onChange={(e) =>
                  setFormData({ ...formData, services: e.target.value })
                }
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                placeholder="Rawat Inap, Rawat Jalan, Bedah, ..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Total Tempat Tidur
              </label>
              <input
                type="number"
                value={formData.totalBeds}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    totalBeds: Number.parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Link Google Maps
              </label>
              <input
                type="url"
                value={formData.googleMapsLink}
                onChange={(e) =>
                  setFormData({ ...formData, googleMapsLink: e.target.value })
                }
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                placeholder="https://maps.app.goo.gl/..."
              />
            </div>
            {/* Latitude & Longitude (float8) */}
            <div>
              <label className="block text-sm font-medium mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) =>
                  setFormData({ ...formData, latitude: e.target.value })
                }
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                placeholder="-6.123456"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) =>
                  setFormData({ ...formData, longitude: e.target.value })
                }
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                placeholder="106.123456"
              />
            </div>
            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasIGD}
                  onChange={(e) =>
                    setFormData({ ...formData, hasIGD: e.target.checked })
                  }
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm">IGD 24 Jam</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasICU}
                  onChange={(e) =>
                    setFormData({ ...formData, hasICU: e.target.checked })
                  }
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm">ICU</span>
              </label>
            </div>
          </div>
          <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-border rounded-lg hover:bg-accent transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              {hospital ? "Simpan Perubahan" : "Tambah Rumah Sakit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Banner Form Modal Component
interface BannerFormModalProps {
  banner: HeroBanner | null;
  onClose: () => void;
  onSave: (data: Partial<HeroBanner>) => Promise<void>;
}

const BannerFormModal = ({ banner, onClose, onSave }: BannerFormModalProps) => {
  const { uploadBannerImage } = useApp();
  const [formData, setFormData] = useState({
    title: banner?.title || "",
    subtitle: banner?.subtitle || "",
    image: banner?.image || "",
    link: banner?.link || "",
    isActive: banner?.isActive ?? true,
    order: banner?.order || 1,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>(banner?.image || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Pilih file gambar yang valid");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran gambar maksimal 5MB");
      return;
    }

    try {
      setIsUploading(true);
      console.log("📤 Starting image upload...");

      // Upload to Supabase
      const imageUrl = await uploadBannerImage(file);

      setFormData({ ...formData, image: imageUrl });
      setImagePreview(imageUrl);
      console.log("✅ Image uploaded successfully:", imageUrl);
    } catch (error) {
      console.error("❌ Upload failed:", error);
      alert(
        "Gagal upload gambar: " +
          (error instanceof Error ? error.message : "Error"),
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi input
    if (!formData.title.trim()) {
      alert("Judul tidak boleh kosong!");
      return;
    }

    try {
      // Buat payload dengan format internal (camelCase)
      // yang akan di-map ke snake_case di AppContext
      const payload = {
        title: formData.title,
        subtitle: formData.subtitle,
        image: formData.image,
        link: formData.link || null,
        isActive: formData.isActive, // camelCase, bukan snake_case
        order: formData.order,
      };

      console.log("Sending banner payload:", payload);
      console.log(
        "isActive value:",
        formData.isActive,
        "Type:",
        typeof formData.isActive,
      );
      await onSave(payload as Partial<HeroBanner>);
    } catch (error) {
      console.error("Error dalam handleSubmit banner:", error);
      alert(
        "Gagal menyimpan banner: " +
          (error instanceof Error ? error.message : "Error tidak diketahui"),
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground font-heading">
            {banner ? "Edit Banner" : "Tambah Banner"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg">
            <i className="fa-solid fa-xmark text-xl" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Judul *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Subjudul</label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) =>
                setFormData({ ...formData, subtitle: e.target.value })
              }
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
            />
          </div>

          {/* Image Upload Section */}
          <div className="space-y-3">
            <label className="block text-sm font-medium">Gambar *</label>

            {/* Preview */}
            {imagePreview && (
              <div className="relative w-full h-40 bg-muted rounded-lg overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Upload Options */}
            <div className="space-y-2">
              {/* File Upload */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2">
                  Upload Gambar Lokal
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isUploading}
                  className="w-full px-4 py-2 border border-border rounded-lg text-sm cursor-pointer hover:bg-accent/20 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {isUploading && (
                  <p className="text-xs text-primary mt-1">📤 Uploading...</p>
                )}
              </div>

              {/* URL Input */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2">
                  atau Gunakan URL Gambar
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => {
                    setFormData({ ...formData, image: e.target.value });
                    setImagePreview(e.target.value);
                  }}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Link (opsional)
            </label>
            <input
              type="text"
              value={formData.link}
              onChange={(e) =>
                setFormData({ ...formData, link: e.target.value })
              }
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Urutan</label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) =>
                  setFormData({ ...formData, order: parseInt(e.target.value) })
                }
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
            <label className="flex items-center space-x-2 cursor-pointer pt-6">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm">Aktif</span>
            </label>
          </div>
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-border rounded-lg hover:bg-accent transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? "Uploading..." : banner ? "Simpan" : "Tambah"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminPanel;
