const express = require("express");
const router = express.Router();
const FeesCard = require("../models/feesCard");
const mongoose = require("mongoose");
const SavingsCard = require("../models/savingsCard");
const SavingsHistory = require("../models/savingsHistory");
// const User = require("../models/user");
// const Fees = require("../models/fees");
// const Savings = require("../models/savings");
// const SavingsMain = require("../models/savingsMain");
// const Credit = require("../models/credit");
// const jwt = require("jsonwebtoken");
// const ExplainHomeRequest = require("../models/explainHomeRequest");
// var ObjectId = require("mongoose").Types.ObjectId;
// const authenticateToken = require('./authenticateToken');
// const bcrypt = require("bcrypt");


// FeesCards apis

router.post("/createFeesCard", (req, res, next) => {
    const date = new Date(req.body.date);
    // console.log(" date = ", date);
    // console.log(" date 2  = ", date.toDateString());

    const feesCard = new FeesCard({
        _id: mongoose.Types.ObjectId(),
        cardNo: req.body.cardNo,
        city: req.body.city,
        schoolName: req.body.schoolName,
        studentName: req.body.studentName,
        std: req.body.std,
        grNo: req.body.grNo,
        date: date,
        mobileNumber: req.body.mobileNumber,
        paidToSchool: req.body.paidToSchool,
        totalToPay: req.body.totalToPay,
        totolFees: req.body.totolFees,
        feesStructure: req.body.feesStructure
    })

    feesCard.save()
        .then(result => {
            res.status(200).json({
                message: "DONE"
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
})

router.post("/deleteFeesCard", (req, res, next) => {
    FeesCard.deleteOne({ _id: req.body.cid })
        .exec()
        .then(result => {
            res.status(200).json({
                message: "Delete SuccessFully"
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
})


router.get("/getAllFeesCard", (req, res, next) => {
    FeesCard.find()
        .exec()
        .then(cards => {
            if (cards.length === 0) {
                res.status(200).json({
                    message: "No Fees Cards"
                })
            }
            else {
                res.status(200).json({
                    data: cards
                })
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
})








// SavingsCard apis

router.post("/createSavingsCard", (req, res, next) => {
    const date = new Date(req.body.date);
    // console.log(" date = ", date);
    // console.log(" date 2  = ", date.toDateString());

    const savingsCard = new SavingsCard({
        _id: mongoose.Types.ObjectId(),
        cardNo: req.body.cardNo,
        city: req.body.city,
        schoolName: req.body.schoolName,
        studentName: req.body.studentName,
        std: req.body.std,
        grNo: req.body.grNo,
        date: date,
        mobileNumber: req.body.mobileNumber,
        totalSavedAmt: 0,
        savingsHistory: [],
    })

    savingsCard.save()
        .then(result => {
            res.status(200).json({
                message: "DONE"
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
})

router.post("/updateSavingsCardHistory", (req, res, next) => {
    const date = new Date(req.body.date);

    SavingsCard.findOne({ _id: req.body.sid })
        .exec()
        .then(card => {

            const savingsHistory = new SavingsHistory({
                _id: mongoose.Types.ObjectId(),
                month: req.body.month,
                date: date,
                amt: req.body.amt,
                mode: req.body.mode
            })

            console.log("Card = ", card["savingsHistory"]);

            const savingsHistoryArray = card["savingsHistory"]
            
            if(savingsHistoryArray.length === 0) {
                savingsHistoryArray.push(savingsHistory);
            }
            else {
                savingsHistoryArray.unshift(savingsHistory);
            }

            SavingsCard.updateOne({ _id: req.body.sid }, { $set : { savingsHistory: savingsHistoryArray, totalSavedAmt: card["totalSavedAmt"] + req.body.amt}})
            .exec()
            .then(result => {
                res.status(200).json({
                    message: "Done"
                })
            })
            .catch(err => {
                res.status(500).json({
                    error: err
                })
            })

        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
})


router.post("/deleteSavingsCard", (req, res, next) => {
    SavingsCard.deleteOne({ _id: req.body.sid })
        .exec()
        .then(result => {
            res.status(200).json({
                message: "Delete SuccessFully"
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
})


router.get("/getAllSavingsCard", (req, res, next) => {
    SavingsCard.find()
        .exec()
        .then(cards => {
            if (cards.length === 0) {
                res.status(200).json({
                    message: "No Savings Cards"
                })
            }
            else {
                res.status(200).json({
                    data: cards
                })
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
})







module.exports = router;