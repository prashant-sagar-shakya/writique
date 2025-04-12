import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Filter,
  Heart,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { allBlogs, categories } from "@/lib/blog-data";
import { Separator } from "@/components/ui/separator";
import { SignedIn } from "@clerk/clerk-react";
import { useToast } from "@/components/ui/use-toast";

const BlogsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "";

  const [blogs, setBlogs] = useState(allBlogs);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState("newest");

  const { toast } = useToast();

  useEffect(() => {
    document.title = "Writique - All Blogs";

    // Filter and sort blogs
    let filteredBlogs = [...allBlogs];

    // Apply category filter
    if (selectedCategory) {
      filteredBlogs = filteredBlogs.filter(
        (blog) => blog.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Apply search filter
    if (searchTerm) {
      filteredBlogs = filteredBlogs.filter(
        (blog) =>
          blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    if (sortBy === "newest") {
      filteredBlogs.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    } else if (sortBy === "oldest") {
      filteredBlogs.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    }

    setBlogs(filteredBlogs);
  }, [searchTerm, selectedCategory, sortBy]);

  useEffect(() => {
    if (selectedCategory) {
      setSearchParams({ category: selectedCategory });
    } else {
      setSearchParams({});
    }
  }, [selectedCategory, setSearchParams]);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSortBy("newest");
  };

  const handleFavoriteBlog = (id: string) => {
    toast({
      title: "Blog added to favorites",
      description: "You can view your favorites in the dashboard.",
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold md:text-4xl">Explore Blogs</h1>
          <p className="text-foreground/70">
            {selectedCategory
              ? `Browsing ${selectedCategory} blogs`
              : "Discover insights across all categories"}
          </p>
        </div>

        <div className="flex gap-2">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/50" />
            <Input
              placeholder="Search blogs..."
              className="pl-9 w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter Blogs</SheetTitle>
                <SheetDescription>
                  Refine your blog browsing experience
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Categories</h3>
                  <Select
                    value={selectedCategory}
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Sort By</h3>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {selectedCategory && (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="rounded-md">
            {selectedCategory}
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 ml-1 p-0"
              onClick={() => setSelectedCategory("")}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>

          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={clearFilters}
          >
            Clear all filters
          </Button>
        </div>
      )}

      {blogs.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">No blogs found</h2>
          <p className="text-foreground/70 mt-2">
            Try changing your search or filters
          </p>
          <Button variant="outline" className="mt-4" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <Card key={blog.id} className="overflow-hidden h-full card-hover">
              <div className="aspect-video relative">
                <img
                  src={blog.imageUrl}
                  alt={blog.title}
                  className="object-cover w-full h-full"
                />
                <SignedIn>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-black/40 hover:bg-black/60 text-white rounded-full h-8 w-8"
                    onClick={(e) => {
                      e.preventDefault();
                      handleFavoriteBlog(blog.id);
                    }}
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </SignedIn>
                <Badge className="absolute top-2 left-2">{blog.category}</Badge>
              </div>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-foreground/70">{blog.date}</div>
                  <div className="flex items-center gap-1 text-sm text-foreground/70">
                    <BookOpen className="h-4 w-4" />
                    {blog.readTime}
                  </div>
                </div>
                <Link to={`/blogs/${blog.id}`}>
                  <h3 className="font-bold text-xl hover:text-blog-primary transition-colors">
                    {blog.title}
                  </h3>
                </Link>
                <p className="text-foreground/70 line-clamp-3">
                  {blog.excerpt}
                </p>
                <div className="pt-2">
                  <Link to={`/blogs/${blog.id}`}>
                    <Button
                      variant="ghost"
                      className="px-0 text-blog-primary hover:text-blog-secondary"
                    >
                      Read more
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogsPage;
