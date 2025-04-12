import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

cloudinary.config({
  cloud_name: "donfhvujv",
  api_key: "693915247214541",
  api_secret: "m5O3cLZPUscOdKLrZaUXBSouS8U",
  secure: true,
});

export default cloudinary;
