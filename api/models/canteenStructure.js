const mongoose = require("mongoose");

const CanteenStructure = mongoose.Schema({
    _id: {type: mongoose.Schema.Types.ObjectId, required: true},
    schoolName: {type: String, required: true},
    canteenStructure: {type: Object, required: true}
})

module.exports = mongoose.model('CanteenStructure', CanteenStructure);

// CanteenStructure
// {“1”:{“06”:2000,”07”:1000,”08”:1000 ….. }, “2”:{“06”:2000,”07”:1000,”08”:1000 ….. }}