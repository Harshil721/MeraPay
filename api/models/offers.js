const mongoose = require("mongoose");

const Offers = mongoose.Schema({
    _id: {type: mongoose.Schema.Types.ObjectId, required: true},
    schoolName: {type: String},
    offer: {type: Object},
    totalOffers: {type: Number},
    leftOffers: {type: Number},
    month: {type: String},
    year: {type: Number}
})

module.exports = mongoose.model('Offers', Offers);