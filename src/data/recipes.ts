import type { Recipe } from "@/components/RecipeCard";

export const recipes: Recipe[] = [
  {
    id: "1",
    title: "Classic Matcha Latte",
    description:
      "A simple, beginner-friendly matcha latte with the perfect ratio of matcha, water, and milk.",
    prepTime: "3 min",
    servings: "1 serving",
    difficulty: "Easy",
    ingredients: [
      "3g matcha powder",
      "30ml hot water (175°F / 80°C)",
      "80ml milk of your choice",
    ],
    steps: [
      "Sift 3g of matcha powder into a bowl or cup.",
      "Add 30ml of hot water (not boiling).",
      "Whisk until smooth and frothy.",
      "Heat or froth 80ml of milk and pour over the matcha. Enjoy!",
    ],
    tags: ["Beginner", "Latte", "Hot or Iced"],
    videoUrl: "https://www.youtube.com/shorts/9V714VOJ3NY",
  },
];
