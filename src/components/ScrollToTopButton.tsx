import { useEffect, useState } from "react";

/**
 * Komponen ScrollToTopButton
 *
 * Fungsi:
 * Menampilkan tombol "Scroll ke Atas" yang muncul ketika user
 * sudah berada di bagian bawah halaman.
 *
 * Karakteristik:
 * - Hanya tampil di perangkat mobile (md:hidden).
 * - Muncul TANPA animasi (langsung tampil).
 * - Menggunakan smooth scroll saat ditekan.
 */
const ScrollToTopButton = () => {
  /**
   * State untuk mengontrol visibilitas tombol.
   * true  -> tombol terlihat
   * false -> tombol tersembunyi
   */
  const [isVisible, setIsVisible] = useState(false);

  /**
   * useEffect digunakan untuk:
   * - Mendaftarkan event listener scroll saat komponen mount
   * - Menghapus event listener saat komponen unmount
   */
  useEffect(() => {
    /**
     * Fungsi untuk mendeteksi posisi scroll halaman.
     */
    const handleScroll = () => {
      // Posisi scroll dari atas (dalam pixel)
      const scrollTop = window.scrollY;

      // Tinggi viewport (tinggi layar yang terlihat)
      const windowHeight = window.innerHeight;

      // Total tinggi dokumen/halaman
      const documentHeight = document.documentElement.scrollHeight;

      /**
       * Jika sudah mendekati bawah (120px sebelum akhir),
       * maka tombol langsung muncul tanpa animasi.
       */
      if (scrollTop + windowHeight >= documentHeight - 120) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /**
   * Fungsi untuk melakukan scroll kembali ke atas halaman.
   * Menggunakan behavior "smooth" agar animasi scroll halus.
   */
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    /**
     * Container utama tombol.
     *
     * fixed              -> posisi tetap terhadap viewport
     * top-1/2            -> posisi vertikal di tengah layar
     * -translate-y-1/2   -> agar benar-benar center secara vertikal
     * right-6            -> jarak dari kanan
     * z-50               -> memastikan berada di atas elemen lain
     * md:hidden          -> hanya tampil di mobile
     *
     * Tidak menggunakan transition / opacity animasi.
     * Hanya toggle display berdasarkan state.
     */
    <div
      className={`
        fixed top-1/2 -translate-y-1/2 right-6 z-50
        flex flex-col items-center
        md:hidden
        ${isVisible ? "block" : "hidden"}
      `}
    >
      {/* Tombol utama scroll ke atas */}
      <button
        onClick={scrollToTop}
        className="
          h-12 w-12
          rounded-2xl
          bg-transparent
          text-primary
          flex items-center justify-center
        "
        aria-label="Scroll to top"
      >
        {/* Icon panah ke atas */}
        <i className="fa-solid fa-angles-up text-5xl" />
      </button>
    </div>
  );
};

export default ScrollToTopButton;
