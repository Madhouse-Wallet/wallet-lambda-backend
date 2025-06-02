
const axios = require("axios");
// Define response type for the BlockCypher API

const createBitcoinWallet = async () => {
    const response = await axios.post(
        "https://api.blockcypher.com/v1/btc/main/addrs"
    );
    // Extract the data from the response
    const {
        private,
        address,
        public,
        wif,
    } = response.data;
    return ({
        private,
        address,
        public,
        wif,
    })
}
module.exports = {
    createBitcoinWallet
}
