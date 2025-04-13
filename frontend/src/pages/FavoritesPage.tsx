import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const FavoritesPage = () => {
  useEffect(() => {
    document.title = "Writique - Favorites";
  }, []);
  // NOTE: Favorites require backend integration to fetch user-specific liked blogs.
  const favoriteBlogs: any[] = []; // Placeholder: empty array
  return (
    <div className="space-y-8 container mx-auto py-8 px-4">
      <div>
        <h1 className="text-3xl font-bold md:text-4xl">Your Favorites</h1>
        <p className="text-muted-foreground">Blogs you've liked</p>
      </div>
      {favoriteBlogs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Map over actual favoriteBlogs when fetched */}
        </div>
      ) : (
        <div className="text-center py-16 border rounded-md">
          <h2 className="text-xl font-medium">No favorites yet</h2>
          <p className="text-muted-foreground mt-2">
            Like blogs to save them here.
          </p>
          <Button className="mt-4" asChild>
            <Link to="/blogs">Explore Blogs</Link>
          </Button>
        </div>
      )}
    </div>
  );
};
export default FavoritesPage;
