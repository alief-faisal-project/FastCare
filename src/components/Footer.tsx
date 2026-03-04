import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import bniLogo from "@/assets/bni-logo.webp";

const Footer = () => {
  // ===============================
  // STATE UNTUK DIALOG BANTUAN
  // ===============================

  // Mengontrol apakah popup terbuka
  const [isOpen, setIsOpen] = useState(false);

  // Mengontrol tampilan menu atau halaman dukung
  const [view, setView] = useState<"menu" | "dukung">("menu");

  // Mengontrol show/hide nomor rekening
  const [showRek, setShowRek] = useState(false);

  // ===============================
  // DATA REKENING
  // ===============================

  const noRek = "1961828503";
  const maskedRek = noRek.slice(0, -3) + "***";

  // ===============================
  // RESET STATE SAAT DIALOG DITUTUP
  // ===============================

  useEffect(() => {
    if (!isOpen) {
      setView("menu");
      setShowRek(false);
    }
  }, [isOpen]);

  return (
    <>
      <footer className="bg-primary py-4 md:py-6 mt-12 border-t border-border md:rounded-none">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Left - Copyright */}
            <p className="text-xs text-white order-3 md:order-1">
              © 2026 FastCare
            </p>

            {/* Center - Data Source */}
            <a
              href="https://sirs.kemkes.go.id"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-white hover:text-yellow-400 transition-colors order-2"
            >
              Sumber Data: SIRS Kemkes RI
            </a>

            {/* Right - Menu Bantuan + Sosial */}
            <div className="flex items-center gap-4 order-1 md:order-3">
              {/* Tombol Butuh Bantuan */}
              <button
                onClick={() => setIsOpen(true)}
                className="text-xs text-white hover:text-yellow-400 transition-colors"
              >
                Hubungi Kami
              </button>

              {/* Social Icons (Desktop Only) */}
              <div className="hidden md:flex items-center gap-4">
                <a
                  href="mailto:info@fastcare.id"
                  className="text-white hover:text-yellow-400 transition-colors"
                >
                  <i className="fa-solid fa-envelope text-base" />
                </a>
                <a
                  href="https://wa.me/6285692985927"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-yellow-400 transition-colors"
                >
                  <i className="fa-brands fa-whatsapp text-base" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* ===================================== */}
      {/* POPUP / DIALOG BUTUH BANTUAN */}
      {/* ===================================== */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <i className="fa-solid fa-headset text-primary" />
              {view === "menu" ? "Butuh Bantuan?" : "Ingin Berkontribusi?"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {view === "menu" && (
              <p className="text-muted-foreground text-sm">
                Kami siap membantu Anda, silahkan pilih bantuan yg anda
                butuhkan:
              </p>
            )}

            {/* MENU UTAMA */}
            {view === "menu" ? (
              <div className="space-y-3">
                {/* WhatsApp */}
                <a
                  href="https://wa.me/6285692985927"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 border rounded-xl hover:border-primary hover:bg-accent transition-colors"
                >
                  <i className="fa-brands fa-whatsapp text-primary text-2xl" />
                  <div>
                    <p className="font-medium text-sm">WhatsApp</p>
                    <p className="text-xs text-muted-foreground">
                      Chat langsung dengan tim kami
                    </p>
                  </div>
                </a>

                {/* Email */}
                <a
                  href="mailto:helpfastcare@gmail.com"
                  className="flex items-center gap-3 p-3 border rounded-xl hover:border-primary hover:bg-accent transition-colors"
                >
                  <i className="fa-solid fa-envelope text-primary text-2xl" />
                  <div>
                    <p className="font-medium text-sm">Email</p>
                    <p className="text-xs text-muted-foreground">
                      helpfastcare@gmail.com
                    </p>
                  </div>
                </a>

                {/* Dukung Pengembangan */}
                <button
                  type="button"
                  onClick={() => setView("dukung")}
                  className="w-full text-left flex items-center gap-3 p-3 border rounded-xl hover:border-primary hover:bg-accent transition-colors"
                >
                  <i className="fa-solid fa-qrcode text-primary text-2xl" />
                  <div>
                    <p className="font-medium text-sm">Dukung Pengembangan</p>
                    <p className="text-xs text-muted-foreground">
                      Donasi untuk mendukung pengembangan platform
                    </p>
                  </div>
                </button>
              </div>
            ) : (
              /* HALAMAN DUKUNG */
              <div className="space-y-4">
                <p className="text-sm text-justify">
                  Terima kasih telah menggunakan platform ini. Website ini
                  sepenuhnya gratis dan dirancang untuk membantu Anda menemukan
                  fasilitas kesehatan dengan cepat, mudah, dan praktis.
                </p>

                <div className="flex items-center gap-4 pt-2">
                  <div className="w-20 h-20 flex items-center justify-center bg-white rounded-lg border overflow-hidden">
                    <img
                      src={bniLogo}
                      alt="BNI"
                      className="w-full h-full object-contain p-2"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium">Nomor Rekening</p>

                    <div className="flex items-center gap-2">
                      <p className="text-lg font-bold text-red-500 tracking-wide">
                        {showRek ? noRek : maskedRek}
                      </p>

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

export default Footer;
