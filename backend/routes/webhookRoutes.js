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
const svix_1 = require("svix");
const User_1 = __importDefault(require("../models/User"));
const router = express_1.default.Router();
const rawBodyMiddleware = express_1.default.raw({ type: "application/json" });
const WEBHOOK_SECRET = `${process.env.CLERK_WEBHOOK_SECRET}`;
if (!WEBHOOK_SECRET) {
    console.error("FATAL ERROR: CLERK_WEBHOOK_SECRET is not set.");
    if (`${process.env.NODE_ENV}` === "production") {
        process.exit(1);
    }
}
router.post("/clerk", rawBodyMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    console.log("Clerk webhook received...");
    if (!WEBHOOK_SECRET)
        return res.status(500).send("Server config error");
    const svix_id = req.headers["svix-id"];
    const svix_timestamp = req.headers["svix-timestamp"];
    const svix_signature = req.headers["svix-signature"];
    if (!svix_id || !svix_timestamp || !svix_signature) {
        return res.status(400).send("Error occurred -- missing svix headers");
    }
    const wh = new svix_1.Webhook(WEBHOOK_SECRET);
    let evt;
    try {
        evt = wh.verify(req.body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        });
    }
    catch (err) {
        console.error("Webhook verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    const eventType = evt.type;
    const eventData = evt.data;
    console.log(`Processing event type: ${eventType}`);
    try {
        switch (eventType) {
            case "user.created":
                console.log("User created:", eventData.id);
                const existingOnCreate = yield User_1.default.findOne({
                    clerkId: eventData.id,
                });
                if (!existingOnCreate) {
                    const initialRole = eventData.id === "user_2vdmERADOKkthdptf9RUNgZ06wO"
                        ? "admin"
                        : "user";
                    const newUser = new User_1.default({
                        clerkId: eventData.id,
                        email: ((_b = (_a = eventData.email_addresses) === null || _a === void 0 ? void 0 : _a.find((e) => e.id === eventData.primary_email_address_id)) === null || _b === void 0 ? void 0 : _b.email_address) || "no-email-webhook",
                        firstName: eventData.first_name,
                        lastName: eventData.last_name,
                        imageUrl: eventData.image_url,
                        role: initialRole,
                    });
                    yield newUser.save();
                    console.log(`Webhook: User ${eventData.id} created.`);
                }
                else {
                    console.log(`Webhook: User ${eventData.id} exists (created).`);
                }
                break;
            case "user.updated":
                console.log("User updated:", eventData.id);
                const updatedData = {
                    email: ((_d = (_c = eventData.email_addresses) === null || _c === void 0 ? void 0 : _c.find((e) => e.id === eventData.primary_email_address_id)) === null || _d === void 0 ? void 0 : _d.email_address) || undefined,
                    firstName: eventData.first_name,
                    lastName: eventData.last_name,
                    imageUrl: eventData.image_url,
                };
                Object.keys(updatedData).forEach((key) => updatedData[key] === undefined && delete updatedData[key]);
                if (Object.keys(updatedData).length > 0) {
                    const updatedUser = yield User_1.default.findOneAndUpdate({ clerkId: eventData.id }, { $set: updatedData }, { new: true });
                    if (updatedUser)
                        console.log(`Webhook: User ${eventData.id} updated.`);
                    else
                        console.warn(`Webhook: User ${eventData.id} to update not found.`);
                }
                else
                    console.log(`Webhook: User ${eventData.id} no relevant changes.`);
                break;
            case "user.deleted":
                console.log("User deleted:", eventData.id);
                if (eventData.id) {
                    const deletedUser = yield User_1.default.findOneAndDelete({
                        clerkId: eventData.id,
                    });
                    if (deletedUser)
                        console.log(`Webhook: User ${eventData.id} deleted.`);
                    else
                        console.warn(`Webhook: User ${eventData.id} to delete not found.`);
                }
                else
                    console.error("Webhook: user.deleted event without ID.");
                break;
            default:
                console.log(`Webhook: Unhandled type: ${eventType}`);
        }
        res.status(200).json({ received: true });
    }
    catch (error) {
        console.error(`Webhook processing error for ${eventType}:`, error);
        res.status(500).send("Error processing webhook");
    }
}));
exports.default = router;
