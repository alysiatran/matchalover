import { Heart, CheckCircle } from "lucide-react";
import { useSavedCafes } from "@/hooks/useSavedCafes";
import { useVisitedCafes } from "@/hooks/useVisitedCafes";
import { useCafes } from "@/hooks/useCafes";
import { useLocation } from "@/hooks/useLocation";
import { useAuth } from "@/hooks/useAuth";
import CafeCard from "@/components/CafeCard";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const Saved = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { savedIds, isSaved, toggleSave, isLoading: savedLoading } = useSavedCafes();
  const { visitedIds, isVisited, toggleVisited, isToggling: visitedToggling } = useVisitedCafes();
  const { location } = useLocation();
  const { data: allCafes = [] } = useCafes(location);

  const savedCafes = allCafes.filter((c) => savedIds.includes(c.id));
  const visitedCafes = allCafes.filter((c) => visitedIds.includes(c.id));

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-24 pt-14">
        <div className="px-5 space-y-5">
          <h1 className="font-display text-2xl font-bold text-foreground">Saved</h1>
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-matcha-light flex items-center justify-center mb-4">
              <Heart className="w-7 h-7 text-primary" />
            </div>
            <h2 className="font-display text-lg font-semibold text-foreground">Sign in to save cafes</h2>
            <p className="text-sm text-muted-foreground font-body mt-2 max-w-[250px]">
              Create an account to save your favorite cafes.
            </p>
            <button
              onClick={() => navigate("/auth")}
              className="mt-4 px-6 py-2.5 bg-primary text-primary-foreground rounded-full font-body font-semibold text-sm"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 pt-14">
      <div className="px-5 space-y-5">
        <h1 className="font-display text-2xl font-bold text-foreground">Saved</h1>

        <Tabs defaultValue="saved">
          <TabsList className="w-full">
            <TabsTrigger value="saved" className="flex-1 gap-1.5">
              <Heart className="w-3.5 h-3.5" />
              Saved
              {savedCafes.length > 0 && (
                <span className="ml-1 text-xs bg-primary/15 text-primary rounded-full px-1.5 py-0.5 font-semibold">
                  {savedCafes.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="visited" className="flex-1 gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              Visited
              {visitedCafes.length > 0 && (
                <span className="ml-1 text-xs bg-primary/15 text-primary rounded-full px-1.5 py-0.5 font-semibold">
                  {visitedCafes.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="saved" className="mt-4">
            {savedLoading ? (
              <p className="text-center text-muted-foreground font-body py-12">Loading…</p>
            ) : savedCafes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedCafes.map((cafe, i) => (
                  <CafeCard
                    key={cafe.id}
                    cafe={cafe}
                    index={i}
                    isSaved={isSaved(cafe.id)}
                    onToggleSave={toggleSave}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-matcha-light flex items-center justify-center mb-4">
                  <Heart className="w-7 h-7 text-primary" />
                </div>
                <h2 className="font-display text-lg font-semibold text-foreground">No saved cafes yet</h2>
                <p className="text-sm text-muted-foreground font-body mt-2 max-w-[250px]">
                  Tap the heart icon on any cafe to save it for later.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="visited" className="mt-4">
            {visitedCafes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {visitedCafes.map((cafe, i) => (
                  <CafeCard
                    key={cafe.id}
                    cafe={cafe}
                    index={i}
                    isSaved={isSaved(cafe.id)}
                    onToggleSave={toggleSave}
                    isVisited={isVisited(cafe.id)}
                    onToggleVisited={toggleVisited}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-matcha-light flex items-center justify-center mb-4">
                  <CheckCircle className="w-7 h-7 text-primary" />
                </div>
                <h2 className="font-display text-lg font-semibold text-foreground">No visited cafes yet</h2>
                <p className="text-sm text-muted-foreground font-body mt-2 max-w-[250px]">
                  Tap the checkmark icon on any cafe to mark it as visited.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Saved;
