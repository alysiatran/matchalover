import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Review {
  id: string;
  cafe_id: string;
  user_id: string;
  rating: number;
  content: string | null;
  photos: string[];
  created_at: string;
  updated_at: string;
  display_name?: string;
}

async function fetchReviews(cafeId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from("cafe_reviews")
    .select("*")
    .eq("cafe_id", cafeId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  // Fetch display names for review authors
  const userIds = [...new Set((data || []).map((r) => r.user_id))];
  let profileMap: Record<string, string> = {};
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name")
      .in("user_id", userIds);
    if (profiles) {
      profileMap = Object.fromEntries(profiles.map((p) => [p.user_id, p.display_name || "Anonymous"]));
    }
  }

  return (data || []).map((r) => ({
    ...r,
    photos: r.photos || [],
    display_name: profileMap[r.user_id] || "Matcha Lover",
  }));
}

async function uploadPhotos(userId: string, cafeId: string, files: File[]): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    const ext = file.name.split(".").pop();
    const path = `${userId}/${cafeId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("review-photos").upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from("review-photos").getPublicUrl(path);
    urls.push(data.publicUrl);
  }
  return urls;
}

export function useReviews(cafeId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const query = useQuery<Review[]>({
    queryKey: ["cafe-reviews", cafeId],
    queryFn: () => fetchReviews(cafeId),
    enabled: !!cafeId,
  });

  const userReview = query.data?.find((r) => r.user_id === user?.id);

  const submitReview = useMutation({
    mutationFn: async ({ rating, content, photos }: { rating: number; content: string; photos: File[] }) => {
      if (!user) throw new Error("Must be logged in");

      let photoUrls: string[] = [];
      if (photos.length > 0) {
        photoUrls = await uploadPhotos(user.id, cafeId, photos);
      }

      const { error } = await supabase.from("cafe_reviews").upsert(
        {
          cafe_id: cafeId,
          user_id: user.id,
          rating,
          content: content || null,
          photos: [...(userReview?.photos || []), ...photoUrls],
        },
        { onConflict: "cafe_id,user_id" }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cafe-reviews", cafeId] });
    },
  });

  const deleteReview = useMutation({
    mutationFn: async () => {
      if (!user || !userReview) throw new Error("No review to delete");
      const { error } = await supabase.from("cafe_reviews").delete().eq("id", userReview.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cafe-reviews", cafeId] });
    },
  });

  return { reviews: query.data || [], isLoading: query.isLoading, userReview, submitReview, deleteReview };
}
