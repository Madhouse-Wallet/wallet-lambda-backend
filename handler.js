const connectToDatabase = require("./db");
const Wallet = require("./model/wallet");
const userService = require("./services/user");
const { generateToken, sendResponse } = require("./utils/index")
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
module.exports.receiveTbtc = async (event) => {
    try {
        await connectToDatabase();
        const { userWallet, recovery } = JSON.parse(event.body);
        // console.log("walletAddress--->", userWallet, recovery)
        if (!userWallet || !recovery) {
            return sendResponse(400, { message: " User or Recovery Address is required!" })
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
        const deposit = await sdk.deposits.initiateDeposit(recovery);
        const bitcoinDepositAddress = await deposit.getBitcoinAddress();
        const wallet = new Wallet({
            userId: result._id,
            userWallet: userWallet,
            recoveryAddress: recovery,
            depositAddress: bitcoinDepositAddress,
            status: "Pending",
            depositType: "receive",
            depositInstane: sdk
        });
        await wallet.save();
        return sendResponse(201, { message: "Wallet created successfully!", data: { depositAddress: bitcoinDepositAddress } })
    } catch (error) {
        return sendResponse(500, { message: "Internal server error", error: error.message })
    }
};