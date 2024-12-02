const mongoose = require("mongoose");

const Status = mongoose.Schema({
    _id: {type: mongoose.Schema.Types.ObjectId, required: true},
    uid: {type: mongoose.Schema.Types.ObjectId},
    totalBill: {type: Number},
    saved: {type: Number},
    monthwise: {type: Number}
})

module.exports = mongoose.model('Status', Status)