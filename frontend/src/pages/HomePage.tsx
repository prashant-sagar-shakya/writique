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
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"; // Removed unused SheetDescription, SheetClose
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
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);
  const mapBlogData = (data: any[]): Blog[] =>
    data.map((blog) => ({
      ...blog,
      id: blog._id || blog.id,
      views: blog.views ?? 0,
    }));
  const fetchBlogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/blogs");
      if (!response.ok) throw new Error(`${response.status}`);
      const apiResponse = await response.json();
      const mappedData = mapBlogData(apiResponse.blogs || []);
      setAllBlogs(mappedData);
    } catch (e: any) {
      setError(e.message || "Failed.");
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    document.title = "Writique - Blogs";
    fetchBlogs();
    const urlS = searchParams.get("s") || "";
    const urlC = searchParams.get("c") || "";
    const urlO = searchParams.get("o") || "newest";
    setSearchTerm(urlS);
    setSelectedCategory(urlC);
    setSortBy(urlO);
    setTempSelectedCategory(urlC);
    setTempSortBy(urlO);
  }, []);
  useEffect(() => {
    const p = new URLSearchParams();
    if (searchTerm) p.set("search", searchTerm);
    else p.delete("search");
    if (selectedCategory) p.set("category", selectedCategory);
    else p.delete("category");
    if (sortBy !== "newest") p.set("sort", sortBy);
    else p.delete("sort");
    setSearchParams(p, { replace: true });
  }, [searchTerm, selectedCategory, sortBy, setSearchParams]);
  useEffect(() => {
    let r = [...allBlogs];
    const sT = searchTerm.toLowerCase();
    if (sT)
      r = r.filter(
        (b) =>
          b.title.toLowerCase().includes(sT) ||
          b.excerpt.toLowerCase().includes(sT)
      );
    if (selectedCategory) r = r.filter((b) => b.category === selectedCategory);
    if (sortBy === "oldest")
      r.sort(
        (a, b) =>
          new Date(a.createdAt || a.date).getTime() -
          new Date(b.createdAt || b.date).getTime()
      );
    else
      r.sort(
        (a, b) =>
          new Date(b.createdAt || b.date).getTime() -
          new Date(a.createdAt || a.date).getTime()
      );
    setFilteredBlogs(r);
  }, [searchTerm, selectedCategory, sortBy, allBlogs]);
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

  return (
    <div className="space-y-8 container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold md:text-4xl">Explore Blogs</h1>
          <p className="text-muted-foreground">
            {selectedCategory ? `Browsing: ${selectedCategory}` : "All posts"}
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
                    Clear
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
          <Loader2 className="h-10 w-10 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-16 border rounded">
          <h2 className="text-xl">Error</h2>
          <p>{error}</p>
          <Button onClick={fetchBlogs}>Retry</Button>
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="text-center py-16">
          <h2 className="text-2xl">No blogs</h2>
          <p>Try different filters.</p>
          <Button onClick={clearAllFilters}>Clear</Button>
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
