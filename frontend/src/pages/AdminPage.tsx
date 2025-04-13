import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Loader2,
  Shield,
  ShieldAlert,
  Trash2,
  Users,
} from "lucide-react";
import { Blog } from "@/lib/blog-data"; // Assuming Blog interface exists here
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"; // Import AlertDialog
import { AlertTriangle } from "lucide-react"; // For Dialog Icon

interface FetchedUser {
  id: string;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  role: "admin" | "user";
  createdAt: string;
  updatedAt: string;
}

const AdminPage = () => {
  const navigate = useNavigate();
  const { getToken, isLoaded: isClerkLoaded, isSignedIn } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [blogToDelete, setBlogToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null); // State for dialog
  // const [users, setUsers] = useState<FetchedUser[]>([]);

  const mapBlogData = (data: any[]): Blog[] =>
    data.map((blog) => ({ ...blog, id: blog._id || blog.id }));

  useEffect(() => {
    document.title = "Writique - Admin";
    const checkAdminStatusAndFetchData = async () => {
      setIsLoading(true);
      setError(null);
      setIsAdminUser(false);
      if (!isClerkLoaded) return;
      if (!isSignedIn) {
        toast({ title: "Unauthorized", variant: "destructive" });
        navigate("/auth");
        return;
      }
      try {
        const token = await getToken();
        if (!token) throw new Error("Auth token missing.");
        const meResponse = await fetch("/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!meResponse.ok)
          throw new Error(`Role check failed (${meResponse.status})`);
        const userData: FetchedUser = await meResponse.json();
        if (userData && userData.role === "admin") {
          setIsAdminUser(true);
          const blogsResponse = await fetch("/api/blogs");
          if (!blogsResponse.ok)
            throw new Error(`Blog Fetch Error: ${blogsResponse.status}`);
          const blogsData = await blogsResponse.json();
          setBlogs(mapBlogData(blogsData));
          // TODO: Fetch users data if needed
        } else {
          throw new Error("Access denied. Admin privileges required.");
        }
      } catch (e: any) {
        console.error("Admin Check/Fetch failed:", e);
        setError(e.message || "Failed load or verify role.");
        toast({
          title: "Access Denied",
          description: e.message,
          variant: "destructive",
        });
        navigate("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };
    checkAdminStatusAndFetchData();
  }, [isClerkLoaded, isSignedIn, getToken, navigate, toast]);

  const handleDeleteClick = (id: string, title: string) => {
    setBlogToDelete({ id, title }); // Open the confirmation dialog
  };

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
      setBlogs((prevBlogs) => prevBlogs.filter((blog) => blog.id !== id));
      toast({ title: "Blog Deleted", description: `"${title}" removed.` });
      setBlogToDelete(null); // Close dialog
    } catch (error: any) {
      console.error("Delete failed:", error);
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
      setBlogToDelete(null); // Close dialog on error
    }
  };

  const pendingBlogs = blogs.slice(0, 0);
  const allBlogs = blogs;
  const users: FetchedUser[] = [];

  if (isLoading || !isClerkLoaded) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (error && !isLoading) {
    return (
      <div className="container mx-auto text-center py-16 text-destructive border rounded-md bg-destructive/5">
        <ShieldAlert className="h-12 w-12 mx-auto mb-4" />
        <h1 className="text-2xl font-bold">Access Issue</h1>
        <p className="mt-2">{error}</p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => navigate("/dashboard")}
        >
          Go to Dashboard
        </Button>
      </div>
    );
  }
  if (!isAdminUser) {
    return (
      <div className="text-center py-10">
        <p>Insufficient permissions.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold md:text-4xl">Admin Panel</h1>
          <p className="text-muted-foreground">Content & User Management</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{blogs.length}</CardTitle>
            <CardDescription>Total Blogs</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{pendingBlogs.length}</CardTitle>
            <CardDescription>Pending</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{users.length}</CardTitle>
            <CardDescription>Users (N/A)</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">0</CardTitle>
            <CardDescription>Views (N/A)</CardDescription>
          </CardHeader>
        </Card>
      </div>
      <Tabs defaultValue="blogs">
        <TabsList>
          <TabsTrigger value="blogs">Blog Management</TabsTrigger>
          <TabsTrigger value="users">User Management (N/A)</TabsTrigger>
          <TabsTrigger value="analytics">Analytics (N/A)</TabsTrigger>
        </TabsList>
        <TabsContent value="blogs" className="pt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                All Blogs ({allBlogs.length})
              </CardTitle>
              <CardDescription>Manage all blog posts</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allBlogs.map((blog) => (
                    <TableRow key={blog.id}>
                      <TableCell
                        className="font-medium max-w-xs truncate"
                        title={blog.title}
                      >
                        {blog.title}
                      </TableCell>
                      <TableCell>{blog.author.name}</TableCell>
                      <TableCell>{blog.category}</TableCell>
                      <TableCell>
                        {new Date(blog.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDeleteClick(blog.id, blog.title)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {allBlogs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No blogs found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="users" className="pt-6">
          <div className="text-center py-12 border rounded-md">
            <h3 className="text-xl font-medium">User Management N/A</h3>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="pt-6">
          <div className="text-center py-12 border rounded-md">
            <h3 className="text-xl font-medium">Analytics N/A</h3>
          </div>
        </TabsContent>
      </Tabs>
      {/* Confirmation Dialog for Delete */}
      <AlertDialog
        open={!!blogToDelete}
        onOpenChange={(open) => !open && setBlogToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="text-destructive h-5 w-5" />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              Permanently delete blog "{blogToDelete?.title || "this blog"}"?
              This action cannot be undone.
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
export default AdminPage;
