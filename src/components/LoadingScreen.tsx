import { useEffect, useState } from 'react';
import fastcareLogo from '@/assets/fastcare-logo.webp';

interface LoadingScreenProps {
  onLoadComplete?: () => void;
}

const LoadingScreen = ({ onLoadComplete }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

useEffect(() => {
  const duration = 3000; // misalnya 3 detik
  const intervalTime = 50;
  const steps = duration / intervalTime;
  const increment = 100 / steps;

  const interval = setInterval(() => {
    setProgress((prev) => {
      if (prev >= 100) {
        clearInterval(interval);
        setFadeOut(true);

        setTimeout(() => {
          onLoadComplete?.();
        }, 500);

        return 100;
      }
      return prev + increment;
    });
  }, intervalTime);

  return () => clearInterval(interval);
}, [onLoadComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center space-y-8">
        {/* Logo */}
        <div className="loading-pulse">
          <img
            src={fastcareLogo}
            alt="FastCare.id"
            className="h-16 md:h-20 w-auto object-contain"
          />
        </div>

        {/* Tagline */}
        <p className="text-muted-foreground text-sm md:text-base font-medium">
          Cari Rumah Sakit Terdekat di Banten
        </p>

        {/* Heartbeat Loading */}
        <div className="w-72 md:w-96">
          <svg viewBox="0 0 400 100" className="w-full h-20" fill="none">
            <path
              d="M0 50 
         L40 50 
         L60 20 
         L80 80 
         L100 50 
         L140 50 
         L160 30 
         L180 70 
         L200 50 
         L400 50"
              stroke="currentColor"
              strokeWidth="3"
              className="heartbeat-path text-primary"
            />
          </svg>

          <p className="text-xs text-muted-foreground text-center mt-2">
            Memuat data rumah sakit...
          </p>
        </div>

        {/* Loading dots */}
        <div className="flex space-x-2">
          <div
            className="w-2 h-2 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="w-2 h-2 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <div
            className="w-2 h-2 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
