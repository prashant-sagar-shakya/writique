import express, { Request, Response } from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary";
import Blog from "../models/Blog";
import path from "path";
import {
  requireAuthManual,
  syncUser,
  isAdmin,
} from "../middleware/authMiddleware";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const uploadToCloudinary = (
  fileBuffer: Buffer,
  originalName: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const public_id = path.parse(originalName).name;
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "writique_blogs", public_id: public_id, resource_type: "auto" },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("Cloudinary upload failed."));
        resolve(result.secure_url);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

router.get("/", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 0;
    let query = Blog.find().sort({ createdAt: -1 });
    if (limit > 0) {
      query = query.limit(limit);
    }
    const blogs = await query.exec();
    res.json(blogs);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ msg: "Blog not found" });
    }
    res.json(blog);
  } catch (err: any) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Blog not found" });
    }
    res.status(500).send("Server Error");
  }
});

router.post(
  "/",
  requireAuthManual,
  syncUser,
  upload.single("imageFile"),
  async (req: Request, res: Response) => {
    const {
      title,
      excerpt,
      date,
      readTime,
      category,
      content,
      imageUrl: manualImageUrl,
    } = req.body;
    const clerkUserId = req.auth?.userId;
    const localUser = req.user;
    if (!clerkUserId || !localUser)
      return res.status(401).json({ message: "Auth failed." });
    let blogImageUrl =
      manualImageUrl ||
      "https://images.unsplash.com/photo-1674027444485-cec3da58eef4?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
    try {
      if (req.file)
        blogImageUrl = await uploadToCloudinary(
          req.file.buffer,
          req.file.originalname
        );
      const newBlog = new Blog({
        title,
        excerpt,
        date,
        readTime,
        category,
        content,
        imageUrl: blogImageUrl,
        author: {
          name:
            `${localUser.firstName || ""} ${localUser.lastName || ""}`.trim() ||
            localUser.email,
          avatar: localUser.imageUrl || "https://i.pravatar.cc/150?img=1",
        },
        authorClerkId: clerkUserId,
      });
      const savedBlog = await newBlog.save();
      res.status(201).json(savedBlog);
    } catch (err: any) {
      console.error("POST ERR:", err);
      if (err.message?.includes("size"))
        return res.status(413).json({ msg: "Image > 10MB limit." });
      if (err.http_code === 401)
        return res.status(500).json({ msg: "Cloudinary config error." });
      res.status(500).send("Server Error creating blog.");
    }
  }
);

router.put(
  "/:id",
  requireAuthManual,
  syncUser,
  upload.single("imageFile"),
  async (req: Request, res: Response) => {
    const {
      title,
      excerpt,
      category,
      content,
      imageUrl: manualImageUrl,
    } = req.body;
    const blogId = req.params.id;
    const clerkUserId = req.auth?.userId;
    const isAdminUser = req.user?.role === "admin";
    let updateData: any = { title, excerpt, category, content };
    let newImageUrl = manualImageUrl;
    try {
      const blog = await Blog.findById(blogId);
      if (!blog) return res.status(404).json({ msg: "Blog not found" });
      if (!isAdminUser && blog.authorClerkId !== clerkUserId)
        return res.status(403).json({ msg: "User not authorized" });
      if (req.file) {
        newImageUrl = await uploadToCloudinary(
          req.file.buffer,
          req.file.originalname
        );
        updateData.imageUrl = newImageUrl;
      } else if (
        manualImageUrl !== undefined &&
        manualImageUrl !== blog.imageUrl
      ) {
        updateData.imageUrl = manualImageUrl;
      }
      const updatedBlog = await Blog.findByIdAndUpdate(
        blogId,
        { $set: updateData },
        { new: true }
      );
      if (!updatedBlog) return res.status(404).json({ msg: "Update failed" });
      res.json(updatedBlog);
    } catch (err: any) {
      console.error(`PUT ERR /api/blogs/${blogId}:`, err);
      if (err.message?.includes("size"))
        return res.status(413).json({ msg: "Image > 10MB limit." });
      if (err.http_code === 401)
        return res.status(500).json({ msg: "Cloudinary error." });
      res.status(500).send("Server Error updating.");
    }
  }
);

// Removed isAdmin middleware, logic moved inside
router.delete(
  "/:id",
  requireAuthManual,
  syncUser,
  async (req: Request, res: Response) => {
    const blogId = req.params.id;
    const requestingUserId = req.auth?.userId;
    const isRequestingUserAdmin = req.user?.role === "admin";

    try {
      const blog = await Blog.findById(blogId);
      if (!blog) {
        return res.status(404).json({ msg: "Blog not found" });
      }

      // Authorization check: Admin OR Author of the blog
      if (!isRequestingUserAdmin && blog.authorClerkId !== requestingUserId) {
        return res
          .status(403)
          .json({ msg: "Forbidden: You can only delete your own blogs." });
      }

      await blog.deleteOne();
      res.json({
        msg: `Blog removed successfully by ${
          isRequestingUserAdmin ? "admin" : "owner"
        }`,
      });
    } catch (err: any) {
      console.error(`DELETE ERR ${blogId}:`, err);
      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Blog not found" });
      }
      res.status(500).send("Server Error deleting blog.");
    }
  }
);

router.get("/:id/views", async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ msg: "Blog not found" });
    }
    res.json({ count: blog.views });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post(
  "/:id/increment-views",
  requireAuthManual,
  syncUser,
  async (req: Request, res: Response) => {
    try {
      const blog = await Blog.findById(req.params.id);
      if (!blog) {
        return res.status(404).json({ msg: "Blog not found" });
      }
      blog.views += 1;
      await blog.save();
      res.json({ success: true, views: blog.views });
    } catch (err: any) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

export default router;
