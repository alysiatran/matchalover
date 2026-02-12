import { useState, useMemo } from "react";
import { cafes } from "@/data/cafes";
import SearchBar from "@/components/SearchBar";
import CafeCard from "@/components/CafeCard";

const Explore = () => {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return cafes;
    const q = search.toLowerCase();
    return cafes.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q)) ||
        c.address.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="min-h-screen bg-background pb-24 pt-14">
      <div className="px-5 space-y-5">
        <h1 className="font-display text-2xl font-bold text-foreground">Explore</h1>
        <SearchBar value={search} onChange={setSearch} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((cafe, i) => (
            <CafeCard key={cafe.id} cafe={cafe} index={i} />
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground font-body py-12">No results found.</p>
        )}
      </div>
    </div>
  );
};

export default Explore;
