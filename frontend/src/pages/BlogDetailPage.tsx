import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ChevronLeft, Heart, Share2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SignedIn } from "@clerk/clerk-react";
import { useToast } from "@/components/ui/use-toast";
import { Blog } from "@/lib/blog-data";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism"; // Keep or choose another theme

const BlogDetailPage = () => {
  const { blogId } = useParams<{ blogId: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const mapBlogData = (data: any[]): Blog[] =>
    data.map((blog) => ({ ...blog, id: blog._id || blog.id }));
  useEffect(() => {
    const fetchBlogAndRelated = async () => {
      if (!blogId) return;
      setIsLoading(true);
      setError(null);
      setBlog(null);
      setRelatedBlogs([]);
      try {
        // First increment views
        await fetch(`/api/blogs/${blogId}/increment-views`, {
          method: "POST",
        });

        const response = await fetch(`/api/blogs/${blogId}`);
        if (response.status === 404) throw new Error("Not found");
        if (!response.ok) throw new Error(`${response.status}`);
        const fetchedBlogData: Blog = await response.json();
        const formattedBlog = {
          ...fetchedBlogData,
          id: (fetchedBlogData as any)._id || fetchedBlogData.id,
        };
        setBlog(formattedBlog);
        document.title = `W - ${formattedBlog.title}`;
        const allBlogsResponse = await fetch("/api/blogs");
        if (!allBlogsResponse.ok) console.warn("Related fetch failed");
        const allBlogsData = await allBlogsResponse.json();
        const related = mapBlogData(allBlogsData)
          .filter(
            (b) =>
              b.category === formattedBlog.category && b.id !== formattedBlog.id
          )
          .slice(0, 3);
        setRelatedBlogs(related);
        window.scrollTo(0, 0);
      } catch (e: any) {
        setError(e.message || "Failed.");
        document.title = "W - Error";
        if (e.message !== "Not found") {
          toast({ title: "Error", variant: "destructive" });
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchBlogAndRelated();
  }, [blogId, toast]);
  const toggleLike = () => {
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? "Removed" : "Added",
      description: `"${blog?.title}" ${isLiked ? "rem" : "add"} favs.`,
    });
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
      toast({ title: "Link Copied!" });
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  if (error === "Not found" || !blog)
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold">Not Found</h1>
        <p>Blog removed?</p>
        <Button variant="outline" onClick={() => navigate("/blogs")}>
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
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(-1)}
        className="text-muted-foreground"
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      <article className="space-y-6">
        <header className="space-y-3 border-b pb-6">
          <Badge variant="secondary">{blog.category}</Badge>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
            {blog.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7">
                <AvatarImage src={blog.author.avatar} alt={blog.author.name} />
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
          </div>
          <div className="flex items-center gap-2 pt-2">
            <SignedIn>
              <Button
                variant="outline"
                size="sm"
                className={`gap-1 ${
                  isLiked ? "text-red-500 border-red-300" : ""
                }`}
                onClick={toggleLike}
              >
                <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
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
          <div className="aspect-video relative my-6 rounded-lg overflow-hidden border">
            <img
              src={blog.imageUrl}
              alt={blog.title}
              className="object-cover w-full h-full"
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
          <h2 className="text-2xl font-bold">Related Blogs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedBlogs.map((relatedBlog) => (
              <Link
                to={`/blogs/${relatedBlog.id}`}
                key={relatedBlog.id}
                className="group"
              >
                <Card className="overflow-hidden h-full transition-shadow hover:shadow-md">
                  <div className="aspect-[16/10] overflow-hidden border-b">
                    <img
                      src={relatedBlog.imageUrl}
                      alt={relatedBlog.title}
                      className="object-cover w-full h-full transition-transform group-hover:scale-105"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold line-clamp-2 group-hover:text-primary">
                      {relatedBlog.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {relatedBlog.excerpt}
                    </p>
                    <div className="text-xs text-muted-foreground mt-2">
                      {new Date(relatedBlog.date).toLocaleDateString()}
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
