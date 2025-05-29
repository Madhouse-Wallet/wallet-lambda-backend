require('dotenv').config();
const connectToDatabase = require("./db");
// const connectToDatabaseTest = require("./dbTest");
const { sendResponse } = require("./utils/index")
// const { ethers } = require("ethers");
// const { startMonitoring } = require("./utils/coll")
// const AWS = require('aws-sdk');
// const { MongoClient } = require('mongodb');
const { addLnbitTposUser, addLnbitSpendUser } = require('./services/create-lnbitUser.js');



const axios = require("axios");


function shortenAddress(address) {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, 6)}${address.slice(-4)}`;
}


module.exports.addlnbitUser = async (event) => {
    try {
        let bodyData = JSON.parse(event.body);

        const { madhouseWallet, email, liquidBitcoinWallet, bitcoinWallet, provisionlnbitType
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

