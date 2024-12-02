const mongoose = require("mongoose");

const Credit = mongoose.Schema({
    _id: {type: mongoose.Schema.Types.ObjectId, required: true},
    uid: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    creditScore: {type: Number},
    creditScoreData: {type: Object},
    creditMoney: {type: Number},
    activated: {type: Boolean},
    feesSavings: {type: Object}
})

module.exports = mongoose.model("Credit", Credit);

// -> Credit
// creditId, uid, creditScore, creditScoreData, creditMoney, activated (true/false)
