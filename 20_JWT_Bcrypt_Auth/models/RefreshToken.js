import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
    {
        // Don't store the raw refresh token
        // The raw refresh token goes to the client.
        // The server stores a hash that it can use for lookup/verification.
        tokenHash: {
            type: String,
            required: true,
            unique: true,
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        expiresAt: {
            type: Date,
            required: true,
        },

        revokedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    },
);

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);

export default RefreshToken;
