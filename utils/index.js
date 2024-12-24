
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
// const generateToken = async (user, expiresIn = '15d') => {
//     // console.log("tokenExpiresIn:", expiresIn)
//     return jwt.sign(
//         {
//             email: user.email
//         },
//         process.env.JWT_SECRET,
//         { expiresIn: expiresIn }
//     );
// };
// const verifyToken = (token) => {
//     return jwt.verify(
//         token,
//         process.env.JWT_SECRET
//     );
// };

module.exports = {
    sendResponse,
    // generateToken,
    // verifyToken,
}
