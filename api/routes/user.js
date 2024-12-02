const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Fees = require("../models/fees");
const Savings = require("../models/savings");
const SavingsMain = require("../models/savingsMain");
const Credit = require("../models/credit");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const ExplainHomeRequest = require("../models/explainHomeRequest");
var ObjectId = require("mongoose").Types.ObjectId;
const authenticateToken = require('./authenticateToken');
const bcrypt = require("bcrypt");
const Offers = require("../models/offers");
const CollectHomeRequestFees = require("../models/collectHomeRequestFees");
const UserDiscount = require("../models/userDiscount");
const Canteen = require("../models/canteen");


router.get("/getAll", (req, res, next) => {
  User.find()
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


router.post("/registerByPassword", (req, res, next) => {
  User.find({ phone: req.body.phone })
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
                uid: result[0]["_id"],
                phone: result[0]["phone"],
                language: result[0]["language"],
                newUser: false,
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
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              message: "Try Again!",
            });
          } else {
            const user = new User({
              _id: mongoose.Types.ObjectId(),
              phone: req.body.phone,
              password: hash,
              dateRegistered: Date.now(),
              method: "password",
              language: "English"
            });

            user
              .save()
              .then((result) => {
                console.log("ENTER");

                User.find({ phone: req.body.phone })
                  .exec()
                  .then(async (user2) => {
                    const savingsMain = new SavingsMain({
                      _id: mongoose.Types.ObjectId(),
                      uid: user2[0]["_id"],
                      totalAmt: 0,
                      bonus: []
                    });

                    const credit = new Credit({
                      _id: mongoose.Types.ObjectId(),
                      uid: user2[0]["_id"],
                      creditScore: 10,
                      creditScoreData: [],
                      creditMoney: 0,
                      activated: false,
                      feesSavings: { fees: 0, savings: 0 }
                    })

                    const [savingsMainSave, creditSave] = await Promise.all([
                      savingsMain.save()
                        .then(result => {
                          console.log("SAVINGS MAIN CREATED");
                        })
                        .catch(err => {
                          console.log("SAVINGS MAIN FAILED");
                        }),
                      credit.save()
                        .then(result => {
                          console.log("CREDIT CREATED");
                        })
                        .catch(err => {
                          console.log("CREDIT CREATED");
                        })
                    ]);

                    const token = jwt.sign(
                      {
                        id: user2[0]["_id"],
                      },
                      "key@merape.Merape"
                    );

                    res.status(200).json({
                      uid: user2[0]["_id"],
                      phone: user2[0]["phone"],
                      newUser: true,
                      token: token
                    });
                  })
                  .catch(err => {
                    res.status(500).json({
                      message: "ERROR",
                      error: err
                    })
                  });

                // welcomeEmail(req.body.name, l_email);
                // createRegisterBonusPayment(l_email, parseInt(bonus_amt));
              })
              .catch((err) => {
                res.status(500).json({
                  message: "ERROR",
                });
              });
          }
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: "ERROR",
      });
    });
});


router.post('/register', async (req, res, next) => {
  User.find({ phone: req.body.phone })
    .exec()
    .then(async (user) => {
      if (user.length === 0) {
        const user = new User({
          _id: mongoose.Types.ObjectId(),
          phone: req.body.phone,
          language: "English"
        });

        user.save()
          .then(result => {
            User.find({ phone: req.body.phone })
              .exec()
              .then(async (user2) => {
                const savingsMain = new SavingsMain({
                  _id: mongoose.Types.ObjectId(),
                  uid: user2[0]["_id"],
                  totalAmt: 0,
                  bonus: []
                });

                const credit = new Credit({
                  _id: mongoose.Types.ObjectId(),
                  uid: user2[0]["_id"],
                  creditScore: 10,
                  creditScoreData: [],
                  creditMoney: 0,
                  activated: false,
                  feesSavings: { fees: 0, savings: 0 }
                })

                const [savingsMainSave, creditSave] = await Promise.all([
                  savingsMain.save()
                    .then(result => {
                      console.log("SAVINGS MAIN CREATED");
                    })
                    .catch(err => {
                      console.log("SAVINGS MAIN FAILED");
                    }),
                  credit.save()
                    .then(result => {
                      console.log("CREDIT CREATED");
                    })
                    .catch(err => {
                      console.log("CREDIT CREATED");
                    })
                ]);

                const token = jwt.sign(
                  {
                    id: user2[0]["_id"],
                  },
                  "key@merape.Merape"
                );

                res.status(200).json({
                  uid: user2[0]["_id"],
                  phone: user2[0]["phone"],
                  newUser: true,
                  token: token
                });
              })
              .catch(err => {
                res.status(500).json({
                  message: "ERROR",
                  error: err
                })
              });
          })
          .catch(err => {
            res.status(500).json({
              message: "ERROR",
              error: err
            })
          });
      }
      else {
        const token = jwt.sign(
          {
            id: user[0]["_id"],
          },
          "key@merape.Merape"
        );

        res.status(200).json({
          uid: user[0]["_id"],
          phone: user[0]["phone"],
          language: user[0]["language"],
          newUser: false,
          token: token
        });
      }
    });
});

router.post('/create', async (req, res, next) => {
  const user = new User({
    _id: mongoose.Types.ObjectId(),
    phone: req.body.phone,
    language: "English"
  });

  user.save()
    .then(result => {
      res.status(200).json({
        message: "DONE"
      });
    })
    .catch(err => {
      res.status(500).json({
        message: "ERROR"
      })
    });
});

router.post('/updateLanguage', authenticateToken.authenticateToken, (req, res, next) => {
  if (req.tokenUid === req.body._id) {
    const lang = req.body.language;

    User.updateOne({ _id: req.body._id }, {
      language: lang
    }, (err, affected, resp) => {
      if (err) {
        res.status(500).json({
          message: "Error"
        })
      } else {
        res.status(500).json({
          message: "Done"
        })
      }
    })
  }
  else {
    res.status(500).json({
      message: "NO AUTH",
    });
  }
})

// get user by phone to check user already register or not
router.post("/getUserInfoByNumber", (req, res, next) => {
  User.findOne({ phone: req.body.phone })
    .exec()
    .then((user) => {
      res.status(200).json({
        message: {
          uid: user._id,
          phone: user.phone
        }
      })
    })
    .catch((err) => {
      res.status(500).json({
        message: "USER NOT FOUND"
      });
    });
})

// router.post('/delete', async (req, res, next) => {

//   User.deleteOne({ _id: req.body._id },{},
//     (err, affected, res) => {
//       if (err) {
//         res.status(500).json({
//           message: "Error"
//         })
//       } else {
//         res.status(500).json({
//           message: "Done"
//         })
//       }
//     })
// });


router.post("/getHomePageData", authenticateToken.authenticateToken, async (req, res, next) => {
  if (req.tokenUid === req.body.uid) {
    User.find({ _id: req.body.uid })
      .exec()
      .then(async (user) => {
        if (user.length === 0) {
          res.status(500).json({
            message: "NO USER FOUND"
          });
        }
        else {
          let feesData = [], savingsAmt = 0, creditScore = 0, language = "English";
          const [fees, savings, paylater, user] = await Promise.all([
            Fees.find({ uid: req.body.uid })
              .exec()
              .then((fees) => {
                if (fees.length !== 0) {
                  feesData = fees;
                }
              })
              .catch((err) => {
                res.status(500).json({
                  error: err,
                });
              }),

            SavingsMain.find({ uid: req.body.uid })
              .exec()
              .then((savings) => {
                if (savings.length !== 0) {
                  savingsAmt = savings[0]["totalAmt"];
                }
              })
              .catch((err) => {
                res.status(500).json({
                  error: err,
                });
              }),

            Credit.find({ uid: req.body.uid })
              .exec()
              .then((credit) => {
                if (credit.length !== 0) {
                  creditScore = credit[0]["creditScore"];
                }
              })
              .catch((err) => {
                res.status(500).json({
                  error: err,
                });
              }),
            User.find({ _id: req.body.uid })
              .exec()
              .then((user) => {
                // console.log(user);
                language = user[0]["language"];
              })
              .catch((err) => {
                res.status(500).json({
                  error: err,
                });
              })
          ]);

          res.status(200).json({
            feesData: feesData,
            savingsAmt: savingsAmt,
            creditScore: creditScore,
            language: language,
            isCanteen: isCanteen
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

router.post("/getHomePageDataWithOffer", authenticateToken.authenticateToken, async (req, res, next) => {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentDate = new Date();

  if (req.tokenUid === req.body.uid) {
    User.find({ _id: req.body.uid })
      .exec()
      .then(async (user) => {
        if (user.length === 0) {
          res.status(500).json({
            message: "NO USER FOUND"
          });
        }
        else {
          let feesData = [], language = "English", totalOffers = [], payAtSchoolData = [], discount = [], expired = [], canteenData = [];

          const [fees, user, canteen, payAtSchool] = await Promise.all([

            Fees.find({ uid: req.body.uid })
              .exec()
              .then(async (fees) => {
                if (fees.length !== 0) {
                  feesData = fees;

                  console.log(" fees Data = ", feesData);
                  // totalOffers
                  for (let i = 0; i < fees.length; i++) {

                    // const regex = new RegExp(fees[i].schoolName, 'i') // i for case insensitive
                    // const regex = new RegExp(fees[i].schoolName, 'i') // i for case insensitive

                    // await Offers.findOne({ "schoolName": { $regex: "" + fees[i].schoolName, $options: 'i' }, month: months[currentDate.getMonth()], year: currentDate.getFullYear() })
                    await Offers.find({ month: months[currentDate.getMonth()], year: currentDate.getFullYear() })
                      .exec()
                      .then(totalOffer => {
                        // console.log("totalOffer = ", totalOffer);

                        if (totalOffer) {
                          let flag = false;

                          for (let j = 0; j < totalOffer.length; j++) {
                            let school = totalOffer[j].schoolName;

                            // offer found
                            if (school.includes(fees[i].schoolName)) {
                              console.log(" i === ", i, " school ======= ", fees[i].schoolName);

                              totalOffers.push({
                                schoolName: fees[i].schoolName,
                                totalOffers: totalOffer[j].totalOffers,
                                leftOffers: totalOffer[j].leftOffers
                              });

                              flag = true;
                              break;
                            }
                          }

                          // offer not found
                          if (!flag) {
                            console.log(" zero offer i === ", i, " school ======= ", fees[i].schoolName);

                            totalOffers.push({
                              schoolName: fees[i].schoolName,
                              totalOffers: 0,
                              leftOffers: 0
                            });
                          }
                        }
                      })
                      .catch(err => {
                        console.log(' error = ', err);
                        res.status(500).json({
                          error: "1 == ", err
                        })
                      })

                  }
                }
              })
              .catch((err) => {
                res.status(500).json({
                  error: "2 == ", err,
                });
              }),

            User.find({ _id: req.body.uid })
              .exec()
              .then((user) => {
                // console.log(user);
                language = user[0]["language"];
              })
              .catch((err) => {
                res.status(500).json({
                  error: "3 == ", err,
                });
              }),

            Canteen.find({ uid: req.body.uid })
              .exec()
              .then((canteen) => {
                console.log(canteen);
                canteenData = canteen;
              })
              .catch((err) => {
                res.status(500).json({
                  error: err,
                });
              }),

            CollectHomeRequestFees.find({ uid: req.body.uid })
              .exec()
              .then(async (payAtSchool) => {
                // payAtSchoolData = payAtSchool;

                for (let i = 0; i < payAtSchool.length; i++) {

                  payAtSchoolData.unshift(payAtSchool[i])

                  let diff = currentDate.getTime() - payAtSchool[i].date.getTime();
                  let dateDiff = Math.floor(diff / (1000 * 60 * 60));

                  if (dateDiff >= 48) {
                    expired.unshift(true)
                  }
                  else {
                    expired.unshift(false)
                  }

                  // console.log(" currdate = ", currentDate.toLocaleString(), ",  date = ", payAtSchool[i].date.toLocaleString());
                  // console.log(" i = ", i, ",  diff === ", Math.floor((Math.abs(currentDate-payAtSchool[i].date))/(1000*60*60*24)));
                  // console.log(" i = ", i, ",  diff === ", diff, ",  dateDiff = ", dateDiff);


                  await UserDiscount.find({ uid: req.body.uid, cpid: payAtSchool[i]._id })
                    .exec()
                    .then(discountData => {
                      if (discountData.length === 0) {
                        discount.unshift(0)
                      }
                      else {
                        discount.unshift(discountData[0].discount);
                      }
                    })

                }
              })
          ]);



          res.status(200).json({
            feesData: feesData,
            language: language,
            totalOffers: totalOffers,
            payAtSchoolData: payAtSchoolData,
            discountArray: discount,
            expired: expired,
            canteenData: canteenData
          });
        }
      })
      .catch(err => {
        console.log(" Error = ", err);

        res.status(500).json({
          message: err
        });
      });
  }
  else {
    res.status(500).json({
      message: "NO AUTH",
    });
  }
});


router.post("/getPayAtSchoolRequest", authenticateToken.authenticateToken, async (req, res, next) => {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentDate = new Date();

  if (req.tokenUid === req.body.uid) {
    User.find({ _id: req.body.uid })
      .exec()
      .then(async (user) => {
        if (user.length === 0) {
          res.status(500).json({
            message: "NO USER FOUND"
          });
        }
        else {
          let feesData = [], language = "English", totalOffers = [], payAtSchoolData = [], discount = [], expired = [];

          const [collectRequest] = await Promise.all([
            CollectHomeRequestFees.find({ uid: req.body.uid })
              .exec()
              .then(async (payAtSchool) => {
                // payAtSchoolData = payAtSchool;
                // console.log(payAtSchool);

                for (let i = 0; i < payAtSchool.length; i++) {

                  payAtSchoolData.unshift(payAtSchool[i])

                  let diff = currentDate.getTime() - payAtSchool[i].date.getTime();
                  let dateDiff = Math.floor(diff / (1000 * 60 * 60));

                  if (dateDiff >= 48) {
                    expired.unshift(true)
                  }
                  else {
                    expired.unshift(false)
                  }

                  // console.log(" currdate = ", currentDate.toLocaleString(), ",  date = ", payAtSchool[i].date.toLocaleString());
                  // console.log(" i = ", i, ",  diff === ", Math.floor((Math.abs(currentDate-payAtSchool[i].date))/(1000*60*60*24)));
                  // console.log(" i = ", i, ",  diff === ", diff, ",  dateDiff = ", dateDiff);


                  await UserDiscount.find({ uid: req.body.uid, cpid: payAtSchool[i]._id })
                    .exec()
                    .then(discountData => {
                      if (discountData.length === 0) {
                        discount.unshift(0)
                      }
                      else {
                        discount.unshift(discountData[0].discount);
                      }
                    })

                }
              })
              .catch(err => {

              })
          ]);

          res.status(200).json({
            payAtSchoolData: payAtSchoolData,
            discountArray: discount,
            expired: expired
          });
        }
      })
      .catch(err => {
        console.log(" Error = ", err);

        res.status(500).json({
          message: err
        });
      });
  }
  else {
    res.status(500).json({
      message: "NO AUTH",
    });
  }
});



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

router.get('/deleteById/:id', (req, res, next) => {
  User.remove({ _id: req.params.id })
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

router.get('/deleteAll', (req, res, next) => {
  User.remove()
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

router.post("/explainHomeRequest", authenticateToken.authenticateToken, (req, res, next) => {
  if (req.tokenUid === req.body.uid) {
    User.find({ _id: req.body.uid })
      .exec()
      .then(user => {
        if (user.length === 0) {
          res.status(500).json({
            message: "USER NOT REGISTER"
          })
        }
        else {
          const explainHomeRequest = new ExplainHomeRequest({
            _id: mongoose.Types.ObjectId(),
            uid: req.body.uid,
            date: Date.now(),
            address: req.body.address,
            status: "pending"
          })

          explainHomeRequest.save()
            .then(result => {
              res.status(500).json({
                message: "REQUEST SUCCESSFULLY SENDED"
              })
            })
            .catch(err => {
              res.status(500).json({
                message: "REQUEST ERROR"
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




router.get("/getAllExplainHomeRequest", (req, res, next) => {
  ExplainHomeRequest.find()
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

router.get("/admin-getPendingExplainHomeRequest", (req, res, next) => {
  ExplainHomeRequest.find({ status: "pending" })
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

router.post("/admin-updatePendingStatusOfExplainHomeRequest", (req, res, next) => {
  ExplainHomeRequest.updateOne({ _id: req.body._id }, { $set: { status: "done" } })
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

// router.post("/deleteExplainHomeRequest", (req, res, next) => {
//   ExplainHomeRequest.deleteOne({ _id: req.body._id})
//   .exec()
//   .then(requests => {
//     res.status(200).json({
//       message: "done"
//     })
//   })
//   .catch(err => {
//     res.status(500).json({
//       error: err
//     })
//   })
// })



// Get users register after any date
router.post("/admin-getUserByDate", (req, res, next) => {
  console.log("date = ", req.body.fromDate);

  User.find({ dateRegistered: { $gte: new Date(req.body.fromDate) } }, 'phone dateRegistered')
    .exec()
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((err) => {
      res.status(500).json({
        error: err
      });
    });
})




// router.put("/changePassword", (req, res, next) => {
//   User.find({ phone: req.body.phone })
//     .exec()
//     .then((result) => {
//       if (result.length >= 1) {
//           console.log("HERE");
//           bcrypt.hash(req.body.password, 10, (err, hash) => {
//           if (err) {
//             return res.status(500).json({
//               message: "Try Again!",
//             });
//           } else {
//               User.updateOne({ phone: req.body.phone }, {
//                 password: hash
//               }, (err, affected, resp) => {
//                 if (err) {
//                   res.status(500).json({
//                     message: "Error"
//                   })
//                 } else {
//                   res.status(500).json({
//                     message: "Done"
//                   })
//                 }
//               })
//           }
//         });
//       }
//       else {
//         res.status(500).json({
//           message: "NO USER FOUND",
//         });
//       }
//     })
//     .catch((err) => {
//       res.status(500).json({
//         message: "ERROR",
//       });
//     });
// });



module.exports = router;