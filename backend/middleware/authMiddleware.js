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
exports.isAdmin = exports.syncUser = exports.requireAuthManual = void 0;
const clerk_sdk_node_1 = require("@clerk/clerk-sdk-node");
const User_1 = __importDefault(require("../models/User")); // <-- VERIFY THIS PATH IS CORRECT
const clerkSecret = "sk_test_WjX9td6zjlLWk9hhFuxhAb89n7qXoN5SEStHrKwW0s";
if (!clerkSecret || !clerkSecret.startsWith("sk_")) {
    console.error("FATAL: Clerk Secret Key is missing or invalid.");
    process.exit(1);
}
const clerk = (0, clerk_sdk_node_1.createClerkClient)({ secretKey: clerkSecret });
const requireAuthManual = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
            .status(401)
            .json({ message: "Unauthorized: Missing Authorization header." });
    }
    const token = authHeader.split(" ")[1];
    try {
        const claims = yield clerk.verifyToken(token);
        req.auth = { userId: claims.sub, sessionId: claims.sid };
        next();
    }
    catch (error) {
        res.status(401).json({ message: "Unauthorized: Invalid token." });
    }
});
exports.requireAuthManual = requireAuthManual;
const syncUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    if (!((_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId)) {
        return res.status(401).json({ message: "Unauthorized: User ID missing." });
    }
    const clerkId = req.auth.userId;
    try {
        let userInDb = yield User_1.default.findOne({ clerkId: clerkId }); // Check if User is defined
        if (userInDb) {
            req.user = userInDb;
        }
        else {
            const clerkUser = yield clerk.users.getUser(clerkId);
            if (!clerkUser)
                throw new Error("User not found in Clerk");
            const initialRole = clerkUser.id === "user_2vdmERADOKkthdptf9RUNgZ06wO" ? "admin" : "user"; // Replace admin ID
            const newUser = new User_1.default({
                // Check if User is defined
                clerkId: clerkUser.id,
                email: ((_b = clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)) === null || _b === void 0 ? void 0 : _b.emailAddress) || "no-email",
                firstName: clerkUser.firstName,
                lastName: clerkUser.lastName,
                imageUrl: clerkUser.imageUrl,
                role: initialRole,
            });
            userInDb = yield newUser.save();
            req.user = userInDb;
        }
        next();
    }
    catch (error) {
        console.error(`Sync User Error:`, error);
        res.status(500).json({ message: "Error syncing user data." });
    }
});
exports.syncUser = syncUser;
const isAdmin = (req, res, next) => {
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
exports.isAdmin = isAdmin;
