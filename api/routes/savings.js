const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Savings = require("../models/savings");
const SavingsMain = require("../models/savingsMain");
const CollectHomeRequestSaving = require("../models/collectHomeRequestSaving");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const SavingsWithdraw = require("../models/savingsWithdraw");
var ObjectId = require("mongoose").Types.ObjectId;
const authenticateToken = require('./authenticateToken');
const { updateCreditScore, addBonus } = require('./utils');


router.get("/getAll", (req, res, next) => {
    Savings.find()
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

router.get("/getAll_SavingsMain", (req, res, next) => {
    SavingsMain.find()
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

router.get("/getAll_CollectHomeRequestSaving", (req, res, next) => {
    CollectHomeRequestSaving.find()
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

// get saving data by id
router.get("/getAll/:id", authenticateToken.authenticateToken, async(req, res, next) => {
    console.log(req.tokenUid);
    console.log(req.params.id);
    if (req.tokenUid === req.params.id) 
    {
        let savingDataArray = [], savingMainDataArray = [];
        const [savings, savingsMain] = await Promise.all([
            Savings.find({ uid: req.params.id, open: true })
            .exec()
            .then((savingData) => {
                savingDataArray = savingData;
            })
            .catch((err) => {
                // res.status(500).json({
                //     error: err
                // })
            }),
            SavingsMain.find({ uid: req.params.id })
            .exec()
            .then((savingMainData) => {
                savingMainDataArray = savingMainData;
            })
            .catch((err) => {
                // res.status(500).json({
                //     error: err
                // })
            })
        ]);

        res.status(200).json({
            savings: savingDataArray,
            savingsMain: savingMainDataArray,
            monthArray: [6,12],
            interest: {6:4,12:6},
            minSavingsAmt:25,
            maxSavingsAmt:1000
        });
    }
    else {
        res.status(500).json({
        message: "NO AUTH",
        });
    }
})

// create saving
router.post("/create", (req, res, next) => {
    User.findOne({ _id: req.body.uid })
        .exec()
        .then((user) => {
            if (user.length === 0) {
                res.status(500).json({
                    message: "User Not Found"
                })
            }
            else {
                const savings = new Savings({
                    _id: mongoose.Types.ObjectId(),
                    uid: req.body.uid,
                    savingsData: [],
                    userCreated: true,
                    months: req.body.months,
                    amt: req.body.amt,
                    planAmt: req.body.planAmt,
                    interest: req.body.interest,
                    open: true
                })

                savings.save()
                    .then(result => {
                        res.status(200).json({
                            message: "Saving create successfully"
                        });
                    })
                    .catch(err => {
                        res.status(500).json({
                            error: err
                        })
                    });
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
})


// -> Fees
// Fid, uid, childName, schoolName, class, rollNo, feesPaymentStatus

// feesPaymentStatus
// {“6”:{“amt”:2000,”status”:”paid”,”date”:____},“8”:{“amt”:1000,”status”:”collectHomeRequest”,”address”:”fdfdfg”,”date”:____}}

// Status - paid/collectHomeRequest/due

router.post('/createSavings-RequestFromAddress', authenticateToken.authenticateToken, async (req, res, next) => {
    if (req.tokenUid === req.body.uid) 
    {
        User.find({ _id: req.body.uid })
            .exec()
            .then(user => {
                if (user.length === 0) {
                    res.status(500).json({
                        message: "NO USER FOUND"
                    });
                }
                else {
                    Savings.find({ uid: req.body.uid, open: true })
                        .exec()
                        .then(result => {
                            if (result.length === 0) {
                                const savings = new Savings({
                                    _id: mongoose.Types.ObjectId(),
                                    uid: req.body.uid,
                                    savingsData: [],
                                    userCreated: true,
                                    months: req.body.planMonths,
                                    amt: 0,
                                    planAmt: req.body.planAmt,
                                    interest: req.body.interest,
                                    open: true
                                });

                                savings.save()
                                    .then(result => {
                                        Savings.find({ uid: req.body.uid, open: true })
                                            .exec()
                                            .then(savingsData => {
                                                const collectHomeRequestSaving = new CollectHomeRequestSaving({
                                                    _id: mongoose.Types.ObjectId(),
                                                    sid: savingsData[0]["_id"],
                                                    uid: req.body.uid,
                                                    month: req.body.month,
                                                    amt: req.body.amt,
                                                    address: req.body.address,
                                                    status: "pending",
                                                    date: Date.now()
                                                });

                                                collectHomeRequestSaving.save()
                                                    .then(result => {
                                                        res.status(200).json({
                                                            message: "DONE"
                                                        });
                                                    })
                                                    .catch(err => {
                                                        res.status(500).json({
                                                            message: "ERROR 3"
                                                        })
                                                    });
                                            })
                                            .catch(err => {
                                                res.status(500).json({
                                                    message: "ERROR 3"
                                                })
                                            });
                                    })
                                    .catch(err => {
                                        res.status(500).json({
                                            message: "ERROR 3"
                                        })
                                    });
                            }
                            else {
                                res.status(500).json({
                                    message: "OPEN SAVINGS EXIST"
                                })
                            }
                        })
                        .catch(err => {
                            res.status(500).json({
                                message: "ERROR"
                            })
                        });
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


router.post("/addMoneyInExistingSavings-RequestFromAddress", authenticateToken.authenticateToken, (req, res, next) => {
    if (req.tokenUid === req.body.uid) 
    {
        User.findOne({ _id: req.body.uid })
            .exec()
            .then((user) => {
                if (user.length === 0) {
                    res.status(500).json({
                        message: "User Not Found"
                    })
                }
                else {
                    Savings.find({ _id: req.body.sid, uid: req.body.uid, open: true })
                        .exec()
                        .then(result => {
                            if (result.length !== 0) {
                                const collectHomeRequestSaving = new CollectHomeRequestSaving({
                                    _id: mongoose.Types.ObjectId(),
                                    sid: req.body.sid,
                                    uid: req.body.uid,
                                    month: req.body.month,
                                    amt: req.body.amt,
                                    address: req.body.address,
                                    status: "pending",
                                    date: Date.now()
                                });

                                collectHomeRequestSaving.save()
                                    .then(result => {
                                        res.status(200).json({
                                            message: "DONE"
                                        });
                                    })
                                    .catch(err => {
                                        res.status(500).json({
                                            message: "ERROR 3"
                                        })
                                    });
                            }
                            else {
                                res.status(500).json({
                                    message: "SAVINGS NOT FOUND"
                                })
                            }
                        })
                        .catch(err => {
                            res.status(500).json({
                                message: "ERROR"
                            })
                        });
                }
            })
            .catch(err => {
                res.status(500).json({
                    error: err
                })
            })
    }
    else {
        res.status(500).json({
        message: "NO AUTH",
        });
    }
})


router.post('/addMoneyInSavings-RequestFromAddress', async (req, res, next) => {
    User.find({ _id: req.body.uid })
        .exec()
        .then(user => {
            if (user.length === 0) {
                res.status(500).json({
                    message: "NO USER FOUND"
                });
            }
            else {
                Savings.find({ _id: req.body.sid, uid: req.body.uid, open: true })
                    .exec()
                    .then(result => {
                        if (result.length !== 0) {
                            const collectHomeRequestSaving = new CollectHomeRequestSaving({
                                _id: mongoose.Types.ObjectId(),
                                sid: savingsData[0]["_id"],
                                uid: req.body.uid,
                                month: req.body.month,
                                amt: req.body.amt,
                                address: req.body.address,
                                status: "pending",
                                date: Date.now()
                            });

                            collectHomeRequestSaving.save()
                                .then(result => {
                                    res.status(200).json({
                                        message: "DONE"
                                    });
                                })
                                .catch(err => {
                                    res.status(500).json({
                                        message: "ERROR 3"
                                    })
                                });
                        }
                        else {
                            res.status(500).json({
                                message: "SAVINGS NOT FOUND"
                            })
                        }
                    })
                    .catch(err => {
                        res.status(500).json({
                            message: "ERROR"
                        })
                    });
            }
        })
        .catch(err => {
            res.status(500).json({
                message: "ERROR"
            });
        });
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
                CollectHomeRequestSaving.find({ uid: user[0]["_id"], status: "pending" })
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

router.get("/admin-getAllSavingsPedingRequests", async(req, res, next) => {
    CollectHomeRequestSaving.find({status: "pending"})
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
            if (user.length === 0) {
                res.status(500).json({
                    message: "NO USER FOUND"
                });
            }
            else {
                CollectHomeRequestSaving.find({ _id: req.body._id, sid: req.body.sid, uid: req.body.uid })
                    .exec()
                    .then(data => {
                        if (data.length !== 0) {
                            CollectHomeRequestSaving.update({ _id: req.body._id, sid: req.body.sid, uid: req.body.uid }, { $set: { status: "done" } })
                                .exec()
                                .then(async(collectHomeData) => {
                                    // {type:”month”,amt:250,month:”6”,date:____,method:”collectHomeRequest”}
                                    let savingsData = {};
                                    savingsData["type"] = "month";
                                    savingsData["amt"] = data[0]["amt"];
                                    savingsData["month"] = data[0]["month"];
                                    savingsData["date"] = Date.now();
                                    savingsData["method"] = "collectHome";

                                    const [savings, savingsMain] = await Promise.all([
                                        Savings.find({ _id: req.body.sid, uid: req.body.uid })
                                        .exec()
                                        .then(savings => {
                                            console.log("HERE");
                                            let storedSavingsData = savings[0]["savingsData"];

                                            if (storedSavingsData.length === 0) {
                                                console.log("HERE 4");
                                                let savingsDataArray = [];
                                                savingsDataArray.push(savingsData);
                                                console.log("HERE 2");

                                                Savings.update({ _id: req.body.sid, uid: req.body.uid }, { $set: { savingsData: savingsDataArray, amt: savings[0]["amt"] + data[0]["amt"] } })
                                                    .exec()
                                                    .then(result => {
                                                        console.log("HERE 3");
                                                        // res.status(200).json({
                                                        //     message: "DONE"
                                                        // });
                                                    })
                                                    .catch(error => {
                                                        // res.status(500).json({
                                                        //     message: "ERROR"
                                                        // });
                                                    });
                                            }
                                            else {
                                                console.log("HERE 5");
                                                storedSavingsData.unshift(savingsData);
                                                Savings.update({ _id: req.body.sid, uid: req.body.uid }, { $set: { savingsData: storedSavingsData, amt: savings[0]["amt"] + data[0]["amt"] } })
                                                    .exec()
                                                    .then(result => {
                                                        // res.status(200).json({
                                                        //     message: "DONE"
                                                        // });
                                                    })
                                                    .catch(error => {
                                                        // res.status(500).json({
                                                        //     message: "ERROR"
                                                        // });
                                                    });
                                            }
                                        })
                                        .catch(error => {
                                            // res.status(500).json({
                                            //     message: "ERROR"
                                            // });
                                        }),
                                        SavingsMain.find({ uid: req.body.uid })
                                        .exec()
                                        .then(savingsMain => {
                                            if(savingsMain.length!==0){
                                                SavingsMain.update({ uid: req.body.uid }, { $set: { totalAmt: savingsMain[0]["totalAmt"]+data[0]["amt"] } })
                                                    .exec()
                                                    .then(result => {
                                                        
                                                    })
                                                    .catch(err => {
                                                        
                                                    });
                                            }
                                        })
                                        .catch(err => {
                                            res.status(500).json({
                                                message: "ERROR"
                                            });
                                        })
                                    ]);
                                    
                                    await updateCreditScore(req.body.uid, 25, "savings");
                                    await addBonus(req.body.uid, 50, "Savings Started");
                                    
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

                //here
            }
        })
        .catch(err => {
            res.status(500).json({
                message: "ERROR"
            });
        });
});

// router.post('/create', async(req,res,next) => {
//     User.find({_id:req.body.uid})
//     .exec()
//     .then(user => {
//         if(user.length===0){
//             res.status(500).json({
//                 message: "NO USER FOUND"
//             });
//         }
//         else {
//                     const fees = new Fees({
//                         _id : mongoose.Types.ObjectId(),
//                         uid: req.body.uid,
//                         childName: req.body.childName,
//                         schoolName: req.body.schoolName,
//                         class: req.body.class,
//                         rollNo: req.body.rollNo,
//                         feesPaymentStatus: {}
//                     });

//                     fees.save()
//                     .then(result => {
//                         res.status(200).json({
//                             message : "DONE"
//                         });
//                     })
//                     .catch(err => {
//                         res.status(500).json({
//                             message: "ERROR 3"
//                         })
//                     });
//         }
//     })
//     .catch(err => {
//         res.status(500).json({
//             message: "ERROR"
//         });
//     });
// });


// router.post('/payfees', async(req,res,next) => {
//     User.find({_id: req.body.uid})
//     .exec()
//     .then(user => {
//         if(user.length===0){
//             res.status(500).json({
//                 message: "NO USER FOUND"
//             });
//         }
//         else {
//                 Fees.find({_id: req.body.fid, uid: req.body.uid})
//                 .exec()
//                 .then(fees => {
//                     if(fees.length===0){
//                         res.status(500).json({
//                             message: "NO FEES PLAN FOUND"
//                         })
//                     }
//                     else {
//                         //UPDATE
//                         let feesPaymentStatus = fees[0]["feesPaymentStatus"];
//                         let obj = {};
//                         obj["amt"] = req.body.amt;
//                         obj["status"] = req.body.status;
//                         obj["address"] = req.body.address;
//                         obj["date"] = Date.now();

//                         // if(Object.keys(feesPaymentStatus).length==0){
//                         //     feesPaymentStatus["month"]===obj;
//                         // }

//                         feesPaymentStatus["month"]===obj;

//                         Fees.update({ _id: req.body.fid, uid: req.body.uid }, { $set: { feesPaymentStatus: feesPaymentStatus } })
//                         .exec()
//                         .then(result => {
//                             if(req.body.status==="collectHome"){
//                                 const collectHomeRequestFees = new CollectHomeRequestFees({
//                                     _id : mongoose.Types.ObjectId(),
//                                     fid: req.body.fid,
//                                     uid: req.body.uid,
//                                     month: req.body.month,
//                                     amt: req.body.amt,
//                                     address: req.body.address,
//                                     date: Date.now(),
//                                     status: req.body.status,
//                                 });

//                                 collectHomeRequestFees.save()
//                                 .then(result => {
//                                     res.status(200).json({
//                                         message : "COLLECT REQUEST DONE"
//                                     });
//                                 })
//                                 .catch(err => {
//                                     res.status(500).json({
//                                         message: "ERROR 3"
//                                     })
//                                 });
//                             }
//                             else {
//                                 res.status(200).json({
//                                     message: "FEES PAID"
//                                 });
//                             }
//                         })
//                         .catch(err => {
//                             res.status(404).json({
//                                 message: "NOT UPDATED"
//                             });
//                         })
//                     }
//                 })
//                 .catch(err => 
//                     res.status(500).json({
//                         message: "ERROR 4"
//                     })
//                 )
//         }
//     })
//     .catch(err => {
//         res.status(500).json({
//             message: "ERROR"
//         });
//     });
// });


// router.get("/getAll/:id", (req, res, next) => {
//   User.find({ _id: req.params.id })
//     .exec()
//     .then((users) => {
//       res.status(200).json(users);
//     })
//     .catch((err) => {
//       res.status(500).json({
//         error: err,
//       });
//     });
// });

router.delete('/deleteById/:id', (req, res, next) => {
    Savings.remove({ _id: req.params.id })
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

router.put('/updateOpen/:id', (req, res, next) => {
    Savings.update({ _id: req.params.id }, { $set: { open: false } })
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



router.post("/withdrawRequest", authenticateToken.authenticateToken, (req, res, next) => {
    if (req.tokenUid === req.body.uid) 
    {
        User.find({ _id: req.body.uid })
            .exec()
            .then(user => {
                if (user.length === 0) {
                    res.status(500).json({
                        message: "USER NOT REGISTER"
                    })
                }
                else {
                    const savingsWithdraw = new SavingsWithdraw({
                        _id: mongoose.Types.ObjectId(),
                        uid: req.body.uid,
                        sid: req.body.sid,
                        date: Date.now(),
                        savingsAmt: req.body.savingsAmt,
                        status: "pending"
                    })

                    savingsWithdraw.save()
                        .then(result => {
                            res.status(500).json({
                                message: "WITHDRAW REQUEST SUCCESSFULLY SENDED"
                            })
                        })
                        .catch(err => {
                            res.status(500).json({
                                message: "WITHDRAW REQUEST ERROR"
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
    else {
        res.status(500).json({
        message: "NO AUTH",
        });
    }
})



router.get("/getAllWithdrawRequest", (req, res, next) => {
    SavingsWithdraw.find()
        .exec()
        .then(requests => {
            res.status(200).json({
                requests: requests
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
})

router.get("/admin-getPendingWithdrawRequest", (req, res, next) => {
    SavingsWithdraw.find({ status: "pending" })
        .exec()
        .then(requests => {
            res.status(200).json({
                pendingRequests: requests
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
})

router.post("/admin-updatePendingStatusOfWithdrawRequest", (req, res, next) => {
    SavingsWithdraw.updateOne({ _id: req.body._id }, { $set: { status: "done" }})
        .exec()
        .then(done => {
            res.status(200).json({
                message: "Status Changed"
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
})


router.post("/createBonus", (req, res, next) => {
    SavingsMain.find({uid:req.body.uid})
        .exec()
        .then((savings) => {
            if(savings.length!==0){
                console.log("HERE");
                let bonusArray = [], bonusObj = {}, totalAmt = 0;
                bonusObj["amt"] = req.body.amt;
                bonusObj["reason"] = req.body.reason;
                bonusObj["date"] = Date.now();

                bonusArray = savings[0]["bonus"];
                bonusArray.unshift(bonusObj);

                totalAmt = savings[0]["totalAmt"] + req.body.amt;

                console.log("HERE 2");

                SavingsMain.update({ uid: req.body.uid }, { $set: { bonus: bonusArray, totalAmt: totalAmt } })
                .exec()
                .then(async(result) => {
                    console.log("HERE 3");
                    res.status(200).json({
                        message:"DONE"
                    });
                })
                .catch(err => {
                    res.status(500).json({
                        message:"ERROR"
                    });
                })
            }
        })
        .catch((err) => {
            res.status(500).json({
                error: err,
            });
        });
});

module.exports = router;