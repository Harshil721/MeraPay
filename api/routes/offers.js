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

// FeesCards apis

router.post('/createOffer', (req, res, next) => {
    // console.log(" Create Api = ", req.body);

    const offer = new Offers({
        _id: mongoose.Types.ObjectId(),
        schoolName: req.body.schoolName,
        offer: req.body.offer,
        totalOffers: req.body.totalOffers,
        leftOffers: req.body.leftOffers,
        month: req.body.month,
        year: req.body.year
    })

    offer.save()
        .then(result => {
            // console.log(" result = ", result);

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

router.post("/updateOffer", async (req, res, next) => {
    await updateOffers(req.body.fid, req.body.uid, req.body.discount);
})

router.post("/deleteOffer", (req, res, next) => {
    Offers.deleteOne({ _id: req.body.oid })
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


router.get("/getAllOffers", (req, res, next) => {
    Offers.find()
        .exec()
        .then(offers => {
            if (offers.length === 0) {
                res.status(200).json({
                    message: "No Offers"
                })
            }
            else {
                res.status(200).json({
                    data: offers
                })
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
})

// not used in app, have to change in offers.findOne condition
router.post('/getOffersBySchoolName', (req, res, next) => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const currentDate = new Date();

    Offers.findOne({ schoolName: req.body.schoolName, month: months[currentDate.getMonth()], year: currentDate.getFullYear() })
        .exec()
        .then(result => {
            if (result.length === 0) {
                res.status(200).json({
                    message: "No Offers"
                })
            }
            else {
                res.status(200).json({
                    data: result
                })
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
})

router.post("/getFeesStrucutureAndOffers", async (req, res, next) => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const currentDate = new Date();

    let feesStructure = {}, offers = {};

    const [fs, offer] = await Promise.all([

        FeesStructure.find({ schoolName: req.body.schoolName })
            .exec()
            .then((result) => {
                // const feesStructure = result[0].feesStructure[req.body.std];


                feesStructure = result[0].feesStructure[req.body.std];
                console.log(" Fees Structure = ", feesStructure);

                // res.status(200).json({
                //     feesStructure: feesStructure
                // })
            })
            .catch(err => {
                console.log(" Error = ", err);
                // res.status(500).json({
                //     error: err
                // })
            }),

        Offers.find({ month: months[currentDate.getMonth()], year: currentDate.getFullYear() })
            .exec()
            .then(offer => {
                // console.log("totalOffer = ", totalOffer);

                if (offer) {
                    // let flag = false;

                    for (let j = 0; j < offer.length; j++) {
                        let school = offer[j].schoolName;

                        // offer found
                        if (school.includes(req.body.schoolName)) {
                            console.log(" j === ", j, " school ======= ", req.body.schoolName);
                            console.log(" offer = ", offer[j]["offer"]);

                            offers = offer[j]["offer"];
                            break;
                        }
                    }
                }
            })
            .catch(err => {
                console.log(' error = ', err);
                res.status(500).json({
                    error: "1 == ", err
                })
            })

    ])

    res.status(200).json({
        feesStructure: feesStructure,
        offers: offers
    })


})





// discount
router.get("/getAllUserDiscount", (req, res, next) => {
    // UserDiscount.find({ uid: "62b68c94efe28a00049b4e02" })
    UserDiscount.find()
        .exec()
        .then(data => {
            if (data.length === 0) {
                res.status(200).json({
                    message: "No Data"
                })
            }
            else {
                console.log(" length = ", data.length);
                res.status(200).json({
                    data: data
                })
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
})

router.post("/admin-deleteUserDiscount", (req, res, next) => {
    // console.log(" body = ", req.body);

    UserDiscount.deleteOne({ _id: req.body.udid })
        .exec()
        .then(result => {
            // console.log(" result = ", result);

            res.status(200).json({
                message: "Delete Successfully"
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
})


router.post("/admin-getFalsePayToSchoolUserDiscount", (req, res, next) => {
    let allData = [];

    let schoolName = [];

    if (req.body.schoolName === "Roosevelt/Kidzaniaa School (English / Gujarati)") {
        schoolName = ["Roosevelt School (English)", "Roosevelt School (Gujarati)", "Kidzaniaa School (English)", "Kidzaniaa School (Gujarati)"]
    }
    else {
        schoolName = [req.body.schoolName];
    }

    UserDiscount.find({ method: "payAtSchool", paidToSchool: false, discount: { $gte: 0 } })
        .exec()
        .then(async (data) => {
            if (data.length === 0) {
                res.status(200).json({
                    message: "No Data"
                })
            }
            else {
                // console.log(" Data = ", data);

                for (let i = 0; i < data.length; i++) {

                    await CollectHomeRequestFees.findOne({ _id: data[i].cpid, status: "done" })
                        .exec()
                        .then(async (request) => {
                            if (request) {

                                await Fees.findOne({ _id: data[i].fid })
                                    .exec()
                                    .then(fees => {
                                        if (fees && schoolName.includes(fees.schoolName)) {
                                            allData.push({
                                                data: data[i],
                                                feesData: {
                                                    childName: fees.childName,
                                                    schoolName: fees.schoolName,
                                                    std: fees.class
                                                }
                                            })
                                        }
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

                }

                console.log(" length = ", allData.length);

                res.status(200).json({
                    allData: allData
                })
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
})


router.post('/admin-setPayToSchoolTrue', (req, res, next) => {

    User.find({ _id: req.body.uid })
        .exec()
        .then(user => {
            // console.log(user);
            if (user.length === 0) {
                res.status(500).json({
                    message: "NO USER FOUND"
                });
            }
            else {
                UserDiscount.find({ _id: req.body.udid })
                    .exec()
                    .then(discount => {
                        if (discount.length === 0) {
                            res.status(500).json({
                                meesage: "No Discount Data"
                            })
                        }
                        else {
                            UserDiscount.update({ _id: req.body.udid }, { $set: { paidToSchool: true } })
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
                        }
                    })
                    .catch(err => {
                        res.status(200).json({
                            error: err
                        })
                    })
            }
        })
        .catch(err => {
            res.status(500).json({
                message: "ERROR"
            });
        });

})



router.get("/admin-getPaidToSchoolTrue", (req, res, next) => {
    UserDiscount.find({ paidToSchool: true })
        .exec()
        .then(result => {
            res.status(200).json({
                data: result
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
})


router.post("/admin-getBookedOfferByDate", (req, res, next) => {
    console.log("date = ", req.body.fromDate);
    let data = [];

    // if(req.body.schoolName)

    // date wise data and check status pending
    CollectHomeRequestFees.find({ address: "PayAtSchool", status: "pending", date: { $gte: new Date(req.body.fromDate) } })
        .sort('-date')
        .exec()
        .then(async (result) => {

            console.log("Data = ", result);
            for (let i = 0; i < result.length; i++) {

                // check expired or not
                const currentDate = new Date();
                const date = new Date(result[i].date);

                let diff = currentDate.getTime() - date.getTime();
                let dateDiff = Math.floor(diff / (1000 * 60 * 60));

                console.log(" date = ", dateDiff);

                if (dateDiff < 48) {
                    let discount = 0;

                    // get discount
                    await UserDiscount.findOne({ cpid: result[i]._id, fid: result[i].fid, uid: result[i].uid })
                        .exec()
                        .then(discountData => {
                            if (discountData) {
                                discount = discountData.discount;
                            }
                        })
                        .catch(err => {
                            res.status(500).json({
                                error: err
                            })
                        })

                        // get student data from fees table
                    await Fees.findOne({ _id: result[i].fid })
                        .exec()
                        .then(async (fees) => {
                            if (fees) {

                                //get phone number
                                await User.findOne({ _id: result[i].uid })
                                    .exec()
                                    .then(user => {
                                        if (user) {
                                            data.push({
                                                schoolName: fees.schoolName,
                                                childName: fees.childName,
                                                std: fees.class,
                                                date: new Date(result[i].date).toLocaleString(),
                                                discount: discount,
                                                totalFeesAmt: result[i].amt,
                                                status: result[i].status,
                                                phone: user.phone
                                            })
                                        }
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

                }

            }
            console.log(" length = ", data.length);

            res.status(200).json({
                data: data
            })
        })
        .catch(err => {
            console.log(" error = ", err);
            res.status(500).json({
                error: err
            })
        })
})


module.exports = router;