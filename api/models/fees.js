const mongoose = require("mongoose");
// const User = require("./user");

const Fees = mongoose.Schema({
    _id: {type: mongoose.Schema.Types.ObjectId, required: true},
    uid: {type: mongoose.Schema.Types.ObjectId, required: true, ref: "User"},
    childName: {type: String},
    schoolName: {type: String},
    class: {type: String},
    rollNo: {type: Number},
    feesPaymentStatus: {type: Object},
    open: {type: Boolean}
})

module.exports = mongoose.model('Fees', Fees);

// feesPaymentStatus
// {“6”:{“amt”:2000,”status”:”paid”,”date”:____},“8”:{“amt”:1000,”status”:”collectHomeRequest”,”address”:”fdfdfg”,”date”:____}}
// [{"month":"6",“amt”:2000,”method”:”paid”,”date”:____},{"month":"8",“amt”:1000,method:”collectHomeRequest”,”date”:____}]
