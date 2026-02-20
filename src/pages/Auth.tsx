import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Leaf, ArrowLeft } from "lucide-react";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [accountType, setAccountType] = useState<"user" | "business">("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (isSignUp) {
      const { error } = await signUp(email, password, displayName, accountType === "business" ? businessName : undefined);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Check your email to confirm your account!");
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error.message);
      } else {
        navigate("/profile");
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background pb-24 pt-14">
      <div className="px-5 space-y-8 max-w-md mx-auto">
        <button onClick={() => navigate(-1)} className="text-muted-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-matcha-light flex items-center justify-center mx-auto">
            <Leaf className="w-7 h-7 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            {isSignUp ? "Create Account" : "Sign In"}
          </h1>
          <p className="text-sm text-muted-foreground font-body">
            {isSignUp
              ? "Join the Matcha Guide community"
              : "Welcome back to Matcha Guide"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <>
              {/* Account type toggle */}
              <div className="flex gap-2 p-1 bg-secondary rounded-xl">
                <button
                  type="button"
                  onClick={() => setAccountType("user")}
                  className={`flex-1 py-2 text-sm font-body font-semibold rounded-lg transition-colors ${
                    accountType === "user"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  Matcha Lover
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType("business")}
                  className={`flex-1 py-2 text-sm font-body font-semibold rounded-lg transition-colors ${
                    accountType === "business"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  Business Owner
                </button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName" className="font-body text-sm">Your Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Jane Doe"
                  required
                  className="rounded-xl"
                />
              </div>
              {accountType === "business" && (
                <div className="space-y-2">
                  <Label htmlFor="businessName" className="font-body text-sm">Business Name</Label>
                  <Input
                    id="businessName"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Matcha Magic"
                    className="rounded-xl"
                  />
                </div>
              )}
            </>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="font-body text-sm">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@yourcafe.com"
              required
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="font-body text-sm">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="rounded-xl"
            />
          </div>

          <Button type="submit" disabled={submitting} className="w-full rounded-xl font-body">
            {submitting ? "Please wait…" : isSignUp ? "Create Account" : "Sign In"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground font-body">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-primary font-semibold hover:underline"
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
