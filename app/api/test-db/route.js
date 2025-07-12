import connectDB from "../../../public/config/db";
import User from "../../../models/user";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("Testing MongoDB connection...");
    console.log("MONGODB_URI exists:", !!process.env.MONGODB_URI);
    
    await connectDB();
    console.log("MongoDB connected successfully");
    
    // Test creating a simple document
    const testUser = {
      _id: "test-user-" + Date.now(),
      email: "test@example.com",
      name: "Test User",
      image: "https://example.com/image.jpg"
    };
    
    console.log("Attempting to create test user:", testUser);
    const createdUser = await User.create(testUser);
    console.log("Test user created successfully:", createdUser._id);
    
    // Clean up - delete the test user
    await User.findByIdAndDelete(testUser._id);
    console.log("Test user cleaned up");
    
    return NextResponse.json({ 
      message: "MongoDB connection and operations successful",
      testUser: createdUser
    });
  } catch (error) {
    console.error("MongoDB test failed:", error);
    return NextResponse.json(
      { error: "MongoDB test failed", details: error.message },
      { status: 500 }
    );
  }
} 