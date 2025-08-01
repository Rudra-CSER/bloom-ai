import mongoose from "mongoose"

let cached = global.mongoose || { conn: null, promise: null }
global.mongoose = cached
export default async function connectDB() {
    if (cached.conn) return cached.conn
    
    if (!cached.promise) {
      cached.promise = mongoose.connect();
        }
        
        cached.promise = mongoose.connect(process.env.MONGODB_URI).then((mongoose) => mongoose);
    }
    
    try {
        cached.conn = await cached.promise
        console.log("MongoDB connected successfully")
    } catch (error) {
        cached.promise = null
        console.error("MongoDB connection error:", error)
        throw error
    }
    
    return cached.conn

