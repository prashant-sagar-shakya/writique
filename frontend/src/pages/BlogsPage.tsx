import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Search,
  SlidersHorizontal,
  X,
  Loader2,
  Heart,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Import Label
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
  SheetClose,
} from "@/components/ui/sheet";
import { categories, Blog } from "@/lib/blog-data";
import { useToast } from "@/components/ui/use-toast";
import { SignedIn } from "@clerk/clerk-react";

const BlogsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allBlogs, setAllBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || ""
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest");
  const [tempSelectedCategory, setTempSelectedCategory] =
    useState(selectedCategory);
  const [tempSortBy, setTempSortBy] = useState(sortBy);
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
    const urlSearch = searchParams.get("search") || "";
    const urlCategory = searchParams.get("category") || "";
    const urlSort = searchParams.get("sort") || "newest";
    setSearchTerm(urlSearch);
    setSelectedCategory(urlCategory);
    setSortBy(urlSort);
    setTempSelectedCategory(urlCategory);
    setTempSortBy(urlSort);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    else params.delete("search");
    if (selectedCategory) params.set("category", selectedCategory);
    else params.delete("category");
    if (sortBy && sortBy !== "newest") params.set("sort", sortBy);
    else params.delete("sort");
    setSearchParams(params, { replace: true });
  }, [searchTerm, selectedCategory, sortBy, setSearchParams]);

  const filteredBlogs = useMemo(() => {
    let results = [...allBlogs];
    const lowerSearchTerm = searchTerm.toLowerCase();
    if (lowerSearchTerm) {
      results = results.filter(
        (b) =>
          b.title.toLowerCase().includes(lowerSearchTerm) ||
          b.excerpt.toLowerCase().includes(lowerSearchTerm)
      );
    }
    if (selectedCategory) {
      results = results.filter((b) => b.category === selectedCategory);
    }
    if (sortBy === "oldest") {
      results.sort(
        (a, b) =>
          new Date(a.createdAt || a.date).getTime() -
          new Date(b.createdAt || b.date).getTime()
      );
    } else {
      results.sort(
        (a, b) =>
          new Date(b.createdAt || b.date).getTime() -
          new Date(a.createdAt || a.date).getTime()
      );
    }
    return results;
  }, [searchTerm, selectedCategory, sortBy, allBlogs]);

  const handleTempCategoryChange = (value: string) => {
    setTempSelectedCategory(value === "all-cat-value" ? "" : value);
  };
  const handleTempSortChange = (value: string) => {
    setTempSortBy(value);
  };
  const applyFilters = () => {
    setSelectedCategory(tempSelectedCategory);
    setSortBy(tempSortBy);
    setIsSheetOpen(false);
  };
  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSortBy("newest");
    setTempSelectedCategory("");
    setTempSortBy("newest");
  };
  const clearCategoryFilter = () => {
    setSelectedCategory("");
  };
  const clearSearchFilter = () => {
    setSearchTerm("");
  };
  const handleSheetOpenChange = (open: boolean) => {
    if (open) {
      setTempSelectedCategory(selectedCategory);
      setTempSortBy(sortBy);
    }
    setIsSheetOpen(open);
  };
  const handleFavoriteBlog = (id: string) => {
    toast({ title: "Favorited (Demo)" });
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
          <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                onClick={clearSearchFilter}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Sheet open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <SlidersHorizontal className="h-4 w-4" />
                {(selectedCategory || sortBy !== "newest") && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute h-full w-full rounded-full bg-primary op75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter & Sort</SheetTitle>
              </SheetHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label htmlFor="category-select">Category</Label>
                  <Select
                    inputId="category-select"
                    value={tempSelectedCategory || "all-cat-value"}
                    onValueChange={handleTempCategoryChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-cat-value">
                        All Categories
                      </SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.name}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sort-select">Sort By</Label>
                  <Select
                    inputId="sort-select"
                    value={tempSortBy}
                    onValueChange={handleTempSortChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="oldest">Oldest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={applyFilters} className="w-full">
                  Apply
                </Button>
                {(tempSelectedCategory ||
                  searchTerm ||
                  tempSortBy !== "newest") && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      clearAllFilters();
                      setIsSheetOpen(false);
                    }}
                    className="w-full"
                  >
                    Clear & Close
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      {(selectedCategory || searchTerm || sortBy !== "newest") && (
        <div className="flex items-center gap-2 flex-wrap text-sm">
          <span className="text-muted-foreground">Active:</span>
          {selectedCategory && (
            <Badge variant="secondary">
              {selectedCategory}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 p-0"
                onClick={clearCategoryFilter}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {searchTerm && (
            <Badge variant="secondary">
              "{searchTerm}"
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 p-0"
                onClick={clearSearchFilter}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {sortBy !== "newest" && (
            <Badge variant="secondary">
              {sortBy === "oldest" ? "Oldest" : "Newest"}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 p-0"
                onClick={() => setSortBy("newest")}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-xs text-primary"
            onClick={clearAllFilters}
          >
            Clear All
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="text-center py-16 text-destructive border rounded">
          <h2 className="text-xl font-bold">Error</h2>
          <p className="mt-2">{error}</p>
          <Button variant="outline" onClick={fetchBlogs} className="mt-4">
            Retry
          </Button>
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold">No blogs</h2>
          <p>Try different filters.</p>
          <Button variant="outline" className="mt-4" onClick={clearAllFilters}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map((blog) => (
            <Card
              key={blog.id}
              className="overflow-hidden h-full flex flex-col group"
            >
              <div className="aspect-[16/9] relative">
                <Link to={`/blogs/${blog.id}`} className="block h-full">
                  <img
                    src={blog.imageUrl}
                    alt={blog.title}
                    className="object-cover w-full h-full tr-transform group-hover:scale-105"
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
                  <h3 className="font-bold text-lg hover:text-primary line-clamp-2">
                    {blog.title}
                  </h3>
                </Link>
                <p className="text-muted-foreground line-clamp-3 text-sm flex-grow">
                  {blog.excerpt}
                </p>
                <div className="pt-2 mt-auto">
                  <Link to={`/blogs/${blog.id}`}>
                    <Button variant="link" className="p-0 h-auto text-sm">
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
