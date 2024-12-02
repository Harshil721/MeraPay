const mongoose = require("mongoose");

const SavingsWithdraw = mongoose.Schema({
    _id: {type: mongoose.Schema.Types.ObjectId, required: true},
    uid: {type: mongoose.Schema.Types.ObjectId, required: true},
    sid: {type: mongoose.Schema.Types.ObjectId, required: true},
    date: {type: Date},
    savingsAmt: {type: Number},
    status: {type: String}
})

module.exports = mongoose.model('SavingsWithdraw', SavingsWithdraw);
