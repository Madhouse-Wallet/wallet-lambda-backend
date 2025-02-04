const connectToDatabase = require("./db");
const { sendResponse } = require("./utils/index")
const { ethers } = require("ethers");
 const {startMonitoring} = require("./utils/coll")

 
module.exports.receiveTbtc = async (event) => {
    try { 
        const tt =  startMonitoring()
        return sendResponse(201, { message: "cron started successfully!", status: "success", data: { } })
    } catch (error) {
        return sendResponse(500, { message: "Internal server error", status: "failure", error: error.message })
    }
};
