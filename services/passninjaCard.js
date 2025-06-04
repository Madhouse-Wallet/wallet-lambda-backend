require('dotenv').config();

const { PassNinjaClient } = require('@passninja/passninja-js');

const accountId = process.env.PASSNINJA_ACCOUNTI_ID;
const apiKey = process.env.PASSNINJA_API_KEY;
const applepay = process.env.PASSNINJA_CARD_APPLE_PAY;
const googlepay = process.env.PASSNINJA_CARD_GOOGLE_PAY;


const passNinjaClient = new PassNinjaClient(accountId, apiKey);


const DEVICE_TYPE = {
    applepay: 'ptk_0x1dc',
    googlepay: 'ptk_0x1db'
}


const createPass = async (WALLET_ADDRESS, type = "apple") => {
    try {
        const simplePassObject = await passNinjaClient.pass.create(
            (type == "apple") ? applepay : googlepay, // passType
            { 'nfc-message': WALLET_ADDRESS } // passData
        );
        console.log(simplePassObject.url);
        console.log(simplePassObject.passType);
        console.log(simplePassObject.serialNumber);
        return ({
            status: true,
            data: {
                url: simplePassObject.url,
                passType: simplePassObject.passType,
                serialNumber: simplePassObject.serialNumber,
                type
            }
        })
    } catch (error) {
        console.log("create Pass error -->", error)
        return ({
            status: false,
            msg: error?.message || "Failed To Create!"
        })
    }
}


const deletePass = async (serialNumber, type = "apple") => {
    try {
        const deletedPassSerialNumber = await passNinjaClient.pass.delete(
            (type == "apple") ? applepay : googlepay,
            serialNumber // serialNumber
        );
        console.log(`Pass deleted. serial_number: ${deletedPassSerialNumber}`)
        return ({
            status: true,
        })
    } catch (error) {
        console.log("delete Pass error -->", error)
        return ({
            status: false,
            msg: error?.message || "Failed To Create!"
        })
    }
}

module.exports = {
    createPass,
    deletePass
}