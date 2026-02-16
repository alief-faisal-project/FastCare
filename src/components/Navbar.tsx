 import { useState, useRef, useEffect } from 'react';
 import { Link, useNavigate } from 'react-router-dom';
 import { useApp } from '@/context/AppContext';
 import { BANTEN_CITIES, BantenCity } from '@/types';
 import fastcareLogo from '@/assets/fastcare-logo.png';
 
 const Navbar = () => {
   const { selectedCity, setSelectedCity, detectLocation, isAuthenticated, logout, searchQuery, setSearchQuery } = useApp();
   const [isLocationOpen, setIsLocationOpen] = useState(false);
   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
   const [isDetecting, setIsDetecting] = useState(false);
   const locationRef = useRef<HTMLDivElement>(null);
   const navigate = useNavigate();
 
   // Close dropdown when clicking outside
   useEffect(() => {
     const handleClickOutside = (event: MouseEvent) => {
       if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
         setIsLocationOpen(false);
       }
     };
     document.addEventListener('mousedown', handleClickOutside);
     return () => document.removeEventListener('mousedown', handleClickOutside);
   }, []);
 
   const handleDetectLocation = async () => {
     setIsDetecting(true);
     try {
       await detectLocation();
       setIsLocationOpen(false);
     } catch (error) {
       console.error('Failed to detect location');
     } finally {
       setIsDetecting(false);
     }
   };
 
   const handleCitySelect = (city: BantenCity | 'Semua') => {
     setSelectedCity(city);
     setIsLocationOpen(false);
   };
 
   return (
     <nav className="navbar-sticky rounded-b-3xl">
       <div className="container mx-auto px-4">
         <div className="flex items-center justify-between h-20 md:h-24 ">
           {/* Logo */}
           <Link to="/" className="flex-shrink-0 mr-6">
             <img
               src={fastcareLogo}
               alt="FastCare.id"
               className="h-16 md:h-24 w-auto object-contain"
             />
           </Link>

           {/* Desktop: Location & Search */}
           <div className="hidden md:flex items-center gap-4 flex-1 max-w-3xl mx-6">
             {/* Location Dropdown */}
             <div className="relative" ref={locationRef}>
               <button
                 onClick={() => setIsLocationOpen(!isLocationOpen)}
                 className="flex items-center space-x-2 px-4 py-3 rounded-xl border border-border hover:border-primary/50 transition-colors bg-card min-w-[200px]"
               >
                 <i className="fa-solid fa-location-arrow text-primary" />
                 <span className="text-sm text-foreground truncate flex-1 text-left">
                   {selectedCity === "Lokasi Terdekat"
                     ? "Lokasi Terdekat"
                     : selectedCity}
                 </span>
                 <i
                   className={`fa-solid fa-chevron-down text-primary text-muted-foreground transition-transform ${isLocationOpen ? "rotate-180" : ""}`}
                 />
               </button>

               {/* papan lokasi terdekat rounded-xl*/}
               {isLocationOpen && (
                 <div className="absolute top-full left-0 mt-3 bg-card rounded-xl border border-border shadow-lg z-50 py-2 animate-scale-in">
                   {/* Detect Location */}
                   <button
                     onClick={handleDetectLocation}
                     disabled={isDetecting}
                     className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-accent transition-colors text-left"
                   >
                     <i
                       className={`fa-solid ${isDetecting ? "fa-spinner fa-spin" : "fa-street-view"} text-primary w-5`}
                     />
                     <div>
                       <p className="text-sm font-medium text-foreground">
                         Lokasi Terdekat
                       </p>
                       <p className="text-xs text-muted-foreground">
                         Deteksi lokasi perangkat
                       </p>
                     </div>
                   </button>

                   <div className="border-t border-border my-2" />

                   {/* All */}
                   <button
                     onClick={() => handleCitySelect("Semua")}
                     className={`w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-accent transition-colors text-left ${
                       selectedCity === "Semua" ? "bg-accent" : ""
                     }`}
                   >
                     {/* <i className="fa-solid fa-map text-muted-foreground w-5"></i> */}
                     <span className="text-sm text-foreground">
                       Semua Wilayah
                     </span>
                   </button>

                   <div className="border-t border-border my-2" />

                   {/* Cities */}
                   <div className="max-h-60 overflow-y-auto">
                     {BANTEN_CITIES.map((city) => (
                       <button
                         key={city}
                         onClick={() => handleCitySelect(city)}
                         className={`w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-accent transition-colors text-left ${
                           selectedCity === city ? "bg-accent" : ""
                         }`}
                       >
                         <span className="text-sm text-foreground">{city}</span>
                       </button>
                     ))}
                   </div>
                 </div>
               )}
             </div>

             {/* Search bar */}
             <div className="flex-1 relative">
               <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
               <input
                 type="text"
                 placeholder="Temukan rumah sakit di Banten..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full pl-12 pr-4 py-3 rounded-xl border border-border focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-card text-sm"
               />
             </div>
           </div>

           {/* Desktop: Auth buttons */}
           <div className="hidden md:flex items-center space-x-3">
             {isAuthenticated ? (
               <>
                 <Link
                   to="/admin"
                   className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                 >
                   <i className="fa-solid fa-gauge-high" />
                   <span>Dashboard</span>
                 </Link>
                 <button
                   onClick={() => {
                     logout();
                     navigate("/");
                   }}
                   className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                 >
                   <i className="fa-solid fa-right-from-bracket" />
                   <span>Logout</span>
                 </button>
               </>
             ) : (
               <Link
                 to="/login"
                 className="flex items-center space-x-2 px-5 py-2.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
               >
                 <span>Login</span>
               </Link>
             )}
           </div>

           {/* Mobile menu button */}
           <button
             onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
             className="md:hidden p-2 relative w-10 h-10 flex items-center justify-center"
           >
             <div className="relative w-6 h-4">
               {/* Top bar */}
               <span
                 className={`absolute w-full h-1 bg-foreground rounded transition-all duration-300 ease-in-out
        ${isMobileMenuOpen ? "rotate-45 top-1.5" : "top-0"}
      `}
               />

               {/* Bottom bar */}
               <span
                 className={`absolute w-full h-1 bg-foreground rounded transition-all duration-300 ease-in-out
        ${isMobileMenuOpen ? "-rotate-45 top-1.5" : "top-3"}
      `}
               />
             </div>
           </button>
         </div>

         {/* Mobile Menu */}
         {isMobileMenuOpen && (
           <div
             className="md:hidden py-4 border-t border-border
  animate-[slideDown_0.45s_cubic-bezier(0.22,1,0.36,1)]"
           >
             {/* Mobile Auth */}
             <div className="pt-2">
               {isAuthenticated ? (
                 <div className="space-y-2">
                   <Link
                     to="/admin"
                     onClick={() => setIsMobileMenuOpen(false)}
                     className="flex items-center space-x-3 px-4 py-3 bg-primary text-primary-foreground rounded-lg"
                   >
                     <i className="fa-solid fa-gauge-high" />
                     <span className="font-medium">Dashboard Admin</span>
                   </Link>
                   <button
                     onClick={() => {
                       logout();
                       navigate("/");
                       setIsMobileMenuOpen(false);
                     }}
                     className="w-full flex items-center space-x-3 px-4 py-3 bg-secondary rounded-lg"
                   >
                     <i className="fa-solid fa-right-from-bracket" />
                     <span className="font-medium">Logout</span>
                   </button>
                 </div>
               ) : (
                 <Link
                   to="/login"
                   onClick={() => setIsMobileMenuOpen(false)}
                   className="flex items-center justify-center space-x-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium"
                 >
                   <i class="fa-solid fa-arrow-right-to-bracket"></i>
                   <span>Masuk</span>
                 </Link>
               )}
             </div>
           </div>
         )}
       </div>
     </nav>
   );
 };
 
 export default Navbar;