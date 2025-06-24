
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
  withdrawLinkCreate,
  getWithdrawLinkCreate,
  getPayLnurlpLink,
  updateLnurlp,
  getTposList,
  updtTposList,
  getAutoSwapsList,
  delAutoSwap,
} = require("./lnbit");

// const { updateWithdrawLinkByWallet } = require("./updateWithdrawLink");
const UsersModel = require('./users');


const isSettingMatching = async (responseItem, setting) => {

  console.log("responseItem", responseItem)
  console.log("setting", setting)
  for (const key in setting) {
    const settingVal = setting[key];
    const responseVal = responseItem[key];

    // Handle null vs 0 for withdraw_premium (or any falsy nullable values)
    if (
      (settingVal === null && responseVal !== null) ||
      (responseVal === null && settingVal !== null)
    ) {
      console.log(`Mismatch on key "${key}": setting=${settingVal}, response=${responseVal}`);
      return false;
    }

    if (settingVal !== responseVal) {
      console.log(`Mismatch on key "${key}": setting=${settingVal}, response=${responseVal}`);
      return false;
    }
  }
  return true;
};

const createLnbitUser = async (username, email, accountType) => {
  try {
    const res = await logIn(accountType);
    if (!res?.status) return false;

    const token = res.data.token;
    const user = await createUser({
      email,
      username,
      extensions: ["tpos", "boltz", "lndhub", "lnurlp", "splitpayments", "withdraw"]
    }, token, accountType);

    if (!user?.status) return false;

    const userData = await getUser(user.data.id, token, accountType);
    if (!userData?.status) return false;

    const wallet = userData.data.wallets[0];
    return {
      walletId: wallet.id,
      userId: userData.data.id,
      adminKey: wallet.adminkey,
      token
    };
  } catch (error) {
    console.log("createLnbitUser error:", error);
    return false;
  }
};

const addLnurlpAddress = async (adminKey, token, accountType, email) => {
  try {
    const res = await getPayLnurlpLink(adminKey, token, accountType);
    if (res?.status && res.data?.length > 0) {
      await UsersModel.findOneAndUpdate({ email }, {
        $set: { spendLnurlpLink: res.data[0] || {} }
      });
    }
  } catch (error) {
    console.log("addLnurlpAddress error:", error);
  }
};

const checkAddLnurlpAddress = async (wallet, adminKey, token, accountType, email, lnaddress, existingLink = "") => {
  try {
    const res = await getPayLnurlpLink(adminKey, token, accountType);

    console.log("res getPayLnurlpLink line 71-->", res)
    const link = res?.data?.[0];


    // match lnaddress and link and return data
    if (link?.username && link?.username == lnaddress) {
      if (!existingLink) {
        await UsersModel.findOneAndUpdate({ email }, { $set: { spendLnurlpLink: link } });
        console.log("spendLnurlpLink updated!")
        return true;
      } else {
        console.log("already up to date!")
        return true;
      }
    }

    const newUsername = lnaddress || email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');

    // update lnaddress with link and return
    if (link) {
      const updated = await updateLnurlp({ ...link, username: newUsername }, adminKey, token, 2, link.id);
      if (updated?.status) {
        console.log("updated lnaddress with link!")

        await UsersModel.findOneAndUpdate({ email }, {
          $set: {
            spendLnurlpLink: updated.data,
            lnaddress: `${newUsername}@spend.madhousewallet.com`
          }
        });
      }
      return true;
    }


    // create link if not created before and return data
    const lnurlp = await lnurlpCreate({
      description: "send",
      min: 10,
      max: 10000000,
      currency: null,
      username: newUsername,
      wallet
    }, adminKey, token, accountType);

    console.log("lnurlp created:", lnurlp);
    addLnurlpAddress(adminKey, token, accountType, email);
    return true;
  } catch (error) {
    console.log("checkAddLnurlpAddress error:", error);
    return false;
  }
};

const checkSpendWallet = async (userData = {}, username) => {
  try {
    console.log("line userData 151", userData)
    let localUser = userData?.toObject ? userData.toObject() : userData;
    console.log("localUser line 152", localUser)
    // Create spend LNBits user if not exists
    if (!localUser?.lnbitId_3) {
      const newUser = await createLnbitUser(username, localUser.email, 2);
      if (!newUser) return false;

      // Update DB and local object
      await UsersModel.findOneAndUpdate(
        { email: localUser.email },
        {
          $set: {
            lnbitEmail_3: localUser.email,
            lnbitWalletId_3: newUser.walletId,
            lnbitId_3: newUser.userId,
            lnbitAdminKey_3: newUser.adminKey
          }
        }
      );

      // Update localUser with new data
      localUser = {
        ...localUser,
        lnbitWalletId_3: newUser.walletId,
        lnbitId_3: newUser.userId,
        lnbitAdminKey_3: newUser.adminKey
      };
    }

    // Get user token and check LNURLp address
    const token = (await userLogIn(2, localUser.lnbitId_3)).data.token;

    console.log("token line 152", token)
    // check lnurl address 
    await checkAddLnurlpAddress(
      localUser.lnbitWalletId_3,
      localUser.lnbitAdminKey_3,
      token,
      2,
      localUser.email,
      localUser?.lnaddress || "",
      localUser?.spendLnurlpLink || ""
    );

    return localUser.lnbitWalletId_3;
  } catch (error) {
    console.log("checkSpendWallet error:", error);
    return false;
  }
};


const checkTposSetting = async (userData, email, tposId, token, adminKey, wallet, type) => {
  try {
    console.log("checkTposSetting caliing", type)
    console.log("checkTposSetting", userData, email, tposId, token, adminKey, wallet, type)
    const compareObj = {
      currency: "sats",
      tax_inclusive: true,
      withdraw_time: 0,
      withdraw_between: 10,
      lnaddress: true,
      lnaddress_cut: 1
    };

    const defaultSetting = {
      ...compareObj,
      tax_default: 0,
      tip_options: "[]",
      tip_wallet: "",
      withdraw_time_option: "",
      withdraw_premium: 0,
      withdraw_pin_disabled: false
    };

    // Helper to update user DB
    const updateUserTposData = async (tposData) => {
      const update = type === 1
        ? { lnbitLinkId: tposData.id, lnbitTposData: tposData }
        : { lnbitLinkId_2: tposData.id, lnbitTposData_2: tposData };
      await UsersModel.findOneAndUpdate({ email }, { $set: update });
    };

    // 🔧 Helper to create new TPOS and update DB
    const createAndSaveTpos = async () => {
      const createRes = await createTpos({ wallet, name: "usdc", ...defaultSetting }, adminKey, token, accountType);
      if (createRes?.status) {
        await updateUserTposData(createRes.data);
        console.log("✅ Created new TPOS and saved to DB:", createRes.data.id);
        return createRes.data.id;
      } else {
        console.error("❌ Failed to create TPOS");
        return false;
      }
    };

    // 🚫 No TPOS ID provided, create a new one
    if (!tposId) return await createAndSaveTpos();

    // 📦 Fetch all TPOS links
    const res = await getTposList(adminKey, token, 1);
    console.log("res getTposList line 250", res)
    if (!res?.status || !Array.isArray(res.data)) return false;

    const tposList = res.data;

    // 🔍 Match TPOS ID and wallet
    const matched = tposList.find(item => item.id === tposId && item.wallet === wallet);
    console.log("matched-->", matched)
    if (!matched) {
      console.log("⚠️ No matching TPOS found. Creating new one.");
      return await createAndSaveTpos();
    }

    console.log("✅ Matching TPOS found:", matched.id);

    // 🧾 Check if TPOS settings match
    const isMatch = await isSettingMatching(matched, compareObj);
    console.log("isMatch-->", isMatch)
    if (!isMatch) {
      // 🔄 Update settings
      const updateRes = await updtTposList(matched.id, { ...matched, ...compareObj }, adminKey, token, 1);
      console.log("updateRes line 269 -->", updateRes)
      if (updateRes?.status && updateRes.data) {
        await updateUserTposData(updateRes.data);
        console.log("🔄 TPOS settings updated and saved.");
        return true;
      }
      console.error("❌ Failed to update TPOS settings.");
      return false;
    }

    // ✅ Settings already match, ensure userData is synced
    if (type == 1 && !userData?.lnbitTposData) {
      await UsersModel.findOneAndUpdate({ email }, { $set: { lnbitTposData: matched } });
    } else if (type == 2 && !userData?.lnbitTposData_2) {
      await UsersModel.findOneAndUpdate({ email }, { $set: { lnbitTposData_2: matched } });
    }

    console.log("✅ Existing TPOS settings are valid. No changes made.");
    return true;

  } catch (error) {
    console.error("💥 checkTposSetting error -->", error);
    return false;
  }
};

const checkAutoSwap = async (token, adminKey) => {
  try {
    // Fetch all auto swaps using provided admin key and token
    const response = await getAutoSwapsList(adminKey, token, 1);

    // Return true if no auto swaps found or response is invalid
    const swaps = response?.data;
    if (!response?.status || !Array.isArray(swaps) || swaps.length === 0) {
      return true;
    }

    // Delete all auto swaps in parallel for efficiency
    // Delete all swaps in parallel
    await Promise.all(
      swaps.map(async (swap) => {
        try {
          const result = await delAutoSwap(swap.id, adminKey, token, 1);
          if (result?.status) {
            console.log(`✅ Successfully deleted auto swap ID: ${swap.id}`);
          } else {
            console.log(`⚠️ Failed to delete auto swap ID: ${swap.id}`, result);
          }
        } catch (err) {
          console.log(`❌ Error deleting auto swap ID ${swap.id}:`, err.message);
        }
      })
    );

    return true;
  } catch (error) {
    console.error("checkAutoSwap error -->", error);
    return false;
  }
};


const checkLnbitWallet = async (userData = {}, username, refund_address) => {
  try {
    console.log("start lnbit check", userData)
    let localUser = userData?.toObject ? userData.toObject() : userData;
    let adminToken = "";
    let getUserToken = "";
    console.log("localUser line 303-->", localUser)
    // Helper function to update user in DB and local object
    const updateUserData = async (updates) => {
      await UsersModel.findOneAndUpdate({ email: localUser.email }, { $set: updates });
      localUser = { ...localUser, ...updates };
    };

    // Step 1: Create LNBits user if not exists
    if (!localUser?.lnbitId) {
      const newUser = await createLnbitUser(username, localUser.email, 1);
      if (!newUser) return false;

      await updateUserData({
        lnbitEmail: localUser.email,
        lnbitWalletId: newUser.walletId,
        lnbitId: newUser.userId,
        lnbitAdminKey: newUser.adminKey
      });

      adminToken = newUser.token;
      const userLoginResp = await userLogIn(1, newUser.userId);
      getUserToken = userLoginResp?.data?.token;

    } else {
      // Step 2: Login as admin and user
      const adminLogin = await logIn(1);
      if (!adminLogin?.status) return false;

      const userLoginResp = await userLogIn(1, localUser.lnbitId);
      getUserToken = userLoginResp?.data?.token;
      adminToken = adminLogin.data.token;
    }

    // Step 3: Check for second wallet, if not exists create and update
    if (!localUser?.lnbitId_2) {
      const newWallet = await addUserWallet(localUser.lnbitId, { name: "bitcoin", currency: "USD" }, adminToken, 1);
      if (!newWallet?.status) return;

      const userDataResp = await getUser(localUser.lnbitId, adminToken, 1);
      if (!userDataResp?.status) return;

      const secondWallet = userDataResp.data.wallets[1];
      if (!secondWallet) return;

      await updateUserData({
        lnbitEmail_2: localUser.email,
        lnbitWalletId_2: secondWallet.id,
        lnbitId_2: localUser.lnbitId,
        lnbitAdminKey_2: secondWallet.adminkey
      });
    }

    // Step 4: Check TPoS settings for both wallets
    if (localUser?.lnbitAdminKey && localUser?.lnbitWalletId) {
      await checkTposSetting(
        localUser,
        localUser.email,
        localUser?.lnbitLinkId || "",
        getUserToken,
        localUser?.lnbitAdminKey,
        localUser?.lnbitWalletId,
        1
      );
      await checkAutoSwap(getUserToken, localUser?.lnbitAdminKey)
    }
    console.log("calling  ", localUser?.lnbitAdminKey_2, localUser?.lnbitWalletId_2)
    if (localUser?.lnbitAdminKey_2 && localUser?.lnbitWalletId_2) {
      console.log("calling  checkTposSetting 2nd ")
      await checkTposSetting(
        localUser,
        localUser.email,
        localUser?.lnbitLinkId_2 || "",
        getUserToken,
        localUser?.lnbitAdminKey_2,
        localUser?.lnbitWalletId_2,
        2
      );

      await checkAutoSwap(getUserToken, localUser?.lnbitAdminKey_2)

    }

    return true;
  } catch (error) {
    console.error("checkLnbitWallet error:", error);
    return false;
  }
};



const shortenAddress = address => address?.length >= 10
  ? `${address.slice(0, 6)}${address.slice(-4)}`
  : address;

const checkLnbitCreds = async (wallet, email) => {
  try {
    const user = await UsersModel.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
    if (!user) return;

    const shortName = shortenAddress(wallet);
    const refund_address = await checkSpendWallet(user, shortName);
    console.log("refund_address-->", refund_address)
    const checkLnbitUSer = await checkLnbitWallet(user, shortName)
    console.log("checkLnbitUSer-->", checkLnbitUSer)
    return refund_address;
  } catch (error) {
    console.log("checkLnbitCreds error:", error);
    return false;
  }
};



module.exports = {
  checkLnbitCreds
};