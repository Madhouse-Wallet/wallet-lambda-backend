'use strict'
require('dotenv').config();
const usersModel = require('../model/users');

module.exports = {
    findOne: async (data, options = {}) => {
        return await usersModel.findOne(data, options);
    },
    createOne: async (data, options = {}) => {
        return await usersModel.create(data);
    },
    findOneAndUpdate: async (find, data) => {
        return await usersModel.findOneAndUpdate(find, data, { new: true });
    },
    findOneAndUpdateUpsert: async (find, data) => {
        return await usersModel.findOneAndUpdate(find, data, {
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
        const user = await usersModel.findOne({
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
        const user = await usersModel.findOne({
            authToken: token,
        });
        if (user) {
            return user
        } else {
            return false
        }
    },
}