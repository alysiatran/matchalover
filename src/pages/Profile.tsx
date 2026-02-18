import { User, Settings, MapPin, Star, Store } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Profile = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

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
            { label: "Visited", value: "12", icon: MapPin },
            { label: "Reviews", value: "8", icon: Star },
            { label: "Saved", value: "5", icon: Settings },
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
          {/* Business owner link */}
          <button
            onClick={() => navigate(user ? "/dashboard" : "/auth")}
            className="w-full text-left px-4 py-3.5 rounded-xl bg-primary/10 border border-primary/20 font-body text-sm text-primary font-semibold hover:bg-primary/15 transition-colors flex items-center gap-2"
          >
            <Store className="w-4 h-4" />
            {user ? "Business Dashboard" : "Business Owner? Sign in"}
          </button>

          {["Edit Profile", "Notifications", "Preferences", "Help & Support"].map((item) => (
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
