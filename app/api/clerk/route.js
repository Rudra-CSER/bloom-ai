import { Webhook } from "svix";
import connectDB from "../../../public/config/db";
import User from "../../../models/user";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    if (!process.env.CLERK_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

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

    // Only handle user.created events
    if (type === "user.created") {
      const userData = {
        _id: data.id,
        email:
          Array.isArray(data.email_addresses) && data.email_addresses.length > 0
            ? data.email_addresses[0].email_address
            : "",
        name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
        image: data.image_url,
      };

      await connectDB();
      await User.findByIdAndUpdate(data.id, userData, { upsert: true, new: true });
    }

    return NextResponse.json({ message: "User uploaded to MongoDB (if created)" });
  } catch (error) {
    return NextResponse.json(
      { error: "Webhook processing failed", details: error.message },
      { status: 400 }
    );
  }
}