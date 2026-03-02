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
            <span className="px-2 py-0.5 bg-white/95 text-foreground text-[9px] sm:text-[10px] font-medium shadow-sm flex items-center gap-2 rounded">
              <i className="fa-solid fa-location-arrow text-primary text-[8px]" />
              <span className="whitespace-nowrap leading-none">
                {hospital.distance.toFixed(1)} km
              </span>
            </span>
          </div>
        )}
      </div>

      {/* IGD Badge */}
      <div className="relative -mt-1 -ml-1 h-[22px]">
        <span
          className={`inline-block px-4 py-1 text-[10px] font-bold text-white ${
            hospital.hasIGD ? "bg-red-600" : "bg-yellow-500"
          }`}
          style={{ transform: "skewX(-15deg)" }}
        >
          <span style={{ display: "inline-block", transform: "skewX(15deg)" }}>
            {hospital.hasIGD ? "IGD Tersedia 24 Jam" : "UGD Terbatas"}
          </span>
        </span>
      </div>

      {/* Content */}
      <div className="p-3 h-[116px] flex flex-col justify-between">
        <div>
          {/* Type Tag */}
          <div className="mb-1">
            <span className="text-[9px] sm:text-[10px] font-medium text-muted-foreground leading-none">
              {hospital.type}
            </span>
          </div>

          {/* Name */}
          <h3 className="font-bold text-foreground text-[13px] sm:text-sm mb-1 line-clamp-1 leading-tight font-heading">
            {hospital.name}
          </h3>

          {/* Location */}
          <p className="text-[11px] sm:text-xs text-muted-foreground mb-2 flex items-center gap-1 leading-tight truncate">
            <i className="fa-solid fa-location-dot text-[10px] shrink-0" />
            <span className="truncate">{hospital.city}</span>
          </p>
        </div>

        {/* Quick Info - Beds, Kelas, ICU */}
        <div className="flex items-center gap-3 text-[9px] sm:text-[10px] text-muted-foreground leading-none">
          <span className="flex items-center gap-1 truncate">
            <i className="fa-solid fa-bed shrink-0" />
            <span className="truncate">{hospital.totalBeds}+ Kamar</span>
          </span>

          {hospital.hasICU && (
            <span className="flex items-center gap-1">
              <i className="fa-solid fa-heart-pulse shrink-0" />
              ICU
            </span>
          )}

          <span className="flex items-center gap-1 truncate">
            Kelas {hospital.class}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default HospitalCard;
