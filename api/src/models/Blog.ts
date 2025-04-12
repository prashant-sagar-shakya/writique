import mongoose, { Schema, Document } from "mongoose";

export interface IBlog extends Document {
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  author: {
    name: string;
    avatar: string;
  };
  imageUrl: string;
  content: string;
}

const BlogSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    excerpt: { type: String, required: true },
    date: { type: String, required: true },
    readTime: { type: String, required: true },
    category: { type: String, required: true },
    author: {
      name: { type: String, required: true },
      avatar: { type: String, required: true },
    },
    imageUrl: { type: String, required: true },
    content: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IBlog>("Blog", BlogSchema);
