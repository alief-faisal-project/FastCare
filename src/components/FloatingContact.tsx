import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import bniLogo from "@/assets/bni-logo.png";

const FloatingContact = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [view, setView] = useState<"menu" | "dukung">("menu");
  const [animationData, setAnimationData] = useState<unknown | null>(null);
  const [LottieCmp, setLottieCmp] = useState<unknown | null>(null);

  // Replace this with a valid Lottie JSON URL for a headset animation.
  // If you want, I can try to find a specific public Lottie URL and set it here.
  const HEADSET_LOTTIE_URL = ""; // <-- put a lottie JSON URL here (optional)

  useEffect(() => {
    const handleScroll = () => {
      const footer = document.querySelector("footer");
      if (footer) {
        const footerRect = footer.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        // Hide when footer is visible
        setIsVisible(footerRect.top > windowHeight - 50);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial state
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Reset view to menu when dialog is closed so 'dukung' doesn't persist
  useEffect(() => {
    if (!isOpen) setView("menu");
  }, [isOpen]);

  // Try to dynamically fetch a remote lottie JSON and load lottie-react dynamically.
  useEffect(() => {
    let mounted = true;
    async function loadLottie() {
      if (!HEADSET_LOTTIE_URL) return;
      try {
        const res = await fetch(HEADSET_LOTTIE_URL);
        if (!res.ok) return;
        const json = await res.json();
        if (!mounted) return;
        // dynamic import to avoid bundling lottie unless used
        const mod = await import("lottie-react");
        if (!mounted) return;
        setLottieCmp(() => mod.default);
        setAnimationData(json);
      } catch (e) {
        // ignore and fall back to SVG animation
        console.warn("Failed to load Lottie animation", e);
      }
    }
    loadLottie();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      {/* Floating Button - Small Pill */}
      <div
        className={`fixed bottom-8 right-4 z-50 transition-all duration-300 ${
          isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <div className="relative group flex items-center">
          {/* Tooltip */}
          <div
            className="absolute right-12
    opacity-0 translate-x-2
    group-hover:opacity-100 group-hover:translate-x-0
    transition-all duration-300
    bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500
    text-white text-xs
    px-3 py-1.5 rounded-l-lg shadow-lg whitespace-nowrap"
          >
            Butuh Bantuan?
          </div>

          {/* Button */}
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center justify-center
    w-10 h-10
    rounded-full
    bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500
    text-white
    transition-all duration-300
    hover:scale-105 active:scale-95"
          >
            <i className="fa-solid fa-headset text-xl" />
          </button>
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-heading flex items-center gap-2">
              <i className="fa-solid fa-headset text-primary" />
              Butuh Bantuan?
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
                  href="https://wa.me/6281234567890"
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
                      help@fastcare.id
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
                    sakit terdekat ini. Website ini gratis dan hadir untuk
                    membantu Anda menemukan fasilitas kesehatan dengan cepat,
                    akurat, dan mudah diakses kapan pun dibutuhkan.
                  </p>

                  <p>
                    Kami terus mengembangkan platform ini agar data semakin
                    lengkap, deteksi lokasi dan jarak semakin akurat, serta
                    pengalaman pengguna semakin nyaman. Dukungan Anda sangat
                    berarti untuk menjaga server tetap berjalan, memperbarui
                    informasi secara berkala, dan menghadirkan fitur-fitur baru
                    yang lebih bermanfaat.
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
                    <p className="text-lg font-bold text-primary">1961828503</p>
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
