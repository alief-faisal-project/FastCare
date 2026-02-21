import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const FloatingContact = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

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
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 bg-primary border border-primary rounded-3xl text-white px-3 py-2  shadow-lg transition-all duration-300 hover:shadow-xl text-x"
        >
          <i className="fa-solid fa-headset text-xl" />
  
        </button>
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
            <p className="text-muted-foreground text-sm">
              Kami siap membantu Anda, silahkan pilih bantuan yg anda butuhkan :
            </p>

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
              <a
                href="/qr-dana-bank.png" // ganti dengan path atau link QR code kamu
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 border border-border rounded-xl hover:border-primary hover:bg-accent transition-colors"
              >
                <i className="fa-solid fa-qrcode text-primary text-2xl" />
                <div>
                  <p className="font-medium text-foreground text-sm">
                    Dukung Pengembangan
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Scan QR e-Money / Transfer Bank
                  </p>
                </div>
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FloatingContact;
