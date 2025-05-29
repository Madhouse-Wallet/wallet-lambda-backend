'use strict'
require('dotenv').config();


const collateral = require('../model/collateral');

module.exports = {
    findOne: async (data, options = {}) => {
        return await collateral.findOne(data, options);
    },
    createOne: async (data, options = {}) => {
        return await collateral.create(data);
    },
    getUniqueWallets: async () => {
        try {
            const result = await collateral.aggregate([
                {
                    $group: {
                        _id: "$walletAddress",              // Group by walletAddress
                        email: { $first: "$email" }         // Get the first email for each walletAddress
                    }
                },
                {
                    $match: { _id: { $ne: null } }          // Exclude documents with null walletAddress
                },
                {
                    $project: {
                        _id: 0,                            // Exclude the _id field
                        walletAddress: "$_id",             // Rename _id to walletAddress
                        email: 1                           // Include the email field
                    }
                }
            ]);
    
            console.log(result);
            return result;
        } catch (error) {
            console.error("Error fetching unique wallets:", error);
        }
    },
    findOneAndUpdate: async (find, data) => {
        return await collateral.findOneAndUpdate(find, data, { new: true });
    },
    findOneAndUpdateUpsert: async (find, data) => {
        return await collateral.findOneAndUpdate(find, data, {
            upsert: true,
            new: true,
        });
    } 
}