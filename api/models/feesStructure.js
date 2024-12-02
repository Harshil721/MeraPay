const mongoose = require("mongoose");

const FeesStructure = mongoose.Schema({
    _id: {type: mongoose.Schema.Types.ObjectId, required: true},
    schoolName: {type: String, required: true},
    feesStructure: {type: Object, required: true}
})

module.exports = mongoose.model('FeesStructure', FeesStructure);

// feesStructure
// {“1”:{“06”:2000,”07”:1000,”08”:1000 ….. }, “2”:{“06”:2000,”07”:1000,”08”:1000 ….. }}