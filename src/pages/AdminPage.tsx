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
  Trash2,
} from "lucide-react";
import { Blog } from "@/lib/blog-data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";

const AdminPage = () => {
  const navigate = useNavigate();
  const { userId, isLoaded } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const isAdmin = userId?.includes("user_2jxxxx"); // Replace with your actual admin check logic

  const mapBlogData = (data: any[]): Blog[] =>
    data.map((blog) => ({ ...blog, id: blog._id || blog.id }));
  const fetchAdminData = async () => {
    if (!isLoaded) return;
    setLoading(true);
    setError(null);
    if (!isAdmin) {
      navigate("/dashboard");
      toast({ title: "Access denied", variant: "destructive" });
      setLoading(false);
      return;
    }
    try {
      const response = await fetch("/api/blogs");
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setBlogs(mapBlogData(data));
    } catch (e: any) {
      console.error("Failed to fetch admin data:", e);
      const errorMsg = e.message || "Failed to load data.";
      setError(errorMsg);
      toast({ title: "Error", description: errorMsg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Writique - Admin";
    fetchAdminData();
  }, [isAdmin, isLoaded, navigate]);
  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`ADMIN ACTION: Delete "${title}"?`)) return;
    try {
      const response = await fetch(`/api/blogs/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.msg || `Delete failed`);
      }
      setBlogs((prevBlogs) => prevBlogs.filter((blog) => blog.id !== id));
      toast({ title: "Blog Deleted", description: `"${title}" removed.` });
    } catch (error: any) {
      console.error("Delete failed:", error);
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  const pendingBlogs = blogs.slice(0, 0); // Placeholder - Adjust if backend adds status
  const allBlogs = blogs;
  const users: any[] = []; // Placeholder - Implement user fetching if needed

  if (!isLoaded || loading)
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </div>
    );
  if (error)
    return (
      <div className="text-center py-12 text-destructive border rounded-md">
        <h2 className="text-xl font-medium">Error</h2>
        <p className="mt-2">{error}</p>
        <Button variant="outline" onClick={fetchAdminData} className="mt-4">
          Retry
        </Button>
      </div>
    );

  return (
    <div className="space-y-8 p-4 md:p-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold md:text-4xl">Admin Panel</h1>
          <p className="text-muted-foreground">Manage content and users</p>
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
            <CardDescription>Users</CardDescription>
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
          {/* Add Pending Approval section if status field is implemented */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                All Blogs ({allBlogs.length})
              </CardTitle>
              <CardDescription>Manage all blogs</CardDescription>
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
                          onClick={() => handleDelete(blog.id, blog.title)}
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
            <h3 className="text-xl font-medium">
              User Management Not Implemented
            </h3>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="pt-6">
          <div className="text-center py-12 border rounded-md">
            <h3 className="text-xl font-medium">Analytics Not Implemented</h3>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
export default AdminPage;
