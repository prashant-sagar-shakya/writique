import express, { Request, Response } from "express";
import { Webhook } from "svix";
import User from "../models/User";

const router = express.Router();
const rawBodyMiddleware = express.raw({ type: "application/json" });
const WEBHOOK_SECRET = `${process.env.CLERK_WEBHOOK_SECRET}`;

if (!WEBHOOK_SECRET) {
  console.error("FATAL ERROR: CLERK_WEBHOOK_SECRET is not set.");
  if (`${process.env.NODE_ENV}` === "production") {
    process.exit(1);
  }
}

router.post(
  "/clerk",
  rawBodyMiddleware,
  async (req: Request, res: Response) => {
    console.log("Clerk webhook received...");
    if (!WEBHOOK_SECRET) return res.status(500).send("Server config error");

    const svix_id = req.headers["svix-id"] as string;
    const svix_timestamp = req.headers["svix-timestamp"] as string;
    const svix_signature = req.headers["svix-signature"] as string;

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return res.status(400).send("Error occurred -- missing svix headers");
    }

    const wh = new Webhook(WEBHOOK_SECRET);
    let evt: Record<string, any>;

    try {
      evt = wh.verify(req.body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as Record<string, any>;
    } catch (err: any) {
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
          const existingOnCreate = await User.findOne({
            clerkId: eventData.id,
          });
          if (!existingOnCreate) {
            const initialRole =
              eventData.id === "user_2vdmERADOKkthdptf9RUNgZ06wO"
                ? "admin"
                : "user";
            const newUser = new User({
              clerkId: eventData.id,
              email:
                eventData.email_addresses?.find(
                  (e: any) => e.id === eventData.primary_email_address_id
                )?.email_address || "no-email-webhook",
              firstName: eventData.first_name,
              lastName: eventData.last_name,
              imageUrl: eventData.image_url,
              role: initialRole,
            });
            await newUser.save();
            console.log(`Webhook: User ${eventData.id} created.`);
          } else {
            console.log(`Webhook: User ${eventData.id} exists (created).`);
          }
          break;
        case "user.updated":
          console.log("User updated:", eventData.id);
          const updatedData: Record<string, any> = {
            email:
              eventData.email_addresses?.find(
                (e: any) => e.id === eventData.primary_email_address_id
              )?.email_address || undefined,
            firstName: eventData.first_name,
            lastName: eventData.last_name,
            imageUrl: eventData.image_url,
          };
          Object.keys(updatedData).forEach(
            (key) => updatedData[key] === undefined && delete updatedData[key]
          );
          if (Object.keys(updatedData).length > 0) {
            const updatedUser = await User.findOneAndUpdate(
              { clerkId: eventData.id },
              { $set: updatedData },
              { new: true }
            );
            if (updatedUser)
              console.log(`Webhook: User ${eventData.id} updated.`);
            else
              console.warn(
                `Webhook: User ${eventData.id} to update not found.`
              );
          } else
            console.log(`Webhook: User ${eventData.id} no relevant changes.`);
          break;
        case "user.deleted":
          console.log("User deleted:", eventData.id);
          if (eventData.id) {
            const deletedUser = await User.findOneAndDelete({
              clerkId: eventData.id,
            });
            if (deletedUser)
              console.log(`Webhook: User ${eventData.id} deleted.`);
            else
              console.warn(
                `Webhook: User ${eventData.id} to delete not found.`
              );
          } else console.error("Webhook: user.deleted event without ID.");
          break;
        default:
          console.log(`Webhook: Unhandled type: ${eventType}`);
      }
      res.status(200).json({ received: true });
    } catch (error) {
      console.error(`Webhook processing error for ${eventType}:`, error);
      res.status(500).send("Error processing webhook");
    }
  }
);

export default router;