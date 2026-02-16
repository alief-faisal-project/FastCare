import { useState, useRef, useEffect } from "react";
import { useApp } from "@/context/AppContext";

const emergencyServices = [
  { icon: "fa-solid fa-truck-medical", label: "Ambulan", number: "119" },
  {
    icon: "fa-solid fa-heart-crack",
    label: "Kesehatan Jiwa",
    number: "119 ext. 8",
  },
  {
    icon: "fa-solid fa-triangle-exclamation",
    label: "Layanan Darurat",
    number: "112",
  },
  {
    icon: "fa-solid fa-magnifying-glass-location",
    label: "Basarnas",
    number: "129",
  },
  { icon: "fa-solid fa-building-shield", label: "Polisi", number: "110" },
];

const HeroBanner = () => {
  const { heroBanners } = useApp();

  const [currentSlide, setCurrentSlide] = useState(0);

  const mobileRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  const activeBanners = heroBanners
    .filter((b) => b.isActive)
    .sort((a, b) => a.order - b.order);

  if (activeBanners.length === 0) return null;

  // ===============================
  // DESKTOP
  // ===============================

  const maxDesktopSlide =
    activeBanners.length > 3 ? activeBanners.length - 3 : 0;

  const goToPrevious = () => {
    if (currentSlide === 0) return;
    setCurrentSlide((prev) => prev - 1);
  };

  const goToNext = () => {
    if (currentSlide >= maxDesktopSlide) return;
    setCurrentSlide((prev) => prev + 1);
  };

  // ===============================
  // MOBILE ULTRA SMOOTH INDICATOR
  // ===============================

  useEffect(() => {
    const container = mobileRef.current;
    const indicator = indicatorRef.current;

    if (!container || !indicator) return;

    let ticking = false;

    const updateIndicator = () => {
      const maxScroll = container.scrollWidth - container.clientWidth;

      const progress = maxScroll > 0 ? container.scrollLeft / maxScroll : 0;

      const maxTranslate = 48; // 64 track - 16 dot

      indicator.style.transform = `translate3d(${progress * maxTranslate}px, 0, 0)`;

      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateIndicator);
        ticking = true;
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <section className="py-3 md:py-4">
      <div className="relative">
        {/* ================= DESKTOP ================= */}
        <div className="hidden md:block container mx-auto px-4">
          <div className="relative overflow-hidden">
            <div
              className="flex gap-4 transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentSlide * (100 / 3)}%)`,
              }}
            >
              {activeBanners.map((banner) => (
                <a
                  key={banner.id}
                  href={banner.link || "#"}
                  className="flex-shrink-0 w-[calc(33.333%-11px)] rounded-3xl overflow-hidden relative"
                >
                  <div className="aspect-[16/9] relative">
                    <img
                      src={banner.image}
                      alt={banner.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </a>
              ))}
            </div>

            {activeBanners.length > 3 && (
              <>
                <button
                  onClick={goToPrevious}
                  disabled={currentSlide === 0}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg disabled:opacity-40"
                >
                  <i className="fa-solid fa-chevron-left text-sm" />
                </button>

                <button
                  onClick={goToNext}
                  disabled={currentSlide === maxDesktopSlide}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg disabled:opacity-40"
                >
                  <i className="fa-solid fa-chevron-right text-sm" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* ================= MOBILE ================= */}
        <div className="md:hidden px-4">
          <div
            ref={mobileRef}
            className="flex gap-3 overflow-x-auto scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {activeBanners.map((banner) => (
              <a
                key={banner.id}
                href={banner.link || "#"}
                className="flex-shrink-0 w-[calc(50%-6px)] rounded-3xl overflow-hidden"
              >
                <div className="aspect-[16/9] relative">
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </a>
            ))}
          </div>

          {activeBanners.length > 1 && (
            <div className="flex items-center justify-center mt-3">
              <div className="relative w-16 h-2 rounded-full bg-muted-foreground/20 overflow-hidden">
                <div
                  ref={indicatorRef}
                  className="absolute top-0 left-0 h-2 w-4 rounded-full bg-primary will-change-transform"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
