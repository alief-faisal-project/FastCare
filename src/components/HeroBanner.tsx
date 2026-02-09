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

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const itemWidth = container.offsetWidth / 2;
      const newSlide = Math.round(scrollLeft / itemWidth);
      setMobileCurrentSlide(Math.min(newSlide, activeBanners.length - 1));
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
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

          {/* Desktop Dots Indicator */}
          {activeBanners.length > 3 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              {activeBanners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`transition-all duration-300 rounded-full ${
                    currentSlide === index
                      ? "w-6 h-2 bg-primary"
                      : "w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                />
              ))}
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

          {/* Mobile Dots Indicator */}
          {activeBanners.length > 2 && (
            <div className="flex items-center justify-center gap-1.5 mt-3">
              {activeBanners.map((_, index) => (
                <div
                  key={index}
                  className={`transition-all duration-300 rounded-full ${
                    mobileCurrentSlide === index
                      ? "w-5 h-1.5 bg-primary"
                      : "w-1.5 h-1.5 bg-muted-foreground/30"
                  }`}
                />
              ))}
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
