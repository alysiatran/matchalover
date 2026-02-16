import cafe1 from "@/assets/cafe-1.jpg";
import cafe2 from "@/assets/cafe-2.jpg";
import cafe3 from "@/assets/cafe-3.jpg";
import cafe4 from "@/assets/cafe-4.jpg";
import cafe5 from "@/assets/cafe-5.jpg";
import cafe6 from "@/assets/cafe-6.jpg";

export interface MenuItem {
  name: string;
  price: string;
  description?: string;
}

export interface MenuCategory {
  category: string;
  items: MenuItem[];
}

export interface MatchaPowder {
  origin: string;
  grade: string;
  flavorNotes: string[];
  body: string;
  finish: string;
}

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
  matchaPowder: MatchaPowder;
  menu: MenuCategory[];
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
    matchaPowder: { origin: "Uji, Kyoto", grade: "Ceremonial", flavorNotes: ["Umami", "Sweet", "Creamy"], body: "Full & velvety", finish: "Lingering sweetness" },
    hours: "7:00 AM – 5:00 PM",
    priceRange: "$$",
    menu: [
      { category: "Matcha Drinks", items: [
        { name: "Ceremonial Matcha Bowl", price: "$6", description: "Stone-ground Uji matcha, whisked to order" },
        { name: "Matcha Latte", price: "$5.50", description: "Oat or whole milk" },
        { name: "Iced Matcha Americano", price: "$5", description: "Matcha shot over ice water" },
      ]},
      { category: "Pastries", items: [
        { name: "Matcha Scone", price: "$4" },
        { name: "Black Sesame Mochi", price: "$3.50" },
      ]},
    ],
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
    matchaPowder: { origin: "Nishio, Aichi", grade: "Premium", flavorNotes: ["Vegetal", "Nutty", "Grassy"], body: "Medium & smooth", finish: "Clean, slightly astringent" },
    hours: "7:30 AM – 7:00 PM",
    priceRange: "$",
    menu: [
      { category: "Matcha Drinks", items: [
        { name: "Classic Matcha Latte", price: "$5", description: "Oat, almond, or coconut milk" },
        { name: "Lavender Matcha", price: "$6", description: "House lavender syrup with matcha" },
        { name: "Matcha Horchata", price: "$6.50" },
      ]},
      { category: "Vegan Bites", items: [
        { name: "Matcha Banana Bread", price: "$4.50" },
        { name: "Bliss Ball Trio", price: "$5" },
      ]},
    ],
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
    matchaPowder: { origin: "Kagoshima", grade: "Ceremonial A", flavorNotes: ["Earthy", "Rich", "Chocolate"], body: "Dense & bold", finish: "Deep roasted undertone" },
    hours: "9:00 AM – 8:00 PM",
    priceRange: "$$$",
    menu: [
      { category: "Matcha Drinks", items: [
        { name: "Premium Matcha Latte", price: "$7", description: "Single-origin Kagoshima matcha" },
        { name: "Matcha Espresso Fusion", price: "$7.50" },
      ]},
      { category: "Desserts", items: [
        { name: "Matcha Mochi Waffle", price: "$12", description: "Signature crispy mochi waffle with matcha cream" },
        { name: "Matcha Tiramisu", price: "$10" },
        { name: "Houjicha Crème Brûlée", price: "$9" },
      ]},
    ],
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
    matchaPowder: { origin: "Uji, Kyoto", grade: "Ceremonial", flavorNotes: ["Umami", "Floral", "Buttery"], body: "Silky & delicate", finish: "Elegant, long-lasting sweetness" },
    hours: "10:00 AM – 5:00 PM",
    priceRange: "$$",
    menu: [
      { category: "Tea Ceremony", items: [
        { name: "Full Tea Ceremony", price: "$18", description: "Includes wagashi and two bowls of matcha" },
        { name: "Koicha (Thick Matcha)", price: "$8" },
        { name: "Usucha (Thin Matcha)", price: "$6" },
      ]},
      { category: "Wagashi", items: [
        { name: "Seasonal Mochi Set", price: "$7" },
        { name: "Dorayaki", price: "$4.50" },
      ]},
    ],
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
    matchaPowder: { origin: "Shizuoka", grade: "Premium", flavorNotes: ["Bright", "Vegetal", "Citrus"], body: "Light & crisp", finish: "Refreshing, clean bite" },
    hours: "8:00 AM – 9:00 PM",
    priceRange: "$$",
    menu: [
      { category: "Signature Drinks", items: [
        { name: "Matcha Espresso Tonic", price: "$7", description: "Matcha shot, espresso, tonic water" },
        { name: "Yuzu Matcha Fizz", price: "$6.50" },
        { name: "Dirty Matcha", price: "$6", description: "Matcha latte with a shot of espresso" },
      ]},
      { category: "Classics", items: [
        { name: "Usucha Bowl", price: "$5" },
        { name: "Iced Matcha Latte", price: "$5.50" },
      ]},
    ],
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
    matchaPowder: { origin: "Yame, Fukuoka", grade: "Culinary+", flavorNotes: ["Nutty", "Earthy", "Toasty"], body: "Robust & hearty", finish: "Warm, roasted grain notes" },
    hours: "7:00 AM – 8:00 PM",
    priceRange: "$",
    menu: [
      { category: "Iced Matcha", items: [
        { name: "Classic Iced Matcha", price: "$5", description: "Choice of oat, almond, or coconut milk" },
        { name: "Strawberry Matcha", price: "$6" },
        { name: "Mango Matcha Smoothie", price: "$7" },
      ]},
      { category: "Snacks", items: [
        { name: "Matcha Soft Serve", price: "$5" },
        { name: "Rice Crispy Treat", price: "$3" },
      ]},
    ],
  },
];

export const categories = ["All", "Nearby", "Top Rated", "Traditional", "Modern", "Desserts"];
