import { useEffect, useState } from "react";
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
import { BookOpen, Edit, Plus, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Blog } from "@/lib/blog-data";

const DashboardPage = () => {
  const { getToken } = useAuth();
  const { user } = useUser();
  const { toast } = useToast();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapBlogData = (data: any[]): Blog[] =>
    data.map((blog) => ({ ...blog, id: blog._id || blog.id }));
  const fetchBlogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/blogs");
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setBlogs(mapBlogData(data));
    } catch (e: any) {
      console.error("Failed to fetch blogs:", e);
      const errorMsg = e.message || "Failed to load blogs.";
      setError(errorMsg);
      toast({ title: "Error", description: errorMsg, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    document.title = "Writique - Dashboard";
    fetchBlogs();
  }, []);
  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try {
      const response = await fetch(`/api/blogs/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.msg || `Delete failed: ${response.status}`);
      }
      setBlogs((prevBlogs) => prevBlogs.filter((blog) => blog.id !== id));
      toast({ title: "Blog Deleted", description: `"${title}" removed.` });
    } catch (error: any) {
      console.error("Delete failed:", error);
      toast({
        title: "Deletion Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  const publishedBlogs = blogs;
  const publishedCount = publishedBlogs.length;
  const totalViews = 0;
  return (
    <div className="space-y-8 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold md:text-4xl">Dashboard</h1>
        <p className="text-foreground/70">
          Welcome, {user?.firstName || "there"}!
        </p>
        <Button asChild>
          <Link to="/create-blog">
            <Plus className="mr-2 h-4 w-4" />
            New Blog
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">
              {isLoading ? "-" : publishedCount}
            </CardTitle>
            <CardDescription>Published</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">
              {isLoading ? "-" : totalViews}
            </CardTitle>
            <CardDescription>Total Views</CardDescription>
          </CardHeader>
        </Card>
      </div>
      <Tabs defaultValue="published">
        <TabsList>
          <TabsTrigger value="published">
            Published ({isLoading ? "..." : publishedCount})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="published" className="pt-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive border rounded-md">
              <h2 className="text-xl font-medium">Error</h2>
              <p className="mt-2">{error}</p>
              <Button variant="outline" onClick={fetchBlogs} className="mt-4">
                Retry
              </Button>
            </div>
          ) : publishedBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publishedBlogs.map((blog) => (
                <Card key={blog.id} className="flex flex-col">
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={blog.imageUrl}
                      alt={blog.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-lg line-clamp-2">
                      {blog.title}
                    </CardTitle>
                    <CardDescription className="flex justify-between items-center text-xs pt-1">
                      <span>{new Date(blog.date).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {blog.readTime}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 flex-grow">
                    <p className="line-clamp-3 text-sm text-muted-foreground">
                      {blog.excerpt}
                    </p>
                  </CardContent>
                  <CardFooter className="p-4 pt-2 flex justify-between items-center mt-auto">
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
                        title="Edit"
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
              <h2 className="text-xl font-medium">No blogs published</h2>
              <p className="text-muted-foreground mt-2">Create one now.</p>
              <Button className="mt-4" asChild>
                <Link to="/create-blog">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Blog
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
export default DashboardPage;
