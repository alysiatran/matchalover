import { useMemo } from "react";
import type { Cafe } from "@/data/cafes";

/**
 * Score cafes by similarity to the user's favorited cafes.
 * Factors: shared tags, same matcha origin/grade, rating boost.
 */
export function useRecommendedCafes(
  allCafes: Cafe[],
  favoriteIds: string[],
  limit = 6
): Cafe[] {
  return useMemo(() => {
    if (favoriteIds.length === 0 || allCafes.length === 0) return [];

    const favCafes = allCafes.filter((c) => favoriteIds.includes(c.id));
    if (favCafes.length === 0) return [];

    // Build a profile from favorites
    const tagCounts = new Map<string, number>();
    const origins = new Set<string>();
    const grades = new Set<string>();

    for (const fav of favCafes) {
      for (const tag of fav.tags) {
        const t = tag.toLowerCase();
        tagCounts.set(t, (tagCounts.get(t) || 0) + 1);
      }
      if (fav.matchaPowder?.origin) origins.add(fav.matchaPowder.origin.toLowerCase());
      if (fav.matchaPowder?.grade) grades.add(fav.matchaPowder.grade.toLowerCase());
    }

    // Score non-favorited cafes
    const candidates = allCafes.filter((c) => !favoriteIds.includes(c.id));

    const scored = candidates.map((cafe) => {
      let score = 0;

      // Tag overlap (weighted by frequency in favorites)
      for (const tag of cafe.tags) {
        const t = tag.toLowerCase();
        if (tagCounts.has(t)) {
          score += tagCounts.get(t)! * 2;
        }
      }

      // Matcha origin match
      if (cafe.matchaPowder?.origin && origins.has(cafe.matchaPowder.origin.toLowerCase())) {
        score += 3;
      }

      // Matcha grade match
      if (cafe.matchaPowder?.grade && grades.has(cafe.matchaPowder.grade.toLowerCase())) {
        score += 2;
      }

      // Small rating bonus
      score += (cafe.rating || 0) * 0.5;

      return { cafe, score };
    });

    return scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((s) => s.cafe);
  }, [allCafes, favoriteIds, limit]);
}
