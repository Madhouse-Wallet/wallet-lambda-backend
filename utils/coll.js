const { ethers } = require("ethers");
const connectToDatabase = require("../db");
const collateralServive = require("../services/collateral")
// Configuration
const RPC_URL = "https://1rpc.io/eth"; // Replace with your Ethereum node URL (e.g., Infura, Alchemy)
const CONTRACT_ADDRESS = "0xfC7d41A684b7dB7c817A9dDd028f9A31c2F6f893"; // Replace with the tBTC collateral contract address
const CONTRACT_ABI = [{ "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "_activePoolAddress", "type": "address" }], "name": "ActivePoolAddressChanged", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "_baseRate", "type": "uint256" }], "name": "BaseRateUpdated", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "_newBorrowerOperationsAddress", "type": "address" }], "name": "BorrowerOperationsAddressChanged", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "_collSurplusPoolAddress", "type": "address" }], "name": "CollSurplusPoolAddressChanged", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "_defaultPoolAddress", "type": "address" }], "name": "DefaultPoolAddressChanged", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "_gasPoolAddress", "type": "address" }], "name": "GasPoolAddressChanged", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "_L_Collateral", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "_L_THUSDDebt", "type": "uint256" }], "name": "LTermsUpdated", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "_lastFeeOpTime", "type": "uint256" }], "name": "LastFeeOpTimeUpdated", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "_liquidatedDebt", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "_liquidatedColl", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "_collGasCompensation", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "_THUSDGasCompensation", "type": "uint256" }], "name": "Liquidation", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "_pcvAddress", "type": "address" }], "name": "PCVAddressChanged", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "_newPriceFeedAddress", "type": "address" }], "name": "PriceFeedAddressChanged", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "_attemptedTHUSDAmount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "_actualTHUSDAmount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "_collateralSent", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "_collateralFee", "type": "uint256" }], "name": "Redemption", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "_sortedTrovesAddress", "type": "address" }], "name": "SortedTrovesAddressChanged", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "_stabilityPoolAddress", "type": "address" }], "name": "StabilityPoolAddressChanged", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "_totalStakesSnapshot", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "_totalCollateralSnapshot", "type": "uint256" }], "name": "SystemSnapshotsUpdated", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "_newTHUSDTokenAddress", "type": "address" }], "name": "THUSDTokenAddressChanged", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "_newTotalStakes", "type": "uint256" }], "name": "TotalStakesUpdated", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "_borrower", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "_newIndex", "type": "uint256" }], "name": "TroveIndexUpdated", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "_borrower", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "_debt", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "_coll", "type": "uint256" }, { "indexed": false, "internalType": "enum TroveManager.TroveManagerOperation", "name": "_operation", "type": "uint8" }], "name": "TroveLiquidated", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "_L_Collateral", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "_L_THUSDDebt", "type": "uint256" }], "name": "TroveSnapshotsUpdated", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "_borrower", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "_debt", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "_coll", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "_stake", "type": "uint256" }, { "indexed": false, "internalType": "enum TroveManager.TroveManagerOperation", "name": "_operation", "type": "uint8" }], "name": "TroveUpdated", "type": "event" }, { "inputs": [], "name": "BETA", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "BORROWING_FEE_FLOOR", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "CCR", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "DECIMAL_PRECISION", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "L_Collateral", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "L_THUSDDebt", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "MAX_BORROWING_FEE", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "MCR", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "MINUTE_DECAY_FACTOR", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "MIN_NET_DEBT", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "NAME", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "PERCENT_DIVISOR", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "REDEMPTION_FEE_FLOOR", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "THUSD_GAS_COMPENSATION", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "TroveOwners", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "Troves", "outputs": [{ "internalType": "uint256", "name": "debt", "type": "uint256" }, { "internalType": "uint256", "name": "coll", "type": "uint256" }, { "internalType": "uint256", "name": "stake", "type": "uint256" }, { "internalType": "enum ITroveManager.Status", "name": "status", "type": "uint8" }, { "internalType": "uint128", "name": "arrayIndex", "type": "uint128" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "_100pct", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "activePool", "outputs": [{ "internalType": "contract IActivePool", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_borrower", "type": "address" }], "name": "addTroveOwnerToArray", "outputs": [{ "internalType": "uint256", "name": "index", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_borrower", "type": "address" }], "name": "applyPendingRewards", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "baseRate", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address[]", "name": "_troveArray", "type": "address[]" }], "name": "batchLiquidateTroves", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "borrowerOperationsAddress", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_price", "type": "uint256" }], "name": "checkRecoveryMode", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_borrower", "type": "address" }], "name": "closeTrove", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "decayBaseRateFromBorrowing", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_borrower", "type": "address" }, { "internalType": "uint256", "name": "_collDecrease", "type": "uint256" }], "name": "decreaseTroveColl", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_borrower", "type": "address" }, { "internalType": "uint256", "name": "_debtDecrease", "type": "uint256" }], "name": "decreaseTroveDebt", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "defaultPool", "outputs": [{ "internalType": "contract IDefaultPool", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_THUSDDebt", "type": "uint256" }], "name": "getBorrowingFee", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_THUSDDebt", "type": "uint256" }], "name": "getBorrowingFeeWithDecay", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getBorrowingRate", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getBorrowingRateWithDecay", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_borrower", "type": "address" }, { "internalType": "uint256", "name": "_price", "type": "uint256" }], "name": "getCurrentICR", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_borrower", "type": "address" }], "name": "getEntireDebtAndColl", "outputs": [{ "internalType": "uint256", "name": "debt", "type": "uint256" }, { "internalType": "uint256", "name": "coll", "type": "uint256" }, { "internalType": "uint256", "name": "pendingTHUSDDebtReward", "type": "uint256" }, { "internalType": "uint256", "name": "pendingCollateralReward", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getEntireSystemColl", "outputs": [{ "internalType": "uint256", "name": "entireSystemColl", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getEntireSystemDebt", "outputs": [{ "internalType": "uint256", "name": "entireSystemDebt", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_borrower", "type": "address" }], "name": "getNominalICR", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_borrower", "type": "address" }], "name": "getPendingCollateralReward", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_borrower", "type": "address" }], "name": "getPendingTHUSDDebtReward", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_collateralDrawn", "type": "uint256" }], "name": "getRedemptionFeeWithDecay", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getRedemptionRate", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getRedemptionRateWithDecay", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_price", "type": "uint256" }], "name": "getTCR", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_borrower", "type": "address" }], "name": "getTroveColl", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_borrower", "type": "address" }], "name": "getTroveDebt", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_index", "type": "uint256" }], "name": "getTroveFromTroveOwnersArray", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getTroveOwnersCount", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_borrower", "type": "address" }], "name": "getTroveStake", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_borrower", "type": "address" }], "name": "getTroveStatus", "outputs": [{ "internalType": "enum ITroveManager.Status", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_borrower", "type": "address" }], "name": "hasPendingRewards", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_borrower", "type": "address" }, { "internalType": "uint256", "name": "_collIncrease", "type": "uint256" }], "name": "increaseTroveColl", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_borrower", "type": "address" }, { "internalType": "uint256", "name": "_debtIncrease", "type": "uint256" }], "name": "increaseTroveDebt", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "isOwner", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "lastCollateralError_Redistribution", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "lastFeeOperationTime", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "lastTHUSDDebtError_Redistribution", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_borrower", "type": "address" }], "name": "liquidate", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_n", "type": "uint256" }], "name": "liquidateTroves", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "pcv", "outputs": [{ "internalType": "contract IPCV", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "priceFeed", "outputs": [{ "internalType": "contract IPriceFeed", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_THUSDamount", "type": "uint256" }, { "internalType": "address", "name": "_firstRedemptionHint", "type": "address" }, { "internalType": "address", "name": "_upperPartialRedemptionHint", "type": "address" }, { "internalType": "address", "name": "_lowerPartialRedemptionHint", "type": "address" }, { "internalType": "uint256", "name": "_partialRedemptionHintNICR", "type": "uint256" }, { "internalType": "uint256", "name": "_maxIterations", "type": "uint256" }, { "internalType": "uint256", "name": "_maxFeePercentage", "type": "uint256" }], "name": "redeemCollateral", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_borrower", "type": "address" }], "name": "removeStake", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "rewardSnapshots", "outputs": [{ "internalType": "uint256", "name": "collateral", "type": "uint256" }, { "internalType": "uint256", "name": "THUSDDebt", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_borrowerOperationsAddress", "type": "address" }, { "internalType": "address", "name": "_activePoolAddress", "type": "address" }, { "internalType": "address", "name": "_defaultPoolAddress", "type": "address" }, { "internalType": "address", "name": "_stabilityPoolAddress", "type": "address" }, { "internalType": "address", "name": "_gasPoolAddress", "type": "address" }, { "internalType": "address", "name": "_collSurplusPoolAddress", "type": "address" }, { "internalType": "address", "name": "_priceFeedAddress", "type": "address" }, { "internalType": "address", "name": "_thusdTokenAddress", "type": "address" }, { "internalType": "address", "name": "_sortedTrovesAddress", "type": "address" }, { "internalType": "address", "name": "_pcvAddress", "type": "address" }], "name": "setAddresses", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_borrower", "type": "address" }, { "internalType": "enum ITroveManager.Status", "name": "_status", "type": "uint8" }], "name": "setTroveStatus", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "sortedTroves", "outputs": [{ "internalType": "contract ISortedTroves", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "stabilityPool", "outputs": [{ "internalType": "contract IStabilityPool", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "thusdToken", "outputs": [{ "internalType": "contract ITHUSDToken", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalCollateralSnapshot", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalStakes", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalStakesSnapshot", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_borrower", "type": "address" }], "name": "updateStakeAndTotalStakes", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_borrower", "type": "address" }], "name": "updateTroveRewardSnapshots", "outputs": [], "stateMutability": "nonpayable", "type": "function" }];
// Initialize provider and contract
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

// Helper function to format numbers with commas
const formatNumber = (number) => {
    return number.toLocaleString("en-US", { maximumFractionDigits: 2 });
};
// Add this at the top of your file
const CHAINLINK_BTC_USD_FEED = "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c"; // Mainnet BTC/USD feed

const fetchAllTroves = async () => {
    try {
        // Initialize Chainlink Price Feed
        const btcPriceFeed = new ethers.Contract(
            CHAINLINK_BTC_USD_FEED,
            [
                "function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)"
            ],
            provider
        );

        // Get BTC price from Chainlink
        const [, answer] = await btcPriceFeed.latestRoundData();
        const btcPrice = answer.toString() / 1e8; // Chainlink uses 8 decimals for BTC/USD
        console.log(`Current BTC Price: $${btcPrice.toLocaleString()}`);

        const totalTroves = await contract.getTroveOwnersCount();
        console.log(`Total Troves: ${totalTroves}`);
        const allTroves = [];

        for (let i = 0; i < totalTroves; i++) {
            // Get trove owner address
            const troveOwner = await contract.getTroveFromTroveOwnersArray(i);

            // Get trove data
            const troveData = await contract.Troves(troveOwner);

            // Convert from wei to BTC units
            const collateral = ethers.utils.formatEther(troveData.coll);
            const debt = ethers.utils.formatEther(troveData.debt);

            // Calculate collateral ratio using BTC price
            const collateralValueUSD = parseFloat(collateral) * btcPrice;
            const debtValue = parseFloat(debt);
            const collateralRatio = debtValue > 0
                ? (collateralValueUSD / debtValue) * 100
                : 0;

            allTroves.push({
                owner: `${troveOwner.slice(0, 6)}...${troveOwner.slice(-4)}`,
                collateral: parseFloat(collateral).toFixed(4),
                debt: formatNumber(parseFloat(debt)),
                collateralRatio: collateralRatio.toFixed(1),
                rawCollateralRatio: collateralRatio // for sorting
            });
        }

        // Sort by collateral ratio in ascending order
        allTroves.sort((a, b) => a.rawCollateralRatio - b.rawCollateralRatio);

        return allTroves;
    } catch (error) {
        console.error("Error fetching troves:", error);
        return [];
    }
};



const calculateCollateralRecommendations = (currentRatio, currentCollateral) => {
    // Ensure inputs are numbers
    const ratio = Number(currentRatio);
    const collateral = Number(currentCollateral);

    // Convert percentage to decimal for calculations
    const baseRatio = ratio / 100;

    // Calculate target ratios for each risk level
    const riskyRatio = baseRatio + (baseRatio * 0.10);    // +10%
    const moderateRatio = baseRatio + (baseRatio * 0.20); // +20%
    const safeRatio = baseRatio + (baseRatio * 0.30);     // +30%

    // Calculate recommended collateral amounts
    const riskyCollateral = (collateral * riskyRatio) / baseRatio;
    const moderateCollateral = (collateral * moderateRatio) / baseRatio;
    const safeCollateral = (collateral * safeRatio) / baseRatio;

    return {
        current: {
            ratio: ratio,
            collateral: collateral
        },
        risky: {
            ratio: riskyRatio * 100,
            collateral: riskyCollateral,
            additionalBTC: riskyCollateral - collateral
        },
        moderate: {
            ratio: moderateRatio * 100,
            collateral: moderateCollateral,
            additionalBTC: moderateCollateral - collateral
        },
        safe: {
            ratio: safeRatio * 100,
            collateral: safeCollateral,
            additionalBTC: safeCollateral - collateral
        }
    };
};

const displayRiskAnalysis = (ratio, collateral) => {
    // Ensure inputs are valid numbers
    if (isNaN(Number(ratio)) || isNaN(Number(collateral))) {
        console.log("Error: Invalid ratio or collateral values");
        return;
    }

    const recommendations = calculateCollateralRecommendations(ratio, collateral);

    console.log("\nRisk Analysis:");
    console.log("---------------------------");
    console.log(`Current Position:`);
    console.log(`- Ratio: ${Number(recommendations.current.ratio).toFixed(2)}%`);
    console.log(`- Collateral: ${Number(recommendations.current.collateral).toFixed(2)} BTC`);

    console.log("\nRecommended Positions:");
    console.log("Risky Position:");
    console.log(`- Target Ratio: ${Number(recommendations.risky.ratio).toFixed(2)}%`);
    console.log(`- Required Collateral: ${Number(recommendations.risky.collateral).toFixed(2)} BTC`);
    // console.log(`- Additional BTC Needed: ${Number(recommendations.risky.additionalBTC).toFixed(2)} BTC`);

    console.log("\nModerate Position:");
    console.log(`- Target Ratio: ${Number(recommendations.moderate.ratio).toFixed(2)}%`);
    console.log(`- Required Collateral: ${Number(recommendations.moderate.collateral).toFixed(2)} BTC`);
    // console.log(`- Additional BTC Needed: ${Number(recommendations.moderate.additionalBTC).toFixed(2)} BTC`);

    console.log("\nSafe Position:");
    console.log(`- Target Ratio: ${Number(recommendations.safe.ratio).toFixed(2)}%`);
    console.log(`- Required Collateral: ${Number(recommendations.safe.collateral).toFixed(2)} BTC`);
    // console.log(`- Additional BTC Needed: ${Number(recommendations.safe.additionalBTC).toFixed(2)} BTC`);
};

const main = async () => {
    await connectToDatabase();
    const troves = await fetchAllTroves();
    if (troves.length > 0) {
        console.log("\nAll Troves:");
        console.log("Owner\t\tCollateral (BTC)\tDebt\t\tColl. Ratio");
        console.log("---------------------------------------------------------------");
        troves.forEach((trove) => {
            console.log(
                `${trove.owner}\t${trove.collateral}\t\t${trove.debt}\t\t${trove.collateralRatio}%`
            );
        });

        // Monitor the collateral ratio of index 1
        if (troves.length > 1) {
            const targetTrove = troves[0];  // Get index 1 (second trove)
            console.log(`\nMonitoring Trove at index 1:`);
            console.log(`Owner: ${targetTrove.owner}`);
            console.log(`Current Collateral Ratio: ${targetTrove.collateralRatio}%`);
            try {
                let newdata = await collateralServive.findOneAndUpdateUpsert({}, { currentCollateralRatio: targetTrove.collateralRatio })
                console.log("newdata --->", newdata)
            } catch (error) {
                console.log("error-->", error)
            }
            // Add risk analysis for the monitored trove
            displayRiskAnalysis(targetTrove.collateralRatio, targetTrove.collateral);
        } else {
            console.log("\nNo trove at index 1 to monitor.");
        }
    } else {
        console.log("No troves found.");
    }
};

// Function to run the monitoring at intervals
const startMonitoring = () => {
    // Run immediately first
    main().catch(error => {
        console.error('Error in main execution:', error);
    });

    // // Then set up the interval
    // const intervalId = setInterval(() => {
    //     main().catch(error => {
    //         console.error('Error in main execution:', error);
    //     });
    // }, 30000);  // 20000 milliseconds = 20 seconds

    // // Return the interval ID in case we want to stop monitoring later
    // return intervalId;
};

// Start the monitoring
// const monitoringId = startMonitoring();
module.exports = {
    startMonitoring
}