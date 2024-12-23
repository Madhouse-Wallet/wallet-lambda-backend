
const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema(
    {
        userId:{
            type: mongoose.Schema.ObjectId,
            ref: 'users',
        },
        userWallet: { type: String },
        recoveryAddress: { type: String },
        depositAddress: { type: String },
        status: { type: String },
        depositType: { type: String },
        depositInstane: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
        sdkInstance: {
            type: mongoose.Schema.Types.Mixed,
            default: null,  
        },
        trxnHash: { type: String },
    },
    {
        versionKey: false,
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);


const walletModel = module.exports = mongoose.model("wallet", walletSchema, "wallet");
