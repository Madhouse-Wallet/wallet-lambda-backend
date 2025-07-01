
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    username: { type: String, default: null },
    passkey_number: { type: Number, default: 0 },
    passkey_status: { type: Boolean, default: false },
    passkey: { type: mongoose.Schema.Types.Mixed },
    totalPasskey: { type: Number, default: 0 },
    wallet: String,
    bitcoinWallet: String,
    liquidBitcoinWallet: String,
    coinosToken: String,
    flowTokens: { type: mongoose.Schema.Types.Mixed },
    lnbitAdminKey_3: String,
    lnbitEmail_3: String,
    lnbitId_3: String,
    lnbitWalletId_3: String,
    spendLnurlpLink: { type: mongoose.Schema.Types.Mixed, default: {} },
    spendWithdrawLink: { type: mongoose.Schema.Types.Mixed, default: {} },
    lnaddress: { type: String, default: "" },
    watermarkIndex: { type: Number, default: 0 },
    bgOpacity: { type: Number, default: 1 },
    backgroundIndex: { type: Number, default: 0 },
    wmOpacity: { type: Number, default: 0.5 },
    lnbitAdminKey: String,
    lnbitAdminKey_2: String,
    lnbitEmail: String,
    lnbitEmail_2: String,
    lnbitId: String,
    lnbitId_2: String,
    lnbitLinkId: String,
    lnbitLinkId_2: String,
    lnbitWalletId: String,
    lnbitWalletId_2: String,

    boltzAutoReverseSwap: { type: mongoose.Schema.Types.Mixed, default: {} },
    boltzAutoReverseSwap_2: { type: mongoose.Schema.Types.Mixed, default: {} },
    lnbitTposData: { type: mongoose.Schema.Types.Mixed, default: {} },
    lnbitTposData_2: { type: mongoose.Schema.Types.Mixed, default: {} },
    splitPaymentTarget: { type: mongoose.Schema.Types.Mixed, default: {} },
    splitPaymentTarget_2: { type: mongoose.Schema.Types.Mixed, default: {} },
    kyc: { type: mongoose.Schema.Types.Mixed, default: "" },
    businessAccountDetail: { type: mongoose.Schema.Types.Mixed, default: {} },
    receivingPartyDetail: { type: [mongoose.Schema.Types.Mixed], default: [] },
    splitPaymentTargetSource: { type: mongoose.Schema.Types.Mixed, default: "" },
    creditCardPass: {
      type: mongoose.Schema.Types.Mixed, default: ""
    }
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    versionKey: false
  }
);


const walletModel = module.exports = mongoose.model("users", userSchema, "users");
