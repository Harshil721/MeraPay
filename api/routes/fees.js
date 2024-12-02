const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Fees = require("../models/fees");
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

    Fees.find()
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

router.get("/getAll_CollectRequestFees", (req, res, next) => {
    CollectHomeRequestFees.find()
        .exec()
        .then((fees) => {
            res.status(200).json(fees);
        })
        .catch((err) => {
            res.status(500).json({
                error: err,
            });
        });
});

router.post("/admin-getAll_PaidFeesByMonthAndSchool", (req, res, next) => {
    let data = [];

    let schoolName = []; // = ["Holy Mother English School"];

    if (req.body.schoolName === "Roosevelt/Kidzaniaa School (English / Gujarati)") {
        schoolName = ["Roosevelt School (English)", "Roosevelt School (Gujarati)", "Kidzaniaa School (English)", "Kidzaniaa School (Gujarati)"]
    }
    else {
        schoolName = [req.body.schoolName];
    }

    // Fees.find({ schoolName: req.body.schoolName })
    Fees.find({ schoolName: { $in: schoolName } })
        .exec()
        .then(fees => {

            // check individual fees
            for (let i = 0; i < fees.length; i++) {

                // check feesPaymentStatus data 
                for (let j = 0; j < fees[i].feesPaymentStatus.length; j++) {

                    // check month and discount
                    if (fees[i].feesPaymentStatus[j].month === req.body.month && fees[i].feesPaymentStatus[j].discount !== undefined && fees[i].feesPaymentStatus[j].discount !== null) {
                        data.push({
                            childName: fees[i].childName,
                            schoolName: fees[i].schoolName,
                            std: fees[i].class,
                            totalFeesAmt: fees[i].feesPaymentStatus[j].amt, // fees amt(discount minus karke)
                            discount: fees[i].feesPaymentStatus[j].discount,
                            method: fees[i].feesPaymentStatus[j].method,
                            date: new Date(fees[i].feesPaymentStatus[j].date).toLocaleString()
                            // month: fees[i].feesPaymentStatus[j].month,
                        })
                        console.log(" FeesStructure = [", j, "] = ", fees[i].feesPaymentStatus[j]);
                        break;
                    }

                }
            }

            res.status(200).json({
                data: data
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
});

router.post("/admin-getAll_PaidFeesByDate", (req, res, next) => {
    let onlineData = [], offlineData = [];

    // let schoolName = ["Holy Mother English School"];

    // if (req.body.schoolName === "Roosevelt/Kidzaniaa School (English / Gujarati)") {
    //     schoolName = ["Roosevelt School (English)", "Roosevelt School (Gujarati)", "Kidzaniaa School (English)", "Kidzaniaa School (Gujarati)"]
    // }
    // else {
    //     schoolName = [req.body.schoolName];
    // }

    // Fees.find({ schoolName: req.body.schoolName })
    Fees.find()

        .exec()
        .then(async (fees) => {

            // check individual fees
            for (let i = 0; i < fees.length; i++) {

                // check feesPaymentStatus data
                for (let j = 0; j < fees[i].feesPaymentStatus.length; j++) {

                    let date = new Date(fees[i].feesPaymentStatus[j].date);
                    let checkDate = new Date(req.body.date);
                    console.log(" CheckDate1 =========== ", date.toLocaleString());
                    console.log(" CheckDate2 =========== ", checkDate.toLocaleString());

                    // check month and discount
                    if ((date.getDate() === checkDate.getDate()) && (date.getMonth() === checkDate.getMonth()) && (date.getFullYear() === checkDate.getFullYear()) && fees[i].feesPaymentStatus[j].discount !== undefined && fees[i].feesPaymentStatus[j].discount !== null) {
                        console.log(" equal or not = ", (checkDate.getDate()), ", == ", (checkDate.getMonth()), ", == ", (checkDate.getFullYear()));
                        // console.log("fees  = ", fees[i]);

                        await User.findOne({ _id: fees[i].uid })
                            .exec()
                            .then(user => {
                                if (user) {
                                    if (fees[i].feesPaymentStatus[j].method === "online") {
                                        onlineData.push({
                                            childName: fees[i].childName,
                                            schoolName: fees[i].schoolName,
                                            std: fees[i].class,
                                            totalFeesAmt: fees[i].feesPaymentStatus[j].amt, // fees amt(discount minus karke)
                                            discount: fees[i].feesPaymentStatus[j].discount,
                                            method: fees[i].feesPaymentStatus[j].method,
                                            date: new Date(fees[i].feesPaymentStatus[j].date).toLocaleString(),
                                            phone: user.phone
                                        })
                                    }
                                    else if (fees[i].feesPaymentStatus[j].method === "PayAtSchool") {
                                        offlineData.push({
                                            childName: fees[i].childName,
                                            schoolName: fees[i].schoolName,
                                            std: fees[i].class,
                                            totalFeesAmt: fees[i].feesPaymentStatus[j].amt, // fees amt(discount minus karke)
                                            discount: fees[i].feesPaymentStatus[j].discount,
                                            method: fees[i].feesPaymentStatus[j].method,
                                            date: new Date(fees[i].feesPaymentStatus[j].date).toLocaleString(),
                                            phone: user.phone
                                        })
                                    }
                                }
                            })
                            .catch(err => {
                                console.log(' error1 = ', err);
                                res.status(500).json({
                                    error: err
                                })
                            })




                        console.log(" FeesStructure = [", j, "] = ", fees[i].feesPaymentStatus[j]);
                        break;
                    }

                }
            }

            res.status(200).json({
                onlineData: onlineData,
                offlineData: offlineData
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
});

router.get("/getByUid/:uid", (req, res, next) => {
    Fees.find({ uid: req.params.uid })
        .exec()
        .then((fees) => {
            res.status(200).json(fees);
        })
        .catch((err) => {
            res.status(500).json({
                error: err,
            });
        });
});

// -> Fees
// Fid, uid, childName, schoolName, class, rollNo, feesPaymentStatus

// feesPaymentStatus
// {“6”:{“amt”:2000,”status”:”paid”,”date”:____},“8”:{“amt”:1000,”status”:”collectHomeRequest”,”address”:”fdfdfg”,”date”:____}}

// Status - paid/collectHomeRequest/due

router.post('/create', authenticateToken.authenticateToken, async (req, res, next) => {
    let fid = "", cid = "";

    if (req.tokenUid === req.body.uid) {
        User.find({ _id: req.body.uid })
            .exec()
            .then((user) => {
                if (user.length === 0) {
                    res.status(500).json({
                        message: "NO USER FOUND"
                    });
                }
                else {
                    const fees = new Fees({
                        _id: mongoose.Types.ObjectId(),
                        uid: req.body.uid,
                        childName: req.body.childName,
                        schoolName: req.body.schoolName,
                        class: req.body.class,
                        rollNo: req.body.rollNo,
                        feesPaymentStatus: [],
                        open: true
                    });

                    fees.save()
                        .then(result => {
                            console.log("result = ", result);
                            // fid = result._id;

                            // res.status(200).json({
                            //     fid: result._id,
                            //     message: "DONE"
                            // });

                            const canteen = new Canteen({
                                _id: mongoose.Types.ObjectId(),
                                uid: req.body.uid,
                                fid: result._id,
                                childName: req.body.childName,
                                schoolName: req.body.schoolName,
                                class: req.body.class,
                                rollNo: req.body.rollNo,
                                canteenFeesPaymentStatus: [],
                                open: true
                            });

                            canteen.save()
                                .then(resultCanteen => {
                                    console.log("result = ", result);

                                    // cid = result._id;
                                    // res.status(200).json({
                                    //     cid: result._id,
                                    //     message: "DONE"
                                    // });
                                    // console.log(" We are here ");
                                    res.status(200).json({
                                        fid: result._id,
                                        cid: resultCanteen._id,
                                        message: "DONE"
                                    });
                                })
                                .catch(err => {
                                    console.log(" error1 = ", err);
                                    return res.status(500).json({
                                        message: "ERROR 3"
                                    })
                                });
                        })
                        .catch(err => {
                            return res.status(500).json({
                                message: "ERROR 2"
                            })
                        });


                }
            })
            .catch(err => {
                console.log(" error2 ==== ", err);
                // return res.status(500).json({
                //     message: "ERROR"
                // });
            });
    }
    else {
        res.status(500).json({
            message: "NO AUTH",
        });
    }
});


router.post('/payFeesRequestAtAddress', authenticateToken.authenticateToken, async (req, res, next) => {
    if (req.tokenUid === req.body.uid) {
        User.find({ _id: req.body.uid })
            .exec()
            .then(user => {
                if (user.length === 0) {
                    res.status(500).json({
                        message: "NO USER FOUND"
                    });
                }
                else {
                    Fees.find({ _id: req.body.fid, uid: req.body.uid })
                        .exec()
                        .then(fees => {
                            if (fees.length === 0) {
                                res.status(500).json({
                                    message: "NO FEES PLAN FOUND"
                                })
                            }
                            else {
                                const collectHomeRequestFees = new CollectHomeRequestFees({
                                    _id: mongoose.Types.ObjectId(),
                                    fid: req.body.fid,
                                    uid: req.body.uid,
                                    month: req.body.month,
                                    amt: req.body.amt,
                                    address: req.body.address,
                                    date: Date.now(),
                                    status: "pending",
                                });

                                collectHomeRequestFees.save()
                                    .then(result => {
                                        res.status(200).json({
                                            message: "COLLECT REQUEST DONE"
                                        });
                                    })
                                    .catch(err => {
                                        res.status(500).json({
                                            message: err
                                        })
                                    });

                            }
                        })
                        .catch(err =>
                            res.status(500).json({
                                message: "ERROR 4"
                            })
                        )
                }
            })
            .catch(err => {
                res.status(500).json({
                    message: "ERROR"
                });
            });
    }
    else {
        res.status(500).json({
            message: "NO AUTH",
        });
    }
});

router.post('/payFeesRequestAtSchoolAndOffer', authenticateToken.authenticateToken, async (req, res, next) => {
    if (req.tokenUid === req.body.uid) {
        User.find({ _id: req.body.uid })
            .exec()
            .then(user => {
                if (user.length === 0) {
                    res.status(500).json({
                        message: "NO USER FOUND"
                    });
                }
                else {
                    Fees.find({ _id: req.body.fid, uid: req.body.uid })
                        .exec()
                        .then(fees => {
                            if (fees.length === 0) {
                                res.status(500).json({
                                    message: "NO FEES PLAN FOUND"
                                })
                            }
                            else {
                                checkOfferExist(req.body.fid, req.body.uid)
                                    .then(value => {

                                        if (value) {

                                            const collectHomeRequestFees = new CollectHomeRequestFees({
                                                _id: mongoose.Types.ObjectId(),
                                                fid: req.body.fid,
                                                uid: req.body.uid,
                                                month: req.body.month,
                                                amt: req.body.amt,
                                                address: req.body.address,
                                                date: Date.now(),
                                                status: "pending",
                                            });



                                            collectHomeRequestFees.save()
                                                .then(result => {

                                                    if (req.body.discount === 0) {
                                                        res.status(200).json({
                                                            message: "COLLECT REQUEST DONE"
                                                        });
                                                    }
                                                    else {

                                                        const userDiscount = new UserDiscount({
                                                            _id: mongoose.Types.ObjectId(),
                                                            uid: req.body.uid,
                                                            fid: req.body.fid,
                                                            cpid: result._id,
                                                            discount: req.body.discount,
                                                            paidToSchool: false,
                                                            method: "payAtSchool",
                                                            date: new Date(),
                                                            totalFeesAmt: req.body.amt,
                                                            offerUpdated: false
                                                        })

                                                        userDiscount.save()
                                                            .then(async (result) => {
                                                                try {
                                                                    await updateOffers(req.body.fid, req.body.uid, req.body.discount);
                                                                }
                                                                catch (e) {

                                                                }
                                                                res.status(200).json({
                                                                    message: "COLLECT REQUEST DONE"
                                                                })
                                                            })
                                                            .catch(err => {
                                                                res.status(500).json({
                                                                    message: err
                                                                })
                                                            })
                                                    }


                                                })
                                                .catch(err => {
                                                    res.status(500).json({
                                                        message: err
                                                    })
                                                });
                                        }
                                        else {
                                            res.status(200).json({
                                                message: "COLLECT REQUEST EXIST"
                                            });
                                        }
                                    })
                                    .catch(err => {
                                        console.log("error = ", err)
                                    })



                            }
                        })
                        .catch(err =>
                            res.status(500).json({
                                message: "ERROR 4"
                            })
                        )
                }
            })
            .catch(err => {
                res.status(500).json({
                    message: "ERROR"
                });
            });
    }
    else {
        res.status(500).json({
            message: "NO AUTH",
        });
    }
});


// Get All students by school
router.post('/admin-getAllStudentsBySchool', (req, res, next) => {
    let data = [];

    let schoolName = [] //["Holy Mother English School"];

    if (req.body.schoolName === "Roosevelt/Kidzaniaa School (English / Gujarati)") {
        schoolName = ["Roosevelt School (English)", "Roosevelt School (Gujarati)", "Kidzaniaa School (English)", "Kidzaniaa School (Gujarati)"]
    }
    else {
        schoolName = [req.body.schoolName];
    }

    Fees.find({ schoolName: { $in: schoolName } })
        // .exec()
        .populate({
            path: 'uid',
            select: 'phone'
        })
        .select(" childName rollNo class uid ")
        // .select(" phone ")
        // .populate("uid")
        .then((result) => {
            res.status(200).json({
                result
            })
        })
        .catch(err => {
            console.log(" Error = ", err);
            res.status(500).json({
                error: err
            })
        })
});

//Find through mobile number
router.post('/admin-getCollectMoneyDataOfUser', async (req, res, next) => {
    User.find({ phone: req.body.phone })
        .exec()
        .then(user => {
            if (user.length === 0) {
                res.status(500).json({
                    message: "NO USER FOUND"
                });
            }
            else {
                console.log(JSON.stringify(user));
                CollectHomeRequestFees.find({ uid: user[0]["_id"], status: "pending" })
                    .exec()
                    .then(data => {
                        res.status(200).json({
                            message: data
                        });
                    })
                    .catch(err => {
                        res.status(500).json({
                            message: "ERROR"
                        });
                    });
            }
        })
        .catch(err => {
            res.status(500).json({
                message: "ERROR"
            });
        });
});

router.get("/admin-getAllFeesPedingRequests", (req, res, next) => {
    CollectHomeRequestFees.find({ status: "pending" })
        .exec()
        .then(data => {
            res.status(200).json({
                data: data
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
})


router.post('/admin-moneyCollectedChangeStatus', async (req, res, next) => {
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
                CollectHomeRequestFees.find({ _id: req.body._id, fid: req.body.fid, uid: req.body.uid })
                    .exec()
                    .then(data => {
                        // console.log(data);
                        if (data.length !== 0) {
                            CollectHomeRequestFees.update({ _id: req.body._id, fid: req.body.fid, uid: req.body.uid }, { $set: { status: "done" } })
                                .exec()
                                .then(collectHomeData => {
                                    // {type:”month”,amt:250,month:”6”,date:____,method:”collectHomeRequest”}
                                    let feesData = {};
                                    feesData["amt"] = data[0]["amt"];
                                    feesData["month"] = data[0]["month"];
                                    feesData["date"] = Date.now();
                                    feesData["method"] = "collectHome";
                                    feesData["discount"] = req.body.discount

                                    Fees.find({ _id: req.body.fid, uid: req.body.uid })
                                        .exec()
                                        .then(fees => {
                                            // console.log(fees);
                                            let storedFeesPaymentStatus = fees[0]["feesPaymentStatus"];

                                            if (storedFeesPaymentStatus.length === 0) {
                                                let feesDataArray = [];
                                                feesDataArray.push(feesData);

                                                Fees.update({ _id: req.body.fid, uid: req.body.uid }, { $set: { feesPaymentStatus: feesDataArray } })
                                                    .exec()
                                                    .then(async (result) => {
                                                        await updateCreditScore(req.body.uid, 25, "savings");
                                                        res.status(200).json({
                                                            message: "DONE"
                                                        });
                                                    })
                                                    .catch(error => {
                                                        res.status(500).json({
                                                            message: "ERROR"
                                                        });
                                                    });
                                            }
                                            else {
                                                console.log("In Else part");
                                                console.log("stored data = ", storedFeesPaymentStatus);
                                                // console.log("FeesData = ", feesData);
                                                storedFeesPaymentStatus.unshift(feesData);
                                                Fees.update({ _id: req.body.fid, uid: req.body.uid }, { $set: { feesPaymentStatus: storedFeesPaymentStatus } })
                                                    .exec()
                                                    .then(async (result) => {
                                                        await updateCreditScore(req.body.uid, 25, "savings");
                                                        res.status(200).json({
                                                            message: "DONE"
                                                        });
                                                    })
                                                    .catch(error => {
                                                        // console.log("Error 1 = ", error);
                                                        res.status(500).json({
                                                            message: "ERROR"
                                                        });
                                                    });
                                            }
                                        })
                                        .catch(error => {
                                            console.log("Error 2 = ");
                                            res.status(500).json({
                                                message: "ERROR"
                                            });
                                        })
                                })
                                .catch(error => {
                                    console.log("Error 3 = ", error);
                                    res.status(500).json({
                                        message: "ERROR"
                                    });
                                });
                        }
                        else {
                            res.status(500).json({
                                message: "NO COLLECT REQUEST FOUND"
                            });
                        }
                    })
                    .catch(err => {
                        res.status(500).json({
                            message: "ERROR"
                        });
                    });
            }
        })
        .catch(err => {
            res.status(500).json({
                message: "ERROR"
            });
        });
});


// getPendingPayAtSchoolData
router.post("/admin-getPendingPayAtSchoolData", (req, res, next) => {
    let pendingRequestsData = [], feesData = [], userData = [], discountData = [], expired = [];

    const currentDate = new Date();
    // const tempDate = new Date("1970/02/01");
    // console.log("\n date time = ", tempDate.getTime());


    User.findOne({ phone: req.body.phone })
        .exec()
        .then(async (user) => {

            console.log(" user = ", user);
            const [pendingRequests] = await Promise.all([

                CollectHomeRequestFees.find({ uid: user._id, status: "pending", address: "PayAtSchool" })
                    .exec()
                    .then(async (data) => {
                        pendingRequestsData = data;

                        for (let i = 0; i < pendingRequestsData.length; i++) {

                            // console.log(" pendingRequest === ", pendingRequestsData[i].uid);

                            // expired
                            let diff = currentDate.getTime() - pendingRequestsData[i].date.getTime();
                            let dateDiff = Math.floor(diff / (1000 * 60 * 60));


                            if (dateDiff >= 48) {
                                expired.push(true)
                            }
                            else {
                                expired.push(false)
                            }
                            // console.log(" diff = ", dateDiff, ", boolean = ", expired);

                            // discount
                            await UserDiscount.findOne({ cpid: pendingRequestsData[i]._id })
                                .exec()
                                .then(userDiscount => {
                                    // console.log("userDIs == ", userDiscount);
                                    if (userDiscount) {
                                        discountData.push(userDiscount.discount)
                                    }
                                    else {
                                        discountData.push(0)
                                    }
                                })
                                .catch(err => {
                                    res.status(500).json({
                                        disError: err
                                    })
                                })

                            await Fees.findOne({ _id: pendingRequestsData[i].fid })
                                .exec()
                                .then(fees => {
                                    if (fees) {
                                        feesData.push({
                                            childName: fees.childName,
                                            schoolName: fees.schoolName,
                                            std: fees.class
                                        })
                                    }
                                })
                                .catch(err => {
                                    res.status(500).json({
                                        error: err
                                    })
                                })

                            // phone numbers
                            // await User.findOne({ _id: pendingRequestsData[i].uid })
                            //     .exec()
                            //     .then(user => {
                            //         console.log(" users === ", user.phone);

                            //         userData.push({
                            //             phone: user.phone
                            //         })
                            //     })
                            //     .catch(err => {
                            //         res.status(500).json({
                            //             userError: err
                            //         })
                            //     })
                        }
                        // userData: userData,

                        res.status(200).json({
                            pendingRequestsData: pendingRequestsData,
                            discountData: discountData,
                            expired: expired,
                            feesData: feesData
                        })
                    })
                    .catch(err => {
                        console.log(" error = ", err);
                        res.status(500).json({
                            error: err
                        })
                    })

            ])

        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })

})

// update Status of pay at school pending request
router.post('/admin-updateStatusPayAtSchool', (req, res, next) => {
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
                CollectHomeRequestFees.find({ _id: req.body._id, fid: req.body.fid, uid: req.body.uid })
                    .exec()
                    .then(data => {
                        // console.log(data);
                        if (data.length !== 0) {
                            CollectHomeRequestFees.update({ _id: req.body._id, fid: req.body.fid, uid: req.body.uid }, { $set: { status: "done" } })
                                .exec()
                                .then(collectHomeData => {
                                    // {type:”month”,amt:250,month:”6”,date:____,method:”collectHomeRequest”}
                                    let feesData = {};

                                    // amt problem solving
                                    feesData["amt"] = data[0]["amt"] - req.body.discount;
                                    feesData["month"] = data[0]["month"];
                                    feesData["date"] = Date.now();
                                    feesData["method"] = "PayAtSchool";
                                    feesData["discount"] = req.body.discount

                                    console.log(" Fees data = ", feesData);

                                    Fees.find({ _id: req.body.fid, uid: req.body.uid })
                                        .exec()
                                        .then(fees => {
                                            // console.log(fees);
                                            let storedFeesPaymentStatus = fees[0]["feesPaymentStatus"];

                                            if (storedFeesPaymentStatus.length === 0) {
                                                let feesDataArray = [];
                                                feesDataArray.push(feesData);

                                                Fees.update({ _id: req.body.fid, uid: req.body.uid }, { $set: { feesPaymentStatus: feesDataArray } })
                                                    .exec()
                                                    .then(async (result) => {
                                                        // await updateCreditScore(req.body.uid, 25, "savings");
                                                        res.status(200).json({
                                                            message: "DONE"
                                                        });
                                                    })
                                                    .catch(error => {
                                                        res.status(500).json({
                                                            message: "ERROR"
                                                        });
                                                    });
                                            }
                                            else {
                                                console.log("In Else part");
                                                console.log("stored data = ", storedFeesPaymentStatus);
                                                // console.log("FeesData = ", feesData);
                                                storedFeesPaymentStatus.unshift(feesData);
                                                Fees.update({ _id: req.body.fid, uid: req.body.uid }, { $set: { feesPaymentStatus: storedFeesPaymentStatus } })
                                                    .exec()
                                                    .then(async (result) => {
                                                        // await updateCreditScore(req.body.uid, 25, "savings");
                                                        res.status(200).json({
                                                            message: "DONE"
                                                        });
                                                    })
                                                    .catch(error => {
                                                        // console.log("Error 1 = ", error);
                                                        res.status(500).json({
                                                            message: "ERROR"
                                                        });
                                                    });
                                            }
                                        })
                                        .catch(error => {
                                            console.log("Error 2 = ");
                                            res.status(500).json({
                                                message: "ERROR"
                                            });
                                        })
                                })
                                .catch(error => {
                                    console.log("Error 3 = ", error);
                                    res.status(500).json({
                                        message: "ERROR"
                                    });
                                });
                        }
                        else {
                            res.status(500).json({
                                message: "NO COLLECT REQUEST FOUND"
                            });
                        }
                    })
                    .catch(err => {
                        res.status(500).json({
                            message: "ERROR"
                        });
                    });
            }
        })
        .catch(err => {
            res.status(500).json({
                message: "ERROR"
            });
        });
})



// update Expired Pay At School Offer
router.get("/admin-updateExpiredPayAtSchoolOffer", (req, res, next) => {
    const currentDate = new Date()
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    let expired = [];
    let pendingExpiredRequests = [];

    CollectHomeRequestFees.find({ status: "pending", address: "PayAtSchool", month: months[currentDate.getMonth()] })
        .exec()
        .then(async (requests) => {
            if (requests.length === 0) {
                res.status(200).json({
                    message: "NO PENDING REQUESTS"
                })
            }
            else {
                console.log(" result.length = ", requests.length);
                for (let i = 0; i < requests.length; i++) {

                    let diff = currentDate.getTime() - requests[i].date.getTime()
                    let dateDiff = Math.floor(diff / (1000 * 60 * 60));

                    // Expired Requests
                    // if (true) {
                    if (dateDiff >= 48) {

                        // Offer Booked
                        await UserDiscount.findOne({ cpid: requests[i]._id, method: "payAtSchool", offerUpdated: { $in: [false, undefined, null] } })
                            .exec()
                            .then(async (data) => {
                                // console.log(" data ==== ", data, ",  request = ", requests[i]);
                                console.log(" data ==== ", data);
                                if (data) {
                                    // console.log(" data ==== ", data.date.toLocaleString());

                                    // schoolName
                                    await Fees.findOne({ _id: requests[i].fid })
                                        .exec()
                                        .then(async (feesData) => {
                                            if (feesData) {

                                                try {
                                                    await expiredUpdateOffer(requests[i]._id, requests[i].fid, feesData.uid, data.discount);
                                                }
                                                catch (e) {

                                                }

                                                pendingExpiredRequests.push({
                                                    request: requests[i],
                                                    schoolName: feesData.schoolName,
                                                    offerId: data._id,
                                                    discount: data.discount
                                                });
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
                    // else {
                    //     expired.push(false); 
                    // }

                }

                console.log(" length === ", pendingExpiredRequests.length);

                res.status(200).json({
                    pendingExpiredRequests: pendingExpiredRequests,
                    // expired: expired
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