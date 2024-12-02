const mongoose = require('mongoose');

const paymentSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    uid : {type : mongoose.Schema.Types.ObjectId, required : true},
    payment_id : {type : String, required : true},
    order_id : {type : String, required : true},
    amt : {type : Number, required : true},
    curr : {type : String, required : true},
    reason : {type : String, required : true},
    date : {type : Date, required : true}
});


module.exports = mongoose.model('Payment',paymentSchema);