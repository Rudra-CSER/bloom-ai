import {Webhook} from "svix"
import connectDB from "../../../public/config/db"
import User from "../../../models/user"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(req) {
    try {
        console.log('🔄 Webhook received');
        
        // Check if webhook secret exists
        if (!process.env.SIGNIN_SECRET) {
            console.error('❌ SIGNIN_SECRET not found in environment variables');
            return NextResponse.json({error: "Webhook secret not configured"}, {status: 500});
        }
        
        const wh = new Webhook(process.env.SIGNIN_SECRET)
        const headerPayload = await headers()
        const svixHeader = {
            "svix-id": headerPayload.get("svix-id"),
            "svix-timestamp": headerPayload.get("svix-timestamp"),
            "svix-signature": headerPayload.get("svix-signature")
        };

        console.log('📋 Headers received:', svixHeader);

        // Get the payload and verify it
        const payload = await req.json();
        const body = JSON.stringify(payload);
        console.log('📦 Payload type:', payload.type);
        console.log('👤 User data preview:', {
            id: payload.data?.id,
            email: payload.data?.email_addresses?.[0]?.email_address,
            first_name: payload.data?.first_name,
            last_name: payload.data?.last_name
        });

        const {data, type} = wh.verify(body, svixHeader);
        console.log('✅ Webhook verified successfully');
        
        // Check if required data exists
        if (!data.id) {
            console.error('❌ User ID not found in webhook data');
            return NextResponse.json({error: "User ID missing"}, {status: 400});
        }
        
        if (!data.email_addresses || data.email_addresses.length === 0) {
            console.error('❌ Email addresses not found in webhook data');
            return NextResponse.json({error: "Email addresses missing"}, {status: 400});
        }

        // Prepare the data and save into the db
        const userData = {
            _id: data.id,
            email: data.email_addresses[0].email_address,
            name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
            image: data.image_url || '',
        };
        
        console.log('👤 Prepared user data:', userData);

        // Connect to database
        console.log('🔗 Connecting to database...');
        await connectDB();
        console.log('✅ Database connected successfully');

        switch (type) {
            case 'user.created':
                console.log('➕ Creating new user...');
                const newUser = await User.create(userData);
                console.log('✅ User created successfully:', newUser._id);
                break;
                
            case 'user.updated':
                console.log('📝 Updating existing user...');
                const updatedUser = await User.findByIdAndUpdate(data.id, userData, {new: true});
                console.log('✅ User updated successfully:', updatedUser?._id);
                break;
                
            case 'user.deleted':
                console.log('🗑️ Deleting user...');
                const deletedUser = await User.findByIdAndDelete(data.id);
                console.log('✅ User deleted successfully:', deletedUser?._id);
                break;

            default:
                console.log('⚠️ Unhandled event type:', type);
                break;
        }

        console.log('🎉 Webhook processed successfully');
        return NextResponse.json({message: "Event received and processed"});
        
    } catch (error) {
        console.error('❌ Webhook processing error:', error);
        console.error('Stack trace:', error.stack);
        return NextResponse.json({error: "Webhook processing failed", details: error.message}, {status: 500});
    }
}
