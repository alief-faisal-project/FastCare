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

  // ✅ STATE UNTUK ANIMASI SMOOTH
  const [animate, setAnimate] = useState(false);

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

  useEffect(() => {
    if (!isOpen) setView("menu");
  }, [isOpen]);

  // ✅ TRIGGER ANIMASI SETIAP 5 DETIK (SUPER SMOOTH)
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimate(true);
      setTimeout(() => setAnimate(false), 900);
    }, 3000);

    return () => clearInterval(interval);
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

      {/* ✅ CUSTOM SUPER SMOOTH KEYFRAME */}
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
                    sakit terdekat ini...
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
