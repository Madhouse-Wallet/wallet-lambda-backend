const mongoose = require("mongoose");

let isConnected;

const connectToDatabase = async () => {
  if (isConnected) {
    console.log("=> Using existing database connection");
    return;
  }

  console.log("=> Establishing new database connection");
  await mongoose.connect(`mongodb+srv://Gaurav:5r4pQBijweDHyu5E@madhouse-wallet.91du5.mongodb.net/madhouse`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  isConnected = mongoose.connection.readyState;
};

module.exports = connectToDatabase;
