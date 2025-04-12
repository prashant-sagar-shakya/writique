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
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  author: Author;
  imageUrl: string;
  content: string; // Changed from optional to required
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

export const allBlogs: Blog[] = [
  {
    id: "1",
    title: "The Future of Artificial Intelligence",
    excerpt:
      "Exploring how AI will transform society in the coming decade and what challenges we might face.",
    date: "2025-03-27",
    readTime: "5 min read",
    category: "Technology",
    author: {
      name: "Alex Johnson",
      avatar: "https://i.pravatar.cc/150?img=1",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1674027444485-cec3da58eef4?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    content: "This is the full content for the AI blog post...", // Ensure content exists
  },
  {
    id: "2",
    title: "Exploring Hidden Gems of Japan",
    excerpt:
      "A journey through less-known but breathtaking locations in Japan that tourists often miss.",
    date: "2025-03-24",
    readTime: "7 min read",
    category: "Travel",
    author: {
      name: "Emily Chen",
      avatar: "https://i.pravatar.cc/150?img=5",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3",
    content: "This is the full content for the Japan travel blog post...", // Ensure content exists
  },
  {
    id: "3",
    title: "The Science of Perfect Coffee",
    excerpt:
      "Understanding the chemistry behind brewing the perfect cup of coffee at home.",
    date: "2025-03-20",
    readTime: "4 min read",
    category: "Food",
    author: {
      name: "Mark Wilson",
      avatar: "https://i.pravatar.cc/150?img=8",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.0.3",
    content: "This is the full content for the coffee science blog post...", // Ensure content exists
  },
  {
    id: "4",
    title: "Modern Web Development Techniques",
    excerpt:
      "A comprehensive look at the latest tools and methodologies in web development.",
    date: "2025-03-18",
    readTime: "8 min read",
    category: "Code",
    author: {
      name: "Sarah Park",
      avatar: "https://i.pravatar.cc/150?img=9",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3",
    content: "This is the full content for the web dev blog post...", // Ensure content exists
  },
  {
    id: "5",
    title: "Contemporary Art Movements",
    excerpt:
      "Exploring the diverse landscape of contemporary art and emerging artists.",
    date: "2025-03-15",
    readTime: "6 min read",
    category: "Art",
    author: {
      name: "David Lopez",
      avatar: "https://i.pravatar.cc/150?img=11",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1501084817091-a4f3d1d19e07?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3",
    content: "This is the full content for the art movements blog post...", // Ensure content exists
  },
  {
    id: "6",
    title: "The Evolution of Electronic Music",
    excerpt:
      "Tracing the history and impact of electronic music from its origins to today.",
    date: "2025-03-12",
    readTime: "7 min read",
    category: "Music",
    author: {
      name: "Lisa Thompson",
      avatar: "https://i.pravatar.cc/150?img=3",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3",
    content: "This is the full content for the electronic music blog post...", // Ensure content exists
  },
  {
    id: "7",
    title: "Sustainable Fashion Trends",
    excerpt:
      "How eco-friendly practices are reshaping the fashion industry for the better.",
    date: "2025-03-10",
    readTime: "5 min read",
    category: "Fashion",
    author: {
      name: "Michael Brown",
      avatar: "https://i.pravatar.cc/150?img=4",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3",
    content: "This is the full content for the fashion trends blog post...", // Ensure content exists
  },
  {
    id: "8",
    title: "Global Cinema Renaissance",
    excerpt:
      "Examining the revival of independent filmmaking across different cultures.",
    date: "2025-03-08",
    readTime: "6 min read",
    category: "Movies",
    author: {
      name: "Jennifer Adams",
      avatar: "https://i.pravatar.cc/150?img=6",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3",
    content: "This is the full content for the global cinema blog post...", // Ensure content exists
  },
  {
    id: "9",
    title: "Digital Minimalism",
    excerpt:
      "How reducing digital clutter can improve your focus and mental well-being.",
    date: "2025-03-05",
    readTime: "4 min read",
    category: "Lifestyle",
    author: {
      name: "Ryan Garcia",
      avatar: "https://i.pravatar.cc/150?img=7",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1607703703520-bb638e84caf2?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3",
    content: "This is the full content for the digital minimalism blog post...", // Ensure content exists
  },
  {
    id: "10",
    title: "Books That Changed History",
    excerpt:
      "A deep dive into literary works that shaped our understanding of the world.",
    date: "2025-03-02",
    readTime: "9 min read",
    category: "Books",
    author: {
      name: "Rachel Kim",
      avatar: "https://i.pravatar.cc/150?img=10",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3",
    content: "This is the full content for the books history blog post...", // Ensure content exists
  },
];

export const featuredBlogs: Blog[] = [allBlogs[0], allBlogs[1], allBlogs[2]];

export const relatedBlogs: Blog[] = [allBlogs[3], allBlogs[4], allBlogs[5]];
