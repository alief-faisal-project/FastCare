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
            <span className="px-2 py-0.5 bg-white/95 text-foreground text-[10px] font-medium shadow-sm flex items-center gap-2 rounded">
              <i className="fa-solid fa-location-arrow text-primary text-[8px]" />
              <span className="whitespace-nowrap">
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
            {hospital.hasIGD
              ? "IGD Tersedia 24 Jam"
              : "Ketersediaan UGD Terbatas"}
          </span>
        </span>
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Type Tag */}
        <div className="mb-1">
          <span className="text-[10px] font-medium text-muted-foreground">
            {hospital.type}
          </span>
        </div>

        {/* Name */}
        <h3 className="font-bold text-foreground text-sm mb-1 line-clamp-1 font-heading">
          {hospital.name}
        </h3>

        {/* Location */}
        <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
          <i className="fa-solid fa-location-dot text-[10px]" />
          {hospital.city}
        </p>

        {/* Quick Info - Beds, Kelas, ICU */}
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <i className="fa-solid fa-bed" />
            {hospital.totalBeds}+ Kamar
          </span>

          {hospital.hasICU && (
            <span className="flex items-center gap-1">
              <i className="fa-solid fa-heart-pulse" />
              ICU
            </span>
          )}

          <span className="flex items-center gap-1">
            Kelas {hospital.class}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default HospitalCard;
