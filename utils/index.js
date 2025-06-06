 
// const jwt = require('jsonwebtoken');
let sendResponse = (code, data) => {
    return ({
        statusCode: code,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Credentials": true
        }, 
        body: JSON.stringify(data),
    })
}; 


module.exports = {
    sendResponse,
}
