import { Webhook } from "svix";
import connectDB from "../../../public/config/db";
import User from "../../../models/user";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    console.log("Webhook received - starting processing");
    
    // Step 1: Setup webhook
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    const headerPayload = headers();
    const svixHeaders = {
      "svix-id": headerPayload.get("svix-id"),
      "svix-signature": headerPayload.get("svix-signature"),
      "svix-timestamp": headerPayload.get("svix-timestamp")
    };

    console.log("Headers received:", {
      "svix-id": headerPayload.get("svix-id"),
      "svix-signature": headerPayload.get("svix-signature") ? "present" : "missing",
      "svix-timestamp": headerPayload.get("svix-timestamp")
    });

    const payload = await req.json();
    const body = JSON.stringify(payload);
    
    console.log("Webhook payload type:", payload.type);
    console.log("Webhook data ID:", payload.data?.id);
    
    // Verify webhook signature
    const { data, type } = wh.verify(body, svixHeaders);
    console.log("Webhook verified successfully, type:", type);

    const userData = {
      _id: data.id,
      email: data.email_addresses[0].email_address,
      name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
      image: data.image_url,
    };

    console.log("User data to save:", userData);

    console.log("Connecting to MongoDB...");
    await connectDB();
    console.log("MongoDB connected successfully");

    switch (type) {
      case 'user.created':
        console.log("Creating new user in database...");
        const createdUser = await User.create(userData);
        console.log("User created successfully:", createdUser._id);
        break;
      case 'user.updated':
        console.log("Updating user in database...");
        const updatedUser = await User.findByIdAndUpdate(data.id, userData, { new: true });
        console.log("User updated successfully:", updatedUser?._id);
        break;
      case 'user.deleted':
        console.log("Deleting user from database...");
        const deletedUser = await User.findByIdAndDelete(data.id);
        console.log("User deleted successfully:", deletedUser?._id);
        break;
      default:
        console.log(`Unhandled webhook type: ${type}`);
        break;
    }

    console.log("Webhook processing completed successfully");
    return NextResponse.json({ message: "Webhook processed successfully" });
  } catch (error) {
    console.error("Webhook error:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      { error: "Webhook processing failed", details: error.message },
      { status: 400 }
    );
  }
}
