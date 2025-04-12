import { IUser } from "../../models/User";
declare global {
  namespace Express {
    interface Request {
      auth?: { userId: string; sessionId?: string | null };
      user?: IUser | null;
    }
  }
}
export {};
