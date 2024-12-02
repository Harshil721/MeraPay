const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Offers = require("../models/offers");
const FeesStructure = require("../models/feesStructure");
const UserDiscount = require("../models/userDiscount");
const { updateOffers } = require('./utils');
const CollectHomeRequestFees = require("../models/collectHomeRequestFees");
const Fees = require("../models/fees");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const SchoolLogin = require("../models/schoolLogin");
const bcrypt = require("bcrypt");

router.post("/create", (req, res, next) => {
    bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
            return res.status(500).json({
                message: "Try Again!",
            });
        } else {
            const schoolLogin = new SchoolLogin({
                _id: mongoose.Types.ObjectId(),
                schoolName: req.body.schoolName,
                password: hash,
                dateRegistered: Date.now()
            });

            schoolLogin.save()
                .then(result => {
                    console.log("Result = ", result);

                    res.status(200).json({
                        message: "School Added"
                    })
                })
                .catch(err => {
                    console.log(" Error = ", err);

                    res.status(500).json({
                        messgae: "Error Occur"
                    })
                })
        }
    });
})

router.post("/loginSchoolWithPassword", (req, res, next) => {
    SchoolLogin.find({ schoolName: req.body.schoolName })
        .exec()
        .then((result) => {
            if (result.length >= 1) {
                if (req.body.password !== "") {
                    console.log("HERE");
                    bcrypt.compare(req.body.password, result[0].password, (err, result2) => {
                        if (err) {
                            return res.status(500).json({
                                message: "Try Again",
                            });
                        }

                        if (result2) {
                            console.log("HERE");
                            const token = jwt.sign(
                                {
                                    id: result[0]["_id"],
                                },
                                "key@merape.Merape"
                            );

                            res.status(200).json({
                                schoolId: result[0]["_id"],
                                schoolName: result[0]["schoolName"],
                                token: token
                            });
                        }
                        else {
                            res.status(500).json({
                                message: "INVALID PASSWORD",
                            });
                        }
                    });
                } else {
                    res.status(500).json({
                        message: "INVALID PASSWORD",
                    });
                }
            } else {
                res.status(500).json({
                    message: "Try Again!"
                });
            }
        })
        .catch((err) => {
            res.status(500).json({
                message: "ERROR",
            });
        });
})


router.get("/getAllSchool", (req, res, next) => {
    SchoolLogin.find()
        .exec()
        .then((schools) => {
            res.status(200).json(schools);
        })
        .catch((err) => {
            res.status(500).json({
                error: err,
            });
        });
});


router.get('/deleteById/:id', (req, res, next) => {
    SchoolLogin.remove({ _id: req.params.id })
        .exec()
        .then(result => {
            res.status(200).json({
                message: "DELETED"
            });
        })
        .catch(err => {
            res.status(500).json({
                message: "ERROR"
            });
        });
})

router.get("/getSchoolsArray", (req, res, next) => {
    SchoolLogin.find()
        .exec()
        .then((result) => {
            console.log(" Schools = ", result);
            let schools = [];

            for (let i = 0; i < result.length; i++) {
                schools.push(result[i].schoolName)
            }

            res.status(200).json({
                schools: schools
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
})

module.exports = router;