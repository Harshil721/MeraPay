const mongoose = require("mongoose");

const SavingsCard = mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    cardNo: { type: Number, required: true },
    city: { type: String },
    schoolName: { type: String },
    studentName: { type: String },
    std: { type: String },
    grNo: { type: Number },
    date: { type: Date },
    mobileNumber: { type: Number },
    totalSavedAmt: {type: Number},
    savingsHistory: { type: Object },
})

module.exports = mongoose.model('SavingsCard', SavingsCard);

// savingsHistory: [
//     {
//     month: "j"
//     date: 
//     amt: 
//     mode: { online, offline }
//     }
// ]