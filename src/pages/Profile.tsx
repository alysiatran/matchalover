import { User, Settings, MapPin, Star, Store, ShieldCheck, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useVisitedCafes } from "@/hooks/useVisitedCafes";
import { useSavedCafes } from "@/hooks/useSavedCafes";
import { useFavoriteCafes } from "@/hooks/useFavoriteCafes";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

const Profile = () => {
  const { user, profile, loading } = useAuth();
  const { visitedIds, isGuest } = useVisitedCafes();
  const { savedIds } = useSavedCafes();
  const { favoriteIds } = useFavoriteCafes();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .then(({ data }) => setIsAdmin(!!(data && data.length > 0)));
    }
  }, [user]);

  if (isGuest) {
    return (
      <div className="min-h-screen bg-background pb-24 pt-14">
        <div className="px-5 space-y-6">
          <h1 className="font-display text-2xl font-bold text-foreground">Profile</h1>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
              <User className="w-7 h-7 text-muted-foreground" />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground">Guest</h2>
              <p className="text-sm text-muted-foreground font-body">Browsing without an account</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Visited", value: visitedIds.length.toString(), icon: MapPin },
              { label: "Favorites", value: favoriteIds.length.toString(), icon: Star },
              { label: "Saved", value: savedIds.length.toString(), icon: Settings },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-card rounded-2xl p-4 border border-border text-center">
                <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="font-display text-xl font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground font-body">{label}</p>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-primary/8 border border-primary/20 text-sm font-body">
            <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <p className="text-muted-foreground">
              You're in guest mode. Your saves & visits are stored locally on this device only.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate("/auth")}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-body font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Create Account
            </button>
            <button
              onClick={() => navigate("/auth")}
              className="w-full py-3 rounded-xl border border-border text-foreground font-body text-sm hover:bg-secondary transition-colors"
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
      <div className="px-5 space-y-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Profile</h1>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-matcha-light flex items-center justify-center">
            <User className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">
              {profile?.display_name || "Matcha Lover"}
            </h2>
            <p className="text-sm text-muted-foreground font-body">
              {profile?.email || "San Francisco, CA"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Visited", value: visitedIds.length.toString(), icon: MapPin },
            { label: "Favorites", value: favoriteIds.length.toString(), icon: Star },
            { label: "Saved", value: savedIds.length.toString(), icon: Settings },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="bg-card rounded-2xl p-4 border border-border text-center"
            >
              <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="font-display text-xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground font-body">{label}</p>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <button
            onClick={() => navigate(user ? "/dashboard" : "/auth")}
            className="w-full text-left px-4 py-3.5 rounded-xl bg-primary/10 border border-primary/20 font-body text-sm text-primary font-semibold hover:bg-primary/15 transition-colors flex items-center gap-2"
          >
            <Store className="w-4 h-4" />
            {user ? "Business Dashboard" : "Business Owner? Sign in"}
          </button>

          {isAdmin && (
            <button
              onClick={() => navigate("/admin")}
              className="w-full text-left px-4 py-3.5 rounded-xl bg-destructive/10 border border-destructive/20 font-body text-sm text-destructive font-semibold hover:bg-destructive/15 transition-colors flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              Admin Panel
            </button>
          )}

          <button
            onClick={() => navigate("/edit-profile")}
            className="w-full text-left px-4 py-3.5 rounded-xl bg-card border border-border font-body text-sm text-foreground hover:bg-secondary transition-colors"
          >
            Edit Profile
          </button>
          {["Help & Support"].map((item) => (
            <button
              key={item}
              className="w-full text-left px-4 py-3.5 rounded-xl bg-card border border-border font-body text-sm text-foreground hover:bg-secondary transition-colors"
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
