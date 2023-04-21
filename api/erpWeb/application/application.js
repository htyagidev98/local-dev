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
const WebNotification = require('../../../models/webNotification');
const { updateMany } = require('../../../models/user');
const { filter, rangeRight } = require('lodash');

var secret = config.secret;
var Log_Level = config.Log_Level

router.get('/side-menu/get', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /side-menu/get Api Called from application.js, " + "Request Headers:" + JSON.stringify(req.headers));

    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var chat = false;
    var loggedInDetails = await User.findById(decoded.user).exec();

    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Facthing Role of the User, User:" + loggedInDetails.name);
    }
    var role = await Management.findOne({ user: decoded.user, business: business })
        .populate({ path: 'business', select: 'name avatar avatar_address contact_no isCarEager uuid business_info' })
        .populate({ path: 'user', select: 'name avatar avatar_address contact_no' })
        .exec();

    if (role) {
        var def = [];
        var main = [];
        var multi = false;

        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Facthing Business Plan of the User, User:" + loggedInDetails.name);
        }
        var plans = await BusinessPlan.find({ business: business }).populate('suite').exec();
        var suite = _.map(plans, 'suite');
        // console.log(suite)
        // return res.json(suite)
        for (var i = 0; i < suite.length; i++) {
            var defaults = suite[i].default;
            for (var j = 0; j < defaults.length; j++) {
                var foundIndex = def.findIndex(x => x.action == defaults[j].action);
                if (foundIndex == -1) {
                    def.push({
                        tag: defaults[j].tag,
                        module: defaults[j].module,
                        action: defaults[j].action,
                        enable: defaults[j].enable,
                        activityTab: defaults[j].activityTab,
                        // icon: "'s3' : 'https://s3.ap-south-1.amazonaws.com/careager/icon/" + defaults[j].tag + ".svg",
                        icon: "../../../assets/sidebar-icon/" + defaults[j].tag + ".png",
                    })
                }
            }

            var serverTime = moment.tz(new Date(), req.headers['tz']);
            var bar = plans[i].created_at;
            bar.setDate(bar.getDate() + plans[i].validity);
            var e = bar;
            bar = moment.tz(bar, req.headers['tz'])

            var baz = bar.diff(serverTime);

            if (baz > 0) {
                var mains = suite[i].main;
                for (var k = 0; k < mains.length; k++) {
                    var foundIndex = main.findIndex(x => x.action == mains[k].action);
                    if (foundIndex >= 0) {
                        main[foundIndex] = {
                            tag: mains[k].tag,
                            module: mains[k].action,
                            action: mains[k].action,
                            enable: mains[k].enable,
                            activityTab: mains[k].activityTab,
                            // icon: "https://careager-staging.s3.ap-south-1.amazonaws.com/icon/" + mains[k].tag + ".svg",
                            icon: "../../../assets/sidebar-icon/" + mains[k].tag + ".png",
                        }
                    }
                    else {
                        main.push({
                            tag: mains[k].tag,
                            module: mains[k].module,
                            action: mains[k].action,
                            enable: mains[k].enable,
                            activityTab: mains[k].activityTab,
                            // icon: "https://careager-staging.s3.ap-south-1.amazonaws.com/icon/" + mains[k].tag + ".svg",
                            icon: "../../../assets/sidebar-icon/" + mains[k].tag + ".png",
                        })
                    }
                }
            }

            if (suite[i].chat == true) {
                chat = true;
            }
        }

        def = _(def).groupBy(x => x.module).map((value, key) => ({ module: key, group: value })).value();
        def = _.orderBy(def, ['plan'], ['asc']);

        main = _(main).groupBy(x => x.module).map((value, key) => ({ module: key, group: value })).value();
        main = _.orderBy(main, ['plan'], ['asc']);

        var business_info = role.business.business_info;

        var manifest = await BusinessSetting.findOne({ business: business }).exec();
        if (manifest == null) {
            manifest = {
                discount_on: "Labour",
                job_inspection_pics_limit: 11,
                qc_inspection_limit: 11,
                skip_insurance_info: true,
                skip_store_approval: true,
                skip_qc: true,
                tax_invoice: true,
                gst_invoice: true,
            };
        }
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Sending Side Menu in Response, User:" + loggedInDetails.name);
        }
        res.status(200).json({
            responseCode: 200,
            responseMessage: "navigation",
            responseData: {
                business: role.business,
                user: role.user,
                navigation: main.concat(def),
                chat: chat,
                manifest: manifest,
                management: {
                    _id: role._id,
                    id: role.id,
                    role: role.role,
                },
                login_type: plans[0].suite.category
            }
        });
        if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("INFO: Side Menu Send In Response Successfully, User:" + loggedInDetails.name);
        }
    }
    else {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR: Unauthorize User, User:" + loggedInDetails);
        }
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Unauthorized",
            responseData: {}
        });
    }
});


router.get('/subsription/details/get', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO:/subsription/details/get Api Called from application.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var pack = null;
    var business_details = null;
    var user = decoded.user;
    var loggedInDetails = await User.findById(decoded.user).exec();
    var businesses = [];
    var Id = req.query.id;
    // console.log("Id=" + Id)
    var business = req.query.id;
    var pack = {}
    // var data = [];
    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }

    var page = Math.max(0, parseInt(page));
    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Facthing Role of the User, User:" + loggedInDetails.name);
    }
    var role = await Management.findOne({ user: user, business: business })
        .populate({ path: 'business', select: 'name avatar avatar_address contact_no isCarEager uuid business_info' })
        .populate({ path: 'user', select: 'name avatar avatar_address contact_no' })
        .exec();

    if (role) {
        var def = [];
        var main = [];
        var multi = false;
        var type = "";
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Facthing Business Plan of the User, User:" + loggedInDetails.name);
        }
        var plans = await BusinessPlan.find({ business: business }).populate('suite').populate('business').exec();
        var suite = _.map(plans, 'suite');
        // console.log(plans[0].created_at)
        // return res.json(plans)
        // console.log("name= " + plans[0].short_name)
        pack = {
            name: plans[0].name,
            short_name: plans[0].short_name,
            // business: role.business,
            type: plans[0].plan,
            price: plans[0].price,
            validity: plans[0].validity,
            updated_at: plans[0].updated_at,
            expired_at: plans[0].expired_at,
            id: plans[0].expired_at,
            category: plans[0].category,
            sold_by: plans[0].sold_by,
            business: plans[0].business,
            created_at: plans[0].created_at,
        }
        // console.log("Business Name = " + plans[0].business.name)
        business_details = {
            name: plans[0].business.name,
            email: plans[0].business.email,
            contact_no: plans[0].business.contact_no,
            address: plans[0].business.address,
            joined_at: plans[0].business.created_at,

        }

        //
        for (var i = 0; i < suite.length; i++) {
            // console.log("Index = " + i)
            type = suite[i].plan
            var defaults = suite[i].default;
            for (var j = 0; j < defaults.length; j++) {
                var foundIndex = def.findIndex(x => x.action == defaults[j].action);
                if (foundIndex == -1) {
                    def.push({
                        tag: defaults[j].tag,
                        module: defaults[j].module,
                        action: defaults[j].action,
                        enable: defaults[j].enable,
                        activityTab: defaults[j].activityTab,
                        icon: "'s3' : 'https://s3.ap-south-1.amazonaws.com/careager/icon/" + defaults[j].tag + ".svg",
                    })
                }
            }

            var serverTime = moment.tz(new Date(), req.headers['tz']);
            var bar = plans[i].created_at;
            bar.setDate(bar.getDate() + plans[i].validity);
            var e = bar;
            bar = moment.tz(bar, req.headers['tz'])

            var baz = bar.diff(serverTime);

            if (baz > 0) {
                var mains = suite[i].main;
                for (var k = 0; k < mains.length; k++) {
                    var foundIndex = main.findIndex(x => x.action == mains[k].action);
                    if (foundIndex >= 0) {
                        main[foundIndex] = {
                            tag: mains[k].tag,
                            module: mains[k].action,
                            action: mains[k].action,
                            enable: mains[k].enable,
                            activityTab: mains[k].activityTab,
                            icon: "https://careager-staging.s3.ap-south-1.amazonaws.com/icon/" + mains[k].tag + ".svg",
                        }
                    }
                    else {
                        main.push({
                            tag: mains[k].tag,
                            module: mains[k].module,
                            action: mains[k].action,
                            enable: mains[k].enable,
                            activityTab: mains[k].activityTab,
                            icon: "https://careager-staging.s3.ap-south-1.amazonaws.com/icon/" + mains[k].tag + ".svg",
                        })
                    }
                }
            }

            if (suite[i].chat == true) {
                chat = true;
            }
        }

        def = _(def).groupBy(x => x.module).map((value, key) => ({ module: key, group: value })).value();
        def = _.orderBy(def, ['plan'], ['asc']);

        main = _(main).groupBy(x => x.module).map((value, key) => ({ module: key, group: value })).value();
        main = _.orderBy(main, ['plan'], ['asc']);

        var business_info = role.business.business_info;

        var manifest = await BusinessSetting.findOne({ business: business }).exec();
        if (manifest == null) {
            manifest = {
                discount_on: "Labour",
                job_inspection_pics_limit: 13,
                skip_insurance_info: false,
                skip_store_approval: true,
                skip_qc: true,
                gst_invoice: true,
            };
        }
        var data = {
            subscription: pack,
            business_details: business_details
            // navigation: main.concat(def),
            // manifest: manifest,

        }
        plans[0].created_at
        res.status(200).json({
            responseCode: 200,
            responseMessage: "Plan Details",
            responseData: data,
        });
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Sending Plan Details for the User, User:" + loggedInDetails.name);
        }
    }
    else {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR: Unauthorize User, User:" + loggedInDetails);
        }
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Unauthorized",
            responseData: {}
        });
    }
});



router.get('/web/notifications/get', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /web/notifications/get Api Called from application.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var loggedInDetails = await User.findById(decoded.user).exec();
    // var role = await User.findById(decoded.user).exec();
    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Facthing Role of the User, User:" + loggedInDetails.name);
    }
    var role = await Management.findOne({ user: decoded.user, business: business }).exec();
    if (role) {
        var userlogged = role.user;
        var notifications = [];
        if (req.query.page == undefined) {
            var page = 0;
        } else {
            var page = req.query.page;
        }
        var page = Math.max(0, parseInt(page));
        var query = {}
        if (role.role == "CRE") {
            query = {
                title: 'New Lead',
                assignee: userlogged
            };
        }
        else if (role.role == 'Service Advisor') {
            var page = Math.max(0, parseInt(page));
            query = {
                title: 'New Booking',
                advisor: userlogged
            }
        }
        else if (role.role == 'Store Manager') {
            var page = Math.max(0, parseInt(page));
            query = {
                title: 'Sales',
                advisor: userlogged
            }
        }

        else {
            query = {

                business: userlogged
            };

        }


        // var counter = await WebNotification.find(query).count().exec()
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Fatching Web Notification for the User, User_Role:" + role.role + ", User:" + loggedInDetails.name);
        }
        await WebNotification.find(query)
            .sort({ created_at: -1 }).limit(config.perPage)
            .skip(config.perPage * page)
            .cursor().eachAsync(async (n) => {
                notifications.push({
                    Id: n._id,
                    business: n.business,
                    name: n.name,
                    contact_no: n.contact_no,
                    type: n.type,
                    source: n._id,
                    leadSource: n.source,
                    title: n.title,
                    body: n.body,
                    isChecked: n.isChecked,
                    status: n.status,
                    created_at: n.created_at
                });
            });
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Sending Web Notification to the User, User_Role:" + role.role + "User:" + loggedInDetails.name);
        }
        var counter = _.filter(notifications, data => data.isChecked == false);
        res.status(200).json({
            responseCode: 200,
            responseMessage: {
                //  totalRead: 
                //  totalUnread:
                counter: counter.length
            },
            responseData: notifications
        });
        if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("INFO: Web Notification Send in Response Successfully, User_Role:" + role.role + "User:" + loggedInDetails.name);
        }
    } else {
        if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
            businessFunctions.logs("WARNING: No Role found for the User, User:" + loggedInDetails.name);
        }
        res.status(422).json({
            responseCode: 422,
            responseMessage: "User not found",
            responseData: {}
        });
    }
});




router.put('/web/notifications/status', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /web/notifications/status Api Called from application.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var loggedInDetails = await User.findById(decoded.user).exec();
    var notifications = [];

    /* await WebNotification.find({})
        .sort({ created_at: -1 }).limit(config.perPage)
        .skip(config.perPage * page)
        .cursor().eachAsync(async (n) => {
            notifications.push({
                name: n.name,
                contact_no: n.contact_no,
                type: n.type,
                source: n._id,
                leadSource: n.source,
                title: n.title,
                body: n.body,
                status: n.status,
                created_at: n.created_at
            });
        }); */
    // await WebNotification.find({status:"Unread"})
    // var  noti = await WebNotification.findById().exec()
    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Fatching Web Notifications, Status:Read, User:" + loggedInDetails.name);
    }
    await WebNotification.findOneAndUpdate({ _id: req.body._id }, { $set: { status: "Read", updated_at: new Date() } });
    //update
    // console.log('------' + notId);
    res.status(200).json({
        responseCode: 200,
        responseMessage: {
            //  totalRead:
            //  totalUnread:
            //  total:
        },
        responseData: notifications
    });
    if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("INFO: Web Notifications send in Response Successfully, Status:Read, User:" + loggedInDetails.name);
    }

});
// web/notifications/checked
router.put('/web/notifications/checked', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /web/notifications/checked Api Called from application.js, " + "Request Headers:" + JSON.stringify(req.headers));

    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var loggedInDetails = await User.findById(decoded.user).exec();
    var notifications = [];
    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Facthing Role of the User, User:" + loggedInDetails.name);
    }
    var role = await Management.findOne({ user: decoded.user, business: business }).exec();
    if (role) {
        var userlogged = role.user;
        var notifications = [];

        var query = {}
        if (role.role == "CRE") {
            query = {
                isChecked: false,
                assignee: userlogged
            };
        }
        else if (role.role == 'Service Advisor') {
            query = {
                isChecked: false,
                advisor: userlogged
            }
        }
        else {
            query = {
                isChecked: false,
                business: userlogged
            };
        }
        // console.log("Query  = " + query)
        var data = await WebNotification.updateMany(query, { $set: { isChecked: true, updated_at: new Date() } }).exec()
        res.status(200).json({
            responseCode: 200,
            responseMessage: {
                //  totalRead:
                //  totalUnread:
                //  total:
            },
            responseData: data
        });
        if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("INFO: Web Notification Details Updated Successfully, User:" + loggedInDetails.name);
        }
    }


});

//  setInterval(() => {







//        // console.log("log out process");

//  }, 10000);






setInterval(() => {


    var tm = new Date();
    let hr = tm.getHours();
    let mi = tm.getMinutes();
    let sec = tm.getSeconds();
    // console.log(hr + "-" + mi);

    //8 AM Daily to Cre about follow-ups
    if (hr == 7 && mi >= 59) {



        let date = new Date();
        let from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1)
        let to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 2)

        // //todo via whatsapp..
        // Lead.find({ 'follow_up.date': { $gte: from, $lte: to } }).cursor().eachAsync(async (l) => {


        //     whatsAppEvent.FollowUpReminder(l._id);


        // });

        //todo into bell icon..
        var management = Management.find({ role: 'CRE' }).cursor().eachAsync((m) => {



            var activity = "FollowUp"
            fun.webNotification(activity, m)

        });

        //todo reminder to advisor every 8 AM daily..

        var bookingData = Booking.find({ date: { $gte: from, $lte: to }, }).cursor().eachAsync(async (b) => {



            await whatsAppEvent.advisorBookingReminderToday(b._id);



        });


        var management = Management.find({ role: 'Service Advisor' }).cursor().eachAsync((m) => {

            var activity = "TodayBooking"
            fun.webNotification(activity, m)



        });






    }
    // 6pm daily...to cumtomer and Advisor Booking Reminder.
    else if (hr == 17 && mi >= 59) {
        let date = new Date();
        let from = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
        let to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 2)

        var bookingData = Booking.find({ date: { $gte: from, $lte: to }, }).cursor().eachAsync(async (b) => {


            await whatsAppEvent.customerBookingRemnder(b._id);
            await whatsAppEvent.advisorBookingReminder(b._id);



        });

        var management = Management.find({ role: 'Service Advisor' }).cursor().eachAsync((m) => {

            var activity = "ConfirmedBooking"
            fun.webNotification(activity, m)


        });



    }

}, 50000);




module.exports = router