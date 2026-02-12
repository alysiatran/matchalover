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
    name: "Zen Matcha House",
    image: cafe1,
    rating: 4.8,
    reviews: 234,
    distance: "0.3 mi",
    address: "123 Cherry Blossom Lane",
    tags: ["Ceremonial", "Organic"],
    description: "A serene space dedicated to the art of matcha. Sourcing directly from Uji, Kyoto, every bowl is whisked with intention.",
    hours: "8:00 AM – 6:00 PM",
    priceRange: "$$",
  },
  {
    id: "2",
    name: "The Green Room",
    image: cafe2,
    rating: 4.6,
    reviews: 189,
    distance: "0.7 mi",
    address: "456 Garden Street",
    tags: ["Cozy", "Plant-based"],
    description: "A plant-filled haven offering creative matcha drinks and vegan pastries in a warm, inviting atmosphere.",
    hours: "7:30 AM – 7:00 PM",
    priceRange: "$",
  },
  {
    id: "3",
    name: "Matcha & Cake",
    image: cafe3,
    rating: 4.9,
    reviews: 312,
    distance: "1.2 mi",
    address: "789 Dessert Avenue",
    tags: ["Desserts", "Modern"],
    description: "Where traditional matcha meets modern patisserie. Known for their matcha tiramisu and seasonal specialties.",
    hours: "9:00 AM – 8:00 PM",
    priceRange: "$$$",
  },
  {
    id: "4",
    name: "Bamboo Tea Garden",
    image: cafe4,
    rating: 4.7,
    reviews: 156,
    distance: "1.8 mi",
    address: "321 Tranquil Path",
    tags: ["Traditional", "Garden"],
    description: "Step into a traditional Japanese tea garden. Experience authentic tea ceremonies in a peaceful bamboo setting.",
    hours: "10:00 AM – 5:00 PM",
    priceRange: "$$",
  },
  {
    id: "5",
    name: "Match Bar",
    image: cafe5,
    rating: 4.5,
    reviews: 278,
    distance: "0.5 mi",
    address: "654 Modern Street",
    tags: ["Trendy", "Specialty"],
    description: "A sleek, modern matcha bar serving creative concoctions from classic lattes to matcha cocktails.",
    hours: "8:00 AM – 10:00 PM",
    priceRange: "$$",
  },
  {
    id: "6",
    name: "Iced & Stoned",
    image: cafe6,
    rating: 4.4,
    reviews: 198,
    distance: "0.9 mi",
    address: "987 Cool Boulevard",
    tags: ["Iced Drinks", "Casual"],
    description: "Specializing in iced matcha creations with oat, almond, and coconut milk options. Perfect for warm days.",
    hours: "7:00 AM – 9:00 PM",
    priceRange: "$",
  },
];

export const categories = ["All", "Nearby", "Top Rated", "Traditional", "Modern", "Desserts"];
