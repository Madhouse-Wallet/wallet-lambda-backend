
const mongoose = require('mongoose');

const collateralSchema = new mongoose.Schema(
    {
        userId: { type: String },
        email: { type: String },
        walletAddress: { type: String }
    },
    {
        versionKey: false,
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);


const walletModel = module.exports = mongoose.model("collateral", collateralSchema, "collateral");
