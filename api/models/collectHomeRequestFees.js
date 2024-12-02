const mongoose = require("mongoose");

const CollectHomeRequestFees = mongoose.Schema({
    _id: {type: mongoose.Schema.Types.ObjectId, required: true},
    fid: {type: mongoose.Schema.Types.ObjectId, required: true},
    uid: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    month: {type: String},
    amt: {type: Number},
    address: {type: String},
    date: {type: Date},
    status: {type: String}
})

module.exports = mongoose.model('CollectHomeRequestFees', CollectHomeRequestFees);

// -> Collect Home Request for fees
// Cfid,fid,uid,month,amt,address,date, status (pending,done)
