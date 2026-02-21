import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export interface AmbienceRating {
  seating: number;
  loudness: number;
  wifi_speed: number;
  laptop_friendly: boolean;
}

export interface AmbienceAverages {
  seating: number;
  loudness: number;
  wifi_speed: number;
  laptop_friendly_pct: number;
  total_ratings: number;
}

export function useAmbienceRatings(cafeId: string) {
  const [userId, setUserId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const { data: averages } = useQuery<AmbienceAverages>({
    queryKey: ["ambience-averages", cafeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cafe_ambience_ratings")
        .select("seating, loudness, wifi_speed, laptop_friendly")
        .eq("cafe_id", cafeId);
      if (error) throw error;
      if (!data || data.length === 0) {
        // Placeholder data until real ratings come in
        return { seating: 3, loudness: 2, wifi_speed: 4, laptop_friendly_pct: 72, total_ratings: 0 };
      }
      const n = data.length;
      return {
        seating: Math.round((data.reduce((s, r) => s + r.seating, 0) / n) * 10) / 10,
        loudness: Math.round((data.reduce((s, r) => s + r.loudness, 0) / n) * 10) / 10,
        wifi_speed: Math.round((data.reduce((s, r) => s + r.wifi_speed, 0) / n) * 10) / 10,
        laptop_friendly_pct: Math.round((data.filter((r) => r.laptop_friendly).length / n) * 100),
        total_ratings: n,
      };
    },
  });

  const { data: userRating } = useQuery<AmbienceRating | null>({
    queryKey: ["ambience-user", cafeId, userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("cafe_ambience_ratings")
        .select("seating, loudness, wifi_speed, laptop_friendly")
        .eq("cafe_id", cafeId)
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const submitRating = useMutation({
    mutationFn: async (rating: AmbienceRating) => {
      if (!userId) throw new Error("Must be logged in");
      const { error } = await supabase
        .from("cafe_ambience_ratings")
        .upsert(
          { user_id: userId, cafe_id: cafeId, ...rating },
          { onConflict: "user_id,cafe_id" }
        );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ambience-averages", cafeId] });
      queryClient.invalidateQueries({ queryKey: ["ambience-user", cafeId, userId] });
    },
  });

  return {
    averages: averages ?? { seating: 0, loudness: 0, wifi_speed: 0, laptop_friendly_pct: 0, total_ratings: 0 },
    userRating,
    submitRating: submitRating.mutate,
    isSubmitting: submitRating.isPending,
    isLoggedIn: !!userId,
  };
}
