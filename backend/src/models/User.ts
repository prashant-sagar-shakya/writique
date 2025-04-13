import mongoose, { Schema, Document, Types } from "mongoose"; // Import Types

export type UserRole = "admin" | "user";

export interface IUser extends Document {
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  favorites: Types.ObjectId[]; // <<<--- Add this line (Array of Blog ObjectIds)
}

const UserSchema: Schema = new Schema(
  {
    clerkId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true },
    firstName: { type: String },
    lastName: { type: String },
    imageUrl: { type: String },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    favorites: [{ type: Schema.Types.ObjectId, ref: "Blog" }], // <<<--- Add this line
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
