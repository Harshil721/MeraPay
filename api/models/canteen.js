const mongoose = require("mongoose");

const Canteen = mongoose.Schema({
    _id: {type: mongoose.Schema.Types.ObjectId, required: true},
    uid: {type: mongoose.Schema.Types.ObjectId, required: true},
    fid: {type: mongoose.Schema.Types.ObjectId, required: true},
    childName: {type: String},
    schoolName: {type: String},
    class: {type: String},
    rollNo: {type: Number},
    canteenFeesPaymentStatus: {type: Object},
    open: {type: Boolean}
})

module.exports = mongoose.model('Canteen', Canteen);

// canteenFeesPaymentStatus
// {“6”:{“amt”:2000,”status”:”paid”,”date”:____},“8”:{“amt”:1000,”status”:”collectHomeRequest”,”address”:”fdfdfg”,”date”:____}}
// [{"month":"6",“amt”:2000,”method”:”paid”,”date”:____},{"month":"8",“amt”:1000,method:”collectHomeRequest”,”date”:____}]
