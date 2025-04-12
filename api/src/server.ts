import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db";
import blogRoutes from "./routes/blogRoutes";
import userRoutes from "./routes/userRoutes"; // Import user routes

dotenv.config({ path: "../../.env" });
connectDB();

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use("/api/blogs", blogRoutes);
app.use("/api/users", userRoutes); // Add user routes
app.get("/", (req, res) => res.send("API Running"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
