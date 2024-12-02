const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Canteen = require("../models/canteen");
const CollectHomeRequestFees = require("../models/collectHomeRequestFees");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
var ObjectId = require("mongoose").Types.ObjectId;
const authenticateToken = require('./authenticateToken');
const { updateCreditScore, updateOffers, expiredUpdateOffer, checkOfferExist } = require('./utils');
const UserDiscount = require("../models/userDiscount");


// functions


router.get("/getAll", async (req, res, next) => {

    Canteen.find()
        .exec()
        .then((users) => {
            res.status(200).json(users);
        })
        .catch((err) => {
            res.status(500).json({
                error: err,
            });
        });
});

router.post('/create', async (req, res, next) => {
    // if (req.tokenUid === req.body.uid) {
        User.find({ _id: req.body.uid })
            .exec()
            .then(user => {
                if (user.length === 0) {
                    res.status(500).json({
                        message: "NO USER FOUND"
                    });
                }
                else {
                    const canteen = new Canteen({
                        _id: mongoose.Types.ObjectId(),
                        uid: req.body.uid,
                        fid: req.body.fid,
                        childName: req.body.childName,
                        schoolName: req.body.schoolName,
                        class: req.body.class,
                        rollNo: req.body.rollNo,
                        canteenFeesPaymentStatus: [],
                        open: true
                    });

                    canteen.save()
                        .then(result => {
                            console.log("result = ", result);

                            res.status(200).json({
                                cid: result._id,
                                message: "DONE"
                            });
                        })
                        .catch(err => {
                            res.status(500).json({
                                message: "ERROR 3"
                            })
                        });
                }
            })
            .catch(err => {
                res.status(500).json({
                    message: "ERROR"
                });
            });
    // }
    // else {
    //     res.status(500).json({
    //         message: "NO AUTH",
    //     });
    // }
});



module.exports = router;