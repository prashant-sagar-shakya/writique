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
const authMiddleware_1 = require("../middleware/authMiddleware");
const User_1 = __importDefault(require("../models/User")); // Ensure User model is imported
const Blog_1 = __importDefault(require("../models/Blog")); // Import Blog model for population
const mongoose_1 = __importDefault(require("mongoose"));
const router = express_1.default.Router();
// GET /api/users/me
router.get("/me", authMiddleware_1.requireAuthManual, authMiddleware_1.syncUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res.status(404).json({ msg: "User not found." });
    }
    try {
        const populateFavorites = req.query.populate === "favorites";
        let userQuery = User_1.default.findById(req.user._id);
        if (populateFavorites) {
            userQuery = userQuery.populate({ path: "favorites", model: Blog_1.default });
        }
        const userProfile = yield userQuery.exec();
        if (!userProfile)
            return res.status(404).json({ msg: "User profile fetch failed." });
        res.json(userProfile);
    }
    catch (error) {
        console.error("GET /api/users/me Error:", error);
        res.status(500).send("Server error");
    }
}));
// POST /api/users/me/favorites/:blogId
router.post("/me/favorites/:blogId", authMiddleware_1.requireAuthManual, authMiddleware_1.syncUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res.status(401).json({ msg: "User not auth." });
    }
    const blogId = req.params.blogId;
    if (!mongoose_1.default.Types.ObjectId.isValid(blogId))
        return res.status(400).json({ msg: "Invalid Blog ID" });
    try {
        const updatedUser = yield User_1.default.findByIdAndUpdate(req.user._id, { $addToSet: { favorites: blogId } }, { new: true });
        if (!updatedUser)
            return res.status(404).json({ msg: "User not found for fav add" });
        res.status(200).json({ success: true, favorites: updatedUser.favorites });
    }
    catch (error) {
        console.error("POST /fav Error:", error);
        res.status(500).send("Server error");
    }
}));
// DELETE /api/users/me/favorites/:blogId
router.delete("/me/favorites/:blogId", authMiddleware_1.requireAuthManual, authMiddleware_1.syncUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res.status(401).json({ msg: "User not auth." });
    }
    const blogId = req.params.blogId;
    if (!mongoose_1.default.Types.ObjectId.isValid(blogId))
        return res.status(400).json({ msg: "Invalid Blog ID" });
    try {
        const updatedUser = yield User_1.default.findByIdAndUpdate(req.user._id, { $pull: { favorites: blogId } }, { new: true });
        if (!updatedUser)
            return res.status(404).json({ msg: "User not found for fav remove" });
        res.status(200).json({ success: true, favorites: updatedUser.favorites });
    }
    catch (error) {
        console.error("DELETE /fav Error:", error);
        res.status(500).send("Server error");
    }
}));
exports.default = router;
