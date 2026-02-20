import type { Recipe } from "@/components/RecipeCard";

export const recipes: Recipe[] = [
  {
    id: "1",
    title: "The Perfect Matcha Latte",
    description:
      "A beginner-friendly matcha latte recipe that's creamy, smooth, and perfectly balanced. No clumps, no bitterness — just pure matcha bliss.",
    prepTime: "5 min",
    servings: "1 serving",
    difficulty: "Easy",
    ingredients: [
      "1–2 tsp ceremonial grade matcha powder",
      "2 oz hot water (175°F / 80°C — not boiling)",
      "8 oz milk of your choice",
      "Sweetener to taste (optional)",
    ],
    steps: [
      "Sift 1–2 tsp of matcha into a bowl or cup to remove clumps.",
      "Add 2 oz of hot water (not boiling — around 175°F).",
      "Whisk vigorously with a chasen (bamboo whisk) or milk frother until smooth and frothy.",
      "Heat and froth your milk separately.",
      "Pour the frothed milk over the matcha shot. Sweeten if desired. Enjoy!",
    ],
    tags: ["Beginner", "Latte", "Hot or Iced"],
    videoUrl: "https://www.youtube.com/shorts/9V714VOJ3NY",
  },
];
