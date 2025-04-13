"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const Blog_1 = __importDefault(require("../models/Blog"));
const path_1 = __importDefault(require("path"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
});
const uploadToCloudinary = (fileBuffer, originalName) => {
    return new Promise((resolve, reject) => {
        const public_id = path_1.default.parse(originalName).name;
        const uploadStream = cloudinary_1.default.uploader.upload_stream({ folder: "writique_blogs", public_id: public_id, resource_type: "auto" }, (error, result) => {
            if (error)
                return reject(error);
            if (!result)
                return reject(new Error("Cloudinary upload failed."));
            resolve(result.secure_url);
        });
        uploadStream.end(fileBuffer);
    });
};
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const limit = parseInt(req.query.limit) || 0;
        let query = Blog_1.default.find().sort({ createdAt: -1 });
        if (limit > 0) {
            query = query.limit(limit);
        }
        const blogs = yield query.exec();
        res.json(blogs);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
}));
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blog = yield Blog_1.default.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ msg: "Blog not found" });
        }
        res.json(blog);
    }
    catch (err) {
        console.error(err.message);
        if (err.kind === "ObjectId") {
            return res.status(404).json({ msg: "Blog not found" });
        }
        res.status(500).send("Server Error");
    }
}));
router.post("/", authMiddleware_1.requireAuthManual, authMiddleware_1.syncUser, upload.single("imageFile"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { title, excerpt, date, readTime, category, content, imageUrl: manualImageUrl, } = req.body;
    const clerkUserId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
    const localUser = req.user;
    if (!clerkUserId || !localUser)
        return res.status(401).json({ message: "Auth failed." });
    let blogImageUrl = manualImageUrl ||
        "https://images.unsplash.com/photo-1674027444485-cec3da58eef4?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
    try {
        if (req.file)
            blogImageUrl = yield uploadToCloudinary(req.file.buffer, req.file.originalname);
        const newBlog = new Blog_1.default({
            title,
            excerpt,
            date,
            readTime,
            category,
            content,
            imageUrl: blogImageUrl,
            author: {
                name: `${localUser.firstName || ""} ${localUser.lastName || ""}`.trim() ||
                    localUser.email,
                avatar: localUser.imageUrl || "https://i.pravatar.cc/150?img=1",
            },
            authorClerkId: clerkUserId,
        });
        const savedBlog = yield newBlog.save();
        res.status(201).json(savedBlog);
    }
    catch (err) {
        console.error("POST ERR:", err);
        if ((_b = err.message) === null || _b === void 0 ? void 0 : _b.includes("size"))
            return res.status(413).json({ msg: "Image > 10MB limit." });
        if (err.http_code === 401)
            return res.status(500).json({ msg: "Cloudinary config error." });
        res.status(500).send("Server Error creating blog.");
    }
}));
router.put("/:id", authMiddleware_1.requireAuthManual, authMiddleware_1.syncUser, upload.single("imageFile"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const { title, excerpt, category, content, imageUrl: manualImageUrl, } = req.body;
    const blogId = req.params.id;
    const clerkUserId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
    const isAdminUser = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) === "admin";
    let updateData = { title, excerpt, category, content };
    let newImageUrl = manualImageUrl;
    try {
        const blog = yield Blog_1.default.findById(blogId);
        if (!blog)
            return res.status(404).json({ msg: "Blog not found" });
        if (!isAdminUser && blog.authorClerkId !== clerkUserId)
            return res.status(403).json({ msg: "User not authorized" });
        if (req.file) {
            newImageUrl = yield uploadToCloudinary(req.file.buffer, req.file.originalname);
            updateData.imageUrl = newImageUrl;
        }
        else if (manualImageUrl !== undefined &&
            manualImageUrl !== blog.imageUrl) {
            updateData.imageUrl = manualImageUrl;
        }
        const updatedBlog = yield Blog_1.default.findByIdAndUpdate(blogId, { $set: updateData }, { new: true });
        if (!updatedBlog)
            return res.status(404).json({ msg: "Update failed" });
        res.json(updatedBlog);
    }
    catch (err) {
        console.error(`PUT ERR /api/blogs/${blogId}:`, err);
        if ((_c = err.message) === null || _c === void 0 ? void 0 : _c.includes("size"))
            return res.status(413).json({ msg: "Image > 10MB limit." });
        if (err.http_code === 401)
            return res.status(500).json({ msg: "Cloudinary error." });
        res.status(500).send("Server Error updating.");
    }
}));
// Removed isAdmin middleware, logic moved inside
router.delete("/:id", authMiddleware_1.requireAuthManual, authMiddleware_1.syncUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const blogId = req.params.id;
    const requestingUserId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
    const isRequestingUserAdmin = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) === "admin";
    try {
        const blog = yield Blog_1.default.findById(blogId);
        if (!blog) {
            return res.status(404).json({ msg: "Blog not found" });
        }
        // Authorization check: Admin OR Author of the blog
        if (!isRequestingUserAdmin && blog.authorClerkId !== requestingUserId) {
            return res
                .status(403)
                .json({ msg: "Forbidden: You can only delete your own blogs." });
        }
        yield blog.deleteOne();
        res.json({
            msg: `Blog removed successfully by ${isRequestingUserAdmin ? "admin" : "owner"}`,
        });
    }
    catch (err) {
        console.error(`DELETE ERR ${blogId}:`, err);
        if (err.kind === "ObjectId") {
            return res.status(404).json({ msg: "Blog not found" });
        }
        res.status(500).send("Server Error deleting blog.");
    }
}));
router.get("/:id/views", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blog = yield Blog_1.default.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ msg: "Blog not found" });
        }
        res.json({ count: blog.views });
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
}));
router.post("/:id/increment-views", authMiddleware_1.requireAuthManual, authMiddleware_1.syncUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blog = yield Blog_1.default.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ msg: "Blog not found" });
        }
        blog.views += 1;
        yield blog.save();
        res.json({ success: true, views: blog.views });
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
}));
exports.default = router;
