import cafe1 from "@/assets/cafe-1.jpg";
import cafe2 from "@/assets/cafe-2.jpg";
import cafe3 from "@/assets/cafe-3.jpg";
import cafe4 from "@/assets/cafe-4.jpg";
import cafe5 from "@/assets/cafe-5.jpg";
import cafe6 from "@/assets/cafe-6.jpg";

export interface Cafe {
  id: string;
  name: string;
  image: string;
  rating: number;
  reviews: number;
  distance: string;
  address: string;
  tags: string[];
  description: string;
  hours: string;
  priceRange: string;
}

export const cafes: Cafe[] = [
  {
    id: "1",
    name: "Matcha Magic",
    image: cafe1,
    rating: 4.8,
    reviews: 312,
    distance: "0.3 mi",
    address: "1st Ave, Pike Place Market",
    tags: ["Ceremonial", "Organic"],
    description: "A serene matcha bar tucked inside Pike Place Market, sourcing ceremonial-grade powder directly from Uji, Kyoto.",
    hours: "7:00 AM – 5:00 PM",
    priceRange: "$$",
  },
  {
    id: "2",
    name: "Maru Matcha",
    image: cafe2,
    rating: 4.7,
    reviews: 245,
    distance: "0.5 mi",
    address: "412 Broadway E, Capitol Hill",
    tags: ["Cozy", "Plant-based"],
    description: "A plant-filled Capitol Hill gem offering creative matcha lattes and vegan pastries in a warm, minimalist space.",
    hours: "7:30 AM – 7:00 PM",
    priceRange: "$",
  },
  {
    id: "3",
    name: "Midori Café",
    image: cafe3,
    rating: 4.9,
    reviews: 389,
    distance: "1.1 mi",
    address: "601 S Jackson St, International District",
    tags: ["Desserts", "Modern"],
    description: "Where traditional matcha meets modern patisserie. Known for their matcha mochi waffles and seasonal specials.",
    hours: "9:00 AM – 8:00 PM",
    priceRange: "$$$",
  },
  {
    id: "4",
    name: "Zen Garden Tea",
    image: cafe4,
    rating: 4.6,
    reviews: 178,
    distance: "1.8 mi",
    address: "5520 University Way NE, U-District",
    tags: ["Traditional", "Garden"],
    description: "A tranquil tea house near UW campus offering authentic Japanese tea ceremonies and stone-ground matcha bowls.",
    hours: "10:00 AM – 5:00 PM",
    priceRange: "$$",
  },
  {
    id: "5",
    name: "Ocha Bar",
    image: cafe5,
    rating: 4.5,
    reviews: 298,
    distance: "0.4 mi",
    address: "2030 Westlake Ave, South Lake Union",
    tags: ["Trendy", "Specialty"],
    description: "A sleek SLU matcha bar serving creative concoctions from classic usucha to matcha espresso tonics.",
    hours: "8:00 AM – 9:00 PM",
    priceRange: "$$",
  },
  {
    id: "6",
    name: "Green Fog",
    image: cafe6,
    rating: 4.4,
    reviews: 210,
    distance: "0.9 mi",
    address: "3401 Fremont Ave N, Fremont",
    tags: ["Iced Drinks", "Casual"],
    description: "Fremont's go-to for iced matcha creations with oat, almond, and coconut milk. Perfect for PNW summer days.",
    hours: "7:00 AM – 8:00 PM",
    priceRange: "$",
  },
];

export const categories = ["All", "Nearby", "Top Rated", "Traditional", "Modern", "Desserts"];
