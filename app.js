const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const user = require('./api/routes/user');
const booksell = require('./api/routes/booksell');
const bookbuy = require('./api/routes/bookbuy');
const fees = require('./api/routes/fees');
const razorpay = require('./api/routes/razorpay');
const paylater = require("./api/routes/paylater");
const saving = require("./api/routes/savings");
const feesStructure = require("./api/routes/feesStructure");
const card = require("./api/routes/card");
const cors = require('cors');
const offers = require('./api/routes/offers');
const school = require('./api/routes/school');
const canteen = require('./api/routes/canteen');
const canteenStructure = require('./api/routes/canteenStructure');

app.use(cors());

//MongoDB
// Original Database Link
// "mongodb+srv://merape:YjPR9konLJBm2mTL@cluster0.ufegjop.mongodb.net/?retryWrites=true&w=majority",

// Temperary Database

mongoose.connect(
    "mongodb+srv://merapay:merapay@123@cluster0.tzdl0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: true
    }
).then(() => {
    console.log('Connected to database !!');
})
    .catch((err) => {
        console.log('Connection failed !!' + err.message);
    });


mongoose.Promise = global.Promise;


//Logs - info about requests
app.use(morgan('dev'));

//Parse incoming json body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Handling CORS error
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }

    next();
});


//s
app.use('/user', user);
app.use('/bookSell', booksell);
app.use('/bookBuy', bookbuy);
app.use('/fees', fees);
app.use('/razorpay', razorpay);
app.use('/paylater', paylater);
app.use('/saving', saving);
app.use('/feesStructure', feesStructure);
app.use('/card', card);
app.use('/offer', offers);
app.use('/school', school);
app.use('/canteenStructure', canteenStructure);
app.use('/canteen', canteen);




app.get("/backup", async (req, res) => {
    const map = new Map();
    const [pools, rules] = await Promise.all([
        Pool.find().then(foundPools => {
            map.set("pools", foundPools);
        }),
        Rules.find().then(foundRules => {
            map.set("rules", foundRules)
        })
    ])

    res.json([...map]);

});




app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
})

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: { message: error.message }
    });
});



module.exports = app;
