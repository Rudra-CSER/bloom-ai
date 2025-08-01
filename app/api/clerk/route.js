import { Webhook } from "svix";
import connectDB from "../../../public/config/db";
import User from "../../../models/user";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    console.log("Webhook received - starting processing");

    // Check if webhook secret exists
    if (!process.env.CLERK_WEBHOOK_SECRET) {
      console.error("CLERK_WEBHOOK_SECRET is not set");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    // Prepare and verify webhook
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    const headerPayload = await headers();
    const svixHeaders = {
      "svix-id": headerPayload.get("svix-id"),
      "svix-signature": headerPayload.get("svix-signature"),
      "svix-timestamp": headerPayload.get("svix-timestamp"),
    };

    console.log("Headers received:", {
      "svix-id": svixHeaders["svix-id"],
      "svix-signature": svixHeaders["svix-signature"] ? "present" : "missing",
      "svix-timestamp": svixHeaders["svix-timestamp"]
    });

    const payload = await req.json();
    const body = JSON.stringify(payload);

    console.log("Webhook payload type:", payload.type);
    console.log("Webhook data ID:", payload.data?.id);

    // Verify webhook signature
    const { data, type } = wh.verify(body, svixHeaders);
    console.log("Webhook verified successfully, type:", type);

    // Prepare user data with safe email extraction
    const userData = {
      _id: data.id,
      email:
        Array.isArray(data.email_addresses) && data.email_addresses.length > 0
          ? data.email_addresses[0].email_address
          : "",
      name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
      image: data.image_url,
    };

    console.log("User data to save:", userData);

    // Connect to DB
    console.log("Connecting to MongoDB...");
    await connectDB();
    console.log("MongoDB connected successfully");

    // Handle webhook event types
    if (type === "user.created") {
      console.log("Creating new user in database...");
      // Use upsert to avoid duplicate key errors
      await User.findByIdAndUpdate(data.id, userData, { upsert: true, new: true });
      console.log("User created or updated successfully:", data.id);
    } else if (type === "user.updated") {
      console.log("Updating user in database...");
      const updatedUser = await User.findByIdAndUpdate(data.id, userData, { new: true });
      console.log("User updated successfully:", updatedUser?._id);
    } else if (type === "user.deleted") {
      console.log("Deleting user from database...");
      const deletedUser = await User.findByIdAndDelete(data.id);
      console.log("User deleted successfully:", deletedUser?._id);
    } else {
      console.log(`Unhandled webhook type: ${type}`);
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