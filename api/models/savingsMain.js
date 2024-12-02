const mongoose = require("mongoose");

const SavingsMain = mongoose.Schema({
    _id: {type: mongoose.Schema.Types.ObjectId, required: true},
    uid: {type: mongoose.Schema.Types.ObjectId, required: true},
    totalAmt: {type: Number},
    bonus: {type: Object}
})

module.exports = mongoose.model('SavingsMain', SavingsMain)

//bonus - [{amt:10,reason:"",date:date}]