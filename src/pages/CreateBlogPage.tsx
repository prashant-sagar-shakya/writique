import { useState, useEffect } from "react";
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
import { categories } from "@/lib/blog-data";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Loader2, Paperclip, XCircle } from "lucide-react";

const CreateBlogPage = () => {
  const { user } = useUser();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [imageUrl, setImageUrl] = useState(""); // For manual URL input/pasting
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // State for the selected file object
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); // For local file preview
  const [authorName, setAuthorName] = useState("");
  const [authorAvatar, setAuthorAvatar] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setAuthorName(user.fullName || "");
      setAuthorAvatar(user.imageUrl || "");
    }
  }, [user]);

  // Effect to create local preview URL when a file is selected
  useEffect(() => {
    let objectUrl: string | null = null;
    if (selectedFile) {
      objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
    } else {
      setPreviewUrl(null); // Clear preview if file is removed
    }
    // Cleanup function to revoke the object URL
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [selectedFile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!title || !content || !category || !excerpt || !authorName) {
      toast({
        title: "Missing fields",
        description: "Please fill required fields.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Prepare FormData
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("category", category);
    formData.append("excerpt", excerpt);
    formData.append("date", new Date().toISOString().split("T")[0]);
    formData.append(
      "readTime",
      `${Math.ceil(content.split(" ").length / 200)} min read`
    );

    // Author needs to be stringified for FormData
    const finalAuthorName = authorName || "Anonymous";
    const finalAuthorAvatar = authorAvatar || "https://i.pravatar.cc/150?img=1";
    formData.append(
      "author",
      JSON.stringify({ name: finalAuthorName, avatar: finalAuthorAvatar })
    );

    // Append the actual file if selected, otherwise append the manual image URL (or default)
    if (selectedFile) {
      formData.append("imageFile", selectedFile); // Backend expects 'imageFile'
      console.log("Appending file to FormData:", selectedFile.name);
    } else {
      const finalImageUrl =
        imageUrl ||
        "https://images.unsplash.com/photo-1674027444485-cec3da58eef4?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
      formData.append("imageUrl", finalImageUrl); // Backend can check for this if no file
      console.log("Appending manual/default URL to FormData:", finalImageUrl);
    }

    try {
      // No need for Content-Type header, FormData sets it automatically
      const response = await fetch("/api/blogs", {
        method: "POST",
        body: formData, // Send FormData directly
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({
            msg: "An unknown error occurred during blog creation.",
          }));
        throw new Error(
          errorData.msg || `HTTP error! status: ${response.status}`
        );
      }

      toast({
        title: "Blog created successfully!",
        description: "Post saved & image uploaded.",
      });
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Failed to create blog:", error);
      toast({
        title: "Error Creating Blog",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Basic size check on frontend (optional, backend limit is definitive)
      if (file.size > 10 * 1024 * 1024) {
        // ~10MB
        toast({
          title: "File Too Large",
          description: "Image must be under 10MB.",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
      setImageUrl(""); // Clear manual URL if a file is chosen
      toast({ title: "Image Selected", description: file.name });
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    // Optionally clear preview here if needed, though useEffect handles it
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
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={category}
            onValueChange={setCategory}
            required
            disabled={isLoading}
          >
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
        </div>
        <div className="space-y-2">
          <Label htmlFor="excerpt">Excerpt</Label>
          <Textarea
            id="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Write a brief summary..."
            rows={3}
            required
            maxLength={200}
            className="text-base resize-y"
            disabled={isLoading}
          />
          <p className="text-sm text-muted-foreground">
            {excerpt.length}/200 chars
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="image-file-input">Featured Image</Label>
          <div className="flex items-center gap-4">
            {/* Hidden File Input */}
            <input
              type="file"
              id="image-file-input"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            {/* Button to Trigger File Input */}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                document.getElementById("image-file-input")?.click()
              }
              disabled={isLoading}
            >
              <Paperclip className="mr-2 h-4 w-4" /> Choose File
            </Button>
            {/* Manual URL Input */}
            <Input
              id="imageUrlInput"
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                setSelectedFile(null);
              }}
              placeholder="Or paste image URL"
              className="text-sm"
              disabled={isLoading}
            />
          </div>
          {/* Preview Area */}
          {selectedFile && previewUrl && (
            <div className="mt-2 flex items-center gap-2 border p-2 rounded-md">
              <img
                src={previewUrl}
                alt="Preview"
                className="h-16 w-16 rounded object-cover"
              />
              <div className="text-sm overflow-hidden">
                <p className="font-medium truncate">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={clearSelectedFile}
                className="ml-auto text-muted-foreground hover:text-destructive h-6 w-6"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          )}
          {!selectedFile &&
            imageUrl && ( // Show pasted URL preview if no file is selected
              <div className="mt-2">
                <img
                  src={imageUrl}
                  alt="URL Preview"
                  className="h-16 w-auto rounded border object-cover"
                />
              </div>
            )}
          <p className="text-xs text-muted-foreground mt-1">
            Max 10MB. Choose a file OR paste a URL.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="authorName">Author Name</Label>
            <Input
              id="authorName"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Author's name"
              required
              className="text-base"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="authorAvatar">Author Avatar URL</Label>
            <Input
              id="authorAvatar"
              value={authorAvatar}
              onChange={(e) => setAuthorAvatar(e.target.value)}
              placeholder="Optional URL"
              className="text-base"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Defaults to profile.
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write content (Markdown supported)..."
            rows={15}
            required
            className="text-base resize-y"
            disabled={isLoading}
          />
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Publishing..." : "Publish Blog Post"}
          </Button>
        </div>
      </form>
    </div>
  );
};
export default CreateBlogPage;
