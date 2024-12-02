const mongoose = require("mongoose");

const BookPriceStructure = mongoose.Schema({
    _id: {type: mongoose.Schema.Types.ObjectId, required: true},
    board: {type: String},
    priceStructure: {type: Object}
})

module.exports = mongoose.model('BookPriceStructure', BookPriceStructure)

// priceStructure
// {“1”:[400,350], “2”:[600,550]}
// [buy,sell]