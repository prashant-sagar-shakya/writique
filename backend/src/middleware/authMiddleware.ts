import { clerkClient, createClerkClient } from "@clerk/clerk-sdk-node";
import type { ClerkOptions } from "@clerk/backend";
import { Request, Response, NextFunction } from "express";
import User, { IUser } from "../models/User"; // <-- VERIFY THIS PATH IS CORRECT

const clerkSecret = "sk_test_WjX9td6zjlLWk9hhFuxhAb89n7qXoN5SEStHrKwW0s";

if (!clerkSecret || !clerkSecret.startsWith("sk_")) {
  console.error("FATAL: Clerk Secret Key is missing or invalid.");
  process.exit(1);
}

const clerk = createClerkClient({ secretKey: clerkSecret });

export const requireAuthManual = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Unauthorized: Missing Authorization header." });
  }
  const token = authHeader.split(" ")[1];
  try {
    const claims = await clerk.verifyToken(token);
    req.auth = { userId: claims.sub, sessionId: claims.sid };
    next();
  } catch (error: any) {
    res.status(401).json({ message: "Unauthorized: Invalid token." });
  }
};

export const syncUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.auth?.userId) {
    return res.status(401).json({ message: "Unauthorized: User ID missing." });
  }
  const clerkId = req.auth.userId;
  try {
    let userInDb = await User.findOne({ clerkId: clerkId }); // Check if User is defined
    if (userInDb) {
      req.user = userInDb;
    } else {
      const clerkUser = await clerk.users.getUser(clerkId);
      if (!clerkUser) throw new Error("User not found in Clerk");
      const initialRole =
        clerkUser.id === "user_2vdmERADOKkthdptf9RUNgZ06wO" ? "admin" : "user"; // Replace admin ID
      const newUser = new User({
        // Check if User is defined
        clerkId: clerkUser.id,
        email:
          clerkUser.emailAddresses.find(
            (e) => e.id === clerkUser.primaryEmailAddressId
          )?.emailAddress || "no-email",
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,
        role: initialRole,
      });
      userInDb = await newUser.save();
      req.user = userInDb;
    }
    next();
  } catch (error: any) {
    console.error(`Sync User Error:`, error);
    res.status(500).json({ message: "Error syncing user data." });
  }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res
      .status(401)
      .json({ message: "Unauthorized: User data missing." });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admin required." });
  }
  next();
};
