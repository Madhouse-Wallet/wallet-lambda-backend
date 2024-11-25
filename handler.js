const connectToDatabase = require("./db");
const Wallet = require("./model/wallet"); // Reuse the schema and model

// Create a new wallet
module.exports.createWallet = async (event) => {
    try {
        await connectToDatabase();

        const { passkey, walletAddress } = JSON.parse(event.body);
        console.log("walletAddress--->", passkey, walletAddress)
        if (!passkey || !walletAddress) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Passkey and address are required" }),
            };
        }

        const wallet = new Wallet({ passkey, walletAddress });
        await wallet.save();

        return {
            statusCode: 201,
            body: JSON.stringify({ message: "Wallet created successfully", wallet }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal server error", error: error.message }),
        };
    }
};

// Get all wallets
module.exports.getWallets = async () => {
    try {
        await connectToDatabase();

        const wallets = await Wallet.find();

        return {
            statusCode: 200,
            body: JSON.stringify(wallets),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal server error", error: error.message }),
        };
    }
};

// Get a single wallet by ID
module.exports.getWalletById = async (event) => {
    try {
        await connectToDatabase();

        const { id } = event.pathParameters;

        const wallet = await Wallet.findById(id);
        if (!wallet) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "Wallet not found" }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(wallet),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal server error", error: error.message }),
        };
    }
};

// Update a wallet by ID
module.exports.updateWallet = async (event) => {
    try {
        await connectToDatabase();

        const { id } = event.pathParameters;
        const updates = JSON.parse(event.body);

        const wallet = await Wallet.findByIdAndUpdate(id, updates, { new: true });
        if (!wallet) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "Wallet not found" }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Wallet updated successfully", wallet }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal server error", error: error.message }),
        };
    }
};

// Delete a wallet by ID
module.exports.deleteWallet = async (event) => {
    try {
        await connectToDatabase();

        const { id } = event.pathParameters;

        const wallet = await Wallet.findByIdAndDelete(id);
        if (!wallet) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "Wallet not found" }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Wallet deleted successfully" }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal server error", error: error.message }),
        };
    }
};
