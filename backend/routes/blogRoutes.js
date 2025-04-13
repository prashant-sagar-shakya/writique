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
const mongoose_1 = __importDefault(require("mongoose"));
const router = express_1.default.Router();
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
});
const calculateReadTime = (content) => {
    try {
        if (!content || typeof content !== "string" || content.trim().length === 0)
            return "1 min read";
        const wpm = 200;
        const wc = content.trim().split(/\s+/).filter(Boolean).length;
        const min = Math.ceil(wc / wpm);
        return `${min} min read`;
    }
    catch (_a) {
        return "1 min read";
    }
};
const uploadToCloudinary = (fileBuffer, originalName) => {
    return new Promise((resolve, reject) => {
        const pId = path_1.default.parse(originalName).name;
        const uS = cloudinary_1.default.uploader.upload_stream({ folder: "writique_blogs", public_id: pId, resource_type: "auto" }, (e, r) => {
            if (e)
                return reject(e);
            if (!r)
                return reject(new Error("Cloudinary failed."));
            resolve(r.secure_url);
        });
        uS.end(fileBuffer);
    });
};
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const limit = parseInt(req.query.limit) || 0;
        const authorId = req.query.authorId;
        let filter = {};
        if (authorId)
            filter.authorClerkId = authorId;
        let query = Blog_1.default.find(filter).sort({ createdAt: -1 });
        if (limit > 0)
            query = query.limit(limit);
        const blogs = yield query.exec();
        const totalCount = yield Blog_1.default.countDocuments(filter);
        res.json({ blogs: blogs, totalCount: totalCount });
    }
    catch (err) {
        console.error("GET /blogs ERR:", err);
        res.status(500).send("Server Error");
    }
}));
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blogId = req.params.id;
        if (!mongoose_1.default.Types.ObjectId.isValid(blogId)) {
            return res.status(400).json({ msg: "Invalid ID" });
        }
        const blog = yield Blog_1.default.findById(blogId);
        if (!blog) {
            return res.status(404).json({ msg: "Not found" });
        }
        res.json(blog);
    }
    catch (err) {
        console.error(`GET /blogs/${req.params.id} ERR:`, err);
        res.status(500).send("Server Error");
    }
}));
router.post("/:id/increment-views", authMiddleware_1.requireAuthManual, authMiddleware_1.syncUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const blogId = req.params.id;
    console.log(`Inc view User ${(_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId} for Blog ${blogId}`);
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(blogId))
            return res.status(400).json({ msg: "Invalid ID" });
        const blog = yield Blog_1.default.findByIdAndUpdate(blogId, { $inc: { views: 1 } }, { new: true });
        if (!blog)
            return res.status(404).json({ msg: "Not found for view inc" });
        console.log(`View Inc OK ${blogId}, New: ${blog.views}`);
        res.json({ success: true, views: blog.views });
    }
    catch (err) {
        console.error(`POST /inc-views ERR:`, err);
        res.status(500).send("Server Error");
    }
}));
router.post("/", authMiddleware_1.requireAuthManual, authMiddleware_1.syncUser, upload.single("imageFile"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { title, excerpt, date, category, content, imageUrl: manualImageUrl, } = req.body;
    const clerkUserId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
    const localUser = req.user;
    if (!clerkUserId || !localUser)
        return res.status(401).json({ m: "Auth failed." });
    let finalImageUrl = manualImageUrl ||
        "https://images.unsplash.com/photo-1674027444485-cec3da58eef4?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
    try {
        if (req.file)
            finalImageUrl = yield uploadToCloudinary(req.file.buffer, req.file.originalname);
        else if (!finalImageUrl)
            finalImageUrl = "DEFAULT_IMG_URL";
        const calcReadTime = calculateReadTime(content);
        const authorInfo = {
            name: `${localUser.firstName || ""} ${localUser.lastName || ""}`.trim() ||
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
        const newBlog = new Blog_1.default(dataToSave);
        const savedBlog = yield newBlog.save();
        res.status(201).json(savedBlog);
    }
    catch (err) {
        console.error("POST ERR:", err);
        if (err instanceof mongoose_1.default.Error.ValidationError)
            return res.status(400).json({ m: "Validation Failed", e: err.errors });
        if ((_b = err.message) === null || _b === void 0 ? void 0 : _b.includes("size"))
            return res.status(413).json({ m: "Img > 10MB" });
        if (err.http_code === 401)
            return res.status(500).json({ m: "Cloudinary err" });
        res.status(500).send("Server Error");
    }
}));
router.put("/:id", authMiddleware_1.requireAuthManual, authMiddleware_1.syncUser, upload.single("imageFile"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { title, excerpt, category, content, imageUrl: manualImageUrl, } = req.body;
    const blogId = req.params.id;
    const clerkUserId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
    const isAdminUser = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) === "admin";
    let updateData = { title, excerpt, category, content };
    let newImageUrl = manualImageUrl;
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(blogId))
            return res.status(400).json({ msg: "Invalid ID" });
        const blog = yield Blog_1.default.findById(blogId);
        if (!blog)
            return res.status(404).json({ msg: "Not found" });
        if (!isAdminUser && blog.authorClerkId !== clerkUserId)
            return res.status(403).json({ msg: "Not authorized" });
        if (req.file) {
            newImageUrl = yield uploadToCloudinary(req.file.buffer, req.file.originalname);
            updateData.imageUrl = newImageUrl;
        }
        else if (manualImageUrl !== undefined &&
            manualImageUrl !== blog.imageUrl) {
            updateData.imageUrl = manualImageUrl;
        }
        else {
            delete updateData.imageUrl;
        }
        if (updateData.content && updateData.content !== blog.content) {
            updateData.readTime = calculateReadTime(updateData.content);
        }
        else {
            delete updateData.readTime;
        }
        const updatedBlog = yield Blog_1.default.findByIdAndUpdate(blogId, { $set: updateData }, { new: true, runValidators: true });
        if (!updatedBlog)
            return res.status(404).json({ msg: "Update failed" });
        res.json(updatedBlog);
    }
    catch (err) {
        console.error(`PUT ERR ${blogId}:`, err);
        if (err instanceof mongoose_1.default.Error.ValidationError)
            return res.status(400).json({ m: "Validation Failed", e: err.errors });
        res.status(500).send("Server Error");
    }
}));
router.delete("/:id", authMiddleware_1.requireAuthManual, authMiddleware_1.syncUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const blogId = req.params.id;
    const requestingUserId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
    const isRequestingUserAdmin = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) === "admin";
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(blogId))
            return res.status(400).json({ msg: "Invalid ID" });
        const blog = yield Blog_1.default.findById(blogId);
        if (!blog)
            return res.status(404).json({ msg: "Not found" });
        if (!isRequestingUserAdmin && blog.authorClerkId !== requestingUserId)
            return res.status(403).json({ msg: "Forbidden." });
        yield blog.deleteOne();
        res.json({
            msg: `Removed by ${isRequestingUserAdmin ? "admin" : "owner"}`,
        });
    }
    catch (err) {
        console.error(`DEL ERR ${blogId}:`, err);
        res.status(500).send("Server Error");
    }
}));
exports.default = router;
