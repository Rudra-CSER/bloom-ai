import {Webhook} from "svix"
import connectDB from "../../../public/config/db"
import User from "../../../models/user"
import { NextResponse } from "next/server"

export async function POST(req) {
    try {
        const wh = new Webhook(process.env.SIGNIN_SECRET)
        
        // Get headers directly from the request
        const svixId = req.headers.get("svix-id")
        const svixTimestamp = req.headers.get("svix-timestamp")
        const svixSignature = req.headers.get("svix-signature")

        // Check if all required headers are present
        if (!svixId || !svixTimestamp || !svixSignature) {
            console.error('Missing headers:', { svixId, svixTimestamp, svixSignature })
            return NextResponse.json({ error: 'Missing required headers' }, { status: 400 })
        }

        // Get the payload
        const payload = await req.json()
        const body = JSON.stringify(payload)

        // Verify the webhook
        const evt = wh.verify(body, {
            "svix-id": svixId,
            "svix-timestamp": svixTimestamp,
            "svix-signature": svixSignature,
        })

        const { data, type } = evt

        // Prepare the user data
        const userData = {
            _id: data.id,
            email: data.email_addresses[0].email_address,
            name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
            image: data.image_url || '',
        }

        // Connect to database
        await connectDB()

        // Handle different event types
        switch (type) {
            case 'user.created':
                await User.create(userData)
                console.log('✅ User created:', userData._id)
                break
            case 'user.updated':
                await User.findByIdAndUpdate(data.id, userData)
                console.log('✅ User updated:', userData._id)
                break
            case 'user.deleted':
                await User.findByIdAndDelete(data.id)
                console.log('✅ User deleted:', data.id)
                break
            default:
                console.log('⚠️ Unhandled event type:', type)
                break
        }

        return NextResponse.json({ message: 'Event received' })
    } catch (error) {
        console.error('❌ Webhook error:', error)
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
    }
}
