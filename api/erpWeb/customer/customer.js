var mongoose = require('mongoose'),
    express = require('express'),
    router = express.Router(),
    config = require('../../../config'),
    businessFunctions = require('../businessFunctions'),
    bcrypt = require('bcrypt-nodejs'),
    assert = require('assert'),
    jwt = require('jsonwebtoken'),
    aws = require('aws-sdk'),
    multerS3 = require('multer-s3'),
    uuidv1 = require('uuid/v1'),
    Validator = require('validatorjs'),
    multer = require('multer'),
    moment = require('moment-timezone'),
    redis = require('redis'),
    FCM = require('fcm-node'),
    q = require('q'),
    xlsxtojson = require("xlsx-to-json-lc"), //Abhinav
    xlstojson = require("xls-to-json-lc"), //Abhinav
    // bodyParser = require('body-parser'),       //Abhinav
    request = require('request');

// app.use(bodyParser.json());
//webpush = require('web-push');

var s3 = new aws.S3({
    accessKeyId: config.IAM_USER_KEY,
    secretAccessKey: config.IAM_USER_SECRET,
    Bucket: config.BUCKET_NAME
});


var client = redis.createClient({ host: 'localhost', port: 6379 });

const xAccessToken = require('../../../middlewares/xAccessTokenBusiness');
const fun = require('../../function');
const event = require('../../event');
const whatsAppEvent = require('../../whatsapp/whatsappEvent')
var paytm_config = require('../../../paytm/paytm_config').paytm_config;
var paytm_checksum = require('../../../paytm/checksum');

var salt = bcrypt.genSaltSync(10);
const User = require('../../../models/user');
const BusinessTiming = require('../../../models/businessTiming');
const BusinessConvenience = require('../../../models/businessConvenience');
const BookingTiming = require('../../../models/bookingTiming');
// const Type = require('../../../models/type');
// const BusinessType = require('../../../models/businessType');
const Category = require('../../../models/category');
const Automaker = require('../../../models/automaker');
const Model = require('../../../models/model');
const QuotationOrders = require('../../../models/quotationOrders')
const OrderLogs = require('../../../models/orderLogs')
const State = require('../../../models/state');
const BookingCategory = require('../../../models/bookingCategory');
const ProductImage = require('../../../models/productImage');
const Country = require('../../../models/country');
const BusinessOffer = require('../../../models/businessOffer');
const BusinessUser = require('../../../models/businessUser');
const ProductOffer = require('../../../models/productOffer');
const Order = require('../../../models/order');
const BusinessOrder = require('../../../models/businessOrder');
const OrderLine = require('../../../models/orderLine');
const OrderConvenience = require('../../../models/orderConvenience');
const OrderInvoice = require('../../../models/orderInvoice');
const BookmarkProduct = require('../../../models/bookmarkProduct');
const BookmarkOffer = require('../../../models/bookmarkOffer');
const Car = require('../../../models/car');
const CarSell = require('../../../models/carSell');
const Asset = require('../../../models/asset');
const CarImage = require('../../../models/carImage');
const CarDocument = require('../../../models/carDocument');
const BookmarkCar = require('../../../models/bookmarkCar');
const BodyStyle = require('../../../models/bodyStyle');
const FuelType = require('../../../models/fuelType');
const Transmission = require('../../../models/transmission');
const Color = require('../../../models/color');
const Owner = require('../../../models/owner');
const ServiceGallery = require('../../../models/serviceGallery'); //abhinav
const BusinessGallery = require('../../../models/businessGallery');
const Variant = require('../../../models/variant');
const ClaimBusiness = require('../../../models/claimBusiness');
const Review = require('../../../models/review');
const Battery = require('../../../models/battery');
const BatteryBrand = require('../../../models/batteryBrand');
const TyreSize = require('../../../models/tyreSize');
const Booking = require('../../../models/booking');
const Lead = require('../../../models/lead');
const Service = require('../../../models/service');
const Customization = require('../../../models/customization');
const Collision = require('../../../models/collision');
const Washing = require('../../../models/washing');
const ProductCategory = require('../../../models/productCategory');
const Product = require('../../../models/product');
const ProductBrand = require('../../../models/productBrand');
const ProductModel = require('../../../models/productModel');
const BusinessProduct = require('../../../models/businessProduct');
const LeadRemark = require('../../../models/leadRemark');
const LeadGenRemark = require('../../../models/leadGenRemark');
const LeadStatus = require('../../../models/leadStatus');
const Package = require('../../../models/package');
const UserPackage = require('../../../models/userPackage');
const PackageUsed = require('../../../models/packageUsed');
const Management = require('../../../models/management');
const LeadManagement = require('../../../models/leadManagement');
const Address = require('../../../models/address');
const Gallery = require('../../../models/gallery');
const Coupon = require('../../../models/coupon');
const Detailing = require('../../../models/detailing');
const CouponUsed = require('../../../models/couponUsed');
const Purchase = require('../../../models/purchase');
const PurchaseReturn = require('../../../models/purchaseReturn');
const PurchaseOrder = require('../../../models/purchaseOrder');
const Tax = require('../../../models/tax');
const BusinessVendor = require('../../../models/businessVendor');
const JobInspection = require('../../../models/jobInspection');
const ClubMember = require('../../../models/clubMember');
const InsuranceCompany = require('../../../models/insuranceCompany');
const LabourRate = require('../../../models/labourRate');
const Point = require('../../../models/point');
const QualityCheck = require('../../../models/qualityCheck');
const Invoice = require('../../../models/invoice');
const Expense = require('../../../models/expense');
const Estimate = require('../../../models/estimate');
const StockLogs = require('../../../models/stockLogs');
// Vinay Model added
const VendorOrders = require('../../../models/vendorOrders');

const TransactionLog = require('../../../models/transactionLog');
const RFQ = require('../../../models/rfq');
const Quotation = require('../../../models/quotation');
const BusinessPlan = require('../../../models/businessPlan');
const Referral = require('../../../models/referral');
const ManagementRole = require('../../../models/managementRole');
const Location = require('../../../models/location');
const BusinessSetting = require('../../../models/businessSetting');
const ExpenseCategory = require('../../../models/expenseCategory');
const ReviewPoint = require('../../../models/reviewPoint');
const LeadGen = require('../../../models/leadGen');
const SuitePlan = require('../../../models/suitePlan');
const { updateMany } = require('../../../models/user');
const { filter, rangeRight } = require('lodash');



var secret = config.secret;
var Log_Level = config.Log_Level

router.get('/leads/type/counts/get', /* xAccessToken.token,*/ async function (req, res, next) {
    businessFunctions.logs("INFO: /leads/type/counts/get Api Called from customer.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));
    var rules = {
        // from: 'required',
        // to: 'required'
        query: 'required'
    };

    var validation = new Validator(req.query, rules);

    if (validation.fails()) {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR: Validation failed, Date are required in query.");
        }
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Date are required",
            responseData: {
                res: validation.errors.all()
            }
        })
    }
    else {
        // req.headers['x-access-token var token = '];
        // var secret = config.secret;
        // var decoded = jwt.verify(token, secret);
        // var user = decoded.user;
        var date = new Date();
        var business = req.headers['business'];
        var from = new Date()
        var to = new Date()
        var analytics = [];

        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Validated successfully and getting date from query.");
        }
        if (parseInt(req.query.query) == 0) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }
        else if (parseInt(req.query.query) >= 1) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }
        else {
            var query = 30;
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }


        var startDate = moment(from);
        var endDate = moment(to);
        var duration = endDate.diff(startDate, 'days', true);
        var range = { $gte: from, $lte: to };
        var totalCountClosed = 0;
        var totalCountFollowUP = 0;
        var totalCountLostLead = 0;
        var totalCountCancleBooking = 0;
        var totalCountMissedBooking = 0;

        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG :Getting Total Closed Leads || FollowUp Leads || Lost Leads ||Cancel Bookings||Missed Booking Counts, From Date:" + from + "-" + "To:" + to);
        }
        var totalCountClosed = await Lead.find({ "remark.status": "Closed", updated_at: range, business: business }).count().exec();
        var totalCountFollowUP = await Lead.find({ "remark.status": "Follow-Up", updated_at: range, business: business }).count().exec();
        var totalCountLostLead = await Lead.find({ "remark.status": "Lost", updated_at: range, business: business }).count().exec();
        var totalCountCancleBooking = await Booking.find({ status: "Cancelled", business: business, created_at: range }).count().exec();
        // var totalCountCancleBooking = await Booking.find({ status : "Cancelled",business: business, created_at: range }).count().exec();

        var date_missed = new Date()
        var missedDate = new Date(date_missed.getFullYear(), date.getMonth(), date.getDate() + 1);
        //    specification['date'] = { $lt: missedDate }
        // console.log("Missed Date = " + missedDate)
        var totalCountMissedBooking = await Booking.find({ status: "Confirmed", is_services: true, date: { $lt: missedDate }, business: business, created_at: range }).count().exec();


        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Sending Total Closed Leads || FollowUp Leads || Lost Leads ||Cancel Bookings||Missed Booking Counts in Response.");
        }
        res.status(200).json({
            responseCode: 200,
            responseData: {
                totalCountClosed: totalCountClosed,
                totalCountFollowUP: totalCountFollowUP,
                totalCountLostLead: totalCountLostLead,
                totalCountCancleBooking: totalCountCancleBooking,
                totalCountMissedBooking: totalCountMissedBooking
            },

        });
        if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("INFO: Response Sends Successfully.");
        }
    }
});

router.get('/customer-overview/leads', /* xAccessToken.token,*/ async function (req, res, next) {
    businessFunctions.logs("INFO: /customer-overview/leads Api Called from customer.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    var rules = {
        query: 'required'
    };
    var validation = new Validator(req.query, rules);
    if (validation.fails()) {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR: Validation failed, Date are required in query.");
        }
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Date are required",
            responseData: {
                res: validation.errors.all()
            }
        })
    }


    else {
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var user = decoded.user;
        var date = new Date();
        var business = req.headers['business']
        var user = await User.findById(decoded.user).exec();

        var from = new Date()
        var to = new Date()
        var analytics = [];
        var bills = [];
        var analyticsRevenue = [];

        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Validated successfully and getting date from query.");
        }
        if (parseInt(req.query.query) == 0) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }
        else if (parseInt(req.query.query) >= 1) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }
        else {
            var query = 30;
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }

        var startDate = moment(from);
        var endDate = moment(to);
        var duration = endDate.diff(startDate, 'days', true);
        var count = 0
        var totalExpenceCost = 0
        // console.log("TO  = " + to)
        // console.log("From = " + from + " \n To= " + to)
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG :Getting Lead Details from various sources, From Date:" + from + "-" + "To:" + to + ", " + "User:" + user.name);
        }
        await Lead.find({ created_at: { $gte: from, $lte: to }, business: business })
            .cursor().eachAsync(async (lead) => {
                // if

                // 

                var month = moment(lead.updated_at).tz(req.headers['tz']).format('MMMM YYYY');
                if (duration <= 31) {
                    month = moment(lead.updated_at).tz(req.headers['tz']).format('MMM DD');
                }
                var source = ''
                if (lead.source == "Booking" || lead.source == "") {
                    source = "Walk-in";
                } else {
                    source = lead.source
                }
                analytics.push({
                    // expenceTotal: expenceTotal,
                    source: source,
                    sort: moment(lead.updated_at).tz(req.headers['tz']).format('YYYY-MM-DD'),
                    month: month
                });
            })

        // return res.json(analytics)
        analytics = _.orderBy(analytics, ['sort'], ['asc'])
        var data = _(analytics).groupBy('source').map((objs, key) => ({
            total: objs.length,
            month: key,
            // source: (objs, 'source'),
            value: objs

        })
        ).value();
        // console.log("Data Length = " + data.length)
        data.sort(function (a, b) {
            return b.total - a.total;
        });
        // values = [1, 65, 8, 98, 689, 12, 33, 2, 3, 789];
        // var topValues = data.sort((a, b) => b - a).slice(0, 5);
        // console.log("Top Values" + topValues); // [789,689,98,65,33]
        // return res.json(data)
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG :Sending Leads in Response:" + from + "-" + "To:" + to + ", " + "User:" + user.name);
        }
        var leads = []
        if (data.length > 7) {
            data.length = 7
        } else {
            data.length = data.length
        }
        for (var i = 0; i < data.length; i++) {
            var dt = data[i].value
            leads.push({
                data:
                    _(dt).groupBy('month').map((objs, key) => ({
                        total: objs.length,
                        month: key,
                        // source: (objs, 'source'),
                        // value: objs

                    })
                    ).value(),
                source: data[i].month
            })
        }
        // return res.json(mapd)
        /////////////
        // analytics = _.orderBy(analytics, ['sort'], ['asc'])
        // var data = _(analytics).groupBy('month').map((objs, key) => ({
        //     total: objs.length,
        //     month: key,
        //     // source: (objs, 'source'),
        //     value: objs
        // })
        // ).value();
        res.status(200).json({
            responseCode: 200,
            responseMessage: {
                total: data.total
            },
            responseData: leads
        });
        if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("INFO: Leads sends in Response successfully" + ", " + "User:" + user.name);
        }
    }
});

router.get('/customer-overview/bookings', /* xAccessToken.token,*/ async function (req, res, next) {
    businessFunctions.logs("INFO: /customer-overview/bookings Api Called from customer.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));
    var rules = {
        query: 'required'
    };
    var validation = new Validator(req.query, rules);
    if (validation.fails()) {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR: Validation failed, Date are required in query.");
        }
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Date are required",
            responseData: {
                res: validation.errors.all()
            }
        })
    }
    else {
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var user = decoded.user;
        var date = new Date();
        var business = req.headers['business']
        var user = await User.findById(decoded.user).exec();

        var from = new Date()
        var to = new Date()
        var analytics = [];
        var bills = [];
        var analyticsRevenue = [];

        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Validated successfully and getting date from query.");
        }
        if (parseInt(req.query.query) == 0) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }
        else if (parseInt(req.query.query) >= 1) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        }
        else {
            var query = 30;
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }

        var startDate = moment(from);
        var endDate = moment(to);
        var duration = endDate.diff(startDate, 'days', true);
        var count = 0
        var totalExpenceCost = 0

        // console.log("From = " + from + " \n To= " + to)
        var jobsStatus = ["JobOpen", "In-Process", "CompleteWork", "QC", "StoreApproval", "Ready", "Completed", "Closed"]
        var bookingStatus = ["Confirmed", "Pending", "EstimateRequested", "JobInititated", "Cancelled"]

        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG :Getting Bookings Details, From Date:" + from + "-" + "To:" + to + ", " + "User:" + user.name);
        }
        await Booking.find({ is_services: true, status: { $in: bookingStatus }, created_at: { $gte: from, $lte: to }, business: business }).populate('user')
            .cursor().eachAsync(async (booking) => {


                if (booking.user) {
                    // console.log("Contact NO :" + user.contact_no)
                    var firstLead = await Lead.findOne({ business: business, contact_no: booking.user.contact_no }).sort({ created_at: 1 }).exec();
                    // return res.json({ abhi: firstLead })
                    // var leads = firstLead.pop();
                    // return res.json({ abhi: leads })

                    var source = ''
                    if (firstLead) {

                        if (firstLead.source == "Booking" || firstLead.source == "") {
                            source = "Walk-in";
                        } else {
                            source = firstLead.source
                        }
                    }
                } else {
                    // console.log("Lead Not NOt Found   } ")
                    source = "Walk-in";
                }
                var month = moment(booking.created_at).tz(req.headers['tz']).format('MMMM YYYY');
                if (duration <= 31) {
                    month = moment(booking.created_at).tz(req.headers['tz']).format('MMM DD');
                }
                analytics.push({
                    source: source,
                    sort: moment(booking.created_at).tz(req.headers['tz']).format('YYYY-MM-DD'),
                    month: month
                });
            })

        // return res.json(analytics)
        analytics = _.orderBy(analytics, ['sort'], ['asc'])
        var data = _(analytics).groupBy('source').map((objs, key) => ({
            total: objs.length,
            month: key,
            value: objs
        })
        ).value();
        // console.log("Data Length = " + data.length)
        data.sort(function (a, b) {
            return b.total - a.total;
        });
        // return res.json(data)

        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG :Sending Leads Details along with the booking in Response:" + from + "-" + "To:" + to + ", " + "User:" + user.name);
        }
        var leads = []
        if (data.length > 7) {
            data.length = 7
        } else {
            data.length = data.length
        }

        for (var i = 0; i < data.length; i++) {
            var dt = data[i].value
            leads.push({
                data:
                    _(dt).groupBy('month').map((objs, key) => ({
                        total: objs.length,
                        month: key,
                        // value: objs
                    })
                    ).value(),
                source: data[i].month
            })
        }
        // return res.json(mapd)
        res.status(200).json({
            responseCode: 200,
            responseMessage: {
                total: data.total
            },
            responseData: leads
        });
        if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("INFO: Leads sends in Response successfully" + ", " + "User:" + user.name);
        }
    }
});

router.get('/customer-overview/jobs', /* xAccessToken.token,*/ async function (req, res, next) {
    businessFunctions.logs("INFO: /customer-overview/jobs Api Called from business.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));
    var rules = {
        query: 'required'
    };
    var validation = new Validator(req.query, rules);
    if (validation.fails()) {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR: Validation failed, Date are required in query.");
        }
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Date are required",
            responseData: {
                res: validation.errors.all()
            }
        })
    } else {
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var user = decoded.user;
        var date = new Date();
        var business = req.headers['business']
        var user = await User.findById(decoded.user).exec();

        var from = new Date()
        var to = new Date()
        var analytics = [];
        var bills = [];
        var analyticsRevenue = [];


        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Validated successfully and getting date from query.");
        }
        if (parseInt(req.query.query) == 0) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        } else if (parseInt(req.query.query) >= 1) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        } else {
            var query = 30;
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }

        var startDate = moment(from);
        var endDate = moment(to);
        var duration = endDate.diff(startDate, 'days', true);
        var count = 0
        var totalExpenceCost = 0

        // console.log("From = " + from + " \n To= " + to)
        var jobsStatus = ["JobOpen", "In-Process", "CompleteWork", "QC", "StoreApproval", "Ready", "Completed", "Closed"]
        var bookingStatus = ["Confirmed", "Pending", "EstimateRequested", "JobInititated", "Cancelled"]

        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG :Getting Bookings Details along with the job status, From Date:" + from + "-" + "To:" + to + ", " + "User:" + user.name);
        }
        await Booking.find({ is_services: true, status: { $in: jobsStatus }, created_at: { $gte: from, $lte: to }, business: business }).populate('user')
            .cursor().eachAsync(async (booking) => {


                if (booking.user) {
                    // console.log("Contact NO :" + user.contact_no)
                    var firstLead = await Lead.findOne({ business: business, contact_no: booking.user.contact_no }).sort({ created_at: 1 }).exec();
                    // return res.json({ abhi: firstLead })
                    // var leads = firstLead.pop();
                    // return res.json({ abhi: leads })
                    var source = ''
                    if (firstLead) {

                        if (firstLead.source == "Booking" || firstLead.source == "") {
                            source = "Walk-in";
                        } else {
                            source = firstLead.source
                        }
                    }
                } else {
                    // console.log("Lead Not NOt Found   } ")
                    source = "Walk-in";
                }
                var month = moment(booking.created_at).tz(req.headers['tz']).format('MMMM YYYY');
                if (duration <= 31) {
                    month = moment(booking.created_at).tz(req.headers['tz']).format('MMM DD');
                }

                analytics.push({
                    source: source,
                    sort: moment(booking.created_at).tz(req.headers['tz']).format('YYYY-MM-DD'),
                    month: month
                });
            })

        // return res.json(analytics)
        analytics = _.orderBy(analytics, ['sort'], ['asc'])
        var data = _(analytics).groupBy('source').map((objs, key) => ({
            total: objs.length,
            month: key,
            value: objs
        })).value();
        // console.log("Data Length = " + data.length)
        data.sort(function (a, b) {
            return b.total - a.total;
        });
        // return res.json(data)
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG :Sending Leads Details along with the booking and job status in Response:" + from + "-" + "To:" + to + ", " + "User:" + user.name);
        }
        var leads = []
        if (data.length > 7) {
            data.length = 7
        } else {
            data.length = data.length
        }
        for (var i = 0; i < data.length; i++) {
            var dt = data[i].value
            leads.push({
                data: _(dt).groupBy('month').map((objs, key) => ({
                    total: objs.length,
                    month: key,
                    // value: objs
                })).value(),
                source: data[i].month
            })
        }
        // return res.json(mapd)
        res.status(200).json({
            responseCode: 200,
            responseMessage: {
                total: data.total
            },
            responseData: leads
        });
        if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("INFO: Leads sends in Response successfully" + ", " + "User:" + user.name);
        }
    }
});

router.get('/customer-overview/leads/revenue', /* xAccessToken.token,*/ async function (req, res, next) {
    businessFunctions.logs("INFO: /customer-overview/leads/revenue Api Called from customer.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    var rules = {
        query: 'required'
    };
    var validation = new Validator(req.query, rules);
    if (validation.fails()) {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR: Validation failed, Date are required in query.");
        }
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Date are required",
            responseData: {
                res: validation.errors.all()
            }
        })
    } else {
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var user = decoded.user;
        var date = new Date();
        var business = req.headers['business']
        var user = await User.findById(decoded.user).exec();

        var from = new Date()
        var to = new Date()
        var analytics = [];
        var bills = [];
        var analyticsRevenue = [];

        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Validated successfully and getting date from query.");
        }
        if (parseInt(req.query.query) == 0) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        } else if (parseInt(req.query.query) >= 1) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        } else {
            var query = 30;
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }

        var startDate = moment(from);
        var endDate = moment(to);
        var duration = endDate.diff(startDate, 'days', true);
        var count = 0
        var totalExpenceCost = 0

        // console.log("From = " + from + " \n To= " + to)
        // var jobsStatus = ["JobOpen", "In-Process", "CompleteWork", "QC", "StoreApproval", "Ready", "Completed", "Closed"]
        // var bookingStatus = ["Confirmed", "Pending", "EstimateRequested", "JobInititated", "Cancelled"]
        // var jobsStatus = ["JobOpen", "In-Process", "CompleteWork", "QC", "StoreApproval", "Ready", "Completed", "Closed"]

        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG :Getting Invoice details from database, From Date:" + from + "-" + "To:" + to + ", " + "User:" + user.name);
        }
        await Invoice.find({ status: "Active", created_at: { $gte: from, $lte: to }, business: business }).populate('user')
            .cursor().eachAsync(async (invoice) => {
                var source = ''
                if (invoice.user) {
                    //console.log("Contact NO :" + invoice.user.contact_no)
                    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                        businessFunctions.logs("DEBUG :Invoice Exists and Getting Lead details" + ", " + "Contact No:" + invoice.user.contact_no);
                    }
                    var firstLead = await Lead.findOne({ business: business, contact_no: invoice.user.contact_no }).sort({ created_at: 1 }).exec();
                    if (firstLead) {
                        // console.log("Lead Source =" + firstLead.source + "-")
                        if (firstLead.source == "Booking" || firstLead.source == "" || firstLead.source == " ") {
                            source = "Walk-in";
                        } else {
                            source = firstLead.source
                        }
                    }
                } else {
                    // console.log("Lead Not NOt Found   } ")
                    source = "Walk-in";
                }
                // console.log("Source = " + source)
                // var month = moment(invoice.created_at).tz(req.headers['tz']).format('MMMM YYYY');
                // if (duration <= 31) {
                //     month = moment(invoice.created_at).tz(req.headers['tz']).format('MMM DD');
                // }
                analytics.push({
                    source: source,
                    revenue: invoice.payment.total,
                    sort: moment(invoice.created_at).tz(req.headers['tz']).format('YYYY-MM-DD'),
                    // month: month
                });
            })
        // return res.json(analytics)
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG :Sending Leads Revenue Details in Response:" + from + "-" + "To:" + to + ", " + "User:" + user.name);
        }
        analytics = _.orderBy(analytics, ['sort'], ['asc'])
        var data = _(analytics).groupBy('source').map((objs, key) => ({
            total: objs.length,
            source: key,
            // value: objs,
            revenu: parseInt(_.sumBy(objs, 'revenue')),
        })).value();

        // console.log("Data Length = " + data.length)
        // var leadsCounts = data
        // leadsCounts.sort(function (a, b) {
        //     return b.total - a.total;
        // });
        //  return res.json(leadsCounts)
        data.sort(function (a, b) {
            return b.revenu - a.revenu;
        });
        var leadsCounts = data
        leadsCounts.sort(function (a, b) {
            return b.total - a.total;
        });
        if (data.length > 5) {
            data.length = 5
        } else {
            data.length = data.length
        }
        //  return res.json(leadsCounts)
        // var leads = []
        // for (var i = 0; i < data.length; i++) {
        //     var dt = data[i].value
        //     leads.push({
        //         data:
        //             _(dt).groupBy('month').map((objs, key) => ({
        //                 total: objs.length,
        //                 month: key,
        //                 // value: objs
        //             })
        //             ).value(),
        //         source: data[i].month
        //     })
        // }
        // return res.json(mapd)
        res.status(200).json({
            responseCode: 200,
            responseMessage: {
                total: data.total
            },
            responseData: {
                leadsCount: leadsCounts,
                leadsRevenue: data
            }
        });
        if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("INFO: Leads Revenue Details sends in Response successfully" + ", " + "User:" + user.name);
        }
    }
});

router.get('/customer-overview/jobs', /* xAccessToken.token,*/ async function (req, res, next) {
    businessFunctions.logs("INFO: /customer-overview/jobs Api Called from customer.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    var rules = {
        query: 'required'
    };
    var validation = new Validator(req.query, rules);
    if (validation.fails()) {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR: Validation failed, Date are required in query.");
        }
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Date are required",
            responseData: {
                res: validation.errors.all()
            }
        })
    }
    else {
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var user = decoded.user;
        var date = new Date();
        var business = req.headers['business']
        var user = await User.findById(decoded.user).exec();

        var from = new Date()
        var to = new Date()
        var analytics = [];
        var bills = [];
        var analyticsRevenue = [];

        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Validated successfully and getting date from query.");
        }
        if (parseInt(req.query.query) == 0) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }
        else if (parseInt(req.query.query) >= 1) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        }
        else {
            var query = 30;
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }

        var startDate = moment(from);
        var endDate = moment(to);
        var duration = endDate.diff(startDate, 'days', true);
        var count = 0
        var totalExpenceCost = 0

        // console.log("From = " + from + " \n To= " + to)
        var jobsStatus = ["JobOpen", "In-Process", "CompleteWork", "QC", "StoreApproval", "Ready", "Completed", "Closed"]
        var bookingStatus = ["Confirmed", "Pending", "EstimateRequested", "JobInititated", "Cancelled"]
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG :Getting Bookings Details along with the job status, From Date:" + from + "-" + "To:" + to + ", " + "User:" + user.name);
        }
        await Booking.find({ is_services: true, status: { $in: jobsStatus }, created_at: { $gte: from, $lte: to }, business: business }).populate('user')
            .cursor().eachAsync(async (booking) => {


                if (booking.user) {
                    // console.log("Contact NO :" + user.contact_no)
                    var firstLead = await Lead.findOne({ business: business, contact_no: booking.user.contact_no }).sort({ created_at: 1 }).exec();
                    // return res.json({ abhi: firstLead })
                    // var leads = firstLead.pop();
                    // return res.json({ abhi: leads })
                    var source = ''
                    if (firstLead) {

                        if (firstLead.source == "Booking" || firstLead.source == "") {
                            source = "Walk-in";
                        } else {
                            source = firstLead.source
                        }
                    }
                } else {
                    // console.log("Lead Not NOt Found   } ")
                    source = "Walk-in";
                }
                var month = moment(booking.created_at).tz(req.headers['tz']).format('MMMM YYYY');
                if (duration <= 31) {
                    month = moment(booking.created_at).tz(req.headers['tz']).format('MMM DD');
                }

                analytics.push({
                    source: source,
                    sort: moment(booking.created_at).tz(req.headers['tz']).format('YYYY-MM-DD'),
                    month: month
                });
            })

        // return res.json(analytics)
        analytics = _.orderBy(analytics, ['sort'], ['asc'])
        var data = _(analytics).groupBy('source').map((objs, key) => ({
            total: objs.length,
            month: key,
            value: objs
        })
        ).value();
        // console.log("Data Length = " + data.length)
        data.sort(function (a, b) {
            return b.total - a.total;
        });
        // return res.json(data)
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG :Sending Leads Details along with the booking and job status in Response:" + from + "-" + "To:" + to + ", " + "User:" + user.name);
        }
        var leads = []
        if (data.length > 7) {
            data.length = 7
        } else {
            data.length = data.length
        }
        for (var i = 0; i < data.length; i++) {
            var dt = data[i].value
            leads.push({
                data:
                    _(dt).groupBy('month').map((objs, key) => ({
                        total: objs.length,
                        month: key,
                        // value: objs
                    })
                    ).value(),
                source: data[i].month
            })
        }
        // return res.json(mapd)
        res.status(200).json({
            responseCode: 200,
            responseMessage: {
                total: data.total
            },
            responseData: leads
        });
        if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("INFO: Leads sends in Response successfully" + ", " + "User:" + user.name);
        }
    }
});

router.get('/customer-overview/executive/leads', /* xAccessToken.token,*/ async function (req, res, next) {
    businessFunctions.logs("INFO: /customer-overview/executive/leads Api Called from customer.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    var rules = {
        query: 'required'
    };
    var validation = new Validator(req.query, rules);
    if (validation.fails()) {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR: Validation failed, Date are required in query.");
        }
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Date are required",
            responseData: {
                res: validation.errors.all()
            }
        })
    }
    else {
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var user = decoded.user;
        var date = new Date();
        var business = req.headers['business']
        var user = await User.findById(decoded.user).exec();

        var from = new Date()
        var to = new Date()
        var analytics = [];
        var bills = [];
        var analyticsRevenue = [];

        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Validated successfully and getting date from query.");
        }

        if (parseInt(req.query.query) == 0) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }
        else if (parseInt(req.query.query) >= 1) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        }
        else {
            var query = 30;
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }
        var startDate = moment(from);
        var endDate = moment(to);
        var duration = endDate.diff(startDate, 'days', true);
        var count = 0
        var totalExpenceCost = 0

        // console.log("From = " + from + " \n To= " + to)
        // var jobsStatus = ["JobOpen", "In-Process", "CompleteWork", "QC", "StoreApproval", "Ready", "Completed", "Closed"]
        // var bookingStatus = ["Confirmed", "Pending", "EstimateRequested", "JobInititated", "Cancelled"]
        var jobsStatus = ["JobOpen", "In-Process", "CompleteWork", "QC", "StoreApproval", "Ready", "Completed", "Closed"]
        var leadConversion = []

        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG :Getting Total Converted Leads Counts, From Date:" + from + "-" + "To:" + to + ", " + "User:" + user.name);
        }
        var totalConevertedLeads = await Lead.find({ created_at: { $gte: from, $lte: to }, business: business, converted: false }).count().exec();

        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG :Getting Role of the User, From Date:" + from + "-" + "To:" + to + ", " + "User:" + user.name);
        }
        await Management.find({ business: business, role: { $in: ["CRE", "Admin"] } }).populate('user')
            .cursor().eachAsync(async (assignee) => {
                // console.log("Id = " + assignee._id)
                var totalConverted = await Booking.find({ manager: assignee.user._id, created_at: { $gte: from, $lte: to }, business: business, converted: true }).count().exec();
                // console.log("convertedLeads = " + totalConverted)
                analytics.push({
                    totalConverted: totalConverted,
                    assignee: assignee.user.name
                })
                var totalNonConverted = await Lead.find({ assignee: assignee.user._id, created_at: { $gte: from, $lte: to }, business: business, converted: false }).count().exec();
                // console.log("totalLeads = " + totalNonConverted)

                analytics.push({
                    totalNonConverted: totalNonConverted,
                    assignee: assignee.user.name
                })

            })

        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG :Sending Data in Response" + ", " + "User:" + user.name);
        }

        var data = _(analytics).groupBy('assignee').map((objs, key) => ({
            assignee: key,
            totalNonConverted: parseInt(_.sumBy(objs, 'totalNonConverted')),
            totalConverted: parseInt(_.sumBy(objs, 'totalConverted')),
            total: parseInt(_.sumBy(objs, 'totalNonConverted')) + parseInt(_.sumBy(objs, 'totalConverted')),
            percent: ((parseInt(_.sumBy(objs, 'totalConverted')) / totalConevertedLeads) * 100).toFixed(2)

        })
        ).value();
        // return res.json(data)

        // console.log("Data Length = " + data.length)
        if (data.length > 7) {
            data.length = 7
        } else {
            data.length = data.length
        }
        data.sort(function (a, b) {
            return b.total - a.total;
        });

        // return res.json(mapd)
        res.status(200).json({
            responseCode: 200,
            responseMessage: {
                // total: data.total
            },
            responseData: data
        });
        if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("INFO: Response Sends Successfully" + ", " + "User:" + user.name);
        }
    }
});

router.get('/customer-overview/counts/get', /* xAccessToken.token,*/ async function (req, res, next) {
    businessFunctions.logs("INFO: /customer-overview/counts/get Api Called from customer.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    var rules = {
        query: 'required'
    };
    var validation = new Validator(req.query, rules);
    if (validation.fails()) {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR: Validation failed, Date are required in query.");
        }
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Date are required",
            responseData: {
                res: validation.errors.all()
            }
        })
    }
    else {
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var user = decoded.user;
        var date = new Date();
        var business = req.headers['business'];
        var user = await User.findById(decoded.user).exec();

        var from = new Date()
        var to = new Date()
        var analytics = [];

        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Validated successfully and getting date from query.");
        }
        if (parseInt(req.query.query) == 0) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
            var lastEndDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var lastStartDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query - query);
            // console.log("lastEndDate 11 ", lastEndDate)
            // console.log("lastStartDate 11 ", lastStartDate)
        }
        else if (parseInt(req.query.query) >= 1) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
            var lastEndDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query - 1);
            var lastStartDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query - query - 1);
            // console.log("Last month data end date = ", lastEndDate)
            // console.log("Last month data start = ", lastStartDate)
            // console.log("from this month data start = ", from)
            // console.log("to this month data start = ", to)
        }
        else {
            var query = 30;
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
            var lastEndDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var lastStartDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query - query);
            // console.log("lastEndDate 33 ", lastEndDate)
            // console.log("lastStartDate 33 ", lastStartDate)
        }

        // var from = new Date(req.query.from);
        // var to = new Date(req.query.to);

        // var startDate = moment(req.query.from);
        // var endDate = moment(req.query.to);
        var startDate = moment(from);
        var endDate = moment(to);
        var duration = endDate.diff(startDate, 'days', true);
        var count = 0
        var range = { $gte: from, $lte: to }
        var lastMonthRange = { $gte: lastStartDate, $lte: lastEndDate }
        var jobsStatus = ["JobOpen", "In-Process", "CompleteWork", "QC", "StoreApproval", "Ready", "Completed", "Closed"]
        var bookingStatus = ["Confirmed", "Pending", "EstimateRequested", "JobInititated", "Cancelled"]

        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG :Getting Total Counts, From Date:" + from + "-" + "To:" + to + ", " + "User:" + user.name);
        }
        var leadsCurrent = await Lead.find({ created_at: range, business: business }).count().exec();
        var leadsLast = await Lead.find({ created_at: lastMonthRange, business: business }).count().exec();

        var bookingCurrent = await Booking.find({ is_services: true, status: { $in: bookingStatus }, created_at: range, business: business }).count().exec();
        var bookingLast = await Booking.find({ is_services: true, status: { $in: bookingStatus }, created_at: lastMonthRange, business: business }).count().exec();

        var jobsCurrent = await Booking.find({ is_services: true, status: { $in: jobsStatus }, created_at: range, business: business }).count().exec();
        var jobsLats = await Booking.find({ is_services: true, status: { $in: jobsStatus }, created_at: lastMonthRange, business: business }).count().exec();

        var conversionsCurrent = await Booking.find({ converted: true, status: { $in: jobsStatus }, created_at: range, business: business }).count().exec();
        var conversionsLast = await Booking.find({ converted: true, status: { $in: jobsStatus }, created_at: lastMonthRange, business: business }).count().exec();


        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG :Sending Basic Counts Details in Response" + ", " + "User:" + user.name);
        }
        var data = {
            leadsCurrent: leadsCurrent,
            leadsLast: leadsLast,
            bookingCurrent: bookingCurrent,
            bookingLast: bookingLast,
            jobsCurrent: jobsCurrent,
            jobsLats: jobsLats,
            conversionsCurrent: conversionsCurrent,
            conversionsLast: conversionsLast


        }
        res.status(200).json({
            responseCode: 200,
            responseMessage: "Basic Counts ",
            responseData: data
        });
        if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("INFO: Basic Counts Sends in Response Successfully" + ", " + "User:" + user.name);
        }
    }
});

router.get('/customer-overview/lost/reasons', /* xAccessToken.token,*/ async function (req, res, next) {
    businessFunctions.logs("INFO: /customer-overview/lost/reasons Api Called from customer.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    var rules = {
        query: 'required'
    };
    var validation = new Validator(req.query, rules);
    if (validation.fails()) {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR: Validation failed, Date are required in query.");
        }
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Date are required",
            responseData: {
                res: validation.errors.all()
            }
        })
    }
    else {
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var user = decoded.user;
        var date = new Date();
        var business = req.headers['business']
        var user = await User.findById(decoded.user).exec();

        var from = new Date()
        var to = new Date()
        var analytics = [];
        var bills = [];
        var analyticsRevenue = [];

        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Validated successfully and getting date from query.");
        }
        if (parseInt(req.query.query) == 0) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }
        else if (parseInt(req.query.query) >= 1) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        }
        else {
            var query = 30;
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }
        var startDate = moment(from);
        var endDate = moment(to);
        var duration = endDate.diff(startDate, 'days', true);
        var count = 0
        var totalExpenceCost = 0

        ////console.log("From = " + from + " \n To= " + to)
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG :Getting Total Lost Leads Details, From Date:" + from + "-" + "To:" + to + ", " + "User:" + user.name);
        }
        var totalLost = await Lead.find({ business: business, "remark.status": "Lost", created_at: { $gte: from, $lte: to } }).count().exec();
        await Lead.find({ business: business, "remark.status": "Lost", created_at: { $gte: from, $lte: to } })
            .cursor().eachAsync(async (lead) => {
                // console.log("Id = " + lead._id)
                analytics.push({
                    reason: lead.remark.reason
                })

            })

        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG :Sending Total Lost Leads Data in Response" + ", " + "User:" + user.name);
        }
        var data = _(analytics).groupBy('reason').map((objs, key) => ({
            reason: key,
            // total: parseInt(_.sumBy(objs, 'totalNonConverted')) + parseInt(_.sumBy(objs, 'totalConverted'))
            total: objs.length,
            percent: ((objs.length / totalLost) * 100).toFixed(2)
        })
        ).value();
        // return res.json(data)

        // console.log("Data Length = " + data.length)
        if (data.length > 7) {
            data.length = 7
        } else {
            data.length = data.length
        }
        data.sort(function (a, b) {
            return b.total - a.total;
        });

        // return res.json(mapd)
        res.status(200).json({
            responseCode: 200,
            responseMessage: {
                totalLost: totalLost
            },
            responseData: data
        });
        if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("INFO: Response Sends Successfully" + ", " + "User:" + user.name);
        }
    }
});
router.get('/customer-overview/leads/revenue/Last', /* xAccessToken.token,*/ async function (req, res, next) {

    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var date = new Date();
    var business = req.headers['business']
    var user = await User.findById(decoded.user).exec();

    var from = new Date("2021-11-01")
    var to = new Date("2021-11-30")
    var toDate = new Date(to.getFullYear(), to.getMonth(), to.getDate() + 1);

    if (parseInt(req.query.query) == 0) {
        var query = parseInt(req.query.query);
        var from = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    } else if (parseInt(req.query.query) >= 1) {
        var query = parseInt(req.query.query);
        var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
        var to = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    } else {
        var query = 30;
        var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
        var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    }
    var dataLast = []
    var from = new Date("2021-11-01")
    var toDate = new Date("2021-12-01")
    var to = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate() + 1);
    console.log("From = " + from)
    console.log("TO = " + to)
    await Invoice.find({ status: "Active", created_at: { $gte: from, $lte: to }, business: business }).populate('user')
        .cursor().eachAsync(async (invoice) => {
            var booking = await Booking.findById(invoice.booking).populate({ path: "lead", select: "source" })
            var source = ''
            if (invoice.user) {
                // source: { $in: ['Knowlarity', "Website", "website"] },
                var firstLead = await Lead.findOne({ business: business, contact_no: invoice.user.contact_no }).sort({ created_at: 1 }).exec();
                if (firstLead) {
                    // console.log("Lead Source =" + firstLead.source + "-")
                    if (firstLead.source == "Booking" || firstLead.source == "" || firstLead.source == " ") {
                        source = "Walk-in";
                    } else {
                        source = firstLead.source
                        var newdate = moment(invoice.created_at).format("YYYY-MM-DD");

                        var leadData = {
                            contact_no: invoice.user.contact_no,
                            name: invoice.user.name,
                            source: firstLead.source,
                            revenue: invoice.payment.total,
                            created_at: newdate.toString(),
                            currentSource: booking.lead.source,
                        }
                        dataLast.push(leadData)
                    }
                }
            }

        })

    res.status(200).json({
        responseCode: 200,
        responseMessage: "Success",
        // {
        //     total: data.total
        // },
        responseData: dataLast
        // {
        //     // leadsCount: leadsCounts,
        //     // leadsRevenue: data,
        //     dataLast: dataLast
        // }
    });

});

module.exports = router