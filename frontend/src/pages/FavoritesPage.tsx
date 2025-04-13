import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Loader2, HeartCrack, Eye } from "lucide-react";
import { Blog, UserProfile } from "@/lib/blog-data";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

const FavoritesPage = () => {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { toast } = useToast();
  const [favoriteBlogs, setFavoriteBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Consistent mapping function to ensure 'id' exists
  const mapFavBlogData = (data: any[]): Blog[] => {
    if (!Array.isArray(data)) {
      console.error("mapFavBlogData received non-array", data);
      return [];
    }
    // Explicitly map _id to id, provide default views
    return data.map((blog) => ({
      ...blog,
      id: blog._id || blog.id, // Prefer _id if available, fallback to id
      views: blog.views ?? 0,
    }));
  };

  const fetchFavorites = async () => {
    if (!isSignedIn) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Auth missing.");
      const response = await fetch("/api/users/me?populate=favorites", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Fetch error: ${response.status}`);
      const userData: UserProfile = await response.json();

      // Use the mapping function here to ensure 'id' field is set
      if (
        userData &&
        Array.isArray(userData.favorites) &&
        userData.favorites.length > 0 &&
        typeof userData.favorites[0] === "object"
      ) {
        setFavoriteBlogs(mapFavBlogData(userData.favorites)); // Use map function
      } else {
        setFavoriteBlogs([]);
      }
    } catch (e: any) {
      console.error("Fav fetch failed:", e);
      setError(e.message || "Failed load.");
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Writique - Favorites";
    if (isLoaded && isSignedIn) {
      fetchFavorites();
    } else if (isLoaded && !isSignedIn) {
      setIsLoading(false);
      setFavoriteBlogs([]);
    }
  }, [isLoaded, isSignedIn, getToken]);

  const handleRemoveFavorite = async (
    blogIdToRemove: string | undefined,
    blogTitle: string
  ) => {
    // ID check remains important
    if (!blogIdToRemove) {
      console.error(
        "Attempted to remove favorite with invalid/undefined ID:",
        blogIdToRemove
      );
      toast({
        title: "Error",
        description: "Cannot remove favorite: invalid ID.",
        variant: "destructive",
      });
      return;
    }
    console.log("Attempting to remove favorite with ID:", blogIdToRemove); // Log the ID being used
    try {
      const token = await getToken();
      if (!token) throw new Error("Auth missing.");
      // Ensure we are sending the ID the backend expects (which should be the ObjectId string)
      const response = await fetch(
        `/api/users/me/favorites/${blogIdToRemove}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.msg || `Remove failed: ${response.status}`);
      }
      // Ensure filter uses the same 'id' property as the key/call
      setFavoriteBlogs((prev) =>
        prev.filter((blog) => blog.id !== blogIdToRemove)
      );
      toast({ title: "Removed", description: `"${blogTitle}" removed.` });
    } catch (error: any) {
      console.error("Remove fav failed:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  if (!isSignedIn && !isLoading)
    return (
      <div className="text-center py-16">
        <p>Sign in first.</p>
      </div>
    );
  if (error)
    return (
      <div className="text-center py-16 text-destructive">
        <p>Error</p>
        <Button onClick={fetchFavorites}>Retry</Button>
      </div>
    );

  return (
    <div className="space-y-8 container mx-auto py-8 px-4">
      <div>
        <h1 className="text-3xl font-bold md:text-4xl">Favorites</h1>
        <p className="text-muted-foreground">Saved posts</p>
      </div>
      {favoriteBlogs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteBlogs.map((blog) => {
            // Extra safety check within the map (optional)
            if (!blog || !blog.id) {
              console.warn("Rendering favorite item with missing data:", blog);
              return null; // Skip rendering if essential data is missing
            }
            return (
              <div key={blog.id} className="group relative">
                <Card className="overflow-hidden h-full flex flex-col transition-shadow hover:shadow-lg">
                  <div className="aspect-[16/9] relative overflow-hidden border-b">
                    <Link to={`/blogs/${blog.id}`} className="block h-full">
                      <img
                        src={blog.imageUrl}
                        alt={blog.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                      />
                    </Link>
                    <Badge
                      variant="secondary"
                      className="absolute top-2 right-2"
                    >
                      {blog.category}
                    </Badge>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 left-2 bg-background/70 hover:bg-destructive text-destructive hover:text-destructive-foreground rounded-full h-8 w-8 transition-colors opacity-0 group-hover:opacity-100"
                      onClick={() => handleRemoveFavorite(blog.id, blog.title)}
                    >
                      <HeartCrack className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-primary">
                      <Link to={`/blogs/${blog.id}`}>{blog.title}</Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 flex-grow">
                    <p className="line-clamp-3 text-sm text-muted-foreground">
                      {blog.excerpt}
                    </p>
                  </CardContent>
                  <CardFooter className="p-4 pt-2 text-xs text-muted-foreground flex justify-between mt-auto">
                    <span>{new Date(blog.date).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1">
                      {" "}
                      <BookOpen className="h-3 w-3" />
                      {blog.readTime} | {blog.views ?? 0} views
                    </span>
                  </CardFooter>
                </Card>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 border rounded-md">
          <h2 className="text-xl">No favorites</h2>
          <p>Like posts to save.</p>
          <Button asChild>
            <Link to="/blogs">Explore</Link>
          </Button>
        </div>
      )}
    </div>
  );
};
export default FavoritesPage;
