import { Link } from "react-router-dom";
import { Hospital } from "@/types";

interface HospitalCardProps {
  hospital: Hospital;
}

const HospitalCard = ({ hospital }: HospitalCardProps) => {
  return (
    <Link
      to={`/hospital/${hospital.id}`}
      className="group block bg-card rounded-lg overflow-hidden border border-border transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={hospital.image}
          alt={hospital.name}
          className="w-full h-full object-cover"
        />

        {/* Distance Badge - only on image */}
        {typeof hospital.distance === "number" && (
          <div className="absolute top-2 right-2">
            <span className="px-2 py-0.5 bg-white/95 text-foreground text-[10px] font-medium shadow-sm flex items-center gap-1 rounded">
              <i className="fa-solid fa-location-arrow text-primary text-[8px] shrink-0" />
              <span className="whitespace-nowrap leading-none">
                {hospital.distance.toFixed(1)} km
              </span>
            </span>
          </div>
        )}
      </div>

      {/* IGD Badge */}
      <div className="relative -mt-1 -ml-1 h-[20px] overflow-hidden">
        <span
          className={`inline-flex items-center px-3 h-[20px] text-[10px] font-bold text-white ${
            hospital.hasIGD ? "bg-red-600" : "bg-yellow-500"
          }`}
          style={{ transform: "skewX(-12deg)" }}
        >
          <span
            className="inline-block leading-none"
            style={{ transform: "skewX(12deg)" }}
          >
            {hospital.hasIGD
              ? "IGD Tersedia 24 Jam"
              : "Ketersediaan UGD Terbatas"}
          </span>
        </span>
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col justify-between h-[110px]">
        <div>
          {/* Type Tag */}
          <div className="mb-1">
            <span className="text-[10px] font-medium text-muted-foreground leading-none">
              {hospital.type}
            </span>
          </div>

          {/* Name */}
          <h3 className="font-bold text-foreground text-sm mb-1 line-clamp-1 leading-tight font-heading">
            {hospital.name}
          </h3>

          {/* Location */}
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1 truncate leading-tight">
            <i className="fa-solid fa-location-dot text-[10px] shrink-0" />
            <span className="truncate">{hospital.city}</span>
          </p>
        </div>

        {/* Quick Info - Beds, Kelas, ICU */}
        <div className="grid grid-cols-3 gap-2 text-[10px] text-muted-foreground leading-none">
          <span className="flex items-center gap-1 truncate">
            <i className="fa-solid fa-bed shrink-0" />
            <span className="truncate">{hospital.totalBeds}+ Kamar</span>
          </span>

          {hospital.hasICU ? (
            <span className="flex items-center gap-1 justify-center">
              <i className="fa-solid fa-heart-pulse shrink-0" />
              ICU
            </span>
          ) : (
            <span />
          )}

          <span className="text-right truncate">Kelas {hospital.class}</span>
        </div>
      </div>
    </Link>
  );
};

export default HospitalCard;
