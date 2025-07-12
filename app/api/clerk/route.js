import { Webhook } from "svix";
import connectDB from "../../../public/config/db";
import User from "../../../models/user";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // Step 1: Setup webhook
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    const headerPayload = await headers;
    const svixHeaders = {
      "svix-id": headerPayload.get("svix-id"),
      "svix-signature": headerPayload.get("svix-signature"),
      "svix-timestamp": headerPayload.get("svix-timestamp")
    };

    const payload = await req.json();
    const body = JSON.stringify(payload);
    
    // Verify webhook signature
    const { data, type } = wh.verify(body, svixHeaders);

    const userData = {
      _id: data.id,
      email: data.email_addresses[0].email_address,
      name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
      image: data.image_url,
    };

    await connectDB();

    switch (type) {
      case 'user.created':
        await User.create(userData);
        break;
      case 'user.updated':
        await User.findByIdAndUpdate(data.id, userData, { new: true });
        break;
      case 'user.deleted':
        await User.findByIdAndDelete(data.id);
        break;
      default:
        console.log(`Unhandled webhook type: ${type}`);
        break;
    }

    return NextResponse.json({ message: "Webhook processed successfully" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 400 }
    );
  }
}
