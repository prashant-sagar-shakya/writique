import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  BarChart,
  BookOpen,
  Check,
  Clock,
  Loader2,
  Shield,
  Trash2,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { allBlogs } from "@/lib/blog-data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

const AdminPage = () => {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // This would come from Clerk in a real implementation
  const isAdmin = userId === "admin-user-id";

  // In a real app, these would be fetched from a database
  const pendingBlogs = allBlogs.slice(0, 3);
  const users = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      role: "user",
      status: "active",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "admin",
      status: "active",
    },
    {
      id: "3",
      name: "Bob Johnson",
      email: "bob@example.com",
      role: "user",
      status: "inactive",
    },
    {
      id: "4",
      name: "Alice Brown",
      email: "alice@example.com",
      role: "user",
      status: "active",
    },
    {
      id: "5",
      name: "Charlie Davis",
      email: "charlie@example.com",
      role: "user",
      status: "pending",
    },
  ];

  useEffect(() => {
    document.title = "Writique - Admin";

    // Simulate checking admin status
    setLoading(true);
    setTimeout(() => {
      setLoading(false);

      // Redirect if not admin
      if (!isAdmin && !userId?.includes("admin")) {
        toast({
          title: "Access denied",
          description: "You don't have permission to access the admin panel.",
          variant: "destructive",
        });
        navigate("/dashboard");
      }
    }, 1000);
  }, [isAdmin, navigate, userId]);

  const handleApproveBlog = (id: string) => {
    toast({
      title: "Blog approved",
      description: "The blog has been published successfully.",
    });
  };

  const handleRejectBlog = (id: string) => {
    toast({
      title: "Blog rejected",
      description: "The blog has been rejected and author notified.",
      variant: "destructive",
    });
  };

  const handleUpdateUserRole = (id: string, role: string) => {
    toast({
      title: "User role updated",
      description: `User role has been updated to ${role}.`,
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blog-primary" />
          <p className="mt-4 text-lg">Verifying permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-blog-primary" />
        <div>
          <h1 className="text-3xl font-bold md:text-4xl">Admin Panel</h1>
          <p className="text-foreground/70">
            Manage blogs, users, and site settings
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">267</CardTitle>
            <CardDescription>Total Blogs</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">3</CardTitle>
            <CardDescription>Pending Approval</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">152</CardTitle>
            <CardDescription>Registered Users</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">4.8K</CardTitle>
            <CardDescription>Total Views</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="blogs">
        <TabsList>
          <TabsTrigger value="blogs">Blog Management</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="blogs" className="pt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Clock className="h-5 w-5" /> Pending Approval
              </CardTitle>
              <CardDescription>
                Review and approve new blog submissions
              </CardDescription>
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
                  {pendingBlogs.map((blog) => (
                    <TableRow key={blog.id}>
                      <TableCell className="font-medium">
                        {blog.title}
                      </TableCell>
                      <TableCell>{blog.author.name}</TableCell>
                      <TableCell>{blog.category}</TableCell>
                      <TableCell>{blog.date}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleApproveBlog(blog.id)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleRejectBlog(blog.id)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <BookOpen className="h-5 w-5" /> All Blogs
              </CardTitle>
              <CardDescription>Manage all published blogs</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allBlogs.slice(0, 5).map((blog) => (
                    <TableRow key={blog.id}>
                      <TableCell className="font-medium">
                        {blog.title}
                      </TableCell>
                      <TableCell>{blog.author.name}</TableCell>
                      <TableCell>{blog.category}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          Published
                        </Badge>
                      </TableCell>
                      <TableCell>{Math.floor(Math.random() * 500)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="pt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Users className="h-5 w-5" /> Manage Users
              </CardTitle>
              <CardDescription>
                View and manage user accounts and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === "admin" ? "default" : "outline"
                          }
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            user.status === "active"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : user.status === "inactive"
                              ? "bg-gray-50 text-gray-700 border-gray-200"
                              : "bg-yellow-50 text-yellow-700 border-yellow-200"
                          }
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleUpdateUserRole(
                              user.id,
                              user.role === "admin" ? "user" : "admin"
                            )
                          }
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          {user.role === "admin"
                            ? "Remove Admin"
                            : "Make Admin"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <BarChart className="h-5 w-5" /> Analytics Dashboard
              </CardTitle>
              <CardDescription>
                View site performance metrics and user engagement
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center p-12 border border-dashed rounded-lg">
                <h3 className="text-xl font-medium mb-2">
                  Analytics Coming Soon
                </h3>
                <p className="text-foreground/70">
                  Detailed analytics dashboard will be available in the next
                  update
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
