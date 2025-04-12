import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, BookOpen, ChevronRight } from "lucide-react";
import { categories, Blog } from "@/lib/blog-data";
import { useToast } from "@/components/ui/use-toast";
import { SignedOut } from "@clerk/clerk-react";

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
    <div className="space-y-12 container mx-auto py-8 px-4">
      <section className="text-center space-y-6 py-10 md:py-16">
        <h1 className="text-4xl font-bold md:text-6xl animate-fade-in">
          Welcome to{" "}
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Writique
          </span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in">
          Ideas resonate, stories connect, knowledge expands.
        </p>
        <div className="flex flex-wrap justify-center gap-4 animate-fade-in">
          <Link to="/blogs">
            <Button>
              Explore Blogs
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <SignedOut>
            <Link to="/auth">
              <Button variant="outline">Join Community</Button>
            </Link>
          </SignedOut>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">Featured Posts</h2>
            <p className="text-muted-foreground">Handpicked recommendations</p>
          </div>
          <Link to="/blogs">
            <Button variant="ghost" className="gap-1">
              View All <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
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
                <Card className="overflow-hidden h-full flex flex-col transition-shadow hover:shadow-md">
                  <div className="aspect-video relative">
                    <img
                      src={blog.imageUrl}
                      alt={blog.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
                      {blog.category}
                    </div>
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
                    <h3 className="font-bold text-xl line-clamp-2 group-hover:text-primary">
                      {blog.title}
                    </h3>
                    <p className="text-muted-foreground line-clamp-3 text-sm flex-grow">
                      {blog.excerpt}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">
            No featured posts available.
          </p>
        )}
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold md:text-3xl text-center">
          Explore Categories
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.map((category) => (
            <Link
              to={`/blogs?category=${category.name}`}
              key={category.id}
              className="group"
            >
              <Card className="overflow-hidden h-full text-center transition-shadow hover:shadow-md hover:border-primary/50">
                <CardContent className="p-6 flex flex-col items-center justify-center gap-2 aspect-square">
                  <category.icon className="h-7 w-7 text-muted-foreground group-hover:text-primary transition-colors" />
                  <h3 className="font-medium text-sm text-muted-foreground group-hover:text-primary">
                    {category.name}
                  </h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
      <SignedOut>
        <section className="bg-gradient-to-r from-primary to-secondary rounded-lg p-8 text-primary-foreground text-center space-y-6">
          <h2 className="text-2xl font-bold md:text-3xl">
            Join Writique Today
          </h2>
          <p className="max-w-2xl mx-auto">
            Create an account to save favorites and join our community.
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
