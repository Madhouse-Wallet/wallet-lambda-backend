require('dotenv').config();
const connectToDatabase = require("./db");
// const connectToDatabaseTest = require("./dbTest");
const { sendResponse } = require("./utils/index")
// const { ethers } = require("ethers");
// const { startMonitoring } = require("./utils/coll")
// const AWS = require('aws-sdk');
// const { MongoClient } = require('mongodb');
const { addLnbitTposUser, addLnbitSpendUser } = require('./services/create-lnbitUser.js');
const { createBitcoinWallet } = require('./services/generateBitcoinWallet.js');

const UsersModel = require('./services/users.js');
const {
    logIn,

} = require("./services/lnbit.js");

function shortenAddress(address) {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, 6)}${address.slice(-4)}`;
}


module.exports.addlnbitUser = async (event) => {
    try {
        let bodyData = JSON.parse(event.body);
        const { madhouseWallet, email, liquidBitcoinWallet, bitcoinWallet, provisionlnbitType, refund_address1 = ""
        } = bodyData;
        await connectToDatabase();
        const shortened = await shortenAddress(madhouseWallet);
        if (provisionlnbitType == 1) {
            let refund_address = await addLnbitSpendUser(shortened, email, 2, 1);
            if (refund_address) {
                await addLnbitTposUser(shortened, email, liquidBitcoinWallet, bitcoinWallet, refund_address, 1, 1);
            }
        } else if (provisionlnbitType == 2) {
            await addLnbitTposUser(shortened, email, liquidBitcoinWallet, bitcoinWallet, refund_address1, 1, 1);
        } else if (provisionlnbitType == 3) {
            await addLnbitTposUser(shortened, email, liquidBitcoinWallet, bitcoinWallet, refund_address1, 1, 1);
        }


        return sendResponse(200, {
            message: "success!", status: "success", data: {

            },
        });
        // Return the initial response including the invoice
    } catch (error) {
        console.log("error--->", error)
        console.error("Error creating swap:", error);

        // Check if it's an Axios error with response data
        if (error.response && error.response.data) {

            return sendResponse(500, { message: "Internal server error", status: "failure", error: error.response.data.error || "Error creating swap" })

            //   return res.status(error.response.status).json({
            //     status: "error",
            //     error: error.response.data.error || "Error creating swap",
            //   });
        }

        return sendResponse(500, {
            message: "Internal server error", status: "failure", error: error.message || "Error creating swap",
        })
    }
}


module.exports.getUser = async (event) => {
    try {
        let bodyData = JSON.parse(event.body);
        const { email, token = false } = bodyData;
        await connectToDatabase();
        // Validate email
        if (!email || typeof email !== 'string') {
            return sendResponse(400, {
                message: "Invalid email!", status: "failure", error: "Invalid email!",
            })
        }
        let existingUser;
        if (token) {
            existingUser = await UsersModel.findOne(
                { email: { $regex: new RegExp(`^${email}$`, 'i') } },
                { projection: { flowTokens: 0, boltzAutoReverseSwap: 0, boltzAutoReverseSwap_2: 0 } }
            );
        } else {
            existingUser = await UsersModel.findOne(
                { email: { $regex: new RegExp(`^${email}$`, 'i') } },
                { projection: { coinosToken: 0, flowTokens: 0, boltzAutoReverseSwap: 0, boltzAutoReverseSwap_2: 0 } }
            );
        }
        if (existingUser) {
            //   return res.status(400).json({ error: 'Email already exists' });
            return sendResponse(200, {
                message: "User fetched successfully!", status: "success", data: existingUser,
            });
        } else {
            return sendResponse(400, {
                message: "No User Found!", status: "failure", error: "No User Found!",
            })
        }
        // Return the initial response including the invoice
    } catch (error) {
        console.log("error--->", error)
        // Check if it's an Axios error with response data
        if (error.response && error.response.data) {
            return sendResponse(500, { message: "Internal server error", status: "failure", error: error.response.data.error || "Error Finding User!" })
        }
        return sendResponse(500, {
            message: "Internal server error", status: "failure", error: error.message || "Error Finding User!",
        })
    }
}


module.exports.createUser = async (event) => {
    try {
        let bodyData = JSON.parse(event.body);
        const { email, username, passkey, totalPasskey = 1, wallet, bitcoinWallet = "", liquidBitcoinWallet = "", coinosToken,
            flowTokens, coinosUserName } = bodyData;
        await connectToDatabase();
        // Validate email
        if (!email || typeof email !== 'string') {
            return sendResponse(400, {
                message: "Invalid email!", status: "failure", error: "Invalid email!",
            })
        }
        let existingUser = await UsersModel.findOne(
            { email: { $regex: new RegExp(`^${email}$`, 'i') } }
        );
        if (existingUser) {
            return sendResponse(400, {
                message: "User Already Exist!", status: "failure", error: "User Already Exist!",
            })
        } else {
            const result = await UsersModel.insertOne({
                email, username, passkey_number: 1, passkey_status: false, passkey, totalPasskey, wallet, bitcoinWallet, liquidBitcoinWallet,
                coinosToken, flowTokens, coinosUserName, createdAt: new Date()
            });
            return sendResponse(200, {
                message: "User Created successfully!", status: "success", data: result,
            });
        }
        // Return the initial response including the invoice
    } catch (error) {
        console.log("error--->", error)
        // Check if it's an Axios error with response data
        if (error.response && error.response.data) {
            return sendResponse(500, { message: "Internal server error", status: "failure", error: error.response.data.error || "Error Finding User!" })
        }
        return sendResponse(500, {
            message: "Internal server error", status: "failure", error: error.message || "Error Finding User!",
        })
    }
}


module.exports.updtUser = async (event) => {
    try {
        let bodyData = JSON.parse(event.body);
        const { findData = {}, updtData = {} } = bodyData;
        await connectToDatabase();
        // const existingUser = await usersCollection.findOne({ email });
        const existingUser = await UsersModel.findOneAndUpdate(findData, updtData, { returnDocument: "after" });
        if (existingUser) {
            return sendResponse(200, {
                message: "User updated successfully!", status: "success", data: existingUser,
            });
        } else {
            return sendResponse(400, {
                message: "No User Found!", status: "failure", error: "No User Found!",
            })
        }
    } catch (error) {
        console.log("error--->", error)
        // Check if it's an Axios error with response data
        if (error.response && error.response.data) {
            return sendResponse(500, { message: "Internal server error", status: "failure", error: error.response.data.error || "Error Finding User!" })
        }
        return sendResponse(500, {
            message: "Internal server error", status: "failure", error: error.message || "Error Finding User!",
        })
    }
}




module.exports.getBitcoinWallet = async (event) => {
    try {
        let data = await createBitcoinWallet();
        return sendResponse(200, {
            message: "Wallet Created successfully!", status: "success", data,
        });
    } catch (error) {
        console.log("error--->", error)
        // Check if it's an Axios error with response data
        if (error.response && error.response.data) {
            return sendResponse(500, { message: "Internal server error", status: "failure", error: error.response.data.error || "Error Creating Wallet!" })
        }
        return sendResponse(500, {
            message: "Internal server error", status: "failure", error: error.message || "Error Creating Wallet!",
        })
    }
}




 



