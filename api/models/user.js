const mongoose = require("mongoose");

const User = mongoose.Schema({
    _id: {type: mongoose.Schema.Types.ObjectId, required: true},
    phone: {type: Number, required: true},
    language: {type: String},
    password: { type: String },
    dateRegistered: {type: Date},
    method: {type: String}
})

module.exports = mongoose.model('User', User);

// -> User
// Uid, phone
