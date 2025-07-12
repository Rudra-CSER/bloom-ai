import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("Testing MongoDB connection with your URI...");
    console.log("MONGODB_URI exists:", !!process.env.MONGODB_URI);
    
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: "MONGODB_URI environment variable not found" },
        { status: 500 }
      );
    }

    // Test connection
    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
    });

    console.log("MongoDB connected successfully!");
    console.log("Database name:", connection.connection.db.databaseName);
    console.log("Connection state:", connection.connection.readyState);

    // Test creating a collection
    const testCollection = connection.connection.db.collection('test');
    const testDoc = { 
      _id: 'test-' + Date.now(),
      message: 'Connection test successful',
      timestamp: new Date()
    };

    await testCollection.insertOne(testDoc);
    console.log("Test document inserted successfully");

    // Clean up
    await testCollection.deleteOne({ _id: testDoc._id });
    console.log("Test document cleaned up");

    await mongoose.disconnect();
    console.log("MongoDB disconnected");

    return NextResponse.json({ 
      message: "MongoDB connection successful!",
      database: connection.connection.db.databaseName,
      connectionState: connection.connection.readyState
    });

  } catch (error) {
    console.error("MongoDB connection test failed:", error);
    
    // Provide specific error guidance
    let errorMessage = error.message;
    if (error.message.includes("ECONNREFUSED")) {
      errorMessage = "Connection refused - check if MongoDB Atlas is accessible";
    } else if (error.message.includes("ENOTFOUND")) {
      errorMessage = "Host not found - check your cluster URL";
    } else if (error.message.includes("Authentication failed")) {
      errorMessage = "Authentication failed - check username/password";
    } else if (error.message.includes("Network is unreachable")) {
      errorMessage = "Network error - check IP whitelist in MongoDB Atlas";
    }

    return NextResponse.json(
      { 
        error: "MongoDB connection failed", 
        details: errorMessage,
        fullError: error.message
      },
      { status: 500 }
    );
  }
} 