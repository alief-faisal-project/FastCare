import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Hospital, HeroBanner, BANTEN_CITIES } from '@/types';
import fastcareLogo from '@/assets/fastcare-logo.png';

type AdminTab = 'hospitals' | 'banners' | 'settings';

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

  const [activeTab, setActiveTab] = useState<AdminTab>('hospitals');
  const [showHospitalForm, setShowHospitalForm] = useState(false);
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  const filteredHospitals = hospitals.filter(h =>
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteHospital = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus rumah sakit ini?')) {
      deleteHospital(id);
    }
  };

  const handleDeleteBanner = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus banner ini?')) {
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
              {currentUser?.name}
            </span>
            <button
              onClick={() => {
                logout();
                navigate('/');
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
                onClick={() => setActiveTab('hospitals')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'hospitals'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-accent'
                }`}
              >
                <i className="fa-solid fa-hospital w-5" />
                <span className="font-medium">Rumah Sakit</span>
                <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  {hospitals.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('banners')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'banners'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-accent'
                }`}
              >
                <i className="fa-solid fa-images w-5" />
                <span className="font-medium">Hero Banner</span>
                <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  {heroBanners.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-accent'
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
            {activeTab === 'hospitals' && (
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
                          <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Rumah Sakit</th>
                          <th className="text-left px-4 py-3 text-sm font-semibold text-foreground hidden md:table-cell">Kota</th>
                          <th className="text-left px-4 py-3 text-sm font-semibold text-foreground hidden lg:table-cell">Tipe</th>
                          <th className="text-left px-4 py-3 text-sm font-semibold text-foreground hidden lg:table-cell">Kelas</th>
                          <th className="text-left px-4 py-3 text-sm font-semibold text-foreground hidden md:table-cell">Bed</th>
                          <th className="text-right px-4 py-3 text-sm font-semibold text-foreground">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredHospitals.map((hospital) => (
                          <tr key={hospital.id} className="border-b border-border hover:bg-accent/50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-3">
                                <img
                                  src={hospital.image}
                                  alt={hospital.name}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                                <div>
                                  <p className="font-medium text-foreground">{hospital.name}</p>
                                  <p className="text-xs text-muted-foreground md:hidden">{hospital.city}</p>
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
                              <span className="text-foreground font-medium">{hospital.totalBeds}</span>
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
                                  onClick={() => handleDeleteHospital(hospital.id)}
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
            {activeTab === 'banners' && (
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
                      <div className="aspect-video relative">
                        <img
                          src={banner.image}
                          alt={banner.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="text-white font-semibold">{banner.title}</h3>
                          <p className="text-white/80 text-sm">{banner.subtitle}</p>
                        </div>
                        <div className="absolute top-3 right-3 flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            banner.isActive ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'
                          }`}>
                            {banner.isActive ? 'Aktif' : 'Nonaktif'}
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
            {activeTab === 'settings' && (
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
                  <h2 className="text-lg font-semibold text-foreground mb-4">Informasi Akun</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Nama</label>
                      <p className="font-medium text-foreground">{currentUser?.name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Username</label>
                      <p className="font-medium text-foreground">{currentUser?.username}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Role</label>
                      <p className="font-medium text-foreground capitalize">{currentUser?.role}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">Statistik</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-accent rounded-lg">
                      <p className="text-2xl font-bold text-primary">{hospitals.length}</p>
                      <p className="text-sm text-muted-foreground">Total RS</p>
                    </div>
                    <div className="p-4 bg-accent rounded-lg">
                      <p className="text-2xl font-bold text-primary">{heroBanners.filter(b => b.isActive).length}</p>
                      <p className="text-sm text-muted-foreground">Banner Aktif</p>
                    </div>
                    <div className="p-4 bg-accent rounded-lg">
                      <p className="text-2xl font-bold text-primary">{hospitals.reduce((a, b) => a + b.totalBeds, 0)}</p>
                      <p className="text-sm text-muted-foreground">Total Bed</p>
                    </div>
                    <div className="p-4 bg-accent rounded-lg">
                      <p className="text-2xl font-bold text-success">{hospitals.filter(h => h.googleMapsLink).length}</p>
                      <p className="text-sm text-muted-foreground">Dengan Maps</p>
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
          onSave={(data) => {
            if (editingHospital) {
              updateHospital(editingHospital.id, data);
            } else {
              addHospital(data as any);
            }
            setShowHospitalForm(false);
            setEditingHospital(null);
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
          onSave={(data) => {
            if (editingBanner) {
              updateHeroBanner(editingBanner.id, data);
            } else {
              addHeroBanner(data as any);
            }
            setShowBannerForm(false);
            setEditingBanner(null);
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
  onSave: (data: Partial<Hospital>) => void;
}

const HospitalFormModal = ({ hospital, onClose, onSave }: HospitalFormModalProps) => {
  const [formData, setFormData] = useState({
    name: hospital?.name || '',
    type: hospital?.type || 'RS Umum',
    class: hospital?.class || 'C',
    address: hospital?.address || '',
    city: hospital?.city || 'Kota Serang',
    district: hospital?.district || '',
    phone: hospital?.phone || '',
    email: hospital?.email || '',
    website: hospital?.website || '',
    image: hospital?.image || '',
    description: hospital?.description || '',
    facilities: hospital?.facilities.join(', ') || '',
    services: hospital?.services.join(', ') || '',
    totalBeds: hospital?.totalBeds || 100,
    hasIGD: hospital?.hasIGD ?? true,
    hasICU: hospital?.hasICU ?? true,
    operatingHours: hospital?.operatingHours || '24 Jam',
    lat: hospital?.coordinates.lat || -6.1185,
    lng: hospital?.coordinates.lng || 106.1564,
    googleMapsLink: hospital?.googleMapsLink || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      facilities: formData.facilities.split(',').map(f => f.trim()).filter(Boolean),
      services: formData.services.split(',').map(s => s.trim()).filter(Boolean),
      coordinates: { lat: formData.lat, lng: formData.lng },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground font-heading">
            {hospital ? 'Edit Rumah Sakit' : 'Tambah Rumah Sakit'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg">
            <i className="fa-solid fa-xmark text-xl" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Nama Rumah Sakit *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tipe</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
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
                onChange={(e) => setFormData({ ...formData, class: e.target.value as any })}
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
              <label className="block text-sm font-medium mb-1">Kota/Kabupaten *</label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                required
              >
                {BANTEN_CITIES.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Kecamatan</label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Alamat *</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Telepon *</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Website</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">URL Gambar *</label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Deskripsi *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                rows={3}
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Fasilitas (pisahkan dengan koma)</label>
              <input
                type="text"
                value={formData.facilities}
                onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                placeholder="IGD 24 Jam, ICU, Laboratorium, ..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Layanan (pisahkan dengan koma)</label>
              <input
                type="text"
                value={formData.services}
                onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                placeholder="Rawat Inap, Rawat Jalan, Bedah, ..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Total Tempat Tidur</label>
              <input
                type="number"
                value={formData.totalBeds}
                onChange={(e) => setFormData({ ...formData, totalBeds: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Link Google Maps</label>
              <input
                type="url"
                value={formData.googleMapsLink}
                onChange={(e) => setFormData({ ...formData, googleMapsLink: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                placeholder="https://maps.app.goo.gl/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                value={formData.lat}
                onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                value={formData.lng}
                onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasIGD}
                  onChange={(e) => setFormData({ ...formData, hasIGD: e.target.checked })}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm">IGD 24 Jam</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasICU}
                  onChange={(e) => setFormData({ ...formData, hasICU: e.target.checked })}
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
              {hospital ? 'Simpan Perubahan' : 'Tambah Rumah Sakit'}
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
  onSave: (data: Partial<HeroBanner>) => void;
}

const BannerFormModal = ({ banner, onClose, onSave }: BannerFormModalProps) => {
  const [formData, setFormData] = useState({
    title: banner?.title || '',
    subtitle: banner?.subtitle || '',
    image: banner?.image || '',
    link: banner?.link || '',
    isActive: banner?.isActive ?? true,
    order: banner?.order || 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground font-heading">
            {banner ? 'Edit Banner' : 'Tambah Banner'}
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
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Subjudul</label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">URL Gambar *</label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Link (opsional)</label>
            <input
              type="text"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Urutan</label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
            <label className="flex items-center space-x-2 cursor-pointer pt-6">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
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
              className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              {banner ? 'Simpan' : 'Tambah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminPanel;
