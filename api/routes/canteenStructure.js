const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const CanteenStructure = require("../models/canteenStructure");
const User = require("../models/user");



router.get("/getAll", (req, res, next) => {
    CanteenStructure.find()
        .exec()
        .then((savings) => {
            res.status(200).json(savings);
        })
        .catch((err) => {
            res.status(500).json({
                error: err,
            });
        });
});

router.post("/getCanteenFeesPerMonth", (req, res, next) => {
    User.findOne({ _id: req.body.uid })
        .exec()
        .then((user) => {
            if (user.length === 0) {
                res.status(500).json({
                    message: "User Not Found"
                })
            }
            else {
                CanteenStructure.find({ schoolName: req.body.schoolName })
                    .exec()
                    .then((result) => {
                        const canteenFees = result[0].canteenStructure[req.body.std][req.body.month];
                        // const fees = feesStructure[req.body.month];

                        res.status(200).json({
                            canteenFees: canteenFees
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

router.post("/getCanteenStrucuture", (req, res, next) => {
    CanteenStructure.find({ schoolName: req.body.schoolName })
        .exec()
        .then((result) => {
            console.log("result = ", result);
            const canteenStructure = result[0].canteenStructure[req.body.std];

            res.status(200).json({
                canteenStructure: canteenStructure
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
})

router.post("/admin-deteleCanteenStructure", (req, res, next) => {
    CanteenStructure.deleteOne({ _id: req.body.sid })
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


module.exports = router;


// {
//     "schoolName": "Kidzaniaa School (English)",
//     "canteenStructure": {
//         "1": {
//             "June": 500,
//             "July": 500,
//             "August": 500,
//             "September": 500,
//             "October": 500,
//             "November": 500,
//             "December": 500,
//             "January": 500,
//             "February": 500,
//             "March": 500,
//             "April": 500,
//             "May": 500,
//             "Total": 6000
//         },
//         "2": {
//             "June": 500,
//             "July": 500,
//             "August": 500,
//             "September": 500,
//             "October": 500,
//             "November": 500,
//             "December": 500,
//             "January": 500,
//             "February": 500,
//             "March": 500,
//             "April": 500,
//             "May": 500,
//             "Total": 6000
//         },
//         "3": {
//             "June": 500,
//             "July": 500,
//             "August": 500,
//             "September": 500,
//             "October": 500,
//             "November": 500,
//             "December": 500,
//             "January": 500,
//             "February": 500,
//             "March": 500,
//             "April": 500,
//             "May": 500,
//             "Total": 6000
//         },
//         "4": {
//             "June": 500,
//             "July": 500,
//             "August": 500,
//             "September": 500,
//             "October": 500,
//             "November": 500,
//             "December": 500,
//             "January": 500,
//             "February": 500,
//             "March": 500,
//             "April": 500,
//             "May": 500,
//             "Total": 6000
//         },
//         "5": {
//             "June": 500,
//             "July": 500,
//             "August": 500,
//             "September": 500,
//             "October": 500,
//             "November": 500,
//             "December": 500,
//             "January": 500,
//             "February": 500,
//             "March": 500,
//             "April": 500,
//             "May": 500,
//             "Total": 6000
//         },
//         "6": {
//             "June": 600,
//             "July": 600,
//             "August": 600,
//             "September": 600,
//             "October": 600,
//             "November": 600,
//             "December": 600,
//             "January": 600,
//             "February": 600,
//             "March": 600,
//             "April": 600,
//             "May": 600,
//             "Total": 7200
//         },
//         "7": {
//             "June": 600,
//             "July": 600,
//             "August": 600,
//             "September": 600,
//             "October": 600,
//             "November": 600,
//             "December": 600,
//             "January": 600,
//             "February": 600,
//             "March": 600,
//             "April": 600,
//             "May": 600,
//             "Total": 7200
//         },
//         "8": {
//             "June": 600,
//             "July": 600,
//             "August": 600,
//             "September": 600,
//             "October": 600,
//             "November": 600,
//             "December": 600,
//             "January": 600,
//             "February": 600,
//             "March": 600,
//             "April": 600,
//             "May": 600,
//             "Total": 7200
//         },
//         "Jr KG": {
//             "June": 400,
//             "July": 400,
//             "August": 400,
//             "September": 400,
//             "October": 400,
//             "November": 400,
//             "December": 400,
//             "January": 400,
//             "February": 400,
//             "March": 400,
//             "April": 400,
//             "May": 400,
//             "Total": 4800
//         },
//         "Sr KG": {
//             "June": 400,
//             "July": 400,
//             "August": 400,
//             "September": 400,
//             "October": 400,
//             "November": 400,
//             "December": 400,
//             "January": 400,
//             "February": 400,
//             "March": 400,
//             "April": 400,
//             "May": 400,
//             "Total": 4800
//         }
//     }
// }