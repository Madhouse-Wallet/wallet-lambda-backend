const connectToDatabase = require("./db");
const Wallet = require("./model/wallet");
const userService = require("./services/user");
const { sendResponse } = require("./utils/index")
const { initializeTBTC } = require("./utils/tbtcSdkInitializer")
const { ethers } = require("ethers");
const { Defender } = require("@openzeppelin/defender-sdk");
const RELAYER_API_KEY = "5jc9eNyzKWUPzDuVyZCEh5tePeep6zad"; // OpenZeppelin Defender Relayer API Key
const RELAYER_API_SECRET = "2zDYjs7Pa8ScEiw72QrfGTMAS1uuWv3qkmpFtSqqhTyizytoa5fJ4rrSTqtuyeGw"; // OpenZeppelin Defender Relayer API Secret
const getNewSigner = async () => {
    try {
        const client = new Defender({
            relayerApiKey: RELAYER_API_KEY,
            relayerApiSecret: RELAYER_API_SECRET
        });

        const provider = await client.relaySigner.getProvider();
        const signer = await client.relaySigner.getSigner(provider, { speed: 'fast' });
        console.log("provider, signer", signer)
        return {
            provider,
            signer
        }
    } catch (error) {
        console.log("error--->", error)
    }
}
console.log("initializeTBTC-->", initializeTBTC)

const checkDeopsit = async (instance, id, endTime) => {
    try {
        const currentTime = new Date();
        if (currentTime < endTime) {
            const fundingUTXOs = await instance.detectFunding();
            console.log("fundingUTXOs---->", fundingUTXOs)
            // Initiate minting using one of the funding UTXOs. Returns hash of the
            // initiate minting transaction.
            if (fundingUTXOs.length > 0) {
                try {
                    const txHash = await instance.initiateMinting(fundingUTXOs[0])
                    console.log("txHash---->", txHash)    
                } catch (error) {
                    console.log("error-->f",error)
                }
            } else {
                checkDeopsit(instance, id, endTime)
            }
        }else{
            console.log("text000> time completed", new Date(), endTime)
        }
    } catch (error) {
        console.log("error--->", error)
    }
}

module.exports.receiveTbtc = async (event) => {
    try {
        await connectToDatabase();
        const { userWallet, recovery } = JSON.parse(event.body);
        // console.log("walletAddress--->", userWallet, recovery)
        if (!userWallet || !recovery) {
            return sendResponse(400, { message: " User or Recovery Address is required!", status: "failure" })
        }
        const result = await userService.findOneAndUpdateUpsert({
            wallet: userWallet
        }, {
            wallet: userWallet
        });
        // Setup OpenZeppelin Defender client and signer
        const getSignerData = await getNewSigner();
        console.log("result-->", result, getSignerData)
        const sdk = await initializeTBTC(getSignerData?.signer);
        console.log("sdk-->", sdk)
        let depositInstane = await sdk.deposits.initiateDeposit(recovery);
        const bitcoinDepositAddress = await depositInstane.getBitcoinAddress();
        const wallet = new Wallet({
            userId: result._id,
            userWallet: userWallet,
            recoveryAddress: recovery,
            depositAddress: bitcoinDepositAddress,
            status: "Pending",
            depositType: "receive",
            depositInstane: depositInstane,
            sdkInstance: sdk
        });
        await wallet.save();
        checkDeopsit(depositInstane, wallet?._id, new Date(new Date().getTime() + 11 * 60 * 1000))
        return sendResponse(201, { message: "Wallet created successfully!", status: "success", data: { depositAddress: bitcoinDepositAddress, id: wallet?._id } })
    } catch (error) {
        return sendResponse(500, { message: "Internal server error", status: "failure", error: error.message })
    }
};




// module.exports.mintBtc = async (event) => {
//     try {
//         await connectToDatabase();
//         const { id } = JSON.parse(event.body);
//         // console.log("walletAddress--->", userWallet, recovery)
//         if (!id) {
//             return sendResponse(400, { message: "Deposit ID is required!", status: "failure" })
//         }
//         const result = await Wallet.findOne({
//             where: {
//                 _id: id
//             }
//         });
//         if (!result) {
//             return sendResponse(400, { message: "No Deposit Found!", status: "failure" })
//         }
//         // console.log("result-->",result.depositInstane)
//         let depositSetup = result.depositInstane;
//         const fundingUTXOs = await initializeData[result.userWallet].detectFunding()
//         console.log("fundingUTXOs---->", fundingUTXOs)
//         // Initiate minting using one of the funding UTXOs. Returns hash of the
//         // initiate minting transaction.
//         if (fundingUTXOs.length > 0) {
//             const txHash = await depositSetup.initiateMinting(fundingUTXOs[0])
//             console.log("txHash---->", txHash)
//             return sendResponse(201, { message: "Minting Initiated successfully!", data: {} })
//         } else {
//             return sendResponse(400, { message: "No deposit found. Please make a deposit!", status: "failure" })
//         }
//     } catch (error) {
//         return sendResponse(500, { message: "Internal server error", error: error.message })
//     }
// };