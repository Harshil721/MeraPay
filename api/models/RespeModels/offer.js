const mongoose = require("mongoose");

const Offer = mongoose.Schema({
    _id: {type: mongoose.Schema.Types.ObjectId, required: true},
    shopId: {type: mongoose.Schema.Types.ObjectId},
    count: {type: Number}
})

module.exports = mongoose.model('Offer', Offer)