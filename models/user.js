import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        _id: { type: String, required: true },
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        image: { type: String, required: false },
    },
    { 
        timestamps: true,
        _id: false // Allow custom _id
    }
);

// Add index for better query performance
UserSchema.index({ email: 1 });

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;