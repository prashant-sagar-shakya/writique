import express, { Request, Response } from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary";
import Blog from "../models/Blog";
import path from "path";

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
  upload.single("imageFile"),
  async (req: Request, res: Response) => {
    console.log("POST /api/blogs Request Received");
    console.log("Request Body:", req.body);
    console.log("File Info from Multer:", req.file);

    let authorObject = {
      name: "Anonymous",
      avatar: "https://i.pravatar.cc/150?img=1",
    };
    let blogImageUrl =
      "https://images.unsplash.com/photo-1674027444485-cec3da58eef4?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

    try {
      const {
        author: authorString,
        imageUrl: manualImageUrl,
        ...otherBodyFields
      } = req.body;
      console.log("Received Author String:", authorString);
      console.log("Received Manual Image URL:", manualImageUrl);
      console.log("Received Other Body Fields:", otherBodyFields);

      if (manualImageUrl && !req.file) {
        blogImageUrl = manualImageUrl;
        console.log("Using manually provided Image URL:", blogImageUrl);
      }

      try {
        if (authorString) {
          authorObject = JSON.parse(authorString);
          console.log("Parsed Author:", authorObject);
        } else {
          console.log("Author string missing, using default.");
        }
      } catch (parseError) {
        console.error("Author parsing failed:", parseError);
        return res.status(400).json({ msg: "Invalid author data format." });
      }

      if (req.file) {
        console.log("Attempting Cloudinary upload for:", req.file.originalname);
        blogImageUrl = await uploadToCloudinary(
          req.file.buffer,
          req.file.originalname
        );
        console.log("Cloudinary upload successful, URL:", blogImageUrl);
      } else {
        console.log("No file uploaded via multer, final URL:", blogImageUrl);
      }

      const newBlog = new Blog({
        ...otherBodyFields,
        author: authorObject,
        imageUrl: blogImageUrl,
        date: otherBodyFields.date || new Date().toISOString().split("T")[0],
        readTime: otherBodyFields.readTime || "N/A",
      });
      console.log(
        "Attempting to save blog:",
        JSON.stringify(newBlog.toObject(), null, 2)
      ); // Log the object going to MongoDB

      const blog = await newBlog.save();
      console.log("Blog saved successfully:", blog._id);

      res.status(201).json(blog);
    } catch (err: any) {
      console.error("!!! ERROR IN POST /api/blogs ROUTE !!!");
      console.error("Error name:", err.name);
      console.error("Error message:", err.message);
      console.error("Error stack trace below:");
      console.error(err); // Log the full error object
      if (err.message?.includes("File size limit exceeded")) {
        return res
          .status(413)
          .json({ msg: "Image file size exceeds the 10MB limit." });
      }
      if (err.http_code === 401 || err.message?.includes("Invalid API key")) {
        return res
          .status(500)
          .json({
            msg: "Cloudinary configuration error. Check API credentials.",
          });
      }
      res.status(500).send("Server Error during blog creation.");
    }
  }
);

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ msg: "Blog not found" });
    }
    await blog.deleteOne();
    res.json({ msg: "Blog removed" });
  } catch (err: any) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Blog not found" });
    }
    res.status(500).send("Server Error");
  }
});

export default router;
