import { useState, useMemo } from "react";
import { useCafes } from "@/hooks/useCafes";
import { useEvents } from "@/hooks/useEvents";
import SearchBar from "@/components/SearchBar";
import CafeCard from "@/components/CafeCard";
import EventCard from "@/components/EventCard";

type Tab = "cafes" | "events";

const Explore = () => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("cafes");
  const { data: cafes = [] } = useCafes();
  const { data: events = [], isLoading: eventsLoading } = useEvents();

  const filteredCafes = useMemo(() => {
    // Deduplicate by name (keep highest rated)
    const seen = new Map<string, typeof cafes[0]>();
    for (const c of cafes) {
      const key = c.name.toLowerCase();
      const existing = seen.get(key);
      if (!existing || c.rating > existing.rating) seen.set(key, c);
    }
    let result = Array.from(seen.values());

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q)) ||
          c.address.toLowerCase().includes(q)
      );
    }
    return result;
  }, [search, cafes]);

  const filteredEvents = useMemo(() => {
    // Deduplicate events by title + venue
    const seen = new Map<string, typeof events[0]>();
    for (const e of events) {
      const key = `${e.title.toLowerCase()}|${e.venue.toLowerCase()}`;
      if (!seen.has(key)) seen.set(key, e);
    }
    let result = Array.from(seen.values());

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          (e.cafe_name || "").toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q) ||
          e.tags.some((t) => t.toLowerCase().includes(q)) ||
          (e.description || "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [search, events]);

  return (
    <div className="min-h-screen bg-background pb-24 pt-14">
      <div className="px-5 space-y-5">
        <h1 className="font-display text-2xl font-bold text-foreground">Explore</h1>
        <SearchBar value={search} onChange={setSearch} />

        {/* Tab bar */}
        <div className="flex rounded-xl bg-muted p-1">
          <button
            onClick={() => setActiveTab("cafes")}
            className={`flex-1 py-2.5 text-sm font-body font-semibold rounded-lg transition-all ${
              activeTab === "cafes"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Cafes
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={`flex-1 py-2.5 text-sm font-body font-semibold rounded-lg transition-all ${
              activeTab === "events"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Events
          </button>
        </div>

        {/* Content */}
        {activeTab === "cafes" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredCafes.map((cafe, i) => (
                <CafeCard key={cafe.id} cafe={cafe} index={i} />
              ))}
            </div>
            {filteredCafes.length === 0 && (
              <p className="text-center text-muted-foreground font-body py-12">No cafes found.</p>
            )}
          </>
        )}

        {activeTab === "events" && (
          <>
            {eventsLoading ? (
              <p className="text-center text-muted-foreground font-body py-12">Loading events…</p>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredEvents.map((event, i) => (
                    <EventCard key={event.id} event={event} index={i} />
                  ))}
                </div>
                {filteredEvents.length === 0 && (
                  <p className="text-center text-muted-foreground font-body py-12">
                    No events found. Check back soon!
                  </p>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Explore;
