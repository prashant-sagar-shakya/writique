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
import { useAuth } from "@clerk/clerk-react";
import { Loader2, Paperclip, XCircle } from "lucide-react";

const CreateBlogPage = () => {
  const { getToken } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let objectUrl: string | null = null;
    if (selectedFile) {
      objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
    } else {
      setPreviewUrl(null);
    }
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [selectedFile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (!title || !content || !category || !excerpt) {
      toast({ title: "Missing fields", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    if (!selectedFile && !imageUrl) {
      toast({ title: "Missing Image", variant: "destructive" });
      setIsLoading(false);
      return;
    }
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
    if (selectedFile) {
      formData.append("imageFile", selectedFile);
    } else {
      formData.append("imageUrl", imageUrl);
    }
    try {
      const token = await getToken();
      if (!token) throw new Error("Auth token missing.");
      const response = await fetch("/api/blogs", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.msg || `HTTP error! ${response.status}`);
      }
      toast({ title: "Blog created", description: "Post saved." });
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Create failed:", error);
      toast({
        title: "Error",
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
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "File too large", variant: "destructive" });
        return;
      }
      setSelectedFile(file);
      setImageUrl("");
      toast({ title: "Image Selected", description: file.name });
    }
  };
  const clearSelectedFile = () => {
    setSelectedFile(null);
    (document.getElementById("image-file-input") as HTMLInputElement).value =
      "";
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {" "}
      <h1 className="text-3xl font-bold mb-8 text-center">Create New Blog</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Blog title"
            required
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
              <SelectValue placeholder="Select category" />
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
            placeholder="Summary..."
            rows={3}
            required
            maxLength={200}
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">{excerpt.length}/200</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="image-file-input">Featured Image</Label>
          <div className="flex items-center gap-4">
            <input
              type="file"
              id="image-file-input"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                document.getElementById("image-file-input")?.click()
              }
              disabled={isLoading}
            >
              <Paperclip className="mr-2 h-4 w-4" />
              Choose File
            </Button>
            <Input
              id="imageUrlInput"
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                clearSelectedFile();
              }}
              placeholder="Or paste URL"
              disabled={isLoading}
            />
          </div>
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
                className="ml-auto h-6 w-6"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          )}
          {!selectedFile && imageUrl && (
            <div className="mt-2">
              <img
                src={imageUrl}
                alt="URL Preview"
                className="h-16 w-auto rounded border object-cover"
              />
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-1">Max 10MB.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Markdown supported..."
            rows={5}
            required
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
            {isLoading ? "Publishing..." : "Publish"}
          </Button>
        </div>
      </form>
    </div>
  );
};
export default CreateBlogPage;
