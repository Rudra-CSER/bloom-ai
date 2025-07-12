import connectDB from "../../../public/config/db";
import User from "../../../models/user";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    console.log("Testing webhook-like user creation...");
    
    // Simulate webhook data
    const testData = {
      id: "test-user-" + Date.now(),
      email_addresses: [{ email_address: "test@example.com" }],
      first_name: "Test",
      last_name: "User",
      image_url: "https://example.com/image.jpg"
    };

    const userData = {
      _id: testData.id,
      email: testData.email_addresses[0].email_address,
      name: `${testData.first_name || ''} ${testData.last_name || ''}`.trim(),
      image: testData.image_url,
    };

    console.log("User data to save:", userData);

    await connectDB();
    console.log("MongoDB connected successfully");

    console.log("Creating test user in database...");
    const createdUser = await User.create(userData);
    console.log("User created successfully:", createdUser._id);

    return NextResponse.json({ 
      message: "Test user created successfully",
      user: createdUser
    });
  } catch (error) {
    console.error("Test webhook failed:", error);
    return NextResponse.json(
      { error: "Test webhook failed", details: error.message },
      { status: 500 }
    );
  }
} 