import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categories, Blog } from "@/lib/blog-data";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useBlogs } from "@/context/BlogContext"; // Import the context hook
import { useUser } from "@clerk/clerk-react"; // Import useUser to prefill author

const CreateBlogPage = () => {
  const { user } = useUser(); // Get current user info from Clerk
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  // Prefill author name and attempt to get avatar from Clerk
  const [authorName, setAuthorName] = useState(user?.fullName || "");
  const [authorAvatar, setAuthorAvatar] = useState(user?.imageUrl || "");

  const { toast } = useToast();
  const navigate = useNavigate();
  const { addBlog } = useBlogs(); // Get addBlog from context

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !content || !category || !excerpt || !authorName) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const finalAuthorName = authorName || user?.fullName || "Anonymous";
    const finalAuthorAvatar =
      authorAvatar || user?.imageUrl || "https://i.pravatar.cc/150?img=1";

    const newBlog: Blog = {
      id: Date.now().toString(),
      title,
      excerpt,
      date: new Date().toISOString().split("T")[0],
      readTime: `${Math.ceil(content.split(" ").length / 200)} min read`,
      category,
      author: {
        name: finalAuthorName,
        avatar: finalAuthorAvatar,
      },
      imageUrl:
        imageUrl ||
        "https://images.unsplash.com/photo-1674027444485-cec3da58eef4?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      content,
    };

    addBlog(newBlog); // Add the blog using the context function

    toast({
      title: "Blog created successfully",
      description: "Your blog post has been saved.",
    });

    navigate("/dashboard");
  };

  const handleImageUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const reader = new FileReader();
          reader.onloadend = () => {
            setImageUrl(reader.result as string); // Use data URL for preview
          };
          reader.readAsDataURL(file);

          toast({
            title: "Image selected",
            description: `${file.name} is ready. URL will be used on submit.`,
          });
        } catch (error) {
          console.error("Image selection failed:", error);
          toast({
            title: "Image selection failed",
            description: "Could not process image. Please try again.",
            variant: "destructive",
          });
        }
      }
    };
    input.click();
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Create New Blog Post
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter blog title"
            required
            className="text-base"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={setCategory} required>
            <SelectTrigger id="category">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.name}>
                  <div className="flex items-center gap-2">
                    <cat.icon className="h-4 w-4 text-muted-foreground" />
                    {cat.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!category &&
            title && ( // Show required message only if title is entered
              <p className="text-sm text-red-500">Category is required.</p>
            )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="excerpt">Excerpt (Short Summary)</Label>
          <Textarea
            id="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Write a brief summary that appears in listings..."
            rows={2}
            required
            maxLength={200}
            className="text-base resize-y"
          />
          <p className="text-sm text-muted-foreground">
            {excerpt.length}/200 characters
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="image-upload-button">Featured Image</Label>
          <div className="flex items-center gap-4">
            <Button
              id="image-upload-button"
              type="button"
              variant="outline"
              onClick={handleImageUpload}
            >
              {imageUrl && imageUrl.startsWith("data:image")
                ? "Change Image"
                : "Upload Image"}
            </Button>
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Preview"
                className="h-16 w-auto rounded border object-cover" // Added object-cover
              />
            )}
          </div>
          <Input
            id="imageUrlInput"
            value={imageUrl.startsWith("data:image") ? "" : imageUrl} // Clear input if it's a data URL
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Or paste image URL here"
            className="mt-2 text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Upload an image (preview shown) or provide a direct URL.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="authorName">Author Name</Label>
            <Input
              id="authorName"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Enter author's name"
              required
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="authorAvatar">Author Avatar URL</Label>
            <Input
              id="authorAvatar"
              value={authorAvatar}
              onChange={(e) => setAuthorAvatar(e.target.value)}
              placeholder="Optional: Paste avatar URL or leave blank"
              className="text-base"
            />
            <p className="text-xs text-muted-foreground">
              Defaults to your profile if logged in.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your blog content here..."
            rows={5} // Increased rows
            required
            className="text-base resize-y"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit">Publish Blog Post</Button>
        </div>
      </form>
    </div>
  );
};

export default CreateBlogPage;
