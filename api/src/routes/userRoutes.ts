import express, { Request, Response } from "express";
import { requireAuthManual, syncUser } from "../middleware/authMiddleware";

const router = express.Router();

router.get(
  "/me",
  requireAuthManual,
  syncUser,
  (req: Request, res: Response) => {
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
  }
);

export default router;
