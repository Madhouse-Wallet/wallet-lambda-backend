// import { TBTC } from "@keep-network/tbtc-v2.ts"; // tBTC SDK Initialization Function
const { TBTC } = require("@keep-network/tbtc-v2.ts");
console.log("TBTC-->",TBTC) 
async function initializeTBTC(signer) {
  try {
    // Initialize the SDK for Mainnet
    console.log("Initialize the SDK for Testnet");
    // const sdk = await TBTC.initializeMainnet(signer);
    const sdk = await TBTC.initializeSepolia(signer);

    return {
      deposits: sdk.deposits,         // Access deposit functionalities
      redemptions: sdk.redemptions,   // Access redemption functionalities
      tbtcContracts: sdk.tbtcContracts, // Direct access to tBTC smart contracts
      bitcoinClient: sdk.bitcoinClient, // Access Bitcoin client
    };
  } catch (error) {
    console.error("Failed to initialize TBTC SDK:", error);
    throw error; // Ensure errors are caught
  }
}
module.exports = { initializeTBTC };