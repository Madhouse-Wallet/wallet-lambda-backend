
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        paymentId: { type: String, default: "" },
        status: { type: String, default: "" },
        validFrom: { type: String, default: "" },
        validTo: { type: String, default: "" },
        paymentInfo: { type: mongoose.Schema.Types.Mixed, default: {} }
    },
    {
        timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
        versionKey: false
    }
);


 module.exports = mongoose.model("payments", paymentSchema, "payments");
