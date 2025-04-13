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
import {
  BookOpen,
  Edit,
  Plus,
  Trash2,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Blog } from "@/lib/blog-data";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const DashboardPage = () => {
  const { getToken, userId: clerkUserId } = useAuth();
  const { user } = useUser();
  const { toast } = useToast();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdminRole, setIsAdminRole] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<{
    id: string;
    title: string;
    isOwner: boolean;
  } | null>(null);
  const mapBlogData = (data: any[]): Blog[] =>
    data.map((blog) => ({
      ...blog,
      id: blog._id || blog.id,
      authorClerkId: blog.authorClerkId,
    }));
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    setIsAdminRole(false);
    try {
      const token = await getToken();
      if (!token) throw new Error("Auth Error");
      const [blogsResponse, meResponse] = await Promise.all([
        fetch("/api/blogs"),
        fetch("/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      if (!blogsResponse.ok)
        throw new Error(`Blogs fetch error: ${blogsResponse.status}`);
      const blogsData = await blogsResponse.json();
      setBlogs(mapBlogData(blogsData));
      const blogsWithViews = await Promise.all(
        blogsData.map(async (blog: any) => {
          try {
            const viewsResponse = await fetch(
              `/api/blogs/${blog._id || blog.id}/views`
            );
            if (viewsResponse.ok) {
              const viewsData = await viewsResponse.json();
              return { ...blog, views: viewsData.count || 0 };
            }
            console.error("Views fetch failed:", viewsResponse.status);
          } catch (err) {
            console.error("Error fetching views:", err);
          }
          return { ...blog, views: 0 };
        })
      );
      setBlogs(mapBlogData(blogsWithViews));
      if (meResponse.ok) {
        const userData = await meResponse.json();
        if (userData && userData.role === "admin") setIsAdminRole(true);
      } else console.warn("Could not get user role");
    } catch (e: any) {
      console.error("Fetch failed:", e);
      setError(e.message || "Failed load.");
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    document.title = "Writique - Dashboard";
    fetchData();
  }, [getToken]);

  const confirmDelete = async () => {
    if (!blogToDelete) return;
    const { id, title } = blogToDelete;
    try {
      const token = await getToken();
      if (!token) throw new Error("Auth missing.");
      const response = await fetch(`/api/blogs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.msg || `Delete failed: ${response.status}`);
      }
      setBlogs((prev) => prev.filter((blog) => blog.id !== id));
      toast({ title: "Deleted", description: `"${title}" removed.` });
      setBlogToDelete(null);
    } catch (error: any) {
      console.error("Delete failed:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setBlogToDelete(null);
    }
  };
  const handleDeleteClick = (id: string, title: string, isOwner: boolean) => {
    setBlogToDelete({ id, title, isOwner });
  };
  const publishedBlogs = blogs.filter(
    (blog) => blog.authorClerkId === clerkUserId
  );
  const publishedCount = publishedBlogs.length;
  const totalViews = publishedBlogs.reduce(
    (sum, blog) => sum + (blog.views || 0),
    0
  );

  return (
    <div className="space-y-8 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold md:text-4xl">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome, {user?.firstName || "User"}!
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/create-blog">
              <Plus className="mr-2 h-4 w-4" />
              New Blog
            </Link>
          </Button>
          {isAdminRole && (
            <Button variant="secondary" asChild>
              <Link to="/admin">Admin</Link>
            </Button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <CardDescription>Views</CardDescription>
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
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive border rounded">
              <h2 className="text-xl">Error</h2>
              <p>{error}</p>
              <Button variant="outline" onClick={fetchData} className="mt-4">
                Retry
              </Button>
            </div>
          ) : publishedBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publishedBlogs.map((blog) => {
                const isOwner = blog.authorClerkId === clerkUserId;
                return (
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
                        {(isOwner || isAdminRole) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Edit"
                            asChild
                          >
                            <Link to={`/edit-blog/${blog.id}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                        {(isOwner || isAdminRole) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            title={
                              isAdminRole && !isOwner
                                ? "Admin Delete"
                                : "Delete"
                            }
                            onClick={() =>
                              handleDeleteClick(blog.id, blog.title, isOwner)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 border rounded">
              <h2 className="text-xl">No blogs</h2>
              <p className="text-muted-foreground mt-2">Create one!</p>
              <Button className="mt-4" asChild>
                <Link to="/create-blog">
                  <Plus className="mr-2 h-4 w-4" />
                  Create
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
      <AlertDialog
        open={!!blogToDelete}
        onOpenChange={(open) => !open && setBlogToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle
                className={
                  blogToDelete?.isOwner && !isAdminRole
                    ? "text-orange-500 h-5 w-5"
                    : "text-destructive h-5 w-5"
                }
              />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              Permanently delete "{blogToDelete?.title || "this blog"}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBlogToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
export default DashboardPage;
