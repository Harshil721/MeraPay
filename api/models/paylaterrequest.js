const mongoose = require("mongoose");

const PaylaterRequest = mongoose.Schema({
    _id: {type: mongoose.Schema.Types.ObjectId, require: true},
    uid: {type: mongoose.Schema.Types.ObjectId, require: true},
    date: {type: Date},
    amt: {type: Number},
    status: {type: String}
})

module.exports = mongoose.model("PaylaterRequest", PaylaterRequest);