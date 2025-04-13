import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
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
import { Label } from "@/components/ui/label";
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
  const [allBlogs, setAllBlogs] = useState<Blog[]>([]); // Start empty
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

  const [tempSelectedCategory, setTempSelectedCategory] = useState(""); // Initialize temporary states too
  const [tempSortBy, setTempSortBy] = useState("newest");

  const { toast } = useToast();

  const mapBlogData = (data: any[]): Blog[] => {
    // Add a check here
    if (!Array.isArray(data)) {
      console.error("mapBlogData received non-array:", data);
      return []; // Return empty array if data is not an array
    }
    return data.map((blog) => ({
      ...blog,
      id: blog._id || blog.id,
      views: blog.views ?? 0,
    }));
  };

  // Combined fetch and initial state setup effect
  useEffect(() => {
    console.log("BlogsPage: Initial Mount Effect Running");
    document.title = "Writique - Blogs";
    const fetchAndSetup = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/blogs");
        console.log("BlogsPage: Fetch response status:", response.status);
        if (!response.ok) throw new Error(`HTTP error! ${response.status}`);
        const apiResponse = await response.json();
        console.log("BlogsPage: API Response Received:", apiResponse);
        const mappedData = mapBlogData(apiResponse.blogs || []);
        console.log("BlogsPage: Mapped Data Length:", mappedData.length);
        setAllBlogs(mappedData);

        // Set filter state from URL AFTER data is loaded
        const urlSearch = searchParams.get("search") || "";
        const urlCategory = searchParams.get("category") || "";
        const urlSort = searchParams.get("sort") || "newest";
        console.log(
          "BlogsPage: Setting filter states from URL - Search:",
          urlSearch,
          "Category:",
          urlCategory,
          "Sort:",
          urlSort
        );
        setSearchTerm(urlSearch);
        setSelectedCategory(urlCategory);
        setSortBy(urlSort);
        setTempSelectedCategory(urlCategory);
        setTempSortBy(urlSort);
      } catch (e: any) {
        console.error("BlogsPage: Fetch failed:", e);
        const msg = e.message || "Failed to load blogs.";
        setError(msg);
        toast({ title: "Error", description: msg, variant: "destructive" });
      } finally {
        console.log("BlogsPage: Setting isLoading to false");
        setIsLoading(false);
      }
    };
    fetchAndSetup();
  }, []); // Depend only on initial mount requirements

  // Effect to update URL from state changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    else params.delete("search");
    if (selectedCategory) params.set("category", selectedCategory);
    else params.delete("category");
    if (sortBy !== "newest") params.set("sort", sortBy);
    else params.delete("sort");
    // Avoid replacing history on initial load if params are already correct
    if (searchParams.toString() !== params.toString()) {
      setSearchParams(params, { replace: true });
      console.log("BlogsPage: URL Params Updated:", params.toString());
    }
  }, [searchTerm, selectedCategory, sortBy, searchParams, setSearchParams]);

  // Memoized calculation for filteredBlogs - This only calculates
  const filteredBlogs = useMemo(() => {
    console.log(
      `BlogsPage: Recalculating filteredBlogs. allBlogs count: ${allBlogs.length}, Term: '${searchTerm}', Category: '${selectedCategory}', Sort: '${sortBy}'`
    );
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
    } // Default newest
    console.log("BlogsPage: Filtered blogs count:", results.length);
    return results;
  }, [searchTerm, selectedCategory, sortBy, allBlogs]); // Dependencies

  const handleTempCategoryChange = (v: string) => {
    setTempSelectedCategory(v === "all-cat-value" ? "" : v);
  };
  const handleTempSortChange = (v: string) => {
    setTempSortBy(v);
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
  const handleSheetOpenChange = (o: boolean) => {
    if (o) {
      setTempSelectedCategory(selectedCategory);
      setTempSortBy(sortBy);
    }
    setIsSheetOpen(o);
  };
  const handleFav = (id: string) => {
    toast({ title: "Fav WIP" });
  };

  console.log(
    "BlogsPage: Rendering. IsLoading:",
    isLoading,
    "Error:",
    error,
    "Filtered Count:",
    filteredBlogs.length
  );

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
          <div className="relative flex-grow sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4" />
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
              <Button variant="outline" size="icon" className="rel">
                <SlidersHorizontal className="h-4 w-4" />
                {(selectedCategory || sortBy !== "newest") && (
                  <span className="abs -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping abs inset-0 rounded-full bg-primary op75"></span>
                    <span className="rel inline-flex rounded-full h-3 w-3 bg-primary"></span>
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
                  <Label htmlFor="cat-sel">Category</Label>
                  <Select
                    inputId="cat-sel"
                    value={tempSelectedCategory || "all-cat-value"}
                    onValueChange={handleTempCategoryChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-cat-value">All</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.name}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sort-sel">Sort</Label>
                  <Select
                    inputId="sort-sel"
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
            className="h-auto p-0 text-xs"
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
          <p className="text-muted-foreground mt-2">
            Try adjusting filters or search.
          </p>
          <Button variant="outline" className="mt-4" onClick={clearAllFilters}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map((blog) => (
            <Link to={`/blogs/${blog.id}`} key={blog.id} className="group">
              {/* Applying the EXACT Card Layout you provided */}
              <Card className="overflow-hidden h-full flex flex-col transition-shadow hover:shadow-lg">
                <div className="aspect-[16/9] relative overflow-hidden border-b">
                  <img
                    src={blog.imageUrl}
                    alt={blog.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                  />
                  <Badge variant="secondary" className="absolute top-2 right-2">
                    {blog.category}
                  </Badge>
                  {/* Optional: Keep favorite button from original if needed */}
                  {/* <SignedIn><Button variant="ghost" size="icon" className="absolute top-2 left-2 ..." onClick={(e)=>{e.preventDefault();handleFav(blog.id);}}><Heart className="h-4 w-4"/></Button></SignedIn> */}
                </div>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-primary">
                    {blog.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 flex-grow">
                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {blog.excerpt}
                  </p>
                  {/* Removed Read More button to exactly match provided layout */}
                </CardContent>
                <CardFooter className="p-4 pt-2 text-xs text-muted-foreground flex justify-between mt-auto">
                  <span>{new Date(blog.date).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {blog.readTime} | {blog.views ?? 0} views
                  </span>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
export default BlogsPage;
