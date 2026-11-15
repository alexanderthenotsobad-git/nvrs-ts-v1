import type { MenuItem } from "@/types/menu";

export type MenuCategory = "small" | "mains" | "sweets" | "drinks";

export interface Dish extends MenuItem {
  category: MenuCategory;
  image: string;
  tags: string[];
  featured?: boolean;
  rating?: number;
  badge?: string;
}

export const categories: Array<{
  id: "all" | MenuCategory;
  label: string;
  note: string;
}> = [
  { id: "all", label: "Everything", note: "The whole table" },
  { id: "small", label: "Small plates", note: "To share" },
  { id: "mains", label: "Mains", note: "From the fire" },
  { id: "sweets", label: "Sweets", note: "Save room" },
  { id: "drinks", label: "Drinks", note: "Low & no" },
];

export const dishes: Dish[] = [
  {
    item_id: 1,
    item_name: "Heirloom Tomato Salad",
    item_desc:
      "Sun-warm tomatoes, avocado, chickpeas, radish, and a bright citrus vinaigrette.",
    price: 15,
    item_type: "small",
    category: "small",
    image: "/images/heirloom-tomatoes.jpg",
    tags: ["Vegan", "GF"],
    featured: true,
    rating: 4.8,
    badge: "Market pick",
  },
  {
    item_id: 2,
    item_name: "Charred Street Corn",
    item_desc:
      "Grilled corn, lime crema, cotija, arbol chili, and crushed corn nuts.",
    price: 11,
    item_type: "small",
    category: "small",
    image: "/images/street-corn.jpg",
    tags: ["Vegetarian", "GF", "Spicy"],
    rating: 4.7,
  },
  {
    item_id: 3,
    item_name: "Crispy Calamari",
    item_desc:
      "Lemon, marinara, and house aioli. The plate everyone reaches across the table for.",
    price: 14,
    item_type: "small",
    category: "small",
    image: "/menu/calamari.jpg",
    tags: ["Pescatarian"],
    rating: 4.6,
  },
  {
    item_id: 4,
    item_name: "Loaded Nachos",
    item_desc:
      "Aged cheddar, pickled jalapeño, crema, pico de gallo, and a lot of napkins.",
    price: 12,
    item_type: "small",
    category: "small",
    image: "/menu/nachos.jpg",
    tags: ["Vegetarian"],
    rating: 4.5,
  },
  {
    item_id: 5,
    item_name: "Hummus & Warm Pita",
    item_desc:
      "Smoked paprika, olive oil, sesame, and crunchy crudités for scooping.",
    price: 10,
    item_type: "small",
    category: "small",
    image: "/menu/hummus.jpg",
    tags: ["Vegan"],
    rating: 4.4,
  },
  {
    item_id: 6,
    item_name: "Buffalo Wings",
    item_desc:
      "Crispy wings tossed in house buffalo, with ranch and celery. Order two.",
    price: 14,
    item_type: "small",
    category: "small",
    image: "/menu/buffalo-wings.jpg",
    tags: ["GF", "Spicy"],
    rating: 4.8,
  },
  {
    item_id: 7,
    item_name: "Cacio e Pepe",
    item_desc:
      "Hand-rolled tonnarelli, pecorino romano, and black pepper from a heavy hand.",
    price: 22,
    item_type: "mains",
    category: "mains",
    image: "/images/cacio-e-pepe.jpg",
    tags: ["Vegetarian"],
    featured: true,
    rating: 4.9,
    badge: "Most loved",
  },
  {
    item_id: 8,
    item_name: "Margherita Pizza",
    item_desc:
      "San Marzano tomato, fior di latte, basil, and a 48-hour wood-fired crust.",
    price: 19,
    item_type: "mains",
    category: "mains",
    image: "/images/margherita.jpg",
    tags: ["Vegetarian"],
    featured: true,
    rating: 4.8,
  },
  {
    item_id: 9,
    item_name: "VRS Smash Burger",
    item_desc:
      "Two patties, American cheese, pickles, charred onion, and house sauce on a potato bun.",
    price: 18,
    item_type: "mains",
    category: "mains",
    image: "/images/smash-burger.jpg",
    tags: [],
    rating: 4.7,
  },
  {
    item_id: 10,
    item_name: "Cedar-Roasted Salmon",
    item_desc:
      "Spring peas, salsa verde, and a charred lemon. Clean, bright, and gone quickly.",
    price: 29,
    item_type: "mains",
    category: "mains",
    image: "/menu/smoked-salmon.jpg",
    tags: ["GF", "DF"],
    featured: true,
    rating: 4.9,
    badge: "Chef's pick",
  },
  {
    item_id: 11,
    item_name: "Dry-Aged Ribeye",
    item_desc:
      "16 oz, bone marrow butter, watercress, and crispy potatoes. Built for sharing.",
    price: 42,
    item_type: "mains",
    category: "mains",
    image: "/images/ribeye.jpg",
    tags: ["GF"],
    rating: 4.8,
  },
  {
    item_id: 12,
    item_name: "Seared Tuna Steak",
    item_desc:
      "Sesame crust, ginger, and greens. Seared rare unless you say otherwise.",
    price: 26,
    item_type: "mains",
    category: "mains",
    image: "/menu/seared-tuna.jpg",
    tags: ["Pescatarian", "GF"],
    rating: 4.6,
  },
  {
    item_id: 13,
    item_name: "Shrimp Scampi",
    item_desc:
      "Butter, garlic, lemon, parsley, and bread for the sauce. Do not skip the bread.",
    price: 24,
    item_type: "mains",
    category: "mains",
    image: "/menu/shrimp-scampi.jpg",
    tags: ["Pescatarian"],
    rating: 4.5,
  },
  {
    item_id: 14,
    item_name: "Olive Oil Cake",
    item_desc:
      "Whipped mascarpone, raspberries, pistachio, and a little citrus zest.",
    price: 10,
    item_type: "sweets",
    category: "sweets",
    image: "/images/olive-oil-cake.jpg",
    tags: ["Vegetarian"],
    rating: 4.7,
  },
  {
    item_id: 15,
    item_name: "Chocolate Cake",
    item_desc:
      "Dark chocolate, salted caramel, and crème fraîche. A very serious slice.",
    price: 9,
    item_type: "sweets",
    category: "sweets",
    image: "/menu/chocolate-cake.jpg",
    tags: ["Vegetarian"],
    rating: 4.8,
  },
  {
    item_id: 16,
    item_name: "Blood Orange Spritz",
    item_desc:
      "Blood orange, zero-proof aperitivo, rosemary, and soda. All the ceremony, none of the proof.",
    price: 13,
    item_type: "drinks",
    category: "drinks",
    image: "/images/blood-orange-spritz.jpg",
    tags: ["Vegan", "GF"],
    rating: 4.7,
  },
  {
    item_id: 17,
    item_name: "Cold Beer",
    item_desc:
      "A rotating local lager, poured cold and served in a heavy glass.",
    price: 8,
    item_type: "drinks",
    category: "drinks",
    image: "/beer.jpg",
    tags: ["Vegan"],
    rating: 4.5,
  },

];

export const featuredDishes = dishes.filter((dish) => dish.featured);

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: price % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(price);
}
