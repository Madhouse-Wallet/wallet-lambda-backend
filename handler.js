require('dotenv').config();
const connectToDatabase = require("./db");
const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;

// const connectToDatabaseTest = require("./dbTest");
const { sendResponse } = require("./utils/index")
// const { ethers } = require("ethers");
// const { startMonitoring } = require("./utils/coll")
// const AWS = require('aws-sdk');
// const { MongoClient } = require('mongodb');
const { addLnbitTposUser, addLnbitSpendUser } = require('./services/create-lnbitUser.js');
const { checkLnbitCreds } = require('./services/check-lnbitUser.js');
const { createBitcoinWallet } = require('./services/generateBitcoinWallet.js');

const UsersModel = require('./model/users.js');
const PaymentModel = require('./model/payments.js');
const backupWalletBtctModel = require('./model/backupWalletBtc.js');
const { logIn,
    createUser,
    getUser,
    createTpos,
    createBlotzAutoReverseSwap,
    createInvoice,
    createSwapReverse,
    createSwap,
    payInvoice,
    getStats,
    getPayments,
    addUserWallet,
    userLogIn,
    createTposInvoice,
    splitPaymentTarget,
    lnurlpCreate,
    withdrawLinkCreate,
    getWithdrawLinkCreate,
    getPayLnurlpLink,
    updateLnurlp,
    decodeInvoice, getWithdraw,
    getDeposit, getPaymentSuccess } = require("./services/lnbit.js");


// Combine all functions into a map
const functionMap = {
    logIn,
    createUser,
    getUser,
    createTpos,
    createBlotzAutoReverseSwap,
    createInvoice,
    createSwapReverse,
    createSwap,
    payInvoice,
    getStats,
    getPayments,
    addUserWallet,
    userLogIn,
    createTposInvoice,
    splitPaymentTarget,
    lnurlpCreate,
    withdrawLinkCreate,
    getWithdrawLinkCreate,
    getPayLnurlpLink,
    updateLnurlp,
    decodeInvoice,
    getWithdraw,
    getDeposit,
    getPaymentSuccess
};
function shortenAddress(address) {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, 6)}${address.slice(-4)}`;
}


module.exports.addlnbitUser = async (event) => {
    try {
        // console.log("event-->", event)
        let bodyData = {}
        if (event.body) {
            bodyData = JSON.parse(event.body);
        } else {
            bodyData = event;  // fallback if body is not defined
        }
        const { madhouseWallet, email, bitcoinWallet, provisionlnbitType, refund_address1 = ""
        } = bodyData;
        await connectToDatabase();
        const shortened = await shortenAddress(madhouseWallet);
        if (provisionlnbitType == 1) {
            let refund_address = await addLnbitSpendUser(shortened, email, 2, 1);
            if (refund_address) {
                await addLnbitTposUser(shortened, email, bitcoinWallet, refund_address, 1, 1);
            }
        } else if (provisionlnbitType == 2) {
            await addLnbitTposUser(shortened, email, bitcoinWallet, refund_address1, 1, 1);
        } else if (provisionlnbitType == 3) {
            await addLnbitTposUser(shortened, email, bitcoinWallet, refund_address1, 1, 1);
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


module.exports.checkLnbitCreds = async (event) => {
    try {
        console.log("event-->", event)
        let bodyData = {}
        if (event.body) {
            bodyData = JSON.parse(event.body);
        } else {
            bodyData = event;  // fallback if body is not defined
        }
        const { madhouseWallet, email } = bodyData;
        await connectToDatabase();
        let result = await checkLnbitCreds(madhouseWallet, email);
        console.log("check done", result)
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
        // console.log("event-->", event)
        let bodyData = {}
        if (event.body) {
            bodyData = JSON.parse(event.body);
        } else {
            bodyData = event;  // fallback if body is not defined
        }
        const { email = "", token = false, wallet = "", tposId = "", flowtoken = "" } = bodyData;
        await connectToDatabase();
        // Validate email
        if ((!email || typeof email !== 'string') && (!wallet || typeof wallet !== 'string') && (!tposId || typeof tposId !== 'string') && (!flowtoken || typeof flowtoken !== 'string')) {
            return sendResponse(400, {
                message: "Invalid Params!", status: "failure", error: "Invalid Params!",
            })
        }
        let cond = {};
        if (email) {
            cond = { email: { $regex: new RegExp(`^${email}$`, 'i') } };
        } else if (flowtoken) {
            cond = { "flowTokens.token": flowtoken };
        } else if (wallet) {
            cond = { wallet: wallet };
        } else if (tposId) {
            cond = {
                $or: [
                    { lnbitLinkId: tposId },
                    { lnbitLinkId_2: tposId }
                ]
            };

        }
        let existingUser;
        if (token) {
            existingUser = await UsersModel.findOne(
                cond,
                { projection: { flowTokens: 0, boltzAutoReverseSwap: 0, boltzAutoReverseSwap_2: 0 } }
            );
        } else {
            existingUser = await UsersModel.findOne(
                cond,
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
        // console.log("event-->", event)
        let bodyData = {}
        if (event.body) {
            bodyData = JSON.parse(event.body);
        } else {
            bodyData = event;  // fallback if body is not defined
        }
        const { email, username, passkey, totalPasskey = 1, wallet, bitcoinWallet = "",
            flowTokens } = bodyData;
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
            const result = await UsersModel.create({
                email, username, passkey_number: 1, passkey_status: false, passkey, totalPasskey, wallet, bitcoinWallet,
                flowTokens, createdAt: new Date()
            });
            return sendResponse(200, {
                message: "User Created successfully!", status: "success", data: result,
            });
        }
        // Return the initial response including the invoice
    } catch (error) {
        console.log("error--->", error)
        // Check if it's an Axios error with response data
        if (error.code === 11000 && error.keyPattern?.email) {
            return res.status(400).json({ status: "failure", message: 'User Already Exist!', userData: {} });
        }
        if (error.response && error.response.data) {
            return sendResponse(500, { message: "Internal server error", status: "failure", error: error.response.data.error || "Error Finding User!" })
        }
        return sendResponse(500, {
            message: "Internal server error", status: "failure", error: error.message || "Error Finding User!",
        })
    }
}

module.exports.addPayment = async (event) => {
    try {
        // console.log("event-->", event)
        let bodyData = {}
        if (event.body) {
            bodyData = JSON.parse(event.body);
        } else {
            bodyData = event;  // fallback if body is not defined
        }
        await connectToDatabase();
        console.log("bodyData-->", bodyData)
        const result = await PaymentModel.create(bodyData);
        return sendResponse(200, {
            message: "Added successfully!", status: "success", data: result,
        });
    } catch (error) {
        console.log("error--->", error)
        // Check if it's an Axios error with response data
        if (error.code === 11000 && error.keyPattern?.email) {
            return res.status(400).json({ status: "failure", message: 'User Already Exist!', userData: {} });
        }
        if (error.response && error.response.data) {
            return sendResponse(500, { message: "Internal server error", status: "failure", error: error.response.data.error || "Error Finding User!" })
        }
        return sendResponse(500, {
            message: "Internal server error", status: "failure", error: error.message || "Error Finding User!",
        })
    }
}

// backupWalletBtctModel
module.exports.addWalletBackup = async (event) => {
    try {
        // console.log("event-->", event)
        let bodyData = {}
        if (event.body) {
            bodyData = JSON.parse(event.body);
        } else {
            bodyData = event;  // fallback if body is not defined
        }
        await connectToDatabase();
        console.log("bodyData-->", bodyData)
        const result = await backupWalletBtctModel.create(bodyData);
        return sendResponse(200, {
            message: "Added successfully!", status: "success", data: result,
        });
    } catch (error) {
        console.log("error--->", error)
        // Check if it's an Axios error with response data
        if (error.code === 11000 && error.keyPattern?.email) {
            return res.status(400).json({ status: "failure", message: 'User Already Exist!', userData: {} });
        }
        if (error.response && error.response.data) {
            return sendResponse(500, { message: "Internal server error", status: "failure", error: error.response.data.error || "Error Finding User!" })
        }
        return sendResponse(500, {
            message: "Internal server error", status: "failure", error: error.message || "Error Finding User!",
        })
    }
}

module.exports.getUserPayments = async (event) => {
    try {
        // console.log("event-->", event)
        let bodyData = {}
        if (event.body) {
            bodyData = JSON.parse(event.body);
        } else {
            bodyData = event;  // fallback if body is not defined
        }
        const { userId, page = 1, limit = 20 } = bodyData;
        const skip = (page - 1) * limit;
        if (!userId) {
            return sendResponse(400, {
                message: "Invalid Params!", status: "failure", error: "Invalid Params!",
            })
        }

        await connectToDatabase();

        let cond = {
            userId: new ObjectId(userId)
        };
        // Fetch paginated results
        const [data, total] = await Promise.all([
            PaymentModel.find(cond)
                .sort({ createdAt: -1 }) // newest first
                .skip(skip)
                .limit(limit),
            PaymentModel.countDocuments(cond)
        ]);
        ;

        return sendResponse(200, {
            message: "Payment fetched successfully!", status: "success", data: {
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                data
            },
        });
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
        // console.log("event-->", event)
        let bodyData = {}
        if (event.body) {
            bodyData = JSON.parse(event.body);
        } else {
            bodyData = event;  // fallback if body is not defined
        }
        const { findData = {}, updtData = {} } = bodyData;

        if (findData._id) {
            findData._id = new ObjectId(findData._id);
        }
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

module.exports.updtReceiveObj = async (event) => {
    try {
        // console.log("event-->", event)
        let bodyData = {}
        if (event.body) {
            bodyData = JSON.parse(event.body);
        } else {
            bodyData = event;  // fallback if body is not defined
        }
        const { email, partyId = "" } = bodyData;
        console.log("bodyData", bodyData)

        await connectToDatabase();
        let existingUser1 = await UsersModel.findOne(
            { email: { $regex: new RegExp(`^${email}$`, 'i') } }
        ); if (existingUser1) {

            console.log("existingUser1.receivingPartyDetail", existingUser1.receivingPartyDetail)
            // Step 2: Filter out matching element from receivingPartyDetail
            const filteredPartyDetail = Array.isArray(existingUser1.receivingPartyDetail)
                ? existingUser1.receivingPartyDetail.filter(
                    (entry) => entry?.data?.id != partyId
                )
                : [];
            console.log("filteredPartyDetail-->", filteredPartyDetail)
            const existingUser = await UsersModel.findOneAndUpdate({
                email
            }, {
                $set: {
                    receivingPartyDetail: filteredPartyDetail,
                }
            }, { returnDocument: "after" });
            if (existingUser) {
                return sendResponse(200, {
                    message: "User updated successfully!", status: "success", data: existingUser,
                });
            } else {
                return sendResponse(400, {
                    message: "No User Found!", status: "failure", error: "No User Found!",
                })
            }
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

module.exports.updateKeysName = async (event) => {
    try {
        // console.log("event-->", event)
        let bodyData = {}
        if (event.body) {
            bodyData = JSON.parse(event.body);
        } else {
            bodyData = event;  // fallback if body is not defined
        }

        await connectToDatabase();
        let existingUser1 = await UsersModel.find();
        console.log("existingUser1-->", existingUser1)
        for (let i = 0; i < existingUser1.length; i++) {
            if (existingUser1[i]?.passkey && existingUser1[i]?.passkey.length > 0) {
                const updatedPasskey = existingUser1[i]?.passkey.map(entry => {
                    if (entry?.storageKeyEncrypt && entry?.credentialIdEncrypt) {
                        const { storageKeyEncrypt, credentialIdEncrypt, ...rest } = entry;
                        return { encryptedData: storageKeyEncrypt, credentialID: credentialIdEncrypt, ...rest }; // rename `secretID` to `id`
                    } else {
                        return entry;
                    }

                });
                const existingUser = await UsersModel.findOneAndUpdate({
                    email: existingUser1[i].email
                }, {
                    $set: {
                        passkey: updatedPasskey,
                    }
                }, { returnDocument: "after" });
            }
        }
        return sendResponse(200, {
            message: "User updated successfully!", status: "success", data: {},
        });

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



module.exports.payTposInvoice = async (event) => {
    try {
        // console.log("event-->", event)
        let bodyData = {}
        if (event.body) {
            bodyData = JSON.parse(event.body);
        } else {
            bodyData = event;  // fallback if body is not defined
        }
        const { invoice, address } = bodyData;
        await connectToDatabase();
        const existingUser = await UsersModel.findOne({
            wallet: address,
        });
        // console.log("line-315", existingUser);
        let getToken = (await userLogIn(2, existingUser?.lnbitId_3));
        // console.log("line-317", getToken);
        if (getToken?.status) {
            let token = getToken?.data?.token;
            const payInv = (await payInvoice(
                {
                    out: true,
                    bolt11: invoice, // ← invoice from above
                },
                token,
                2,
                existingUser?.lnbitAdminKey_3
            ));
            if (payInv?.status) {
                return sendResponse(200, {
                    status: "success", message: "Done Payment!", data: {}
                });
            } else {
                return sendResponse(400, { message: payInv.msg, status: "failure", error: payInv.msg })
            }
        } else {
            return sendResponse(400, { message: getToken.msg, status: "failure", error: getToken.msg })
        }
    } catch (error) {
        console.log("error--->", error)
        return sendResponse(500, {
            message: "Internal server error", status: "failure", error: error.message || "Error Paying Invoice",
        })
    }
}


module.exports.createTposIdInvoice = async (event) => {
    try {
        // console.log("event-->", event)
        let bodyData = {}
        if (event.body) {
            bodyData = JSON.parse(event.body);
        } else {
            bodyData = event;  // fallback if body is not defined
        }
        const { tpoId,
            amount,
            memo,
            userLnaddress = "",
            details = {} } = bodyData;

        if (!tpoId) {
            return sendResponse(400, { message: "POS ID is required", status: "failure", error: "POS ID is required" })
        }
        const data = {
            amount: Number(amount),
            memo: memo || "",
            details: details,
            // tip_amount: Number(tipAmount),
        };
        if (userLnaddress) {
            data.user_lnaddress = userLnaddress;
        }
        const getInvoice = (await createTposInvoice(
            data,
            tpoId
        ));
        if (getInvoice?.status) {
            return sendResponse(200, {
                status: "success", message: "Invoice Generated!", data: getInvoice?.data
            });
        } else {
            return sendResponse(400, { message: getInvoice.msg, status: "failure", error: getInvoice.msg })
        }
    } catch (error) {
        console.log("error--->", error)
        return sendResponse(500, {
            message: "Internal server error", status: "failure", error: error.message || "Error Paying Invoice",
        })
    }
}


module.exports.getTposTrxn = async (event) => {
    try {
        // console.log("event-->", event)
        let bodyData = {}
        if (event.body) {
            bodyData = JSON.parse(event.body);
        } else {
            bodyData = event;  // fallback if body is not defined
        }
        const { walletId, fromDate, toDate, tag, apiKey } = bodyData;

        if (!walletId) {
            return sendResponse(400, { message: "walletId is required", status: "failure", error: "walletId is required" })
        }
        const loginResponse = (await logIn(1));
        const token = loginResponse?.data?.token;
        if (!token) {
            return sendResponse(401, { message: "Token fetch failed", status: "failure", error: "Token fetch failed" })
        }
        const result = await getPayments(
            token,
            1,
            fromDate,
            toDate,
            tag,
            apiKey
        );
        if (result.status) {
            return sendResponse(200, {
                status: "success", data: result.data, message: "Transaction retrieved successfully!"
            });
        } else {
            return sendResponse(400, { message: result.msg, status: "success", error: result.msg })
        }
    } catch (error) {
        console.log("error--->", error)
        return sendResponse(500, {
            message: "Internal server error", status: "failure", error: error.message || "Error Paying Invoice",
        })
    }
}


module.exports.updateLnAddress = async (event) => {
    try {
        // console.log("event-->", event)
        let bodyData = {}
        if (event.body) {
            bodyData = JSON.parse(event.body);
        } else {
            bodyData = event;  // fallback if body is not defined
        }
        const { email, newAddress } = bodyData;
        await connectToDatabase();
        // Validate email
        if ((!email || typeof email !== 'string')) {
            return sendResponse(400, {
                message: "Invalid Params!", status: "failure", error: "Invalid Params!",
            })
        }
        const existingUser = await UsersModel.findOne({
            email: { $regex: new RegExp(`^${email}$`, 'i') },
        });
        if (existingUser?.spendLnurlpLink) {
            let getToken = (await userLogIn(2, existingUser?.lnbitId_3));
            if (getToken?.status) {
                let token = getToken?.data?.token;
                const udptUrl = (await updateLnurlp(
                    {
                        ...existingUser?.spendLnurlpLink,
                        username: newAddress
                    },
                    existingUser?.lnbitAdminKey_3,
                    token,
                    2,
                    existingUser?.spendLnurlpLink?.id
                ));
                if (udptUrl?.status) {
                    const existingUser = await UsersModel.findOneAndUpdate({
                        email: { $regex: new RegExp(`^${email}$`, 'i') }
                    }, {
                        spendLnurlpLink: udptUrl.data,
                        lnaddress: (newAddress + "@spend.madhousewallet.com")
                    }, { returnDocument: "after" });
                    if (existingUser) {
                        return sendResponse(200, {
                            message: "Address updated successfully!", status: "success", data: existingUser,
                        });
                    } else {
                        return sendResponse(400, {
                            message: "No User Found!", status: "failure", error: "No User Found!",
                        })
                    }
                } else {
                    return sendResponse(400, { message: udptUrl.msg, status: "failure", error: udptUrl.msg })
                }
            } else {
                return sendResponse(400, { message: getToken.msg, status: "failure", error: getToken.msg })
            }
        } else {
            return sendResponse(400, {
                message: "No User Found!", status: "failure", error: "No User Found!",
            })
        }
        //updateLnurlp
    } catch (error) {
        console.log("update lnaddress-->", error)
        return sendResponse(400, {
            message: "Please try again after sometime!", status: "failure", error: "Please try again after sometime!",
        })
    }
}




module.exports.lnbitCalls = async (event) => {
    try {
        // console.log("lnbitCalls event-->", event)
        let bodyData = {}
        if (event.body) {
            bodyData = JSON.parse(event.body);
        } else {
            bodyData = event;  // fallback if body is not defined
        }
        const { name = "", data = [] } = bodyData;
        // Validate email
        if (!name || typeof name !== "string" || !(name in functionMap)) {
            return sendResponse(400, {
                message: "Invalid function name!",
                status: "failure",
                error: "Function not found!",
            });
        }
        const result = await functionMap[name](...data);
        return sendResponse(200, {
            message: "Function called successfully!", status: "success",
            data: result
        });
    } catch (error) {
        console.error("lnbitCalls error:", error);
        return sendResponse(500, {
            message: "Internal Server Error",
            status: "failure",
            error: error.message,
        });
    }
}

