require('dotenv').config();
const mongoose = require("mongoose");

let isConnected;

const connectToDatabase = async () => {
  try {
    console.log("process.env.MONGODB_URI", process.env.MONGODB_URI, isConnected)
    if (isConnected) {
      console.log("=> Using existing database connection");
      return;
    } 
 
    console.log("=> Establishing new database connection");
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("readyState", mongoose.connection.readyState)
    isConnected = mongoose.connection.readyState;
  } catch (e) {
    console.log("error-->", e)
  }

};

module.exports = connectToDatabase;
