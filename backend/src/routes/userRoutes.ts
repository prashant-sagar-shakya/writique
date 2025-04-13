import express, { Request, Response } from "express";
import { requireAuthManual, syncUser } from "../middleware/authMiddleware";
import User from "../models/User"; // Ensure User model is imported
import Blog from "../models/Blog"; // Import Blog model for population
import mongoose from "mongoose";

const router = express.Router();

// GET /api/users/me
router.get(
  "/me",
  requireAuthManual,
  syncUser,
  async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(404).json({ msg: "User not found." });
    }
    try {
      const populateFavorites = req.query.populate === "favorites";
      let userQuery = User.findById(req.user._id);
      if (populateFavorites) {
        userQuery = userQuery.populate({ path: "favorites", model: Blog });
      }
      const userProfile = await userQuery.exec();
      if (!userProfile)
        return res.status(404).json({ msg: "User profile fetch failed." });
      res.json(userProfile);
    } catch (error) {
      console.error("GET /api/users/me Error:", error);
      res.status(500).send("Server error");
    }
  }
);

// POST /api/users/me/favorites/:blogId
router.post(
  "/me/favorites/:blogId",
  requireAuthManual,
  syncUser,
  async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ msg: "User not auth." });
    }
    const blogId = req.params.blogId;
    if (!mongoose.Types.ObjectId.isValid(blogId))
      return res.status(400).json({ msg: "Invalid Blog ID" });
    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $addToSet: { favorites: blogId } },
        { new: true }
      );
      if (!updatedUser)
        return res.status(404).json({ msg: "User not found for fav add" });
      res.status(200).json({ success: true, favorites: updatedUser.favorites });
    } catch (error) {
      console.error("POST /fav Error:", error);
      res.status(500).send("Server error");
    }
  }
);

// DELETE /api/users/me/favorites/:blogId
router.delete(
  "/me/favorites/:blogId",
  requireAuthManual,
  syncUser,
  async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ msg: "User not auth." });
    }
    const blogId = req.params.blogId;
    if (!mongoose.Types.ObjectId.isValid(blogId))
      return res.status(400).json({ msg: "Invalid Blog ID" });
    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $pull: { favorites: blogId } },
        { new: true }
      );
      if (!updatedUser)
        return res.status(404).json({ msg: "User not found for fav remove" });
      res.status(200).json({ success: true, favorites: updatedUser.favorites });
    } catch (error) {
      console.error("DELETE /fav Error:", error);
      res.status(500).send("Server error");
    }
  }
);

export default router;
