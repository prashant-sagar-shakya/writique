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
} from "@/components/ui/card"; // Added CardDescription, CardFooter
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

  // Main state variables (reflect currently applied filters)
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || ""
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest");

  // Temporary state variables (hold selections inside the sheet)
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

  // Effect to fetch blogs and sync initial state from URL params
  useEffect(() => {
    document.title = "Writique - All Blogs";
    fetchBlogs();
    const urlSearch = searchParams.get("search") || "";
    const urlCategory = searchParams.get("category") || "";
    const urlSort = searchParams.get("sort") || "newest";
    setSearchTerm(urlSearch);
    setSelectedCategory(urlCategory);
    setSortBy(urlSort);
    // Sync temp state with initial main state as well
    setTempSelectedCategory(urlCategory);
    setTempSortBy(urlSort);
  }, []); // Fetch once

  // Effect to update URL when MAIN state variables change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (selectedCategory) params.set("category", selectedCategory);
    if (sortBy !== "newest") params.set("sort", sortBy); // Only add sort if not default
    setSearchParams(params, { replace: true }); // Use replace to avoid messy history
  }, [searchTerm, selectedCategory, sortBy, setSearchParams]);

  // Filter/Sort logic now only depends on the MAIN state variables
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

  // Handlers update TEMPORARY state inside the sheet
  const handleTempCategoryChange = (value: string) => {
    setTempSelectedCategory(value === "all-cat-value" ? "" : value);
  };
  const handleTempSortChange = (value: string) => {
    setTempSortBy(value);
  };

  // Apply filters button action
  const applyFilters = () => {
    // Update main state FROM temp state
    setSelectedCategory(tempSelectedCategory);
    setSortBy(tempSortBy);
    // Note: Updating the URL search params is handled by the useEffect watching the main state vars
    setIsSheetOpen(false); // Close the sheet
  };

  // Clears both main and temporary filters
  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSortBy("newest");
    setTempSelectedCategory(""); // Clear temp state too
    setTempSortBy("newest");
  };

  const clearCategoryFilter = () => {
    setSelectedCategory("");
    setTempSelectedCategory("");
  };

  const clearSearchFilter = () => {
    setSearchTerm("");
    // updateSearchParams(); // Removed direct update - let useEffect handle it
  };

  // Handler for when the Sheet trigger is clicked or Sheet is closed
  const handleSheetOpenChange = (open: boolean) => {
    if (open) {
      // When opening, sync temp state with current main state
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
          <div className="relative flex-grow md:w-auto">
            {" "}
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-9 w-full md:w-64"
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
          {/* Use handleSheetOpenChange */}
          <Sheet open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <SlidersHorizontal className="h-4 w-4" />
                {(selectedCategory || sortBy !== "newest") && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter & Sort</SheetTitle>
                <SheetDescription>Refine results</SheetDescription>
              </SheetHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Category</h3>
                  {/* Bind to TEMP state, update via TEMP handler */}
                  <Select
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
                  {/* Bind to TEMP state, update via TEMP handler */}
                  <Select
                    value={tempSortBy}
                    onValueChange={handleTempSortChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
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
          <h2 className="text-2xl font-bold">No blogs found</h2>
          <p className="text-muted-foreground mt-2">Try different filters.</p>
          <Button variant="outline" className="mt-4" onClick={clearAllFilters}>
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
