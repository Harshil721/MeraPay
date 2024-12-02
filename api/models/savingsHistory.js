const mongoose = require("mongoose");

const SavingsHistory = mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    month: {type: String},
    date: {type: Date},
    amt: {type: Number},
    mode: {type: String}
})

module.exports = mongoose.model('SavingsHistory', SavingsHistory);

// savingsHistory: [
//     {
//     month: "j"
//     date: 
//     amt: 
//     mode: { online, offline }
//     }
// ].