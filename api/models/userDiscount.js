const mongoose = require("mongoose");

const UserDiscount = mongoose.Schema({
    _id: {type: mongoose.Schema.Types.ObjectId, required: true},
    uid: {type: mongoose.Schema.Types.ObjectId, required: true},
    fid: {type: mongoose.Schema.Types.ObjectId, required: true},
    cpid: {type: mongoose.Schema.Types.ObjectId, required: true},
    discount: {type: Number},
    paidToSchool: {type: Boolean},
    method: {type: String},
    date: {type: Date},
    totalFeesAmt: {type: Number},
    offerUpdated: {type: Boolean}
})

module.exports = mongoose.model('UserDiscount', UserDiscount);

