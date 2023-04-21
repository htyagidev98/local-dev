let mongoose = require('mongoose')
let express = require('express')
let request = require('request')
const nodemailer = require('nodemailer');
let messageBird = require('messagebird')('l7iGIM4xsgZlf17ShuPzHEhHo')
const uuid = require('uuid')
const User = require("../../models/user")
const ChatSchema = require('../../models/whatsAppChats')
let router = express.Router()
let paytm_config = require("../../paytm/paytm_config")
let paymentChecksum = require("../../paytm/CheckSumHash")
let uuidv4 = require("uuid/v4")
let BusinessPlan = require('../../models/businessPlan')
let BusinessPlansOrders = require('../../models/business-plans-orders')
let axios = require("axios")

router.post('/generate/checksum', async (req, res, next) => {
    // console.log("Checksum generate called...", req.body)
    let id = req.body.businessId
    let price = req.body.price
    let plans = req.body.plans

    let getUser = await User.findOne({ _id: mongoose.Types.ObjectId(id) }).exec()
    // console.log("Payment ..", getUser.business_info._id.toString())

    let order = {
        order_id: mongoose.Types.ObjectId(),
        business: mongoose.Types.ObjectId(id),
        amount: price,
        payment_mode: "Paytm",
        plans: plans,
        received_by: "Autroid Business",
        transaction_id: mongoose.Types.ObjectId(),
    }
    let businessPlan = await BusinessPlansOrders.create(order)
    // console.log("BusinessPlan", businessPlan)

    var paramarray = {
        MID: paytm_config.paytm_config.MID,
        ORDER_ID: businessPlan.transaction_id.toString(),
        CUST_ID: id.toString(),
        INDUSTRY_TYPE_ID: paytm_config.paytm_config.INDUSTRY_TYPE_ID,
        CHANNEL_ID: "WEB",
        TXN_AMOUNT: price.toString(),
        WEBSITE: paytm_config.paytm_config.WEBSITE,
        CALLBACK_URL: "https://13.234.81.188:443/api/payment/payment/status",
        EMAIL: getUser.email,
        MOBILE_NO: getUser.contact_no
    };

    let generatedChecksum = paymentChecksum.generateSignature(paramarray, "tR3JLFqzD!8yXKJC")
    generatedChecksum.then(result => {
        // console.log("generateSignature Returns: " + result);


        // paytm_checksum.genchecksum(paramarray, paytm_config.MERCHANT_KEY, function (err, data) {
        // console.log("Checksum data...", paramarray)
        var verifyChecksum = paymentChecksum.verifySignature(paramarray, "tR3JLFqzD!8yXKJC", result);
        // console.log("verifySignature Returns: " + verifyChecksum);
        if (!result) {
            res.status(422).json({
                responseCode: 422,
                responseMessage: "failure",
                responseData: err
            });
        }
        else {
            res.status(200).json({
                responseCode: 200,
                responseMessage: "Checksum generated",
                hash: result,
                responseData: paramarray
            });
        }
    });
})



router.post('/payment/status', async (req, res, next) => {
    // console.log("Payment Success Api is called.....", req.body)
    let payment = req.body
    if (payment.STATUS == 'TXN_SUCCESS') {
        let order = await BusinessPlansOrders.findOne({ transaction_id: mongoose.Types.ObjectId(payment.ORDERID) }).exec()

        await axios.put('https://13.234.81.188:443/api/admin/business-plan/update', {
            headers: {
                "Authorization": "AccessKey l7iGIM4xsgZlf17ShuPzHEhHo",
                "Content-Type": "application/json",
                "Accept-Encoding": "gzip, deflate, br"
            },

            paid: order.amount,
            payment_mode: order.payment_mode,
            plans: order.plans,
            received_by: order.received_by,
            transaction_id: order.transaction_id,
            user: order.business

        }).then(data => {
            // console.log("Your user data...", data)
            if (data.data.responseCode == '200') {
                return res.redirect('https://business.autroid.com/payment-success')
            }
        })
            .catch(err => {
                // console.log("ERROR: ", err)
            })
    }

    //res.redirect('http://localhost:4200/payment-success')
})


module.exports = router
