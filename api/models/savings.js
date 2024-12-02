const mongoose = require("mongoose");

const Savings = mongoose.Schema({
    _id: {type: mongoose.Schema.Types.ObjectId, required: true},
    uid: {type: mongoose.Schema.Types.ObjectId, required: true},
    savingsData: {type: Object},
    userCreated: {type: Boolean},
    months: {type: Number},
    amt: {type: Number},
    planAmt: {type: Number},
    interest: {type: Number},
    open: {type: Boolean}
})

module.exports = mongoose.model('Savings', Savings)

// savingsData
// [{type:”bonus”,amt:20,date:____},{type:”month”,amt:250,month:”6”,date:____,method:”collectHome”}]




// -> Savings
// Sid, uid, savingsData, userCreated(true/false), months, amt, planAmt
