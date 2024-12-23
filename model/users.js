
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        wallet: { type: String },
        dateCreated: { type: Date, default: Date.now },
        dateCreatedUtc: { type: Date, default: Date.now },
    },
    {
        versionKey: false,
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);


const userModel = module.exports = mongoose.model("users", userSchema, "users");
