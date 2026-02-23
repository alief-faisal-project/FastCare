import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import bniLogo from "@/assets/bni-logo.webp";

const FloatingContact = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [view, setView] = useState<"menu" | "dukung">("menu");

  // State untuk animasi bounce icon
  const [animate, setAnimate] = useState(false);

  // State untuk show / hide nomor rekening
  const [showRek, setShowRek] = useState(false);

  // State untuk tooltip bantuan
  const [showTooltip, setShowTooltip] = useState(false);

  // Nomor rekening asli
  const noRek = "1961828503";

  // Mask 3 digit terakhir
  const maskedRek = noRek.slice(0, -3) + "***";

  // Kontrol visibility saat scroll mendekati footer
  useEffect(() => {
    const handleScroll = () => {
      const footer = document.querySelector("footer");
      if (footer) {
        const footerRect = footer.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        setIsVisible(footerRect.top > windowHeight - 50);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Reset view saat dialog ditutup
  useEffect(() => {
    if (!isOpen) {
      setView("menu");
      setShowRek(false);
    }
  }, [isOpen]);

  // Animasi bounce setiap 3 detik
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimate(true);
      setTimeout(() => setAnimate(false), 900);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Tooltip otomatis muncul saat pertama render
  // Akan muncul lagi jika halaman direfresh
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
      {/* Floating Button */}
      <div
        className={`fixed bottom-8 right-4 z-50 transition-all duration-300 ${
          isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <div className="relative flex items-center">
          {/* Tooltip bantuan */}
          <div
            className={`absolute right-16 transition-all duration-500 ${
              showTooltip
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-4 pointer-events-none"
            }`}
          >
            <div className="bg-white text-gray-800 text-sm font-medium px-4 py-2 rounded-full shadow-lg border border-gray-200 whitespace-nowrap">
              Ada yg bisa dibantu?
            </div>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className={`flex items-center justify-center
              w-14 h-14
              rounded-full
              bg-transparent
              text-primary
              hover:scale-105 active:scale-95
              transition-transform duration-300
              ${animate ? "smooth-bounce" : ""}
            `}
          >
            <i className="fa-solid fa-headset text-4xl" />
          </button>
        </div>
      </div>

      {/* Animasi bounce icon */}
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

      {/* Dialog bantuan */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-heading flex items-center gap-2">
              <i className="fa-solid fa-headset text-primary" />
              {view === "menu" ? "Butuh Bantuan?" : "Ingin Berkontribusi?"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {view === "menu" && (
              <p className="text-muted-foreground text-sm">
                Kami siap membantu Anda, silahkan pilih bantuan yg anda butuhkan
                :
              </p>
            )}

            {view === "menu" ? (
              <div className="space-y-3">
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
              <div className="space-y-4">
                <div className="prose text-sm text-foreground text-justify leading-relaxed max-w-none">
                  <p>
                    Terima kasih telah menggunakan platform pencarian rumah
                    sakit terdekat. Website ini 100% gratis dan hadir untuk
                    membantu Anda menemukan fasilitas kesehatan dengan cepat,
                    akurat, dan mudah diakses kapan pun dibutuhkan.
                  </p>

                  <p>
                    Kami terus mengembangkan platform ini agar data semakin
                    lengkap, deteksi lokasi dan jarak semakin akurat, serta
                    pengalaman pengguna semakin nyaman.
                  </p>

                  <p>
                    Bersama, mari membangun akses informasi kesehatan yang
                    cepat, transparan, dan dapat diandalkan untuk semua orang.
                  </p>
                </div>

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
                      <p className="text-lg font-bold text-primary tracking-wide">
                        {showRek ? noRek : maskedRek}
                      </p>

                      <button
                        type="button"
                        onClick={() => setShowRek(!showRek)}
                        className="text-primary hover:scale-110 transition-transform"
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
