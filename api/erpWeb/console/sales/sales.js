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
const Sales = require('../../../../models/sales');
const Parchi = require('../../../../models/parchi');



var secret = config.secret;
var Log_Level = config.Log_Level


router.get('/explore/used/car', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var filterBy = new Object();

    var business = req.headers['business'];
    var result = [];
    var geo, range;

    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }



    var range = 100000;

    if (req.query.range) {
        var range = parseInt(req.query.range) * 10000
    }


    var near = [0, 0];
    if (req.query.longitude && req.query.longitude) {
        near = [parseFloat(req.query.longitude), parseFloat(req.query.latitude)]
    }


    var query = Car.find({
        geometry: {
            $near: near,
            $maxDistance: range,
        },
        publish: true,
        admin_approved: true,
        status: true,
        user: { $ne: business }
    })


    if (req.query.fuel) {
        fuel = req.query.fuel;
        query = query.where('fuel_type').in(fuel.split(','));
    }

    if (req.query.transmission) {
        transmissions = req.query.transmission;
        query = query.where('transmission').in(transmissions.split(','));
    }

    if (req.query.postedBy) {
        posted_by = req.query.postedBy;
        query = query.where('posted_by').in(posted_by.split(','));
    }

    if (req.query.body) {
        body_style = req.query.body;
        query = query.where('body_style').in(body_style.split(','));
    }

    if (req.query.model) {
        models = req.query.model;
        filterBy.model = models.split(',');
        query = query.where('_model').in(models.split(','));
    }

    if (req.query.color) {
        colors = req.query.color;
        filterBy.colors = colors.split(',');
        query = query.where('vehicle_color').in(colors.split(','));
    }

    if (req.query.min && req.query.max) {
        query = query.where('price').gte(req.query.min * 100000).lte(req.query.max * 100000);
    }

    var totalResult = await query.count().exec();

    await query
        .populate({ path: 'thumbnails' })
        .populate('bookmark')
        .populate('package')
        .populate({ path: 'user', select: 'name avatar avatar_address account_info business_info partner' })
        .sort({ updated_at: -1 }).limit(config.perPage).skip(config.perPage * page)
        .cursor().eachAsync(async (doc) => {
            result.push({
                __v: 0,
                title: doc.title,
                variant: doc.variant,
                model: doc.model,
                price: price(doc.price),
                accidental: doc.accidental,
                body_style: doc.body_style,
                description: doc.description,
                driven: doc.driven,
                carId: doc.carId,
                fuel_type: doc.fuel_type,
                location: doc.location,
                manufacture_year: doc.manufacture_year,
                odometer: doc.odometer,
                owner: doc.owner,
                registration_no: doc.registration_no,
                service_history: doc.service_history,
                transmission: doc.transmission,
                vehicle_color: doc.vehicle_color,
                vehicle_status: doc.vehicle_status,
                geometry: doc.geometry,
                created_at: moment(doc.created_at).tz(req.headers['tz']).format('ll'),
                updated_at: moment(doc.updated_at).tz(req.headers['tz']).format('ll'),
                user: doc.user,
                _id: doc._id,
                link: "/car/" + slugify(doc.title + " " + doc._id),
                publish: doc.publish,
                status: doc.status,
                careager_rating: doc.careager_rating,
                video_url: doc.video_url,
                is_bookmarked: doc.is_bookmarked,
                isChatEnable: await q.all(fun.isChatEnable(doc.user._id, req.headers['tz'])),
                id: doc.id,
                package: doc.package,
                thumbnails: doc.thumbnails
            });
        });

    res.status(200).json({
        responseCode: 200,
        responseInfo: {
            totalResult: totalResult,
        },
        responseMessage: "success",
        responseData: result,
    });
});

//Abhinav Tyagi
router.post('/sale/create', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO:/sale/create Api Called from sales.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

    var business = req.headers['business'];
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var date = new Date();
    var loggedInDetails = decoded.user;
    var items = [];
    var item_total = 0;
    var discount = 0;
    var total = 0;
    var due = {
        due: 0
    };
    var loggedInDetails = await User.findById(decoded.user).exec();
    var user = await User.findById(req.body.user).exec();
    if (user) {
        var payment = {
            payment_mode: "",
            payment_status: "",
            extra_charges_limit: 0,
            convenience_charges: 0,
            discount_type: "",
            coupon_type: "",
            coupon: "",
            discount_applied: false,
            total: total,
            discount_total: discount,
            paid_total: 0,
        };
        var salesCount = await Sales.find({ business: business }).count().exec();
        var data = {
            business: business,
            user: user._id,
            created_by: loggedInDetails._id,
            sale_no: salesCount + 1,
            note: 'note',
            status: "Open",
            items: items,
            payment: payment,
            due: due,
            logs: [],
            isInvoice: false,
            invoice: null,
            created_at: date,
            updated_at: date,

        };
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Creating New Sale Order, Name:" + user.name);
        }
        await Sales.create(data).then(async function (sale) {
            var activity = {
                business: business,
                activity_by: loggedInDetails.name,
                activity: "Sale Created",
                remark: "Sale",
                created_at: new Date(),
            }
            businessFunctions.salesLogs(sale._id, activity);
            res.status(200).json({
                responseCode: 200,
                responseMessage: "Sale Successfully Created",
                responseData: {
                    sale: sale
                }
            });
            if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("INFO: Sale Created Successfully, SaleId:" + sale._id + ", " + "User:" + loggedInDetails.name);
            }

        });


    }
    else {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR: User not found, UserId:" + req.body.user);
        }
        res.status(400).json({
            responseCode: 400,
            responseMessage: "User not found",
            responseData: {}
        });
    }
});

router.get('/sales/list/get', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /sales/list/get Api Called from Sales.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = await User.findById(decoded.user).exec();
    var sales = [];
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
    // , 'Confirmed'/
    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Fatching Sales list with their details, User:" + user.name);
    }
    await Sales.find({ business: business, status: { $in: ['Confirmed', 'Open',] } })
        .populate({ path: 'business', select: "name contact_no" })
        .populate({ path: 'invoice', select: 'invoice_no' })
        .populate({ path: 'user', select: "name contact_no" })
        .populate({ path: 'created_by', select: "name contact_no" })
        .sort({ created_at: -1 })
        .skip(limit * page).limit(limit)
        .cursor().eachAsync(async (sale) => {

            sales.push({
                _id: sale._id,
                id: sale._id,
                business: sale.business,
                user: sale.user,
                created_by: sale.created_by,
                sale_no: sale.sale_no,
                // note: sale.note,
                status: sale.status,
                // items: sale.status,
                payment: sale.payment,
                due: sale.due,
                // logs: sale.logs,
                isInvoice: sale.isInvoice,
                invoice: sale.invoice,
                created_at: sale.created_at,
                updated_at: sale.updated_at
            });
        });
    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Sending Sales list with their details in Response, User:" + user.name);
    }

    res.status(200).json({
        responseCode: 200,
        responseMessage: "Sucesss",
        responseInfo: {
            totalResult: await Sales.find({ business: business, status: { $in: ['Confirmed', 'Open'] } }).count().exec()
        },
        responseData: {
            sales: sales
        }
    });
    if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("INFO: Sales Order List send in Response Successfully, User:" + user.name);
    }
});

router.get('/sale/search/list', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    //paginate
    if (req.query.page == undefined) {
        var page = 0;
    }
    else {
        var page = req.query.page;
    }

    var page = Math.max(0, parseInt(page));
    var sales = [];
    var filters = [];
    var match = [];
    var queries = {};


    if (req.query.query) {
        console.log("Query  = " + req.query.query)
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
                { 'sale_no': { $regex: req.query.query, $options: 'i' } },
                { 'user.name': { $regex: req.query.query, $options: 'i' } },
                { 'user.contact_no': { $regex: req.query.query, $options: 'i' } },
            ]
        };
        filters.push(specification);
        var totalResult = await Sales.aggregate(filters);

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
    // else {
    //     var status = "Confirmed";

    //     if (req.query.status) {
    //         var status = req.query.status;
    //     }


    //     var specification = {};
    //     specification['$match'] = {
    //         status: status
    //     };
    //     filters.push(specification);

    //     var specification = {};
    //     specification['$match'] = {
    //         business: mongoose.Types.ObjectId(business)
    //     };
    //     filters.push(specification);

    //     var specification = {};
    //     specification['$match'] = {
    //         business: mongoose.Types.ObjectId(business)
    //     };
    //     filters.push(specification);

    //     var specification = {};
    //     specification['$sort'] = {
    //         updated_at: -1,
    //     };
    //     filters.push(specification);

    //     var specification = {};
    //     specification['$skip'] = config.perPage * page;
    //     filters.push(specification);

    //     var specification = {};
    //     specification['$limit'] = config.perPage;
    //     filters.push(specification);
    // }

    var query = filters;
    await Sales.aggregate(query)
        // .select('_id id')
        .allowDiskUse(true)
        .cursor({ batchSize: 20 })
        .exec()
        .eachAsync(async function (sale) {
            var saleDetails = await Sales.findById(sale._id)
                .populate({ path: 'business', select: "name contact_no" })
                .populate({ path: 'invoice', select: 'invoice_no' })
                .populate({ path: 'user', select: "name contact_no" })
                .populate({ path: 'created_by', select: "name contact_no" })
                .exec();
            console.log("SALES = " + sale._id)
            sales.push({
                _id: saleDetails._id,
                id: saleDetails._id,
                business: saleDetails.business,
                user: saleDetails.user,
                created_by: saleDetails.created_by,
                sale_no: saleDetails.sale_no,
                // note: sale.note,
                status: saleDetails.status,
                // items: sale.status,
                payment: saleDetails.payment,
                due: saleDetails.due,
                // logs: sale.logs,
                isInvoice: saleDetails.isInvoice,
                invoice: saleDetails.invoice,
                created_at: saleDetails.created_at,
                updated_at: saleDetails.updated_at
            });
        });

    res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseInfo: {
            totalResult: totalResult.length,
            // query: query
        },
        responseData: {
            sales: sales
        }
    });
});

router.get('/sale/details/get', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /sale/details/get Api Called from sales.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    console.time('looper');
    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = await User.findById(decoded.user).exec();

    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Fatching Sale Details for the given SaleId, SaleId:" + req.query.sale);
    }
    var sale = await Sales.findOne({ _id: req.query.sale, business: business })
        .populate({ path: 'user', select: 'name contact_no username email account_info business_info' })
        .populate({ path: "business", select: "name address business_info contact_no email account_info bank_details" })
        .populate('address')
        .exec();
    if (sale) {
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: fun.getSalesTransaction(sale._id, business) function called from function.js");
        }
        var transactions = await q.all(fun.getSalesTransaction(sale._id, business))
        // var transactions = await q.all(fun.getOrderTransaction(sale._id, business))

        var has_invoice = false;
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Fatching Invoice Details for the given SaleId, SaleId:" + req.query.sale + ", " + "Name:" + sale.user.name);
        }
        var invoices = await OrderInvoice.find({ sale: sale._id, business: business }).select('status invoice_no').exec();
        var activeInvoice = await OrderInvoice.findOne({ sale: sale._id, business: business, status: "Active" }).select('status invoice_no updated_at').sort({ created_at: -1 }).exec();

        var isInvoiceUpToDate = false
        if (invoices.length > 0) {
            has_invoice = true;
            // console.log("Order Date = " + new Date(p.updated_at))
            // console.log("Invoice  Date = " + new Date(activeInvoice.updated_at))
            if (activeInvoice) {
                var serverTime = moment.tz(new Date(sale.updated_at), req.headers['tz']);
                var bar = moment.tz(new Date(activeInvoice.updated_at), req.headers['tz']);
                var baz = serverTime.diff(bar);
                // console.log("-- " + baz);   ///Used to take diffrence between Order updated Date and Invoice Updated Date Average time is 30 to 40 When both  updated at same time.
                if (baz < 50) {
                    isInvoiceUpToDate = true
                }
            }

        }
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Sending Sale Details for the given SaleId, SaleId:" + req.query.sale + ", " + "Name:" + sale.user.name + ", " + "User:" + user.name);
        }

        res.status(200).json({
            responseCode: 200,
            responseMessage: "success",
            responseData: {
                _id: sale._id,
                id: sale._id,
                parts: sale.parts,
                labours: sale.labours,
                user: sale.user,
                car: sale.car,
                address: sale.address,
                due_date: moment(sale.due_date).tz(req.headers['tz']).format('lll'),
                delivery_date: moment(sale.delivery_date).tz(req.headers['tz']).format('lll'),
                time_slot: sale.time_slot,
                convenience: sale.convenience,
                _order: sale._order,
                sale_no: sale.sale_no,
                business: sale.business,
                address: sale.address,
                payment: sale.payment,
                status: sale.status,
                due: sale.due,
                note: sale.note,
                logs: sale.logs,
                has_invoice: has_invoice,
                invoices: invoices,
                activeInvoice: activeInvoice,
                transactions: transactions.transactions,
                parchi: sale.parchi,
                created_at: moment(sale.created_at).tz(req.headers['tz']).format('lll'),
                updated_at: moment(sale.updated_at).tz(req.headers['tz']).format('lll'),
                isInvoiceUpToDate: isInvoiceUpToDate,

            }
        });
        if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("INFO: Sale Details send in Response Successfully, SaleId:" + req.query.sale + ", " + "Name:" + sale.user.name + ", " + "User:" + user.name);
        }
    } else {
        if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
            businessFunctions.logs("WARNING: No Sale found with the given saleId, SaleId:" + req.query.sale + ", " + "User:" + user.name);
        }
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Sale Not Found",
            responseData: {}
        })
    }
    // console.timeEnd('looper')
});
// /stock/item/create
router.post('/sale/item/add', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /sale/item/add Api Called from sales.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

    var business = req.headers['business'];
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var date = new Date();
    var loggedInDetails = decoded.user;
    var items = [];
    var convenience_charges = 0;
    var discount = 0;
    var item_total = 0;
    var sale = await Sales.findById(req.body.sale).exec();
    var parts = sale.parts;
    var loggedInDetails = await User.findById(decoded.user).exec();
    if (sale) {
        var products = req.body.items;
        if (products.title != "") {
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
                        // var issued = await q.all(businessFunctions.salesPartIssue(products, business, user, loggedInDetails));
                        // if (issued) {

                        // }
                        var user = await User.findById(sale.user).exec();
                        parts.push({
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
                            issued: await q.all(businessFunctions.salesPartIssue(products, business, user, loggedInDetails)),
                            added_by_customer: false,
                            created_at: new Date(),
                            updated_at: new Date()
                        })
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
            if (sale.payment.convenience_charges) {
                convenience_charges = Math.ceil(sale.payment.convenience_charges);
            }
            var discount = parseFloat(_.sumBy(parts, x => x.discount_total).toFixed(2)) + parseFloat(_.sumBy(sale.labours, x => x.discount_total).toFixed(2));
            var amount = parseFloat(_.sumBy(parts, x => x.amount).toFixed(2)) + parseFloat(_.sumBy(sale.labours, x => x.amount).toFixed(2));
            var total = amount + discount + convenience_charges;
            var transaction_log = await q.all(fun.getSalesTransaction(sale._id, business));
            var paid_total = transaction_log.paid_total;
            var data = {
                updated_at: new Date(),
                "payment.paid_total": paid_total,
                "payment.amount": parseFloat(amount.toFixed(2)),
                "payment.discount_total": parseFloat(discount.toFixed(2)),
                "payment.total": parseFloat(total.toFixed(2)),
                "payment.order_discount": parseFloat(sale.payment.order_discount),
                due: {
                    due: Math.ceil(amount) + convenience_charges - paid_total - (parseFloat(sale.payment.order_discount) + parseFloat(sale.payment.discount_total))
                },
                parts: parts
            }




            await Sales.findOneAndUpdate({ _id: sale._id, business: business }, { $set: data }, { new: false }, async function (err, doc) {
                if (err) {
                    if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                        businessFunctions.logs("ERROR: Error Occured while updating the sale details, SaleId:" + sale._id + ", " + "User:" + loggedInDetails.name);
                    }
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Server Error",
                        responseData: err
                    });
                }
                else {
                    var has_invoice = false;
                    var invoices = await OrderInvoice.find({ sale: sale._id, business: business }).select('status invoice_no').exec();
                    if (invoices.length > 0) {
                        has_invoice = true;
                    }
                    var orders = {
                        _id: sale._id,
                        id: sale._id,
                        items: sale.parts,
                        user: sale.user,
                        car: sale.car,
                        address: sale.address,
                        due_date: moment(sale.due_date).tz(req.headers['tz']).format('lll'),
                        delivery_date: moment(sale.delivery_date).tz(req.headers['tz']).format('lll'),
                        time_slot: sale.time_slot,
                        convenience: sale.convenience,
                        order_no: sale.order_no,
                        address: sale.address,
                        payment: sale.payment,
                        due: sale.due,
                        logs: sale.logs,
                        status: sale.status,
                        has_invoice: has_invoice,
                        invoices: invoices,
                        created_at: moment(sale.created_at).tz(req.headers['tz']).format('lll'),
                        updated_at: moment(sale.updated_at).tz(req.headers['tz']).format('lll'),
                    };
                    var activity = {
                        business: business,
                        activity_by: loggedInDetails.name,
                        activity: "'" + products.title + "'  -Added to Order",
                        remark: "Item Added",
                        created_at: new Date(),
                    }
                    businessFunctions.salesLogs(sale._id, activity);




                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "success",
                        responseData: orders
                    });
                    if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                        businessFunctions.logs("INFO: Sale Details updated successfully, SaleId:" + sale._id + ", " + "User:" + loggedInDetails.name);
                    }




                }
            });


            // });
        }
        else {
            if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("DEBUG: Add New Item in the sale");
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
            businessFunctions.logs("ERROR: Order Not found with the given saleId, SaleId:" + req.body.sale + ", " + "User:" + loggedInDetails.name);
        }
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Order not found",
            responseData: {}
        });
    }
});

router.post('/sale/stock/item/create', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /sale/stock/item/create Api Called from sales.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var tax = [];
    var part = req.body.items
    var margin_total = 0
    var part_no = part.part_no;
    part_no = part_no.replace(/,/g, ", ");
    part_no = part_no.toUpperCase();
    var unit = 'Piece';
    // console.log("User  = " + user)
    var loggedInDetails = await User.findById(user).exec();
    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Fatching Part details, part_no:" + part_no + ", User:" + loggedInDetails.name);
    }
    var businessProduct = await BusinessProduct.find({ part_no: part_no, unit: unit, business: business }).exec();
    if (businessProduct.length == 0) {
        var tax_slab = part.tax;
        var sale_price = parseFloat(part.rate); //Sale Price
        part.selling_price = part.rate;
        var base = parseFloat(sale_price);
        var margin = "7%";   //Default Margin

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
        // console.log("RATE = " + sale_price)
        if (margin) {
            margin = margin.toString();
            if (margin.indexOf("%") >= 0) {
                margin = parseFloat(margin);
                if (!isNaN(margin) && margin > 0) {
                    margin_total = sale_price * (margin / 100);


                    base = sale_price - margin_total;   //To Set By Default 7% Margin to every Product

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
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Creating Stock item, Item_Name:" + item_name + ", User:" + loggedInDetails.name);
        }
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
            var sale = await Sales.findById(req.body.sale).exec();
            var parts = sale.parts;
            // var loggedInDetails = await User.findById(decoded.user).exec();
            if (sale) {
                if (part.title != "") {

                    var tax_info = await Tax.findOne({ tax: product.tax }).exec();
                    if (tax_info) {

                        // if (products.product) {
                        // var product = await BusinessProduct.findOne({ _id: product.product, business: business }).exec();
                        if (product) {
                            var tax = [];
                            var rate = product.price.rate;
                            var amount = product.price.rate * part.quantity;
                            var tax_rate = tax_info.detail;
                            var discount_total = 0;
                            var base = amount

                            var discount = part.discount;

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

                            if (part.amount_is_tax == "exclusive") {
                                if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                                    businessFunctions.logs("DEBUG: Calculate Tax Amount fot tax type Exclusive.");
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

                            if (part.amount_is_tax == "inclusive") {
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
                            // var issued = await q.all(businessFunctions.salesPartIssue(part, business, user, loggedInDetails));
                            // if (issued) {

                            // }
                            var user = await User.findById(sale.user).exec();
                            part.product = product._id;
                            var item = {
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
                                part_no: part.part_no,
                                hsn_sac: part.hsn_sac,
                                unit: part.unit,
                                title: part.title,
                                sku: part.sku,
                                mrp: product.price.mrp,
                                selling_price: part.selling_price,
                                rate: product.price.rate,
                                quantity: part.quantity,
                                base: parseFloat(base.toFixed(2)),
                                discount: product.price.discount,
                                discount_total: parseFloat(discount_total.toFixed(2)),
                                amount_is_tax: product.amount_is_tax,
                                tax_amount: parseFloat(_.sumBy(tax, x => x.amount).toFixed(2)),
                                amount: parseFloat(amount.toFixed(2)),
                                tax: tax_info.tax,
                                tax_rate: tax_info.rate,
                                tax_info: tax,
                                issued: await q.all(businessFunctions.salesPartIssue(part, business, user, loggedInDetails)),
                                added_by_customer: false,
                                created_at: new Date(),
                                updated_at: new Date()
                            }
                            // console.log("Issued  = " + item.issued)
                            parts.push(item)

                        }
                    }
                    else {
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Tax Error",
                            responseData: err
                        });
                    }


                    if (sale.payment.convenience_charges) {
                        convenience_charges = Math.ceil(sale.payment.convenience_charges);
                    }
                    var discount = parseFloat(_.sumBy(parts, x => x.discount_total).toFixed(2)) + parseFloat(_.sumBy(sale.labours, x => x.discount_total).toFixed(2));
                    var amount = parseFloat(_.sumBy(parts, x => x.amount).toFixed(2)) + parseFloat(_.sumBy(sale.labours, x => x.amount).toFixed(2));
                    var total = amount + discount + convenience_charges;
                    var transaction_log = await q.all(fun.getSalesTransaction(sale._id, business));
                    var paid_total = transaction_log.paid_total;
                    var data = {
                        updated_at: new Date(),
                        "payment.paid_total": paid_total,
                        "payment.amount": parseFloat(amount.toFixed(2)),
                        "payment.discount_total": parseFloat(discount.toFixed(2)),
                        "payment.total": parseFloat(total.toFixed(2)),
                        "payment.order_discount": parseFloat(sale.payment.order_discount),
                        due: {
                            due: Math.ceil(amount) + convenience_charges - paid_total - (parseFloat(sale.payment.order_discount) + parseFloat(sale.payment.discount_total))
                        },
                        parts: parts
                    }
                    await Sales.findOneAndUpdate({ _id: sale._id, business: business }, { $set: data }, { new: false }, async function (err, doc) {
                        if (err) {
                            if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                                businessFunctions.logs("ERROR: Error Occured while updating sale details, SaleId:" + sale._id + ", User:" + loggedInDetails.name);
                            }
                            res.status(422).json({
                                responseCode: 422,
                                responseMessage: "Server Error",
                                responseData: err
                            });
                        }
                        else {
                            var has_invoice = false;
                            if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                                businessFunctions.logs("DEBUG: Fatching Order Invoice details for the sale, SaleId:" + sale._id);
                            }
                            var invoices = await OrderInvoice.find({ sale: sale._id, business: business }).select('status invoice_no').exec();
                            if (invoices.length > 0) {
                                has_invoice = true;
                            }
                            var orders = {
                                _id: sale._id,
                                id: sale._id,
                                items: sale.parts,
                                user: sale.user,
                                car: sale.car,
                                address: sale.address,
                                due_date: moment(sale.due_date).tz(req.headers['tz']).format('lll'),
                                delivery_date: moment(sale.delivery_date).tz(req.headers['tz']).format('lll'),
                                time_slot: sale.time_slot,
                                convenience: sale.convenience,
                                order_no: sale.order_no,
                                address: sale.address,
                                payment: sale.payment,
                                due: sale.due,
                                logs: sale.logs,
                                status: sale.status,
                                has_invoice: has_invoice,
                                invoices: invoices,
                                created_at: moment(sale.created_at).tz(req.headers['tz']).format('lll'),
                                updated_at: moment(sale.updated_at).tz(req.headers['tz']).format('lll'),
                            };
                            var activity = {
                                business: business,
                                activity_by: loggedInDetails.name,
                                activity: "'" + part.title + "' Added to Order",
                                remark: "Item Added",
                                created_at: new Date(),
                            }
                            // businessFunctions.salesOrderLogs(order._id, activity);

                            res.status(200).json({
                                responseCode: 200,
                                responseMessage: "success",
                                responseData: orders
                            });
                            if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                                businessFunctions.logs("INFO: Item Added Successfully, Part_Name:" + part.title + ", User:" + loggedInDetails.name);
                            }




                        }
                    });


                    // });
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
                if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
                    businessFunctions.logs("WARNING: Sale order not found for the saleId:" + req.body.sale + ", User:" + loggedInDetails.name);
                }
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Order not found",
                    responseData: {}
                });
            }


        });
    } else {
        if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
            businessFunctions.logs("WARNING: Part already exists in the stock, Part_no:" + part_no + ", User:" + loggedInDetails.name);
        }
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Item Already Exist",
            responseData: {}
        });
    }

});

router.delete('/sale/item/return', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /sale/item/return Api Called from sales.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

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
    var index = req.body.index
    // console.log("Index = " + index)
    var sale = await Sales.findOne({ _id: req.body.sale, status: { $nin: ["Cancelled"] } }).populate({ path: "user", select: "name contact_no" }).exec();
    var loggedInDetails = await User.findById(decoded.user).exec();
    if (sale) {
        // var businessOrder = await BusinessOrder.findOne({ order: item.order, business: business }).exec();
        var item = sale.parts[index];
        // console.log("Is Id Same  = " + item._id.equals(req.body.id))
        // console.log("Product   = " + item._id)
        // console.log("Item = " + req.body.id)
        // return res.json({
        //     item: item
        // })
        if (item.issued == true && item._id.equals(req.body.id)) {
            if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("DEBUG: businessFunctions.orderItemReturn(item) function called from businessFunction.js to return item.");
            }
            // var user = await User.findById(sale.user).exec();
            var r = await q.all(businessFunctions.saleItemReturn(item, sale, loggedInDetails));
            // console.log("Item Removed " + r)
            if (r) {
                // console.log("partslength  ", sale.parts.length)

                sale.parts.splice(index, 1)
                // console.log("partslength  ", sale.parts.length)
                await sale.save();
                var items = sale.parts;
                // var items = await OrderLine.find({ order: item.order, business: business, issued: true, status: { $nin: ["Cancelled"] } }).exec();


                if (sale.payment.convenience_charges) {
                    convenience_charges = Math.ceil(sale.payment.convenience_charges);
                }

                var discount = parseFloat(_.sumBy(items, x => x.discount_total).toFixed(2)) + parseFloat(_.sumBy(sale.labours, x => x.discount_total).toFixed(2));
                var amount = parseFloat(_.sumBy(items, x => x.amount).toFixed(2)) + parseFloat(_.sumBy(sale.labours, x => x.amount).toFixed(2));
                var total = amount + discount + convenience_charges;
                // console.log("2828 Total =" + total)
                var transaction_log = await q.all(fun.getSalesTransaction(sale._id, business));
                var paid_total = transaction_log.paid_total;

                var data = {
                    updated_at: new Date(),
                    "payment.paid_total": paid_total,
                    "payment.amount": parseFloat(amount.toFixed(2)),
                    "payment.discount_total": parseFloat(discount.toFixed(2)),
                    "payment.total": parseFloat(total.toFixed(2)),
                    "payment.order_discount": parseFloat(sale.payment.order_discount),
                    due: {
                        due: Math.ceil(amount) + convenience_charges - paid_total - (parseFloat(sale.payment.order_discount) + parseFloat(discount))
                    },
                    parts: items
                }

                await OrderInvoice.findOneAndUpdate({ sale: sale._id, status: "Active" }, {
                    $set: {
                        due: {
                            due: Math.ceil(amount) + convenience_charges - paid_total
                        }
                    }
                }, { new: true }, async function (err, doc) { })



                await Sales.findOneAndUpdate({ _id: sale._id }, { $set: data }, { new: false }, async function (err, doc) {
                    if (err) {
                        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                            businessFunctions.logs("ERROR: Error Occured while updating the sale details, saleId:" + req.body.sale +
                                ", " + "User:" + loggedInDetails.name);
                        }
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Server Error",
                            responseData: err
                        });
                    }
                    else {
                        var has_invoice = false;
                        var invoices = await OrderInvoice.find({ sale: sale._id, business: business }).select('status invoice_no').exec();
                        if (invoices.length > 0) {
                            has_invoice = true;
                        }
                        var orders = {
                            _id: sale._id,
                            id: sale._id,
                            items: sale.parts,
                            user: sale.user,
                            car: sale.car,
                            address: sale.address,
                            due_date: moment(sale.due_date).tz(req.headers['tz']).format('lll'),
                            delivery_date: moment(sale.delivery_date).tz(req.headers['tz']).format('lll'),
                            time_slot: sale.time_slot,
                            convenience: sale.convenience,
                            order_no: sale.order_no,
                            address: sale.address,
                            payment: sale.payment,
                            due: sale.due,
                            logs: sale.logs,
                            status: sale.status,
                            has_invoice: has_invoice,
                            invoices: invoices,
                            created_at: moment(sale.created_at).tz(req.headers['tz']).format('lll'),
                            updated_at: moment(sale.updated_at).tz(req.headers['tz']).format('lll'),
                        };
                        // var activity = {
                        //     business: business,
                        //     activity_by: loggedInDetails.name,
                        //     activity: "'" + products.title + "' Returned from Order",
                        //     remark: "Item Added",
                        //     created_at: new Date(),
                        // }
                        // businessFunctions.salesOrderLogs(order._id, activity);

                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "success",
                            responseData: orders
                        });
                        if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                            businessFunctions.logs("INFO: Item Returned Successfully, SaleId:" + req.body.sale + ", " + "User:" + loggedInDetails.name);
                        }
                    }


                });
            } else {
                if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                    businessFunctions.logs("ERROR: Item not Returned, ItemId:" + req.body.id);
                }
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Item not Returned",
                    responseData: {}
                });
            }
        } else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Item not issued / Found",
                responseData: {}
            });
        }
    } else {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR: Sale not found with the given saleId, SaleId:" + req.body.sale + ", " + "User:" + loggedInDetails.name);
        }
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Sale not found",
            responseData: {}
        });
    }

});
router.put('/sale/address/update', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /sale/address/update Api Called from sales.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

    var rules = {
        sale: 'required',
        address: 'required',
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR: Validation failed, SaleId and Address are required.");
        }
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
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Validated successfully and Fatching Sale Details, SaleId:" + req.body.sale);
        }
        var sale = await Sales.findById(req.body.sale).exec();
        var loggedInDetails = await User.findById(decoded.user).exec();
        if (sale) {
            var address = await Address.findOne({ _id: req.body.address, user: sale.user }).exec();
            if (address) {
                Sales.findOneAndUpdate({ _id: sale._id }, { $set: { address: address._id } }, { new: false }, async function (err, doc) {
                    if (err) {
                        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                            businessFunctions.logs("ERROR: Error Occured while updating the address for the Sale, SaleId:" + req.body.sale);
                        }
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
                        businessFunctions.salesLogs(sale._id, activity);
                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Saved",
                            responseData: {
                                address: address
                            }
                        });
                        if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                            businessFunctions.logs("INFO: Address Updated Successfully, SaleId:" + req.body.sale);
                        }
                    }
                });
            }
            else {
                if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
                    businessFunctions.logs("WARNING: Address not found");
                }
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Address not found",
                    responseData: {

                    }
                });
            }
        }
        else {
            if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
                businessFunctions.logs("WARNING: Sale not found with the given SaleId:" + req.body.sale);
            }
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Sale not found",
                responseData: {}
            });
        }
    }
});


router.post('/sale/invoice/generate', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO:/sale/invoice/generate Api Called from sales.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

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

    var sale = await Sales.findById(req.body.sale).exec();
    var loggedInDetails = await User.findById(decoded.user).exec();
    if (sale) {
        var invoice = await OrderInvoice.findOne({ sale: sale._id, business: business, status: "Active" })
            .populate({
                path: 'sale',
                populate: [
                    { path: 'user', select: 'name contact_no username email account_info business_info' },
                    { path: 'car', select: 'variant value' },
                    { path: 'address' }
                ]
            })
            .exec();
        // order
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
                    businessFunctions.salesLogs(sale._id, activity);
                }
            })
        }
        var date = new Date();
        var availablity = false;
        // await OrderLine.updateMany({ order: order._id, business: business, issued: true, status: { $nin: ['Cancelled'] } }, { $set: { isInvoice: true } }).exec();
        // var items = await OrderLine.find({ order: order._id, business: business, status: { $nin: ['Cancelled'] } }).exec();

        var nd = _.filter(sale.parts, status => status.issued == true);

        if (nd.length <= 0) {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Error! Add some items",
                responseData: {}
            });
        }
        else {
            // var sale = await Sales.findOne({ _id: sale._id, business: business }).exec();

            OrderInvoice.create({
                business: business,
                user: sale.user,
                sale: sale._id,
                source: sale._id,
                delivery_date: sale.delivery_date,
                due_date: sale.due_date,
                // _order: businessOrder._order,
                sale_no: sale.sale_no,
                note: sale.note,
                invoice_no: sale.invoice_no,
                status: "Active",
                with_tax: true,
                payment: sale.payment,
                due: sale.due,
                created_at: new Date(),
                updated_at: new Date(),
            })
                .then(async function (inv) {
                    var count = await OrderInvoice.find({ _id: { $lt: inv._id }, business: business }).count();
                    // var count = await OrderInvoice.find({ _id: { $lt: inv._id }, business: business, sale: { $ne: null } }).count();
                    if (count == 0) {
                        // console.log("If ")
                        var last_invoice = "";
                        var position = 1;
                    }
                    else {
                        // console.log("ELSE " + count)
                        var lv = await OrderInvoice.findOne({ _id: { $lt: inv._id }, business: business }).sort({ _id: -1 }).exec();

                        // var lv = await OrderInvoice.findOne({ _id: { $lt: inv._id }, business: business, sale: { $ne: null } }).sort({ _id: -1 }).exec();
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
                                    // var sales = await Sales.findOneAndUpdate({ _id: sale._id }).exec()
                                    // sales.parts.forEach(async function (part) {

                                    // });

                                    await Sales.findOneAndUpdate({ _id: sale._id }, { $set: { isInvoice: true, invoice: inv._id, updated_at: new Date() } }, { new: false }, async function (err, doc) {
                                        if (err) {
                                            return res.status(422).json({
                                                responseCode: 422,
                                                responseMessage: "Server Error",
                                                responseData: err
                                            });
                                        }
                                        else {


                                        }
                                    });

                                    var sales = await Sales.findOne({ _id: sale._id }).exec()
                                    for (var i = 0; i < sales.parts.length; i++) {
                                        sales.parts[i].isInvoice = true;
                                    }
                                    sales.markModified('parts');
                                    sales.save();
                                    var p = await OrderInvoice.findById(inv._id)
                                        .populate({
                                            path: 'sale',
                                            populate: [
                                                { path: 'user', select: 'name contact_no username email account_info business_info' },
                                                { path: 'car', select: 'variant value' },
                                                { path: 'address' }
                                            ]
                                        })
                                        .exec();


                                    var transactions = await q.all(fun.getSalesTransaction(p.sale._id, business))

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
                                    // var itemDetails = await q.all(fun.getBusinessOrderItems(p.order._id, business, req.headers['tz']));
                                    //console.log("P"+p.business);
                                    fun.orderInvoice(p.sale.parts, p, p.sale.address)

                                    var activity = 'Invoice Generate-Sale'
                                    fun.webNotification(activity, p);

                                    var activity = {
                                        business: business,
                                        activity_by: loggedInDetails.name,
                                        activity: "Invoice Generated " + "#" + assigned_invoice_no.invoice,
                                        remark: "Invoice Generated",
                                        created_at: new Date(),
                                    }
                                    businessFunctions.salesLogs(sale._id, activity);



                                    res.status(200).json({
                                        responseCode: 200,
                                        responseMessage: "success",
                                        responseData: {
                                            _id: p._id,
                                            id: p._id,
                                            items: p.sale.parts,
                                            user: p.sale.user,
                                            car: p.sale.car,
                                            address: p.sale.address,
                                            due_date: moment(p.due_date).tz(req.headers['tz']).format('lll'),
                                            delivery_date: moment(p.delivery_date).tz(req.headers['tz']).format('lll'),
                                            time_slot: p.time_slot,
                                            convenience: p.convenience,
                                            order_no: p.order_no,
                                            _order: p._order,
                                            invoice_no: p.invoice_no,
                                            address: p.sale.address,
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

router.get('/sale/invoice/get', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /sale/invoice/get Api Called from sales.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    console.time('looper')
    var rules = {
        invoice: 'required',
    };

    var validation = new Validator(req.query, rules);

    if (validation.fails()) {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR: Validation failed, Invoice is required.");
        }
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
        var user = await User.findById(decoded.user).exec();

        var p = await OrderInvoice.findById(req.query.invoice)
            .populate({
                path: 'sale',
                populate: [
                    { path: 'user', select: 'name contact_no username email account_info business_info' },
                    { path: 'business', select: 'name contact_no username email account_info business_info bank_details' },
                    { path: 'car', select: 'variant value' },
                    { path: 'address' }
                ]
            })
            .exec();
        if (p) {
            if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("DEBUG: fun.getSalesTransaction(p.sale._id, business) function called from function.js.");
            }
            var transactions = await q.all(fun.getSalesTransaction(p.sale._id, business))
            var business_info = await User.findById(p.business).select('name contact_no username email account_info business_info bank_details address').exec();
            var sale = await Sales.findById(p.sale._id).select('parts id _id sale_no').exec();

            if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("DEBUG: Sending Invoice details in the Response, User:" + user.name);
            }
            res.status(200).json({
                responseCode: 200,
                responseMessage: "success",
                responseData: {
                    _id: p._id,
                    id: p._id,
                    items: sale.parts,
                    user: p.sale.user,
                    car: p.sale.car,
                    due_date: moment(p.due_date).tz(req.headers['tz']).format('lll'),
                    delivery_date: moment(p.delivery_date).tz(req.headers['tz']).format('lll'),
                    time_slot: p.time_slot,
                    convenience: p.convenience,
                    order_no: p.sale_no,
                    // _order: p._order,
                    invoice_no: p.invoice_no,
                    address: p.sale.address,
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
            if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("INFO: Invoice Details Send in Response Successfully, InvoiceId:" + req.query.invoice + ", " + "User:" + user.name);
            }
        }
        else {
            if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                businessFunctions.logs("ERROR: Invoice not found with the given invoiceId, InvoiceId:" + req.query.invoice + ", " + "User:" + user.name);
            }
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Invoice not found",
                responseData: {}
            });
        }
    }
    // console.timeEnd('looper')
});
router.get('/sale/payments/log', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /sale/payments/log Api Called from sales.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    var business = req.headers['business'];
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = await User.findById(decoded.user).exec();

    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Fatching sale order details, SaleId:" + req.query.sale);
    }
    var sale = await Sales.findById(req.query.sale).exec();
    if (sale) {
        var logs = [];
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Fatching Transaction log for the sale, SaleId:" + req.query.sale);
        }
        await TransactionLog.find({ source: req.query.sale, business: business })
            .sort({ updated_at: -1 })
            .cursor().eachAsync(async (log) => {
                logs.push({
                    _id: log._id,
                    id: log._id,
                    activity: log.activity,
                    payment_mode: log.payment_mode,
                    paid_total: log.paid_total,
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
        res.status(200).json({
            responseCode: 200,
            responseMessage: "Transaction Log",
            responseData: logs
        });
        if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("INFO: Transaction log send in response successfully, SaleId:" + req.query.sale + ", " + "User:" + user.name);
        }
    }
    else {
        if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
            businessFunctions.logs("WARNING: Sale not found, SaleId:" + req.query.sale + ", " + "User:" + user.name);
        }
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Sale not found",
            responseData: {}
        });
    }
});

router.delete('/sale/cancel', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /sale/cancel Api Called from sales.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

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
        businessFunctions.logs("DEBUG: Fatching Sale details, SaleId:" + req.body.sale);
    }
    // .populate({ patch: 'user', select: "name conatct_no" })
    var sale = await Sales.findById(req.body.sale).exec();
    var loggedInDetails = await User.findById(decoded.user).exec();
    if (sale) {
        sale.parts.forEach(async function (part) {
            if (part.issued == true) {
                if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                    businessFunctions.logs("DEBUG: businessFunctions.orderItemReturn(part) function called from businessFunction.js.");
                }
                var r = await q.all(businessFunctions.saleItemReturn(part, sale, loggedInDetails));
            }
        })
        var date = new Date();
        // var businessOrder = await BusinessOrder.findOne({ order: order._id, business: business }).exec();

        var data = {
            updated_at: new Date(),
            status: "Cancelled"
        }

        await Sales.findOneAndUpdate({ _id: sale._id }, { $set: data }, { new: false }, async function (err, doc) {
            if (err) {
                if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                    businessFunctions.logs("ERROR: Server Error Occured while updating the sale Order, SaleId:" + sale._id + ", " + "User:" + loggedInDetails.name);
                }
                res.status(422).json({
                    responseCode: 422,
                    responseMessage: "Server Error",
                    responseData: err
                });
            }
            else {

                // { order: order._id, business: business, status: "Active" }
                await OrderInvoice.findOneAndUpdate({ sale: sale._id, business: business, status: "Active" }, { $set: { status: 'Cancelled', updated_at: new Date() } }, { new: false }, async function (err, doc) {
                    if (err) {
                        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                            businessFunctions.logs("ERROR: Server Error Occured while updating the sale Order invoice details, SaleId:" + sale._id + ", " + "User:" + loggedInDetails.name);
                        }
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Server Error",
                            responseData: err
                        });
                    }
                    else {
                    }
                })

                var orders = {
                    _id: sale._id,
                    id: sale._id,
                    items: sale.parts,
                    user: sale.user,
                    car: sale.car,
                    address: sale.address,
                    due_date: moment(sale.due_date).tz(req.headers['tz']).format('lll'),
                    delivery_date: moment(sale.delivery_date).tz(req.headers['tz']).format('lll'),
                    time_slot: sale.time_slot,
                    convenience: sale.convenience,
                    order_no: sale.order_no,
                    address: sale.address,
                    payment: sale.payment,
                    due: sale.due,
                    log: sale.log,
                    status: sale.status,
                    created_at: moment(sale.created_at).tz(req.headers['tz']).format('lll'),
                    updated_at: moment(sale.updated_at).tz(req.headers['tz']).format('lll'),
                };

                var activity = {
                    business: business,
                    activity_by: loggedInDetails.name,
                    activity: "Sale Cancelled",
                    remark: "Sale Cancelled",
                    created_at: new Date(),
                }
                businessFunctions.salesLogs(sale._id, activity);

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "success",
                    responseData: orders
                });
                if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                    businessFunctions.logs("INFO: Sale Cancelled successfully, SaleId:" + req.body.sale + ", " + "User:" + loggedInDetails.name);
                }



            }
        });
    }
    else {
        if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
            businessFunctions.logs("WARNING: Order not found  with the given saleId, SaleID:" + req.body.sale + ", " + "User:" + loggedInDetails.name);
        }
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Order not found",
            responseData: {}
        });
    }
});

router.post('/sale/payment/add', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /sale/payment/add Api Called from sales.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));
    var rules = {
        sale: 'required',
        amount: 'required',
        date: 'required',
    };
    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR: Validation failed, Amount & Date are mandatory.");
        }
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

        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Validated successfully and Fatching Sale details, SaleId:" + req.body.sale);
        }
        var sale = await Sales.findOne({ _id: req.body.sale }).exec();
        if (sale) {
            var recieved = parseFloat(req.body.amount);
            var date = new Date();
            var payment_mode = req.body.payment_mode;
            var transaction_id = req.body.transaction_id;
            var due_amount = 0;
            if (sale.due) {
                if (sale.due.due) {
                    due_amount = sale.due.due;
                }
            }
            if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("DEBUG: Creating Transaction logs, SaleId:" + sale._id);
            }
            await TransactionLog.create({
                user: sale.user,
                activity: "Sales",
                business: business,
                source: sale._id,
                paid_total: recieved,
                total: sale.payment.total,
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
                    user: sale.user,
                    business: business,
                    status: 'Payment-In',
                    type: 'Payment-In',
                    paid_by: 'Customer',
                    activity: 'Payment-In',
                    source: sale.user,
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
                if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                    businessFunctions.logs("DEBUG: businessFunctions.addTransaction(data) function called from businessFunction.js.");
                }
                var valid = q.all(businessFunctions.addTransaction(data));

                var convenience_charges = 0;
                if (sale.payment.convenience_charges) {
                    convenience_charges = Math.ceil(sale.payment.convenience_charges)
                }

                // var items = await OrderLine.find({ order: order._id, business: business, status: { $nin: ['Cancelled'] } }).exec();
                var amount = _.sumBy(sale.parts, x => x.amount);
                var discount = _.sumBy(sale.parts, x => x.discount_total);
                var total = amount + discount + convenience_charges;

                var transaction_log = await TransactionLog.find({ source: sale._id, payment_status: "Success", }).exec();

                var paid_total = _.sumBy(transaction_log, x => x.paid_total);

                var due = Math.ceil(amount.toFixed(2)) + Math.ceil(convenience_charges) - paid_total;

                var data = {
                    updated_at: date,
                    "payment.paid_total": paid_total,
                    "payment.amount": parseFloat(amount.toFixed(2)),
                    "payment.discount_total": parseFloat(discount.toFixed(2)),
                    "payment.total": parseFloat(total.toFixed(2)),
                    "payment.order_discount": parseFloat(sale.payment.order_discount),
                    due: {
                        due: Math.ceil(amount) + convenience_charges - paid_total - (parseFloat(sale.payment.order_discount))
                    }
                }

                var orderInvoice = await OrderInvoice.findOne({ sale: sale._id, business: business }).exec();
                if (orderInvoice) {
                    OrderInvoice.findOneAndUpdate({ sale: sale._id, business: business }, { $set: data }, { new: false }, async function (err, doc) {
                        if (err) {
                            if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                                businessFunctions.logs("ERROR: Error Occured while updating invoice details for the sale, SaleId:" + sale._id + ", " + "User:" + loggedInDetails.name);
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
                    businessFunctions.logs("DEBUG: Updating sale details for the sale order, SaleId:" + sale._id);
                }
                await Sales.findOneAndUpdate({ _id: sale._id }, { $set: data }, { new: false }, async function (err, doc) {
                    if (err) {
                        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                            businessFunctions.logs("ERROR: Error Occured while updating sale details for the sale, SaleId:" + sale._id + ", " + "User:" + loggedInDetails.name);
                        }
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Server Error",
                            responseData: err
                        });
                    }
                    else {

                        var updated = await Sales.findOne({ _id: sale._id, business: business }).exec();
                        var activity = {
                            business: business,
                            activity_by: loggedInDetails.name,
                            activity: "Payment Recieved: " + recieved,
                            remark: "Payment Recieved",
                            created_at: new Date(),
                        }
                        businessFunctions.salesLogs(sale._id, activity);

                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Payment Recieved",
                            responseData: {
                                item: {},
                                payment: transaction,
                                due: updated.due,
                            }
                        });
                        if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                            businessFunctions.logs("INFO: Payment Received Successfully for the sale order, SaleId:" + sale._id + ", " + "Amount:" + req.body.amount + ", " + "User:" + loggedInDetails.name);
                        }
                    }
                });
            });
        }
        else {
            if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                businessFunctions.logs("ERROR: Order not found for the given saleId, SaleId:" + req.body.sale + ", " + "User:" + loggedInDetails.name);
            }
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Order not found",
                responseData: {}
            });
        }
    }
});
router.put('/sale/discount/add', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /sale/discount/add Api Called from sales.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

    var business = req.headers['business'];
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var data = [];
    var convenience_charges = 0;
    var discount = 0;
    var total = 0;
    var orderDiscount = req.body.discount;
    var discountType = req.body.discount_type;
    var sale = await Sales.findById(req.body.sale).exec();
    var loggedInDetails = await User.findById(decoded.user).exec();
    if (sale) {
        if (sale.payment.convenience_charges) {
            convenience_charges = Math.ceil(sale.payment.convenience_charges);
        }
        var discount = parseFloat(_.sumBy(sale.parts, x => x.discount_total).toFixed(2)) + parseFloat(_.sumBy(sale.labours, x => x.discount_total).toFixed(2));
        var amount = parseFloat(_.sumBy(sale.parts, x => x.amount).toFixed(2)) + parseFloat(_.sumBy(sale.labours, x => x.amount).toFixed(2));
        // console.log("Discount = " + discount)
        var total = amount + discount + convenience_charges;
        var transaction_log = await q.all(fun.getSalesTransaction(sale._id, business));
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
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Updating the Sale discount details, SaleId:" + sale._id + ", " + "User:" + loggedInDetails.name);
        }
        await Sales.findOneAndUpdate({ _id: sale._id }, { $set: data }, { new: true }, async function (err, doc) {
            if (err) {
                if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                    businessFunctions.logs("ERROR: Error Occured while updating the sale details, SaleId:" + sale._id + ", " + "User:" + loggedInDetails.name);
                }
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
                    activity: "Discount applied : " + parseFloat(orderDiscount),
                    remark: "Discount applied",
                    created_at: new Date(),
                }
                businessFunctions.salesLogs(sale._id, activity);
                res.status(200).json({
                    responseCode: 400,
                    responseMessage: "Discount Applied",
                    responseData: {}
                });
                if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                    businessFunctions.logs("INFO: Discount Applied Successfully, SaleId:" + sale._id);
                }
            }
        });
    }
    else {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR: Sale not found, SaleId:" + req.body.sale + ", " + "User:" + loggedInDetails.name);
        }
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Sale not found",
            responseData: {}
        });
    }
});
router.post('/parchi/create', xAccessToken.token, async function (req, res, next) {
    var business = req.headers['business'];
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var date = new Date();
    var loggedInDetails = decoded.user;
    var items = [];
    var discount = 0;
    var total = 0;
    var due = {
        due: 0
    };
    var loggedInDetails = await User.findById(decoded.user).exec();

    var sale = null;
    var order = null;
    var isLinked = false;
    var user = null;
    if (req.body.sale) {
        // console.log("Sale  =  " + req.body.sale) 

        var counterSale = await Sales.findOne({ _id: req.body.sale, isParchi: false, status: { $nin: ["Cancelled"] } }).select('_id id parts').exec();
        if (counterSale) {
            // console.log("counterSale  =  " + req.body.sale)

            var parts = counterSale.parts;
            parts.forEach(async function (part) {
                items.push({
                    product: part.product,
                    part_no: part.part_no,
                    hsn_sac: part.hsn_sac,
                    title: part.title,
                    quantity: parseFloat(part.quantity),
                    sku: part.sku,
                    unit: part.unit,
                    amount: parseFloat(part.amount),
                    selling_price: (parseFloat(part.amount) / parseFloat(part.quantity)).toFixed(2),
                    created_at: new Date(),
                    updated_at: new Date(),
                });

            })
            sale = req.body.sale;
            isLinked = true;

        } else {
            res.status(422).json({
                responseCode: 422,
                responseMessage: "Parchi Already Attached ",
                responseData: err
            });
        }
    } else if (req.body.order) {
        var order = await Order.findById(req.body.order).select('_id id').exec();
        if (order) {
            var parts = await OrderLine.find({ order: req.body.order, issued: true, business: business, status: { $nin: ["Cancelled"] } }).exec();
            parts.forEach(async function (part) {
                items.push({
                    product: part.product,
                    part_no: part.part_no,
                    hsn_sac: part.hsn_sac,
                    title: part.title,
                    quantity: parseFloat(part.quantity),
                    sku: part.sku,
                    unit: part.unit,
                    amount: parseFloat(part.amount),
                    selling_price: (parseFloat(part.amount) / parseFloat(part.quantity)).toFixed(2),
                    created_at: new Date(),
                    updated_at: new Date(),
                });

            })
            order = req.body.order;
            isLinked = true
        } else {
            res.status(422).json({
                responseCode: 422,
                responseMessage: "Parchi Already Attached ",
                responseData: err
            });
        }
    }
    var user = await User.findById(req.body.user).exec();
    if (user) {
        // total=items
        // console.log("Items Length Outside = " + items.length)
        total = parseFloat(_.sumBy(items, x => x.amount));
        var payment = {
            payment_mode: "",
            payment_status: "",
            extra_charges_limit: 0,
            convenience_charges: 0,
            discount_type: "",
            coupon_type: "",
            coupon: "",
            discount_applied: false,
            total: total,
            discount_total: discount,
            paid_total: 0,
        };
        var parchiCounts = await Parchi.find({ business: business, status: { $nin: ['Cancelled'] } }).count().exec();
        var data = {
            business: business,
            user: user._id,
            created_by: loggedInDetails._id,
            parchi_no: parchiCounts + 1,
            note: 'note',
            status: "Open",
            parts: items,
            payment: payment,
            'due.due': total,
            logs: [],
            sale: sale,
            order: order,
            isLinked: isLinked,
            created_at: date,
            updated_at: date,

        };

        await Parchi.create(data).then(async function (parchi) {
            if (parchi.sale) {
                await Sales.findOneAndUpdate({ _id: parchi.sale }, { $set: { isParchi: true, parchi: parchi._id, updated_at: new Date() } }, { new: true }, async function (err, doc) {
                    if (!err) {
                        var activity = {
                            business: business,
                            activity_by: loggedInDetails.name,
                            activity: "Prachi Created",
                            remark: parchi.parchi_no,
                            created_at: new Date(),
                        }
                        businessFunctions.salesLogs(parchi.sale, activity);
                    }
                    else {
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Server Error",
                            responseData: err
                        });
                    }
                })
            } else if (parchi.order) {
                // console.log("Order Parchi Created " + parchi.order)
                await Order.findOneAndUpdate({ _id: parchi.order }, { $set: { isParchi: true, parchi: parchi._id, updated_at: new Date() } }, { new: true }, async function (err, doc) {
                    if (!err) {
                        var activity = {
                            business: business,
                            activity_by: loggedInDetails.name,
                            activity: "Prachi Created",
                            remark: parchi.parchi_no,
                            created_at: new Date(),
                        }
                        businessFunctions.salesOrderLogs(parchi.order, activity);

                    }
                    else {
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Server Error",
                            responseData: err
                        });
                    }
                })
            }





            var activity = {
                business: business,
                activity_by: loggedInDetails.name,
                activity: "Parchi Created",
                remark: "Parchi",
                created_at: new Date(),
            }
            businessFunctions.parchiLogs(parchi._id, activity);
            res.status(200).json({
                responseCode: 200,
                responseMessage: "Parchi Successfully Created",
                responseData: {
                    parchi: parchi
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
router.get('/parchi/list/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var allParchi = [];
    var filters = [];
    var totalResult = []

    if (req.query.query) {
        console.log("Query  = " + req.query.query)
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
            status: 'Open',
            business: mongoose.Types.ObjectId(business),
            $or: [
                { 'parchi_no': { $regex: req.query.query, $options: 'i' } },
                { 'user.name': { $regex: req.query.query, $options: 'i' } },
                { 'user.contact_no': { $regex: req.query.query, $options: 'i' } },
            ]
        };
        filters.push(specification);
        var totalResult = await Parchi.aggregate(filters);

        var specification = {};
        specification['$sort'] = {
            created_at: -1,
        };
        filters.push(specification);

        var specification = {};
        specification['$skip'] = config.perPage * page;
        filters.push(specification);

        var specification = {};
        specification['$limit'] = config.perPage;
        filters.push(specification);



        var query = filters;
        await Parchi.aggregate(query)
            // .select('_id id')
            .allowDiskUse(true)
            .cursor({ batchSize: 20 })
            .exec()
            .eachAsync(async function (parchi) {
                var parchiDetails = await Parchi.findById(parchi._id)
                    .populate({ path: 'business', select: "name contact_no" })
                    .populate({ path: 'order', select: '_id order_no' })
                    .populate({ path: 'sale', select: 'sale_no' })
                    .populate({ path: 'user', select: "name id _id contact_no" })
                    .populate({ path: 'created_by', select: "name contact_no" })
                    .exec();
                var statementData = {}
                var details = await q.all(businessFunctions.getStatementDetails({ user: parchiDetails.user._id, business: business }));
                if (details) {
                    // console.l.log("Data = " + JSON.stringify(details));
                    statementData = {
                        // totalSale: details.totalSale - details.totalSaleCancelled,
                        // totalPurchase: details.totalPurchase - details.totalPurchaseCancelled,
                        // totalPaymentIn: details.totalPaymentIn,
                        // totalPaymentOut: details.totalPaymentOut,
                        // totalPurchaseCancelled: details.totalPurchaseCancelled,
                        // totalSaleCancelled: details.totalPurchaseCancelled,
                        balance: details.balance,
                        // lastTransaction: details.lastTransaction
                    }
                }
                if (parchiDetails.order) {
                    var businessOrder = await BusinessOrder.findOne({ order: parchiDetails.order._id }).exec();
                    parchiDetails.order.order_no = businessOrder.order_no
                }
                allParchi.push({
                    _id: parchiDetails._id,
                    id: parchiDetails._id,
                    business: parchiDetails.business,
                    user: parchiDetails.user,
                    // created_by: parchi.created_by,
                    parchi_no: parchiDetails.parchi_no,
                    status: parchiDetails.status,
                    payment: parchiDetails.payment,
                    due: parchiDetails.due,
                    isLinked: parchiDetails.isLinked,
                    sale: parchiDetails.sale,
                    order: parchiDetails.order,
                    // invoice: parchi.invoice,
                    statementData: statementData,
                    created_at: parchiDetails.created_at,
                    updated_at: parchiDetails.updated_at
                });
            });
    } else {
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
        await Parchi.find({ business: business, status: { $in: ['Open',] } })
            .populate({ path: 'business', select: "name contact_no" })
            .populate({ path: 'order', select: '_id order_no' })
            .populate({ path: 'sale', select: 'sale_no' })
            .populate({ path: 'user', select: "name contact_no" })
            .populate({ path: 'created_by', select: "name contact_no" })
            .sort({ _id: -1 })
            .skip(limit * page).limit(limit)
            .cursor().eachAsync(async (parchi) => {

                var statementData = {}
                var details = await q.all(businessFunctions.getStatementDetails({ user: parchi.user, business: business }));
                if (details) {
                    // console.l.log("Data = " + JSON.stringify(details));
                    statementData = {
                        // totalSale: details.totalSale - details.totalSaleCancelled,
                        // totalPurchase: details.totalPurchase - details.totalPurchaseCancelled,
                        // totalPaymentIn: details.totalPaymentIn,
                        // totalPaymentOut: details.totalPaymentOut,
                        // totalPurchaseCancelled: details.totalPurchaseCancelled,
                        // totalSaleCancelled: details.totalPurchaseCancelled,
                        balance: details.balance,
                        // lastTransaction: details.lastTransaction
                    }
                }
                if (parchi.order) {
                    var businessOrder = await BusinessOrder.findOne({ order: parchi.order._id }).exec();
                    parchi.order.order_no = businessOrder.order_no
                }
                allParchi.push({
                    _id: parchi._id,
                    id: parchi._id,
                    business: parchi.business,
                    user: parchi.user,
                    // created_by: parchi.created_by,
                    parchi_no: parchi.parchi_no,
                    status: parchi.status,
                    payment: parchi.payment,
                    due: parchi.due,
                    isLinked: parchi.isLinked,
                    sale: parchi.sale,
                    order: parchi.order,
                    // invoice: parchi.invoice,
                    statementData: statementData,
                    created_at: parchi.created_at,
                    updated_at: parchi.updated_at
                });
            });
        totalResult = await Parchi.find({ business: business, status: { $in: ['Open'] } }).count().exec()
    }
    res.status(200).json({
        responseCode: 200,
        responseMessage: "Sucesss",
        responseInfo: {
            totalResult: totalResult.length
        },
        responseData: {
            parchi: allParchi
        }
    });
});
router.put('/parchi/remark/add', xAccessToken.token, async (req, res, next) => {
    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var loggedInDetails = await User.findById(decoded.user).exec();

    var rules = {
        parchi: 'required',
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
    } else {
        var parchi = await Parchi.findOne({ _id: req.body.parchi, business: business }).exec()
        if (parchi) {
            await Parchi.findOneAndUpdate({ _id: parchi._id }, { $set: { 'remark': req.body.remark, updated_at: new Date, } }, { new: true }, async function (err, doc) {
                if (err) {
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Server Error...",
                        responseData: err
                    });
                }
                else {
                    var activity = {
                        business: business,
                        activity: "Parchi Reamrk added successfully",
                        activity_by: loggedInDetails.name,
                        remark: "Remark Added",
                        created_at: new Date(),
                    }
                    businessFunctions.parchiLogs(parchi._id, activity);
                }
            });

            res.status(200).json({
                responseCode: 200,
                responseMessage: "Remark added Successfully",
                responseData: {}
            });
        } else {
            if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
                businessFunctions.logs("WARNING: Parchi Not Found with the given quotationId:" + req.body.parchi + ", " + "User:" + loggedInDetails.name);
            }
            res.status(400).json({
                responseCode: 400,
                responseMessage: "parchi Not Found",
                responseData: {}
            });
        }
    }
})
router.get('/parchi/details/get', xAccessToken.token, async function (req, res, next) {
    console.time('looper');
    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var parchi = await Parchi.findOne({ _id: req.query.parchi, business: business, status: { $nin: ['Cancelled'] } })
        .populate({ path: 'user', select: 'name contact_no username email account_info business_info' })
        .populate({ path: "business", select: "name address business_info contact_no email account_info bank_details" })
        .populate('address')
        .exec();
    if (parchi) {
        var statementData = {}
        var details = await q.all(businessFunctions.getStatementDetails({ user: parchi.user, business: business }));
        if (details) {
            // console.l.log("Data = " + JSON.stringify(details));
            statementData = {
                // totalSale: details.totalSale - details.totalSaleCancelled,
                // totalPurchase: details.totalPurchase - details.totalPurchaseCancelled,
                // totalPaymentIn: details.totalPaymentIn,
                // totalPaymentOut: details.totalPaymentOut,
                // totalPurchaseCancelled: details.totalPurchaseCancelled,
                // totalSaleCancelled: details.totalPurchaseCancelled,
                balance: details.balance,
                // lastTransaction: details.lastTransaction
            }
        }
        var activeInvoice = await OrderInvoice.find({ user: parchi.user, business: business, status: "Active" })
            .populate({ path: 'sale', select: 'sale_no created_at id _id' })
            .populate({ path: 'order', select: 'order_no created_at id _id' })
            .select('status invoice_no updated_at sale order').sort({ created_at: -1 }).exec();

        var data = {
            _id: parchi._id,
            id: parchi._id,
            parts: parchi.parts,
            user: parchi.user,
            car: parchi.car,
            address: parchi.address,
            statementData: statementData,
            parchi_no: parchi.parchi_no,
            business: parchi.business,
            address: parchi.address,
            payment: parchi.payment,
            status: parchi.status,
            due: parchi.due,
            note: parchi.note,
            logs: parchi.logs,
            sale: parchi.sale,
            order: parchi.order,
            isLinked: parchi.isLinked,
            created_at: moment(parchi.created_at).tz(req.headers['tz']).format('lll'),
            updated_at: moment(parchi.updated_at).tz(req.headers['tz']).format('lll'),
            // isInvoiceUpToDate: isInvoiceUpToDate,
        }
        fun.eParchiPdf(parchi._id, statementData);

        res.status(200).json({
            responseCode: 200,
            responseMessage: "success",
            responseData: data
        });
    } else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Parchi Not Found",
            responseData: {}
        })
    }
    // console.timeEnd('looper')
});
router.get('/parchi/items/search/', xAccessToken.token, async function (req, res, next) {
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
        var business = req.headers['business'];
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var data = [];
        await BusinessProduct.find({ business: business, list_type: { $in: ["Offline"] }, $or: [{ part_no: new RegExp(req.query.query, "i") }, { title: new RegExp(req.query.query, "i") }, { models: { $in: new RegExp(req.query.query, "i") } }] })
            .cursor().eachAsync(async (p) => {
                var tax_rate = p.tax.split('% ')[0]
                var tax_amount = p.price.rate * (tax_rate / 100);
                var selling_price = p.price.rate + tax_amount
                p.price.sell_price = selling_price

                // console.log("p.price.rate = " + p.price.rate)
                // console.log("Tax Rate = " + tax_rate)
                // console.log("tax_amount = " + tax_amount)
                // console.log("p.price.selleing_price = " + p.price.selling_price)
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
                    selling_price: selling_price,
                    // tax_amount: parseFloat(_.sumBy(tax, x => x.amount).toFixed(2)),
                    tax: p.tax,
                    tax_rate: p.tax_info.rate,
                    // tax_info: tax_details,
                    available: p.stock.available,
                    business: p.business,
                });


            });

        res.status(200).json({
            responseCode: 200,
            responseMessage: "",
            responseData: data
        })

    }
});

router.post('/parchi/items/add', async (req, res, next) => {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var loggedInDetails = await User.findById(decoded.user).exec();
    var part = req.body.item;
    var parchiId = req.body.parchi;
    // var status = req.body.status
    // console.log("parts  ", parts)
    var parchi = await Parchi.findById(parchiId).exec();
    if (parchi) {
        var items = parchi.parts
        var tax = []
        var total = 0
        // console.log("parts ", parts)
        if (part) {
            // for (var p = 0; p < parts.length; p++) {
            if (part.quantity != null) {
                items.push({
                    product: part.product,
                    part_no: part.part_no,
                    hsn_sac: part.hsn_sac,
                    title: part.title,
                    quantity: parseFloat(part.quantity),
                    sku: part.sku,
                    unit: part.unit,
                    amount: parseFloat(part.amount),
                    selling_price: parseFloat(part.selling_price),
                    created_at: new Date(),
                    updated_at: new Date(),
                    // base: base,
                    // unit_base_price: parseFloat(part.unit_base_price),
                    // tax_amount: _.sumBy(tax, x => x.amount),
                    // unit_price: amount / parseFloat(part.quantity),
                    // amount_is_tax: part.amount_is_tax,
                    // margin: parseFloat(part.margin),


                    // discount: part.discount,
                    // discount_type: part.discount_type,
                    // discount_total: discount_total,
                    // tax: tax_info.tax,
                    // tax_rate: tax_info.rate,
                    // tax_info: tax,
                    // isChecked: part.false,
                    // remark: part.remark,
                    // sentDate: new Date(),
                    // status: "confirmed"
                });
            } else {
                res.status(422).json({
                    responseCode: 422,
                    responseMessage: "Invalid Quantity  " + part.item,
                    responseData: {}
                });
            }


            var total_amount = _.sumBy(items, x => x.amount);
            // order_status: 'Open',
            // order_status: "Open",
            // status: 'confirmed',
            await Parchi.findOneAndUpdate({ _id: parchiId }, { $set: { parts: items, 'payment.total': total_amount, updated_at: new Date, } }, { new: true }, async function (err, doc) {
                if (err) {
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Server Error...",
                        responseData: err
                    });
                }
                else {

                    var activity = {
                        business: business,
                        activity_by: loggedInDetails.name,
                        activity: "Title: ' " + part.title + " ' , Qty: " + part.quantity + " , Amt: " + part.amount + " (Added)  ",
                        // time: new Date().getTime.toLocaleTimeString(),
                        remark: "New Part Added",
                        created_at: new Date(),
                    }
                    businessFunctions.parchiLogs(parchiId, activity);
                    // console.log("Activity")
                    // businessFunctions.vendorOrderLogs(order._id, activity);
                    // await QuotationOrders.findByOneAndUpdate({_id:order.quotation},{$set:{quotation_submitted:}})
                }
            });
            res.status(200).json({
                responseCode: 200,
                responseMessage: "Successfully Saved",
                responseData: {}
            });
        }


    } else {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Order Not Found ",
            responseData: {}

        });
    }
});

router.get('/user/sales/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var sales = [];
    // console.log("User = " + req.query.user)
    // parchi: { $ne: req.query.parchi }, isParchi: false, 
    await Sales.find({ user: req.query.user, business: business, status: { $in: ['Confirmed', 'Open',] } })
        .select('_id id invoice sale_no parchi isParchi created_at updated_at')
        .cursor().eachAsync(async (sale) => {
            // package.booking.equals(data.booking)

            // console.log("sale.parchi = " + sale.parchi)
            // console.log("!sale.isParchi = " + !sale.isParchi)
            // console.log("req.query.parchi = " + req.query.parchi)
            if (sale.isParchi) {
                if (sale.parchi.equals(req.query.parchi)) {
                    sales.push({
                        _id: sale._id,
                        id: sale._id,
                        sale_no: sale.sale_no,
                        type: 'sale',
                        parchi: sale.parchi,
                        isParchi: sale.sParchi,
                        created_at: sale.created_at,
                        updated_at: sale.updated_at
                    });
                }
            } else if (!sale.isParchi) {
                sales.push({
                    _id: sale._id,
                    id: sale._id,
                    sale_no: sale.sale_no,
                    type: 'sale',
                    parchi: sale.parchi,
                    isParchi: sale.sParchi,
                    created_at: sale.created_at,
                    updated_at: sale.updated_at
                });
            }
        });

    // , parchi: { $ne: req.query.parchi }, isParchi: false,
    await Order.find({ user: req.query.user, business: business, status: { $nin: ['Cancelled'] } })
        .select('_id id invoice order_no parchi isParchi created_at updated_at ')
        .cursor().eachAsync(async (order) => {
            var businessOrder = await BusinessOrder.findOne({ order: order.order }).select('order_no').exec();

            // console.log("Order.Parchi = " + order.parchi + " Parchi =  " + req.query.parchi)
            // if ((order.parchi.equals(req.query.parchi) && order.isParchi) || !order.isParchi) {
            //     sales.push({
            //         _id: order._id,
            //         id: order._id,
            //         sale_no: order.order_no,
            //         type: 'order',
            //         parchi: order.parchi,
            //         isParchi: order.sParchi,
            //         created_at: order.created_at,
            //         updated_at: order.updated_at
            //     });
            // }
            if (order.isParchi) {
                if (order.parchi.equals(req.query.parchi)) {
                    sales.push({
                        _id: order._id,
                        id: order._id,
                        // sale_no: order.order_no,
                        sale_no: businessOrder.order_no,
                        type: 'order',
                        parchi: order.parchi,
                        isParchi: order.sParchi,
                        created_at: order.created_at,
                        updated_at: order.updated_at
                    });
                }
            } else if (!order.isParchi) {
                sales.push({
                    _id: order._id,
                    id: order._id,
                    // sale_no: order.order_no,
                    sale_no: businessOrder.order_no,
                    type: 'order',
                    parchi: order.parchi,
                    isParchi: order.sParchi,
                    created_at: order.created_at,
                    updated_at: order.updated_at
                });
            }

        });
    sales = _.sortBy(sales, "created_at");
    res.status(200).json({
        responseCode: 200,
        responseMessage: "Sucesss",
        responseInfo: {
            totalResult: 0
        },
        responseData: {
            sales: sales,
            // order: order
        }
    });
});
router.put('/parchi/item/remove', async (req, res, next) => {
    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var partIndex = req.body.index;
    var loggedInDetails = await User.findById(decoded.user).exec();

    var parchi = await Parchi.findById(req.body.parchi).exec()
    if (parchi) {
        console.log("partIndexe  ", partIndex)
        var activity = {
            business: business,
            activity: "Item Removed- " + "Item: " + parchi.parts[partIndex].title + " " + "Part_No: " + parchi.parts[partIndex].part_no + " " + "Quantity: " + parchi.parts[partIndex].quantity,
            activity_by: loggedInDetails.name,
            remark: "",
            created_at: new Date(),
        }
        businessFunctions.parchiLogs(parchi._id, activity);
        parchi.parts.splice(partIndex, 1);
        await parchi.save();

        var total_amount = _.sumBy(parchi.parts, x => x.amount);
        await Parchi.findOneAndUpdate({ _id: parchi._id }, { $set: { 'payment.total': total_amount, updated_at: new Date, } }, { new: true }, async function (err, doc) {
            if (err) {
                res.status(422).json({
                    responseCode: 422,
                    responseMessage: "Server Error...",
                    responseData: err
                });
            }
            else {
            }
        });

        res.status(200).json({
            responseCode: 200,
            responseMessage: "Removed Successfully",
            responseData: {}
        });
    } else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Parchi Not Found",
            responseData: {}
        });
    }
})

router.put('/link/parchi/with/sale/OLD', async (req, res, next) => {
    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var partIndex = req.body.partIndex;
    var loggedInDetails = await User.findById(decoded.user).exec();
    var parchi = await Parchi.findById(req.body.parchi).exec()
    if (parchi) {
        // , parchi: { $ne: parchi }
        var sale = await Parchi.findOne({ _id: req.body.sale, isParchi: false }).exec()
        if (sale) {
            sale.parchi = parchi._id;
            sale.isParchi = true;
            sale.updated_at = new Date()
            await sale.save()
            // await Sales.findOneAndUpdate({ _id: req.body.sale, isParchi: false }, { $set: { parchi: parchi._id, isParchi: true } }, { new: true }, async function (err, doc) {
            //     if (err) {
            //         res.status(422).json({
            //             responseCode: 422,
            //             responseMessage: "Server Error",
            //             responseData: err
            //         });
            //     }
            //     else {

            //     }
            // })

        }



        await Parchi.findOneAndUpdate({ _id: parchi._id }, { $set: { sale: doc.id, isLinked: true } }, { new: true }, async function (err, doc) {
            if (err) {
                res.status(422).json({
                    responseCode: 422,
                    responseMessage: "Server Error",
                    responseData: err
                });
            }
            else {


            }
        })
        // var activity = {
        //     business: business,
        //     activity: "Item Removed- " + "Item: " + order.parts[partIndex].title + " " + "Part_No: " + order.parts[partIndex].part_no + " " + "Quantity: " + order.parts[partIndex].quantity,
        //     activity_by: loggedInDetails.name,
        //     remark: "",
        //     created_at: new Date(),
        // }
        // businessFunctions.QuotationItemAddLog(quotation, activity);
        res.status(200).json({
            responseCode: 200,
            responseMessage: "Successfully",
            responseData: await Parchi.findById(req.body.parchi).exec()
        });

    } else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Parchi Not Found",
            responseData: {}
        });
    }
})

router.put('/link/parchi/with/sale', async (req, res, next) => {
    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var partIndex = req.body.partIndex;
    var loggedInDetails = await User.findById(decoded.user).exec();
    var parchi = await Parchi.findById(req.body.parchi).exec()
    if (parchi) {
        // console.log("Type  = " + req.body.type)
        if (req.body.type == 'sale') {
            // , parchi: { $ne: parchi }
            var sale = await Sales.findOne({ _id: req.body.sale, isParchi: false }).exec()
            if (sale) {
                sale.parchi = parchi._id;
                sale.isParchi = true;
                sale.updated_at = new Date()
                await sale.save()
                var activity = {
                    business: business,
                    activity_by: loggedInDetails.name,
                    activity: "Sale Linked with parchi #" + parchi.parchi_no,
                    remark: parchi.parchi_no,
                    created_at: new Date(),
                }
                businessFunctions.salesLogs(sale._id, activity);

                await Sales.updateMany({ parchi: parchi._id, _id: { $ne: sale._id } }, { $set: { parchi: null, isParchi: false } }).exec()
                await Parchi.findOneAndUpdate({ _id: parchi._id }, { $set: { sale: sale._id, isLinked: true, order: null } }, { new: true }, async function (err, doc) {
                    if (err) {
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Server Error",
                            responseData: err
                        });
                    }
                    else {


                    }
                })
            } else {
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Sale already linked",
                    responseData: {}
                });
            }
        } else if (req.body.type == 'order') {

            // , parchi: { $ne: parchi }
            var order = await Order.findOne({ _id: req.body.sale }).exec()
            console.log("Order .id  = " + order._id)
            if (order) {
                order.parchi = parchi._id;
                order.isParchi = true;
                order.updated_at = new Date()
                // await markModified(;)
                await order.save()

                await Parchi.findOneAndUpdate({ _id: parchi._id }, { $set: { order: order._id, isLinked: true, sale: null } }, { new: true }, async function (err, doc) {
                    if (err) {
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Server Error",
                            responseData: err
                        });
                    }
                    else {
                        await Order.updateMany({ parchi: parchi._id, _id: { $ne: order._id } }, { $set: { parchi: null, isParchi: false } }).exec()
                        await Sales.updateMany({ parchi: parchi._id }, { $set: { parchi: null, isParchi: false } }).exec()
                    }
                })
            }

        }
        // var activity = {
        //     business: business,
        //     activity: "Item Removed- " + "Item: " + order.parts[partIndex].title + " " + "Part_No: " + order.parts[partIndex].part_no + " " + "Quantity: " + order.parts[partIndex].quantity,
        //     activity_by: loggedInDetails.name,
        //     remark: "",
        //     created_at: new Date(),
        // }
        // businessFunctions.QuotationItemAddLog(quotation, activity);

        var activity = {
            business: business,
            activity_by: loggedInDetails.name,
            activity: "Parchi Linked Successfully",
            // time: new Date().getTime.toLocaleTimeString(),
            remark: "Parchi Linked",
            created_at: new Date(),
        }
        businessFunctions.parchiLogs(parchi._id, activity);
        res.status(200).json({
            responseCode: 200,
            responseMessage: "Linked Successfully",
            responseData: await Parchi.findById(req.body.parchi).exec()
        });

    } else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Parchi Not Found",
            responseData: {}
        });
    }
})
router.post('/parchi/to/sale/create', xAccessToken.token, async function (req, res, next) {
    var business = req.headers['business'];
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var date = new Date();
    var loggedInDetails = decoded.user;
    var items = [];
    var item_total = 0;
    var discount = 0;
    var total = 0;
    var due = {
        due: 0
    };
    var loggedInDetails = await User.findById(decoded.user).exec();

    var saleItems = []
    var parchi = await Parchi.findById(req.body.parchi).exec();
    if (parchi) {
        var user = await User.findById(parchi.user).exec();
        if (user) {
            var parts = parchi.parts;
            // console.log("3091 Parts Length  = " + parts.length)
            for (var i = 0; i < parts.length; i++) {
                // console.log("Iteration - = " + i + "  Part_no=  " + parts[i].part_no)
                var businessProduct = await BusinessProduct.find({ part_no: parts[i].part_no, business: business }).exec();
                if (businessProduct.length == 0) {
                    // console.log("\n New Item -------------------------------------New ")
                    var tax_slab = "18.0% GST";
                    var sale_price = parts[i].selling_price; //Sale Price
                    // part.selling_price = parts[i].selling_price;
                    var tax_info = await Tax.findOne({ tax: tax_slab }).exec();
                    if (tax_info) {
                        // console.log("tax Info  = " + JSON.stringify(tax_info, null, '\t'))
                        // return
                        var tax_rate = tax_info.rate;
                        var base = (sale_price) / (tax_rate + 100) * 100;

                        // console.log("sale_price  = " + sale_price)
                        // console.log("tax_info.rate  = " + tax_info.rate)
                        // console.log("base  = " + base)
                        // var margin = "7%";   //Default Margin
                        var unit = 'Piece';
                        var product_brand = null;
                        var brand_category = null;
                        var category = 'OEM';   //OEM or OES   partNo_category
                        var item_name = parts[i].title; //Item name 
                        var models = []
                        var quantity = parts[i].quantity
                        //products[p].tax = "28.0% GST"
                        // var tax_rate = tax_info.detail;
                        // var total_amount = 0
                        // console.log("RATE = " + sale_price)
                        var margin = "0";   //Default Margin
                        if (margin) {
                            margin = margin.toString();
                            if (margin.indexOf("%") >= 0) {
                                margin = parseFloat(margin);
                                if (!isNaN(margin) && margin > 0) {
                                    margin_total = sale_price * (margin / 100);
                                    // base = sale_price - margin_total;   //To Set By Default 7% Margin to every Product

                                }
                            }
                            else {
                                margin_total = parseFloat(margin)
                                // base = sale_price - margin_total;
                            }
                        }
                        // console.log("Margin = " + margin + " Margin Total = " + margin_total)
                        // if (part.isDiscount) {
                        //     // console.log("Discount prints here...", discount)
                        //     if (discount.indexOf("%") >= 0) {
                        //         // console.log("602 - Discount If Condition = " + discount)
                        //         discount = parseFloat(discount);
                        //         if (!isNaN(discount) && discount > 0) {
                        //             var discount_total = base * (discount / 100);
                        //             base = base - parseFloat(discount_total.toFixed(2))
                        //         }
                        //     }
                        //     else {
                        //         // console.log("610 - Discount ELSE Condition= " + discount)


                        //         discount = parseFloat(discount);
                        //         if (!isNaN(discount) && discount > 0) {
                        //             base = base - parseFloat(discount.toFixed(2))
                        //         }
                        //     }
                        // }

                        // 100
                        var rate = base;
                        var tax_detail = tax_info.detail;
                        var tax = []
                        var amount_is_tax = "exclusive";
                        if (amount_is_tax == "exclusive") {
                            var tax_on_amount = base;
                            if (tax_detail.length > 0) {
                                for (var r = 0; r < tax_detail.length; r++) {
                                    if (tax_detail[r].rate != tax_info.rate) {
                                        var t = tax_on_amount * (tax_detail[r].rate / 100);
                                        rate = rate + t;
                                        // console.log("Tax Amount " + t)
                                        tax.push({
                                            tax: tax_detail[r].tax,
                                            rate: tax_detail[r].rate,
                                            amount: parseFloat(t.toFixed(2))
                                        })
                                    }
                                    else {
                                        var t = tax_on_amount * (tax_info.rate / 100);
                                        rate = rate + t;
                                        // console.log("Tax Amount " + t)

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
                        // console.log("Tax Amount  = " + t)


                        var taxes = {
                            tax: tax_info.tax,
                            rate: tax_info.rate,
                            amount: _.sumBy(tax, x => x.amount),
                            detail: tax
                        }
                        var sku = {
                            sku: 'Parchi Item',
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
                        var margin_total = 0
                        var amount = parseFloat(rate) + margin_total;
                        // console.log("Total Amountn = " + total_amount)
                        // var tax_on_amount = amount;
                        // if (tax_rate.length > 0) {
                        //     for (var r = 0; r < tax_rate.length; r++) {
                        //         if (tax_rate[r].rate != tax_info.rate) {
                        //             var t = tax_on_amount * (tax_rate[r].rate / 100);
                        //             amount = amount + t;
                        //         }
                        //         else {
                        //             var t = tax_on_amount * (tax_info.rate / 100);
                        //             amount = amount + t;
                        //         }
                        //     }
                        // }
                        // console.log("Amount  = " + amount)

                        var price = {
                            base: base, //base price with GST
                            tax_amount: _.sumBy(tax, x => x.amount), //Tax Amount
                            purchase_price: rate,  //base + GST on base
                            rate: base + margin_total,
                            amount: amount,
                            mrp: amount,
                            discount: 0,
                            discount_type: "Not Applicable",
                            isDiscount: false,
                            margin: margin,
                            sell_price: base + margin_total,
                            margin_total: margin_total,
                        }
                        // console.log("Price NEW Stock = " + JSON.stringify(price, null, '\t'))
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
                            part_no: parts[i].part_no, //mend
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
                            hsn_sac: '-',
                            quantity: 0,
                            unit: 'Piece',
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

                            // updatedData = {
                            //     _id: product._id,
                            //     id: product._id,
                            //     product: product.title,
                            //     part_no: product.part_no,
                            //     hsn_sac: product.hsn_sac,
                            //     specification: product.specification,
                            //     base: product.price.base,
                            //     price: product.price.purchase_price,
                            //     unit: product.unit,
                            //     item_details: product
                            // }




                            ///////  Next Step Is to Add Item In Sale 
                            var items = [];
                            var convenience_charges = 0;
                            var discount = 0;
                            var total = 0;
                            // var sale = await Sales.findById(req.body.sale).exec();
                            // var parts = sale.parts;
                            // var loggedInDetails = await User.findById(decoded.user).exec();
                            // if (sale) {
                            // if (part.title != "") {
                            // var tax_info = await Tax.findOne({ tax: product.tax }).exec();
                            // if (tax_info) {

                            // if (products.product) {
                            // var product = await BusinessProduct.findOne({ _id: product.product, business: business }).exec();\
                            var product = await BusinessProduct.findOne({ _id: bp._id }).exec();
                            if (product) {
                                var tax = [];
                                var rate = product.price.rate;
                                var amount = product.price.rate * parts[i].quantity;
                                var tax_rate = tax_info.detail;
                                var discount_total = 0;
                                var base = amount
                                var discount = '';

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

                                if (product.amount_is_tax == "inclusive") {
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
                                var user = await User.findById(parchi.user).exec();
                                parts[i].product = product._id;
                                var item = {
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
                                    part_no: product.part_no,
                                    hsn_sac: product.hsn_sac,
                                    unit: product.unit,
                                    title: product.title,
                                    sku: product.sku,
                                    mrp: product.price.mrp,
                                    selling_price: product.price.rate,
                                    rate: product.price.rate,
                                    quantity: parts[i].quantity,
                                    base: parseFloat(base.toFixed(2)),
                                    discount: product.price.discount,
                                    discount_total: parseFloat(discount_total.toFixed(2)),
                                    amount_is_tax: product.amount_is_tax,
                                    tax_amount: parseFloat(_.sumBy(tax, x => x.amount).toFixed(2)),
                                    amount: parseFloat(amount.toFixed(2)),
                                    tax: tax_info.tax,
                                    tax_rate: tax_info.rate,
                                    tax_info: tax,
                                    issued: await q.all(businessFunctions.salesPartIssue(parts[i], business, user, loggedInDetails)),
                                    added_by_customer: false,
                                    created_at: new Date(),
                                    updated_at: new Date()
                                }
                                // console.log("Issued  = " + item.issued)
                                saleItems.push(item)

                            }

                        });
                    } else {
                        // console.log("Invlaid Tax ")
                    }
                } else {
                    // console.log(" 3474 ELSE Parts.product  =  --------------------------------------------- Old " + parts[i].product)
                    if (parts[i].product) {
                        var product = await BusinessProduct.findOne({ _id: parts[i].product }).exec();
                        if (product) {

                            var tax = []
                            var tax_slab = product.tax;
                            var sale_price = parts[i].selling_price; //Sale Price

                            // part.selling_price = parts[i].selling_price;
                            var tax_info = await Tax.findOne({ tax: tax_slab }).exec();
                            if (tax_info) {
                                // console.log("tax Info  = " + JSON.stringify(tax_info, null, '\t'))
                                // return
                                var tax_rate = tax_info.rate;
                                var base = ((sale_price) / (tax_rate + 100) * 100).toFixed(2);
                                var selling_price = base;
                                console.log("sale_price  = " + sale_price)
                                console.log("tax_info.rate  = " + tax_info.rate)
                                console.log("base  = " + base)
                                // var margin = "7%";   //Default Margin
                                var item_name = parts[i].title; //Item name 
                                var quantity = parts[i].quantity
                                var amount = base * quantity;
                                var discount_total = 0;
                                var discount = 0
                                var tax_rate = tax_info.detail;

                                console.log("Base Amount = " + amount)
                                // console.log("Base Amount = " + amount)
                            }
                            // var tax_info = await Tax.findOne({ tax: product.tax }).exec();
                            // var tax = [];
                            // var rate = product.price.rate;
                            // var amount = product.price.rate * parts[i].quantity;
                            // var tax_rate = tax_info.detail;
                            // var discount_total = 0;
                            // var base = amount
                            // var discount = '';

                            // if (discount.indexOf("%") >= 0) {
                            //     discount = parseFloat(discount);
                            //     if (!isNaN(discount) && discount > 0) {
                            //         discount_total = amount * (discount / 100);
                            //         amount = amount - parseFloat(discount_total.toFixed(2))
                            //     }
                            // }
                            // else {
                            //     if (discount == "") {
                            //         discount = "0"
                            //     }
                            //     discount_total = parseFloat(discount);
                            //     if (!isNaN(discount_total) && discount_total > 0) {
                            //         amount = amount - parseFloat(discount_total.toFixed(2))
                            //     }
                            // }
                            var amount_is_tax = "exclusive"
                            if (amount_is_tax == "exclusive") {
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
                            console.log("Base = " + base)
                            console.log("Amount + Tax = " + amount)
                            console.log("Amount + Tax = " + amount)
                            if (product.amount_is_tax == "inclusive") {
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

                            // var tax_details = {
                            //     tax: tax_info.tax,
                            //     rate: tax_info.rate,
                            //     amount: total,
                            //     detail: tax
                            // }
                            var user = await User.findById(parchi.user).exec();
                            parts[i].product = product._id;
                            // console.log("parts[i].quantityp= " + parts[i].quantity)
                            var item = {
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
                                part_no: product.part_no,
                                hsn_sac: product.hsn_sac,
                                unit: product.unit,
                                title: parts[i].title,
                                sku: product.sku,
                                mrp: product.price.mrp,
                                selling_price: selling_price,
                                rate: selling_price,
                                quantity: parts[i].quantity,
                                base: base,
                                discount: discount,
                                discount_total: parseFloat(discount_total.toFixed(2)),
                                amount_is_tax: amount_is_tax,
                                tax_amount: parseFloat(_.sumBy(tax, x => x.amount).toFixed(2)),
                                amount: parseFloat(amount.toFixed(2)),
                                tax: tax_info.tax,
                                tax_rate: tax_info.rate,
                                tax_info: tax,
                                issued: await q.all(businessFunctions.salesPartIssue(parts[i], business, user, loggedInDetails)),
                                added_by_customer: false,
                                created_at: new Date(),
                                updated_at: new Date()
                            }
                            // console.log("Issued  = " + item.issued)
                            saleItems.push(item)

                        }

                        // var isssued = await q.all(businessFunctions.salesPartIssue(parts[i], business, user, loggedInDetails))
                        // console.log("Old Item Updated ")
                    }
                }
            }

            var convenience_charges = 0
            // if (sale.payment.convenience_charges) {
            //     convenience_charges = Math.ceil(sale.payment.convenience_charges);
            // }
            var discount = parseFloat(_.sumBy(saleItems, x => x.discount_total).toFixed(2));
            var amount = parseFloat(_.sumBy(saleItems, x => x.amount).toFixed(2));
            var total = amount + discount + convenience_charges;
            // var transaction_log = await q.all(fun.getSalesTransaction(sale._id, business));
            // var paid_total = transaction_log.paid_total;
            var paid_total = 0;
            // var data = {
            //     updated_at: new Date(),
            //     "payment.paid_total": paid_total,
            //     "payment.amount": parseFloat(amount.toFixed(2)),
            //     "payment.discount_total": parseFloat(discount.toFixed(2)),
            //     "payment.total": parseFloat(total.toFixed(2)),
            //     // "payment.order_discount": parseFloat(sale.payment.order_discount),
            //     "payment.order_discount": 0,
            //     due: {
            //         due: Math.ceil(amount) + convenience_charges - paid_total
            //     },
            // }





            var payment = {
                payment_mode: "",
                payment_status: "",
                extra_charges_limit: 0,
                convenience_charges: 0,
                discount_type: "",
                coupon_type: "",
                coupon: "",
                discount_applied: false,
                total: parseFloat(total.toFixed(2)),
                amount: parseFloat(amount.toFixed(2)),
                discount_total: parseFloat(discount.toFixed(2)),
                paid_total: paid_total,
                order_discount: 0
            };

            var salesCount = await Sales.find({ business: business }).count().exec();
            var data = {
                business: business,
                user: user._id,
                created_by: loggedInDetails._id,
                sale_no: salesCount + 1,
                note: 'note',
                status: "Open",
                parts: saleItems,
                payment: payment,
                due: due,
                logs: [],
                isInvoice: false,
                isParchi: true,
                parchi: parchi._id,
                invoice: null,
                created_at: date,
                updated_at: date,

            };

            await Sales.create(data).then(async function (sale) {
                await Sales.findOneAndUpdate({ parchi: parchi._id, _id: { $ne: sale._id } }, { $set: { parchi: null, isParchi: false } }, { new: true }, async function (err, doc) {
                    if (err) {
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Server Errro",
                            responseData: err
                        });
                    }
                    else {

                        var salesActivity = {
                            business: business,
                            activity_by: loggedInDetails.name,
                            activity: "Sale Unlinked from parchi #" + parchi.parchi_no,
                            remark: parchi.parchi_no,
                            created_at: new Date(),
                        }
                        // businessFunctions.salesLogs(doc._id, salesActivity);
                        // q.all(businessFunctions.salesLogs())

                        //ParchiLogs
                        var parchiActivity = {
                            business: business,
                            activity_by: loggedInDetails.name,
                            activity: "Sale #" + doc.sale_no + " Unlinked.",
                            // time: new Date().getTime.toLocaleTimeString(),
                            remark: "Parchi Un-Linked",
                            created_at: new Date(),
                        }
                        businessFunctions.parchiLogs(parchi._id, parchiActivity);
                    }
                });

                await Order.findOneAndUpdate({ parchi: parchi._id, _id: { $ne: sale._id } }, { $set: { parchi: null, isParchi: false } }, { new: true }, async function (err, doc) {
                    if (err) {
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Server Errro",
                            responseData: err
                        });
                    }
                    else {

                        var salesActivity = {
                            business: business,
                            activity_by: loggedInDetails.name,
                            activity: "Unlinked from parchi #" + parchi.parchi_no,
                            remark: parchi.parchi_no,
                            created_at: new Date(),
                        }
                        // businessFunctions.salesOrderLogs(doc._id, salesActivity);
                        // q.all(businessFunctions.salesLogs())

                        //ParchiLogs
                        // var parchiActivity = {
                        //     business: business,
                        //     activity_by: loggedInDetails.name,
                        //     activity: "Order #" + doc.order_no + " Unlinked.",
                        //     // time: new Date().getTime.toLocaleTimeString(),
                        //     remark: "Parchi Un-Linked",
                        //     created_at: new Date(),
                        // }
                        // businessFunctions.parchiLogs(parchi._id, parchiActivity);
                    }
                });



                var salesActivity = {
                    business: business,
                    activity_by: loggedInDetails.name,
                    activity: "Sale Created from Parchi #" + parchi.parchi_no,
                    remark: "Sale",
                    created_at: new Date(),
                }
                parchi.sale = sale._id
                parchi.isLinked = true
                await parchi.save()
                businessFunctions.salesLogs(sale._id, salesActivity);
                var parchiActivity = {
                    business: business,
                    activity_by: loggedInDetails.name,
                    activity: "Sale #" + sale.sale_no + " created.",
                    // time: new Date().getTime.toLocaleTimeString(),
                    remark: "Parchi Linked",
                    created_at: new Date(),
                }
                businessFunctions.parchiLogs(parchi._id, parchiActivity);
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Sale Successfully Created",
                    responseData: {
                        sale: sale
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
    } else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Parchi not found",
            responseData: {}
        });
    }
});
router.put('/parchi/item/edit', async (req, res, next) => {
    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var index = req.body.index;
    var part = req.body.item;
    var loggedInDetails = await User.findById(user).exec();
    var parchi = await Parchi.findOne({ _id: req.body.parchi }).exec();
    if (parchi) {
        if (part) {
            if (!isNaN(parseFloat(part.quantity))) {
                parchi.parts[index].part_no = part.part_no;
                parchi.parts[index].item = part.title;
                parchi.parts[index].quantity = parseFloat(part.quantity);
                parchi.parts[index].amount = parseFloat(part.amount);
                parchi.parts[index].selling_price = parseFloat(part.selling_price);
                parchi.parts[index].updated_at = new Date()
                parchi.markModified('parts')
                parchi.save()
            } else {
                res.status(422).json({
                    responseCode: 422,
                    responseMessage: "Invalid Quantity, Rate " + part.item,
                    responseData: {}
                });
            }
            var total_amount = _.sumBy(parchi.parts, x => x.amount);
            await Parchi.findOneAndUpdate({ _id: parchi._id }, { $set: { 'payment.total': total_amount, updated_at: new Date, } }, { new: true }, async function (err, doc) {
                if (err) {
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Server Error...",
                        responseData: err
                    });
                }
                else {
                    var activity = {
                        business: business,
                        activity_by: loggedInDetails.name,
                        activity: "Title: ' " + part.title + " ' , Qty: " + parseFloat(part.quantity) + " , Amt: " + parseFloat(part.amount) + " ( Updated )  ",
                        // time: new Date().getTime.toLocaleTimeString(),
                        remark: "Part Updated",
                        created_at: new Date(),
                    }
                    businessFunctions.parchiLogs(parchi._id, activity);
                }
            });
            res.status(200).json({
                responseCode: 200,
                responseMessage: "Successfully Saved",
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

})
// cancel/eParchi
router.put('/cancel/eParchi', async (req, res, next) => {
    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var partIndex = req.body.partIndex;
    var loggedInDetails = await User.findById(decoded.user).exec();
    var parchi = await Parchi.findById(req.body.parchi).exec()
    if (parchi) {
        var data = {
            status: "Cancelled",
            updated_at: new Date(),
            isLinked: false,
            sale: null,
            order: null,
        }
        await Parchi.findOneAndUpdate({ _id: parchi._id, business: business }, { $set: data }, { new: true }, async function (err, doc) {
            if (err) {
                res.status(422).json({
                    responseCode: 422,
                    responseMessage: "Server Error",
                    responseData: err
                });
            }
            else {
                var update = {
                    parchi: null,
                    isParchi: false,
                    updated_at: new Date()
                }
                if (parchi.sale) {
                    console.log("Sales")
                    await Sales.findOneAndUpdate({ _id: parchi.sale, business: business }, { $set: update }, { new: true }, async function (err, doc) {
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
                                activity: "Pacrhi liked with this sale has been Cancelled",
                                remark: "Cancelled",
                                created_at: new Date(),
                            }
                            businessFunctions.salesLogs(parchi.sale, activity);
                        }
                    })
                } else if (parchi.order) {
                    console.log("Orders")
                    await Order.findOneAndUpdate({ _id: parchi.order, business: business }, { $set: update }, { new: true }, async function (err, doc) {
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
                                activity: "Pacrhi liked with this Order has been Cancelled",
                                remark: "Cancelled",
                                created_at: new Date(),
                            }
                            businessFunctions.OrderLogs(parchi.order, activity);
                        }
                    })
                }
                var activity = {
                    business: business,
                    activity_by: loggedInDetails.name,
                    activity: "Pacrhi Cancelled",
                    remark: "Cancelled",
                    created_at: new Date(),
                }
                businessFunctions.parchiLogs(parchi._id, activity)
            }
        })
        res.status(200).json({
            responseCode: 200,
            responseMessage: "Cancelled Successfully",
            responseData: {}
        });
    } else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Parchi Not Found",
            responseData: {}
        });
    }
})









//Sale Labour Addd
router.post('/sale/labour/add', xAccessToken.token, async function (req, res, next) {
    var business = req.headers['business'];
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var date = new Date();
    var loggedInDetails = decoded.user;
    var items = [];
    var convenience_charges = 0;
    var discount = 0;
    var item_total = 0;
    var sale = await Sales.findById(req.body.sale).exec();
    var labours = sale.labours;
    var loggedInDetails = await User.findById(decoded.user).exec();
    if (sale) {
        var products = req.body.items;
        if (products) {
            var tax_info = await Tax.findOne({ tax: products.tax }).exec();

            // var product = await BusinessProduct.findOne({ _id: products.product, business: business }).exec();
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
            // var issued = await q.all(businessFunctions.salesPartIssue(products, business, user, loggedInDetails));
            // if (issued) {

            // }
            var user = await User.findById(sale.user).exec();
            labours.push({
                part_no: products.part_no,
                hsn_sac: products.hsn_sac,
                unit: products.unit,
                title: products.title,
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
                created_at: new Date(),
                updated_at: new Date()
            })



        }
        if (sale.payment.convenience_charges) {
            convenience_charges = Math.ceil(sale.payment.convenience_charges);
        }
        var discount = parseFloat(_.sumBy(labours, x => x.discount_total).toFixed(2)) + parseFloat(_.sumBy(sale.parts, x => x.discount_total).toFixed(2));
        var amount = parseFloat(_.sumBy(labours, x => x.amount).toFixed(2)) + parseFloat(_.sumBy(sale.parts, x => x.amount).toFixed(2));
        var total = amount + discount + convenience_charges;
        var transaction_log = await q.all(fun.getSalesTransaction(sale._id, business));
        var paid_total = transaction_log.paid_total;
        var data = {
            "payment.paid_total": paid_total,
            "payment.amount": parseFloat(amount.toFixed(2)),
            "payment.discount_total": parseFloat(discount.toFixed(2)),
            "payment.total": parseFloat(total.toFixed(2)),
            "payment.order_discount": parseFloat(sale.payment.order_discount),
            due: {
                due: Math.ceil(amount) + convenience_charges - paid_total - (parseFloat(sale.payment.order_discount) + parseFloat(sale.payment.discount_total))
            },
            labours: labours,
            updated_at: new Date(),
        }




        await Sales.findOneAndUpdate({ _id: sale._id, business: business }, { $set: data }, { new: false }, async function (err, doc) {
            if (err) {
                res.status(422).json({
                    responseCode: 422,
                    responseMessage: "Server Error",
                    responseData: err
                });
            }
            else {
                var has_invoice = false;
                var invoices = await OrderInvoice.find({ sale: sale._id, business: business }).select('status invoice_no').exec();
                if (invoices.length > 0) {
                    has_invoice = true;
                }
                var orders = {
                    _id: sale._id,
                    id: sale._id,
                    items: sale.parts,
                    labours: sale.labours,
                    user: sale.user,
                    car: sale.car,
                    address: sale.address,
                    due_date: moment(sale.due_date).tz(req.headers['tz']).format('lll'),
                    delivery_date: moment(sale.delivery_date).tz(req.headers['tz']).format('lll'),
                    time_slot: sale.time_slot,
                    convenience: sale.convenience,
                    order_no: sale.order_no,
                    address: sale.address,
                    payment: sale.payment,
                    due: sale.due,
                    logs: sale.logs,
                    status: sale.status,
                    has_invoice: has_invoice,
                    invoices: invoices,
                    created_at: moment(sale.created_at).tz(req.headers['tz']).format('lll'),
                    updated_at: moment(sale.updated_at).tz(req.headers['tz']).format('lll'),
                };
                var activity = {
                    business: business,
                    activity_by: loggedInDetails.name,
                    activity: "'" + products.title + "'  -Added to Order",
                    remark: "Labour Added",
                    created_at: new Date(),
                }
                businessFunctions.salesLogs(sale._id, activity);




                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "success",
                    responseData: orders
                });
            }
        });
    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Sale not found",
            responseData: {}
        });
    }
});


//Author Sumit Mathur
router.post('/send/payment/code/sales', async function (req, res, next) {

    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    // console.log(business);
    var type = req.body.type;
    var userInfo = await User.findOne({ _id: mongoose.Types.ObjectId(req.body.user) }).exec();
    // .populate({ path: 'user', select: 'name contact_no address _id' })

    // var businessInfo= await User.findOne({ _id: mongoose.Types.ObjectId(business)}).exec();
    // console.log(businessInfo);

    if (userInfo) {
        //console.log(orderInfo.user);
        if (type == 'email') {
            event.paymentLink(userInfo, business)
        }

        else {
            whatsAppEvent.paymetRequestSales(userInfo, business)
        }



        res.status(200).json({
            responseCode: 200,
            responseMessage: "Request has been sent",
            responseData: { userInfo }
        });
    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: " User not found",
            responseData: {}
        });

    }


});
//Sales Export For Tally
router.get('/tally/sales/export', xAccessToken.token, async function (req, res, next) {
    try {
        // const business = req.user;
        const business = req.headers['business'];
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

        let aggregate = [
            {
                $lookup: {
                    from: "User",
                    localField: "user",
                    foreignField: "_id",
                    as: "user",
                }
            },
            {
                $unwind: {
                    path: "$user",
                    preserveNullAndEmptyArrays: false
                }
            },
            {
                $match: { business: mongoose.Types.ObjectId(business), status: { $nin: ["Cancelled"] } }
            },
            {
                $group: {
                    _id: { title: '$_id' },
                    parts: { $last: '$parts' },
                    sale_no: { $last: '$sale_no' },
                    note: { $last: '$note' },
                    address: { $last: '$address' },
                    user: { $last: '$user' },
                    created_at: { $last: '$created_at' }
                },
            },
            { $sort: { "created_at": 1 } },
        ];
        console.log("From = ", from, " , TO = ", to)

        if (from && to) {
            aggregate.push({ $match: { created_at: { $gte: new Date(from), $lte: new Date(to) } } })
        }
        await Sales.aggregate(aggregate).allowDiskUse(true)
            .cursor({})
            .exec()
            .eachAsync(async function (p) {
                if (!p.address) {
                    // console.log("P user  = " + p.user._id)
                    p.address = await Address.findOne({ user: p.user._id }).sort({ _id: -1 }).lean();
                    // console.log("p.address = " + JSON.stringify(p.address))
                }
                if (!p.address) {
                    p.address = p.user.address
                }
                sales.push(p);

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