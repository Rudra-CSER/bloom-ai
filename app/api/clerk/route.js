import { Webhook } from "svix";
import connectDB from "../../../public/config/db";
import User from "../../../models/user";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req) {
  // Step 1: Setup webhook
  const wh = new Webhook(process.env.SIGNIN_SECRET);
  const headerPayload = await headers;
  const svixHeaders = {
    "siv-id": headerPayload.get("sivx-id"),
    "siv-signature": headerPayload.get("sivx-signature"),
    "siv-timestamps": headerPayload.get("sivx-timestamps")
  }
 const payload = await req.json();
 const body = JSON.stringify(payload);
 const {data ,type} = wh.verify(body , svixHeaders);


 const userData = {
  _id: data.id,
  email : data.email_addresses[0].email_address,
  name: `${data.frist_name}${data.last_name}`,
image: data.image_url,
 }
 await connectDB();


 switch(type){
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
 return NextRequest.json({massages:"Message Received" })

}
