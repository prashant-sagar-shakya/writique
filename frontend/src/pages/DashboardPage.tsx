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
import { Blog } from "@/lib/blog-data"; // Ensure 'views' is optional or number in interface
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
  const [publishedCount, setPublishedCount] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [blogToDelete, setBlogToDelete] = useState<{
    id: string;
    title: string;
    isOwner: boolean;
  } | null>(null);

  const mapBlogData = (data: any[]): Blog[] => {
    if (!Array.isArray(data)) {
      console.error("mapBlogData received non-array", data);
      return [];
    }
    return data.map((blog) => ({
      ...blog,
      id: blog._id || blog.id,
      authorClerkId: blog.authorClerkId,
      views: blog.views ?? 0,
    }));
  };

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    setIsAdminRole(false);
    setBlogs([]);
    setPublishedCount(0);
    setTotalViews(0);
    try {
      const token = await getToken();
      if (!token) throw new Error("Auth Error");

      const meResponse = await fetch("/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      let userIsAdmin = false;
      if (meResponse.ok) {
        const userData = await meResponse.json();
        if (userData?.role === "admin") userIsAdmin = true;
      }
      setIsAdminRole(userIsAdmin);

      let blogApiUrl = "/api/blogs";
      // If NOT admin, fetch ONLY the current user's blogs
      if (!userIsAdmin && clerkUserId) {
        blogApiUrl += `?authorId=${clerkUserId}`;
      }

      const blogsResponse = await fetch(blogApiUrl);
      if (!blogsResponse.ok)
        throw new Error(`Blogs Error: ${blogsResponse.status}`);
      const apiResponse = await blogsResponse.json(); // Get { blogs: [], totalCount: num }

      // *** FIX: Access .blogs property ***
      const mappedBlogs = mapBlogData(apiResponse.blogs || []);

      setBlogs(mappedBlogs);
      setPublishedCount(apiResponse.totalCount ?? 0); // Use count from API

      // Calculate views sum from the blogs fetched for this specific user/admin
      const viewsSum = mappedBlogs.reduce(
        (sum, blog) => sum + (blog.views || 0),
        0
      );
      setTotalViews(viewsSum);
    } catch (e: any) {
      console.error("Fetch failed:", e);
      setError(e.message || "Failed load.");
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Writique - Dashboard";
    fetchData();
  }, [getToken, clerkUserId]); // Rerun if user changes

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
      toast({ title: "Deleted" });
      setBlogToDelete(null);
      fetchData(); // Refetch data to get updated counts
    } catch (error: any) {
      console.error("Delete failed:", error);
      toast({ title: "Error", variant: "destructive" });
      setBlogToDelete(null);
    }
  };

  const handleDeleteClick = (id: string, title: string, isOwner: boolean) => {
    setBlogToDelete({ id, title, isOwner });
  };

  // Filter blogs on the client-side *only if* admin view hasn't already pre-filtered
  // Normally, the API call itself handles the filtering
  const displayedBlogs = blogs; // Using blogs directly fetched via API (already filtered if needed)

  return (
    <div className="space-y-8 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold md:text-4xl">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome, {user?.firstName || "User"}!
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button asChild>
            <Link to="/create-blog">
              <Plus className="mr-2 h-4 w-4" />
              New
            </Link>
          </Button>
          {isAdminRole && (
            <Button variant="secondary" size="sm" asChild>
              <Link to="/admin">Admin</Link>
            </Button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xl md:text-2xl">
              {isLoading ? "-" : publishedCount}
            </CardTitle>
            <CardDescription>
              {isAdminRole ? "Total Published" : "Your Published"}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xl md:text-2xl">
              {isLoading ? "-" : totalViews}
            </CardTitle>
            <CardDescription>
              {isAdminRole ? "Total Blog Views" : "Your Blog Views"}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
      <Tabs defaultValue="published">
        <TabsList>
          <TabsTrigger value="published">
            {isAdminRole ? "All Published" : "Your Published"} (
            {isLoading ? "..." : publishedCount})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="published" className="pt-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-12 border rounded text-destructive">
              <h2 className="text-xl">Error</h2>
              <p>{error}</p>
              <Button onClick={fetchData}>Retry</Button>
            </div>
          ) : // Map over the 'displayedBlogs' which are already correctly fetched
          displayedBlogs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedBlogs.map((blog) => {
                const isOwner = blog.authorClerkId === clerkUserId;
                return (
                  <Card key={blog.id} className="flex flex-col">
                    <div className="aspect-[16/9] overflow-hidden">
                      <img
                        src={blog.imageUrl}
                        alt={blog.title}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
                      <CardTitle className="text-base sm:text-lg lc-2">
                        {blog.title}
                      </CardTitle>
                      <CardDescription className="flex justify-between items-center text-xs pt-1">
                        <span>{new Date(blog.date).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {blog.readTime} | {blog.views ?? 0} views
                        </span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4 pt-1 sm:pt-0 grow">
                      <p className="lc-3 text-xs sm:text-sm text-muted-foreground">
                        {blog.excerpt}
                      </p>
                    </CardContent>
                    <CardFooter className="p-3 sm:p-4 pt-1 sm:pt-2 flex justify-between items-center mt-auto">
                      <div className="flex items-center gap-1 sm:gap-2 text-sm">
                        <img
                          src={blog.author.avatar}
                          alt={blog.author.name}
                          className="h-5 w-5 sm:h-6 sm:w-6 rounded-full obj-cover"
                        />
                        <span className="text-xs truncate">
                          {blog.author.name}
                        </span>
                      </div>
                      <div className="flex gap-0.5 sm:gap-1">
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
              <h2 className="text-xl">
                {isAdminRole
                  ? "No blogs found"
                  : "You haven't published blogs yet"}
              </h2>
              <p className="text-muted-foreground mt-2">Create one!</p>
              <Button className="mt-4" asChild>
                <Link to="/create-blog">
                  <Plus className="h-4 w-4 mr-2" />
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
              Confirm
            </AlertDialogTitle>
            <AlertDialogDescription>
              Delete "{blogToDelete?.title || "this"}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBlogToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
export default DashboardPage;
