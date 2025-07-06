import { Webhook } from "svix";
import connectDB from "../../../public/config/db";
import User from "../../../models/user";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req) {
  // Step 1: Setup webhook
  const wh = new Webhook(process.env.SIGNIN_SECRET);

  // Step 2: Read headers
  const headerPayload = headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  // Step 3: Validate headers are present
  if (!svixId || !svixTimestamp || !svixSignature) {
    console.error("❌ Missing required Svix headers");
    return NextResponse.json({ error: "Missing required Svix headers" }, { status: 400 });
  }

  const svixHeader = {
    "svix-id": svixId,
    "svix-timestamp": svixTimestamp,
    "svix-signature": svixSignature,
  };

  // Step 4: Get and verify the payload
  const payload = await req.json();
  const body = JSON.stringify(payload);

  let event;
  try {
    event = wh.verify(body, svixHeader);
  } catch (err) {
    console.error("❌ Webhook verification failed:", err.message);
    return NextResponse.json({ error: "Webhook verification failed" }, { status: 400 });
  }

  const { data, type } = event;

  // Step 5: Connect to MongoDB
  await connectDB();

  // Step 6: Prepare and handle data
  const userData = {
    _id: data.id,
    email: data.email_addresses[0]?.email_address || "",
    name: `${data.first_name || ""} ${data.last_name || ""}`,
    image: data.image_url || "",
  };

  try {
    switch (type) {
      case "user.created":
        await User.create(userData);
        break;
      case "user.updated":
        await User.findByIdAndUpdate(data.id, userData);
        break;
      case "user.deleted":
        await User.findByIdAndDelete(data.id);
        break;
      default:
        console.log("⚠️ Unhandled webhook type:", type);
        break;
    }

    return NextResponse.json({ message: "✅ Event received" });
  } catch (dbError) {
    console.error("❌ MongoDB Error:", dbError);
    return NextResponse.json({ error: "Database operation failed" }, { status: 500 });
  }
}
