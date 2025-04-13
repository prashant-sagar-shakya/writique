import express, { Request, Response } from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary";
import Blog from "../models/Blog";
import path from "path";
import {
  requireAuthManual,
  syncUser,
  isAdmin,
} from "../middleware/authMiddleware"; // Use the manual auth
import mongoose from "mongoose";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const calculateReadTime = (content: string): string => {
  try {
    if (!content || typeof content !== "string" || content.trim().length === 0)
      return "1 min read";
    const wpm = 200;
    const wc = content.trim().split(/\s+/).filter(Boolean).length;
    const min = Math.ceil(wc / wpm);
    return `${min} min read`;
  } catch {
    return "1 min read";
  }
};
const uploadToCloudinary = (
  fileBuffer: Buffer,
  originalName: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const pId = path.parse(originalName).name;
    const uS = cloudinary.uploader.upload_stream(
      { folder: "writique_blogs", public_id: pId, resource_type: "auto" },
      (e, r) => {
        if (e) return reject(e);
        if (!r) return reject(new Error("Cloudinary failed."));
        resolve(r.secure_url);
      }
    );
    uS.end(fileBuffer);
  });
};

// --- Public GET Routes ---
router.get("/", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 0;
    const authorId = req.query.authorId as string;
    let filter: any = {};
    if (authorId) filter.authorClerkId = authorId;
    let query = Blog.find(filter).sort({ createdAt: -1 });
    if (limit > 0) query = query.limit(limit);
    const blogs = await query.exec();
    const totalCount = await Blog.countDocuments(filter);
    res.json({ blogs: blogs, totalCount: totalCount });
  } catch (err: any) {
    console.error("GET /blogs ERR:", err);
    res.status(500).send("Server Error");
  }
});
router.get("/:id", async (req, res) => {
  try {
    const blogId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      return res.status(400).json({ msg: "Invalid ID" });
    }
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ msg: "Not found" });
    }
    res.json(blog);
  } catch (err: any) {
    console.error(`GET /blogs/${req.params.id} ERR:`, err);
    res.status(500).send("Server Error");
  }
});

// --- POST Increment Views (Requires Authentication) ---
// Using POST method as in user's provided code
// Protected by requireAuthManual and syncUser
router.post(
  "/:id/increment-views",
  requireAuthManual,
  syncUser,
  async (req: Request, res: Response) => {
    const blogId = req.params.id;
    // Middleware already verified user, req.auth.userId exists
    console.log(
      `Increment view requested by User ${req.auth?.userId} for Blog ${blogId}`
    );
    try {
      if (!mongoose.Types.ObjectId.isValid(blogId))
        return res.status(400).json({ msg: "Invalid ID" });
      const blog = await Blog.findByIdAndUpdate(
        blogId,
        { $inc: { views: 1 } },
        { new: true }
      );
      if (!blog)
        return res
          .status(404)
          .json({ msg: "Blog not found for view increment" });
      console.log(
        `View count incremented for blog: ${blogId}, New count: ${blog.views}`
      );
      res.json({ success: true, views: blog.views });
    } catch (err: any) {
      console.error(`POST /blogs/${blogId}/increment-views ERR:`, err);
      res.status(500).send("Server Error");
    }
  }
);

// --- Protected POST Blog ---
router.post(
  "/",
  requireAuthManual,
  syncUser,
  upload.single("imageFile"),
  async (req, res) => {
    /* ...unchanged... */ const {
      title,
      excerpt,
      date,
      category,
      content,
      imageUrl: manualImageUrl,
    } = req.body;
    const clerkUserId = req.auth?.userId;
    const localUser = req.user;
    if (!clerkUserId || !localUser)
      return res.status(401).json({ message: "Auth failed." });
    let finalImageUrl = manualImageUrl || "DEFAULT_IMG_URL";
    try {
      if (req.file)
        finalImageUrl = await uploadToCloudinary(
          req.file.buffer,
          req.file.originalname
        );
      else if (!finalImageUrl) finalImageUrl = "DEFAULT_IMG_URL";
      const calcReadTime = calculateReadTime(content);
      const authorInfo = {
        name:
          `${localUser.firstName || ""} ${localUser.lastName || ""}`.trim() ||
          localUser.email,
        avatar: localUser.imageUrl || "DEFAULT_AVATAR",
      };
      const dataToSave = {
        title,
        excerpt,
        category,
        content,
        imageUrl: finalImageUrl,
        date: date || new Date().toISOString().split("T")[0],
        readTime: calcReadTime,
        author: authorInfo,
        authorClerkId: clerkUserId,
        views: 0,
      };
      const newBlog = new Blog(dataToSave);
      const savedBlog = await newBlog.save();
      res.status(201).json(savedBlog);
    } catch (err: any) {
      console.error("POST ERR:", err);
      if (err instanceof mongoose.Error.ValidationError)
        return res.status(400).json({ m: "Validation Failed", e: err.errors });
      if (err.message?.includes("size")) return res.status(413);
      if (err.http_code === 401)
        return res.status(500).json({ m: "Cloudinary err" });
      res.status(500).send("Server Error");
    }
  }
);

// --- Protected PUT Blog ---
router.put(
  "/:id",
  requireAuthManual,
  syncUser,
  upload.single("imageFile"),
  async (req, res) => {
    /* ...unchanged... */ const {
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
      if (!mongoose.Types.ObjectId.isValid(blogId))
        return res.status(400).json({ msg: "Invalid ID" });
      const blog = await Blog.findById(blogId);
      if (!blog) return res.status(404).json({ msg: "Not found" });
      if (!isAdminUser && blog.authorClerkId !== clerkUserId)
        return res.status(403).json({ msg: "Not authorized" });
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
      } else {
        delete updateData.imageUrl;
      }
      if (updateData.content && updateData.content !== blog.content) {
        updateData.readTime = calculateReadTime(updateData.content);
      } else {
        delete updateData.readTime;
      }
      const updatedBlog = await Blog.findByIdAndUpdate(
        blogId,
        { $set: updateData },
        { new: true, runValidators: true }
      );
      if (!updatedBlog) return res.status(404).json({ msg: "Update failed" });
      res.json(updatedBlog);
    } catch (err: any) {
      console.error(`PUT ERR ${blogId}:`, err);
      if (err instanceof mongoose.Error.ValidationError)
        return res.status(400).json({ m: "Validation Failed", e: err.errors });
      res.status(500).send("Server Error");
    }
  }
);

// --- Protected DELETE Blog ---
router.delete("/:id", requireAuthManual, syncUser, async (req, res) => {
  /* ...unchanged... */ const blogId = req.params.id;
  const requestingUserId = req.auth?.userId;
  const isRequestingUserAdmin = req.user?.role === "admin";
  try {
    if (!mongoose.Types.ObjectId.isValid(blogId))
      return res.status(400).json({ msg: "Invalid ID" });
    const blog = await Blog.findById(blogId);
    if (!blog) return res.status(404).json({ msg: "Not found" });
    if (!isRequestingUserAdmin && blog.authorClerkId !== requestingUserId)
      return res.status(403).json({ msg: "Forbidden." });
    await blog.deleteOne();
    res.json({
      msg: `Removed by ${isRequestingUserAdmin ? "admin" : "owner"}`,
    });
  } catch (err: any) {
    console.error(`DEL ERR ${blogId}:`, err);
    res.status(500).send("Server Error");
  }
});

export default router;
