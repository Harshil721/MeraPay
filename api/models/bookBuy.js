const mongoose = require("mongoose");

const BookBuy = mongoose.Schema({
    _id: {type: mongoose.Schema.Types.ObjectId, required: true},
    uid: {type: mongoose.Schema.Types.ObjectId, required: true},
    date: {type: Date},
    school: {type: String},
    board: {type: String},
    class: {type: String},
})
    address: {type: String}

module.exports = mongoose.model('BookBuy', BookBuy)




// -> Books Buy
// Bpid, uid, date, school, board, class, address
