const Footer = () => {
  return (
    <footer className="bg-primary py-6 mt-12 border-t border-border rounded-t-3xl">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left - Copyright */}
          <p className="text-xs text-white order-3 md:order-1">
            © 2026 FastCare
          </p>

          {/* Center - Data Source */}
          <a
            href="https://sirs.kemkes.go.id"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-white hover:text-yellow-400 transition-colors order-2"
          >
            Sumber Data: SIRS Kemkes RI
          </a>

          {/* Right - Social Icons */}
          <div className="flex items-center gap-4 order-1 md:order-3">
            <a
              href="https://instagram.com/fastcare.id"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-yellow-400 transition-colors"
            >
              <i className="fa-brands fa-instagram text-base" />
            </a>
            <a
              href="mailto:info@fastcare.id"
              className="text-white hover:text-yellow-400 transition-colors"
            >
              <i className="fa-solid fa-envelope text-base" />
            </a>
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-yellow-400 transition-colors"
            >
              <i className="fa-brands fa-whatsapp text-base" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
