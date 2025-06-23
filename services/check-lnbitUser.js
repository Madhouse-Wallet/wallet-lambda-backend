
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
  updateLnurlp
} = require("./lnbit");

// const { updateWithdrawLinkByWallet } = require("./updateWithdrawLink");
const UsersModel = require('./users');


// Add LNBits User
const createLnbitUser = async (username, newEmail, accountType) => {
  try {
    const getToken = await logIn(accountType);
    if (!getToken?.status) return false;
    const token = getToken.data.token;
    const addUser = await createUser({
      email: newEmail,
      username: username,
      extensions: ["tpos", "boltz", "lndhub", "lnurlp", "splitpayments", "withdraw"]
    }, token, accountType);
    if (!addUser?.status) return false;
    // const getUserToken = (await userLogIn(accountType, addUser.data.id)).data.token;
    const getUserData = await getUser(addUser.data.id, token, accountType);
    if (!getUserData?.status) return false;
    return {
      walletId: getUserData.data.wallets[0].id,
      userId: getUserData.data.id,
      adminKey: getUserData.data.wallets[0].adminkey,
      token
    };

  } catch (error) {
    console.log("line 47 error-->",error)
    return false;
  }
}


const checkAddLnurlpAddress = async (wallet, adminKey, getUserToken, accountType, email, lnaddress, spendLnurlpLink = "") => {
  try {
    const getLnurlpLinks = await getPayLnurlpLink(adminKey, getUserToken, accountType);
    console.log("line 55 userData", getLnurlpLinks)
    if (getLnurlpLinks?.status) {
      console.log(getLnurlpLinks.data, getLnurlpLinks.data?.length > 0)
      if (getLnurlpLinks.data?.length > 0) {
        if (getLnurlpLinks.data[0].username && (getLnurlpLinks.data[0].username == lnaddress)) {
          if (!spendLnurlpLink) {
            await UsersModel.findOneAndUpdate({ email }, {
              $set: {
                spendLnurlpLink: getLnurlpLinks.data[0],
              }
            });
            return true
          }
        } else {
          let newUsername = (lnaddress || await (email.split('@')[0]).replace(/[^a-zA-Z0-9]/g, ''));
          let oldData = getLnurlpLinks.data[0]
          const udptUrl = (await updateLnurlp(
            {
              ...oldData,
              username: newUsername
            },
            adminKey,
            getUserToken,
            2,
            oldData.id
          ));
          console.log("line 81 udptUrl-->", udptUrl)
          if (udptUrl?.status) {
           let updtUsers = await UsersModel.findOneAndUpdate({ email }, {
              $set: {
                spendLnurlpLink: udptUrl.data,
                lnaddress: (newUsername + "@spend.madhousewallet.com")
              }
            });
            console.log("line 88 -->",updtUsers)
          }
          return true;
        }
      } else {
        let newUsername = (await (email.split('@')[0]).replace(/[^a-zA-Z0-9]/g, ''));

        let setting = {
          description: "send",
          min: 10,
          max: 10000000,
          currency: null,
          username: newUsername,
          wallet
        };
       
        let lnurlp = await lnurlpCreate(setting, apiKey, token, accountType);
        console.log("lnurlp line 104-->", lnurlp)
        addLnurlpAddress(adminKey, getUserToken, accountType, email, lnaddress);
        return true;
      }
    }
  } catch (error) {
    console.log("addLnurlpAddress error", error)
    return false;
  }
}

const addLnurlpAddress = async (adminKey, getUserToken, accountType, email, lnaddress) => {
  try {
    const getLnurlpLinks = await getPayLnurlpLink(adminKey, getUserToken, accountType);
    if (getLnurlpLinks?.status) {
      console.log(getLnurlpLinks.data, getLnurlpLinks.data?.length > 0)
      if (getLnurlpLinks.data?.length > 0) {
        await UsersModel.findOneAndUpdate({ email }, {
          $set: {
            spendLnurlpLink: getLnurlpLinks.data[0] || {}
          }
        });
      }
    }
    // const getWithdrawLinks = await getWithdrawLinkCreate(adminKey, getUserToken, accountType);
    // if (getWithdrawLinks?.status) {
    //   console.log(getWithdrawLinks.data.data, getWithdrawLinks.data.data?.length > 0)
    //   if (getWithdrawLinks.data.data?.length > 0) {
    //     await UsersModel.findOneAndUpdate({ email }, {
    //       $set: {
    //         spendWithdrawLink: getWithdrawLinks.data.data[0] || {},
    //         lnaddress: lnaddress + "@spend.madhousewallet.com"
    //       }
    //     });
    //   }
    // }

  } catch (error) {
    console.log("addLnurlpAddress error", error)
  }
}


const checkSpendWallet = async (data = {}, username) => {
  try {
    let userData = data || "";
    console.log("userData 153-->",userData)
    if (!userData?.lnbitId_3) {
      let createUser = await createLnbitUser(username, userData?.email, 2)
      if (!createUser) {
        return false;
      }
      userData = await UsersModel.findOneAndUpdate({ email: userData?.email }, {
        $set: {
          lnbitEmail_3: userData?.email,
          lnbitWalletId_3: createUser?.walletId,
          lnbitId_3: createUser?.userId,
          lnbitAdminKey_3: createUser?.adminKey
        }
      });
      console.log("line 162 userData", userData)
    }
    const getUserToken = (await userLogIn(2, userData?.lnbitId_3)).data.token;
    const checkLnaddress = await checkAddLnurlpAddress(userData?.lnbitAdminKey_3, getUserToken, 2, userData?.email, (userData?.lnaddress || ""), (userData?.spendLnurlpLink || ""));
    return (createUser?.walletId);
  } catch (error) {
    console.log("error-->", error)
    return false;
  }
}

function shortenAddress(address) {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}${address.slice(-4)}`;
}

const checkLnbitCreds = async (madhouseWallet, email) => {
  try {
    const getExistingUser = await UsersModel.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } })
       console.log("getExistingUser line 185-->",getExistingUser)

    if (!getExistingUser) {
      return;
    }
    console.log("getExistingUser line 188-->",getExistingUser)
    const shortened = await shortenAddress(madhouseWallet);

    let checkSpendCreds = await checkSpendWallet(getExistingUser, shortened)
     console.log("checkSpendCreds-->",checkSpendCreds)
    return true;
  } catch (error) {
    console.log("Error in addLnbitSpendUser:", error);
    return false;
  }
};


module.exports = {
  checkLnbitCreds
};