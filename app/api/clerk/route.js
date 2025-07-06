import {Webhook} from "svix"
import connectDB from "../../../public/config/db"
import User from "../../../models/user"
import { headers } from "next/headers"
import { NextResponse } from "next/server"


export async function POST(req) {
    const wh = new Webhook(process.env.SIGNIN_SECRET)
    const headerPayload = await headers()
    const svixHeader =  {
        "svix-id" : headerPayload.get("svix-id"),
        "svix-timestamp" : headerPayload.get("svix-timestamp"),
        "svix-signature" : headerPayload.get("svix-signature")
    };



// get the payload and verify it 

const payload = await req.json();
const body = JSON.stringify(payload);
const {data , type } = wh.verify(body , svixHeader)



// prepare the data and save into the db 

const userData ={
    _id : data.id , 
    email : data.email_address[0].email_address,
    name : `${data.frist_name} ${data.lastname}`,
    image : data.image_url ,
};

await connectDB();

switch (type) {
    case 'user.created':
        await User.create(userData)
        break;
    case 'user.updated':
        await User.findByIdAndUpdate(data.id , userData)
        break;
    case 'user.deleted':
        await User.findByIdAndDelete(data.id , userData)
        break;

    default:
        break;
}
 
return NextResponse.json({massage: "Event received"})

}