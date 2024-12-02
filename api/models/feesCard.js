const mongoose = require("mongoose");

const FeesCard = mongoose.Schema({
    _id: {type: mongoose.Schema.Types.ObjectId, required: true},
    cardNo: {type: Number, required: true},
    city: {type: String},
    schoolName: {type: String},
    studentName: {type: String},
    std: {type: String},
    grNo: {type: Number},
    date: {type: Date},
    mobileNumber: {type: Number},
    paidToSchool: {type: Number},
    totalToPay: {type: Number},
    totolFees: {type: Number},
    feesStructure: {type: Object}
})

module.exports = mongoose.model('FeesCard', FeesCard);