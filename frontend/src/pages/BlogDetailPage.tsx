import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  ChevronLeft,
  Heart,
  Share2,
  Loader2,
  Eye,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SignedIn } from "@clerk/clerk-react";
import { useToast } from "@/components/ui/use-toast";
import { Blog, UserProfile } from "@/lib/blog-data";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const BlogDetailPage = () => {
  const { blogId } = useParams<{ blogId: string }>();
  const { getToken, isSignedIn } = useAuth();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [viewCount, setViewCount] = useState<number | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const mapBlogData = (data: any[]): Blog[] =>
    data.map((b) => ({ ...b, id: b._id || b.id, views: b.views ?? 0 }));

  useEffect(() => {
    let isMounted = true;
    const incrementView = async () => {
      if (!blogId || !isSignedIn) return;
      try {
        const token = await getToken();
        if (!token) return;
        const response = await fetch(`/api/blogs/${blogId}/increment-views`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          if (isMounted && data.views !== undefined) setViewCount(data.views);
        } else {
          console.warn(`View count failed: ${response.status}`);
        }
      } catch (err) {
        console.warn("View count fetch failed:", err);
      }
    };
    const fetchAllData = async () => {
      if (!blogId) return;
      setIsLoading(true);
      setError(null);
      setBlog(null);
      setRelatedBlogs([]);
      setViewCount(null);
      setIsLiked(false);
      try {
        const token = await getToken();
        const blogFetch = fetch(`/api/blogs/${blogId}`);
        const userFetch =
          isSignedIn && token
            ? fetch("/api/users/me", {
                headers: { Authorization: `Bearer ${token}` },
              })
            : Promise.resolve(null);
        const [blogResponse, userResponse] = await Promise.all([
          blogFetch,
          userFetch,
        ]);
        if (!isMounted) return;
        if (blogResponse.status === 404) throw new Error("Not found");
        if (!blogResponse.ok) throw new Error(`${blogResponse.status}`);
        const fetchedBlogData: Blog = await blogResponse.json();
        const formattedBlog = mapBlogData([fetchedBlogData])[0];
        if (!isMounted) return;
        setBlog(formattedBlog);
        setViewCount(formattedBlog.views ?? 0);
        document.title = `W - ${formattedBlog.title}`;
        if (userResponse?.ok) {
          const userData: UserProfile = await userResponse.json();
          if (userData && Array.isArray(userData.favorites)) {
            const liked = userData.favorites.some(
              (favId: any) => favId === blogId || favId?._id === blogId
            );
            setIsLiked(liked);
          }
        }
        const allBlogsResponse = await fetch("/api/blogs");
        if (!allBlogsResponse.ok) console.warn("Related failed");
        const allBlogsData = await allBlogsResponse.json();
        if (!isMounted) return;
        const related = mapBlogData(allBlogsData.blogs || [])
          .filter(
            (b) =>
              b.category === formattedBlog.category && b.id !== formattedBlog.id
          )
          .slice(0, 3);
        setRelatedBlogs(related);
        if (isSignedIn && isMounted) incrementView();
      } catch (e: any) {
        if (isMounted) {
          setError(e.message || "Failed.");
          document.title = "W - Error";
          if (e.message !== "Not found")
            toast({ title: "Error", variant: "destructive" });
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchAllData();
    return () => {
      isMounted = false;
    };
  }, [blogId, toast, isSignedIn, getToken]);

  const toggleLike = async () => {
    if (!blogId || !isSignedIn || isLikeLoading) return;
    setIsLikeLoading(true);
    const currentLikedStatus = isLiked;
    try {
      const token = await getToken();
      if (!token) throw new Error("Auth token required");
      const method = currentLikedStatus ? "DELETE" : "POST";
      const url = `/api/users/me/favorites/${blogId}`; // Check if this is the correct endpoint structure
      console.log(`Toggling Like: Method=${method}, URL=${url}`); // <<< Add log
      const response = await fetch(url, {
        method: method,
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`Toggle Like Response Status: ${response.status}`); // <<< Add log
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({
            msg: `Request failed with status ${response.status}`,
          }));
        throw new Error(errorData.msg || `Failed`);
      }
      setIsLiked(!currentLikedStatus);
      toast({ title: currentLikedStatus ? "Removed" : "Added" });
    } catch (error: any) {
      console.error("Like/Unlike failed:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleShare = () => {
    if (!blog) return;
    if (navigator.share) {
      navigator
        .share({
          title: blog.title,
          text: blog.excerpt,
          url: window.location.href,
        })
        .catch(console.log);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Copied!" });
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  if (error === "Not found" || !blog)
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl">Not Found</h1>
        <p>Blog removed?</p>
        <Button onClick={() => navigate("/blogs")}>
          <ChevronLeft />
          Back
        </Button>
      </div>
    );
  if (error)
    return (
      <div className="text-center py-16 text-destructive">
        <h1 className="text-xl">Error</h1>
        <p>{error}</p>
        <Button onClick={() => window.location.reload()}>Reload</Button>
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto space-y-10 py-8 px-4 md:px-0">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      <article className="space-y-6">
        <header className="space-y-3 border-b pb-6">
          <Badge variant="secondary">{blog.category}</Badge>
          <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">
            {blog.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7">
                <AvatarImage src={blog.author.avatar} />
                <AvatarFallback>{blog.author.name[0]}</AvatarFallback>
              </Avatar>
              <span>{blog.author.name}</span>
            </div>
            <span>•</span>
            <time dateTime={blog.date}>
              {new Date(blog.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            <span>•</span>
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              {blog.readTime}
            </span>
            {viewCount !== null && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {viewCount} views
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 pt-2">
            <SignedIn>
              <Button
                variant="outline"
                size="sm"
                className={`gap-1 ${
                  isLiked ? "border-red-300 text-red-600" : ""
                }`}
                onClick={toggleLike}
                disabled={isLikeLoading}
              >
                {isLikeLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Heart
                    className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`}
                  />
                )}
                {isLiked ? "Liked" : "Like"}
              </Button>
            </SignedIn>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="gap-1"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </header>
        {blog.imageUrl && (
          <div className="rel my-6 rounded-lg ovf-hidden justify-center items-center flex">
            <img
              src={blog.imageUrl}
              alt={blog.title}
              className="obj-cover w-[50%] h-[50%]"
            />
          </div>
        )}
        <div className="prose dark:prose-invert max-w-none lg:prose-lg prose-img:rounded-md prose-img:border">
          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={atomDark}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {blog.content}
          </ReactMarkdown>
        </div>
      </article>
      <Separator />
      {relatedBlogs.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-bold">Related</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedBlogs.map((rb) => (
              <Link to={`/blogs/${rb.id}`} key={rb.id} className="group">
                <Card className="h-full shadow hover:shadow-md">
                  <div className="aspect-[16/10] ovf-hidden border-b">
                    <img
                      src={rb.imageUrl}
                      alt={rb.title}
                      className="obj-cover w-full h-full group-hover:scale-105 tr-transform"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold lc-2 group-hover:text-primary">
                      {rb.title}
                    </h3>
                    <p className="text-xs mt-1 lc-2">{rb.excerpt}</p>
                    <div className="text-xs mt-2">
                      {new Date(rb.date).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
export default BlogDetailPage;
