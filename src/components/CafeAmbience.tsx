import { useState, useEffect } from "react";
import { Armchair, Volume2, Wifi, Laptop, ChevronDown, ChevronUp } from "lucide-react";
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
  activeColor = "bg-primary",
}: {
  value: number;
  max?: number;
  onChange?: (v: number) => void;
  editable: boolean;
  activeColor?: string;
}) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }, (_, i) => (
        <button
          key={i}
          disabled={!editable}
          onClick={() => onChange?.(i + 1)}
          className={`w-2.5 h-2.5 rounded-full transition-colors ${
            i < Math.round(value) ? activeColor : "bg-muted-foreground/20"
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
  const [showMyRating, setShowMyRating] = useState(false);
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
        setShowMyRating(false);
        toast({ title: "Thanks!", description: "Your ambience rating has been saved." });
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to save rating.", variant: "destructive" });
      },
    });
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

      <div className="bg-card rounded-xl border border-border p-4 space-y-4">
        {/* Community Averages - always visible */}
        <div className="space-y-3">
          <p className="text-xs font-body text-muted-foreground uppercase tracking-wide">
            Community Average
            <span className="normal-case tracking-normal ml-1">
              · {averages.total_ratings > 0
                ? `${averages.total_ratings} rating${averages.total_ratings !== 1 ? "s" : ""}`
                : "Estimated"}
            </span>
          </p>
          {items.map(({ key, icon: Icon, label }) => (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-body text-foreground">{label}</span>
              </div>
              <div className="flex items-center gap-2">
                <RatingDots value={averages[key]} editable={false} />
                {averages.total_ratings > 0 && (
                  <span className="text-xs font-body text-muted-foreground min-w-[70px] text-right">
                    {labels[key][Math.round(averages[key]) - 1] ?? ""}
                  </span>
                )}
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Laptop className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-body text-foreground">Laptop Friendly</span>
            </div>
            <span className={`text-xs font-body font-medium px-3 py-1 rounded-full ${
              averages.total_ratings > 0 && averages.laptop_friendly_pct >= 50
                ? "bg-primary/20 text-primary"
                : "bg-muted text-muted-foreground"
            }`}>
              {averages.total_ratings > 0
                ? `${averages.laptop_friendly_pct}% say yes`
                : "No data yet"}
            </span>
          </div>
        </div>

        {/* Your Rating - expandable */}
        <div className="border-t border-border pt-3">
          <button
            onClick={() => {
              if (!isLoggedIn) {
                toast({ title: "Sign in required", description: "Please sign in to rate cafe ambience." });
                return;
              }
              setShowMyRating(!showMyRating);
            }}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="text-xs font-body font-medium text-primary">
              {userRating ? "Your Rating" : "Rate This Cafe"}
            </span>
            {showMyRating ? (
              <ChevronUp className="w-4 h-4 text-primary" />
            ) : (
              <ChevronDown className="w-4 h-4 text-primary" />
            )}
          </button>

          {showMyRating && (
            <div className="mt-3 space-y-3 animate-fade-up">
              {items.map(({ key, icon: Icon, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-body text-foreground">{label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RatingDots
                      value={draft[key]}
                      editable={true}
                      activeColor="bg-amber-500"
                      onChange={(v) => setDraft((d) => ({ ...d, [key]: v }))}
                    />
                    <span className="text-xs font-body text-muted-foreground min-w-[70px] text-right">
                      {labels[key][draft[key] - 1] ?? ""}
                    </span>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-body text-foreground">Laptop Friendly</span>
                </div>
                <button
                  onClick={() => setDraft((d) => ({ ...d, laptop_friendly: !d.laptop_friendly }))}
                  className={`text-xs font-body font-medium px-3 py-1 rounded-full transition-colors ${
                    draft.laptop_friendly
                      ? "bg-amber-500/20 text-amber-600"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {draft.laptop_friendly ? "Yes" : "No"}
                </button>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => setShowMyRating(false)}
                  className="text-xs font-body text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="text-xs font-body font-medium bg-primary text-primary-foreground px-4 py-1.5 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : userRating ? "Update" : "Submit"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CafeAmbience;
