import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db";
import blogRoutes from "./routes/blogRoutes";
import userRoutes from "./routes/userRoutes";
import webhookRoutes from "./routes/webhookRoutes";

dotenv.config({ path: "/.env" });

if (
  !`${process.env.CLERK_SECRET_KEY}` ||
  !`${process.env.CLERK_WEBHOOK_SECRET}`
) {
  console.error("FATAL ERROR: Required Clerk env vars missing!");
  process.exit(1);
}

connectDB();

const app = express();

app.use(cors());

app.use(
  "/api/webhooks/clerk",
  express.raw({ type: "application/json" }),
  webhookRoutes
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use("/api/blogs", blogRoutes);
app.use("/api/users", userRoutes);
app.get("/", (req, res) => res.send("API Running"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
