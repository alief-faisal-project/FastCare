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

  // Get active banners or create 5 placeholder banners if none exist
  const getDisplayBanners = () => {
    const activeBanners = heroBanners
      .filter((b) => b.isActive)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    if (activeBanners.length === 0) {
      // Return 5 placeholder banners with gray background
      return new Array(5).fill(null).map((_, index) => ({
        id: `placeholder-${index}`,
        title: `Banner ${index + 1}`,
        subtitle: "Placeholder banner",
        image: null,
        link: undefined,
        isActive: true,
        order: index,
      }));
    }
    return activeBanners;
  };

  const activeBanners = getDisplayBanners();

  // ================= DESKTOP =================

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

  // ================= MOBILE ULTRA SMOOTH =================

  useEffect(() => {
    const container = mobileRef.current;
    const indicator = indicatorRef.current;
    if (!container || !indicator) return;

    let ticking = false;

    const updateIndicator = () => {
      const maxScroll = container.scrollWidth - container.clientWidth;
      const progress = maxScroll > 0 ? container.scrollLeft / maxScroll : 0;

      const trackWidth = 64;
      const dotWidth = 16;
      const maxTranslate = trackWidth - dotWidth;

      indicator.style.transform = `translate3d(${progress * maxTranslate}px,0,0)`;
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
        {activeBanners.length > 0 && (
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
                    <div className="aspect-[16/9] relative bg-gray-300">
                      {banner.image ? (
                        <img
                          src={banner.image}
                          alt={banner.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-400">
                          <div className="text-center text-white/70">
                            <i className="fa-solid fa-image text-4xl mb-2" />
                            <p className="text-sm">No Image</p>
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                        <h3 className="text-white font-bold text-sm md:text-lg line-clamp-2 font-heading">
                          {banner.title}
                        </h3>
                      </div>
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
        )}

        {/* ================= MOBILE ================= */}
        {activeBanners.length > 0 && (
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
                  <div className="aspect-[16/9] relative bg-gray-300">
                    {banner.image ? (
                      <img
                        src={banner.image}
                        alt={banner.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-400">
                        <div className="text-center text-white/70">
                          <i className="fa-solid fa-image text-3xl mb-1" />
                          <p className="text-xs">No Image</p>
                        </div>
                      </div>
                    )}
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
        )}
      </div>

      {/* ================= EMERGENCY SERVICES ================= */}
      <div className="container mx-auto px-4 mt-4">
        <div className="hidden md:flex items-start justify-between w-full max-w-xl mx-auto">
          {emergencyServices.map((service, index) => (
            <div key={index} className="flex flex-col items-center gap-1.5">
              <a
                href={`tel:${service.number.replace(/\s/g, "")}`}
                className="flex flex-col items-center gap-1.5 px-4 py-3 bg-card border border-border rounded-xl min-w-[90px]"
              >
                <i className={`${service.icon} text-primary text-lg`} />
                <span className="text-xs font-bold text-primary">
                  {service.number}
                </span>
              </a>
              <span className="text-xs font-medium text-foreground text-center leading-tight">
                {service.label}
              </span>
            </div>
          ))}
        </div>

        <div
          className="md:hidden flex gap-3 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {emergencyServices.map((service, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-1 flex-shrink-0"
            >
              <a
                href={`tel:${service.number.replace(/\s/g, "")}`}
                className="flex flex-col items-center gap-1.5 px-4 py-3 bg-card border border-border rounded-xl min-w-[100px]"
              >
                <i className={`${service.icon} text-primary text-sm`} />
                <span className="text-[10px] font-bold text-primary">
                  {service.number}
                </span>
              </a>
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