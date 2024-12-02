const mongoose = require("mongoose");

const BookSell = mongoose.Schema({
    _id: {type: mongoose.Schema.Types.ObjectId, required: true},
    uid: {type: mongoose.Schema.Types.ObjectId, required: true},
    date: {type: Date},
    school: {type: String},
    board: {type: String},
    class: {type: String},
    address: {type: String}
})

module.exports = mongoose.model('BookSell', BookSell);




// -> Books Sell
// Bsid, uid, date, school, board, class, address
