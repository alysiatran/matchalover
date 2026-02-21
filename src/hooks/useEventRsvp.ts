import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useEventRsvp(eventId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: count = 0 } = useQuery({
    queryKey: ["event-rsvp-count", eventId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("event_rsvps")
        .select("*", { count: "exact", head: true })
        .eq("event_id", eventId);
      if (error) throw error;
      return count ?? 0;
    },
  });

  const { data: isGoing = false } = useQuery({
    queryKey: ["event-rsvp-mine", eventId, user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data, error } = await supabase
        .from("event_rsvps")
        .select("id")
        .eq("event_id", eventId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
    enabled: !!user,
  });

  const toggle = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not logged in");
      if (isGoing) {
        const { error } = await supabase
          .from("event_rsvps")
          .delete()
          .eq("event_id", eventId)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("event_rsvps")
          .insert({ event_id: eventId, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-rsvp-count", eventId] });
      queryClient.invalidateQueries({ queryKey: ["event-rsvp-mine", eventId, user?.id] });
    },
  });

  return { count, isGoing, toggle: toggle.mutate, isLoading: toggle.isPending, user };
}
