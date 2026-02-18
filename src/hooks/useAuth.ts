import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  email: string | null;
  business_name: string | null;
  phone: string | null;
  approved: boolean;
}

interface CafeOwnership {
  cafe_id: string;
  approved: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ownedCafes, setOwnedCafes] = useState<CafeOwnership[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Defer profile fetch to avoid deadlock
          setTimeout(() => fetchProfile(session.user.id), 0);
        } else {
          setProfile(null);
          setOwnedCafes([]);
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    try {
      const [profileRes, ownerRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", userId).single(),
        supabase.from("cafe_owners").select("cafe_id, approved").eq("user_id", userId),
      ]);

      if (profileRes.data) setProfile(profileRes.data as unknown as Profile);
      if (ownerRes.data) setOwnedCafes(ownerRes.data);
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  }

  async function signUp(email: string, password: string, displayName: string, businessName?: string) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: window.location.origin,
      },
    });
    return { error };
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function claimCafe(cafeId: string) {
    const { error } = await supabase.from("cafe_owners").insert({
      user_id: user!.id,
      cafe_id: cafeId,
    });
    if (!error) {
      setOwnedCafes((prev) => [...prev, { cafe_id: cafeId, approved: false }]);
    }
    return { error };
  }

  const isApprovedOwner = (cafeId: string) =>
    ownedCafes.some((o) => o.cafe_id === cafeId && o.approved);

  return {
    user,
    session,
    profile,
    ownedCafes,
    loading,
    signUp,
    signIn,
    signOut,
    claimCafe,
    isApprovedOwner,
  };
}
