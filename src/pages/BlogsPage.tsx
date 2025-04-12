import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Filter,
  Heart,
  Search,
  SlidersHorizontal,
  X,
  Loader2,
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
import { categories, Blog } from "@/lib/blog-data";
import { Separator } from "@/components/ui/separator";
import { SignedIn } from "@clerk/clerk-react";
import { useToast } from "@/components/ui/use-toast";

const BlogsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "";
  const [allBlogs, setAllBlogs] = useState<Blog[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState("newest");
  const { toast } = useToast();
  const mapBlogData = (data: any[]): Blog[] =>
    data.map((blog) => ({ ...blog, id: blog._id || blog.id }));
  const fetchBlogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/blogs");
      if (!response.ok) throw new Error(`HTTP error! ${response.status}`);
      const data = await response.json();
      const mappedData = mapBlogData(data);
      setAllBlogs(mappedData);
      setFilteredBlogs(mappedData);
    } catch (e: any) {
      console.error("Fetch failed:", e);
      const msg = e.message || "Failed.";
      setError(msg);
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    document.title = "Writique - All Blogs";
    fetchBlogs();
  }, []);
  useEffect(() => {
    let results = [...allBlogs];
    if (searchTerm) {
      results = results.filter(
        (b) =>
          b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedCategory) {
      results = results.filter((b) => b.category === selectedCategory);
    }
    if (sortBy === "newest") {
      results.sort(
        (a, b) =>
          new Date(b.createdAt || b.date).getTime() -
          new Date(a.createdAt || a.date).getTime()
      );
    } else if (sortBy === "oldest") {
      results.sort(
        (a, b) =>
          new Date(a.createdAt || a.date).getTime() -
          new Date(b.createdAt || b.date).getTime()
      );
    }
    setFilteredBlogs(results);
  }, [searchTerm, selectedCategory, sortBy, allBlogs]);
  useEffect(() => {
    if (selectedCategory) {
      setSearchParams({ category: selectedCategory }, { replace: true });
    } else {
      searchParams.delete("category");
      setSearchParams(searchParams, { replace: true });
    }
  }, [selectedCategory, setSearchParams]);
  const handleCategoryChange = (value: string) => setSelectedCategory(value);
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSortBy("newest");
  };
  const handleFavoriteBlog = (id: string) => {
    toast({
      title: "Added to favorites",
      description: "Not fully implemented.",
    });
  };
  return (
    <div className="space-y-8 container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold md:text-4xl">Explore Blogs</h1>
          <p className="text-muted-foreground">
            {selectedCategory
              ? `Browsing: ${selectedCategory}`
              : "Discover all posts"}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="relative flex-grow md:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                <SheetTitle>Filter & Sort</SheetTitle>
                <SheetDescription>Refine your search</SheetDescription>
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
      {(selectedCategory || searchTerm) && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Filters:</span>
          {selectedCategory && (
            <Badge variant="secondary">
              {selectedCategory}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 p-0 hover:bg-transparent"
                onClick={() => setSelectedCategory("")}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {searchTerm && (
            <Badge variant="secondary">
              Search: "{searchTerm}"
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 p-0 hover:bg-transparent"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          <Button
            variant="link"
            size="sm"
            className="h-7 text-xs p-0 text-primary"
            onClick={clearFilters}
          >
            Clear all
          </Button>
        </div>
      )}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="text-center py-16 text-destructive border rounded">
          <h2 className="text-xl font-bold">Error Loading Blogs</h2>
          <p className="mt-2">{error}</p>
          <Button variant="outline" onClick={fetchBlogs} className="mt-4">
            Try Again
          </Button>
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold">No blogs found</h2>
          <p className="text-muted-foreground mt-2">
            Try different filters or search.
          </p>
          <Button variant="outline" className="mt-4" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map((blog) => (
            <Card
              key={blog.id}
              className="overflow-hidden h-full flex flex-col group"
            >
              <div className="aspect-video relative">
                <Link to={`/blogs/${blog.id}`} className="block h-full">
                  <img
                    src={blog.imageUrl}
                    alt={blog.title}
                    className="object-cover w-full h-full transition-transform group-hover:scale-105"
                  />
                </Link>
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
                <Badge className="absolute bottom-2 left-2">
                  {blog.category}
                </Badge>
              </div>
              <CardContent className="p-4 space-y-2 flex-grow flex flex-col">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {new Date(blog.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    {blog.readTime}
                  </div>
                </div>
                <Link to={`/blogs/${blog.id}`}>
                  <h3 className="font-bold text-xl hover:text-primary transition-colors line-clamp-2">
                    {blog.title}
                  </h3>
                </Link>
                <p className="text-muted-foreground line-clamp-3 text-sm flex-grow">
                  {blog.excerpt}
                </p>
                <div className="pt-2 mt-auto">
                  <Link to={`/blogs/${blog.id}`}>
                    <Button
                      variant="link"
                      className="p-0 h-auto text-primary hover:text-secondary"
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
