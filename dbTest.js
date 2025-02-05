const { tryEach } = require('async');
const AWS = require('aws-sdk');
// 1. Set up AWS SDK
AWS.config.update({
    region: process.env.AWS_REGION,  // replace with your AWS region
});
const STS = AWS.STS;

require('dotenv').config();
const mongoose = require("mongoose");

require('dotenv').config();

let isConnected;
const sts = new STS();

const ACCESS_ROLE_ARN = process.env.MONGODB_ACCESS_ROLE_ARN;
const CLUSTER_NAME = process.env.MONGODB_CLUSTER_NAME; // e.g. cluster-name.asdf
console.log(ACCESS_ROLE_ARN, CLUSTER_NAME)
const getMongoDBURIWithIAM = async () => {
    try {
        const { Credentials } = await sts
            .assumeRole({
                RoleArn: ACCESS_ROLE_ARN,
                RoleSessionName: 'AccessMongoDB',
            })
            .promise();
        console.log("Credentials-->", Credentials)
        if (!Credentials) {
            throw new Error('Failed to assume MongoDB IAM role');
        }

        const { AccessKeyId, SessionToken, SecretAccessKey } = Credentials;
        const encodedSecretKey = encodeURIComponent(SecretAccessKey);
        const combo = `${AccessKeyId}:${encodedSecretKey}`;

        const url = new URL(`mongodb+srv://${combo}@${CLUSTER_NAME}.mongodb.net`);
        url.searchParams.set('authSource', '$external');
        url.searchParams.set(
            'authMechanismProperties',
            `AWS_SESSION_TOKEN:${SessionToken}`
        );
        url.searchParams.set('w', 'majority');
        url.searchParams.set('retryWrites', 'true');
        url.searchParams.set('authMechanism', 'MONGODB-AWS');

        return url.toString();
    } catch (error) {
        console.log("error-->", error)
    }

};

const connectToDatabase = async () => {
    try {
        if (isConnected) {
            console.log('=> Using existing database connection');
            return;
        }

        console.log('=> Establishing new database connection');
        const mongoURI = await getMongoDBURIWithIAM();

        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        isConnected = mongoose.connection.readyState === 1;
        console.log('Database connection established:', isConnected);
    } catch (error) {
        console.error('Database connection error:', error);
    }
};


module.exports = connectToDatabase;