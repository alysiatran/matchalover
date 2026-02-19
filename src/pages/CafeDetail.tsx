import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, MapPin, Clock, Heart, Share2, Leaf, ChevronLeft, ChevronRight, Milk } from "lucide-react";
import { useCafes } from "@/hooks/useCafes";
import { useState, useRef } from "react";
import cafe1 from "@/assets/cafe-1.jpg";

const CafeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: cafes = [] } = useCafes();
  const cafe = cafes.find((c) => c.id === id);
  const [liked, setLiked] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const fallbackImage = cafe1;

  const allPhotos = cafe
    ? [cafe.image, ...(cafe.photos || [])].filter((url, i, arr) => url && arr.indexOf(url) === i)
    : [];
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
        <img
          src={allPhotos[activePhoto] || cafe.image}
          alt={cafe.name}
          className="w-full h-full object-cover transition-opacity duration-300"
          onError={(e) => { e.currentTarget.src = fallbackImage; }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/30 via-transparent to-background" />

        {allPhotos.length > 1 && (
          <>
            <button
              onClick={() => setActivePhoto((p) => (p - 1 + allPhotos.length) % allPhotos.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/60 backdrop-blur-sm flex items-center justify-center"
            >
              <ChevronLeft className="w-4 h-4 text-foreground" />
            </button>
            <button
              onClick={() => setActivePhoto((p) => (p + 1) % allPhotos.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/60 backdrop-blur-sm flex items-center justify-center"
            >
              <ChevronRight className="w-4 h-4 text-foreground" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {allPhotos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActivePhoto(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === activePhoto ? "bg-primary-foreground scale-125" : "bg-primary-foreground/50"}`}
                />
              ))}
            </div>
          </>
        )}

        <button
          onClick={() => window.history.length > 1 ? navigate(-1) : navigate("/")}
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

        {/* Matcha Powder Profile */}
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Leaf className="w-5 h-5 text-primary" />
            Matcha Profile
          </h2>
          <div className="bg-card rounded-xl border border-border p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-body text-muted-foreground uppercase tracking-wide">Origin</span>
              <span className="text-sm font-body font-medium text-foreground">{cafe.matchaPowder.origin}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-body text-muted-foreground uppercase tracking-wide">Grade</span>
              <span className="text-sm font-body font-medium text-primary">{cafe.matchaPowder.grade}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-xs font-body text-muted-foreground uppercase tracking-wide">Flavor Notes</span>
              <div className="flex flex-wrap gap-1.5 justify-end">
                {cafe.matchaPowder.flavorNotes.map((note, index) => (
                  <span key={`${note}-${index}`} className="text-xs font-body font-medium bg-matcha-light text-accent-foreground px-2.5 py-1 rounded-full">
                    {note}
                  </span>
                ))}
              </div>
            </div>
            {cafe.matchaPowder.grams && (
              <div className="flex justify-between items-center">
                <span className="text-xs font-body text-muted-foreground uppercase tracking-wide">Grams Used</span>
                <span className="text-sm font-body font-medium text-primary">{cafe.matchaPowder.grams}</span>
              </div>
            )}
          </div>
        </div>


        {/* Milk Options */}
        {cafe.milkOptions && cafe.milkOptions.length > 0 && (
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Milk className="w-5 h-5 text-primary" />
              Milk Options
            </h2>
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex flex-wrap gap-2">
                {cafe.milkOptions.map((milk) => (
                  <span
                    key={milk.name}
                    className="text-sm font-body font-medium bg-matcha-light text-accent-foreground px-3 py-1.5 rounded-full"
                  >
                    {milk.name}{milk.price ? ` ${milk.price}` : ''}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Menu */}
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground mb-3">Menu</h2>
          <div className="space-y-4">
            {cafe.menu.map((section) => (
              <div key={section.category} className="bg-card rounded-xl border border-border p-4">
                <h3 className="font-display text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">{section.category}</h3>
                <div className="space-y-3">
                  {section.items.map((item) => (
                    <div key={item.name} className="flex items-start gap-3">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-16 h-16 rounded-lg object-cover shrink-0"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      )}
                      <div className="flex-1 min-w-0 flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-body font-medium text-foreground">{item.name}</p>
                          {item.description && (
                            <p className="text-xs font-body text-muted-foreground mt-0.5">{item.description}</p>
                          )}
                        </div>
                        <span className="text-sm font-body font-semibold text-primary shrink-0">{item.price}</span>
                      </div>
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
