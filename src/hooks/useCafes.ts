import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cafes as fallbackCafes, type Cafe } from "@/data/cafes";
import cafe1 from "@/assets/cafe-1.jpg";
import cafe2 from "@/assets/cafe-2.jpg";
import cafe3 from "@/assets/cafe-3.jpg";
import cafe4 from "@/assets/cafe-4.jpg";
import cafe5 from "@/assets/cafe-5.jpg";
import cafe6 from "@/assets/cafe-6.jpg";
import { useEffect } from "react";

const images = [cafe1, cafe2, cafe3, cafe4, cafe5, cafe6];

interface DbCafe {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviews: number;
  distance: string;
  tags: string[];
  description: string;
  hours: string;
  price_range: string;
  matcha_origin: string;
  matcha_grade: string;
  matcha_flavor_notes: string[];
  matcha_body: string;
  matcha_finish: string;
  matcha_grams: string | null;
  menu: any[];
  photo_url: string | null;
  photos: string[] | null;
  created_at: string;
}

function isGoodPhoto(url: string): boolean {
  const lower = url.toLowerCase();
  const reject = ['logo', 'icon', 'avatar', 'favicon', 'placeholder', 'badge', 'sprite', 'pixel', 'widget', 'social', 'button', 'arrow', 'chevron', 'emoji', '1x1'];
  if (reject.some(p => lower.includes(p))) return false;
  if (lower.endsWith('.svg')) return false;
  return true;
}

function mapDbCafe(row: DbCafe, index: number): Cafe {
  return {
    id: row.id,
    name: row.name,
    image: row.photo_url && isGoodPhoto(row.photo_url) ? row.photo_url : images[index % images.length],
    photos: (row.photos || []).filter(isGoodPhoto),
    rating: row.rating,
    reviews: row.reviews,
    distance: row.distance,
    address: row.address,
    tags: row.tags || [],
    description: row.description,
    hours: row.hours,
    priceRange: row.price_range,
    matchaPowder: {
      origin: row.matcha_origin,
      grade: row.matcha_grade,
      flavorNotes: row.matcha_flavor_notes || [],
      body: row.matcha_body,
      finish: row.matcha_finish,
      grams: (row.matcha_grams && row.matcha_grams !== 'unknown') ? row.matcha_grams : undefined,
    },
    menu: row.menu || [],
  };
}

/** Extract city keywords from a location string like "Seattle, WA" or "98101" */
function locationToFilter(location: string): string {
  // If it looks like a zip code, use as-is
  if (/^\d{5}(-\d{4})?$/.test(location.trim())) return location.trim();
  // Take the city part (before comma)
  const city = location.split(",")[0].trim();
  return city;
}

async function fetchCafesFromDb(location: string): Promise<Cafe[]> {
  const filter = locationToFilter(location);

  const { data, error } = await supabase
    .from("cafes")
    .select("*")
    .ilike("address", `%${filter}%`)
    .order("rating", { ascending: false });

  if (error) {
    console.error("DB fetch error:", error);
    throw error;
  }

  if (!data || data.length === 0) {
    throw new Error(`No cafes found for "${location}"`);
  }

  return (data as unknown as DbCafe[]).map(mapDbCafe);
}

export function useCafes(location: string = "Seattle, WA") {
  const queryClient = useQueryClient();

  const query = useQuery<Cafe[]>({
    queryKey: ["cafes", location],
    queryFn: () => fetchCafesFromDb(location),
    staleTime: 1000 * 60 * 5,
    placeholderData: fallbackCafes,
    retry: 1,
  });

  // Trigger a background scrape for the current location
  useEffect(() => {
    const scrapeKey = `lastScrapeTime_${location}`;
    const lastScrape = localStorage.getItem(scrapeKey);
    const now = Date.now();
    const thirtyMinutes = 30 * 60 * 1000;

    if (!lastScrape || now - parseInt(lastScrape) > thirtyMinutes) {
      localStorage.setItem(scrapeKey, String(now));
      supabase.functions.invoke("scrape-cafes", {
        body: { location },
      }).then(({ error }) => {
        if (error) {
          console.error("Background scrape error:", error);
        } else {
          console.log("Background scrape complete for", location);
          queryClient.invalidateQueries({ queryKey: ["cafes", location] });
        }
      });
    }
  }, [queryClient, location]);

  return query;
}
