const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Credit = require("../models/credit");
const PaylaterRequest = require("../models/paylaterrequest");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
var ObjectId = require("mongoose").Types.ObjectId;
const { updateCreditScore } = require('./utils');


router.get("/getAll", (req, res, next) => {
    Credit.find()
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


router.get("/testChangeCreditScore/:uid", async(req, res, next) => {
    await updateCreditScore(req.params.uid, 15, "fees");
});


router.get("/getAll_PaylaterRequest", (req, res, next) => {
    PaylaterRequest.find()
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
                const credit = new Credit({
                    _id: mongoose.Types.ObjectId(),
                    uid: req.body.uid,  
                    creditScore: 20,
                    creditScoreData: [],
                    creditMoney: 0,
                    activated: false    
                })
                
                credit.save()
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


router.post('/getCreditOfUser', async (req, res, next) => {
    User.find({ _id: req.body.uid })
        .exec()
        .then((user) => {
            if (user.length === 0) {
                res.status(500).json({
                    message: "NO USER FOUND"
                })
            }
            else {
                Credit.find({ uid: req.body.uid })
                    .exec()
                    .then((credit) => {
                        console.log(credit);
                        let creditScore = 0, creditMoney = 0, activated = false;
                        if (credit.length != 0) {
                            creditScore = credit[0]["creditScore"];
                            creditMoney = credit[0]["creditMoney"];
                            activated = credit[0]["activated"];
                        }
                        let obj = {};
                        obj["creditScore"] = creditScore;
                        obj["creditMoney"] = creditMoney;
                        obj["activated"] = activated;
                        res.status(200).json(obj);

                    })
                    .catch((err) => {
                        res.status(500).json({
                            error: err
                        });
                    });
            }
        })
        .catch((err) => {
            res.status(500).json({
                error: err
            });
        });
});

router.post('/delete', async (req, res, next) => {
    const currentDate = new Date();

    Credit.findOne({ _id: req.body._id })
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

// Paylater Request
router.post("/paylaterrequest", (req, res, next) => {
    User.findOne({ _id: req.body.uid })
        .exec()
        .then((user) => {
            if (user.length === 0) {
                res.status(500).json({
                    message: "NO USER FOUND"
                })
            }
            else {
                const paylaterrequest = new PaylaterRequest({
                    _id: mongoose.Types.ObjectId(),
                    uid: req.body.uid,
                    date: Date.now(),
                    amt: req.body.amt,
                    status: "pending"
                })

                paylaterrequest.save()
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
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
})


// get paylaterrequest data
router.post("/getpaylaterrequestdata", (req, res, next) => {
    PaylaterRequest.find({ uid: req.body.uid })
    .exec()
    .then((data) => {
        if(data.length === 0 ) {
            res.status(500).json({
                message: "Data Not Found"
            })
        }
        else {
            res.status(200).json(data)
        }
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    })
});


router.put('/updateCredit/:id', (req, res, next) => {
    Credit.update({_id:req.params.id}, { $set: { creditScore: 20 } })
      .exec()
      .then(result => {
        res.status(200).json({
          message: "UPDATED"
        });
      })
      .catch(err => {
        res.status(500).json({
          message: "ERROR"
        });
      });
  })
  

module.exports = router;