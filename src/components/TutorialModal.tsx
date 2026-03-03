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

  useEffect(() => {
    const hideTutorial = sessionStorage.getItem("hideTutorial");

    if (location.pathname === "/" && !hideTutorial) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname !== "/") {
      sessionStorage.setItem("hideTutorial", "true");
    }
  }, [location.pathname]);

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else {
      setIsOpen(false);
    }
  };

  const handleClose = () => {
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
             Deteksi Lokasi Perangkat
            </h2>
            <img
              src={image2}
              alt="Tutorial Step 2"
              className="w-full rounded-lg mb-3"
            />
           <p className="text-xs sm:text-sm text-gray-600 mb-4">
              Deteksi jarak dan temukan pertolongan medis terdekat.
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
