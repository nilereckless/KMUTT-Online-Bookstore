const { request } = require('express');
let express = require('express');
const { restart } = require('nodemon');
let router = express.Router();
let dbConn = require('../lib/db');
var ReportPaymentController = require('../controller/reportPaymentController');
const CryptoJS = require("crypto-js");
let helpers = require('../lib/helpers');

router.post('/upload', async (req, res, next) => {
    console.log("nile1");
   // let userID = 1
    let fullName = req.body.customerName;
    let eMail = req.body.customerEmail;
    let phone = req.body.customerPhone;
    let slip = req.body.slip;
    let orderNumber = req.body.orderNumber;
    let date = req.body.dateTime;
    let amount = req.body.amount;
    let note = req.body.customerNote;
    console.log("req files" + req.files);
    try {
        var path = null;
        var slipImg = null;
        if (!req.files) {
            path = imageUrl
        } else {
            console.log("aek" + req.files);
            slipImg = req.files.slip;
            let filename = CryptoJS.MD5(Math.floor(Date.now() / 1000) + slipImg.name).toString();
            var trimmedString = filename.substring(0, 12);
            path = `upload/slip/${trimmedString}.${helpers.getExtension(slipImg.name)}`;
            if (!helpers.imageFilter(slipImg.name)) {
                req.flash('error', 'Upload image is invalid!');
                res.redirect('/books/reportPayment');
                return;
            }
            slipImg.mv('public/' + path, function (err) {
                if (err) {
                    req.flash('error', 'Upload image is invalid!');

                    res.redirect('/books');
                }

            });
            var reportPayControl = await ReportPaymentController.addReportPayment(req.user.id, fullName, eMail, phone, orderNumber, date, path, amount, note);
        }


    } catch (e) {
        console.log(e);
    }

    res.json('success or not');
})


module.exports = router;