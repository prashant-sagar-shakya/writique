import {
  BookMarked,
  Code,
  Coffee,
  Film,
  Globe,
  Laptop,
  Music,
  Palette,
  ShoppingBag,
  Utensils,
  type LucideIcon,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
}

export interface Author {
  name: string;
  avatar: string;
}

export interface Blog {
  id: string;
  _id?: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  author: Author;
  imageUrl: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

export const categories: Category[] = [
  { id: "1", name: "Technology", icon: Laptop },
  { id: "2", name: "Travel", icon: Globe },
  { id: "3", name: "Food", icon: Utensils },
  { id: "4", name: "Art", icon: Palette },
  { id: "5", name: "Music", icon: Music },
  { id: "6", name: "Books", icon: BookMarked },
  { id: "7", name: "Code", icon: Code },
  { id: "8", name: "Lifestyle", icon: Coffee },
  { id: "9", name: "Movies", icon: Film },
  { id: "10", name: "Fashion", icon: ShoppingBag },
];
