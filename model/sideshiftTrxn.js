
const mongoose = require('mongoose');

const sideshiftTrxntSchema = new mongoose.Schema(
    {
        email: { type: String, required: true },
        wallet: { type: String, default: "" },
        type: { type: String, default: "" },
        data: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    {
        timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
        versionKey: false
    }
);


module.exports = mongoose.model("sideShiftTrxns", sideshiftTrxntSchema, "sideShiftTrxns");
