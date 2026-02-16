import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, MapPin, Clock, Heart, Share2 } from "lucide-react";
import { cafes } from "@/data/cafes";
import { useState } from "react";

const CafeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const cafe = cafes.find((c) => c.id === id);
  const [liked, setLiked] = useState(false);

  if (!cafe) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground font-body">Cafe not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Image header */}
      <div className="relative h-72 overflow-hidden">
        <img src={cafe.image} alt={cafe.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/30 via-transparent to-background" />

        <button
          onClick={() => navigate(-1)}
          className="absolute top-12 left-4 w-10 h-10 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-background"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>

        <div className="absolute top-12 right-4 flex gap-2">
          <button
            onClick={() => setLiked(!liked)}
            className="w-10 h-10 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-background"
          >
            <Heart
              className={`w-5 h-5 transition-colors ${liked ? "text-destructive fill-destructive" : "text-foreground"}`}
            />
          </button>
          <button className="w-10 h-10 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-background">
            <Share2 className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 -mt-6 relative z-10 pb-8 space-y-5 animate-fade-up">
        <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
          <h1 className="font-display text-2xl font-bold text-foreground">{cafe.name}</h1>

          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-primary fill-primary" />
              <span className="text-sm font-semibold font-body">{cafe.rating}</span>
              <span className="text-xs text-muted-foreground font-body">({cafe.reviews} reviews)</span>
            </div>
            <span className="text-sm font-body text-muted-foreground">{cafe.priceRange}</span>
          </div>

          <div className="flex items-center gap-1.5 mt-3 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-body">{cafe.address} · {cafe.distance}</span>
          </div>

          <div className="flex items-center gap-1.5 mt-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-body">{cafe.hours}</span>
          </div>
        </div>

        <div>
          <h2 className="font-display text-lg font-semibold text-foreground mb-2">About</h2>
          <p className="text-sm leading-relaxed text-muted-foreground font-body">{cafe.description}</p>
        </div>

        <div>
          <h2 className="font-display text-lg font-semibold text-foreground mb-3">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {cafe.tags.map((tag) => (
              <span
                key={tag}
                className="text-sm font-body font-medium bg-matcha-light text-accent-foreground px-3 py-1.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Menu */}
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground mb-3">Menu</h2>
          <div className="space-y-4">
            {cafe.menu.map((section) => (
              <div key={section.category} className="bg-card rounded-xl border border-border p-4">
                <h3 className="font-display text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">{section.category}</h3>
                <div className="space-y-3">
                  {section.items.map((item) => (
                    <div key={item.name} className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-body font-medium text-foreground">{item.name}</p>
                        {item.description && (
                          <p className="text-xs font-body text-muted-foreground mt-0.5">{item.description}</p>
                        )}
                      </div>
                      <span className="text-sm font-body font-semibold text-primary shrink-0">{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-body font-semibold text-sm hover:opacity-90 transition-opacity active:scale-[0.98]">
          Get Directions
        </button>
      </div>
    </div>
  );
};

export default CafeDetail;
