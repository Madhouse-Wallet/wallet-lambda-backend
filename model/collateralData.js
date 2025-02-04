
const mongoose = require('mongoose');

const collateralDataSchema = new mongoose.Schema(
    {
        currentCollateralRatio: { type: String },
    },
    {
        versionKey: false,
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);


const walletModel = module.exports = mongoose.model("collateralData", collateralDataSchema, "collateralData");
