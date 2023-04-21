var mongoose = require('mongoose'),
    express = require('express'),
    router = express.Router(),
    config = require('../../../../config'),
    // functions = require('../../../business/v2.1.js'),

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

const xAccessToken = require('../../../../middlewares/xAccessTokenBusiness');
const fun = require('../../../function');
const event = require('../../../event');
const whatsAppEvent = require('../../../whatsapp/whatsappEvent');
const businessFunctions = require('../../businessFunctions');

var paytm_config = require('../../../../paytm/paytm_config').paytm_config;
var paytm_checksum = require('../../../../paytm/checksum');

var salt = bcrypt.genSaltSync(10);
const User = require('../../../../models/user');
const BusinessTiming = require('../../../../models/businessTiming');
const BusinessConvenience = require('../../../../models/businessConvenience');
const BookingTiming = require('../../../../models/bookingTiming');
// const Type = require('../../../../models/type');
// const BusinessType = require('../../../../models/businessType');
const Category = require('../../../../models/category');
const Automaker = require('../../../../models/automaker');
const Model = require('../../../../models/model');
const QuotationOrders = require('../../../../models/quotationOrders')
const OrderLogs = require('../../../../models/orderLogs')
const State = require('../../../../models/state');
const BookingCategory = require('../../../../models/bookingCategory');
const ProductImage = require('../../../../models/productImage');
const Country = require('../../../../models/country');
const BusinessOffer = require('../../../../models/businessOffer');
const BusinessUser = require('../../../../models/businessUser');
const ProductOffer = require('../../../../models/productOffer');
const Order = require('../../../../models/order');
const BusinessOrder = require('../../../../models/businessOrder');
const OrderLine = require('../../../../models/orderLine');
const OrderConvenience = require('../../../../models/orderConvenience');
const OrderInvoice = require('../../../../models/orderInvoice');
const BookmarkProduct = require('../../../../models/bookmarkProduct');
const BookmarkOffer = require('../../../../models/bookmarkOffer');
const Car = require('../../../../models/car');
const CarSell = require('../../../../models/carSell');
const Asset = require('../../../../models/asset');
const CarImage = require('../../../../models/carImage');
const CarDocument = require('../../../../models/carDocument');
const BookmarkCar = require('../../../../models/bookmarkCar');
const BodyStyle = require('../../../../models/bodyStyle');
const FuelType = require('../../../../models/fuelType');
const Transmission = require('../../../../models/transmission');
const Color = require('../../../../models/color');
const Owner = require('../../../../models/owner');
const ServiceGallery = require('../../../../models/serviceGallery'); //abhinav
const BusinessGallery = require('../../../../models/businessGallery');
const Variant = require('../../../../models/variant');
const ClaimBusiness = require('../../../../models/claimBusiness');
const Review = require('../../../../models/review');
const Battery = require('../../../../models/battery');
const BatteryBrand = require('../../../../models/batteryBrand');
const TyreSize = require('../../../../models/tyreSize');
const Booking = require('../../../../models/booking');
const Lead = require('../../../../models/lead');
const Service = require('../../../../models/service');
const Customization = require('../../../../models/customization');
const Collision = require('../../../../models/collision');
const Washing = require('../../../../models/washing');
const ProductCategory = require('../../../../models/productCategory');
const Product = require('../../../../models/product');
const ProductBrand = require('../../../../models/productBrand');
const ProductModel = require('../../../../models/productModel');
const BusinessProduct = require('../../../../models/businessProduct');
const LeadRemark = require('../../../../models/leadRemark');
const LeadGenRemark = require('../../../../models/leadGenRemark');
const LeadStatus = require('../../../../models/leadStatus');
const Package = require('../../../../models/package');
const UserPackage = require('../../../../models/userPackage');
const PackageUsed = require('../../../../models/packageUsed');
const Management = require('../../../../models/management');
const LeadManagement = require('../../../../models/leadManagement');
const Address = require('../../../../models/address');
const Gallery = require('../../../../models/gallery');
const Coupon = require('../../../../models/coupon');
const Detailing = require('../../../../models/detailing');
const CouponUsed = require('../../../../models/couponUsed');
const Purchase = require('../../../../models/purchase');
const PurchaseReturn = require('../../../../models/purchaseReturn');
const PurchaseOrder = require('../../../../models/purchaseOrder');
const Tax = require('../../../../models/tax');
const BusinessVendor = require('../../../../models/businessVendor');
const JobInspection = require('../../../../models/jobInspection');
const ClubMember = require('../../../../models/clubMember');
const InsuranceCompany = require('../../../../models/insuranceCompany');
const LabourRate = require('../../../../models/labourRate');
const Point = require('../../../../models/point');
const QualityCheck = require('../../../../models/qualityCheck');
const Invoice = require('../../../../models/invoice');
const Expense = require('../../../../models/expense');
const Estimate = require('../../../../models/estimate');
const StockLogs = require('../../../../models/stockLogs');
// Vinay Model added
const VendorOrders = require('../../../../models/vendorOrders');

const TransactionLog = require('../../../../models/transactionLog');
const RFQ = require('../../../../models/rfq');
const Quotation = require('../../../../models/quotation');
const BusinessPlan = require('../../../../models/businessPlan');
const Referral = require('../../../../models/referral');
const ManagementRole = require('../../../../models/managementRole');
const Location = require('../../../../models/location');
const BusinessSetting = require('../../../../models/businessSetting');
const ExpenseCategory = require('../../../../models/expenseCategory');
const ReviewPoint = require('../../../../models/reviewPoint');
const LeadGen = require('../../../../models/leadGen');
const SuitePlan = require('../../../../models/suitePlan');
const { updateMany, count } = require('../../../../models/user');
const { filter, rangeRight } = require('lodash');
const OutBoundLead = require('../../../../models/outBoundLead');



var secret = config.secret;
var Log_Level = config.Log_Level

router.get('/leads/get', xAccessToken.token, async function (req, res, next) {
    // console.log('Route is called...', req.query.query, req.query.by);
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    // console.log('User = ', user, business);

    var bookings = [];
    var totalResult = 0;

    var role = await Management.findOne({ user: user, business: business }).exec();
    if (req.query.page == undefined) {
        var page = 0;
    }
    else {
        var page = req.query.page;
    }

    var page = Math.max(0, parseInt(page));
    var leads = [];
    var filters = [];
    var queries = {};

    if (req.query.query) {
        var specification = {};
        specification['$lookup'] = {
            from: "LeadRemark",
            localField: "remarks",
            foreignField: "_id",
            as: "remarks",
        };
        filters.push(specification);

        req.query.query = req.query.query.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");

        var specification = {};
        specification['$match'] = {
            business: mongoose.Types.ObjectId(business),
            // "remarks.status": req.query.queryStatus,
            $or: [
                { 'name': { $regex: req.query.query, $options: 'i' } },
                { 'contact_no': { $regex: req.query.query, $options: 'i' } },
                {
                    "remarks": {
                        $elemMatch: {
                            "status": { $regex: req.query.query, $options: 'i' }
                        }
                    }
                },
                {
                    "remarks": {
                        $elemMatch: {
                            "customer_remark": { $regex: req.query.query, $options: 'i' }
                        }
                    }
                },
                {
                    "remarks": {
                        $elemMatch: {
                            "assignee_remark": { $regex: req.query.query, $options: 'i' }
                        }
                    }
                },
            ]
        };

        filters.push(specification)
        var specification = {};
        specification['$skip'] = 10 * req.query.page;
        filters.push(specification);

        var specification = {};
        specification['$limit'] = 10;
        filters.push(specification);

        await Lead.aggregate(filters)
            .allowDiskUse(true)
            .cursor({ batchSize: 20 })
            .exec()
            .eachAsync(async function (lead) {
                var remark = await LeadRemark.findOne({ lead: lead._id }).sort({ created_at: -1 }).exec();
                var assignee = await User.findById(lead.assignee).exec();

                if (assignee) {
                    var a = {
                        name: assignee.name,
                        email: assignee.email,
                        contact_no: assignee.contact_no,
                        _id: assignee._id,
                        _id: assignee._id,
                    }
                }
                else {
                    var a = {
                        name: "",
                        email: "",
                        contact_no: "",
                        _id: null,
                        _id: null,
                    }
                }

                if (lead.follow_up == null) {
                    var follow_up = {}
                } else {
                    follow_up = lead.follow_up
                }

                var l = lead.remark;

                if (l) {
                    if (l.assignee_remark == "") {
                        l.assignee_remark = l.customer_remark
                    }
                    var remark = {
                        source: l.source,
                        type: l.type,
                        reason: l.reason,
                        status: l.status,
                        customer_remark: l.customer_remark,
                        assignee_remark: l.assignee_remark,
                        assignee: a,
                        color_code: l.color_code,
                        created_at: moment(l.created_at).tz(req.headers['tz']).format('lll'),
                        updated_at: moment(l.updated_at).tz(req.headers['tz']).format('lll'),
                    }
                }

                var b = await Booking.findOne({ lead: lead._id }).exec();
                var booking = null
                if (b) {
                    booking = b._id
                }

                var category = "";
                if (lead.category) {
                    category = lead.category;
                }

                var isStared = false;
                if (lead.isStared) {
                    isStared = lead.isStared
                } else {
                    isStared = false
                }
                // isStared : isStared,

                leads.push({
                    booking: booking,
                    user: lead.user,
                    name: lead.name,
                    contact_no: lead.contact_no,
                    email: lead.email,
                    _id: lead._id,
                    id: lead.id,
                    priority: lead.priority,
                    contacted: lead.contacted,
                    type: lead.type,
                    lead_id: lead.lead_id,
                    geometry: lead.geometry,
                    date: moment(lead.updated_at).tz(req.headers['tz']).format('lll'),
                    status: lead.status,
                    source: lead.source,
                    important: lead.important,
                    follow_up: follow_up,
                    remark: remark,
                    assignee: a,
                    category: category,
                    isStared: isStared,
                    created_at: moment(lead.created_at).tz(req.headers['tz']).format('lll'),
                    updated_at: moment(lead.updated_at).tz(req.headers['tz']).format('lll'),
                });
            });

        return res.status(200).json({
            responseCode: 200,
            responseInfo: {
                // filters: filters,
                msg: "Filter Leads",
                totalResult: leads.length
            },
            responseMessage: "",
            totalLeads: leads.length,
            responseData: leads,

        });
    }

    filters = [];

    if (req.query.by == "filter") {
        if (role.role == "CRE") {
            var specification = {};
            specification["assignee"] = mongoose.Types.ObjectId(role.user)
            filters.push(specification);
            var specification = {};
            specification["business"] = mongoose.Types.ObjectId(business)
            filters.push(specification);
        } else if (role.role == 'Admin' || role.role == 'Manager') {
            // console.log('checking the filter 2', business, role.user)
            var specification = {};
            specification["business"] = mongoose.Types.ObjectId(business)
            filters.push(specification);
        } else {
            var specification = {};
            specification["assignee"] = mongoose.Types.ObjectId(role.user)
            filters.push(specification);
            var specification = {};
            specification["business"] = mongoose.Types.ObjectId(business)
            filters.push(specification);
        }

        if (req.query.status != "#") {
            if (req.query.status == "All") {
                var date = new Date();
                // if (req.query.date) {
                //     date = new Date(req.query.date);
                // }

                var specification = {};
                if (req.query.source) {
                    specification['source'] = { $eq: req.query.source }
                }
                // specification['created_at'] = { $lte: date };
                if (req.query.date) {
                    var date = new Date(req.query.date);
                    //var newDate = moment(date, "DD-MM-YYYY").add(1, 'days').toDate();
                    var endDate = new Date(req.query.endDate);
                    // console.log('Come inside follow-up status', date, endDate);
                    specification['created_at'] = { $gte: new Date(date), $lte: new Date(endDate) };
                    // console.log('Checking the open filter', specification);
                }
                filters.push(specification);
            } else if (req.query.status == "Follow-Up") {
                var specification = {};
                specification["remark.status"] = req.query.status;
                // else if (status == "Follow-Up") {
                // var specification = {};
                // specification["business"] = mongoose.Types.ObjectId(business)
                // var specification = {};
                // var dateString = moment(new Date()).tz(req.headers['tz']).format('YYYY-MM-DD');
                // specification["remark.status"] = req.query.status;
                specification['follow_up.date'] = { $lt: new Date() };
                // filters.push(specification);
                // }
                // console.log('Created object ......', specification);
                /*
                    Code made by vinay
                    Update: Add date range filter
                    updatedVariables: endDate
                    updatedQuery: $lt: new Date(endDate)
                */
                if (req.query.source) {
                    specification['source'] = { $eq: req.query.source }
                }

                if (req.query.date && req.query.endDate) {
                    var date = new Date(req.query.date)
                    //var newDate = moment(date, "DD-MM-YYYY").add(1, 'days').toDate();
                    var endDate = new Date(req.query.endDate)
                    // console.log('Come inside follow-up status', date, endDate);
                    specification['follow_up.date'] = { $gte: new Date(date), $lte: new Date(endDate) };
                    // console.log('Checking the date filter', specification);
                } else {
                    // let todayDate = new Date();
                    // let futureDate = new Date();
                    // futureDate.setDate(futureDate.getDate() + 1)
                    // // todayDate.setDate(todayDate.getDate() - 1)
                    // // specification['follow_up.date'] = { $gte: todayDate, $lt: futureDate };
                    // specification['follow_up.date'] = { $lte: futureDate };
                }
                // console.log("Follow ups")
                filters.push(specification);
            } else if (req.query.status == "Open") {
                var specification = {};
                specification["remark.status"] = req.query.status;
                // console.log('Created object ......', specification);
                if (req.query.source) {
                    // console.log('Source testing', req.query.source)
                    specification['source'] = { $eq: req.query.source }
                }
                if (req.query.date) {
                    var date = new Date(req.query.date);
                    //var newDate = moment(date, "DD-MM-YYYY").add(1, 'days').toDate();
                    var endDate = new Date(req.query.endDate);
                    // console.log('Come inside follow-up status', date, endDate);
                    specification['updated_at'] = { $gte: new Date(date), $lte: new Date(endDate) };
                    // console.log('Checking the open filter', specification);
                }


                filters.push(specification);
            } else if (req.query.status == "PSF") {
                var specification = {};
                specification["remark.status"] = req.query.status;
                if (req.query.source) {
                    specification['source'] = { $eq: req.query.source }
                }
                var specification = {};
                // var dateString = moment(new Date()).tz(req.headers['tz']).format('YYYY-MM-DD , h:mm:ss a');
                // console.log("Dtae By Filter = " + dateString)
                specification["remark.status"] = req.query.status;
                specification['follow_up.date'] = { $lte: new Date() };
                // filters.push(specification);
                if (req.query.date && req.query.endDate) {
                    var date = new Date(req.query.date);
                    //var newDate = moment(date, "DD-MM-YYYY").add(1, 'days').toDate();
                    var endDate = new Date(req.query.endDate);
                    // specification['remark.created_at'] = { $gte: new Date(date), $lte: new Date(endDate) };
                    specification['follow_up.date'] = { $gte: new Date(date), $lte: new Date(endDate) };
                    // console.log("PSF Date = " + date + " End Date = " + endDate)
                }

                filters.push(specification);
            } else if (req.query.status == "Closed") {
                // console.log('Close lead is called........', req.query.status)
                var specification = {};
                specification["remark.status"] = req.query.status;
                if (req.query.source) {
                    specification['source'] = { $eq: req.query.source }
                }
                if (req.query.date) {
                    var date = new Date(req.query.date);
                    //var newDate = moment(date, "DD-MM-YYYY").add(1, 'days');
                    var endDate = new Date(req.query.endDate);
                    specification['remark.created_at'] = { $gte: new Date(date), $lt: new Date(endDate) };
                }


                if (req.query.reason) {
                    // console.log('remark reason', req.query.reason)
                    specification['remark.reason'] = req.query.reason;
                }


                filters.push(specification);
            } else if (req.query.status == "Lost") {
                // console.log('Lost date filter is called....')
                var specification = {};
                var date = new Date();
                specification["remark.status"] = req.query.status;
                if (req.query.source) {
                    specification['source'] = { $eq: req.query.source }
                }
                if (req.query.date) {
                    var date = new Date(req.query.date);
                    //var newDate = moment(date, "DD-MM-YYYY").add(1, 'days');
                    // Changes made by me
                    var endDate = new Date(req.query.endDate);
                    specification['remark.updated_at'] = { $gte: new Date(date), $lt: new Date(endDate) };
                }

                if (req.query.reason) {
                    specification['remark.reason'] = req.query.reason;
                }
                if (req.query.source) {
                    specification['source'] = req.query.source;
                }


                filters.push(specification);
            } else if (req.query.status == "EstimateRequested") {
                var specification = {};
                specification["remark.status"] = req.query.status;

                // console.log('Created object ......', specification);
                if (req.query.source) {
                    // console.log('Source testing', req.query.source)
                    specification['source'] = { $eq: req.query.source }
                }
                if (req.query.date) {
                    var date = new Date(req.query.date);
                    //var newDate = moment(date, "DD-MM-YYYY").add(1, 'days').toDate();
                    var endDate = new Date(req.query.endDate);
                    // console.log('Come inside follow-up status', date, endDate);
                    specification['updated_at'] = { $gte: new Date(date), $lte: new Date(endDate) };
                    // console.log('Checking the open filter', specification);
                }
                filters.push(specification);
            } else if (req.query.status == "Approval") {
                var specification = {};
                specification["remark.status"] = req.query.status;
                // console.log('Created object ......', specification);
                if (req.query.source) {
                    // console.log('Source testing', req.query.source)
                    specification['source'] = { $eq: req.query.source }
                }
                if (req.query.date) {
                    var date = new Date(req.query.date);
                    //var newDate = moment(date, "DD-MM-YYYY").add(1, 'days').toDate();
                    var endDate = new Date(req.query.endDate);
                    // console.log('Come inside follow-up status', date, endDate);
                    specification['updated_at'] = { $gte: new Date(date), $lte: new Date(endDate) };
                    // console.log('Checking the open filter', specification);
                }
                filters.push(specification);
            }
            //  else if (req.query.status == "Confirmed") {
            //     var specification = {};
            //     specification["remark.status"] = req.query.status;
            //     // console.log('Created object ......', specification);
            //     if (req.query.source) {
            //         // console.log('Source testing', req.query.source)
            //         specification['source'] = { $eq: req.query.source }
            //     }
            //     if (req.query.date) {
            //         var date = new Date(req.query.date);
            //         //var newDate = moment(date, "DD-MM-YYYY").add(1, 'days').toDate();
            //         var endDate = new Date(req.query.endDate);
            //         // console.log('Come inside follow-up status', date, endDate);
            //         specification['updated_at'] = { $gte: new Date(date), $lte: new Date(endDate) };
            //         // console.log('Checking the open filter', specification);
            //     }
            //     filters.push(specification);
            // } else if (req.query.status == "Missed") {
            //     var specification = {};
            //     specification["remark.status"] = 'Confirmed';
            //     // console.log('Created object ......', specification);
            //     if (req.query.source) {
            //         // console.log('Source testing', req.query.source)
            //         specification['source'] = { $eq: req.query.source }
            //     }
            //     if (req.query.date) {
            //         var date = new Date(req.query.date);
            //         //var newDate = moment(date, "DD-MM-YYYY").add(1, 'days').toDate();
            //         var endDate = new Date(req.query.endDate);
            //         // console.log('Come inside follow-up status', date, endDate);
            //         specification['updated_at'] = { $gte: new Date(date), $lte: new Date(endDate) };
            //         // console.log('Checking the open filter', specification);
            //     }
            //     filters.push(specification);
            // }
        }
        if (req.query.priority) {
            var priority = parseInt(req.query.priority);
            if (priority == 0) {
                var specification = {};
                specification['priority'] = { $in: [1, 2, 3] };
                filters.push(specification);
            }
            else {
                var specification = {};
                specification['priority'] = priority;
                filters.push(specification);
            }
        }

        var query = {
            "$match": {
                "$and": filters
            }
        }
        // console.log('Filters', filters);
    }
    else {
        if (role.role == "CRE") {
            var specification = {};
            specification["assignee"] = mongoose.Types.ObjectId(role.user)
            filters.push(specification);
            var specification = {};
            specification["business"] = mongoose.Types.ObjectId(business)
            filters.push(specification);
        }
        else if (role.role == 'Admin' || role.role == 'Manager') {
            var specification = {};
            specification["business"] = mongoose.Types.ObjectId(business)
            filters.push(specification);
        } else {
            var specification = {};
            specification["assignee"] = mongoose.Types.ObjectId(role.user)
            filters.push(specification);
        }

        if (req.query.status != "#") {
            var status = req.query.status;
            if (status == "All") {
                var specification = {};
                specification["business"] = mongoose.Types.ObjectId(business)
                var specification = {};
                var dateString = moment(new Date()).tz(req.headers['tz']).format('YYYY-MM-DD');
                specification['follow_up.date'] = { $lt: new Date() };
                filters.push(specification);
                // console.log('Without filter query called......');
            }
            else if (status == "Follow-Up") {
                var specification = {};
                specification["business"] = mongoose.Types.ObjectId(business)
                var specification = {};
                var dateString = moment(new Date()).tz(req.headers['tz']).format('YYYY-MM-DD');
                specification["remark.status"] = req.query.status;
                specification['follow_up.date'] = { $lt: new Date() };
                filters.push(specification);
                // console.log("Without filters")
            }
            else if (status == "PSF") {
                var specification = {};
                specification["business"] = mongoose.Types.ObjectId(business)

                var specification = {};
                var dateString = moment(new Date()).tz(req.headers['tz']).format('YYYY-MM-DD');
                specification["remark.status"] = req.query.status;
                // console.log("Date  - = = =" + new Date().toISOString())
                specification['follow_up.date'] = { $lte: new Date() };
                filters.push(specification);
            }
            else {
                var specification = {};
                specification["business"] = mongoose.Types.ObjectId(business)
                var specification = {};
                specification["remark.status"] = status;
                filters.push(specification);
            }
        }

        var query = {
            "$match": {
                "$and": filters
            }
        }
    }


    // console.log('Final status', req.query.status)

    var total = await Lead.aggregate([query]).exec();
    // console.log('Total Length of the leads...', total.length);
    // Changes by vinay
    var sortQuery = {};
    if (req.query.status == 'Follow-Up') {
        sortQuery = { $sort: { 'follow_up.date': -1 } };
    } else if (req.query.status == 'PSF') {
        sortQuery = { $sort: { 'follow_up.date': -1 } };
    } else if (req.query.status == 'Lost' || req.query.status == 'Closed') {
        sortQuery = { $sort: { 'remark.created_at': -1 } };
    } else if (req.query.status == 'Open') {
        sortQuery = { $sort: { 'updated_at': -1 } };
    } else if (req.query.status == 'All') {
        sortQuery = { $sort: { 'created_at': -1 } };
    }
    else {
        sortQuery = { $sort: { 'created_at': -1 } };
    }
    var totalCounts = 0;
    await Lead.aggregate([
        query,
        sortQuery,
        { $skip: 10 * page },
        { $limit: 10 }
    ])
        .allowDiskUse(true)
        .cursor({ batchSize: 20 })
        .exec()
        .eachAsync(async function (lead) {
            var remark = await LeadRemark.findOne({ lead: lead._id }).sort({ created_at: -1 }).exec();
            var assignee = await User.findById(lead.assignee).exec();

            if (assignee) {
                var a = {
                    name: assignee.name,
                    email: assignee.email,
                    contact_no: assignee.contact_no,
                    _id: assignee._id,
                    _id: assignee._id,
                }
            }
            else {
                var a = {
                    name: "",
                    email: "",
                    contact_no: "",
                    _id: null,
                    _id: null,
                }
            }

            if (lead.follow_up == null) {
                var follow_up = {}
            } else {
                follow_up = lead.follow_up
            }

            var l = lead.remark;

            if (l) {
                if (l.assignee_remark == "") {
                    l.assignee_remark = l.customer_remark
                }
                var remark = {
                    source: l.source,
                    type: l.type,
                    reason: l.reason,
                    status: l.status,
                    customer_remark: l.customer_remark,
                    assignee_remark: l.assignee_remark,
                    assignee: a,
                    color_code: l.color_code,
                    created_at: moment(l.created_at).tz(req.headers['tz']).format('lll'),
                    updated_at: moment(l.updated_at).tz(req.headers['tz']).format('lll'),
                }
            }

            var b = await Booking.findOne({ lead: lead._id }).exec();

            var booking = null
            var isOutbound = false;
            if (b) {
                booking = b._id;
                isOutbound = b.isOutbound;
                // console.log("Booking Outbound = " + b.isOutbound)
            }

            var category = "";
            if (lead.category) {
                category = lead.category;
            }
            var isStared = false;
            if (lead.isStared) {
                isStared = lead.isStared
            } else {
                isStared = false
            }
            // isStared : isStared,

            var outbound = await Booking.find({ isOutbound: true, status: "EstimateRequested" }).count().exec();
            totalCounts = total.length - outbound
            // || req.query.status == "Missed"

            // if (req.query.status == "Confirmed" || req.query.status == "Missed") {
            //     if (b) {
            //         var serverTime = moment.tz(new Date(), req.headers['tz']);
            //         var bar = moment.tz(new Date(b.date), req.headers['tz']);
            //         var baz = bar.diff(serverTime);
            //         // console.log('Server Time = ' + serverTime)
            //         // console.log('bar Time = ' + bar)
            //         // console.log('baz Time = ' + baz)
            //         var manager = { $ne: null }
            //         if (role.role == "CRE") {
            //             manager = assignee._id
            //         }
            //         if (baz > 0 && req.query.status == "Confirmed" && !b.isOutbound) {
            //             // new Date().getDate() - 1
            //             totalCounts = await Booking.find({ status: 'Confirmed', business: business, isOutbound: false, manager: manager, date: { $lt: new Date() } }).count().exec();
            //             // console.log("Status Updated  = " + b.status)
            //             // var confirmedBooking = await Booking.find({ status: 'Confirmed', business: business, isOutbound: false, manager: manager, date: { $lt: new Date() } }).exec()
            //             // for (var bb = 0; bb < confirmedBooking.length; bb++) {

            //             //     // console.log("Lead Upadted " + confirmedBooking[bb].lead)
            //             //     if (confirmedBooking[bb].status == 'Confirmed') {
            //             //         await Lead.findOneAndUpdate({ _id: confirmedBooking[bb].lead }, { $set: { 'remark.status': 'Confirmed' } }).exec();
            //             //     }
            //             // }

            //             // console.log("ToataL Confiremd Result = " + totalCounts)
            //             leads.push({
            //                 booking: booking,
            //                 user: lead.user,
            //                 name: lead.name,
            //                 contact_no: lead.contact_no,
            //                 email: lead.email,
            //                 _id: lead._id,
            //                 id: lead.id,
            //                 priority: lead.priority,
            //                 contacted: lead.contacted,
            //                 type: lead.type,
            //                 lead_id: lead.lead_id,
            //                 geometry: lead.geometry,
            //                 date: moment(lead.updated_at).tz(req.headers['tz']).format('lll'),
            //                 status: lead.status,
            //                 source: lead.source,
            //                 important: lead.important,
            //                 follow_up: follow_up,
            //                 remark: remark,
            //                 assignee: a,
            //                 // time: time,
            //                 isStared: isStared,
            //                 category: category,
            //                 isOutbound: isOutbound,
            //                 created_at: moment(lead.created_at).tz(req.headers['tz']).format('lll'),
            //                 updated_at: moment(lead.updated_at).tz(req.headers['tz']).format('lll'),
            //             });
            //         } else if (baz <= 0 && req.query.status == "Missed" && !b.isOutbound) {
            //             totalCounts = await Booking.find({ status: 'Confirmed', business: business, isOutbound: false, manager: manager, date: { $gt: new Date() } }).count().exec();
            //             // console.log("ToataL Missed Result = " + totalCounts)

            //             // baz <= 0 &&
            //             leads.push({
            //                 booking: booking,
            //                 user: lead.user,
            //                 name: lead.name,
            //                 contact_no: lead.contact_no,
            //                 email: lead.email,
            //                 _id: lead._id,
            //                 id: lead.id,
            //                 priority: lead.priority,
            //                 contacted: lead.contacted,
            //                 type: lead.type,
            //                 lead_id: lead.lead_id,
            //                 geometry: lead.geometry,
            //                 date: moment(lead.updated_at).tz(req.headers['tz']).format('lll'),
            //                 status: lead.status,
            //                 source: lead.source,
            //                 important: lead.important,
            //                 follow_up: follow_up,
            //                 remark: remark,
            //                 assignee: a,
            //                 // time: time,
            //                 isStared: isStared,
            //                 category: category,
            //                 isOutbound: isOutbound,
            //                 created_at: moment(lead.created_at).tz(req.headers['tz']).format('lll'),
            //                 updated_at: moment(lead.updated_at).tz(req.headers['tz']).format('lll'),
            //             });
            //         }
            //     }
            // } else {
            leads.push({
                booking: booking,
                user: lead.user,
                name: lead.name,
                contact_no: lead.contact_no,
                email: lead.email,
                _id: lead._id,
                id: lead.id,
                priority: lead.priority,
                contacted: lead.contacted,
                type: lead.type,
                lead_id: lead.lead_id,
                geometry: lead.geometry,
                date: moment(lead.updated_at).tz(req.headers['tz']).format('lll'),
                status: lead.status,
                source: lead.source,
                important: lead.important,
                follow_up: follow_up,
                remark: remark,
                assignee: a,
                // time: time,
                isStared: isStared,
                category: category,
                isOutbound: isOutbound,
                created_at: moment(lead.created_at).tz(req.headers['tz']).format('lll'),
                updated_at: moment(lead.updated_at).tz(req.headers['tz']).format('lll'),
            });
            // }

        });
    leads = _.filter(leads, x => !x.isOutbound && x.remark.status != 'PSF');
    // leads = _.filter(leads, x => !x.isOutbound);

    // console.log("ToataL Toatl Result = " + totalCounts)

    res.status(200).json({
        responseCode: 200,
        responseInfo: {
            // filters: filters,
            totalResult: totalCounts
        },
        responseMessage: role.role + " Leads",
        totalLeads: leads.length,
        responseData: leads
        ,

    });
});

router.get('/service-reminder/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var bookings = [];
    var filters = [];
    var totalResult = 0;

    var role = await Management.findOne({ user: user, business: business }).exec();
    if (req.query.page == undefined) {
        var page = 0;
    }
    else {
        var page = req.query.page;
    }



    var specification = {};
    specification['$lookup'] = {
        from: "User",
        localField: "user",
        foreignField: "_id",
        as: "user",
    };
    filters.push(specification);

    var specification = {};
    specification['$unwind'] = {
        path: "$user",
        preserveNullAndEmptyArrays: false
    };
    filters.push(specification);

    var specification = {};
    specification['$lookup'] = {
        from: "Car",
        localField: "car",
        foreignField: "_id",
        as: "car",
    };
    filters.push(specification);

    var specification = {};
    specification['$unwind'] = {
        path: "$car",
        preserveNullAndEmptyArrays: true
    };

    var bar = new Date();
    bar.setDate(bar.getDate() + 1000);


    if (req.query.query) {
        req.query.query = req.query.query.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
        var specification = {};
        specification['$match'] = {
            business: mongoose.Types.ObjectId(business),
            "service_reminder": { $lte: bar },
            $or: [
                { 'user.name': { $regex: req.query.query, $options: 'i' } },
                { 'user.contact_no': { $regex: req.query.query, $options: 'i' } },
                { 'car.title': { $regex: req.query.query, $options: 'i' } },
                { 'car.registration_no': { $regex: req.query.query, $options: 'i' } },
                { 'car.insurance_info.policy_holder': { $regex: req.query.query, $options: 'i' } },
            ]
        };
        filters.push(specification);
    }
    else {
        var specification = {};
        specification['$match'] = {
            business: mongoose.Types.ObjectId(business),
            "service_reminder": { $lte: bar },
        };
        filters.push(specification);
    }

    filters.push(specification);

    totalResult = await Booking.aggregate(filters);

    var specification = {};
    specification['$sort'] = {
        service_reminder: 1,
    };
    filters.push(specification);

    var specification = {};
    // specification['$skip'] = config.perPage * page;
    specification['$skip'] = 10000 * page;
    filters.push(specification);

    var specification = {};
    // specification['$limit'] = config.perPage;
    specification['$limit'] = 1000;
    filters.push(specification);
    var count = 0
    await Booking.aggregate(filters)
        .allowDiskUse(true)
        .cursor({ batchSize: 1000 })
        .exec()
        .eachAsync(async function (booking) {
            count = count + 1
            var bk = await Booking.findOne({ car: booking.car[0]._id }).select('leadManagement _id').exec();
            // console.log(bk._id + " ----------------------------------------------------------------------Created " + count)
            var created = await q.all(businessFunctions.outboundLeadAdd(bk._id, 'ServiceReminder'))
            // console.log(" = == = =" + JSON.stringify(created))

            // var remarks = booking.remarks;
            // var remarksData = [];
            // if (remarks) {
            //     for (var i = 0; i < remarks.length; i++) {
            //         var added_by = await User.findById(remarks[i].added_by).exec();
            //         remarksData.push({
            //             added_by: remarks[i].user,
            //             name: added_by.name,
            //             remark: remarks[i].remark,
            //             created_at: moment(remarks[i].created_at).tz(req.headers['tz']).format('lll'),
            //             updated_at: moment(remarks[i].updated_at).tz(req.headers['tz']).format('lll'),
            //         })
            //     }
            // }

            // bookings.push({
            //     _id: booking._id,
            //     id: booking._id,
            //     car: {
            //         title: booking.car[0].title,
            //         _id: booking.car[0]._id,
            //         id: booking.car[0].id,
            //         vin: booking.car[0].vin,
            //         engine_no: booking.car[0].engine_no,
            //         registration_no: booking.car[0].registration_no,
            //         variant: booking.car[0].variant,
            //         manufacture_year: booking.car[0].manufacture_year,
            //         purchased_year: booking.car[0].purchased_year,
            //     },
            //     user: {
            //         name: booking.user.name,
            //         _id: booking.user._id,
            //         id: booking.user.id,
            //         contact_no: booking.user.contact_no,
            //         email: booking.user.email,
            //         business_info: booking.user.business_info,
            //         account_info: booking.user.account_info,
            //     },
            //     insurance_info: booking.insurance_info,
            //     odometer: booking.odometer,
            //     convenience: booking.convenience,
            //     date: moment(booking.date).tz(req.headers['tz']).format('ll'),
            //     time_slot: booking.time_slot,
            //     status: _.startCase(booking.status),
            //     _status: booking.status,
            //     sub_status: booking.sub_status,
            //     booking_no: booking.booking_no,
            //     job_no: booking.job_no,
            //     remarks: remarks,
            //     service_reminder: moment(booking.service_reminder).tz(req.headers['tz']).format('lll'),
            //     created_at: moment(booking.created_at).tz(req.headers['tz']).format('lll'),
            //     updated_at: moment(booking.updated_at).tz(req.headers['tz']).format('lll'),
            // });
        });

    res.status(200).json({
        responseCode: 200,
        responseMessage: "",
        responseInfo: {
            totalResult: totalResult.length
        },
        responseData: bookings,

    });
});



router.get('/lead-gen/remark/get', async function (req, res, next) {
    let lead = await LeadGenRemark.find({ lead: mongoose.Types.ObjectId(req.query.id) })
        .populate('assignee')
        .exec()
    res.json({
        remarks: lead
    })
})

router.put('/lead/assignee/update', xAccessToken.token, async function (req, res, next) {
    var rules = {
        lead: 'required',
        assignee: 'required'
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Label required",
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
        var business = req.headers['business'];
        var bookings = [];
        var totalResult = 0;
        var loggedInDetails = await User.findById(decoded.user).exec();
        var check = await Lead.findById(req.body.lead).exec();
        if (check) {
            var management = await Management.findOne({ user: req.body.assignee, business: business }).populate('user').exec();
            if (management) {
                var leads = {};

                var data = {
                    assignee: management.user._id,
                    updated_at: new Date()
                }

                Lead.findOneAndUpdate({ _id: check._id }, { $set: data }, { new: false }, async function (err, doc) {
                    if (err) {
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Server Error",
                            responseData: err
                        });
                    }
                    else {
                        var booking = await Booking.findOne({ lead: check._id }).populate('manager').exec();
                        if (booking) {
                            Booking.findOneAndUpdate({ _id: booking._id }, {
                                $set: {
                                    manager: management.user._id,
                                    updated_at: new Date()
                                }
                            }, { new: false }, async function (err, doc) {
                                if (err) {
                                    return res.status(422).json({
                                        responseCode: 422,
                                        responseMessage: "Server Error",
                                        responseData: err
                                    });
                                }
                                else {
                                    var activity = management.user.name + " has been assigned";
                                    if (booking.manager) {
                                        activity = booking.manager.name + " has been replaced by " + management.user.name;
                                    }

                                    var activity = {
                                        user: loggedInDetails._id,
                                        name: loggedInDetails.name,
                                        stage: "Updates",
                                        activity: activity,
                                    };

                                    fun.bookingLog(booking._id, activity);
                                }
                            });
                        }

                        LeadRemark.create({
                            lead: check._id,
                            status: check.remark.status,
                            assignee: loggedInDetails._id,
                            customer_remark: "Lead assigned to - " + management.user.name,
                            assignee_remark: "Lead assigned to - " + management.user.name,
                            created_at: new Date(),
                            updated_at: new Date(),
                        }).then(function (newRemark) {
                            Lead.findOneAndUpdate({ _id: check._id }, { $push: { remarks: newRemark._id } }, { new: true }, async function (err, doc) {
                            })
                        });

                        var lead = await Lead.findById(req.body.lead).populate('assignee').exec();
                        var a = await User.findById(lead.advisor).exec();
                        var remark = await LeadRemark.findOne({ lead: lead._id }).sort({ created_at: -1 }).exec();
                        var assignee = {
                            name: lead.assignee.name,
                            email: lead.assignee.email,
                            contact_no: lead.assignee.contact_no,
                            _id: lead.assignee._id,
                            _id: lead.assignee._id,
                        }

                        if (a) {
                            var advisor = {
                                name: a.name,
                                email: a.email,
                                contact_no: a.contact_no,
                                _id: a._id,
                                _id: a._id,
                            }
                        }
                        else {
                            var advisor = null;
                        }

                        var push = {
                            _id: lead._id,
                            id: lead.id,
                            user: lead.user,
                            name: lead.name,
                            contact_no: lead.contact_no,
                            email: lead.email,
                            _id: lead._id,
                            id: lead.id,
                            priority: lead.priority,
                            contacted: lead.contacted,
                            type: lead.type,
                            lead_id: lead.lead_id,
                            date: moment(lead.updated_at).tz(req.headers['tz']).format('lll'),
                            source: lead.source,
                            status: lead.status,
                            important: lead.important,
                            follow_up: lead.follow_up,
                            remark: lead.remark,
                            assignee: assignee,
                            advisor: advisor,
                            created_at: moment(lead.created_at).tz(req.headers['tz']).format('lll'),
                            updated_at: moment(lead.updated_at).tz(req.headers['tz']).format('lll'),
                        }

                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Lead Added ",
                            responseData: push
                        });
                    }
                });
            }
            else {
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "User not found",
                    responseData: {}
                });
            }
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Lead not found",
                responseData: {}
            });
        }
    }
});

// router.put('/services/edit', async function(req, res, next) {
// console.log("API Called")
//     var token = req.headers['x-access-token'];
//     var secret = config.secret;
//     var decoded = jwt.verify(token, secret);
//     var user = decoded.user;
//     var business = req.headers['business'];
//     var lb = req.body.labour_cost;
//     var pc = req.body.part_cost
//     var pg = req.body.package
//     var sg = req.body.segment
//     var service_name = req.body.service
//     var category = req.body.category

//     // console.log("Labour= " + lb + "Part= " + pc + "Business Id " + business)
//     var not_inserted = [];

//     var automaker = null;
//     var _automaker = "";
//     var model = null;
//     var _model = "";
//     // return res.json({
//     //     data: req.body._id
//     // })
//     if (req.body._model) {
//         var model = await Model.findOne({ value: req.body._model }).exec();
//         if (model) {
//             var automaker = await Automaker.findById(model.automaker).exec();

//             model = model._id;
//             _model = model.value;
//             automaker = automaker._id;
//             _automaker = automaker.maker;

//         }
//     }


//     var tax_info = {}
//     var tax_info = await Tax.findOne({ rate: parseFloat(18), type: "GST" }).exec();
//     var tax_rate = tax_info.detail;

//     var parts = [];
//     var labours = [];
//     var opening_fitting = [];

//     if (parseFloat(req.body.part_cost) > 0) {
//         parts_visible = false;
//         var service = req.body.service;
//         var amount = Math.ceil(req.body.part_cost);
//         var base = amount;
//         var part_tax = [];

//         var x = (100 + tax_info.rate) / 100;
//         var tax_on_amount = amount / x;
//         if (tax_rate.length > 0) {
//             for (var r = 0; r < tax_rate.length; r++) {
//                 if (tax_rate[r].rate != tax_info.rate) {
//                     var t = tax_on_amount * (tax_rate[r].rate / 100);
//                     base = base - t;
//                     part_tax.push({
//                         tax: tax_rate[r].tax,
//                         rate: tax_rate[r].rate,
//                         amount: parseFloat(t.toFixed(2))
//                     });
//                 } else {
//                     base = base - t
//                     part_tax.push({
//                         tax: tax_info.tax,
//                         tax_rate: tax_info.rate,
//                         rate: tax_info.rate,
//                         amount: parseFloat(tax_on_amount.toFixed(2))
//                     });
//                 }
//             }
//         }

//         tax_detail = {
//             tax: tax_info.tax,
//             tax_rate: tax_info.rate,
//             rate: tax_info.rate,
//             base: parseFloat(base.toFixed(2)),
//             detail: part_tax
//         }

//         parts.push({
//             source: null,
//             item: req.body.service,
//             // hsn_sac: req.body.hsn_sac,
//             part_no: "",
//             quantity: 1,
//             issued: false,
//             rate: parseFloat(req.body.part_cost),
//             base: parseFloat(base.toFixed(2)),
//             amount: parseFloat(amount),
//             tax_amount: _.sumBy(part_tax, x => x.amount),
//             amount_is_tax: "inclusive",
//             customer_dep: 100,
//             insurance_dep: 0,
//             discount: 0,
//             tax: tax_info.tax,
//             tax_rate: tax_info.rate,
//             tax_info: tax_detail
//         })
//     }

//     if (parseFloat(req.body.labour_cost) > 0) {
//         var amount = parseFloat(req.body.labour_cost);
//         var base = amount;
//         var labour_tax = [];

//         var x = (100 + tax_info.rate) / 100;
//         var tax_on_amount = amount / x;

//         if (tax_rate.length > 0) {
//             for (var r = 0; r < tax_rate.length; r++) {
//                 if (tax_rate[r].rate != tax_info.rate) {
//                     var t = tax_on_amount * (tax_rate[r].rate / 100);
//                     base = base - t
//                     labour_tax.push({
//                         tax: tax_rate[r].tax,
//                         rate: parseFloat(tax_rate[r].rate.toFixed(2)),
//                         amount: parseFloat(t.toFixed(2))
//                     });
//                 } else {
//                     base = base - t
//                     labour_tax.push({
//                         tax: tax_info.tax,
//                         rate: parseFloat(tax_info.rate.toFixed(2)),
//                         amount: parseFloat(tax_on_amount.toFixed(2))
//                     });
//                 }
//             }
//         }
//         labours.push({
//             item: req.body.service,
//             quantity: 1,
//             // hsn_sac: req.body.hsn_sac,
//             rate: parseFloat(req.body.labour_cost),
//             base: parseFloat(base.toFixed(2)),
//             amount: parseFloat(amount),
//             discount: 0,
//             amount_is_tax: "inclusive",
//             customer_dep: 100,
//             insurance_dep: 0,
//             tax_amount: _.sumBy(labour_tax, x => x.amount),
//             tax: tax_info.tax,
//             tax_rate: tax_info.rate,
//             tax_info: {
//                 tax: tax_info.tax,
//                 tax_rate: tax_info.rate,
//                 rate: tax_info.rate,
//                 base: parseFloat(base.toFixed(2)),
//                 detail: labour_tax
//             }
//         })
//     }
//     var margin_total = parseFloat(req.body.labour_cost) * (40 / 100);
//     var mrp = parseFloat(req.body.labour_cost) + margin_total;
//     var data = {
//         business: business,
//         imported: true,
//         model: model,
//         _model: _model,
//         // package: req.body.package,
//         // segment: req.body.segment,
//         service: req.body.service,
//         parts: parts,
//         part_cost: parseFloat(req.body.part_cost),
//         labour: labours,
//         labour_cost: parseFloat(req.body.labour_cost),
//         cost: parseFloat(req.body.part_cost) + parseFloat(req.body.labour_cost),
//         mrp: parseFloat(req.body.part_cost) + Math.ceil(mrp),
//         amount_is_tax: "inclusive",
//         publish: true,
//         admin_status: "Standard",
//         created_at: new Date(),
//         updated_at: new Date(),
//         custom: false,
//         tax: "18.0% GST",
//         rate: 18,
//         tax_info: {
//             tax: tax_info.tax,
//             tax_rate: tax_info.rate,
//             rate: tax_info.rate,
//             base: parseFloat(base.toFixed(2)),
//             detail: labour_tax
//         },
//     };
//     if (category == "services") {
//         Service.findOneAndUpdate({ _id: req.body.id }, { $set: data }, { new: true }, async function(err, doc) {
//             res.status(200).json({
//                 responseCode: 200,
//                 responseMessage: "Successfully Updated",
//                 responseData: doc
//             });
//         });
//     } else if (category == "customization") {
//         Customization.findOneAndUpdate({ _id: req.body.id }, { $set: data }, { new: true }, async function(err, doc) {
//             res.status(200).json({
//                 responseCode: 200,
//                 responseMessage: "Successfully Updated",
//                 responseData: doc
//             });
//         });
//     } else if (category == "detailing") {
//         Detailing.findOneAndUpdate({ _id: req.body.id }, { $set: data }, { new: true }, async function(err, doc) {
//             res.status(200).json({
//                 responseCode: 200,
//                 responseMessage: "Successfully Updated",
//                 responseData: doc
//             });
//         });
//     } else if (category == "collision") {
//         Collision.findOneAndUpdate({ _id: req.body.id }, { $set: data }, { new: true }, async function(err, doc) {
//             res.status(200).json({
//                 responseCode: 200,
//                 responseMessage: "Successfully Updated",
//                 responseData: doc
//             });
//         });
//     } else {
//         res.status(400).json({
//             responseCode: 400,
//             responseMessage: "Service Category not found",
//             responseData: {}
//         });
//     }

// });

router.get('/insurance/reports/', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var cars = [];
    var filters = [];
    var totalResult = 0;

    var role = await Management.findOne({ user: user, business: business }).exec();
    if (req.query.page == undefined) {
        var page = 0;
    }
    else {
        var page = req.query.page;
    }

    var date = new Date();
    if (req.query.type == "range") {
        if (req.query.query) {
            var query = req.query.query;
            var ret = query.split("to");

            var from = new Date(ret[0]);
            var to = new Date(ret[1]);
        }
        else {
            var from = new Date(date.getFullYear(), date.getMonth(), 1);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }
    }

    else if (req.query.type == "period") {
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
            var query = 7;
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }
    }
    else {
        var from = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    }



    var specification = {};
    specification['$lookup'] = {
        from: "User",
        localField: "user",
        foreignField: "_id",
        as: "user",
    };
    filters.push(specification);

    var specification = {};
    specification['$unwind'] = {
        path: "$user",
        preserveNullAndEmptyArrays: false
    };
    filters.push(specification);

    var specification = {};
    specification['$lookup'] = {
        from: "Car",
        localField: "car",
        foreignField: "_id",
        as: "car",
    };
    filters.push(specification);

    var specification = {};
    specification['$unwind'] = {
        path: "$car",
        preserveNullAndEmptyArrays: true
    };


    var bar = new Date();
    bar.setDate(bar.getDate() + 20);

    if (req.query.query) {
        req.query.query = req.query.query.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
        var specification = {};
        specification['$match'] = {
            business: mongoose.Types.ObjectId(business),
            "car.insurance_info": { $exists: true },
            "car.insurance_info.expire": { $ne: "" },
            "car.insurance_info.expire": { $ne: null },
            "car.insurance_info.expire": { $lte: bar },
            $or: [
                { 'user.name': { $regex: req.query.query, $options: 'i' } },
                { 'user.contact_no': { $regex: req.query.query, $options: 'i' } },
                { 'car.title': { $regex: req.query.query, $options: 'i' } },
                { 'car.registration_no': { $regex: req.query.query, $options: 'i' } },
                { 'car.insurance_info.policy_holder': { $regex: req.query.query, $options: 'i' } },
                { 'car.insurance_info.insurance_company': { $regex: req.query.query, $options: 'i' } },
                { 'car.insurance_info.policy_type': { $regex: req.query.query, $options: 'i' } },
                { 'car.insurance_info.policy_no': { $eq: Math.ceil(req.query.query) } },
            ]
        };
        filters.push(specification);
    }
    else {
        var specification = {};
        specification['$match'] = {
            expire: { $gte: from, $lte: to },
            "car.insurance_info": { $exists: true },
            "business": mongoose.Types.ObjectId(business),
            "car.insurance_info.expire": { $ne: "" },
            "car.insurance_info.expire": { $ne: null },
            "car.insurance_info.expire": { $lte: bar }
        };
        filters.push(specification);
    }

    var specification = {};
    specification['$group'] = {
        _id: { car: "$car" },
        max: { $max: "$car.insurance_info.expire" },
        item: { $push: "$$ROOT" }
    };
    filters.push(specification);

    var specification = {};
    specification['$sort'] = {
        "max": -1
    };
    filters.push(specification);

    totalResult = await Booking.aggregate(filters);

    await Booking.aggregate(filters)
        .allowDiskUse(true)
        .cursor({ batchSize: 10 })
        .exec()
        .eachAsync(async function (booking) {
            if (booking._id.car[0].insurance_info) {
                var expire = moment(booking._id.car[0].insurance_info.expire).tz(req.headers['tz']).format('YYYY-MM-DD');
                var insurance_info = {
                    policy_holder: booking._id.car[0].insurance_info.policy_holder,
                    policy_no: booking._id.car[0].insurance_info.policy_no,
                    insurance_company: booking._id.car[0].insurance_info.insurance_company,
                    policy_type: booking._id.car[0].insurance_info.policy_type,
                    premium: booking._id.car[0].insurance_info.premium,
                    expire: expire,
                };
            }

            /*Car.findOneAndUpdate({ _id: booking._id.car[0]._id  },{ $set:{
                insurance_info: {
                    policy_holder: booking.item[0].insurance_info.policy_holder,
                    policy_no: booking.item[0].insurance_info.policy_no,
                    insurance_company: booking.item[0].insurance_info.insurance_company,
                    policy_type: booking.item[0].insurance_info.policy_type,
                    premium: booking.item[0].insurance_info.premium,
                    expire: new Date(expire).toISOString(),
                }
            }
    
            },{new: false}, function(err, doc){});*/

            cars.push({
                _id: booking._id.car[0]._id,
                id: booking._id.car[0]._id,
                title: booking._id.car[0].title,
                modelName: booking._id.car[0]._automaker + " " + booking._id.car[0]._model,
                price: price(booking._id.car[0].price),
                numericPrice: booking._id.car[0].price,
                carId: booking._id.car[0].carId,
                fuel_type: booking._id.car[0].fuel_type,
                vehicle_color: booking._id.car[0].vehicle_color,
                registration_no: booking._id.car[0].registration_no,
                manufacture_year: booking._id.car[0].manufacture_year,
                user: await User.findById(booking._id.car[0].user).select('name email contact_no business_info').exec(),
                status: booking._id.car[0].status,
                insurance_info: insurance_info,
                created_at: booking._id.car[0].created_at,
                updated_at: booking._id.car[0].updated_at
            });
        });

    res.status(200).json({
        responseCode: 200,
        responseMessage: "Insurance Dues",
        responseInfo: {
            totalResult: totalResult.length
        },
        responseData: cars,
    });
});

router.put('/lead/category/update', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var bookings = [];
    var totalResult = 0;
    var rules = {
        lead: 'required'
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Label required",
            responseData: {
                res: validation.errors.all()
            }
        })
    }
    else {
        var check = await Lead.findOne({ business: business, _id: req.body.lead }).exec();
        if (check) {
            var data = {
                updated_at: new Date(),
                category: req.body.category
            };


            Lead.findOneAndUpdate({ _id: req.body.lead }, { $set: data }, { new: false }, async function (err, doc) {
                if (err) {
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Server Error",
                        responseData: err
                    });
                }
                else {
                    LeadRemark.create({
                        lead: check._id,
                        reason: check.remark.reason,
                        status: check.remark.status,
                        color_code: check.remark.color_code,
                        assignee: user,
                        customer_remark: "Category changes to - " + req.body.category,
                        assignee_remark: "Category changes to - " + req.body.category,
                        created_at: new Date(),
                        updated_at: new Date(),
                    }).then(function (newRemark) {
                        Lead.findOneAndUpdate({ _id: check._id }, { $push: { remarks: newRemark._id } }, { new: true }, async function (err, doc) {
                        })
                    });

                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Lead Updated",
                        responseData: {}
                    });
                }
            });
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Lead not found",
                responseData: {
                }
            })
        }
    }
});

router.get('/cre/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var business = req.headers['business'];


    var technicians = [];
    await Management.find({ business: business, role: "CRE" })
        .populate({ path: "user" })
        .cursor().eachAsync(async (v) => {
            technicians.push({
                _id: v.user._id,
                id: v.user.id,
                name: v.user.name,
                username: v.user.username,
                email: v.user.email,
                contact_no: v.user.contact_no,
            })
        })

    res.status(200).json({
        responseCode: 200,
        responseMessage: "Service Advisors",
        responseData: technicians
    })
});



router.get('/leads/count/get', async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var data = [];
    var business = req.headers['business'];
    var role = await Management.findOne({ user: user, business: business }).exec();
    assignee = null
    // if (role.role == 'CRE') {
    //     assignee = mongoose.Types.ObjectId(role.user)
    // } else 
    if (role.role == 'Admin' || role.role == 'Manager') {
        assignee = { $ne: null }
    } else {
        assignee = mongoose.Types.ObjectId(role.user)
    }


    var open = await Lead.find({ "remark.status": "Open", business: business, assignee: assignee }).count().exec()
    var followUp = await Lead.find({ "remark.status": { $in: ["Follow-Up"] }, "follow_up.date": { $lt: new Date() }, business: business, assignee: assignee }).count().exec()

    var estimateRequested = await Lead.find({ "remark.status": { $in: ["EstimateRequested"] }, business: business, assignee: assignee }).count().exec()
    var outbound = await Booking.find({ isOutbound: true, status: "EstimateRequested", business: business }).count().exec();
    estimateRequested = estimateRequested - outbound;
    var approval = await Lead.find({ "remark.status": { $in: ["Approval"] }, business: business, assignee: assignee }).count().exec()
    var confirmed = await Lead.find({ "remark.status": { $in: ["Confirmed"] }, business: business, assignee: assignee }).count().exec();

    // var outbound = await Booking.find({ isOutbound: true, status: "Confirmed", business: business }).count().exec();
    // if (role.role == 'CRE') {
    //     assignee = mongoose.Types.ObjectId(role.user)
    //     var query = { isOutbound: false, manager: assignee, converted: true, status: { $nin: ["Rejected", "Cancelled", "Inactive", "EstimateRequested", 'Confirmed'] } }
    // } else
    if (role.role == 'Admin' || role.role == 'Manager') {
        assignee = { $ne: null }
        var query = { isOutbound: false, business: business, converted: true, status: { $nin: ["Rejected", "Cancelled", "Inactive", "EstimateRequested", 'Confirmed'] } }
    } else {
        assignee = mongoose.Types.ObjectId(role.user)
        var query = { isOutbound: false, manager: assignee, converted: true, status: { $nin: ["Rejected", "Cancelled", "Inactive", "EstimateRequested", 'Confirmed'] } }

    }
    var converted = await Booking.find(query).count().exec();

    var confirmedQuery = null
    // if (role.role == "CRE") {
    //     confirmedQuery = { isOutbound: false, manager: user, date: { $gte: new Date() }, status: { $in: ["Confirmed"] } }
    // }
    // else
    if (role.role == 'Admin' || role.role == 'Manager') {
        confirmedQuery = { isOutbound: false, business: business, date: { $gte: new Date() }, status: { $in: ["Confirmed"] } }
    } else {
        confirmedQuery = { isOutbound: false, manager: user, date: { $gte: new Date() }, status: { $in: ["Confirmed"] } }

    }
    var confirmed = await Booking.find(confirmedQuery).count().exec();

    var missedQuery = null
    // if (role.role == "CRE") {
    //     missedQuery = { isOutbound: false, manager: user, date: { $lt: new Date() }, status: { $in: ["Confirmed"] } }
    // }
    // else 
    if (role.role == 'Admin' || role.role == 'Manager') {
        missedQuery = { isOutbound: false, business: business, date: { $lt: new Date() }, status: { $in: ["Confirmed"] } }
    } else {
        missedQuery = { isOutbound: false, manager: user, date: { $lt: new Date() }, status: { $in: ["Confirmed"] } }

    }
    var missed = await Booking.find(missedQuery).count().exec();

    res.status(200).json({
        responseCode: 200,
        responseMessage: "Stats Counts",
        responseData: {
            open: open,
            followUp: followUp,
            // closedLost: closedLost,
            converted: converted,
            // lost: lost,
            estimateRequested: estimateRequested,
            approval: approval,
            confirmed: confirmed,
            missed: missed,
            // rework: rework,
            // dissatisfied: dissatisfied,
            // satisfied: satisfied
        }
    });
});
router.get('/leads/booking/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var bookings = [];
    var totalResult = 0;
    var lead = {}
    // console.log('startDate', req.query.date, req.query.endDate)

    // console.log("Query Status = " + req.query.status)

    var role = await Management.findOne({ user: user, business: business }).exec();
    console.log("Role  = " + role.role)
    user = null
    // if (role.role == 'CRE') {
    //     user = role.user
    // } else

    if (role.role == 'Admin' || role.role == 'Manager') {
        user = { $ne: null }
    } else {
        user = role.user
    }
    if (req.query.status == "Converted") {
        // console.log("Converted")
        // if (role.role == "CRE") {
        //     var query = { isOutbound: false, manager: user, business: business, converted: true, status: { $nin: ["Rejected", "Cancelled", "Inactive", "EstimateRequested", 'Confirmed'] } }
        // }
        // else 
        if (role.role == 'Admin' || role.role == 'Manager') {
            var query = { isOutbound: false, business: business, converted: true, status: { $nin: ["Rejected", "Cancelled", "Inactive", "EstimateRequested", 'Confirmed'] } }
        } else {
            var query = { isOutbound: false, manager: user, business: business, converted: true, status: { $nin: ["Rejected", "Cancelled", "Inactive", "EstimateRequested", 'Confirmed'] } }

        }
    } else if (req.query.status == "EstimateRequested") {
        // console.log("EstimateRequested")

        // if (role.role == "CRE") {
        //     var query = { manager: user, status: { $in: ["EstimateRequested"] } }
        // }
        // else
        if (role.role == 'Admin' || role.role == 'Manager') {
            var query = { business: business, status: { $in: ["EstimateRequested"] } }
        } else {
            var query = { manager: user, status: { $in: ["EstimateRequested"] } }
        }
    } else if (req.query.status == "Approval") {
        // console.log("Approval")

        // if (role.role == "CRE") {
        //     var query = { manager: user, converted: true, status: { $in: ["Approval"] } }
        // }
        // else
        if (role.role == 'Admin' || role.role == 'Manager') {
            var query = { business: business, converted: true, status: { $nin: ["Approval"] } }
        } else {
            var query = { manager: user, converted: true, status: { $in: ["Approval"] } }
        }
    } else if (req.query.status == "Confirmed") {
        // console.log("Approval")
        // if (role.role == "CRE") {
        //     var query = { isOutbound: false, manager: user, date: { $gte: new Date() }, status: { $in: ["Confirmed"] } }
        // }
        // else
        if (role.role == 'Admin' || role.role == 'Manager') {
            var query = { isOutbound: false, business: business, date: { $gte: new Date() }, status: { $in: ["Confirmed"] } }
        } else {
            var query = { isOutbound: false, manager: user, date: { $gte: new Date() }, status: { $in: ["Confirmed"] } }

        }
    }
    else if (req.query.status == "Missed") {
        // console.log("Approval")
        // if (role.role == "CRE") {
        //     var query = { isOutbound: false, manager: user, date: { $lt: new Date() }, status: { $in: ["Confirmed"] } }
        // }
        // else
        if (role.role == 'Admin' || role.role == 'Manager') {
            var query = { isOutbound: false, business: business, date: { $lt: new Date() }, status: { $in: ["Confirmed"] } }
        } else {
            var query = { isOutbound: false, manager: user, date: { $lt: new Date() }, status: { $in: ["Confirmed"] } }

        }
    }
    else {
        // console.log("Elsee")
        // if (role.role == "CRE") {
        //     console.log("Convetred " + user)
        //     var query = { isOutbound: false, manager: user, business: business, converted: true, status: { $nin: ["Rejected", "Cancelled", "Inactive", "EstimateRequested", 'Confirmed'] } }
        // }
        // else
        if (role.role == 'Admin' || role.role == 'Manager') {
            var query = { isOutbound: false, business: business, converted: true, status: { $nin: ["Rejected", "Cancelled", "Inactive", "EstimateRequested", 'Confirmed'] } }
        } else {
            var query = { isOutbound: false, manager: user, business: business, converted: true, status: { $nin: ["Rejected", "Cancelled", "Inactive", "EstimateRequested", 'Confirmed'] } }

        }
    }
    if (req.query.date) {
        query['created_at'] = { $gte: new Date(req.query.date), $lte: new Date(req.query.endDate) }
    }

    if (req.query.page == undefined) {
        var page = 0;
    }
    else {
        var page = req.query.page;
    }

    var page = Math.max(0, parseInt(page));

    var totalResult = await Booking.find(query).count().exec();
    // console.log('booking find query.....', JSON.stringify(query, null, '\t'))
    await Booking.find(query)
        .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no email business_info" } })
        .populate({ path: 'manager', populate: { path: 'user', select: "_id id name contact_no email" } })
        .populate({ path: 'lead', populate: { path: 'lead', select: "_id id name contact_no email" } })
        .populate({ path: 'car', select: '_id id title registration_no ic rc', populate: { path: 'thumbnails' } })
        .sort({ updated_at: -1 }).skip(config.perPage * page).limit(config.perPage)
        .cursor().eachAsync(async (booking) => {
            if (booking.address) {
                var address = await Address.findOne({ _id: booking.address }).exec();
            }
            else {
                var address = {};
            }

            if (booking.car) {
                var car = {
                    title: booking.car.title,
                    _id: booking.car._id,
                    id: booking.car.id,
                    rc_address: booking.car.rc_address,
                    ic_address: booking.car.ic_address,
                    ic: booking.car.ic,
                    rc: booking.car.rc,
                    registration_no: booking.car.registration_no,
                }
            }
            else {
                var car = {
                    title: "",
                    _id: null,
                    id: null,
                    rc_address: "",
                    ic_address: "",
                    ic: "",
                    rc: "",
                    registration_no: "",
                }
            }
            var manager = null;
            if (booking.manager) {
                manager = {
                    name: booking.manager.name,
                    _id: booking.manager._id,
                    id: booking.manager.id,
                    contact_no: booking.manager.contact_no,
                    email: booking.manager.email
                }
            }
            var status = booking.status;
            if (booking.lead) {
                lead = {
                    name: booking.lead.name,
                    _id: booking.lead._id,
                    id: booking.lead.id,
                    contact_no: booking.lead.contact_no,
                    source: booking.lead.source,
                    email: booking.lead.email
                }
                status = booking.lead.remark.status
            }
            if (req.query.status == "Confirmed" || req.query.status == "Missed") {
                status = req.query.status;
            }

            bookings.push({
                _id: booking._id,
                id: booking._id,
                car: car,
                user: {
                    name: booking.user.name,
                    _id: booking.user._id,
                    id: booking.user.id,
                    contact_no: booking.user.contact_no,
                    email: booking.user.email,
                    business_info: booking.user.business_info
                },
                manager: manager,
                lead: lead,
                services: booking.services,
                convenience: booking.convenience,
                date: moment(booking.date).tz(req.headers['tz']).format('ll'),
                time_slot: booking.time_slot,
                status: status,
                // status: req.query.status,
                booking_no: booking.booking_no,
                job_no: booking.job_no,
                estimation_requested: booking.estimation_requested,
                address: address,
                remarks: booking.remarks,
                customer_requirements: booking.customer_requirements,
                payment: booking.payment,
                txnid: booking.txnid,
                __v: booking.__v,
                created_at: moment(booking.created_at).tz(req.headers['tz']).format('lll'),
                updated_at: moment(booking.updated_at).tz(req.headers['tz']).format('lll'),
            });

        });

    res.status(200).json({
        responseCode: 200,
        responseMessage: "to",
        responseData: bookings,
        responseInfo: {
            totalResult: totalResult,
            query: query
        }
    });
});

router.get('/lead/details/get', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /lead/details/get Api Called from lead.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    var rules = {
        lead: 'required'
    };
    // console.log("lead/details/get : " + req.body)
    var validation = new Validator(req.query, rules);
    if (validation.fails()) {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR: Validation failed, LeadId is required to get the lead details.");
        }
        res.status(422).json({
            responseCode: 422,
            responseMessage: "lead required",
            responseData: {
                res: validation.errors.all()
            }
        });
    }
    else {
        // console.log("Validation Passed")
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var user = decoded.user;
        var loggedInDetails = await User.findById(decoded.user).exec();
        var business = req.headers['business'];
        var bookings = [];
        var totalResult = 0;

        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Fatching Lead and their details, LeadId:" + req.query.lead + ", User:" + loggedInDetails);
        }
        var lead = await Lead.findById(req.query.lead).populate('assignee').populate('advisor').exec();
        if (lead) {
            // console.log("Lead Found")
            var a = lead.advisor;
            var logs = [];
            if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("DEBUG: Fatching Lead remark and their details, LeadId:" + lead._id + ", User:" + loggedInDetails);
            }
            await LeadRemark.find({ lead: lead._id })
                .populate('assignee')
                .sort({ created_at: -1 })
                .cursor()
                .eachAsync(async (l) => {

                    if (l.assignee_remark == "") {
                        l.assignee_remark = l.customer_remark
                    }

                    if (l.assignee) {
                        var assignee = {
                            _id: l.assignee._id,
                            id: l.assignee._id,
                            name: l.assignee.name,
                            email: l.assignee.email,
                            contact_no: l.assignee.contact_no,
                        };
                    }
                    else {
                        var assignee = {
                            _id: "",
                            id: "",
                            name: "",
                            email: "",
                            contact_no: "",
                        };
                    }

                    logs.push({
                        source: l.source,
                        type: l.type,
                        status: l.status,
                        reason: l.reason,
                        isRemark: l.isRemark,
                        customer_remark: l.customer_remark,
                        assignee_remark: l.assignee_remark,
                        assignee: assignee,
                        color_code: l.color_code,
                        created_at: moment(l.created_at).tz(req.headers['tz']).format('lll'),
                        updated_at: moment(l.updated_at).tz(req.headers['tz']).format('lll'),
                    })
                })

            if (lead.assignee) {
                var assignee = {
                    name: lead.assignee.name,
                    email: lead.assignee.email,
                    contact_no: lead.assignee.contact_no,
                    _id: lead.assignee._id,
                    id: lead.assignee._id,
                }
            }
            else {
                var assignee = {
                    name: "",
                    email: "",
                    contact_no: "",
                    _id: null,
                    id: null,
                }
            }


            if (lead.follow_up == null) {
                var follow_up = {}
            }
            else {
                follow_up = lead.follow_up
            }

            var last_active = "";
            if (lead.user) {
                var get_last_active = await User.findById(lead.user).exec();
                if (get_last_active) {
                    last_active = moment(get_last_active.updated_at).tz(req.headers['tz']).format('lll');
                }
            }

            if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("DEBUG: Fatching Booking Details for the Lead, LeadId:" + lead._id);
            }
            var b = await Booking.findOne({ lead: lead._id }).sort({ updated_at: -1 }).exec();
            var booking = null
            var booking_slot = null
            if (b) {
                booking = b._id
                booking_slot = {
                    date: b.date,
                    time_slot: b.time_slot,
                    status: b.status
                }


            }
            //Abhinav Tyagi
            var alternate_no = ''
            var variantDetails = null;
            if (lead.additional_info) {
                if (lead.additional_info.alternate_no) {

                    alternate_no = lead.additional_info.alternate_no
                }

                if (lead.additional_info.variant) {
                    variantDetails = await Variant.findOne({ _id: lead.additional_info.variant }).exec();
                }

            }


            var push = {
                booking: booking,
                user: lead.user,
                name: lead.name,
                contact_no: lead.contact_no,
                email: lead.email,
                _id: lead._id,
                id: lead.id,
                priority: lead.priority,
                category: lead.category,
                type: lead.type,
                lead_id: lead.lead_id,
                date: moment(lead.updated_at).tz(req.headers['tz']).format('lll'),
                source: lead.source,
                status: lead.status,
                important: lead.important,
                follow_up: follow_up,
                remark: lead.remark,
                psf: lead.psf,
                assignee: assignee,
                logs: logs,
                last_active: last_active,
                alternate_no: alternate_no,
                isStared: lead.isStared,
                booking_slot: booking_slot,
                variantDetails: variantDetails,
                created_at: moment(lead.created_at).tz(req.headers['tz']).format('lll'),
                updated_at: moment(lead.updated_at).tz(req.headers['tz']).format('lll'),
            }
            res.status(200).json({
                responseCode: 200,
                responseMessage: "Lead Added ",
                responseData: push
            });
            if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("INFO: Lead Added Successfully, Name:" + lead.name + ", User:" + loggedInDetails.name);
            }
        }
        else {
            if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("INFO: Lead Not Successfully, LeadId:" + req.query.lead + ", User:" + loggedInDetails.name);
            }
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Lead Not found",
                responseData: {}
            });
        }
    }
});

router.put('/lead/edit', xAccessToken.token, async function (req, res, next) {
    // console.log("Lead Edit ")
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var bookings = [];
    var totalResult = 0;
    var name = ""
    var user = ""
    var contact_no = ""
    var email = ""
    // console.log("Lead ID= " + req.body.lead)
    var check = await Lead.findById(req.body.lead).exec();
    if (check) {
        var last = await Lead.findOne({ contact_no: req.body.contact_no, _id: { $ne: req.body.lead }, business: business, "remark.status": { $in: ["Open", "Follow-Up"] } }).sort({ updated_at: -1 }).exec();

        if (last) {
            return res.status(422).json({
                responseCode: 422,
                responseMessage: "Lead already exist #" + last.lead_id + " [" + last.remark.status + "]",
                responseData: {}
            });
        }
        else {
            // console.log("Last Is False")
            var token = req.headers['x-access-token'];
            var secret = config.secret;
            var decoded = jwt.verify(token, secret);

            //Abhinav :-Alternate Mobile number
            var alternate_no = req.body.alternate_no;
            // console.log(req.body.alternate_no)
            if (req.body.alternate_no) {
                alternate_no = req.body.alternate_no
            }

            var car = null;
            if (req.body.variant) {
                car = req.body.variant;
            }

            var assignee = check.assignee;
            if (req.body.assignee) {
                assignee = req.body.assignee
            }
            var checkUser = await User.findOneAndUpdate({ contact_no: req.body.contact_no, "account_info.type": "user" }, {
                $set: {
                    name: req.body.name,
                    // email: req.body.email,
                }
            }).exec();
            if (checkUser) {
                user = checkUser._id;
                name = req.body.name;
                // name = checkUser.name;
                contact_no = checkUser.contact_no;
                email = req.body.email;
            }
            else {
                user = null;
                name = req.body.name;
                contact_no = req.body.contact_no;
                email = req.body.email;
            }

            var leads = {};
            var data = {};

            // if (check.additional_info) {
            //     // console.log("Additional info exist");
            //     data = {
            //         user: user,
            //         name: req.body.name,
            //         contact_no: contact_no,
            //         email: req.body.email,
            //         "additional_info.alternate_no": alternate_no,                //Abhinav
            //         "additional_info.variant": alternate_no,                //Abhinav
            //         updated_at: new Date()
            //     }
            // } else {
            // console.log("Additional info not exist");

            // console.log("Name = " + name)
            data = {
                user: user,
                name: req.body.name,
                assignee: assignee,
                "additional_info.alternate_no": alternate_no,
                "additional_info.variant": car,
                contact_no: contact_no,
                email: req.body.email,
                // additional_info: additional_info,                //Abhinav
                updated_at: new Date()
            }
            // }




            await Lead.findOneAndUpdate({ _id: check._id }, { $set: data }, { new: true }, async function (err, doc) {
                var lead = await Lead.findById(req.body.lead).populate('assignee').exec();

                var a = await User.findById(lead.advisor).exec();
                var remark = await LeadRemark.findOne({ lead: lead._id }).sort({ created_at: -1 }).exec();
                var assignee = {
                    name: lead.assignee.name,
                    email: lead.assignee.email,
                    contact_no: lead.assignee.contact_no,
                    _id: lead.assignee._id,
                    _id: lead.assignee._id,
                }

                if (a) {
                    var advisor = {
                        name: a.name,
                        email: a.email,
                        contact_no: a.contact_no,
                        _id: a._id,
                        _id: a._id,
                    }
                }
                else {
                    var advisor = null;
                }

                var push = {
                    _id: lead._id,
                    id: lead.id,
                    user: lead.user,
                    name: lead.name,
                    contact_no: lead.contact_no,
                    email: lead.email,
                    _id: lead._id,
                    id: lead.id,
                    priority: lead.priority,
                    contacted: lead.contacted,
                    type: lead.type,
                    lead_id: lead.lead_id,
                    date: moment(lead.updated_at).tz(req.headers['tz']).format('lll'),
                    source: lead.source,
                    status: lead.status,
                    important: lead.important,
                    follow_up: lead.follow_up,
                    remark: lead.remark,
                    assignee: assignee,
                    advisor: advisor,
                    // additional_info:{
                    //     alternate_no:alternate_no

                    // },
                    created_at: moment(lead.created_at).tz(req.headers['tz']).format('lll'),
                    updated_at: moment(lead.updated_at).tz(req.headers['tz']).format('lll'),
                }

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Lead Updated ",
                    responseData: push
                });

            });
        }
    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Lead not found",
            responseData: {}
        });
    }
});

router.get('/lead/status/get', xAccessToken.token, async function (req, res, next) {
    var leads = [];
    var status = await LeadStatus.findOne({ stage: req.query.stage }).exec();
    if (status) {
        res.status(200).json({
            responseCode: 200,
            responseMessage: "success",
            responseData: status.status
        });
    }
    else {
        res.status(200).json({
            responseCode: 200,
            responseMessage: "success",
            responseData: []
        });
    }
});

router.put('/lead/remark/update', xAccessToken.token, async function (req, res, next) {
    // console.log("Lead Remark Update ")
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var bookings = [];
    var totalResult = 0;
    var rules = {
        lead: 'required'
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Label required",
            responseData: {
                res: validation.errors.all()
            }
        })
    }
    else {
        var role = await Management.findOne({ user: user, business: business }).exec();
        var assignee_remark = req.body.remark;
        var customer_remark = req.body.remark;
        var lead = await Lead.findOne({ business: business, _id: req.body.lead }).exec();
        var loggedInDetails = await User.findById(decoded.user).exec();
        if (lead) {
            var advisor = null;
            if (lead.advisor) {
                advisor = lead.advisor;
            }
            var data = {};
            var follow_up = {};
            var status = await LeadStatus.findOne({ status: req.body.status }).exec();

            if (req.body.reason) {
                var reason = req.body.reason;
            }
            else {
                if (req.body.status == "Closed") {
                    var reason = "Info Only";
                }
                else {
                    var reason = "";
                }
            }
            // req.body.status == "Follow-Up" ||
            if (req.body.status == "PSF") {
                // console.log("new Date(req.body.date).toISOString() = " + new Date(req.body.date).toISOString())
                // console.log("Time = " + req.body.time)
                if (req.body.date) {

                    var follow_up = {
                        date: new Date(req.body.date).toISOString(),
                        time: req.body.time,
                        created_at: new Date(),
                        updated_at: new Date()
                    }
                } else {
                    var time = lead.follow_up.time;
                    if (req.body.time) {
                        time = req.body.time
                    }
                    var follow_up = {
                        date: new Date(lead.follow_up.date).toISOString(),
                        time: time,
                        updated_at: new Date()
                    }
                }
            }
            // console.log("Status   = " + req.body.status)
            if (req.body.status == "Follow-Up") {
                // console.log("2ND new Date(req.body.date).toISOString() = " + new Date(req.body.date).toISOString())
                // console.log("Time = " + req.body.time)
                if (req.body.date) {
                    var follow_up = {
                        date: new Date(req.body.date).toISOString(),
                        time: req.body.time,
                        created_at: new Date(),
                        updated_at: new Date()
                    }
                }
                else {
                    var time = lead.follow_up.time;
                    if (req.body.time) {
                        time = req.body.time
                    }
                    var follow_up = {
                        date: new Date(lead.follow_up.date).toISOString(),
                        time: time,
                        updated_at: new Date()
                    }
                }
                // assignee_remark = req.body.remark + " \n FollowUp :- " + req.body.date + " - " + req.body.time;
                // customer_remark = req.body.remark + " \n FollowUp :- " + req.body.date + " - " + req.body.time;

            }
            // else if (req.body.status != "Follow-Up") {
            //     assignee_remark = req.body.remark;
            //     customer_remark = req.body.remark;
            // }
            assignee_remark = req.body.remark;
            customer_remark = req.body.remark;

            if (req.body.advisor) {
                var checkAdvisor = await Management.findOne({ user: req.body.advisor, business: business }).exec();
                if (checkAdvisor) {
                    var advisor = checkAdvisor.user;
                }
                else {
                    return res.status(400).json({
                        responseCode: 400,
                        responseMessage: "Unauthorized",
                        responseData: {}
                    });
                }
            }

            data = {
                updated_at: new Date(),
                remark: {
                    lead: lead._id,
                    follow_up: follow_up,
                    status: req.body.status,
                    reason: reason,
                    color_code: "",
                    assignee: user,
                    isRemark: req.body.isRemark,
                    isResponse: true,
                    // customer_remark: req.body.remark,
                    // assignee_remark: req.body.remark,
                    assignee_remark: assignee_remark,
                    customer_remark: customer_remark,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                advisor: advisor,
                follow_up: follow_up,
            };
            // console.log(req.body.time + " , Line time = " + data.follow_up.time)
            await Lead.findOneAndUpdate({ _id: req.body.lead }, { $set: data }, { new: true }, async function (err, doc) {
                if (err) {
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Server Error",
                        responseData: err
                    });
                }
                else {



                    data.remark.lead = req.body.lead;
                    data.created_at = new Date();

                    await LeadRemark.create(data.remark).then(async function (newRemark) {
                        await Lead.findOneAndUpdate({ _id: req.body.lead }, { $push: { remarks: newRemark._id } }, { new: true }, async function (err, doc) {
                        })
                    });

                    /*if(!loggedInDetails._id.equals(lead.assignee))
                    {
                        var notify = {
                            receiver: [lead.assignee],
                            activity: "lead",
                            tag: "RemarkUpdate",
                            source: req.body.lead,
                            sender: loggedInDetails._id,
                            points: 0
                        }

                        fun.newNotification(notify);
                    }*/


                    var lead = await Lead.findById(req.body.lead).populate('assignee').exec();

                    //To Create Out Bound Leads :Abhinav Tyagi
                    if (req.body.status == "Lost") {
                        var lostCreated = await q.all(businessFunctions.outboundLostLeadAdd(lead, 'Lost', loggedInDetails));
                        // console.log("Lost Lead Created = " + JSON.stringify(lostCreated))
                    }
                    //


                    if (req.body.status == 'Closed' || req.body.status == 'Lost' || req.body.status == 'PSF') {
                        // console.log('Enter inside the second condition....')
                        if (lead.booking) {
                            let booking = await Booking.findOneAndUpdate({ _id: mongoose.Types.ObjectId(lead.booking) }, { status: "Cancelled" })
                        }
                    }

                    var a = await User.findById(lead.advisor).exec();


                    let assignee = {
                        name: lead.assignee.name,
                        email: lead.assignee.email,
                        contact_no: lead.assignee.contact_no,
                        _id: lead.assignee._id
                    }



                    if (a) {
                        var advisor = {
                            name: a.name,
                            email: a.email,
                            contact_no: a.contact_no,
                            _id: a._id,
                            _id: a._id,
                        }

                    }
                    else {
                        var advisor = null;
                    }

                    var push = {
                        user: lead.user,
                        name: lead.name,
                        contact_no: lead.contact_no,
                        email: lead.email,
                        _id: lead._id,
                        id: lead.id,
                        priority: lead.priority,
                        contacted: lead.contacted,
                        type: lead.type,
                        lead_id: lead.lead_id,
                        date: moment(lead.updated_at).tz(req.headers['tz']).format('lll'),
                        source: lead.source,
                        status: lead.status,
                        important: lead.important,
                        follow_up: lead.follow_up,
                        remark: lead.remark,
                        assignee: assignee,
                        advisor: advisor,
                        created_at: moment(lead.created_at).tz(req.headers['tz']).format('lll'),
                        updated_at: moment(lead.updated_at).tz(req.headers['tz']).format('lll'),
                    }

                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Lead Updated",
                        responseData: push
                    });
                }
            });
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Lead not found",
                responseData: {
                }
            })
        }
    }
});

router.post('/lead/add', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    // console.log("Lead addd ")
    var loggedInDetails = await User.findById(decoded.user).exec();
    var role = await Management.findOne({ user: decoded.user, business: business }).exec();

    if (req.body.contact_no) {
        var last = await Lead.findOne({ contact_no: req.body.contact_no, business: business, "remark.status": { $in: ["Open", "Follow-Up"] } }).sort({ updated_at: -1 }).exec();
    }
    else {
        var last = null
    }
    // async function getAssignee(user, business) {
    //     var role = await Management.findOne({ user: user, business: business }).exec();
    //     if (role.role == "CRE") {
    //         advisor = role.user;
    //     } else {
    //         var assigneeLead = [];
    //         await Management.find({ business: business, role: "CRE" })
    //             .cursor().eachAsync(async (a) => {
    //                 var d = await Lead.find({ business: business, assignee: a.user }).count().exec();
    //                 assigneeLead.push({
    //                     user: a.user,
    //                     count: d
    //                 })
    //             });

    //         if (assigneeLead.length != 0) {
    //             assigneeLead.sort(function (a, b) {
    //                 return a.count > b.count;
    //             });

    //             advisor = assigneeLead[0].user;

    //         } else {
    //             advisor = role.business;
    //         }
    //     }


    //     return advisor;
    // }
    var assignee = await q.all(businessFunctions.getAssignee(decoded.user, business));

    if (last) {
        return res.status(422).json({
            responseCode: 422,
            responseMessage: "Lead already exist #" + last.lead_id + " [" + last.remark.status + "]",
            responseData: {}
        });
    }
    else {
        var data = {}
        var status = await LeadStatus.findOne({ status: req.body.status }).exec();
        var follow_up = {};
        var advisor = null;


        if (req.body.status == "Follow-Up") {
            if (req.body.date) {
                var follow_up = {
                    date: new Date(req.body.date).toISOString(),
                    time: req.body.time,
                    created_at: new Date(),
                    updated_at: new Date()
                }
            }
        }



        var contacted = false;

        if (req.body.contacted) {
            contacted = true;
        }
        var priority = 2;
        if (req.body.priority) {
            if (parseInt(req.body.priority)) {
                priority = req.body.priority;
            }
            else {
                priority = 2;
            }
        }
        //Abhinav Tygai :: Update Status in LeadGen Collection To be Tested
        var st_update = await LeadGen.findOne({ contact_no: req.body.contact_no }).exec();

        if (st_update) {
            // console.log("Inside LeadGen")
            st_update.remark.status = "Converted";
            st_update.converted = true;
            st_update.save();
        }
        //End By Abhinav
        var checkUser = await User.findOne({ contact_no: req.body.contact_no, "account_info.type": "user" }).exec();
        if (checkUser) {
            var user = checkUser._id;
            var name = checkUser.name;
            var contact_no = checkUser.contact_no;
            var email = checkUser.email;
        }
        else {
            var user = null;
            var name = req.body.name;
            var contact_no = req.body.contact_no;
            var email = req.body.email;
        }

        var remark = {
            assignee: assignee,
            status: req.body.status,
            reason: req.body.reason,
            customer_remark: req.body.remark,
            assignee_remark: req.body.remark,
            color_code: "",
            created_at: new Date(),
            updated_at: new Date()
        }
        //Abhinav Alternate
        var variant = null;
        if (req.body.variant) {
            variant = req.body.variant

        }
        // console.log("Variant  body = " + req.body.variant)
        // console.log("Variant  = " + variant)

        var alternate_no = ""
        if (req.body.alternate_no) {
            alternate_no = req.body.alternate_no
        }
        var additional_info = {
            variant: variant,
            alternate_no: alternate_no
        }
        // if (req.body.alternate_no) {
        //     "additional_info.alternate_no" = req.body.alternate_no;
        // }
        var category = "Booking";
        if (req.body.category) {
            category = req.body.category;
        }
        var isStared = false;
        if (req.body.isStared) {
            isStared = req.body.isStared
        }


        var lead = {
            user: user,
            name: name,
            contact_no: contact_no,
            email: email,
            type: req.body.type,
            follow_up: follow_up,
            business: req.headers['business'],
            assignee: assignee,
            source: req.body.source,
            model: req.body.model,
            remark: remark,
            priority: priority,
            category: category,
            additional_info: additional_info,
            isStared: isStared,
            created_at: new Date(),
            updated_at: new Date(),

        };
        await Lead.create(lead).then(async function (l) {
            var count = await Lead.find({ _id: { $lt: l._id }, business: business }).count();
            var lead_id = count + 10000;

            Lead.findOneAndUpdate({ _id: l._id }, { $set: { lead_id: lead_id } }, { new: true }, async function (err, doc) {
            })

            LeadRemark.create({
                lead: l._id,
                source: l.source,
                type: l.type,
                status: l.remark.status,
                reason: req.body.reason,
                customer_remark: req.body.remark,
                assignee_remark: req.body.remark,
                assignee: assignee,
                color_code: "",
                created_at: new Date(),
                updated_at: new Date()
            }).then(function (newRemark) {
                Lead.findOneAndUpdate({ _id: l._id }, { $push: { remarks: newRemark._id } }, { new: true }, async function (err, doc) {
                })
            });

            var lead = await Lead.findById(l._id).populate('assignee').exec();

            var logs = [];
            await LeadRemark.find({ lead: lead._id })
                .populate('assignee')
                .sort({ created_at: -1 })
                .cursor()
                .eachAsync(async (l) => {
                    var assignee = {}
                    if (l.assignee) {
                        assignee = {
                            _id: l.assignee._id,
                            id: l.assignee._id,
                            name: l.assignee.name,
                            email: l.assignee.email,
                            contact_no: l.assignee.contact_no
                        }
                    }


                    logs.push({
                        source: l.source,
                        type: l.type,
                        reason: l.reason,
                        status: l.status,
                        customer_remark: l.customer_remark,
                        assignee_remark: l.assignee_remark,
                        assignee: assignee,
                        color_code: l.color_code,
                        created_at: moment(l.created_at).tz(req.headers['tz']).format('lll'),
                        updated_at: moment(l.updated_at).tz(req.headers['tz']).format('lll'),
                    });
                });


            var push = {
                user: lead.user,
                name: lead.name,
                contact_no: lead.contact_no,
                email: lead.email,
                _id: lead._id,
                id: lead.id,
                priority: lead.priority,
                contacted: lead.contacted,
                type: lead.type,
                lead_id: lead.lead_id,
                date: moment(lead.updated_at).tz(req.headers['tz']).format('lll'),
                source: lead.source,
                status: lead.status,
                important: lead.important,
                follow_up: lead.follow_up,
                remark: lead.remark,

                assignee: {
                    _id: lead.assignee._id,
                    name: lead.assignee.name,
                    contact_no: lead.assignee.contact_no,
                    email: lead.assignee.email,
                    id: lead.assignee.id,
                },

                logs: logs,
                created_at: moment(lead.created_at).tz(req.headers['tz']).format('lll'),
                updated_at: moment(lead.updated_at).tz(req.headers['tz']).format('lll'),
            }


            if (role.role != "CRE") {
                var notify = {
                    receiver: [lead.assignee._id],
                    activity: "lead",
                    tag: "assigned",
                    source: lead._id,
                    sender: loggedInDetails._id,
                    points: 0
                }
                // Vinay testing the lead generation
                fun.newNotification(notify);
            }


            var activity = "Lead";

            fun.webNotification(activity, l);

            await whatsAppEvent.leadGenerate(l._id, business);
            event.leadCre(l._id, business);
            await whatsAppEvent.leadCre(l._id, business);



            res.status(200).json({
                responseCode: 200,
                responseMessage: "Lead Added ",
                responseData: push
            });

        });
    }
});

router.put('/lead-gen/contacted/update', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var totalResult = 0;
    var rules = {
        lead: 'required',
        // contacted: 'required',
        status: 'required',
    };

    var validation = new Validator(req.body, rules);
    // if (req.body.status == "contacted") {
    //     var tag = "contacted";
    // }
    // else if (req.body.status == "failed") {
    //     var tag = "failed";
    // }
    // else if (req.body.status == "cancelled") {
    //     var tag = "cancelled";
    // } else {
    //     var tag = "Checked";
    // }
    if (req.body.status == "1") {
        var tag = "contacted";
    }
    else if (req.body.status == "2") {
        var tag = "failed";
    }
    else if (req.body.status == "3") {
        var tag = "cancelled";
    } else {
        var tag = "Checked";
    }
    // console.log(tag)
    // console.log(check._id)

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Label required",
            responseData: {
                res: validation.errors.all()
            }
        });
    }
    else {
        var check = await LeadGen.findOne({ business: business, _id: req.body.lead }).exec();
        if (check) {
            var data = {
                updated_at: new Date(),
                // contacted: JSON.parse(req.body.contacted),
                contacted: true,
                "remark.status": tag,
                updated_at: new Date(),
                assignee: user
            };

            LeadGen.findOneAndUpdate({ _id: req.body.lead }, { $set: data }, { new: false }, async function (err, doc) {

                if (err) {
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Server Error",
                        responseData: err
                    });
                }
                else {

                    LeadGenRemark.create({
                        lead: check._id,
                        reason: check.remark.reason,
                        status: check.remark.status,
                        color_code: check.remark.color_code,
                        assignee: user,
                        customer_remark: tag,
                        assignee_remark: req.body.newRemark,
                        created_at: new Date(),
                        updated_at: new Date(),
                    }).then(function (newRemark) {
                        LeadGen.findOneAndUpdate({ _id: check._id }, { $push: { remarks: newRemark._id } }, { new: true }, async function (err, doc) {
                        })
                    });

                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Lead Updated",
                        responseData: {}
                    });
                }
            });
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Lead not found",
                responseData: {
                }
            })
        }
    }
});

router.get('/lead/category/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var loggedInDetails = await User.findById(decoded.user).exec();
    var plans = await BusinessPlan.find({ business: business }).populate('suite').exec();
    var suite = _.map(plans, 'suite');
    var def = [];
    for (var i = 0; i < suite.length; i++) {
        var serverTime = moment.tz(new Date(), req.headers['tz']);
        var bar = plans[i].created_at;
        bar.setDate(bar.getDate() + plans[i].validity);
        var e = bar;
        bar = moment.tz(bar, req.headers['tz'])

        var baz = bar.diff(serverTime);
        if (baz > 0) {
            var defaults = suite[i].default;
            for (var j = 0; j < defaults.length; j++) {
                if (defaults[j].action == "Leads") {
                    var newArr = defaults[j].category;
                    def = _.concat(def, newArr);
                }
            }
        }
    }

    res.status(200).json({
        responseCode: 200,
        responseMessage: "navigation",
        responseData: _.uniq(def)
    });
});

router.put('/lead/priority/update', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var bookings = [];
    var totalResult = 0;
    var rules = {
        lead: 'required'
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Label required",
            responseData: {
                res: validation.errors.all()
            }
        })
    }
    else {
        var check = await Lead.findOne({ business: business, _id: req.body.lead }).exec();
        if (check) {
            var data = {
                updated_at: new Date(),
                priority: parseInt(req.body.priority)
            };



            Lead.findOneAndUpdate({ _id: req.body.lead }, { $set: data }, { new: false }, async function (err, doc) {
                if (err) {
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Server Error",
                        responseData: err
                    });
                }
                else {
                    if (parseInt(req.body.priority) == 1) {
                        var tag = "Low";
                    }
                    else if (parseInt(req.body.priority) == 2) {
                        var tag = "Medium";
                    }
                    else if (parseInt(req.body.priority) == 3) {
                        var tag = "High";
                    }

                    LeadRemark.create({
                        lead: check._id,
                        reason: check.remark.reason,
                        status: check.remark.status,
                        color_code: check.remark.color_code,
                        assignee: user,
                        customer_remark: "Priority changes to - " + tag,
                        assignee_remark: "Priority changes to - " + tag,
                        created_at: new Date(),
                        updated_at: new Date(),
                    }).then(function (newRemark) {
                        Lead.findOneAndUpdate({ _id: check._id }, { $push: { remarks: newRemark._id } }, { new: true }, async function (err, doc) {
                        })
                    });

                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Lead Updated",
                        responseData: {}
                    });
                }
            });
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Lead not found",
                responseData: {
                }
            })
        }
    }
});


function price(value) {
    var val = Math.abs(value)
    if (val >= 10000000) {
        val = (val / 10000000).toFixed(2) + 'Cr';
    } else if (val >= 100000) {
        val = (val / 100000).toFixed(2) + 'L';
    } else if (val >= 1000) {
        val = (val / 1000).toFixed(2) + 'K';
    }
    return val.toString();
}

router.get('/insurance/due/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var cars = [];
    var filters = [];
    var totalResult = 0;

    var role = await Management.findOne({ user: user, business: business }).exec();
    if (req.query.page == undefined) {
        var page = 0;
    }
    else {
        var page = req.query.page;
    }



    var specification = {};
    specification['$lookup'] = {
        from: "User",
        localField: "user",
        foreignField: "_id",
        as: "user",
    };
    filters.push(specification);

    var specification = {};
    specification['$unwind'] = {
        path: "$user",
        preserveNullAndEmptyArrays: false
    };
    filters.push(specification);

    var specification = {};
    specification['$lookup'] = {
        from: "Car",
        localField: "car",
        foreignField: "_id",
        as: "car",
    };
    filters.push(specification);

    var specification = {};
    specification['$unwind'] = {
        path: "$car",
        preserveNullAndEmptyArrays: true
    };

    var bar = new Date();
    bar.setDate(bar.getDate() + 35);
    // console.log("Bar Date  = " + bar)
    if (req.query.query) {
        req.query.query = req.query.query.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");

        var specification = {};
        specification['$match'] = {
            business: mongoose.Types.ObjectId(business),
            "car.insurance_info": { $exists: true },
            "car.insurance_info.expire": { $ne: "" },
            "car.insurance_info.expire": { $ne: null },
            "car.insurance_info.expire": { $lte: bar },
            $or: [
                { 'user.name': { $regex: req.query.query, $options: 'i' } },
                { 'user.contact_no': { $regex: req.query.query, $options: 'i' } },
                { 'car.title': { $regex: req.query.query, $options: 'i' } },
                { 'car.registration_no': { $regex: req.query.query, $options: 'i' } },
                { 'car.insurance_info.policy_holder': { $regex: req.query.query, $options: 'i' } },
                { 'car.insurance_info.insurance_company': { $regex: req.query.query, $options: 'i' } },
                { 'car.insurance_info.policy_type': { $regex: req.query.query, $options: 'i' } },
                { 'car.insurance_info.policy_no': { $eq: Math.ceil(req.query.query) } },
            ]
        };
        filters.push(specification);
    }
    else {
        var specification = {};
        specification['$match'] = {
            "car.insurance_info": { $exists: true },
            "business": mongoose.Types.ObjectId(business),
            "car.insurance_info.expire": { $ne: "" },
            "car.insurance_info.expire": { $ne: null },
            "car.insurance_info.expire": { $lte: bar }
        };
        filters.push(specification);
    }

    var specification = {};
    specification['$group'] = {
        _id: { car: "$car" },
        max: { $max: "$car.insurance_info.expire" },
        item: { $push: "$$ROOT" }
    };
    filters.push(specification);

    var specification = {};
    specification['$sort'] = {
        "max": -1
    };
    filters.push(specification);

    totalResult = await Booking.aggregate(filters);
    var count = 0;




    // totalResult.forEach(async function (service) {
    //     count = count + 1
    //     // console.log(service._id + " ----------------------------------------------------------------------Created " + count)

    //     var created = await q.all(businessFunctions.outboundLeadAdd(service._id, 'Insurance'))

    //     // console.log(JSON.stringify(created))
    // })



    // return res.json(totalResult)
    var specification = {};
    specification['$skip'] = 1000 * page;
    filters.push(specification);

    var specification = {};
    specification['$limit'] = 1000;
    filters.push(specification);

    await Booking.aggregate(filters)
        .allowDiskUse(true)
        .cursor({ batchSize: 1000 })
        .exec()
        .eachAsync(async function (booking) {
            // console.log("Booking Id " + booking._id)
            if (booking._id.car[0].insurance_info) {
                var expire = moment(booking._id.car[0].insurance_info.expire).tz(req.headers['tz']).format('YYYY-MM-DD');
                var insurance_info = {
                    policy_holder: booking._id.car[0].insurance_info.policy_holder,
                    policy_no: booking._id.car[0].insurance_info.policy_no,
                    insurance_company: booking._id.car[0].insurance_info.insurance_company,
                    policy_type: booking._id.car[0].insurance_info.policy_type,
                    premium: booking._id.car[0].insurance_info.premium,
                    expire: expire,
                };
            }

            //Abhinav : TO craete Insurance List Leads
            count = count + 1
            var bk = await Booking.findOne({ car: booking._id.car[0]._id }).select('leadManagement _id').exec();
            // console.log(bk._id + " ----------------------------------------------------------------------Created " + count)

            var created = await q.all(businessFunctions.outboundLeadAdd(bk._id, 'Insurance'))

            // console.log(" = == = =" + JSON.stringify(created))
            //Abhinav : TO craete Insurance List Leads

            cars.push({
                _id: booking._id.car[0]._id,
                id: booking._id.car[0]._id,
                title: booking._id.car[0].title,
                modelName: booking._id.car[0]._automaker + " " + booking._id.car[0]._model,
                price: price(booking._id.car[0].price),
                numericPrice: booking._id.car[0].price,
                carId: booking._id.car[0].carId,
                fuel_type: booking._id.car[0].fuel_type,
                vehicle_color: booking._id.car[0].vehicle_color,
                registration_no: booking._id.car[0].registration_no,
                manufacture_year: booking._id.car[0].manufacture_year,
                user: await User.findById(booking._id.car[0].user).select('name email contact_no business_info').exec(),
                booking_lead: await Booking.findOne({ car: booking._id.car[0]._id }).select('leadManagement _id').exec(),
                status: booking._id.car[0].status,
                insurance_info: insurance_info,
                created_at: booking._id.car[0].created_at,
                updated_at: booking._id.car[0].updated_at
            })
        });

    res.status(200).json({
        responseCode: 200,
        responseMessage: "Insurance Dues",
        responseInfo: {
            totalResult: totalResult.length,
            // filter: filters
        },
        responseData: cars,
    });
});

//Sumit...
router.post("/insurance/leads", xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var business = req.headers["business"];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var loggedInDetails = await User.findById(decoded.user).exec();
    // console.log("_____" + loggedInDetails);
    var role = await Management.findOne({ user: decoded.user, business: business, }).exec();
    // console.log("----" + role);
    // console.log("----" + booking);
    var booking = await Booking.findOne({ car: req.body._id, business: business, /* "leadManagement.remark.status": { $nin: ["Open", "Follow-Up"] } */ })
        .populate({ path: 'user', select: 'name contact_no address _id' })
        .populate({ path: 'lead', select: 'follow_up, remark, source' })
        .exec();
    // console.log("----" + req.body._id);

    if (booking) {
        // console.log()
        async function getAssignee(user, business) {
            var role = await Management.findOne({
                user: user,
                business: business,
            }).exec();
            if (role.role == "CRE") {
                advisor = role.user;
            } else {
                var assigneeLead = [];
                await Management.find({ business: business, role: "CRE" })
                    .cursor()
                    .eachAsync(async (a) => {
                        // var d = await Lead.find({ business: business, assignee: a.user }).count().exec();
                        var open = await Lead.find({ business: business, assignee: a.user, 'remark.status': { $in: ['Open',] } }).count().exec();
                        var follow_up = await Lead.find({ business: business, assignee: a.user, 'remark.status': { $in: ['Follow-Up'] }, 'follow_up.date': { $lte: new Date() } }).count().exec();
                        var d = open + follow_up;
                        assigneeLead.push({
                            user: a.user,
                            count: d,
                        });
                    });

                if (assigneeLead.length != 0) {
                    assigneeLead.sort(function (a, b) {
                        return a.count > b.count;
                    });

                    advisor = assigneeLead[0].user;
                } else {
                    advisor = role.business;
                }
            }

            return advisor;
        }
        var assignee = await q.all(
            businessFunctions.getAssignee(decoded.user, business)
        );

        if (req.body.status == "Follow-Up") {
            if (req.body.date) {
                var follow_up = {
                    date: new Date(req.body.date).toISOString(),
                    time: req.body.time,
                    created_at: new Date(),
                    updated_at: new Date()
                }
            }
        }





        // 

        var leadManagement = {
            user: booking.user,
            name: booking.user.name,
            contact_no: booking.user.contact_no,
            email: booking.user.email,
            reason: req.body.reason,
            type: req.body.type,
            status: req.body.status,
            business: req.headers["business"],
            assignee: assignee,
            priority: req.body.priority,
            source: booking.lead.source,
            // remarks: remark,
            follow_up: follow_up,
            // created_at: new Date(),
            updated_at: new Date(),
        };

        await Booking.findOneAndUpdate({ _id: booking._id }, { $set: { leadManagement: leadManagement } }, { new: false }, async function (err, doc) {
            var remark = {
                assignee: assignee,
                status: req.body.status,
                reason: req.body.reason,
                customer_remark: req.body.remark,
                assignee_remark: req.body.remark,
                color_code: "",
                created_at: new Date(),
                updated_at: new Date(),
            };
            var remarks = doc.leadManagement.remarks;
            remarks.push(remark);
            // 

            //  var remarks = [];
            // console.log(remarks);
            // var leadman = booking.leadManagement._id;
            // console.log("ID...." + leadman);
            // var data= await Booking.findOneAndUpdate({ "leadManagement._id":doc.leadManagement._id}).exec();
            // return res.json({
            //   data:data
            // })
            await Booking.findOneAndUpdate({ _id: doc._id }, { $set: { "leadManagement.remarks": remarks } }, { new: true }, async function (err, doc) {
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Lead Added to booking",
                    responseData: doc

                });
            })




        });
        // console.log(leadManagement);



        // console.log("ID>>>" + booking.leadManagement._id);
        // console.log("@@@@@@@@" + remarks);

        //
    } else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Booking Not not found",
            responseData: {},
        });
    }
}
);

router.get('/insurence/lead/details/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var business = req.headers['business'];

    var technicians = [];
    // console.log("Car Id " + req.query.car + " Business = " + business)
    var booking = await Booking.findOne({ car: req.query.car, business: business }).exec()
    if (booking) {
        if (booking.leadManagement) {
            if (booking.leadManagement.status != '') {

                var assignee = await User.findById(booking.leadManagement.assignee).exec();
                // return res.status(400).json({
                //     responseCode: 400,
                //     responseMessage: "Lead details not found",
                //     responseData: assignee
                // })
                var data = {
                    user: booking.leadManagement.user,
                    name: booking.leadManagement.name,
                    contact_no: booking.leadManagement.contact_no,
                    email: booking.leadManagement.email,
                    reason: booking.leadManagement.reason,
                    type: booking.leadManagement.type,
                    status: booking.leadManagement.status,
                    business: booking.leadManagement.business,
                    assignee: assignee,
                    priority: booking.leadManagement.priority,
                    source: booking.leadManagement.source,
                    remarks: booking.leadManagement.remarks,
                    follow_up: booking.leadManagement.follow_up,
                    created_at: booking.leadManagement.created_at,
                    updated_at: booking.leadManagement.updated_at,
                }
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Lead Data",
                    responseData: data
                })
            } else {
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Lead details not found",
                    responseData: data
                })
            }
        } else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Lead details not found",
                responseData: data
            })
        }

    } else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Booking not Found",
            responseData: data
        })
    }
});
router.get('/service-advisors/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var business = req.headers['business'];


    var technicians = [];
    await Management.find({ business: business, role: "Service Advisor" })
        .populate({ path: "user" })
        .cursor().eachAsync(async (v) => {
            technicians.push({
                _id: v.user._id,
                id: v.user.id,
                name: v.user.name,
                username: v.user.username,
                email: v.user.email,
                contact_no: v.user.contact_no,
            })
        })

    res.status(200).json({
        responseCode: 200,
        responseMessage: "Service Advisors",
        responseData: technicians
    })
});

router.post('/lead/booking/add/', xAccessToken.token, async function (req, res, next) {
    // console.log("Lead Booking Add Api  : Lead.js")
    var token = req.headers['x-access-token'];
    // req.body['whatsAppChannelId'] = '4f1e778f-9f3b-41e0-8bf4-db6ffb15b0c2';
    // console.log("------" + req.body['whatsAppChannelId']);
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];

    var loggedInDetails = await User.findById(decoded.user).exec();
    var role = await Management.findOne({ user: decoded.user, business: business }).exec();

    var advisor = await q.all(businessFunctions.getAdvisor(loggedInDetails._id, business));

    var estimation_requested = false;
    if (req.body.estimation_requested == "Yes") {
        estimation_requested = true;
    }

    var date = null;
    if (req.body.date) {
        date = new Date(req.body.date).toISOString();
    }

    var time_slot = "";
    if (req.body.time_slot) {
        time_slot = req.body.time_slot;
    }

    var convenience = "";
    if (req.body.convenience) {
        convenience = req.body.convenience
    }

    var address = null;
    if (req.body.address) {
        address = req.body.address;
    }

    var role = await Management.findOne({ user: user, business: business }).exec();
    if (role.role == "CRE") {
        var lead = await Lead.findOne({ assignee: user, _id: req.body.lead }).exec();
    }
    else {
        var lead = await Lead.findOne({ business: business, _id: req.body.lead }).exec();
    }

    if (lead) {
        if (lead.contact_no) {
            var leadUser = {
                name: lead.name,
                contact_no: lead.contact_no,
                email: lead.email,
                user: lead.user,
            }
            var user = await q.all(businessFunctions.getUser(leadUser))
            if (user) {
                var rg = req.body.registration_no;
                req.body.registration_no = rg.replace(/ /g, '');

                var leadCar = {
                    user: user,
                    car: req.body.car,
                    variant: req.body.variant,
                    registration_no: req.body.registration_no,
                }
                var car = await q.all(businessFunctions.getCar(leadCar))
                if (car) {
                    var booking = await Booking.findOne({ car: car._id, user: user, status: { $nin: ["Completed", "CompleteWork", "QC", "Closed", "Ready", "Rejected", "Cancelled", "Inactive"] }, is_services: true }).exec();

                    if (booking) {
                        return res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Booking already exists for the same registration no. [" + booking.status + "]",
                            responseData: {},
                        });
                    }
                    else {
                        var bookingService = [];
                        var customer_requirements = [];

                        if (req.body.requirement) {
                            customer_requirements.push({
                                requirement: req.body.requirement,
                            });
                        }

                        if (req.body.advisor) {
                            advisor = req.body.advisor;
                        }
                        else {
                            if (lead.advisor) {
                                advisor = lead.advisor;
                            }
                            else {
                                return res.status(422).json({
                                    responseCode: 422,
                                    responseMessage: "Advisor Needed",
                                    responseData: {},
                                });
                            }
                        }


                        var payment = {
                            payment_mode: "",
                            payment_status: "Pending",
                            discount_type: "",
                            coupon: "",
                            coupon_type: "",
                            discount: 0,
                            discount_total: 0,
                            part_cost: 0,
                            labour_cost: 0,
                            paid_total: 0,
                            total: 0,
                            discount_applied: false,
                            transaction_id: "",
                            transaction_date: "",
                            transaction_status: "",
                            transaction_response: ""
                        }

                        var bookingData = {
                            package: null,
                            car: car,
                            advisor: advisor,
                            manager: lead.assignee,
                            business: business,
                            user: user,
                            services: bookingService,
                            customer_requirements: customer_requirements,
                            booking_no: Math.round(+new Date() / 1000),
                            date: date,
                            time_slot: time_slot,
                            estimation_requested: estimation_requested,
                            convenience: convenience,
                            status: "EstimateRequested",
                            payment: payment,
                            address: address,
                            lead: lead,
                            is_services: true,
                            converted: true,
                            created_at: new Date(),
                            updated_at: new Date()
                        };

                        Booking.create(bookingData).then(async function (b) {
                            var activity = {
                                user: loggedInDetails._id,
                                name: loggedInDetails.name,
                                stage: "Approval",
                                activity: "Booking",
                            };

                            fun.bookingLog(b._id, activity);

                            if (role.role == "CRE") {
                                if (estimation_requested) {
                                    var notify = {
                                        receiver: [b.advisor],
                                        sender: loggedInDetails._id,
                                        activity: "booking",
                                        source: b._id,
                                        tag: "EstimateRequested",
                                        points: 0,
                                    }

                                    fun.newNotification(notify);
                                }
                                else {
                                    var notify = {
                                        source: b._id,
                                        receiver: [b.advisor],
                                        sender: loggedInDetails._id,
                                        activity: "booking",
                                        tag: "leadBooking",
                                        points: 0,
                                    }
                                    fun.newNotification(notify);
                                }
                            }
                            else {
                                if (estimation_requested) {
                                    var notify = {
                                        receiver: [b.manager],
                                        sender: loggedInDetails._id,
                                        activity: "booking",
                                        source: b._id,
                                        tag: "EstimateInitiated",
                                        points: 0,
                                    }

                                    fun.newNotification(notify);
                                }
                                else {
                                    var notify = {
                                        source: b._id,
                                        receiver: [b.manager],
                                        sender: loggedInDetails._id,
                                        activity: "booking",
                                        tag: "EstimateInitiated",
                                        points: 0,
                                    }
                                    fun.newNotification(notify);
                                }
                            }


                            var data = {
                                user: user,
                                follow_up: {},
                                converted: true,
                                remark: {
                                    lead: lead._id,
                                    status: "EstimateRequested",
                                    color_code: lead.remark.color_code,
                                    assignee: user,
                                    customer_remark: "Estimate requested",
                                    assignee_remark: "Estimate requested",
                                    created_at: new Date(),
                                    updated_at: new Date(),
                                },
                                created_at: new Date(),
                                updated_at: new Date(),
                            };


                            Lead.findOneAndUpdate({ _id: lead._id }, { $set: data }, { new: false }, async function (err, doc) {
                                if (err) {
                                    return res.status(422).json({
                                        responseCode: 422,
                                        responseMessage: "Server Error",
                                        responseData: err
                                    });
                                }
                                else {
                                    LeadRemark.create(data.remark).then(function (newRemark) {
                                        Lead.findOneAndUpdate({ _id: lead._id }, { $push: { remarks: newRemark._id } }, { new: true }, async function (err, doc) {
                                        })
                                    });;
                                }
                            });


                            var bookings = [];
                            var booking = await Booking.findById(b._id)
                                .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no email business_info" } })
                                .populate({ path: 'manager', populate: { path: 'user', select: "_id id name contact_no email" } })
                                .populate({ path: 'car', select: '_id id title registration_no ic rc', populate: { path: 'thumbnails' } })
                                .exec();


                            if (booking.address) {
                                var address = await Address.findOne({ _id: booking.address }).exec();
                            }
                            else {
                                var address = {};
                            }
                            if (booking.car) {
                                var car = {
                                    title: booking.car.title,
                                    _id: booking.car._id,
                                    id: booking.car.id,
                                    rc_address: booking.car.rc_address,
                                    ic_address: booking.car.ic_address,
                                    ic: booking.car.ic,
                                    rc: booking.car.rc,
                                    registration_no: booking.car.registration_no,
                                }
                            }

                            var manager = null;
                            if (booking.manager) {
                                manager = {
                                    name: booking.manager.name,
                                    _id: booking.manager._id,
                                    id: booking.manager.id,
                                    contact_no: booking.manager.contact_no,
                                    email: booking.manager.email
                                }
                            }
                            if (booking.user) {
                                user = {
                                    name: booking.user.name,
                                    _id: booking.user._id,
                                    id: booking.user.id,
                                    contact_no: booking.user.contact_no,
                                    email: booking.user.email,
                                    business_info: booking.user.business_info
                                }
                            }
                            bookings.push({
                                _id: booking._id,
                                id: booking._id,
                                car: car,
                                user: user,
                                manager: manager,
                                services: booking.services,
                                convenience: booking.convenience,
                                date: moment(booking.date).tz(req.headers['tz']).format('ll'),
                                time_slot: booking.time_slot,
                                status: booking.status,
                                booking_no: booking.booking_no,
                                job_no: booking.job_no,
                                estimation_requested: booking.estimation_requested,
                                address: address,
                                remarks: booking.remarks,
                                customer_requirements: booking.customer_requirements,
                                payment: booking.payment,
                                txnid: booking.txnid,
                                __v: booking.__v,
                                created_at: moment(booking.created_at).tz(req.headers['tz']).format('lll'),
                                updated_at: moment(booking.updated_at).tz(req.headers['tz']).format('lll'),
                            });

                            var activity = "Booking"
                            fun.webNotification(activity, b);
                            await whatsAppEvent.newBookingAdvisor(b._id);

                            //await whatsAppEvent.bookingWhatsApp(b._id,business)



                            Lead.findOneAndUpdate({ _id: lead._id }, { $set: { user: user, converted: true } }, { new: false }, async function (err, doc) {
                                if (err) {
                                    res.status(422).json({
                                        responseCode: 422,
                                        responseMessage: "Server Error",
                                        responseData: err
                                    });
                                }
                                else {
                                    event.zohoLead(b._id);

                                    res.status(200).json({
                                        responseCode: 200,
                                        responseMessage: "Booking",
                                        responseData: bookings
                                    });
                                }
                            });
                        });
                    }
                }
                else {
                    res.status(422).json({
                        responseCode: 400,
                        responseMessage: "Car required",
                        responseData: {}
                    });
                }
            }
            else {
                res.status(422).json({
                    responseCode: 400,
                    responseMessage: "User required",
                    responseData: {}
                });
            }
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Contact No required",
                responseData: {}
            });
        }
    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Lead not found",
            responseData: {}
        });
    }
});
router.put('/lead/mark/star', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    // console.log("Lead Id= " + req.body.lead)
    var lead = await Lead.findById(req.body.lead).exec();
    if (lead) {
        await Lead.findOneAndUpdate({ _id: lead._id }, { $set: { isStared: req.body.isStared } }, { new: true }, async function (err, doc) {
            res.status(200).json({
                responseCode: 200,
                responseMessage: "Marked Succes",
                responseData: {}
            });
        });

    } else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: 'Lead not found',
            responseData: {},
        });
    }

    // res.status(200).json({
    //     responseCode: 200,
    //     responseMessage: "success",
    //     responseData: doc.services[req.body.service_index
    // });


});

//Abhinav Tyagi 14-05-21
router.put('/services/edit', async function (req, res, next) {
    // console.log("API Called")
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var lb = req.body.labour_cost;
    var pc = req.body.part_cost
    var pg = req.body.package
    var sg = req.body.segment
    var service_name = req.body.service
    var category = req.body.category
    // console.log("Labour= " + lb + "Part= " + pc + "Business Id " + business)
    var not_inserted = [];

    var automaker = null;
    var _automaker = "";
    var model = null;
    var _model = "";
    // return res.json({
    //     data: req.body._id
    // })
    if (req.body._model) {
        var model = await Model.findOne({ value: req.body._model }).exec();
        if (model) {
            var automaker = await Automaker.findById(model.automaker).exec();

            model = model._id;
            _model = model.value;
            automaker = automaker._id;
            _automaker = automaker.maker;

        }
    }


    var tax_info = {}
    var tax_info = await Tax.findOne({ rate: parseFloat(18), type: "GST" }).exec();
    var tax_rate = tax_info.detail;

    var parts = [];
    var labours = [];
    var opening_fitting = [];

    if (parseFloat(req.body.part_cost) > 0) {
        parts_visible = false;
        var service = req.body.service;
        var amount = Math.ceil(req.body.part_cost);
        var base = amount;
        var part_tax = [];

        var x = (100 + tax_info.rate) / 100;
        var tax_on_amount = amount / x;
        if (tax_rate.length > 0) {
            for (var r = 0; r < tax_rate.length; r++) {
                if (tax_rate[r].rate != tax_info.rate) {
                    var t = tax_on_amount * (tax_rate[r].rate / 100);
                    base = base - t;
                    part_tax.push({
                        tax: tax_rate[r].tax,
                        rate: tax_rate[r].rate,
                        amount: parseFloat(t.toFixed(2))
                    });
                } else {
                    base = base - t
                    part_tax.push({
                        tax: tax_info.tax,
                        tax_rate: tax_info.rate,
                        rate: tax_info.rate,
                        amount: parseFloat(tax_on_amount.toFixed(2))
                    });
                }
            }
        }

        tax_detail = {
            tax: tax_info.tax,
            tax_rate: tax_info.rate,
            rate: tax_info.rate,
            base: parseFloat(base.toFixed(2)),
            detail: part_tax
        }

        parts.push({
            source: null,
            item: req.body.service,
            // hsn_sac: req.body.hsn_sac,
            part_no: "",
            quantity: 1,
            issued: false,
            rate: parseFloat(req.body.part_cost),
            base: parseFloat(base.toFixed(2)),
            amount: parseFloat(amount),
            tax_amount: _.sumBy(part_tax, x => x.amount),
            amount_is_tax: "inclusive",
            customer_dep: 100,
            insurance_dep: 0,
            discount: 0,
            tax: tax_info.tax,
            tax_rate: tax_info.rate,
            tax_info: tax_detail
        })
    }

    if (parseFloat(req.body.labour_cost) > 0) {
        var amount = parseFloat(req.body.labour_cost);
        var base = amount;
        var labour_tax = [];

        var x = (100 + tax_info.rate) / 100;
        var tax_on_amount = amount / x;

        if (tax_rate.length > 0) {
            for (var r = 0; r < tax_rate.length; r++) {
                if (tax_rate[r].rate != tax_info.rate) {
                    var t = tax_on_amount * (tax_rate[r].rate / 100);
                    base = base - t
                    labour_tax.push({
                        tax: tax_rate[r].tax,
                        rate: parseFloat(tax_rate[r].rate.toFixed(2)),
                        amount: parseFloat(t.toFixed(2))
                    });
                } else {
                    base = base - t
                    labour_tax.push({
                        tax: tax_info.tax,
                        rate: parseFloat(tax_info.rate.toFixed(2)),
                        amount: parseFloat(tax_on_amount.toFixed(2))
                    });
                }
            }
        }
        labours.push({
            item: req.body.service,
            quantity: 1,
            // hsn_sac: req.body.hsn_sac,
            rate: parseFloat(req.body.labour_cost),
            base: parseFloat(base.toFixed(2)),
            amount: parseFloat(amount),
            discount: 0,
            amount_is_tax: "inclusive",
            customer_dep: 100,
            insurance_dep: 0,
            tax_amount: _.sumBy(labour_tax, x => x.amount),
            tax: tax_info.tax,
            tax_rate: tax_info.rate,
            tax_info: {
                tax: tax_info.tax,
                tax_rate: tax_info.rate,
                rate: tax_info.rate,
                base: parseFloat(base.toFixed(2)),
                detail: labour_tax
            }
        })
    }
    var margin_total = parseFloat(req.body.labour_cost) * (40 / 100);
    var mrp = parseFloat(req.body.labour_cost) + margin_total;



    var data = {
        business: business,
        imported: true,
        model: model,
        _model: _model,
        // package: req.body.package,
        // segment: req.body.segment,
        service: req.body.service,
        parts: parts,
        part_cost: parseFloat(req.body.part_cost),
        labour: labours,
        labour_cost: parseFloat(req.body.labour_cost),
        cost: parseFloat(req.body.part_cost) + parseFloat(req.body.labour_cost),
        mrp: parseFloat(req.body.part_cost) + Math.ceil(mrp),
        amount_is_tax: "inclusive",
        publish: true,
        admin_status: "Standard",
        created_at: new Date(),
        updated_at: new Date(),
        custom: false,
        tax: "18.0% GST",
        rate: 18,
        tax_info: {
            tax: tax_info.tax,
            tax_rate: tax_info.rate,
            rate: tax_info.rate,
            base: parseFloat(base.toFixed(2)),
            detail: labour_tax
        },
    };

    if (category == "services") {
        Service.findOneAndUpdate({ _id: req.body.id }, { $set: data }, { new: true }, async function (err, doc) {
            res.status(200).json({
                responseCode: 200,
                responseMessage: "Successfully Updated",
                responseData: doc
            });


        });
    } else if (category == "customization") {
        Customization.findOneAndUpdate({ _id: req.body.id }, { $set: data }, { new: true }, async function (err, doc) {
            res.status(200).json({
                responseCode: 200,
                responseMessage: "Successfully Updated",
                responseData: doc
            });


        });
    } else if (category == "detailing") {
        Detailing.findOneAndUpdate({ _id: req.body.id }, { $set: data }, { new: true }, async function (err, doc) {
            res.status(200).json({
                responseCode: 200,
                responseMessage: "Successfully Updated",
                responseData: doc
            });


        });
    } else if (category == "collision") {
        Collision.findOneAndUpdate({ _id: req.body.id }, { $set: data }, { new: true }, async function (err, doc) {
            res.status(200).json({
                responseCode: 200,
                responseMessage: "Successfully Updated",
                responseData: doc
            });


        });
    } else {

        res.status(400).json({
            responseCode: 400,
            responseMessage: "Service Category not found",
            responseData: {}
        });



    }

});




//for lead payment link Sumit
router.get('/lead/payment/link', xAccessToken.token, async function (req, res, next) {
    var rules = {
        lead: 'required'
    };

    var validation = new Validator(req.query, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "lead required",
            responseData: {
                res: validation.errors.all()
            }
        });
    }
    else {
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var user = decoded.user;
        var business = req.headers['business'];


        var lead = await Lead.findById(req.query.lead).exec();
        var loggedInDetails = await User.findById(decoded.user).exec();

        if (lead) {

            let userLead = await Lead.findOne({ _id: (lead) }).exec()
            var activity = req.query.activity;
            if (activity == "emaillink") {
                // console.log("innn");
                await event.paymentLink(userLead, business);
            } else {
                // console.log("hlo");
                // whatsAppEvent.whatsAppPaymentLink(userBooking,business);
            }

            res.status(200).json({
                responseCode: 200,
                responseMessage: "Link Sent Successfully",
                responseData: []
            });
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Lead Not found",
                responseData: {}
            });
        }
    }
});



//OUTBOND Lead Work Start
router.post('/outbound/lead/add', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    // console.log("Lead addd ")
    var loggedInDetails = await User.findById(decoded.user).exec();
    var role = await Management.findOne({ user: decoded.user, business: business }).exec();
    var booking = await Booking.findOne({ _id: req.body.booking }).exec();

    if (booking) {
        var user = await User.findOne({ _id: booking.user }).exec();
        if (user) {

            var last = await OutBoundLead.findOne({ user: user._id, business: business, "remark.status": { $in: ["Open", "Follow-Up"] } }).sort({ updated_at: -1 }).exec();

            if (last) {
                return res.status(422).json({
                    responseCode: 422,
                    responseMessage: "Lead already exist #" + last.lead_id + " [" + last.remark.status + "]",
                    responseData: {}
                });
            }
            else {
                var assignee = await q.all(businessFunctions.getOutBoundAssignee(decoded.user, business));
                var data = {}
                var status = await LeadStatus.findOne({ status: req.body.status }).exec();
                var follow_up = {};
                var advisor = null;
                if (req.body.status == "Follow-Up") {
                    if (req.body.date) {
                        var follow_up = {
                            date: new Date(req.body.date).toISOString(),
                            time: req.body.time,
                            created_at: new Date(),
                            updated_at: new Date()
                        }
                    }
                }

                var contacted = false;
                if (req.body.contacted) {
                    contacted = true;
                }
                var priority = 2;
                if (req.body.priority) {
                    if (parseInt(req.body.priority)) {
                        priority = req.body.priority;
                    }
                    else {
                        priority = 2;
                    }
                }
                //Abhinav Tygai :: Update Status in LeadGen Collection To be Tested
                var st_update = await OutBoundLead.findOne({ user: user._id }).exec();
                if (st_update) {
                    // console.log("Inside LeadGen")
                    st_update.remark.status = "Converted";
                    st_update.converted = true;
                    st_update.save();
                }

                var user = user._id;
                var name = user.name;
                var contact_no = user.contact_no;
                var email = user.email;


                var remark = {
                    assignee: assignee,
                    status: req.body.status,
                    reason: req.body.reason,
                    customer_remark: req.body.remark,
                    assignee_remark: req.body.remark,
                    color_code: "",
                    created_at: new Date(),
                    updated_at: new Date()
                }
                //Abhinav Alternate
                var variant = null;
                var car = null;
                if (booking.car) {
                    car = booking.car
                    variant = booking.car

                }
                // console.log("Variant  body = " + req.body.variant)
                // console.log("Variant  = " + variant)

                // var alternate_no = ""
                // if (req.body.alternate_no) {
                //     alternate_no = req.body.alternate_no
                // }
                var additional_info = {
                    variant: variant,
                    alternate_no: alternate_no
                }
                // if (req.body.alternate_no) {
                //     "additional_info.alternate_no" = req.body.alternate_no;
                // }
                var category = "Insurance";
                if (req.body.category) {
                    category = req.body.category;
                }
                var isStared = false;
                if (req.body.isStared) {
                    isStared = req.body.isStared
                }
                var lead = {
                    user: user,
                    car: car,
                    booking: booking,
                    name: name,
                    contact_no: contact_no,
                    email: email,
                    type: req.body.type,
                    follow_up: follow_up,
                    business: req.headers['business'],
                    assignee: assignee,
                    source: req.body.source,
                    model: req.body.model,
                    remark: remark,
                    priority: priority,
                    category: category,
                    additional_info: additional_info,
                    isStared: isStared,
                    created_at: new Date(),
                    updated_at: new Date(),

                };
                await OutBoundLead.create(lead).then(async function (l) {
                    var count = await OutBoundLead.find({ _id: { $lt: l._id }, business: business }).count();
                    var lead_id = count + 10000;

                    await OutBoundLead.findOneAndUpdate({ _id: l._id }, { $set: { lead_id: lead_id } }, { new: true }, async function (err, doc) {
                    })

                    await LeadGenRemark.create({
                        lead: l._id,
                        source: l.source,
                        type: l.type,
                        status: l.remark.status,
                        reason: req.body.reason,
                        customer_remark: req.body.remark,
                        assignee_remark: req.body.remark,
                        assignee: assignee,
                        color_code: "",
                        created_at: new Date(),
                        updated_at: new Date()
                    }).then(async function (newRemark) {
                        await OutBoundLead.findOneAndUpdate({ _id: l._id }, { $push: { remarks: newRemark._id } }, { new: true }, async function (err, doc) {
                        })
                    });

                    var lead = await OutBoundLead.findById(l._id).populate('assignee').exec();

                    var logs = [];
                    await LeadGenRemark.find({ lead: lead._id })
                        .populate('assignee')
                        .sort({ created_at: -1 })
                        .cursor()
                        .eachAsync(async (l) => {
                            var assignee = {}
                            if (l.assignee) {
                                assignee = {
                                    _id: l.assignee._id,
                                    id: l.assignee._id,
                                    name: l.assignee.name,
                                    email: l.assignee.email,
                                    contact_no: l.assignee.contact_no
                                }
                            }
                            logs.push({
                                source: l.source,
                                type: l.type,
                                reason: l.reason,
                                status: l.status,
                                customer_remark: l.customer_remark,
                                assignee_remark: l.assignee_remark,
                                assignee: assignee,
                                color_code: l.color_code,
                                created_at: moment(l.created_at).tz(req.headers['tz']).format('lll'),
                                updated_at: moment(l.updated_at).tz(req.headers['tz']).format('lll'),
                            });
                        });


                    var push = {
                        user: lead.user,
                        name: lead.name,
                        contact_no: lead.contact_no,
                        email: lead.email,
                        _id: lead._id,
                        id: lead.id,
                        priority: lead.priority,
                        contacted: lead.contacted,
                        type: lead.type,
                        lead_id: lead.lead_id,
                        date: moment(lead.updated_at).tz(req.headers['tz']).format('lll'),
                        source: lead.source,
                        status: lead.status,
                        important: lead.important,
                        follow_up: lead.follow_up,
                        remark: lead.remark,

                        assignee: {
                            _id: lead.assignee._id,
                            name: lead.assignee.name,
                            contact_no: lead.assignee.contact_no,
                            email: lead.assignee.email,
                            id: lead.assignee.id,
                        },

                        logs: logs,
                        created_at: moment(lead.created_at).tz(req.headers['tz']).format('lll'),
                        updated_at: moment(lead.updated_at).tz(req.headers['tz']).format('lll'),
                    }
                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Lead Added ",
                        responseData: push
                    });

                });
            }
        }
    }
});
router.get('/outbound/leads/get/OLD', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var filters = [];
    var totalResult = 0;

    var role = await Management.findOne({ user: user, business: business }).exec();

    var date = new Date();
    var to = new Date();
    to.setDate(date.getDate() - 1);
    to.setHours(23, 59, 58)
    var specification = {};
    specification['$lookup'] = {
        from: "User",
        localField: "user",
        foreignField: "_id",
        as: "user",
    };
    filters.push(specification);

    var specification = {};
    specification['$unwind'] = {
        path: "$user",
        preserveNullAndEmptyArrays: false
    };
    filters.push(specification);

    var specification = {};
    specification['$lookup'] = {
        from: "Car",
        localField: "car",
        foreignField: "_id",
        as: "car",
    };
    filters.push(specification);

    /*var specification = {};
    specification['$unwind']= {
        path: "$car",
        preserveNullAndEmptyArrays : false
    };
    filters.push(specification);*/

    var specification = {};
    specification['$lookup'] = {
        from: "User",
        localField: "assignee",
        foreignField: "_id",
        as: "assignee",
    };
    filters.push(specification);

    var specification = {};
    specification['$unwind'] = {
        path: "$assignee",
        preserveNullAndEmptyArrays: false
    };
    filters.push(specification);
    //
    var specification = {};
    specification['$lookup'] = {
        from: "Booking",
        localField: "booking",
        foreignField: "_id",
        as: "booking",
    };
    filters.push(specification);

    var specification = {};
    specification['$unwind'] = {
        path: "$booking",
        preserveNullAndEmptyArrays: false
    };
    filters.push(specification);
    //
    var page = 0;

    if (req.query.page == undefined) {
        page = 0;
    }
    else {
        page = req.query.page;
    }

    var page = Math.max(0, parseInt(page));

    if (role.role == "CRE") {
        var specification = {};
        specification['$match'] = {
            "assigne._id": mongoose.Types.ObjectId(role.user),
        }
        filters.push(specification);
    }
    // else if (role.role == 'Admin') {
    //     var specification = {};
    //     specification['$match'] = {
    //         "business": mongoose.Types.ObjectId(role.user),
    //     }
    //     filters.push(specification);
    // }
    if (req.query.category) {
        var specification = {};
        specification['$match'] = {
            "category": req.query.category,
        }
        filters.push(specification);
        var specification = {};
        specification['$sort'] = {
            'reminderDate': -1,
        };
        filters.push(specification);
    }
    // console.log("Category  = " + req.query.category)
    if (req.query.query) {
        req.query.query = req.query.query.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
        // category: { $in: [req.query.category] },
        var specification = {};
        specification['$match'] = {
            business: mongoose.Types.ObjectId(business),
            status: { $in: ["Open", 'Follow-Up'] },
            category: req.query.category,
            $or: [
                { 'status': { $regex: req.query.query, $options: 'i' } },
                { 'user.name': { $regex: req.query.query, $options: 'i' } },
                { 'user.contact_no': { $regex: req.query.query, $options: 'i' } },
                { 'car.title': { $regex: req.query.query, $options: 'i' } },
                { 'car.registration_no': { $regex: req.query.query, $options: 'i' } },
                { 'car.insurance_info.insurance_company': { $regex: req.query.query, $options: 'i' } },
                { 'contact_no': { $regex: req.query.query, $options: 'i' } },
                { 'name': { $regex: req.query.query, $options: 'i' } },
                // { 'car.insurance_info.insurance_company': { $regex: req.query.query, $options: 'i' } },
                // { 'car.insurance_info.insurance_company': { $regex: req.query.query, $options: 'i' } },
            ]
        };
        filters.push(specification);


        var specification = {};
        specification['$sort'] = {
            updated_at: -1,
        };
        filters.push(specification);
    }
    else {
        // console.log("Status = " + req.query.status)
        var date = new Date();
        var from = new Date(date.getFullYear(), date.getMonth(), 1);
        var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        if (req.query.status == "Follow-Up") {
            var specification = {};
            specification['$match'] = {
                business: mongoose.Types.ObjectId(business),
                status: { $in: ["Follow-Up"] },
            };
            filters.push(specification);
            if (req.query.category == "Insurance") {
                // console.log("Year before " + new Date().getFullYear())

                // console.log("Follow Insurence")
                var specification = {};
                var from = new Date(date.getFullYear(), date.getMonth(), 1);
                var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

                specification['$match'] = {
                    $expr: {
                        $and: [
                            // { $gte: [{ $month: "$follow_up.date" }, { $month: new Date() }] },  //Used Before Working 
                            // { $lte: [{ $dayOfMonth: "$follow_up.date" }, { $dayOfMonth: new Date() }] }  //Date Wise

                            // { $gte: [{ $month: "$follow_up.date" }, { $month: new Date(from) }] },
                            // { $lte: [{ $month: "$follow_up.date" }, { $month: new Date(to) }] },
                            // { $lte: [{ $dayOfMonth: "$follow_up.date" }, { $dayOfMonth: new Date() }] },
                            // { $lte: [{ $year: "$insurance_rem" }, { $year: new Date() }] }

                            //to get Follow Ups
                            { $lte: [{ $month: "$follow_up.date" }, { $month: new Date() }] },
                            { $lte: [{ $dayOfMonth: "$follow_up.date" }, { $dayOfMonth: new Date() }] },
                            { $eq: [{ $year: "$follow_up.date" }, { $year: new Date() }] }
                        ]
                    }
                    //Abhinav Current MOnth Data END 
                };
                filters.push(specification);
            } else {
                // console.log("Follow Others")
                var specification = {};
                specification['$match'] = {
                    "follow_up.date": { $lt: new Date() },
                }
                filters.push(specification);
            }

            var specification = {};
            specification['$sort'] = {
                'follow_up.date': -1,
            };
            filters.push(specification);
        } else if (req.query.status == "Open") {
            // if (req.query.category == "Insurance") {
            //     // console.log("Insurance Open")
            //     var specification = {};
            //     specification['$match'] = {
            //         business: mongoose.Types.ObjectId(business),
            //         // 'Converted', 'Lost',
            //         status: { $in: ["Open", "Follow-Up"] }
            //     };
            //     filters.push(specification);
            //     var bar = new Date();
            //     bar.setDate(bar.getDate() + 30);
            //     var specification = {};
            //     specification['$match'] = {
            //         'insurance_rem': { $gte: new Date(), $lt: bar },
            //         $expr: {
            //             $and: [
            //                 { $ne: [{ $month: "$follow_up.date" }, { $month: new Date() }] },  //Used Before Working 
            //                 { $ne: [{ $dayOfMonth: "$follow_up.date" }, { $dayOfMonth: new Date() }] }  //Date Wise
            //             ]
            //         }
            //     };

            //     filters.push(specification);
            //     var specification = {};
            //     specification['$sort'] = {
            //         'insurance_rem': 1,
            //     };
            //     filters.push(specification);

            // }
            if (req.query.category == "Insurance") {
                // console.log("Insurance Open")
                var specification = {};
                specification['$match'] = {
                    business: mongoose.Types.ObjectId(business),
                    // 'Converted', 'Lost', 'Follow-Up'\
                    category: 'Insurance',
                    status: { $in: ["Open",] }
                };
                filters.push(specification);
                var bar = new Date();
                bar.setDate(bar.getDate() + 30);
                var specification = {};
                specification['$match'] = {
                    'insurance_rem': { $gte: new Date(), $lt: bar },
                    $expr: {
                        $and: [
                            { $ne: [{ $month: "$follow_up.date" }, { $month: new Date() }] },  //Used Before Working 
                            { $ne: [{ $dayOfMonth: "$follow_up.date" }, { $dayOfMonth: new Date() }] }  //Date Wise
                        ]
                    }
                };

                filters.push(specification);
                var specification = {};
                specification['$sort'] = {
                    'insurance_rem': 1,
                };
                filters.push(specification);
            } else if (req.query.category == "ServiceReminder") {
                // console.log("Categoy = " + req.query.category)
                var specification = {};
                var bar = new Date();
                bar.setDate(bar.getDate() + 30);
                specification['$match'] = {
                    business: mongoose.Types.ObjectId(business),
                    status: { $in: ["Open"] },
                    // reminderDate: { $lte: new Date() },
                    reminderDate: { $gte: new Date(), $lt: bar },
                };
                filters.push(specification);
                var specification = {};
                specification['$sort'] = {
                    'reminderDate': -1,
                };
                filters.push(specification);

            } else {
                var specification = {};
                specification['$match'] = {
                    business: mongoose.Types.ObjectId(business),
                    status: { $in: ["Open"] }
                };
                filters.push(specification);
                var specification = {};
                specification['$sort'] = {
                    'updated_at': -1,
                };
                filters.push(specification);
            }
        } else if (req.query.status == "Lost_Closed") {
            // || req.query.status == "Closed"
            var specification = {};
            specification['$match'] = {
                business: mongoose.Types.ObjectId(business),
                status: { $in: ["Lost", "Closed"] }
            };
            filters.push(specification);
            var specification = {};
            specification['$sort'] = {
                'updated_at': -1,
            };
            filters.push(specification);
        } else if (req.query.status == "Lost") {
            // || req.query.status == "Closed"
            var specification = {};
            specification['$match'] = {
                business: mongoose.Types.ObjectId(business),
                status: { $in: ["Lost"] }
            };
            filters.push(specification);
            var specification = {};
            specification['$sort'] = {
                'updated_at': -1,
            };
            filters.push(specification);
        } else if (req.query.status == "Converted") {
            // || req.query.status == "Closed"
            var specification = {};
            specification['$match'] = {
                business: mongoose.Types.ObjectId(business),
                status: { $in: ["Converted"] }
            };
            filters.push(specification);
            var specification = {};
            specification['$sort'] = {
                'updated_at': -1,
            };
            filters.push(specification);
        } else if (req.query.status == "Expired") {
            if (req.query.category == "Insurance") {
                // console.log("Insurance Expired")
                var specification = {};
                specification['$match'] = {
                    business: mongoose.Types.ObjectId(business),
                    status: { $in: ["Open", "Follow-Up"] }
                };
                filters.push(specification);
                var specification = {};
                specification['$match'] = {
                    'car.insurance_info.expire': { $lt: new Date() },
                    // $expr: {
                    //     $and: [
                    //         { $ne: [{ $month: "$follow_up.date" }, { $month: new Date() }] },  //Used Before Working 
                    //         { $ne: [{ $dayOfMonth: "$follow_up.date" }, { $dayOfMonth: new Date() }] }  //Date Wise
                    //     ]
                    // }
                };

                filters.push(specification);
                var specification = {};
                specification['$sort'] = {
                    'car.insurance_info.expire': -1,
                };
                filters.push(specification);

            } else {
                var specification = {};
                specification['$match'] = {
                    business: mongoose.Types.ObjectId(business),
                    status: { $in: ["Open"] }
                };
                filters.push(specification);
                var specification = {};
                specification['$sort'] = {
                    'updated_at': -1,
                };
                filters.push(specification);
            }
        }
    }
    totalResult = await OutBoundLead.aggregate(filters);

    // console.log("Total Result - - - = " + totalResult.length)
    var specification = {};
    specification['$skip'] = config.perPage * page;
    filters.push(specification);

    var specification = {};
    specification['$limit'] = config.perPage;
    filters.push(specification);
    var leads = []
    await OutBoundLead.aggregate(filters)
        .allowDiskUse(true)
        .cursor({ batchSize: 10 })
        .exec()
        .eachAsync(async function (lead) {
            var booking = await Booking.findById(lead.booking._id).exec();
            leads.push({
                _id: lead._id,
                id: lead._id,
                name: lead.name,
                contact_no: lead.contact_no,
                last_service: lead.booking.updated_at,
                status: lead.status,
                follow_up: lead.follow_up,
                insurance_rem: lead.insurance_rem,
                priority: lead.priority,
                reminderDate: lead.reminderDate,
                booking: {
                    booking_no: booking.booking_no,
                    created_at: booking.created_at,
                    updated_at: booking.updated_at,
                    date: booking.date
                },
                manager: {
                    name: lead.assignee.name,
                    contact_no: lead.assignee.contact_no,
                    email: lead.assignee.email,
                },
                car: lead.car[0],
            })

        });

    res.status(200).json({
        responseCode: 200,
        responseMessage: "to",
        responseInfo: {
            // filters: filters,
            totalResult: totalResult.length
        },
        responseData: leads,
    });
});
router.get('/outbound/leads/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var filters = [];

    var role = await Management.findOne({ user: user, business: business }).exec();

    var date = new Date();
    var to = new Date();
    to.setDate(date.getDate() - 1);
    to.setHours(23, 59, 58)
    var specification = {};
    specification['$lookup'] = {
        from: "User",
        localField: "user",
        foreignField: "_id",
        as: "user",
    };
    filters.push(specification);

    var specification = {};
    specification['$unwind'] = {
        path: "$user",
        preserveNullAndEmptyArrays: false
    };
    filters.push(specification);

    var specification = {};
    specification['$lookup'] = {
        from: "Car",
        localField: "car",
        foreignField: "_id",
        as: "car",
    };
    filters.push(specification);

    /*var specification = {};
    specification['$unwind']= {
        path: "$car",
        preserveNullAndEmptyArrays : false
    };
    filters.push(specification);*/

    var specification = {};
    specification['$lookup'] = {
        from: "User",
        localField: "assignee",
        foreignField: "_id",
        as: "assignee",
    };
    filters.push(specification);

    var specification = {};
    specification['$unwind'] = {
        path: "$assignee",
        preserveNullAndEmptyArrays: false
    };
    filters.push(specification);
    //
    var specification = {};
    specification['$lookup'] = {
        from: "Booking",
        localField: "booking",
        foreignField: "_id",
        as: "booking",
    };
    filters.push(specification);

    var specification = {};
    specification['$unwind'] = {
        path: "$booking",
        preserveNullAndEmptyArrays: false
    };
    filters.push(specification);
    //
    var page = 0;

    if (req.query.page == undefined) {
        page = 0;
    }
    else {
        page = req.query.page;
    }

    var page = Math.max(0, parseInt(page));

    if (role.role == "CRE-Outbound") {
        var specification = {};
        specification['$match'] = {
            "assigne._id": mongoose.Types.ObjectId(role.user),
        }
        filters.push(specification);
    }
    // else if (role.role == 'Admin') {
    //     var specification = {};
    //     specification['$match'] = {
    //         "business": mongoose.Types.ObjectId(role.user),
    //     }
    //     filters.push(specification);
    // }
    if (req.query.category) {
        var specification = {};
        specification['$match'] = {
            business: mongoose.Types.ObjectId(business),
            "category": req.query.category,
        }
        filters.push(specification);
    }
    // console.log("Category  = " + req.query.category)
    if (req.query.query) {
        req.query.query = req.query.query.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
        // category: { $in: [req.query.category] },
        var specification = {};
        specification['$match'] = {
            business: mongoose.Types.ObjectId(business),
            status: { $in: ["Open", 'Follow-Up'] },
            category: req.query.category,
            $or: [
                { 'status': { $regex: req.query.query, $options: 'i' } },
                { 'user.name': { $regex: req.query.query, $options: 'i' } },
                { 'user.contact_no': { $regex: req.query.query, $options: 'i' } },
                { 'car.title': { $regex: req.query.query, $options: 'i' } },
                { 'car.registration_no': { $regex: req.query.query, $options: 'i' } },
                { 'car.insurance_info.insurance_company': { $regex: req.query.query, $options: 'i' } },
                { 'contact_no': { $regex: req.query.query, $options: 'i' } },
                { 'name': { $regex: req.query.query, $options: 'i' } },
                // { 'car.insurance_info.insurance_company': { $regex: req.query.query, $options: 'i' } },
                // { 'car.insurance_info.insurance_company': { $regex: req.query.query, $options: 'i' } },
            ]
        };
        filters.push(specification);
        var specification = {};
        specification['$sort'] = {
            updated_at: -1,
        };
        filters.push(specification);
    }
    // else if (req.query.status == "All" && req.query.category == "ServiceReminder") {

    //     if (req.query.date && req.query.endDate) {
    //         var date = new Date(req.query.date);
    //         var endDate = new Date(req.query.endDate);
    //         var specification = {};
    //         specification["$match"] = {
    //             "reminderDate": { $gte: new Date(date), $lte: new Date(endDate) },
    //         };
    //         filters.push(specification);
    //     }
    //     var specification = {};
    //     specification['$sort'] = {
    //         'reminderDate': 1,
    //     };
    //     filters.push(specification);
    // } else if (req.query.status == "All" && req.query.category == "Insurance") {
    //     // filters.push(specification);
    //     console.log("Date  -= " + req.query.date, " \n ENd Date = " + req.query.endDate)
    //     if (req.query.date && req.query.endDate) {
    //         var date = new Date(req.query.date);
    //         var endDate = new Date(req.query.endDate);
    //         var specification = {};
    //         specification["$match"] = {
    //             "insurance_rem": { $gte: new Date(date), $lte: new Date(endDate) },
    //         };
    //         filters.push(specification);
    //     }
    //     console.log("Date  -= " + date, " \n ENd Date = " + endDate)

    //     var specification = {};
    //     specification['$sort'] = {
    //         'insurance_rem': 1,
    //     };
    // }
    else {
        // console.log("Status = " + req.query.status)
        var date = new Date();
        var from = new Date(date.getFullYear(), date.getMonth(), 1);
        var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        if (req.query.status == "All") {
            if (req.query.category == "ServiceReminder") {
                if (req.query.date && req.query.endDate) {
                    var date = new Date(req.query.date);
                    var endDate = new Date(req.query.endDate);
                    var specification = {};
                    specification["$match"] = {
                        "reminderDate": { $gte: new Date(date), $lte: new Date(endDate) },
                    };
                    filters.push(specification);
                }
                var specification = {};
                specification['$sort'] = {
                    'reminderDate': 1,
                };
                filters.push(specification);
            } else if (req.query.category == 'Insurance') {
                if (req.query.date && req.query.endDate) {
                    var date = new Date(req.query.date);
                    var endDate = new Date(req.query.endDate);
                    var specification = {};
                    specification["$match"] = {
                        "insurance_rem": { $gte: new Date(date), $lte: new Date(endDate) },
                    };
                    filters.push(specification);
                }
                // console.log("Date  -= " + date, " \n ENd Date = " + endDate)

                var specification = {};
                specification['$sort'] = {
                    'insurance_rem': 1,
                };
                filters.push(specification);
            }
        } else if (req.query.status == "Follow-Up") {

            if (req.query.date && req.query.endDate) {
                // console.log("Date = " + req.query.date, " EndDate = " + req.query.endDate)
                var date = new Date(req.query.date)
                date = date.setDate(date.getDate() + 1);
                var endDate = new Date(req.query.endDate);
                endDate = endDate.setDate(endDate.getDate() + 1);
                var specification = {};
                console.log("Date = " + new Date(date), " EndDate = " + new Date(endDate))
                specification["$match"] = {
                    "follow_up.date": { $gte: new Date(date), $lte: new Date(endDate) },
                };
                filters.push(specification);
            } else {
                var specification = {};
                specification['$match'] = {
                    business: mongoose.Types.ObjectId(business),
                    "follow_up.date": { $lt: new Date() },
                    status: { $in: ["Follow-Up"] },
                };
                filters.push(specification);

            }
            // if (req.query.category == "Insurance") {
            //     // console.log("Year before " + new Date().getFullYear())

            //     // console.log("Follow Insurence")
            //     var specification = {};
            //     var from = new Date(date.getFullYear(), date.getMonth(), 1);
            //     var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

            //     specification['$match'] = {
            //         $expr: {
            //             $and: [
            //                 // { $gte: [{ $month: "$follow_up.date" }, { $month: new Date() }] },  //Used Before Working 
            //                 // { $lte: [{ $dayOfMonth: "$follow_up.date" }, { $dayOfMonth: new Date() }] }  //Date Wise

            //                 // { $gte: [{ $month: "$follow_up.date" }, { $month: new Date(from) }] },
            //                 // { $lte: [{ $month: "$follow_up.date" }, { $month: new Date(to) }] },
            //                 // { $lte: [{ $dayOfMonth: "$follow_up.date" }, { $dayOfMonth: new Date() }] },
            //                 // { $lte: [{ $year: "$insurance_rem" }, { $year: new Date() }] }

            //                 //to get Follow Ups
            //                 { $lte: [{ $month: "$follow_up.date" }, { $month: new Date() }] },
            //                 { $lte: [{ $dayOfMonth: "$follow_up.date" }, { $dayOfMonth: new Date() }] },
            //                 { $eq: [{ $year: "$follow_up.date" }, { $year: new Date() }] }
            //             ]
            //         }
            //         //Abhinav Current MOnth Data END 
            //     };
            //     filters.push(specification);
            // } else {
            // console.log("Follow Others")
            // var specification = {};
            // specification['$match'] = {
            //     "follow_up.date": { $lt: new Date() },
            // }
            // filters.push(specification);
            // }

            var specification = {};
            specification['$sort'] = {
                'follow_up.date': -1,
            };
            filters.push(specification);
        } else if (req.query.status == "Open") {
            // if (req.query.category == "Insurance") {
            //     // console.log("Insurance Open")
            //     var specification = {};
            //     specification['$match'] = {
            //         business: mongoose.Types.ObjectId(business),
            //         // 'Converted', 'Lost',
            //         status: { $in: ["Open", "Follow-Up"] }
            //     };
            //     filters.push(specification);
            //     var bar = new Date();
            //     bar.setDate(bar.getDate() + 30);
            //     var specification = {};
            //     specification['$match'] = {
            //         'insurance_rem': { $gte: new Date(), $lt: bar },
            //         $expr: {
            //             $and: [
            //                 { $ne: [{ $month: "$follow_up.date" }, { $month: new Date() }] },  //Used Before Working 
            //                 { $ne: [{ $dayOfMonth: "$follow_up.date" }, { $dayOfMonth: new Date() }] }  //Date Wise
            //             ]
            //         }
            //     };
            //     filters.push(specification);
            //     var specification = {};
            //     specification['$sort'] = {
            //         'insurance_rem': 1,
            //     };
            //     filters.push(specification);
            // }
            if (req.query.category == "Insurance") {
                // console.log("Insurance Open")
                var specification = {};
                specification['$match'] = {
                    business: mongoose.Types.ObjectId(business),
                    // 'Converted', 'Lost', 'Follow-Up'\
                    category: 'Insurance',
                    status: { $in: ["Open",] }
                };
                filters.push(specification);
                var bar = new Date();
                bar.setDate(bar.getDate() + 30);
                var specification = {};
                specification['$match'] = {
                    'insurance_rem': { $gte: new Date(), $lt: bar },
                    $expr: {
                        $and: [
                            { $ne: [{ $month: "$follow_up.date" }, { $month: new Date() }] },  //Used Before Working 
                            { $ne: [{ $dayOfMonth: "$follow_up.date" }, { $dayOfMonth: new Date() }] }  //Date Wise
                        ]
                    }
                };

                filters.push(specification);

                if (req.query.date && req.query.endDate) {
                    var date = new Date(req.query.date);
                    var endDate = new Date(req.query.endDate);
                    var specification = {};
                    specification["$match"] = {
                        "insurance_rem": { $gte: new Date(date), $lte: new Date(endDate) },
                    };
                    filters.push(specification);

                    var specification = {};
                    specification['$sort'] = {
                        'insurance_rem': 1,
                    };
                    filters.push(specification);

                }
            } else if (req.query.category == "ServiceReminder") {

                var specification = {};
                let bar = new Date();
                bar.setDate(bar.getDate() + 30);
                specification['$match'] = {
                    business: mongoose.Types.ObjectId(business),
                    status: { $in: ["Open"] },
                    // reminderDate: { $lte: new Date() },
                    reminderDate: { $gte: new Date(), $lte: new Date(bar) },
                };
                filters.push(specification);
                var specification = {};
                specification['$sort'] = {
                    'reminderDate': 1,
                };
                filters.push(specification);

            } else {
                var specification = {};
                specification['$match'] = {
                    business: mongoose.Types.ObjectId(business),
                    status: { $in: ["Open"] }
                };
                filters.push(specification);
                var specification = {};
                specification['$sort'] = {
                    'updated_at': -1,
                };
                filters.push(specification);
            }
        } else if (req.query.status == "Lost_Closed") {
            // || req.query.status == "Closed"
            var specification = {};
            specification['$match'] = {
                business: mongoose.Types.ObjectId(business),
                status: { $in: ["Lost", "Closed"] }
            };
            filters.push(specification);
            var specification = {};
            specification['$sort'] = {
                'updated_at': -1,
            };
            filters.push(specification);
        } else if (req.query.status == "Lost") {
            // || req.query.status == "Closed"
            var specification = {};
            specification['$match'] = {
                business: mongoose.Types.ObjectId(business),
                status: { $in: ["Lost"] }
            };
            filters.push(specification);
            var specification = {};
            specification['$sort'] = {
                'updated_at': -1,
            };
            filters.push(specification);
        } else if (req.query.status == "Converted") {
            // || req.query.status == "Closed"
            var specification = {};
            specification['$match'] = {
                business: mongoose.Types.ObjectId(business),
                status: { $in: ["Converted"] }
            };
            filters.push(specification);
            var specification = {};
            specification['$sort'] = {
                'updated_at': -1,
            };
            filters.push(specification);
        } else if (req.query.status == "Expired") {
            if (req.query.category == "Insurance") {
                // console.log("Insurance Expired")
                var specification = {};
                specification['$match'] = {
                    business: mongoose.Types.ObjectId(business),
                    status: { $in: ["Open", "Follow-Up"] }
                };
                filters.push(specification);
                var specification = {};
                specification['$match'] = {
                    'car.insurance_info.expire': { $lt: new Date() },
                    // $expr: {
                    //     $and: [
                    //         { $ne: [{ $month: "$follow_up.date" }, { $month: new Date() }] },  //Used Before Working 
                    //         { $ne: [{ $dayOfMonth: "$follow_up.date" }, { $dayOfMonth: new Date() }] }  //Date Wise
                    //     ]
                    // }
                };

                filters.push(specification);
                var specification = {};
                specification['$sort'] = {
                    'car.insurance_info.expire': -1,
                };
                filters.push(specification);

            } else {
                var specification = {};
                specification['$match'] = {
                    business: mongoose.Types.ObjectId(business),
                    status: { $in: ["Open"] }
                };
                filters.push(specification);
                var specification = {};
                specification['$sort'] = {
                    'updated_at': -1,
                };
                filters.push(specification);
            }
        }
        // else if (req.query.status == "All" && req.query.category == "ServiceReminder") {

        //     if (req.query.date && req.query.endDate) {
        //         var date = new Date(req.query.date);
        //         var endDate = new Date(req.query.endDate);
        //         var specification = {};
        //         specification["$match"] = {
        //             "reminderDate": { $gte: new Date(date), $lte: new Date(endDate) },
        //         };
        //         filters.push(specification);
        //     }
        //     var specification = {};
        //     specification['$sort'] = {
        //     'reminderDate': 1,
        // };
        //     filters.push(specification);
        // }else if (req.query.status == "All"&&req.query.category=="Insurance") {
        //     filters.push(specification);
        //     if (req.query.date && req.query.endDate) {
        //         var date = new Date(req.query.date);
        //         var endDate = new Date(req.query.endDate);
        //         var specification = {};
        //         specification["$match"] = {
        //             "insurance_rem": { $gte: new Date(date), $lte: new Date(endDate) },
        //         };
        //         filters.push(specification);
        //     }
        //     var specification = {};
        //     specification['$sort'] = {
        //     'insurance_rem': 1,
        //     };
        // }
    }
    let totalResult = await OutBoundLead.aggregate(filters);

    // console.log("Total Result - - - = " + totalResult.length)
    var specification = {};
    specification['$skip'] = config.perPage * page;
    filters.push(specification);

    var specification = {};
    specification['$limit'] = config.perPage;
    filters.push(specification);
    var leads = []
    await OutBoundLead.aggregate(filters)
        .allowDiskUse(true)
        .cursor({ batchSize: 10 })
        .exec()
        .eachAsync(async function (lead) {
            var booking = await Booking.findById(lead.booking._id).exec();
            var invoice = await Invoice.findOne({ booking: lead.booking._id, status: "Active" }).exec();
            if (booking && invoice) {
                leads.push({
                    _id: lead._id,
                    id: lead._id,
                    name: lead.name,
                    contact_no: lead.contact_no,
                    last_service: invoice.updated_at,
                    status: lead.status,
                    follow_up: lead.follow_up,
                    insurance_rem: lead.insurance_rem,
                    priority: lead.priority,
                    reminderDate: lead.reminderDate,
                    booking: {
                        booking_no: booking.booking_no,
                        created_at: booking.created_at,
                        updated_at: booking.updated_at,
                        date: booking.date
                    },
                    manager: {
                        name: lead.assignee.name,
                        contact_no: lead.assignee.contact_no,
                        email: lead.assignee.email,
                    },
                    car: lead.car[0],
                })
            }

        });

    res.status(200).json({
        responseCode: 200,
        responseMessage: "to",
        responseInfo: {
            totalResult: totalResult.length
        },
        responseData: leads,
    });
});
router.get('/outbound/lead/stats', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var role = await Management.findOne({ user: user, business: business }).exec();
    if (role) {
        var assignee = null
        if (role.role == 'CRE-Outbound') {
            assignee = mongoose.Types.ObjectId(role.user)
        } else if (role.role == 'Admin' || role.role == 'Manager') {
            assignee = { $ne: null }
        }
        var insurance_open = []
        var insurance_followUp = []
        var insurance_expired = []
        if (req.query.category == 'Insurance') {
            var filters = [];
            var date = new Date();
            // var from = new Date(date.getFullYear(), date.getMonth() - 1, date.getDate());
            var from = new Date(date.getFullYear(), date.getMonth(), 1);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
            // { $gte: [{ $month: "$follow_up.date" }, { $month: new Date(from) }] },
            // { $lte: [{ $month: "$follow_up.date" }, { $month: new Date(to) }] },
            // { $lte: [{ $dayOfMonth: "$follow_up.date" }, { $dayOfMonth: new Date() }] }
            var specification = {};
            specification['$match'] = {
                business: mongoose.Types.ObjectId(business),
                status: { $in: ["Follow-Up"] },
                category: 'Insurance',
                assignee: assignee,
                $expr: {
                    $and: [
                        // { $eq: [{ $month: "$follow_up.date" }, { $month: new Date() }] },
                        // { $eq: [{ $dayOfMonth: "$follow_up.date" }, { $dayOfMonth: new Date() }] }

                        // { $gte: [{ $month: "$follow_up.date" }, { $month: new Date(from) }] },
                        // { $lte: [{ $month: "$follow_up.date" }, { $month: new Date(to) }] },
                        // { $lte: [{ $dayOfMonth: "$follow_up.date" }, { $dayOfMonth: new Date() }] },
                        // { $eq: [{ $year: "$follow_up.date" }, { $year: new Date() }] }

                        { $lte: [{ $month: "$follow_up.date" }, { $month: new Date() }] },
                        { $lte: [{ $dayOfMonth: "$follow_up.date" }, { $dayOfMonth: new Date() }] },
                        { $eq: [{ $year: "$follow_up.date" }, { $year: new Date() }] }
                    ]
                }
            };
            filters.push(specification);
            var insurance_followUp = await OutBoundLead.aggregate(filters);

            //Insurance Open Counts
            var filters = [];
            // console.log("Insurance Open") "Follow-Up"
            var specification = {};
            specification['$match'] = {
                business: mongoose.Types.ObjectId(business),
                status: { $in: ["Open",] },
                category: 'Insurance',
                assignee: assignee,
            };
            filters.push(specification);

            var bar = new Date();
            bar.setDate(bar.getDate() + 30);
            var specification = {};
            specification['$match'] = {
                'insurance_rem': { $gte: new Date(), $lt: bar },
                'status': 'Open',
                $expr: {
                    $and: [
                        { $ne: [{ $month: "$follow_up.date" }, { $month: new Date() }] },  //Used Before Working 
                        { $ne: [{ $dayOfMonth: "$follow_up.date" }, { $dayOfMonth: new Date() }] }  //Date Wise
                    ]
                }
            };
            filters.push(specification);
            var insurance_open = await OutBoundLead.aggregate(filters);
            // console.log("Insurance Open Count = " + insurance_open.length)
            //Expired 


            var filters = [];
            var specification = {};
            specification['$lookup'] = {
                from: "Car",
                localField: "car",
                foreignField: "_id",
                as: "car",
            };
            filters.push(specification);

            // console.log("Insurance Open")
            var specification = {};
            specification['$match'] = {
                business: mongoose.Types.ObjectId(business),
                status: { $in: ["Open", "Follow-Up",] },
                category: 'Insurance',
                assignee: assignee,
            };
            filters.push(specification);

            var bar = new Date();
            bar.setDate(bar.getDate() + 30);
            var specification = {};
            specification['$match'] = {
                'car.insurance_info.expire': { $lt: new Date() },
            };
            filters.push(specification);
            var insurance_expired = await OutBoundLead.aggregate(filters);
            // console.log("Insurab=nce Expired  = " + insurance_expired.length)

        } else if (req.query.category == 'ServiceReminder') {
            var bar = new Date();
            bar.setDate(bar.getDate() + 30);
            var service_open = await OutBoundLead.find({ status: "Open", reminderDate: { $gte: new Date(), $lt: bar }, business: business, category: req.query.category, assignee: assignee }).count().exec()
        }

        // var insurance_followUp = await OutBoundLead.find({ status: { $in: ["Follow-Up"] }, "follow_up.date": { $lt: new Date() }, business: business, category: req.query.category, assignee: assignee }).count().exec()
        var open = await OutBoundLead.find({ status: "Open", business: business, category: req.query.category, assignee: assignee }).count().exec()
        var closedLost = await OutBoundLead.find({ status: { $in: ["Lost", "Closed"] }, business: business, category: req.query.category, assignee: assignee }).count().exec()
        var lost = await OutBoundLead.find({ status: { $in: ["Lost"] }, business: business, category: req.query.category, assignee: assignee }).count().exec()
        var followUp = await OutBoundLead.find({ status: { $in: ["Follow-Up"] }, "follow_up.date": { $lt: new Date() }, business: business, category: req.query.category, assignee: assignee }).count().exec()
        var converted = await OutBoundLead.find({ status: { $in: ["Converted"] }, business: business, category: req.query.category, assignee: assignee }).count().exec()
        var Database = await OutBoundLead.find({ business: business, category: req.query.category, }).count().exec();
        // var confirmedQuery = null
        // if (role.role == "CRE-Outbound") {
        //     confirmedQuery = { isOutbound: true, outbound_lead: { $ne: null }, manager: assignee, date: { $gte: new Date() }, status: { $in: ["Confirmed"] } }
        // }
        // else {
        //     confirmedQuery = { isOutbound: true, outbound_lead: { $ne: null }, business: business, date: { $gte: new Date() }, status: { $in: ["Confirmed"] } }
        // }
        // var confirmed = await Booking.find({ isOutbound: true, business: business, outbound_lead: { $ne: null }, manager: assignee, date: { $gte: new Date() }, status: { $in: ["Confirmed"] } }).count().exec();
        // var missed = await Booking.find({ isOutbound: true, outbound_lead: { $ne: null }, manager: assignee, date: { $lt: new Date() }, status: { $in: ["Confirmed"] } }).count().exec();

        // console.log("Api Called = " + req.query.type)

        if (req.query.type == 'Booking') {
            // console.log("Api Called = ")
            if (role.role == 'CRE-Outbound') {
                manager = role.user;
            }
            else {
                manager = { $ne: null };
            }
            var estimateQuery = { isOutbound: true, manager: assignee, outbound_lead: { $ne: null }, business: business, status: { $in: ["EstimateRequested"] } }
            var assigned = await Booking.find(estimateQuery).count().exec();

            var approvalQuery = { isOutbound: true, manager: assignee, outbound_lead: { $ne: null }, business: business, status: { $in: ["Approval"] } }
            var approval = await Booking.find(approvalQuery).count().exec();


            var confirmedQuery = { isOutbound: true, manager: assignee, outbound_lead: { $ne: null }, business: business, date: { $gte: new Date() }, status: "Confirmed" }
            var confirmed = await Booking.find(confirmedQuery).count().exec();

            var missedQuery = { isOutbound: true, manager: manager, business: business, outbound_lead: { $ne: null }, date: { $lt: new Date() }, status: 'Confirmed' }
            var missed = await Booking.find(missedQuery).count().exec();

            var convetedquery = { isOutbound: true, manager: assignee, outbound_lead: { $ne: null }, business: business, status: { $nin: ["Rejected", "Cancelled", "Inactive", "EstimateRequested", 'Confirmed', 'Approval', 'Pending'] } }
            var converted = await Booking.find(convetedquery).count().exec();



            // var query = { isOutbound: true, manager: assignee, outbound_lead: { $ne: null }, business: business, converted: true, status: { $nin: ["Rejected", "Cancelled", "Inactive", "EstimateRequested", 'Confirmed'] } }

            // var query = { manager: assignee, outbound_lead: { $ne: null }, business: business, status: { $in: ["EstimateRequested"] } }


            // var query = { isOutbound: true, manager: assignee, outbound_lead: { $ne: null }, business: business, status: { $in: ["Approval"] } }


            // var query = { isOutbound: true, manager: assignee, outbound_lead: { $ne: null }, business: business, date: { $gte: new Date() }, status: { $in: ["Confirmed"] } }


            // var query = { isOutbound: true, manager: assignee, outbound_lead: { $ne: null }, business: business, date: { $lt: new Date() }, status: { $in: ["Confirmed"] } }


        }


        res.status(200).json({
            responseCode: 200,
            responseMessage: "Stats Counts",
            responseData: {
                open: open,
                service_open: service_open,
                followUp: followUp,
                closedLost: closedLost,
                converted: converted,
                lost: lost,
                insurance_open: insurance_open.length,
                // insurance_followUp: insurance_followUp.length,
                insurance_followUp: followUp,
                insurance_expired: insurance_expired.length,
                assigned: assigned,
                approval: approval,
                confirmed: confirmed,
                missed: missed,
                converted: converted,
                serviceDatabase: Database,
                insuranceDatabase: Database
            }
        });
    }
});
router.get('/outbound/lead/stats/old', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var role = await Management.findOne({ user: user, business: business }).exec();
    if (role) {
        var assignee = null
        if (role.role == 'CRE-Outbound') {
            assignee = mongoose.Types.ObjectId(role.user)
        } else if (role.role == 'Admin' || role.role == 'Manager') {
            assignee = { $ne: null }
        }
        var insurance_open = []
        var insurance_followUp = []
        var insurance_expired = []
        if (req.query.category == 'Insurance') {
            var filters = [];
            var date = new Date();
            // var from = new Date(date.getFullYear(), date.getMonth() - 1, date.getDate());
            var from = new Date(date.getFullYear(), date.getMonth(), 1);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
            // { $gte: [{ $month: "$follow_up.date" }, { $month: new Date(from) }] },
            // { $lte: [{ $month: "$follow_up.date" }, { $month: new Date(to) }] },
            // { $lte: [{ $dayOfMonth: "$follow_up.date" }, { $dayOfMonth: new Date() }] }
            var specification = {};
            specification['$match'] = {
                business: mongoose.Types.ObjectId(business),
                status: { $in: ["Follow-Up"] },
                category: 'Insurance',
                assignee: assignee,
                $expr: {
                    $and: [
                        // { $eq: [{ $month: "$follow_up.date" }, { $month: new Date() }] },
                        // { $eq: [{ $dayOfMonth: "$follow_up.date" }, { $dayOfMonth: new Date() }] }

                        // { $gte: [{ $month: "$follow_up.date" }, { $month: new Date(from) }] },
                        // { $lte: [{ $month: "$follow_up.date" }, { $month: new Date(to) }] },
                        // { $lte: [{ $dayOfMonth: "$follow_up.date" }, { $dayOfMonth: new Date() }] },
                        // { $eq: [{ $year: "$follow_up.date" }, { $year: new Date() }] }

                        { $lte: [{ $month: "$follow_up.date" }, { $month: new Date() }] },
                        { $lte: [{ $dayOfMonth: "$follow_up.date" }, { $dayOfMonth: new Date() }] },
                        { $eq: [{ $year: "$follow_up.date" }, { $year: new Date() }] }
                    ]
                }
            };
            filters.push(specification);
            var insurance_followUp = await OutBoundLead.aggregate(filters);

            //Insurance Open Counts
            var filters = [];
            // console.log("Insurance Open") "Follow-Up"
            var specification = {};
            specification['$match'] = {
                business: mongoose.Types.ObjectId(business),
                status: { $in: ["Open",] },
                category: 'Insurance',
                assignee: assignee,
            };
            filters.push(specification);

            var bar = new Date();
            bar.setDate(bar.getDate() + 30);
            var specification = {};
            specification['$match'] = {
                'insurance_rem': { $gte: new Date(), $lt: bar },
                'status': 'Open',
                $expr: {
                    $and: [
                        { $ne: [{ $month: "$follow_up.date" }, { $month: new Date() }] },  //Used Before Working 
                        { $ne: [{ $dayOfMonth: "$follow_up.date" }, { $dayOfMonth: new Date() }] }  //Date Wise
                    ]
                }
            };
            filters.push(specification);
            var insurance_open = await OutBoundLead.aggregate(filters);
            // console.log("Insurance Open Count = " + insurance_open.length)
            //Expired 


            var filters = [];
            var specification = {};
            specification['$lookup'] = {
                from: "Car",
                localField: "car",
                foreignField: "_id",
                as: "car",
            };
            filters.push(specification);

            // console.log("Insurance Open")
            var specification = {};
            specification['$match'] = {
                business: mongoose.Types.ObjectId(business),
                status: { $in: ["Open", "Follow-Up",] },
                category: 'Insurance',
                assignee: assignee,
            };
            filters.push(specification);

            var bar = new Date();
            bar.setDate(bar.getDate() + 30);
            var specification = {};
            specification['$match'] = {
                'car.insurance_info.expire': { $lt: new Date() },
            };
            filters.push(specification);
            var insurance_expired = await OutBoundLead.aggregate(filters);
            // console.log("Insurab=nce Expired  = " + insurance_expired.length)

        } else if (req.query.category == 'ServiceReminder') {
            var service_open = await OutBoundLead.find({ status: "Open", reminderDate: { $lte: new Date() }, business: business, category: req.query.category, assignee: assignee }).count().exec()
        }

        // var insurance_followUp = await OutBoundLead.find({ status: { $in: ["Follow-Up"] }, "follow_up.date": { $lt: new Date() }, business: business, category: req.query.category, assignee: assignee }).count().exec()
        var open = await OutBoundLead.find({ status: "Open", business: business, category: req.query.category, assignee: assignee }).count().exec()
        var closedLost = await OutBoundLead.find({ status: { $in: ["Lost", "Closed"] }, business: business, category: req.query.category, assignee: assignee }).count().exec()
        var lost = await OutBoundLead.find({ status: { $in: ["Lost"] }, business: business, category: req.query.category, assignee: assignee }).count().exec()
        var followUp = await OutBoundLead.find({ status: { $in: ["Follow-Up"] }, "follow_up.date": { $lt: new Date() }, business: business, category: req.query.category, assignee: assignee }).count().exec()
        var converted = await OutBoundLead.find({ status: { $in: ["Converted"] }, business: business, category: req.query.category, assignee: assignee }).count().exec()
        var Database = await OutBoundLead.find({ business: business, category: req.query.category, }).count().exec();
        // var confirmedQuery = null
        // if (role.role == "CRE-Outbound") {
        //     confirmedQuery = { isOutbound: true, outbound_lead: { $ne: null }, manager: assignee, date: { $gte: new Date() }, status: { $in: ["Confirmed"] } }
        // }
        // else {
        //     confirmedQuery = { isOutbound: true, outbound_lead: { $ne: null }, business: business, date: { $gte: new Date() }, status: { $in: ["Confirmed"] } }
        // }
        // var confirmed = await Booking.find({ isOutbound: true, business: business, outbound_lead: { $ne: null }, manager: assignee, date: { $gte: new Date() }, status: { $in: ["Confirmed"] } }).count().exec();
        // var missed = await Booking.find({ isOutbound: true, outbound_lead: { $ne: null }, manager: assignee, date: { $lt: new Date() }, status: { $in: ["Confirmed"] } }).count().exec();

        // console.log("Api Called = " + req.query.type)

        if (req.query.type == 'Booking') {
            // console.log("Api Called = ")
            if (role.role == 'CRE-Outbound') {
                manager = role.user;
            }
            else {
                manager = { $ne: null };
            }
            var estimateQuery = { isOutbound: true, manager: assignee, outbound_lead: { $ne: null }, business: business, status: { $in: ["EstimateRequested"] } }
            var assigned = await Booking.find(estimateQuery).count().exec();

            var approvalQuery = { isOutbound: true, manager: assignee, outbound_lead: { $ne: null }, business: business, status: { $in: ["Approval"] } }
            var approval = await Booking.find(approvalQuery).count().exec();


            var confirmedQuery = { isOutbound: true, manager: assignee, outbound_lead: { $ne: null }, business: business, date: { $gte: new Date() }, status: "Confirmed" }
            var confirmed = await Booking.find(confirmedQuery).count().exec();

            var missedQuery = { isOutbound: true, manager: manager, business: business, outbound_lead: { $ne: null }, date: { $lt: new Date() }, status: 'Confirmed' }
            var missed = await Booking.find(missedQuery).count().exec();

            var convetedquery = { isOutbound: true, manager: assignee, outbound_lead: { $ne: null }, business: business, status: { $nin: ["Rejected", "Cancelled", "Inactive", "EstimateRequested", 'Confirmed', 'Approval', 'Pending'] } }
            var converted = await Booking.find(convetedquery).count().exec();



            // var query = { isOutbound: true, manager: assignee, outbound_lead: { $ne: null }, business: business, converted: true, status: { $nin: ["Rejected", "Cancelled", "Inactive", "EstimateRequested", 'Confirmed'] } }

            // var query = { manager: assignee, outbound_lead: { $ne: null }, business: business, status: { $in: ["EstimateRequested"] } }


            // var query = { isOutbound: true, manager: assignee, outbound_lead: { $ne: null }, business: business, status: { $in: ["Approval"] } }


            // var query = { isOutbound: true, manager: assignee, outbound_lead: { $ne: null }, business: business, date: { $gte: new Date() }, status: { $in: ["Confirmed"] } }


            // var query = { isOutbound: true, manager: assignee, outbound_lead: { $ne: null }, business: business, date: { $lt: new Date() }, status: { $in: ["Confirmed"] } }


        }


        res.status(200).json({
            responseCode: 200,
            responseMessage: "Stats Counts",
            responseData: {
                open: open,
                service_open: service_open,
                followUp: followUp,
                closedLost: closedLost,
                converted: converted,
                lost: lost,
                insurance_open: insurance_open.length,
                // insurance_followUp: insurance_followUp.length,
                insurance_followUp: followUp,
                insurance_expired: insurance_expired.length,
                assigned: assigned,
                approval: approval,
                confirmed: confirmed,
                missed: missed,
                converted: converted,
                serviceDatabase: Database,
                insuranceDatabase: Database
            }
        });
    }
});
router.get('/outbound/lead/details/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var business = req.headers['business'];
    // console.log("Type = " + req.query.type)
    // if (req.query.type != 'Database') {
    var outBoundLead = await OutBoundLead.findById(req.query.lead)
        .populate({ path: 'assignee', select: 'name contact_no email' })
        .populate({ path: 'user', select: 'name contact_no email' })
        .populate({ path: 'booking', select: 'booking_no _id id' })
        // .populate({ path: 'car', select: '_id id insurance_info' })
        .populate('car')
        .exec()
    if (outBoundLead) {
        var variant = null
        if (outBoundLead.additional_info.variant) {
            variant = await Variant.findOne({ _id: outBoundLead.additional_info.variant }).exec();
        }
        // outBoundLead._id
        // console.log(" outBoundLead._id = " + outBoundLead._id)

        var outbound_booking = await Booking.findOne({ isOutbound: true, outbound_lead: outBoundLead._id }).select('_id id outbound_lead isOutbound status date time_slot').exec();
        // var isOutboundBooking = false
        // var booking = null
        // var booking_slot = {}
        // if (outbound_booking) {
        //     booking_slot = {
        //         bookingDate: outbound_booking.date,
        //         time_slot: outbound_booking.time_slot,
        //         status: outbound_booking.status,
        //     }
        // }

        // console.log("isOutboundBooking = " + isOutboundBooking)
        // console.log("outbound_booking = " + outbound_booking)
        console.log("outbound_booking = " + JSON.stringify(outbound_booking))
        console.log("Lead Stared = " + JSON.stringify(outBoundLead.isStared))

        var data = {
            _id: outBoundLead._id,
            id: outBoundLead._id,
            name: outBoundLead.name,
            contact_no: outBoundLead.contact_no,
            email: outBoundLead.email,
            car: outBoundLead.car,
            variant: variant,
            additional_info: outBoundLead.additional_info,
            booking: outBoundLead.booking,
            status: outBoundLead.status,
            assignee: outBoundLead.assignee,
            follow_up: outBoundLead.follow_up,
            category: outBoundLead.category,
            outbound_booking: outbound_booking,
            isStared: outBoundLead.isStared,
            // booking_slot: booking_slot,
            // remarks: remarks,
            created_at: outBoundLead.created_at,
            updated_at: outBoundLead.updated_at,

        }
        res.status(200).json({
            responseCode: 200,
            responseMessage: "Lead Data",
            responseData: data
        })
    } else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Lead details not found",
            responseData: data
        })
    }
    /* }
      else if (req.query.type == 'Database') {
          var lead = await LeadGen.findById(req.query.lead)
              .populate({ path: 'assignee', select: 'name contact_no email' })
              .populate({ path: 'user', select: 'name contact_no email' })
              .populate({ path: 'booking', select: 'booking_no _id id' })
              // .populate({ path: 'car', select: '_id id insurance_info' })
              .populate('car')
              .exec()
          if (lead) {
              var data = {
                  _id: lead._id,
                  id: lead._id,
                  name: lead.name,
                  contact_no: lead.contact_no,
                  additional_info: lead.additional_info,
                  email: lead.email,
                  car: lead.car,
                  booking: lead.booking,
                  status: lead.remark.status,
                  follow_up: lead.follow_up,
                  assignee: lead.assignee,
                  // remarks: remarks,
                  created_at: lead.created_at,
                  updated_at: lead.updated_at,
  
              }
              res.status(200).json({
                  responseCode: 200,
                  responseMessage: "Lead Data",
                  responseData: data
              })
          } else {
              res.status(400).json({
                  responseCode: 400,
                  responseMessage: "Lead details not found",
                  responseData: data
              })
          }
      } 
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Lead Category not Found",
            responseData: data
        })
    }*/

});
router.put('/outbound/status/update', xAccessToken.token, async function (req, res, next) {
    var rules = {
        lead: 'required',
        // quantity: 'required',
    };
    var validation = new Validator(req.body, rules);
    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Lead is Required",
            responseData: {
                res: validation.errors.all()
            }
        })
    }
    else {
        var business = req.headers['business'];
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var status = req.body.status
        var loggedInDetails = await User.findById(decoded.user).exec();
        // , status: { $in: ["Open","Follow-Up"] }
        var lead = await OutBoundLead.findOne({ _id: req.body.lead }).exec()
        if (lead) {
            var follow_up = {}
            if (status == "Follow-Up") {
                if (req.body.date) {
                    // console.log("Data = " + req.body.date)
                    var follow_up = {
                        date: new Date(req.body.date).toISOString(),
                        time: req.body.time,
                        created_at: new Date(),
                        updated_at: new Date()
                    }
                }
            }
            var reason = lead.additional_info.lost_reason
            if (status == "Lost" || status == "Closed") {
                reason = req.body.reason
            }
            var data =
            {
                status: status,
                follow_up: follow_up,
                'additional_info.lost_reason': reason,
                updated_at: new Date()
            }
            await OutBoundLead.findOneAndUpdate({ _id: lead._id }, { $set: data }, { new: true }, async function (err, doc) {
                if (err) {
                    return res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Server Error",
                        responseData: err
                    });
                }
                else {
                    await LeadGenRemark.create({
                        lead: doc._id,
                        type: doc.category,
                        status: doc.status,
                        reason: req.body.reason,
                        customer_remark: req.body.remark,
                        assignee_remark: req.body.remark,
                        assignee: doc.assignee,
                        created_at: new Date(),
                        updated_at: new Date()
                    }).then(async function (newRemark) {
                        var remarks = lead.remarks;
                        remarks.push(newRemark._id);
                        var outbound_booking = null;

                        if (req.body.booking.length > 1) {
                            console.log("Booking Created At found ||" + req.body.booking + "|")
                            await Booking.findOneAndUpdate({ _id: req.body.booking }, { $set: { outbound_lead: lead._id, isOutbound: true } }, { new: true }, async function (err, doc) {
                                // outboundBooking = {
                                //     id: doc._id,
                                //     status: doc.status,
                                //     date: doc.date,
                                //     created_at: new Date(),
                                //     updated_at: new Date()
                                // }

                                console.log("Booking Doc + " + JSON.stringify(doc, null, '\t'))
                                outbound_booking = doc._id;
                                status = doc.status;
                            })
                        }

                        var outboundData = {
                            remarks: remarks,
                            outbound_booking: outbound_booking,
                            status: status
                        }

                        // console.log("Outbound Data = " + JSON.stringify(outboundData, null, '\t'))
                        await OutBoundLead.findOneAndUpdate({ _id: lead._id }, { $set: outboundData }, { new: true }, async function (err, doc) {
                        })
                        // await OutBoundLead.findOneAndUpdate({ _id: l._id }, { $push: { remarks: newRemark._id } }, { new: true }, async function (err, doc) {
                        // })
                    });
                }
            });
            res.status(200).json({
                responseCode: 200,
                responseMessage: "Lead updated Successfully ",
                responseData: {}
            })
        } else {
            res.status(200).json({
                responseCode: 200,
                responseMessage: "Lead Not Found",
                responseData: {}
            })
        }
    }
});
router.get('/lost/outbound/leads/get', xAccessToken.token, async function (req, res, next) {
    // console.log('Route is called...', req.query.query, req.query.by);
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    // console.log('User = ', user, business);


    var leads = [];
    var totalResult = 0;
    var role = await Management.findOne({ user: user, business: business }).exec();
    if (req.query.page == undefined) {
        var page = 0;
    }
    else {
        var page = req.query.page;
    }

    var page = Math.max(0, parseInt(page));
    var leads = [];
    var filters = [];
    var queries = {};

    if (req.query.query) {
        var specification = {};
        specification['$lookup'] = {
            from: "LeadGenRemark",
            localField: "remarks",
            foreignField: "_id",
            as: "remarks",
        };
        filters.push(specification);

        req.query.query = req.query.query.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");

        var specification = {};
        specification['$match'] = {
            business: mongoose.Types.ObjectId(business),
            $or: [
                { 'name': { $regex: req.query.query, $options: 'i' } },
                { 'contact_no': { $regex: req.query.query, $options: 'i' } },
                {
                    "remarks": {
                        $elemMatch: {
                            "status": { $regex: req.query.query, $options: 'i' }
                        }
                    }
                },
                {
                    "remarks": {
                        $elemMatch: {
                            "customer_remark": { $regex: req.query.query, $options: 'i' }
                        }
                    }
                },
                {
                    "remarks": {
                        $elemMatch: {
                            "assignee_remark": { $regex: req.query.query, $options: 'i' }
                        }
                    }
                },
            ]
        };

        filters.push(specification)

        await OutBoundLead.aggregate(filters)
            .allowDiskUse(true)
            .cursor({ batchSize: 20 })
            .exec()
            .eachAsync(async function (lead) {

                var assignee = await User.findById(lead.assignee).exec();
                leads.push({
                    _id: lead._id,
                    id: lead._id,
                    name: lead.name,
                    contact_no: lead.contact_no,
                    status: lead.status,
                    follow_up: lead.follow_up,
                    priority: lead.priority,
                    manager: {
                        name: assignee.name,
                        contact_no: assignee.contact_no,
                        email: assignee.email,
                    },
                    additional_info: lead.additional_info,
                    car: lead.car,
                    isSelected: false
                })
            });

        return res.status(200).json({
            responseCode: 200,
            responseInfo: {
                // filters: filters,
                msg: "Filter Leads",
                totalResult: leads.length
            },
            responseMessage: "",
            totalLeads: leads.length,
            responseData: leads,

        });
    } else {

        var leads = []
        var specification = {};
        specification["category"] = req.query.category;
        filters.push(specification);
        console.log("Is Stared = " + req.query.stared)


        if (req.query.stared) {
            var specification = {};
            specification["isStared"] = req.query.stared
            filters.push(specification);

            console.log("Inside Filter ")
        }

        if (role.role == "CRE-Outbound") {
            var specification = {};
            specification["assignee"] = mongoose.Types.ObjectId(role.user)
            filters.push(specification);
            var specification = {};
            specification["business"] = mongoose.Types.ObjectId(business)
            filters.push(specification);
        } else if (role.role == 'Admin' || role.role == 'Manager') {
            var specification = {};
            specification["business"] = mongoose.Types.ObjectId(business)
            filters.push(specification);
        } else {
            var specification = {};
            specification["business"] = mongoose.Types.ObjectId(role.user)
            filters.push(specification);
        }
        if (req.query.status == "Follow-Up") {
            var specification = {};
            specification["status"] = req.query.status;
            specification['follow_up.date'] = { $lte: new Date() };
            if (req.query.date && req.query.endDate) {
                var date = new Date(req.query.date)
                var endDate = new Date(req.query.endDate)
                specification['follow_up.date'] = { $gte: new Date(date), $lte: new Date(endDate) };
            }
            // filters.push(specification);
            // var specification = {};
            // specification['$expr'] = {
            //     $and: [
            //         { $eq: [{ $month: "$follow_up.date" }, { $month: new Date() }] },
            //         // { $eq: [{ $dayOfMonth: "$follow_up.date" }, { $dayOfMonth: new Date() }] }
            //     ]
            // }
            filters.push(specification);
        } else if (req.query.status == "Open") {
            var specification = {};
            specification["status"] = req.query.status;
            if (req.query.date) {
                var date = new Date(req.query.date);
                var endDate = new Date(req.query.endDate);
                specification['updated_at'] = { $gte: new Date(date), $lte: new Date(endDate) };
            }
            filters.push(specification);
        } else if (req.query.status == "Converted") {
            var specification = {};
            specification["status"] = req.query.status;
            if (req.query.date) {
                var date = new Date(req.query.date);
                var endDate = new Date(req.query.endDate);
                specification['updated_at'] = { $gte: new Date(date), $lte: new Date(endDate) };
            }
            filters.push(specification);
        }
        else if (req.query.status == "Lost") {
            // console.log('Lost date filter is called....')
            var specification = {};
            var date = new Date();
            specification["status"] = req.query.status;
            if (req.query.source) {
                specification['source'] = { $eq: req.query.source }
            }
            if (req.query.date) {
                var date = new Date(req.query.date);
                //var newDate = moment(date, "DD-MM-YYYY").add(1, 'days');
                // Changes made by me
                var endDate = new Date(req.query.endDate);
                specification['remark.updated_at'] = { $gte: new Date(date), $lt: new Date(endDate) };
            }
            if (req.query.reason) {
                specification['additional_info.reason'] = req.query.reason;
            }
            if (req.query.source) {
                specification['source'] = req.query.source;
            }


            filters.push(specification);
        }
        else if (req.query.status == "Closed") {
            // console.log('Close lead is called........', req.query.status)
            var specification = {};
            specification["status"] = req.query.status;

            if (req.query.date) {
                var date = new Date(req.query.date);
                //var newDate = moment(date, "DD-MM-YYYY").add(1, 'days');
                var endDate = new Date(req.query.endDate);
                specification['created_at'] = { $gte: new Date(date), $lt: new Date(endDate) };
            }


            if (req.query.reason) {
                specification['reason'] = req.query.reason;
            }
            filters.push(specification);
        }
        else if (req.query.status == "Lost_Closed") {

            // console.log("Stataus =" + req.query.status)
            // console.log('Close lead is called........', req.query.status)
            var specification = {};
            specification["status"] = { $in: ['Lost', 'Closed'] };

            if (req.query.date) {
                var date = new Date(req.query.date);
                //var newDate = moment(date, "DD-MM-YYYY").add(1, 'days');
                var endDate = new Date(req.query.endDate);
                specification['created_at'] = { $gte: new Date(date), $lt: new Date(endDate) };
            }


            if (req.query.reason) {
                // console.log("req.query.reason = " + req.query.reason)
                specification['reason'] = req.query.reason;
            }
            filters.push(specification);
        } else if (req.query.reason) {
            // console.log("Reason Condition = " + req.query.reason)
            var specification = {};
            specification['additional_info.lost_reason'] = { $in: [req.query.reason] };
            filters.push(specification);
        }
        if (req.query.priority) {
            var priority = parseInt(req.query.priority);
            if (priority == 0) {
                var specification = {};
                specification['priority'] = { $in: [1, 2, 3] };
                filters.push(specification);
            }
            else {
                var specification = {};
                specification['priority'] = priority;
                filters.push(specification);
            }
        }


        var query = {
            "$match": {
                "$and": filters
            }
        }

        var total = await OutBoundLead.aggregate([query]).exec();
        // console.log("TotalCounts = " + total.length)
        var sortQuery = {};
        if (req.query.status == 'Follow-Up') {
            sortQuery = { $sort: { 'follow_up.date': -1 } };
        } else if (req.query.status == 'Lost' || req.query.status == 'Closed') {
            sortQuery = { $sort: { 'created_at': -1 } };
        } else if (req.query.status == 'Open') {
            sortQuery = { $sort: { 'updated_at': -1 } };
        }
        else {
            sortQuery = { $sort: { 'created_at': -1 } };
        }

        await OutBoundLead.aggregate([
            query,
            sortQuery,
            { $skip: 10 * page },
            { $limit: 10 }
        ])
            .allowDiskUse(true)
            .cursor({ batchSize: 20 })
            .exec()
            .eachAsync(async function (lead) {

                var assignee = await User.findById(lead.assignee).exec();
                leads.push({
                    _id: lead._id,
                    id: lead._id,
                    name: lead.name,
                    contact_no: lead.contact_no,
                    status: lead.status,
                    follow_up: lead.follow_up,
                    priority: lead.priority,
                    manager: {
                        name: assignee.name,
                        contact_no: assignee.contact_no,
                        email: assignee.email,
                    },
                    // additional_info: {
                    //     address: result.additional_info.address,
                    //     model: result.additional_info.model,
                    //     location: result.additional_info.location,
                    //     registration_no: result.additional_info.registration_no,
                    //     brand: result.additional_info.brand,
                    //     category: result.additional_info.category,
                    //     variant:

                    // },
                    date_added: lead.date_added,
                    additional_info: lead.additional_info,
                    car: lead.car,
                    isSelected: false
                })

            });

        res.status(200).json({
            responseCode: 200,
            responseInfo: {
                // query: query,
                totalResult: total.length
            },
            responseMessage: role.role + " Leads",
            totalLeads: leads.length,
            responseData: leads,

        });
    }
});
//Database Lead 
router.get('/lead-generation/get', xAccessToken.token, async function (req, res) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var filters = [];
    var data = []
    let startDate = req.query.start_date
    let endDate = req.query.end_date
    // console.log(startDate, req.query.end_date)
    var status = req.query.status;
    if (req.query.status == "Lost_Closed") {
        status = ['Lost', 'Closed']
    } else {
        status = [req.query.status]
    }

    var filters = [{ $match: { "remark.status": { $in: status }, business: mongoose.Types.ObjectId(business) } }];

    if (status.length > 0) {
        var filters = [];
        var filters = [{ $match: { "remark.status": { $in: status }, business: mongoose.Types.ObjectId(business) } }];
    }
    if (startDate && endDate) {
        filters.push({ $match: { "created_at": { $gte: new Date(startDate), $lt: new Date(endDate) }, 'remark.status': req.quey.status } })
    }
    // console.log(business)

    if (req.query.query) {
        req.query.query = req.query.query.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
        filters = [{
            $match: {
                business: mongoose.Types.ObjectId(business),
                $or: [
                    { 'name': { $regex: req.query.query, $options: 'i' } },
                    { 'contact_no': { $regex: req.query.query, $options: 'i' } },
                    { 'additional_info.registration_no': { $regex: req.query.query, $options: 'i' } },
                    { 'additional_info.location': { $regex: req.query.query, $options: 'i' } },
                    { 'additional_info.category': { $regex: req.query.query, $options: 'i' } },
                    { 'additional_info.alternate_no': { $regex: req.query.query, $options: 'i' } },
                    { 'remark.status': { $regex: req.query.query, $options: 'i' } },
                    // {
                    //     "remark": {
                    //         $elemMatch: {
                    //             "status": { $regex: req.query.query, $options: 'i' }
                    //         }
                    //     }
                    // },
                ]
            }
        }]
    }


    totalLead = await LeadGen.aggregate(filters).exec()
    // console.log("Lead remarks", filters, totalLead.length)
    var queries = {};
    if (req.query.page == undefined) {
        var page = 0;
    }
    else {
        var page = req.query.page;
    }
    var page = Math.max(0, parseInt(page));
    if (req.query.status == "Follow-Up") {
        var specification = {};
        specification['$sort'] = {
            'follow_up.date': -1
        }
    } else {
        var specification = {};
        specification['$sort'] = {
            updated_at: -1
        }

    }
    var specification = {};
    specification['$skip'] = config.perPage * page;
    filters.push(specification);

    var specification = {};
    specification['$limit'] = config.perPage;
    filters.push(specification);


    // await LeadGen.find({ business: business })

    // var totolLeads = await LeadGen.find({ business: business }).select('contact_no name email').exec()
    // // var newLeads = businessFunctions.dublicate
    // console.log("Total Leads = " + totolLeads.length)

    // var newLeads = await q.all(businessFunctions.removeDublicateDoumnets(totolLeads, 'contact_no'))
    // console.log("New Leads = " + newLeads.length)
    //Testing Filter End
    // res.send(filter)
    await LeadGen.aggregate(filters)
        .allowDiskUse(true)
        .cursor({ batchSize: 10 })
        .sort({ updated_at: -1 })
        .exec()
        .eachAsync(async function (result) {

            var assigne = await User.findById(result.assignee).exec();
            data.push({
                name: result.name,
                mobile: result.contact_no,
                id: result._id,
                additional_info: {
                    address: result.additional_info.address,
                    model: result.additional_info.model,
                    location: result.additional_info.location,
                    registration_no: result.additional_info.registration_no,
                    brand: result.additional_info.brand,
                    category: result.additional_info.category,

                },
                date_added: result.date_added,
                assignee: {
                    name: assigne.name,
                    contact_no: assigne.contact_no,
                    email: assigne.email,

                },
                business: result.business_id,
                source: result.source,
                status: result.remark.status,
                contacted: result.contacted,
                date_added: result.date_added,
                created_at: result.created_at,

                updated_at: result.updated_at
            });
        });
    // console.log(data)
    res.status(200).json({
        responseCode: 200,
        responseMessage: "Lead data",
        responseInfo: {
            totalResult: totalLead.length
        },
        responseData: data,
    });
});
router.get('/database/lead/stats', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var role = await Management.findOne({ user: user, business: business }).exec();
    if (role) {
        // var assignee = null
        // if (role.role == 'CRE') {
        //     assignee = mongoose.Types.ObjectId(role.user)
        // } else {
        //     assignee = { $ne: null }
        // }
        assignee = { $ne: null }
        var open = await LeadGen.find({ 'remark.status': "Open", business: business, assignee: assignee }).count().exec()
        var closedLost = await LeadGen.find({ 'remark.status': { $in: ["Lost", "Closed"] }, business: business, assignee: assignee }).count().exec()
        var contacted = await LeadGen.find({ 'remark.status': { $in: ["Contacted"] }, business: business, assignee: assignee }).count().exec();
        var followUp = await LeadGen.find({ 'remark.status': { $in: ["Follow-Up"] }, "follow_up.date": { $lt: new Date() }, business: business, assignee: assignee }).count().exec()
        var converted = await LeadGen.find({ 'remark.status': { $in: ["Converted"] }, business: business, assignee: assignee }).count().exec();
        res.status(200).json({
            responseCode: 200,
            responseMessage: "Stats Counts",
            responseData: {
                open: open,
                followUp: followUp,
                closedLost: closedLost,
                converted: converted,
                contacted: contacted

            }
        });
    }
});
router.put('/database/lead/status/update', xAccessToken.token, async function (req, res, next) {
    var rules = {
        lead: 'required',
        // quantity: 'required',
    };
    var validation = new Validator(req.body, rules);
    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Order is Required",
            responseData: {
                res: validation.errors.all()
            }
        })
    }
    else {
        var business = req.headers['business'];
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var status = req.body.status
        var loggedInDetails = await User.findById(decoded.user).exec();
        // , status: { $in: ["Open","Follow-Up"] }
        var lead = await LeadGen.findOne({ _id: req.body.lead }).exec()
        if (lead) {
            var follow_up = {}
            if (status == "Follow-Up") {
                if (req.body.date) {
                    // console.log("Data = " + req.body.date)
                    var follow_up = {
                        date: new Date(req.body.date).toISOString(),
                        time: req.body.time,
                        created_at: new Date(),
                        updated_at: new Date()
                    }
                }
            }
            var reason = lead.additional_info.lost_reason
            if (status == "Lost" || status == "Closed") {
                reason = req.body.reason
            }

            var data =
            {
                // 'remark.status': status,
                follow_up: follow_up,
                'additional_info.lost_reason': reason,
                remark: {
                    lead: lead._id,
                    type: lead.type,
                    status: status,
                    reason: req.body.reason,
                    customer_remark: req.body.remark,
                    assignee_remark: req.body.remark,
                    assignee: lead.assignee,
                    created_at: new Date(),
                    updated_at: new Date()
                },
                updated_at: new Date()
            }
            await LeadGen.findOneAndUpdate({ _id: lead._id }, { $set: data }, { new: true }, async function (err, doc) {
                if (err) {
                    return res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Server Error",
                        responseData: err
                    });
                }
                else {
                    await LeadGenRemark.create({
                        lead: doc._id,
                        type: doc.category,
                        status: doc.status,
                        reason: req.body.reason,
                        customer_remark: req.body.remark,
                        assignee_remark: req.body.remark,
                        assignee: doc.assignee,
                        created_at: new Date(),
                        updated_at: new Date()
                    }).then(async function (newRemark) {
                        var remarks = lead.remarks;
                        remarks.push(newRemark._id)
                        await LeadGen.findOneAndUpdate({ _id: lead._id }, { $set: { remarks: remarks } }, { new: true }, async function (err, doc) {
                        })
                        // await OutBoundLead.findOneAndUpdate({ _id: l._id }, { $push: { remarks: newRemark._id } }, { new: true }, async function (err, doc) {
                        // })
                    });
                }
            });
            res.status(200).json({
                responseCode: 200,
                responseMessage: "Lead updated Successfully ",
                responseData: {}
            })
        } else {
            res.status(200).json({
                responseCode: 200,
                responseMessage: "Lead Not Found",
                responseData: {}
            })
        }
    }
});


//TO RUN ON Production Database
router.put('/database/lead/status/rename', xAccessToken.token, async function (req, res, next) {
    var business = req.headers['business'];
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var logs = []
    var loggedInDetails = await User.findById(decoded.user).exec();
    var count = 0
    await LeadGen.find({ business: business })
        .cursor()
        .eachAsync(async (l) => {
            var lead = await LeadGen.findById(l._id).exec();
            var assignee = await q.all(businessFunctions.getOutBoundAssignee(business, business));
            var data = {
                'remark.status': "Open",
                assignee: assignee,
                date_added: new Date(),
                updated_at: new Date(),
            }
            count = count + 1;
            // console.log(count, "Lead Status Updated = " + l.name)
            await LeadGen.findOneAndUpdate({ _id: l._id }, { $set: data }, { new: true }, async function (err, doc) {
                if (err) {
                    return res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Server Error",
                        responseData: err
                    });
                }
                else {
                    await LeadGenRemark.create({
                        lead: doc._id,
                        type: doc.category,
                        status: doc.status,
                        reason: req.body.reason,
                        customer_remark: "Status Renamed",
                        assignee_remark: 'Status Renamed',
                        assignee: doc.assignee,
                        created_at: new Date(),
                        updated_at: new Date()
                    }).then(async function (newRemark) {
                        var remarks = lead.remarks;
                        remarks.push(newRemark._id)
                        await LeadGen.findOneAndUpdate({ _id: lead._id }, { $set: { remarks: remarks } }, { new: true }, async function (err, doc) {
                        })
                        // await OutBoundLead.findOneAndUpdate({ _id: l._id }, { $push: { remarks: newRemark._id } }, { new: true }, async function (err, doc) {
                        // })
                    });


                }
            })
        });

    res.status(200).json({
        responseCode: 200,
        responseMessage: "Leads Remarks",
        responseData: { logs: logs }
    })


});
// var lostCreated = await q.all(businessFunctions.outboundLostLeadAdd(lead, 'Lost', loggedInDetails));
router.put('/database/lead/status/transfer', xAccessToken.token, async function (req, res, next) {
    var business = req.headers['business'];
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var logs = []
    var loggedInDetails = await User.findById(decoded.user).exec();
    var count = 0
    var dublicate = 0
    await LeadGen.find({ business: business })
        .cursor()
        .eachAsync(async (l) => {

            var created = await q.all(businessFunctions.databaseLeadAdd(l, 'DatabaseLead'))
            if (created) {
                count = count + 1
            }
            else {
                dublicate = dublicate + 1
            }
            // console.log("Created= " + count + " Dublicate = " + dublicate)
            // await new Promise(resolve => setTimeout(resolve, 1000));

        });
    res.status(200).json({
        responseCode: 200,
        responseMessage: "Leads Remarks",
        responseData: { logs: logs }
    })
});
router.put('/lost/lead/transfer', xAccessToken.token, async function (req, res, next) {
    var business = req.headers['business'];
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var logs = []
    var loggedInDetails = await User.findById(decoded.user).exec();
    var count = 0
    var dublicate = 0
    await Lead.find({ 'remark.status': 'Lost', })
        .cursor()
        .eachAsync(async (l) => {
            var lostCreated = await q.all(businessFunctions.outboundLostLeadAdd(l, 'Lost', loggedInDetails));
            // var created = await q.all(businessFunctions.databaseLeadAdd(l, 'DatabaseLead'))
            if (lostCreated) {
                count = count + 1
            }
            else {
                dublicate = dublicate + 1
            }
            // console.log("Created= " + count + " Dublicate = " + dublicate)
            // await new Promise(resolve => setTimeout(resolve, 1000));

        });
    res.status(200).json({
        responseCode: 200,
        responseMessage: "Leads Transfer Success",
        responseData: {}
    })
});



// OUTBound Lead Details Page start

router.put('/outbound/lead/remark/add', xAccessToken.token, async function (req, res, next) {
    // console.log("Lead Edit ")
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var contact_no = ""
    var email = ""
    // console.log("Lead ID= " + req.body.lead)


    if (req.body.databaseLead) {
        var check = await LeadGen.findById(req.body.lead).exec();
        if (check) {
            await LeadGenRemark.create({
                lead: check._id,
                type: check.category,
                status: check.status,
                isRemark: true,
                reason: '',
                customer_remark: req.body.remark,
                assignee_remark: req.body.remark,
                assignee: check.assignee,
                created_at: new Date(),
                updated_at: new Date()
            }).then(async function (newRemark) {
                var remarks = check.remarks;
                remarks.push(newRemark._id)
                // await OutBoundLead.findOneAndUpdate({ _id: check._id }, { $set: data }, { new: true }, async function (err, doc) {
                // })
                await LeadGen.findOneAndUpdate({ _id: check._id }, { $set: { remarks: remarks } }, { new: true }, async function (err, doc) {
                })
            });


        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Lead not found",
                responseData: {}
            });
        }
    } else {
        var check = await OutBoundLead.findById(req.body.lead).exec();
        if (check) {
            await LeadGenRemark.create({
                lead: check._id,
                type: check.category,
                status: check.status,
                isRemark: true,
                reason: '',
                customer_remark: req.body.remark,
                assignee_remark: req.body.remark,
                assignee: check.assignee,
                created_at: new Date(),
                updated_at: new Date()
            }).then(async function (newRemark) {
                var remarks = check.remarks;
                remarks.push(newRemark._id)
                // await OutBoundLead.findOneAndUpdate({ _id: check._id }, { $set: data }, { new: true }, async function (err, doc) {
                // })
                await OutBoundLead.findOneAndUpdate({ _id: check._id }, { $set: { remarks: remarks } }, { new: true }, async function (err, doc) {
                })
            });


        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Lead not found",
                responseData: {}
            });
        }
    }

    res.status(200).json({
        responseCode: 200,
        responseMessage: "Remark Added Successfully",
        responseData: {}
    });

});
router.get('/outbound/lead/remarks/get', xAccessToken.token, async function (req, res, next) {
    var rules = {
        lead: 'required',
    };
    var validation = new Validator(req.query, rules);
    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Order is Required",
            responseData: {
                res: validation.errors.all()
            }
        })
    }
    else {
        var business = req.headers['business'];
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var logs = []
        if (req.query.type == 'Database') {
            var lead = await LeadGen.findOne({ _id: req.query.lead }).exec()
            if (lead) {
                var remarks = []
                var remarks = await LeadGenRemark.find({ lead: lead._id }).populate({ path: 'assignee', select: 'name _id id contact_no email' }).sort({ created_at: -1 }).exec();
                // var inboundRemarks = await LeadRemark.find({ lead: lead.lead }).populate({ path: 'assignee', select: 'name _id id contact_no email' }).sort({ created_at: -1 }).exec();
                // var remarks = outbondRemarks.concat(inboundRemarks)
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Leads Remarks",
                    responseData: { logs: remarks }
                })
            } else {
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Lead Not Found",
                    responseData: {}
                })
            }
        } else {
            var lead = await OutBoundLead.findOne({ _id: req.query.lead }).exec()
            if (lead) {
                var remarks = []
                var outbondRemarks = await LeadGenRemark.find({ lead: lead._id }).populate({ path: 'assignee', select: 'name _id id contact_no email' }).sort({ created_at: -1 }).exec();
                var inboundRemarks = await LeadRemark.find({ lead: lead.lead }).populate({ path: 'assignee', select: 'name _id id contact_no email' }).sort({ created_at: -1 }).exec();
                var remarks = outbondRemarks.concat(inboundRemarks)
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Leads Remarks",
                    responseData: { logs: remarks }
                })
            } else {
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Lead Not Found",
                    responseData: {}
                })
            }
        }

        /*   var loggedInDetails = await User.findById(decoded.user).exec();
           if (req.query.page == undefined) {
               var page = 0;
           } else {
               var page = req.query.page;
           }
           var page = Math.max(0, parseInt(page));
   
           if (req.query.limit == undefined) {
               var limit = 50;
           } else {
               var limit = parseInt(req.query.limit);
           }
           var lead = await OutBoundLead.findOne({ _id: req.query.lead }).exec()
           if (lead) {
               await LeadGenRemark.find({ lead: lead._id })
                   .skip(limit * page).limit(limit)
                   .populate({ path: 'assignee', select: 'name _id id contact_no email' })
                   .sort({ created_at: -1 })
                   .cursor()
                   .eachAsync(async (l) => {
                       var assignee = {}
                       if (l.assignee) {
                           assignee = {
                               _id: l.assignee._id,
                               id: l.assignee._id,
                               name: l.assignee.name,
                               email: l.assignee.email,
                               contact_no: l.assignee.contact_no
                           }
                       }
                       logs.push({
                           type: l.type,
                           reason: l.reason,
                           status: l.status,
                           customer_remark: l.customer_remark,
                           assignee_remark: l.assignee_remark,
                           assignee: assignee,
                           color_code: l.color_code,
                           created_at: moment(l.created_at).tz(req.headers['tz']).format('lll'),
                           updated_at: moment(l.updated_at).tz(req.headers['tz']).format('lll'),
                       });
                   });
   
   
               if (lead.lead) {
                   await LeadRemark.find({ lead: lead.lead })
                       .skip(limit * page).limit(limit)
                       .populate({ path: 'assignee', select: 'name _id id contact_no email' })
                       .sort({ created_at: -1 })
                       .cursor()
                       .eachAsync(async (l) => {
                           var assignee = {}
                           if (l.assignee) {
                               assignee = {
                                   _id: l.assignee._id,
                                   id: l.assignee._id,
                                   name: l.assignee.name,
                                   email: l.assignee.email,
                                   contact_no: l.assignee.contact_no
                               }
                           }
                           logs.push({
                               type: l.type,
                               reason: l.reason,
                               status: l.status,
                               customer_remark: l.customer_remark,
                               assignee_remark: l.assignee_remark,
                               assignee: assignee,
                               color_code: l.color_code,
                               created_at: moment(l.created_at).tz(req.headers['tz']).format('lll'),
                               updated_at: moment(l.updated_at).tz(req.headers['tz']).format('lll'),
                           });
                       });
               };
   
   
          
               res.status(200).json({
                   responseCode: 200,
                   responseMessage: "Leads Remarks",
                   responseData: { logs: logs }
               })
           } else {
               res.status(200).json({
                   responseCode: 200,
                   responseMessage: "Lead Not Found",
                   responseData: {}
               })
           }*/
    }

});
router.put('/outbound/lead/edit', xAccessToken.token, async function (req, res, next) {
    // console.log("Lead Edit ")
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var bookings = [];
    var totalResult = 0;
    var name = ""
    var user = ""
    var contact_no = ""
    var email = ""
    // console.log("Lead ID= " + req.body.lead)
    var check = await OutBoundLead.findById(req.body.lead).exec();
    if (check) {
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var alternate_no = req.body.alternate_no;
        if (req.body.alternate_no) {
            alternate_no = req.body.alternate_no
        }
        var car = null;
        if (req.body.variant) {
            car = req.body.variant;
        }
        var assignee = check.assignee;
        if (req.body.assignee) {
            assignee = req.body.assignee
        }
        name = req.body.name;
        contact_no = req.body.contact_no;
        email = req.body.email;

        var leads = {};
        var data = {};

        data = {
            name: req.body.name,
            assignee: assignee,
            "additional_info.alternate_no": alternate_no,
            "additional_info.variant": car,
            contact_no: contact_no,
            email: req.body.email,
            updated_at: new Date(),
            remarks: check.remarks
        }

        await LeadGenRemark.create({
            lead: check._id,
            type: check.category,
            status: check.status,
            reason: 'Updated Successfully',
            customer_remark: 'Updated Successfully',
            assignee_remark: 'Updated Successfully',
            assignee: assignee,
            created_at: new Date(),
            updated_at: new Date()
        }).then(async function (newRemark) {

            data.remarks.push(newRemark._id);

            await OutBoundLead.findOneAndUpdate({ _id: check._id }, { $set: data }, { new: true }, async function (err, doc) {
            })

        });
        res.status(200).json({
            responseCode: 200,
            responseMessage: "Lead Updated Successfully",
            responseData: push
        });
    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Lead not found",
            responseData: {}
        });
    }
});
router.put('/outbound/lead/update/star', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    // console.log("Lead Id= " + req.body.lead)
    var lead = await OutBoundLead.findById(req.body.lead).exec();
    if (lead) {
        var remark = "Lead Un-Stared"
        if (req.body.isStared) {
            var remark = "Lead Stared"
        }

        await LeadGenRemark.create({
            lead: lead._id,
            type: lead.category,
            status: lead.status,
            reason: '',
            customer_remark: remark,
            assignee_remark: remark,
            assignee: lead.assignee,
            created_at: new Date(),
            updated_at: new Date()
        }).then(async function (newRemark) {
            var remarks = lead.remarks;
            remarks.push(newRemark._id)
            await OutBoundLead.findOneAndUpdate({ _id: lead._id }, { $set: { remarks: remarks, isStared: req.body.isStared } }, { new: true }, async function (err, doc) {


                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Marked Succes",
                    responseData: {}
                });
            })
        });

    } else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: 'Lead not found',
            responseData: {},
        });
    }
});


//PSF Leads Get
router.get('/psf/leads/get', xAccessToken.token, async function (req, res, next) {
    // console.log('Route is called...', req.query.query, req.query.by);
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    // console.log('User = ', user, business);
    var bookings = [];
    var totalResult = 0;
    var role = await Management.findOne({ user: user, business: business }).exec();
    if (req.query.page == undefined) {
        var page = 0;
    }
    else {
        var page = req.query.page;
    }
    var page = Math.max(0, parseInt(page));
    var leads = [];
    var filters = [];
    var queries = {};

    if (req.query.query) {
        var specification = {};
        specification['$lookup'] = {
            from: "LeadRemark",
            localField: "remarks",
            foreignField: "_id",
            as: "remarks",
        };
        filters.push(specification);

        req.query.query = req.query.query.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");

        var specification = {};
        specification['$match'] = {
            business: mongoose.Types.ObjectId(business),
            'remark.status': { $in: ['PSF', 'Closed', 'Rework'] },
            $or: [
                { 'name': { $regex: req.query.query, $options: 'i' } },
                { 'contact_no': { $regex: req.query.query, $options: 'i' } },
                { 'remark.reason': { $regex: req.query.query, $options: 'i' } },
                {
                    "remarks": {
                        $elemMatch: {
                            "status": { $regex: req.query.query, $options: 'i' }
                        }
                    }
                },
                {
                    "remarks": {
                        $elemMatch: {
                            "customer_remark": { $regex: req.query.query, $options: 'i' }
                        }
                    }
                },
                {
                    "remarks": {
                        $elemMatch: {
                            "assignee_remark": { $regex: req.query.query, $options: 'i' }
                        }
                    }
                },
            ]
        };

        filters.push(specification)

        await Lead.aggregate(filters)
            .allowDiskUse(true)
            .cursor({ batchSize: 20 })
            .exec()
            .eachAsync(async function (lead) {
                var remark = await LeadRemark.findOne({ lead: lead._id }).sort({ created_at: -1 }).exec();
                var assignee = await User.findById(lead.assignee).exec();

                if (assignee) {
                    var a = {
                        name: assignee.name,
                        email: assignee.email,
                        contact_no: assignee.contact_no,
                        _id: assignee._id,
                        _id: assignee._id,
                    }
                }
                else {
                    var a = {
                        name: "",
                        email: "",
                        contact_no: "",
                        _id: null,
                        _id: null,
                    }
                }
                var follow_up = {}
                if (lead.follow_up) {
                    follow_up = lead.follow_up
                }

                var b = await Booking.findOne({ lead: lead._id })
                    .populate({ path: 'car', select: 'title registration_no' })
                    .populate({ path: 'advisor', select: 'name contact_no email' }).exec();
                var booking = null;
                var car = null;
                var advisor = null;
                if (b) {
                    booking = {
                        _id: b._id,
                        id: b._id,
                        last_job: b.date,
                    }
                    car = {
                        title: b.car.title,
                        registration_no: b.car.registration_no,
                        // insurance_info :b.car.insurance_info
                    }
                    advisor = {
                        name: b.advisor.name,
                        contact_no: b.advisor.contact_no,
                        email: b.advisor.email,
                    }
                }
                var isStared = false;
                if (lead.isStared) {
                    isStared = lead.isStared
                } else {
                    isStared = false
                }
                leads.push({
                    booking: booking,
                    car: car,
                    name: lead.name,
                    contact_no: lead.contact_no,
                    email: lead.email,
                    _id: lead._id,
                    id: lead.id,
                    status: lead.status,
                    follow_up: follow_up,
                    assignee: a,
                    advisor: advisor,
                    isStared: isStared,
                    created_at: moment(lead.created_at).tz(req.headers['tz']).format('lll'),
                    updated_at: moment(lead.updated_at).tz(req.headers['tz']).format('lll'),
                });
            });

        return res.status(200).json({
            responseCode: 200,
            responseInfo: {
                // filters: filters,
                msg: "Filter Leads",
                totalResult: leads.length
            },
            responseMessage: "",
            totalLeads: leads.length,
            responseData: leads,

        });
    }
    filters = [];
    if (role.role == "CRE") {
        var specification = {};
        specification["assignee"] = mongoose.Types.ObjectId(role.user)
        filters.push(specification);
        var specification = {};
        specification["business"] = mongoose.Types.ObjectId(business)
        filters.push(specification);
    }
    else if (role.role == "Admin" || role.role == 'Manager') {
        var specification = {};
        specification["business"] = mongoose.Types.ObjectId(business)
        filters.push(specification);
    } else {
        var specification = {};
        specification["business"] = mongoose.Types.ObjectId(role.user)
        filters.push(specification);
    }

    if (req.query.status == "Rework") {
        var specification = {};
        specification["remark.status"] = req.query.status;
        filters.push(specification);
    } else if (req.query.status == "PSF") {
        var specification = {};
        specification["remark.status"] = req.query.status;
        specification['follow_up.date'] = { $lte: new Date() };
        filters.push(specification);
    } else if (req.query.status == "Dissatisfied") {
        var specification = {};
        specification["remark.reason"] = req.query.status;
        specification["remark.status"] = 'Closed';
        filters.push(specification);
    } else if (req.query.status == "Satisfied") {
        var specification = {};
        specification["remark.reason"] = req.query.status;
        specification["remark.status"] = 'Closed';
        filters.push(specification);
    }


    var query = {
        "$match": {
            "$and": filters
        }
    }
    // console.log('Filters', filters);


    var total = await Lead.aggregate([query]).exec();
    var sortQuery = { $sort: { 'updated_at': -1 } };



    await Lead.aggregate([
        query,
        sortQuery,
        { $skip: 10 * page },
        { $limit: 10 }
    ])
        .allowDiskUse(true)
        .cursor({ batchSize: 20 })
        .exec()
        .eachAsync(async function (lead) {
            var remark = await LeadRemark.findOne({ lead: lead._id }).sort({ created_at: -1 }).exec();
            var assignee = await User.findById(lead.assignee).exec();

            if (assignee) {
                var a = {
                    name: assignee.name,
                    email: assignee.email,
                    contact_no: assignee.contact_no,
                    _id: assignee._id,
                    _id: assignee._id,
                }
            }
            else {
                var a = {
                    name: "",
                    email: "",
                    contact_no: "",
                    _id: null,
                    _id: null,
                }
            }
            var follow_up = {}
            if (lead.follow_up) {
                follow_up = lead.follow_up
            }

            var b = await Booking.findOne({ lead: lead._id })
                .populate({ path: 'car', select: 'title registration_no' })
                .populate({ path: 'advisor', select: 'name contact_no email' }).exec();
            var booking = null;
            var car = null;
            var advisor = null;
            if (b) {
                booking = {
                    _id: b._id,
                    id: b._id,
                    last_job: b.date,
                }
                car = {
                    title: b.car.title,
                    registration_no: b.car.registration_no,
                    // insurance_info :b.car.insurance_info
                }
                advisor = {
                    name: b.advisor.name,
                    contact_no: b.advisor.contact_no,
                    email: b.advisor.email,
                }
            }
            var isStared = false;
            if (lead.isStared) {
                isStared = lead.isStared
            } else {
                isStared = false
            }
            leads.push({
                booking: booking,
                car: car,
                name: lead.name,
                contact_no: lead.contact_no,
                email: lead.email,
                _id: lead._id,
                id: lead.id,
                status: lead.status,
                follow_up: follow_up,
                assignee: a,
                advisor: advisor,
                isStared: isStared,
                created_at: moment(lead.created_at).tz(req.headers['tz']).format('lll'),
                updated_at: moment(lead.updated_at).tz(req.headers['tz']).format('lll'),
            });
        });

    res.status(200).json({
        responseCode: 200,
        responseInfo: {
            // filters: filters,
            totalResult: total.length
        },
        responseMessage: role.role + " Leads",
        totalLeads: leads.length,
        responseData: leads,

    });
});
router.get('/psf/lead/stats', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var role = await Management.findOne({ user: user, business: business }).exec();
    if (role) {
        var assignee = null
        if (role.role == 'CRE') {
            assignee = mongoose.Types.ObjectId(role.user)
        } else if (role.role == 'Admin' || role.role == 'Manager') {
            assignee = { $ne: null }
        } else {
            assignee = mongoose.Types.ObjectId(role.user)
        }
        // assignee = { $ne: null }
        var open = await Lead.find({ 'remark.status': { $in: ["PSF"] }, "follow_up.date": { $lt: new Date() }, business: business, assignee: assignee }).count().exec()
        var rework = await Lead.find({ 'remark.status': { $in: ["Rework"] }, business: business, assignee: assignee }).count().exec()
        var satisfied = await Lead.find({ 'remark.status': { $in: ["Closed"] }, 'remark.reason': { $in: ["Satisfied"] }, business: business, assignee: assignee }).count().exec()
        var dissatisfied = await Lead.find({ 'remark.status': { $in: ["Closed"] }, 'remark.reason': { $in: ["Dissatisfied"] }, business: business, assignee: assignee }).count().exec()
        res.status(200).json({
            responseCode: 200,
            responseMessage: "PSF Stats Counts",
            responseData: {
                open: open,
                rework: rework,
                satisfied: satisfied,
                dissatisfied: dissatisfied,

            }
        });
    }
});
router.put('/car/insurance-info/update', xAccessToken.token, async function (req, res, next) {
    var rules = {
        car: 'required',
    };
    var validation = new Validator(req.body, rules);
    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Booking required",
            responseData: {
                res: validation.errors.all()
            }
        })
    }
    else {
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var loggedInDetails = await User.findById(decoded.user).exec();
        var business = req.headers['business'];

        var car = await Booking.findById(req.body.car).exec();
        if (booking) {
            var insurance_company = await InsuranceCompany.findOne({ company: req.body.insurance_company }).exec();
            var expire = null;
            if (req.body.expire) {
                expire = new Date(req.body.expire).toISOString()
            }
            var insurance_info = {
                policy_holder: req.body.policy_holder,
                insurance_company: req.body.insurance_company,
                branch: req.body.branch,
                state: req.body.state,
                contact_no: req.body.contact_no,
                gstin: req.body.gstin,
                policy_no: req.body.policy_no,
                premium: req.body.premium,
                expire: expire,
                claim: booking.insurance_info.claim,
                cashless: booking.insurance_info.cashless,
                policy_type: booking.insurance_info.policy_type,
                claim_no: booking.insurance_info.claim_no,
                driver_accident: booking.insurance_info.driver_accident,
                accident_place: booking.insurance_info.accident_place,
                accident_date: booking.insurance_info.accident_date,
                accident_time: booking.insurance_info.accident_time,
                accident_cause: booking.insurance_info.accident_cause,
                spot_survey: booking.insurance_info.spot_survey,
                fir: booking.insurance_info.fir,
                manufacture_year: booking.insurance_info.manufacture_year
            };
            await Car.findOneAndUpdate({ _id: car._id }, { $set: { insurance_info: insurance_info } }, { new: false }, function (err, doc) { });
            var activity = {
                user: loggedInDetails._id,
                name: loggedInDetails.name,
                stage: "Job",
                activity: "InsuranceDetailsUpdate",
            };

            // "Insurance"
            res.status(200).json({
                responseCode: 200,
                responseMessage: "Insurance details updated...",
                responseData: updated,
            })
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Car not found",
                responseData: {},
            })
        }
    }
});
router.put('/outbound/lead-info/update', xAccessToken.token, async function (req, res, next) {
    var rules = {
        lead: 'required',
    };
    var validation = new Validator(req.body, rules);
    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Lead required",
            responseData: {
                res: validation.errors.all()
            }
        })
    }
    else {
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var loggedInDetails = await User.findById(decoded.user).exec();
        var business = req.headers['business'];
        var lead = await OutBoundLead.findById(req.body.lead).exec();
        if (lead) {
            var insurance_rem = lead.insurance_rem
            var expire = null;
            if (lead.category == 'Insurance') {
                console.log("Insurance Update ")
                var car = await Car.findById(req.body.carId).exec();
                if (car) {
                    if (req.body.isuranceExpire) {
                        expire = new Date(req.body.isuranceExpire).toISOString()
                    }
                    var insurance_info = {
                        insurance_company: req.body.isuranceCompany,
                        expire: expire,
                    };
                    await Car.findOneAndUpdate({ _id: car._id }, { $set: { insurance_info: insurance_info } }, { new: true }, function (err, doc) {
                        // console.log("Car - " + JSON.stringify(doc, null, '\t)'));



                        var reminderYear = new Date().getFullYear();
                        if (doc.insurance_info.expire.getFullYear() >= new Date().getFullYear()) {
                            reminderYear = expire.getFullYear();
                        }
                        var bar = new Date(reminderYear, doc.insurance_info.expire.getMonth(), doc.insurance_info.expire.getDate());
                        insurance_rem = new Date(bar).toISOString();
                    })
                }
            }
            var data = {
                name: req.body.name,
                email: req.body.email,
                contact_no: req.body.contact_no,
                'additional_info': {
                    alternate_no: req.body.alternate_no,
                    variant: req.body.variant,
                    // car:
                },
                insurance_rem: insurance_rem,
                assignee: req.body.assignee,
                updated_at: new Date()
            }
            console.log("Data  = " + JSON.stringify(data))
            await OutBoundLead.findOneAndUpdate({ _id: lead._id }, { $set: data }, { new: false }, function (err, doc) {
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Leads info updated",
                    responseData: {}
                })
            })

        } else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Lead not found",
                responseData: {}
            })
        }

    }
});
router.put('/psf/lead/devide', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var business = req.headers['business'];
    var count = 0
    // var newCre = '60dd9b641584c55d124bc3fd'; // Ruchi
    // var newCre = '615153e8c28bce3e94df5604'; //Abhinav
    var newCre = req.body.cre; //Abhinav

    var assignee = await Management.findOne({ business: business, role: "CRE", user: newCre }).exec();
    if (assignee) {
        await Lead.find({ business: business, 'remark.status': "PSF" })
            .sort({ 'follow_up.date': -1 })
            .cursor().eachAsync(async (v) => {
                count = count + 1;
                if (count % 2 == 0) {
                    var lead = await Lead.findById(v._id).exec();
                    lead.assignee = assignee.user
                    await lead.save();
                    // console.log("New CRE  = " + count)

                } else {
                    // console.log("OLD CRE  = " + count)
                }
            })
        res.status(200).json({
            responseCode: 200,
            responseMessage: "PSF Leads devided among CRE's",
            responseData: {}
        })
    } else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Assignee Not Found",
            responseData: {}
        })
    }
});

router.put('/serviceReminder/status/change', async function (req, res, next) {
    var business = req.headers['business'];
    var count = 0; await OutBoundLead.find({ business: business, category: 'ServiceReminder' })
        .cursor().eachAsync(async (v) => {
            count += 1
            // console.log("Count " + count)
            await OutBoundLead.findOneAndUpdate({ _id: v._id }, { $set: { reminderDate: new Date(v.follow_up.date), status: 'Open' } }, { new: true }, async function (err, doc) {
            })
        })
    res.status(200).json({
        responseCode: 200,
        responseMessage: "Changed",
        responseData: {}
    });
});

router.get('/outbound/cre/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var business = req.headers['business'];
    var outbound_cre = [];
    await Management.find({ business: business, role: "CRE-Outbound" })
        .populate({ path: "user" })
        .cursor().eachAsync(async (v) => {
            outbound_cre.push({
                _id: v.user._id,
                id: v.user.id,
                name: v.user.name,
                username: v.user.username,
                email: v.user.email,
                contact_no: v.user.contact_no,
            })
        })

    res.status(200).json({
        responseCode: 200,
        responseMessage: "Outbound CRE",
        responseData: outbound_cre
    })
});
router.get('/outbound/leads/booking/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var bookings = [];
    var totalResult = 0;
    var lead = {}
    // console.log('startDate', req.query.date, req.query.endDate)
    // console.log("Query Status = " + req.query.status)
    var role = await Management.findOne({ user: user, business: business }).exec();
    assignee = role.user
    if (role.role == 'CRE-Outbound') {
        assignee = role.user
    } else if (role.role == 'Admin' || role.role == 'Manager') {
        assignee = { $ne: null }
    }
    var leads = []
    var filters = []
    if (req.query.query) {
        var specification = {};
        specification['$lookup'] = {
            from: "OutBoundLead",
            localField: "outbound_lead",
            foreignField: "_id",
            as: "outbound_lead",
        };
        filters.push(specification);

        var specification = {};
        specification['$unwind'] = {
            path: "$outbound_lead",
            preserveNullAndEmptyArrays: false
        };
        var specification = {};
        specification['$lookup'] = {
            from: "Car",
            localField: "car",
            foreignField: "_id",
            as: "car",
        };
        filters.push(specification);

        var specification = {};
        specification['$unwind'] = {
            path: "$car",
            preserveNullAndEmptyArrays: false
        };
        filters.push(specification);

        var specification = {};
        specification['$lookup'] = {
            from: "User",
            localField: "advisor",
            foreignField: "_id",
            as: "advisor",
        };
        filters.push(specification);

        var specification = {};
        specification['$unwind'] = {
            path: "$advisor",
            preserveNullAndEmptyArrays: false
        };

        req.query.query = req.query.query.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");

        var specification = {};
        specification['$match'] = {
            business: mongoose.Types.ObjectId(business),
            isOutbound: true,
            $or: [
                { 'booking_no': { $regex: req.query.query, $options: 'i' } },
                { 'outbound_lead.name': { $regex: req.query.query, $options: 'i' } },
                { 'outbound_lead.contact_no': { $regex: req.query.query, $options: 'i' } },
                // { 'contact_no': { $regex: req.query.query, $options: 'i' } },
                // {
                //     "outbound_lead": {
                //         $elemMatch: {
                //             "name": { $regex: req.query.query, $options: 'i' }
                //         }
                //     }
                // },
                // {
                //     "outbound_lead": {
                //         $elemMatch: {
                //             "contact_no": { $regex: req.query.query, $options: 'i' }
                //         }
                //     }
                // },
                // {
                //     "outbound_lead": {
                //         $elemMatch: {
                //             "email": { $regex: req.query.query, $options: 'i' }
                //         }
                //     }
                // },
            ]
        };

        filters.push(specification)

        await Booking.aggregate(filters)
            .allowDiskUse(true)
            .cursor({ batchSize: 20 })
            .exec()
            .eachAsync(async function (booking) {
                // leads.push(lead)
                var assignee = await User.findById(booking.outbound_lead.assignee).exec();
                leads.push({
                    _id: booking.outbound_lead._id,
                    id: booking.outbound_lead._id,
                    name: booking.outbound_lead.name,
                    contact_no: booking.outbound_lead.contact_no,
                    status: booking.outbound_lead.status,
                    follow_up: booking.outbound_lead.follow_up,
                    priority: booking.outbound_lead.priority,
                    advisor: booking.advisor.name,
                    manager: {
                        name: booking.outbound_lead.name,
                        contact_no: assignee.contact_no,
                        email: assignee.email,
                    },
                    additional_info: booking.outbound_lead.additional_info,
                    car: booking.car,
                    isSelected: false
                })
            });

        return res.status(200).json({
            responseCode: 200,
            responseInfo: {
                // filters: filters,
                msg: "Filter Leads",
                totalResult: leads.length
            },
            responseMessage: "",
            totalLeads: leads.length,
            responseData: leads,

        });
    }
    else {
        if (req.query.status == "Converted") {
            // console.log("Converted")
            var query = { isOutbound: true, manager: assignee, outbound_lead: { $ne: null }, business: business, status: { $nin: ["Rejected", "Cancelled", "Inactive", "EstimateRequested", 'Confirmed', 'Approval', 'Pending'] } }
        } else if (req.query.status == "Assigned") {
            var query = { manager: assignee, outbound_lead: { $ne: null }, business: business, status: { $in: ["EstimateRequested"] } }
        } else if (req.query.status == "Approval") {
            // console.log("Approval")
            var query = { isOutbound: true, manager: assignee, outbound_lead: { $ne: null }, business: business, status: { $in: ["Approval"] } }
        } else if (req.query.status == "Confirmed") {
            // console.log("Confirmed")
            var query = { isOutbound: true, manager: assignee, outbound_lead: { $ne: null }, business: business, date: { $gte: new Date() }, status: { $in: ["Confirmed"] } }
        }
        else if (req.query.status == "Missed") {
            // console.log("Missed")
            var query = { isOutbound: true, manager: assignee, outbound_lead: { $ne: null }, business: business, date: { $lt: new Date() }, status: { $in: ["Confirmed"] } }

        }


        // else {
        //     // console.log("Elsee")
        //     if (role.role == "CRE") {
        //         var query = { isOutbound: false, manager: user, business: business, converted: true, status: { $nin: ["Rejected", "Cancelled", "Inactive", "EstimateRequested", 'Confirmed'] } }
        //     }
        //     else {
        //         var query = { isOutbound: false, business: business, converted: true, status: { $nin: ["Rejected", "Cancelled", "Inactive", "EstimateRequested", 'Confirmed'] } }
        //     }
        // }
        if (req.query.date) {
            query['created_at'] = { $gte: new Date(req.query.date), $lte: new Date(req.query.endDate) }
        }

        if (req.query.page == undefined) {
            var page = 0;
        }
        else {
            var page = req.query.page;
        }

        var page = Math.max(0, parseInt(page));

        var totalResult = await Booking.find(query).count().exec();
        // console.log('booking find query.....', query)
        var leads = []
        await Booking.find(query)
            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no email business_info" } })
            .populate({ path: 'manager', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'advisor', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'outbound_lead', populate: { path: 'outbound_lead', select: "_id id name contact_no email category follow_up date_added additional_info" } })
            .populate({ path: 'car', select: '_id id title registration_no ic rc', populate: { path: 'thumbnails' } })
            .sort({ updated_at: -1 }).skip(config.perPage * page).limit(config.perPage)
            .cursor().eachAsync(async (booking) => {
                // var assignee = await User.findById(lead.assignee).exec();
                leads.push({
                    _id: booking.outbound_lead._id,
                    id: booking.outbound_lead._id,
                    name: booking.outbound_lead.name,
                    contact_no: booking.outbound_lead.contact_no,
                    status: booking.outbound_lead.status,
                    follow_up: booking.outbound_lead.follow_up,
                    category: booking.outbound_lead.category,
                    manager: {
                        name: booking.manager.name,
                        contact_no: booking.manager.contact_no,
                        email: booking.manager.email,
                    },
                    advisor: {
                        name: booking.advisor.name,
                        contact_no: booking.advisor.contact_no,
                        email: booking.advisor.email,
                    },
                    date_added: booking.outbound_lead.date_added,
                    additional_info: booking.outbound_lead.additional_info,
                    car: booking.car,
                    isSelected: false,
                    outbound_booking: booking._id,
                    isOutbound: booking.isOutbound,
                    booking_date: booking.date,
                    // booking_details: {
                    //     status: booking.status
                    // }
                })
            });

        res.status(200).json({
            responseCode: 200,
            responseMessage: "to",
            responseData: leads,
            responseInfo: {
                totalResult: totalResult,
                query: query
            }
        });
    }
});

//Service Reminder Leads From Bookings
router.post('/create/outbound/leads/reminders', async function (req, res, next) {
    var business = req.headers['business'];
    var bookings = [];
    var filters = [];
    var totalResult = 0;

    if (req.query.page == undefined) {
        var page = 0;
    }
    else {
        var page = req.query.page;
    }
    var specification = {};
    specification['$match'] = {
        status: "Active"
    };
    filters.push(specification);
    totalResult = await Invoice.aggregate(filters);

    var lastCount = 0;
    var noBooking = 0;
    var noInvoice = 0;
    var noUser_Car = 0;
    //console.log("Creation Process Start : Please wait.................................................................... ")
    await Invoice.aggregate(filters)
        .allowDiskUse(true)
        .cursor({ batchSize: 1000 })
        .exec()
        .eachAsync(async function (invoice) {
            // console.log("Count  = " + count)

            //Create Service Reminder Outbound Leads
            let created = await q.all(businessFunctions.ServiceReminderoutboundLeaCreate(invoice._id, 'ServiceReminder'))

            //Create Service Reminder Outbound Leads
            // let created = await q.all(businessFunctions.InsuranceReminderoutboundLeaCreate(invoice._id, 'Insurance'))
            // console.log("Create = " + JSON.stringify(created, null, '\t'))
            if (created.type == 'isLast') {
                lastCount = lastCount + 1
            } else if (created.type == '!Booking') {
                noBooking = noBooking + 1
            } else if (created.type == '!Invoice') {
                noInvoice = noInvoice + 1
            } else if (created.type == '!Car_User') {
                noUser_Car = noUser_Car + 1
            }
            // console.log("No Booking: = " + noBooking)
        });
    console.log("Creation Process End. = " + JSON.stringify({
        lastCount: lastCount,
        noBooking: noBooking,
        noInvoice: noInvoice,
        noUser_Car: noUser_Car,
    }), null, '/t')

    res.status(200).json({
        responseCode: 200,
        responseMessage: filters,
        responseInfo: {
            totalResult: totalResult.length
        },
        responseData: {
            lastCount: lastCount,
            noBooking: noBooking,
            noInvoice: noInvoice,
            noUser_Car: noUser_Car,

        },

    });
});
module.exports = router