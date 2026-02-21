import { useState, useEffect } from "react";
import { Armchair, Volume2, Wifi, Laptop } from "lucide-react";
import { useAmbienceRatings, AmbienceRating } from "@/hooks/useAmbienceRatings";
import { toast } from "@/hooks/use-toast";

const labels: Record<string, string[]> = {
  seating: ["Very Limited", "Limited", "Moderate", "Spacious", "Very Spacious"],
  loudness: ["Very Quiet", "Quiet", "Moderate", "Loud", "Very Loud"],
  wifi_speed: ["None", "Slow", "Okay", "Fast", "Very Fast"],
};

function RatingDots({
  value,
  max = 5,
  onChange,
  editable,
}: {
  value: number;
  max?: number;
  onChange?: (v: number) => void;
  editable: boolean;
}) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }, (_, i) => (
        <button
          key={i}
          disabled={!editable}
          onClick={() => onChange?.(i + 1)}
          className={`w-2.5 h-2.5 rounded-full transition-colors ${
            i < Math.round(value)
              ? "bg-primary"
              : "bg-muted-foreground/20"
          } ${editable ? "cursor-pointer hover:bg-primary/60" : "cursor-default"}`}
        />
      ))}
    </div>
  );
}

interface CafeAmbienceProps {
  cafeId: string;
}

const CafeAmbience = ({ cafeId }: CafeAmbienceProps) => {
  const { averages, userRating, submitRating, isSubmitting, isLoggedIn } = useAmbienceRatings(cafeId);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<AmbienceRating>({
    seating: 3,
    loudness: 3,
    wifi_speed: 3,
    laptop_friendly: true,
  });

  useEffect(() => {
    if (userRating) {
      setDraft(userRating);
    }
  }, [userRating]);

  const handleSubmit = () => {
    submitRating(draft, {
      onSuccess: () => {
        setEditing(false);
        toast({ title: "Thanks!", description: "Your ambience rating has been saved." });
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to save rating.", variant: "destructive" });
      },
    });
  };

  const displayData = editing ? draft : {
    seating: averages.seating,
    loudness: averages.loudness,
    wifi_speed: averages.wifi_speed,
    laptop_friendly: averages.laptop_friendly_pct >= 50,
  };

  const items = [
    { key: "seating" as const, icon: Armchair, label: "Seating" },
    { key: "loudness" as const, icon: Volume2, label: "Loudness" },
    { key: "wifi_speed" as const, icon: Wifi, label: "Wifi Speed" },
  ];

  return (
    <div>
      <h2 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
        <Armchair className="w-5 h-5 text-primary" />
        Cafe Ambience
      </h2>
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        {items.map(({ key, icon: Icon, label }) => (
          <div key={key} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-body text-foreground">{label}</span>
            </div>
            <div className="flex items-center gap-2">
              <RatingDots
                value={displayData[key]}
                editable={editing}
                onChange={(v) => setDraft((d) => ({ ...d, [key]: v }))}
              />
              {!editing && averages.total_ratings > 0 && (
                <span className="text-xs font-body text-muted-foreground w-7 text-right">
                  {labels[key][Math.round(averages[key]) - 1] ?? ""}
                </span>
              )}
            </div>
          </div>
        ))}

        {/* Laptop Friendly */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Laptop className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-body text-foreground">Laptop Friendly</span>
          </div>
          {editing ? (
            <button
              onClick={() => setDraft((d) => ({ ...d, laptop_friendly: !d.laptop_friendly }))}
              className={`text-xs font-body font-medium px-3 py-1 rounded-full transition-colors ${
                draft.laptop_friendly
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {draft.laptop_friendly ? "Yes" : "No"}
            </button>
          ) : (
            <span className={`text-xs font-body font-medium px-3 py-1 rounded-full ${
              averages.total_ratings > 0 && averages.laptop_friendly_pct >= 50
                ? "bg-primary/20 text-primary"
                : "bg-muted text-muted-foreground"
            }`}>
              {averages.total_ratings > 0
                ? `${averages.laptop_friendly_pct}% say yes`
                : "No data yet"}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="pt-2 border-t border-border flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-body">
            {averages.total_ratings > 0
              ? `Based on ${averages.total_ratings} rating${averages.total_ratings !== 1 ? "s" : ""}`
              : "No ratings yet"}
          </span>
          {editing ? (
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(false)}
                className="text-xs font-body text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="text-xs font-body font-medium text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save"}
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                if (!isLoggedIn) {
                  toast({ title: "Sign in required", description: "Please sign in to rate cafe ambience." });
                  return;
                }
                setEditing(true);
              }}
              className="text-xs font-body font-medium text-primary hover:text-primary/80 transition-colors"
            >
              {userRating ? "Update Rating" : "Rate Ambience"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CafeAmbience;
