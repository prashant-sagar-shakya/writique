import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, BookOpen, ChevronRight } from "lucide-react";
import { categories, Blog } from "@/lib/blog-data";
import { useToast } from "@/components/ui/use-toast";
import { SignedOut } from "@clerk/clerk-react";
import { Badge } from "@/components/ui/badge";

const HomePage = () => {
  const [featuredBlogs, setFeaturedBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const mapBlogData = (data: any[]): Blog[] =>
    data.map((blog) => ({ ...blog, id: blog._id || blog.id }));
  const fetchFeaturedBlogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/blogs?limit=3");
      if (!response.ok) throw new Error(`HTTP error! ${response.status}`);
      const data = await response.json();
      setFeaturedBlogs(mapBlogData(data));
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
    document.title = "Writique - Home";
    fetchFeaturedBlogs();
  }, []);

  return (
    <div className="space-y-12 md:space-y-16 lg:space-y-20">
      <section className="text-center space-y-6 py-10 md:py-16 lg:py-20">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Welcome to{" "}
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Writique
          </span>
        </h1>
        <p className="text-lg text-muted-foreground md:text-xl max-w-xl lg:max-w-2xl mx-auto">
          Ideas resonate, stories connect, knowledge expands.
        </p>
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
          <Link to="/blogs">
            <Button size="lg">
              Explore Blogs
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <SignedOut>
            <Link to="/auth">
              <Button size="lg" variant="outline">
                Join Community
              </Button>
            </Link>
          </SignedOut>
        </div>
      </section>

      <section className="space-y-6 md:space-y-8">
        <div className="flex flex-col items-center text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-2xl font-bold md:text-3xl">Featured Posts</h2>
            <p className="text-muted-foreground">Handpicked recommendations</p>
          </div>
          <Link to="/blogs">
            <Button variant="ghost" className="gap-1 text-sm">
              View All <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-destructive">
            <h3 className="text-xl font-medium">Could not load posts</h3>
            <p className="mt-2">{error}</p>
          </div>
        ) : featuredBlogs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredBlogs.map((blog) => (
              <Link to={`/blogs/${blog.id}`} key={blog.id} className="group">
                <Card className="overflow-hidden h-full flex flex-col transition-shadow hover:shadow-lg">
                  <div className="aspect-[16/9] relative overflow-hidden border-b">
                    <img
                      src={blog.imageUrl}
                      alt={blog.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                    />
                    <Badge
                      variant="secondary"
                      className="absolute top-2 right-2"
                    >
                      {blog.category}
                    </Badge>
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
                  </CardContent>
                  <CardFooter className="p-4 pt-2 text-xs text-muted-foreground flex justify-between">
                    <span>{new Date(blog.date).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {blog.readTime}
                    </span>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-12">
            No featured posts found.
          </p>
        )}
      </section>

      <section className="space-y-6 md:space-y-8">
        <h2 className="text-2xl font-bold md:text-3xl text-center">
          Explore Categories
        </h2>
        {/* Adjusted grid columns and gap */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((category) => (
            <Link
              to={`/blogs?category=${category.name}`}
              key={category.id}
              className="group"
            >
              {/* Adjusted padding and icon size */}
              <Card className="overflow-hidden h-full text-center transition-shadow hover:shadow-md hover:border-primary/50">
                <CardContent className="p-3 py-5 sm:p-4 flex flex-col items-center justify-center gap-1.5 sm:gap-2 aspect-square">
                  <category.icon className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  <h3 className="font-medium text-xs sm:text-sm text-center text-muted-foreground group-hover:text-primary">
                    {category.name}
                  </h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <SignedOut>
        <section className="bg-gradient-to-r from-primary to-secondary rounded-lg p-8 text-primary-foreground text-center space-y-4 md:space-y-6">
          <h2 className="text-2xl font-bold md:text-3xl">
            Join Writique Today
          </h2>
          <p className="max-w-xl lg:max-w-2xl mx-auto">
            Create an account, save favorites, and join our community.
          </p>
          <Link to="/auth">
            <Button
              variant="secondary"
              className="bg-background text-primary hover:bg-background/90"
            >
              Get Started
            </Button>
          </Link>
        </section>
      </SignedOut>
    </div>
  );
};
export default HomePage;
