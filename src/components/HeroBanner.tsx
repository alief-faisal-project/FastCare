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
  const desktopIndicatorRef = useRef<HTMLDivElement>(null);
  const desktopTrackRef = useRef<HTMLDivElement | null>(null);
  const dragStartXRef = useRef<number | null>(null);
  const dragDeltaRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);

  const activeBanners = heroBanners
    .filter((b) => b.isActive)
    .sort((a, b) => a.order - b.order);

  // ================= DESKTOP =================

  const maxDesktopSlide =
    activeBanners.length > 3 ? activeBanners.length - 3 : 0;

  const desktopPages = Math.max(1, Math.ceil(activeBanners.length / 3));

  const goToPrevious = () => {
    if (currentSlide === 0) return;
    setCurrentSlide((prev) => prev - 1);
  };

  const goToNext = () => {
    if (currentSlide >= maxDesktopSlide) return;
    setCurrentSlide((prev) => prev + 1);
  };

  // Pointer / drag handlers for desktop carousel
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragDeltaRef.current = 0;
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || dragStartXRef.current === null) return;
    dragDeltaRef.current = e.clientX - dragStartXRef.current;
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    const delta = dragDeltaRef.current;
    const threshold = 40; // pixels to trigger slide
    if (delta > threshold) {
      goToPrevious();
    } else if (delta < -threshold) {
      goToNext();
    }
    dragStartXRef.current = null;
    dragDeltaRef.current = 0;
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

  // move desktop indicator based on currentSlide
  useEffect(() => {
    const indicator = desktopIndicatorRef.current;
    if (!indicator) return;

    const maxTranslate = 64 - 16; // trackWidth 64 - dotWidth 16
    const progress = maxDesktopSlide > 0 ? currentSlide / maxDesktopSlide : 0;
    indicator.style.transform = `translate3d(${progress * maxTranslate}px,0,0)`;
  }, [currentSlide, maxDesktopSlide]);

  return (
    <section className="py-3 md:py-4">
      <div className="relative">
        {/* ================= DESKTOP ================= */}
        {activeBanners.length > 0 && (
          <div className="hidden md:block container mx-auto px-4">
            <div className="relative overflow-hidden">
              <div
                ref={desktopTrackRef}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
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
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      {/* Overlay removed per request: only show image for SEO/visual simplicity */}
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
                    <i className="fa-solid fa-chevron-left text-lg" />
                  </button>

                  <button
                    onClick={goToNext}
                    disabled={currentSlide === maxDesktopSlide}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg disabled:opacity-40"
                  >
                    <i className="fa-solid fa-chevron-right text-lg" />
                  </button>
                </>
              )}

              {/* Desktop indicator (same style as mobile) */}
              {activeBanners.length > 1 && (
                <div className="flex items-center justify-center mt-4">
                  <div className="relative w-16 h-2 rounded-full bg-muted-foreground/20 overflow-hidden">
                    <div
                      ref={desktopIndicatorRef}
                      className="absolute top-0 left-0 h-2 w-4 rounded-full bg-primary will-change-transform"
                    />
                  </div>
                </div>
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
                  <div className="aspect-[16/9] relative">
                    <img
                      src={banner.image}
                      alt={banner.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    {/* mobile: do not show overlay text to match desktop */}
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
                className="flex flex-col items-center gap-1.5 px-4 py-3 bg-card border border-border rounded-2xl min-w-[90px]"
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
                className="flex flex-col items-center gap-1.5 px-4 py-3 bg-card border border-border rounded-2xl min-w-[100px]"
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
