import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface MatchaEvent {
  id: string;
  title: string;
  description: string | null;
  cafe_name: string | null;
  venue: string;
  address: string | null;
  event_date: string | null;
  event_end_date: string | null;
  event_time: string | null;
  tags: string[];
  price: string | null;
  url: string | null;
  image_url: string | null;
  source: string | null;
  created_at: string;
}

async function fetchEvents(): Promise<MatchaEvent[]> {
  const { data, error } = await supabase
    .from("matcha_events")
    .select("*")
    .order("event_date", { ascending: true });

  if (error) {
    console.error("Events fetch error:", error);
    throw error;
  }

  return (data as unknown as MatchaEvent[]) || [];
}

export function useEvents() {
  const queryClient = useQueryClient();

  const query = useQuery<MatchaEvent[]>({
    queryKey: ["matcha-events"],
    queryFn: fetchEvents,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  // Trigger background scrape for events
  useEffect(() => {
    const lastScrape = localStorage.getItem("lastEventsScrapeTime");
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    if (!lastScrape || now - parseInt(lastScrape) > oneHour) {
      localStorage.setItem("lastEventsScrapeTime", String(now));
      supabase.functions.invoke("scrape-events").then(({ error }) => {
        if (error) {
          console.error("Events scrape error:", error);
        } else {
          console.log("Events scrape complete, refreshing");
          queryClient.invalidateQueries({ queryKey: ["matcha-events"] });
        }
      });
    }
  }, [queryClient]);

  return query;
}
