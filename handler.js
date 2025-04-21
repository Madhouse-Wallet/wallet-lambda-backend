const connectToDatabase = require("./db");
const connectToDatabaseTest = require("./dbTest");
const { sendResponse } = require("./utils/index")
const { ethers } = require("ethers");
const { startMonitoring } = require("./utils/coll")
const AWS = require('aws-sdk');
const { MongoClient } = require('mongodb');


const zkpInit = require("@vulpemventures/secp256k1-zkp").default;
const axios = require("axios");
const { randomBytes } = require("crypto");
const { ECPairFactory } = require("ecpair");
const ecc = require("tiny-secp256k1");
const WebSocket = require("ws");
const { Transaction, address, crypto, networks } = require("liquidjs-lib");
const {
    Musig,
    OutputType,
    SwapTreeSerializer,
    detectSwap,
    targetFee,
} = require("boltz-core");
const {
    TaprootUtils,
    constructClaimTransaction,
    init,
} = require("boltz-core/dist/lib/liquid");






module.exports.liquidSwap = async (event) => {
    try {
        let bodyData = JSON.parse(event.body);
        console.log("invoiceAmount", event.body, event.body?.invoiceAmount, bodyData?.invoiceAmount);
        const { invoiceAmount, destinationAddress } = bodyData;

        const ENDPOINT = "https://api.boltz.exchange";
        const WEBSOCKET_ENDPOINT = "wss://api.boltz.exchange/v2/ws";

        const NETWORK = networks.regtest; // Using Liquid network


        const zkp = await zkpInit();
        init(zkp);

        // Create a random preimage for the swap
        const preimage = randomBytes(32);
        const keys = ECPairFactory(ecc).makeRandom();

        // Create a Reverse Swap
        const response = await axios.post(`${ENDPOINT}/v2/swap/reverse`, {
            invoiceAmount,
            to: "L-BTC",
            from: "BTC",
            claimPublicKey: keys.publicKey.toString("hex"),
            preimageHash: crypto.sha256(preimage).toString("hex"),
        });

        const createdResponse = response.data;
        console.log("Created swap");
        console.log(createdResponse);

        // Create a WebSocket connection
        const webSocket = new WebSocket(WEBSOCKET_ENDPOINT);

        webSocket.on("open", () => {
            webSocket.send(
                JSON.stringify({
                    op: "subscribe",
                    channel: "swap.update",
                    args: [createdResponse.id],
                })
            );
        });

        webSocket.on("message", async (rawMsg) => {
            const msg = JSON.parse(rawMsg.toString("utf-8"));
            if (msg.event !== "update") {
                return;
            }

            console.log("Got WebSocket update");
            console.log(msg);

            switch (msg.args[0].status) {
                case "swap.created": {
                    console.log("Waiting for invoice to be paid");
                    break;
                }

                case "transaction.mempool": {
                    console.log("Creating claim transaction");

                    const boltzPublicKey = Buffer.from(
                        createdResponse.refundPublicKey,
                        "hex"
                    );

                    // Create a musig signing session and tweak it with the Taptree of the swap scripts
                    const musig = new Musig(zkp, keys, randomBytes(32), [
                        boltzPublicKey,
                        keys.publicKey,
                    ]);

                    const tweakedKey = TaprootUtils.tweakMusig(
                        musig,
                        SwapTreeSerializer.deserializeSwapTree(createdResponse.swapTree)
                            .tree
                    );

                    // Parse the lockup transaction and find the output relevant for the swap
                    const lockupTx = Transaction.fromHex(msg.args[0].transaction.hex);
                    const swapOutput = detectSwap(tweakedKey, lockupTx);

                    if (swapOutput === undefined) {
                        console.error("No swap output found in lockup transaction");
                        return;
                    }

                    // Create a claim transaction with confidential assets
                    const claimTx = targetFee(0.1, (fee) =>
                        constructClaimTransaction(
                            [
                                {
                                    ...swapOutput,
                                    keys,
                                    preimage,
                                    cooperative: true,
                                    type: OutputType.Taproot,
                                    txHash: lockupTx.getHash(),
                                    blindingPrivateKey: Buffer.from(
                                        createdResponse.blindingKey,
                                        "hex"
                                    ),
                                },
                            ],
                            address.toOutputScript(destinationAddress, NETWORK),
                            fee,
                            false,
                            NETWORK,
                            address.fromConfidential(destinationAddress).blindingKey
                        )
                    );

                    // Get the partial signature from Boltz
                    const boltzSig = await axios.post(
                        `${ENDPOINT}/v2/swap/reverse/${createdResponse.id}/claim`,
                        {
                            index: 0,
                            transaction: claimTx.toHex(),
                            preimage: preimage.toString("hex"),
                            pubNonce: Buffer.from(musig.getPublicNonce()).toString("hex"),
                        }
                    );

                    // Aggregate the nonces
                    musig.aggregateNonces([
                        [boltzPublicKey, Buffer.from(boltzSig.data.pubNonce, "hex")],
                    ]);

                    // Initialize the session to sign the claim transaction
                    musig.initializeSession(
                        claimTx.hashForWitnessV1(
                            0,
                            [swapOutput.script],
                            [{ value: swapOutput.value, asset: swapOutput.asset }],
                            Transaction.SIGHASH_DEFAULT,
                            NETWORK.genesisBlockHash
                        )
                    );

                    // Add the partial signature from Boltz
                    musig.addPartial(
                        boltzPublicKey,
                        Buffer.from(boltzSig.data.partialSignature, "hex")
                    );

                    // Create our partial signature
                    musig.signPartial();

                    // Witness of the input to the aggregated signature
                    claimTx.ins[0].witness = [musig.aggregatePartials()];

                    // Broadcast the finalized transaction
                    await axios.post(`${ENDPOINT}/v2/chain/L-BTC/transaction`, {
                        hex: claimTx.toHex(),
                    });

                    break;
                }

                case "invoice.settled":
                    console.log("Swap successful");
                    webSocket.close();
                    break;
            }
        });
        return sendResponse(200, {
            message: "success!", status: "success", data: {
                id: createdResponse.id,
                invoice: createdResponse.invoice,
                swapTree: createdResponse.swapTree,
                lockupAddress: createdResponse.lockupAddress,
                refundPublicKey: createdResponse.refundPublicKey,
                timeoutBlockHeight: createdResponse.timeoutBlockHeight,
                onchainAmount: createdResponse.onchainAmount,
                blindingKey: createdResponse.blindingKey, // Include blindingKey for Liquid
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


module.exports.requestQuote = async (event) => {
    try {

        // Fixed IP address as used in curl commands
        const FIXED_IP_ADDRESS = "201.144.119.146";
        const secretKey = event.headers['x-sideshift-secret'];
        const response = await fetch("https://sideshift.ai/api/v2/quotes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-sideshift-secret": secretKey,
                "x-user-ip": FIXED_IP_ADDRESS,
            },
            body: (event.body),
        });
        if (!response.ok) {
            const errorData = await response.json();
            return sendResponse(500, { message: "Internal server error", status: "failure", error: `Quote request failed: ${errorData.message || response.statusText}` })
        }

        // await connectToDatabaseTest();
        return sendResponse(201, { message: "Successfully!", status: "success", data: await response.json() })
    } catch (error) {
        console.log("connectToDatabaseTest-->", error)
        return sendResponse(500, { message: "Internal server error", status: "failure", error: error.message })
    }
};



module.exports.createFixedShift = async (event) => {
    try {
        // Fixed IP address as used in curl commands
        const FIXED_IP_ADDRESS = "201.144.119.146";
        const secretKey = event.headers['x-sideshift-secret'];
        const response = await fetch("https://sideshift.ai/api/v2/shifts/fixed", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-sideshift-secret": secretKey,
                "x-user-ip": FIXED_IP_ADDRESS,
            },
            body: (event.body),
        });
        if (!response.ok) {
            const errorData = await response.json();
            return sendResponse(500, { message: "Internal server error", status: "failure", error: `Quote request failed: ${errorData.message || response.statusText}` })
        }

        // await connectToDatabaseTest();
        return sendResponse(201, { message: "Successfully!", status: "success", data: await response.json() })
    } catch (error) {
        console.log("connectToDatabaseTest-->", error)
        return sendResponse(500, { message: "Internal server error", status: "failure", error: error.message })
    }
};



module.exports.refundBitcoinAddress = async (event) => {
    try {
        console.log("line-170");
        const FIXED_IP_ADDRESS = "201.144.119.146";
        const secretKey = "ec36c6e251ff8355154bd88dcfe5e249";
        const affiliateId = "UHNxssRFo";
        let bodyData = JSON.parse(event.body);
        const { usdcAmount, bitcoinAddress } = bodyData;

        // Step 1: Request a quote
        const quoteResponse = await axios.post(
            "https://sideshift.ai/api/v2/quotes",
            {
                affiliateId,
                depositCoin: "USDC",
                depositNetwork: "base",
                settleCoin: "BTC",
                settleNetwork: "bitcoin",
                depositAmount: usdcAmount,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "x-sideshift-secret": secretKey,
                    "x-user-ip": FIXED_IP_ADDRESS,
                },
            }
        );
        const quoteData = quoteResponse.data;
        // Step 2: Create a fixed shift using the quote
        // Step 2: Create a fixed shift using the quote
        const shiftResponse = await axios.post(
            "https://sideshift.ai/api/v2/shifts/fixed",
            {
                settleAddress: bitcoinAddress,
                affiliateId,
                quoteId: quoteData.id,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "x-sideshift-secret": secretKey,
                    "x-user-ip": FIXED_IP_ADDRESS,
                },
            }
        );
        // await connectToDatabaseTest();
        return sendResponse(200, { message: "Successfully!", status: "success", data: shiftResponse.data })
    } catch (error) {
        const sideshiftError = error.response.data?.error || "Unknown error from Sideshift";
        // console.error("Sideshift API error:", sideshiftError);
        return sendResponse(500, { message: "Internal server error", status: "failure", sideshiftError})
    }
};