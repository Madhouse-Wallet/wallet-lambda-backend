require('dotenv').config();
const mongoose = require("mongoose");

let isConnected;

const connectToDatabase = async () => {
  console.log("process.env.MONGODB_URI",process.env.MONGODB_URI)
  if (isConnected) {
    console.log("=> Using existing database connection");
    return;
  }

  console.log("=> Establishing new database connection");
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  isConnected = mongoose.connection.readyState;
};

module.exports = connectToDatabase;
