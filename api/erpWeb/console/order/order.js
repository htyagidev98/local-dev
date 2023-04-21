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
    numtoWords = require('num-words'),
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
const vendorOrders = require('../../../../models/vendorOrders');
const Sales = require('../../../../models/sales');
const webNotification = require('../../../../models/webNotification');



var secret = config.secret;
var Log_Level = config.Log_Level

router.get('/orders/get', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /orders/get Api Called from order.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = await User.findById(decoded.user).exec();

    //paginate
    if (req.query.page == undefined) {
        var page = 0;
    }
    else {
        var page = req.query.page;
    }

    var page = Math.max(0, parseInt(page));


    var orders = [];

    var filters = [];
    var match = [];
    var queries = {};


    if (req.query.query) {
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
        req.query.query = req.query.query.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
        var specification = {};
        specification['$match'] = {
            business: mongoose.Types.ObjectId(business),
            $or: [
                { '_order': { $regex: req.query.query, $options: 'i' } },
                { 'status': { $regex: req.query.query, $options: 'i' } },
                { 'order_no': { $regex: req.query.query, $options: 'i' } },
                { 'user.name': { $regex: req.query.query, $options: 'i' } },
                { 'user.contact_no': { $regex: req.query.query, $options: 'i' } },
            ]
        };
        filters.push(specification);

        var specification = {};
        specification['$sort'] = {
            updated_at: -1,
        };
        filters.push(specification);

        var specification = {};
        specification['$skip'] = config.perPage * page;
        filters.push(specification);

        var specification = {};
        specification['$limit'] = config.perPage;
        filters.push(specification);
    }
    else {
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Making Aggregation Query to fatch orders list, User:" + user.name)
        }
        var status = "Confirmed";

        if (req.query.status) {
            var status = req.query.status;
        }


        var specification = {};
        specification['$match'] = {
            status: status
        };
        filters.push(specification);

        var specification = {};
        specification['$match'] = {
            business: mongoose.Types.ObjectId(business)
        };
        filters.push(specification);

        var specification = {};
        specification['$match'] = {
            business: mongoose.Types.ObjectId(business)
        };
        filters.push(specification);

        var specification = {};
        specification['$sort'] = {
            updated_at: -1,
        };
        filters.push(specification);

        var specification = {};
        specification['$skip'] = config.perPage * page;
        filters.push(specification);

        var specification = {};
        specification['$limit'] = config.perPage;
        filters.push(specification);
    }

    var query = filters;

    var totalResult = await BusinessOrder.find({ status: status, business: business });

    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Fatching orders list with their details, Order Status:" + req.query.status + ", " + "User:" + user.name);
    }
    await BusinessOrder.aggregate(query)
        .allowDiskUse(true)
        .cursor({ batchSize: 20 })
        .exec()
        .eachAsync(async function (p) {
            var order = await Order.findById(p.order)
                .populate({ path: 'user', select: 'name contact_no username email account_info business_info' })
                .populate({ path: 'car', select: 'variant value' })
                .populate({ path: 'address' })
                .exec();

            orders.push({
                _id: order._id,
                id: order._id,
                user: order.user,
                car: order.car,
                totalParts: await OrderLine.find({ order: p.order }).count().exec(),
                address: order.address,
                due_date: moment(p.due_date).tz(req.headers['tz']).format('ll'),
                delivery_date: moment(p.delivery_date).tz(req.headers['tz']).format('ll'),
                time_slot: p.time_slot,
                convenience: p.convenience,
                _order: p._order,
                order_no: p.order_no,
                address: p.address,
                isInvoice: order.isInvoice,
                invoice: order.invoice,
                payment: p.payment,
                due: p.due,
                log: p.log,
                isPurchaseOrder: p.isPurchaseOrder,
                vendorOrder: p.vendorOrder,
                status: p.status,
                created_at: moment(p.created_at).tz(req.headers['tz']).format('lll'),
                updated_at: moment(p.updated_at).tz(req.headers['tz']).format('lll'),
            });
        });
    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Sending orders list in Response, Order Status:" + req.query.status + ", " + "User:" + user.name);
    }

    res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseInfo: {
            totalResult: totalResult.length,
        },
        responseData: orders
    });
    if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("INFO: Orders list send in Response Successfully, Order Status:" + req.query.status + ", " + "User:" + user.name);
    }

});

router.post('/order/create', xAccessToken.token, async function (req, res, next) {
    var business = req.headers['business'];
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var date = new Date();
    var loggedInDetails = decoded.user;
    var car = null;
    var address = null;
    var items = [];
    var data = [];

    var item_total = 0;
    var discount = 0;
    var item_total = 0;
    var total = 0;
    var due = {
        due: 0
    };

    var user = await User.findById(req.body.user).exec();
    var loggedInDetails = await User.findById(decoded.user).exec();
    if (user) {
        if (req.body.address) {
            var checkAddress = await Address.findOne({ _id: req.body.address, user: user._id }).exec();
            if (checkAddress) {
                address = checkAddress._id;
            }
            else {
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
            isPurchaseOrder: false,
            vendorOrder: null,
            status: "Ordered",
            created_at: date,
            updated_at: date,
        }).then(async function (o) {
            var count = await Order.find({ _id: { $lt: o._id } }).count();
            // var count = await Order.find({ business: business }).count();
            var order_no = Math.round(+new Date() / 1000) + "-" + Math.ceil((Math.random() * 90000) + 10000) + "-" + Math.ceil(count + 1);
            await Order.findOneAndUpdate({ _id: o._id }, { $set: { order_no: order_no } }, { new: true }, async function (err, doc) {
                if (err) {
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Server Errro",
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
                        created_at: date,
                        updated_at: date,
                        vendorOrder: null,
                        isPurchaseOrder: false,
                        due: due
                    };

                    await BusinessOrder.create(businessOrder).then(async function (bo) {
                        // var count = await BusinessOrder.find({ _id: { $lt: bo._id } }).count();
                        var count = await BusinessOrder.find({ business: business }).count();
                        var order_no = count + 1;

                        await BusinessOrder.findOneAndUpdate({ _id: bo._id }, { $set: { order_no: order_no } }, { new: true }, async function (err, doc) {

                            var order = await BusinessOrder.findById(bo._id)
                                .populate({ path: 'order', populate: [{ path: 'user', select: 'name contact_no username email account_info ' }, { path: 'car', select: 'title variant registration_no _automaker _model' }, { path: 'address' }] })
                                .exec();

                            var items = await OrderLine.find({ order: order.order._id, business: business }).exec();

                            var purchaseOrder = await q.all(businessFunctions.createLinkedPurcahseOrder(user._id, order.order._id, loggedInDetails.name))
                            if (purchaseOrder) {
                                // console.log("Purchase Order  = " + JSON.stringify(purchaseOrder, null, '\t'))
                            }
                            var activity = {
                                business: business,
                                activity_by: loggedInDetails.name,
                                activity: "Order Created",
                                // time: new Date().getTime.toLocaleTimeString(),
                                remark: "Order",
                                created_at: new Date(),
                            }
                            // console.log("Activity")
                            businessFunctions.salesOrderLogs(order.order._id, activity);
                            //Create Linked Purachse_Order with this Sales_Order



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
                        });
                    });
                }
            });
        });
    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "User not found",
            responseData: {}
        });
    }
});

router.get('/order/invoices/get', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /order/invoices/get Api Called from order.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = await User.findById(decoded.user).exec();

    //paginate
    if (req.query.page == undefined) {
        var page = 0;
    }
    else {
        var page = req.query.page;
    }

    var page = Math.max(0, parseInt(page));

    var orders = [];

    var filters = [];
    var match = [];
    var queries = {};

    // var specification = {};
    // specification['$lookup'] = {
    //     from: "Order",
    //     localField: "order",
    //     foreignField: "_id",
    //     as: "order",
    // };
    // filters.push(specification);
    // var specification = {};
    // specification['$unwind'] = {
    //     path: "$order",
    //     preserveNullAndEmptyArrays: false
    // };

    // filters.push(specification);
    // var specification = {};
    // specification['$lookup'] = {
    //     from: "Sales",
    //     localField: "sale",
    //     foreignField: "_id",
    //     as: "sale",
    // };
    // filters.push(specification);
    // var specification = {};
    // specification['$unwind'] = {
    //     path: "$sale",
    //     preserveNullAndEmptyArrays: false
    // };
    // filters.push(specification);
    var specification = {};
    specification['$match'] = {
        business: mongoose.Types.ObjectId(business)
    };
    filters.push(specification);

    if (req.query.query) {
        req.query.query = req.query.query.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
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
        specification['$match'] = {
            // business: mongoose.Types.ObjectId(business),
            $or: [
                { '_order': { $regex: req.query.query, $options: 'i' } },
                { 'status': { $regex: req.query.query, $options: 'i' } },
                { 'order_no': { $regex: req.query.query, $options: 'i' } },
                { 'sale_no': { $regex: req.query.query, $options: 'i' } },
                { 'user.name': { $regex: req.query.query, $options: 'i' } },
                { 'user.contact_no': { $regex: req.query.query, $options: 'i' } },


            ]
        };
        filters.push(specification);
    }
    if (req.query.from && req.query.to) {
        console.log("Date1 = " + req.query.from, " EndDate = " + req.query.to)
        var from = new Date(req.query.from)
        from = from.setDate(from.getDate() + 1);
        var to = new Date(req.query.to);
        to = to.setDate(to.getDate() + 1);
        var specification = {};
        console.log("Date = " + new Date(from), " EndDate = " + new Date(to))
        specification["$match"] = {
            "created_at": { $gte: new Date(from), $lte: new Date(to) },
        };
        filters.push(specification);
    }

    var query = filters;
    var totalResult = await OrderInvoice.aggregate(query);

    var specification = {};
    specification['$sort'] = {
        updated_at: -1,
    };
    filters.push(specification);

    var specification = {};
    specification['$skip'] = config.perPage * page;
    filters.push(specification);

    var specification = {};
    specification['$limit'] = config.perPage;
    filters.push(specification);
    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Fatching Order Invoices list, User:" + user.name);
    }
    await OrderInvoice.aggregate(query)
        .allowDiskUse(true)
        .cursor({ batchSize: 20 })
        .exec()
        .eachAsync(async function (p) {
            //orders.push(p)
            if (p) {
                var order = await Order.findById(p.order)
                    .populate({ path: 'user', select: 'name contact_no username email account_info business_info' })
                    .populate({ path: 'car', select: 'title variant registration_no _automaker _model' })
                    .populate({ path: 'address' })
                    .exec();
                var sale = await Sales.findById(p.sale)
                    .populate({ path: 'user', select: 'name contact_no username email account_info business_info' })
                    .populate({ path: 'car', select: 'title variant registration_no _automaker _model' })
                    .populate({ path: 'address' })
                    .exec();
                if (order) {
                    orders.push({
                        _id: p._id,
                        id: p._id,
                        invoice_id: p._id,
                        order: order._id,
                        user: order.user,
                        car: order.car,
                        address: order.address,
                        due_date: moment(p.due_date).tz(req.headers['tz']).format('lll'),
                        delivery_date: moment(p.delivery_date).tz(req.headers['tz']).format('lll'),
                        time_slot: p.time_slot,
                        convenience: p.convenience,
                        _order: p._order,
                        order_no: p.order_no,
                        address: p.address,
                        payment: p.payment,
                        invoice_no: p.invoice_no,
                        order_status: order.status,
                        due: p.due,
                        log: p.log,
                        type: 'salesOrder',
                        status: p.status,
                        created_at: moment(p.created_at).tz(req.headers['tz']).format('lll'),
                        updated_at: moment(p.updated_at).tz(req.headers['tz']).format('lll'),
                    });
                } else if (sale) {
                    orders.push({
                        _id: p._id,
                        id: p._id,
                        invoice_id: p._id,
                        invoice_no: p.invoice_no,
                        user: sale.user,
                        sale: sale._id,
                        car: sale.car,
                        address: sale.address,
                        due_date: moment(p.due_date).tz(req.headers['tz']).format('lll'),
                        delivery_date: moment(p.delivery_date).tz(req.headers['tz']).format('lll'),
                        time_slot: p.time_slot,
                        convenience: p.convenience,
                        // _order: p._order,
                        order_no: p.sale_no,
                        address: p.address,
                        payment: p.payment,
                        order_status: sale.status,
                        due: p.due,
                        log: p.log,
                        status: p.status,
                        type: 'sale',
                        created_at: moment(p.created_at).tz(req.headers['tz']).format('lll'),
                        updated_at: moment(p.updated_at).tz(req.headers['tz']).format('lll'),
                    });
                }
            }
        });
    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG:  Sending Order Invoice List in Response, User:" + user.name);
    }
    res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseInfo: {
            totalResult: totalResult.length,
            // query: query
        },
        responseData: orders
    });
    if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("INFO: Order Invoice List Send in Response Successfully, User:" + user.name);
    }
});

router.get('/order/invoice/get', xAccessToken.token, async function (req, res, next) {
    console.time('looper')
    //console.log('looper')
    var rules = {
        invoice: 'required',
    };

    var validation = new Validator(req.query, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Invoice is required",
            responseData: {
                res: validation.errors.all()
            }
        })
    }
    else {
        var token = req.headers['x-access-token'];
        var business = req.headers['business'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);

        var p = await OrderInvoice.findById(req.query.invoice)
            .populate({
                path: 'order',
                populate: [
                    { path: 'user', select: 'name contact_no username email account_info business_info' },
                    { path: 'business', select: 'name contact_no username email account_info business_info bank_details' },
                    { path: 'car', select: 'variant value' },
                    { path: 'address' }
                ]
            })
            .exec();
        if (p) {
            var transactions = await q.all(fun.getOrderTransaction(p.order._id, business))
            var business_info = await User.findById(p.business).select('name contact_no username email account_info business_info bank_details address').exec();

            res.status(200).json({
                responseCode: 200,
                responseMessage: "success",
                responseData: {
                    _id: p._id,
                    id: p._id,
                    items: await q.all(fun.getBusinessOrderItems(p.order._id, business, req.headers['tz'])),
                    user: p.order.user,
                    car: p.order.car,
                    due_date: moment(p.due_date).tz(req.headers['tz']).format('lll'),
                    delivery_date: moment(p.delivery_date).tz(req.headers['tz']).format('lll'),
                    time_slot: p.time_slot,
                    convenience: p.convenience,
                    order_no: p.order_no,
                    _order: p._order,
                    invoice_no: p.invoice_no,
                    address: p.order.address,
                    payment: p.payment,
                    status: p.status,
                    business: business_info,
                    due: p.due,

                    note: p.note,
                    log: p.log,
                    transactions: transactions.transactions,
                    created_at: moment(p.created_at).tz(req.headers['tz']).format('lll'),
                    updated_at: moment(p.updated_at).tz(req.headers['tz']).format('lll'),
                }
            });
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Invoice not found",
                responseData: {}
            });
        }
    }
    console.timeEnd('looper')
});


router.get('/order/details/get', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /order/details/get Api Called from order.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    console.time('looper');
    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = await User.findById(decoded.user).exec();

    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Fatching order details for the given order, OrderId:" + req.query.order + ", " + "User:" + user.name);
    }
    var p = await BusinessOrder.findOne({ order: req.query.order, business: business })
        .populate({
            path: 'order',
            populate: [
                { path: 'user', select: 'name contact_no username email account_info business_info' },
                { path: 'car', select: 'value variant' },
                { path: 'address' }
            ]
        })
        .populate({ path: "business", select: "name address business_info contact_no email account_info bank_details" })
        .exec();

    if (p) {
        var vendorOrder = await vendorOrders.findOne({ _id: p.vendorOrder }).select('status order_status parts sentDate').exec();
        var transactions = await q.all(fun.getOrderTransaction(p.order._id, business))

        var has_invoice = false;
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Fatching order Invoices and active Invoices details for the given order, OrderId:" + p.order._id + ", " + "User:" + user.name);
        }
        var invoices = await OrderInvoice.find({ order: p.order._id, business: business }).select('status invoice_no').exec();
        var activeInvoice = await OrderInvoice.findOne({ order: p.order._id, business: business, status: "Active" }).select('status invoice_no updated_at').sort({ created_at: -1 }).exec();


        var isInvoiceUpToDate = false
        if (invoices.length > 0) {
            has_invoice = true;
            // console.log("Order Date = " + new Date(p.updated_at))
            // console.log("Invoice  Date = " + new Date(activeInvoice.updated_at))
            if (activeInvoice) {
                var serverTime = moment.tz(new Date(p.updated_at), req.headers['tz']);
                var bar = moment.tz(new Date(activeInvoice.updated_at), req.headers['tz']);
                var baz = serverTime.diff(bar);
                // console.log("-- " + baz);   ///Used to take diffrence between Order updated Date and Invoice Updated Date Average time is 30 to 40 When both  updated at same time.
                if (baz < 50) {
                    isInvoiceUpToDate = true
                }
            }

        }


        // baz>   Treu
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Sending Order Details in Response, OrderId:" + req.query.order + ", " + "Order_By:" + p.order.user.name + ", " + "User:" + user.name);
        }
        res.status(200).json({
            responseCode: 200,
            responseMessage: "success",
            responseData: {
                _id: p.order._id,
                id: p.order._id,
                items: await q.all(fun.getBusinessOrderItems(p.order._id, business, req.headers['tz'])),
                user: p.order.user,
                car: p.order.car,
                address: p.order.address,
                due_date: moment(p.due_date).tz(req.headers['tz']).format('lll'),
                delivery_date: moment(p.delivery_date).tz(req.headers['tz']).format('lll'),
                time_slot: p.time_slot,
                convenience: p.convenience,
                _order: p._order,
                order_no: p.order_no,
                business: p.business,
                address: p.order.address,
                payment: p.payment,
                status: p.status,
                due: p.due,
                note: p.note,
                log: p.log,
                logs: p.logs,
                isPurchaseOrder: p.isPurchaseOrder,
                vendorOrder: vendorOrder,
                request_no: p.order.request_no,
                has_invoice: has_invoice,
                invoices: invoices,
                activeInvoice: activeInvoice,
                transactions: transactions.transactions,
                parchi: p.order.parchi,
                isParchi: p.order.isParchi,
                created_at: moment(p.created_at).tz(req.headers['tz']).format('lll'),
                updated_at: moment(p.updated_at).tz(req.headers['tz']).format('lll'),
                isInvoiceUpToDate: isInvoiceUpToDate,

            }
        });
        if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("INFO: Order Details Send in Response Successfully, OrderId:" + req.query.order + ", " + "Order_By:" + p.order.user.name + ", " + "User:" + user.name);
        }
        // console.timeEnd('looper')}
    } else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Order Not Found",
            responseData: {}
        });
        // if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
        //     // businessFunctions.logs("E: Expense Category send in Response Successfully.");
        // }
    }
});

router.get('/order/convenience/get', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /order/convenience/get Api Called from order.js," + " " + "Request Headers:" + JSON.stringify(req.headers));

    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = await User.findById(decoded.user).exec();
    var conveniences = [];

    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Count Order convenience for the given business details.");
    }
    var check = await OrderConvenience.find({ business: business }).count().exec();
    if (check > 0) {
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Fatching Order Convenience Details, User:" + user.name);
        }
        await OrderConvenience.find({ business: business })
            .cursor()
            .eachAsync(async function (p) {
                conveniences.push({
                    _id: p._id,
                    _id: p._id,
                    convenience: p.convenience,
                    chargeable: p.chargeable,
                    charges: p.charges,
                });
            });
    }
    else {
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Fatching Order Convenience Details when business is null, Business: Null");
        }
        await OrderConvenience.find({ business: null })
            .cursor()
            .eachAsync(async function (p) {
                conveniences.push({
                    _id: p._id,
                    _id: p._id,
                    convenience: p.convenience,
                    chargeable: p.chargeable,
                    charges: p.charges,
                });
            });
    }

    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Sending Order Convenience Details in Response, User:" + user.name);
    }
    res.status(200).json({
        responseCode: 200,
        responseMessage: "",
        responseData: conveniences
    })
    if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("INFO: Order Convenience Details send in Response Successfully, User:" + user.name);
    }
});

router.get('/expense/category/get', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO:/expense/category/get Api Called from order.js," + " " + "Request Headers:" + JSON.stringify(req.headers));

    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Fatching Expense Category.");
    }
    const expenseCategory = await ExpenseCategory.find({}).sort({ category: 1 }).exec();
    res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: expenseCategory
    });
    if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("INFO: Expense Category send in Response Successfully.");
    }
});

router.get('/order/payments/log', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /order/payments/log Api Called from order.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    var business = req.headers['business'];
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = await User.findById(decoded.user).exec();

    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Fatching Order details for the given order, " + "User:" + user.name);
    }
    var order = await Order.findById(req.query.order).exec();
    if (order) {
        var logs = [];
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Fatching Transaction Logs for the order");
        }
        await TransactionLog.find({ source: req.query.order, business: business })
            .sort({ updated_at: -1 })
            .cursor().eachAsync(async (log) => {
                logs.push({
                    _id: log._id,
                    id: log._id,
                    activity: log.activity,
                    payment_mode: log.payment_mode,
                    paid_total: parseInt(log.paid_total),
                    paid_total_inwords: numtoWords(parseInt(log.paid_total)),
                    payment_status: log.payment_status,
                    transaction_id: log.transaction_id,
                    transaction_date: log.transaction_date,
                    transaction_status: log.transaction_status,
                    transaction_response: log.transaction_response,
                    user: log.user,
                    source: log.source,
                    paid_total: log.paid_total,
                    total: log.total,
                    type: log.type,
                    created_at: moment(log.created_at).tz(req.headers['tz']).format('lll'),
                    updated_at: moment(log.updated_at).tz(req.headers['tz']).format('lll'),
                });
            });
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Sending Transaction logs in Response, " + "User:" + user.name);
        }
        res.status(200).json({
            responseCode: 200,
            responseMessage: "Transaction Log",
            responseData: logs
        });
        if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("INFO: Transaction logs Send in Response Successfully, " + "User:" + user.name);
        }
    }
    else {
        if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
            businessFunctions.logs("WARNING: Order not found with the given orderId:" + req.query.order + ", " + "User:" + user.name);
        }
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Order not found",
            responseData: {}
        });
    }
});

router.put('/order/delivery-date/update', xAccessToken.token, async function (req, res, next) {
    var rules = {
        order: 'required',
        delivery_date: 'required',
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Due Date required",
            responseData: {
                res: validation.errors.all()
            }
        });
    }
    else {
        var business = req.headers['business'];
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var date = new Date();
        var loggedInDetails = decoded.user;
        var items = [];
        var data = [];

        var item_total = 0;
        var discount = 0;
        var item_total = 0;
        var total = 0;

        var order = await Order.findById(req.body.order).exec();
        var loggedInDetails = await User.findById(decoded.user).exec();
        if (order) {
            var delivery_date = new Date(req.body.delivery_date).toISOString();

            BusinessOrder.findOneAndUpdate({ order: order._id, business: business }, { $set: { delivery_date: delivery_date } }, { new: false }, async function (err, doc) {
                if (err) {
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Server Error",
                        responseData: err
                    });
                }
                else {
                    OrderLine.update({ order: order._id, business: business }, { $set: { delivery_date: delivery_date } }, { multi: true }, async function (err, doc) {
                        if (err) {
                            res.status(422).json({
                                responseCode: 422,
                                responseMessage: "Server Error",
                                responseData: err
                            });
                        }
                        else {
                            res.status(200).json({
                                responseCode: 200,
                                responseMessage: "Saved",
                                responseData: {
                                    delivery_date: moment(delivery_date).tz(req.headers['tz']).format("YYYY-MM-DD")
                                }
                            });
                        }
                    });
                }
            });
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Order not found",
                responseData: {}
            });
        }
    }
});

router.put('/order/due-date/update', xAccessToken.token, async function (req, res, next) {
    var rules = {
        order: 'required',
        due_date: 'required',
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Due Date required",
            responseData: {
                res: validation.errors.all()
            }
        });
    }
    else {
        var business = req.headers['business'];
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var date = new Date();
        var loggedInDetails = decoded.user;
        var items = [];
        var data = [];

        var item_total = 0;
        var discount = 0;
        var item_total = 0;
        var total = 0;

        var order = await Order.findById(req.body.order).exec();
        var loggedInDetails = await User.findById(decoded.user).exec();
        if (order) {
            var due_date = new Date(req.body.due_date).toISOString();

            BusinessOrder.findOneAndUpdate({ order: order._id, business: business }, { $set: { due_date: due_date } }, { new: false }, async function (err, doc) {
                if (err) {
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Server Error",
                        responseData: err
                    });
                }
                else {
                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Saved",
                        responseData: {
                            due_date: moment(due_date).tz(req.headers['tz']).format("YYYY-MM-DD")
                        }
                    });
                }
            });
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Order not found",
                responseData: {}
            });
        }
    }
});

router.put('/order/car/update', xAccessToken.token, async function (req, res, next) {
    var rules = {
        order: 'required',
        car: 'required',
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Due Date required",
            responseData: {
                res: validation.errors.all()
            }
        });
    }
    else {
        var business = req.headers['business'];
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var date = new Date();
        var loggedInDetails = decoded.user;
        var items = [];
        var data = [];

        var item_total = 0;
        var discount = 0;
        var item_total = 0;
        var total = 0;

        var order = await Order.findById(req.body.order).exec();
        var loggedInDetails = await User.findById(decoded.user).exec();
        if (order) {
            var car = await Variant.findOne({ _id: req.body.car }).exec();
            if (car) {
                Order.findOneAndUpdate({ _id: order._id }, { $set: { car: car._id } }, { new: false }, async function (err, doc) {
                    if (err) {
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Server Error",
                            responseData: err
                        });
                    }
                    else {
                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Saved",
                            responseData: {
                                car: car
                            }
                        });
                    }
                });
            }
            else {
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Car not found",
                    responseData: {}
                });
            }
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Order not found",
                responseData: {}
            });
        }
    }
});

router.post('/order/invoice/generate', xAccessToken.token, async function (req, res, next) {
    var business = req.headers['business'];
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var date = new Date();
    var loggedInDetails = decoded.user;
    var items = [];
    var data = [];

    var item_total = 0;
    var discount = 0;
    var item_total = 0;
    var total = 0;

    var order = await Order.findById(req.body.order).exec();
    var loggedInDetails = await User.findById(decoded.user).exec();
    if (order) {
        var invoice = await OrderInvoice.findOne({ order: order._id, business: business, status: "Active" })
            .populate({
                path: 'order',
                populate: [
                    { path: 'user', select: 'name contact_no username email account_info business_info' },
                    { path: 'car', select: 'variant value' },
                    { path: 'address' }
                ]
            })
            .exec();
        if (invoice) {
            await OrderInvoice.findOneAndUpdate({ _id: invoice._id }, { $set: { status: 'Cancelled' } }, { new: true }, async function (err, invoice) {
                if (err) {
                    // res.status(200).json({
                    //     responseCode: 200,
                    //     responseMessage: "success",
                    //     responseData: {}
                    // })
                } else {

                    var transactionData = {
                        user: invoice.user,
                        business: invoice.business,
                        status: 'Sale Cancelled',
                        type: 'Sale Cancelled',
                        paid_by: '-',
                        activity: "Invoice",
                        source: invoice._id,
                        bill_id: invoice.invoice_no,
                        bill_amount: parseFloat(invoice.payment.total) - parseFloat(invoice.payment.discount_total),
                        transaction_amount: parseFloat(invoice.payment.total) - parseFloat(invoice.payment.discount_total),
                        balance: parseFloat(invoice.payment.total) - parseFloat(invoice.payment.discount_total),
                        total: parseFloat(invoice.payment.total) - parseFloat(invoice.payment.discount_total),
                        paid_total: 0,
                        due: 0,
                        payment_status: "Cancelled",
                        payment_mode: '-',
                        received_by: loggedInDetails.name,
                        transaction_id: '-',
                        transaction_date: new Date(),
                        transaction_status: 'Success',
                        transaction_response: '-',
                        transaction_type: "Sale Cancelled",
                    }
                    q.all(businessFunctions.addTransaction(transactionData));

                    var activity = {
                        business: business,
                        activity_by: loggedInDetails.name,
                        activity: "Invoice Cancelled " + "#" + invoice.invoice_no,
                        remark: "Invoice Cancelled",
                        created_at: new Date(),
                    }
                    businessFunctions.salesOrderLogs(order._id, activity);
                }
            })
        }
        // if (invoice) {
        //     await OrderInvoice.findOneAndUpdate({ _id: inv._id }, { $set: { status: 'Cancelled' } }, { new: true }, async function (err, doc) {
        //         if (err) {
        //             res.status(200).json({
        //                 responseCode: 200,
        //                 responseMessage: "success",
        //                 responseData: {}
        //             })
        //         }
        //     })

        //     // console.log("Already Invoiced")
        //     // var transactions = await q.all(fun.getOrderTransaction(invoice.order._id, business));

        //     // res.status(200).json({
        //     //     responseCode: 200,
        //     //     responseMessage: "success",
        //     //     responseData: {
        //     //         _id: invoice._id,
        //     //         id: invoice._id,
        //     //         items: await q.all(fun.getBusinessOrderItems(invoice.order._id, business, req.headers['tz'])),
        //     //         user: invoice.order.user,
        //     //         car: invoice.order.car,
        //     //         address: invoice.order.address,
        //     //         due_date: moment(invoice.due_date).tz(req.headers['tz']).format('lll'),
        //     //         delivery_date: moment(invoice.delivery_date).tz(req.headers['tz']).format('lll'),
        //     //         time_slot: invoice.time_slot,
        //     //         convenience: invoice.convenience,
        //     //         order_no: invoice.order_no,
        //     //         _order: invoice._order,
        //     //         invoice_no: invoice.invoice_no,
        //     //         address: invoice.order.address,
        //     //         payment: invoice.payment,
        //     //         status: invoice.status,
        //     //         due: invoice.due,
        //     //         log: invoice.log,
        //     //         transactions: transactions.transactions,
        //     //         created_at: moment(invoice.created_at).tz(req.headers['tz']).format('lll'),
        //     //         updated_at: moment(invoice.updated_at).tz(req.headers['tz']).format('lll'),
        //     //     }
        //     // });
        // }
        // else {
        var date = new Date();
        var availablity = false;
        await OrderLine.updateMany({ order: order._id, business: business, issued: true, status: { $nin: ['Cancelled'] } }, { $set: { isInvoice: true } }).exec();
        var items = await OrderLine.find({ order: order._id, business: business, status: { $nin: ['Cancelled'] } }).exec();

        var nd = _.filter(items, status => status.issued == true);

        if (nd.length <= 0) {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Error! Add some items",
                responseData: {}
            });
        }
        else {
            var businessOrder = await BusinessOrder.findOne({ order: order._id, business: business }).exec();

            OrderInvoice.create({
                business: business,
                user: businessOrder.user,
                order: businessOrder.order,
                source: businessOrder._id,
                delivery_date: businessOrder.delivery_date,
                due_date: businessOrder.due_date,
                _order: businessOrder._order,
                order_no: businessOrder.order_no,
                note: businessOrder.note,
                invoice_no: businessOrder.invoice_no,
                status: "Active",
                with_tax: true,
                payment: businessOrder.payment,
                due: businessOrder.due,
                created_at: new Date(),
                updated_at: new Date(),
            })
                .then(async function (inv) {

                    var count = await OrderInvoice.find({ _id: { $lt: inv._id }, business: business }).count();
                    if (count == 0) {
                        // console.log("If ")
                        var last_invoice = "";
                        var position = 1;
                    }
                    else {
                        // console.log("ELSE " + count)

                        var lv = await OrderInvoice.findOne({ _id: { $lt: inv._id }, business: business }).sort({ _id: -1 }).exec();
                        // return res.json({
                        //     data: lv
                        // })
                        var last_invoice = lv.invoice_no;
                        position = count + 1
                    }
                    // console.log("Lats Invoice  -= " + last_invoice)
                    var fy = {
                        with_tax: inv.with_tax,
                        last_invoice: last_invoice,
                        position: position,
                    };

                    var assigned_invoice_no = await q.all(fun.fiscalyear(fy));

                    /////////////////////////////Abhinav Invoice Bug Fix/////////////////////////////

                    /*
                     var assigned_invoice_no = await q.all(async function(data)
    {
        // console.log(data)
        if(data.with_tax==true){
            var fiscalyear ={};
            var today = new Date();
            var thisFullYear = today.getFullYear();
            var nextFullYear = today.getFullYear()+1;
 
            today.setMonth(today.getMonth());
            
            if((today.getMonth() + 1) <= 3)  
            {
                fiscalyear = (today.getFullYear() - 1) + "-" + thisFullYear.toString().slice(-2);
            } 
            else
            {
                fiscalyear = today.getFullYear() + "-" + nextFullYear.toString().slice(-2);
            }
 
 
            if(data.last_invoice==""){
                var invoice = fiscalyear+"/"+data.position;
            }
            else
            {
                var ls = data.last_invoice.split('/');
                if(ls[0]==fiscalyear)
                {
                    if(ls[1])
                    {
                        var invoice = fiscalyear+"/"+(parseInt(ls[1])+1);
                    }
                    else
                    {
                        var invoice = fiscalyear+"/"+data.position;
                    }
                }
                else
                {
                    var invoice = fiscalyear+"/1";
                }
            }
        }
        else{
            var invoice = data.position;
            // if(data.last_invoice==""){
            //     var invoice = data.position;
            // }
            // else
            // {
            //     var invoice = data.position;
            // }
        }
        return {invoice: invoice}
    });
 
 
                    */
                    /////////////////////////////Abhinav Invoice Bug Fix/////////////////////////////
                    // console.log("Assigned Onbocds = " + assigned_invoice_no.invoice)
                    if (assigned_invoice_no) {
                        if (assigned_invoice_no.invoice) {
                            // console.log("Invoice no: " + assigned_invoice_no.invoice)
                            await OrderInvoice.findOneAndUpdate({ _id: inv._id }, { $set: { invoice_no: assigned_invoice_no.invoice } }, { new: true }, async function (err, doc) {
                                if (err) {
                                    res.status(422).json({
                                        responseCode: 422,
                                        responseMessage: "Server Error",
                                        responseData: err
                                    });
                                }
                                else {
                                    // status: "Shipped",
                                    await Order.findOneAndUpdate({ _id: order._id }, { $set: { isInvoice: true, invoice: inv._id, updated_at: new Date() } }, { new: false }, async function (err, doc) {
                                        if (err) {
                                            return res.status(422).json({
                                                responseCode: 422,
                                                responseMessage: "Server Error",
                                                responseData: err
                                            });
                                        }
                                        else {
                                            // ,status: "Shipped"
                                            await BusinessOrder.findOneAndUpdate({ order: order._id, business: business }, { $set: { isInvoice: true, invoice: inv._id, updated_at: new Date() } }, { new: false }, async function (err, doc) {
                                                if (err) {
                                                    return res.status(422).json({
                                                        responseCode: 422,
                                                        responseMessage: "Server Error",
                                                        responseData: err
                                                    });
                                                }
                                            });
                                        }
                                    });


                                    var p = await OrderInvoice.findById(inv._id)
                                        .populate({
                                            path: 'order',
                                            populate: [
                                                { path: 'user', select: 'name contact_no username email account_info business_info' },
                                                { path: 'car', select: 'variant value' },
                                                { path: 'address' }
                                            ]
                                        })
                                        .exec();


                                    var transactions = await q.all(fun.getOrderTransaction(p.order._id, business))

                                    var transactionData = {
                                        user: p.user,
                                        business: p.business,
                                        status: 'Sale Created',
                                        type: 'Sale',
                                        paid_by: '-',
                                        activity: "Sales Order",
                                        source: p._id,
                                        bill_id: p.invoice_no,
                                        bill_amount: p.payment.total.toFixed(2) - p.payment.discount_total.toFixed(2),
                                        transaction_amount: p.payment.total.toFixed(2) - p.payment.discount_total.toFixed(2),
                                        balance: p.payment.total.toFixed(2) - p.payment.discount_total.toFixed(2),
                                        total: p.payment.total.toFixed(2) - p.payment.discount_total.toFixed(2),
                                        paid_total: 0,
                                        due: 0,
                                        payment_status: "Pending",
                                        payment_mode: '-',
                                        received_by: loggedInDetails.name,
                                        transaction_id: '-',
                                        transaction_date: new Date(),
                                        transaction_status: 'Success',
                                        transaction_response: '-',
                                        transaction_type: "Sale",
                                    }
                                    q.all(businessFunctions.addTransaction(transactionData));

                                    var activity = {
                                        business: business,
                                        activity_by: loggedInDetails.name,
                                        activity: "Invoice Generated " + "#" + assigned_invoice_no.invoice,
                                        remark: "Invoice Generated",
                                        created_at: new Date(),
                                    }
                                    businessFunctions.salesOrderLogs(order._id, activity);

                                    var itemDetails = await q.all(fun.getBusinessOrderItems(p.order._id, business, req.headers['tz']));

                                    await fun.orderInvoice(itemDetails, p, p.order.address)


                                    var activity = 'Invoice Generate-Order'
                                    await fun.webNotification(activity, p);

                                    res.status(200).json({
                                        responseCode: 200,
                                        responseMessage: "success",
                                        responseData: {
                                            _id: p._id,
                                            id: p._id,
                                            items: await q.all(fun.getBusinessOrderItems(p.order._id, business, req.headers['tz'])),
                                            user: p.order.user,
                                            car: p.order.car,
                                            address: p.order.address,
                                            due_date: moment(p.due_date).tz(req.headers['tz']).format('lll'),
                                            delivery_date: moment(p.delivery_date).tz(req.headers['tz']).format('lll'),
                                            time_slot: p.time_slot,
                                            convenience: p.convenience,
                                            order_no: p.order_no,
                                            _order: p._order,
                                            invoice_no: p.invoice_no,
                                            address: p.order.address,
                                            payment: p.payment,
                                            status: p.status,
                                            due: p.due,
                                            log: p.log,
                                            transactions: transactions.transactions,
                                            created_at: moment(p.created_at).tz(req.headers['tz']).format('lll'),
                                            updated_at: moment(p.updated_at).tz(req.headers['tz']).format('lll'),
                                        }
                                    });
                                }

                            });
                        }
                        else {
                            res.status(422).json({
                                responseCode: 422,
                                responseMessage: "Server Error",
                                responseData: {}
                            });
                        }
                    }
                    else {
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Server Error",
                            responseData: {}
                        });
                    }
                });
        }
    }
    // }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Order not found",
            responseData: {}
        });
    }
});

router.put('/order/address/update', xAccessToken.token, async function (req, res, next) {
    var rules = {
        order: 'required',
        address: 'required',
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Due Date required",
            responseData: {
                res: validation.errors.all()
            }
        });
    }
    else {
        var business = req.headers['business'];
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var loggedInDetails = decoded.user;

        var order = await Order.findById(req.body.order).exec();
        var loggedInDetails = await User.findById(decoded.user).exec();
        if (order) {
            var address = await Address.findOne({ _id: req.body.address, user: order.user }).exec();
            if (address) {
                Order.findOneAndUpdate({ _id: order._id }, { $set: { address: address._id } }, { new: false }, async function (err, doc) {
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
                            activity: "Address Updated",
                            remark: "Address Updated",
                            created_at: new Date(),
                        }
                        businessFunctions.salesOrderLogs(order._id, activity);
                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Saved",
                            responseData: {
                                address: address
                            }
                        });
                    }
                });
            }
            else {
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Address not found",
                    responseData: {

                    }
                });
            }
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Order not found",
                responseData: {}
            });
        }
    }
});

router.put('/order/convenience/update', xAccessToken.token, async function (req, res, next) {
    var rules = {
        order: 'required',
        convenience: 'required',
        convenience_charges: 'required',
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Due Date required",
            responseData: {
                res: validation.errors.all()
            }
        });
    }
    else {
        var business = req.headers['business'];
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var date = new Date();
        var loggedInDetails = decoded.user;
        var items = [];
        var data = [];

        var item_total = 0;
        var discount = 0;
        var item_total = 0;
        var total = 0;

        var order = await Order.findById(req.body.order).exec();
        var loggedInDetails = await User.findById(decoded.user).exec();
        if (order) {
            var convenience_charges = 0;
            var items = await OrderLine.find({ order: order._id, business: business, status: { $nin: ["Cancelled"] } }).exec();
            if (req.body.convenience_charges) {
                convenience_charges = Math.ceil(req.body.convenience_charges);
            }

            var discount = parseFloat(_.sumBy(items, x => x.discount_total).toFixed(2));
            var amount = parseFloat(_.sumBy(items, x => x.amount).toFixed(2));
            var total = amount + discount + convenience_charges;

            var transaction_log = await q.all(fun.getOrderTransaction(order._id, business));
            var paid_total = transaction_log.paid_total;



            var data = {
                updated_at: new Date(),
                "payment.paid_total": paid_total,
                "payment.amount": parseFloat(amount.toFixed(2)),
                "payment.discount_total": parseFloat(discount.toFixed(2)),
                "payment.order_discount": parseFloat(order.payment.order_discount),
                "payment.convenience_charges": parseFloat(convenience_charges.toFixed(2)),
                "payment.total": parseFloat(total.toFixed(2)),
                "convenience": req.body.convenience,
                due: {
                    due: Math.ceil(amount) + convenience_charges - paid_total - (parseFloat(order.payment.order_discount))
                }
            }

            Order.findOneAndUpdate({ _id: order._id }, { $set: data }, { new: false }, async function (err, doc) {
                if (err) {
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Server Error",
                        responseData: err
                    });
                }
                else {

                    BusinessOrder.findOneAndUpdate({ order: order._id, business: business }, { $set: data }, { new: false }, async function (err, doc) {
                        if (err) {
                            res.status(422).json({
                                responseCode: 422,
                                responseMessage: "Server Error",
                                responseData: err
                            });
                        }
                        else {
                            var p = await BusinessOrder.findOne({ order: order._id, business: business })
                                .populate({
                                    path: 'order',
                                    populate: [
                                        { path: 'user', select: 'name contact_no username email account_info' },
                                        { path: 'car', select: 'title variant registration_no _automaker _model' },
                                        { path: 'address' }
                                    ]
                                })
                                .exec();

                            res.status(200).json({
                                responseCode: 200,
                                responseMessage: "success",
                                responseData: {
                                    _id: p.order._id,
                                    id: p.order._id,
                                    items: await q.all(fun.getBusinessOrderItems(p.order._id, business, req.headers['tz'])),
                                    user: p.order.user,
                                    car: p.order.car,
                                    address: p.order.address,
                                    due_date: moment(p.due_date).tz(req.headers['tz']).format('lll'),
                                    delivery_date: moment(p.delivery_date).tz(req.headers['tz']).format('lll'),
                                    time_slot: p.time_slot,
                                    convenience: p.convenience,
                                    order_no: p.order_no,
                                    address: p.order.address,
                                    payment: p.payment,
                                    status: p.status,
                                    due: p.due,
                                    log: p.log,
                                    created_at: moment(p.created_at).tz(req.headers['tz']).format('lll'),
                                    updated_at: moment(p.updated_at).tz(req.headers['tz']).format('lll'),
                                }
                            });
                        }
                    });
                }
            });

        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Order not found",
                responseData: {}
            });
        }
    }
});

router.delete('/order/item/remove/', xAccessToken.token, async function (req, res, next) {
    var rules = {
        id: 'required',
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Item required",
            responseData: {
                res: validation.errors.all()
            }
        });
    }
    else {
        var business = req.headers['business'];
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);

        var loggedInDetails = await User.findById(decoded.user).exec();
        var order = await Order.findById(req.body.order).exec();
        if (order) {
            var item = await OrderLine.findOne({ _id: req.body.id, order: order._id }).exec();
            if (item) {
                if (item.issued == false) {
                    if (item.added_by_customer == false) {
                        OrderLine.remove({ _id: item._id }, async function (err) {
                            if (err) {
                                res.status(422).json({
                                    responseCode: 422,
                                    responseMessage: "Server Error",
                                    responseData: err
                                });
                            }
                            else {
                                var businessOrder = await BusinessOrder.findOne({ order: order._id, business: business }).exec();

                                var items = await OrderLine.find({ order: order._id, business: business, status: { $nin: ["Cancelled"] } }).exec();

                                var convenience_charges = 0
                                if (businessOrder.payment.convenience_charges) {
                                    convenience_charges = Math.ceil(businessOrder.payment.convenience_charges);
                                }

                                var discount = parseFloat(_.sumBy(items, x => x.discount_total).toFixed(2));
                                var amount = parseFloat(_.sumBy(items, x => x.amount).toFixed(2));
                                var total = amount + discount + convenience_charges;

                                var transaction_log = await q.all(fun.getOrderTransaction(order._id, business));
                                var paid_total = transaction_log.paid_total;

                                var data = {
                                    updated_at: new Date(),
                                    "payment.paid_total": paid_total,
                                    "payment.amount": parseFloat(amount.toFixed(2)),
                                    "payment.discount_total": parseFloat(discount.toFixed(2)),
                                    "payment.total": parseFloat(total.toFixed(2)),
                                    "payment.order_discount": parseFloat(order.payment.order_discount),
                                    due: {
                                        due: Math.ceil(amount) + convenience_charges - paid_total - (parseFloat(order.payment.order_discount))
                                    }
                                }


                                Order.findOneAndUpdate({ _id: businessOrder.order }, { $set: data }, { new: false }, async function (err, doc) {
                                    if (err) {
                                        res.status(422).json({
                                            responseCode: 422,
                                            responseMessage: "Server Error",
                                            responseData: err
                                        });
                                    }
                                    else {
                                        BusinessOrder.findOneAndUpdate({ order: businessOrder.order, business: business }, { $set: data }, { new: false }, async function (err, doc) {
                                            if (err) {
                                                res.status(422).json({
                                                    responseCode: 422,
                                                    responseMessage: "Server Error",
                                                    responseData: err
                                                });
                                            }
                                            else {
                                                await BusinessOrder.find({ order: businessOrder.order, business: business })
                                                    .populate({ path: 'order', populate: [{ path: 'user', select: 'name contact_no username email account_info ' }, { path: 'car', select: 'title variant registration_no _automaker _model' }, { path: 'address' }] })
                                                    .cursor().eachAsync(async (p) => {

                                                        var has_invoice = false;
                                                        var invoices = await OrderInvoice.find({ order: p.order._id, business: business }).select('status invoice_no').exec();

                                                        if (invoices.length > 0) {
                                                            has_invoice = true;
                                                        }

                                                        var orders = {
                                                            _id: p.order._id,
                                                            id: p.order._id,
                                                            items: await q.all(fun.getBusinessOrderItems(p.order._id, business, req.headers['tz'])),
                                                            user: p.order.user,
                                                            car: p.order.car,
                                                            address: p.order.address,
                                                            due_date: moment(p.due_date).tz(req.headers['tz']).format('lll'),
                                                            delivery_date: moment(p.delivery_date).tz(req.headers['tz']).format('lll'),
                                                            time_slot: p.time_slot,
                                                            convenience: p.order.convenience,
                                                            order_no: p.order.order_no,
                                                            address: p.order.address,
                                                            payment: p.payment,
                                                            due: p.due,
                                                            log: p.log,
                                                            status: p.status,
                                                            has_invoice: has_invoice,
                                                            invoices: invoices,
                                                            created_at: moment(p.created_at).tz(req.headers['tz']).format('lll'),
                                                            updated_at: moment(p.updated_at).tz(req.headers['tz']).format('lll'),
                                                        };

                                                        res.status(200).json({
                                                            responseCode: 200,
                                                            responseMessage: "success",
                                                            responseData: orders
                                                        });
                                                    });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                    else {
                        res.status(400).json({
                            responseCode: 400,
                            responseMessage: "Cannot delete item added by customer",
                            responseData: {}
                        });
                    }
                }
                else {
                    res.status(400).json({
                        responseCode: 400,
                        responseMessage: "Error! This item has been issued from inventory",
                        responseData: {}
                    });
                }
            }
            else {
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Item not found",
                    responseData: {}
                });
            }
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Order not found",
                responseData: {}
            });
        }
    }
});

router.get('/order/items/search/old', xAccessToken.token, async function (req, res, next) {
    var rules = {
        query: 'required',
        // quantity: 'required',
    };

    var validation = new Validator(req.query, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Part Name / Part No Required",
            responseData: {
                res: validation.errors.all()
            }
        })
    }
    else {
        var id = mongoose.Types.ObjectId();

        if (parseFloat(req.query.quantity) > 0) {
            var business = req.headers['business'];
            var token = req.headers['x-access-token'];
            var secret = config.secret;
            var decoded = jwt.verify(token, secret);
            var data = [];
            await BusinessProduct.find({ business: business, list_type: { $in: ["Offline"] }, $or: [{ part_no: new RegExp(req.query.query, "i") }, { title: new RegExp(req.query.query, "i") }, { models: { $in: new RegExp(req.query.query, "i") } }] })
                .cursor().eachAsync(async (p) => {
                    var quantity = parseFloat(req.query.quantity);
                    if (p.stock.available >= quantity) {
                        var rate = p.price.sell_price;
                        var base = p.price.sell_price * quantity;
                        var amount = p.price.sell_price * quantity;

                        var tax_info = await Tax.findOne({ tax: p.tax }).exec();
                        var tax_rate = tax_info.detail;
                        var tax = [];

                        var x = (100 + p.tax_info.rate) / 100;
                        var tax_on_amount = amount / x;
                        if (tax_rate.length > 0) {
                            for (var r = 0; r < tax_rate.length; r++) {
                                if (tax_rate[r].rate != tax_info.rate) {
                                    var t = tax_on_amount * (tax_rate[r].rate / 100);
                                    base = base - t
                                    tax.push({
                                        tax: tax_rate[r].tax,
                                        rate: tax_rate[r].rate,
                                        amount: parseFloat(t.toFixed(2))
                                    });
                                }
                                else {
                                    var t = amount - tax_on_amount;
                                    base = base - t
                                    tax.push({
                                        tax: tax_info.tax,
                                        rate: tax_info.rate,
                                        amount: parseFloat(t.toFixed(2))
                                    });
                                }
                            }
                        }

                        var tax_details = {
                            tax: tax_info.tax,
                            rate: tax_info.rate,
                            amount: p.price.sell_price,
                            detail: tax
                        };

                        data.push({
                            _id: id,
                            id: id,
                            title: p.title,
                            sku: p.sku,
                            part_no: p.part_no,
                            hsn_sac: p.hsn_sac,
                            product: p._id,
                            unit: p.unit,
                            issued: false,
                            quantity: quantity,
                            mrp: parseFloat(rate.toFixed(2)),
                            selling_price: parseFloat(rate.toFixed(2)),
                            rate: parseFloat(rate.toFixed(2)),
                            base: parseFloat(base.toFixed(2)),
                            amount: parseFloat(amount.toFixed(2)),
                            discount: 0,
                            amount_is_tax: p.amount_is_tax,
                            tax_amount: parseFloat(_.sumBy(tax, x => x.amount).toFixed(2)),
                            tax: p.tax,
                            tax_rate: p.tax_info.rate,
                            tax_info: tax_details,
                            out_of_stock: false,
                            available: p.stock.available,
                            business: p.business,
                        });
                    }
                    else if (p.stock.available < quantity && p.stock.available > 0) {
                        var rate = p.price.sell_price;
                        var base = p.price.sell_price * quantity;
                        var amount = p.price.sell_price * quantity;

                        var tax_info = await Tax.findOne({ tax: p.tax }).exec();
                        var tax_rate = tax_info.detail;
                        var tax = [];

                        var x = (100 + p.tax_info.rate) / 100;
                        var tax_on_amount = amount / x;
                        if (tax_rate.length > 0) {
                            for (var r = 0; r < tax_rate.length; r++) {
                                if (tax_rate[r].rate != tax_info.rate) {
                                    var t = tax_on_amount * (tax_rate[r].rate / 100);
                                    base = base - t
                                    tax.push({
                                        tax: tax_rate[r].tax,
                                        rate: tax_rate[r].rate,
                                        amount: parseFloat(t.toFixed(2))
                                    });
                                }
                                else {
                                    var t = amount - tax_on_amount;
                                    base = base - t
                                    tax.push({
                                        tax: tax_info.tax,
                                        rate: tax_info.rate,
                                        amount: parseFloat(t.toFixed(2))
                                    });
                                }
                            }
                        }

                        var tax_details = {
                            tax: tax_info.tax,
                            rate: tax_info.rate,
                            amount: p.price.sell_price,
                            detail: tax
                        }

                        data.push({
                            _id: id,
                            sku: p.sku,
                            title: p.title,
                            part_no: p.part_no,
                            hsn_sac: p.hsn_sac,
                            product: p._id,
                            quantity: quantity,
                            mrp: parseFloat(rate.toFixed(2)),
                            selling_price: parseFloat(rate.toFixed(2)),
                            rate: parseFloat(rate.toFixed(2)),
                            base: parseFloat(base.toFixed(2)),
                            amount: parseFloat(amount.toFixed(2)),
                            issued: false,
                            discount: 0,
                            unit: p.unit,
                            amount_is_tax: p.amount_is_tax,
                            tax_amount: parseFloat(_.sumBy(tax, x => x.amount).toFixed(2)),
                            tax: p.tax,
                            tax_rate: p.tax_info.rate,
                            tax_info: tax_details,
                            out_of_stock: false,
                            stock_available: p.stock.available,
                            business: p.business,
                        });
                    }
                    else if (p.stock.available <= 0) {
                        var rate = p.price.sell_price;
                        var base = p.price.sell_price * quantity;
                        var amount = p.price.sell_price * quantity;

                        var tax_info = await Tax.findOne({ tax: p.tax }).exec();
                        var tax_rate = tax_info.detail;
                        var tax = [];

                        var x = (100 + p.tax_info.rate) / 100;
                        var tax_on_amount = amount / x;
                        if (tax_rate.length > 0) {
                            for (var r = 0; r < tax_rate.length; r++) {
                                if (tax_rate[r].rate != tax_info.rate) {
                                    var t = tax_on_amount * (tax_rate[r].rate / 100);
                                    base = base - t
                                    tax.push({
                                        tax: tax_rate[r].tax,
                                        rate: tax_rate[r].rate,
                                        amount: parseFloat(t.toFixed(2))
                                    });
                                }
                                else {
                                    var t = amount - tax_on_amount;
                                    //base = base - discount_total;
                                    tax.push({
                                        tax: tax_info.tax,
                                        rate: tax_info.rate,
                                        amount: parseFloat(t.toFixed(2))
                                    });
                                }
                            }
                        }

                        var tax_details = {
                            tax: tax_info.tax,
                            rate: tax_info.rate,
                            amount: p.price.sell_price,
                            detail: tax
                        }

                        data.push({
                            _id: id,
                            id: id,
                            sku: p.sku,
                            title: p.title,
                            part_no: p.part_no,
                            hsn_sac: p.hsn_sac,
                            product: p._id,
                            quantity: quantity,
                            mrp: parseFloat(rate.toFixed(2)),
                            selling_price: parseFloat(rate.toFixed(2)),
                            rate: parseFloat(rate.toFixed(2)),
                            base: parseFloat(base.toFixed(2)),
                            amount: parseFloat(amount.toFixed(2)),
                            discount: 0,
                            issued: false,
                            unit: p.unit,
                            tax_amount: parseFloat(_.sumBy(tax, x => x.amount).toFixed(2)),
                            amount_is_tax: p.amount_is_tax,
                            tax: p.tax,
                            tax_rate: p.tax_info.rate,
                            tax_info: tax_details,
                            out_of_stock: true,
                            stock_available: 0,
                            business: p.business,
                        });
                    }
                });

            res.status(200).json({
                responseCode: 200,
                responseMessage: "",
                responseData: data
            })
        }
        else {
            res.status(422).json({
                responseCode: 422,
                responseMessage: "Part/Part No & quantity required",
                responseData: {}
            })
        }
    }
});


router.post('/order/item/add', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /order/item/add Api Called from order.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

    var business = req.headers['business'];
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var date = new Date();
    var loggedInDetails = decoded.user;
    var items = [];
    var data = [];
    var convenience_charges = 0;
    var item_total = 0;
    var discount = 0;
    var item_total = 0;
    var total = 0;

    var order = await Order.findById(req.body.order).exec();
    var loggedInDetails = await User.findById(decoded.user).exec();
    if (order) {
        var products = req.body.items;
        if (products.title != "") {
            var businessOrder = await BusinessOrder.findOne({ order: order._id, business: business }).exec();

            var log = {
                status: "Confirmed",
                type: "Counter",
                activity: "Confirmed",
                user: loggedInDetails._id,
                name: loggedInDetails.name,
                created_at: date,
                updated_at: date,
            }
            var id = mongoose.Types.ObjectId();
            if (products.id != null) {
                id = products.id
            }
            if (products) {
                var tax_info = await Tax.findOne({ tax: products.tax }).exec();
                if (products.product) {
                    console.log("IF  - ")

                    var product = await BusinessProduct.findOne({ _id: products.product, business: business }).exec();
                    if (product) {
                        var tax = [];
                        var rate = products.rate;
                        var amount = products.rate * products.quantity;
                        var tax_rate = tax_info.detail;
                        var discount_total = 0;
                        var base = amount

                        var discount = products.discount;

                        if (discount.indexOf("%") >= 0) {
                            discount = parseFloat(discount);
                            if (!isNaN(discount) && discount > 0) {
                                discount_total = amount * (discount / 100);
                                amount = amount - parseFloat(discount_total.toFixed(2))
                            }
                        }
                        else {
                            if (discount == "") {
                                discount = "0"
                            }

                            discount_total = parseFloat(discount);

                            if (!isNaN(discount_total) && discount_total > 0) {
                                amount = amount - parseFloat(discount_total.toFixed(2))
                            }
                        }

                        if (products.amount_is_tax == "exclusive") {
                            if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                                businessFunctions.logs("DEBUG: Calculate Tax for tax type is exclusive.");
                            }
                            var tax_on_amount = amount;
                            if (tax_rate.length > 0) {
                                for (var r = 0; r < tax_rate.length; r++) {
                                    if (tax_rate[r].rate != tax_info.rate) {
                                        var t = tax_on_amount * (tax_rate[r].rate / 100);
                                        amount = amount + t;
                                        tax.push({
                                            tax: tax_rate[r].tax,
                                            rate: tax_rate[r].rate,
                                            amount: parseFloat(t.toFixed(2))
                                        })
                                    }
                                    else {
                                        var t = tax_on_amount * (tax_info.rate / 100);
                                        amount = amount + t;
                                        tax.push({
                                            tax: tax_info.tax, tax_rate: tax_info.rate,
                                            rate: tax_info.rate,
                                            amount: parseFloat(t.toFixed(2))
                                        })
                                    }
                                }
                            }
                        }

                        if (products.amount_is_tax == "inclusive") {
                            var x = (100 + tax_info.rate) / 100;
                            var tax_on_amount = amount / x;
                            if (tax_rate.length > 0) {
                                for (var r = 0; r < tax_rate.length; r++) {
                                    if (tax_rate[r].rate != tax_info.rate) {
                                        var t = tax_on_amount * (tax_rate[r].rate / 100);
                                        base = base - t;
                                        tax.push({
                                            tax: tax_rate[r].tax,
                                            rate: tax_rate[r].rate,
                                            amount: parseFloat(t.toFixed(2))
                                        });
                                    }
                                    else {
                                        var t = amount - tax_on_amount;
                                        base = base - t;
                                        tax.push({
                                            tax: tax_info.tax,
                                            rate: tax_info.rate,
                                            amount: parseFloat(t.toFixed(2))
                                        });
                                    }
                                }
                            }
                            //base = base - discount_total;
                        }

                        var tax_details = {
                            tax: tax_info.tax,
                            rate: tax_info.rate,
                            amount: total,
                            detail: tax
                        }

                        items = {
                            _id: id,
                            order: order._id,
                            product: product._id,
                            category: product.category,
                            _category: product._category,
                            subcategory: product.subcategory,
                            _subcategory: product._subcategory,
                            product_brand: product.product_brand,
                            _brand: product.product_brand,
                            product_model: product.product_model,
                            _model: product.product_model,
                            source: product.source,
                            part_no: products.part_no,
                            hsn_sac: products.hsn_sac,
                            unit: products.unit,
                            title: products.title,
                            sku: products.sku,
                            mrp: products.selling_price,
                            selling_price: products.selling_price,
                            rate: products.rate,
                            quantity: products.quantity,
                            base: parseFloat(base.toFixed(2)),
                            amount: amount,
                            discount: products.discount,
                            discount_total: parseFloat(discount_total.toFixed(2)),
                            amount_is_tax: products.amount_is_tax,
                            tax_amount: parseFloat(_.sumBy(tax, x => x.amount).toFixed(2)),
                            amount: parseFloat(amount.toFixed(2)),
                            tax: tax_info.tax,
                            tax_rate: tax_info.rate,
                            tax_info: tax,
                            issued: true,
                            added_by_customer: false,
                            delivery_date: businessOrder.delivery_date,
                            tracking_no: Math.round(+new Date() / 1000) + "-" + Math.ceil((Math.random() * 90000) + 10000),
                            business: business,
                            created_at: new Date(),
                            updated_at: new Date()
                        }
                    }
                    else {
                        if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
                            businessFunctions.logs("WARNING: Items not found, Item_Name:" + req.body.items.title);
                        }
                        return res.status(400).json({
                            responseCode: 400,
                            responseMessage: "Items not found",
                            responseData: {}
                        });
                    }
                }
                else {
                    console.log("Else  - ")
                    var tax = [];
                    var rate = products.rate;
                    var amount = products.rate * products.quantity;
                    var tax_rate = tax_info.detail;
                    var discount_total = 0
                    var base = amount;
                    var discount = products.discount;

                    if (discount.indexOf("%") >= 0) {
                        discount = parseFloat(discount);
                        if (!isNaN(discount) && discount > 0) {
                            discount_total = amount * (discount / 100);
                            if (parseFloat(discount_total.toFixed(2)) > amount) {
                                products.discount = amount.toString();
                                discount_total = amount;
                            }

                            amount = amount - parseFloat(discount_total.toFixed(2))
                        }
                    }
                    else {
                        discount_total = parseFloat(discount);
                        if (!isNaN(discount_total) && discount_total > 0) {
                            if (parseFloat(discount_total.toFixed(2)) > amount) {
                                products.discount = amount.toString();
                                discount_total = amount;
                            }

                            amount = amount - parseFloat(discount_total.toFixed(2))
                        }
                    }

                    if (products.amount_is_tax == "exclusive") {
                        var tax_on_amount = amount;
                        if (tax_rate.length > 0) {
                            for (var r = 0; r < tax_rate.length; r++) {
                                if (tax_rate[r].rate != tax_info.rate) {
                                    var t = tax_on_amount * (tax_rate[r].rate / 100);
                                    amount = amount + t;
                                    tax.push({
                                        tax: tax_rate[r].tax,
                                        rate: tax_rate[r].rate,
                                        amount: parseFloat(t.toFixed(2))
                                    })
                                }
                                else {
                                    var t = tax_on_amount * (tax_info.rate / 100);
                                    amount = amount + t;
                                    tax.push({
                                        tax: tax_info.tax, tax_rate: tax_info.rate,
                                        rate: tax_info.rate,
                                        amount: parseFloat(t.toFixed(2))
                                    })
                                }
                            }
                        }
                    }

                    if (products.amount_is_tax == "inclusive") {
                        amount = amount;
                        var x = (100 + tax_info.rate) / 100;
                        var tax_on_amount = amount / x;
                        if (tax_rate.length > 0) {
                            for (var r = 0; r < tax_rate.length; r++) {
                                if (tax_rate[r].rate != tax_info.rate) {
                                    var t = tax_on_amount * (tax_rate[r].rate / 100);
                                    base = base - t;
                                    tax.push({
                                        tax: tax_rate[r].tax,
                                        rate: tax_rate[r].rate,
                                        amount: parseFloat(t.toFixed(2))
                                    });
                                }
                                else {
                                    var t = amount - tax_on_amount;
                                    base = base - t;
                                    tax.push({
                                        tax: tax_info.tax,
                                        rate: tax_info.rate,
                                        amount: parseFloat(t.toFixed(2))
                                    });
                                }
                            }
                        }

                        //base = base - discount_total;
                    }

                    var tax_details = {
                        tax: tax_info.tax,
                        rate: tax_info.rate,
                        amount: total,
                        detail: tax
                    }

                    items = {
                        _id: id,
                        order: order._id,
                        product: products.product,
                        category: null,
                        _category: "",
                        subcategory: null,
                        _subcategory: "",
                        product_brand: null,
                        _brand: "",
                        product_model: null,
                        _model: "",
                        source: products.source,
                        part_no: products.part_no,
                        hsn_sac: products.hsn_sac,
                        unit: products.unit,
                        title: products.title,
                        quantity: products.quantity,
                        unit: products.unit,
                        sku: products.sku,
                        mrp: products.selling_price,
                        selling_price: products.selling_price,
                        rate: products.rate,
                        base: parseFloat(base.toFixed(2)),
                        discount: products.discount,
                        discount_total: parseFloat(discount_total.toFixed(2)),
                        amount_is_tax: products.amount_is_tax,
                        tax_amount: parseFloat(_.sumBy(tax, x => x.amount).toFixed(2)),
                        amount: parseFloat(amount.toFixed(2)),
                        tax: tax_info.tax,
                        tax_rate: tax_info.rate,
                        tax_info: tax,
                        issued: false,
                        added_by_customer: false,
                        delivery_date: businessOrder.delivery_date,
                        tracking_no: Math.round(+new Date() / 1000) + "-" + Math.ceil((Math.random() * 90000) + 10000),
                        business: products.business,
                        created_at: new Date(),
                        updated_at: new Date()
                    };
                }
            }

            await OrderLine.create(items).then(async function (ol) {
                var items = await OrderLine.find({ order: order._id, issued: true, business: business, status: { $nin: ["Cancelled"] } }).exec();

                if (businessOrder.payment.convenience_charges) {
                    convenience_charges = Math.ceil(businessOrder.payment.convenience_charges);
                }

                var discount = parseFloat(_.sumBy(items, x => x.discount_total).toFixed(2));
                var amount = parseFloat(_.sumBy(items, x => x.amount).toFixed(2));
                var total = amount + discount + convenience_charges;

                var transaction_log = await q.all(fun.getOrderTransaction(order._id, business));
                var paid_total = transaction_log.paid_total;

                var data = {
                    updated_at: new Date(),
                    "payment.paid_total": paid_total,
                    "payment.amount": parseFloat(amount.toFixed(2)),
                    "payment.discount_total": parseFloat(discount.toFixed(2)),
                    "payment.total": parseFloat(total.toFixed(2)),
                    "payment.order_discount": parseFloat(order.payment.order_discount),
                    due: {
                        due: Math.ceil(amount) + convenience_charges - paid_total - (parseFloat(order.payment.order_discount))
                    }
                }
                var user = await User.findById(order.user).exec();

                if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                    businessFunctions.logs("DEBUG: businessFunctions.salesPartIssue(ol, business, user, loggedInDetails) function called.");
                }
                var issued = await q.all(businessFunctions.salesPartIssue(ol, business, user, loggedInDetails));
                if (issued) {
                    await OrderLine.findOneAndUpdate({ _id: order._id }, { $set: { issued: issued, updated_at: new Date() } }, { new: false }, async function (err, doc) { })
                }
                // console.log("Issued = " + issued)

                await Order.findOneAndUpdate({ _id: ol._id }, { $set: data }, { new: false }, async function (err, doc) {
                    if (err) {
                        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                            businessFunctions.logs("ERROR: Server Error Occured while updating order details, OrderId:" + order._id + ", " + "User:" + loggedInDetails.name);
                        }
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Server Error",
                            responseData: err
                        });
                    }
                    else {
                        await BusinessOrder.findOneAndUpdate({ order: order._id, business: business }, { $set: data }, { new: false }, async function (err, doc) {
                            if (err) {
                                if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                                    businessFunctions.logs("ERROR: Server Error Occured while updating Business order details, OrderId:" + order._id + ", " + "User:" + loggedInDetails.name);
                                }
                                res.status(422).json({
                                    responseCode: 422,
                                    responseMessage: "Server Error",
                                    responseData: err
                                });
                            }
                            else {
                                await BusinessOrder.find({ order: businessOrder.order, business: business })
                                    .populate({ path: 'order', populate: [{ path: 'user', select: 'name contact_no username email account_info ' }, { path: 'car', select: 'title variant registration_no _automaker _model' }, { path: 'address' }] })
                                    .cursor().eachAsync(async (p) => {

                                        var has_invoice = false;
                                        var invoices = await OrderInvoice.find({ order: p.order._id, business: business }).select('status invoice_no').exec();

                                        if (invoices.length > 0) {
                                            has_invoice = true;
                                        }



                                        var orders = {
                                            _id: p.order._id,
                                            id: p.order._id,
                                            items: await q.all(fun.getBusinessOrderItems(p.order._id, business, req.headers['tz'])),
                                            user: p.order.user,
                                            car: p.order.car,
                                            address: p.order.address,
                                            due_date: moment(p.due_date).tz(req.headers['tz']).format('lll'),
                                            delivery_date: moment(p.delivery_date).tz(req.headers['tz']).format('lll'),
                                            time_slot: p.time_slot,
                                            convenience: p.order.convenience,
                                            order_no: p.order.order_no,
                                            address: p.order.address,
                                            payment: p.payment,
                                            due: p.due,
                                            log: p.log,
                                            status: p.status,
                                            has_invoice: has_invoice,
                                            invoices: invoices,
                                            created_at: moment(p.created_at).tz(req.headers['tz']).format('lll'),
                                            updated_at: moment(p.updated_at).tz(req.headers['tz']).format('lll'),
                                        };
                                        var activity = {
                                            business: business,
                                            activity_by: loggedInDetails.name,
                                            activity: "'" + products.title + "' Added to Order",
                                            remark: "Item Added",
                                            created_at: new Date(),
                                        }
                                        businessFunctions.salesOrderLogs(order._id, activity);

                                        res.status(200).json({
                                            responseCode: 200,
                                            responseMessage: "success",
                                            responseData: orders
                                        });
                                        if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                                            businessFunctions.logs("INFO: Item Added Successfully, Item_Name:" + products.title + ", " + "Added_By:" + orders.user.name + ", " + "User:" + loggedInDetails.name);
                                        }
                                    });
                            }
                        });
                    }
                });
            });
        }
        else {
            if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("INFO: Add new Item, Item_Name:" + req.body.items.title + ", " + "User:" + loggedInDetails.name);
            }
            res.status(200).json({
                responseCode: 200,
                responseMessage: "Add New Item",
                responseData: {}
            });
        }
    }
    else {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR: Order not found for the orderId:" + req.body.order + ", " + "User:" + loggedInDetails.name);
        }
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Order not found",
            responseData: {}
        });
    }
});

router.put('/order/item/product/update', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /order/item/product/update Api Called from order.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

    var business = req.headers['business'];
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var date = new Date();
    var loggedInDetails = decoded.user;
    var items = [];
    var data = [];

    var item_total = 0;
    var discount = 0;
    var item_total = 0;
    var total = 0;

    var order = await Order.findById(req.body.order).exec();
    var loggedInDetails = await User.findById(decoded.user).exec();
    if (order) {
        var date = new Date();
        var log = {
            status: "Confirmed",
            type: "Counter",
            activity: "Confirmed",
            user: loggedInDetails._id,
            name: loggedInDetails.name,
            created_at: date,
            updated_at: date,
        };

        var products = req.body.item;

        if (products) {
            var tax_info = await Tax.findOne({ tax: products.tax }).exec();
            var orderLine = await OrderLine.findOne({ _id: products.id }).exec();
            if (orderLine) {
                var businessProduct = await BusinessProduct.findOne({ _id: products.product }).exec();
                if (businessProduct) {
                    var tax = [];
                    var rate = products.rate;
                    var amount = products.rate * products.quantity;
                    var tax_rate = tax_info.detail;
                    var discount_total = 0
                    var base = amount

                    var discount = products.discount;

                    if (discount.indexOf("%") >= 0) {
                        discount = parseFloat(discount);
                        if (!isNaN(discount) && discount > 0) {
                            discount_total = amount * (discount / 100);
                            amount = amount - parseFloat(discount_total.toFixed(2))
                        }
                    }
                    else {
                        if (discount == "") {
                            discount = "0"
                        }

                        discount_total = parseFloat(discount);
                        if (!isNaN(discount_total) && discount_total > 0) {
                            amount = amount - parseFloat(discount_total.toFixed(2))
                        }
                    }

                    if (products.amount_is_tax == "exclusive") {
                        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                            businessFunctions.logs("DEBUG: Calculate Tax for tax type is exclusive.");
                        }
                        var tax_on_amount = amount;
                        if (tax_rate.length > 0) {
                            for (var r = 0; r < tax_rate.length; r++) {
                                if (tax_rate[r].rate != tax_info.rate) {
                                    var t = tax_on_amount * (tax_rate[r].rate / 100);
                                    amount = amount + t;
                                    tax.push({
                                        tax: tax_rate[r].tax,
                                        rate: tax_rate[r].rate,
                                        amount: parseFloat(t.toFixed(2))
                                    })
                                }
                                else {
                                    var t = tax_on_amount * (tax_info.rate / 100);
                                    amount = amount + t;
                                    tax.push({
                                        tax: tax_info.tax, tax_rate: tax_info.rate,
                                        rate: tax_info.rate,
                                        amount: parseFloat(t.toFixed(2))
                                    })
                                }
                            }
                        }
                    }

                    if (products.amount_is_tax == "inclusive") {
                        var x = (100 + tax_info.rate) / 100;
                        var tax_on_amount = amount / x;
                        if (tax_rate.length > 0) {
                            for (var r = 0; r < tax_rate.length; r++) {
                                if (tax_rate[r].rate != tax_info.rate) {
                                    var t = tax_on_amount * (tax_rate[r].rate / 100);
                                    base = base - t;
                                    tax.push({
                                        tax: tax_rate[r].tax,
                                        rate: tax_rate[r].rate,
                                        amount: parseFloat(t.toFixed(2))
                                    });
                                }
                                else {
                                    var t = amount - tax_on_amount;
                                    base = base - t;
                                    tax.push({
                                        tax: tax_info.tax,
                                        rate: tax_info.rate,
                                        amount: parseFloat(t.toFixed(2))
                                    });
                                }
                            }
                        }

                        //base =base- discount_total;
                    }

                    var tax_details = {
                        tax: tax_info.tax,
                        rate: tax_info.rate,
                        amount: total,
                        detail: tax
                    }

                    var item = {
                        order: order._id,
                        product: businessProduct._id,
                        category: businessProduct.category,
                        _category: businessProduct._category,
                        subcategory: businessProduct.subcategory,
                        _subcategory: businessProduct._subcategory,
                        product_brand: businessProduct.product_brand,
                        _brand: businessProduct.product_brand,
                        product_model: businessProduct.product_model,
                        _model: businessProduct.product_model,
                        source: businessProduct.source,
                        status: orderLine.status,
                        part_no: products.part_no,
                        hsn_sac: products.hsn_sac,
                        unit: products.unit,
                        title: products.title,
                        sku: products.sku,
                        mrp: products.mrp,
                        selling_price: products.selling_price,
                        rate: products.rate,
                        quantity: products.quantity,
                        base: parseFloat(base.toFixed(2)),
                        amount: amount,
                        discount: products.discount,
                        discount_total: parseFloat(discount_total.toFixed(2)),
                        amount_is_tax: products.amount_is_tax,
                        tax_amount: parseFloat(_.sumBy(tax, x => x.amount).toFixed(2)),
                        amount: parseFloat(amount.toFixed(2)),
                        tax: tax_info.tax,
                        tax_rate: tax_info.rate,
                        tax_info: tax,
                        issued: products.issued,
                        business: business,
                        updated_at: new Date()
                    };

                    await OrderLine.findOneAndUpdate({ _id: orderLine._id }, { $set: item }, { new: false }, async function (err, doc) {
                        if (err) {
                            if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                                businessFunctions.logs("ERROR: Server Error Occured while updating order Line details, OrderId:" + order._id + ", " + "User:" + loggedInDetails.name);
                            }
                            return res.status(422).json({
                                responseCode: 422,
                                responseMessage: "Server Error",
                                responseData: err
                            });
                        }
                    });
                }
                else {
                    return res.status(400).json({
                        responseCode: 400,
                        responseMessage: "Product not found",
                        responseData: {}
                    });
                }
            }
            else {
                return res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Item not found",
                    responseData: {}
                });
            }
        }
        else {
            return res.status(400).json({
                responseCode: 400,
                responseMessage: "Items not found",
                responseData: {}
            });
        }

        var businessOrder = await BusinessOrder.findOne({ order: order._id, business: business }).exec();
        var items = await OrderLine.find({ order: order._id, business: business, status: { $nin: ['Cancelled'] } }).exec();

        var convenience_charges = 0;
        if (businessOrder.payment.convenience_charges) {
            convenience_charges = Math.ceil(businessOrder.payment.convenience_charges)
        }

        var amount = _.sumBy(items, x => x.amount);
        var discount = _.sumBy(items, x => x.discount_total);
        var total = amount + discount + convenience_charges;

        var transaction_log = await q.all(fun.getOrderTransaction(order._id, business));
        var paid_total = transaction_log.paid_total;

        var data = {
            updated_at: new Date(),
            "payment.paid_total": paid_total,
            "payment.amount": parseFloat(amount.toFixed(2)),
            "payment.discount_total": parseFloat(discount.toFixed(2)),
            "payment.total": parseFloat(total.toFixed(2)),
            "payment.order_discount": parseFloat(order.payment.order_discount),
            due: {
                due: Math.ceil(amount) + convenience_charges - paid_total - (parseFloat(order.payment.order_discount))
            }
        }

        Order.findOneAndUpdate({ _id: businessOrder.order }, { $set: data }, { new: false }, async function (err, doc) {
            if (err) {
                if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                    businessFunctions.logs("ERROR: Server Error Occured while updating order details, OrderId:" + order._id + ", " + "User:" + loggedInDetails.name);
                }
                res.status(422).json({
                    responseCode: 422,
                    responseMessage: "Server Error",
                    responseData: err
                });
            }
            else {
                BusinessOrder.findOneAndUpdate({ order: businessOrder.order, business: business }, { $set: data }, { new: false }, async function (err, doc) {
                    if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                        businessFunctions.logs("ERROR: Server Error Occured while updating Business order details, OrderId:" + order._id + ", " + "User:" + loggedInDetails.name);
                    }
                    if (err) {
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Server Error",
                            responseData: err
                        });
                    }
                    else {
                        await BusinessOrder.find({ order: businessOrder.order, business: business })
                            .populate({ path: 'order', populate: [{ path: 'user', select: 'name contact_no username email account_info ' }, { path: 'car', select: 'title variant registration_no _automaker _model' }, { path: 'address' }] })
                            .cursor().eachAsync(async (p) => {
                                var has_invoice = false;
                                var invoices = await OrderInvoice.find({ order: p.order._id, business: business }).select('status invoice_no').exec();

                                if (invoices.length > 0) {
                                    has_invoice = true;
                                }
                                var orders = {
                                    _id: p.order._id,
                                    id: p.order._id,
                                    items: await q.all(fun.getBusinessOrderItems(p.order._id, business, req.headers['tz'])),
                                    user: p.order.user,
                                    car: p.order.car,
                                    address: p.order.address,
                                    due_date: moment(p.due_date).tz(req.headers['tz']).format('lll'),
                                    delivery_date: moment(p.delivery_date).tz(req.headers['tz']).format('lll'),
                                    time_slot: p.time_slot,
                                    convenience: p.order.convenience,
                                    order_no: p.order.order_no,
                                    address: p.order.address,
                                    payment: p.payment,
                                    due: p.due,
                                    log: p.log,
                                    status: p.status,
                                    has_invoice: has_invoice,
                                    invoices: invoices,
                                    created_at: moment(p.created_at).tz(req.headers['tz']).format('lll'),
                                    updated_at: moment(p.updated_at).tz(req.headers['tz']).format('lll'),
                                };

                                res.status(200).json({
                                    responseCode: 200,
                                    responseMessage: "success",
                                    responseData: orders
                                });
                                if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                                    businessFunctions.logs("INFO: Item Added Successfully, Item_Name:" + products.title + ", " + "Added_By:" + orders.user.name + ", " + "User:" + loggedInDetails.name);
                                }
                            });
                    }
                });
            }
        });
    }
    else {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR: Order not found for the orderId:" + req.body.order + ", " + "User:" + loggedInDetails.name);
        }
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Order not found",
            responseData: {}
        });
    }
});

router.delete('/order/item/return', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO:/order/item/return Api Called from order.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

    var business = req.headers['business'];
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var date = new Date();
    var loggedInDetails = decoded.user;
    var items = [];
    var data = [];
    var convenience_charges = 0;
    var amount = 0;
    var discount = 0;
    var total = 0;

    var item = await OrderLine.findOne({ _id: req.body.id, status: { $nin: ["Cancelled"] } }).populate({ path: 'order', select: 'user' }).exec();
    var loggedInDetails = await User.findById(decoded.user).exec();
    if (item) {
        var businessOrder = await BusinessOrder.findOne({ order: item.order, business: business }).exec();
        // var user = await User.findById(item.order.user)
        if (item.issued == true) {
            var r = await q.all(businessFunctions.orderItemReturn(item));
            // console.log("Item Removed " + r)
            if (r) {
                item.status = 'Cancelled'
                item.markModified('status')
                item.save();

                var items = await OrderLine.find({ order: item.order, business: business, issued: true, status: { $nin: ["Cancelled"] } }).exec();


                if (businessOrder.payment.convenience_charges) {
                    convenience_charges = Math.ceil(businessOrder.payment.convenience_charges);
                }

                var discount = parseFloat(_.sumBy(items, x => x.discount_total).toFixed(2));
                var amount = parseFloat(_.sumBy(items, x => x.amount).toFixed(2));
                var total = amount + discount + convenience_charges;
                // console.log("2828 Total =" + total)
                var transaction_log = await q.all(fun.getOrderTransaction(item.order, business));
                var paid_total = transaction_log.paid_total;

                var data = {
                    updated_at: new Date(),
                    "payment.paid_total": paid_total,
                    "payment.amount": parseFloat(amount.toFixed(2)),
                    "payment.discount_total": parseFloat(discount.toFixed(2)),
                    "payment.total": parseFloat(total.toFixed(2)),
                    "payment.order_discount": parseFloat(businessOrder.payment.order_discount),
                    due: {
                        due: Math.ceil(amount) + convenience_charges - paid_total - (parseFloat(businessOrder.payment.order_discount))
                    }
                }

                await OrderInvoice.findOneAndUpdate({ order: businessOrder.order, status: "Active" }, {
                    $set: {
                        due: {
                            due: Math.ceil(amount) + convenience_charges - paid_total
                        }
                    }
                }, { new: false }, async function (err, doc) { })



                await Order.findOneAndUpdate({ _id: businessOrder.order }, { $set: data }, { new: false }, async function (err, doc) {
                    if (err) {
                        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                            businessFunctions.logs("ERROR: Server Error Occured while updating order details, OrderId:" + order._id + ", " + "User:" + loggedInDetails.name);
                        }
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Server Error",
                            responseData: err
                        });
                    }
                    else {
                        await BusinessOrder.findOneAndUpdate({ order: businessOrder.order, business: business }, { $set: data }, { new: false }, async function (err, doc) {
                            if (err) {
                                if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                                    businessFunctions.logs("ERROR: Server Error Occured while updating Business order details, OrderId:" + order._id + ", " + "User:" + loggedInDetails.name);
                                }
                                res.status(422).json({
                                    responseCode: 422,
                                    responseMessage: "Server Error",
                                    responseData: err
                                });
                            }
                            else {
                                await BusinessOrder.find({ order: businessOrder.order, business: business })
                                    .populate({ path: 'order', populate: [{ path: 'user', select: 'name contact_no username email account_info ' }, { path: 'car', select: 'title variant registration_no _automaker _model' }, { path: 'address' }] })
                                    .cursor().eachAsync(async (p) => {

                                        var has_invoice = false;
                                        var invoices = await OrderInvoice.find({ order: p.order._id, business: business }).select('status invoice_no').exec();

                                        if (invoices.length > 0) {
                                            has_invoice = true;
                                        }

                                        var orders = {
                                            _id: p.order._id,
                                            id: p.order._id,
                                            items: await q.all(fun.getBusinessOrderItems(p.order._id, business, req.headers['tz'])),
                                            user: p.order.user,
                                            car: p.order.car,
                                            address: p.order.address,
                                            due_date: moment(p.due_date).tz(req.headers['tz']).format('lll'),
                                            delivery_date: moment(p.delivery_date).tz(req.headers['tz']).format('lll'),
                                            time_slot: p.time_slot,
                                            convenience: p.order.convenience,
                                            order_no: p.order.order_no,
                                            address: p.order.address,
                                            payment: p.payment,
                                            due: p.due,
                                            log: p.log,
                                            status: p.status,
                                            has_invoice: has_invoice,
                                            invoices: invoices,
                                            created_at: moment(p.created_at).tz(req.headers['tz']).format('lll'),
                                            updated_at: moment(p.updated_at).tz(req.headers['tz']).format('lll'),
                                        };
                                        var activity = {
                                            business: business,
                                            activity_by: loggedInDetails.name,
                                            activity: "'" + item.title + "' removed from Order",
                                            remark: "Item Removed",
                                            created_at: new Date(),
                                        }
                                        businessFunctions.salesOrderLogs(p.order._id, activity);

                                        res.status(200).json({
                                            responseCode: 200,
                                            responseMessage: "success",
                                            responseData: orders
                                        });
                                        if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                                            businessFunctions.logs("INFO: Item Successfully Returned, Item_Name:" + item.title + ", " + "Returned_By:" + orders.user.name + ", " + "User:" + loggedInDetails.name);
                                        }
                                    });
                            }
                        });
                    }
                });
            } else {
                if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                    businessFunctions.logs("ERROR: Item not Returned, Item_Name:" + item.title + ", " + "User:" + loggedInDetails.name);
                }
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Item not Returned",
                    responseData: {}
                });
            }
        }


    }
    else {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR: Item not found, Item_Name:" + item.title + ", " + "User:" + loggedInDetails.name);
        }
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Item not found",
            responseData: {}
        });
    }
});

router.delete('/order/cancel', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /order/cancel Api Called from order.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

    var business = req.headers['business'];
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var date = new Date();
    var loggedInDetails = decoded.user;
    var items = [];
    var data = [];

    var item_total = 0;
    var discount = 0;
    var item_total = 0;
    var total = 0;

    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Fatching Order Details, OrderId:" + req.body.order);
    }
    var order = await Order.findById(req.body.order).exec();
    var loggedInDetails = await User.findById(decoded.user).exec();
    if (order) {
        await OrderLine.find({ business: business, order: order._id })
            .cursor().eachAsync(async (item) => {
                if (item.issued == true) {
                    var r = await q.all(businessFunctions.orderItemReturn(item));
                }
            });

        var date = new Date();
        var businessOrder = await BusinessOrder.findOne({ order: order._id, business: business }).exec();

        var data = {
            updated_at: new Date(),
            status: "Cancelled"
        }

        await Order.findOneAndUpdate({ _id: businessOrder.order }, { $set: data }, { new: false }, async function (err, doc) {
            if (err) {
                if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                    businessFunctions.logs("ERROR: Error Occured while Cancel the order , OrderId:" + req.body.order + ", " + "User:" + loggedInDetails.name);
                }
                res.status(422).json({
                    responseCode: 422,
                    responseMessage: "Server Error",
                    responseData: err
                });
            }
            else {
                await BusinessOrder.findOneAndUpdate({ order: businessOrder.order, business: business }, { $set: data }, { new: false }, async function (err, doc) {
                    if (err) {
                        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                            businessFunctions.logs("ERROR: Error Occured while Cancel the Business order , OrderId:" + req.body.order + ", " + "User:" + loggedInDetails.name);
                        }
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Server Error",
                            responseData: err
                        });
                    }
                    else {
                        // { order: order._id, business: business, status: "Active" }
                        await OrderInvoice.findOneAndUpdate({ order: businessOrder.order, business: business, status: "Active" }, { $set: { status: 'Cancelled', updated_at: new Date() } }, { new: true }, async function (err, invoice) {
                            if (err) {
                                if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                                    businessFunctions.logs("ERROR: Error Occured while Cancel the order Invoice, OrderId:" + req.body.order + ", " + "User:" + loggedInDetails.name);
                                }
                                res.status(422).json({
                                    responseCode: 422,
                                    responseMessage: "Server Error",
                                    responseData: err
                                });
                            }
                            else {
                                var transactionData = {
                                    user: invoice.user,
                                    business: invoice.business,
                                    status: 'Sale Cancelled',
                                    type: 'Sale Cancelled',
                                    paid_by: '-',
                                    activity: "Invoice",
                                    source: invoice._id,
                                    bill_id: invoice.invoice_no,
                                    bill_amount: parseFloat(invoice.payment.total) - (parseFloat(invoice.payment.discount_total) + parseFloat(invoice.payment.order_discount)),
                                    transaction_amount: parseFloat(invoice.payment.total) - (parseFloat(invoice.payment.discount_total) + parseFloat(invoice.payment.order_discount)),
                                    balance: parseFloat(invoice.payment.total) - (parseFloat(invoice.payment.discount_total) + parseFloat(invoice.payment.order_discount)),
                                    total: parseFloat(invoice.payment.total) - (parseFloat(invoice.payment.discount_total) + parseFloat(invoice.payment.order_discount)),
                                    paid_total: 0,
                                    due: 0,
                                    payment_status: "Cancelled",
                                    payment_mode: '-',
                                    received_by: loggedInDetails.name,
                                    transaction_id: '-',
                                    transaction_date: new Date(),
                                    transaction_status: 'Success',
                                    transaction_response: '-',
                                    transaction_type: "Sale Cancelled",
                                }
                                q.all(businessFunctions.addTransaction(transactionData));

                            }
                        })
                        await BusinessOrder.find({ order: businessOrder.order, business: business })
                            .populate({ path: 'order', populate: [{ path: 'user', select: 'name contact_no username email account_info ' }, { path: 'car', select: 'title variant registration_no _automaker _model' }, { path: 'address' }] })
                            .cursor().eachAsync(async (p) => {







                                var orders = {
                                    _id: p.order._id,
                                    id: p.order._id,
                                    items: await q.all(fun.getBusinessOrderItems(p.order._id, business, req.headers['tz'])),
                                    user: p.order.user,
                                    car: p.order.car,
                                    address: p.order.address,
                                    due_date: moment(p.due_date).tz(req.headers['tz']).format('lll'),
                                    delivery_date: moment(p.delivery_date).tz(req.headers['tz']).format('lll'),
                                    time_slot: p.time_slot,
                                    convenience: p.order.convenience,
                                    order_no: p.order.order_no,
                                    address: p.order.address,
                                    payment: p.payment,
                                    due: p.due,
                                    log: p.log,
                                    status: p.status,
                                    created_at: moment(p.created_at).tz(req.headers['tz']).format('lll'),
                                    updated_at: moment(p.updated_at).tz(req.headers['tz']).format('lll'),
                                };

                                var activity = {
                                    business: business,
                                    activity_by: loggedInDetails.name,
                                    activity: "Order Cancelled",
                                    remark: "Order Cancelled",
                                    created_at: new Date(),
                                }
                                businessFunctions.salesOrderLogs(order, activity);
                                //console.log(p.business, "sdfd",p.user);
                                if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                                    businessFunctions.logs("DEBUG: whatsAppEvent.orderCancel(p.business, p.user, p.order_no) function Called from whatAppEvent.js");
                                }
                                whatsAppEvent.orderCancel(p.business, p.user, p.order_no)
                                var activity = 'Order Cancelled-Sale'
                                fun.webNotification(activity, p);

                                res.status(200).json({
                                    responseCode: 200,
                                    responseMessage: "success",
                                    responseData: orders
                                });
                                if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                                    businessFunctions.logs("INFO: Order Cancelled Successfully, OrderId:" + req.body.order + ", " + "User:" + loggedInDetails.name);
                                }
                            });
                    }
                });
            }
        });
    }
    else {
        if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
            businessFunctions.logs("WARNING: Order not found, OrderId:" + req.body.order + ", " + "User:" + loggedInDetails.name);
        }
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Order not found",
            responseData: {}
        });
    }
});

router.delete('/order/invoice/cancel', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /order/invoice/cancel Api Called from order.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

    var business = req.headers['business'];
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var date = new Date();

    var items = [];
    var data = [];

    var item_total = 0;
    var discount = 0;
    var item_total = 0;
    var total = 0;

    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Fatching Invoice details, InvoiceId:" + req.body.invoice);
    }
    var invoice = await OrderInvoice.findById(req.body.invoice).exec();
    var loggedInDetails = await User.findById(decoded.user).exec();
    if (invoice) {
        var date = new Date();

        var data = {
            updated_at: new Date(),
            status: "Cancelled"
        }

        await OrderInvoice.findOneAndUpdate({ _id: invoice._id }, { $set: data }, { new: false }, async function (err, doc) {
            if (err) {
                if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                    businessFunctions.logs("ERROR: Error Occured while updating the Invoice status for the invoiceId:" + invoice._id + ", " + "User:" + loggedInDetails.name);
                }
                res.status(422).json({
                    responseCode: 422,
                    responseMessage: "Server Error",
                    responseData: err
                });
            }
            else {
                await Order.findOneAndUpdate({ _id: invoice.order }, { $set: { isInvoice: false, invoie: null } }, { new: true }, async function (err, doc) { })
                var transactionData = {
                    user: invoice.user,
                    business: invoice.business,
                    status: 'Counter Sale Cancelled',
                    type: 'Sale Cancelled',
                    paid_by: '-',
                    activity: "Invoice",
                    source: invoice._id,
                    bill_id: invoice.invoice_no,
                    bill_amount: invoice.payment.total.toFixed(2) - invoice.payment.discount_total.toFixed(2),
                    transaction_amount: invoice.payment.total.toFixed(2) - invoice.payment.discount_total.toFixed(2),
                    balance: invoice.payment.total.toFixed(2) - invoice.payment.discount_total.toFixed(2),
                    total: invoice.payment.total.toFixed(2) - invoice.payment.discount_total.toFixed(2),
                    paid_total: 0,
                    due: 0,
                    payment_status: "Cancelled",
                    payment_mode: '-',
                    received_by: loggedInDetails.name,
                    transaction_id: '-',
                    transaction_date: new Date(),
                    transaction_status: 'Success',
                    transaction_response: '-',
                    transaction_type: "Sale Cancelled",
                }
                if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                    businessFunctions.logs("DEBUG: businessFunctions.addTransaction(transactionData) function called from businessFunction.js");
                }
                q.all(businessFunctions.addTransaction(transactionData));
                var activity = {
                    business: business,
                    activity_by: loggedInDetails.name,
                    activity: "Invoice Cancelled " + "#" + invoice.invoice_no,
                    remark: "Invoice Cancelled",
                    created_at: new Date(),
                }
                businessFunctions.salesOrderLogs(invoice.order, activity);


                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Invoice has been Cancelled",
                    responseData: {}
                });
                if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                    businessFunctions.logs("INFO: Invoice has been Cancelled, InvoiceId:" + req.body.invoice + ", " + "User:" + loggedInDetails.name);
                }
            }
        });
    }
    else {
        if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
            businessFunctions.logs("WARNING: Invoice not found, InvoiceId:" + req.body.invoice + ", " + "User:" + loggedInDetails.name);
        }
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Invoice not found",
            responseData: {}
        });
    }
});

router.put('/order/update', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /order/update Api Called from order.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

    var business = req.headers['business'];
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var date = new Date();
    var loggedInDetails = decoded.user;
    var items = [];
    var data = [];

    var item_total = 0;
    var discount = 0;
    var item_total = 0;
    var total = 0;

    var order = await Order.findById(req.body.order).exec();
    var loggedInDetails = await User.findById(decoded.user).exec();
    if (order) {
        var date = new Date();

        var log = {
            status: "Confirmed",
            type: "Counter",
            activity: "Confirmed",
            user: loggedInDetails._id,
            name: loggedInDetails.name,
            created_at: date,
            updated_at: date,
        }

        var products = req.body.items;

        if (products.length > 0) {
            for (var p = 0; p < products.length; p++) {
                var category = null;
                var _category = "";
                var subcategory = null;
                var _subcategory = "";
                var product_brand = null;
                var _brand = "";
                var product_model = null;
                var _model = "";
                var source = null;

                var tax_info = await Tax.findOne({ tax: products[p].tax }).exec();
                if (products[p].product) {
                    var businessProduct = await BusinessProduct.findById(products[p].product).exec();
                    if (businessProduct) {
                        category = businessProduct.category;
                        _category = businessProduct._category;
                        subcategory = businessProduct.subcategory;
                        _subcategory = businessProduct._subcategory;
                        product_brand = businessProduct.product_brand;
                        _brand = businessProduct._product_brand;
                        product_model = businessProduct.product_model;
                        _model = businessProduct._product_model;
                        source = businessProduct.product;
                    }
                }


                var orderLine = await OrderLine.findOne({ _id: products[p].id }).exec();
                if (orderLine) {
                    var tax = [];
                    var rate = products[p].rate;
                    var amount = products[p].rate * products[p].quantity;
                    var tax_rate = tax_info.detail;
                    var discount_total = 0;
                    var base = amount

                    var discount = products[p].discount;

                    if (discount.indexOf("%") >= 0) {
                        discount = parseFloat(discount);
                        if (!isNaN(discount) && discount > 0) {
                            var discount_total = amount * (discount / 100);
                            amount = amount - parseFloat(discount_total.toFixed(2))
                        }
                    }
                    else {
                        if (discount == "") {
                            discount = "0"
                        }

                        discount_total = parseFloat(discount);
                        if (!isNaN(discount_total) && discount_total > 0) {
                            amount = amount - parseFloat(discount_total.toFixed(2))
                        }
                    }

                    if (products[p].amount_is_tax == "exclusive") {
                        var tax_on_amount = amount;
                        if (tax_rate.length > 0) {
                            for (var r = 0; r < tax_rate.length; r++) {
                                if (tax_rate[r].rate != tax_info.rate) {
                                    var t = tax_on_amount * (tax_rate[r].rate / 100);
                                    amount = amount + t;
                                    tax.push({
                                        tax: tax_rate[r].tax,
                                        rate: tax_rate[r].rate,
                                        amount: parseFloat(t.toFixed(2))
                                    })
                                }
                                else {
                                    var t = tax_on_amount * (tax_info.rate / 100);
                                    amount = amount + t;
                                    tax.push({
                                        tax: tax_info.tax, tax_rate: tax_info.rate,
                                        rate: tax_info.rate,
                                        amount: parseFloat(t.toFixed(2))
                                    })
                                }
                            }
                        }
                    }

                    if (products[p].amount_is_tax == "inclusive") {
                        var x = (100 + tax_info.rate) / 100;
                        var tax_on_amount = amount / x;
                        if (tax_rate.length > 0) {
                            for (var r = 0; r < tax_rate.length; r++) {
                                if (tax_rate[r].rate != tax_info.rate) {
                                    var t = tax_on_amount * (tax_rate[r].rate / 100);
                                    base = base - t;
                                    tax.push({
                                        tax: tax_rate[r].tax,
                                        rate: tax_rate[r].rate,
                                        amount: parseFloat(t.toFixed(2))
                                    });
                                }
                                else {
                                    var t = amount - tax_on_amount;
                                    base = base - t;
                                    tax.push({
                                        tax: tax_info.tax,
                                        rate: tax_info.rate,
                                        amount: parseFloat(t.toFixed(2))
                                    });
                                }
                            }
                        }

                        //base = base - discount_total;
                    }

                    var tax_details = {
                        tax: tax_info.tax,
                        rate: tax_info.rate,
                        amount: total,
                        detail: tax
                    }

                    var item = {
                        order: order._id,
                        product: products[p].product,
                        category: category,
                        _category: _category,
                        subcategory: subcategory,
                        _subcategory: _subcategory,
                        product_brand: product_brand,
                        _brand: _brand,
                        product_model: product_model,
                        _model: _model,
                        source: source,
                        status: orderLine.status,
                        part_no: products[p].part_no,
                        unit: products[p].unit,
                        hsn_sac: products[p].hsn_sac,
                        title: products[p].title,
                        sku: products[p].sku,
                        mrp: products[p].mrp,
                        selling_price: products[p].selling_price,
                        rate: products[p].rate,
                        quantity: products[p].quantity,
                        base: parseFloat(base.toFixed(2)),
                        amount: amount,
                        discount: products[p].discount,
                        discount_total: parseFloat(discount_total.toFixed(2)),
                        amount_is_tax: products[p].amount_is_tax,
                        tax_amount: parseFloat(_.sumBy(tax, x => x.amount).toFixed(2)),
                        amount: parseFloat(amount.toFixed(2)),
                        tax: tax_info.tax,
                        tax_rate: tax_info.rate,
                        tax_info: tax,
                        issued: products[p].issued,
                        business: business,
                        updated_at: new Date()
                    };

                    OrderLine.findOneAndUpdate({ _id: products[p].id }, { $set: item }, { new: false }, async function (err, doc) {
                    });
                }
                else {
                    return res.status(400).json({
                        responseCode: 400,
                        responseMessage: "Item not found",
                        responseData: {}
                    });
                }
            }
        }
        else {
            return res.status(400).json({
                responseCode: 400,
                responseMessage: "Items not found",
                responseData: {}
            });
        }

        var businessOrder = await BusinessOrder.findOne({ order: order._id, business: business }).exec();
        var items = await OrderLine.find({ order: order._id, business: business, status: { $nin: ['Cancelled'] } }).exec();

        var convenience_charges = 0;
        if (req.body.convenience_charges) {
            convenience_charges = Math.ceil(req.body.convenience_charges)
        }
        else {
            if (businessOrder.payment.convenience_charges) {
                convenience_charges = Math.ceil(businessOrder.payment.convenience_charges)
            }
        }

        var amount = _.sumBy(items, x => x.amount);
        var discount = _.sumBy(items, x => x.discount_total);
        var total = amount + discount + convenience_charges;

        var transaction_log = await q.all(fun.getOrderTransaction(order._id, business));
        var paid_total = transaction_log.paid_total;

        var data = {
            convenience: req.body.convenience,
            updated_at: new Date(),
            "payment.paid_total": paid_total,
            "payment.convenience_charges": convenience_charges,
            "payment.amount": parseFloat(amount.toFixed(2)),
            "payment.discount_total": parseFloat(discount.toFixed(2)),
            "payment.total": parseFloat(total.toFixed(2)),
            "payment.order_discount": parseFloat(order.payment.order_discount),
            due: {
                due: Math.ceil(amount) + convenience_charges - paid_total - (parseFloat(order.payment.order_discount))
            }
        }

        Order.findOneAndUpdate({ _id: businessOrder.order }, { $set: data }, { new: false }, async function (err, doc) {
            if (err) {
                res.status(422).json({
                    responseCode: 422,
                    responseMessage: "Server Error",
                    responseData: err
                });
            }
            else {
                BusinessOrder.findOneAndUpdate({ order: businessOrder.order, business: business }, { $set: data }, { new: false }, async function (err, doc) {
                    if (err) {
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Server Error",
                            responseData: err
                        });
                    }
                    else {
                        await BusinessOrder.find({ order: businessOrder.order, business: business })
                            .populate({ path: 'order', populate: [{ path: 'user', select: 'name contact_no username email account_info ' }, { path: 'car', select: 'title variant registration_no _automaker _model' }, { path: 'address' }] })
                            .cursor().eachAsync(async (p) => {
                                var has_invoice = false;
                                var invoices = await OrderInvoice.find({ order: p.order._id, business: business }).select('status invoice_no').exec();

                                if (invoices.length > 0) {
                                    has_invoice = true;
                                }
                                var orders = {
                                    _id: p.order._id,
                                    id: p.order._id,
                                    items: await q.all(fun.getBusinessOrderItems(p.order._id, business, req.headers['tz'])),
                                    user: p.order.user,
                                    car: p.order.car,
                                    address: p.order.address,
                                    due_date: moment(p.due_date).tz(req.headers['tz']).format('lll'),
                                    delivery_date: moment(p.delivery_date).tz(req.headers['tz']).format('lll'),
                                    time_slot: p.time_slot,
                                    convenience: p.order.convenience,
                                    order_no: p.order.order_no,
                                    address: p.order.address,
                                    payment: p.payment,
                                    due: p.due,
                                    log: p.log,
                                    has_invoice: has_invoice,
                                    invoices: invoices,
                                    status: p.status,
                                    created_at: moment(p.created_at).tz(req.headers['tz']).format('lll'),
                                    updated_at: moment(p.updated_at).tz(req.headers['tz']).format('lll'),
                                };

                                res.status(200).json({
                                    responseCode: 200,
                                    responseMessage: "success",
                                    responseData: orders
                                });
                            });
                    }
                });
            }
        });
    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Order not found",
            responseData: {}
        });
    }
});

router.put('/order/items/dispatch', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /order/items/dispatch Api Called from order.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

    var business = req.headers['business'];
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var date = new Date();
    var loggedInDetails = decoded.user;
    var items = [];
    var data = [];

    var item_total = 0;
    var discount = 0;
    var item_total = 0;
    var total = 0;

    var order = await Order.findById(req.body.order).exec();
    var loggedInDetails = await User.findById(decoded.user).exec();
    if (order) {
        var date = new Date();
        var availablity = false;
        var log = {
            status: "Confirmed",
            type: "Counter",
            activity: "Confirmed",
            user: loggedInDetails._id,
            name: loggedInDetails.name,
            created_at: date,
            updated_at: date,
        }


        var products = req.body.items;

        var oids = _.map(products, 'product');
        var productCount = 0;
        /*for(var o=0;o<oids.length; o++)
        {
            var checkExist = await BusinessProduct.find({_id: oids[o], business: business}).exec();
            if(checkExist)
            {
                productCount= productCount+1;
            }
        }
 
        if(products.length == productCount)
        {*/
        for (var p = 0; p < products.length; p++) {
            var tax_info = await Tax.findOne({ tax: products[p].tax }).exec();
            var orderLine = await OrderLine.findOne({ _id: products[p].id, status: { $nin: ["Cancelled"] } }).exec();
            if (orderLine) {
                if (orderLine.issued == false) {
                    var available = await BusinessProduct.findOne({ _id: products[p].product, "stock.available": { $gte: products[p].quantity } }).exec();
                    if (available) {
                        availablity = true;
                    }
                    else {
                        availablity = false;
                    }
                }
                else {
                    availablity = true;
                }


                var tax = [];
                var rate = products[p].rate;
                var amount = products[p].rate * products[p].quantity;
                var tax_rate = tax_info.detail;
                var discount_total = 0;
                var base = amount

                var discount = products[p].discount;

                if (discount.indexOf("%") >= 0) {
                    discount = parseFloat(discount);
                    if (!isNaN(discount) && discount > 0) {
                        var discount_total = amount * (discount / 100);
                        amount = amount - parseFloat(discount_total.toFixed(2))
                    }
                }
                else {
                    if (discount == "") {
                        discount = "0"
                    }

                    discount_total = parseFloat(discount);
                    if (!isNaN(discount_total) && discount_total > 0) {
                        amount = amount - parseFloat(discount_total.toFixed(2))
                    }
                }

                if (products[p].amount_is_tax == "exclusive") {
                    var tax_on_amount = amount;
                    if (tax_rate.length > 0) {
                        for (var r = 0; r < tax_rate.length; r++) {
                            if (tax_rate[r].rate != tax_info.rate) {
                                var t = tax_on_amount * (tax_rate[r].rate / 100);
                                amount = amount + t;
                                tax.push({
                                    tax: tax_rate[r].tax,
                                    rate: tax_rate[r].rate,
                                    amount: parseFloat(t.toFixed(2))
                                })
                            }
                            else {
                                var t = tax_on_amount * (tax_info.rate / 100);
                                amount = amount + t;
                                tax.push({
                                    tax: tax_info.tax, tax_rate: tax_info.rate,
                                    rate: tax_info.rate,
                                    amount: parseFloat(t.toFixed(2))
                                })
                            }
                        }
                    }
                }

                if (products[p].amount_is_tax == "inclusive") {
                    var x = (100 + tax_info.rate) / 100;
                    var tax_on_amount = amount / x;
                    if (tax_rate.length > 0) {
                        for (var r = 0; r < tax_rate.length; r++) {
                            if (tax_rate[r].rate != tax_info.rate) {
                                var t = tax_on_amount * (tax_rate[r].rate / 100);
                                base = base - t;
                                tax.push({
                                    tax: tax_rate[r].tax,
                                    rate: tax_rate[r].rate,
                                    amount: parseFloat(t.toFixed(2))
                                });
                            }
                            else {
                                var t = amount - tax_on_amount;
                                base = base - t;
                                tax.push({
                                    tax: tax_info.tax,
                                    rate: tax_info.rate,
                                    amount: parseFloat(t.toFixed(2))
                                });
                            }
                        }
                    }
                    //base = base - discount_total;
                }

                var tax_details = {
                    tax: tax_info.tax,
                    rate: tax_info.rate,
                    amount: total,
                    detail: tax
                }

                var item = {
                    order: order._id,
                    product: orderLine.product,
                    category: orderLine.category,
                    _category: orderLine._category,
                    subcategory: orderLine.subcategory,
                    _subcategory: orderLine._subcategory,
                    product_brand: orderLine.product_brand,
                    _brand: orderLine.product_brand,
                    product_model: orderLine.product_model,
                    _model: orderLine.product_model,
                    source: orderLine.source,
                    status: orderLine.status,
                    part_no: orderLine.part_no,
                    hsn_sac: products[p].hsn_sac,
                    title: products[p].title,
                    sku: products[p].sku,
                    mrp: products[p].mrp,
                    selling_price: products[p].selling_price,
                    rate: products[p].rate,
                    unit: products[p].unit,
                    quantity: products[p].quantity,
                    base: parseFloat(base.toFixed(2)),
                    discount: products[p].discount,
                    discount_total: parseFloat(discount_total.toFixed(2)),
                    amount_is_tax: products[p].amount_is_tax,
                    tax_amount: parseFloat(_.sumBy(tax, x => x.amount).toFixed(2)),
                    amount: parseFloat(amount.toFixed(2)),
                    tax: tax_info.tax,
                    tax_rate: tax_info.rate,
                    tax_info: tax,
                    issued: products[p].issued,
                    business: business,
                    updated_at: new Date()
                };

                OrderLine.findOneAndUpdate({ _id: products[p].id }, { $set: item }, { new: false }, async function (err, doc) {
                    if (err) {
                        return res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Server Error",
                            responseData: err
                        });
                    }
                });
            }
            else {
                return res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Items not found",
                    responseData: {}
                });
            }
        }
        /*}
        else
        {
            return res.status(400).json({
                responseCode: 400,
                responseInfo: {
                    0: products.length,
                    1: checkExist.length
                },
                responseMessage: "Please check all items availablity before dispatching them",
                responseData: {}
            });
        }*/

        var businessOrder = await BusinessOrder.findOne({ order: order._id, business: business }).exec();

        var items = await OrderLine.find({ order: order._id, business: business, status: { $nin: ['Cancelled'] } }).exec();
        var convenience_charges = 0;
        if (businessOrder.payment.convenience_charges) {
            convenience_charges = Math.ceil(businessOrder.payment.convenience_charges)
        }

        var amount = _.sumBy(items, x => x.amount);
        var discount = _.sumBy(items, x => x.discount_total);
        var total = amount + discount + convenience_charges;

        var transaction_log = await q.all(fun.getOrderTransaction(order._id, business));
        var paid_total = transaction_log.paid_total;

        if (availablity == true) {
            var a = await q.all(businessFunctions.orderItemDeduct(order._id, business));
            if (a == true) {
                var message = "Items dispatched";
                var status = "Dispatched";
                var status_code = 200;
                OrderLine.update({ order: order._id, business: business }, { $set: { status: status } }, { multi: true }, async function (err, doc) {
                    if (err) {
                        return res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Server Error",
                            responseData: err
                        });
                    }
                });
            }
            else {
                var message = "Please check all items availablity before dispatching them";
                var status = "Confirmed";
                var status_code = 422;
            }
        }
        else {
            var message = "Please check all items availablity before dispatching them";
            var status = "Confirmed";
            var status_code = 422;
        }

        var data = {
            updated_at: new Date(),
            "payment.paid_total": paid_total,
            "payment.amount": parseFloat(amount.toFixed(2)),
            "payment.discount_total": parseFloat(discount.toFixed(2)),
            "payment.total": parseFloat(total.toFixed(2)),
            "status": status,
            "payment.order_discount": parseFloat(order.payment.order_discount),
            due: {
                due: Math.ceil(amount) + convenience_charges - paid_total - (parseFloat(order.payment.order_discount))
            }
        }

        Order.findOneAndUpdate({ _id: order._id }, { $set: data }, { new: false }, async function (err, doc) {
            if (err) {
                res.status(422).json({
                    responseCode: 422,
                    responseMessage: "Server Error",
                    responseData: err
                });
            }
            else {
                BusinessOrder.findOneAndUpdate({ order: order._id, business: business }, { $set: data }, { new: false }, async function (err, doc) {
                    if (err) {
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Server Error",
                            responseData: err
                        });
                    }
                    else {
                        await BusinessOrder.find({ order: businessOrder.order, business: business })
                            .populate({ path: 'order', populate: [{ path: 'user', select: 'name contact_no username email account_info ' }, { path: 'car', select: 'title variant registration_no _automaker _model' }, { path: 'address' }] })
                            .cursor().eachAsync(async (p) => {
                                var has_invoice = false;
                                var invoices = await OrderInvoice.find({ order: p.order._id, business: business }).select('status invoice_no').exec();

                                if (invoices.length > 0) {
                                    has_invoice = true;
                                }
                                var orders = {
                                    _id: p.order._id,
                                    id: p.order._id,
                                    items: await q.all(fun.getBusinessOrderItems(p.order._id, business, req.headers['tz'])),
                                    user: p.order.user,
                                    car: p.order.car,
                                    address: p.order.address,
                                    due_date: moment(p.due_date).tz(req.headers['tz']).format('lll'),
                                    delivery_date: moment(p.delivery_date).tz(req.headers['tz']).format('lll'),
                                    time_slot: p.time_slot,
                                    convenience: p.order.convenience,
                                    order_no: p.order.order_no,
                                    address: p.order.address,
                                    payment: p.payment,
                                    due: p.due,
                                    log: p.log,
                                    has_invoice: has_invoice,
                                    invoices: invoices,
                                    status: p.status,
                                    created_at: moment(p.created_at).tz(req.headers['tz']).format('lll'),
                                    updated_at: moment(p.updated_at).tz(req.headers['tz']).format('lll'),
                                };

                                res.status(status_code).json({
                                    responseCode: status_code,
                                    responseMessage: message,
                                    responseData: orders
                                });
                            });
                    }
                });
            }
        });
    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Order not found",
            responseData: {}
        });
    }
});

router.post('/order/payment/add', xAccessToken.token, async function (req, res, next) {
    var rules = {
        order: 'required',
        amount: 'required',
        date: 'required',
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Amount & Date are mandatory",
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
        var data = [];
        var loggedInDetails = await User.findById(decoded.user).exec();

        var order = await Order.findOne({ _id: req.body.order }).exec();
        if (order) {
            var businessOrder = await BusinessOrder.findOne({ order: req.body.order, business: business }).exec();
            if (businessOrder) {
                var recieved = parseFloat(req.body.amount);

                var date = new Date();
                var payment_mode = req.body.payment_mode;
                var transaction_id = req.body.transaction_id;

                var due_amount = 0;
                if (businessOrder.due) {
                    if (businessOrder.due.due) {
                        due_amount = businessOrder.due.due;
                    }
                }


                TransactionLog.create({
                    user: order.user,
                    activity: "Order",
                    business: business,
                    source: order._id,
                    paid_total: recieved,
                    total: businessOrder.payment.total,
                    due: due_amount,
                    payment_status: "Success",
                    payment_mode: payment_mode,
                    transaction_id: transaction_id,
                    transaction_date: new Date(req.body.date).toISOString(),
                    transaction_status: "Success",
                    transaction_response: "Success",
                    created_at: new Date(),
                    updated_at: new Date(),
                }).then(async function (transaction) {

                    var data = {
                        user: order.user,
                        business: business,
                        status: 'Payment-In',
                        type: 'Payment-In',
                        paid_by: 'Customer',
                        activity: 'Payment-In',
                        source: order.user,
                        bill_id: 'N/A',
                        bill_amount: recieved,
                        transaction_amount: recieved,
                        balance: recieved,
                        total: recieved,
                        paid_total: 0,
                        due: 0,
                        payment_status: "Success",
                        payment_mode: payment_mode,
                        received_by: loggedInDetails.name,
                        transaction_id: transaction_id,
                        transaction_date: new Date(req.body.date),
                        transaction_status: 'Success',
                        transaction_response: 'Success',
                        transaction_type: 'Payment-In',
                        remark: req.body.remark
                    }
                    var valid = q.all(businessFunctions.addTransaction(data));

                    var convenience_charges = 0;
                    if (businessOrder.payment.convenience_charges) {
                        convenience_charges = Math.ceil(businessOrder.payment.convenience_charges)
                    }

                    var items = await OrderLine.find({ order: order._id, business: business, status: { $nin: ['Cancelled'] } }).exec();
                    var amount = _.sumBy(items, x => x.amount);
                    var discount = _.sumBy(items, x => x.discount_total);
                    var total = amount + discount + convenience_charges;

                    var transaction_log = await TransactionLog.find({ source: order._id, payment_status: "Success", }).exec();

                    var paid_total = _.sumBy(transaction_log, x => x.paid_total);

                    var due = Math.ceil(amount.toFixed(2)) + Math.ceil(convenience_charges) - paid_total;

                    var data = {
                        updated_at: date,
                        "payment.paid_total": paid_total,
                        "payment.amount": parseFloat(amount.toFixed(2)),
                        "payment.discount_total": parseFloat(discount.toFixed(2)),
                        "payment.total": parseFloat(total.toFixed(2)),
                        "payment.order_discount": parseFloat(order.payment.order_discount),
                        due: {
                            due: Math.ceil(amount) + convenience_charges - paid_total - (parseFloat(order.payment.order_discount))
                        }
                    }

                    var orderInvoice = await OrderInvoice.findOne({ order: order._id, business: business, status: "Active" }).exec();
                    if (orderInvoice) {
                        OrderInvoice.findOneAndUpdate({ order: order._id, business: business, status: "Active" }, { $set: data }, { new: false }, async function (err, doc) {
                            if (err) {
                                return res.status(422).json({
                                    responseCode: 422,
                                    responseMessage: "Server Error",
                                    responseData: err
                                });
                            }
                        })
                    }


                    Order.findOneAndUpdate({ _id: order._id }, { $set: data }, { new: false }, async function (err, doc) {
                        if (err) {
                            res.status(422).json({
                                responseCode: 422,
                                responseMessage: "Server Error",
                                responseData: err
                            });
                        }
                        else {
                            BusinessOrder.findOneAndUpdate({ order: order._id, business: business }, { $set: data }, { new: false }, async function (err, doc) {
                                if (err) {
                                    res.status(422).json({
                                        responseCode: 422,
                                        responseMessage: "Server Error",
                                        responseData: err
                                    });
                                }
                                else {
                                    var updated = await BusinessOrder.findOne({ order: order._id, business: business }).exec();
                                    var activity = {
                                        business: business,
                                        activity_by: loggedInDetails.name,
                                        activity: "Payment Recieved: " + recieved,
                                        remark: "Payment Recieved",
                                        created_at: new Date(),
                                    }
                                    businessFunctions.salesOrderLogs(order._id, activity);

                                    res.status(200).json({
                                        responseCode: 200,
                                        responseMessage: "Payment Recieved",
                                        responseData: {
                                            item: {},
                                            payment: transaction,
                                            due: updated.due,
                                        }
                                    });
                                }
                            });
                        }
                    });

                });
            }
            else {
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Business Order not found",
                    responseData: {}
                });
            }
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Order not found",
                responseData: {}
            });
        }
    }
});

router.post('/expense/add', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /expense/add Api Called from order.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    var rules = {
        category: 'required',
        name: 'required',
        contact_no: 'required',
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR: Validation failed, Payee Info required to Add Expense.");
        }
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Payee Info required",
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
        var loggedInDetails = await User.findById(decoded.user).exec();
        var product = new Object();
        var result = [];
        var tax = [];
        var total = 0;

        var newDate = new Date();

        var vendor = null;
        var bill = {
            name: req.body.name,
            contact_no: req.body.contact_no,
            category: req.body.category,
            reference: req.body.reference,
            date: null,
            due_date: null,
            payee: null,
            items: [],
            business: business,
            total: 0,
            status: "Completed",
            created_at: newDate,
            updated_at: newDate,
        };
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Creating New Expense Bill, Name:" + req.body.name + ", Contact_no:" + req.body.contact_no + ", User:" + loggedInDetails.name);
        }
        Expense.create(bill).then(async function (expense) {
            var count = await Expense.find({ _id: { $lt: expense._id }, business: business }).count();
            var expense_no = count + 1;

            Expense.findOneAndUpdate({ _id: expense._id }, { $set: { expense_no: expense_no } }, { new: true }, async function (err, doc) {
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Expense has been added.",
                    responseData: expense
                });
                if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                    businessFunctions.logs("INFO: Expense has been added Successfully, Name:" + req.body.name + ", contact_no:" + req.body.contact_no);
                }
            });
        });
    }
});

router.get('/expenses/get', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /expenses/get Api Called from order.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var loggedInDetails = await User.findById(decoded.user).exec();

    //paginate
    if (req.query.page == undefined) {
        var page = 0;
    }
    else {
        var page = req.query.page;
    }

    var page = Math.max(0, parseInt(page));

    var orders = [];

    var filters = [];
    var match = [];
    var queries = {};


    if (req.query.query) {
        var specification = {};
        specification['$lookup'] = {
            from: "User",
            localField: "payee",
            foreignField: "_id",
            as: "payee",
        };
        filters.push(specification);

        var specification = {};
        specification['$unwind'] = {
            path: "$payee",
            preserveNullAndEmptyArrays: true
        };
        filters.push(specification);
        req.query.query = req.query.query.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");

        var specification = {};
        specification['$match'] = {
            business: mongoose.Types.ObjectId(business),
            $or: [
                { 'status': { $regex: req.query.query, $options: 'i' } },
                { 'category': { $regex: req.query.query, $options: 'i' } },
                { 'reference': { $regex: req.query.query, $options: 'i' } },
                { 'expense_no': { $regex: req.query.query, $options: 'i' } },
                { 'name': { $regex: req.query.query, $options: 'i' } },
                { 'contact_no': { $regex: req.query.query, $options: 'i' } },
                { 'payee.name': { $regex: req.query.query, $options: 'i' } },
                { 'payee.contact_no': { $regex: req.query.query, $options: 'i' } },
            ]
        };
        filters.push(specification);

        var specification = {};
        specification['$sort'] = {
            updated_at: -1,
        };
        filters.push(specification);

        var specification = {};
        specification['$skip'] = config.perPage * page;
        filters.push(specification);

        var specification = {};
        specification['$limit'] = config.perPage;
        filters.push(specification);
    }
    else {
        var specification = {};
        specification['$match'] = {
            business: mongoose.Types.ObjectId(business)
        };
        filters.push(specification);

        var specification = {};
        specification['$sort'] = {
            updated_at: -1,
        };
        filters.push(specification);

        var specification = {};
        specification['$skip'] = config.perPage * page;
        filters.push(specification);

        var specification = {};
        specification['$limit'] = config.perPage;
        filters.push(specification);
    }

    var query = filters;

    var totalResult = await Expense.aggregate(query);

    var allExpense = _.filter(totalResult, x => x.status != "Cancelled")


    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Fatching Expenses List, User:" + loggedInDetails.name);
    }
    await Expense.aggregate(query)
        .allowDiskUse(true)
        .cursor({ batchSize: 20 })
        .exec()
        .eachAsync(async function (p) {

            orders.push({
                _id: p._id,
                id: p._id,
                payee: {
                    _id: null,
                    id: null,
                    name: p.name,
                    contact_no: p.contact_no,
                },
                date: moment(p.date).tz(req.headers['tz']).format('lll'),
                expense_no: p.expense_no,
                category: p.category,
                total: p.total,
                status: p.status,
                reference: p.reference,
                created_at: moment(p.created_at).tz(req.headers['tz']).format('lll'),
                updated_at: moment(p.updated_at).tz(req.headers['tz']).format('lll'),
            });
        });

    res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseInfo: {
            totalExpense: _.sumBy(allExpense, x => x.total),
            totalResult: totalResult.length,
        },
        responseData: orders
    });
    if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("INFO: Expenses List send in response successfully, User:" + loggedInDetails.name);
    }
});

router.get('/expense/details/get', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO:/expense/details/get Api Called from Order.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    var rules = {
        expense: 'required',
    };

    var validation = new Validator(req.query, rules);

    if (validation.fails()) {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR: Validation failed, Expense is required to get Expense Details.");
        }
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Expense is required",
            responseData: {
                res: validation.errors.all()
            }
        })
    }
    else {
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Fatching Expense Detail, ExpenseId:" + req.query.expense);
        }
        var p = await Expense.findById(req.query.expense).populate({ path: 'vendor', select: 'name contact_no email account_info business_info' }).exec();

        if (p) {
            if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("DEBUG: Sending Expense detail in Response, ExpenseId:" + req.query.expense + ", Payee Name:" + p.name);
            }
            var expense = {
                _id: p._id,
                id: p._id,
                items: p.items,
                category: p.category,
                expense_no: p.expense_no,
                reference: p.reference,
                date: moment(p.date).tz(req.headers['tz']).format('YYYY-MM-DD'),
                due_date: moment(p.due_date).tz(req.headers['tz']).format('YYYY-MM-DD'),
                payee: {
                    _id: null,
                    id: null,
                    name: p.name,
                    contact_no: p.contact_no,
                },
                business: p.business,
                total: p.total,
                status: p.status,
                created_at: moment(p.created_at).tz(req.headers['tz']).format('lll'),
                updated_at: moment(p.updated_at).tz(req.headers['tz']).format('lll'),
            };

            res.status(200).json({
                responseCode: 200,
                responseMessage: "Success",
                responseData: expense
            });
            if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("INFO: Expense detail Send in Response Successfully, ExpenseId:" + req.query.expense + ", Payee Name:" + p.name);
            }
        }
        else {
            if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
                businessFunctions.logs("WARNING: Expense not found, ExpenseId:" + req.query.expense);
            }
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Expense not found",
                responseData: {}
            });
        }
    }
});

router.put('/expense/update', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /expense/update Api Called from order.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

    var rules = {
        reference: 'required',
        date: 'required',
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR: Validation failed, Date is required to update expense.");
        }
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Date is required",
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
        var loggedInDetails = await User.findById(decoded.user).exec();
        var product = new Object();
        var result = [];

        var total = 0;
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Fatching Expense Detail, ExpenseId:" + req.body.expense);
        }
        var expense = await Expense.findById(req.body.expense).exec();
        if (expense) {
            var date = new Date();
            if (req.body.date) {
                date = new Date(req.body.date).toISOString();
            }

            var newDate = new Date();

            var items = [];
            var products = req.body.items;

            if (products.length > 0) {
                for (var p = 0; p < products.length; p++) {
                    if (products[p].quantity) {
                        var tax_info = await Tax.findOne({ tax: products[p].tax }).exec();
                        if (tax_info) {
                            var tax = [];
                            var rate = parseFloat(products[p].rate) * parseFloat(products[p].quantity);
                            var amount = parseFloat(products[p].rate) * parseFloat(products[p].quantity);
                            var tax_rate = tax_info.detail;
                            var base = amount



                            if (products[p].amount_is_tax == "exclusive") {
                                if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                                    businessFunctions.logs("DEBUG: Calculating Tax Amount for tax type Exclusive.");
                                }
                                var tax_on_amount = amount;
                                if (tax_rate.length > 0) {
                                    for (var r = 0; r < tax_rate.length; r++) {
                                        if (tax_rate[r].rate != tax_info.rate) {
                                            var t = tax_on_amount * (tax_rate[r].rate / 100);
                                            amount = amount + t;
                                            tax.push({
                                                tax: tax_rate[r].tax,
                                                rate: tax_rate[r].rate,
                                                amount: parseFloat(t.toFixed(2))
                                            })
                                        }
                                        else {
                                            var t = tax_on_amount * (tax_info.rate / 100);
                                            amount = amount + t;
                                            tax.push({
                                                tax: tax_info.tax, tax_rate: tax_info.rate,
                                                rate: tax_info.rate,
                                                amount: parseFloat(t.toFixed(2))
                                            })
                                        }
                                    }
                                }

                                total = total + amount;
                            }

                            if (products[p].amount_is_tax == "inclusive") {
                                amount = amount;
                                var x = (100 + tax_info.rate) / 100;
                                var tax_on_amount = amount / x;
                                if (tax_rate.length > 0) {
                                    for (var r = 0; r < tax_rate.length; r++) {
                                        if (tax_rate[r].rate != tax_info.rate) {
                                            var t = tax_on_amount * (tax_rate[r].rate / 100);
                                            base = base - t;
                                            tax.push({
                                                tax: tax_rate[r].tax,
                                                rate: tax_rate[r].rate,
                                                amount: parseFloat(t.toFixed(2))
                                            });
                                        }
                                        else {
                                            var t = amount - tax_on_amount;
                                            base = base - t;
                                            tax.push({
                                                tax: tax_info.tax,
                                                rate: tax_info.rate,
                                                amount: parseFloat(t.toFixed(2))
                                            });
                                        }
                                    }
                                }
                                total = total + amount;
                            }

                            var tax_details = {
                                tax: tax_info.tax,
                                rate: tax_info.rate,
                                amount: total,
                                detail: tax
                            }

                            items.push({
                                part_no: products[p].part_no,
                                hsn_sac: products[p].hsn_sac,
                                title: products[p].title,
                                quantity: products[p].quantity,
                                unit: products[p].unit,
                                sku: products[p].sku,
                                mrp: products[p].mrp,
                                rate: products[p].rate,
                                base: base,
                                amount: parseFloat(amount.toFixed(2)),
                                tax_amount: _.sumBy(tax, x => x.amount),
                                models: products[p].models,
                                amount_is_tax: products[p].amount_is_tax,
                                unit_price: products[p].unit_price,
                                sell_price: products[p].rate,
                                margin: products[p].margin,
                                discount: "0",
                                discount_total: 0,
                                tax: tax_info.tax,
                                tax_rate: tax_info.rate,
                                tax_info: tax,
                            });
                        }
                        else {
                            return res.status(422).json({
                                responseCode: 422,
                                responseMessage: "Please check tax",
                                responseData: {}
                            });
                        }
                    }
                    else {
                        if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
                            businessFunctions.logs("WARNING: Part Quantity is required, Part:" + products[p].title + ", User:" + loggedInDetails.name);
                        }
                        return res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Quantity required",
                            responseData: {}
                        });
                    }
                }

                var total = _.sumBy(items, x => x.amount);

                var data = {
                    name: req.body.name,
                    contact_no: req.body.contact_no,
                    reference: req.body.reference,
                    category: req.body.category,
                    items: items,
                    date: date,
                    total: parseFloat(total.toFixed(2)),
                    updated_at: new Date(),
                };
                if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                    businessFunctions.logs("DEBUG: Updating Expense details, ExpenseId:" + expense._id + ", Payee Name:" + req.body.name + ", User:" + loggedInDetails.name);
                }
                Expense.findOneAndUpdate({ _id: expense._id }, { $set: data }, { new: false }, async function (err, doc) {
                    if (err) {
                        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                            businessFunctions.logs("ERROR: Error Occured while updating the expense details, ExpenseId:" + req.body.expense + ", User:" + loggedInDetails.name);
                        }
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Server Error...",
                            responseData: err
                        });
                    }
                    else {
                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Successfully Saved",
                            responseData: await Expense.findById(req.body.expense).populate({ path: 'vendor', select: 'name contact_no email account_info business_info' }).exec()
                        });
                        if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                            businessFunctions.logs("INFO: Successfully Saved the Expense Details, User:" + loggedInDetails.name);
                        }

                    }
                });
            }
            else {
                if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
                    businessFunctions.logs("WARNING: Items not found, ExpenseId:" + req.body.expense);
                }
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Items not found",
                    responseData: {}
                });
            }

        }
        else {
            if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
                businessFunctions.logs("WARNING: Expense not found for the expenseId:" + req.body.expense + ", User:" + loggedInDetails.name);
            }
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Expense not found",
                responseData: {}
            });
        }
    }
});

router.delete('/expense/cancel', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /expense/cancel Api Called from order.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

    var rules = {
        expense: 'required',
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR: Validation failed, Expense is required to cancel Expense.");
        }
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Error",
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
        var loggedInDetails = await User.findById(decoded.user).exec();
        var product = new Object();
        var result = [];
        var tax = [];
        var total = 0;
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Fatching Expense Detail, ExpenseId:" + req.body.expense);
        }
        var expense = await Expense.findOne({ _id: req.body.expense }).exec();
        if (expense) {
            if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("DEBUG: Updating Expense Status as Cancelled, ExpenseId:" + req.body.expense);
            }
            Expense.findOneAndUpdate({ _id: expense._id }, { $set: { status: "Cancelled" } }, { new: false }, async function (err, doc) {
                if (err) {
                    if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                        businessFunctions.logs("ERROR: Error Occured while updating Expense status, ExpenseId:" + req.body.expense + ", User:" + loggedInDetails.name);
                    }
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Server Error...",
                        responseData: err
                    });
                }
                else {
                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Removed Successfully",
                        responseData: {}
                    });
                    if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                        businessFunctions.logs("INFO: Expense Removed Successfully, ExpenseId:" + req.body.expense + ", User:" + loggedInDetails.name);
                    }
                }
            });
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Expense not found",
                responseData: {}
            });
        }
    }
});

router.delete('/order/payment/remove', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /order/payment/remove Api Called from order.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

    var rules = {
        id: 'required',
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR: Validation failed, Transaction Id is required");
        }
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Amount & Date is required",
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
        var data = [];
        var loggedInDetails = await User.findById(decoded.user).exec();


        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Fatching Transaction Log, TransactionId:" + req.body.id + ", User:" + loggedInDetails.name);
        }
        var transaction = await TransactionLog.findOne({ _id: req.body.id }).exec();
        if (transaction) {
            var order = await Order.findOne({ _id: transaction.source }).exec();
            var businessOrder = await BusinessOrder.findOne({ order: transaction.source, business: business }).exec();
            if (businessOrder) {
                var recieved = parseFloat(req.body.amount);

                var date = new Date();
                var payment_mode = req.body.payment_mode;
                var transaction_id = req.body.transaction_id;

                TransactionLog.remove({ _id: transaction._id }, async function (err) {
                    if (err) {
                        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                            businessFunctions.logs("ERROR: Error Occured while Removing Transaction Log, TransactionId:" + transaction._id + ", User:" + loggedInDetails.name);
                        }
                        return res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Server Error",
                            responseData: err
                        });
                    }
                    else {
                        var convenience_charges = 0;
                        if (businessOrder.payment.convenience_charges) {
                            convenience_charges = Math.ceil(businessOrder.payment.convenience_charges)
                        }

                        var items = await OrderLine.find({ order: order._id, business: business, status: { $nin: ['Cancelled'] } }).exec();
                        var amount = _.sumBy(items, x => x.amount);
                        var discount = _.sumBy(items, x => x.discount_total);
                        var total = amount + discount + convenience_charges;

                        var transaction_log = await TransactionLog.find({ source: order._id, payment_status: "Success", }).exec();

                        var paid_total = _.sumBy(transaction_log, x => x.paid_total);

                        var due = Math.ceil(amount.toFixed(2)) + Math.ceil(convenience_charges) - paid_total;

                        var data = {
                            updated_at: date,
                            "payment.paid_total": paid_total,
                            "payment.amount": parseFloat(amount.toFixed(2)),
                            "payment.discount_total": parseFloat(discount.toFixed(2)),
                            "payment.total": parseFloat(total.toFixed(2)),
                            "payment.order_discount": parseFloat(order.payment.order_discount),
                            due: {
                                due: Math.ceil(amount) + convenience_charges - paid_total - (parseFloat(order.payment.order_discount))
                            }
                        }

                        var orderInvoice = await OrderInvoice.findOne({ order: order._id, business: business }).exec();
                        if (orderInvoice) {
                            OrderInvoice.findOneAndUpdate({ order: order._id, business: business }, { $set: data }, { new: false }, async function (err, doc) {
                                if (err) {
                                    if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                                        businessFunctions.logs("ERROR: Error Occured while updating order Invoice details, OrderId:" + order._id + ", User:" + loggedInDetails.name);
                                    }
                                    return res.status(422).json({
                                        responseCode: 422,
                                        responseMessage: "Server Error",
                                        responseData: err
                                    });
                                }
                            })
                        }

                        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                            businessFunctions.logs("DEBUG: Fatching Order details for the order, OrderId:" + order._id);
                        }
                        Order.findOneAndUpdate({ _id: order._id }, { $set: data }, { new: false }, async function (err, doc) {
                            if (err) {
                                if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                                    businessFunctions.logs("ERROR: Error Occured while updating order, OrderId:" + order._id + ", User:" + loggedInDetails.name);
                                }
                                res.status(422).json({
                                    responseCode: 422,
                                    responseMessage: "Server Error",
                                    responseData: err
                                });
                            }
                            else {
                                if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                                    businessFunctions.logs("DEBUG: Fatching Business Order details for the order, OrderId:" + order._id);
                                }
                                BusinessOrder.findOneAndUpdate({ order: order._id, business: business }, { $set: data }, { new: false }, async function (err, doc) {
                                    if (err) {
                                        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                                            businessFunctions.logs("ERROR: Error Occured while updating Business order, OrderId:" + order._id + ", User:" + loggedInDetails.name);
                                        }
                                        res.status(422).json({
                                            responseCode: 422,
                                            responseMessage: "Server Error",
                                            responseData: err
                                        });
                                    }
                                    else {
                                        var updated = await BusinessOrder.findOne({ order: order._id, business: business }).exec();

                                        res.status(200).json({
                                            responseCode: 200,
                                            responseMessage: "Payment Recieved",
                                            responseData: {
                                                item: {},
                                                payment: updated.payment,
                                                due: updated.due,
                                            }
                                        });
                                        if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                                            businessFunctions.logs("INFO: Payment Received Successfully for the order, OrderId:" + order._id + ", User:" + loggedInDetails.name);
                                        }
                                    }
                                });
                            }
                        });
                    }
                });

            }
            else {
                if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
                    businessFunctions.logs("WARNING: Business Order not found, OrderId:" + transaction.source + ", User:" + loggedInDetails.name);
                }
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Business Order not found",
                    responseData: {}
                });
            }
        }
        else {
            if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
                businessFunctions.logs("WARNING: Transaction not found, TransactionId:" + req.body.id + ", User:" + loggedInDetails.name);
            }
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Transaction not found",
                responseData: {}
            });
        }
    }
});

// vinay code

router.post('/sales/order/create', async (req, res, next) => {
    let vendor = req.body.vendor
    let business = req.body.business
    let quotation = req.body.quotation

    let order = await VendorOrders.findOne({
        vendor: mongoose.Types.ObjectId(vendor),
        business: mongoose.Types.ObjectId(business)
    }).exec()

    let items = await createPartsTax(order.parts, order.business)
    order.parts = items.items
    order.markModified("parts")
    order.save()
    res.json({
        message: "Parts saved"
    })
});


router.put("/change/order", async (req, res, next) => {
    let vendors = req.body.vendors
    let quotation = req.body.quotation
    // console.log("Change order...", vendors, quotation)
    VendorOrders.find({ vendor: { $in: vendors }, quotation: mongoose.Types.ObjectId(quotation) })
        .cursor().eachAsync(result => {

            // console.log("Results...", result.businessOrder)
            BusinessOrder.findOneAndUpdate({ _id: mongoose.Types.ObjectId(result.businessOrder) },
                { business: mongoose.Types.ObjectId(result.vendor) }, (err, doc) => {
                    if (err) {
                        // console.log("error...", err)
                    } else {

                    }
                    // console.log("BusinessOrder update...", doc.business)
                })

        })
    res.json({
        message: "Order Changed"
    })
});

router.put('/vendor/orders/get', async (req, res, next) => {


    let vendors = req.body.vendors
    let quotation = req.body.quotation
    let ordersArray = []
    let orderObj = {}

    for (let i = 0; i < vendors.length; i++) {
        let reinitParts = []
        let order = await VendorOrders.findOne({
            quotation: mongoose.Types.ObjectId(req.body.quotation),
            vendor: mongoose.Types.ObjectId(vendors[i])
        }).exec()
        for (let j = 0; j < order.parts.length; j++) {
            if (order.parts[j].partsStatus == 'confirmed') {
                reinitParts.push(order.parts[j])
            }
        }
        order.parts = reinitParts
        ordersArray.push(order)
        reinintParts = []
    }
    res.json({
        message: "parts",
        orders: ordersArray
    })
});

router.post("/purchase/order/item/add", async (req, res, next) => {

    let orders = req.body.orders

    for (let i = 0; i < orders.length; i++) {
        let orderId = orders[i].order
        let parts = orders[i].parts

        for (let j = 0; j < parts.length; j++) {


            var business = req.headers['business'];
            var token = req.headers['x-access-token'];
            var secret = config.secret;
            var decoded = jwt.verify(token, secret);
            var date = new Date();
            var loggedInDetails = decoded.user;
            var items = [];
            var data = [];
            var convenience_charges = 0;
            var item_total = 0;
            var discount = 0;
            var item_total = 0;
            var total = 0;

            var order = await Order.findById(orderId).exec();
            var loggedInDetails = await User.findById(decoded.user).exec();
            if (order) {
                parts[j]['save_type'] = "confirmed"
                parts[j]['item_added'] = false
                parts[j]['issued'] = false
                parts[j]['title'] = parts[j].item
                var products = parts[j];
                if (products.title != "" || products.item != "") {
                    let getVendorOrder = await VendorOrders.findOne({ order: mongoose.Types.ObjectId(order._id) }).exec()
                    // console.log("Business ORder...", getVendorOrder.vendor, order._id)

                    var businessOrder = await BusinessOrder.findOne({
                        order: mongoose.Types.ObjectId(order._id),
                        business: mongoose.Types.ObjectId(getVendorOrder.vendor)
                    }).exec();
                    // console.log("Enter into itemcondition......", order._id)

                    var log = {
                        status: "Confirmed",
                        type: "Counter",
                        activity: "Confirmed",
                        user: loggedInDetails._id,
                        name: loggedInDetails.name,
                        created_at: date,
                        updated_at: date,
                    }
                    var id = mongoose.Types.ObjectId();
                    if (products.id != null) {
                        id = products.id
                    }
                    if (products) {
                        var tax_info = await Tax.findOne({ tax: products.tax }).exec();
                        if (products.product) {
                            var product = await BusinessProduct.findOne({ _id: products.product, business: business }).exec();
                            if (product) {
                                var tax = [];
                                var rate = products.rate;
                                var amount = products.rate * products.quantity;
                                var tax_rate = tax_info.detail;
                                var discount_total = 0;
                                var base = amount

                                var discount = products.discount;

                                if (discount.indexOf("%") >= 0) {
                                    discount = parseFloat(discount);
                                    if (!isNaN(discount) && discount > 0) {
                                        discount_total = amount * (discount / 100);
                                        amount = amount - parseFloat(discount_total.toFixed(2))
                                    }
                                }
                                else {
                                    if (discount == "") {
                                        discount = "0"
                                    }

                                    discount_total = parseFloat(discount);

                                    if (!isNaN(discount_total) && discount_total > 0) {
                                        amount = amount - parseFloat(discount_total.toFixed(2))
                                    }
                                }

                                if (products.amount_is_tax == "exclusive") {
                                    var tax_on_amount = amount;
                                    if (tax_rate.length > 0) {
                                        for (var r = 0; r < tax_rate.length; r++) {
                                            if (tax_rate[r].rate != tax_info.rate) {
                                                var t = tax_on_amount * (tax_rate[r].rate / 100);
                                                amount = amount + t;
                                                tax.push({
                                                    tax: tax_rate[r].tax,
                                                    rate: tax_rate[r].rate,
                                                    amount: parseFloat(t.toFixed(2))
                                                })
                                            }
                                            else {
                                                var t = tax_on_amount * (tax_info.rate / 100);
                                                amount = amount + t;
                                                tax.push({
                                                    tax: tax_info.tax, tax_rate: tax_info.rate,
                                                    rate: tax_info.rate,
                                                    amount: parseFloat(t.toFixed(2))
                                                })
                                            }
                                        }
                                    }
                                }

                                if (products.amount_is_tax == "inclusive") {
                                    var x = (100 + tax_info.rate) / 100;
                                    var tax_on_amount = amount / x;
                                    if (tax_rate.length > 0) {
                                        for (var r = 0; r < tax_rate.length; r++) {
                                            if (tax_rate[r].rate != tax_info.rate) {
                                                var t = tax_on_amount * (tax_rate[r].rate / 100);
                                                base = base - t;
                                                tax.push({
                                                    tax: tax_rate[r].tax,
                                                    rate: tax_rate[r].rate,
                                                    amount: parseFloat(t.toFixed(2))
                                                });
                                            }
                                            else {
                                                var t = amount - tax_on_amount;
                                                base = base - t;
                                                tax.push({
                                                    tax: tax_info.tax,
                                                    rate: tax_info.rate,
                                                    amount: parseFloat(t.toFixed(2))
                                                });
                                            }
                                        }
                                    }
                                    //base = base - discount_total;
                                }

                                var tax_details = {
                                    tax: tax_info.tax,
                                    rate: tax_info.rate,
                                    amount: total,
                                    detail: tax
                                }

                                items = {
                                    _id: id,
                                    order: order._id,
                                    product: product._id,
                                    category: product.category,
                                    _category: product._category,
                                    subcategory: product.subcategory,
                                    _subcategory: product._subcategory,
                                    product_brand: product.product_brand,
                                    _brand: product.product_brand,
                                    product_model: product.product_model,
                                    _model: product.product_model,
                                    source: product.source,
                                    part_no: products.part_no,
                                    hsn_sac: products.hsn_sac,
                                    unit: products.unit,
                                    title: products.title,
                                    sku: products.sku,
                                    mrp: products.mrp,
                                    selling_price: products.selling_price,
                                    rate: products.rate,
                                    quantity: products.quantity,
                                    base: parseFloat(base.toFixed(2)),
                                    amount: amount,
                                    discount: products.discount,
                                    discount_total: parseFloat(discount_total.toFixed(2)),
                                    amount_is_tax: products.amount_is_tax,
                                    tax_amount: parseFloat(_.sumBy(tax, x => x.amount).toFixed(2)),
                                    amount: parseFloat(amount.toFixed(2)),
                                    tax: tax_info.tax,
                                    tax_rate: tax_info.rate,
                                    tax_info: tax,
                                    issued: true,
                                    added_by_customer: false,
                                    delivery_date: businessOrder.delivery_date,
                                    tracking_no: Math.round(+new Date() / 1000) + "-" + Math.ceil((Math.random() * 90000) + 10000),
                                    business: business,
                                    created_at: new Date(),
                                    updated_at: new Date()
                                }
                            }
                            else {
                                return res.status(400).json({
                                    responseCode: 400,
                                    responseMessage: "Items not found",
                                    responseData: {}
                                });
                            }
                        }
                        else {
                            var tax = [];
                            var rate = products.rate;
                            var amount = products.rate * products.quantity;
                            var tax_rate = tax_info.detail;
                            var discount_total = 0
                            var base = amount;
                            var discount = products.discount;

                            if (discount.toString().indexOf("%") >= 0) {
                                discount = parseFloat(discount);
                                if (!isNaN(discount) && discount > 0) {
                                    discount_total = amount * (discount / 100);
                                    if (parseFloat(discount_total.toFixed(2)) > amount) {
                                        products.discount = amount.toString();
                                        discount_total = amount;
                                    }

                                    amount = amount - parseFloat(discount_total.toFixed(2))
                                }
                            }
                            else {
                                discount_total = parseFloat(discount);
                                if (!isNaN(discount_total) && discount_total > 0) {
                                    if (parseFloat(discount_total.toFixed(2)) > amount) {
                                        products.discount = amount.toString();
                                        discount_total = amount;
                                    }

                                    amount = amount - parseFloat(discount_total.toFixed(2))
                                }
                            }

                            if (products.amount_is_tax == "exclusive") {
                                var tax_on_amount = amount;
                                if (tax_rate.length > 0) {
                                    for (var r = 0; r < tax_rate.length; r++) {
                                        if (tax_rate[r].rate != tax_info.rate) {
                                            var t = tax_on_amount * (tax_rate[r].rate / 100);
                                            amount = amount + t;
                                            tax.push({
                                                tax: tax_rate[r].tax,
                                                rate: tax_rate[r].rate,
                                                amount: parseFloat(t.toFixed(2))
                                            })
                                        }
                                        else {
                                            var t = tax_on_amount * (tax_info.rate / 100);
                                            amount = amount + t;
                                            tax.push({
                                                tax: tax_info.tax, tax_rate: tax_info.rate,
                                                rate: tax_info.rate,
                                                amount: parseFloat(t.toFixed(2))
                                            })
                                        }
                                    }
                                }
                            }

                            if (products.amount_is_tax == "inclusive") {
                                amount = amount;
                                var x = (100 + tax_info.rate) / 100;
                                var tax_on_amount = amount / x;
                                if (tax_rate.length > 0) {
                                    for (var r = 0; r < tax_rate.length; r++) {
                                        if (tax_rate[r].rate != tax_info.rate) {
                                            var t = tax_on_amount * (tax_rate[r].rate / 100);
                                            base = base - t;
                                            tax.push({
                                                tax: tax_rate[r].tax,
                                                rate: tax_rate[r].rate,
                                                amount: parseFloat(t.toFixed(2))
                                            });
                                        }
                                        else {
                                            var t = amount - tax_on_amount;
                                            base = base - t;
                                            tax.push({
                                                tax: tax_info.tax,
                                                rate: tax_info.rate,
                                                amount: parseFloat(t.toFixed(2))
                                            });
                                        }
                                    }
                                }

                                //base = base - discount_total;
                            }

                            var tax_details = {
                                tax: tax_info.tax,
                                rate: tax_info.rate,
                                amount: total,
                                detail: tax
                            }
                            // console.log("Business ...", products.business)

                            items = {
                                _id: id,
                                order: order._id,
                                product: products.product,
                                category: null,
                                _category: "",
                                subcategory: null,
                                _subcategory: "",
                                product_brand: null,
                                _brand: "",
                                product_model: null,
                                _model: "",
                                source: products.source,
                                part_no: products.part_no,
                                hsn_sac: products.hsn_sac,
                                unit: products.unit,
                                title: products.title,
                                quantity: products.quantity,
                                unit: products.unit,
                                sku: products.sku,
                                mrp: products.mrp,
                                selling_price: products.selling_price,
                                rate: products.rate,
                                base: parseFloat(base.toFixed(2)),
                                discount: products.discount,
                                discount_total: parseFloat(discount_total.toFixed(2)),
                                amount_is_tax: products.amount_is_tax,
                                tax_amount: parseFloat(_.sumBy(tax, x => x.amount).toFixed(2)),
                                amount: parseFloat(amount.toFixed(2)),
                                tax: tax_info.tax,
                                tax_rate: tax_info.rate,
                                tax_info: tax,
                                issued: true,
                                added_by_customer: false,
                                delivery_date: businessOrder.delivery_date,
                                tracking_no: Math.round(+new Date() / 1000) + "-" + Math.ceil((Math.random() * 90000) + 10000),
                                business: business,
                                created_at: new Date(),
                                updated_at: new Date()
                            };
                        }
                    }

                    OrderLine.create(items).then(async function (ol) {
                        var items = await OrderLine.find({ order: order._id, business: getVendorOrder.vendor, status: { $nin: ["Cancelled"] } }).exec();

                        if (businessOrder.payment.convenience_charges) {
                            convenience_charges = Math.ceil(businessOrder.payment.convenience_charges);
                        }

                        var discount = parseFloat(_.sumBy(items, x => x.discount_total).toFixed(2));
                        var amount = parseFloat(_.sumBy(items, x => x.amount).toFixed(2));
                        var total = amount + discount + convenience_charges;
                        // console.log("Checking the order....", order)
                        var transaction_log = await q.all(fun.getOrderTransaction(getVendorOrder.order, getVendorOrder.vendor));
                        var paid_total = transaction_log.paid_total;

                        var data = {
                            updated_at: new Date(),
                            "payment.paid_total": paid_total,
                            "payment.amount": parseFloat(amount.toFixed(2)),
                            "payment.discount_total": parseFloat(discount.toFixed(2)),
                            "payment.total": parseFloat(total.toFixed(2)),
                            "payment.order_discount": parseFloat(order.payment.order_discount),
                            due: {
                                due: Math.ceil(amount) + convenience_charges - paid_total - (parseFloat(order.payment.order_discount))
                            }
                        }

                        Order.findOneAndUpdate({ _id: order._id }, { $set: data }, { new: false }, async function (err, doc) {
                            if (err) {
                                res.status(422).json({
                                    responseCode: 422,
                                    responseMessage: "Server Error",
                                    responseData: err
                                });
                            }
                            else {
                                BusinessOrder.findOneAndUpdate({ order: order._id, business: getVendorOrder.vendor }, { $set: data }, { new: false }, async function (err, doc) {
                                    if (err) {
                                        res.status(422).json({
                                            responseCode: 422,
                                            responseMessage: "Server Error",
                                            responseData: err
                                        });
                                    }
                                    else {
                                        await BusinessOrder.find({ order: businessOrder.order, business: getVendorOrder.vendor })
                                            .populate({ path: 'order', populate: [{ path: 'user', select: 'name contact_no username email account_info ' }, { path: 'car', select: 'title variant registration_no _automaker _model' }, { path: 'address' }] })
                                            .cursor().eachAsync(async (p) => {

                                                var has_invoice = false;
                                                var invoices = await OrderInvoice.find({ order: p.order._id, business: getVendorOrder.vendor }).select('status invoice_no').exec();

                                                if (invoices.length > 0) {
                                                    has_invoice = true;
                                                }

                                                var orders = {
                                                    _id: p.order._id,
                                                    id: p.order._id,
                                                    items: await q.all(fun.getBusinessOrderItems(p.order._id, business, req.headers['tz'])),
                                                    user: p.order.user,
                                                    car: p.order.car,
                                                    address: p.order.address,
                                                    due_date: moment(p.due_date).tz(req.headers['tz']).format('lll'),
                                                    delivery_date: moment(p.delivery_date).tz(req.headers['tz']).format('lll'),
                                                    time_slot: p.time_slot,
                                                    convenience: p.order.convenience,
                                                    order_no: p.order.order_no,
                                                    address: p.order.address,
                                                    payment: p.payment,
                                                    due: p.due,
                                                    log: p.log,
                                                    status: p.status,
                                                    has_invoice: has_invoice,
                                                    invoices: invoices,
                                                    created_at: moment(p.created_at).tz(req.headers['tz']).format('lll'),
                                                    updated_at: moment(p.updated_at).tz(req.headers['tz']).format('lll'),
                                                };

                                                /* res.status(200).json({
                                                     responseCode: 200,
                                                     responseMessage: "success",
                                                     responseData: orders
                                                 });*/
                                            });
                                    }
                                });
                            }
                        });
                    });
                }
                else {
                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Add New Item",
                        responseData: {}
                    });
                }
            }
            else {
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Order not found",
                    responseData: {}
                });
            }
        }
    }
    res.json({
        message: "Parts Added.."
    })

});







//Abhinav Sale&Purcahse
router.get("/get-sales-orders", async (req, res, next) => {
    // console.log("Sales orders....", req.query)
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];

    var orders = await VendorOrders.find({ vendor: mongoose.Types.ObjectId(business), status: "Requested" })
        .populate({ path: "business" })
        .sort({ created_at: -1 })
        .exec()

    if (orders.length > 0) {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Orders found",
            responseData: {
                orders: orders
            },
            orders: orders
        });
    } else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Order not found",
            responseData: {}
        });
    }
    // res.json({
    //     message: "Order found",
    //     orders: orders
    // })
});



// Sale Main Page start
router.get('/vendor/quotations/list/get', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /vendor/quotations/list/get Api Called from order.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

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
    // , 'Confirmed'/
    var quotations = []
    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Fatching Quotation Requests orders with their details, User:" + user.name);
    }
    await VendorOrders.find({ vendor: business, status: { $in: ['Requested', 'Submitted'] } })
        .populate({ path: 'business', select: "name contact_no" })
        .populate({ path: 'quotation', select: "quotation_no updated_at" })
        .sort({ created_at: -1 })
        .skip(limit * page).limit(limit)
        .cursor().eachAsync(async (p) => {

            var parts = _.filter(p.parts, part => part.status != 'Not requested');
            // quotations.push(p);
            quotations.push({
                id: p.id,
                _id: p._id,
                business: p.business,
                car: p.car,
                contact_no: p.contact_no,
                totat_parts: parts.length,
                quotation: p.quotation,
                request_date: p.request_date,
                status: p.status,
                vendor: p.vendor,
                created_at: p.created_at,
                updated_at: p.updated_at,
            })

        });
    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Sending Quotation Requests orders with their details in Response, User:" + user.name);
    }
    // console.log("Length  = " + quotations.length)
    res.status(200).json({
        responseCode: 200,
        responseMessage: "Sucesss",
        responseInfo: {
            totalResult: await VendorOrders.find({ vendor: business, status: { $in: ['Requested', 'Submitted'] } }).count().exec()
        },
        // , 'Confirmed'
        responseData: {
            quotations: quotations
        }
    });
    if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("INFO: Quotation Requests orders with their details in Response, User:" + user.name);
    }
});




router.put('/send/vendor/otp', async (req, res, next) => {
    businessFunctions.logs("INFO: /send/vendor/otp Api Called from order.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var business = req.headers['business'];
    var loggedInDetails = await User.findById(decoded.user).exec();

    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Fatching Vendor details, VendorId:" + req.body.order + ", User:" + loggedInDetails.name);
    }
    var order = await VendorOrders.findOne({ _id: req.body.order, vendor: business, status: { $in: ['Requested', 'Submitted'] } }).exec();
    if (order) {
        var otp = Math.floor(Math.random() * 90000) + 10000;
        order.otp = otp;
        order.isVarified = false;
        // console.log("VEndor contact_no...", order.contact_no)
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: event.otp(order.contact_no, otp) Function called.");
        }
        event.otp(order.contact_no, otp)
        await order.save()

        res.status(200).json({
            responseCode: 200,
            responseMessage: "OTP Send Successfully",
            responseData: {}
        });
        if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("INFO: OTP Send Successfully, Contact_no:" + order.contact_no);
        }
    } else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Order not found",
            responseData: {

            }
        });
    }
})

router.put('/vendor/otp/verify', async (req, res, next) => {
    businessFunctions.logs("INFO: /vendor/otp/verify Api Called from order.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

    // console.log("VendorID....", req.body.id)
    let vendorId = req.body.order
    let otp = req.body.otp
    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Fatching Vendor details, VendorId:" + req.body.order);
    }
    let vendor = await VendorOrders.findOne({ _id: vendorId }).exec()
    if (vendor) {
        if (vendor.otp == otp) {
            res.status(200).json({
                responseCode: 200,
                responseMessage: "OTP Verified Successfully",
                responseData: {}
            });
            if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("INFO: OTP Verified Successfully");
            }

        } else {
            if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
                businessFunctions.logs("WARNING: Incorrect OTP");
            }
            res.status(422).json({
                responseCode: 422,
                responseMessage: "Incorrect OTP",
                responseData: {}
            });
        }

    } else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Order Not Found",
            responseData: {}
        });
    }

});
router.get('/vendor/quotation/details', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /vendor/quotation/details Api Called from order.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var business = req.headers['business'];
    var user = await User.findById(decoded.user).exec();

    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Fatching order details, OrderId:" + req.query.id + ", " + "User:" + user.name);
    }
    var order = await VendorOrders.findOne({ _id: req.query.id, vendor: business, status: { $in: ['Requested', 'Submitted', 'Confirmed'] } })
        .populate({ path: 'business', select: "name contact_no address" })
        .populate({ path: 'quotation', select: "quotation_no buyerRemark" })
        .populate('car')
        .exec();
    if (order) {
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Sending order details in Response, OrderId:" + req.query.id + ", " + "Requested By:" + order.business.name + ", " + "User:" + user.name);
        }
        res.status(200).json({
            responseCode: 200,
            responseMessage: "Sucesss",
            responseData: {
                order: order
            }
        });
        if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("INFO: Quotation Order Details send in Response Successfully, OrderId:" + req.query.id + ", " + "Requested By:" + order.business.name + ", " + "User:" + user.name);
        }
    } else {
        if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
            businessFunctions.logs("WARNING: No Quotation Request Order found with the given orderId:" + req.query.id + ", " + "User:" + user.name);
        }
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Order not found",
            responseData: {

            }
        });
    }
});

// Shubham Tyagi
router.put('/quotation/price/update', async (req, res, next) => {
    businessFunctions.logs("INFO: /quotation/price/update Api Called from order.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var loggedInDetails = await User.findById(decoded.user).exec();
    var parts = req.body.parts;
    var orderId = req.body.orderId;
    var status = req.body.status
    // console.log("parts  ", JSON.stringify(parts[0], null, '\t'));

    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Fatching Quotation Requests order details, OrderId:" + req.body.orderId + ", " + "User:" + loggedInDetails.name);
    }
    var order = await VendorOrders.findById(orderId).exec();
    if (order) {
        var items = []
        var tax = []
        var total = 0
        console.log("order.parts.length = ", order.parts.length)
        console.log("parts.length = ", parts.length)
        if (parts.length > 0 && order.parts.length == parts.length) {
            for (var p = 0; p < parts.length; p++) {
                if (parts[p].isChecked) {
                    console.log("parts[p].quantity = ", parts[p].quantity)
                    console.log("parts[p].base = ", parts[p].base)
                    console.log("parts[p].tax = ", parts[p].tax)

                    if (parts[p].quantity != null && parts[p].base && parts[p].tax) {
                        var tax_info = await Tax.findOne({ tax: parts[p].tax }).exec();
                        if (tax_info) {
                            // console.log("Product ")
                            var tax_rate = tax_info.detail;
                            var base = parseFloat(parts[p].base)
                            // console.log("Base  = " + base)
                            var discount = parts[p].discount;
                            var amount = parseFloat(parts[p].base);
                            // if(discount.indexOf("%")>=0)
                            // {
                            //     discount = parseFloat(discount);
                            //     if(!isNaN(discount) && discount>0)
                            //     {
                            //         var discount_total = amount*(discount/100);
                            //         amount = amount-parseFloat(discount_total.toFixed(2))
                            //     }
                            // }
                            // else
                            // {
                            // discount = parseFloat(discount);
                            // if (!isNaN(discount) && discount > 0) {
                            //     base = base - parseFloat(discount.toFixed(2))
                            // }
                            // }

                            if (parts[p].amount_is_tax == "exclusive") {

                                if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                                    businessFunctions.logs("DEBUG: Calculate Tax details for exclusive tax.");
                                }
                                var tax_on_amount = amount;

                                if (tax_rate.length > 0) {
                                    for (var r = 0; r < tax_rate.length; r++) {
                                        if (tax_rate[r].rate != tax_info.rate) {
                                            var t = tax_on_amount * (tax_rate[r].rate / 100);
                                            amount = amount + t;
                                            // console.log("Tax AMO=" + t)
                                            tax.push({
                                                tax: tax_rate[r].tax,
                                                rate: tax_rate[r].rate,
                                                amount: parseFloat(t.toFixed(2))
                                            })
                                        }
                                        else {
                                            var t = tax_on_amount * (tax_info.rate / 100);
                                            amount = amount + t;
                                            // console.log("Tax AMO=" + t)

                                            tax.push({
                                                tax: tax_info.tax, tax_rate: tax_info.rate,
                                                rate: tax_info.rate,
                                                amount: parseFloat(t.toFixed(2))
                                            })
                                        }
                                    }
                                }
                                total = total + amount;

                                // console.log("Amount  = " + amount)
                            }

                            if (parts[p].amount_is_tax == "inclusive") {
                                var x = (100 + tax_info.rate) / 100;
                                var tax_on_amount = amount / x;
                                if (tax_rate.length > 0) {
                                    for (var r = 0; r < tax_rate.length; r++) {
                                        if (tax_rate[r].rate != tax_info.rate) {
                                            var t = tax_on_amount * (tax_rate[r].rate / 100);
                                            base = base - t;
                                            tax.push({
                                                tax: tax_rate[r].tax,
                                                rate: tax_rate[r].rate,
                                                amount: parseFloat(t.toFixed(2))
                                            });
                                        }
                                        else {
                                            var t = amount - tax_on_amount;
                                            base = base - t;
                                            tax.push({
                                                tax: tax_info.tax,
                                                rate: tax_info.rate,
                                                amount: parseFloat(t.toFixed(2))
                                            });
                                        }
                                    }
                                }
                                total = total + amount;
                            }

                            var tax_details = {
                                tax: tax_info.tax,
                                rate: tax_info.rate,
                                amount: total,
                                detail: tax
                            }

                            // console.log("Item Details = " + JSON.stringify(parts[p], null, '\t'))
                            carData = {}
                            if (parts[p].carDetails) {
                                var carData = {
                                    mfg: parts[p].carDetails.mfg,
                                    registration_no: parts[p].carDetails.registration_no,
                                    title: parts[p].carDetails.title,
                                    vin: parts[p].carDetails.vin
                                }
                            }

                            items.push({
                                part_no: parts[p].part_no,
                                hsn_sac: parts[p].hsn_sac,
                                item: parts[p].item,
                                quantity: parts[p].quantity,
                                stock: parts[p].quantity * parts[p].lot,
                                sku: parts[p].sku,
                                unit: parts[p].unit,
                                lot: parts[p].lot,
                                mrp: parts[p].unit_price,
                                amount: amount,
                                base: base,
                                unit_base_price: base / parseFloat(parts[p].quantity),
                                tax_amount: _.sumBy(tax, x => x.amount),
                                unit_price: amount / parseFloat(parts[p].quantity),
                                amount_is_tax: parts[p].amount_is_tax,
                                margin: parseFloat(parts[p].margin),
                                sell_price: base / parseFloat(parts[p].quantity) + parseFloat(parts[p].margin),
                                rate: base / parseFloat(parts[p].quantity) + parseFloat(parts[p].margin),
                                discount: parts[p].discount,
                                discount_type: parts[p].discount_type,
                                discount_total: parts[p].discount_total,
                                tax: tax_info.tax,
                                tax_rate: tax_info.rate,
                                tax_info: tax,
                                isChecked: parts[p].isChecked,
                                remark: parts[p].remark,
                                car: carData,
                                part_link: parts[p].part_link,
                                images: parts[p].images,
                                status: "Price Updated"
                            });

                            tax = [];
                            // }

                        } else {
                            if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
                                businessFunctions.logs("WARNING: Please check tax, Tax details not found for tax_slab, Tax Slab:" + parts[p].tax);
                            }

                            carData = {}
                            if (parts[p].carDetails) {
                                var carData = {
                                    mfg: parts[p].carDetails.mfg,
                                    registration_no: parts[p].carDetails.registration_no,
                                    title: parts[p].carDetails.title,
                                    vin: parts[p].carDetails.vin
                                }
                            }

                            items.push({
                                part_no: parts[p].part_no,
                                hsn_sac: parts[p].hsn_sac,
                                item: parts[p].item,
                                quantity: parts[p].quantity,
                                stock: parts[p].quantity * parts[p].lot,
                                sku: parts[p].sku,
                                unit: parts[p].unit,
                                lot: parts[p].lot,
                                mrp: 0,
                                amount: 0,
                                base: 0,
                                unit_base_price: 0,
                                tax_amount: 0,
                                unit_price: 0,
                                amount_is_tax: 'exclusive',
                                margin: 0,
                                sell_price: 0,
                                rate: 0,
                                discount: 0,
                                discount_type: 0,
                                discount_total: 0,
                                tax: '18.0% GST',
                                tax_rate: 18,
                                tax_info: tax,
                                isChecked: parts[p].isChecked,
                                remark: parts[p].remark,
                                car: carData,
                                part_link: parts[p].part_link,
                                images: parts[p].images,
                                status: "requested"
                            });

                            tax = [];
                            // res.status(422).json({
                            //     responseCode: 422,
                            //     responseMessage: "Please check tax",
                            //     responseData: {}
                            // });
                        }

                    } else {
                        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                            businessFunctions.logs("ERROR: Quantity, Tax Type and Base Amount are required to update price for the Quotation for Parts:" + parts[p].item + ", " + "User:" + loggedInDetails.name);
                        }

                        carData = {}
                        if (parts[p].carDetails) {
                            var carData = {
                                mfg: parts[p].carDetails.mfg,
                                registration_no: parts[p].carDetails.registration_no,
                                title: parts[p].carDetails.title,
                                vin: parts[p].carDetails.vin
                            }
                        }

                        items.push({
                            part_no: parts[p].part_no,
                            hsn_sac: parts[p].hsn_sac,
                            item: parts[p].item,
                            quantity: parts[p].quantity,
                            stock: parts[p].quantity * parts[p].lot,
                            sku: parts[p].sku,
                            unit: parts[p].unit,
                            lot: parts[p].lot,
                            mrp: 0,
                            amount: 0,
                            base: 0,
                            unit_base_price: 0,
                            tax_amount: 0,
                            unit_price: 0,
                            amount_is_tax: 'exclusive',
                            margin: 0,
                            sell_price: 0,
                            rate: 0,
                            discount: 0,
                            discount_type: 0,
                            discount_total: 0,
                            tax: '18.0% GST',
                            tax_rate: 18,
                            tax_info: tax,
                            isChecked: parts[p].isChecked,
                            remark: parts[p].remark,
                            car: carData,
                            part_link: parts[p].part_link,
                            images: parts[p].images,
                            // status: "Price Updated"
                            status: "requested"
                        });

                        tax = [];
                        // res.status(422).json({
                        //     responseCode: 422,
                        //     responseMessage: "Invalid Quantity, Tax Type , Base Amount " + parts[p].item,
                        //     responseData: {}
                        // });
                    }
                } else {
                    carData = {}
                    if (parts[p].carDetails) {
                        var carData = {
                            mfg: parts[p].carDetails.mfg,
                            registration_no: parts[p].carDetails.registration_no,
                            title: parts[p].carDetails.title,
                            vin: parts[p].carDetails.vin
                        }
                    }
                    items.push({
                        part_no: parts[p].part_no,
                        hsn_sac: parts[p].hsn_sac,
                        item: parts[p].item,
                        quantity: parts[p].quantity,
                        stock: parts[p].quantity * parts[p].lot,
                        sku: parts[p].sku,
                        unit: parts[p].unit,
                        lot: parts[p].lot,
                        mrp: parts[p].unit_price,
                        amount: 0,
                        base: 0,
                        unit_base_price: 0,
                        tax_amount: 0,
                        unit_price: 0,
                        amount_is_tax: parts[p].amount_is_tax,
                        margin: 0,
                        sell_price: 0,
                        rate: 0,
                        discount: 0,
                        discount_type: '',
                        discount_total: 0,
                        tax: '',
                        tax_rate: 0,
                        tax_info: [],
                        isChecked: false,
                        remark: '',
                        car: carData,
                        part_link: parts[p].part_link,
                        images: parts[p].images,
                        status: "Not requested"
                    });
                    // console.log("Item Not Check Index  = " + p)
                }
            }
            // && order.order_status != 'Open'
            if (order.status == 'Requested') {
                // console.log("Adede Quota")
                var quotation = await QuotationOrders.findOne({ _id: order.quotation }).exec();
                quotation.quotation_received = quotation.quotation_received + 1;
                await quotation.save();
            }

            var total_amount = _.sumBy(items, x => x.amount);
            // order_status: 'Open',
            await VendorOrders.findOneAndUpdate({ _id: orderId }, { $set: { status: status, parts: items, total_amount: total_amount, updated_at: new Date, } }, { new: false }, async function (err, doc) {
                if (err) {
                    if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                        businessFunctions.logs("ERROR: Error Occured While updating the details for the order, OrderId:" + orderId);
                    }
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Server Error...",
                        responseData: err
                    });
                }
                else {
                    // await QuotationOrders.findByOneAndUpdate({_id:order.quotation},{$set:{quotation_submitted:}})
                }
                // console.log(doc.vendor, doc.business);

                if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                    businessFunctions.logs("DEBUG: whatsAppEvent.qutationReq(doc.vendor, doc.business) function called from order.js for order, OrderId:" + orderId);
                }
                whatsAppEvent.qutationReq(doc.vendor, doc.business);
                var activity = 'Quotation Update'
                fun.webNotification(activity, doc);

            });





            res.status(200).json({
                responseCode: 200,
                responseMessage: "Successfully Saved",
                responseData: await VendorOrders.findById(orderId).exec()
            });
            if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("INFO: Details are saved successfully for the order, OrderId:" + orderId + ", " + "User:" + loggedInDetails.name);
            }
        } else {
            res.status(422).json({
                responseCode: 422,
                responseMessage: "Error Occured: Please Re-Open the quoation",
                responseData: {}
            });
        }
    } else {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR: Quotation Requests Order does not exists with the given order Id, OrderId:" + req.body.orderId + ", " + "User:" + loggedInDetails.name);
        }
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Error ",
            responseData: err
        });
    }





})

router.post('/quotation/sales/order/create', async (req, res, next) => {

    let vendors = req.body.vendors

    for (let i = 0; i < vendors.length; i++) {

        var business = vendors[i]
        // console.log("Vendors....", business)
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);

        var quotationId = req.body.quotation_received;

        var date = new Date();
        var loggedInDetails = decoded.user;
        var car = null;
        var address = null;
        var items = [];
        var data = [];

        var item_total = 0;
        var discount = 0;
        var item_total = 0;
        var total = 0;
        var due = {
            due: 0
        };

        // let vendorOrder = await VendorOrders.findOne({
        //     quotation: mongoose.Types.ObjectId(req.body.quotation),
        //     vendor: mongoose.Types.ObjectId(business)
        // }).exec()

        var quotation = await QuotationOrders.findById(req.body.quotationId).exec();
        if (quotation) {
            await VendorOrders.find({ quotation: quotationId, status: { $in: ['Confirmed'] } })
                .sort({ created_at: -1 })
                .skip(limit * page).limit(limit)
                .cursor().eachAsync(async (vendorOrder) => {

                    var business = vendorOrder.vendor   //Saler Admin Id

                    // console.log("User   = " + vendorOrder.business)
                    var user = await User.findById(vendorOrder.business).exec();
                    var loggedInDetails = await User.findById(decoded.user).exec();
                    if (user) {
                        if (req.body.address) {
                            var checkAddress = await Address.findOne({ _id: req.body.address, user: user._id }).exec();
                            if (checkAddress) {
                                address = checkAddress._id;
                            }
                            else {
                                /*return res.status(400).json({
                                    responseCode: 400,
                                    responseMessage: "Address not found",
                                    responseData: {}
                                });*/
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
                                /* return res.status(400).json({
                                     responseCode: 400,
                                     responseMessage: "Car not found",
                                     responseData: {}
                                 });*/
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


                        var requestedParts = _.filter(vendorOrder.parts, x => x.status == "Completed");
                        // items = _.filter(vendorOrder.parts, x => x.status == "Completed");
                        var totalAmount = parseFloat(_.sumBy(items, x => x.amount).toFixed(2));
                        due = {
                            due: totalAmount
                        };
                        // console.log("Dues  = " + due)

                        await Order.create({
                            convenience: req.body.convenience,
                            time_slot: req.body.time_slot,
                            user: user._id,
                            car: car,
                            address: address,
                            // items: items,
                            items: items,
                            requestdItems: requestedParts,
                            business: business,
                            payment: payment,
                            due: due,
                            status: "Ordered",
                            created_at: new Date(),
                            updated_at: new Date(),
                        }).then(async function (o) {
                            // vendorOrder.order = o._id     

                            var count = Order.find({ _id: { $lt: o._id } }).count();

                            var order_no = Math.round(+new Date() / 1000) + "-" + Math.ceil((Math.random() * 90000) + 10000) + "-" + Math.ceil(count + 1);

                            await Order.findOneAndUpdate({ _id: o._id }, { $set: { order_no: order_no } }, { new: true }, function (err, doc) {
                                if (err) {
                                    res.status(422).json({
                                        responseCode: 422,
                                        responseMessage: "Server Errro",
                                        responseData: err
                                    });
                                }
                                else {
                                    // console.log("Business Order create.", business)
                                    var businessOrder = {
                                        order: o._id,
                                        _order: order_no,
                                        due_date: null,
                                        delivery_date: null,
                                        convenience: req.body.convenience,
                                        time_slot: req.body.time_slot,
                                        user: user._id,
                                        // items: items,
                                        items: items,
                                        business: business,
                                        payment: payment,
                                        status: "Confirmed",
                                        created_at: new Date(),
                                        updated_at: new Date(),
                                        due: due
                                    };

                                    BusinessOrder.create(businessOrder).then(async function (bo) {
                                        // vendorOrder.businessOrder = bo._id  //To Add In Vendor Order
                                        // vendorOrder.markModified("businessOrder")
                                        // vendorOrder.markModified("order")
                                        // await vendorOrder.save()
                                        var count = await BusinessOrder.find({ _id: { $lt: bo._id }, business: business }).count();
                                        var order_no = count + 1;

                                        await BusinessOrder.findOneAndUpdate({ _id: bo._id }, { $set: { order_no: order_no } }, { new: true }, async function (err, doc) {

                                            var order = BusinessOrder.findById(bo._id)
                                                .populate({ path: 'order', populate: [{ path: 'user', select: 'name contact_no username email account_info ' }, { path: 'car', select: 'title variant registration_no _automaker _model' }, { path: 'address' }] })
                                                .exec();

                                            var items = await OrderLine.find({ order: bo.order, business: business }).exec();

                                            var vendorOrderData = {
                                                order: o._id,
                                                businessOrder: bo._id,

                                            }
                                            await VendorOrders.findOneAndUpdate({ _id: vendorOrder._id }, { $set: { order_no: order_no } }, { new: true }, async function (err, doc) {
                                            })
                                            // console.log("Items Length  = " + items.length)
                                            // var items = await businessFunctions.addOrderLineItems(items, o._id, business, user)
                                            /*res.status(200).json({
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
                                            });*/
                                        });
                                    });
                                    // createOrder(vendors, req.body.quotation)



                                }
                            });
                        });
                    }
                    else {
                        res.status(400).json({
                            responseCode: 400,
                            responseMessage: "User not found",
                            responseData: {}
                        });
                    }
                })
        } else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Quotation not found",
                responseData: {}
            });
        }
    }


    res.json({
        message: "Order Cretated"
    })
})



router.post('/order/stock/item/create', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var product = new Object();
    var result = [];
    var tax = [];
    var total = 0;
    var part = req.body.items
    var margin_total = 0
    var part_no = part.part_no;
    part_no = part_no.replace(/,/g, ", ");
    part_no = part_no.toUpperCase();
    var unit = 'Piece';
    // console.log("User  = " + user)
    var loggedInDetails = await User.findById(user).exec();
    var businessProduct = await BusinessProduct.find({ part_no: part_no, unit: unit, business: business }).exec();
    if (businessProduct.length == 0) {
        var tax_slab = part.tax;
        var sale_price = parseFloat(part.rate); //Sale Price
        part.selling_price = part.rate;
        var base = parseFloat(sale_price);
        var margin = "10%";   //Default Margin

        // var margin = part.margin  //Margin
        var product_brand = null;
        var brand_category = null;
        var category = part.category;   //OEM or OES   partNo_category
        var item_name = part.title; //Item name 
        var models = []
        var discount = part.discount;
        var quantity = part.quantity
        var tax_info = await Tax.findOne({ tax: tax_slab }).exec();  //products[p].tax = "28.0% GST"
        var tax_rate = tax_info.detail;
        var total_amount = 0

        if (margin) {
            margin = margin.toString();
            if (margin.indexOf("%") >= 0) {
                margin = parseFloat(margin);
                if (!isNaN(margin) && margin > 0) {
                    margin_total = sale_price * (margin / 100);
                    base = sale_price - margin_total;   //To Set By Default 5% Margin to every Product

                }
            }
            else {
                margin_total = parseFloat(margin)
                base = sale_price - margin_total;
            }
        }
        // console.log("Base Price = " + base)
        // console.log("Margin Price = " + margin_total)
        // console.log("Sale Price  = " + sale_price)
        if (part.isDiscount) {
            // console.log("Discount prints here...", discount)
            if (discount.indexOf("%") >= 0) {
                // console.log("602 - Discount If Condition = " + discount)
                discount = parseFloat(discount);
                if (!isNaN(discount) && discount > 0) {
                    var discount_total = base * (discount / 100);
                    base = base - parseFloat(discount_total.toFixed(2))
                }
            }
            else {
                // console.log("610 - Discount ELSE Condition= " + discount)


                discount = parseFloat(discount);
                if (!isNaN(discount) && discount > 0) {
                    base = base - parseFloat(discount.toFixed(2))
                }
            }
        }
        var rate = base;
        var amount_is_tax = "exclusive";
        if (amount_is_tax == "exclusive") {
            var tax_on_amount = base;
            if (tax_rate.length > 0) {
                for (var r = 0; r < tax_rate.length; r++) {
                    if (tax_rate[r].rate != tax_info.rate) {
                        var t = tax_on_amount * (tax_rate[r].rate / 100);
                        rate = rate + t;
                        tax.push({
                            tax: tax_rate[r].tax,
                            rate: tax_rate[r].rate,
                            amount: parseFloat(t.toFixed(2))
                        })
                    }
                    else {
                        var t = tax_on_amount * (tax_info.rate / 100);
                        rate = rate + t;
                        tax.push({
                            tax: tax_info.tax, tax_rate: tax_info.rate,
                            rate: tax_info.rate,
                            amount: parseFloat(t.toFixed(2))
                        })
                    }
                }
            }
        }
        // console.log("Base + GST +Margin  = ", (rate + margin_total))
        // console.log("Purchase Price  = " + rate)
        // console.log("Amount Price  = " + rate)


        /*
       if (amount_is_tax == "inclusive") {
              var x = (100 + tax_info.rate) / 100;
              var tax_on_amount = amount / x;
              if (tax_rate.length > 0) {
                  for (var r = 0; r < tax_rate.length; r++) {
                      if (tax_rate[r].rate != tax_info.rate) {
                          var t = tax_on_amount * (tax_rate[r].rate / 100);
                          base = base - t;
                          tax.push({
                              tax: tax_rate[r].tax,
                              rate: tax_rate[r].rate,
                              amount: parseFloat(t.toFixed(2))
                          });
                      }
                      else {
                          var t = amount - tax_on_amount;
                          base = base - t;
                          tax.push({
                              tax: tax_info.tax,
                              rate: tax_info.rate,
                              amount: parseFloat(t.toFixed(2))
                          });
                      }
                  }
              }
          }*/
        var taxes = {
            tax: tax_info.tax,
            rate: tax_info.rate,
            amount: amount,
            detail: tax
        }
        var sku = {
            sku: 'Direct Sale',
            total: 0,
            available: 0,
            created_at: new Date()
        };
        var stock = {
            // total: quantity,
            // consumed: quantity,
            // available: 0 - quantity,
            total: 0,
            consumed: 0,
            available: 0,
        };
        var amount = parseFloat(base) + parseFloat(margin_total);
        // console.log("Total Amountn = " + total_amount)
        var tax_on_amount = amount;
        if (tax_rate.length > 0) {
            for (var r = 0; r < tax_rate.length; r++) {
                if (tax_rate[r].rate != tax_info.rate) {
                    var t = tax_on_amount * (tax_rate[r].rate / 100);
                    amount = amount + t;
                }
                else {
                    var t = tax_on_amount * (tax_info.rate / 100);
                    amount = amount + t;
                }
            }
        }
        // console.log("Amount  = " + amount)

        var price = {
            base: base, //base price with GST
            tax_amount: _.sumBy(tax, x => x.amount), //Tax Amount
            purchase_price: rate,  //base + GST on base
            rate: parseFloat(part.rate),
            amount: amount,
            mrp: amount,
            discount: 0,
            discount_type: "Not Applicable",
            isDiscount: false,
            margin: margin,
            sell_price: parseFloat(part.rate),
            margin_total: margin_total,


        }

        var list_type = [];
        list_type.push("Offline");
        var purchases = [];
        // console.log("1772 Amount = " + amount)
        var data = {
            purchase: null,
            purchases: purchases,
            business: business,
            product: null,
            product_id: Math.round(+new Date() / 1000) + Math.round((Math.random() * 9999) + 1),
            part_no: part_no, //mend
            product_brand: product_brand, //
            product_model: null,
            model: null,
            category: null,
            // _subcategory: brand_category,
            subcategory: brand_category,
            title: item_name,
            short_description: "",
            long_description: "",
            thumbnail: "",
            specification: "",
            hsn_sac: '',
            quantity: 0,
            unit: unit,
            models: models,
            stock: 0,
            sku: sku,
            list_type: list_type,
            price: price,
            amount_is_tax: amount_is_tax,
            tax: tax_info.tax,
            tax_rate: tax_info.rate,
            tax_type: tax_info.tax.split('% ').pop(),
            // tax_type: "GST",
            part_category: category,
            tax_info: taxes,
            list_type: list_type,

            created_at: new Date(),
            updated_at: new Date()
        };
        var updatedData = {}
        await BusinessProduct.create(data).then(async function (bp) {
            // console.log(bp._id)
            var activity = {
                vendor_name: "Created",
                quantity: 0,
                unit_price: bp.purchase_price,
                price: 0,
                received_by: loggedInDetails.name,
                purchase: null,
                remark: 'remark',
                business: business,
                activity: "Created",
                created_at: new Date()
            };
            fun.productLog(bp._id, activity);
            var product = await BusinessProduct.findOne({ _id: bp._id }).exec();
            updatedData = {
                _id: product._id,
                id: product._id,
                product: product.title,
                part_no: product.part_no,
                hsn_sac: product.hsn_sac,
                specification: product.specification,
                base: product.price.base,
                price: product.price.purchase_price,
                unit: product.unit,
                item_details: product
            }




            ///////  Next Step Is to Add Item In Order 
            var items = [];
            var convenience_charges = 0;
            var discount = 0;
            var total = 0;
            var order = await Order.findById(req.body.order).exec();
            // var loggedInDetails = await User.findById(decoded.user).exec();
            if (order) {
                if (product.title != "" && product.part_no != '') {
                    var businessOrder = await BusinessOrder.findOne({ order: order._id, business: business }).exec();

                    var log = {
                        status: "Confirmed",
                        type: "Counter",
                        activity: "Confirmed",
                        user: loggedInDetails._id,
                        name: loggedInDetails.name,
                        created_at: new Date(),
                        updated_at: new Date(),
                    }
                    // var id = mongoose.Types.ObjectId();
                    var id = null;
                    if (part.id != null) {
                        id = part.id
                    }
                    if (product) {
                        var tax_info = await Tax.findOne({ tax: part.tax }).exec();
                        if (product) {
                            // var product = await BusinessProduct.findOne({ _id: products.product, business: business }).exec();
                            // if (product) {
                            var tax = [];
                            var rate = product.price.rate;
                            // console.log("New ORderLine   rate = " + product.price.rate)
                            var amount = product.price.rate * quantity;
                            // console.log("New ORderLine   quantity = " + quantity)

                            // console.log("New ORderLine   amount = " + amount)


                            // return res.json(product)
                            var tax_rate = tax_info.detail;
                            var discount_total = 0;
                            var base = amount

                            var discount = product.price.discount;
                            if (product.price.isDiscount) {
                                if (discount.indexOf("%") >= 0) {
                                    discount = parseFloat(discount);
                                    if (!isNaN(discount) && discount > 0) {
                                        discount_total = amount * (discount / 100);
                                        amount = amount - parseFloat(discount_total.toFixed(2))
                                    }
                                }
                                else {
                                    if (discount == "") {
                                        discount = "0"
                                    }

                                    discount_total = parseFloat(discount);

                                    if (!isNaN(discount_total) && discount_total > 0) {
                                        amount = amount - parseFloat(discount_total.toFixed(2))
                                    }
                                }
                            }

                            if (product.amount_is_tax == "exclusive") {

                                var tax_on_amount = amount;
                                if (tax_rate.length > 0) {
                                    for (var r = 0; r < tax_rate.length; r++) {
                                        if (tax_rate[r].rate != tax_info.rate) {
                                            var t = tax_on_amount * (tax_rate[r].rate / 100);
                                            amount = amount + t;
                                            tax.push({
                                                tax: tax_rate[r].tax,
                                                rate: tax_rate[r].rate,
                                                amount: parseFloat(t.toFixed(2))
                                            })
                                        }
                                        else {
                                            var t = tax_on_amount * (tax_info.rate / 100);
                                            amount = amount + t;
                                            tax.push({
                                                tax: tax_info.tax, tax_rate: tax_info.rate,
                                                rate: tax_info.rate,
                                                amount: parseFloat(t.toFixed(2))
                                            })
                                        }
                                    }
                                }
                            }
                            // console.log("Amount OrderLine  = " + amount);
                            if (product.price.amount_is_tax == "inclusive") {
                                var x = (100 + tax_info.rate) / 100;
                                var tax_on_amount = amount / x;
                                if (tax_rate.length > 0) {
                                    for (var r = 0; r < tax_rate.length; r++) {
                                        if (tax_rate[r].rate != tax_info.rate) {
                                            var t = tax_on_amount * (tax_rate[r].rate / 100);
                                            base = base - t;
                                            tax.push({
                                                tax: tax_rate[r].tax,
                                                rate: tax_rate[r].rate,
                                                amount: parseFloat(t.toFixed(2))
                                            });
                                        }
                                        else {
                                            var t = amount - tax_on_amount;
                                            base = base - t;
                                            tax.push({
                                                tax: tax_info.tax,
                                                rate: tax_info.rate,
                                                amount: parseFloat(t.toFixed(2))
                                            });
                                        }
                                    }
                                }
                                //base = base - discount_total;
                            }
                            // console.log("Base  = " + base)
                            var tax_details = {
                                tax: tax_info.tax,
                                rate: tax_info.rate,
                                amount: total,
                                detail: tax
                            }

                            items = {

                                order: order._id,
                                product: product._id,
                                category: product.category,
                                _category: product._category,
                                subcategory: product.subcategory,
                                _subcategory: product._subcategory,
                                product_brand: product.product_brand,
                                _brand: product.product_brand,
                                product_model: product.product_model,
                                _model: product.product_model,
                                source: product._id,
                                part_no: product.part_no,
                                hsn_sac: product.hsn_sac,
                                unit: product.unit,
                                title: product.title,
                                sku: product.sku,
                                mrp: product.price.mrp,
                                selling_price: part.rate,
                                rate: product.price.rate,
                                quantity: quantity,
                                base: parseFloat(base.toFixed(2)),
                                amount: amount,
                                discount: part.discount,
                                discount_total: parseFloat(discount_total.toFixed(2)),
                                amount_is_tax: part.amount_is_tax,
                                tax_amount: parseFloat(_.sumBy(tax, x => x.amount).toFixed(2)),
                                amount: parseFloat(amount.toFixed(2)),
                                tax: tax_info.tax,
                                tax_rate: tax_info.rate,
                                tax_info: tax,
                                issued: true,
                                added_by_customer: false,
                                delivery_date: businessOrder.delivery_date,
                                tracking_no: Math.round(+new Date() / 1000) + "-" + Math.ceil((Math.random() * 90000) + 10000),
                                business: business,
                                created_at: new Date(),
                                updated_at: new Date()
                            }
                            // }
                            // else {
                            //     return res.status(400).json({
                            //         responseCode: 400,
                            //         responseMessage: "Items not found",
                            //         responseData: {}
                            //     });
                            // }
                        }

                    }

                    await OrderLine.create(items).then(async function (ol) {
                        var items = await OrderLine.find({ order: order._id, business: business, status: { $nin: ["Cancelled"] } }).exec();

                        if (businessOrder.payment.convenience_charges) {
                            convenience_charges = Math.ceil(businessOrder.payment.convenience_charges);
                        }

                        var discount = parseFloat(_.sumBy(items, x => x.discount_total).toFixed(2));
                        var amount = parseFloat(_.sumBy(items, x => x.amount).toFixed(2));
                        var total = amount + discount + convenience_charges;

                        var transaction_log = await q.all(fun.getOrderTransaction(order._id, business));
                        var paid_total = transaction_log.paid_total;

                        var data = {
                            updated_at: new Date(),
                            "payment.paid_total": paid_total,
                            "payment.amount": parseFloat(amount.toFixed(2)),
                            "payment.discount_total": parseFloat(discount.toFixed(2)),
                            "payment.total": parseFloat(total.toFixed(2)),
                            "payment.order_discount": parseFloat(order.payment.order_discount),
                            due: {
                                due: Math.ceil(amount) + convenience_charges - paid_total - (parseFloat(order.payment.order_discount))
                            }
                        }
                        var user = await User.findById(order.user).exec();
                        var issued = await q.all(businessFunctions.salesPartIssue(ol, business, user, loggedInDetails));
                        if (issued) {
                            await OrderLine.findOneAndUpdate({ _id: order._id }, { $set: { issued: issued, updated_at: new Date() } }, { new: false }, async function (err, doc) { })

                        }
                        // console.log("Issued = " + issued)

                        await Order.findOneAndUpdate({ _id: ol._id }, { $set: data }, { new: false }, async function (err, doc) {
                            if (err) {
                                res.status(422).json({
                                    responseCode: 422,
                                    responseMessage: "Server Error",
                                    responseData: err
                                });
                            }
                            else {
                                // console.log("6212 = " + issued)
                                await BusinessOrder.findOneAndUpdate({ order: order._id, business: business }, { $set: data }, { new: false }, async function (err, doc) {
                                    if (err) {
                                        res.status(422).json({
                                            responseCode: 422,
                                            responseMessage: "Server Error",
                                            responseData: err
                                        });
                                    }
                                    else {
                                        // console.log("6222  Business = " + business)

                                        await BusinessOrder.find({ order: businessOrder.order, business: business })
                                            .populate({ path: 'order', populate: [{ path: 'user', select: 'name contact_no username email account_info ' }, { path: 'car', select: 'title variant registration_no _automaker _model' }, { path: 'address' }] })
                                            .cursor().eachAsync(async (p) => {

                                                var has_invoice = false;
                                                var invoices = await OrderInvoice.find({ order: p.order._id, business: business }).select('status invoice_no').exec();

                                                if (invoices.length > 0) {
                                                    has_invoice = true;
                                                }

                                                var orders = {
                                                    _id: p.order._id,
                                                    id: p.order._id,
                                                    items: await q.all(fun.getBusinessOrderItems(p.order._id, business, req.headers['tz'])),
                                                    user: p.order.user,
                                                    car: p.order.car,
                                                    address: p.order.address,
                                                    due_date: moment(p.due_date).tz(req.headers['tz']).format('lll'),
                                                    delivery_date: moment(p.delivery_date).tz(req.headers['tz']).format('lll'),
                                                    time_slot: p.time_slot,
                                                    convenience: p.order.convenience,
                                                    order_no: p.order.order_no,
                                                    address: p.order.address,
                                                    payment: p.payment,
                                                    due: p.due,
                                                    log: p.log,
                                                    status: p.status,
                                                    has_invoice: has_invoice,
                                                    invoices: invoices,
                                                    created_at: moment(p.created_at).tz(req.headers['tz']).format('lll'),
                                                    updated_at: moment(p.updated_at).tz(req.headers['tz']).format('lll'),
                                                };

                                                res.status(200).json({
                                                    responseCode: 200,
                                                    responseMessage: "success",
                                                    responseData: orders
                                                });
                                            });
                                    }
                                });
                            }
                        });
                    });
                }
                else {
                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Add New Item",
                        responseData: {}
                    });
                }
            }
            else {
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Order not found",
                    responseData: {}
                });
            }





        });

        // res.status(200).json({
        //     responseCode: 200,
        //     responseMessage: "Item Created Successfully",
        //     responseData: updatedData
        // });
    } else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Item Already Exist",
            responseData: {}
        });
    }

});
router.get('/order/items/search/', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /order/items/search/ Api Called from order.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    var rules = {
        query: 'required',
        // quantity: 'required',
    };
    var validation = new Validator(req.query, rules);
    if (validation.fails()) {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR: Validation failed, Part Name / Part No Required is required.");
        }
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Part Name / Part No Required",
            responseData: {
                res: validation.errors.all()
            }
        })
    }
    else {
        var id = mongoose.Types.ObjectId();
        var business = req.headers['business'];
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var user = await User.findById(decoded.user).exec();

        var data = [];
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Fatching Search item details, Search Query:" + req.query.query);
        }
        await BusinessProduct.find({ business: business, list_type: { $in: ["Offline"] }, $or: [{ part_no: new RegExp(req.query.query, "i") }, { title: new RegExp(req.query.query, "i") }, { models: { $in: new RegExp(req.query.query, "i") } }] })
            .cursor().eachAsync(async (p) => {
                data.push({
                    _id: p.id,
                    id: p.id,
                    title: p.title,
                    sku: p.sku,
                    part_no: p.part_no,
                    hsn_sac: p.hsn_sac,
                    product: p._id,
                    unit: p.unit,
                    issued: false,
                    discount: p.price.discount,
                    discount_type: p.price.discount_type,
                    amount_is_tax: p.amount_is_tax,
                    price: p.price,
                    // tax_amount: parseFloat(_.sumBy(tax, x => x.amount).toFixed(2)),
                    tax: p.tax,
                    tax_rate: p.tax_info.rate,
                    // tax_info: tax_details,
                    available: p.stock.available,
                    business: p.business,
                });


            });
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Sending Search item details in Response, Search Query:" + req.query.query);
        }
        res.status(200).json({
            responseCode: 200,
            responseMessage: "",
            responseData: data
        })
        if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("INFO: Search item details send successfully in response, User:" + user.name);
        }

    }
});
router.delete('/order/item/return/abhi', xAccessToken.token, async function (req, res, next) {
    var business = req.headers['business'];
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var date = new Date();
    var loggedInDetails = decoded.user;
    var items = [];
    var data = [];

    var item_total = 0;
    var discount = 0;
    var item_total = 0;
    var total = 0;

    var order = await Order.findById(req.body.order).exec();
    var loggedInDetails = await User.findById(decoded.user).exec();
    if (order) {
        // await OrderLine.find({ business: business, order: order._id })
        //     .cursor().eachAsync(async (item) => {
        //         if (item.issued == true) {
        //             var r = await q.all(businessFunctions.orderItemReturn(item));
        //         }
        //     });
        var item = await OrderLine.findOneAndUpdate({ _id: req.body.item, issued: true }).exec();
        if (item) {
            var r = await q.all(businessFunctions.orderItemReturn(item));
        }

        var date = new Date();
        var businessOrder = await BusinessOrder.findOne({ order: order._id, business: business }).exec();

        var data = {
            updated_at: new Date(),
            status: "Cancelled"
        }

        await Order.findOneAndUpdate({ _id: businessOrder.order }, { $set: data }, { new: false }, async function (err, doc) {
            if (err) {
                res.status(422).json({
                    responseCode: 422,
                    responseMessage: "Server Error",
                    responseData: err
                });
            }
            else {
                await BusinessOrder.findOneAndUpdate({ order: businessOrder.order, business: business }, { $set: data }, { new: false }, async function (err, doc) {
                    if (err) {
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Server Error",
                            responseData: err
                        });
                    }
                    else {
                        // { order: order._id, business: business, status: "Active" }
                        await OrderInvoice.findOneAndUpdate({ order: businessOrder.order, business: business, status: "Active" }, { $set: { status: 'Cancelled', updated_at: new Date() } }, { new: false }, async function (err, doc) {
                            if (err) {
                                res.status(422).json({
                                    responseCode: 422,
                                    responseMessage: "Server Error",
                                    responseData: err
                                });
                            }
                            else { }
                        })
                        await BusinessOrder.find({ order: businessOrder.order, business: business })
                            .populate({ path: 'order', populate: [{ path: 'user', select: 'name contact_no username email account_info ' }, { path: 'car', select: 'title variant registration_no _automaker _model' }, { path: 'address' }] })
                            .cursor().eachAsync(async (p) => {

                                var orders = {
                                    _id: p.order._id,
                                    id: p.order._id,
                                    items: await q.all(fun.getBusinessOrderItems(p.order._id, business, req.headers['tz'])),
                                    user: p.order.user,
                                    car: p.order.car,
                                    address: p.order.address,
                                    due_date: moment(p.due_date).tz(req.headers['tz']).format('lll'),
                                    delivery_date: moment(p.delivery_date).tz(req.headers['tz']).format('lll'),
                                    time_slot: p.time_slot,
                                    convenience: p.order.convenience,
                                    order_no: p.order.order_no,
                                    address: p.order.address,
                                    payment: p.payment,
                                    due: p.due,
                                    log: p.log,
                                    status: p.status,
                                    created_at: moment(p.created_at).tz(req.headers['tz']).format('lll'),
                                    updated_at: moment(p.updated_at).tz(req.headers['tz']).format('lll'),
                                };

                                res.status(200).json({
                                    responseCode: 200,
                                    responseMessage: "success",
                                    responseData: orders
                                });
                            });
                    }
                });
            }
        });
    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Order not found",
            responseData: {}
        });
    }
});
// /order/status/update
router.put('/order/status/update', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO:/order/status/update Api Called from order.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

    var rules = {
        order: 'required',
        // quantity: 'required',
    };
    var validation = new Validator(req.body, rules);
    if (validation.fails()) {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR: Validation failed, Order is Required.");
        }
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Order is Required",
            responseData: {
                res: validation.errors.all()
            }
        })
    }
    else {
        var id = mongoose.Types.ObjectId();
        var business = req.headers['business'];
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var orderId = req.body.order
        var status = req.body.status
        var loggedInDetails = await User.findById(decoded.user).exec();

        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Fatching Order Details for the order, OrderId:" + req.body.order);
        }
        var order = await Order.findOne({ _id: orderId, status: { $nin: "Cancelled" } }).exec()
        if (order) {

            await Order.findOneAndUpdate({ _id: orderId }, { $set: { status: status, updated_at: new Date() } }, { new: false }, async function (err, doc) {
                if (err) {
                    if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                        businessFunctions.logs("ERROR: Error Occured while updating order details, orderId:" + req.body.order + ", " + "User:" + loggedInDetails.name);
                    }
                    return res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Server Error",
                        responseData: err
                    });
                }
                else {
                    // ,status: "Shipped"
                    await BusinessOrder.findOneAndUpdate({ order: orderId, business: business }, { $set: { status: status, updated_at: new Date() } }, { new: false }, async function (err, doc) {
                        if (err) {
                            if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                                businessFunctions.logs("ERROR: Error Occured while updating Business order details, orderId:" + req.body.order + ", " + "User:" + loggedInDetails.name);
                            }
                            return res.status(422).json({
                                responseCode: 422,
                                responseMessage: "Server Error",
                                responseData: err
                            });
                        } else {
                            var activity = {
                                business: business,
                                activity_by: loggedInDetails.name,
                                activity: "Order " + status,
                                remark: "Order " + status,
                                created_at: new Date(),
                            }
                            businessFunctions.salesOrderLogs(order._id, activity);
                        }
                        if (status == 'Shipped') {
                            console.log("shipped....");
                            if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                                businessFunctions.logs("DEBUG: whatsAppEvent.orderShiped(doc.business, doc.order_no, doc.user) function Called from whatAppEvent.js.");
                            }

                            var activity = 'Order Shipped'
                            fun.webNotification(activity, doc);
                            whatsAppEvent.orderShiped(doc.business, doc.order_no, doc.user)
                        }






                    });
                }
            });
            res.status(200).json({
                responseCode: 200,
                responseMessage: "Order Successfully " + status,
                responseData: {}
            })
            if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("INFO: Order Successfully " + status + ", " + "User:" + loggedInDetails.name);
            }
        } else {
            res.status(200).json({
                responseCode: 200,
                responseMessage: "Order Not Found",
                responseData: {}
            })
        }
    }
});

router.put('/order/discount/add', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /order/discount/add Api Called from order.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

    var business = req.headers['business'];
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var items = [];
    var data = [];
    var convenience_charges = 0;
    var discount = 0;
    var total = 0;
    var orderDiscount = req.body.discount;
    var discountType = req.body.discount_type;
    var order = await Order.findById(req.body.order).exec();
    var loggedInDetails = await User.findById(decoded.user).exec();
    if (order) {
        var businessOrder = await BusinessOrder.findOne({ order: order._id, business: business }).exec()
        var items = await OrderLine.find({ order: order._id, issued: true, business: business, status: { $nin: ["Cancelled"] } }).exec();
        if (businessOrder.payment.convenience_charges) {
            convenience_charges = Math.ceil(businessOrder.payment.convenience_charges);
        }
        var discount = parseFloat(_.sumBy(items, x => x.discount_total).toFixed(2));
        var amount = parseFloat(_.sumBy(items, x => x.amount).toFixed(2));
        // console.log("Discount = " + discount)
        var total = amount + discount + convenience_charges;
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: fun.getOrderTransaction(order._id, business) function Called from function.js");
        }
        var transaction_log = await q.all(fun.getOrderTransaction(order._id, business));
        var paid_total = transaction_log.paid_total;
        var data = {
            updated_at: new Date(),
            "payment.paid_total": paid_total,
            "payment.amount": parseFloat(amount.toFixed(2)),
            "payment.order_discount": parseFloat(orderDiscount),
            "payment.discount_type": discountType,
            "payment.discount_total": parseFloat(discount.toFixed(2)),
            "payment.total": parseFloat(total.toFixed(2)),
            due: {
                due: Math.ceil(amount) + convenience_charges - paid_total - (parseFloat(orderDiscount)),
            }
        }
        await Order.findOneAndUpdate({ _id: order._id }, { $set: data }, { new: true }, async function (err, doc) {
            if (err) {
                if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                    businessFunctions.logs("ERROR: Error Occured while updating order discount details, User:" + loggedInDetails.name);
                }
                res.status(422).json({
                    responseCode: 422,
                    responseMessage: "Server Error",
                    responseData: err
                });
            }
            else {
                await BusinessOrder.findOneAndUpdate({ order: order._id, business: business }, { $set: data }, { new: true }, async function (err, doc) {
                    if (err) {
                        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                            businessFunctions.logs("ERROR: Error Occured while updating Business order discount details, User:" + loggedInDetails.name);
                        }
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Server Error",
                            responseData: err
                        });
                    }
                    else {
                    }
                });
                var activity = {
                    business: business,
                    activity_by: loggedInDetails.name,
                    activity: "Discount applied : " + parseFloat(orderDiscount),
                    remark: "Discount applied",
                    created_at: new Date(),
                }
                businessFunctions.salesOrderLogs(order._id, activity);
                res.status(200).json({
                    responseCode: 400,
                    responseMessage: "Discount Applied",
                    responseData: {}
                });
                if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                    businessFunctions.logs("INFO: Discount Applied Successfully, OrderId:" + order._id + ", " + "User:" + loggedInDetails.name);
                }
            }
        });
    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Order not found",
            responseData: {}
        });
    }
});

router.put('/sales/order/party/update', xAccessToken.token, async function (req, res, next) {
    var business = req.headers['business'];
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var data = [];
    var order = await Order.findById(req.body.order).exec();
    var loggedInDetails = await User.findById(decoded.user).exec();
    if (order) {
        var orderInvoice = await OrderInvoice.find({ order: order._id, status: "Active" }).exec();
        if (orderInvoice.length == 0) {
            var newParty = await User.findById(req.body.party).exec();
            if (newParty) {
                var data = {
                    user: newParty._id,
                    address: null,
                    updated_at: new Date(),
                    // status: "Cancelled"
                }
                await Order.findOneAndUpdate({ _id: order._id }, { $set: data }, { new: true }, async function (err, doc) {
                    if (err) {
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Server Error",
                            responseData: err
                        });
                    }
                    else {
                        await BusinessOrder.findOneAndUpdate({ order: order._id }, { $set: data }, { new: true }, async function (err, doc) {
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
                                    activity: "Party Changed ",
                                    // time: new Date().getTime.toLocaleTimeString(),
                                    remark: "Update",
                                    created_at: new Date(),
                                }
                                // console.log("Activity")
                                businessFunctions.salesOrderLogs(order._id, activity);

                                res.status(200).json({
                                    responseCode: 200,
                                    responseMessage: "Success",
                                    responseData: {}
                                });
                                // { order: order._id, business: business, status: "Active" }
                                // await OrderInvoice.findOneAndUpdate({ order: businessOrder.order, business: business, status: "Active" }, { $set: { status: 'Cancelled', updated_at: new Date() } }, { new: false }, async function (err, doc) {
                                //     if (err) {
                                //         res.status(422).json({
                                //             responseCode: 422,
                                //             responseMessage: "Server Error",
                                //             responseData: err
                                //         });
                                //     }
                                //     else { }
                                // })

                            }
                        });
                    }
                });
            } else {
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Party not found",
                    responseData: {}
                });
            }
        } else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Can't change party! Invoice is Genearted for sale",
                responseData: {}
            });
        }
    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Order not found",
            responseData: {}
        });
    }
});
router.put('/counter/sale/party/update', xAccessToken.token, async function (req, res, next) {
    var business = req.headers['business'];
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var data = [];
    var sale = await Sales.findById(req.body.sale).exec();
    var loggedInDetails = await User.findById(decoded.user).exec();
    if (sale) {
        var saleInvoice = await OrderInvoice.find({ sale: sale._id, status: "Active" }).exec();
        if (saleInvoice.length == 0) {
            var newParty = await User.findById(req.body.party).exec();
            if (newParty) {
                var data = {
                    user: newParty._id,
                    address: null,
                    updated_at: new Date(),
                    // status: "Cancelled"
                }
                // order
                await Sales.findOneAndUpdate({ _id: sale._id }, { $set: data }, { new: true }, async function (err, doc) {
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
                            activity: "Party Changed ",
                            // time: new Date().getTime.toLocaleTimeString(),
                            remark: "Update",
                            created_at: new Date(),
                        }
                        // console.log("Activity")
                        businessFunctions.salesLogs(sale._id, activity);

                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Success",
                            responseData: {}
                        });
                    }
                });
            } else {
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Party not found",
                    responseData: {}
                });
            }
        } else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Can't change party! Invoice is Active for this Sale",
                responseData: {}
            });
        }
    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Order not found",
            responseData: {}
        });
    }
});
router.post('/order/reset/password/otp/verification', async function (req, res, next) {
    var rules = {
        id: "required",
        otp: "required"
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Error",
            responseData: {
                res: validation.errors.all()
            }
        })
    }
    else {
        var count = await VendorOrders.find({ _id: req.body.id, otp: parseInt(req.body.otp) }).count().exec();
        console.log(JSON.stringify(count));
        if (count == true) {

            // var user = await User.findOne({_id: req.body.id}).exec();
            res.status(200).json({
                responseCode: 200,
                responseMessage: "verified",
                responseData: {
                    //user: user._id
                }
            });
        }
        else {
            var json = ({
                responseCode: 400,
                responseMessage: "Invalid OTP",
                responseData: {}
            });

            res.status(400).json(json)
        }
    }
});
router.post('/order/forgot/password', async function (req, res, next) {
    var rules = {
        id: 'required',
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Vendor. required",
            responseData: {
                res: validation.errors.all()
            }
        })
    }
    else {
        var otp = Math.floor(Math.random() * 90000) + 10000;
        var data = {
            otp: otp,
        };
        var user = await VendorOrders.findOne({ _id: req.body.id }).exec();
        if (user) {
            //if(user.account_info.status=="Active"){
            VendorOrders.findOneAndUpdate({ _id: req.body.id }, { $set: data }, { new: true }, async function (err, doc) {
                if (err) {
                    var json = ({
                        responseCode: 400,
                        responseMessage: "Error occured",
                        responseData: {}
                    });

                    res.status(400).json(json)
                }
                //console.log('sss'+JSON.stringify(data))
                // updateUser = await VendorOrder.findOne({_id:'617d14962dcfaf27d8ba224d'}).exec();
                event.otpSms(doc);

                var json = ({
                    responseCode: 200,
                    responseMessage: "OTP send successfully",
                    responseData: {
                        id: user._id,

                    }
                });
                res.status(200).json(json)
            });
            // }
            // else{
            //  var json = ({
            // responseCode: 400,
            // responseMessage: "Account is not verified!",
            // responseData: {}
            // });

            //res.status(400).json(json)   
            //}
        }
        else {
            var json = ({
                responseCode: 400,
                responseMessage: "User Not Found",
                responseData: {}
            });

            res.status(400).json(json)
        }
    }
});
//Sales + SalesOrder Invoices Export For Tally
router.get('/tally/sales/invoices/export', xAccessToken.token, async function (req, res, next) {
    try {
        const business = req.user;
        const { from, to } = req.query;
        if (req.query.page == undefined) {
            var page = 0;
        }
        else {
            var page = req.query.page;
        }
        var page = Math.max(0, parseInt(page));
        let sales = [];
        // let sales = 
        let query = { business: business, status: "Active" };
        if (from && to) {
            query = { business: business, status: "Active", created_at: { $gte: new Date(from), $lte: new Date(to) } };
        }
        await OrderInvoice.find(query)
            .populate({ path: 'sale', select: 'parts' })
            .populate('user')
            .cursor().eachAsync(async (invoice) => {
                if (!invoice.address) {
                    invoice.address = await Address.findOne({ user: invoice.user._id }).sort({ _id: -1 }).lean();
                }
                if (!invoice.address) {
                    invoice.address = invoice.user.address
                }
                if (invoice.sale && !invoice.order) {
                    let data = {
                        parts: invoice.sale.parts,
                        invoice_no: invoice.invoice_no,
                        note: invoice.note,
                        address: invoice.address,
                        user: invoice.user,
                        created_at: invoice.created_at
                    }
                    sales.push(data);
                } else if (!invoice.sale && invoice.order) {
                    var items = await OrderLine.find({ order: invoice.order, issued: true, business: business, status: { $nin: ["Cancelled"] } }).exec();
                    let data = {
                        parts: items,
                        invoice_no: invoice.invoice_no,
                        note: invoice.note,
                        address: invoice.address,
                        user: invoice.user,
                        created_at: invoice.created_at
                    }
                    sales.push(data);
                }
            })



        res.status(200).json({
            responseCode: 200,
            responseMessage: "success",
            responseData: {
                sales: sales,
            }
        })
    }
    catch (err) {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Internal Server error",
            responseData: {}
        })
    }

});

module.exports = router