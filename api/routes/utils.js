const Credit = require('../models/credit');
const SavingsMain = require('../models/savingsMain');
const Fees = require('../models/fees');
const Offers = require('../models/offers');
const CollectHomeRequestFees = require('../models/collectHomeRequestFees');
const UserDiscount = require('../models/userDiscount');

const updateCreditScore = async (uid, scoreAdd, type) => {
    try {
        Credit.find({ uid: uid })
            .exec()
            .then(result => {
                if (result.length !== 0) {
                    if (result[0]["feesSavings"][type] < 2) {
                        let newScore = 0, feesSavingsObj = {};
                        newScore = result[0]["creditScore"] + scoreAdd;
                        if (type === "fees") {
                            feesSavingsObj["fees"] = result[0]["feesSavings"]["fees"] + 1;
                            feesSavingsObj["savings"] = result[0]["feesSavings"]["savings"];
                        }
                        else if (type === "savings") {
                            feesSavingsObj["fees"] = result[0]["feesSavings"]["fees"];
                            feesSavingsObj["savings"] = result[0]["feesSavings"]["savings"] + 1;
                        }

                        console.log(feesSavingsObj);

                        Credit.update({ uid: uid }, { $set: { creditScore: newScore, feesSavings: feesSavingsObj } })
                            .exec()
                            .then(result => {
                                console.log("UPATED");
                            })
                            .catch(err => {
                                console.log("ERROR");
                            });
                    }
                }
            })
            .catch(err => {
                console.log("ERROR 2 : " + err);
            });
    }
    catch (e) {
        console.log("ERROR 3");
    }
}


const addBonus = async (uid, amt, reason) => {
    try {
        SavingsMain.find({ uid: uid })
            .exec()
            .then((savings) => {
                if (savings.length !== 0) {
                    console.log("HERE");
                    let bonusArray = [], bonusObj = {}, totalAmt = 0;
                    bonusObj["amt"] = amt;
                    bonusObj["reason"] = reason;
                    bonusObj["date"] = Date.now();

                    bonusArray = savings[0]["bonus"];
                    bonusArray.unshift(bonusObj);

                    totalAmt = savings[0]["totalAmt"] + amt;

                    console.log("HERE 2");

                    SavingsMain.update({ uid: uid }, { $set: { bonus: bonusArray, totalAmt: totalAmt } })
                        .exec()
                        .then(async (result) => {
                            console.log("SAVINGS MAIN UPDATED");
                        })
                        .catch(err => {
                            console.log("SAVINGS MAIN UPDATE ERROR");
                        })
                }
            })
            .catch((err) => {
                res.status(500).json({
                    error: err,
                });
            });
    }
    catch (e) {
        console.log("ERROR 3");
    }
}

const updateOffers = async (fid, uid, discount) => {
    try {
        Fees.find({ _id: fid, uid: uid })
            .exec()
            .then((fees) => {
                if (fees.length !== 0) {
                    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                    const currentDate = new Date();

                    Offers.find({ month: months[currentDate.getMonth()], year: currentDate.getFullYear() })
                        .exec()
                        .then(offers => {
                            // console.log("totalOffer = ", totalOffer);

                            if (offers.length !== 0) {
                                // let flag = false;

                                for (let j = 0; j < offers.length; j++) {
                                    let school = offers[j].schoolName;

                                    // offers found
                                    if (school.includes(fees[0]["schoolName"])) {
                                        console.log(" j === ", j, " school ======= ", fees[0]["schoolName"]);

                                        let leftOffers = offers[j]["leftOffers"];
                                        let offerObj = offers[j]["offer"];
                                        let count = offerObj[discount];
                                        if (count !== 0) {
                                            offerObj[discount] = count - 1;
                                        }
                                        if (leftOffers !== 0) {
                                            leftOffers = leftOffers - 1;
                                        }

                                        Offers.update({ schoolName: school, month: months[currentDate.getMonth()], year: currentDate.getFullYear() }, { $set: { leftOffers: leftOffers, offer: offerObj } })
                                            .exec()
                                            .then(async (result) => {
                                                console.log("OFFER UPDATED");
                                            })
                                            .catch(err => {
                                                console.log("OFFER UPDATE ERROR");
                                            })

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

                    // Offers.find({ schoolName: fees[0]["schoolName"], month: months[currentDate.getMonth()], year: currentDate.getFullYear() })
                    //     .exec()
                    //     .then((offers) => {
                    //         if (offers.length !== 0) {
                    //             let leftOffers = offers[0]["leftOffers"];
                    //             let offerObj = offers[0]["offer"];
                    //             let count = offerObj[discount];
                    //             if (count !== 0) {
                    //                 offerObj[discount] = count - 1;
                    //             }
                    //             if (leftOffers !== 0) {
                    //                 leftOffers = leftOffers - 1;
                    //             }
                    //             Offers.update({ schoolName: fees[0]["schoolName"], month: months[currentDate.getMonth()], year: currentDate.getFullYear() }, { $set: { leftOffers: leftOffers, offer: offerObj } })
                    //                 .exec()
                    //                 .then(async (result) => {
                    //                     console.log("OFFER UPDATED");
                    //                 })
                    //                 .catch(err => {
                    //                     console.log("OFFER UPDATE ERROR");
                    //                 })
                    //         }
                    //     })
                    //     .catch(err => {
                    //         console.log("OFFER UPDATE ERROR");
                    //     })
                }
            })
            .catch((err) => {
                res.status(500).json({
                    error: err,
                });
            });
    }
    catch (e) {
        console.log("ERROR 3");
    }
}

const expiredUpdateOffer = (cpid, fid, uid, discount) => {
    try {
        Fees.find({ _id: fid, uid: uid })
            .exec()
            .then((fees) => {
                if (fees.length !== 0) {
                    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                    const currentDate = new Date();

                    Offers.find({ month: months[currentDate.getMonth()], year: currentDate.getFullYear() })
                        .exec()
                        .then(offers => {
                            // console.log("totalOffer = ", totalOffer);

                            if (offers.length !== 0) {
                                // let flag = false;

                                for (let j = 0; j < offers.length; j++) {
                                    let school = offers[j].schoolName;

                                    // offers found
                                    if (school.includes(fees[0]["schoolName"])) {
                                        console.log(" j === ", j, " school ======= ", fees[0]["schoolName"]);

                                        let leftOffers = offers[j]["leftOffers"];
                                        let offerObj = offers[j]["offer"];

                                        if (offerObj[discount] !== undefined) {
                                            let count = offerObj[discount];

                                            offerObj[discount] = count + 1;
                                            leftOffers = leftOffers + 1;
                                            // if (count !== 0) {
                                            // }
                                            // if (leftOffers !== 0) {
                                            // }

                                            Offers.update({ schoolName: school, month: months[currentDate.getMonth()], year: currentDate.getFullYear() }, { $set: { leftOffers: leftOffers, offer: offerObj } })
                                                .exec()
                                                .then(async (result) => {
                                                    console.log("OFFER UPDATED");

                                                    UserDiscount.update({ cpid: cpid, offerUpdated: { $in: [false, undefined, null] } }, { $set: { offerUpdated: true } })
                                                        .exec()
                                                        .then(userDiscount => {
                                                            console.log("OFFER UPDATED = true ");
                                                        })
                                                        .catch(err => {
                                                            console.log(" Error = ", err);
                                                        })


                                                })
                                                .catch(err => {
                                                    console.log("OFFER UPDATE ERROR");
                                                })
                                        }

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

                    // Offers.find({ schoolName: fees[0]["schoolName"], month: months[currentDate.getMonth()], year: currentDate.getFullYear() })
                    //     .exec()
                    //     .then((offers) => {
                    //         if (offers.length !== 0) {
                    //             let leftOffers = offers[0]["leftOffers"];
                    //             let offerObj = offers[0]["offer"];

                    //             if (offerObj[discount] !== undefined) {
                    //                 let count = offerObj[discount];

                    //                 offerObj[discount] = count + 1;
                    //                 leftOffers = leftOffers + 1;
                    //                 // if (count !== 0) {
                    //                 // }
                    //                 // if (leftOffers !== 0) {
                    //                 // }

                    //                 Offers.update({ schoolName: fees[0]["schoolName"], month: months[currentDate.getMonth()], year: currentDate.getFullYear() }, { $set: { leftOffers: leftOffers, offer: offerObj } })
                    //                     .exec()
                    //                     .then(async (result) => {
                    //                         console.log("OFFER UPDATED");

                    //                         UserDiscount.update({ cpid: cpid, offerUpdated: { $in: [false, undefined, null] } }, { $set: { offerUpdated: true } })
                    //                             .exec()
                    //                             .then(userDiscount => {
                    //                                 console.log("OFFER UPDATED = true ");
                    //                             })
                    //                             .catch(err => {
                    //                                 console.log(" Error = ", err);
                    //                             })


                    //                     })
                    //                     .catch(err => {
                    //                         console.log("OFFER UPDATE ERROR");
                    //                     })
                    //             }
                    //         }
                    //     })
                    //     .catch(err => {
                    //         console.log("OFFER UPDATE ERROR");
                    //     })
                }
            })
            .catch((err) => {
                res.status(500).json({
                    error: err,
                });
            });
    }
    catch (e) {
        console.log("ERROR 3");
    }
}

const checkOfferExist = async (fid, uid) => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const currentDate = new Date();

    let existAndExpired = false;

    try {
        await CollectHomeRequestFees.find({ fid: fid, uid: uid, month: months[currentDate.getMonth()], status: "pending" })
            .exec()
            .then(requests => {
                console.log("requests == ", requests);
                console.log("requests.length == ", requests.length);

                if (requests.length !== 0) {

                    for (let i = 0; i < requests.length; i++) {
                        let diff = currentDate.getTime() - requests[i].date.getTime();
                        let dateDiff = Math.floor(diff / (1000 * 60 * 60));


                        if (dateDiff >= 48) {
                            existAndExpired = true;
                        }
                        else {
                            existAndExpired = false;
                            break;
                        }
                    }

                }
                else {
                    existAndExpired = true;
                }
            })
            .catch(err => {
                console.log(" Error 1 = ", err);
            })
    }
    catch (e) {
        console.log(" Error 2 = ", e);
    }

    return existAndExpired;
}

const getTotalAndLeftOffer = async (schoolName) => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const currentDate = new Date();

    let totalOffers = 0, leftOffers = 0;

    console.log(" school Name =================== ", schoolName);

    try {
        await Offers.find({ month: months[currentDate.getMonth()], year: currentDate.getFullYear() })
            .exec()
            .then(totalOffer => {
                // console.log("totalOffer = ", totalOffer);

                if (totalOffer) {
                    for (let j = 0; j < totalOffer.length; j++) {
                        let school = totalOffer[j].schoolName;

                        if (school.includes(schoolName)) {
                            console.log(" j === ", j, " school ======= ", schoolName);

                            totalOffers = totalOffer[j].totalOffers;
                            leftOffers = totalOffer[j].leftOffers;

                            // totalOffers.push({
                            //     schoolName: schoolName,
                            //     totalOffers: totalOffer[j].totalOffers,
                            //     leftOffers: totalOffer[j].leftOffers
                            // });

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
    }
    catch (e) {
        console.log(" Error 2 = ", e);
    }

    // getTotalAndLeftOffer(fees[i].schoolName)
    //                   .then(value => {
    //                     totalOffers.push(value)

    //                     console.log(" totalOffers === ", value);
    //                   })
    //                   .catch(err => {
    //                     res.status(500).json({
    //                       error: err
    //                     })
    //                   })

    return ({
        schoolName: schoolName,
        totalOffers: totalOffers,
        leftOffers: leftOffers
    });
}


module.exports = { updateCreditScore, addBonus, updateOffers, expiredUpdateOffer, checkOfferExist, getTotalAndLeftOffer }