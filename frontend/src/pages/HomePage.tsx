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

  // This mapping should include 'views' now as well, just like other pages
  const mapBlogData = (data: any[]): Blog[] => {
    if (!Array.isArray(data)) return [];
    return data.map((blog) => ({
      ...blog,
      id: blog._id || blog.id,
      views: blog.views ?? 0,
    }));
  };

  const fetchFeaturedBlogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/blogs?limit=3");
      if (!response.ok) throw new Error(`HTTP error! ${response.status}`);
      const apiResponse = await response.json(); // apiResponse is { blogs: [], totalCount: num }

      // --- Corrected line: Access .blogs ---
      setFeaturedBlogs(mapBlogData(apiResponse.blogs || [])); // Access .blogs property here
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
        <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl">
          Welcome to{" "}
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Writique
          </span>
        </h1>
        <p className="text-lg text-muted-foreground md:text-xl max-w-xl lg:max-w-2xl mx-auto">
          Ideas resonate, stories connect.
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
                Join
              </Button>
            </Link>
          </SignedOut>
        </div>
      </section>
      <section className="space-y-6 md:space-y-8">
        <div className="flex flex-col items-center sm:flex-row sm:justify-between">
          <div className="mb-4 sm:mb-0 text-center sm:text-left">
            <h2 className="text-2xl font-bold md:text-3xl">Featured</h2>
            <p className="text-muted-foreground">Recommendations</p>
          </div>
          <Link to="/blogs">
            <Button variant="ghost" className="gap-1 text-sm">
              View All <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-destructive">
            <h3 className="text-xl">Error</h3>
            <p>{error}</p>
          </div>
        ) : featuredBlogs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredBlogs.map((blog) => (
              <Link to={`/blogs/${blog.id}`} key={blog.id} className="group">
                <Card className="h-[75%] flex flex-col shadow hover:shadow-lg">
                  <div className="rel overflow-hidden border-b">
                    <img
                      src={blog.imageUrl}
                      alt={blog.title}
                      className="obj-cover w-full h-full group-hover:scale-105 tr-transform"
                    />
                    <Badge variant="secondary" className="abs top-2 right-2">
                      {blog.category}
                    </Badge>
                  </div>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-lg font-semibold lc-2 group-hover:text-primary">
                      {blog.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 grow">
                    <p className="lc-3 text-sm text-muted-foreground">
                      {blog.excerpt}
                    </p>
                  </CardContent>
                  <CardFooter className="p-4 pt-2 text-xs flex justify-between mt-auto">
                    <time>{new Date(blog.date).toLocaleDateString()}</time>
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {blog.readTime} | {blog.views ?? 0} views
                    </span>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center py-12 text-muted-foreground">
            No featured posts.
          </p>
        )}
      </section>
      <section className="space-y-6 md:space-y-8">
        <h2 className="text-2xl font-bold md:text-3xl text-center">
          Categories
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((c) => (
            <Link to={`/blogs?category=${c.name}`} key={c.id} className="group">
              <Card className="text-center hover:shadow-md">
                <CardContent className="p-3 py-5 sm:p-4 flex flex-col items-center justify-center gap-1.5 sm:gap-2 aspect-square">
                  <c.icon className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground group-hover:text-primary" />
                  <h3 className="font-medium text-xs sm:text-sm text-center text-muted-foreground group-hover:text-primary">
                    {c.name}
                  </h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
      <SignedOut>
        <section className="bg-gradient-to-r from-primary to-secondary rounded-lg p-8 text-primary-foreground text-center space-y-4 md:space-y-6">
          <h2 className="text-2xl font-bold md:text-3xl">Join Today</h2>
          <p>Save favorites, join community.</p>
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
