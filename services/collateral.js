'use strict'
const collateralDataModel = require('../model/collateralData');

module.exports = {
    findOne: async (data, options = {}) => {
        return await collateralDataModel.findOne(data, options);
    },
    createOne: async (data, options = {}) => {
        return await collateralDataModel.create(data);
    },
    findOneAndUpdate: async (find, data) => {
        return await collateralDataModel.findOneAndUpdate(find, data, { new: true });
    },
    findOneAndUpdateUpsert: async (find, data) => {
        return await collateralDataModel.findOneAndUpdate(find, data, {
            upsert: true,
            new: true,
        });
    },
    verrifyAddMailToken: async (getToken) => {
        const authHeader = getToken;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return false
        }
        const token = authHeader.split(" ")[1];
        const user = await collateralDataModel.findOne({
            verifyToken: token,
        });
        if (user) {
            return user
        } else {
            return false
        }
    },
    verrifyAuthToken: async (getToken) => {
        const authHeader = getToken;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return false
        }
        const token = authHeader.split(" ")[1];
        const user = await collateralDataModel.findOne({
            authToken: token,
        });
        if (user) {
            return user
        } else {
            return false
        }
    },
}