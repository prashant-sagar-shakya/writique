import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Heart } from "lucide-react";
import { allBlogs } from "@/lib/blog-data";
import { useToast } from "@/components/ui/use-toast";

const FavoritesPage = () => {
  // In a real app, fetch favorites from backend/database
  const favoriteBlogs = allBlogs.slice(0, 4);
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Writique - Favorites";
  }, []);

  const handleRemoveFavorite = (id: string) => {
    toast({
      title: "Removed from favorites",
      description: "Blog has been removed from your favorites.",
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold md:text-4xl">Your Favorites</h1>
        <p className="text-foreground/70">
          Blogs you've liked and saved for later
        </p>
      </div>

      {favoriteBlogs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteBlogs.map((blog) => (
            <Card key={blog.id} className="overflow-hidden h-full">
              <div className="aspect-video relative">
                <img
                  src={blog.imageUrl}
                  alt={blog.title}
                  className="object-cover w-full h-full"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-black/40 hover:bg-black/60 text-white rounded-full h-8 w-8"
                  onClick={() => handleRemoveFavorite(blog.id)}
                >
                  <Heart className="h-4 w-4 fill-current text-red-500" />
                </Button>
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
                <p className="text-foreground/70 line-clamp-2">
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
      ) : (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium">No favorite blogs yet</h2>
          <p className="text-foreground/70 mt-2">
            Like blogs to add them to your favorites
          </p>
          <Link to="/blogs">
            <Button className="mt-4 bg-blog-primary hover:bg-blog-secondary">
              Explore Blogs
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
