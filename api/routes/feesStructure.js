const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const feesStructure = require("../models/feesStructure");

const FeesStructure = require("../models/feesStructure");
const User = require("../models/user");




router.get("/getAll", (req, res, next) => {
    FeesStructure.find()
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


router.post("/getFeesPerMonth", (req, res, next) => {
    User.findOne({ _id: req.body.uid })
        .exec()
        .then((user) => {
            if (user.length === 0) {
                res.status(500).json({
                    message: "User Not Found"
                })
            }
            else {
                FeesStructure.find({ schoolName: req.body.schoolName })
                    .exec()
                    .then((result) => {
                        const fees = result[0].feesStructure[req.body.std][req.body.month];
                        // const fees = feesStructure[req.body.month];

                        res.status(200).json({
                            fees: fees
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

router.post("/getFeesStrucuture", (req, res, next) => {
    FeesStructure.find({ schoolName: req.body.schoolName })
        .exec()
        .then((result) => {
            const feesStructure = result[0].feesStructure[req.body.std];

            res.status(200).json({
                feesStructure: feesStructure
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
})

router.post("/admin-deteleFeesStructure", (req, res, next) => {
    FeesStructure.deleteOne({ _id: req.body.sid })
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

router.get("/getSchoolsAndStdsArray", (req, res, next) => {
    FeesStructure.find()
        .exec()
        .then((feesStructure) => {
            let schools = [];
            let schoolsWiseStds = {};

            for (let i = 0; i < feesStructure.length; i++) {
                schools.push(feesStructure[i].schoolName)
                let stdArr = [];
                for (var key in feesStructure[i]["feesStructure"]) {
                    if (feesStructure[i]["feesStructure"].hasOwnProperty(key)) {
                        // console.log(key + " -> " + JSON.stringify(feesStructure[i]["feesStructure"][key]));
                        stdArr.push(key);
                    }
                }
                schoolsWiseStds[feesStructure[i].schoolName] = stdArr;
            }

            console.log("Schools = ", schoolsWiseStds);

            // for (let i = 0; i < schools.length; i++) {
            //     schoolsWiseStds.push({
            //         schools[i] : Object.keys(feesStructure[i].feesStructure)
            //     })
            // }

            res.status(200).json({
                schools: schools,
                schoolsWiseStds: schoolsWiseStds
                // stds: stds
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
})


router.get("/admin-getAllFeesStructure", (req, res, next) => {
    FeesStructure.find()
        .exec()
        .then((feesStructure) => {
            res.status(200).json(feesStructure);
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
})

router.post("/admin-createFeesStructure", (req, res, next) => {
    // FeesStructure.find({ _id: req.body._id })
    //     .exec()
    //     .then((feesStructure) => {
    //         if (feesStructure.length === 0) {
    const newFS = new FeesStructure({
        _id: mongoose.Types.ObjectId(),
        schoolName: req.body.schoolName,
        feesStructure: req.body.feesStructure
    })  

    newFS.save()
        .then(result => {
            res.status(200).json({
                message: "Fees Structure created successfully"
            })
        })
        .catch(err => {
            console.log("error = ", err);
            res.status(500).json({
                error: err
            })
        })
    // }
    // })
    // .catch(err => {
    //     res.status(500).json({
    //         error: err
    //     })
    // })
});


module.exports = router;




// "schoolName": "Holy Mother English School",
//         "feesStructure": {
//             "Nursery": {
//                 "June": 700,
//                 "July": 350,
//                 "August": 350,
//                 "September": 350,
//                 "October": 350,
//                 "November": 700,
//                 "December": 350,
//                 "January": 350,
//                 "February": 350,
//                 "March": 350,
//                 "April": 350,
//                 "May": 350,
//                 "Total": 4900
//             },
//             "Jr KG": {
//                 "June": 750,
//                 "July": 375,
//                 "August": 375,
//                 "September": 375,
//                 "October": 375,
//                 "November": 750,
//                 "December": 375,
//                 "January": 375,
//                 "February": 375,
//                 "March": 375,
//                 "April": 375,
//                 "May": 375,
//                 "Total": 5250
//             },
//             "Sr KG": {
//                 "June": 750,
//                 "July": 375,
//                 "August": 375,
//                 "September": 375,
//                 "October": 375,
//                 "November": 750,
//                 "December": 375,
//                 "January": 375,
//                 "February": 375,
//                 "March": 375,
//                 "April": 375,
//                 "May": 375,
//                 "Total": 5250
//             },
//             "1": {
//                 "June": 800,
//                 "July": 400,
//                 "August": 400,
//                 "September": 400,
//                 "October": 400,
//                 "November": 800,
//                 "December": 400,
//                 "January": 400,
//                 "February": 400,
//                 "March": 400,
//                 "April": 400,
//                 "May": 400,
//                 "Total": 5600
//             },
//             "2": {
//                 "June": 800,
//                 "July": 400,
//                 "August": 400,
//                 "September": 400,
//                 "October": 400,
//                 "November": 800,
//                 "December": 400,
//                 "January": 400,
//                 "February": 400,
//                 "March": 400,
//                 "April": 400,
//                 "May": 400,
//                 "Total": 5600
//             },
//             "3": {
//                 "June": 800,
//                 "July": 400,
//                 "August": 400,
//                 "September": 400,
//                 "October": 400,
//                 "November": 800,
//                 "December": 400,
//                 "January": 400,
//                 "February": 400,
//                 "March": 400,
//                 "April": 400,
//                 "May": 400,
//                 "Total": 5600
//             },
//             "4": {
//                 "June": 800,
//                 "July": 400,
//                 "August": 400,
//                 "September": 400,
//                 "October": 400,
//                 "November": 800,
//                 "December": 400,
//                 "January": 400,
//                 "February": 400,
//                 "March": 400,
//                 "April": 400,
//                 "May": 400,
//                 "Total": 5600
//             },
//             "5": {
//                 "June": 900,
//                 "July": 450,
//                 "August": 450,
//                 "September": 450,
//                 "October": 450,
//                 "November": 900,
//                 "December": 450,
//                 "January": 450,
//                 "February": 450,
//                 "March": 450,
//                 "April": 450,
//                 "May": 450,
//                 "Total": 6300
//             },
//             "6": {
//                 "June": 900,
//                 "July": 450,
//                 "August": 450,
//                 "September": 450,
//                 "October": 450,
//                 "November": 900,
//                 "December": 450,
//                 "January": 450,
//                 "February": 450,
//                 "March": 450,
//                 "April": 450,
//                 "May": 450,
//                 "Total": 6300
//             },
//             "7": {
//                 "June": 900,
//                 "July": 450,
//                 "August": 450,
//                 "September": 450,
//                 "October": 450,
//                 "November": 900,
//                 "December": 450,
//                 "January": 450,
//                 "February": 450,
//                 "March": 450,
//                 "April": 450,
//                 "May": 450,
//                 "Total": 6300
//             },
//             "8": {
//                 "June": 1000,
//                 "July": 500,
//                 "August": 500,
//                 "September": 500,
//                 "October": 500,
//                 "November": 1000,
//                 "December": 500,
//                 "January": 500,
//                 "February": 500,
//                 "March": 500,
//                 "April": 500,
//                 "May": 500,
//                 "Total": 7000
//             },
//             "9": {
//                 "June": 1100,
//                 "July": 550,
//                 "August": 550,
//                 "September": 550,
//                 "October": 550,
//                 "November": 1100,
//                 "December": 550,
//                 "January": 550,
//                 "February": 550,
//                 "March": 550,
//                 "April": 550,
//                 "May": 550,
//                 "Total": 7700
//             },
//             "10": {
//                 "June": 1200,
//                 "July": 600,
//                 "August": 600,
//                 "September": 600,
//                 "October": 600,
//                 "November": 1200,
//                 "December": 600,
//                 "January": 600,
//                 "February": 600,
//                 "March": 600,
//                 "April": 600,
//                 "May": 600,
//                 "Total": 8400
//             }
//         }