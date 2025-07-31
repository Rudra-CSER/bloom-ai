import { Webhook } from "svix";
import connectDB from "../../../public/config/db";
import User from "../../../models/user";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // Prepare and verify webhook
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    const headerPayload = await headers();
    const svixHeaders = {
      "svix-id": headerPayload.get("svix-id"),
      "svix-signature": headerPayload.get("svix-signature"),
      "svix-timestamp": headerPayload.get("svix-timestamp"),
    };

    const payload = await req.json();
    const body = JSON.stringify(payload);
    const { data, type } = wh.verify(body, svixHeaders);

    // Prepare user data
    const userData = {
      _id: data.id,
      email: data.email_addresses[0].email_address,
      name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
      image: data.image_url,
    };

    // Connect to DB
    await connectDB();

    // Handle webhook event types
    if (type === "user.created") {
      await User.create(userData);
    } else if (type === "user.updated") {
      await User.findByIdAndUpdate(data.id, userData, { new: true });
    } else if (type === "user.deleted") {
      await User.findByIdAndDelete(data.id);
    }

    return NextResponse.json({ message: "Webhook processed successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Webhook processing failed", details: error.message },
      { status: 400 }
    );
  }
}