var express = require('express');
var router = express.Router();
require('dotenv').config();
const Razorpay = require('razorpay');
const request = require('request');
const Payment = require('../models/payment');
const mongoose = require('mongoose');
const User = require('../models/user');
const Savings = require('../models/savings');
const SavingsMain = require('../models/savingsMain');
const UserDiscount = require("../models/userDiscount");
const Fees = require('../models/fees');
var crypto = require('crypto');
const authenticateToken = require('./authenticateToken');
const { updateCreditScore, addBonus, updateOffers } = require('./utils');


const razorInstance = new Razorpay({
  key_id: process.env.razorIdkey,
  key_secret: process.env.razorIdSecret
})



router.get("/getAll", (req, res, next) => {
  Payment.find()
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


// router.post("/createBonusPayment", async (req,res) => {
//       const pay = new Payment({
//         _id : mongoose.Types.ObjectId(),
//         uid : req.body.uid,
//         payment_id : req.body.payment_id,
//         order_id : req.body.order_id,
//         amt : parseInt(req.body.amt),
//         curr : "INR",
//         date : Date.now()
//       });

//       pay.save()
//         .then(result => {
//           User.find({_id : req.body.uid})
//           .exec()
//           .then(user => {
//             if(user.length > 0)
//             {
//                   let cash = 0;
//                   console.log(user[0]);
//                   if(user[0]['deposit_cash'])
//                   {
//                       console.log("HERE 2");
//                       if(user[0]["deposit_cash"]===0||user[0]["deposit_cash"]===null||user[0]["deposit_cash"]===undefined)
//                       {

//                       }
//                       else
//                       {
//                           cash = user[0]["deposit_cash"];
//                           console.log("HERE");
//                       }   
//                   }
//               User.update({_id : req.body.uid}, {$set : {deposit_cash : cash + parseInt(req.body.amt)}})
//               .exec()
//               .then(result => {
//                   console.log("BONUS CREATED : "+req.body.amt);
//                   res.status(200).json({"message":"BONUS CREATED"});
//               })
//               .catch(err => {
//                   res.status(500).json({"message":"ERROR"});
//               })
//             }
//             else
//             {
//               console.log("NO USER FOUND");
//               res.status(500).json({"message":"NO USER FOUND"});
//             }
//           })
//           .catch(err => {
//               res.status(500).json({"message":"ERROR"});
//           });
//         })
//         .catch(err => {
//               res.status(500).json({"message":"ERROR"});
//         })
// });


router.post("/order", (req, res) => {
  try {
    console.log("HERE YES : " + process.env.razorIdkey);
    console.log("HERE YES : " + process.env.razorIdSecret);
    const options = {
      amount: parseInt(req.body.amt) * 100,
      currency: "INR",
      receipt: "receipt#1",
      payment_capture: 0, //1

    };
    console.log("HERE");
    razorInstance.orders.create(options, async function (err, order) {
      if (err) {
        console.log("HERE 2");
        return res.status(500).json({
          message: err
        })
      }
      console.log("HERE 3 : " + order["id"]);
      return res.status(200).json({
        "order_id": order["id"]
      })
    });
  }
  catch (err) {
    console.log(JSON.stringify(err));
    return res.status(500).json({
      message: err
    })
  }
});


// {
//   "uid":"6284dd23dec6fe0004590b0e",
//   "sid":"6284fa2a8c85d30004ead1d4",
//   "razorpay_payment_id":"pay_JXCPplM6Xs4T8v",
//   "signature":"7fc6f5c2b803fae6d1461cdebad4dc470aed658a5f4606c923f4d54b3f914d67",
//   "order_id":"order_JXCPTLoUrXR7nI",
//   "amt":10,
//   "month":"August",
//   "new":false
// }

// {
//   "uid":"628b91bc929149000475ff2b",
//   "razorpay_payment_id":"pay_JXCPplM6Xs4T8v",
//   "signature":"7fc6f5c2b803fae6d1461cdebad4dc470aed658a5f4606c923f4d54b3f914d67",
//   "order_id":"order_JXCPTLoUrXR7nI",
//   "month":"August",
//   "amt":500,
//   "planAmt":100,
//   "months":6,
//   "new":true
// }

router.post("/verifyPaymentSavings", authenticateToken.authenticateToken, async (req, res, next) => {
  if (req.tokenUid === req.body.uid) {
    var data = req.body.order_id + "|" + req.body.razorpay_payment_id;
    var hmac = await crypto.createHmac('sha256', process.env.razorIdSecret);
    data = await hmac.update(data);
    gen_hmac = await data.digest('hex');

    if (gen_hmac == req.body.signature) {
      console.log("HERE 4");
      const pay = new Payment({
        _id: mongoose.Types.ObjectId(),
        uid: req.body.uid,
        payment_id: req.body.razorpay_payment_id,
        order_id: req.body.order_id,
        amt: parseInt(req.body.amt),
        curr: "INR",
        reason: "savings",
        date: Date.now()
      });

      pay.save()
        .then(result => {
          if (req.body.new === false) {
            Savings.find({ _id: req.body.sid, uid: req.body.uid, open: true })
              .exec()
              .then(result => {
                console.log(result);
                if (result.length > 0) {
                  let savingsArray = result[0]["savingsData"];
                  let savingsData = {};
                  savingsData["type"] = "month";
                  savingsData["amt"] = req.body.amt;
                  savingsData["month"] = req.body.month;
                  savingsData["method"] = "online";
                  savingsData["date"] = Date.now();

                  savingsArray.unshift(savingsData);

                  Savings.update({ _id: req.body.sid, uid: req.body.uid, open: true }, { $set: { savingsData: savingsArray, amt: result[0]["amt"] + req.body.amt } })
                    .exec()
                    .then(async (result) => {
                      await SavingsMain.find({ uid: req.body.uid })
                        .exec()
                        .then(savingsMain => {
                          if (savingsMain.length !== 0) {
                            SavingsMain.update({ uid: req.body.uid }, { $set: { totalAmt: savingsMain[0]["totalAmt"] + req.body.amt } })
                              .exec()
                              .then(result => {
                                console.log("SAVINGS MAIN DONE");
                              })
                              .catch(err => {
                                console.log("SAVINGS MAIN ERROR");
                              });
                          }
                        })
                        .catch(err => {
                          res.status(500).json({
                            message: "ERROR"
                          });
                        })

                      await updateCreditScore(req.body.uid, 25, "savings");

                      res.status(200).json({
                        message: "DONE"
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
          }
          else {
            console.log("HERE");
            Savings.find({ uid: req.body.uid, open: true })
              .exec()
              .then(result => {
                if (result.length === 0) {
                  let savingsData = {}, savingsArray = [];
                  savingsData["type"] = "month";
                  savingsData["amt"] = req.body.planAmt;
                  savingsData["month"] = req.body.month;
                  savingsData["method"] = "online";
                  savingsData["date"] = Date.now();

                  savingsArray.push(savingsData);
                  console.log("HERE 2");
                  const savings = new Savings({
                    _id: mongoose.Types.ObjectId(),
                    uid: req.body.uid,
                    savingsData: savingsArray,
                    userCreated: true,
                    months: req.body.months,
                    amt: req.body.amt,
                    planAmt: req.body.planAmt,
                    interest: req.body.interest,
                    open: true
                  });
                  console.log("HERE 3");
                  savings.save()
                    .then(async (result) => {
                      await SavingsMain.update({ uid: req.body.uid }, { $set: { totalAmt: req.body.amt } })
                        .exec()
                        .then(result => {
                          console.log("SAVINGS MAIN DONE");
                        })
                        .catch(err => {
                          console.log("SAVINGS MAIN ERROR");
                        });

                      await updateCreditScore(req.body.uid, 25, "savings");
                      await addBonus(req.body.uid, 50, "Savings Started");

                      res.status(200).json({
                        message: "DONE"
                      });
                    })
                    .catch(err => {
                      res.status(500).json({
                        message: "ERROR"
                      });
                    })
                }
                else {
                  res.status(500).json({
                    message: "OPEN SAVINGS EXIST"
                  })
                }
              })
          }
        })
    }
    else {
      console.log("FALSE");
      res.status(500).json({
        "message": "INVALID"
      });
    }
  }
  else {
    res.status(500).json({
      message: "NO AUTH",
    });
  }
});


//Reason - Savings, Fees
//New fees, Existing fees
router.post("/verifyPaymentFees", authenticateToken.authenticateToken, async (req, res, next) => {
  if (req.tokenUid === req.body.uid) {
    var data = req.body.order_id + "|" + req.body.razorpay_payment_id;
    var hmac = await crypto.createHmac('sha256', process.env.razorIdSecret);
    data = await hmac.update(data);
    gen_hmac = await data.digest('hex');

    if (gen_hmac == req.body.signature) {
      const pay = new Payment({
        _id: mongoose.Types.ObjectId(),
        uid: req.body.uid,
        payment_id: req.body.razorpay_payment_id,
        order_id: req.body.order_id,
        amt: parseInt(req.body.amt),
        curr: "INR",
        reason: "fees",
        date: Date.now()
      });

      pay.save()
        .then(result => {
          Fees.find({ _id: req.body.fid, uid: req.body.uid })
            .exec()
            .then(result => {
              if (result.length > 0) {
                //Add Money
                console.log(result);

                let feesArray = result[0]["feesPaymentStatus"];

                let feesData = {};
                feesData["amt"] = req.body.amt;
                feesData["month"] = req.body.month;
                feesData["method"] = "online";
                feesData["date"] = Date.now();

                feesArray.unshift(feesData);

                Fees.update({ _id: req.body.fid, uid: req.body.uid }, { $set: { feesPaymentStatus: feesArray } })
                  .exec()
                  .then(async (result) => {
                    await updateCreditScore(req.body.uid, 20, "fees");
                    res.status(200).json({
                      message: "DONE"
                    });
                  })
                  .catch(err => {
                    res.status(500).json({
                      message: "ERROR"
                    });
                  });

              }
              else {
                res.status(500).json({
                  message: "NO FEES FOUND"
                });
              }
            })
            .catch(err => {
              res.status(500).json({
                message: err
              });
            })
        })
        .catch(err => {
          res.status(500).json({
            message: err
          });
        })

    }
    else {
      console.log("FALSE");
      res.status(500).json({
        "message": "INVALID"
      });
    }
  }
  else {
    res.status(500).json({
      message: "NO AUTH",
    });
  }
});

router.post("/verifyPaymentFeesWithOffer", authenticateToken.authenticateToken, async (req, res, next) => {
  if (req.tokenUid === req.body.uid) {
    var data = req.body.order_id + "|" + req.body.razorpay_payment_id;
    var hmac = await crypto.createHmac('sha256', process.env.razorIdSecret);
    data = await hmac.update(data);
    gen_hmac = await data.digest('hex');

    if (gen_hmac == req.body.signature) {
      const pay = new Payment({
        _id: mongoose.Types.ObjectId(),
        uid: req.body.uid,
        payment_id: req.body.razorpay_payment_id,
        order_id: req.body.order_id,
        amt: parseInt(req.body.amt),
        curr: "INR",
        reason: "fees",
        date: Date.now()
      });

      pay.save()
        .then(payResult => {
          Fees.find({ _id: req.body.fid, uid: req.body.uid })
            .exec()
            .then(result => {
              if (result.length > 0) {
                //Add Money
                console.log(result);

                let feesArray = result[0]["feesPaymentStatus"];

                let feesData = {};
                feesData["amt"] = req.body.amt;
                feesData["month"] = req.body.month;
                feesData["method"] = "online";
                feesData["date"] = Date.now();
                feesData["discount"] = req.body.discount;

                feesArray.unshift(feesData);

                Fees.update({ _id: req.body.fid, uid: req.body.uid }, { $set: { feesPaymentStatus: feesArray } })
                  .exec()
                  .then(async (result) => {
                    await updateCreditScore(req.body.uid, 20, "fees");

                    if (req.body.discount === 0) {
                      res.status(200).json({
                        message: "DONE"
                      });
                    }
                    else {

                      const userDiscount = new UserDiscount({
                        _id: mongoose.Types.ObjectId(),
                        uid: req.body.uid,
                        fid: req.body.fid,
                        cpid: payResult._id,
                        discount: req.body.discount,
                        paidToSchool: false,
                        method: "online",
                        date: new Date(),
                        totalFeesAmt: req.body.amt,
                        offerUpdated: false
                      })

                      userDiscount.save()
                        .then(async(result) => {
                          try{
                            await updateOffers(req.body.fid,req.body.uid,req.body.discount);
                            }
                            catch(e){
                                
                            }
                          res.status(200).json({
                            message: "DONE"
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
                      message: "ERROR"
                    });
                  });

              }
              else {
                res.status(500).json({
                  message: "NO FEES FOUND"
                });
              }
            })
            .catch(err => {
              res.status(500).json({
                message: err
              });
            })
        })
        .catch(err => {
          res.status(500).json({
            message: err
          });
        })

    }
    else {
      console.log("FALSE");
      res.status(500).json({
        "message": "INVALID"
      });
    }
  }
  else {
    res.status(500).json({
      message: "NO AUTH",
    });
  }
});


router.get("/getAll", (req, res, next) => {
  Payment.find()
    .exec()
    .then(payments => {
      res.status(200).json(payments);
    })
    .catch(err => {
      res.status(500).json(err);
    });
});





// router.post("/makePayout", async(req,res) => {
//   if (1 === 1) 
//     {
//       User.find({_id : req.body.uid})
//       .exec()
//       .then(user => {
//         if(user.length > 0)
//         {
//           // console.log(user.win_cash===undefined);

//           const win_cash = user[0]["win_cash"];
//           console.log(user);
//           if(win_cash === undefined || win_cash < parseInt(req.body.amount))
//           {
//             res.status(500).json({
//               message : "NOT ENOUGH CASH"
//             })
//           }
//           else
//           {
//               const new_win_cash = win_cash-req.body.amount;
//               console.log("NEW : "+new_win_cash);
//               let fund_account = {};
//               let contact = {
//                   "name": req.body.name,
//                   "email": req.body.email,
//                   "contact": req.body.mobile,
//                   "type": "customer",
//                   "reference_id": req.body.uid
//               };
//               let account_type = req.body.account_type; //bank_account or vpa

//               fund_account["account_type"] = account_type;
//               fund_account["contact"] = contact;
//               let mode = "IMPS";

//               if(req.body.account_type === "vpa")
//               {
//                   fund_account[account_type] = {
//                     "address" : req.body.UPI_ID
//                   };
//                   mode = "UPI";
//               }
//               else
//               {
//                   fund_account[account_type] = {
//                     "name" : req.body.account_holder_name,
//                     "ifsc" : req.body.ifsc,
//                     "account_number" : req.body.account_number
//                   };
//               }


//               let body = {
//                 "account_number": "4564563535948116",
//                 "amount": parseInt(req.body.amount)*100,
//                 "currency": "INR",
//                 "mode": mode, //NEFT or IMPS or UPI
//                 "purpose": "payout",
//                 "fund_account": fund_account,
//                 "queue_if_low_balance": true,
//                 "reference_id": req.body.uid,
//                 "narration": "Acadio"
//             };




//             var headers = {
//                 'Content-Type': 'application/json'
//             }
//             var options = {
//                 url: 'https://api.razorpay.com/v1/payouts',
//                 method: 'POST',
//                 headers: headers,
//                 json: body,
//                 auth: {
//                           username: process.env.razorIdkey,
//                           password: process.env.razorIdSecret
//                       }
//             }
//             request(options, async function (error, response, body) {
//                 if (!error && response.statusCode == 200) {
//                     // console.log(body);

//                     const payouts = new Payouts({
//                       _id : mongoose.Types.ObjectId(),
//                       uid : req.body.uid,
//                       payout_id : body.id,
//                       amt : req.body.amount,
//                       curr : "INR",
//                       dateTime : Date.now()
//                   });


//                   const [payout, user] = await Promise.all([
//                     payouts.save()
//                     .then(result => {
//                         console.log("PAYOUT SAVED");
//                     })
//                     .catch(err => {
//                         res.status(500).json({
//                             message : "ERROR"
//                         });
//                     }),

//                     User.update({_id : req.body.uid}, {$set : {win_cash : new_win_cash}})
//                     .exec()
//                     .then(result => {
//                         console.log("WIN CASH UPDATED");
//                     })
//                     .catch(err => {
//                       res.status(500).json({
//                           message : "ERROR"
//                       });
//                     })
//                   ]);

//                     res.status(200).json({
//                       message : "PAYOUT MADE"
//                     });

//                 } else {
//                     // console.log(body);
//                     res.status(500).json({
//                       message : body.error.description
//                     });
//                 }
//             })

//           }

//         }
//         else
//         {
//           res.status(500).json({
//             message : "NO USER"
//           })
//         }
//       })
//       .catch(err => {
//         res.status(500).json({
//           message : "ERROR"
//         })
//       });
//     } else {
//       res.status(500).json({
//       message: "NO AUTH",
//       });
//   }
// });




// router.post("/webhook",(req,res,next)=> {
//   // console.log(req.body.payload.payout.entity.id);
//   Payouts.find({payout_id: req.body.payload.payout.entity.id})
//   .exec()
//   .then(result => {
//     if(result.length>0)
//     {
//       if(req.body.event)
//       {
//         console.log("STATUS UPDATE");
//         Payouts.update({payout_id : req.body.payload.payout.entity.id}, {$set : {status : req.body.event, error : req.body.payload.payout.entity.failure_reason}})
//         .exec()
//         .then(async(r) => {
//           console.log("HERE : "+result[0]["status"]);
//             if(req.body.event==="payout.reversed" && result[0]["status"]!=="payout.reversed" && result[0]["status"]!=="payout.failed")
//             {
//               await User.find({_id: result[0]["uid"]})
//               .exec()
//               .then(async(user) => {
//                 let win_cash = user[0]["win_cash"];
//                 if (win_cash === undefined) win_cash = 0

//                 let new_win_cash = parseInt(win_cash) + parseInt(result[0]["amt"]);
//                 console.log(new_win_cash);
//                 await User.update({_id : result[0]["uid"]}, {$set : {win_cash : new_win_cash}})
//                 .exec()
//                 .then(async(result) => {
//                   res.status(200).json({
//                     message : "UPDATED"
//                   })
//                 })
//                 .catch(err => {
//                   res.status(500).json({
//                     message : "ERROR"
//                   })
//                 })

//               })
//               .catch(err => {
//                 res.status(500).json({
//                   message : "ERROR"
//                 })
//               })
//             }
//             else if(req.body.event==="payout.failed" && result[0]["status"]!=="payout.reversed" && result[0]["status"]!=="payout.failed")
//             {
//               await User.find({_id: result[0]["uid"]})
//               .exec()
//               .then(async(user) => {
//                 let win_cash = user[0]["win_cash"];
//                 if (win_cash === undefined) win_cash = 0

//                 let new_win_cash = parseInt(win_cash) + parseInt(result[0]["amt"]);
//                 console.log(new_win_cash);
//                 await User.update({_id : result[0]["uid"]}, {$set : {win_cash : new_win_cash}})
//                 .exec()
//                 .then(async(result) => {
//                   res.status(200).json({
//                     message : "UPDATED"
//                   })
//                 })
//                 .catch(err => {
//                   res.status(500).json({
//                     message : "ERROR"
//                   })
//                 })

//               })
//               .catch(err => {
//                 res.status(500).json({
//                   message : "ERROR"
//                 })
//               })
//             }
//             else
//             {
//               console.log("HERE 2");
//               res.status(200).json({
//                 message : "DONE"
//               })
//             }

//         })
//         .catch(err => {
//             res.status(200).json({
//                 message : "ERROR"
//             });
//         });
//       }
//       else
//       {
//         console.log("INVALID");
//       }
//     }
//     else
//     {
//       res.status(500).json({
//         message: "NO PAYOUT"
//       })
//     }
//   })
//   .catch(err => {
//     res.status(500).json({
//       message: "ERROR"
//     })
//   })
// });





module.exports = router;