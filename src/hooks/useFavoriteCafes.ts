import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

const GUEST_FAVORITE_KEY = "guest_favorite_cafes";

function getGuestFavorites(): string[] {
  try {
    return JSON.parse(localStorage.getItem(GUEST_FAVORITE_KEY) || "[]");
  } catch {
    return [];
  }
}

function setGuestFavorites(ids: string[]) {
  localStorage.setItem(GUEST_FAVORITE_KEY, JSON.stringify(ids));
}

export function useFavoriteCafes() {
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [guestFavorites, setGuestFavoritesState] = useState<string[]>(getGuestFavorites);
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

  const { data: favoriteIds = [] } = useQuery<string[]>({
    queryKey: ["favorite-cafes", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("favorite_cafes")
        .select("cafe_id")
        .eq("user_id", userId);
      if (error) throw error;
      return (data || []).map((r: any) => r.cafe_id);
    },
    enabled: !!userId,
  });

  const effectiveFavoriteIds = userId ? favoriteIds : guestFavorites;

  const toggleFavorite = useMutation({
    mutationFn: async (cafeId: string) => {
      if (!userId) {
        const current = getGuestFavorites();
        const isFav = current.includes(cafeId);
        const updated = isFav ? current.filter((id) => id !== cafeId) : [...current, cafeId];
        setGuestFavorites(updated);
        setGuestFavoritesState(updated);
        return;
      }
      const isFav = favoriteIds.includes(cafeId);
      if (isFav) {
        const { error } = await supabase
          .from("favorite_cafes")
          .delete()
          .eq("user_id", userId)
          .eq("cafe_id", cafeId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("favorite_cafes")
          .insert({ user_id: userId, cafe_id: cafeId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ["favorite-cafes", userId] });
      }
    },
    onError: (error) => {
      console.error("Favorite toggle error:", error);
    },
  });

  return {
    favoriteIds: effectiveFavoriteIds,
    isFavorite: (cafeId: string) => effectiveFavoriteIds.includes(cafeId),
    toggleFavorite: toggleFavorite.mutate,
    isToggling: toggleFavorite.isPending,
    isGuest: authLoaded && !userId,
  };
}
