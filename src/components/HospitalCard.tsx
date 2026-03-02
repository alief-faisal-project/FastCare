import { Link } from "react-router-dom";
import { Hospital } from "@/types";

interface HospitalCardProps {
  hospital: Hospital;
}

const HospitalCard = ({ hospital }: HospitalCardProps) => {
  return (
    <Link
      to={`/hospital/${hospital.id}`}
      className="
        block
        bg-card
        rounded-lg
        overflow-hidden
        border border-border
        h-full
        flex flex-col
      "
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden flex-shrink-0">
        <img
          src={hospital.image}
          alt={hospital.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* IGD Badge */}
      <div className="relative -mt-1 -ml-1 h-[22px] flex-shrink-0">
        <span
          className={`inline-block px-4 py-1 text-[10px] font-bold text-white ${
            hospital.hasIGD ? "bg-red-600" : "bg-yellow-500"
          }`}
          style={{ transform: "skewX(-15deg)" }}
        >
          <span style={{ transform: "skewX(15deg)", display: "inline-block" }}>
            {hospital.hasIGD ? "IGD Tersedia 24 Jam" : "UGD Terbatas"}
          </span>
        </span>
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        {/* Type */}
        <span className="text-[10px] font-medium text-muted-foreground mb-1">
          {hospital.type}
        </span>

        {/* Name */}
        <h3 className="font-bold text-foreground text-sm mb-1 line-clamp-2 font-heading">
          {hospital.name}
        </h3>

        {/* Location */}
        <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
          <i className="fa-solid fa-location-dot text-[10px]" />
          {hospital.city}
        </p>

        <div className="flex-1" />

        {/* Quick Info */}
        <div className="text-[10px] text-muted-foreground">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1 whitespace-nowrap">
              <i className="fa-solid fa-bed" />
              {hospital.totalBeds}+ Kamar
            </span>

            {hospital.hasICU && (
              <span className="flex items-center gap-1 whitespace-nowrap">
                <i className="fa-solid fa-heart-pulse" />
                ICU
              </span>
            )}
          </div>

          {/* Kelas → baris kedua JIKA perlu (Android kecil) */}
          <div className="mt-1 whitespace-nowrap">Kelas {hospital.class}</div>
        </div>
      </div>
    </Link>
  );
};

export default HospitalCard;
