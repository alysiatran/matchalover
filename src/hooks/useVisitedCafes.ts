import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

const GUEST_VISITED_KEY = "guest_visited_cafes";

function getGuestVisited(): string[] {
  try {
    return JSON.parse(localStorage.getItem(GUEST_VISITED_KEY) || "[]");
  } catch {
    return [];
  }
}

function setGuestVisited(ids: string[]) {
  localStorage.setItem(GUEST_VISITED_KEY, JSON.stringify(ids));
}

export function useVisitedCafes() {
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [guestVisited, setGuestVisitedState] = useState<string[]>(getGuestVisited);
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

  const { data: visitedIds = [] } = useQuery<string[]>({
    queryKey: ["visited-cafes", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("visited_cafes")
        .select("cafe_id")
        .eq("user_id", userId);
      if (error) throw error;
      return (data || []).map((r: any) => r.cafe_id);
    },
    enabled: !!userId,
  });

  // Merge: authenticated users use DB, guests use localStorage
  const effectiveVisitedIds = userId ? visitedIds : guestVisited;

  const toggleVisited = useMutation({
    mutationFn: async (cafeId: string) => {
      if (!userId) {
        // Guest mode: toggle in localStorage
        const current = getGuestVisited();
        const isVisited = current.includes(cafeId);
        const updated = isVisited
          ? current.filter((id) => id !== cafeId)
          : [...current, cafeId];
        setGuestVisited(updated);
        setGuestVisitedState(updated);
        return;
      }
      const isVisited = visitedIds.includes(cafeId);
      if (isVisited) {
        const { error } = await supabase
          .from("visited_cafes")
          .delete()
          .eq("user_id", userId)
          .eq("cafe_id", cafeId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("visited_cafes")
          .insert({ user_id: userId, cafe_id: cafeId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ["visited-cafes", userId] });
      }
    },
    onError: (error) => {
      console.error("Visited toggle error:", error);
    },
  });

  return {
    visitedIds: effectiveVisitedIds,
    isVisited: (cafeId: string) => effectiveVisitedIds.includes(cafeId),
    toggleVisited: toggleVisited.mutate,
    isToggling: toggleVisited.isPending,
    isGuest: authLoaded && !userId,
  };
}
