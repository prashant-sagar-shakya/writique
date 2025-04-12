import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db";
import blogRoutes from "./routes/blogRoutes";

dotenv.config({ path: "../../.env" });
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/blogs", blogRoutes);
app.get("/", (req, res) => res.send("API Running"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
