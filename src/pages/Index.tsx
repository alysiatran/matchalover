import { useState, useMemo } from "react";
import { MapPin } from "lucide-react";
import { cafes, categories } from "@/data/cafes";
import SearchBar from "@/components/SearchBar";
import CategoryChips from "@/components/CategoryChips";
import CafeCard from "@/components/CafeCard";
import heroImage from "@/assets/matcha-hero.jpg";

const Index = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = useMemo(() => {
    let result = cafes;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (activeCategory === "Nearby") {
      result = [...result].sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
    } else if (activeCategory === "Top Rated") {
      result = [...result].sort((a, b) => b.rating - a.rating);
    } else if (activeCategory !== "All") {
      result = result.filter((c) =>
        c.tags.some((t) => t.toLowerCase() === activeCategory.toLowerCase())
      );
    }
    return result;
  }, [search, activeCategory]);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={heroImage}
          alt="Matcha latte"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/20 to-background" />
        <div className="absolute bottom-6 left-5 right-5">
          <h1 className="font-display text-3xl font-bold text-primary-foreground drop-shadow-lg">
            Matcha Moments
          </h1>
          <div className="flex items-center gap-1 mt-1 text-primary-foreground/80">
            <MapPin className="w-3.5 h-3.5" />
            <span className="text-sm font-body">San Francisco, CA</span>
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
            <CafeCard key={cafe.id} cafe={cafe} index={i} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground font-body">No cafes found. Try a different search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
