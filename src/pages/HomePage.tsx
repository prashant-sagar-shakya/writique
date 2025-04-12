import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, ChevronRight } from "lucide-react";
import { featuredBlogs, categories } from "@/lib/blog-data";
import { SignedOut } from "@clerk/clerk-react";

const HomePage = () => {
  useEffect(() => {
    document.title = "Writique - Home";
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-10 md:py-16">
        <h1 className="text-4xl font-bold md:text-6xl animate-fade-in">
          Welcome to{" "}
          <span className="bg-gradient-to-r from-blog-primary to-blog-secondary bg-clip-text text-transparent">
            Writique
          </span>
        </h1>
        <p className="text-xl text-foreground/70 max-w-2xl mx-auto animate-fade-in">
          A platform where ideas resonate, stories connect, and knowledge
          expands.
        </p>
        <div className="flex flex-wrap justify-center gap-4 animate-fade-in">
          <Link to="/blogs">
            <Button className="bg-blog-primary hover:bg-blog-secondary">
              Explore Blogs
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <SignedOut>
            <Link to="/auth">
              <Button variant="outline">Join The Community</Button>
            </Link>
          </SignedOut>
        </div>
      </section>

      {/* Featured Blogs */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">Featured Blogs</h2>
            <p className="text-foreground/70">
              Discover our handpicked recommendations
            </p>
          </div>
          <Link to="/blogs">
            <Button variant="ghost" className="gap-1">
              View All <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredBlogs.map((blog) => (
            <Link to={`/blogs/${blog.id}`} key={blog.id}>
              <Card className="overflow-hidden h-full card-hover">
                <div className="aspect-video relative">
                  <img
                    src={blog.imageUrl}
                    alt={blog.title}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
                    {blog.category}
                  </div>
                </div>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-foreground/70">
                      {blog.date}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-foreground/70">
                      <BookOpen className="h-4 w-4" />
                      {blog.readTime}
                    </div>
                  </div>
                  <h3 className="font-bold text-xl">{blog.title}</h3>
                  <p className="text-foreground/70 line-clamp-2">
                    {blog.excerpt}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold md:text-3xl">Explore Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link
              to={`/blogs?category=${category.name}`}
              key={category.id}
              className="group"
            >
              <Card className="overflow-hidden h-full text-center card-hover bg-gradient-to-br from-blog-accent to-background">
                <CardContent className="p-6 flex flex-col items-center justify-center gap-2">
                  <category.icon className="h-8 w-8 text-blog-primary group-hover:text-blog-secondary transition-colors" />
                  <h3 className="font-medium">{category.name}</h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
      <SignedOut>
        {/* Call to Action */}
        <section className="bg-gradient-to-r from-blog-primary to-blog-secondary rounded-lg p-8 text-white text-center space-y-6">
          <h2 className="text-2xl font-bold md:text-3xl">
            Join Writique Today
          </h2>
          <p className="max-w-2xl mx-auto">
            Create an account to save your favorite blogs, follow authors, and
            become part of our growing community.
          </p>
          <Link to="/auth">
            <Button className="bg-white text-blog-primary hover:bg-gray-100">
              Get Started
            </Button>
          </Link>
        </section>
      </SignedOut>
    </div>
  );
};

export default HomePage;
