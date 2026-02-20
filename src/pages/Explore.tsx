import { useState, useMemo } from "react";
import { useEvents } from "@/hooks/useEvents";
import { useLocation } from "@/hooks/useLocation";
import SearchBar from "@/components/SearchBar";
import EventCard from "@/components/EventCard";
import RecipeCard from "@/components/RecipeCard";
import LocationPicker from "@/components/LocationPicker";
import CommunityFeed from "@/components/CommunityFeed";
import ChatRooms from "@/components/ChatRooms";
import { recipes } from "@/data/recipes";

type Tab = "events" | "recipes" | "community" | "chat";

const Explore = () => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("events");
  const { location, setLocation } = useLocation();
  const { data: events = [], isLoading: eventsLoading } = useEvents();

  const filteredEvents = useMemo(() => {
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
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-foreground">Explore</h1>
          <LocationPicker location={location} onLocationChange={setLocation} variant="inline" />
        </div>
        <SearchBar value={search} onChange={setSearch} />

        {/* Tab bar */}
        <div className="flex rounded-xl bg-muted p-1">
          {(["events", "recipes", "community", "chat"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 text-sm font-body font-semibold rounded-lg transition-all capitalize ${
                activeTab === tab
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
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

        {activeTab === "recipes" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recipes.map((recipe, i) => (
              <RecipeCard key={recipe.id} recipe={recipe} index={i} />
            ))}
          </div>
        )}

        {activeTab === "community" && <CommunityFeed />}

        {activeTab === "chat" && <ChatRooms />}
      </div>
    </div>
  );
};

export default Explore;
