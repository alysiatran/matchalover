import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useSavedCafes() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: savedIds = [], isLoading } = useQuery<string[]>({
    queryKey: ["saved-cafes", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("saved_cafes")
        .select("cafe_id")
        .eq("user_id", user.id);
      if (error) throw error;
      return (data || []).map((r: any) => r.cafe_id);
    },
    enabled: !!user,
  });

  const toggleSave = useMutation({
    mutationFn: async (cafeId: string) => {
      if (!user) throw new Error("Must be logged in");
      const isSaved = savedIds.includes(cafeId);
      if (isSaved) {
        const { error } = await supabase
          .from("saved_cafes")
          .delete()
          .eq("user_id", user.id)
          .eq("cafe_id", cafeId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("saved_cafes")
          .insert({ user_id: user.id, cafe_id: cafeId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-cafes", user?.id] });
    },
  });

  return {
    savedIds,
    isLoading,
    isSaved: (cafeId: string) => savedIds.includes(cafeId),
    toggleSave: toggleSave.mutate,
    isToggling: toggleSave.isPending,
  };
}
