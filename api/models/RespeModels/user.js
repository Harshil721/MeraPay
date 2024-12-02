const mongoose = require("mongoose");

const User = mongoose.Schema({
    _id: {type: mongoose.Schema.Types.ObjectId, required: true},
    email: {type: String},
    phone: {type: Number},
    name: {type: String},
    collegeName: {type: String}
})

module.exports = mongoose.model('User', User)