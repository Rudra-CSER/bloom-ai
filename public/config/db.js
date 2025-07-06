import mongoose from "mongoose"

let cached = global.mongoose || {conn: null, promise: null}

export default async function connectDB(){
    if(cached.conn) return cached.conn
    if(!cached.promise){
        cached.promise = mongoose.connect(process.env.MONOGODB_URI).then((mongoose) => mongoose )
    }
    try {
        cached.conn = await cached.promise
    } catch (error) {
        console.log(`Sorry there was a Connection Error with your database! Reload the Website or wait for few hours: ${error}`);
        
    }
    return cached.conn
}
