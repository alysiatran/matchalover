import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";

export function useSavedCafes() {
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

  const toggleSave = useMutation({
    mutationFn: async (cafeId: string) => {
      if (!userId) {
        toast({ title: "Sign in to save cafes", description: "Create an account or sign in first.", variant: "destructive" });
        throw new Error("Must be logged in");
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
      queryClient.invalidateQueries({ queryKey: ["saved-cafes", userId] });
    },
    onError: (error) => {
      console.error("Save toggle error:", error);
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
