import { useState, useMemo } from "react";
import { categories } from "@/data/cafes";
import { useCafes } from "@/hooks/useCafes";
import { useSavedCafes } from "@/hooks/useSavedCafes";
import { useVisitedCafes } from "@/hooks/useVisitedCafes";
import { useLocation } from "@/hooks/useLocation";
import SearchBar from "@/components/SearchBar";
import CategoryChips from "@/components/CategoryChips";
import CafeCard from "@/components/CafeCard";
import LocationPicker from "@/components/LocationPicker";
import heroImage from "@/assets/matcha-hero.jpg";

const Index = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const { location, setLocation } = useLocation();
  const { data: cafes = [] } = useCafes(location);
  const { isSaved, toggleSave } = useSavedCafes();
  const { isVisited, toggleVisited } = useVisitedCafes();

  const filtered = useMemo(() => {
    // Deduplicate by name (keep highest rated)
    const seen = new Map<string, typeof cafes[0]>();
    for (const c of cafes) {
      const key = c.name.toLowerCase();
      const existing = seen.get(key);
      if (!existing || c.rating > existing.rating) {
        seen.set(key, c);
      }
    }
    let result = Array.from(seen.values());

    // Pin featured cafes to the top
    const pinnedNames = [
      "offline coffee",
      "mina",
      "grean matcha",
      "yoka tea",
      "taz matcha",
      "ph\u00ea",
      "phe",
      "plus84",
      "plus 84",
      "vale matcha",
      "jin jin matcha",
    ];
    result.sort((a, b) => {
      const aIdx = pinnedNames.findIndex((p) => a.name.toLowerCase().includes(p));
      const bIdx = pinnedNames.findIndex((p) => b.name.toLowerCase().includes(p));
      const aPinned = aIdx !== -1;
      const bPinned = bIdx !== -1;
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      if (aPinned && bPinned) return aIdx - bIdx;
      return 0;
    });

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q)) ||
          c.address.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      );
    }
    if (activeCategory === "Hojicha Offered") {
      result = result.filter((c) =>
        c.tags.some((t) => t.toLowerCase().includes("hojicha")) ||
        c.menu.some((cat) => cat.items.some((item) => item.name.toLowerCase().includes("hojicha")))
      );
    } else if (activeCategory === "Soft Opening") {
      result = result.filter((c) =>
        c.tags.some((t) => t.toLowerCase().includes("soft opening")) ||
        c.description.toLowerCase().includes("soft opening")
      );
    }
    return result;
  }, [search, activeCategory, cafes]);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero */}
      <div className="relative h-60 overflow-hidden">
        <img
          src={heroImage}
          alt="Matcha latte"
          className="w-full h-full object-cover object-[center_70%]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80" />
        <div className="absolute bottom-6 left-5 right-5">
          <h1 className="font-display text-3xl font-bold text-primary-foreground drop-shadow-lg">
            Matcha Moments
          </h1>
          <div className="mt-1">
            <LocationPicker location={location} onLocationChange={setLocation} variant="hero" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 -mt-4 relative z-10 space-y-5">
        <SearchBar value={search} onChange={setSearch} />
        <CategoryChips
          categories={categories}
          active={activeCategory}
          onSelect={setActiveCategory}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((cafe, i) => (
            <CafeCard key={cafe.id} cafe={cafe} index={i} isSaved={isSaved(cafe.id)} onToggleSave={toggleSave} isVisited={isVisited(cafe.id)} onToggleVisited={toggleVisited} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground font-body">No cafes found. Try a different search or location.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
