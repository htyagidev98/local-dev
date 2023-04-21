var mongoose = require('mongoose'),
    express = require('express'),
    router = express.Router(),
    config = require('../../config'),
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
const { Logger } = require('aws-cloudwatch-log')
const xAccessToken = require('../../middlewares/xAccessTokenBusiness');
const fun = require('../function');
// const event = require('../event');
const whatsAppEvent = require('../whatsapp/whatsappEvent')
var paytm_config = require('../../paytm/paytm_config').paytm_config;
var paytm_checksum = require('../../paytm/checksum');

var salt = bcrypt.genSaltSync(10);
const User = require('../../models/user');
const BusinessTiming = require('../../models/businessTiming');
const BusinessConvenience = require('../../models/businessConvenience');
const BookingTiming = require('../../models/bookingTiming');
// const Type = require('../../models/type');
// const BusinessType = require('../../models/businessType');
const Category = require('../../models/category');
const Automaker = require('../../models/automaker');
const Model = require('../../models/model');
const QuotationOrders = require('../../models/quotationOrders')
const OrderLogs = require('../../models/orderLogs')
const State = require('../../models/state');
const BookingCategory = require('../../models/bookingCategory');
const ProductImage = require('../../models/productImage');
const Country = require('../../models/country');
const BusinessOffer = require('../../models/businessOffer');
const BusinessUser = require('../../models/businessUser');
const ProductOffer = require('../../models/productOffer');
const Order = require('../../models/order');
const BusinessOrder = require('../../models/businessOrder');
const OrderLine = require('../../models/orderLine');
const OrderConvenience = require('../../models/orderConvenience');
const OrderInvoice = require('../../models/orderInvoice');
const BookmarkProduct = require('../../models/bookmarkProduct');
const BookmarkOffer = require('../../models/bookmarkOffer');
const Car = require('../../models/car');
const CarSell = require('../../models/carSell');
const Asset = require('../../models/asset');
const CarImage = require('../../models/carImage');
const CarDocument = require('../../models/carDocument');
const BookmarkCar = require('../../models/bookmarkCar');
const BodyStyle = require('../../models/bodyStyle');
const FuelType = require('../../models/fuelType');
const Transmission = require('../../models/transmission');
const Color = require('../../models/color');
const Owner = require('../../models/owner');
const ServiceGallery = require('../../models/serviceGallery'); //abhinav
const BusinessGallery = require('../../models/businessGallery');
const Variant = require('../../models/variant');
const ClaimBusiness = require('../../models/claimBusiness');
const Review = require('../../models/review');
const Battery = require('../../models/battery');
const BatteryBrand = require('../../models/batteryBrand');
const TyreSize = require('../../models/tyreSize');
const Booking = require('../../models/booking');
const Lead = require('../../models/lead');
const Service = require('../../models/service');
const Customization = require('../../models/customization');
const Collision = require('../../models/collision');
const Washing = require('../../models/washing');
const ProductCategory = require('../../models/productCategory');
const Product = require('../../models/product');
const ProductBrand = require('../../models/productBrand');
const ProductModel = require('../../models/productModel');
const BusinessProduct = require('../../models/businessProduct');
const LeadRemark = require('../../models/leadRemark');
const LeadGenRemark = require('../../models/leadGenRemark');
const OutBoundLead = require('../../models/outBoundLead');
const LeadStatus = require('../../models/leadStatus');
const Package = require('../../models/package');
const UserPackage = require('../../models/userPackage');
const PackageUsed = require('../../models/packageUsed');
const Management = require('../../models/management');
const LeadManagement = require('../../models/leadManagement');
const Address = require('../../models/address');
const Gallery = require('../../models/gallery');
const Coupon = require('../../models/coupon');
const Detailing = require('../../models/detailing');
const CouponUsed = require('../../models/couponUsed');
const Purchase = require('../../models/purchase');
const PurchaseReturn = require('../../models/purchaseReturn');
const PurchaseOrder = require('../../models/purchaseOrder');
const Tax = require('../../models/tax');
const BusinessVendor = require('../../models/businessVendor');
const JobInspection = require('../../models/jobInspection');
const ClubMember = require('../../models/clubMember');
const InsuranceCompany = require('../../models/insuranceCompany');
const LabourRate = require('../../models/labourRate');
const Point = require('../../models/point');
const QualityCheck = require('../../models/qualityCheck');
const Invoice = require('../../models/invoice');
const Expense = require('../../models/expense');
const Estimate = require('../../models/estimate');
const StockLogs = require('../../models/stockLogs');
// Vinay Model added
const VendorOrders = require('../../models/vendorOrders');

const TransactionLog = require('../../models/transactionLog');
const Statements = require('../../models/statements');

const RFQ = require('../../models/rfq');
const Quotation = require('../../models/quotation');
const BusinessPlan = require('../../models/businessPlan');
const Referral = require('../../models/referral');
const ManagementRole = require('../../models/managementRole');
const Location = require('../../models/location');
const BusinessSetting = require('../../models/businessSetting');
const ExpenseCategory = require('../../models/expenseCategory');
const ReviewPoint = require('../../models/reviewPoint');
const LeadGen = require('../../models/leadGen');
const SuitePlan = require('../../models/suitePlan');
const Sales = require('../../models/sales');
const Parchi = require('../../models/parchi');
const { updateMany } = require('../../models/user');
const { filter, rangeRight } = require('lodash');



var secret = config.secret;
var moment = require('moment-timezone');
var FCM = require('fcm-node');
//var webpush = require('web-push');
var redis = require('redis');
//var invNum = require('invoice-number');

/*webpush.setVapidDetails(
    'imchandankumar.24@gmail.com',
    config.publicKey,
    config.privateKey
);*/

const event = require('../../api/event');

var client = redis.createClient({ host: 'localhost', port: 6379 });

module.exports = {
    activityLog: async function (activity) {
        ActivityLog.create(activity).then(async function (log) { });
    },

    setBusinessUser: async function (business, user) {
        if (business != null && user != null) {
            var check = await BusinessUser.find({ business: business, user: user }).count().exec();
            if (check == 0) {
                BusinessUser.create({
                    business: business,
                    user: user,
                    created_at: new Date(),
                    upated_at: new Date(),
                })
            }
        }
        return true;
    },


    getUser: async function (data) {
        // console.log("\n getUser function is Called= " + data.contact_no + " Name = " + data.name)
        var userId = [];
        if (data.name != "" && data.contact_no != "") {
            var user = await User.findOne({ contact_no: data.contact_no, "account_info.type": "user" }).exec();
            if (user) {
                // console.log("User is already existed")
                return user._id
            }
            else {
                // console.log("User Create :Else")
                var name = data.name;
                var rand = Math.ceil((Math.random() * 100000) + 1);
                var id = mongoose.Types.ObjectId();

                var firstPart = (Math.random() * 46656) | 0;
                var secondPart = (Math.random() * 46656) | 0;
                firstPart = ("000" + firstPart.toString(36)).slice(-3);
                secondPart = ("000" + secondPart.toString(36)).slice(-3);
                var referral_code = firstPart.toUpperCase() + secondPart.toUpperCase();

                await User.create({
                    _id: id,
                    name: data.name,
                    rand: Math.floor((Math.random() * 100000) + 1),
                    username: shortid.generate(),
                    referral_code: referral_code,
                    geometry: [0, 0],
                    device: [],
                    otp: Math.floor(Math.random() * 90000) + 10000,
                    careager_cash: 0,
                    socialite: "",
                    optional_info: "",
                    business_info: "",
                    name: _.startCase(_.toLower(data.name)),
                    email: data.email,
                    optional_info: {},
                    business_info: {},
                    uuid: uuidv1(),
                    contact_no: data.contact_no,
                    uuid: uuidv1(),
                    account_info: {
                        type: "user",
                        status: "Complete"
                    },
                    address: {
                        country: "India",
                        timezone: "Asia/Kolkata",
                        location: ""
                    }
                }).then(async function (u) {
                    // console.log("User Created ")
                    // console.log("Returned Id = " + u._id)

                    userId.push({ id: u._id })
                    // event.signupSMS(u);
                    //event.otpSms(u);
                });

                // return id;
            }
            return userId[0].id;
        }
        else {
            // console.log("Returned False= ")
            return false;
        }
    },
    getCar: async function (data) {
        var rg = data.registration_no;
        var reg_no_copy = rg.replace(/ /g, '');
        var car = await Car.findOne({ registration_no: reg_no_copy, status: true }).exec();
        if (car) {
            return car._id
        }
        else {
            var variant = await Variant.findOne({ _id: data.variant }).select('-service_schedule').exec();
            if (variant) {
                var reg = await Car.find({ registration_no: reg_no_copy, status: true }).count().exec();
                if (reg == 0) {
                    var id = mongoose.Types.ObjectId();
                    // console.log(id)
                    await Car.create({
                        _id: id,
                        geometry: [
                            0,
                            0
                        ],
                        registration_no: reg_no_copy,
                        reg_no_copy: reg_no_copy,
                        title: variant.variant,
                        variant: variant._id,
                        _variant: variant.value,
                        automaker: variant.automaker,
                        _automaker: variant._automaker,
                        model: variant.model,
                        _model: variant._model,
                        segment: variant.segment,
                        user: data.user,
                        fuel_type: variant.specification.fuel_type,
                        transmission: variant.specification.type,
                        carId: Math.round(new Date() / 1000) + Math.round((Math.random() * 9999) + 1),
                        created_at: new Date(),
                        updated_at: new Date()
                    });

                    return id;
                }
                else {
                    return false;
                }
            }
        }
    },


    createMultiOffer: async function (data) {

        var expired_at = new Date(req.body.sDate);
        expired_at.setDate(expired_at.getDate() + parseInt(req.body.validity));

        // console.log(expired_at + " -- " + business + " -- " + req.body.name + " -- " + req.files[0].key + " -- " + req.body.description + " -- " + req.body.limit +" -- " + req.body.validity + " -- " + req.body.code + " -- " + req.body.category + " -- " + req.body.sDate + " -- " + req.body.featured + " -- " + req.body.featured)
        // req.body.business = business._id;
        req.body.business = business
        req.body.image = req.files[0].key;
        // req.body.geometry = business.geometry;
        // req.body.isCarEager = business.isCarEager;
        //Abhinav 
        req.body.name = data.name;
        req.body.description = data.description;
        req.body.code = data.code;
        req.body.limit = data.limit;

        req.body.start_date = new Date(data.sDate).toISOString()
        req.body.valid_till = expired_at
        req.body.end_date = expired_at
        req.body.featured = data.featured;
        req.body.publish = true;
        req.body.validity = parseInt(data.validity)
        //Abhinav
        req.body.discount = data.discount;
        req.body.created_at = new Date();
        req.body.updated_at = new Date();
        var ser = []

        if (data.category == "all") {
            ser = ['service', 'detailing', 'customization', 'collision']
        } else {
            ser = [req.body.category];
        }
        //WEBSITE
        // req.body.offer_details.category = req.body.category;
        // req.body.offer_details.description =req.body.type
        // req.body.offer_details.terms = ""
        // console.log("Length of Coupon = " + ser.length)
        for (i = 0; i < ser.length; i++) {

            req.body.category = ser[i];
            // console.log("Service " + ser[i])
            BusinessOffer.create(req.body).then(function (offer) {

                Coupon.create({
                    for: "category",
                    type: "percent",
                    label: offer.category,
                    usage_limit: offer.limit,
                    physical: false,
                    code: offer.code,
                    business: offer.business,
                    offer: offer._id,
                    discount: offer.discount,
                    // discount: 30,
                    start_date: new Date(req.body.sDate).toISOString(),
                    expired_at: expired_at.toISOString(),
                    created_at: new Date(offer.start_date),
                }).then(function (offer) {
                    // console.log("Offer Created")
                })

            });
        }
        // res.status(200).json({
        //     responseCode: 200,
        //     responseMessage: "Offer has been added",
        //     responseData: {
        //         // item: offer,
        //         category: ser

        //     }
        // });

        return ser;
    },

    getPackageDiscount: async function (data) {
        var discount = {};
        if (data.package) {
            if (data.claim == false) {
                var package = await UserPackage.findOne({ _id: data.package }).exec();
                if (package) {
                    if (package.status == true) {
                        if (package.car) {
                            var packageUsed = await PackageUsed.find({ package: data.package, user: package.user, label: data.service, car: data.car }).count().exec();
                        }
                        else {
                            var packageUsed = await PackageUsed.find({ package: data.package, user: package.user, label: data.service }).count().exec();
                        }
                        // console.log("Package Used = " + packageUsed)
                        var serverTime = moment.tz(new Date(), data.tz);

                        var bar = package.created_at;
                        bar.setDate(bar.getDate() + package.validity);
                        bar = moment.tz(bar, data.tz)
                        var baz = bar.diff(serverTime);
                        // console.log(baz)
                        if (baz > 0) {
                            package.discount.forEach(async function (dis) {
                                // console.log(dis);
                                if (dis.for == "category") {
                                    if (dis.label == data.category) {
                                        if (dis.type == "percent") {
                                            if (!packageDiscountOn.includes(data.service)) {
                                                discount = {
                                                    discount: dis.discount,
                                                    discount_type: "percent"
                                                }
                                            }
                                        }
                                        else {
                                            if (!packageDiscountOn.includes(data.service)) {
                                                discount = {
                                                    discount: dis.discount,
                                                    discount_type: "price"
                                                }
                                            }
                                        }
                                    }
                                }
                                //test
                                // var getDiscount = {
                                //     booking: booking._id,
                                //     package: booking.package,
                                //     car: booking.car,
                                //     category: req.body.type,
                                //     service: req.body.service,
                                //     claim: req.body.claim,
                                //     tz: req.headers['tz']
                                // };
                                else if (dis.for == "specific") {
                                    if (dis.label == data.service) {
                                        if (dis.type == "percent") {
                                            if (dis.limit > packageUsed) {
                                                packageDiscountOn.push(data.service)
                                                discount = {
                                                    discount: dis.discount,
                                                    discount_type: "percent"
                                                }
                                            }
                                        }
                                        else if (dis.type == "fixed") {
                                            if (dis.limit > packageUsed) {
                                                packageDiscountOn.push(data.service)
                                                discount = {
                                                    discount: dis.discount,
                                                    discount_type: "fixed"
                                                }
                                            }
                                        }
                                        else {
                                            if (dis.limit > packageUsed) {
                                                packageDiscountOn.push(data.service)
                                                discount = {
                                                    discount: dis.discount,
                                                    discount_type: "price"
                                                }
                                            }
                                        }
                                    }
                                }
                            });
                        }
                    }
                    else {
                        if (package.booking.equals(data.booking)) {
                            var packageUsed = await PackageUsed.find({ package: data.package, user: package.user, label: data.service, car: data.car }).count().exec();
                            var serverTime = moment.tz(new Date(), data.tz);
                            // console.log("Line Package 41183= " + packageUsed)
                            var bar = package.created_at;
                            bar.setDate(bar.getDate() + package.validity);
                            bar = moment.tz(bar, data.tz)
                            var baz = bar.diff(serverTime);
                            // console.log(baz);
                            if (baz > 0) {
                                package.discount.forEach(async function (dis) {
                                    if (dis.for == "category") {
                                        if (dis.label == data.category) {
                                            if (dis.type == "percent") {
                                                if (!packageDiscountOn.includes(data.service)) {
                                                    discount = {
                                                        discount: dis.discount,
                                                        discount_type: "percent"
                                                    }
                                                }
                                            }
                                            else {
                                                if (!packageDiscountOn.includes(data.service)) {
                                                    discount = {
                                                        discount: dis.discount,
                                                        discount_type: "price"
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    else if (dis.for == "specific") {
                                        if (dis.label == data.service) {
                                            if (dis.type == "percent") {
                                                if (dis.limit > packageUsed) {
                                                    packageDiscountOn.push(data.service)
                                                    discount = {
                                                        discount: dis.discount,
                                                        discount_type: "percent"
                                                    }
                                                }
                                            }
                                            else if (dis.type == "fixed") {
                                                if (dis.limit > packageUsed) {
                                                    packageDiscountOn.push(data.service)
                                                    discount = {
                                                        discount: dis.discount,
                                                        discount_type: "fixed"
                                                    }
                                                }
                                            }
                                            else {
                                                if (dis.limit > packageUsed) {
                                                    packageDiscountOn.push(data.service)
                                                    discount = {
                                                        discount: dis.discount,
                                                        discount_type: "price"
                                                    }
                                                }
                                            }
                                        }
                                    }
                                });
                            }
                        }
                    }
                }
            }
        }
        return discount;
    },
    packageDiscount: async function (data) {
        var labour_cost = data.labour_cost;
        var lc = data.labour_cost;
        var package = await UserPackage.findOne({ _id: data.package }).exec();
        if (data.claim == false) {
            if (package) {
                if (package.status == true) {
                    if (package.car) {
                        var packageUsed = await PackageUsed.find({ package: data.package, user: package.user, label: data.service, car: data.car }).count().exec();
                    }
                    else {
                        var packageUsed = await PackageUsed.find({ package: data.package, user: package.user, label: data.service }).count().exec();
                    }

                    var serverTime = moment.tz(new Date(), data.tz);

                    var bar = package.created_at;
                    bar.setDate(bar.getDate() + package.validity);
                    bar = moment.tz(bar, data.tz)
                    var baz = bar.diff(serverTime);

                    if (baz > 0) {
                        package.discount.forEach(async function (dis) {

                            if (dis.for == "category") {
                                if (dis.label == data.category) {
                                    if (dis.type == "percent") {
                                        if (!packageDiscountOn.includes(data.service)) {
                                            labour_cost = lc - lc * (dis.discount / 100);
                                        }
                                    }
                                    else if (dis.type == "fixed") {
                                        if (!packageDiscountOn.includes(data.service)) {
                                            labour_cost = lc - dis.discount

                                        }
                                    }
                                    else {
                                        if (!packageDiscountOn.includes(data.service)) {
                                            labour_cost = lc - lc * (dis.discount / 100);

                                        }
                                    }
                                }
                            }
                            else if (dis.for == "specific") {
                                if (dis.label == data.service) {
                                    if (dis.type == "percent") {
                                        if (dis.limit > packageUsed) {
                                            packageDiscountOn.push(data.service)
                                            labour_cost = lc - lc * (dis.discount / 100);

                                        }
                                    }
                                    else if (dis.type == "fixed") {
                                        if (dis.limit > packageUsed) {
                                            packageDiscountOn.push(data.service)
                                            labour_cost = dis.discount;
                                        }
                                    }
                                    else {
                                        if (dis.limit > packageUsed) {
                                            packageDiscountOn.push(data.service)
                                            labour_cost = lc - dis.discount;
                                        }
                                    }
                                }
                            }
                        });
                    }
                }
                else {
                    if (package.booking.equals(data.booking)) {
                        var packageUsed = await PackageUsed.find({ package: data.package, user: package.user, label: data.service, car: data.car }).count().exec();
                        var serverTime = moment.tz(new Date(), data.tz);

                        var bar = package.created_at;
                        bar.setDate(bar.getDate() + package.validity);
                        bar = moment.tz(bar, data.tz)
                        var baz = bar.diff(serverTime);

                        if (baz > 0) {
                            package.discount.forEach(async function (dis) {

                                if (dis.for == "category") {
                                    if (dis.label == cat) {
                                        if (dis.type == "percent") {
                                            if (!packageDiscountOn.includes(data.service)) {
                                                labour_cost = lc - lc * (dis.discount / 100);
                                            }
                                        }
                                        else if (dis.type == "fixed") {
                                            if (!packageDiscountOn.includes(data.service)) {
                                                labour_cost = lc - dis.discount

                                            }
                                        }
                                        else {
                                            if (!packageDiscountOn.includes(data.service)) {
                                                labour_cost = lc - lc * (dis.discount / 100);

                                            }
                                        }
                                    }
                                }
                                else if (dis.for == "specific") {
                                    if (dis.label == data.service) {
                                        if (dis.type == "percent") {
                                            if (dis.limit > packageUsed) {
                                                packageDiscountOn.push(data.service)
                                                labour_cost = lc - lc * (dis.discount / 100);

                                            }
                                        }
                                        else if (dis.type == "fixed") {
                                            if (dis.limit > packageUsed) {
                                                packageDiscountOn.push(data.service)
                                                labour_cost = dis.discount;
                                            }
                                        }
                                        else {
                                            if (dis.limit > packageUsed) {
                                                packageDiscountOn.push(data.service)
                                                labour_cost = lc - dis.discount;
                                            }
                                        }
                                    }
                                }
                            });
                        }
                    }
                }
            }
        }
        return labour_cost;
    },
    packageDeduction: async function (id) {
        var booking = await Booking.findById(id).exec();
        if (booking.package) {
            var packageUsed = [];
            var package = await UserPackage.findOne({ _id: booking.package, car: booking.car }).exec();
            if (package) {
                if (package.status == false) {
                    UserPackage.findOneAndUpdate({ _id: booking.package }, { "$set": { status: true } }, async function () { });
                }

                booking.services.forEach(async function (service) {
                    package.discount.forEach(async function (dis) {
                        if (dis.for == "specific") {
                            if (dis.label == service.service) {
                                if (dis.discount > 0) {
                                    packageUsed.push({
                                        package: booking.package,
                                        car: booking.car,
                                        user: booking.user,
                                        booking: booking._id,
                                        for: service.type,
                                        label: service.service,
                                        created_at: new Date(),
                                        updated_at: new Date()
                                    });
                                }
                            }
                        }
                        else if (dis.for == "category") {
                            if (dis.label == service.type) {
                                packageUsed.push({
                                    package: booking.package,
                                    car: booking.car,
                                    user: booking.user,
                                    booking: booking._id,
                                    for: service.type,
                                    label: service.type,
                                    created_at: new Date(),
                                    updated_at: new Date()
                                })
                            }
                        }
                    });
                });

                var packageUsed = _.uniqBy(packageUsed, function (o) {
                    return o.label;
                });

                packageUsed.forEach(async function (p) {
                    var checkUsedPackage = await PackageUsed.find({ package: p.package, booking: p.booking, label: p.label, }).count().exec();

                    if (checkUsedPackage == 0) {
                        PackageUsed.create({
                            package: p.package,
                            car: p.car,
                            user: p.user,
                            booking: p.booking,
                            for: p.for,
                            label: p.label,
                            created_at: p.created_at,
                            updated_at: p.updated_at
                        })
                    }
                })
            }
        }
    },

    stockEntryOldError: async function (purchase, product, business, vendor, loggedInDetails) {
        var part_no = product.part_no;
        part_no = part_no.replace(/,/g, ", ");
        part_no = part_no.toUpperCase();

        // var loggedInDetails = await User.findById(loggedIn).exec();
        // var vendor = await User.findById(vendorId).exec();

        var businessProduct = await BusinessProduct.findOne({ part_no: part_no, unit: product.unit, business: business }).sort({ updated_at: -1 }).exec();

        var margin_total = 0;
        if (businessProduct) {
            // console.log("product.unit_price = " + product.unit_price)
            // console.log("product.unit_price = " + part_no)
            // console.log("product.unit = " + product.unit)
            // product.unit  //"price.purchase_price": parseFloat(product.unit_price),
            var checkProducutPrice = await BusinessProduct.findOne({ part_no: part_no, unit: product.unit, business: business }).sort({ updated_at: -1 }).exec();
            // if (businessProduct.price.rate == product.rate) {
            if (checkProducutPrice) {

                // console.log("Old rate Same with new Item")
                var tax = [];
                var tax_info = await Tax.findOne({ rate: parseFloat(product.tax_rate), type: "GST" }).exec();
                var rate = parseFloat(product.rate);
                var amount = parseFloat(product.rate);
                var tax_rate = tax_info.detail;
                var base = amount

                /*
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
                }
*/
                var tax_details = {
                    tax: tax_info.tax,
                    rate: tax_info.rate,
                    amount: amount,
                    detail: tax
                }

                var totalSkuStock = 0
                var availSkuStock = 0
                var sku = {}
                // console.log("businessProduct.sku.purchase= " + businessProduct.sku.purchase + " ,purchase= " + purchase);
                // && sku.purchase == purchase
                var checkSku = _.filter(businessProduct.sku, sku => sku.sku == product.sku);
                // return checkSku;
                // console.log("checkSku = " + checkSku)
                // console.log("SKU " + checkSku.length)

                // Commented By Abhinav To Prevent SKU Entries more usefull
                if (checkSku.length > 0) {
                    // console.log("AvaliableStock : " + parseFloat(checkSku[0].available) + "\n Total stock :" + parseFloat(checkSku[0].total) + "/SKU : " + product.sku)

                    totalSkuStock = parseFloat(product.stock) + parseFloat(checkSku[0].total);
                    availSkuStock = parseFloat(product.stock) + parseFloat(checkSku[0].available);
                    // console.log("835 product.stock " + product.stock)
                    // console.log("836 checkSku[0].total " + checkSku[0].total, " checkSku[0].available=  " + checkSku[0].available)
                    // console.log("837 totalSkuStock " + totalSkuStock + "totalSkuStock " + availSkuStock)

                    sku = {
                        sku: product.sku,
                        total: totalSkuStock,
                        available: availSkuStock,
                        cretaed_at: checkSku[0].cretaed_at,
                        updated_at: new Date(),
                        // purchase: purchase,
                    }
                }
                else {
                    //
                    sku = {
                        sku: product.sku,
                        total: product.stock,
                        available: product.stock,
                        // purchase: purchase,

                        created_at: new Date(),
                    }
                }

                // var stockTotal = 0
                // var stockAvailable = 0
                // vinay stocks
                // console.log("Stock entry called....")
                // if (businessProduct.stock.total || businessProduct.stock.total > 0) {
                // console.log("Product stock total....", businessProduct.stock.total, product.stock, businessProduct.stock.total)

                //     if (businessProduct.stock.total != product.stock) {   //issue found here 
                //         stockTotal = parseFloat(product.stock)
                //         stockAvailable = parseFloat(product.stock) - parseFloat(businessProduct.stock.consumed)
                // console.log("When new Quantity mismatch with avaiable stock quantity")
                //     } else {
                //         stockTotal = parseFloat(businessProduct.stock.total)
                //         stockAvailable = parseFloat(businessProduct.stock.available)
                // console.log(" else When new Quantity match with avaiable stock quantity")

                //     }


                // } else {
                //Commented by Abhinav Tyagi 05-04-21
                // console.log("876 businessProduct.stock.total = " + parseFloat(businessProduct.stock.total) + ". product.stock= " + parseFloat(product.stock) + " , businessProduct.stock.available = " + parseFloat(businessProduct.stock.available))
                var stockTotal = parseFloat(businessProduct.stock.total) + parseFloat(product.stock);
                var stockAvailable = parseFloat(businessProduct.stock.available) + parseFloat(product.stock);
                // console.log("879 stockTotal= " + stockTotal + " , stockAvailable= " + stockAvailable)
                // }
                // console.log("895------------")
                var list_type = [];
                list_type = _.concat(businessProduct.list_type, "Offline");
                // console.log("898------------")

                list_type = _.uniq(list_type);
                // console.log("895------------")

                var purchases = [];
                purchases = _.concat(businessProduct.purchases, purchase);
                // console.log("905------------")

                purchases = _.uniq(purchases);
                // console.log("908------------")

              /**/  var price = {
                    mrp: product.mrp,
                    rate: product.rate,
                    amount: amount,
                    unit_price: product.unit_price,
                    sell_price: amount,
                    margin: product.margin,
                    margin_total: margin_total,
                }
                // var price = {
                //     mrp: product.mrp,
                //     rate: product.rate,
                //     // discount: discount,
                //     // discount_type: discount_type,
                //     // isDiscount: isDiscount,
                //     amount: amount,
                //     sell_price: amount + parseFloat(margin),
                //     // margin_total: margin_total,
                //     // margin: margin,
                //     // unit_price: purchase_price
                //     // tax_amount: _.sumBy(tax, x => x.amount),
                //     base: base,
                //     unit_price: parseFloat(amount)
                // }
                var data = {
                    purchase: purchase,
                    purchases: purchases,
                    business: business,
                    part_no: part_no,
                    // oem: product.oem,
                    // oem: product.oes,
                    part_category: product.part_category,
                    stock: {
                        // total: stockTotal,
                        // consumed: businessProduct.stock.consumed,
                        // available: stockAvailable,
                        total: parseFloat(businessProduct.stock.total) + parseFloat(product.stock),
                        consumed: businessProduct.stock.consumed,
                        available: parseFloat(businessProduct.stock.available) + parseFloat(product.stock),
                    },
                    // sku: sku,
                    title: product.title,
                    // price: price,
                    // amount_is_tax: "inclusive",
                    // amount_is_tax: product.amount_is_tax,
                    // tax: tax_info.tax,
                    // tax_rate: tax_info.rate,
                    // tax_type: "GST",
                    unit: product.unit,
                    // quantity: product.quantity,
                    // quantity: parseFloat(businessProduct.stock.total),
                    quantity: stockTotal,
                    // tax_info: tax_details,
                    // list_type: list_type,
                    // logs: logs,
                    // oldPrice: oldPrice,
                    updated_at: new Date()
                };
                // console.log("972 sku pull = " + product.sku)

                await BusinessProduct.findOneAndUpdate({ _id: businessProduct._id, business: business }, { $set: data }, { new: true }, async function (err, doc) {
                    if (err) {
                        res.status(400).json({
                            responseCode: 400,
                            responseMessage: "Server Error",
                            responseData: err,
                        });
                    } else {

                        // console.log("983 sku pull = " + product.sku)

                        BusinessProduct.findOneAndUpdate({ _id: businessProduct._id, business: business }, { "$pull": { "sku": { "sku": product.sku } } }, { new: true }, async function () {
                            // , logs: logs
                            // console.log("1011 sku pull = " + product.sku)

                            BusinessProduct.findOneAndUpdate({ _id: businessProduct._id, business: business }, { $push: { sku: sku } }, { new: true }, async function () {
                                // console.log("1014 sku pull = " + product.sku)

                                var activity = {
                                    vendor_name: vendor.name,
                                    quantity: product.stock,
                                    unit_price: product.unit_price,
                                    price: product.amount,
                                    received_by: loggedInDetails.name,
                                    purchase: purchase,
                                    business: business,
                                    activity: "Purchased",
                                    // remark: remark,
                                    created_at: new Date()
                                };
                                // console.log("Product activity", products[p].product, activity)
                                // console.log("1005")
                                await fun.productLog(businessProduct._id, activity);
                                // console.log("1007")


                            });
                        });
                    }
                    // console.log("42929 sku push  = " + sku.sku)

                });
                return true;
            }
            else if (!checkProducutPrice) {
                // console.log("Old rate Not Same with new Item")
                var tax = [];
                var tax_info = await Tax.findOne({ tax: product.tax }).exec();
                // var rate = parseFloat(product.unit_base_price;
                var amount = parseFloat(product.unit_base_price);
                var tax_rate = tax_info.detail;
                var base = amount
                // if(product.margin){
                //     var margin = product.margin;
                //     margin = margin.toString();
                //     if(margin.indexOf("%")>=0)
                //     {
                //         margin = parseFloat(margin);
                //         if(!isNaN(margin) && margin>0)
                //         {
                //             margin_total = amount*(margin/100);
                //             amount = amount+margin_total
                //         }
                //     }
                //     else
                //     {
                //         margin_total = parseFloat(margin);
                //         amount = amount+margin_total
                //     }
                // }

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
                /*
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
                                  }
                  */
                // console.log("Amount Internal Calvuation = " + amount)
                // console.log("Tax Amount Internal Calvuation = ", (amount - base))
                var tax_details = {
                    tax: tax_info.tax,
                    rate: tax_info.rate,
                    // amount: product.unit_price,
                    amount: amount,
                    // amount: amount,
                    detail: tax
                }


                var sku = {
                    sku: product.sku,
                    total: product.stock,
                    available: product.stock,
                    created_at: new Date()
                };

                var stock = {
                    total: product.stock,
                    consumed: 0,
                    available: product.stock,
                };

                var list_type = [];
                // console.log("1135------------")

                list_type = _.concat(businessProduct.list_type, "Offline");
                // console.log("1138------------")

                list_type = _.uniq(list_type);
                // console.log("1141------------")

                var purchases = [];
                purchases = _.concat(businessProduct.purchases, purchase);
                // console.log("1145------------")

                purchases = _.uniq(purchases);
                // console.log("1148------------")

                //Abhinav Tyagu
                var log_details = {
                    vendor_name: vendor.name,
                    quantity: product.stock,
                    unit_price: product.unit_price,
                    price: product.mrp,
                    received_by: loggedInDetails.name,
                    purchase: purchase,
                    business: business,
                    created_at: new Date(),

                }
                var data = {
                    purchase: purchase,
                    // purchases: purchases,//
                    // purchases: purchase,
                    business: business,
                    product: businessProduct.product,
                    product_id: businessProduct.product_id,
                    part_no: businessProduct.part_no,
                    product_brand: businessProduct.product_brand,
                    product_model: businessProduct.product_model,
                    // models: businessProduct.model,
                    category: businessProduct.category,
                    subcategory: businessProduct.subcategory,
                    title: product.title,
                    short_description: businessProduct.short_description,
                    long_description: businessProduct.long_description,
                    thumbnail: businessProduct.thumbnail,
                    specification: businessProduct.specification,
                    hsn_sac: businessProduct.hsn_sac,
                    unit: businessProduct.unit,
                    quantity: product.stock,
                    models: businessProduct.models,
                    stock: stock,
                    list_type: list_type,
                    part_category: businessProduct.part_category,
                    sku: sku,
                    price: {
                        base: parseFloat(product.unit_base_price),
                        mrp: parseFloat(product.mrp),
                        rate: parseFloat(product.unit_base_price) + parseFloat(product.margin),
                        purchase_price: parseFloat(product.unit_price),
                        amount: parseFloat(product.unit_price) + parseFloat(product.margin),
                        sell_price: parseFloat(product.sell_price),
                        margin: parseFloat(product.margin),
                        discount: parseFloat(product.discount),
                        discount_type: product.discount_type,
                        isDiscount: product.isDiscount,
                        tax_amount: parseFloat(product.unit_price) - parseFloat(product.unit_base_price),
                        // unit_price: product.unit_price,
                        // margin_total: margin_total,
                    },
                    // amount_is_tax: "inclusive",
                    amount_is_tax: product.amount_is_tax,
                    tax: tax_info.tax,
                    tax_rate: tax_info.rate,
                    tax_type: tax_info.tax.split('% ').pop(),
                    tax_info: tax_details,
                    // logs: log_details,
                    created_at: new Date(),
                    updated_at: new Date()
                };

                await BusinessProduct.create(data).then(async function (bp) {
                    // BusinessProduct.findOneAndUpdate({ _id: businessProduct._id, business: business }, { $push: { sku: sku } }, { new: true }, async function () {
                    var activity = {
                        vendor_name: vendor.name,
                        quantity: product.stock,
                        unit_price: product.unit_price,
                        price: product.mrp,
                        received_by: loggedInDetails.name,
                        purchase: purchase,
                        business: business,
                        activity: "Purchased",
                        created_at: new Date()
                    };
                    // console.log("Product activity", products[p].product, activity)
                    fun.productLog(bp._id, activity);

                    // });


                });
                // }
                return true;

            } else {
                return false;
            }
            /*else {
                  // console.log("New Business Product Entry")
                  var tax = [];
                  var tax_info = await Tax.findOne({ rate: parseFloat(product.tax_rate), type: "GST" }).exec();
                  var rate = parseFloat(product.rate);
                  var amount = parseFloat(product.rate);
                  var tax_rate = tax_info.detail;
                  var base = amount
                  // if(product.margin){
                  //     var margin = product.margin;
                  //     margin = margin.toString();
                  //     if(margin.indexOf("%")>=0)
                  //     {
                  //         margin = parseFloat(margin);
                  //         if(!isNaN(margin) && margin>0)
                  //         {
                  //             margin_total = amount*(margin/100);
                  //             amount = amount+margin_total
                  //         }
                  //     }
                  //     else
                  //     {
                  //         margin_total = parseFloat(margin);
                  //         amount = amount+margin_total
                  //     }
                  // }     
      
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
                  }
      
                  var tax_details = {
                      tax: tax_info.tax,
                      rate: tax_info.rate,
                      amount: amount,
                      detail: tax
                  }
      
                  var sku = {
                      sku: product.sku,
                      total: product.stock,
                      available: product.stock,
                      created_at: new Date()
                  };
      
                  var stock = {
                      total: product.stock,
                      consumed: 0,
                      available: product.stock,
                  };
      
                  var list_type = [];
                  list_type.push("Offline");
      
                  var purchases = [];
                  purchases.push(purchase);
      
                  var log_details = {
                      vendor_name: vendor.name,
                      quantity: product.stock,
                      unit_price: product.unit_price,
                      price: product.mrp,
                      received_by: loggedInDetails.name,
                      purchase: purchase,
                      business: business,
                      created_at: new Date(),
                  }
      
                  var data = {
                      purchase: purchase,
                      purchases: purchases,
                      business: business,
                      product: null,
                      product_id: Math.round(+new Date() / 1000) + Math.round((Math.random() * 9999) + 1),
                      part_no: part_no,
                      product_brand: null,
                      product_model: null,
                      model: null,
                      category: null,
                      subcategory: null,
                      title: product.title,
                      short_description: "",
                      long_description: "",
                      thumbnail: "",
                      specification: "",
                      hsn_sac: product.hsn_sac,
                      quantity: product.stock,
                      unit: product.unit,
                      models: product.models,
                      stock: stock,
                      sku: sku,
                      list_type: list_type,
                      price: {
                          mrp: product.mrp,
                          rate: product.rate,
                          amount: amount,
                          sell_price: amount,
                          margin_total: margin_total,
                          margin: product.margin,
                          unit_price: product.unit_price
                      },
                      // amount_is_tax: "inclusive",
                      amount_is_tax: product.amount_is_tax,
                      tax: tax_info.tax,
                      tax_rate: tax_info.rate,
                      tax_type: "GST",
                      oem: product.oem,
                      oes: product.oes,
                      tax_info: tax_details,
                      list_type: list_type,
                      // logs: log_details,
                      created_at: new Date(),
                      updated_at: new Date()
                  };
      
                  BusinessProduct.create(data).then(async function (bp) {
                      Purchase.findOneAndUpdate({ _id: purchase, items: { $elemMatch: { part_no: product.part_no } } }, { $set: { "items.$.product": bp._id } }, { new: false }, async function (err, doc) {
                          if (err) {
                              // console.log(err)
                          }
                          else {
                              // console.log(bp._id)
                              var activity = {
                                  vendor_name: vendor.name,
                                  quantity: product.stock,
                                  unit_price: product.unit_price,
                                  price: product.mrp,
                                  received_by: loggedInDetails.name,
                                  purchase: purchase,
                                  business: business,
                                  activity: "Purchased",
                                  created_at: new Date()
                              };
                              // console.log("Product activity", products[p].product, activity)
                              fun.productLog(bp._id, activity);
                              return true;
                          }
                      });
                      //by Abhinav 05-04-21
                  });
      
              }
              */
        }
    },
    stockEntryWorking07_11_21: async function (purchase, product, business, vendor, loggedInDetails) {
        var part_no = product.part_no;
        part_no = part_no.replace(/,/g, ", ");
        part_no = part_no.toUpperCase();

        // var loggedInDetails = await User.findById(loggedIn).exec();
        // var vendor = await User.findById(vendorId).exec();
        // console.log("Part No " + part_no)
        // console.log("product.unit " + product.unit)
        // unit: product.unit,
        var businessProduct = await BusinessProduct.findOne({ $or: [{ part_no: part_no }, { title: product.title }], business: business }).sort({ updated_at: -1 }).exec();
        var margin_total = 0;
        if (businessProduct) {
            // console.log("Product Exists = ")
            //console.log("product.unit_price = " + product.unit_price)
            // console.log("product.part_no = " + part_no)
            // console.log("product.unit = " + product.unit)
            // product.unit
            var floor = Math.floor(product.unit_price);
            var ceil = Math.ceil(product.unit_price);
            // console.log("Floor " + floor)
            // console.log("ceil " + ceil)
            // console.log("purchase_price " + req.body.purchase_price)
            // 'price.purchase_price': { $gte: floor, $lte: ceil },
            var checkProducutPrice = await BusinessProduct.findOne({ part_no: part_no, unit: product.unit, "price.purchase_price": { $gte: floor, $lte: ceil }, business: business }).sort({ updated_at: -1 }).exec();
            // if (businessProduct.price.rate == product.rate) {
            if (checkProducutPrice) {

                //  console.log("Old rate Same with new Item")
                var tax = [];
                var tax_info = await Tax.findOne({ rate: parseFloat(product.tax_rate), type: "GST" }).exec();
                var rate = parseFloat(product.rate);
                var amount = parseFloat(product.rate);
                var tax_rate = tax_info.detail;
                var base = amount

                /*
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
                }
*/
                var tax_details = {
                    tax: tax_info.tax,
                    rate: tax_info.rate,
                    amount: amount,
                    detail: tax
                }

                var totalSkuStock = 0
                var availSkuStock = 0
                var sku = {}
                // console.log("businessProduct.sku.purchase= " + businessProduct.sku.purchase + " ,purchase= " + purchase);
                // && sku.purchase == purchase
                var checkSku = _.filter(businessProduct.sku, sku => sku.sku == product.sku);
                // return checkSku;
                // console.log("checkSku = " + checkSku)
                // console.log("SKU " + checkSku.length)

                // Commented By Abhinav To Prevent SKU Entries more usefull
                if (checkSku.length > 0) {
                    // console.log("AvaliableStock : " + parseFloat(checkSku[0].available) + "\n Total stock :" + parseFloat(checkSku[0].total) + "/SKU : " + product.sku)

                    totalSkuStock = parseFloat(product.stock) + parseFloat(checkSku[0].total);
                    availSkuStock = parseFloat(product.stock) + parseFloat(checkSku[0].available);
                    // console.log("835 product.stock " + product.stock)
                    // console.log("836 checkSku[0].total " + checkSku[0].total, " checkSku[0].available=  " + checkSku[0].available)
                    // console.log("837 totalSkuStock " + totalSkuStock + "totalSkuStock " + availSkuStock)

                    sku = {
                        sku: product.sku,
                        total: totalSkuStock,
                        available: availSkuStock,
                        cretaed_at: checkSku[0].cretaed_at,
                        updated_at: new Date(),
                        // purchase: purchase,
                    }
                }
                else {
                    //
                    sku = {
                        sku: product.sku,
                        total: product.stock,
                        available: product.stock,
                        // purchase: purchase,

                        created_at: new Date(),
                    }
                }
                // console.log("876 businessProduct.stock.total = " + parseFloat(businessProduct.stock.total) + ". product.stock= " + parseFloat(product.stock) + " , businessProduct.stock.available = " + parseFloat(businessProduct.stock.available))
                var stockTotal = parseFloat(businessProduct.stock.total) + parseFloat(product.stock);
                var stockAvailable = parseFloat(businessProduct.stock.available) + parseFloat(product.stock);
                // console.log("879 stockTotal= " + stockTotal + " , stockAvailable= " + stockAvailable)
                // }
                // console.log("895------------")
                var list_type = [];
                list_type = _.concat(businessProduct.list_type, "Offline");
                // console.log("898------------")

                list_type = _.uniq(list_type);
                // console.log("895------------")

                var purchases = [];
                // console.log("businessProduct.purchases[0]=  " + businessProduct.purchases[0])
                // console.log("purchase=  " + purchase)
                purchases = _.concat(businessProduct.purchases, purchase);
                // console.log("905------------")

                purchases = _.uniq(purchases);
                // console.log("908------------")

                // var price = {
                //     mrp: product.mrp,
                //     rate: product.rate,
                //     // discount: discount,
                //     // discount_type: discount_type,
                //     // isDiscount: isDiscount,
                //     amount: amount,
                //     sell_price: amount + parseFloat(margin),
                //     // margin_total: margin_total,
                //     // margin: margin,
                //     // unit_price: purchase_price
                //     // tax_amount: _.sumBy(tax, x => x.amount),
                //     base: base,
                //     unit_price: parseFloat(amount)
                // }
                // var base = parseFloat(this.createItemForm.get('base_price').value);
                // var margin = parseFloat(this.createItemForm.get('margin').value);

                if (product.margin) {
                    var margin = parseFloat(product.margin);
                    margin = margin.toString();
                    if (margin.indexOf("%") >= 0) {
                        margin = parseFloat(margin);
                        if (!isNaN(margin) && margin > 0) {
                            margin_total = businessProduct.price.base * (margin / 100);
                            amount = amount + margin_total
                        }
                    }
                    else {
                        margin_total = parseFloat(margin);
                        amount = amount + margin_total
                    }
                }
                var total_amount = parseFloat(businessProduct.price.base) + parseFloat(margin_total);
                // console.log("Total Amountn = " + total_amount)
                var tax_on_amount = total_amount;
                if (tax_rate.length > 0) {
                    for (var r = 0; r < tax_rate.length; r++) {
                        if (tax_rate[r].rate != tax_info.rate) {
                            var t = tax_on_amount * (tax_rate[r].rate / 100);
                            total_amount = total_amount + t;
                        }
                        else {
                            var t = tax_on_amount * (tax_info.rate / 100);
                            total_amount = total_amount + t;
                        }
                    }
                }

                var data = {
                    purchase: purchase,
                    purchases: purchases,
                    business: business,
                    part_no: part_no,
                    // oem: product.oem,
                    // oem: product.oes,
                    part_category: product.part_category,
                    stock: {
                        // total: stockTotal,
                        // consumed: businessProduct.stock.consumed,
                        // available: stockAvailable,
                        total: parseFloat(businessProduct.stock.total) + parseFloat(product.stock),
                        consumed: businessProduct.stock.consumed,
                        available: parseFloat(businessProduct.stock.available) + parseFloat(product.stock),
                    },
                    // sku: sku,
                    title: product.title,
                    // product.unit
                    "price.rate": product.rate,
                    "price.sell_price": product.sell_price,
                    // "price.margin_total": product.margin,
                    "price.margin": product.margin,
                    "price.amount": parseFloat(total_amount).toFixed(2),
                    // price: price,
                    // amount_is_tax: "inclusive",
                    // amount_is_tax: product.amount_is_tax,
                    // tax: tax_info.tax,
                    // tax_rate: tax_info.rate,
                    // tax_type: "GST",
                    unit: product.unit,
                    // quantity: product.quantity,
                    // quantity: parseFloat(businessProduct.stock.total),
                    quantity: stockTotal,
                    // tax_info: tax_details,
                    // list_type: list_type,
                    // logs: logs,
                    // oldPrice: oldPrice,
                    updated_at: new Date()
                };
                // console.log("972 sku pull = " + product.sku)

                await BusinessProduct.findOneAndUpdate({ _id: businessProduct._id, business: business }, { $set: data }, { new: true }, async function (err, doc) {
                    if (err) {
                        // console.log("Error ")
                        return false;
                        // res.status(400).json({
                        //     responseCode: 400,
                        //     responseMessage: "Server Error",
                        //     responseData: err,
                        // });
                    } else {

                        // console.log("983 sku pull = " + product.sku)

                        await BusinessProduct.findOneAndUpdate({ _id: businessProduct._id, business: business }, { "$pull": { "sku": { "sku": product.sku } } }, { new: true }, async function (err, productData) {
                            // , logs: logs
                            // console.log("1011 sku pull = " + productData.part_no)
                            var logs = []
                            if (productData.logs) {
                                logs = productData.logs;
                            }
                            logs.push({
                                vendor_name: vendor.name,
                                quantity: product.stock,
                                unit_price: product.unit_price,
                                price: product.amount,
                                received_by: loggedInDetails.name,
                                purchase: purchase,
                                business: business,
                                activity: "Purchased",
                                type: 'Purchased',
                                created_at: new Date()
                            });

                            await BusinessProduct.findOneAndUpdate({ _id: businessProduct._id, business: business }, { $push: { sku: sku }, $set: { logs: logs } }, { new: true }, async function () {


                            });
                        });
                        var activity = {
                            vendor_name: vendor.name,
                            quantity: product.stock,
                            unit_price: product.unit_price,
                            price: product.amount,
                            received_by: loggedInDetails.name,
                            purchase: purchase,
                            business: business,
                            activity: "Purchased",
                            created_at: new Date()
                        };
                        // await fun.productLog(businessProduct._id, activity);
                    }
                    // console.log("42929 sku push  = " + sku.sku)

                });
                return true;
            }
            else {
                // console.log("Old rate Not Same with new Item")
                var tax = [];
                var tax_info = await Tax.findOne({ tax: product.tax }).exec();
                // var rate = parseFloat(product.unit_base_price;
                var amount = parseFloat(product.unit_base_price);
                var tax_rate = tax_info.detail;
                var base = amount
                // if(product.margin){
                //     var margin = product.margin;
                //     margin = margin.toString();
                //     if(margin.indexOf("%")>=0)
                //     {
                //         margin = parseFloat(margin);
                //         if(!isNaN(margin) && margin>0)
                //         {
                //             margin_total = amount*(margin/100);
                //             amount = amount+margin_total
                //         }
                //     }
                //     else
                //     {
                //         margin_total = parseFloat(margin);
                //         amount = amount+margin_total
                //     }
                // }

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
                /*
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
                                  }
                  */
                // console.log("Amount Internal Calvuation = " + amount)
                // console.log("Tax Amount Internal Calvuation = ", (amount - base))
                var tax_details = {
                    tax: tax_info.tax,
                    rate: tax_info.rate,
                    // amount: product.unit_price,
                    amount: amount,
                    // amount: amount,
                    detail: tax
                }


                var sku = {
                    sku: product.sku,
                    total: product.stock,
                    available: product.stock,
                    created_at: new Date()
                };

                var stock = {
                    total: product.stock,
                    consumed: 0,
                    available: product.stock,
                };

                var list_type = [];
                // console.log("1135------------")

                list_type = _.concat(businessProduct.list_type, "Offline");
                // console.log("1138------------")

                list_type = _.uniq(list_type);
                // console.log("1141------------")

                var purchases = [];
                // console.log("businessProduct.purchases[0]=  " + businessProduct.purchases[0])
                // console.log("purchase=  " + purchase)
                purchases = _.concat(businessProduct.purchases, purchase);
                // console.log("1145------------")

                purchases = _.uniq(purchases);
                // console.log("1148------------")

                //Abhinav Tyagi
                var logs = []
                var log_details = {
                    vendor_name: vendor.name,
                    quantity: product.stock,
                    unit_price: product.unit_price,
                    price: product.mrp,
                    received_by: loggedInDetails.name,
                    purchase: purchase,
                    business: business,
                    activity: "Purchased",
                    type: 'Purchased',
                    created_at: new Date()

                }
                logs.push(log_details);

                var data = {
                    purchase: purchase,
                    // purchases: purchases,
                    purchases: purchase,
                    business: business,
                    product: businessProduct.product,
                    product_id: businessProduct.product_id,
                    part_no: businessProduct.part_no,
                    product_brand: businessProduct.product_brand,
                    product_model: businessProduct.product_model,
                    // models: businessProduct.model,
                    category: businessProduct.category,
                    subcategory: businessProduct.subcategory,
                    title: product.title,
                    short_description: businessProduct.short_description,
                    long_description: businessProduct.long_description,
                    thumbnail: businessProduct.thumbnail,
                    specification: businessProduct.specification,
                    hsn_sac: businessProduct.hsn_sac,
                    unit: businessProduct.unit,
                    quantity: product.stock,
                    models: businessProduct.models,
                    stock: stock,
                    list_type: list_type,
                    part_category: businessProduct.part_category,
                    sku: sku,
                    price: {
                        base: parseFloat(product.unit_base_price),
                        mrp: parseFloat(product.mrp),
                        rate: parseFloat(product.unit_base_price) + parseFloat(product.margin),
                        purchase_price: parseFloat(product.unit_price),
                        amount: parseFloat(product.unit_price) + parseFloat(product.margin),
                        sell_price: parseFloat(product.sell_price),
                        margin: parseFloat(product.margin),
                        discount: parseFloat(product.discount),
                        discount_type: product.discount_type,
                        isDiscount: product.isDiscount,
                        tax_amount: parseFloat(product.unit_price) - parseFloat(product.unit_base_price),
                        // unit_price: product.unit_price,
                        // margin_total: margin_total,
                    },
                    // amount_is_tax: "inclusive",
                    amount_is_tax: product.amount_is_tax,
                    tax: tax_info.tax,
                    tax_rate: tax_info.rate,
                    tax_type: tax_info.tax.split('% ').pop(),
                    tax_info: tax_details,
                    // logs: log_details,
                    logs: logs,
                    created_at: new Date(),
                    updated_at: new Date()
                };

                await BusinessProduct.create(data).then(async function (bp) {
                    // BusinessProduct.findOneAndUpdate({ _id: businessProduct._id, business: business }, { $push: { sku: sku } }, { new: true }, async function () {
                    var activity = {
                        vendor_name: vendor.name,
                        quantity: product.stock,
                        unit_price: product.unit_price,
                        price: product.mrp,
                        received_by: loggedInDetails.name,
                        purchase: purchase,
                        business: business,
                        activity: "Purchased",
                        created_at: new Date()
                    };
                    // console.log("Product activity", products[p].product, activity)
                    // await fun.productLog(bp._id, activity);

                    // });


                });
            }
            return true;

        }
        else {
            //  console.log("Product Not Found")
            // return false;

            // console.log("Old rate Not Same with new Item")
            var tax = [];
            var tax_info = await Tax.findOne({ tax: product.tax }).exec();
            // var rate = parseFloat(product.unit_base_price;
            var base = parseFloat(product.unit_base_price);
            var amount = parseFloat(product.unit_base_price);
            var tax_rate = tax_info.detail;
            var base = amount
            // product.margin = 100
            // if (product.margin) {
            //     var margin = product.margin;
            //     margin = margin.toString();
            //     if (margin.indexOf("%") >= 0) {
            //         margin = parseFloat(margin);
            //         if (!isNaN(margin) && margin > 0) {
            //             margin_total = amount * (margin / 100);
            //             amount = amount + margin_total
            //         }
            //     }
            //     else {
            //         margin_total = parseFloat(margin);
            //         amount = amount + margin_total
            //     }
            // }

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
            /*
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
                              }
              */
            // console.log("Amount Internal Calvuation = " + amount)
            // console.log("Tax Amount Internal Calvuation = ", (amount - base))
            var tax_details = {
                tax: tax_info.tax,
                rate: tax_info.rate,
                // amount: product.unit_price,
                amount: amount,
                // amount: amount,
                detail: tax
            }


            var sku = {
                sku: '',
                total: product.stock,
                available: product.stock,
                created_at: new Date()
            };

            var stock = {
                total: product.stock,
                consumed: 0,
                available: product.stock,
            };


            var list_type = [];
            list_type.push("Offline");

            var purchases = [];
            purchases.push(purchase);

            // console.log("1148------------")

            //Abhinav Tyagu
            var logs = []
            var log_details = {
                vendor_name: vendor.name,
                quantity: product.stock,
                unit_price: product.unit_price,
                price: product.mrp,
                received_by: loggedInDetails.name,
                purchase: purchase,
                business: business,
                activity: "Purchased",
                type: 'Purchased',
                created_at: new Date()

            }
            logs.push(log_details);
            var data = {
                purchase: purchase,
                purchases: purchases,

                business: business,
                product: null,
                product_id: Math.round(+new Date() / 1000) + Math.round((Math.random() * 9999) + 1),
                part_no: part_no,
                product_brand: null,
                product_model: null,
                // models: businessProduct.model,
                category: null,
                subcategory: null,
                title: product.title,
                short_description: "",
                long_description: "",
                thumbnail: "",
                specification: "",
                hsn_sac: product.hsn_sac,
                unit: product.unit,
                quantity: product.stock,
                models: product.models,
                stock: stock,
                // part_category
                list_type: list_type,
                part_category: 'OEM',
                sku: sku,
                price: {
                    base: parseFloat(base),
                    mrp: parseFloat(product.mrp),
                    rate: base + parseFloat(product.margin),
                    purchase_price: amount,
                    amount: amount + parseFloat(product.margin),
                    sell_price: base + parseFloat(product.margin),
                    margin: parseFloat(product.margin),
                    discount: 0,
                    discount_type: '',
                    isDiscount: false,
                    tax_amount: amount - base,
                    // unit_price: product.unit_price,
                    // margin_total: margin_total,
                },
                // amount_is_tax: "inclusive",
                amount_is_tax: product.amount_is_tax,
                tax: tax_info.tax,
                tax_rate: tax_info.rate,
                tax_type: tax_info.tax.split('% ').pop(),
                tax_info: tax_details,
                logs: logs,
                created_at: new Date(),
                updated_at: new Date()
            };

            await BusinessProduct.create(data).then(async function (bp) {
                var activity = {
                    vendor_name: vendor.name,
                    quantity: product.stock,
                    unit_price: product.unit_price,
                    price: product.mrp,
                    received_by: loggedInDetails.name,
                    purchase: purchase,
                    business: business,
                    activity: "Purchased",
                    created_at: new Date()
                };
                // console.log("Product activity", products[p].product, activity)
                fun.productLog(bp._id, activity);

                // });


            });
            return true;
        }

        /*else {
              // console.log("New Business Product Entry")
              var tax = [];
              var tax_info = await Tax.findOne({ rate: parseFloat(product.tax_rate), type: "GST" }).exec();
              var rate = parseFloat(product.rate);
              var amount = parseFloat(product.rate);
              var tax_rate = tax_info.detail;
              var base = amount
              // if(product.margin){
              //     var margin = product.margin;
              //     margin = margin.toString();
              //     if(margin.indexOf("%")>=0)
              //     {
              //         margin = parseFloat(margin);
              //         if(!isNaN(margin) && margin>0)
              //         {
              //             margin_total = amount*(margin/100);
              //             amount = amount+margin_total
              //         }
              //     }
              //     else
              //     {
              //         margin_total = parseFloat(margin);
              //         amount = amount+margin_total
              //     }
              // }     
  
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
              }
  
              var tax_details = {
                  tax: tax_info.tax,
                  rate: tax_info.rate,
                  amount: amount,
                  detail: tax
              }
  
              var sku = {
                  sku: product.sku,
                  total: product.stock,
                  available: product.stock,
                  created_at: new Date()
              };
  
              var stock = {
                  total: product.stock,
                  consumed: 0,
                  available: product.stock,
              };
  
              var list_type = [];
              list_type.push("Offline");
  
              var purchases = [];
              purchases.push(purchase);
  
              var log_details = {
                  vendor_name: vendor.name,
                  quantity: product.stock,
                  unit_price: product.unit_price,
                  price: product.mrp,
                  received_by: loggedInDetails.name,
                  purchase: purchase,
                  business: business,
                  created_at: new Date(),
              }
  
              var data = {
                  purchase: purchase,
                  purchases: purchases,
                  business: business,
                  product: null,
                  product_id: Math.round(+new Date() / 1000) + Math.round((Math.random() * 9999) + 1),
                  part_no: part_no,
                  product_brand: null,
                  product_model: null,
                  model: null,
                  category: null,
                  subcategory: null,
                  title: product.title,
                  short_description: "",
                  long_description: "",
                  thumbnail: "",
                  specification: "",
                  hsn_sac: product.hsn_sac,
                  quantity: product.stock,
                  unit: product.unit,
                  models: product.models,
                  stock: stock,
                  sku: sku,
                  list_type: list_type,
                  price: {
                      mrp: product.mrp,
                      rate: product.rate,
                      amount: amount,
                      sell_price: amount,
                      margin_total: margin_total,
                      margin: product.margin,
                      unit_price: product.unit_price
                  },
                  // amount_is_tax: "inclusive",
                  amount_is_tax: product.amount_is_tax,
                  tax: tax_info.tax,
                  tax_rate: tax_info.rate,
                  tax_type: "GST",
                  oem: product.oem,
                  oes: product.oes,
                  tax_info: tax_details,
                  list_type: list_type,
                  // logs: log_details,
                  created_at: new Date(),
                  updated_at: new Date()
              };
  
              BusinessProduct.create(data).then(async function (bp) {
                  Purchase.findOneAndUpdate({ _id: purchase, items: { $elemMatch: { part_no: product.part_no } } }, { $set: { "items.$.product": bp._id } }, { new: false }, async function (err, doc) {
                      if (err) {
                          // console.log(err)
                      }
                      else {
                          // console.log(bp._id)
                          var activity = {
                              vendor_name: vendor.name,
                              quantity: product.stock,
                              unit_price: product.unit_price,
                              price: product.mrp,
                              received_by: loggedInDetails.name,
                              purchase: purchase,
                              business: business,
                              activity: "Purchased",
                              created_at: new Date()
                          };
                          // console.log("Product activity", products[p].product, activity)
                          fun.productLog(bp._id, activity);
                          return true;
                      }
                  });
                  //by Abhinav 05-04-21
              });
  
          }
          */

    },
    stockEntry: async function (purchase, product, business, vendor, loggedInDetails) {
        var part_no = product.part_no;
        part_no = part_no.replace(/,/g, ", ");
        part_no = part_no.toUpperCase();

        // var loggedInDetails = await User.findById(loggedIn).exec();
        // var vendor = await User.findById(vendorId).exec();
        console.log("Part No " + part_no)
        // console.log("product.unit " + product.unit)
        // unit: product.unit,
        var businessProduct = await BusinessProduct.findOne({ $or: [{ part_no: part_no }, { title: product.title }], business: business }).sort({ updated_at: -1 }).exec();
        var margin_total = 0;
        if (businessProduct) {
            // console.log("Product Exists = ")
            console.log("product.unit_price = " + product.unit_price)
            console.log("product.part_no = " + part_no)
            // console.log("product.unit = " + product.unit)
            // product.unit
            var floor = Math.floor(product.unit_price);
            var ceil = Math.ceil(product.unit_price);
            console.log("Floor " + floor)
            console.log("ceil " + ceil)
            console.log("ceil " + ceil)

            // Math.round(5.95)
            // console.log("purchase_price " + req.body.purchase_price)
            // 'price.purchase_price': { $gte: floor, $lte: ceil },

            // .sort({ updated_at: -1 })
            var checkProducutPrice = await BusinessProduct.findOne({ part_no: part_no, unit: product.unit, "price.purchase_price": { $gte: floor, $lte: ceil }, business: business }).sort({ updated_at: -1 }).exec();
            // if (businessProduct.price.rate == product.rate) {
            if (checkProducutPrice) {
                console.log("Business Product Price = " + checkProducutPrice.price.purchase_price)
                console.log("Old rate Same with new Item")
                var tax = [];
                var tax_info = await Tax.findOne({ rate: parseFloat(product.tax_rate), type: "GST" }).exec();
                var rate = parseFloat(product.rate);
                var amount = parseFloat(product.rate);
                var tax_rate = tax_info.detail;
                var base = amount
                var tax_details = {
                    tax: tax_info.tax,
                    rate: tax_info.rate,
                    amount: amount,
                    detail: tax
                }

                var totalSkuStock = 0
                var availSkuStock = 0
                var sku = {}
                // console.log("businessProduct.sku.purchase= " + businessProduct.sku.purchase + " ,purchase= " + purchase);
                // && sku.purchase == purchase
                var checkSku = _.filter(checkProducutPrice.sku, sku => sku.sku == product.sku);
                // return checkSku;
                // console.log("checkSku = " + checkSku)
                // console.log("SKU " + checkSku.length)

                // Commented By Abhinav To Prevent SKU Entries more usefull
                if (checkSku.length > 0) {
                    // console.log("AvaliableStock : " + parseFloat(checkSku[0].available) + "\n Total stock :" + parseFloat(checkSku[0].total) + "/SKU : " + product.sku)

                    totalSkuStock = parseFloat(product.stock) + parseFloat(checkSku[0].total);
                    availSkuStock = parseFloat(product.stock) + parseFloat(checkSku[0].available);
                    // console.log("835 product.stock " + product.stock)
                    // console.log("836 checkSku[0].total " + checkSku[0].total, " checkSku[0].available=  " + checkSku[0].available)
                    // console.log("837 totalSkuStock " + totalSkuStock + "totalSkuStock " + availSkuStock)

                    sku = {
                        sku: product.sku,
                        total: totalSkuStock,
                        available: availSkuStock,
                        cretaed_at: checkSku[0].cretaed_at,
                        updated_at: new Date(),
                        // purchase: purchase,
                    }
                }
                else {
                    //
                    sku = {
                        sku: product.sku,
                        total: product.stock,
                        available: product.stock,
                        // purchase: purchase,

                        created_at: new Date(),
                    }
                }
                // console.log("876 businessProduct.stock.total = " + parseFloat(businessProduct.stock.total) + ". product.stock= " + parseFloat(product.stock) + " , businessProduct.stock.available = " + parseFloat(businessProduct.stock.available))
                var stockTotal = parseFloat(checkProducutPrice.stock.total) + parseFloat(product.stock);
                var stockAvailable = parseFloat(checkProducutPrice.stock.available) + parseFloat(product.stock);
                // console.log("879 stockTotal= " + stockTotal + " , stockAvailable= " + stockAvailable)
                // }
                // console.log("895------------")
                var list_type = [];
                list_type = _.concat(checkProducutPrice.list_type, "Offline");
                // console.log("898------------")

                list_type = _.uniq(list_type);
                // console.log("895------------")

                var purchases = [];
                // console.log("businessProduct.purchases[0]=  " + businessProduct.purchases[0])
                // console.log("purchase=  " + purchase)
                purchases = _.concat(checkProducutPrice.purchases, purchase);
                // console.log("905------------")

                purchases = _.uniq(purchases);
                // console.log("908------------")

                // var price = {
                //     mrp: product.mrp,
                //     rate: product.rate,
                //     // discount: discount,
                //     // discount_type: discount_type,
                //     // isDiscount: isDiscount,
                //     amount: amount,
                //     sell_price: amount + parseFloat(margin),
                //     // margin_total: margin_total,
                //     // margin: margin,
                //     // unit_price: purchase_price
                //     // tax_amount: _.sumBy(tax, x => x.amount),
                //     base: base,
                //     unit_price: parseFloat(amount)
                // }
                // var base = parseFloat(this.createItemForm.get('base_price').value);
                // var margin = parseFloat(this.createItemForm.get('margin').value);

                if (product.margin) {
                    var margin = parseFloat(product.margin);
                    margin = margin.toString();
                    if (margin.indexOf("%") >= 0) {
                        margin = parseFloat(margin);
                        if (!isNaN(margin) && margin > 0) {
                            margin_total = checkProducutPrice.price.base * (margin / 100);
                            amount = amount + margin_total
                        }
                    }
                    else {
                        margin_total = parseFloat(margin);
                        amount = amount + margin_total
                    }
                }
                var total_amount = parseFloat(checkProducutPrice.price.base) + parseFloat(margin_total);
                // console.log("Total Amountn = " + total_amount)
                var tax_on_amount = total_amount;
                if (tax_rate.length > 0) {
                    for (var r = 0; r < tax_rate.length; r++) {
                        if (tax_rate[r].rate != tax_info.rate) {
                            var t = tax_on_amount * (tax_rate[r].rate / 100);
                            total_amount = total_amount + t;
                        }
                        else {
                            var t = tax_on_amount * (tax_info.rate / 100);
                            total_amount = total_amount + t;
                        }
                    }
                }

                var data = {
                    purchase: purchase,
                    purchases: purchases,
                    business: business,
                    part_no: part_no,
                    // oem: product.oem,
                    // oem: product.oes,
                    part_category: product.part_category,
                    stock: {
                        // total: stockTotal,
                        // consumed: businessProduct.stock.consumed,
                        // available: stockAvailable,
                        total: parseFloat(checkProducutPrice.stock.total) + parseFloat(product.stock),
                        consumed: checkProducutPrice.stock.consumed,
                        available: parseFloat(checkProducutPrice.stock.available) + parseFloat(product.stock),
                    },
                    // sku: sku,
                    title: product.title,
                    // product.unit
                    "price.rate": product.rate,
                    "price.sell_price": product.sell_price,
                    // "price.margin_total": product.margin,
                    "price.margin": product.margin,
                    "price.amount": parseFloat(total_amount).toFixed(2),
                    // price: price,
                    // amount_is_tax: "inclusive",
                    // amount_is_tax: product.amount_is_tax,
                    // tax: tax_info.tax,
                    // tax_rate: tax_info.rate,
                    // tax_type: "GST",
                    unit: product.unit,
                    // quantity: product.quantity,
                    // quantity: parseFloat(businessProduct.stock.total),
                    quantity: stockTotal,
                    // tax_info: tax_details,
                    // list_type: list_type,
                    // logs: logs,
                    // oldPrice: oldPrice,
                    updated_at: new Date()
                };
                console.log("2549  businessProduct._id = " + checkProducutPrice._id)

                await BusinessProduct.findOneAndUpdate({ _id: checkProducutPrice._id, business: business }, { $set: data }, { new: true }, async function (err, doc) {
                    if (err) {
                        return false;
                    } else {
                        await BusinessProduct.findOneAndUpdate({ _id: checkProducutPrice._id, business: business }, { "$pull": { "sku": { "sku": product.sku } } }, { new: true }, async function (err, productData) {
                            var logs = []
                            if (productData.logs) {
                                logs = productData.logs;
                            }
                            logs.push({
                                vendor_name: vendor.name,
                                quantity: product.stock,
                                unit_price: product.unit_price,
                                price: product.amount,
                                received_by: loggedInDetails.name,
                                purchase: purchase,
                                business: business,
                                activity: "Purchased",
                                type: 'Purchased',
                                created_at: new Date()
                            });

                            await BusinessProduct.findOneAndUpdate({ _id: checkProducutPrice._id, business: business }, { $push: { sku: sku }, $set: { logs: logs } }, { new: true }, async function () {
                            });
                        });
                        var activity = {
                            vendor_name: vendor.name,
                            quantity: product.stock,
                            unit_price: product.unit_price,
                            price: product.amount,
                            received_by: loggedInDetails.name,
                            purchase: purchase,
                            business: business,
                            activity: "Purchased",
                            created_at: new Date()
                        };
                    }

                });
                return true;
            }
            else {
                console.log("Old rate Not Same with new Item")
                var tax = [];
                var tax_info = await Tax.findOne({ tax: product.tax }).exec();
                var amount = parseFloat(product.unit_base_price);
                var tax_rate = tax_info.detail;
                var base = amount
                // if(product.margin){
                //     var margin = product.margin;
                //     margin = margin.toString();
                //     if(margin.indexOf("%")>=0)
                //     {
                //         margin = parseFloat(margin);
                //         if(!isNaN(margin) && margin>0)
                //         {
                //             margin_total = amount*(margin/100);
                //             amount = amount+margin_total
                //         }
                //     }
                //     else
                //     {
                //         margin_total = parseFloat(margin);
                //         amount = amount+margin_total
                //     }
                // }

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
                var tax_details = {
                    tax: tax_info.tax,
                    rate: tax_info.rate,
                    // amount: product.unit_price,
                    amount: amount,
                    // amount: amount,
                    detail: tax
                }


                var sku = {
                    sku: product.sku,
                    total: product.stock,
                    available: product.stock,
                    created_at: new Date()
                };

                var stock = {
                    total: product.stock,
                    consumed: 0,
                    available: product.stock,
                };

                var list_type = [];

                list_type = _.concat(businessProduct.list_type, "Offline");

                list_type = _.uniq(list_type);

                var purchases = [];
                purchases = _.concat(businessProduct.purchases, purchase);
                purchases = _.uniq(purchases);
                var logs = []
                var log_details = {
                    vendor_name: vendor.name,
                    quantity: product.stock,
                    unit_price: product.unit_price,
                    price: product.mrp,
                    received_by: loggedInDetails.name,
                    purchase: purchase,
                    business: business,
                    activity: "Purchased",
                    type: 'Purchased',
                    created_at: new Date()

                }
                logs.push(log_details);

                var data = {
                    purchase: purchase,
                    // purchases: purchases,
                    purchases: purchase,
                    business: business,
                    product: businessProduct.product,
                    product_id: businessProduct.product_id,
                    part_no: businessProduct.part_no,
                    product_brand: businessProduct.product_brand,
                    product_model: businessProduct.product_model,
                    // models: businessProduct.model,
                    category: businessProduct.category,
                    subcategory: businessProduct.subcategory,
                    title: product.title,
                    short_description: businessProduct.short_description,
                    long_description: businessProduct.long_description,
                    thumbnail: businessProduct.thumbnail,
                    specification: businessProduct.specification,
                    hsn_sac: businessProduct.hsn_sac,
                    unit: businessProduct.unit,
                    quantity: product.stock,
                    models: businessProduct.models,
                    stock: stock,
                    list_type: list_type,
                    part_category: businessProduct.part_category,
                    sku: sku,
                    price: {
                        base: parseFloat(product.unit_base_price),
                        mrp: parseFloat(product.mrp),
                        rate: parseFloat(product.unit_base_price) + parseFloat(product.margin),
                        purchase_price: parseFloat(product.unit_price),
                        amount: parseFloat(product.unit_price) + parseFloat(product.margin),
                        sell_price: parseFloat(product.sell_price),
                        margin: parseFloat(product.margin),
                        discount: parseFloat(product.discount),
                        discount_type: product.discount_type,
                        isDiscount: product.isDiscount,
                        tax_amount: parseFloat(product.unit_price) - parseFloat(product.unit_base_price),
                        // unit_price: product.unit_price,
                        // margin_total: margin_total,
                    },
                    // amount_is_tax: "inclusive",
                    amount_is_tax: product.amount_is_tax,
                    tax: tax_info.tax,
                    tax_rate: tax_info.rate,
                    tax_type: tax_info.tax.split('% ').pop(),
                    tax_info: tax_details,
                    // logs: log_details,
                    logs: logs,
                    created_at: new Date(),
                    updated_at: new Date()
                };

                await BusinessProduct.create(data).then(async function (bp) {
                    // BusinessProduct.findOneAndUpdate({ _id: businessProduct._id, business: business }, { $push: { sku: sku } }, { new: true }, async function () {
                    var activity = {
                        vendor_name: vendor.name,
                        quantity: product.stock,
                        unit_price: product.unit_price,
                        price: product.mrp,
                        received_by: loggedInDetails.name,
                        purchase: purchase,
                        business: business,
                        activity: "Purchased",
                        created_at: new Date()
                    };
                    // console.log("Product activity", products[p].product, activity)
                    // await fun.productLog(bp._id, activity);

                    // });


                });
            }
            return true;

        }
        else {
            console.log("Product Not Found")
            var tax = [];
            var tax_info = await Tax.findOne({ tax: product.tax }).exec();
            // var rate = parseFloat(product.unit_base_price;
            var base = parseFloat(product.unit_base_price);
            var amount = parseFloat(product.unit_base_price);
            var tax_rate = tax_info.detail;
            var base = amount
            // product.margin = 100
            // if (product.margin) {
            //     var margin = product.margin;
            //     margin = margin.toString();
            //     if (margin.indexOf("%") >= 0) {
            //         margin = parseFloat(margin);
            //         if (!isNaN(margin) && margin > 0) {
            //             margin_total = amount * (margin / 100);
            //             amount = amount + margin_total
            //         }
            //     }
            //     else {
            //         margin_total = parseFloat(margin);
            //         amount = amount + margin_total
            //     }
            // }

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
            // console.log("Amount Internal Calvuation = " + amount)
            // console.log("Tax Amount Internal Calvuation = ", (amount - base))
            var tax_details = {
                tax: tax_info.tax,
                rate: tax_info.rate,
                // amount: product.unit_price,
                amount: amount,
                // amount: amount,
                detail: tax
            }


            var sku = {
                sku: '',
                total: product.stock,
                available: product.stock,
                created_at: new Date()
            };

            var stock = {
                total: product.stock,
                consumed: 0,
                available: product.stock,
            };


            var list_type = [];
            list_type.push("Offline");

            var purchases = [];
            purchases.push(purchase);

            // console.log("1148------------")

            //Abhinav Tyagu
            var logs = []
            var log_details = {
                vendor_name: vendor.name,
                quantity: product.stock,
                unit_price: product.unit_price,
                price: product.mrp,
                received_by: loggedInDetails.name,
                purchase: purchase,
                business: business,
                activity: "Purchased",
                type: 'Purchased',
                created_at: new Date()

            }
            logs.push(log_details);
            var data = {
                purchase: purchase,
                purchases: purchases,

                business: business,
                product: null,
                product_id: Math.round(+new Date() / 1000) + Math.round((Math.random() * 9999) + 1),
                part_no: part_no,
                product_brand: null,
                product_model: null,
                // models: businessProduct.model,
                category: null,
                subcategory: null,
                title: product.title,
                short_description: "",
                long_description: "",
                thumbnail: "",
                specification: "",
                hsn_sac: product.hsn_sac,
                unit: product.unit,
                quantity: product.stock,
                models: product.models,
                stock: stock,
                // part_category
                list_type: list_type,
                part_category: 'OEM',
                sku: sku,
                price: {
                    base: parseFloat(base),
                    mrp: parseFloat(product.mrp),
                    rate: base + parseFloat(product.margin),
                    purchase_price: amount,
                    amount: amount + parseFloat(product.margin),
                    sell_price: base + parseFloat(product.margin),
                    margin: parseFloat(product.margin),
                    discount: 0,
                    discount_type: '',
                    isDiscount: false,
                    tax_amount: amount - base,
                    // unit_price: product.unit_price,
                    // margin_total: margin_total,
                },
                // amount_is_tax: "inclusive",
                amount_is_tax: product.amount_is_tax,
                tax: tax_info.tax,
                tax_rate: tax_info.rate,
                tax_type: tax_info.tax.split('% ').pop(),
                tax_info: tax_details,
                logs: logs,
                created_at: new Date(),
                updated_at: new Date()
            };

            await BusinessProduct.create(data).then(async function (bp) {
                var activity = {
                    vendor_name: vendor.name,
                    quantity: product.stock,
                    unit_price: product.unit_price,
                    price: product.mrp,
                    received_by: loggedInDetails.name,
                    purchase: purchase,
                    business: business,
                    activity: "Purchased",
                    created_at: new Date()
                };
                // console.log("Product activity", products[p].product, activity)
                // fun.productLog(bp._id, activity);

                // });


            });
            return true;
        }

    },
    productLog: async function (b, activity) {
        // console.log("Inside Function ")

        var remark = ""
        if (activity.remark) {
            remark = activity.remark;
        }
        var product = await BusinessProduct.findOne({ _id: b }).exec();
        if (product) {
            var logs = [];
            if (product.logs) {
                logs = product.logs;
            }
            logs.push({
                vendor_name: activity.vendor_name,
                quantity: activity.quantity,
                unit_price: activity.unit_price,
                price: activity.price,
                received_by: activity.received_by,
                purchase: activity.purchase,
                business: activity.business,
                activity: activity.activity,
                created_at: new Date()
            });

            await BusinessProduct.findOneAndUpdate({ _id: b }, { $set: { logs: logs } }, { new: true }, async function (err, doc) { })
        }
    },

    stockRemove_Old: async function (purchase, product, business) {
        var part_no = product.part_no;
        part_no = part_no.replace(/,/g, ", ");
        part_no = part_no.toUpperCase();
        var businessProduct = await BusinessProduct.findOne({ purchase: purchase, part_no: part_no, business: business }).exec();

        var margin_total = 0;
        if (businessProduct) {
            var checkSku = _.filter(businessProduct.sku, sku => sku.sku == product.sku);
            if (checkSku.length > 0) {
                // console.log("")
                var totalSkuStock = parseFloat(checkSku[0].total) - parseFloat(product.stock);
                // if (totalSkuStock < 0) {
                //     totalSkuStock = 0;
                // }
                var availSkuStock = parseFloat(checkSku[0].available) - parseFloat(product.stock);
                // if (availSkuStock < 0) {
                //     availSkuStock = 0;
                // }
                var sku = {
                    sku: product.sku,
                    total: totalSkuStock,
                    available: availSkuStock,
                }
            }
            else {
                var sku = {
                    sku: product.sku,
                    total: product.stock,
                    available: product.stock,
                }
            }

            var stockTotal = parseFloat(businessProduct.stock.total) - parseFloat(product.stock);
            // if (stockTotal < 0) {
            //     stockTotal = 0;
            // }
            var stockAvailable = parseFloat(businessProduct.stock.available) - parseFloat(product.stock);
            // if (stockAvailable < 0) {
            //     stockAvailable = 0;
            // }
            let data = {}

            if (businessProduct.stock.consumed || businessProduct.stock.consumed > 0) {
                // console.log("Enter Inside old Condition......")

                data = {
                    stock: {
                        total: businessProduct.stock.total,
                        consumed: businessProduct.stock.consumed,
                        available: businessProduct.stock.available,
                    },
                    sku: sku,
                    updated_at: new Date()
                };
            } else {
                // console.log("Enter Inside new Condition......")
                data = {
                    stock: {
                        total: stockTotal,
                        consumed: stockTotal - stockAvailable,
                        available: stockAvailable,
                    },
                    sku: sku,
                    updated_at: new Date()
                };
            }



            BusinessProduct.findOneAndUpdate({ _id: businessProduct._id, business: business }, { $set: data }, { new: false }, async function () {
                // console.log(data)
                BusinessProduct.findOneAndUpdate({ _id: businessProduct._id, business: business }, { "$pull": { "sku": { "sku": product.sku } } }, async function () { });
                BusinessProduct.findOneAndUpdate({ _id: businessProduct._id, business: business }, { $push: { sku: sku } }, { new: true }, async function () { });
            });
        }
    },
    stockRemoveSingleItemWholeQuantut: async function (purchase, product, business, vendor, loggedInDetails) {
        // console.log("Stock Remove Sigle Item=   " + purchase)
        var part_no = product.part_no;
        part_no = part_no.replace(/,/g, ", ");
        part_no = part_no.toUpperCase();
        // console.log(" 43464 part_no = " + part_no)
        // console.log("business-= " + business)
        var businessProduct = await BusinessProduct.findOne({ purchase: purchase, part_no: part_no, "price.purchase_price": product.unit_price, business: business }).sort({ updated_at: -1 }).exec();

        var margin_total = 0;

        var totalSkuStock = 0
        var availSkuStock = 0
        var sku = {}
        if (businessProduct) {
            if (businessProduct.stock.available >= product.stock) {
                // if (businessProduct.stock.available >= quantity) {
                // console.log("purchase = " + purchase)
                // && sku.purchase.equals(purchase)
                var checkSku = _.filter(businessProduct.sku, sku => sku.sku == product.sku);
                // return checkSku
                // console.log("43472 checkSku.length  =   " + checkSku.length)

                if (checkSku.length > 0) {
                    // console.log("43475  Inside checkSku.length ,, " + " ,checkSku[0].total= " + checkSku[0].total + " ,product.stock= " + product.stock)

                    totalSkuStock = parseFloat(checkSku[0].total) - parseFloat(product.stock);
                    // if (totalSkuStock < 0) {
                    //     totalSkuStock = 0;
                    // }
                    availSkuStock = parseFloat(checkSku[0].available) - parseFloat(product.stock);
                    // if (availSkuStock < 0) {
                    //     availSkuStock = 0;
                    // }
                    sku = {
                        sku: product.sku,
                        total: totalSkuStock,
                        available: availSkuStock,
                        cretaed_at: checkSku[0].cretaed_at,
                        updated_at: new Date(),
                    }
                }
                else {
                    // console.log("43492  Inside Else of checkSku.length  product.sku=   " + product.sku)

                    sku = {
                        sku: product.sku,
                        total: product.stock,
                        available: product.stock,
                        cretaed_at: new Date()

                    }
                }

                var stockTotal = parseFloat(businessProduct.stock.total) - parseFloat(product.stock);
                // if (stockTotal < 0) {
                //     stockTotal = 0;
                // }
                var stockAvailable = parseFloat(businessProduct.stock.available) - parseFloat(product.stock);
                // if (stockAvailable < 0) {
                //     stockAvailable = 0;
                // }
                let data = {}

                // if (businessProduct.stock.consumed || businessProduct.stock.consumed > 0) {
                // console.log("Enter Inside old Condition......")

                //     data = {
                //         stock: {
                //             total: businessProduct.stock.total,
                //             consumed: businessProduct.stock.consumed,
                //             available: businessProduct.stock.available,
                //         },
                //         sku: sku,
                //         updated_at: new Date()
                //     };
                // } else {
                // console.log("Enter Inside new Condition......")
                data = {
                    stock: {
                        total: stockTotal,
                        // consumed: stockTotal - stockAvailable,
                        consumed: businessProduct.stock.consumed,
                        available: stockAvailable,
                    },
                    // sku: sku,
                    updated_at: new Date()
                };
                // }
                BusinessProduct.findOneAndUpdate({ _id: businessProduct._id, business: business }, { $set: data }, { new: true }, async function () {
                    // console.log(data)
                    BusinessProduct.findOneAndUpdate({ _id: businessProduct._id, business: business }, { "$pull": { "sku": { "sku": product.sku } } }, async function () {
                        BusinessProduct.findOneAndUpdate({ _id: businessProduct._id, business: business }, { $push: { sku: sku } }, { new: true }, async function () {
                            var activity = {
                                vendor_name: vendor.name,
                                quantity: product.stock,
                                unit_price: product.unit_price,
                                price: product.mrp,
                                received_by: loggedInDetails.name,
                                purchase: purchase,
                                business: business,
                                activity: "Returned",
                                created_at: new Date()
                            };
                            // console.log("Product activity", products[p].product, activity)
                            fun.productLog(businessProduct._id, activity);

                        });
                    });

                });
                return true;

            } else {
                // console.log("Stock In Sufficient to remove")
                return false;
            }
        }
        else {
            // console.log("Product not Found")
            return false;
        }
    },
    stockRemoveSingleItem: async function (purchase, product, quantity, business, vendor, loggedInDetails) {
        // console.log("Stock Remove Sigle Item=   " + purchase)
        var part_no = product.part_no;
        part_no = part_no.replace(/,/g, ", ");
        part_no = part_no.toUpperCase();
        // console.log(" 43464 part_no = " + part_no)
        // console.log("business-= " + business)
        var floor = Math.floor(product.unit_price) - 0.50;
        var ceil = Math.ceil(product.unit_price) + 0.50;
        // { $gte: floor, $lte: ceil }
        // console.log("Floor " + floor)
        // console.log("ceil " + ceil)
        // console.log("purchase_price " + req.body.purchase_price)
        // 'price.purchase_price': { $gte: floor, $lte: ceil },

        // console.log("Purchase  = " + purchase + "\n Floor Value = " + floor + "\n Ceil Value = " + ceil)
        // 
        var businessProduct = await BusinessProduct.findOne({ purchases: purchase, part_no: part_no, "price.purchase_price": { $gte: floor, $lte: ceil }, business: business }).sort({ updated_at: -1 }).exec();

        var margin_total = 0;

        var totalSkuStock = 0
        var availSkuStock = 0
        var sku = {}
        if (businessProduct) {
            // if (businessProduct.stock.available >= product.stock) {
            // console.log("quantity " + quantity)

            if (businessProduct.stock.available >= quantity) {
                // console.log("purchase = " + purchase)
                // && sku.purchase.equals(purchase)
                var checkSku = _.filter(businessProduct.sku, sku => sku.sku == product.sku);
                // return checkSku
                // console.log("43472 checkSku.length  =   " + checkSku.length)

                if (checkSku.length > 0) {
                    // console.log("43475  Inside checkSku.length ,, " + " ,checkSku[0].total= " + checkSku[0].total + " ,quantity= " + quantity)

                    totalSkuStock = parseFloat(checkSku[0].total) - parseFloat(quantity);
                    // if (totalSkuStock < 0) {
                    //     totalSkuStock = 0;
                    // }
                    availSkuStock = parseFloat(checkSku[0].available) - parseFloat(quantity);
                    // if (availSkuStock < 0) {
                    //     availSkuStock = 0;
                    // }
                    sku = {
                        sku: product.sku,
                        total: totalSkuStock,
                        available: availSkuStock,
                        cretaed_at: checkSku[0].cretaed_at,
                        updated_at: new Date(),
                    }
                }
                else {
                    // console.log("43492  Inside Else of checkSku.length  product.sku=   " + product.sku)

                    sku = {
                        sku: product.sku,
                        total: product.stock - quantity,
                        available: product.stock - quantity,
                        cretaed_at: new Date()

                    }
                }

                var stockTotal = parseFloat(businessProduct.stock.total) - parseFloat(quantity);
                // if (stockTotal < 0) {
                //     stockTotal = 0;
                // }
                var stockAvailable = parseFloat(businessProduct.stock.available) - parseFloat(quantity);
                // if (stockAvailable < 0) {
                //     stockAvailable = 0;
                // }
                let data = {}

                // if (businessProduct.stock.consumed || businessProduct.stock.consumed > 0) {
                // console.log("Enter Inside old Condition......")

                //     data = {
                //         stock: {
                //             total: businessProduct.stock.total,
                //             consumed: businessProduct.stock.consumed,
                //             available: businessProduct.stock.available,
                //         },
                //         sku: sku,
                //         updated_at: new Date()
                //     };
                // } else {
                // console.log("Enter Inside new Condition......")
                data = {
                    stock: {
                        total: stockTotal,
                        // consumed: stockTotal - stockAvailable,
                        consumed: businessProduct.stock.consumed,
                        available: stockAvailable,
                    },
                    // sku: sku,
                    updated_at: new Date()
                };
                // }
                BusinessProduct.findOneAndUpdate({ _id: businessProduct._id, business: business }, { $set: data }, { new: true }, async function () {
                    // console.log(data)
                    BusinessProduct.findOneAndUpdate({ _id: businessProduct._id, business: business }, { "$pull": { "sku": { "sku": product.sku } } }, async function () {
                        BusinessProduct.findOneAndUpdate({ _id: businessProduct._id, business: business }, { $push: { sku: sku } }, { new: true }, async function () {
                            var activity = {
                                vendor_name: vendor.name,
                                quantity: quantity,
                                unit_price: product.unit_price,
                                price: product.mrp,
                                received_by: loggedInDetails.name,
                                purchase: purchase,
                                business: business,
                                activity: "Returned",
                                created_at: new Date()
                            };
                            // console.log("Product activity", products[p].product, activity)
                            fun.productLog(businessProduct._id, activity);

                        });
                    });

                });
                return true;

            } else {
                // console.log("Stock In Sufficient to remove")
                return false;
            }
        }
        else {
            // console.log("Product not Found")
            return false;
        }
    },
    purchaseStockRemove: async function (purchase, product, business, vendor, loggedInDetails) {
        // console.log("Stock Remove =   " + purchase)
        var part_no = product.part_no;
        part_no = part_no.replace(/,/g, ", ");
        part_no = part_no.toUpperCase();
        // console.log(" 43464 part_no = " + part_no)
        // console.log("business-= " + business)
        var floor = Math.floor(product.unit_price);
        var ceil = Math.ceil(product.unit_price);
        // console.log("Floor " + floor)
        // console.log("ceil " + ceil)
        // console.log("purchase_price " + req.body.purchase_price)
        // 'price.purchase_price': { $gte: floor, $lte: ceil },
        var businessProduct = await BusinessProduct.findOne({ purchases: purchase, 'price.purchase_price': { $gte: floor, $lte: ceil }, part_no: part_no, business: business }).exec();

        var margin_total = 0;

        var totalSkuStock = 0
        var availSkuStock = 0
        var sku = {}
        if (businessProduct) {
            // if (businessProduct.stock.available >= product.stock) {
            var checkSku = _.filter(businessProduct.sku, sku => sku.sku == product.sku);
            // return res.json({ data: checkSku })
            // console.log("43472 checkSku.length  =   " + checkSku.length)

            if (checkSku.length > 0) {
                // console.log("43475  Inside checkSku.length ,, " + " ,checkSku[0].total= " + checkSku[0].total + " ,product.stock= " + product.stock)

                totalSkuStock = parseFloat(checkSku[0].total) - parseFloat(product.stock);
                // if (totalSkuStock < 0) {
                //     totalSkuStock = 0;
                // }
                availSkuStock = parseFloat(checkSku[0].available) - parseFloat(product.stock);
                // if (availSkuStock < 0) {
                //     availSkuStock = 0;
                // }
                sku = {
                    sku: product.sku,
                    total: totalSkuStock,
                    available: availSkuStock,
                    created_at: checkSku[0].created_at,
                    updated_at: new Date()
                }
            }
            else {
                // console.log("43492  Inside Else of checkSku.length  product.sku=   " + product.sku)

                sku = {
                    // sku: product.sku,

                    total: product.stock,
                    // available: parseFloat(businessProduct[0].available) - parseFloat(product.stock),
                    updated_at: new Date()
                    // total: product.stock,
                    // available: product.stock,
                    // updated_at: new Date()
                }
            }

            var stockTotal = parseFloat(businessProduct.stock.total) - parseFloat(product.stock);
            // if (stockTotal < 0) {
            //     stockTotal = 0;
            // }
            var stockAvailable = parseFloat(businessProduct.stock.available) - parseFloat(product.stock);
            // if (stockAvailable < 0) {
            //     stockAvailable = 0;
            // }
            let data = {}

            // if (businessProduct.stock.consumed || businessProduct.stock.consumed > 0) {
            // console.log("Enter Inside old Condition......")

            //     data = {
            //         stock: {
            //             total: businessProduct.stock.total,
            //             consumed: businessProduct.stock.consumed,
            //             available: businessProduct.stock.available,
            //         },
            //         sku: sku,
            //         updated_at: new Date()
            //     };
            // } else {
            // console.log("Enter Inside new Condition......")
            data = {
                stock: {
                    total: stockTotal,
                    // consumed: stockTotal - stockAvailable,
                    consumed: businessProduct.stock.consumed,
                    available: stockAvailable,
                },
                sku: sku,
                updated_at: new Date()
            };
            // }
            // console.log("Data data.stock.available = " + data.stock.available)


            BusinessProduct.findOneAndUpdate({ _id: businessProduct._id, business: business }, { $set: data }, { new: true }, async function () {
                // console.log(data)
                BusinessProduct.findOneAndUpdate({ _id: businessProduct._id, business: business }, { "$pull": { "sku": { "sku": product.sku } } }, async function () {
                    BusinessProduct.findOneAndUpdate({ _id: businessProduct._id, business: business }, { $push: { sku: sku } }, { new: true }, async function () {
                        var activity = {
                            vendor_name: vendor.name,
                            quantity: product.stock,
                            unit_price: product.unit_price,
                            price: product.mrp,
                            received_by: loggedInDetails.name,
                            purchase: purchase,
                            business: business,
                            activity: "Returned",
                            created_at: new Date()
                        };
                        // console.log("Product activity", products[p].product, activity)
                        fun.productLog(businessProduct._id, activity);

                    });
                });

            });
            return true;

            // } else {
            // console.log("Stock In Sufficient to remove")
            //     return false;
            // }
        }
        else {

            // console.log("Product not Found")
            return false;
        }
    },
    checkStock: async function (purchase, product, business) {
        // console.log("Stock Remove =   " + purchase)
        for (var p = 0; p < product.length; p++) {
            var part_no = product[p].part_no;
            var purchase_price = product[p].unit_price;
            part_no = part_no.replace(/,/g, ", ");
            part_no = part_no.toUpperCase();
            if (product[p].item_status == "Completed") {
                // console.log("Part no = " + part_no)
                // console.log("purchase_price = " + purchase_price)
                // console.log("Part no = " + part_no)
                var businessProduct = await BusinessProduct.findOne({ part_no: part_no, 'price.purchase_price': purchase_price, business: business }).sort({ updated_at: -1 }).exec();
                if (businessProduct) {
                    if (businessProduct.stock.available < product[p].stock) {
                        // console.log(" 1761 Insufficient Stock ")
                        return false;
                        // break;
                    } else {
                        // console.log("1765 Stock Availabe")
                    }
                } else {

                }
            } else {
                // console.log("1768 InCompleted Item")
            }

        }
        return true;
    },
    addPurchaseReturn: async function (purchase, business) {
        var purchase_return = await PurchaseReturn.findOne({ purchase: purchase._id, status: "Active" }).count().exec();
        // console.log("purchase_return= " + purchase_return)
        if (!purchase_return) {
            var bill = {
                purchase: purchase._id,
                reference_no: purchase.reference_no,
                bill_no: purchase.bill_no,
                date: purchase.date,
                due_date: purchase.due_date,
                vendor: purchase.vendor,
                vendor_address: purchase.vendor_address,
                items: purchase.items,
                business: purchase.business,
                total: purchase.total,
                status: "Active",
                created_at: newDate,
                updated_at: newDate,
            };

            PurchaseReturn.create(bill).then(async function (purchase) {
                var count = await PurchaseReturn.find({ _id: { $lt: purchase._id }, business: business }).count();
                var bill_no = count + 10000;

                PurchaseReturn.findOneAndUpdate({ _id: purchase._id }, { $set: { return_no: bill_no } }, { new: true }, async function (err, doc) {
                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Bill is ready for return",
                        responseData: await PurchaseReturn.findById(purchase._id).exec()
                    });
                });
            })
        } else {
            var data = {
                purchase: purchase._id,
                reference_no: purchase.reference_no,
                bill_no: purchase.bill_no,
                date: purchase.date,
                due_date: purchase.due_date,
                vendor: purchase.vendor,
                vendor_address: purchase.vendor_address,
                items: purchase.items,
                business: purchase.business,
                total: purchase.total,
                status: "Active",
                // created_at: newDate,
                updated_at: newDate,
            };

            PurchaseReturn.findOneAndUpdate({ _id: purchase._id }, { $set: data }, { new: true }, async function (err, doc) {
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Bill is ready for return",
                    responseData: await PurchaseReturn.findById(purchase._id).exec()
                });
            });

        }
    },
    stockDeduction: async function (product, booking) {
        var businessProduct = await BusinessProduct.findById(product.source).exec();
        if (businessProduct) {
            if (businessProduct.stock.available >= product.quantity) {
                var id = product._id;

                var stockTotal = parseFloat(businessProduct.stock.total);
                var stockAvailable = parseFloat(businessProduct.stock.available) - product.quantity;
                var stockConsumed = parseFloat(businessProduct.stock.consumed) + product.quantity;

                if (stockAvailable < 0) {
                    stockAvailable = 0
                }

                if (stockConsumed < 0) {
                    stockConsumed = 0
                }

                var stock = {
                    total: stockTotal,
                    available: stockAvailable,
                    consumed: stockConsumed
                }

                BusinessProduct.findOneAndUpdate({ _id: product.source }, { $set: { stock: stock } }, { new: false }, async function (err, doc) {
                    if (err) {
                        // console.log(err)
                    }
                    else {
                        Booking.findOneAndUpdate({
                            _id: booking,
                            services: {
                                $elemMatch: {
                                    parts: {
                                        $elemMatch: {
                                            _id: id,
                                        }
                                    }
                                }
                            }
                        }, {
                            $set: {
                                //"services.$.parts.$[].source": mongoose.Types.ObjectId(source),
                                "services.$.parts.$[].issued": true,
                            }
                        }, { new: true }, async function (err, doc) {
                            if (err) {
                                // console.log(err)
                            }
                            else {
                                // console.log("Success")
                            }
                        });
                    }
                });
            }
        }
    },

    orderItemReturn: async function (product) {
        var businessProduct = await BusinessProduct.findById(product.product).exec();
        if (businessProduct) {
            var stockTotal = parseFloat(businessProduct.stock.total);
            var stockAvailable = parseFloat(businessProduct.stock.available) + product.quantity;
            var stockConsumed = parseFloat(businessProduct.stock.consumed) - product.quantity;

            // if (stockAvailable < 0) {
            //     stockAvailable = 0
            // }
            // else if (stockAvailable > stockTotal) {
            //     stockAvailable = stockTotal
            // }

            // if (stockConsumed < 0) {
            //     stockConsumed = 0
            // }
            // else if (stockConsumed > stockTotal) {
            //     stockConsumed = stockTotal
            // }

            var stock = {
                total: stockTotal,
                available: stockAvailable,
                consumed: stockConsumed
            }

            var logs = []
            if (businessProduct.logs) {
                logs = businessProduct.logs;
            }
            if (product.order) {
                var order = await Order.findOne({ _id: product.order })
                    .populate({ path: "user", select: "name contact_no" })
                    .populate({ path: "business", select: "_id id name contact_no" })
                    .exec();


                logs.push({
                    vendor_name: order.user.name,
                    quantity: product.quantity,
                    unit_price: product.unit_price,
                    price: product.amount,
                    received_by: order.business.name,
                    purchase: null,
                    order: product.order,
                    business: order.business._id,
                    // activity: "Item returned to stock",
                    activity: "Returned",
                    created_at: new Date()
                });
            }
            await BusinessProduct.findOneAndUpdate({ _id: businessProduct.id }, { $set: { stock: stock, logs: logs } }, { new: false }, async function (err, productData) {
                if (err) {
                    // console.log(err)
                }
                else {
                    // var logs = []
                    // if (productData.logs) {
                    //     logs = productData.logs;
                    // }
                    // logs.push({
                    //     vendor_name: user.name,
                    //     quantity: quantity,
                    //     unit_price: product.unit_price,
                    //     price: product.amount,
                    //     received_by: loggedInDetails.name,
                    //     purchase: null,
                    //     order: product.order,
                    //     business: business,
                    //     // activity: "Item returned to stock",
                    //     activity: "Returned",
                    //     created_at: new Date()
                    // });
                    // await BusinessProduct.findOneAndUpdate({ _id: businessProduct._id, business: business }, { $set: { logs: logs } }, { new: true }, async function () {
                    // })
                    await OrderLine.findOneAndUpdate({ _id: product._id }, { $set: { issued: false, status: "Returned" } }, { new: true }, async function (err, doc) {
                    });
                }
            });
        }

        return true;
    },
    saleItemReturn: async function (product, sale, loggedInDetails) {
        var businessProduct = await BusinessProduct.findById(product.product).exec();
        if (businessProduct) {
            var stockTotal = parseFloat(businessProduct.stock.total);
            var stockAvailable = parseFloat(businessProduct.stock.available) + product.quantity;
            var stockConsumed = parseFloat(businessProduct.stock.consumed) - product.quantity;

            // if (stockAvailable < 0) {
            //     stockAvailable = 0
            // }
            // else if (stockAvailable > stockTotal) {
            //     stockAvailable = stockTotal
            // }

            // if (stockConsumed < 0) {
            //     stockConsumed = 0
            // }
            // else if (stockConsumed > stockTotal) {
            //     stockConsumed = stockTotal
            // }

            var stock = {
                total: stockTotal,
                available: stockAvailable,
                consumed: stockConsumed
            }

            var logs = []
            if (businessProduct.logs) {
                logs = businessProduct.logs;
            }
            logs.push({
                vendor_name: sale.user.name,
                quantity: product.quantity,
                unit_price: product.unit_price,
                price: product.amount,
                received_by: loggedInDetails.name,
                purchase: null,
                // order: product.order,
                sale: sale._id,
                business: sale.business,
                // activity: "Item returned to stock",
                activity: "Returned",
                created_at: new Date()
            });
            await BusinessProduct.findOneAndUpdate({ _id: businessProduct.id }, { $set: { stock: stock, logs: logs } }, { new: true }, async function (err, productData) {
                if (err) {
                    // console.log(err)
                }
                else {
                    // var logs = []
                    // if (productData.logs) {
                    //     logs = productData.logs;
                    // }
                    // logs.push({
                    //     vendor_name: user.name,
                    //     quantity: quantity,
                    //     unit_price: product.unit_price,
                    //     price: product.amount,
                    //     received_by: loggedInDetails.name,
                    //     purchase: null,
                    //     order: product.order,
                    //     business: business,
                    //     // activity: "Item returned to stock",
                    //     activity: "Returned",
                    //     created_at: new Date()
                    // });
                    // await BusinessProduct.findOneAndUpdate({ _id: businessProduct._id, business: business }, { $set: { logs: logs } }, { new: true }, async function () {
                    // })
                    // await OrderLine.findOneAndUpdate({ _id: product._id }, { $set: { issued: false, status: "Returned" } }, { new: true }, async function (err, doc) {
                    // });
                }
            });
        }

        return true;
    },
    orderItemDeduct: async function (order, business) {
        var bool = false;
        await OrderLine.find({ business: business, order: order })
            .cursor().eachAsync(async (orderLine) => {
                var businessProduct = await BusinessProduct.findById(orderLine.product).exec();
                // console.log("available: "+businessProduct.stock.available+" Required: "+orderLine.quantity)
                if (orderLine.issued == false) {
                    if (businessProduct) {
                        if (businessProduct.stock.available >= orderLine.quantity) {
                            // console.log("drop")
                            var stockTotal = parseFloat(businessProduct.stock.total);
                            var stockAvailable = parseFloat(businessProduct.stock.available) - orderLine.quantity;
                            var stockConsumed = parseFloat(businessProduct.stock.consumed) + orderLine.quantity;

                            if (stockAvailable < 0) {
                                stockAvailable = 0
                            }

                            if (stockConsumed < 0) {
                                stockConsumed = 0
                            }

                            var stock = {
                                total: stockTotal,
                                available: stockAvailable,
                                consumed: stockConsumed
                            }

                            BusinessProduct.findOneAndUpdate({ _id: orderLine.product }, { $set: { stock: stock } }, { new: false }, async function (err, doc) {
                                if (err) {
                                    return false;
                                }
                                else {
                                    OrderLine.findOneAndUpdate({ _id: orderLine._id }, { $set: { issued: true } }, { new: false }, async function (err, doc) {
                                    });
                                }
                            });
                        }
                        else {
                            // console.log("drop no where")
                        }
                    }
                }
            });

        var not_issued = [];
        var orderLines = await OrderLine.find({ business: business, order: order }).exec();

        var not_issued = _.filter(orderLines, issued => issued.issued == false);

        if (not_issued.length == 0) {
            bool = true
        }

        return bool
    },

    serviceAddOld: async function (data, booking) {
        var booking = await Booking.findById(booking).exec();
        if (booking) {
            var car = await Car.findById(booking.car).populate('model').exec();
            var automaker = await Automaker.findById(car.model.automaker).exec();
            var bookingService = {
                package: data.sub_category,//
                automaker: automaker._id,
                _automaker: automaker.maker,
                model: car.model._id,
                _model: car.model.value,
                segment: car.model.segment,
                service: data.service,
                description: data.description,
                parts: data.parts,
                labour: data.labour,
                opening_fitting: data.opening_fitting,
                part_cost: data.part_cost,
                of_cost: data.of_cost,
                labour_cost: data.labour_cost,
                mileage: data.mileage,//
                cost: data.labour_cost + data.part_cost,
                mrp: data.mrp,//
                type: data.type,
                editable: data.editable,//
                labour_cost_editable: data.labour_cost_editable,//
                part_cost_editable: data.part_cost_editable,//
                of_cost_editable: data.of_cost_editable,//
                publish: false,
                cretaed_at: new Date()
            }

            // Blocking code by vinay
            if (data.type == "services") {
                await Service.create(bookingService)
            }
            else if (data.type == "collision") {
                await Collision.create(bookingService)
            }
            else if (data.type == "detailing") {
                await Detailing.create(bookingService)
            }
            else if (data.type == "customization") {
                await Customization.create(bookingService)
            }
        }
    },
    serviceAdd: async function (data, booking) {
        var booking = await Booking.findById(booking).exec();
        if (booking) {

            var car = await Car.findById(booking.car).populate('model').exec();
            var automaker = await Automaker.findById(car.model.automaker).exec();
            // for (let i = 0; i < data.length; i++) {
            var margin_total = parseFloat(data.labour_cost) * (40 / 100);
            var mrp = parseFloat(data.labour_cost) + margin_total;
            // console.log("Sub Category  = " + data.sub_category)
            var partAll = []
            var parts = data.parts;
            for (let i = 0; i < data.parts.length; i++) {
                partAll.push({
                    source: null,
                    item: parts[i].item,
                    hsn_sac: parts[i].hsn_sac,
                    part_no: parts[i].part_no,
                    quantity: parts[i].quantity,
                    issued: false,
                    rate: parseFloat(parts[i].rate),
                    base: parseFloat(parts[i].base),
                    amount: parseFloat(parts[i].amount),
                    tax_amount: parts[i].tax_amount,
                    amount_is_tax: parts[i].amount_is_tax,
                    customer_dep: parts[i].customer_dep,
                    insurance_dep: parts[i].insurance_dep,
                    discount: parts[i].discount,
                    tax: parts[i].tax,
                    tax_rate: parts[i].tax_rate,
                    tax_info: parts[i].tax_info
                })
                // console.log("Source  of  Part=  " + partAll[i].source + "\n IssuesIs  = " + partAll[i].issued);
            }
            var serviceData = {
                business: booking.business,
                package: data.sub_category,
                automaker: automaker._id,
                _automaker: automaker.maker,
                model: car.model._id,
                _model: car.model.value,
                segment: car.model.segment,
                service: data.service,
                description: data.description,
                parts: partAll,
                labour: data.labour,
                opening_fitting: data.opening_fitting,
                part_cost: data.part_cost,
                of_cost: data.of_cost,
                labour_cost: data.labour_cost,
                mileage: data.mileage,
                cost: parseFloat(data.part_cost) + parseFloat(data.labour_cost),
                mrp: parseFloat(data.part_cost) + Math.ceil(mrp),
                type: data.type,
                editable: true,
                labour_cost_editable: true,
                part_cost_editable: true,
                of_cost_editable: true,
                profile: "",
                publish: false,
                custom: true,
                status: "Custom",
                created_at: new Date(),
                updated_at: new Date(),
            }
            if (data.type == "services") {
                var ser = await Service.find({
                    package: data.sub_category, model: { $ne: null }, segment: car.model.segment, service: data.service, custom: true, business: booking.business
                }).exec();

                // return res.send(ser.type);
                // console.log(ser.length)
                if (ser.length) {
                    // console.log("Service OLD " + ser.length)
                    await Service.findOneAndUpdate({
                        package: data.sub_category, model: { $ne: null }, segment: car.model.segment, service: data.service, custom: true, business: booking.business
                    }, {
                        $set: serviceData
                    }, { new: true }, async function (err, doc) {
                        // console.log("Update  Service  _model = " + serviceData)
                    });

                }
                else {
                    // console.log("New Service  Service _model = " + serviceData + "   =  " + automaker + "   ")
                    await Service.create(serviceData);
                }
            }
            else if (data.type == "collision") {
                var ser = await Collision.find({
                    package: data.sub_category, model: { $ne: null }, segment: car.model.segment, service: data.service, custom: true, business: booking.business
                }).exec();

                // return res.send(ser.type);
                // console.log(ser.length)
                if (ser.length) {
                    // console.log(ser.length)
                    await Collision.findOneAndUpdate({
                        package: data.sub_category, model: { $ne: null }, segment: car.model.segment, service: data.service, custom: true, business: booking.business
                    }, {
                        $set: serviceData
                    }, { new: true }, async function (err, doc) {
                        // console.log("Update Collision  _model = " + serviceData)
                    });

                }
                else {
                    // console.log("New Service Collision   _model = " + serviceData + "   =  " + automaker + "   ")
                    await Collision.create(serviceData);
                }
            } else if (data.type == "detailing") {
                var ser = await Detailing.find({
                    package: data.sub_category, model: { $ne: null }, segment: car.model.segment, service: data.service, custom: true, business: booking.business
                }).exec();

                // return res.send(ser.type);
                // console.log(ser.length)
                if (ser.length) {
                    // console.log(ser.length)
                    await Detailing.findOneAndUpdate({
                        package: data.sub_category, model: { $ne: null }, segment: car.model.segment, service: data.service, custom: true, business: booking.business
                    }, {
                        $set: serviceData
                    }, { new: true }, async function (err, doc) {
                        // console.log("Update Detailing  _model = " + serviceData)
                    });

                }
                else {
                    // console.log("New Service  Detailing  _model = " + serviceData + "   =  " + automaker + "   ")
                    await Detailing.create(serviceData);
                }
            } else if (data.type == "customization") {
                var ser = await Customization.find({
                    package: data.sub_category, model: { $ne: null }, segment: car.model.segment, service: data.service, custom: true, business: booking.business
                }).exec();

                // return res.send(ser.type);
                // console.log(ser.length)
                if (ser.length) {
                    // console.log(ser.length)
                    await Customization.findOneAndUpdate({
                        package: data.sub_category, model: { $ne: null }, segment: car.model.segment, service: data.service, custom: true, business: booking.business
                    }, {
                        $set: serviceData
                    }, { new: true }, async function (err, doc) {
                        // console.log("Update _model = Customization ")
                    });

                }
                else {
                    // console.log("New Service  _model Customization ")
                    await Customization.create(serviceData);
                }
            }
        }
        // 
        // }
    },


    getAdvisor: async function (user, business) {
        var advisor = business;
        var role = await Management.findOne({ user: user, business: business }).exec();
        if (role.role == "Service Advisor") {
            advisor = role.user;
        }
        else {
            var advisorBooking = [];
            await Management.find({ business: business, role: "Service Advisor" })
                .cursor().eachAsync(async (a) => {
                    var d = await Booking.find({ business: business, advisor: a.user, status: { $in: ["EstimateRequested", "JobInitiated", "JobOpen", "In-Process", "StartWork", "Rework"] } }).count().exec();
                    advisorBooking.push({
                        user: a.user,
                        count: d
                    })
                });

            if (advisorBooking.length != 0) {
                advisorBooking.sort(function (a, b) {
                    return a.count > b.count;
                });

                advisor = advisorBooking[0].user;
            }
            else {
                advisor = role.business
            }
        }
        return advisor;
    },

    removeDublicateDoumnets: async function (originalArray, prop) {
        var newArray = [];
        var lookupObject = {};

        for (var i in originalArray) {
            lookupObject[originalArray[i][prop]] = originalArray[i];
        }

        for (i in lookupObject) {
            newArray.push(lookupObject[i]);
        }

        return newArray;
    },

    businessPlan: async function (business, category) {
        var plans = await BusinessPlan.find({ business: business, category: category }).populate('suite').exec();
        var suite = _.map(plans, 'suite');

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

                        }
                    }
                    else {
                        main.push({
                            tag: mains[k].tag,
                            module: mains[k].module,
                            action: mains[k].action,
                            enable: mains[k].enable,
                            activityTab: mains[k].activityTab,
                        })
                    }
                }
            }

            if (suite[i].chat == true) {
                chat = true;
            }
        }
    },

    businessPlanCategory: async function (business) {
        var plans = await BusinessPlan.find({ business: business }).populate('suite').exec();
        var suite = _.map(plans, 'suite');

        var category = []

        for (var i = 0; i < suite.length; i++) {
            category.push(suite[i].category)
        }

        return category
    },

    offerGet: async function (multi_category_no, business) {
        var offers = await BusinessOffer.find({ business: business }).sort({ _id: -1 }).exec();


        // var category = []

        // for (var i = 0; i < suite.length; i++) {
        //     category.push(suite[i].category)
        // }
        return offers
    },

    businessPlanLimit: async function (business, tz) {
        var plans = await BusinessPlan.find({ business: business }).populate('suite').exec();
        var suite = _.map(plans, 'suite');
        // console.log(suite.length)
        // return res.json(suite.length)
        var limits = [];
        for (var i = 0; i < suite.length; i++) {
            var serverTime = moment.tz(new Date(), tz);
            var bar = plans[i].created_at;
            bar.setDate(bar.getDate() + plans[i].validity);
            var e = bar;
            bar = moment.tz(bar, tz)

            var baz = bar.diff(serverTime);
            // console.log("Limits ===" + suite[i].limits)
            if (baz > 0) {
                limits.push(suite[i].limits);

            }
        }


        result = limits.reduce((r, o) => {
            if (!typeof (o) === 'object' || o === null) {
                return r;
            }
            Object.keys(o).forEach((key) => r[key] = r[key] !== undefined ? Math.max(r[key], o[key]) : o[key]);
            return r;
        }, {});
        // console.log(result)
        return result;
    },


    getAssignee: async function (user, business) {
        var role = await Management.findOne({ user: user, business: business }).exec();
        if (role.role == "CRE") {
            advisor = role.user;
        }
        else {
            var assigneeLead = [];
            await Management.find({ business: business, role: "CRE" })
                .cursor().eachAsync(async (a) => {
                    // var d = await Lead.find({ business: business, assignee: a.user, 'remark.status': { $in: ['Open', 'Follow-Up'] } }).count().exec();
                    var open = await Lead.find({ business: business, assignee: a.user, 'remark.status': { $in: ['Open',] } }).count().exec();
                    var follow_up = await Lead.find({ business: business, assignee: a.user, 'remark.status': { $in: ['Follow-Up'] }, 'follow_up.date': { $lte: new Date() } }).count().exec();
                    var d = open + follow_up;
                    assigneeLead.push({
                        user: a.user,
                        count: d
                    })
                });

            if (assigneeLead.length != 0) {
                assigneeLead.sort(function (a, b) {
                    return a.count > b.count;
                });

                advisor = assigneeLead[0].user;

            }
            else {
                advisor = role.business;
            }
        }


        return advisor;
    },
    calculateTax: async function (service, servicePrice, taxType) {
        let tax_rate = '';
        if (taxType == 'serviceTax') {
            tax_rate = service.tax_rate
        } else if (taxType == 'totalTax') {

            tax_rate = service.tax_info.tax_rate
            // console.log('Enter inside the total tax rate', tax_rate)
        }

        tax_info = service.tax_info.detail
        // console.log('Tax info....', tax_info)

        let x = (100 + Number(tax_rate)) / 100;
        let tax_on_amount = Number(servicePrice) / x
        let tax_amount = Number(servicePrice) - tax_on_amount

        if (taxType == 'serviceTax') {

            service.base = parseFloat(tax_on_amount.toFixed(2))
            service.rate = parseFloat(servicePrice)
            service.amount = parseFloat(servicePrice)
            service.tax_amount = parseFloat(tax_amount.toFixed(2))
            service.tax_info.base = parseFloat(tax_on_amount.toFixed(2))

        } else if (taxType == 'totalTax') {
            service.tax_info.base = parseFloat(tax_on_amount.toFixed(2))
        }

        tax_info.forEach(data => {
            let tax_rate = data.rate
            let tax_amount = tax_on_amount * (Number(tax_rate)) / 100
            data.amount = parseFloat(tax_amount.toFixed(2))
            // console.log(tax_amount)
        })

        return service;
    },
    updateServicePrices: async function (servicePrice, service, type, item, serviceType) {

        let totalAmount = 0
        let labourCost = 0
        let partsCost = 0
        let tax_data = {}
        // console.log("Your service type is here ........", type, servicePrice, item)
        for (let j = 0; j < service[type].length; j++) {
            if (item == service[type][j].item) {
                // console.log('Parts condition matched...')
                service[type][j].rate = servicePrice
                let newService = calculateTax(service[type][j], servicePrice, 'serviceTax')
                service[type].pop()
                service[type].push(newService)
                break;
            }
        }

        service.labour.forEach(data => {
            let rate = Number(data.rate)
            totalAmount += rate
            labourCost += rate
        })
        service.parts.forEach(data => {
            let rate = Number(data.rate)
            totalAmount += rate
            partsCost += rate
        })

        service.labour_cost = labourCost
        service.part_cost = partsCost
        service.cost = totalAmount
        service.updated_at = new Date();
        if (serviceType == 'detailing') {
            let newService = calculateTax(service, totalAmount, 'totalTax')
            Object.assign(tax_data, newService.tax_info)
            service.tax_info = tax_data
        }
    },
    addTransaction: async function (data) {
        var balance = data.transaction_amount;
        var userBalance = 0
        var transaction_amount = data.transaction_amount;
        var due = data.transaction_amount;
        var details = await q.all(this.getStatementDetails(data));
        if (details) {

            var add = parseFloat(details.totalSale + details.totalPaymentOut + details.totalPurchaseCancelled + details.totalPurchaseReturned)
            // console.log("Adds  = " + add);
            var sub = parseFloat(details.totalPurchase + details.totalPaymentIn + details.totalSaleCancelled);
            // console.log("Subs  = " + sub);

            balance = parseFloat(details.totalSale + details.totalPaymentOut + details.totalPurchaseCancelled + details.totalPurchaseReturned) - parseFloat(details.totalPurchase + details.totalPaymentIn + details.totalSaleCancelled);
            userBalance = parseFloat(details.totalPurchase + details.totalPaymentIn + details.totalSaleCancelled) - parseFloat(details.totalSale + details.totalPaymentOut + details.totalPurchaseCancelled + details.totalPurchaseReturned);
            // console.log(" Old Balance = " + balance);
            transaction_amount = parseFloat(data.transaction_amount);

            // .sort({ created_at: -1 })
            // console.log("TYPE  = " + data.type)
            if (data.type == "Sale" || data.type == "Purchase") {
                // , 'Purchase Cancelled'
                // , transaction_type: { $nin: ['Sale Cancelled'] }
                var sourceData = await Statements.find({ user: data.user, source: data.source, type: { $in: ['Sale', 'Purchase', 'Purchase Returned'] }, payment_status: { $ne: "Failure" } }).exec();
                // var statementsData = await Statements.find({ user: data.user, type: { $in: ['Sale', 'Purchased'] }, source: data.source, payment_status: { $ne: "Failure" } }).exec();

                // console.log(" 3411 sourceData.length   = " + sourceData.length)
                if (sourceData.length > 0) {


                    if (data.type == 'Sale') {
                        var sourceLog = _.filter(sourceData, transaction => transaction.type == "Sale");
                        var sourcePayment = parseFloat(_.sumBy(sourceLog, x => x.transaction_amount));
                        transaction_amount = parseFloat(data.transaction_amount) - parseFloat(sourcePayment);
                        balance = balance + transaction_amount;
                        userBalance -= transaction_amount;
                    } else if (data.type == "Purchase") {
                        var sourceLog = _.filter(sourceData, transaction => transaction.type == "Purchase");
                        var sourcePayment = parseFloat(_.sumBy(sourceLog, x => x.transaction_amount));
                        var sourceReturnedLog = _.filter(sourceData, transaction => transaction.type == "Purchase Returned");
                        var sourceReturnedPayment = parseFloat(_.sumBy(sourceReturnedLog, x => x.transaction_amount));
                        transaction_amount = parseFloat(data.transaction_amount) - parseFloat(sourcePayment) + parseFloat(sourceReturnedPayment);

                        balance = balance - transaction_amount;
                        userBalance += transaction_amount;

                    }

                } else {
                    // console.log("Source Else inside source ")
                    transaction_amount = parseFloat(data.transaction_amount);

                    if (data.type == 'Sale') {
                        balance = balance + data.transaction_amount;
                        userBalance -= transaction_amount;

                    } else if (data.type == "Purchase") {
                        balance = balance - parseFloat(data.transaction_amount);
                        userBalance = userBalance + parseFloat(transaction_amount);
                        // due = balance + data.transaction_amount;

                    } else if (data.type == "Sale Cancelled") {

                        balance = balance - data.transaction_amount;
                        userBalance += transaction_amount;

                    }
                    else if (data.type == "Purchase Cancelled") {
                        balance = balance + parseFloat(data.transaction_amount)
                        userBalance -= transaction_amount;

                    }
                    else if (data.type == "Payment-In") {
                        balance = balance - data.transaction_amount;
                        userBalance += transaction_amount;

                    }
                    else if (data.type == "Payment-Out") {
                        balance = balance + data.transaction_amount
                        userBalance -= transaction_amount;

                    }
                }
            }
            else {
                // console.log("Source Else ")
                if (data.type == 'Sale') {
                    balance = balance + data.transaction_amount;
                    userBalance -= transaction_amount;

                } else if (data.type == "Purchase") {
                    balance = balance - data.transaction_amount;
                    userBalance += transaction_amount;
                    // due = balance + data.transaction_amount;

                } else if (data.type == "Sale Cancelled") {
                    // console.log(balance + " - " + data.transaction_amount + " = ")
                    balance = balance - data.transaction_amount;
                    userBalance += transaction_amount;
                    // due = balance + data.transaction_amount;
                    // console.log("Balance After CANCELLED  = " + balance)
                }
                else if (data.type == "Purchase Cancelled") {
                    // console.log(balance + " + " + data.transaction_amount + " = ")

                    balance = parseFloat(balance) + parseFloat(data.transaction_amount);
                    // console.log(" 3699 Balance After CANCELLED  = " + balance)

                    userBalance = parseFloat(userBalance) - parseFloat(transaction_amount);
                    // due = balance + data.transaction_amount;
                }
                else if (data.type == "Purchase Returned") {
                    // console.log(balance + " + " + data.transaction_amount + " = ")

                    balance = parseFloat(balance) + parseFloat(data.transaction_amount);
                    // console.log(" 3708 Balance After Returned  = " + balance)

                    userBalance = userBalance - transaction_amount;
                    // due = balance + data.transaction_amount;
                }
                else if (data.type == "Payment-In") {

                    // console.log("   Payment in = " + balance + "  - " + data.transaction_amount)
                    balance = balance - data.transaction_amount;
                    userBalance += transaction_amount;
                    // due = balance + data.transaction_amount;
                }
                else if (data.type == "Payment-Out") {
                    balance = balance + data.transaction_amount
                    userBalance -= transaction_amount;
                    // due = balance + data.transaction_amount;
                }
            }

        } else {
            // console.log("Else  = " + data.transaction_amount)
            balance = data.transaction_amount;
            transaction_amount = data.transaction_amount;


        }
        // console.log("Transaction dATA = " + transaction_amount + ", Balance = " + balance + " User Balance  = " + userBalance)
        // console.log("data.user = " + data.user + ", data.business = " + data.business + " data.status  = " + data.status)
        // console.log("data.type = " + data.type + ", data.activity = " + data.activity + " data.paid_by  = " + data.paid_by)
        // console.log("data.source = " + data.source)
        // console.log("data.bill_id = " + data.bill_id)
        // console.log("data.bill_amount = " + data.bill_amount)
        // console.log("data.bill_id = " + data.bill_id + ", data.bill_amount.toFixed(2) = " + data.bill_amount + " balance.toFixed(2),  = " + balance)
        // console.log("data.paid_total.toFixed(2), = " + data.paid_total.toFixed(2) + ", userBalance.toFixed(2), = " + userBalance.toFixed(2) + " data.payment_status  = " + data.payment_status)
        // console.log("data.transaction_id = " + data.transaction_id + ", userBalance.toFixed(2), = " + data.transaction_date + " data.transaction_status  = " + data.payment_status)

        var newTransaction = {
            user: data.user,
            business: data.business,
            status: data.status,
            type: data.type,
            paid_by: data.paid_by,
            activity: data.activity,
            source: data.source,
            bill_id: data.bill_id,
            bill_amount: data.bill_amount.toFixed(2),
            transaction_amount: transaction_amount.toFixed(2),
            balance: balance.toFixed(2),
            total: balance.toFixed(2),
            paid_total: data.paid_total.toFixed(2),
            due: userBalance.toFixed(2),
            payment_status: data.payment_status,
            payment_mode: data.payment_mode,
            received_by: data.received_by,
            transaction_id: data.transaction_id,
            transaction_date: data.transaction_date,
            transaction_status: data.transaction_status,
            transaction_response: data.transaction_response,
            transaction_type: data.transaction_type,
            created_at: new Date(),
            updated_at: new Date(),
        };

        // console.log("NEW Transaction Data = \n " + JSON.stringify(newTransaction));
        await Statements.create(newTransaction).then(async function (transaction) {
            // console.log("Created " + transaction.type)
            return true;
            // await User.findByIdAndUpdate(data.user), { $push: { transactions: transaction._id } }, { new: true }, async function (err, doc) { }
        })
        // }
    },

    getStatementDetails: async function (data) {
        var details = {}
        var partyData = await Statements.find({ user: data.user, business: data.business, transaction_status: { $ne: "Failure" } }).exec();
        if (partyData.length > 0) {

            var salses_log = _.filter(partyData, transaction => transaction.type == "Sale");
            var totalSale = parseFloat(_.sumBy(salses_log, x => x.transaction_amount));
            // console.log("3390 Sale Payment = " + totalSale)

            var salsesCancelled_log = _.filter(partyData, transaction => transaction.type == "Sale Cancelled");
            var totalSaleCancelled = parseFloat(_.sumBy(salsesCancelled_log, x => x.transaction_amount));
            // console.log("3394 Sale Cancelled Payment = " + totalSaleCancelled)

            // console.log("Cancelled data " + totalSaleCancelled)
            var purchase_log = _.filter(partyData, transaction => transaction.type == "Purchase");
            var totalPurchase = parseFloat(_.sumBy(purchase_log, x => x.transaction_amount));
            // console.log("totalPurchase data " + totalPurchase)

            var purchaseCancelled_log = _.filter(partyData, transaction => transaction.type == "Purchase Cancelled");
            var totalPurchaseCancelled = parseFloat(_.sumBy(purchaseCancelled_log, x => x.transaction_amount));
            // console.log("totalPurchase data " + totalPurchaseCancelled)

            var purchaseReturned_log = _.filter(partyData, transaction => transaction.type == "Purchase Returned");
            var totalPurchaseReturned = parseFloat(_.sumBy(purchaseReturned_log, x => x.transaction_amount));
            // console.log("totalPurchase data " + totalPurchaseReturned)

            var paymentIn_log = _.filter(partyData, transaction => transaction.type == "Payment-In");
            var totalPaymentIn = parseFloat(_.sumBy(paymentIn_log, x => x.transaction_amount));
            // console.log("totalPaymentIn data " + totalPaymentIn)

            var paymentOut_log = _.filter(partyData, transaction => transaction.type == "Payment-Out");
            var totalPaymentOut = parseFloat(_.sumBy(paymentOut_log, x => x.transaction_amount));
            // console.log("totalPaymentOut data " + totalPaymentOut)

            var lastTransaction = partyData[0].created_at;

            var userDetails = await User.findById(data.user).exec();
            details = {
                totalSale: totalSale,
                totalSaleCancelled: totalSaleCancelled,
                totalPurchase: totalPurchase,
                totalPurchaseCancelled: totalPurchaseCancelled,
                totalPurchaseReturned: totalPurchaseReturned,
                totalPaymentIn: totalPaymentIn,
                totalPaymentOut: totalPaymentOut,
                balance: (totalSale + totalPaymentOut + totalPurchaseCancelled + totalPurchaseReturned) - (totalSaleCancelled + totalPurchase + totalPaymentIn),
                lastTransaction: partyData[0].created_at,
                party: userDetails
            }
            return details;

        } else {
            details = {
                totalSale: 0,
                totalSaleCancelled: 0,
                totalPurchase: 0,
                totalPurchaseCancelled: 0,
                totalPaymentIn: 0,
                totalPaymentOut: 0,
                balance: 0,
                totalPurchaseReturned: 0,
                lastTransaction: null,
                party: {}
            }
            return details;

        }



    },
    markTransactionFaiure: async function (data) {
        // var transactions = await TransactionLog.find({ type: { $in: ['Sale', 'Purcahse'] }, transaction_status: "Success", source: data.source }).exec();
        // console.log("transactions.length = " + transactions.length)
        // if (transactions.length != 0) {
        // console.log("DATA Sale Found")
        //     await Statement.findOneAndUpdate({_id:data._id },
        //         {
        //             $set: {
        //                 payment_status: 'Faiure',
        //                 transaction_status: 'Faiure',
        //                 updated_at: new Date(),
        //             }
        //         }, { new: true }, async function (err, doc) {
        //         })
        //     return true;
        // } else {
        //     return false;

        // }
        return true;
    },
















    // removeDublicateDoumnets: async function (originalArray, prop) {
    //     var newArray = [];
    //     var lookupObject = {};

    //     for (var i in originalArray) {
    //         lookupObject[originalArray[i][prop]] = originalArray[i];
    //     }

    //     for (i in lookupObject) {
    //         newArray.push(lookupObject[i]);
    //     }

    //     return newArray;
    // }
    //Shubham Tyagi
    partsTaxCalculation: async function (business, products) {
        var items = []
        var tax = []
        var total = 0
        // console.log("products ", products)


        if (products.length > 0) {
            for (var p = 0; p < products.length; p++) {
                if (products[p].lot != null && products[p].quantity != null) {
                    var product = await BusinessProduct.findOne({ part_no: products[p].part_no, business: business }).exec();
                    var tax_info = await Tax.findOne({ tax: products[p].tax }).exec();
                    // console.log("taxInfo ",JSON.stringify(tax_info.detail))
                    if (tax_info) {
                        if (product) {
                            // console.log("Product ")
                            var rate = products[p].mrp;
                            var amount = products[p].amount;
                            var tax_rate = tax_info.detail;
                            var base = amount

                            var discount = products[p].discount;

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
                            //     discount = parseFloat(discount);
                            //     if(!isNaN(discount) && discount>0 )
                            //     {
                            //         amount = amount - parseFloat(discount.toFixed(2))
                            //     }
                            // }

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
                                total = total + amount;
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
                                total = total + amount;
                            }

                            var tax_details = {
                                tax: tax_info.tax,
                                rate: tax_info.rate,
                                amount: total,
                                detail: tax
                            }


                            items.push({
                                product: product.product,
                                part_no: products[p].part_no,
                                hsn_sac: products[p].hsn_sac,
                                title: product.title,
                                quantity: products[p].quantity,
                                stock: products[p].quantity * products[p].lot,
                                sku: products[p].sku,
                                unit_price: products[p].unit_price,
                                unit: products[p].unit,
                                lot: products[p].lot,
                                mrp: products[p].mrp,
                                rate: products[p].rate,
                                base: base,
                                tax_amount: _.sumBy(tax, x => x.amount),
                                amount: amount,
                                models: product.models,
                                amount_is_tax: products[p].amount_is_tax,
                                sell_price: products[p].rate,
                                margin: products[p].margin,
                                discount: products[p].discount,
                                discount_type: products[p].discount_type,
                                discount_total: discount_total,
                                tax: tax_info.tax,
                                tax_rate: tax_info.rate,
                                tax_info: tax,
                            });

                            tax = [];
                        }
                        else {
                            var rate = products[p].mrp;
                            var amount = products[p].mrp;
                            var tax_rate = tax_info.detail;
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
                                discount = parseFloat(discount);
                                if (!isNaN(discount) && discount > 0) {
                                    amount = amount - parseFloat(discount.toFixed(2))
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
                                //amount = products[p].mrp;
                                total = total + amount;
                            }

                            var tax_details = {
                                tax: tax_info.tax,
                                rate: tax_info.rate,
                                amount: total,
                                detail: tax
                            }

                            items.push({
                                product: null,
                                part_no: products[p].part_no,
                                hsn_sac: products[p].hsn_sac,
                                title: products[p].title,
                                quantity: products[p].quantity,
                                stock: products[p].quantity * products[p].lot,
                                lot: products[p].lot,
                                unit: products[p].unit,
                                sku: products[p].sku,
                                mrp: products[p].mrp,
                                rate: products[p].rate,
                                base: base,
                                amount: amount,
                                tax_amount: _.sumBy(tax, x => x.amount),
                                models: products[p].models,
                                amount_is_tax: products[p].amount_is_tax,
                                unit_price: products[p].unit_price,
                                sell_price: products[p].rate,
                                margin: products[p].margin,
                                discount: products[p].discount,
                                discount_total: discount_total,
                                tax: tax_info.tax,
                                tax_rate: tax_info.rate,
                                tax_info: tax,
                            });

                            tax = [];
                        }
                    }
                    else {
                        return false
                    }
                }
            } return items



        }
    },
    addOrderLineItems: async function (items, orderId, business, user) {
        for (var p = 0; p < items.length; p++) {

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
            var loggedInDetails = await User.findById(business).exec();
            // var loggedInDetails = await User.findById(decoded.user).exec();
            if (order) {
                var products = items[p];
                products['title'] = products.item;
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
                                    issued: false,
                                    added_by_customer: false,
                                    delivery_date: businessOrder.delivery_date,
                                    tracking_no: Math.round(+new Date() / 1000) + "-" + Math.ceil((Math.random() * 90000) + 10000),
                                    business: products.business,
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

                    OrderLine.create(items).then(async function (ol) {
                        var items = await OrderLine.find({ order: order._id, business: business, status: { $nin: ["Cancelled"] } }).exec();

                        if (businessOrder.payment.convenience_charges) {
                            convenience_charges = Math.ceil(businessOrder.payment.convenience_charges);
                        }

                        var discount = parseFloat(_.sumBy(items, x => x.discount_total).toFixed(2));
                        var amount = parseFloat(_.sumBy(items, x => x.amount).toFixed(2));
                        var total = amount + discount + convenience_charges;

                        var transaction_log = await q.all(fun.getOrderTransaction(order, business));
                        var paid_total = transaction_log.paid_total;

                        var data = {
                            updated_at: new Date(),
                            "payment.paid_total": paid_total,
                            "payment.amount": parseFloat(amount.toFixed(2)),
                            "payment.discount_total": parseFloat(discount.toFixed(2)),
                            "payment.total": parseFloat(total.toFixed(2)),
                            due: {
                                due: Math.ceil(amount) + convenience_charges - paid_total
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

        }
    },

    salesPartIssue: async function (product, business, user, loggedInDetails) {
        // console.log("Stock Remove Sigle Item=   " + purchase)
        var part_no = product.part_no;
        part_no = part_no.replace(/,/g, ", ");
        part_no = part_no.toUpperCase();

        // { $gte: floor, $lte: ceil }
        // console.log(" 43464 part_no = " + part_no)
        // console.log("business-= " + business)
        // var unit_price = product.amount / product / quantity;
        // var floor = Math.floor(unit_price) - 0.50;
        // var ceil = Math.ceil(unit_price) + 0.50;
        var quantity = product.quantity;
        var businessProduct = await BusinessProduct.findOne({ _id: product.product, business: business }).sort({ updated_at: -1 }).exec();
        // var businessProduct = await BusinessProduct.findOne({ part_no: part_no, "price.purchase_price": { $gte: floor, $lte: ceil }, business: business }).sort({ updated_at: -1 }).exec();
        var margin_total = 0;
        var totalSkuStock = 0
        var availSkuStock = 0
        var sku = {}
        if (businessProduct) {
            // if (businessProduct.stock.available >= quantity) {

            var checkSku = _.filter(businessProduct.sku, sku => sku.sku == product.sku);


            if (checkSku.length > 0) {

                totalSkuStock = parseFloat(checkSku[0].total) - parseFloat(quantity);

                availSkuStock = parseFloat(checkSku[0].available) - parseFloat(quantity);

                sku = {
                    sku: product.sku,
                    total: totalSkuStock,
                    available: availSkuStock,
                    cretaed_at: checkSku[0].cretaed_at,
                    updated_at: new Date(),
                }
            }
            else {
                // console.log("43492  Inside Else of checkSku.length  product.sku=   " + product.sku)

                sku = {
                    sku: product.sku,
                    total: quantity,
                    available: quantity,
                    cretaed_at: new Date()

                }
            }

            // var stockTotal = parseFloat(businessProduct.stock.total) + parseFloat(quantity);
            var consumedTotal = parseFloat(businessProduct.stock.consumed) + parseFloat(quantity);
            var stockAvailable = parseFloat(businessProduct.stock.available) - parseFloat(quantity);
            var stockTotal = parseFloat(consumedTotal) + parseFloat(stockAvailable);

            let data = {}


            data = {
                stock: {
                    total: stockTotal,
                    // consumed: stockTotal - stockAvailable,
                    consumed: consumedTotal,
                    available: stockAvailable,
                },
                // sku: sku,
                updated_at: new Date()
            };
            // }
            await BusinessProduct.findOneAndUpdate({ _id: businessProduct._id, business: business }, { $set: data }, { new: true }, async function () {
                // console.log(data)
                await BusinessProduct.findOneAndUpdate({ _id: businessProduct._id, business: business }, { "$pull": { "sku": { "sku": product.sku } } }, async function (err, productData) {
                    var logs = []
                    if (productData.logs) {
                        logs = productData.logs;
                    }
                    logs.push({
                        vendor_name: user.name,
                        quantity: quantity,
                        unit_price: product.unit_price,
                        price: product.amount,
                        received_by: loggedInDetails.name,
                        purchase: null,
                        order: product.order,
                        business: business,
                        activity: "Sales",
                        created_at: new Date()
                    });



                    await BusinessProduct.findOneAndUpdate({ _id: businessProduct._id, business: business }, { $push: { sku: sku }, $set: { logs: logs } }, { new: true }, async function () {
                        // var activity = {
                        //     vendor_name: user.name,
                        //     quantity: quantity,
                        //     unit_price: product.unit_price,
                        //     price: product.amount,
                        //     received_by: loggedInDetails.name,
                        //     purchase: null,
                        //     order: product.order,
                        //     business: business,
                        //     activity: "Sales",
                        //     created_at: new Date()
                        // };
                        // await fun.productLog(businessProduct._id, activity);

                    });
                });

            });
            return true;


        }
        else {
            // console.log("Product not Found")
            return false;
        }

    },
    createLinkedPurcahseOrder: async function (purchaser_id, salesOrder, loggedInName) {
        var parts = [];
        // var loggedInDetails = await User.findById(loggedInUser).exec();
        console.log("Sales Order  = " + salesOrder)
        console.log("purchaser_id  = " + purchaser_id)
        var sales = await Order.findById(salesOrder).populate({ path: 'business', select: '_id id name contact_no email' }).exec();
        var purchaser = await User.findById(purchaser_id).exec();
        if (purchaser) {
            var vendorOrder = await VendorOrders.findOne({ order: salesOrder, status: { $nin: ['Cancelled'] } }).exec();
            if (!vendorOrder) {
                // order: o._id
                var car = null;
                var booking = null;

                console.log("sales.business._id  = " + sales.business._id)
                var orderNo = await VendorOrders.find({ business: purchaser_id }).count();
                var req_no = Math.round(+new Date() / 1000);
                var data = {
                    vendor: sales.business._id,
                    business: purchaser._id,
                    car: car,
                    booking: booking,
                    parts: parts,
                    // parts: quotationsPart,
                    order_link: 'http://localhost:4200/vendors/orders?id=',
                    shop_name: sales.business.name,
                    contact_no: sales.business.contact_no,
                    email: sales.business.email,
                    totalQuotations: 0,
                    order: sales._id,
                    isOrder: true,
                    orderSent: true,
                    request_no: req_no,
                    // { order: o._id, isOrder: true, orderSent: true, request_no: req_no }  
                    status: 'Confirmed',
                    order_status: "Open",
                    quotation: null,
                    order_no: orderNo + 1,
                    created_at: new Date(),
                    updated_at: new Date(),
                    logs: {
                        business: purchaser._id,
                        activity_by: loggedInName,
                        activity: "Order Created",
                        // time: new Date().getTime.toLocaleTimeString(),
                        remark: "",
                        created_at: new Date(),
                    }
                }
                await VendorOrders.create(data).then(async function (purchase) {
                    var activity = {
                        business: purchaser._id,
                        activity_by: loggedInName,
                        activity: "Order Created",
                        // time: new Date().getTime.toLocaleTimeString(),
                        remark: "",
                        created_at: new Date(),
                    }
                    // var datass = await q.all(this.vendorOrderLogs(purchase._id, activity))
                    // vendorOrderLogs(purchase._id, activity)
                    // sales.isPurchaseOrder = true;
                    // sales.vendorOrder = purchase._id;
                    // await sales.save();
                    await Order.findOneAndUpdate({ _id: sales._id }, { $set: { vendorOrder: purchase._id, isPurchaseOrder: true } }, { new: true }, async function (err, doc) {
                        if (err) {
                            res.status(422).json({
                                responseCode: 422,
                                responseMessage: "Server Errro",
                                responseData: err
                            });
                        }
                        else {
                            await BusinessOrder.findOneAndUpdate({ order: sales._id }, { $set: { vendorOrder: purchase._id, isPurchaseOrder: true } }, { new: true }, async function (err, doc) {
                            })
                        }
                    })
                    // console.log("Vendor Order Created" + JSON.stringify(purchase, null, '\t'));
                });
                return true;
            } else {

                // console.log("Vendor Not Found");
                return false;
            }
        } else {
            // console.log("Purchase Order is already  existsed for this sale");
            return false;



        }
    },
    vendorOrderLogs: async function (b, activity) {
        var remark = ""
        if (activity.remark) {
            remark = activity.remark;
        }
        var vendorOrder = await VendorOrders.findOne({ _id: b }).exec();
        if (vendorOrder) {
            var logs = [];
            if (vendorOrder.logs) {
                logs = vendorOrder.logs;
            }
            logs.push({
                business: activity.business,
                activity_by: activity.activity_by,
                activity: activity.activity,
                remark: activity.remark,
                created_at: activity.created_at,
            });
            await VendorOrders.findOneAndUpdate({ _id: b }, { $set: { logs: logs } }, { new: true }, async function (err, doc) { })
        }
    },
    salesOrderLogs: async function (b, activity) {
        var remark = ""
        if (activity.remark) {
            remark = activity.remark;
        }
        var vendorOrder = await BusinessOrder.findOne({ order: b }).exec();
        if (vendorOrder) {
            var logs = [];
            if (vendorOrder.logs) {
                logs = vendorOrder.logs;
            }
            logs.push({
                business: activity.business,
                activity_by: activity.activity_by,
                activity: activity.activity,
                remark: activity.remark,
                created_at: activity.created_at,
            });
            await BusinessOrder.findOneAndUpdate({ order: b }, { $set: { logs: logs } }, { new: true }, async function (err, doc) { })
        }
    },
    salesLogs: async function (b, activity) {
        var remark = ""
        if (activity.remark) {
            remark = activity.remark;
        }
        var sales = await Sales.findOne({ _id: b }).exec();
        if (sales) {
            var logs = [];
            if (sales.logs) {
                logs = sales.logs;
            }
            logs.push({
                business: activity.business,
                activity_by: activity.activity_by,
                activity: activity.activity,
                remark: activity.remark,
                created_at: activity.created_at,
            });
            await Sales.findOneAndUpdate({ _id: b }, { $set: { logs: logs } }, { new: true }, async function (err, doc) { })
        }
    },
    QuotationItemAddLog: async function (b, activity) {
        // console.log("Inside Function ")

        var remark = ""
        if (activity.remark) {
            remark = activity.remark;
        }
        var quotation = await QuotationOrders.findOne({ _id: b }).exec();
        if (quotation) {
            var logs = [];
            if (quotation.logs) {
                logs = quotation.logs;
            }
            logs.push({
                activity_by: activity.activity_by,
                business: activity.business,
                activity: activity.activity,
                created_at: activity.created_at
            });

            QuotationOrders.findOneAndUpdate({ _id: b }, { $set: { logs: logs } }, { new: true }, async function (err, doc) { })
        }
    },
    salesLogs: async function (b, activity) {
        var remark = ""
        if (activity.remark) {
            remark = activity.remark;
        }
        var sale = await Sales.findOne({ _id: b }).exec();
        if (sale) {
            var logs = [];
            if (sale.logs) {
                logs = sale.logs;
            }
            logs.push({
                business: activity.business,
                activity_by: activity.activity_by,
                activity: activity.activity,
                remark: activity.remark,
                created_at: activity.created_at,
            });
            await Sales.findOneAndUpdate({ _id: b }, { $set: { logs: logs } }, { new: true }, async function (err, doc) { })
        }
    },
    parchiLogs: async function (b, activity) {
        var remark = ""
        if (activity.remark) {
            remark = activity.remark;
        }
        var parchi = await Parchi.findOne({ _id: b }).exec();
        if (parchi) {
            var logs = [];
            if (parchi.logs) {
                logs = parchi.logs;
            }
            logs.push({
                business: activity.business,
                activity_by: activity.activity_by,
                activity: activity.activity,
                remark: activity.remark,
                created_at: activity.created_at,
            });
            await Parchi.findOneAndUpdate({ _id: b }, { $set: { logs: logs } }, { new: true }, async function (err, doc) { })
        }
    },




















    getOutBoundAssignee: async function (user, business) {
        var role = await Management.findOne({ user: user, business: business }).exec();

        if (role.role == "CRE-Outbound") {
            assignee = role.user;
        }
        else {
            var assigneeLead = [];
            await Management.find({ business: business, role: "CRE-Outbound" })
                .cursor().eachAsync(async (a) => {
                    // var d = await Lead.find({ business: business, assignee: a.user, status: { $in: ['Open', 'Follow-Up'] } }).count().exec();
                    var open = await OutBoundLead.find({ business: business, assignee: a.user, 'status': { $in: ['Open',] } }).count().exec();
                    var follow_up = await OutBoundLead.find({ business: business, assignee: a.user, 'status': { $in: ['Follow-Up'] }, 'follow_up.date': { $lte: new Date() } }).count().exec();
                    var d = open + follow_up;
                    assigneeLead.push({
                        user: a.user,
                        count: d
                    })
                });

            if (assigneeLead.length != 0) {
                assigneeLead.sort(function (a, b) {
                    return a.count > b.count;
                });

                assignee = assigneeLead[0].user;

            }
            else {
                assignee = role.business;
            }
        }


        return assignee;
    },

    outboundLeadAdd: async function (booking, category) {
        // console.log("Called Outboudn lead Function")
        var booking = await Booking.findOne({ _id: booking })
            .populate({ path: 'user', select: '_id name contact_no email ' })
            .populate('car',)
            .exec();
        if (booking) {
            var data = {}
            var follow_up = {};
            var business = booking.business;
            var user = booking.user
            if (user) {
                var last = await OutBoundLead.findOne({ user: user._id, car: booking.car._id, category: category, business: business, status: { $in: ["Open", "Follow-Up"] } }).sort({ updated_at: -1 }).exec();
                if (last) {
                    // console.log("Update  " + last._id)
                    status = last.status;
                    var insurance_rem = null
                    if (booking.car.insurance_info && category == 'Insurance') {
                        if (booking.car.insurance_info.expire) {
                            status = "Open";
                            // status = "Open";
                            // new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
                            var reminderYear = new Date().getFullYear();
                            if (booking.car.insurance_info.expire.getFullYear() >= new Date().getFullYear()) {
                                reminderYear = booking.car.insurance_info.expire.getFullYear()
                            }

                            var bar = new Date(reminderYear, booking.car.insurance_info.expire.getMonth(), booking.car.insurance_info.expire.getDate());

                            insurance_rem = new Date(bar).toISOString();

                            // console.log("Date New Follow year = " + new Date(bar))
                            // var bar = new Date(booking.car.insurance_info.expire)
                            bar.setDate(bar.getDate() - 35);
                            // insurance_rem = new Date(bar).toISOString();
                            follow_up = {
                                date: new Date(bar).toISOString(),
                                time: '',
                                created_at: new Date(),
                                updated_at: new Date()
                            }
                        } else {
                            status = "Open"
                        }
                    } else if (category == 'ServiceReminder') {
                        var reminderDate = new Date();
                        if (booking.service_reminder) {
                            reminderDate = new Date(booking.service_reminder);
                        } else {
                            // reminderDate = booking.service_reminder;
                            reminderDate = reminderDate.setDate(new Date().getDate() + 180);
                        }
                        // insurance_rem=reminderDate
                        // console.log("Reminder Date = " + reminderDate)
                        if (last.status == 'Follow-Up') {
                            status = "Follow-Up"
                            var follow_up = {
                                date: new Date(reminderDate).toISOString(),
                                time: null,
                                updated_at: new Date()
                            }
                        } else {
                            status = "Open"
                            var follow_up = {}
                        }
                    } else if (category == 'Dissatisfied') {
                        status = "Open"
                        var follow_up = {}
                    }
                    var updateLead = {
                        user: user._id,
                        car: booking.car,
                        status: status,
                        booking: booking._id,
                        lead: booking.lead,
                        name: user.name,
                        insurance_rem: insurance_rem,
                        contact_no: user.contact_no,
                        email: user.email,
                        follow_up: follow_up,
                        reminderDate: reminderDate,
                        updated_at: new Date(),
                    };

                    await OutBoundLead.findOneAndUpdate({ _id: last._id }, { $set: updateLead }, { new: true }, async function (err, doc) {
                        await LeadGenRemark.create({
                            lead: last._id,
                            source: last.source,
                            type: last.type,
                            status: doc.status,
                            reason: '',
                            customer_remark: '',
                            assignee_remark: '',
                            assignee: last.assignee,
                            color_code: "",
                            created_at: new Date(),
                            updated_at: new Date()
                        }).then(async function (newRemark) {
                            await OutBoundLead.findOneAndUpdate({ _id: last._id }, { $push: { remarks: newRemark._id } }, { new: true }, async function (err, doc) {
                            })
                        });

                    })
                    return true;
                }
                else {
                    // console.log("New Lead")
                    var assignee = await q.all(this.getOutBoundAssignee(business, business));
                    var status = 'Open';
                    var insurance_rem = null
                    if (booking.car.insurance_info && category == 'Insurance') {
                        if (booking.car.insurance_info.expire) {
                            status = "Open";
                            // var bar = new Date(new Date().getFullYear(), booking.car.insurance_info.expire.getMonth(), booking.car.insurance_info.expire.getDate());
                            var reminderYear = new Date().getFullYear();
                            // console.log("Date New Follow year = " + booking.car.insurance_info.expire.getFullYear() + " >= " + new Date().getFullYear() + " = " + booking.car.insurance_info.expire.getFullYear() >= new Date().getFullYear());
                            if (booking.car.insurance_info.expire.getFullYear() >= new Date().getFullYear()) {
                                reminderYear = booking.car.insurance_info.expire.getFullYear()

                            }
                            var bar = new Date(reminderYear, booking.car.insurance_info.expire.getMonth(), booking.car.insurance_info.expire.getDate());
                            insurance_rem = new Date(bar).toISOString();

                            // console.log("Date New Follow year = " + new Date(bar))
                            // console.log("Date 35 days before " + new Date().getFullYear())
                            // var bar = new Date(booking.car.insurance_info.expire)

                            bar.setDate(bar.getDate() - 35);
                            // insurance_rem = new Date(bar).toISOString();

                            follow_up = {
                                date: new Date(bar).toISOString(),
                                time: '',
                                created_at: new Date(),
                                updated_at: new Date()
                            }
                        } else {
                            status = "Open"
                        }
                    } else if (category == 'ServiceReminder') {
                        // var reminderDate = null;
                        var reminderDate = new Date();
                        if (booking.service_reminder) {
                            reminderDate = new Date(booking.service_reminder);
                        } else {
                            reminderDate.setDate(new Date().getDate() + 180);
                        }
                        status = "Open"
                        var follow_up = {
                        }

                        // status = "Follow-Up"
                        // var follow_up = {
                        //     date: new Date(reminderDate).toISOString(),
                        //     time: null,
                        //     created_at: new Date(),
                        //     updated_at: new Date()
                        // }
                    } else if (category == 'Dissatisfied') {
                        status = "Open"
                        var follow_up = {}
                    } else if (category == 'Lost_Customer') {
                        status = "Open"
                        var follow_up = {}
                    }
                    var contacted = false;
                    var priority = 2;
                    // console.log(user.name + " ,User = " + JSON.stringify(user, null))

                    var userId = user._id;
                    var name = user.name;
                    var contact_no = user.contact_no;
                    var email = user.email;
                    //Abhinav Alternate
                    var variant = null;
                    var car = null;
                    if (booking.car) {
                        car = booking.car
                        variant = booking.car.variant
                    }
                    var alternate_no = ""

                    var additional_info = {
                        variant: variant,
                        alternate_no: alternate_no
                    }
                    var category = category;
                    var isStared = false;
                    var count = await OutBoundLead.find({ business: business }).count();
                    var lead_id = count + 10000;
                    var lead = {
                        user: userId,
                        car: car,
                        booking: booking,
                        lead: booking.lead,
                        name: name,
                        contact_no: contact_no,
                        email: email,
                        type: category,
                        insurance_rem: insurance_rem,
                        follow_up: follow_up,
                        status: status,
                        business: business,
                        assignee: assignee,
                        source: category,
                        priority: priority,
                        category: category,
                        additional_info: additional_info,
                        isStared: isStared,
                        lead_id: lead_id,
                        reminderDate: reminderDate,
                        created_at: new Date(),
                        updated_at: new Date(),

                    };
                    await OutBoundLead.create(lead).then(async function (l) {
                        await LeadGenRemark.create({
                            lead: l._id,
                            source: l.source,
                            type: l.type,
                            status: l.status,
                            reason: '',
                            customer_remark: '',
                            assignee_remark: '',
                            assignee: assignee,
                            color_code: "",
                            created_at: new Date(),
                            updated_at: new Date()
                        }).then(async function (newRemark) {
                            await OutBoundLead.findOneAndUpdate({ _id: l._id }, { $push: { remarks: newRemark._id } }, { new: true }, async function (err, doc) {
                            })
                        });
                    });
                    return true;
                }
            }

        }
    },
    outboundLostLeadAdd: async function (lead, category, loggedInDetails) {
        if (lead) {
            var data = {}
            var follow_up = {};
            var business = lead.business;
            var last = await OutBoundLead.findOne({ contact_no: lead.contact_no, category: category, business: business, status: { $in: ["Open", "Follow-Up"] } }).sort({ updated_at: -1 }).exec();
            if (last) {
                // console.log("Old Lead = " + last.contact_no)
                return false;
            }
            else {
                // console.log("New Lead = " + lead.contact_no)
                var assignee = await q.all(this.getOutBoundAssignee(business, business));
                // console.log("Assigneee  = " + assignee)
                var status = 'Open'
                var contacted = false;
                var priority = 2;

                var user = await User.findOne({ contact_no: lead.contact_no, 'account_info.type': "user" }).exec()
                if (user) {
                    var userId = user._id;
                    var name = user.name;
                    var contact_no = user.contact_no;
                    var email = user.email;
                } else {
                    var userId = null;
                    var name = lead.name;
                    var contact_no = lead.contact_no;
                    var email = lead.email;
                }


                //Abhinav Alternate
                var variant = null;
                var car = null;
                var alternate_no = "";
                if (lead.additional_info) {
                    if (lead.additional_info.variant) {
                        variant = lead.additional_info.variant;
                    }
                    if (lead.additional_info.alternate_no) {
                        alternate_no = lead.additional_info.alternate_no;
                    }
                }

                var additional_info = {
                    variant: variant,
                    alternate_no: alternate_no,
                    lost_reason: lead.remark.reason,
                }
                var category = category;
                var isStared = false;
                var count = await OutBoundLead.find({ business: business }).count();
                var lead_id = count + 10000;
                var lead = {
                    user: userId,
                    car: car,
                    booking: null,
                    name: name,
                    contact_no: contact_no,
                    email: email,
                    type: category,
                    follow_up: follow_up,
                    status: status,
                    business: business,
                    assignee: assignee,
                    source: category,
                    priority: priority,
                    category: category,
                    additional_info: additional_info,
                    isStared: isStared,
                    lead_id: lead_id,
                    created_at: new Date(),
                    updated_at: new Date(),

                };
                await OutBoundLead.create(lead).then(async function (l) {
                    await LeadGenRemark.create({
                        lead: l._id,
                        source: l.source,
                        type: l.type,
                        status: l.status,
                        reason: '',
                        customer_remark: '',
                        assignee_remark: '',
                        assignee: assignee,
                        color_code: "",
                        created_at: new Date(),
                        updated_at: new Date()
                    }).then(async function (newRemark) {



                        await OutBoundLead.findOneAndUpdate({ _id: l._id }, { $push: { remarks: newRemark._id } }, { new: true }, async function (err, doc) {
                        })
                    });
                });
                return true;
            }


        }
    },

    lostCustomersLeadAdd: async function () {
        var filters = [];
        var leads = []
        var bar = new Date()
        bar.setDate(bar.getDate() - 365);
        // console.log("Date = " + bar)
        var specification = {};
        specification['$match'] = {
            // status: "Active",
            $expr: {
                $and: [
                    { $eq: [{ $month: "$created_at" }, { $month: new Date(bar) }] },
                    { $eq: [{ $dayOfMonth: "$created_at" }, { $dayOfMonth: new Date(bar) }] },
                    { $eq: [{ $year: "$created_at" }, { $year: new Date(bar) }] }

                ]
            }
        };
        filters.push(specification);

        await Invoice.aggregate(filters)
            .allowDiskUse(true)
            .cursor({ batchSize: 10 })
            .exec()
            .eachAsync(async function (invoice) {
                var from = new Date()
                from.setDate(from.getDate() - 364);
                var total_invoices = await Invoice.find({
                    user: invoice.user,
                    created_at: {
                        $gte: new Date(from)
                    }
                }).count().exec();
                if (total_invoices == 0) {
                    leads.push({
                        booking: invoice.booking,
                        user: invoice.user
                    })
                }
            })
        leads = await q.all(this.removeDublicateDoumnets(leads, "user"));
        for (var i = 0; i < leads.length; i++) {
            var assignee = await q.all(this.outboundLeadAdd(leads[i].booking, 'Lost_Customer'));
            await new Promise(resolve => setTimeout(resolve, 800));
        }
    },

    databaseLeadAdd: async function (lead, category) {
        if (lead) {
            var data = {}
            var follow_up = {};
            var business = lead.business;
            var last = await OutBoundLead.findOne({ contact_no: lead.contact_no, category: category, business: business, status: { $in: ["Open", "Follow-Up"] } }).sort({ updated_at: -1 }).exec();
            if (last) {
                // console.log("Old Lead")
                return false;
            }
            else {
                // console.log("New Lead")
                // var assignee = await q.all(this.getOutBoundAssignee(loggedInDetails._id, business));
                var assignee = lead.assignee;
                // console.log("Assigneee  = " + assignee)
                var status = 'Open'
                var priority = 2;

                var user = await User.findOne({ contact_no: lead.contact_no, 'account_info.type': "user" }).exec()
                if (user) {
                    var userId = user._id;
                    var name = user.name;
                    var contact_no = user.contact_no;
                    var email = user.email;
                } else {
                    var userId = null;
                    var name = lead.name;
                    var contact_no = lead.contact_no;
                    var email = lead.email;
                }


                //Abhinav Alternate
                var variant = null;
                var car = null;
                var alternate_no = "";
                var category = category;
                var isStared = false;
                var count = await OutBoundLead.find({ business: business }).count();
                var lead_id = count + 10000;
                var lead = {
                    user: userId,
                    car: car,
                    booking: null,
                    name: name,
                    contact_no: contact_no,
                    email: email,
                    type: category,
                    follow_up: {},
                    date_added: new Date(lead.date_added),
                    status: 'Open',
                    remarks: lead.remarks,
                    business: lead.business,
                    assignee: lead.assignee,
                    source: lead.source,
                    priority: lead.priority,
                    category: category,
                    additional_info: lead.additional_info,
                    isStared: isStared,
                    lead_id: lead_id,
                    created_at: new Date(),
                    updated_at: new Date(),
                };
                await OutBoundLead.create(lead).then(async function (l) {
                    await LeadGenRemark.create({
                        lead: l._id,
                        source: l.source,
                        type: l.type,
                        status: l.status,
                        reason: '',
                        customer_remark: 'Database to Outbound System Transfer',
                        assignee_remark: 'Database to Outbound System',
                        assignee: assignee,
                        color_code: "",
                        created_at: new Date(),
                        updated_at: new Date()
                    }).then(async function (newRemark) {
                        await OutBoundLead.findOneAndUpdate({ _id: l._id }, { $push: { remarks: newRemark._id } }, { new: true }, async function (err, doc) {
                        })
                    });
                    await LeadGenRemark.updateMany({ lead: lead._id }, { $set: { lead: l._id } }).exec();
                });


                return true;
            }


        }
    },
    bookingOutboundLead: async function (l) {
        var booking = await Booking.findOne({ _id: l })
            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'business', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'car', select: '_id id title registration_no fuel_type' })
            .exec();

        var remarks = [];
        var logs = booking.logs;

        if (logs.length > 0) {
            var logged = logs[logs.length - 1].user;
        }
        else {
            var logged = booking.advisor;
        }

        var services = booking.services;

        services.forEach(async function (s) {
            remarks.push(s.service)
        });

        if (booking.lead) {
            var follow_up = {};
            var status = 'Converted';

            if (booking.status == "Cancelled") {
                var psf = false;
                status = "Closed"
            }
            var lead = await Lead.findById(booking.lead).exec();

            var data = {
                psf: psf,
                follow_up: follow_up,
                status: status,
                updated_at: new Date(),
            };
            // console.log("Log = " + status)
            var reamrk = {
                lead: lead._id,
                type: lead.remark.type,
                source: lead.remark.source,
                status: status,
                assignee: logged,
                assignee_remark: remarks.toString(),
                customer_remark: remarks.toString(),
                color_code: "#ffffff",
                created_at: new Date(),
                updated_at: new Date()
            }

            await OutBoundLead.findOneAndUpdate({ _id: booking.outbound_lead }, { $set: data }, { new: true }, async function (err, doc) {
                await LeadGenRemark.create(remark).then(function (newRemark) {
                    OutBoundLead.findOneAndUpdate({ _id: booking.outbound_lead }, { $push: { remarks: newRemark._id } }, { new: true }, async function (err, doc) {
                    })
                });
            });
        }
        else {
            return false;
        }
        // else {
        //     var checkLead = await OutBoundLead.find({ contact_no: booking.user.contact_no, "status": { $in: ["Open", "Follow-Up"] } }).sort({ updated_at: -1 }).exec();
        //     if (checkLead) {
        //         var follow_up = {};
        //         var status = 'Converted';
        //         if (booking.status == "Cancelled") {
        //             var psf = false;
        //             status = "Closed"
        //         }


        //         var data = {
        //             user: booking.user._id,
        //             name: booking.user.name,
        //             contact_no: booking.user.contact_no,
        //             email: booking.user.email,
        //             psf: psf,
        //             status: status,
        //             converted: true,
        //             follow_up: follow_up,
        //             updated_at: new Date(),
        //         };
        //         var remark = {
        //             lead: checkLead._id,
        //             type: '',
        //             source: '',
        //             status: status,
        //             assignee: logged,
        //             assignee_remark: "",
        //             customer_remark: "",
        //             color_code: "#ffffff",
        //             created_at: new Date(),
        //             updated_at: new Date()
        //         }
        //         await OutBoundLead.findOneAndUpdate({ _id: checkLead._id }, { $set: data }, { new: false }, async function (err, doc) {
        //             await LeadGenRemark.create(remark).then(function (newRemark) {
        //                 OutBoundLead.findOneAndUpdate({ _id: checkLead._id }, { $push: { remarks: newRemark._id } }, { new: true }, async function (err, doc) {
        //                 })
        //             });
        //         });

        //         await Booking.findOneAndUpdate({ _id: booking._id }, { $set: { lead: checkLead._id, manager: checkLead.assignee, converted: true } }, { new: false }, async function (err, doc) {
        //             if (err) {
        //             }
        //             else {
        //             }
        //         });
        //     }
        //     else {
        //         var follow_up = {};
        //         var status = 'Converted';

        //         if (booking.status == "Cancelled") {
        //             var psf = false;
        //             status = "Closed"
        //         }
        //         var manager = booking.business;
        //         var managers = [];
        //         await Management.find({ business: booking.business, role: "CRE" })
        //             .cursor().eachAsync(async (a) => {
        //                 // var d = await OutBoundLead.find({ business: booking.business, manager: a.user, 'remark.status': { $in: ['Open', 'Follow-Up'] } }).count().exec();

        //                 var open = await OutBoundLead.find({ business: booking.business, assignee: a.user, 'status': { $in: ['Open',] } }).count().exec();
        //                 var follow_up = await OutBoundLead.find({ business: booking.business, assignee: a.user, 'status': { $in: ['Follow-Up'] }, 'follow_up.date': { $lte: new Date() } }).count().exec();
        //                 var d = open + follow_up;
        //                 managers.push({
        //                     user: a.user,
        //                     count: d
        //                 })
        //             });

        //         if (managers.length != 0) {
        //             managers.sort(function (a, b) {
        //                 return a.count > b.count;
        //             });
        //             manager = managers[0].user;
        //         }

        //         var name = booking.user.name;

        //         var lead = {}
        //         var source = "Booking";



        //         lead.user = booking.user._id;
        //         lead.business = booking.business._id;
        //         lead.name = booking.user.name
        //         lead.contact_no = booking.user.contact_no;
        //         lead.email = booking.user.email;
        //         lead.assignee = manager;
        //         lead.status = status;

        //         lead.follow_up = follow_up;
        //         lead.psf = psf;
        //         lead.source = "Booking";
        //         lead.category = "Booking";
        //         lead.created_at = new Date();
        //         lead.updated_at = new Date();

        //         await OutBoundLead.create(lead).then(async function (ld) {
        //             await LeadGenRemark.create({
        //                 type: ld.type,
        //                 source: "Booking",
        //                 lead: ld._id,
        //                 assignee: logged,
        //                 status: booking.status,
        //                 assignee_remark: "",
        //                 customer_remark: "",
        //                 color_code: "#ffffff",
        //                 created_at: new Date(),
        //                 updated_at: new Date()
        //             }).then(function (newRemark) {
        //                 OutBoundLead.findOneAndUpdate({ _id: ld._id }, { $push: { remarks: newRemark._id } }, { new: true }, async function (err, doc) {
        //                 })
        //             });

        //             await Booking.findOneAndUpdate({ _id: booking._id }, { $set: { lead: ld._id, manager: manager } }, { new: false }, async function (err, doc) {
        //                 if (err) {
        //                     // console.log(err)
        //                 }
        //             });
        //         });
        //     }
        // }
    },

    bookingOutboundConvert: async function (l) {
        var booking = await Booking.findOne({ _id: l })
            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'business', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'car', select: '_id id title registration_no fuel_type' })
            .exec();

        var remarks = [];
        var logs = booking.logs;

        if (logs.length > 0) {
            var logged = logs[logs.length - 1].user;
        }
        else {
            var logged = booking.advisor;
        }

        var services = booking.services;

        services.forEach(async function (s) {
            remarks.push(s.service)
        });

        if (booking.outbound_lead) {
            var follow_up = {};
            // if (booking.status == "Completed") {
            //     var date = booking.updated_at;
            //     date.setDate(date.getDate() + 4)
            //     var newdate = moment(date).format("YYYY-MM-DD");
            //     var status = "PSF";
            //     var psf = true;
            //     follow_up = {
            //         date: new Date(newdate.toString()),
            //         created_at: new Date(),
            //         updated_at: new Date(),
            //     };
            // }
            // else
            // if (booking.status == "Cancelled") {
            //     var psf = false;
            //     var status = "Closed"
            // }
            // else {
            //     var psf = false;
            //     var status = booking.status;
            // }
            var status = 'Converted';

            if (booking.status == "Cancelled") {
                var psf = false;
                status = "Closed"
            }
            var lead = await OutBoundLead.findById(booking.outbound_lead).exec();
            var data = {
                // psf: psf,
                follow_up: follow_up,
                status: status,
                converted: true,
                updated_at: new Date(),
            };
            var reamrk = {
                lead: lead._id,
                type: lead.remark.type,
                source: lead.remark.source,
                status: status,
                assignee: logged,
                assignee_remark: remarks.toString(),
                customer_remark: remarks.toString(),
                color_code: "#ffffff",
                created_at: new Date(),
                updated_at: new Date()
            }

            await OutBoundLead.findOneAndUpdate({ _id: lead._id }, { $set: data }, { new: false }, async function (err, doc) {
                await LeadGenRemark.create(remark).then(function (newRemark) {
                    OutBoundLead.findOneAndUpdate({ _id: lead._id }, { $push: { remarks: newRemark._id } }, { new: true }, async function (err, doc) {
                    })
                });
            });
        }
        else {
            var checkLead = await OutBoundLead.find({ contact_no: booking.user.contact_no, "status": { $in: ["Open", "Follow-Up"] } }).sort({ updated_at: -1 }).exec();
            if (checkLead) {
                var follow_up = {};
                // if (booking.status == "Completed") {
                //     var date = booking.updated_at;
                //     date.setDate(date.getDate() + 4)
                //     var newdate = moment(date).format("YYYY-MM-DD");
                //     var status = "PSF";
                //     var psf = true;
                //     follow_up = {
                //         date: new Date(newdate.toString()),
                //         created_at: new Date(),
                //         updated_at: new Date(),
                //     };
                // }

                // else 

                // else {
                //     var psf = false;
                //     var status = booking.status;
                // }
                var status = 'Converted';

                if (booking.status == "Cancelled") {
                    var psf = false;
                    status = "Closed"
                }
                var data = {
                    user: booking.user._id,
                    name: booking.user.name,
                    contact_no: booking.user.contact_no,
                    email: booking.user.email,
                    // psf: psf,
                    status: status,
                    converted: true,
                    follow_up: follow_up,
                    updated_at: new Date(),
                };
                var remark = {
                    lead: checkLead._id,
                    type: '',
                    source: '',
                    status: status,
                    assignee: logged,
                    assignee_remark: "",
                    customer_remark: "",
                    color_code: "#ffffff",
                    created_at: new Date(),
                    updated_at: new Date()
                }


                await OutBoundLead.findOneAndUpdate({ _id: checkLead._id }, { $set: data }, { new: false }, async function (err, doc) {
                    await LeadGenRemark.create(remark).then(function (newRemark) {
                        OutBoundLead.findOneAndUpdate({ _id: checkLead._id }, { $push: { remarks: newRemark._id } }, { new: true }, async function (err, doc) {
                        })
                    });
                });
                // manager: checkLead.assignee,
                await Booking.findOneAndUpdate({ _id: booking._id }, { $set: { outbound_lead: checkLead._id, converted: true } }, { new: false }, async function (err, doc) {
                    if (err) {
                    }
                    else {
                    }
                });
            }
            // else {
            //     var follow_up = {};
            //     // if (booking.status == "Completed") {
            //     //     var date = booking.updated_at;
            //     //     date.setDate(date.getDate() + 4)
            //     //     var newdate = moment(date).format("YYYY-MM-DD");
            //     //     var status = "PSF";
            //     //     var psf = true;
            //     //     follow_up = {
            //     //         date: new Date(newdate.toString()),
            //     //         created_at: new Date(),
            //     //         updated_at: new Date(),
            //     //     };
            //     // }
            //     // else if (booking.status == "Cancelled") {
            //     //     var psf = false;
            //     //     var status = "Closed"
            //     // }
            //     // else {
            //     //     var psf = false;
            //     //     var status = booking.status;
            //     // }

            //     var manager = booking.business;
            //     var managers = [];
            //     await Management.find({ business: booking.business, role: "CRE" })
            //         .cursor().eachAsync(async (a) => {
            //             var d = await OutBoundLead.find({ business: booking.business, manager: a.user, 'remark.status': { $in: ['Open', 'Follow-Up'] } }).count().exec();
            //             managers.push({
            //                 user: a.user,
            //                 count: d
            //             })
            //         });

            //     if (managers.length != 0) {
            //         managers.sort(function (a, b) {
            //             return a.count > b.count;
            //         });
            //         manager = managers[0].user;
            //     }

            //     var name = booking.user.name;

            //     var lead = {}
            //     var source = "Booking";

            //     var status = 'Converted';

            //     lead.user = booking.user._id;
            //     lead.business = booking.business._id;
            //     lead.name = booking.user.name
            //     lead.contact_no = booking.user.contact_no;
            //     lead.email = booking.user.email;
            //     lead.assignee = manager;
            //     lead.status = status;

            //     lead.follow_up = follow_up;
            //     lead.psf = psf;
            //     lead.source = "Booking";
            //     lead.category = "Booking";
            //     lead.created_at = new Date();
            //     lead.updated_at = new Date();

            //     await OutBoundLead.create(lead).then(async function (ld) {
            //         await LeadGenRemark.create({
            //             type: ld.type,
            //             source: "Booking",
            //             lead: ld._id,
            //             assignee: logged,
            //             status: booking.status,
            //             assignee_remark: "",
            //             customer_remark: "",
            //             color_code: "#ffffff",
            //             created_at: new Date(),
            //             updated_at: new Date()
            //         }).then(function (newRemark) {
            //             OutBoundLead.findOneAndUpdate({ _id: ld._id }, { $push: { remarks: newRemark._id } }, { new: true }, async function (err, doc) {
            //             })
            //         });

            //         await Booking.findOneAndUpdate({ _id: booking._id }, { $set: { lead: ld._id, manager: manager } }, { new: false }, async function (err, doc) {
            //             if (err) {
            //                 // console.log(err)
            //             }
            //         });
            //     });
            // }
        }
    },
    ServiceReminderoutboundLeaCreate: async function (invoiceId, category) {
        const invoice = await Invoice.findById(invoiceId)
            .populate({ path: 'user', select: '_id name contact_no email ' })
            .populate('car')
            .populate('booking')
            .exec();
        if (invoice) {
            if (invoice.booking) {
                let data = {}
                let follow_up = {};
                const business = invoice.business;
                const user = invoice.user
                if (user && invoice.car) {
                    var last = await OutBoundLead.findOne({ user: user._id, car: invoice.car._id, category: category, business: business, status: { $in: ["Open", "Follow-Up"] } }).sort({ updated_at: -1 }).exec();
                    if (last) {
                        // console.log("Update  " + last._id)
                        status = last.status;
                        if (category == 'ServiceReminder') {
                            var reminderDate = new Date();

                            // let currentYear = new Date().getFullYear();
                            // let invoice_date = new Date(currentYear, invoice.updated_at.getMonth(), invoice.updated_at.getDate());

                            // reminderDate = invoice_date.setDate(new Date(invoice_date).getDate() + 180);
                            // console.log("Last Service = " + new Date(invoice.updated_at).toISOString() + " // Reminder = " + new Date(reminderDate).toISOString(),)

                            // reminderDate = invoice_date.setDate(invoice_date.getMonth() + 6);

                            // if (invoice.booking.service_reminder) {
                            //     reminderDate = new Date(currentYear, invoice.booking.service_reminder.getMonth(), invoice.booking.service_reminder.getDate());
                            // }




                            ///////////////////////////New Approach ////////////////////////////////////
                            let invoice_date = new Date(invoice.updated_at)
                            let rem_date = invoice_date.setDate(invoice_date.getDate() + 180);
                            let currentYear = new Date().getFullYear();
                            reminderDate = new Date(currentYear, new Date(rem_date).getMonth(), new Date(rem_date).getDate());
                            console.log("Last Service = " + new Date(invoice.updated_at).toISOString() + " // Next Reminder = " + new Date(rem_date).toISOString() + " // Reminder = " + new Date(reminderDate).toISOString())

                            if (last.status == 'Follow-Up') {
                                status = "Follow-Up"
                                follow_up = {
                                    date: new Date(reminderDate).toISOString(),
                                    time: null,
                                    updated_at: new Date()
                                }
                            } else {
                                status = "Open"
                                follow_up = {}
                            }
                        }
                        var updateLead = {
                            user: user._id,
                            car: invoice.car._id,
                            status: status,
                            booking: invoice.booking._id,
                            lead: invoice.booking.lead,
                            name: user.name,
                            insurance_rem: null,
                            contact_no: user.contact_no,
                            email: user.email,
                            follow_up: follow_up,
                            reminderDate: reminderDate,
                            updated_at: new Date(),
                        };
                        await OutBoundLead.findOneAndUpdate({ _id: last._id }, { $set: updateLead }, { new: true }, async function (err, doc) {
                            await LeadGenRemark.create({
                                lead: last._id,
                                source: last.source,
                                type: last.type,
                                status: doc.status,
                                reason: '',
                                customer_remark: '',
                                assignee_remark: '',
                                assignee: last.assignee,
                                color_code: "",
                                created_at: new Date(),
                                updated_at: new Date()
                            }).then(async function (newRemark) {
                                await OutBoundLead.findOneAndUpdate({ _id: last._id }, { $push: { remarks: newRemark._id } }, { new: true }, async function (err, doc) {
                                })
                            });

                        })
                        return { type: "isLast" };
                    }
                    else {
                        // console.log("New Lead")
                        const insurance_rem = null
                        var assignee = await q.all(this.getOutBoundAssignee(business, business));
                        var status = 'Open';
                        if (category == 'ServiceReminder') {
                            // var reminderDate = null;
                            var reminderDate = new Date();
                            // let currentYear = new Date().getFullYear();
                            // var bar = new Date(currentYear, doc.reminderDate.getMonth(), doc.reminderDate.getDate());

                            // // const invoice_date = new Date(invoice.booking.updated_at)

                            ////////////////////////////////////
                            // let currentYear = new Date().getFullYear();
                            // let invoice_date = new Date(currentYear, invoice.updated_at.getMonth(), invoice.updated_at.getDate());
                            // reminderDate = invoice_date.setDate(new Date(invoice_date).getDate() + 180);
                            // console.log("Last Service = " + new Date(invoice.updated_at).toISOString() + " // Reminder = " + new Date(reminderDate).toISOString(),)
                            /////////////////////////////////////////////////////////
                            // reminderDate = invoice_date.setDate(invoice_date.getMonth() + 6);

                            // if (invoice.booking.service_reminder) {
                            //     reminderDate = new Date(currentYear, invoice.booking.service_reminder.getMonth(), invoice.booking.service_reminder.getDate());
                            // }
                            ///////////////////////////New Approach ////////////////////////////////////
                            let invoice_date = new Date(invoice.updated_at)
                            let rem_date = invoice_date.setDate(invoice_date.getDate() + 180);

                            let currentYear = new Date().getFullYear();
                            reminderDate = new Date(currentYear, new Date(rem_date).getMonth(), new Date(rem_date).getDate());
                            console.log("Last Service = " + new Date(invoice.updated_at).toISOString() + " // Next Reminder = " + new Date(rem_date).toISOString() + " // Reminder = " + new Date(reminderDate).toISOString())




                            status = "Open"
                            follow_up = {
                            }
                        }
                        var contacted = false;
                        var priority = 2;
                        var userId = invoice.user._id;
                        var name = invoice.user.name;
                        var contact_no = invoice.user.contact_no;
                        var email = invoice.user.email;
                        var variant = null;
                        var car = null;
                        if (invoice.car) {
                            car = invoice.car._id
                            variant = invoice.car.variant
                        }
                        var alternate_no = ""

                        var additional_info = {
                            variant: variant,
                            alternate_no: alternate_no
                        }
                        var category = category;
                        var isStared = false;
                        var count = await OutBoundLead.find({ business: business }).count();
                        var lead_id = count + 10000;
                        var lead = {
                            user: userId,
                            car: car,
                            booking: invoice.booking._id,
                            lead: invoice.booking.lead,
                            name: name,
                            contact_no: contact_no,
                            email: email,
                            type: category,
                            insurance_rem: insurance_rem,
                            follow_up: follow_up,
                            status: status,
                            business: business,
                            assignee: assignee,
                            source: category,
                            priority: priority,
                            category: category,
                            additional_info: additional_info,
                            isStared: isStared,
                            lead_id: lead_id,
                            reminderDate: reminderDate,
                            created_at: new Date(),
                            updated_at: new Date(),

                        };
                        await OutBoundLead.create(lead).then(async function (l) {
                            await LeadGenRemark.create({
                                lead: l._id,
                                source: l.source,
                                type: l.type,
                                status: l.status,
                                reason: '',
                                customer_remark: '',
                                assignee_remark: '',
                                assignee: assignee,
                                color_code: "",
                                created_at: new Date(),
                                updated_at: new Date()
                            }).then(async function (newRemark) {
                                await OutBoundLead.findOneAndUpdate({ _id: l._id }, { $push: { remarks: newRemark._id } }, { new: true }, async function (err, doc) {
                                })
                            });
                        });
                        return true;
                    }
                } else {
                    return { type: "!Car_User" };
                }

            } else {
                return { type: "!Booking" };
            }
        } else {
            return { type: "!Invoice" };
        }
    },
    InsuranceReminderoutboundLeaCreate: async function (invoiceId, category) {
        const invoice = await Invoice.findById(invoiceId)
            .populate({ path: 'user', select: '_id name contact_no email ' })
            .populate('car')
            .populate('booking')
            .exec();
        if (invoice) {
            if (invoice.car) {
                let data = {}
                let follow_up = {};
                const business = invoice.business;
                const user = invoice.user;
                if (user) {
                    var last = await OutBoundLead.findOne({ user: user._id, car: invoice.car._id, category: category, business: business, status: { $in: ["Open", "Follow-Up"] } }).sort({ updated_at: -1 }).exec();
                    if (last) {
                        // console.log("Update  " + last._id)
                        status = last.status;
                        var reminderYear = new Date().getFullYear();
                        if (invoice.car.insurance_info.expire.getFullYear() >= new Date().getFullYear()) {
                            reminderYear = invoice.car.insurance_info.expire.getFullYear()

                        }
                        var bar = new Date(reminderYear, invoice.car.insurance_info.expire.getMonth(), invoice.car.insurance_info.expire.getDate());
                        insurance_rem = new Date(bar).toISOString();

                        // bar.setDate(bar.getDate() - 35);
                        if (last.status == 'Follow-Up') {
                            status = "Follow-Up"
                            follow_up = {
                                date: new Date(reminderDate).toISOString(),
                                time: null,
                                updated_at: new Date()
                            }
                        } else {
                            status = "Open"
                            follow_up = {}
                        }

                        var updateLead = {
                            user: user._id,
                            car: invoice.car._id,
                            status: status,
                            booking: invoice.booking._id,
                            lead: invoice.booking.lead,
                            name: user.name,
                            insurance_rem: insurance_rem,
                            contact_no: user.contact_no,
                            email: user.email,
                            follow_up: follow_up,
                            reminderDate: null,
                            updated_at: new Date(),
                        };
                        await OutBoundLead.findOneAndUpdate({ _id: last._id }, { $set: updateLead }, { new: true }, async function (err, doc) {
                            await LeadGenRemark.create({
                                lead: last._id,
                                source: last.source,
                                type: last.type,
                                status: doc.status,
                                reason: '',
                                customer_remark: '',
                                assignee_remark: '',
                                assignee: last.assignee,
                                color_code: "",
                                created_at: new Date(),
                                updated_at: new Date()
                            }).then(async function (newRemark) {
                                await OutBoundLead.findOneAndUpdate({ _id: last._id }, { $push: { remarks: newRemark._id } }, { new: true }, async function (err, doc) {
                                })
                            });

                        })
                        return { type: "isLast" };
                    }
                    else {
                        // console.log("New Lead")
                        var assignee = await q.all(this.getOutBoundAssignee(business, business));
                        var status = 'Open';
                        const reminderDate = null
                        let insurance_rem = null;
                        if (invoice.car.insurance_info && category == 'Insurance') {
                            if (invoice.car.insurance_info.expire) {
                                var reminderYear = new Date().getFullYear();
                                if (invoice.car.insurance_info.expire.getFullYear() >= new Date().getFullYear()) {
                                    reminderYear = invoice.car.insurance_info.expire.getFullYear()
                                }
                                var bar = new Date(reminderYear, invoice.car.insurance_info.expire.getMonth(), invoice.car.insurance_info.expire.getDate());
                                insurance_rem = new Date(bar).toISOString();

                            } else {
                                return { type: "!Car_User" };
                            }
                        } else {
                            return { type: "!Car_User" };
                        }

                        var contacted = false;
                        var priority = 2;
                        var userId = invoice.user._id;
                        var name = invoice.user.name;
                        var contact_no = invoice.user.contact_no;
                        var email = invoice.user.email;
                        var variant = null;
                        var car = null;
                        if (invoice.car) {
                            car = invoice.car._id
                            variant = invoice.car.variant
                        }
                        var alternate_no = ""

                        var additional_info = {
                            variant: variant,
                            alternate_no: alternate_no
                        }
                        var category = category;
                        var isStared = false;
                        var count = await OutBoundLead.find({ business: business }).count();
                        var lead_id = count + 10000;
                        var lead = {
                            user: userId,
                            car: car,
                            booking: invoice.booking._id,
                            lead: invoice.booking.lead,
                            name: name,
                            contact_no: contact_no,
                            email: email,
                            type: category,
                            insurance_rem: insurance_rem,
                            follow_up: follow_up,
                            status: status,
                            business: business,
                            assignee: assignee,
                            source: category,
                            priority: priority,
                            category: category,
                            additional_info: additional_info,
                            isStared: isStared,
                            lead_id: lead_id,
                            reminderDate: null,
                            created_at: new Date(),
                            updated_at: new Date(),

                        };
                        await OutBoundLead.create(lead).then(async function (l) {
                            await LeadGenRemark.create({
                                lead: l._id,
                                source: l.source,
                                type: l.type,
                                status: l.status,
                                reason: '',
                                customer_remark: '',
                                assignee_remark: '',
                                assignee: assignee,
                                color_code: "",
                                created_at: new Date(),
                                updated_at: new Date()
                            }).then(async function (newRemark) {
                                await OutBoundLead.findOneAndUpdate({ _id: l._id }, { $push: { remarks: newRemark._id } }, { new: true }, async function (err, doc) {
                                })
                            });
                        });
                        return true;
                    }
                } else {
                    return { type: "!Car_User" };
                }

            } else {
                return { type: "!Booking" };
            }
        } else {
            return { type: "!Invoice" };
        }
    },
    parchiFromSale: async function (sale) {
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
            var parchiCounts = await Parchi.find({ business: business, status: { $nin: ['Cancelled'] } }).count().exec();
            var data = {
                business: business,
                user: user._id,
                created_by: loggedInDetails._id,
                parchi_no: parchiCounts + 1,
                note: 'note',
                status: "Open",
                items: items,
                payment: payment,
                due: due,
                logs: [],
                sale: null,
                order: null,
                isLinked: false,
                created_at: date,
                updated_at: date,

            };

            await Parchi.create(data).then(async function (parchi) {
                var activity = {
                    business: business,
                    activity_by: loggedInDetails.name,
                    activity: "Sale Created",
                    remark: "Sale",
                    created_at: new Date(),
                }
                // businessFunctions.salesLogs(sale._id, activity);
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Sale Successfully Created",
                    responseData: {
                        parchi: parchi
                    }
                });

            });


        }
    },



    zohoOutboundLead: async function (l) {
        var booking = await Booking.findOne({ _id: l })
            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'business', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'car', select: '_id id title registration_no fuel_type' })
            .exec();

        // var remarks = [];
        // var logs = booking.logs;

        // if (logs.length > 0) {
        //     var logged = logs[logs.length - 1].user;
        // }
        // else {
        //     var logged = booking.advisor;
        // }

        // var services = booking.services;

        // services.forEach(async function (s) {
        //     remarks.push(s.service)
        // });

        if (booking.outbound_lead) {
            var follow_up = {};

            if (booking.status == "Cancelled") {
                var status = "Lost"
            }
            else {
                var status = booking.status;
            }
            var lead = await OutBoundLead.findById(booking.outbound_lead).exec();
            if (lead) {
                if (booking.status == "Inactive") {
                    status = lead.status
                }
                await LeadGenRemark.create({
                    lead: lead._id,
                    type: lead.category,
                    status: status,
                    isRemark: true,
                    reason: '',
                    customer_remark: "Booking Updated",
                    assignee_remark: '',
                    assignee: lead.assignee,
                    created_at: new Date(),
                    updated_at: new Date()
                }).then(async function (newRemark) {
                    var remarks = lead.remarks;
                    remarks.push(newRemark._id)
                    var data = {
                        follow_up: follow_up,
                        status: status,
                        job_card: booking._id,
                        converted: true,
                        isJob: true,
                        updated_at: new Date(),
                        remarks: remarks
                    };
                    await OutBoundLead.findOneAndUpdate({ _id: lead._id }, { $set: data }, { new: true }, async function (err, doc) {
                    })
                });
            }
        }
        else {
            // ["Open", "Follow-Up",'Confirmed',"Missed","Approval",]
            var checkLead = await OutBoundLead.findOne({ contact_no: booking.user.contact_no, "status": { $nin: ["Lost", "Closed", 'Converted'] } }).sort({ updated_at: -1 }).exec();
            if (checkLead) {
                var outboundBooking = await Booking.findOne({ outbound_lead: checkLead._id, status: { $in: ['Confirmed', 'Approval', 'EstimateRequested', 'Converted'] } }).exec()
                if (outboundBooking) {
                    if (booking.status == "Cancelled") {
                        var status = "Closed"
                    }
                    else if (booking.status == "Inactive") {
                        var status = checkLead.status;
                    } else {
                        status = booking.status;
                    }
                    await LeadGenRemark.create({
                        lead: checkLead._id,
                        type: checkLead.category,
                        status: status,
                        isRemark: true,
                        reason: '',
                        customer_remark: "Job Card Created",
                        assignee_remark: '',
                        assignee: checkLead.assignee,
                        created_at: new Date(),
                        updated_at: new Date()
                    }).then(async function (newRemark) {
                        var remarks = checkLead.remarks;
                        remarks.push(newRemark._id)

                        var data = {
                            user: booking.user._id,
                            name: booking.user.name,
                            contact_no: booking.user.contact_no,
                            email: booking.user.email,
                            job_card: booking._id,
                            status: booking.status,
                            converted: true,
                            isJob: true,
                            remarks: remarks,
                            follow_up: {},
                            updated_at: new Date(),
                        };
                        await OutBoundLead.findOneAndUpdate({ _id: checkLead._id }, { $set: data }, { new: false }, async function (err, doc) {
                            await Booking.findOneAndUpdate({ _id: booking._id }, { $set: { outbound_lead: checkLead._id, isOutbound: true, converted: true } }, { new: false }, async function (err, doc) {
                                if (err) {
                                    // console.log(err)
                                }
                                else {
                                    console.log("Lead Added")
                                    //fun.newNotification(notify);
                                }
                            });
                        });


                    })

                }
            }
        }
    },

    // logs: async function (error) {
    //     const config = {
    //         logGroupName: 'Extensive_logs',
    //         logStreamName: 'StagingServer_log_Stream',
    //         region: 'ap-south-1',
    //         accessKeyId: 'AKIAJRS3IIFNS75YEY5A',
    //         secretAccessKey: '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',
    //         uploadFreq: 1000, 	// Optional. Send logs to AWS LogStream in batches after 10 seconds intervals.
    //         local: false 		// Optional. If set to true, the log will fall back to the standard 'console.log'.
    //     }

    //     const logger = new Logger(config)
    //     logger.log(error)
    //     // logger.log(`I'm`, `aws-cloudwatch-log.`, `I can log many things at once, as well as objects as follow:`)
    //     // logger.log({ type: 'this-is-important', details: 'something has happened!' })
    //     // logger.log({ category: 'info', details: `I'm fast and lean. I don't block, and everything happens in the background!` })
    // }
    // logs: async function (error) {
    //     console.log()
    // },

    logs: async function (error) {
        const config = {
            logGroupName: 'Extensive_logs',
            logStreamName: 'Extensive_logs_stream', //Local Server
            // logStreamName: 'StagingServer_log_Stream', //Staging Server
            // logStreamName: 'production_logStream', //Production Server
            region: 'ap-south-1',
            accessKeyId: 'AKIAJRS3IIFNS75YEY5A',
            secretAccessKey: '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',
            uploadFreq: 1000, 	// Optional. Send logs to AWS LogStream in batches after 10 seconds intervals.
            local: false 		// Optional. If set to true, the log will fall back to the standard 'console.log'.
        }
        // const logger = new Logger(config)
        // logger.log(error)
    },
    deductCarEagerCash: async function (userId, amount) {
        console.log("amount = " + amount)
        var user = await User.findById(userId).select('_id id careager_cash').exec();
        if (user) {
            // { $push: { sku: sku },

            var cash = user.careager_cash - amount;
            console.log("Remaing Account amount = " + cash)

            await User.findOneAndUpdate({ _id: user._id }, { $set: { careager_cash: cash } }, { new: true }, async function () {
            });
        }

    },
    numberConversion: async function (num) {
        num = num.toString().replace(/[^0-9.]/g, '');
        if (num < 1000) {
            return num;
        }
        let si = [
            { v: 1E3, s: "K" },
            { v: 1E6, s: "M" },
            { v: 1E9, s: "B" },
            { v: 1E12, s: "T" },
            { v: 1E15, s: "P" },
            { v: 1E18, s: "E" }
        ];
        var index;
        for (index = si.length - 1; index > 0; index--) {
            if (num >= si[index].v) {
                break;
            }
        }
        var number = (num / si[index].v).toFixed(2).replace(/\.0+$|(\.[0-9]*[1-9])0+$/, "$1") + si[index].s
        return number;
    },
};

