import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Blog } from "@/lib/blog-data";
import { BookOpen, Edit, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useBlogs } from "@/context/BlogContext"; // Import the context hook

const DashboardPage = () => {
  const { userId } = useAuth(); // Still useful for potential user-specific filtering later
  const { user } = useUser();
  const { toast } = useToast();
  const { blogs, deleteBlog } = useBlogs(); // Get blogs and delete function from context

  // Filter blogs based on current user if needed in the future, for now show all
  // Example: const userBlogs = blogs.filter(blog => blog.authorId === userId);
  const publishedBlogs = blogs; // Assuming all blogs in context are "published" for now
  const draftBlogs: Blog[] = []; // Placeholder for drafts - implement logic if needed

  useEffect(() => {
    document.title = "Writique - Dashboard";
  }, []);

  const handleDelete = (id: string, title: string) => {
    // Add confirmation dialog here in a real app
    deleteBlog(id); // Delete from context state
    toast({
      title: "Blog deleted",
      description: `"${title}" has been deleted.`,
      variant: "destructive",
    });
  };

  // Calculate stats based on context data
  const publishedCount = publishedBlogs.length;
  const draftCount = draftBlogs.length;
  const totalViews = publishedBlogs.reduce(() => 0, 0); // Replace with actual view count logic later

  return (
    <div className="space-y-8 p-4 md:p-6 lg:p-8">
      {" "}
      {/* Added padding */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold md:text-4xl">Dashboard</h1>
          <p className="text-foreground/70">
            Welcome back, {user?.firstName || "there"}!
          </p>
        </div>

        <div className="flex gap-2">
          <Button className="bg-blog-primary hover:bg-blog-secondary" asChild>
            <Link to="/create-blog">
              <Plus className="mr-2 h-4 w-4" />
              New Blog
            </Link>
          </Button>
        </div>
      </div>
      {/* Dynamic Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{publishedCount}</CardTitle>
            <CardDescription>Published Blogs</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{draftCount}</CardTitle>
            <CardDescription>Draft Blogs</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{totalViews}</CardTitle>
            <CardDescription>Total Views (Demo)</CardDescription>
          </CardHeader>
        </Card>
      </div>
      <Tabs defaultValue="published">
        <TabsList>
          <TabsTrigger value="published">
            Published ({publishedCount})
          </TabsTrigger>
          <TabsTrigger value="drafts" disabled={draftCount === 0}>
            Drafts ({draftCount})
          </TabsTrigger>
        </TabsList>

        {/* Published Blogs Tab */}
        <TabsContent value="published" className="pt-6">
          {publishedBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publishedBlogs.map((blog) => (
                <Card key={blog.id} className="flex flex-col">
                  {" "}
                  {/* Ensure consistent card height */}
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={blog.imageUrl}
                      alt={blog.title}
                      className="object-cover w-full h-full transition-transform hover:scale-105"
                    />
                  </div>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-lg line-clamp-2">
                      {blog.title}
                    </CardTitle>
                    <CardDescription className="flex justify-between items-center text-xs pt-1">
                      <span>{blog.date}</span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" /> {blog.readTime}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 flex-grow">
                    {" "}
                    {/* Allow content to grow */}
                    <p className="line-clamp-3 text-sm text-foreground/70">
                      {blog.excerpt}
                    </p>
                  </CardContent>
                  <CardFooter className="p-4 pt-2 flex justify-between items-center mt-auto">
                    {" "}
                    {/* Push footer down */}
                    <div className="flex items-center gap-2 text-sm">
                      <img
                        src={blog.author.avatar}
                        alt={blog.author.name}
                        className="h-6 w-6 rounded-full object-cover"
                      />
                      <span className="text-xs truncate">
                        {blog.author.name}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/blogs/${blog.id}`}>View</Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Edit (coming soon)"
                        disabled
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        title="Delete"
                        onClick={() => handleDelete(blog.id, blog.title)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-md">
              <h2 className="text-xl font-medium">No published blogs yet</h2>
              <p className="text-foreground/70 mt-2">
                Create your first blog post using the button above.
              </p>
              <Button
                className="mt-4 bg-blog-primary hover:bg-blog-secondary"
                asChild
              >
                <Link to="/create-blog">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Blog
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Drafts Tab */}
        <TabsContent value="drafts" className="pt-6">
          {draftBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Map over draftBlogs here when implemented */}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-md">
              <h2 className="text-xl font-medium">No draft blogs</h2>
              <p className="text-foreground/70 mt-2">
                Blogs saved as drafts will appear here.
              </p>
              {/* Add button to create draft if needed */}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardPage;
