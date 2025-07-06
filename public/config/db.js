import { connect } from "http2"
import monogoose from "mongoose"
import { cache } from "react"

let cached = global.monogoose || {conne: null, promise: null}

export default async function connectDB(){
    if(cached.conne) return cached.conne
    if(!cached.promise){
        cache.promise = monogoose.connect(process.env.MONOGODB_URI).then((mongoose) => mongoose )
    }
    try {
        cached.conne = await cache.promise
    } catch (error) {
        console.log(`Sorry there was a Connection Error with you data base ! Reload the Website or wait for few hours${error}`);
        
    }
    return cache.conne
}