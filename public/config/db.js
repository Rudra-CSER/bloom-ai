import mongoose from "mongoose"

let cached = global.mongoose || { conn: null, promise: null }

export default async function connectDB() {
    if (cached.conn) return cached.conn
    
    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        }
        
        cached.promise = mongoose.connect(process.env.MONGODB_URI, opts)
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
}
