import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cafes as fallbackCafes, type Cafe } from "@/data/cafes";
import cafe1 from "@/assets/cafe-1.jpg";
import cafe2 from "@/assets/cafe-2.jpg";
import cafe3 from "@/assets/cafe-3.jpg";
import cafe4 from "@/assets/cafe-4.jpg";
import cafe5 from "@/assets/cafe-5.jpg";
import cafe6 from "@/assets/cafe-6.jpg";

const images = [cafe1, cafe2, cafe3, cafe4, cafe5, cafe6];

async function fetchCafes(): Promise<Cafe[]> {
  const { data, error } = await supabase.functions.invoke("scrape-cafes");

  if (error) {
    console.error("Edge function error:", error);
    throw error;
  }

  if (!data?.success || !data?.cafes?.length) {
    throw new Error("No cafes returned");
  }

  console.log("Scraped cafes:", data.cafes.map((c: Cafe) => c.name));

  return data.cafes.slice(0, 6).map((cafe: Cafe, i: number) => ({
    ...cafe,
    id: String(i + 1),
    image: images[i] || images[0],
  }));
}

export function useCafes() {
  return useQuery<Cafe[]>({
    queryKey: ["cafes-seattle"],
    queryFn: fetchCafes,
    staleTime: 1000 * 60 * 30, // 30 min cache
    placeholderData: fallbackCafes,
    retry: 1,
  });
}
