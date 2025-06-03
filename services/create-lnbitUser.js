
require('dotenv').config();

const {
  logIn,
  getUser,
  createTpos,
  addUserWallet,
  createUser,
  createBlotzAutoReverseSwap,
  userLogIn,
  splitPaymentTarget,
  lnurlpCreate,
  withdrawLinkCreate
} = require("./lnbit");

// const { updateWithdrawLinkByWallet } = require("./updateWithdrawLink");
const UsersModel = require('./users');

// Create TPoS Links
const createTposLink = async (wallet1, wallet2, apiKey1, apikey2, token, accountType) => {
  try {
    let result = {
      tpos1: {},
      tpos2: {},
      status: true
    };
    let setting = {
      currency: "sats",
      tax_inclusive: true,
      tax_default: 0,
      tip_options: "[]",
      tip_wallet: "",
      withdraw_time: 0,
      withdraw_between: 10,
      withdraw_time_option: "",
      withdraw_premium: 0,
      withdraw_pin_disabled: false,
      lnaddress: true,
      lnaddress_cut: 1
    };
    let createTpos1 = await createTpos({ wallet: wallet1, name: "usdc", ...setting }, apiKey1, token, accountType);
    if (createTpos1?.status) result.tpos1 = createTpos1.data;

    let createTpos2 = await createTpos({ wallet: wallet2, name: "bitcoin", ...setting }, apikey2, token, accountType);
    if (createTpos2?.status) result.tpos2 = createTpos2.data;

    return result;
  } catch (error) {
    console.log("Error in createTposLink:", error);
  }
};

// Create Boltz Reverse Auto-Swap Links
const createBoltzAutoReverseSwap = async (wallet1, wallet2, apiKey1, apikey2, coinosis_address, bitcoin_address, refund_address, token, accountType) => {
  try {
    let result = {
      status: true,
      boltzAutoReverseSwap1: {},
      boltzAutoReverseSwap2: {}
    };

    let boltzReverseSwap1 = await createBlotzAutoReverseSwap({
      wallet: wallet1,
      onchain_address: coinosis_address,
      asset: "L-BTC/BTC",
      direction: "send",
      balance: 100,
      instant_settlement: true,
      amount: "200"
    }, apiKey1, token, accountType);
    if (boltzReverseSwap1?.status) result.boltzAutoReverseSwap1 = boltzReverseSwap1.data;

    let boltzReverseSwap2 = await createBlotzAutoReverseSwap({
      wallet: wallet2,
      onchain_address: bitcoin_address,
      asset: "BTC/BTC",
      direction: "send",
      balance: 100,
      instant_settlement: true,
      amount: "25000"
    }, apikey2, token, accountType);
    if (boltzReverseSwap2?.status) result.boltzAutoReverseSwap2 = boltzReverseSwap2.data;

    return result;
  } catch (error) {
    console.log("Error in createBoltzAutoReverseSwap:", error);
  }
};

// Create LNURL-Pay Link
const createLnurlpLink = async (username, wallet, apiKey, token, accountType) => {
  try {
    let result = { status: true, createLnurlpLink1: {} };
    let setting = {
      description: "send",
      min: 10,
      max: 10000000,
      currency: "sat",
      username: username,
      wallet
    };
    let lnurlp = await lnurlpCreate(setting, apiKey, token, accountType);
    if (lnurlp?.status) result.createLnurlpLink1 = lnurlp.data;

    return result;
  } catch (error) {
    console.log("Error in createLnurlpLink:", error);
  }
};

// Create Withdraw Link
const createWithdrawLink = async (apiKey, token, accountType) => {
  try {
    let result = { status: true, createWithdrawLink1: {} };
    let setting = {
      title: "withdraw",
      min_withdrawable: 10,
      max_withdrawable: 100000000,
      uses: 1,
      wait_time: 1,
      is_unique: true,
      webhook_url: "",
      webhook_headers: "",
      webhook_body: "",
      custom_url: ""
    };
    let withdraw = await withdrawLinkCreate(setting, apiKey, token, accountType);
    if (withdraw?.status) result.createWithdrawLink1 = withdraw.data;

    return result;
  } catch (error) {
    console.log("Error in createWithdrawLink:", error);
  }
};

// Create Split Payment
const createSplitPayment = async (wallet1, wallet2, apiKey1, apikey2, token, accountType) => {
  try {
    let result = {
      status: true,
      splitPaymentTarget1: {},
      splitPaymentTarget2: {}
    };

    let split1 = await splitPaymentTarget({
      targets: [{
        wallet: process.env.SPLIT_PAYMENT_ADDRESS,
        alias: "commision",
        percent: process.env.SPLIT_PAYMENT_PERCENTAGE,
        source: { id: wallet1, adminkey: apiKey1 }
      }]
    }, apiKey1, token, accountType);
    if (split1?.status) result.splitPaymentTarget1 = split1.data;

    let split2 = await splitPaymentTarget({
      targets: [{
        wallet: process.env.SPLIT_PAYMENT_ADDRESS,
        alias: "commision",
        percent: process.env.SPLIT_PAYMENT_PERCENTAGE,
        source: { id: wallet2, adminkey: apikey2 }
      }]
    }, apikey2, token, accountType);
    if (split2?.status) result.splitPaymentTarget2 = split2.data;

    return result;
  } catch (error) {
    console.log("Error in createSplitPayment:", error);
  }
};

// Add LNBits TPoS User
const addLnbitTposUser = async (madhouseWallet, email, coinosis_address, bitcoin_address, refund_address, accountType = 1, attempt = 1) => {
  try {
    const newEmail = email;
    const getToken = await logIn(accountType);
    if (!getToken?.status) return;

    const token = getToken.data.token;
    const addUser = await createUser({
      email: newEmail,
      username: madhouseWallet,
      extensions: ["tpos", "boltz", "lndhub", "lnurlp", "splitpayments"]
    }, token, accountType);

    if (!addUser?.status) return;

    const getUserToken = (await userLogIn(accountType, addUser.data.id)).data.token;
    const addNewWallet = await addUserWallet(addUser.data.id, { name: "bitcoin", currency: "USD" }, token, accountType);
    if (!addNewWallet?.status) return;

    const getUserData = await getUser(addUser.data.id, token, accountType);
    if (!getUserData?.status) return;

    const wallets = getUserData.data.wallets;
    const tpos = await createTposLink(wallets[0].id, wallets[1].id, wallets[0].adminkey, wallets[1].adminkey, getUserToken, accountType);
    if (!tpos?.status) return;

    const updateFields = {
      lnbitEmail: newEmail,
      lnbitLinkId: tpos.tpos1.id,
      lnbitWalletId: wallets[0].id,
      lnbitId: addUser.data.id,
      lnbitAdminKey: wallets[0].adminkey,
      lnbitEmail_2: newEmail,
      lnbitLinkId_2: tpos.tpos2.id,
      lnbitWalletId_2: wallets[1].id,
      lnbitId_2: addUser.data.id,
      lnbitAdminKey_2: wallets[1].adminkey
    };

    await UsersModel.findOneAndUpdate({ email }, { $set: updateFields });

    if (accountType === 1) {
      const boltz = await createBoltzAutoReverseSwap(wallets[0].id, wallets[1].id, wallets[0].adminkey, wallets[1].adminkey, coinosis_address, bitcoin_address, refund_address, getUserToken, accountType);
      if (boltz?.status) {
        await UsersModel.findOneAndUpdate({ email }, {
          $set: {
            boltzAutoReverseSwap: boltz.boltzAutoReverseSwap1 || {},
            boltzAutoReverseSwap_2: boltz.boltzAutoReverseSwap2 || {}
          }
        });
      }
    }

    const split = await createSplitPayment(wallets[0].id, wallets[1].id, wallets[0].adminkey, wallets[1].adminkey, getUserToken, accountType);
    return;
  } catch (error) {
    console.log("Error in addLnbitTposUser:", error);
    return;
  }
};

// Add LNBits Spend User
const addLnbitSpendUser = async (madhouseWallet, email, accountType = 1, attempt = 1) => {
  try {
    const newEmail = email;
    let refund_address = "";
    const getToken = await logIn(accountType);
    if (!getToken?.status) return false;

    const token = getToken.data.token;
    const addUser = await createUser({
      email: newEmail,
      username: madhouseWallet,
      extensions: ["tpos", "boltz", "lndhub", "lnurlp", "splitpayments", "withdraw"]
    }, token, accountType);

    if (!addUser?.status) return false;

    const getUserToken = (await userLogIn(accountType, addUser.data.id)).data.token;
    const getUserData = await getUser(addUser.data.id, token, accountType);
    if (!getUserData?.status) return false;

    const walletId = getUserData.data.wallets[0].id;
    refund_address = walletId;
    const userId = getUserData.data.id;
    const adminKey = getUserData.data.wallets[0].adminkey;

    await UsersModel.findOneAndUpdate({ email }, {
      $set: {
        lnbitEmail_3: newEmail,
        lnbitWalletId_3: walletId,
        lnbitId_3: userId,
        lnbitAdminKey_3: adminKey
      }
    });
    let lnaddress = await (newEmail.split('@')[0]);
    const lnurlp = await createLnurlpLink(lnaddress, walletId, adminKey, getUserToken, accountType);
    if (lnurlp?.status) {
      await UsersModel.findOneAndUpdate({ email }, {
        $set: {
          spendLnurlpLink: lnurlp.createLnurlpLink1 || {},
          lnaddress: lnaddress + "@spend.madhousewallet.com"
        }
      });
    }

    const withdraw = await createWithdrawLink(adminKey, getUserToken, accountType);
    if (withdraw?.status) {
      await UsersModel.findOneAndUpdate({ email }, {
        $set: {
          spendWithdrawLink: withdraw.createWithdrawLink1 || {}
        }
      });
    }

    // updateWithdrawLinkByWallet(walletId, { uses: 100000000 });
    return refund_address;
  } catch (error) {
    console.log("Error in addLnbitSpendUser:", error);
    return false;
  }
};


module.exports = {
  addLnbitSpendUser,
  addLnbitTposUser
};