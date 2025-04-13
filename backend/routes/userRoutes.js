"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.get("/me", authMiddleware_1.requireAuthManual, authMiddleware_1.syncUser, (req, res) => {
    if (!req.user) {
        return res.status(404).json({ msg: "User data not found after sync." });
    }
    res.json({
        id: req.user._id,
        clerkId: req.user.clerkId,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        imageUrl: req.user.imageUrl,
        role: req.user.role,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt,
    });
});
exports.default = router;
