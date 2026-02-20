import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";

const GUEST_SAVED_KEY = "guest_saved_cafes";

function getGuestSaved(): string[] {
  try {
    return JSON.parse(localStorage.getItem(GUEST_SAVED_KEY) || "[]");
  } catch {
    return [];
  }
}

function setGuestSaved(ids: string[]) {
  localStorage.setItem(GUEST_SAVED_KEY, JSON.stringify(ids));
}

export function useSavedCafes() {
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [guestSaved, setGuestSavedState] = useState<string[]>(getGuestSaved);
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
      setAuthLoaded(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
      setAuthLoaded(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const { data: savedIds = [], isLoading } = useQuery<string[]>({
    queryKey: ["saved-cafes", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("saved_cafes")
        .select("cafe_id")
        .eq("user_id", userId);
      if (error) throw error;
      return (data || []).map((r: any) => r.cafe_id);
    },
    enabled: !!userId,
  });

  // Merge: authenticated users use DB, guests use localStorage
  const effectiveSavedIds = userId ? savedIds : guestSaved;

  const toggleSave = useMutation({
    mutationFn: async (cafeId: string) => {
      if (!userId) {
        // Guest mode: toggle in localStorage
        const current = getGuestSaved();
        const isSaved = current.includes(cafeId);
        const updated = isSaved
          ? current.filter((id) => id !== cafeId)
          : [...current, cafeId];
        setGuestSaved(updated);
        setGuestSavedState(updated);
        return;
      }
      const isSaved = savedIds.includes(cafeId);
      if (isSaved) {
        const { error } = await supabase
          .from("saved_cafes")
          .delete()
          .eq("user_id", userId)
          .eq("cafe_id", cafeId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("saved_cafes")
          .insert({ user_id: userId, cafe_id: cafeId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ["saved-cafes", userId] });
      }
    },
    onError: (error) => {
      console.error("Save toggle error:", error);
    },
  });

  return {
    savedIds: effectiveSavedIds,
    isLoading: !authLoaded || (!!userId && isLoading),
    isSaved: (cafeId: string) => effectiveSavedIds.includes(cafeId),
    toggleSave: toggleSave.mutate,
    isToggling: toggleSave.isPending,
    isGuest: authLoaded && !userId,
  };
}
