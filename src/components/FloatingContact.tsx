import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import bniLogo from "@/assets/bni-logo.webp";

const FloatingContact = () => {
  // ===============================
  // STATE UTAMA
  // ===============================

  // Mengontrol apakah dialog/modal terbuka atau tidak
  const [isOpen, setIsOpen] = useState(false);

  // Mengontrol visibilitas tombol floating (untuk animasi show/hide)
  const [isVisible, setIsVisible] = useState(true);

  // Mengontrol tampilan di dalam dialog (menu utama atau halaman dukung)
  const [view, setView] = useState<"menu" | "dukung">("menu");

  // ===============================
  // STATE TAMBAHAN
  // ===============================

  // Mengontrol animasi bounce pada icon
  const [animate, setAnimate] = useState(false);

  // Mengontrol apakah nomor rekening ditampilkan penuh atau disamarkan
  const [showRek, setShowRek] = useState(false);

  // Mengontrol tooltip "Butuh Bantuan?"
  const [showTooltip, setShowTooltip] = useState(false);

  // ===============================
  // DATA REKENING
  // ===============================

  // Nomor rekening asli
  const noRek = "1961828503";

  // Menyembunyikan 3 digit terakhir dengan ***
  const maskedRek = noRek.slice(0, -3) + "***";

  // ===============================
  // AUTO HIDE SAAT TIDAK ADA AKTIVITAS
  // ===============================
  // Jika user tidak scroll / tidak bergerak selama 2 detik,
  // tombol akan hide ke kiri.
  // Jika ada aktivitas (scroll, mousemove, touch),
  // tombol akan muncul kembali.

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const resetTimer = () => {
      // Saat ada aktivitas -> tampilkan tombol
      setIsVisible(true);

      // Reset timer sebelumnya
      clearTimeout(timeout);

      // Jika 2 detik tidak ada aktivitas -> sembunyikan
      timeout = setTimeout(() => {
        setIsVisible(false);
      }, 2000);
    };

    // Event yang dianggap sebagai aktivitas user
    const events = ["scroll", "mousemove", "touchstart"];

    // Tambahkan listener
    events.forEach((event) => window.addEventListener(event, resetTimer));

    // Jalankan pertama kali
    resetTimer();

    // Bersihkan event listener saat unmount
    return () => {
      clearTimeout(timeout);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, []);

  // ===============================
  // RESET VIEW SAAT DIALOG DITUTUP
  // ===============================
  // Ketika modal ditutup, kembalikan ke menu utama
  // dan sembunyikan nomor rekening kembali

  useEffect(() => {
    if (!isOpen) {
      setView("menu");
      setShowRek(false);
    }
  }, [isOpen]);

  // ===============================
  // ANIMASI BOUNCE SETIAP 3 DETIK
  // ===============================
  // Memberi efek hidup pada tombol agar menarik perhatian

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimate(true);

      // Hentikan animasi setelah 900ms
      setTimeout(() => setAnimate(false), 900);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // ===============================
  // TOOLTIP OTOMATIS SAAT PERTAMA LOAD
  // ===============================
  // Akan muncul 800ms setelah halaman dibuka
  // Lalu menghilang setelah 3 detik

  useEffect(() => {
    const showTimer = setTimeout(() => {
      setShowTooltip(true);

      const hideTimer = setTimeout(() => {
        setShowTooltip(false);
      }, 3000);

      return () => clearTimeout(hideTimer);
    }, 800);

    return () => clearTimeout(showTimer);
  }, []);

  return (
    <>
      {/* ===================================== */}
      {/* TOMBOL FLOATING DI TENGAH KIRI LAYAR */}
      {/* ===================================== */}
      <div
        className={`fixed top-1/2 -translate-y-1/2 left-4 z-50 transition-all duration-500 ${
          isVisible
            ? "opacity-100 translate-x-0"
            : "opacity-0 -translate-x-20 pointer-events-none"
        }`}
      >
        <div className="relative flex items-center">
          {/* Tooltip bantuan */}
          <div
            className={`absolute left-16 transition-all duration-500 ${
              showTooltip
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-4 pointer-events-none"
            }`}
          >
            <div className="bg-white text-gray-800 text-[10px] font-medium px-4 py-2 rounded-full shadow-lg border border-gray-200 whitespace-nowrap">
              Butuh Bantuan?
            </div>
          </div>

          {/* Tombol utama */}
          <button
            onClick={() => setIsOpen(true)}
            className={`flex items-center justify-center
              w-12 h-12
              rounded-full
              bg-transparent
              text-primary
              shadow-lg
              hover:scale-105 active:scale-95
              transition-transform duration-300
              ${animate ? "smooth-bounce" : ""}
            `}
          >
            <i className="fa-solid fa-headset text-[30px]" />
          </button>
        </div>
      </div>

      {/* ===================================== */}
      {/* STYLE ANIMASI BOUNCE */}
      {/* ===================================== */}
      <style>
        {`
          @keyframes smoothBounce {
            0%   { transform: translateY(0); }
            20%  { transform: translateY(-6px); }
            40%  { transform: translateY(0); }
            60%  { transform: translateY(-3px); }
            80%  { transform: translateY(0); }
            100% { transform: translateY(0); }
          }

          .smooth-bounce {
            animation: smoothBounce 0.9s cubic-bezier(0.34, 1.56, 0.64, 1);
          }
        `}
      </style>

      {/* ===================================== */}
      {/* DIALOG / MODAL BANTUAN */}
      {/* ===================================== */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-heading flex items-center gap-2">
              <i className="fa-solid fa-headset text-primary" />
              {view === "menu" ? "Butuh Bantuan?" : "Ingin Berkontribusi?"}
            </DialogTitle>
          </DialogHeader>

          {/* SELURUH ISI DI BAWAH INI TIDAK DIUBAH */}
          {/* (sama persis seperti yang kamu kirim) */}

          <div className="space-y-4 pt-2">
            {view === "menu" && (
              <p className="text-muted-foreground text-sm">
                Kami siap membantu Anda, silahkan pilih bantuan yg anda butuhkan
                :
              </p>
            )}

            {/* Tampilan Menu Utama */}
            {view === "menu" ? (
              <div className="space-y-3">
                {/* WhatsApp */}
                <a
                  href="https://wa.me/6285692985927"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 border border-border rounded-xl hover:border-primary hover:bg-accent transition-colors"
                >
                  <i className="fa-brands fa-whatsapp text-primary text-2xl" />
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      WhatsApp
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Chat langsung dengan tim kami
                    </p>
                  </div>
                </a>

                {/* Email */}
                <a
                  href="mailto:help@fastcare.id"
                  className="flex items-center gap-3 p-3 border border-border rounded-xl hover:border-primary hover:bg-accent transition-colors"
                >
                  <i className="fa-solid fa-envelope text-primary text-2xl" />
                  <div>
                    <p className="font-medium text-foreground text-sm">Email</p>
                    <p className="text-xs text-muted-foreground">
                      helpfastcare@gmail.com
                    </p>
                  </div>
                </a>

                {/* Menu Dukung */}
                <button
                  type="button"
                  onClick={() => setView("dukung")}
                  className="w-full text-left flex items-center gap-3 p-3 border border-border rounded-xl hover:border-primary hover:bg-accent transition-colors"
                >
                  <i className="fa-solid fa-qrcode text-primary text-2xl" />
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      Dukung Pengembangan
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Donasi untuk mendukung pengembangan platform
                    </p>
                  </div>
                </button>
              </div>
            ) : (
              // Tampilan Halaman Dukung
              <div className="space-y-4">
                <div className="prose text-sm text-foreground text-justify leading-relaxed max-w-none">
                  <p>
                    Terima kasih telah menggunakan platform ini. Website ini
                    sepenuhnya gratis dan dirancang untuk membantu Anda
                    menemukan fasilitas kesehatan dengan cepat, mudah, dan
                    praktis.
                  </p>
                </div>

                {/* Informasi rekening */}
                <div className="flex items-center gap-4 pt-2">
                  <div className="w-20 h-20 flex items-center justify-center bg-white rounded-lg border border-border overflow-hidden">
                    <img
                      src={bniLogo}
                      alt="BNI"
                      className="w-full h-full object-contain p-2"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Nomor Rekening
                    </p>

                    <div className="flex items-center gap-2">
                      <p className="text-lg font-bold text-red-500 tracking-wide">
                        {showRek ? noRek : maskedRek}
                      </p>

                      {/* Tombol show/hide nomor rekening */}
                      <button
                        type="button"
                        onClick={() => setShowRek(!showRek)}
                        className="text-xs hover:scale-110 transition-transform"
                      >
                        <i
                          className={`fa-solid ${
                            showRek ? "fa-eye-slash" : "fa-eye"
                          }`}
                        />
                      </button>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      a.n. ALIEF FAISAL ADRIANSYAH
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FloatingContact;
