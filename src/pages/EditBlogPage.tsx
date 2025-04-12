import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
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
import { Loader2, Paperclip, XCircle } from "lucide-react";

const EditBlogPage = () => {
  const { blogId } = useParams<{ blogId: string }>();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [blogData, setBlogData] = useState<Partial<Blog>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogData = async () => {
      setIsLoading(true);
      setError(null);
      if (!blogId) {
        setError("ID missing.");
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch(`/api/blogs/${blogId}`);
        if (!response.ok) {
          if (response.status === 404) throw new Error("Not found.");
          throw new Error(`${response.status}`);
        }
        const data: Blog = await response.json();
        setBlogData(data);
        setTitle(data.title || "");
        setContent(data.content || "");
        setCategory(data.category || "");
        setExcerpt(data.excerpt || "");
        setImageUrl(data.imageUrl || "");
        document.title = `Edit: ${data.title}`;
      } catch (err: any) {
        setError(err.message || "Failed load.");
        toast({ title: "Error", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchBlogData();
  }, [blogId, toast]);
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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("category", category);
    formData.append("excerpt", excerpt);
    if (selectedFile) {
      formData.append("imageFile", selectedFile);
    } else if (imageUrl !== blogData.imageUrl) {
      formData.append("imageUrl", imageUrl);
    }
    try {
      const token = await getToken();
      if (!token) throw new Error("Auth required");
      const response = await fetch(`/api/blogs/${blogId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.msg || `Update failed: ${response.status}`);
      }
      toast({ title: "Blog Updated" });
      navigate(`/blogs/${blogId}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "Too large", variant: "destructive" });
        return;
      }
      setSelectedFile(file);
      setImageUrl("");
    }
  };
  const clearSelectedFile = () => {
    setSelectedFile(null);
    (
      document.getElementById("image-file-input-edit") as HTMLInputElement
    ).value = "";
  };

  if (isLoading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  if (error)
    return (
      <div className="text-center py-16 text-destructive">
        <h1 className="text-xl">Error</h1>
        <p>{error}</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Edit Blog Post</h1>
      <form onSubmit={handleUpdate} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={category}
            onValueChange={setCategory}
            required
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.name}>
                  <div className="flex items-center gap-2">
                    <cat.icon className="h-4 w-4" />
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
            rows={3}
            required
            maxLength={200}
            disabled={isSubmitting}
          />
          <p className="text-xs">{excerpt.length}/200</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="image-file-input-edit">Featured Image</Label>
          <div className="flex items-center gap-4">
            <input
              type="file"
              id="image-file-input-edit"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                document.getElementById("image-file-input-edit")?.click()
              }
              disabled={isSubmitting}
            >
              <Paperclip className="mr-2 h-4 w-4" />
              Change
            </Button>
            <Input
              id="imageUrlInput"
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                clearSelectedFile();
              }}
              placeholder="Current or new URL"
              disabled={isSubmitting}
            />
          </div>
          {selectedFile && previewUrl && (
            <div className="mt-2 flex items-center gap-2 border p-2 rounded-md">
              <img
                src={previewUrl}
                alt="New"
                className="h-16 w-16 obj-cover rounded"
              />
              <div className="text-sm">
                <p className="font-medium truncate">{selectedFile.name}</p>
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
                alt="Current"
                className="h-16 w-auto rounded border object-cover"
              />
            </div>
          )}
          <p className="text-xs mt-1">Max 10MB.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/blogs/${blogId}`)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
};
export default EditBlogPage;
