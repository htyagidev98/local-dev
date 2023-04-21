var mongoose = require('mongoose'),
    express = require('express'),
    router = express.Router(),
    config = require('../../../../config'),
    businessFunctions = require('../../businessFunctions'),
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
// redis = require("redis");
const whatsappEvent = require('../../../whatsapp/whatsappEvent')


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
const whatsAppEvent = require('../../../whatsapp/whatsappEvent')
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
const { updateMany } = require('../../../../models/user');
const { filter, rangeRight } = require('lodash');



var secret = config.secret;
var Log_Level = config.Log_Level

router.get('/quotations/order/list', async (req, res, next) => {
    businessFunctions.logs("INFO: /quotations/order/list Api Called from quotation-service.js," + " " + "Request Headers:" + JSON.stringify(req.headers));

    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var loggedInDetails = await User.findById(decoded.user).exec();
    let quotArr = []
    let obj = {}
    let orderData = []


    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Fatching Quotation Order List, User:" + loggedInDetails.name);
    }
    let requested = await VendorOrders.find({ business: mongoose.Types.ObjectId(business), status: { $in: ['Requested', 'created'] } })
        .populate({ path: "car", select: "vin title manufacture_year" })
        .populate({ path: "vendor" })

        .exec()


    let totalQuotation = await VendorOrders.find({ business: mongoose.Types.ObjectId(business), quotationStatus: 'Price Updated' })

    /*let confirmed = await QuotationOrders.find({ business: mongoose.Types.ObjectId(business), status: 'Confirmed' })
        .populate({ path: "car", select: "vin title manufacture_year" })
        .exec()*/
    let received = await VendorOrders.find({ business: mongoose.Types.ObjectId(business), status: 'Received' })
        .populate({ path: "car", select: "vin title manufacture_year" })
        .exec()


    let confirmed = await VendorOrders.find({ business: mongoose.Types.ObjectId(business), status: "confirmed" })
        .populate({ path: "car", select: "vin title manufacture_year" })
        .exec()


    // console.log("requested = " + requested.length)
    // console.log("received = " + received.length)
    // console.log("confirmed = " + confirmed.length)
    // console.log("requested = "+)
    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Sending Quotation Order List  in Response, User:" + loggedInDetails.name);
    }
    res.json({
        requested: requested,
        received: received,
        confirmed: confirmed,
        totalQuotations: totalQuotation.length
    })
    if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("INFO: Quotation Order List Send in Response Successfully, User:" + loggedInDetails.name);
    }
})



router.get('/quotations/logs', async (req, res, next) => {
    businessFunctions.logs("INFO: /quotations/logs Api Called from quotation-service.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var loggedInDetails = await User.findById(decoded.user).exec();
    let status = req.query.status
    let booking = req.query.booking
    // console.log("bookings get", status, booking)
    let orderLogs = {}
    let vendors = []
    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Fatching Quotation Logs, Status:" + status + ", " + "Booking:" + booking + ", " + "User:" + localStorage.name);
    }
    let logs = await OrderLogs.find({ booking: mongoose.Types.ObjectId(booking) }).exec()



    res.status(200).json({
        responseCode: "200",
        logs: logs,
        log: status
    })
    if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("INFO: Logs Send in Response Successfully, User:" + loggedInDetails.name);
    }
})

router.put('/order/change/state', async (req, res, next) => {
    businessFunctions.logs("INFO: /order/change/state  Api Called from quotation-service.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

    let orderId = req.body.order_id
    let status = req.body.status
    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Changing Order Status, OrderId:" + orderId + ", " + "Status:" + status);
    }
    let order = await QuotationOrders.findOne({ booking: orderId }).exec()
    order.status = status
    order.updated_at = new Date()
    await order.save()
    res.json({
        message: "Order " + status
    });
    if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("INFO: Order Status Cahnge Successfully, OrderId:" + orderId + ", " + "Status:" + status);
    }

});

router.delete('/remove/supplier', async (req, res, next) => {
    let vendor = req.query.vendor;
    let booking = req.query.booking

    await VendorOrders.findOneAndDelete({
        booking: mongoose.Types.ObjectId(booking),
        shop_name: vendor
    }).exec()



    res.json({
        responseCode: "200",
        message: "Supplier Deleted"
    })

});

// vinay code

router.get('/bookings/quotations/list', async (req, res, next) => {
    businessFunctions.logs("INFO: /bookings/quotations/list Api Called from quotation-service.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    let booking = req.query.booking
    let vendor = req.query.vendor
    let quotation = req.query.quotation
    // console.log("Booking", quotation, booking)
    let quotations = undefined
    if (booking == "null") {
        booking = "undefined"
    }
    if (booking != "undefined") {
        quotations = await VendorOrders.findOne({
            booking: mongoose.Types.ObjectId(booking),
            _id: mongoose.Types.ObjectId(vendor)
        })
            .populate({ path: 'car', select: 'vin title manufacture_year registration_no' })
            .populate({ path: 'quotation', select: 'created_at order_no' })
            .populate({ path: "vendor" })
            .exec()
    } else {
        quotations = await VendorOrders.findOne({
            quotation: mongoose.Types.ObjectId(quotation),
            _id: mongoose.Types.ObjectId(vendor)
        })
            .populate({ path: 'quotation', select: 'created_at order_no' })
            .populate({ path: "vendor" })
            .exec()
    }

    if (!vendor) {
        // console.log("Vendor not available")
        if (booking != "undefined") {
            quotations = await VendorOrders.find({ booking: mongoose.Types.ObjectId(booking) })
                .populate({ path: 'car', select: 'vin title manufacture_year registration_no' })
                .populate({ path: 'quotation', select: 'created_at order_no' })
                .populate({ path: "vendor" })
                .exec()
            for (let i = 0; i < quotations.length; i++) {
                // console.log("Date", moment(quotations[i].quotation.created_at).tz(req.headers['tz']).format('lll'))
                quotations[i].quotation.created_at = moment(quotations[i].quotation.created_at).tz(req.headers['tz']).format('lll')
            }
        } else {
            quotations = await VendorOrders.find({ quotation: mongoose.Types.ObjectId(quotation) })
                .populate({ path: 'quotation', select: 'created_at order_no' })
                .populate({ path: "vendor" })
                .exec()
            for (let i = 0; i < quotations.length; i++) {
                // console.log("Date", moment(quotations[i].quotation.created_at).tz(req.headers['tz']).format('lll'))
                quotations[i].quotation.created_at = moment(quotations[i].quotation.created_at).tz(req.headers['tz']).format('lll')
            }
        }

    }

    let purchaseLogs = await PurchaseOrderLogs.find({ order: mongoose.Types.ObjectId(quotation) }).exec()

    res.json({
        logs: purchaseLogs,
        quotations: quotations
    })
    if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("INFO: Booking Quotation List send in response Successfully.");
    }
});


router.delete('/remove/supplier', async (req, res, next) => {
    businessFunctions.logs("INFO: /remove/supplier Api Called from quotation-service.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    let vendor = req.query.vendor;
    let booking = req.query.booking
    let quotation = req.query.quotation
    // console.log("Booking..", booking, quotation)
    if (booking == "!null") {
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Deleting Supplier from the quotation, QuotationId:" + quotation);
        }
        await VendorOrders.findOneAndDelete({
            booking: mongoose.Types.ObjectId(booking),
            shop_name: vendor
        }).exec()
    } else {
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Deleting Supplier from the quotation, QuotationId:" + quotation);
        }
        await VendorOrders.findOneAndDelete({
            quotation: mongoose.Types.ObjectId(quotation),
            shop_name: vendor
        }).exec()
    }

    res.json({
        responseCode: "200",
        message: "Supplier Deleted"
    })
    if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("INFO: Supplier Deleted Successfully, Supplier:" + vendor);
    }

});

router.put('/purchase/order/update', async (req, res, next) => {
    businessFunctions.logs("INFO: /purchase/order/update Api Called from quotation-service.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

    let parts = req.body.parts
    let quotation = req.body.quotationId
    var business = req.headers['business'];
    let orderArray = []
    // console.log("Quotation", quotation)


    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Add New Parts Purchase Order, QuotationId:" + quotation);
    }
    let order = await VendorOrders.findOne({ _id: mongoose.Types.ObjectId(quotation) }).exec()
    let orderLine = await OrderLine.find({ order: mongoose.Types.ObjectId(order.order) }).exec()
    let items = await createPartsTax(parts, order.vendor, order.order)

    // console.log("All Parts..", items)

    order.parts = items.items
    order.markModified("parts")
    await order.save()

    order.parts = items.newItems
    orderArray.push(order)

    res.json({
        message: "Parts are updated.",
        order: orderArray
    })
    if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("INFO: Parts are updated Successfully, QuotationId:" + quotation);
    }
})

router.put('/quotation/cancel', async (req, res, next) => {
    businessFunctions.logs("INFO: /quotation/cancel Api Called from quotation-service.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

    let quotation = req.body.quotation
    VendorOrders.findOneAndUpdate({ _id: mongoose.Types.ObjectId(quotation) }, { status: 'cancelled' }, (err, doc) => {
        if (err) {
            if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                businessFunctions.logs("ERROR: Server Error Occured while cancel the order, QuotationId:" + req.body.quotation);
            }

            return res.json({
                message: "Some server error occur."
            })
        } else {
            return res.json({
                message: "Order cancelled."
            })
            if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("INFO: Order Cancelled Successfully, QuotationId:" + req.body.quotation);
            }
        }
    })
})
//Abhinav Tyagi

router.get('/quotations/list/get', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /quotations/list/get Api Called from quotation-service.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var business = req.headers['business'];
    var user = await User.findById(decoded.user).exec();


    var quotations = [];
    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }

    if (req.query.limit) {
        var limit = parseInt(req.query.limit);
    } else {
        var limit = 20;
    }
    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Fatching Quotation Orders List, User:" + user.name);
    }
    // var quotation_no = { $ne: null }
    // if (req.query.query) {
    //     quotation_no = req.query.query
    // }
    await QuotationOrders.find({ business: business, status: { $in: ['Requested', 'created', 'Confirmed'] } })
        .sort({ created_at: -1 })
        .skip(limit * page).limit(limit)
        .cursor().eachAsync(async (p) => {

            var order = await VendorOrders.find({ quotation: p._id }).populate({ path: 'vendor', select: 'name contact_no' }).select('parts vendor').exec()

            vendorsName = []
            order.forEach(data => {
                vendorsName.push(data.vendor.name)

            })
            var parts_length = 0
            if (order) {
                if (order.length > 0) {
                    var parts_length = order[0].parts.length
                }
                var order = order
            }
            quotations.push({
                _id: p._id,
                id: p._id,
                booking: p.booking,
                car: p.car,
                vendors: p.vendors,
                totalParts: parts_length,
                order: order,
                order_no: p.order_no,
                quotation_no: p.quotation_no,
                status: p.status,
                quotation_submitted: p.quotation_submitted,
                quotation_received: p.quotation_received,
                vendorsName: vendorsName,
                created_at: p.created_at,
                updated_at: p.updated_at,

            });
        });
    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Sending Quotation Listin Response, User:" + user.name);
    }

    // console.log("Length  = " + quotations.length)
    res.status(200).json({
        responseCode: 200,
        responseMessage: "Sucesss",
        responseInfo: {
            totalResult: await QuotationOrders.find({ business: business, status: { $in: ['Requested', 'created', 'Confirmed'] } }).count().exec()
        },
        responseData: {
            quotations: quotations
        }
    });
    if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("INFO: Quotation List Send in Response Successfully, User:" + user.name);
    }


});

router.get('/open/order/list/get', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /open/order/list/get Api Called from quotation-service.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var business = req.headers['business'];
    var user = await User.findById(decoded.user).exec();


    var orders = [];
    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }

    if (req.query.limit) {
        var limit = parseInt(req.query.limit);
    } else {
        var limit = 20;
    }
    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Fatching Open Orders List, User:" + user.name);
    }
    await VendorOrders.find({ business: business, order_status: { $in: ['Open'] } })
        .populate({ path: 'vendor', select: 'name contact_no' })
        .populate('quotation')
        .sort({ created_at: -1 })
        .skip(limit * page).limit(limit)
        .cursor().eachAsync(async (order) => {
            orders.push({
                _id: order._id,
                id: order._id,
                vendor: order.vendor,
                booking: order.booking,
                car: order.car,
                isVerified: order.isVerified,
                request_date: order.request_date,
                order_no: order.order_no,
                status: order.status,
                order_status: order.order_status,
                partsLength: order.parts.length,
                total_amount: order.total_amount,
                created_at: order.created_at,
                updated_at: order.updated_at,
            });
        });
    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Sending Open Orders List In Response, User:" + user.name);
    }
    // console.log("Length  = " + orders.length)
    res.status(200).json({
        responseCode: 200,
        responseMessage: "Sucesss",
        responseInfo: {
            totalResult: await VendorOrders.find({ business: business, order_status: { $in: ['Open'] } }).count().exec()
        },
        responseData: {
            orders: orders
        }
    });
    if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("INFO: Open Orders List send in Response successfully, User:" + user.name);
    }


});

router.get('/received/order/list/get', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /received/order/list/get Api Called from quotation-service.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var business = req.headers['business'];
    var user = await User.findById(decoded.user).exec();
    var orders = [];
    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }

    if (req.query.limit) {
        var limit = parseInt(req.query.limit);
    } else {
        var limit = 10;
    }
    // console.log("Page = " + page)
    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Fatching Received Orders List, User:" + user.name);
    }
    await VendorOrders.find({ business: business, order_status: 'Received' })
        .populate({ path: 'vendor', select: 'name contact_no' })
        .populate('quotation')
        .sort({ created_at: -1 })
        .skip(limit * page).limit(limit)
        .cursor().eachAsync(async (order) => {
            orders.push({
                _id: order._id,
                id: order._id,
                vendor: order.vendor,
                booking: order.booking,
                car: order.car,
                isVerified: order.isVerified,
                request_date: order.request_date,
                order_no: order.order_no,
                status: order.status,
                order_status: order.order_status,
                partsLength: order.parts.length,
                total_amount: order.total_amount,
                created_at: order.created_at,
                updated_at: order.updated_at,
            });
        });
    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Sending Received Orders List In Response, User:" + user.name);
    }
    // console.log("Length  = " + orders.length)
    res.status(200).json({
        responseCode: 200,
        responseMessage: "Sucesss",
        responseInfo: {
            totalResult: await VendorOrders.find({ business: business, order_status: 'Received' }).count().exec()
        },
        responseData: {
            orders: orders
        }
    });
    if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("INFO: Received Orders List send in Response successfully, User:" + user.name);
    }
});
router.get('/cancelled/order/list/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var business = req.headers['business'];
    var orders = [];
    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }

    if (req.query.limit) {
        var limit = parseInt(req.query.limit);
    } else {
        var limit = 10;
    }
    // console.log("Page = " + page)
    await VendorOrders.find({ business: business, order_status: 'Cancelled' })
        .populate({ path: 'vendor', select: 'name contact_no' })
        .populate('quotation')
        .sort({ created_at: -1 })
        .skip(limit * page).limit(limit)
        .cursor().eachAsync(async (order) => {
            orders.push({
                _id: order._id,
                id: order._id,
                vendor: order.vendor,
                booking: order.booking,
                car: order.car,
                isVerified: order.isVerified,
                request_date: order.request_date,
                order_no: order.order_no,
                status: order.status,
                order_status: order.order_status,
                partsLength: order.parts.length,
                total_amount: order.total_amount,
                created_at: order.created_at,
                updated_at: order.updated_at,
            });
        });
    // console.log("Length  = " + orders.length)
    res.status(200).json({
        responseCode: 200,
        responseMessage: "Sucesss",
        responseInfo: {
            totalResult: await VendorOrders.find({ business: business, order_status: 'Cancelled' }).count().exec()
        },
        responseData: {
            orders: orders
        }
    });


});
// vendor/order/search

//19-10-21: Abhinav Order Search
router.get('/vendor/order/search', xAccessToken.token, async function (req, res, next) {
    // console.log("Order Search AAPI ")
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
        localField: "vendor",
        foreignField: "_id",
        as: "vendor",
    };
    filters.push(specification);
    var specification = {};
    specification['$unwind'] = {
        path: "$vendor",
        preserveNullAndEmptyArrays: false
    };
    filters.push(specification);

    // var specification = {};
    // specification['$lookup'] = {
    //     from: "Car",
    //     localField: "car",
    //     foreignField: "_id",
    //     as: "car",
    // };
    // filters.push(specification);

    /*var specification = {};
    specification['$unwind']= {
        path: "$car",
        preserveNullAndEmptyArrays : false
    };
    filters.push(specification);*/

    var specification = {};
    specification['$lookup'] = {
        from: "QuotationOrders",
        localField: "quotation",
        foreignField: "_id",
        as: "quotation",
    };
    filters.push(specification);
    var specification = {};
    specification['$unwind'] = {
        path: "$quotation",
        preserveNullAndEmptyArrays: false
    };
    var page = 0;

    if (req.query.page == undefined) {
        page = 0;
    }
    else {
        page = req.query.page;
    }
    var page = Math.max(0, parseInt(page));

    if (req.query.query) {
        req.query.query = req.query.query.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
        // category: { $in: [req.query.category] },
        var specification = {};
        specification['$match'] = {
            business: mongoose.Types.ObjectId(business),
            $or: [
                { 'vendor.name': { $regex: req.query.query, $options: 'i' } },
                { 'vendor.contact_no': { $regex: req.query.query, $options: 'i' } },
                // { 'car.title': { $regex: req.query.query, $options: 'i' } },
                // { 'car.registration_no': { $regex: req.query.query, $options: 'i' } },
                { 'order_no': { $regex: req.query.query, $options: 'i' } },

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
    totalResult = await VendorOrders.aggregate(filters);

    // console.log("Total Result - - - = " + totalResult.length)
    var specification = {};
    specification['$skip'] = config.perPage * page;
    filters.push(specification);

    var specification = {};
    specification['$limit'] = config.perPage;
    filters.push(specification);
    var orders = []
    await VendorOrders.aggregate(filters)
        .allowDiskUse(true)
        .cursor({ batchSize: 10 })
        .exec()
        .eachAsync(async function (order) {
            orders.push({
                _id: order._id,
                id: order._id,
                vendor: order.vendor,
                booking: order.booking,
                car: order.car,
                isVerified: order.isVerified,
                request_date: order.request_date,
                order_no: order.order_no,
                status: order.status,
                order_status: order.order_status,
                partsLength: order.parts.length,
                total_amount: order.total_amount,
                created_at: order.created_at,
                updated_at: order.updated_at,
            });
        });

    res.status(200).json({
        responseCode: 200,
        responseMessage: "Success",
        // responseInfo: {
        //     filters: filters,
        //     // totalResult: totalResult.length
        // },
        responseData: orders,
    });
});
router.get('/quotation/search', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /quotation/search Api Called from quotation-service.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    // console.log("Order Search AAPI ")
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var filters = [];
    var date = new Date();
    var to = new Date();
    to.setDate(date.getDate() - 1);
    to.setHours(23, 59, 58)
    var specification = {};
    specification['$lookup'] = {
        from: "User",
        localField: "vendor",
        foreignField: "_id",
        as: "vendor",
    };
    filters.push(specification);
    var specification = {};
    specification['$unwind'] = {
        path: "$vendor",
        preserveNullAndEmptyArrays: false
    };
    filters.push(specification);

    // var specification = {};
    // specification['$lookup'] = {
    //     from: "Car",
    //     localField: "car",
    //     foreignField: "_id",
    //     as: "car",
    // };
    // filters.push(specification);

    /*var specification = {};
    specification['$unwind']= {
        path: "$car",
        preserveNullAndEmptyArrays : false
    };
    filters.push(specification);*/

    var specification = {};
    specification['$lookup'] = {
        from: "QuotationOrders",
        localField: "quotation",
        foreignField: "_id",
        as: "quotation",
    };
    filters.push(specification);
    var specification = {};
    specification['$unwind'] = {
        path: "$quotation",
        preserveNullAndEmptyArrays: false
    };
    var page = 0;
    if (req.query.page == undefined) {
        page = 0;
    }
    else {
        page = req.query.page;
    }
    var page = Math.max(0, parseInt(page));

    if (req.query.query) {

        var specification = {};
        specification['$match'] = {
            "quotation": { $ne: [] },
        }
        filters.push(specification);

        console.log("Query = " + req.query.query)
        req.query.query = req.query.query.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
        // category: { $in: [req.query.category] },
        var specification = {};
        specification['$match'] = {
            // 'quotation': { $ne: null },
            business: mongoose.Types.ObjectId(business),

            // status: { $in: ['Requested', 'created', 'Confirmed'] },
            $or: [
                { 'vendor.name': { $regex: req.query.query, $options: 'i' } },
                { 'vendor.contact_no': { $regex: req.query.query, $options: 'i' } },
                // { 'car.title': { $regex: req.query.query, $options: 'i' } },
                // { 'car.registration_no': { $regex: req.query.query, $options: 'i' } },
                // { 'vendor.quotation.quotation_no': { $regex: req.query.query, $options: 'i' } },
                // { 'order_no': { $regex: req.query.query, $options: 'i' } },

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
    totalResult = await VendorOrders.aggregate(filters);

    console.log("Total Result - - - = " + totalResult.length)
    var specification = {};
    // specification['$skip'] = config.perPage * page;
    specification['$skip'] = 25 * 0;
    filters.push(specification);

    var specification = {};
    // specification['$limit'] = config.perPage;
    specification['$limit'] = 25;
    filters.push(specification);
    var quotations = []
    await VendorOrders.aggregate(filters)
        .allowDiskUse(true)
        .cursor({ batchSize: 25 })
        .exec()
        .eachAsync(async function (quotationOrder) {
            var order = await VendorOrders.find({ quotation: quotationOrder.quotation }).populate({ path: 'vendor', select: 'name contact_no' }).select('parts vendor').exec()


            var quotation = await QuotationOrders.findOne({ _id: quotationOrder.quotation }).exec()
            // var order = await VendorOrders.find({ quotation: p._id }).populate({ path: 'vendor', select: 'name contact_no' }).select('parts vendor').exec()
            vendorsName = []
            order.forEach(data => {
                vendorsName.push(data.vendor.name)
            });

            if (quotation) {
                quotations.push({
                    _id: quotation._id,
                    id: quotation._id,
                    booking: quotation.booking,
                    car: quotation.car,
                    vendors: quotation.vendors,
                    totalParts: order[0].parts.length,
                    // order: order,
                    order_no: quotation.order_no,
                    status: quotation.status,
                    quotation_submitted: quotation.quotation_submitted,
                    quotation_received: quotation.quotation_received,
                    vendorsName: vendorsName,
                    created_at: quotation.created_at,
                    updated_at: quotation.updated_at,
                });
            }
            // console.log("Quotation =  " + quotationOrder.quotation + "   QUERY = " + JSON.stringify(quotationOrder, null, '\t'))

        });
    quotations = await q.all(businessFunctions.removeDublicateDoumnets(quotations, "order_no"));
    res.status(200).json({
        responseCode: 200,
        responseMessage: "Success",
        responseInfo: {
            // filters: filters,
            totalResult: totalResult.length
        },
        responseData: {
            quotations: quotations
        }
    });
});
// quotation/details/get
router.get('/quotation/info/get', async (req, res, next) => {
    console.log("API Called WEB ")
    businessFunctions.logs("INFO: /quotation/info/get Api Called from quotation-service.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    // var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    // var decoded = jwt.verify(token, secret);
    // var user = decoded.user;
    // var loggedInDetails = await User.findById(decoded.user).exec();
    let booking = req.query.booking
    let vendor = req.query.vendor
    let quotation = req.query.quotation
    console.log("API Called WEB ")
    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Fatching Quotation Details, QuotationId:" + quotation + ", " + "User:" + loggedInDetails.name)
    }
    var quotationDetails = await VendorOrders.find({ quotation: quotation, business: business })
        .populate({ path: 'quotation', select: 'created_at order_no' })
        .populate({ path: "vendor" })
        .exec();
    if (quotationDetails.length > 0) {
        for (let i = 0; i < quotationDetails.length; i++) {
            // console.log("Date", moment(quotationDetails[i].quotation.created_at).tz(req.headers['tz']).format('lll'))
            quotationDetails[i].quotation.created_at = moment(quotationDetails[i].quotation.created_at).tz(req.headers['tz']).format('lll')
            if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("DEBUG: Sending Quotation Details in Response, QuotationId:" + quotation + ", " + ", " + "User:" + loggedInDetails.name)
            }

        }
        res.status(200).json({
            responseCode: 200,
            responseMessage: "Success",
            responseData: {
                quotation: quotationDetails,
                quotationOrder: await QuotationOrders.findById(quotation).exec()
            },
        });
        if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("INFO: Quotation Details send in Response Successfully, QuotationId:" + quotation + ", " + "User:" + loggedInDetails.name);
        }
    } else {
        if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
            businessFunctions.logs("WARNING: Quotation not found, QuotationId:" + quotation + ", " + "User:" + loggedInDetails.name);
        }
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Quotation not found",
            responseData: {

            }
        });
    }
})
// router.get('/quotation/info/get', async (req, res, next) => {
//     var token = req.headers['x-access-token'];
//     var business = req.headers['business'];
//     var secret = config.secret;
//     var decoded = jwt.verify(token, secret);
//     var user = decoded.user;
//     let booking = req.query.booking
//     let vendor = req.query.vendor
//     let quotation = req.query.quotation

//     const searchTerm = quotation;
//     try {
//         client.get(searchTerm, async (err, quotations) => {
//             if (err) throw err;

//             if (quotations) {
//                 res.status(200).json({
//                     responseCode: 200,
//                     responseMessage: "Success Cache Data",
//                     responseData: JSON.parse(quotations),
//                 });
//             }
//             else {
//                 var quotationDetails = await VendorOrders.find({ quotation: quotation, business: business })
//                     .populate({ path: 'quotation', select: 'created_at order_no' })
//                     .populate({ path: "vendor" })
//                     .exec();
//                 if (quotationDetails.length > 0) {
//                     for (let i = 0; i < quotationDetails.length; i++) {
//                         // console.log("Date", moment(quotationDetails[i].quotation.created_at).tz(req.headers['tz']).format('lll'))
//                         quotationDetails[i].quotation.created_at = moment(quotationDetails[i].quotation.created_at).tz(req.headers['tz']).format('lll')
//                     }

//                     var responseData = {
//                         quotation: quotationDetails,
//                         quotationOrder: await QuotationOrders.findById(quotation).exec()
//                     }
//                     client.setex(searchTerm, 600, JSON.stringify(responseData));

//                     res.status(200).json({
//                         responseCode: 200,
//                         responseMessage: "Success Cache Miss",
//                         responseData: responseData,
//                     });
//                 } else {
//                     res.status(422).json({
//                         responseCode: 422,
//                         responseMessage: "Quotation not found",
//                         responseData: {

//                         }
//                     });
//                 }









//                 // client.setex(searchTerm, 600, JSON.stringify(jobs.data));
//                 // res.status(200).send({
//                 //     jobs: jobs.data,
//                 //     message: "cache miss"
//                 // });
//             }
//         });
//     } catch (err) {
//         res.status(500).send({ message: err.message });
//     }











//     // res.json({
//     //     logs: {},
//     //     quotations: quotations
//     // })
// })
router.get('/vendor/order/remark/add', async (req, res, next) => {
    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var loggedInDetails = await User.findById(user).exec();

    var vendorOrder = await VendorOrders.findOne({ _id: orderId, business: business }).exec();
    if (vendorOrder) {

        // vendorOrder.remark = req.body.remark;
        // vendorOrder.updated_at = new Date();
        // await vendorOrder.save();
        // var activity = {
        //     business: business,
        //     activity_by: loggedInDetails.name,
        //     activity: "Address Updated",
        //     // time: new Date().getTime.toLocaleTimeString(),
        //     remark: "",
        //     created_at: new Date(),
        // }
        // businessFunctions.vendorOrderLogs(vendorOrder._id, activity);

        // res.status(200).json({
        //     responseCode: 200,
        //     responseMessage: "Remark Added Successfully",
        //     responseData: {
        //         // quotation: quotationDetails,
        //         // quotationOrder: await QuotationOrders.findById(quotation).exec()
        //     },
        // });
        //Abhinav New Try
        await VendorOrders.findOneAndUpdate({ _id: vendorOrder._id }, { $set: { remark: req.body.remark, updated_at: new Date() } }, { new: true }, async function (err, doc) {
            if (err) {
                res.status(422).json({
                    responseCode: 422,
                    responseMessage: "Server Error",
                    responseData: err
                });
            }
            else {

                var activity = {
                    business: business,
                    activity_by: loggedInDetails.name,
                    activity: "Remark addedd: " + req.body.remark,
                    // time: new Date().getTime.toLocaleTimeString(),
                    remark: req.body.remark,
                    created_at: new Date(),
                }
                // console.log("Activity")
                businessFunctions.vendorOrderLogs(order._id, activity);

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Remark Added Successfully",
                    responseData: {

                    }
                });
            }
        });
        //
    } else {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Order not found",
            responseData: {

            }
        });
    }

})


router.put('/vendor/quotation/request', async (req, res, next) => {
    businessFunctions.logs("INFO: /vendor/quotation/request Api Called from quotation-service.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var loggedInDetails = await User.findById(decoded.user).exec();
    var selectedData = req.body.data;
    var quotationOrders = []

    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Fatching Quotation Details, QuotationId:" + quotation + ", " + "User:" + loggedInDetails.name)
    }
    var quotation = await QuotationOrders.findById(req.body.quotation).exec();
    if (quotation) {
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Fatching Vendors for the Quotation, QuotationId:" + req.body.quotation + ", " + "User:" + loggedInDetails.name);
        }
        await VendorOrders.find({ quotation: quotation._id })
            .cursor()
            .eachAsync(async (order) => {
                quotationOrders.push(order);
                var currentOrderData = selectedData.filter(x => x.orderId == order._id);
                var vendorOrder = await VendorOrders.findById(order._id).exec();
                if (vendorOrder) {
                    for (var i = 0; i < currentOrderData.length; i++) {
                        // console.log("Data = " + JSON.stringify(currentOrderData[i]) + "\n")
                        var details = currentOrderData[i];
                        vendorOrder.parts[details.partIndex].item = details.itemInputDetails.item;
                        vendorOrder.parts[details.partIndex].part_no = details.itemInputDetails.part_no;
                        vendorOrder.parts[details.partIndex].quantity = details.itemInputDetails.quantity;
                        vendorOrder.parts[details.partIndex].status = "requested";
                        vendorOrder.parts[details.partIndex].isChecked = true;
                        // console.log("Sumit"+ vendorOrder._id);
                        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                            businessFunctions.logs("DEBUG: whatsappEvent.partsRequest(vendorDetail._id, business) function calles from whatappEvent.js" + ", " + "User:" + loggedInDetails.name)
                        }
                        whatsappEvent.partsRequest(vendorOrder._id, business);
                        var activity = 'Quotation Request'
                        fun.webNotification(activity, vendorOrder);
                        event.requestParts(vendorOrder._id,);
                    }
                    vendorOrder.status = "Requested";
                    vendorOrder.updated_at = new Date();
                    vendorOrder.request_date = new Date();

                    vendorOrder.markModified('parts');
                    vendorOrder.save();
                }

            })
        var vendorDetail = await VendorOrders.findOne({ quotation: quotation._id }).exec();




        //  



        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Sending Quotation Vendors Details in Response, QuotationId:" + req.body.quotation + ", " + "User:" + loggedInDetails.name)
        }
        res.status(200).json({
            responseCode: 200,
            responseMessage: "Success",
            responseData: {
                quotation: await VendorOrders.find({ quotation: quotation._id }).exec(),
                quotationId: quotation._id
            },

        });
    } else {
        if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
            businessFunctions.logs("WARNING: Quotation not found, QuotationId:" + quotation + ", " + "User:" + loggedInDetails.name);
        }
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Quotation not found",
            responseData: {
            }
        });
    }
});

router.put('/quotation/order/confirmation', async (req, res, next) => {
    businessFunctions.logs("INFO:/quotation/order/confirmation Api Called from quotation-service.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var loggedInDetails = await User.findById(decoded.user).exec();
    var selectedData = req.body.data;
    var quotationOrders = []

    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Fatching Quotation Details, QuotationId:" + req.body.quotationId + ", " + "User:" + loggedInDetails.name)
    }
    var quotation = await QuotationOrders.findById(req.body.quotationId).exec();
    if (quotation) {
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Fatching Vendors Details, QuotationId:" + req.body.quotationId + ", " + "User:" + loggedInDetails.name)
        }
        await VendorOrders.find({ quotation: quotation._id })
            .cursor()
            .eachAsync(async (order) => {
                quotationOrders.push(order);
                // console.log("Ordert Id = " + order._id)
                var currentOrderData = selectedData.filter(x => x.orderId == order._id);
                // console.log("Ordert length = " + currentOrderData.length)
                var vendorOrder = await VendorOrders.findById(order._id).exec();
                if (vendorOrder) {
                    for (var i = 0; i < currentOrderData.length; i++) {
                        // console.log("Data = " + JSON.stringify(currentOrderData[i]) + "\n")
                        var details = currentOrderData[i];
                        vendorOrder.parts[details.partIndex].item = details.itemInputDetails.item;
                        vendorOrder.parts[details.partIndex].part_no = details.itemInputDetails.part_no;
                        vendorOrder.parts[details.partIndex].quantity = details.itemInputDetails.quantity;
                        vendorOrder.parts[details.partIndex].status = "confirmed";
                        vendorOrder.parts[details.partIndex].sentDate = new Date()
                        vendorOrder.status = "Confirmed";
                        vendorOrder.updated_at = new Date();
                    }
                    // console.log("Sletected Length = " + currentOrderData.length)
                    vendorOrder.markModified('parts');
                    await vendorOrder.save();
                } else {
                    // console.log("Vendors = " + vendorOrder._id)
                }
            })
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Sending Quotation Vendors Details in Response, QuotationId:" + req.body.quotationId + ", " + "User:" + loggedInDetails.name)
        }
        res.status(200).json({
            responseCode: 200,
            responseMessage: "Success",
            responseData: {
                quotation: await VendorOrders.find({ quotation: quotation._id }).exec(),
                quotationId: quotation._id,
            },

        });



    } else {
        if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
            businessFunctions.logs("WARNING: Quotation not found, QuotationId:" + req.body.quotationId + ", " + "User:" + loggedInDetails.name);
        }
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Quotation not found",
            responseData: {
            }
        });
    }
    // res.json({
    //     logs: {},
    //     quotations: quotations
    // })
});
router.put('/quotation/order/cancel/confirmation', async (req, res, next) => {
    businessFunctions.logs("INFO: /quotation/order/cancel/confirmation Api Called from quotation-service.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var loggedInDetails = await User.findById(decoded.user).exec();
    console
    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Fatching Quotation Details, QuotationId:" + req.body.quotationId + ", " + "User:" + loggedInDetails.name);
    }
    var quotation = await QuotationOrders.findById(req.body.quotationId).exec();
    // console.log("Quotation ID =")
    if (quotation) {
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Fatching Vendors Details from the Quotation is Requested and Mark Status as Confirmation, QuotationId:" + quotation._id + ", " + "User:" + loggedInDetails.name);
        }
        await VendorOrders.find({ quotation: quotation._id })
            .cursor()
            .eachAsync(async (order) => {
                // console.log("Order Id = " + order._id)
                var vendorOrder = await VendorOrders.findById(order._id).exec();
                if (vendorOrder) {
                    for (var i = 0; i < vendorOrder.parts.length; i++) {
                        // console.log("tOATL pARTS  = " + vendorOrder.parts.length)
                        if (vendorOrder.parts[i].status == 'confirmed') {
                            // console.log("Confirmed  pARTS  = " + vendorOrder.parts.length)
                            vendorOrder.parts[i].status = 'Price Updated';
                            vendorOrder.status = "Submitted";
                            vendorOrder.updated_at = new Date();
                        }
                    }
                    vendorOrder.markModified('parts');
                    await vendorOrder.save();
                } else {
                    // console.log("Vendors = " + vendorOrder._id)
                }
            })

        // quotation: await VendorOrders.find({ quotation: quotation._id }).exec(),
        // quotationId: quotation._id,
        res.status(200).json({
            responseCode: 200,
            responseMessage: "Success",
            responseData: {
            },

        });
        if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("INFO: Quotation Order Cancel Confirmation Successfully, QuotationId:" + quotation._id + ", " + "User:" + loggedInDetails.name);
        }

    } else {
        if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
            businessFunctions.logs("WARNING: Quotation Not Found with the given quotationId:" + req.body.quotationId + ", " + "User:" + loggedInDetails.name);
        }
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Quotation not found",
            responseData: {
            }
        });
    }
});
router.put('/send/quotation/order', async (req, res, next) => {
    businessFunctions.logs("INFO: /send/quotation/order Api Called from quotation-service.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var loggedInDetails = await User.findById(decoded.user).exec();
    var quotation = await QuotationOrders.findById(req.body.quotationId).exec();
    if (quotation) {
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Fatching Quotation Order vendors details for the purchase, QuotationId:" + quotation._id + ", " + "User:" + loggedInDetails.name);
        }
        await VendorOrders.find({ quotation: quotation._id, status: "Confirmed" })
            .cursor()
            .eachAsync(async (order) => {
                var data = {
                    order_status: "Open",
                    // remark: req.body.remark,
                    status: "Confirmed",
                    updated_at: new Date(),

                }
                if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                    businessFunctions.logs("DEBUG: Sending Quotation Order to the vendors for the purchase, QuotationId:" + quotation._id + ", " + "User:" + loggedInDetails.name);
                }
                await VendorOrders.findOneAndUpdate({ _id: order._id }, { $set: data }, { new: true }, async function (err, doc) {
                    if (err) { } else {
                        // console.log("Created Order Successfull")
                        console.log("Api Called")
                        var QuotationData = {
                            // remark: req.body.remark,
                            status: "Confirmed",
                            updated_at: new Date(),

                        }
                        // console.log("Sumit" + doc);
                        whatsAppEvent.newParts(doc._id)
                        var activity = 'New Order'
                        fun.webNotification(activity, doc);

                        await QuotationOrders.findOneAndUpdate({ _id: quotation._id }, { $set: QuotationData }, { new: true }, async function (err, doc) {
                            if (err) { } else {
                                // console.log("Created Order Successfull")
                            }
                        })
                    }
                })

            })
        res.status(200).json({
            responseCode: 200,
            responseMessage: "Success",
            responseData: {
                quotation: await VendorOrders.find({ quotation: quotation._id }).exec(),
                quotationId: quotation._id,

            },
        });
        if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("INFO: Quotation Order Send Successfully to the vendor for the Purchase, QuotationId:" + quotation._id + ", " + "User:" + loggedInDetails.name);
        }
    } else {
        if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
            businessFunctions.logs("WARNING: Quotation Not Found with the given quotationId:" + req.body.quotationId + ", " + "User:" + loggedInDetails.name);
        }
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Quotation not found",
            responseData: {
            }
        });
    }

});


//To Changed  
router.put('/order/vendor/confirmed', async (req, res, next) => {
    businessFunctions.logs("INFO: /order/vendor/confirmed Api Called from quotation-service.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

    let confirmedOrders = req.body.orders
    let vendorIds = Object.keys(confirmedOrders)
    let orders = []
    let quotation = undefined

    let logs = {
        business: '',
        booking: '',
        vendor: '',
        car: '',
        log: '',
        created_at: '',
        orderPlaced: []
    }


    let query = { _id: { $in: vendorIds } }
    await VendorOrders.find(query)
        .cursor()
        .eachAsync(async (v) => {
            quotation = v.quotation

            let orderConfirmed = {
                id: v._id,
                shop_name: v.shop_name,
                order: confirmedOrders[v._id]
            }
            orders.push(orderConfirmed)

            logs.business = v.business
            logs.booking = v.booking
            logs.car = v.car
            logs.created_at = new Date()
            logs.vendor = v.vendor
            let parts = v.parts
            let selectedParts = confirmedOrders[v._id]
            selectedParts.forEach(sp => {
                parts.forEach(p => {
                    if (sp.item == p.item) {
                        p.partsStatus = 'confirmed'
                        // console.log("Contdition matched...", sp, p.item)
                    }
                })
            })
            v.status = 'confirmed'
            v.markModified('parts')
            await v.save()
        })
    logs.log = 'Order Confirmed'
    logs.orderPlaced = orders
    await OrderLogs.create(logs)
    let PurchaseLogs = {
        logs: "Order Confirmed",
        created_at: new Date(),
        updated_at: new Date(),
        order: quotation
    }

    PurchaseOrderLogs.create(PurchaseLogs, (err, data) => {
        if (err) {
            // console.log("Error in order confirmation logs...")
        } else {
            // console.log("Order confirm log is created...")
        }
    })
    res.json({
        success: "Your order confirmed successfully"
    })
    if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("INFO: order confirmed successfully, OrderId:" + vendorIds);
    }
})



//ABHINAV Tyagi
router.post('/vendors/sales/order/create', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /vendors/sales/order/create Api Called from quotation-service.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.Body));

    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = await User.findById(decoded.user).exec();
    var date = new Date();
    var car = null;
    var address = null;
    var items = [];
    var discount = 0;
    var total = 0;
    var due = {
        due: 0
    };
    var vendors = req.body.quotation;
    for (var i = 0; i < vendors.length; i++) {
        if (vendors[i].status == "Confirmed") {
            var vendorOrderId = vendors[i].id
            // console.log("Order Id " + vendorOrderId)
            // console.log("User + " + vendors[i].vendor)
            // console.log("business + " + vendors[i].business)
            var business = vendors[i].vendor
            var seller = await User.findById(vendors[i].vendor).exec()
            var user = await User.findById(vendors[i].business).exec();
            var loggedInDetails = await User.findById(decoded.user).exec();
            if (user) {
                if (req.body.address) {
                    var checkAddress = await Address.findOne({ _id: req.body.address, user: user._id }).exec();
                    if (checkAddress) {
                        address = checkAddress._id;
                    }
                    else {
                        if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
                            businessFunctions.logs("WARNING:Address Not Found for the given user, UserId:" + user._id);
                        }
                        return res.status(400).json({
                            responseCode: 400,
                            responseMessage: "Address not found",
                            responseData: {}
                        });
                    }
                }
                /*else
                {
                    return res.status(400).json({
                        responseCode: 400,
                        responseMessage: "Address not found",
                        responseData: {}
                    });
                }*/

                if (req.body.car) {
                    var checkCar = await Car.findOne({ _id: req.body.car, user: user._id }).exec();
                    if (checkCar) {
                        car = checkCar._id;
                    }
                    else {
                        if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
                            businessFunctions.logs("WARNING: Address Not Found for the given user, UserId:" + user._id);
                        }
                        return res.status(400).json({
                            responseCode: 400,
                            responseMessage: "Car not found",
                            responseData: {}
                        });
                    }
                }



                var date = new Date();
                var payment = {
                    payment_mode: "",
                    payment_status: "",
                    extra_charges_limit: 0,
                    convenience_charges: 0,
                    discount_type: "",
                    coupon_type: "",
                    coupon: "",
                    discount_applied: false,
                    transaction_id: "",
                    transaction_date: "",
                    transaction_status: "",
                    transaction_response: "",
                    total: total,
                    discount_total: discount,
                    paid_total: 0,
                };


                if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                    businessFunctions.logs("DEBUG: Creating New Purchase Order, User:" + loggedInDetails.name);
                }
                await Order.create({
                    convenience: req.body.convenience,
                    time_slot: req.body.time_slot,
                    user: user._id,
                    car: car,
                    address: address,
                    items: items,
                    business: business,
                    payment: payment,
                    due: due,
                    status: "Ordered",
                    isPurchaseOrder: true,
                    vendorOrder: vendorOrderId,
                    created_at: date,
                    updated_at: date,
                }).then(async function (o) {
                    var count = await Order.find({ _id: { $lt: o._id } }).count();

                    var order_no = Math.round(+new Date() / 1000) + "-" + Math.ceil((Math.random() * 90000) + 10000) + "-" + Math.ceil(count + 1);

                    await Order.findOneAndUpdate({ _id: o._id }, { $set: { order_no: order_no } }, { new: true }, async function (err, doc) {
                        if (err) {
                            res.status(422).json({
                                responseCode: 422,
                                responseMessage: "Server Error",
                                responseData: err
                            });
                        }
                        else {
                            var businessOrder = {
                                order: o._id,
                                _order: order_no,
                                due_date: null,
                                delivery_date: null,
                                convenience: req.body.convenience,
                                time_slot: req.body.time_slot,
                                user: user._id,
                                items: items,
                                business: business,
                                payment: payment,
                                status: "Confirmed",
                                vendorOrder: vendorOrderId,
                                isPurchaseOrder: true,
                                created_at: date,
                                updated_at: date,
                                due: due
                            };
                            if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                                businessFunctions.logs("DEBUG: Creating New Business Order, OrderId:" + o._id);
                            }
                            await BusinessOrder.create(businessOrder).then(async function (bo) {
                                var count = await BusinessOrder.find({ _id: { $lt: bo._id }, business: business }).count();
                                var order_no = count + 1;

                                await BusinessOrder.findOneAndUpdate({ _id: bo._id }, { $set: { order_no: order_no } }, { new: true }, async function (err, doc) {

                                    var order = await BusinessOrder.findById(bo._id)
                                        .populate({ path: 'order', populate: [{ path: 'user', select: 'name contact_no username email account_info ' }, { path: 'car', select: 'title variant registration_no _automaker _model' }, { path: 'address' }] })
                                        .exec();

                                    var items = await OrderLine.find({ order: order.order._id, business: business }).exec();

                                    // await VendorOrders.findOneAndUpdate({ _id: vendorOrderId }, { $set: { order: o._id } }, { new: true }, async function (err, doc) {
                                    //     if (err) {
                                    //         res.status(422).json({
                                    //             responseCode: 422,
                                    //             responseMessage: "Server Errro",
                                    //             responseData: err
                                    //         });
                                    //     }
                                    //     else { }
                                    // })

                                    await VendorOrders.findOneAndUpdate({ _id: vendorOrderId }, { $set: { order: o._id, isOrder: true, orderSent: true } }, { new: true }, async function (err, doc) {
                                        if (err) {
                                            res.status(422).json({
                                                responseCode: 422,
                                                responseMessage: "Server Errro",
                                                responseData: err
                                            });
                                        }
                                        else {

                                            var activity = {
                                                business: business,
                                                activity_by: loggedInDetails.name,
                                                activity: "Order sent to the Seller -> " + seller.name,
                                                remark: "Order Sent",
                                                created_at: new Date(),
                                            }
                                            businessFunctions.vendorOrderLogs(vendorOrderId, activity);


                                            var activity = {
                                                business: business,
                                                activity_by: loggedInDetails.name,
                                                activity: "Order Received from ' " + loggedInDetails.name + " '",
                                                remark: "Order Received",
                                                created_at: new Date(),
                                            }
                                            businessFunctions.salesOrderLogs(o._id, activity);
                                        }
                                    })

                                    res.status(200).json({
                                        responseCode: 200,
                                        responseMessage: "",
                                        responseData: {
                                            _id: order._id,
                                            id: order._id,
                                            order_no: order.order_no,
                                            order: order.order._id,
                                            _order: order._order,
                                            convenience: order.order.convenience,
                                            car: order.order.car,
                                            user: order.order.user,
                                            address: order.order.address,
                                            items: items,
                                        }
                                    });
                                    if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                                        businessFunctions.logs("INFO: New Order Created Successfully, Order_no:" + order.order_no + ", " + "User:" + loggedInDetails.name);
                                    }
                                });
                            });
                        }
                    });
                });
            }
            else {
                if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                    businessFunctions.logs("ERROR: User not found with the given businessId:" + vendors[i].business);
                }
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "User not found",
                    responseData: {}
                });
            }
        }
    }
});
router.put('/quotation/parts/remove', async (req, res, next) => {
    businessFunctions.logs("INFO: /quotation/parts/remove Api Called from quotation-service.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var quotation = req.body.quotationId;
    var partIndex = req.body.partIndex;
    var loggedInDetails = await User.findById(decoded.user).exec();
    // console.log("quotationId", quotation)
    // console.log("partIndex", partIndex)
    if (quotation) {
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Fatching Quotation Order Details, QuotationId:" + quotation + ", " + "User:" + loggedInDetails.name);
        }
        var order = await VendorOrders.findOne({ quotation: quotation }).exec()
        var activity = {
            business: business,
            activity: "Item Removed- " + "Item: " + order.parts[partIndex].item + " " + "Part_No: " + order.parts[partIndex].part_no + " " + "Quantity: " + order.parts[partIndex].quantity,
            activity_by: loggedInDetails.name,
            remark: "",
            created_at: new Date(),
        }

        businessFunctions.QuotationItemAddLog(quotation, activity);
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Removing the Part from the quotation, QuotationId:" + quotation + ", " + "User:" + loggedInDetails.name);
        }
        await VendorOrders.find({ quotation: quotation }).cursor()
            .eachAsync(async (v) => {
                // console.log("partslength  ", v.parts.length)
                v.parts.splice(partIndex, 1)
                // console.log("partslength  ", v.parts.length)

                await v.save()
            })

        // console.log("Order= ", order.parts[partIndex]);

        res.status(200).json({
            responseCode: 200,
            responseMessage: "Removed Successfully",
            responseData: {}
        });
        if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("INFO: Part Removed Successfully from the quotation, QuotationId:" + quotation + ", " + "User:" + loggedInDetails.name);
        }


    } else {
        if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
            businessFunctions.logs("WARNING: Quotation Not Found with the given quotationId:" + quotation + ", " + "User:" + loggedInDetails.name);
        }
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Quotation Not Found",
            responseData: {}
        });
    }

})
router.put('/buyer/remark/add', xAccessToken.token, async (req, res, next) => {
    businessFunctions.logs("INFO: /buyer/remark/add Api Called from quotation-service.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var quotation = req.body.quotationId;
    var partIndex = req.body.partIndex;
    var loggedInDetails = await User.findById(decoded.user).exec();
    // console.log("quotationId", quotation)
    // console.log("partIndex", partIndex)
    var quotation = await QuotationOrders.findById(req.body.quotationId).exec()
    if (quotation) {
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Updating the Buyer's Remark for the quotation, quotationId:" + req.body.quotationId + ", " + "User:" + loggedInDetails.name);
        }
        var order = await VendorOrders.updateMany({ quotation: quotation._id }, { $set: { buyerRemark: req.body.remark } }).exec()
        quotation.buyerRemark = req.body.remark;
        await quotation.save();
        var activity = {
            business: business,
            activity: "Buyer Reamrk added successfully",
            activity_by: loggedInDetails.name,
            remark: req.body.remark,
            created_at: new Date(),
        }
        businessFunctions.QuotationItemAddLog(quotation._id, activity);
        // await VendorOrders.find({ quotation: quotation._id }).cursor()
        //     .eachAsync(async (v) => {
        //         // console.log("partslength  ", v.parts.length)
        //         // v.parts.splice(partIndex, 1)
        //         // console.log("partslength  ", v.parts.length)
        //         await v.save()
        //     })

        // console.log("Order= ", order.parts[partIndex]);

        res.status(200).json({
            responseCode: 200,
            responseMessage: "Remark added Successfully",
            responseData: {}
        });
        if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("INFO: Buyer Remark added successfully, " + "User:" + loggedInDetails.name);
        }
    } else {
        if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
            businessFunctions.logs("WARNING: Quotation Not Found with the given quotationId:" + quotation + ", " + "User:" + loggedInDetails.name);
        }
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Quotation Not Found",
            responseData: {}
        });
    }
})
router.put('/cancel/quotation', xAccessToken.token, async (req, res, next) => {
    businessFunctions.logs("INFO: /cancel/quotation Api Called from quotation-service.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    // var quotation = req.body.quotationId;
    var partIndex = req.body.partIndex;
    var loggedInDetails = await User.findById(decoded.user).exec();
    // console.log("quotationId", quotation)
    // console.log("partIndex", partIndex)
    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Fatching the quotation details, quotationId:" + req.body.quotationId + ", " + "User:" + loggedInDetails.name);
    }
    var quotation = await QuotationOrders.findOne({ _id: req.body.quotationId }).exec()
    if (quotation) {
        var order = await VendorOrders.findOne({ quotation: quotation._id }).exec()
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Updating the quotation status as Cancelled, Vendor_Name:" + order.shop_name + ", " + "User:" + loggedInDetails.name);
        }
        console.log(JSON.stringify(order))
        quotation.status = 'Cancelled'
        await quotation.save();
        var activity = {
            business: business,
            activity: "Quotation Cancelled",
            activity_by: loggedInDetails.name,
            remark: "",
            created_at: new Date(),
        }
        businessFunctions.QuotationItemAddLog(quotation._id, activity);
        await VendorOrders.find({ quotation: quotation._id }).cursor()
            .eachAsync(async (v) => {
                // console.log("partslength  ", v.parts.length)
                v.status = 'Cancelled';
                v.order_status = 'Cancelled';
                // console.log("partslength  ", v.parts.length)
                await v.save()
            })

        // console.log("Order= ", order.parts[partIndex]);

        res.status(200).json({
            responseCode: 200,
            responseMessage: "Cancelled Successfully",
            responseData: {}
        });
        if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("INFO: Quotation Cancelled Successfully, QuotationId:" + req.body.quotationId + ", " + "User:" + loggedInDetails.name);
        }
    } else {
        if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
            businessFunctions.logs("WARNING: Quotation not found, quotationId:" + req.body.quotationId + ", " + "User:" + loggedInDetails.name);
        }
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Quotation Not Found",
            responseData: {}
        });
    }

})
module.exports = router