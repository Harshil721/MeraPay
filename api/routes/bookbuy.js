const express = require("express");
const router = express.Router();
const User = require("../models/user");
const BookBuy = require("../models/bookBuy");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
var ObjectId = require("mongoose").Types.ObjectId;

router.get("/getAll", (req, res, next) => {
    BookBuy.find()
        .exec()
        .then((books) => {
            res.status(200).json(books);
        })
        .catch((err) => {
            res.status(500).json({
                error: err,
            });
        });
});

router.post('/create', async(req,res,next) => {

    User.findOne({ _id: req.body.uid })
        .exec()
        .then((users) => { 
            if(users) {
                const bookbuy = new BookBuy({
                    _id: mongoose.Types.ObjectId(),
                    uid: req.body.uid,
                    date: Date.now(),
                    school: req.body.school,
                    board: req.body.board,
                    class: req.body.class,
                    address: req.body.address
                })
                
                bookbuy.save()
                .then(result => {
                    res.status(200).json({
                        message: "DONE"
                    })
                })
                .catch(err => {
                    res.status(500).json({
                        message: "ERROR"
                    })
                })
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({
                error:  err,
            });
        });
});

router.post('/delete', async(req,res,next) => {
    const currentDate = new Date();

    BookBuy.findOne({ _id: req.body._id })
        .exec()
        .then((book) => { 
            book.remove()
            .then(result => {
                res.status(200).json({
                    message: "REMOVED"
                })
            })
            .catch(err => {
                res.status(500).json({
                    message: "ERROR"
                })
            })
        })
        .catch((err) => {
            res.status(500).json({
                error: err,
            });
        });
});

module.exports = router;


// -> Books Buy/Sell
// Bbid, uid, date, school, board, class, address, type(buy,sell), done(true/false)

// _id: {type: mongoose.Schema.Types.ObjectId, required: true},
// uid: {type: mongoose.Schema.Types.ObjectId, required: true},
// date: {type: Date},
// school: {type: String},
// board: {type: String},
// class: {type: String},
// address: {type: String}
