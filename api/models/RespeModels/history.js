const mongoose = require("mongoose");

const History = mongoose.Schema({
    _id: {type: mongoose.Schema.Types.ObjectId, required: true},
    uid: {type: mongoose.Schema.Types.ObjectId},
    shopId: {type: mongoose.Schema.Types.ObjectId},
    offerId: {type: mongoose.Schema.Types.ObjectId},
    bill: {type: Number},
    date: {type: Date}
})

module.exports = mongoose.model('History', History)