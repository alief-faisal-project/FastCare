import { useState, useRef, useEffect } from "react";
import { useApp } from "@/context/AppContext";

const emergencyServices = [
  {
    icon: "fa-solid fa-truck-medical",
    label: "Ambulans",
    number: "119",
  },
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
  {
    icon: "fa-solid fa-building-shield",
    label: "Polisi",
    number: "110",
  },
];

const HeroBanner = () => {
  const { heroBanners } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mobileCurrentSlide, setMobileCurrentSlide] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const activeBanners = heroBanners
    .filter((b) => b.isActive)
    .sort((a, b) => a.order - b.order);

  const goToPrevious = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + activeBanners.length) % activeBanners.length,
    );
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let frame: number;

    const handleScroll = () => {
      if (frame) cancelAnimationFrame(frame);

      frame = requestAnimationFrame(() => {
        const scrollLeft = container.scrollLeft;
        const maxScrollLeft = container.scrollWidth - container.clientWidth;

        if (maxScrollLeft <= 0) {
          setMobileCurrentSlide(0);
          return;
        }

        // realtime progress (0 → 1)
        const progress = scrollLeft / maxScrollLeft;
        setMobileCurrentSlide(progress);
      });
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", handleScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [activeBanners.length]);

  if (activeBanners.length === 0) return null;

  const getBannerIndex = (offset: number) => {
    return (
      (currentSlide + offset + activeBanners.length) % activeBanners.length
    );
  };

  return (
    <section className="py-3 md:py-4">
      <div className="relative">
        {/* Desktop Layout - 3 banners with smooth animation */}
        <div className="hidden md:block container mx-auto px-4">
          <div className="relative overflow-hidden">
            <div
              className="flex gap-4 transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(0)`,
              }}
            >
              {[0, 1, 2].map((offset) => {
                const bannerIndex = getBannerIndex(offset);
                const banner = activeBanners[bannerIndex];

                return (
                  <a
                    key={`${banner.id}-${offset}`}
                    href={banner.link || "#"}
                    className="flex-shrink-0 w-[calc(33.333%-11px)] rounded-3xl overflow-hidden relative"
                  >
                    <div className="aspect-[16/9] relative">
                      <img
                        src={banner.image}
                        alt={banner.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                        <h3 className="text-white font-bold text-sm md:text-lg line-clamp-2 font-heading">
                          {banner.title}
                        </h3>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>

            {/* Navigation Arrows */}
            {activeBanners.length > 3 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-muted transition-colors z-20"
                >
                  <i className="fa-solid fa-chevron-left text-foreground text-sm" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-muted transition-colors z-20"
                >
                  <i className="fa-solid fa-chevron-right text-foreground text-sm" />
                </button>
              </>
            )}
          </div>

          {/* Desktop Pill Indicator */}
          {activeBanners.length > 3 && (
            <div className="flex justify-center mt-4">
              <div className="relative flex items-center w-20 h-3 rounded-full bg-muted-foreground/20 overflow-hidden">
                {/* inner sliding pill */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-3 w-6 rounded-full bg-primary transition-transform duration-500 ease-in-out"
                  style={{
                    transform: `translateX(${
                      (currentSlide / (activeBanners.length - 1)) * (80 - 24)
                    }px) translateY(-50%)`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Mobile Layout - Horizontal scroll with 2 visible */}
        <div className="md:hidden px-4">
          <div
            ref={scrollContainerRef}
            className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {activeBanners.map((banner) => (
              <a
                key={banner.id}
                href={banner.link || "#"}
                className="flex-shrink-0 w-[calc(50%-6px)] snap-start rounded-3xl overflow-hidden"
              >
                <div className="aspect-[16/9] relative">
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <h3 className="text-white font-bold text-xs line-clamp-2 font-heading">
                      {banner.title}
                    </h3>
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* Mobile Pill Indicator */}
          {activeBanners.length > 2 && (
            <div className="flex items-center justify-center mt-3">
              <div className="relative w-12 h-2 rounded-full bg-muted-foreground/20 overflow-hidden">
                <div
                  className="absolute top-1/2 h-1.5 w-4 -translate-y-1/2 rounded-full bg-primary"
                  style={{
                    transform: `translateX(${mobileCurrentSlide * (48 - 16)}px) translateY(-50%)`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Emergency Services Buttons */}
      <div className="container mx-auto px-4 mt-4">
        {/* ================= DESKTOP ================= */}
        <div className="hidden md:flex items-start justify-between w-full max-w-xl mx-auto">
          {emergencyServices.map((service, index) => (
            <div key={index} className="flex flex-col items-center gap-1.5">
              {/* BUTTON */}
              <a
                href={`tel:${service.number.replace(/\s/g, "")}`}
                className="flex flex-col items-center gap-1.5 px-4 py-3 bg-card border border-border rounded-xl hover:border-primary/50 hover:bg-accent/50 transition-colors min-w-[90px]"
              >
                <i className={`${service.icon} text-primary text-lg`} />
                <span className="text-xs font-bold text-primary">
                  {service.number}
                </span>
              </a>

              {/* LABEL (DI BAWAH) */}
              <span className="text-xs font-medium text-foreground text-center leading-tight">
                {service.label}
              </span>
            </div>
          ))}
        </div>

        {/* ================= MOBILE ================= */}
        <div
          className="md:hidden flex gap-3 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {emergencyServices.map((service, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-1 flex-shrink-0"
            >
              {/* BUTTON */}
              <a
                href={`tel:${service.number.replace(/\s/g, "")}`}
                className="flex flex-col items-center gap-1.5 px-4 py-3 bg-card border border-border rounded-xl hover:border-primary/50 hover:bg-accent/50 transition-colors min-w-[100px]"
              >
                <i className={`${service.icon} text-primary text-sm`} />
                <span className="text-[10px] font-bold text-primary">
                  {service.number}
                </span>
              </a>

              {/* LABEL (DI BAWAH) */}
              <span className="text-[10px] font-medium text-foreground text-center leading-tight">
                {service.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
