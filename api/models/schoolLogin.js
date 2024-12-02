const mongoose = require("mongoose");

const SchoolLogin = mongoose.Schema({
    _id: {type: mongoose.Schema.Types.ObjectId, required: true},
    schoolName: {type: String, required: true},
    password: { type: String },
    dateRegistered: {type: Date}
})

module.exports = mongoose.model('SchoolLogin', SchoolLogin);
