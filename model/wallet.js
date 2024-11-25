const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema(
    {
        walletAddress: { type: String },
        passkey: { type: String },
    },
    {
        versionKey: false,
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);


const userModel = module.exports = mongoose.model("wallet", walletSchema, "wallet");
 