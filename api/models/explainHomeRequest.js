const mongoose = require("mongoose");

const explainHomeRequest = mongoose.Schema({
    _id: {type: mongoose.Schema.Types.ObjectId, required: true},
    uid: {type: mongoose.Schema.Types.ObjectId, required: true},
    date: {type: Date},
    address: {type: String},
    status: {type: String},
})

module.exports = mongoose.model('explainHomeRequest', explainHomeRequest);
