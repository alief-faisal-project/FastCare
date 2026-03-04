import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

interface TutorialModalProps {
  image1: string;
  image2: string;
}

const TutorialModal = ({ image1, image2 }: TutorialModalProps) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);

  const STORAGE_KEY = "tutorialLastSeen";
  const ONE_DAY = 24 * 60 * 60 * 1000; // 1 hari dalam ms

  useEffect(() => {
    if (location.pathname !== "/") {
      setIsOpen(false);
      return;
    }

    const lastSeen = localStorage.getItem(STORAGE_KEY);

    if (!lastSeen) {
      setIsOpen(true);
      setStep(1);
      return;
    }

    const now = Date.now();
    const diff = now - Number(lastSeen);

    // Jika sudah lewat 1 hari, tampilkan lagi
    if (diff > ONE_DAY) {
      setIsOpen(true);
      setStep(1);
    } else {
      setIsOpen(false);
    }
  }, [location.pathname]);

  const saveTimestamp = () => {
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else {
      saveTimestamp(); // simpan waktu selesai
      setIsOpen(false);
    }
  };

  const handleClose = () => {
    saveTimestamp(); // simpan waktu jika ditutup manual
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="relative bg-white rounded-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md shadow-xl text-center">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-lg"
        >
          ✕
        </button>

        {step === 1 && (
          <>
            <h2 className="text-base sm:text-lg font-semibold mb-3">
              Selamat Datang di FastCare
            </h2>
            <img
              src={image1}
              alt="Tutorial Step 1"
              className="w-full rounded-lg mb-3"
            />
            <p className="text-xs sm:text-sm text-gray-600 mb-4">
              Temukan pertolongan medis terdekat dari lokasi anda.
            </p>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-base sm:text-lg font-semibold mb-3">
              Fitur Deteksi Lokasi Perangkat
            </h2>
            <img
              src={image2}
              alt="Tutorial Step 2"
              className="w-full rounded-lg mb-3"
            />
            <p className="text-xs sm:text-sm text-gray-600 mb-4">
              Fitur deteksi lokasi untuk mengetahui jarak Anda dengan rumah
              sakit atau klinik terdekat secara real-time.
            </p>
          </>
        )}

        <button
          onClick={handleNext}
          className="w-full bg-primary text-white py-2 rounded-lg text-sm sm:text-base transition"
        >
          {step === 1 ? "Lanjut" : "Mulai Sekarang"}
        </button>
      </div>
    </div>
  );
};

export default TutorialModal;
