const mongoose = require("mongoose");

const CollectHomeRequestSaving = mongoose.Schema({
    _id: {type: mongoose.Schema.Types.ObjectId, required: true},
    sid: {type: mongoose.Schema.Types.ObjectId, required: true},
    uid: {type: mongoose.Schema.Types.ObjectId, required: true},
    month: {type: String},
    amt: {type: Number},
    address: {type: String},
    date: {type: Date},
    status: {type: String}
})

module.exports = mongoose.model('CollectHomeRequestSaving', CollectHomeRequestSaving)



// -> Collect Home Request for savings
// Csid,sid,uid,month,amt,address,date, status (pending,done)
