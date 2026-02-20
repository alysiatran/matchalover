import { Heart } from "lucide-react";
import { useSavedCafes } from "@/hooks/useSavedCafes";
import { useCafes } from "@/hooks/useCafes";
import { useLocation } from "@/hooks/useLocation";
import { useAuth } from "@/hooks/useAuth";
import CafeCard from "@/components/CafeCard";
import { useNavigate } from "react-router-dom";

const Saved = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { savedIds, isSaved, toggleSave, isLoading } = useSavedCafes();
  const { location } = useLocation();
  const { data: allCafes = [] } = useCafes(location);

  const savedCafes = allCafes.filter((c) => savedIds.includes(c.id));

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

        {isLoading ? (
          <p className="text-center text-muted-foreground font-body py-12">Loading…</p>
        ) : savedCafes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {savedCafes.map((cafe, i) => (
              <CafeCard key={cafe.id} cafe={cafe} index={i} isSaved={isSaved(cafe.id)} onToggleSave={toggleSave} />
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
      </div>
    </div>
  );
};

export default Saved;
