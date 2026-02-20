import { Star, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Cafe } from "@/data/cafes";
import cafe1 from "@/assets/cafe-1.jpg";

const fallbackImage = cafe1;

interface CafeCardProps {
  cafe: Cafe;
  index: number;
}

const CafeCard = ({ cafe, index }: CafeCardProps) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/cafe/${cafe.id}`)}
      className="w-full text-left animate-fade-up rounded-2xl overflow-hidden bg-card border border-border shadow-sm hover:shadow-md transition-all duration-300 active:scale-[0.98]"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={cafe.image}
          alt={cafe.name}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => { e.currentTarget.src = fallbackImage; }}
        />
        <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1">
          <Star className="w-3.5 h-3.5 text-primary fill-primary" />
          <span className="text-xs font-semibold font-body">{cafe.rating}</span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-display text-lg font-semibold text-foreground">{cafe.name}</h3>
        <div className="flex items-center gap-1 mt-1 text-muted-foreground">
          <MapPin className="w-3.5 h-3.5" />
          <span className="text-xs font-body">{cafe.distance} · {cafe.priceRange}</span>
        </div>
        <div className="flex gap-2 mt-3 flex-nowrap overflow-hidden">
          {cafe.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-[11px] font-body font-medium bg-matcha-light text-accent-foreground px-2.5 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
};

export default CafeCard;
