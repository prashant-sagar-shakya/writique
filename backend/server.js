"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./config/db"));
const blogRoutes_1 = __importDefault(require("./routes/blogRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const webhookRoutes_1 = __importDefault(require("./routes/webhookRoutes"));
dotenv_1.default.config({ path: "/.env" });
if (!`${process.env.CLERK_SECRET_KEY}` ||
    !`${process.env.CLERK_WEBHOOK_SECRET}`) {
    console.error("FATAL ERROR: Required Clerk env vars missing!");
    process.exit(1);
}
(0, db_1.default)();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use("/api/webhooks/clerk", express_1.default.raw({ type: "application/json" }), webhookRoutes_1.default);
app.use(express_1.default.json({ limit: "50mb" }));
app.use(express_1.default.urlencoded({ limit: "50mb", extended: true }));
app.use("/api/blogs", blogRoutes_1.default);
app.use("/api/users", userRoutes_1.default);
app.get("/", (req, res) => res.send("API Running"));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
