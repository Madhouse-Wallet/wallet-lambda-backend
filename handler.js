const connectToDatabase = require("./db");
const connectToDatabaseTest = require("./dbTest");
const { sendResponse } = require("./utils/index")
const { ethers } = require("ethers");
const { startMonitoring } = require("./utils/coll")
const AWS = require('aws-sdk');
const { MongoClient } = require('mongodb');
;
module.exports.receiveTbtc = async (event) => {
    try {
        const tt = startMonitoring()
        return sendResponse(201, { message: "cron started successfully!", status: "success", data: {} })
    } catch (error) {
        return sendResponse(500, { message: "Internal server error", status: "failure", error: error.message })
    }
};

module.exports.testdbConnection = async (event) => {
    try {
        const dbName = 'madhouse';
        const sts = new AWS.STS()
        // Assume IAM role to access MongoDB Atlas
        const params = {
            RoleArn: "arn:aws:iam::145023121234:role/madhouse-ecs-role",
            RoleSessionName: 'AccessMongoDB'
        };
        const credentials = await sts.assumeRole(params).promise();

        // Connect to MongoDB Atlas
        const uri = `mongodb+srv://${credentials.AccessKeyId}:${credentials.SecretAccessKey}@mycluster.mongodb.net/${dbName}?retryWrites=true&w=majority`;
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();

        // Get user's access privileges
        const db = client.db(dbName);
        console.log("db==>",db)
        // const user = await db.collection('users').findOne({ username: username });
        // const privileges = user.privileges;

        // Perform database operation based on user's access privileges
        // ...

        // Disconnect from MongoDB Atlas
        // await client.close();

        const response = {
            statusCode: 200,
            body: JSON.stringify('Hello from Lambda!'),
        };
        return response;
        // await connectToDatabaseTest();
        // return sendResponse(201, { message: "cron started successfully!", status: "success", data: {} })
    } catch (error) {
        console.log("connectToDatabaseTest-->", error)
        return sendResponse(500, { message: "Internal server error", status: "failure", error: error.message })
    }
};



module.exports.testMailClient = async (event) => {
    try {

        // Create SES client with role-based credentials
        const ses = new AWS.SES({
            region: process.env.NEXT_PUBLIC_AWS_S3_REGION
        });


        const params = {
            Destination: {
                ToAddresses: ["parvinder@yopmail.com"],
            },
            Message: {
                Body: {
                    Text: { Data: "This is a test email from SES." },
                },
                Subject: { Data: "Test Email" },
            },
            Source: "madhouse@ondemandcreations.com", // Must be a verified SES identity
        };

        try {
            const sendEmailPromise = () => {
                return new Promise((resolve, reject) => {
                    ses.sendEmail(params, (error, data) => {
                        if (error) {
                            console.error('Error sending email:', error);
                            reject(error);
                        } else {
                            console.log('Email sent successfully:', data.MessageId);
                            resolve(data);
                        }
                    });
                });
            };

            // Send email and await the result
            const data = await sendEmailPromise();

            console.log('Email sent successfully:', data.MessageId);
            return sendResponse(201, { message: "cron started successfully!", status: "success", data: {} });

        } catch (error) {
            console.error("Error sending email:", error);
            return sendResponse(500, { message: "Internal server error", status: "failure", error: error.message })
        }
    } catch (error) {
        console.log("connectToDatabaseTest-->", error)
        return sendResponse(500, { message: "Internal server error", status: "failure", error: error.message })
    }
};
