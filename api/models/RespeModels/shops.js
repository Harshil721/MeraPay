const mongoose = require("mongoose");

const Shops = mongoose.Schema({
    _id: {type: mongoose.Schema.Types.ObjectId, required: true},
    location: {type: String},
    shopName: {type: String},
    type: {type: String},
    foodArray: {type: Array},
    MenuPicarr: {type: Array}
})

module.exports = mongoose.model('Shops', Shops)