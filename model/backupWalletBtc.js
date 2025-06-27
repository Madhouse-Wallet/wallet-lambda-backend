
const mongoose = require('mongoose');

const backupWalletBtcSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        email: { type: String, default: "" },
        address: { type: String, default: "" },
        wif: { type: String, default: "" },
        privateKey: { type: String, default: "" },
        tposWallet: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    {
        timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
        versionKey: false
    }
);


module.exports = mongoose.model("backupWalletBtc", backupWalletBtcSchema, "backupWalletBtc");
