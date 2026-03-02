import { useEffect, useState } from 'react';
import fastcareLogo from '@/assets/fastcare-logo.webp';

interface LoadingScreenProps {
  onLoadComplete?: () => void;
}

const LoadingScreen = ({ onLoadComplete }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setFadeOut(true);
          setTimeout(() => {
            onLoadComplete?.();
          }, 500);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [onLoadComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
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

        {/* Progress Bar */}
        <div className="w-64 md:w-80">
          <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Memuat data... {Math.round(Math.min(progress, 100))}%
          </p>
        </div>

        {/* Loading dots */}
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
