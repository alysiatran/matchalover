import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cafes as fallbackCafes, type Cafe } from "@/data/cafes";

async function fetchCafes(): Promise<Cafe[]> {
  const { data, error } = await supabase.functions.invoke("scrape-cafes");

  if (error) {
    console.error("Edge function error:", error);
    throw error;
  }

  if (!data?.success || !data?.cafes?.length) {
    throw new Error("No cafes returned");
  }

  // Map scraped data to our Cafe interface, assigning local images
  const images = await Promise.all(
    Array.from({ length: 6 }, (_, i) =>
      import(`@/assets/cafe-${i + 1}.jpg`).then((m) => m.default)
    )
  );

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
