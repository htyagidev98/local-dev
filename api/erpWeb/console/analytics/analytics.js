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



var secret = config.secret;
var Log_Level = config.Log_Level

router.get('/analytics', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var business = req.headers['business'];
    var analytics = [];
    var paid_total = 0;
    var labour_cost = 0;
    var convenience = 0;
    var salvage = 0;
    var policy_clause = 0;
    var part_cost = 0;
    var of_cost = 0;
    var date = new Date();

    var country = await Country.findOne({ timezone: { $in: req.headers['tz'] } }).exec();

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
        if (req.query.query) {
            var query = parseInt(req.query.query);
        }
        else {
            var query = 7
        }

        var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
        var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    }
    else {
        var from = new Date(date.getFullYear(), date.getMonth(), 1);
        var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    }


    var totalLeads = await Lead.find({ business: business, "remark.status": { $in: ["Open", "Follow-Up", "PSF", "Closed", "Lost"] }, created_at: { $gte: from, $lte: to } }).count().exec();

    var excludeLeads = await Lead.find({ psf: false, converted: false, "remark.status": "Closed", business: business, created_at: { $gte: from, $lte: to } }).count().exec();

    var converted = await Lead.find({ business: business, psf: true, converted: true, "remark.status": "Closed", updated_at: { $gte: from, $lte: to } }).count().exec();

    var calc = totalLeads - excludeLeads;

    var conversion = 0;
    conversion = (converted / calc) * 100;

    if (conversion) {
        conversion = parseFloat(conversion.toFixed(2))
    }
    else {
        conversion = 0;
    }

    var category = await q.all(businessFunctions.businessPlanCategory(business));

    for (var i = 0; i < category.length; i++) {
        if (category[i] == "Workshop") {
            analytics.push({
                title: "Total Leads",
                count: totalLeads,
                group: "Customer Overview",
                category: "CRM"
            });


            analytics.push({
                title: "Conversion",
                count: conversion,
                group: "Customer Overview",
                category: "CRM"
            });


            var totalBooking = await Booking.find({ business: business, is_services: true, status: { $ne: "Inactive" }, created_at: { $gte: from, $lte: to } }).count().exec();

            analytics.push({
                title: "Total Services",
                group: "General Overview",
                category: "WMS",
                count: totalBooking,
            });

            var totalPackage = await UserPackage.find({ business: business, created_at: { $gte: from, $lte: to } }).count().exec();

            analytics.push({
                title: "Total Packages",
                group: "General Overview",
                category: "WMS",
                count: totalPackage
            });

            await Invoice.find({ business: business, status: "Active", created_at: { $gte: from, $lte: to } })
                .cursor().eachAsync(async (booking) => {

                    paid_total = booking.payment.paid_total + paid_total;

                    if (booking.payment.convenience_charges) {
                        convenience = parseInt(booking.payment.convenience_charges) + convenience;
                    }

                    if (booking.payment.policy_clause) {
                        policy_clause = parseInt(booking.payment.policy_clause) + policy_clause;
                    }

                    if (booking.payment.salvage) {
                        salvage = parseInt(booking.payment.salvage) + salvage;
                    }

                    labour_cost = booking.payment.labour_cost + labour_cost + booking.payment.of_cost;
                    part_cost = booking.payment.part_cost + part_cost;
                });

            var other = convenience + policy_clause + salvage;

            analytics.push({
                title: "Service Revenue",
                group: "General Overview",
                category: "WMS",
                count: price(paid_total)
            });

            analytics.push({
                title: "Labour",
                group: "General Overview",
                category: "WMS",
                count: price(labour_cost)
            });

            analytics.push({
                title: "Parts",
                group: "General Overview",
                category: "WMS",
                count: price(part_cost)
            });

            analytics.push({
                title: "Others",
                group: "General Overview",
                category: "WMS",
                count: price(other)
            });
        }
        else if (category[i] == "Dealer") {
            analytics.push({
                title: "Total Leads",
                count: totalLeads,
                group: "Customer Overview",
                category: "CRM"
            });

            analytics.push({
                title: "Conversion",
                count: conversion,
                group: "Customer Overview",
                category: "CRM"
            });

            var cars = await Car.find({ user: business }).exec();

            var carSold = await CarSell.find({ seller: business, sold: true, created_at: { $gte: from, $lte: to } }).exec();

            var packageSold = await CarSell.find({ seller: business, sold: true, package_sold: true, created_at: { $gte: from, $lte: to } }).exec();

            var carListed = await Car.find({ user: business, publish: true, admin_approved: true, created_at: { $gte: from, $lte: to } }).exec();

            var packageSold = await CarSell.find({ seller: business, sold: true, package_sold: true, created_at: { $gte: from, $lte: to } }).exec();


            var sold_price = _.sumBy(carSold, x => x.price);
            var package_cost = _.sumBy(carSold, x => x.package_cost);
            var refurbishment_cost = _.sumBy(carSold, x => x.refurbishment_cost);
            var purchase_price = _.sumBy(carSold, x => x.purchase_price);

            var profit = sold_price - (package_cost + refurbishment_cost + purchase_price)

            analytics.push({
                title: "Cars In Garage",
                count: cars.length,
                group: "General Overview",
                category: category[i]
            });


            analytics.push({
                title: "Car Listed",
                count: carListed.length,
                group: "General Overview",
                category: category[i]
            });


            analytics.push({
                title: "Revenue",
                count: sold_price,
                group: "Income Overview",
                category: category[i]
            });

            analytics.push({
                title: "Profit",
                count: profit,
                group: "Income Overview",
                category: category[i]
            });

            analytics.push({
                title: "Packages Sold",
                count: packageSold.length,
                group: "General Overview",
                category: category[i]
            });

            analytics.push({
                title: "Cars Sold",
                count: carSold.length,
                group: "General Overview",
                category: category[i]
            });
        }

        else if (category[i] == "Fleet") {
            var cars = await Car.find({ user: business }).exec();

            var carSold = await CarSell.find({ seller: business, sold: true, created_at: { $gte: from, $lte: to } }).exec();

            var packageSold = await CarSell.find({ seller: business, sold: true, package_sold: true, created_at: { $gte: from, $lte: to } }).exec();

            var carListed = await Car.find({ user: business, publish: true, admin_approved: true, created_at: { $gte: from, $lte: to } }).exec();

            var packageSold = await CarSell.find({ seller: business, sold: true, package_sold: true, created_at: { $gte: from, $lte: to } }).exec();


            var sold_price = _.sumBy(carSold, x => x.price);
            var package_cost = _.sumBy(carSold, x => x.package_cost);
            var refurbishment_cost = _.sumBy(carSold, x => x.refurbishment_cost);
            var purchase_price = _.sumBy(carSold, x => x.purchase_price);

            var profit = sold_price - (package_cost + refurbishment_cost + purchase_price)

            analytics.push({
                title: "Cars In Garage",
                group: "General Overview",
                count: cars.length,
                category: category[i]
            });

            var check = await Point.find({ user: business, tag: "ReferralCommission" }).exec();

            var credit = _.filter(check, type => type.type == "credit");
            var credit_commission = _.sumBy(credit, x => x.points);

            var debit = _.filter(check, type => type.type == "debit");
            var debit_commission = _.sumBy(debit, x => x.points);


            analytics.push({
                title: "Commission Earned",
                group: "Income Overview",
                count: credit_commission - debit_commission,
                category: category[i]
            });

            analytics.push({
                title: "Car Listed",
                group: "General Overview",
                count: carListed.length,
                category: category[i]
            });


            /*analytics.push({
                title: "Revenue",
                count: sold_price,
                category: category[i]
            });

            analytics.push({
                title: "Profit",
                count: profit,
                category: category[i]
            });*/

            /* analytics.push({
                 title: "Package Sold",
                 count: packageSold.length,
                 category: category[i]
             });*/

            analytics.push({
                title: "Cars Sold",
                group: "General Overview",
                count: carSold.length,
                category: category[i]
            });
        }
    }

    analytics = _.uniqBy(analytics, "title");
    analytics = _(analytics).groupBy(x => x.group).map((value, key) => ({ group: key, data: value })).value(),


        res.status(200).json({
            responseCode: 200,
            responseMessage: from + " - " + to,
            responseData: analytics
        });
});
router.get('/teams/analytic/', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var business = req.headers['business'];

    var managements = [];
    var paid_total = 0;
    var labour_cost = 0;
    var part_cost = 0;
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
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
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

    await Management.find({ business: business, role: "Service Advisor" /* department: req.query.department*/ })
        .populate({ path: 'user', select: '_id id name contact_no avatar avatar_address email created_at' })
        .cursor().eachAsync(async (management) => {
            // console.log("Advisor Id= " + management._id)
            var analytics = [];

            var totalBooking = await Booking.find({ advisor: management.user._id, is_services: true, status: { $in: ["Confirmed", "Pending", "EstimateRequested", "JobOpen", "JobInititated", "In-Process", "CompleteWork", "QC", "StoreApproval", "Ready", "Completed", "Closed", "Cancelled"] }, updated_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            analytics.push({
                title: "Total",
                count: totalBooking.length,
                data: totalBooking
            });

            var totalUpcoming = await Booking.find({ advisor: management.user._id, is_services: true, status: { $in: ["Confirmed", "Pending"] }, updated_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            analytics.push({
                title: "Upcoming",
                count: totalUpcoming.length,
                data: totalUpcoming
            });

            var totalEstimated = await Booking.find({ advisor: management.user._id, is_services: true, status: { $in: ["EstimateRequested"] }, updated_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            analytics.push({
                title: "Estimated",
                count: totalEstimated.length,
                data: totalEstimated
            });

            var rework = await Booking.find({ advisor: management.user._id, is_services: true, is_rework: true, updated_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();
            analytics.push({
                title: "Rework",
                count: rework.length,
                data: rework,
            });

            var new_job = await Booking.find({ advisor: management.user._id, is_services: true, status: { $in: ["JobOpen", "JobInititated"] }, created_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            analytics.push({
                title: "New Job",
                count: new_job.length,
                data: new_job
            });

            var in_process = await Booking.find({ advisor: management.user._id, is_services: true, status: { $in: ["In-Process"] }, created_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            analytics.push({
                title: "In-Process",
                count: in_process.length,
                data: in_process
            });

            var qc = await Booking.find({ advisor: management.user._id, is_services: true, status: { $in: ["QC", "CompleteWork"] }, created_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            analytics.push({
                title: "Quality Check",
                count: qc.length,
                data: qc
            });

            var store_approval = await Booking.find({ advisor: management.user._id, is_services: true, status: { $in: ["StoreApproval"] }, created_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            analytics.push({
                title: "Store Approval",
                count: store_approval.length,
                data: store_approval
            });

            var ready = await Booking.find({ advisor: management.user._id, is_services: true, status: { $in: ["Ready"] }, created_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            analytics.push({
                title: "Ready",
                count: ready.length,
                data: ready
            });

            var completed = await Booking.find({ advisor: management.user._id, is_services: true, status: { $in: ["Closed", "Completed"] }, updated_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            analytics.push({
                title: "Completed",
                count: completed.length,
                data: completed
            });

            var cancelled = await Booking.find({ advisor: management.user._id, is_services: true, status: { $in: ["Cancelled"] }, updated_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            analytics.push({
                title: "Cancelled",
                count: cancelled.length,
                data: cancelled
            });

            var labour_cost = 0;
            var part_cost = 0;
            var other = 0;
            var convenience = 0;
            var salvage = 0;
            var policy_clause = 0;
            await Invoice.find({ advisor: management.user._id, status: "Active", created_at: { $gte: from, $lte: to } })
                .cursor().eachAsync(async (booking) => {

                    paid_total = booking.payment.paid_total + paid_total;

                    if (booking.payment.convenience_charges) {
                        convenience = parseInt(booking.payment.convenience_charges) + convenience;
                    }

                    if (booking.payment.policy_clause) {
                        policy_clause = parseInt(booking.payment.policy_clause) + policy_clause;
                    }

                    if (booking.payment.salvage) {
                        salvage = parseInt(booking.payment.salvage) + salvage;
                    }

                    labour_cost = booking.payment.labour_cost + labour_cost + booking.payment.of_cost;
                    part_cost = booking.payment.part_cost + part_cost;
                });
            analytics.push({
                title: "Amount",
                count: labour_cost + part_cost + convenience + policy_clause + salvage,
                data: {}
            });

            var revenue = _.filter(analytics, type => type.title == "Amount");
            var total_revenue = 0
            if (revenue.length > 0) {
                total_revenue = parseFloat(_.sumBy(revenue, x => x.count).toFixed(2))
            }
            // total_revenue: total_revenue

            joiningDate = management.created_at;
            today = new Date();
            var perDayRevenue = 0
            var monthlyAverageRevenue = 0
            var total = await Invoice.find({ advisor: management.user._id, status: "Active" }).exec();
            var overallRevenue = parseFloat(_.sumBy(total, x => x.payment.total).toFixed(2))
            var diff = Math.abs(new Date(today) - new Date(joiningDate));
            var days = Math.floor((diff / 1000) / 60) / (60 * 24);
            var minutes = Math.floor((diff / 1000) / 60);

            perDayRevenue = overallRevenue / days;
            monthlyAverageRevenue = perDayRevenue * 30;
            // console.log("joiningDate = " + joiningDate)
            // console.log("today = " + today)
            // console.log("perDayRevenue  = " + perDayRevenue)
            // console.log("minutes  = " + minutes)
            // console.log("days  = " + days)
            // console.log("Revenue  = " + total_revenue)
            // console.log("monthlyAverageRevenue  = " + monthlyAverageRevenue)
            var reviews = []
            await Booking.find({ advisor: management.user._id, is_reviewed: true, created_at: { $gte: from, $lte: to } })
                .cursor().eachAsync(async (booking) => {
                    var review = await Review.findOne({ booking: booking._id }).exec();
                    reviews.push({
                        rating: review.rating
                    })
                });

            var average_rating = _.sumBy(reviews, x => x.rating) / reviews.length;

            managements.push({
                id: management.user._id,
                role: management.role,
                department: management.department,
                name: management.user.name,
                username: management.user.username,
                email: management.user.email,
                contact_no: management.user.contact_no,
                avatar: management.user.avatar,
                avatar_address: management.user.avatar_address,
                analytics: analytics,
                created_at: management.user.created_at,
                total_revenue: total_revenue,
                totalBooking: totalBooking,
                average_rating: average_rating,
                monthlyAverageRevenue: monthlyAverageRevenue.toFixed(2)
            });
        });

    await Management.find({ business: business, role: "CRE"/* department: req.query.department*/ })
        .populate({ path: 'user', select: '_id id name contact_no avatar avatar_address email created_at' })
        .cursor().eachAsync(async (management) => {

            var analytics = [];
            var leads = [];

            var totalLeads = await Lead.find({ assignee: management.user._id, "remark.status": { $in: ["Open", "Follow-Up", "PSF", "Closed", "Lost"] }, updated_at: { $gte: from, $lte: to } }).exec();

            var excludeLeads = await Lead.find({ psf: false, converted: false, "remark.status": "Closed", assignee: management.user._id, created_at: { $gte: from, $lte: to } }).exec();

            var c = await Lead.find({ assignee: management.user._id, converted: true, updated_at: { $gte: from, $lte: to } }).exec();

            var id = _.map(c, '_id');

            var converted = await Booking.find({ lead: { $in: id }, status: { $nin: ["Rejected", "Cancelled", "Inactive", "EstimateRequested"] }, updated_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            var calc = totalLeads.length - excludeLeads.length;

            var conversion = 0;
            conversion = (converted.length / calc) * 100;
            // console.log("CONVETRED LENGTH = " + converted.length)
            // console.log("calc = " + calc)
            if (conversion) {
                conversion = parseFloat(conversion.toFixed(2))
            }

            analytics.push({
                title: "Total Leads",
                count: totalLeads.length,
                data: totalLeads,
            });

            analytics.push({
                title: "Converted",
                count: converted.length,
                data: converted
            });
            // console.log("Conversion  = " + conversion)
            analytics.push({
                title: "Conversion",
                count: conversion,
                data: {}
            });


            var open = await Lead.find({ assignee: management.user._id, "remark.status": "Open" }).exec();
            analytics.push({
                title: "Open",
                count: open.length,
                data: open
            });

            var follow_up = await Lead.find({ assignee: management.user._id, "remark.status": "Follow-Up", updated_at: { $gte: from, $lte: to } }).exec();
            analytics.push({
                title: "Follow Up",
                count: follow_up.length,
                data: follow_up,
            });

            var pipeline = await Booking.find({ manager: management.user._id, converted: true, status: { $nin: ["Completed", "CompleteWork", "QC", "Closed", "Ready", "Rejected", "Cancelled", "Inactive"] }, updated_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();


            var totalPSFLeads = await Lead.find({ assignee: management.user._id, "remark.status": "PSF", updated_at: { $gte: from, $lte: to } }).exec();

            analytics.push({
                title: "PSF",
                count: totalPSFLeads.length,
                data: totalPSFLeads
            });

            var totalClosedLeads = await Lead.find({ assignee: management.user._id, "remark.status": "Closed", updated_at: { $gte: from, $lte: to } }).exec();

            analytics.push({
                title: "Closed",
                count: totalClosedLeads.length,
                data: totalClosedLeads
            });

            var totalPClosLeads = await Lead.find({ assignee: management.user._id, psf: true, "remark.status": "Closed", updated_at: { $gte: from, $lte: to } }).exec();

            analytics.push({
                title: "PSF Done",
                count: totalPClosLeads.length,
                data: totalPClosLeads
            });

            var totalLostLeads = await Lead.find({ assignee: management.user._id, "remark.status": "Lost", updated_at: { $gte: from, $lte: to } }).exec();
            analytics.push({
                title: "Lost",
                count: totalLostLeads.length,
                data: totalLostLeads
            });

            analytics.push({
                title: "Estimate",
                count: pipeline.length,
                data: pipeline
            });
            // console.log("Conversion  === " + conversion)

            var revenue = await Invoice.find({ manager: management.user._id, created_at: { $gte: from, $lte: to }, business: business }).exec()
            var totalRevenue = 0
            if (revenue.length > 0) {
                totalRevenue = parseFloat(_.sumBy(revenue, x => x.payment.total).toFixed(2))
            }
            // total_revenue: totalRevenue
            var responseArray = []
            var responseTime = 0;
            if (responseTime) { }
            await Lead.find({ assignee: management.user._id, created_at: { $gte: from, $lte: to } })
                .populate({ path: 'remarks', select: 'created_at' })
                .cursor().eachAsync(async (lead) => {
                    var diff = Math.abs(new Date(lead.remarks[0].created_at) - new Date(lead.created_at));
                    var minutes = Math.floor((diff / 1000) / 60);

                    // console.log("ID   = " + lead._id)
                    // console.log("Respo  = " + new Date(lead.remarks[0].created_at))
                    // console.log("Created  = " + new Date(lead.created_at))
                    // console.log("Time Taken  = " + minutes)
                    responseArray.push({
                        time: minutes,
                        assignee: lead.assignee
                    })
                });
            // console.log("_.sumBy(responseArray, x => x.time)" + _.sumBy(responseArray, x => x.time))
            // console.log("responseArray.length" + responseArray.length)
            var average_response_time = _.sumBy(responseArray, x => x.time) / responseArray.length;
            managements.push({
                id: management.user._id,
                name: management.user.name,
                role: "CRE",
                department: management.department,
                username: management.user.username,
                email: management.user.email,
                contact_no: management.user.contact_no,
                avatar: management.user.avatar,
                avatar_address: management.user.avatar_address,
                analytics: analytics,
                created_at: management.user.created_at,
                conversion: converted.length,
                conversion_ratio: conversion,
                total_revenue: totalRevenue.toFixed(2),
                average_response_time: average_response_time.toFixed(2)
            });
        });


    await Management.find({ business: business, role: { $in: ["Denter", "Technician", "Washing Technician",] } /* department: req.query.department*/ })
        .populate({ path: 'user', select: '_id id name contact_no avatar avatar_address email created_at' })
        .cursor().eachAsync(async (management) => {
            var analytics = [];

            var totalBooking = await Booking.find({ technician: management.user._id, is_services: true, status: { $in: ["Confirmed", "Pending", "EstimateRequested", "JobOpen", "JobInititated", "In-Process", "CompleteWork", "QC", "StoreApproval", "Ready", "Completed", "Closed", "Cancelled"] }, updated_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            analytics.push({
                title: "Total",
                count: totalBooking.length,
                data: totalBooking
            });

            var totalUpcoming = await Booking.find({ technician: management.user._id, is_services: true, status: { $in: ["Confirmed", "Pending"] }, updated_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            analytics.push({
                title: "Upcoming",
                count: totalUpcoming.length,
                data: totalUpcoming
            });

            var totalEstimated = await Booking.find({ technician: management.user._id, is_services: true, status: { $in: ["EstimateRequested"] }, updated_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            analytics.push({
                title: "Estimated",
                count: totalEstimated.length,
                data: totalEstimated
            });

            var rework = await Booking.find({ technician: management.user._id, is_services: true, is_rework: true, updated_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();
            analytics.push({
                title: "Rework",
                count: rework.length,
                data: rework,
            });

            var new_job = await Booking.find({ technician: management.user._id, is_services: true, status: { $in: ["JobOpen", "JobInititated"] }, created_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            analytics.push({
                title: "New Job",
                count: new_job.length,
                data: new_job
            });

            var in_process = await Booking.find({ technician: management.user._id, is_services: true, status: { $in: ["In-Process"] }, created_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            analytics.push({
                title: "In-Process",
                count: in_process.length,
                data: in_process
            });

            var qc = await Booking.find({ technician: management.user._id, is_services: true, status: { $in: ["QC", "CompleteWork"] }, created_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            analytics.push({
                title: "Quality Check",
                count: qc.length,
                data: qc
            });

            var store_approval = await Booking.find({ advisor: management.user._id, is_services: true, status: { $in: ["StoreApproval"] }, created_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            analytics.push({
                title: "Store Approval",
                count: store_approval.length,
                data: store_approval
            });

            var ready = await Booking.find({ technician: management.user._id, is_services: true, status: { $in: ["Ready"] }, created_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            analytics.push({
                title: "Ready",
                count: ready.length,
                data: ready
            });


            var completed = await Booking.find({ technician: management.user._id, is_services: true, status: { $in: ["Closed", "Completed"] }, updated_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            analytics.push({
                title: "Completed",
                count: completed.length,
                data: completed
            });


            var labour_cost = 0;
            var part_cost = 0;
            var other = 0;
            var convenience = 0;
            var salvage = 0;
            var policy_clause = 0;
            await Invoice.find({ technician: management.user._id, status: "Active", created_at: { $gte: from, $lte: to } })
                .cursor().eachAsync(async (booking) => {
                    paid_total = booking.payment.paid_total + paid_total;

                    if (booking.payment.convenience_charges) {
                        convenience = parseInt(booking.payment.convenience_charges) + convenience;
                    }

                    if (booking.payment.policy_clause) {
                        policy_clause = parseInt(booking.payment.policy_clause) + policy_clause;
                    }

                    if (booking.payment.salvage) {
                        salvage = parseInt(booking.payment.salvage) + salvage;
                    }

                    labour_cost = booking.payment.labour_cost + labour_cost + booking.payment.of_cost;
                    part_cost = booking.payment.part_cost + part_cost;
                });
            analytics.push({
                title: "Amount",
                count: labour_cost + part_cost + convenience + policy_clause + salvage,
                data: {}
            });

            var revenue = _.filter(analytics, type => type.title == "Amount");
            var total_revenue = 0
            if (revenue.length > 0) {
                total_revenue = parseFloat(_.sumBy(revenue, x => x.count).toFixed(2))
            }


            joiningDate = management.created_at;
            today = new Date();
            var perDayRevenue = 0
            var monthlyAverageRevenue = 0
            var total = await Invoice.find({ technician: management.user._id, status: "Active" }).exec();
            var overallRevenue = parseFloat(_.sumBy(total, x => x.payment.total).toFixed(2))
            var diff = Math.abs(new Date(today) - new Date(joiningDate));
            var days = Math.floor((diff / 1000) / 60) / (60 * 24);
            var minutes = Math.floor((diff / 1000) / 60);

            perDayRevenue = overallRevenue / days;
            monthlyAverageRevenue = perDayRevenue * 30;
            /* var cancelled = await Booking.find({technician:management.user._id, is_services: true, status:{$in :["Cancelled"]}, updated_at:{$gte: from, $lte: to}}).populate({path: 'user', select:"name"}).populate({path: 'car', select:'title registration_no'}).exec();
     
             analytics.push({
                 title: "Cancelled",
                 count: cancelled.length,
                 data: cancelled
             });  */

            managements.push({
                id: management.user._id,
                role: management.role,
                department: management.department,
                name: management.user.name,
                username: management.user.username,
                email: management.user.email,
                contact_no: management.user.contact_no,
                avatar: management.user.avatar,
                avatar_address: management.user.avatar_address,
                analytics: analytics,
                created_at: management.user.created_at,
                total_revenue: total_revenue,
                monthlyAverageRevenue: monthlyAverageRevenue.toFixed(2),

                // total_bookings: totalBooking.length
            });
        });

    res.status(200).json({
        responseCode: 200,
        responseMessage: from + " " + to,
        responseData: managements
    });
});
router.get('/performance/reports/', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var business = req.headers['business'];

    var managements = [];
    var paid_total = 0;
    var labour_cost = 0;
    var part_cost = 0;
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

    await Management.find({ business: business, role: "Service Advisor" /* department: req.query.department*/ })
        .populate({ path: 'user', select: '_id id name contact_no avatar avatar_address email' })
        .cursor().eachAsync(async (management) => {
            var analytics = [];

            var totalBooking = await Booking.find({ advisor: management.user._id, is_services: true, status: { $in: ["Confirmed", "Pending", "EstimateRequested", "JobOpen", "JobInititated", "In-Process", "CompleteWork", "QC", "StoreApproval", "Ready", "Completed", "Closed", "Cancelled"] }, updated_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            var totalUpcoming = await Booking.find({ advisor: management.user._id, is_services: true, status: { $in: ["Confirmed", "Pending"] }, updated_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            var totalEstimated = await Booking.find({ advisor: management.user._id, is_services: true, status: { $in: ["EstimateRequested"] }, updated_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            var rework = await Booking.find({ advisor: management.user._id, is_services: true, is_rework: true, updated_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            var new_job = await Booking.find({ advisor: management.user._id, is_services: true, status: { $in: ["JobOpen", "JobInititated"] }, created_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            var in_process = await Booking.find({ advisor: management.user._id, is_services: true, status: { $in: ["In-Process"] }, created_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            var qc = await Booking.find({ advisor: management.user._id, is_services: true, status: { $in: ["QC", "CompleteWork"] }, created_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            var store_approval = await Booking.find({ advisor: management.user._id, is_services: true, status: { $in: ["StoreApproval"] }, created_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            var ready = await Booking.find({ advisor: management.user._id, is_services: true, status: { $in: ["Ready"] }, created_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            var completed = await Booking.find({ advisor: management.user._id, is_services: true, status: { $in: ["Closed", "Completed"] }, updated_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            var cancelled = await Booking.find({ advisor: management.user._id, is_services: true, status: { $in: ["Cancelled"] }, updated_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();


            var labour_cost = 0;
            var part_cost = 0;
            var other = 0;
            var convenience = 0;
            var salvage = 0;
            var policy_clause = 0;
            await Invoice.find({ advisor: management.user._id, status: "Active", created_at: { $gte: from, $lte: to } })
                .cursor().eachAsync(async (booking) => {

                    paid_total = booking.payment.paid_total + paid_total;

                    if (booking.payment.convenience_charges) {
                        convenience = parseInt(booking.payment.convenience_charges) + convenience;
                    }

                    if (booking.payment.policy_clause) {
                        policy_clause = parseInt(booking.payment.policy_clause) + policy_clause;
                    }

                    if (booking.payment.salvage) {
                        salvage = parseInt(booking.payment.salvage) + salvage;
                    }

                    labour_cost = booking.payment.labour_cost + labour_cost + booking.payment.of_cost;
                    part_cost = booking.payment.part_cost + part_cost;
                });

            analytics.push({
                title: "Amount",
                count: labour_cost + part_cost + convenience + policy_clause + salvage,
                data: {}
            });

            managements.push({
                id: management.user._id,
                role: management.role,
                department: management.department,
                name: management.user.name,
                email: management.user.email,
                contact_no: management.user.contact_no,
                analytics: {
                    total_booking: totalBooking.length,
                    total_upcoming: totalUpcoming.length,
                    total_estimated: totalEstimated.length,
                    rework: rework.length,
                    new_job: new_job.length,
                    in_process: in_process.length,
                    qc: qc.length,
                    store_approval: store_approval.length,
                    ready: ready.length,
                    completed: completed.length,
                    cancelled: cancelled.length,
                    total_amount: labour_cost + part_cost + convenience + policy_clause + salvage,
                }
            });

        });

    await Management.find({ business: business, role: "CRE"/* department: req.query.department*/ })
        .populate({ path: 'user', select: '_id id name contact_no avatar avatar_address email' })
        .cursor().eachAsync(async (management) => {

            var analytics = [];
            var leads = [];

            var totalLeads = await Lead.find({ assignee: management.user._id, "remark.status": { $in: ["Open", "Follow-Up", "PSF", "Closed", "Lost"] }, updated_at: { $gte: from, $lte: to } }).exec();

            var excludeLeads = await Lead.find({ psf: false, converted: false, "remark.status": "Closed", assignee: management.user._id, created_at: { $gte: from, $lte: to } }).exec();

            var c = await Lead.find({ assignee: management.user._id, converted: true, updated_at: { $gte: from, $lte: to } }).exec();

            var id = _.map(c, '_id');

            var converted = await Booking.find({ lead: { $in: id }, status: { $nin: ["Rejected", "Cancelled", "Inactive", "EstimateRequested"] }, updated_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            var calc = totalLeads.length - excludeLeads.length;

            var conversion = 0;
            conversion = (converted.length / calc) * 100;

            if (conversion) {
                conversion = parseFloat(conversion.toFixed(2))
            }

            var open = await Lead.find({ assignee: management.user._id, "remark.status": "Open" }).exec();


            var follow_up = await Lead.find({ assignee: management.user._id, "remark.status": "Follow-Up", updated_at: { $gte: from, $lte: to } }).exec();


            var pipeline = await Booking.find({ manager: management.user._id, converted: true, status: { $nin: ["Completed", "CompleteWork", "QC", "Closed", "Ready", "Rejected", "Cancelled", "Inactive"] }, updated_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();


            var totalPSFLeads = await Lead.find({ assignee: management.user._id, "remark.status": "PSF", updated_at: { $gte: from, $lte: to } }).exec();


            var totalClosedLeads = await Lead.find({ assignee: management.user._id, "remark.status": "Closed", updated_at: { $gte: from, $lte: to } }).exec();



            var totalLostLeads = await Lead.find({ assignee: management.user._id, "remark.status": "Lost", updated_at: { $gte: from, $lte: to } }).exec();

            var revenue = await Invoice.find({ manager: management.user._id, created_at: { $gte: from, $lte: to }, business: business }).exec()
            var totalRevenue = 0
            if (revenue.length > 0) {
                totalRevenue = parseFloat(_.sumBy(revenue, x => x.payment.total).toFixed(2))
            }
            // total_revenue: totalRevenue
            var responseArray = []
            var responseTime = 0;
            if (responseTime) { }
            await Lead.find({ assignee: management.user._id, created_at: { $gte: from, $lte: to } })
                .populate({ path: 'remarks', select: 'created_at' })
                .cursor().eachAsync(async (lead) => {
                    var diff = Math.abs(new Date(lead.remarks[0].created_at) - new Date(lead.created_at));
                    var minutes = Math.floor((diff / 1000) / 60);

                    // console.log("ID   = " + lead._id)
                    // console.log("Respo  = " + new Date(lead.remarks[0].created_at))
                    // console.log("Created  = " + new Date(lead.created_at))
                    // console.log("Time Taken  = " + minutes)
                    responseArray.push({
                        time: minutes,
                        assignee: lead.assignee
                    })
                });
            // console.log("_.sumBy(responseArray, x => x.time)" + _.sumBy(responseArray, x => x.time))
            // console.log("responseArray.length" + responseArray.length)
            var average_response_time = _.sumBy(responseArray, x => x.time) / responseArray.length;
            managements.push({
                id: management.user._id,
                name: management.user.name,
                role: "CRE",
                department: management.department,
                username: management.user.username,
                email: management.user.email,
                contact_no: management.user.contact_no,
                avatar: management.user.avatar,
                avatar_address: management.user.avatar_address,
                analytics: {
                    total: totalLeads.length,
                    converted: converted.length,
                    conversion: conversion,
                    open: open.length,
                    follow_up: follow_up.length,
                    psf: totalPSFLeads.length,
                    closed: totalClosedLeads.length,
                    lost: totalLostLeads.length,
                    pipeline: pipeline.length,
                    totalRevenue: totalRevenue,
                    average_response_time: average_response_time
                }
            });
        });


    await Management.find({ business: business, role: { $in: ["Denter", "Technician", "Washing Technician",] } /* department: req.query.department*/ })
        .populate({ path: 'user', select: '_id id name contact_no avatar avatar_address email' })
        .cursor().eachAsync(async (management) => {
            var analytics = [];

            var totalBooking = await Booking.find({ technician: management.user._id, is_services: true, status: { $in: ["Confirmed", "Pending", "EstimateRequested", "JobOpen", "JobInititated", "In-Process", "CompleteWork", "QC", "StoreApproval", "Ready", "Completed", "Closed", "Cancelled"] }, updated_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            analytics.push({
                title: "Total",
                count: totalBooking.length,
                data: totalBooking
            });

            var totalUpcoming = await Booking.find({ technician: management.user._id, is_services: true, status: { $in: ["Confirmed", "Pending"] }, updated_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            analytics.push({
                title: "Upcoming",
                count: totalUpcoming.length,
                data: totalUpcoming
            });

            var totalEstimated = await Booking.find({ technician: management.user._id, is_services: true, status: { $in: ["EstimateRequested"] }, updated_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            analytics.push({
                title: "Estimated",
                count: totalEstimated.length,
                data: totalEstimated
            });

            var rework = await Booking.find({ technician: management.user._id, is_services: true, is_rework: true, updated_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();
            analytics.push({
                title: "Rework",
                count: rework.length,
                data: rework,
            });

            var new_job = await Booking.find({ technician: management.user._id, is_services: true, status: { $in: ["JobOpen", "JobInititated"] }, created_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            analytics.push({
                title: "New Job",
                count: new_job.length,
                data: new_job
            });

            var in_process = await Booking.find({ technician: management.user._id, is_services: true, status: { $in: ["In-Process"] }, created_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            analytics.push({
                title: "In-Process",
                count: in_process.length,
                data: in_process
            });

            var qc = await Booking.find({ technician: management.user._id, is_services: true, status: { $in: ["QC", "CompleteWork"] }, created_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            analytics.push({
                title: "Quality Check",
                count: qc.length,
                data: qc
            });

            var store_approval = await Booking.find({ advisor: management.user._id, is_services: true, status: { $in: ["StoreApproval"] }, created_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            analytics.push({
                title: "Store Approval",
                count: store_approval.length,
                data: store_approval
            });

            var ready = await Booking.find({ technician: management.user._id, is_services: true, status: { $in: ["Ready"] }, created_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            analytics.push({
                title: "Ready",
                count: ready.length,
                data: ready
            });


            var completed = await Booking.find({ technician: management.user._id, is_services: true, status: { $in: ["Closed", "Completed"] }, updated_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            analytics.push({
                title: "Completed",
                count: completed.length,
                data: completed
            });

            var cancelled = await Booking.find({ technician: management.user._id, is_services: true, status: { $in: ["Cancelled"] }, updated_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            analytics.push({
                title: "Cancelled",
                count: cancelled.length,
                data: cancelled
            });


            var labour_cost = 0;
            var part_cost = 0;
            var other = 0;
            var convenience = 0;
            var salvage = 0;
            var policy_clause = 0;
            await Invoice.find({ technician: management.user._id, status: "Active", created_at: { $gte: from, $lte: to } })
                .cursor().eachAsync(async (booking) => {

                    paid_total = booking.payment.paid_total + paid_total;

                    if (booking.payment.convenience_charges) {
                        convenience = parseInt(booking.payment.convenience_charges) + convenience;
                    }

                    if (booking.payment.policy_clause) {
                        policy_clause = parseInt(booking.payment.policy_clause) + policy_clause;
                    }

                    if (booking.payment.salvage) {
                        salvage = parseInt(booking.payment.salvage) + salvage;
                    }

                    labour_cost = booking.payment.labour_cost + labour_cost + booking.payment.of_cost;
                    part_cost = booking.payment.part_cost + part_cost;
                });

            analytics.push({
                title: "Amount",
                count: labour_cost + part_cost + convenience + policy_clause + salvage,
                data: {}
            });


            managements.push({
                id: management.user._id,
                role: management.role,
                department: management.department,
                name: management.user.name,
                username: management.user.username,
                email: management.user.email,
                contact_no: management.user.contact_no,
                avatar: management.user.avatar,
                avatar_address: management.user.avatar_address,
                //analytics: analytics
                analytics: {
                    total_booking: totalBooking.length,
                    total_upcoming: totalUpcoming.length,
                    total_estimated: totalEstimated.length,
                    rework: rework.length,
                    new_job: new_job.length,
                    in_process: in_process.length,
                    qc: qc.length,
                    store_approval: store_approval.length,
                    ready: ready.length,
                    completed: completed.length,
                    cancelled: cancelled.length,
                    total_amount: labour_cost + part_cost + convenience + policy_clause + salvage
                }
            });
        });

    res.status(200).json({
        responseCode: 200,
        responseMessage: from + " " + to,
        responseData: managements
    });
});

router.get('/advisor/performance/reports/', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /advisor/performance/reports/ Api Called from customer.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var business = req.headers['business'];
    var user = await User.findById(decoded.user).exec();

    var managements = [];
    var paid_total = 0;
    var labour_cost = 0;
    var part_cost = 0;
    var date = new Date();
    if (req.query.type == "range") {
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Validated successfully and find date from query in range.");
        }
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
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Validated successfully and find date from query in period.");
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
            var query = 7;
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }
    }
    else {
        var from = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    }
    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Getting Management details for the Role Service Advisor.");
    }
    await Management.find({ business: business, role: "Service Advisor" /* department: req.query.department*/ })
        .populate({ path: 'user', select: '_id id name contact_no avatar avatar_address email created_at' })
        .cursor().eachAsync(async (management) => {
            var analytics = [];

            if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("DEBUG: Getting Booking details for the Role Asvisor," + " " + "Advisor Name:" + management.user.name);
            }
            var totalBooking = await Booking.find({ advisor: management.user._id, is_services: true, status: { $in: ["Confirmed", "Pending", "EstimateRequested", "JobOpen", "JobInititated", "In-Process", "CompleteWork", "QC", "StoreApproval", "Ready", "Completed", "Closed", "Cancelled"] }, updated_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            var totalUpcoming = await Booking.find({ advisor: management.user._id, is_services: true, status: { $in: ["Confirmed", "Pending"] }, updated_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            var totalEstimated = await Booking.find({ advisor: management.user._id, is_services: true, status: { $in: ["EstimateRequested"] }, updated_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            var rework = await Booking.find({ advisor: management.user._id, is_services: true, is_rework: true, updated_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            var new_job = await Booking.find({ advisor: management.user._id, is_services: true, status: { $in: ["JobOpen", "JobInititated"] }, created_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            var in_process = await Booking.find({ advisor: management.user._id, is_services: true, status: { $in: ["In-Process"] }, created_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            var qc = await Booking.find({ advisor: management.user._id, is_services: true, status: { $in: ["QC", "CompleteWork"] }, created_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            var store_approval = await Booking.find({ advisor: management.user._id, is_services: true, status: { $in: ["StoreApproval"] }, created_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            var ready = await Booking.find({ advisor: management.user._id, is_services: true, status: { $in: ["Ready"] }, created_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            var completed = await Booking.find({ advisor: management.user._id, is_services: true, status: { $in: ["Closed", "Completed"] }, updated_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            var cancelled = await Booking.find({ advisor: management.user._id, is_services: true, status: { $in: ["Cancelled"] }, updated_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();


            var labour_cost = 0;
            var part_cost = 0;
            var other = 0;
            var convenience = 0;
            var salvage = 0;
            var policy_clause = 0;
            if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("DEBUG: Getting Invoice details for the Role Asvisor," + from + "-" + "To:" + to + ", " + "Advisor Name:" + management.user.name);
            }
            await Invoice.find({ advisor: management.user._id, status: "Active", created_at: { $gte: from, $lte: to } })
                .cursor().eachAsync(async (booking) => {

                    paid_total = booking.payment.paid_total + paid_total;

                    if (booking.payment.convenience_charges) {
                        convenience = parseInt(booking.payment.convenience_charges) + convenience;
                    }

                    if (booking.payment.policy_clause) {
                        policy_clause = parseInt(booking.payment.policy_clause) + policy_clause;
                    }

                    if (booking.payment.salvage) {
                        salvage = parseInt(booking.payment.salvage) + salvage;
                    }

                    labour_cost = booking.payment.labour_cost + labour_cost + booking.payment.of_cost;
                    part_cost = booking.payment.part_cost + part_cost;
                });

            analytics.push({
                title: "Amount",
                count: labour_cost + part_cost + convenience + policy_clause + salvage,
                data: {}
            });

            joiningDate = management.created_at;
            today = new Date();
            var perDayRevenue = 0
            var monthlyAverageRevenue = 0
            var total = await Invoice.find({ advisor: management.user._id, status: "Active" }).exec();
            var overallRevenue = parseFloat(_.sumBy(total, x => x.payment.total).toFixed(2))
            var diff = Math.abs(new Date(today) - new Date(joiningDate));
            var days = Math.floor((diff / 1000) / 60) / (60 * 24);
            // var minutes = Math.floor((diff / 1000) / 60);

            perDayRevenue = overallRevenue / days;
            monthlyAverageRevenue = perDayRevenue * 30;

            var reviews = []
            await Booking.find({ advisor: management.user._id, is_reviewed: true, created_at: { $gte: from, $lte: to } })
                .cursor().eachAsync(async (booking) => {
                    var review = await Review.findOne({ booking: booking._id }).exec();
                    reviews.push({
                        rating: review.rating
                    })
                });

            var average_rating = _.sumBy(reviews, x => x.rating) / reviews.length;
            if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("DEBUG: Sending Management Details in Response for the role Advisor," + " " + "User:" + user.name);
            }
            managements.push({
                id: management.user._id,
                role: management.role,
                department: management.department,
                name: management.user.name,
                email: management.user.email,
                contact_no: management.user.contact_no,
                created_at: management.user.created_at,
                analytics: {
                    total_booking: totalBooking.length,
                    total_upcoming: totalUpcoming.length,
                    total_estimated: totalEstimated.length,
                    rework: rework.length,
                    new_job: new_job.length,
                    in_process: in_process.length,
                    qc: qc.length,
                    store_approval: store_approval.length,
                    ready: ready.length,
                    completed: completed.length,
                    cancelled: cancelled.length,
                    average_rating: average_rating.toFixed(2),
                    monthlyAverageRevenue: monthlyAverageRevenue.toFixed(2),
                    total_amount: labour_cost + part_cost + convenience + policy_clause + salvage,
                    totalRevenue: (labour_cost + part_cost + convenience + policy_clause + salvage).toFixed(2),
                }
            });

        });



    res.status(200).json({
        responseCode: 200,
        responseMessage: from + " " + to,
        responseData: managements
    });
    if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("INFO: Management details for the role Advisor sends in Response Successfully," + " " + "User:" + user.name);
    }
});
router.get('/cre/performance/reports/', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /cre/performance/reports Api Called from customer.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var business = req.headers['business'];
    var user = await User.findById(decoded.user).exec();

    var managements = [];
    var paid_total = 0;
    var labour_cost = 0;
    var part_cost = 0;
    var date = new Date();
    if (req.query.type == "range") {
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Validated successfully and find date from query in range");
        }
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
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Validated successfully and find date from query in Period");
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
            var query = 7;
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }
    }
    else {
        var from = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    }

    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Getting Management details for the Role CRE.");
    }
    await Management.find({ business: business, role: "CRE"/* department: req.query.department*/ })
        .populate({ path: 'user', select: '_id id name contact_no avatar avatar_address email created_at' })
        .cursor().eachAsync(async (management) => {

            var analytics = [];
            var leads = [];

            if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("DEBUG: Getting Leads details for the Role CRE," + " " + "CRE Name:" + management.user.name);
            }
            var totalLeads = await Lead.find({ assignee: management.user._id, "remark.status": { $in: ["Open", "Follow-Up", "PSF", "Closed", "Lost"] }, updated_at: { $gte: from, $lte: to } }).exec();

            var excludeLeads = await Lead.find({ psf: false, converted: false, "remark.status": "Closed", assignee: management.user._id, created_at: { $gte: from, $lte: to } }).exec();

            var c = await Lead.find({ assignee: management.user._id, converted: true, updated_at: { $gte: from, $lte: to } }).exec();

            var id = _.map(c, '_id');

            var converted = await Booking.find({ lead: { $in: id }, status: { $nin: ["Rejected", "Cancelled", "Inactive", "EstimateRequested"] }, updated_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            var calc = totalLeads.length - excludeLeads.length;

            var conversion = 0;
            conversion = (converted.length / calc) * 100;

            if (conversion) {
                conversion = parseFloat(conversion.toFixed(2))
            }

            var open = await Lead.find({ assignee: management.user._id, "remark.status": "Open" }).exec();


            var follow_up = await Lead.find({ assignee: management.user._id, "remark.status": "Follow-Up", updated_at: { $gte: from, $lte: to } }).exec();


            var pipeline = await Booking.find({ manager: management.user._id, converted: true, status: { $nin: ["Completed", "CompleteWork", "QC", "Closed", "Ready", "Rejected", "Cancelled", "Inactive"] }, updated_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();


            var totalPSFLeads = await Lead.find({ assignee: management.user._id, "remark.status": "PSF", updated_at: { $gte: from, $lte: to } }).exec();


            var totalClosedLeads = await Lead.find({ assignee: management.user._id, "remark.status": "Closed", updated_at: { $gte: from, $lte: to } }).exec();



            var totalLostLeads = await Lead.find({ assignee: management.user._id, "remark.status": "Lost", updated_at: { $gte: from, $lte: to } }).exec();

            var revenue = await Invoice.find({ manager: management.user._id, created_at: { $gte: from, $lte: to }, business: business }).exec()
            var totalRevenue = 0
            if (revenue.length > 0) {
                totalRevenue = parseFloat(_.sumBy(revenue, x => x.payment.total).toFixed(2))
            }
            // total_revenue: totalRevenue
            var responseArray = []
            var responseTime = 0;
            if (responseTime) { }
            await Lead.find({ assignee: management.user._id, created_at: { $gte: from, $lte: to } })
                .populate({ path: 'remarks', select: 'created_at assignee isResponse ' })
                // .populate({ path: 'remarks', select: 'created_at' })
                .cursor().eachAsync(async (lead) => {
                    var remarks = lead.remarks
                    if (remarks.length > 0) {
                        for (var i = 0; i < remarks.length; i++) {
                            console
                            // console.log("Cre ID= " + management.user._id + " Remark  CRE= " + remarks[i].assignee)
                            if (remarks[i].isResponse && remarks[i].assignee.equals(management.user._id)) {
                                // console.log("True \n")
                                var diff = Math.abs(new Date(remarks[i].created_at) - new Date(lead.created_at));
                                var minutes = Math.floor((diff / 1000) / 60);
                                // console.log("ID   = " + lead._id)
                                // console.log("Respo  = " + new Date(remarks[i].created_at))
                                // console.log("Created  = " + new Date(lead.created_at))
                                // console.log("Time Taken  = " + minutes + "\n")
                                responseArray.push({
                                    time: minutes,
                                    assignee: lead.assignee
                                })
                                break;
                            }
                        }
                    }

                });
            // console.log("_.sumBy(responseArray, x => x.time)" + _.sumBy(responseArray, x => x.time))
            // console.log("responseArray.length" + responseArray.length)

            var average_response_time = 0
            // console.log("responseArray.length = " + responseArray.length)
            // console.log("responseArray.length.length = " + responseArray.length.length)
            if (responseArray.length > 0) {
                average_response_time = (_.sumBy(responseArray, x => x.time) / responseArray.length);
            }
            // console.log("Remark Testing  =  " + management.user.name + " Time = " + average_response_time + "\n")

            // var unRes=await Lead.find({ assignee: management.user._id, isResponse: false, created_at: { $gte: from, $lte: to } }).exec()
            if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("DEBUG: Sending Management Details in Response," + " " + "User:" + user.name);
            }
            managements.push({
                id: management.user._id,
                name: management.user.name,
                role: "CRE",
                department: management.department,
                username: management.user.username,
                email: management.user.email,
                contact_no: management.user.contact_no,
                avatar: management.user.avatar,
                avatar_address: management.user.avatar_address,
                created_at: management.user.created_at,

                analytics: {
                    total: totalLeads.length,
                    converted: converted.length,
                    conversion: conversion,
                    open: open.length,
                    follow_up: follow_up.length,
                    psf: totalPSFLeads.length,
                    closed: totalClosedLeads.length,
                    lost: totalLostLeads.length,
                    pipeline: pipeline.length,
                    totalRevenue: totalRevenue.toFixed(2),
                    average_response_time: average_response_time.toFixed(2),

                }
            });
        });
    res.status(200).json({
        responseCode: 200,
        responseMessage: from + " " + to,
        responseData: managements
    });
    if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("INFO: Management Details Send Successfully in Response," + " " + "User:" + user.name);
    }
});
router.get('/technician/performance/reports/', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /technician/performance/reports/ Api Called from customer.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var business = req.headers['business'];
    var user = await User.findById(decoded.user).exec();

    var managements = [];
    var paid_total = 0;
    var labour_cost = 0;
    var part_cost = 0;
    var date = new Date();
    if (req.query.type == "range") {
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Validated successfully and find date from query in range");
        }
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
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Validated successfully and find date from query in period.");
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
            var query = 7;
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }
    }
    else {
        var from = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    }


    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Getting Management details for the Role Technician," + " " + "User:" + user.name);
    }
    await Management.find({ business: business, role: { $in: ["Denter", "Technician", "Washing Technician",] } /* department: req.query.department*/ })
        .populate({ path: 'user', select: '_id id name contact_no avatar avatar_address email created_at' })
        .cursor().eachAsync(async (management) => {
            var analytics = [];


            if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("DEBUG: Getting all bookings and details for the technician" + " " + "Technecian Name:" + management.user.name);
            }
            var totalBooking = await Booking.find({ technician: management.user._id, is_services: true, status: { $in: ["Confirmed", "Pending", "EstimateRequested", "JobOpen", "JobInititated", "In-Process", "CompleteWork", "QC", "StoreApproval", "Ready", "Completed", "Closed", "Cancelled"] }, updated_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            analytics.push({
                title: "Total",
                count: totalBooking.length,
                data: totalBooking
            });

            var totalUpcoming = await Booking.find({ technician: management.user._id, is_services: true, status: { $in: ["Confirmed", "Pending"] }, updated_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            analytics.push({
                title: "Upcoming",
                count: totalUpcoming.length,
                data: totalUpcoming
            });

            var totalEstimated = await Booking.find({ technician: management.user._id, is_services: true, status: { $in: ["EstimateRequested"] }, updated_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            analytics.push({
                title: "Estimated",
                count: totalEstimated.length,
                data: totalEstimated
            });

            var rework = await Booking.find({ technician: management.user._id, is_services: true, is_rework: true, updated_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();
            analytics.push({
                title: "Rework",
                count: rework.length,
                data: rework,
            });

            var new_job = await Booking.find({ technician: management.user._id, is_services: true, status: { $in: ["JobOpen", "JobInititated"] }, created_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            analytics.push({
                title: "New Job",
                count: new_job.length,
                data: new_job
            });

            var in_process = await Booking.find({ technician: management.user._id, is_services: true, status: { $in: ["In-Process"] }, created_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            analytics.push({
                title: "In-Process",
                count: in_process.length,
                data: in_process
            });

            var qc = await Booking.find({ technician: management.user._id, is_services: true, status: { $in: ["QC", "CompleteWork"] }, created_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            analytics.push({
                title: "Quality Check",
                count: qc.length,
                data: qc
            });

            var store_approval = await Booking.find({ advisor: management.user._id, is_services: true, status: { $in: ["StoreApproval"] }, created_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            analytics.push({
                title: "Store Approval",
                count: store_approval.length,
                data: store_approval
            });

            var ready = await Booking.find({ technician: management.user._id, is_services: true, status: { $in: ["Ready"] }, created_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            analytics.push({
                title: "Ready",
                count: ready.length,
                data: ready
            });


            var completed = await Booking.find({ technician: management.user._id, is_services: true, status: { $in: ["Closed", "Completed"] }, updated_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            analytics.push({
                title: "Completed",
                count: completed.length,
                data: completed
            });

            var cancelled = await Booking.find({ technician: management.user._id, is_services: true, status: { $in: ["Cancelled"] }, updated_at: { $gte: from, $lte: to } }).populate({ path: 'user', select: "name" }).populate({ path: 'car', select: 'title registration_no' }).exec();

            analytics.push({
                title: "Cancelled",
                count: cancelled.length,
                data: cancelled
            });


            var labour_cost = 0;
            var part_cost = 0;
            var other = 0;
            var convenience = 0;
            var salvage = 0;
            var policy_clause = 0;

            if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("DEBUG: Getting Invoice details for the Role Technician" + " " + from + "-" + "To:" + to + ", " + "Technician Name:" + management.user.name);
            }
            await Invoice.find({ technician: management.user._id, status: "Active", created_at: { $gte: from, $lte: to } })
                .cursor().eachAsync(async (booking) => {

                    paid_total = booking.payment.paid_total + paid_total;

                    if (booking.payment.convenience_charges) {
                        convenience = parseInt(booking.payment.convenience_charges) + convenience;
                    }

                    if (booking.payment.policy_clause) {
                        policy_clause = parseInt(booking.payment.policy_clause) + policy_clause;
                    }

                    if (booking.payment.salvage) {
                        salvage = parseInt(booking.payment.salvage) + salvage;
                    }

                    labour_cost = booking.payment.labour_cost + labour_cost + booking.payment.of_cost;
                    part_cost = booking.payment.part_cost + part_cost;
                });

            analytics.push({
                title: "Amount",
                count: labour_cost + part_cost + convenience + policy_clause + salvage,
                data: {}
            });

            var revenue = _.filter(analytics, type => type.title == "Amount");
            var total_revenue = 0
            if (revenue.length > 0) {
                total_revenue = parseFloat(_.sumBy(revenue, x => x.count).toFixed(2))
            }
            // total_revenue: total_revenue
            var reviews = []
            await Booking.find({ technician: management.user._id, is_reviewed: true, created_at: { $gte: from, $lte: to } })
                .cursor().eachAsync(async (booking) => {
                    var review = await Review.findOne({ booking: booking._id }).exec();
                    reviews.push({
                        rating: review.rating
                    })
                });
            var average_rating = _.sumBy(reviews, x => x.rating) / reviews.length;

            joiningDate = management.created_at;
            today = new Date();
            var perDayRevenue = 0
            var monthlyAverageRevenue = 0
            var total = await Invoice.find({ technician: management.user._id, status: "Active" }).exec();
            var overallRevenue = parseFloat(_.sumBy(total, x => x.payment.total).toFixed(2))
            var diff = Math.abs(new Date(today) - new Date(joiningDate));
            var days = Math.floor((diff / 1000) / 60) / (60 * 24);
            var minutes = Math.floor((diff / 1000) / 60);

            perDayRevenue = overallRevenue / days;
            monthlyAverageRevenue = perDayRevenue * 30;
            // console.log("joiningDate = " + joiningDate)
            // console.log("today = " + today)
            // console.log("perDayRevenue  = " + perDayRevenue)
            // console.log("minutes  = " + minutes)
            // console.log("days  = " + days)
            // console.log("Revenue  = " + total_revenue)

            // console.log("monthlyAverageRevenue  = " + monthlyAverageRevenue)
            if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("DEBUG: Sending Management Details in Response," + " " + "User:" + user.name);
            }
            managements.push({
                id: management.user._id,
                role: management.role,
                department: management.department,
                name: management.user.name,
                username: management.user.username,
                email: management.user.email,
                contact_no: management.user.contact_no,
                avatar: management.user.avatar,
                avatar_address: management.user.avatar_address,
                created_at: management.user.created_at,
                //analytics: analytics
                analytics: {
                    total_booking: totalBooking.length,
                    total_upcoming: totalUpcoming.length,
                    total_estimated: totalEstimated.length,
                    rework: rework.length,
                    new_job: new_job.length,
                    in_process: in_process.length,
                    qc: qc.length,
                    store_approval: store_approval.length,
                    ready: ready.length,
                    completed: completed.length,
                    cancelled: cancelled.length,
                    average_rating: average_rating.toFixed(2),
                    total_amount: labour_cost + part_cost + convenience + policy_clause + salvage,
                    totalRevenue: (labour_cost + part_cost + convenience + policy_clause + salvage).toFixed(2),
                    monthlyAverageRevenue: monthlyAverageRevenue.toFixed(2)
                }
            });
        });

    res.status(200).json({
        responseCode: 200,
        responseMessage: from + " " + to,
        responseData: managements
    });
    if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("INFO: Management Details Send Successfully in Response," + " " + "User:" + user.name);
    }
});


router.delete('/management/remove', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /management/remove Api Called from analytics.js, " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var loggedInDetails = await User.findById(decoded.user).exec();

    var rules = {
        user: 'required',
    };
    var user = req.query.user
    var validation = new Validator(req.query, rules);

    if (validation.fails()) {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR: Validation failed, UserId is required to delete the user.");
        }
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Employee Required",
            responseData: {
                res: validation.errors.all()
            }
        })
    }
    else {
        var role = await Management.findOne({ user: req.query.user, business: business }).exec();

        // console.log("Data " + role.user)
        // console.log("Queryyy " + req.query.user)
        //Abhinav Tyagi
        // var cree = [];
        // console.log(role.role)
        // // if (role.role == "CRE" || role.user != user) {

        // // var CREs = await .find({ }).exec();
        // await Management.aggregate([{ $match: { role: "CRE", business: mongoose.Types.ObjectId(business) } }])
        //     .allowDiskUse(true)
        //     .cursor({ batchSize: 10 })
        //     .exec()
        //     .eachAsync(async function (dd) {

        //         cree.push({
        //             // department: dd.department,
        //             // role: dd.role,
        //             // business: dd.business,

        //             // business: res
        //             user: dd.user
        //         });


        //     });
        // console.log("Cre data" + cree)
        // // if(!user.equals(cre.user))
        // console.log("Total Cres" + cree.length)
        // console.log(cree)
        // console.log();
        // res.status(200).json({
        //     responseCode: 200,
        //     responseMessage: "All Fetched",
        //     responseInfo: {
        //         totalResult: cree.length
        //     },
        //     responseData: cree,
        // });

        // for(i=0;i<cree.length;i++){
        // console.log(cree[i].user)

        // }
        // if(!user.equals(cree[0].user))
        // console.log(count)
        // // var leads= await Lead.findAndUpdate({assignee:user},{$set:{assignee:}});
        // // }



        // // await Lead.find({assignee:user},set:{assignee:})
        if (role) {
            if (!role.business.equals(req.query.user)) {


                if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                    businessFunctions.logs("DEBUG: Update the Accuont Status As Deleted, UserId:" + req.query.user + ", User:" + loggedInDetails.name);
                }
                await User.findOneAndUpdate({ _id: req.query.user }, { $set: { "account_info.type": "deleted", "account_info.status": "Deleted" } }, { new: true }, async function (err, doc) {
                    if (err) {
                        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                            businessFunctions.logs("ERROR: Server Error Occured while updating the Account Status as Deleted, UserId:" + req.query.user + ", User:" + loggedInDetails.name);
                        }
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Server Error",
                            responseData: err
                        })
                    }
                    else {
                        cree = [];
                        await Management.remove({ user: req.query.user, business: business }).exec();

                        //Abhinav Auto Assign to the other Cre
                        // await Management.aggregate([{ $match: { role: "CRE", business: mongoose.Types.ObjectId(business) } }])
                        //     .allowDiskUse(true)
                        //     .cursor({ batchSize: 10 })
                        //     .exec()
                        //     .eachAsync(async function (dd) {

                        //         cree.push({
                        //             user: dd.user
                        //         });


                        //     });
                        // console.log("Total Cres" + cree.length)

                        // await Lead.updateMany({ assignee: user }, { $set: { assignee: cree[0].user } });
                        /////



                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Removed Successfully",
                            responseData: {}
                        })
                    }
                });
                if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                    businessFunctions.logs("INFO: Account Removed Successfully, Removed_By:" + loggedInDetails.name);
                }
                // console.log("Deleted Here")
            }
            else {
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "User not found",
                    responseData: {},
                });
            }
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "User not found",
                responseData: {},
            });
        }
    }
});

router.get('/management/executives/get', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /management/executives/get Api Called from analytics.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var loggedInDetails = await User.findById(decoded.user).exec();

    var rules = {
        user: 'required',
    };
    var user = req.query.user
    var validation = new Validator(req.query, rules);

    if (validation.fails()) {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR: Validation failed, User is required.");
        }
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Employee Required",
            responseData: {
                res: validation.errors.all()
            }
        })
    }
    else {
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Fatching Role details, UserId:" + req.query.user + ", User:" + loggedInDetails.name);
        }
        var role = await Management.findOne({ user: req.query.user, business: business }).exec();
        // console.log("Data " + role.user)
        // console.log("Queryyy " + req.query.user)

        //Abhinav Tyagi

        // console.log(role.role)
        // // if (role.role == "CRE" || role.user != user) {

        // // var CREs = await .find({ }).exec();
        // await Management.aggregate([{ $match: { role: "CRE", business: mongoose.Types.ObjectId(business) } }])
        //     .allowDiskUse(true)
        //     .cursor({ batchSize: 10 })
        //     .exec()
        //     .eachAsync(async function (dd) {

        //         cree.push({
        //             // department: dd.department,
        //             // role: dd.role,
        //             // business: dd.business,

        //             // business: res
        //             user: dd.user
        //         });


        //     });
        // console.log("Cre data" + cree)
        // // if(!user.equals(cre.user))
        // console.log("Total Cres" + cree.length)
        // console.log(cree)
        // console.log();
        // res.status(200).json({
        //     responseCode: 200,
        //     responseMessage: "All Fetched",
        //     responseInfo: {
        //         totalResult: cree.length
        //     },
        //     responseData: cree,
        // });

        // for(i=0;i<cree.length;i++){
        // console.log(cree[i].user)

        // }
        var cres = [];
        var advisor = [];
        var tech = [];
        var id = []
        if (role.role == "CRE") {
            await Management.aggregate([{ $match: { role: "CRE", business: mongoose.Types.ObjectId(business) } }])
                .allowDiskUse(true)
                .cursor({ batchSize: 10 })
                .exec()
                .eachAsync(async function (dd) {
                    var executive = await User.findOne({ _id: dd.user }).exec();
                    cres.push({
                        user: dd.user,
                        name: executive.name,
                        role: dd.role
                    });

                    // cres.push([
                    //     dd.user,
                    //     executive.name,
                    //     dd.role,
                    //     //  id.push(dd.user)
                    // ]);
                    // console.log(user + "ID Comapre " + dd._id)
                    // id.push([dd.user])
                    // console.log(dd.indexOf(dd.user))

                    if (executive._id == user) {
                        // console.log(cres.indexOf(cres.user))
                        // console.log(" CRE id matched ")
                        cres.pop(-1)
                    }
                });
            // return res.send(id)          
            // console.log("Total Cres" + cres.length)
            // await Lead.updateMany({ assignee: user }, { $set: { assignee: cres[0].user } });
            // await Lead.updateMany({ assignee: user }, { $set: { assignee: req.body.new_cre } });
            res.status(200).json({
                responseCode: 200,
                responseMessage: "Availabel CRE's",
                responseData: cres

            });
            if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("INFO: All Available CRE's are send in Response Successfully, User:" + loggedInDetails.name);
            }

        }
        else if (role.role = "Service Advisor") {
            await Management.aggregate([{ $match: { role: "Service Advisor", business: mongoose.Types.ObjectId(business) } }])
                .allowDiskUse(true)
                .cursor({ batchSize: 10 })
                .exec()
                .eachAsync(async function (ad) {


                    var executive = await User.findOne({ _id: ad.user }).exec();
                    advisor.push({
                        user: ad.user,
                        name: executive.name,
                        role: ad.role
                    });

                    if (executive._id == user) {
                        // console.log(" id matched ")
                        advisor.pop(-1)
                    }

                });
            // console.log("Total Advisors" + advisor.length)
            // await Booking.updateMany({ advisor: user }, { $set: { assignee: cree[0].user } });
            res.status(200).json({
                responseCode: 200,
                responseMessage: "Availabel Advisor's",
                responseData: advisor

            });
            if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("INFO: All Available Advisor's are send in Response Successfully, User:" + loggedInDetails.name);
            }

            // }else if (role.role = "Technician")
            // {
            //        await Management.aggregate([{ $match: { role: "Technician", business: mongoose.Types.ObjectId(business) } }])
            //            .allowDiskUse(true)
            //            .cursor({ batchSize: 10 })
            //            .exec()
            //            .eachAsync(async function (th) {

            //                tech.push({
            //                    user: ad.user
            //                });


            //            });
            // console.log("Total technician" + tech.length)

            //        await Booking.updateMany({ advisor: user }, { $set: { assignee: tech[0].user } });

            //    }





            /*
                    if (role) {
                        if (!role.business.equals(req.query.user)) {
            
            
            
                            await User.findOneAndUpdate({ _id: req.query.user }, { $set: { "account_info.type": "deleted", "account_info.status": "Deleted" } }, { new: true }, async function (err, doc) {
                                if (err) {
                                    res.status(422).json({
                                        responseCode: 422,
                                        responseMessage: "Server Error",
                                        responseData: err
                                    })
                                }
                                else {
                                    cree = [];
                                    await Management.remove({ user: req.query.user, business: business }).exec();
            
                                    //Abhinav Auto Assign to the other Cre
                                    // await Management.aggregate([{ $match: { role: "CRE", business: mongoose.Types.ObjectId(business) } }])
                                    //     .allowDiskUse(true)
                                    //     .cursor({ batchSize: 10 })
                                    //     .exec()
                                    //     .eachAsync(async function (dd) {
            
                                    //         cree.push({
                                    //             user: dd.user
                                    //         });
            
            
                                    //     });
                                    // console.log("Total Cres" + cree.length)
            
                                    // await Lead.updateMany({ assignee: user }, { $set: { assignee: cree[0].user } });
                                    /////
            
            
            
                                    res.status(200).json({
                                        responseCode: 200,
                                        responseMessage: "Removed Successfully",
                                        responseData: {}
                                    })
                                }
                            });
                            // console.log("Deleted Here")
                        }
                        else {
                            res.status(400).json({
                                responseCode: 400,
                                responseMessage: "User not found",
                                responseData: {},
                            });
                        }
                    }
                    else {
                        res.status(400).json({
                            responseCode: 400,
                            responseMessage: "User not found",
                            responseData: {},
                        });
                    }
                    */
        }
    }
});

router.put('/management/update/executive', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /management/update/executive Api Called from analytics.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var loggedInDetails = await User.findById(decoded.user).exec();
    var rules = {
        user: 'required',
        new_user: 'required',
    };
    var user = req.body.user
    var new_user = req.body.new_user

    var validation = new Validator(req.body, rules);
    if (validation.fails()) {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR: Validation failed, UserId is required to update the excutive details.");
        }
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Employee Required",
            responseData: {
                res: validation.errors.all()
            }
        })
    }
    else {
        var role = await Management.findOne({ user: req.body.user, business: business }).exec();

        if (role.role == "CRE") {
            if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("DEBUG: Update the New Role(CRE) in all Leads And Bookings, User:" + loggedInDetails.name);
            }
            await Lead.updateMany({ assignee: user, business: business }, { $set: { assignee: new_user } });
            await Booking.updateMany({ manager: user, business: business }, { $set: { manager: new_user } });
            res.status(200).json({
                responseCode: 200,
                responseMessage: "CRE Updated for Leads and Bookings",
                responseData: {}

            });
            if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("INFO: CRE Updated for Leads and Bookings, User:" + loggedInDetails.name);
            }



        }
        else if (role.role = "Service Advisor") {
            if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("DEBUG: Update the New Role(Advisor) in all Bookings, User:" + loggedInDetails.name);
            }
            await Booking.updateMany({ advisor: user }, { $set: { advisor: new_user } });
            res.status(200).json({
                responseCode: 200,
                responseMessage: "Advisor Changed",
                responseData: {}

            });
            if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("INFO: Advisor Updated for Bookings, User:" + loggedInDetails.name);
            }
        }
        else {
            if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
                businessFunctions.logs("WARNING: Role not found for the roleId:" + user + ", User:" + loggedInDetails.name);
            }
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Role not found",
                responseData: {},
            });
        }
    }
});

router.get('/management/roles/get', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /management/roles/get Api Called from analytics.js," + " " + "Request Headers:" + JSON.stringify(req.headers));

    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = await User.findById(decoded.user).exec();

    res.status(200).json({
        responseCode: 200,
        responseMessage: "Role",
        responseData: await ManagementRole.find({}).exec()
    });
    if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("INFO: Management Roles Send Successfully in Response," + " " + "User:" + user.name);
    }
});

router.get('/managements/get/', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /managements/get/ Api Called from analytics.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var business = req.headers['business'];
    var user = await User.findById(decoded.user).exec();
    // console.log("Businesss id=== " + business)
    var managements = [];

    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }

    var page = Math.max(0, parseInt(page));
    var count_ass = 0

    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Getting All User Management details," + " " + "User:" + user.name);
    }
    await Management.find({ business: business, user: { $ne: business } })
        .populate({ path: 'user', select: '_id id name contact_no avatar avatar_address email' })
        .sort({ created_at: -1 }).skip(config.perPage * page).limit(config.perPage)
        .cursor().eachAsync(async (management) => {
            count_ass = count_ass + 1
            // console.log(management._id + " =Count Error = " + count_ass)
            managements.push({
                id: management.user._id,
                name: management.user.name,
                role: management.role,
                department: management.department,
                username: management.user.username,
                email: management.user.email,
                contact_no: management.user.contact_no,
                avatar: management.user.avatar,
                avatar_address: management.user.avatar_address,
            });
            // console.log(management.user._id)

        });
    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Sending All Users(Analytics) in the Management in Response," + " " + "User:" + user.name);
    }
    res.status(200).json({
        responseCode: 200,
        responseMessage: "Analytics",
        responseData: managements
    });
    if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("INFO: Send All Users(Analytics) in the Management in Response Successfully," + " " + "User:" + user.name);
    }
});

router.post('/management/add', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /management/add Api Called from analytics.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = await User.findById(decoded.user).exec();

    var rules = {
        name: 'required',
        contact_no: 'required',
        role: 'required',
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR: Validation failed, Contact_no, name, role are required for creating new account.");
        }
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Mobile No. is required",
            responseData: {
                res: validation.errors.all()
            }
        })
    }
    else {
        var checkPhone = await User.find({ contact_no: req.body.contact_no, "account_info.type": "business" }).count().exec();
        if (checkPhone == 0) {
            var otp = Math.floor(Math.random() * 90000) + 10000;
            var password = Math.floor(Math.random() * 90000) + 10000;

            req.body.username = shortid.generate();
            req.body.socialite = {};
            req.body.optional_info = {};

            var country = await Country.findOne({ timezone: req.headers['tz'] }).exec();
            req.body.address = {
                country: country.countryName,
                timezone: req.headers['tz'],
                location: req.body.location,
            };

            req.body.account_info = {
                type: "business",
                status: "Active",
                phone_verified: false,
                verified_account: false,
                approved_by_admin: false,
            };

            req.body.geometry = [0, 0];
            req.body.password = password;
            req.body.device = [];
            req.body.otp = otp;
            req.body.visibility = false
            req.body.uuid = uuidv1();

            req.body.business_info = {
                business_category: '',
                company: ''
            };

            var firstPart = (Math.random() * 46656) | 0;
            var secondPart = (Math.random() * 46656) | 0;
            firstPart = ("000" + firstPart.toString(36)).slice(-3);
            secondPart = ("000" + secondPart.toString(36)).slice(-3);
            req.body.referral_code = firstPart.toUpperCase() + secondPart.toUpperCase();

            var users_count = await Management.findOne({ business: business }).count().exec();

            if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("DEBUG: businessPlanLimit(business, req.headers['tz']) called from businessFunctions.js");
            }
            var limit = await q.all(businessFunctions.businessPlanLimit(business, req.headers['tz']));
            // console.log(limit.users)
            if (limit.users > users_count) {

                if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                    businessFunctions.logs("DEBUG: Creating New user(Analytics).");
                }
                User.create(req.body).then(async function (user) {
                    // var limit = await q.all(businessPlanLimit(business, req.headers['tz']));
                    // console.log(limit.invoices)
                    // if (limit.user > invoices_count) { }
                    Management.create({
                        business: business,
                        user: user._id,
                        department: req.body.department,
                        role: req.body.role,
                        created_at: new Date(),
                        updated_at: new Date()
                    });
                    // console.log("sumit---" + business);
                    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                        businessFunctions.logs("DEBUG: whatsAppEvent.employeeWel(user.contact_no, business) called from whatsAppEvent.js");
                    }
                    await whatsAppEvent.employeeWel(user.contact_no, business);
                    event.employeeWelcome(user, req.body.role, business);

                    // await whatsAppEvent.agentRegister(user.contact_no, user.referral_code)
                    //event.signupSMS(user);

                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "success",
                        responseData: {
                            user: user
                        },
                    });
                    if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                        businessFunctions.logs("INFO: User(Analyst) created successfully," + " " + "Analyst Name:" + req.body.name + ", Role:" + req.body.role);
                    }
                });
            }
            else {
                if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
                    businessFunctions.logs("WARNING: User limit exceeded, upgrade your plan," + " " + "User:" + user.name);
                }

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "User limit exceeded, upgrade your plan",
                    responseData: {

                    },
                });

            }
        }
        else {
            if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
                businessFunctions.logs("WARNING: Contact_no is Alredy Exists," + " " + "Contact_no:" + req.body.contact_no);
            }
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Phone number already in use.",
                responseData: {},
            });
        }
    }
});

router.get('/sales-report/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var filters = [];
    var reports = [];

    var to = new Date();
    if (req.query.to) {
        to = new Date(req.query.to);
        to.setDate(to.getDate() + 1);
    }

    var from = new Date();
    if (req.query.from) {
        from = new Date(req.query.from);
    }

    var queries = new Object();
    var sortBy = new Object();

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
        status: "Active",
        business: mongoose.Types.ObjectId(business),
        updated_at: { $lte: to, $gte: from }
    };
    filters.push(specification);

    var total_sales = 0;
    var unFlattenedArray = [];


    await OrderInvoice.aggregate(filters)
        .allowDiskUse(true)
        .cursor({ batchSize: 10 })
        .exec()
        .eachAsync(async function (invoice) {
            var services = await q.all(fun.getBusinessOrderItems(invoice.order, business, req.headers['tz']));
            var amount = _.sumBy(services, x => x.amount) + invoice.payment.convenience_charges;

            reports.push({
                type: "Orders",
                invoice_no: invoice.invoice_no,
                name: invoice.user.name,
                contact_no: invoice.user.contact_no,
                total: amount,
                paid_total: invoice.payment.paid_total,
                due: invoice.due.due,

                date: moment(invoice.created_at).tz(req.headers['tz']).format('DD-MM-YYYY')
            });
        });

    await Invoice.aggregate(filters)
        .allowDiskUse(true)
        .cursor({ batchSize: 10 })
        .exec()
        .eachAsync(async function (invoice) {
            var services = invoice.services;

            var paid_total = invoice.payment.paid_total;
            var labour_cost = _.sumBy(services, x => x.labour_cost);
            var part_cost = _.sumBy(services, x => x.part_cost);
            var of_cost = _.sumBy(services, x => x.of_cost);

            var tax = _.sumBy(services, x => x.of_cost);

            var pick_up_charges = 0;
            if (invoice.payment.pick_up_charges) {
                pick_up_charges = invoice.payment.pick_up_charges;
            }

            var policy_clause = 0;
            if (invoice.payment.policy_clause) {
                policy_clause = invoice.payment.policy_clause;
            }

            var salvage = 0;
            if (invoice.payment.salvage) {
                salvage = invoice.payment.salvage;
            }

            var careager_cash = 0;
            if (invoice.payment.careager_cash) {
                careager_cash = invoice.payment.careager_cash;
            }

            var estimate_cost = parseFloat(labour_cost) + parseFloat(part_cost) + parseFloat(of_cost) + parseFloat(policy_clause) + parseFloat(salvage) + parseFloat(pick_up_charges) - parseFloat(careager_cash);

            reports.push({
                type: "Jobs",
                invoice_no: invoice.invoice_no,
                name: invoice.user.name,
                contact_no: invoice.user.contact_no,
                total: estimate_cost,
                paid_total: paid_total,
                due: invoice.due.due,
                date: moment(invoice.created_at).tz(req.headers['tz']).format('DD-MM-YYYY')
            });
        });

    res.status(200).json({
        responseCode: 200,
        responseMessage: "",
        responseInfo: {
            // filters: filters
        },
        responseData: _.orderBy(reports, ['date'], ['desc'])
    });
});

router.get('/purchase-report/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var filters = [];
    var reports = [];

    var to = new Date();
    if (req.query.to) {
        to = new Date(req.query.to);
        to.setDate(to.getDate() + 1);
    }

    var from = new Date();
    if (req.query.from) {
        from = new Date(req.query.from);
    }

    var queries = new Object();
    var sortBy = new Object();

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


    var specification = {};
    specification['$match'] = {
        status: "Completed",
        business: mongoose.Types.ObjectId(business),
        updated_at: { $lte: to, $gte: from }
    };
    filters.push(specification);

    await Purchase.aggregate(filters)
        .allowDiskUse(true)
        .cursor({ batchSize: 10 })
        .exec()
        .eachAsync(async function (invoice) {
            reports.push({
                bill_no: invoice.bill_no,
                reference_no: invoice.reference_no,
                name: invoice.vendor.name,
                contact_no: invoice.vendor.contact_no,
                total: invoice.total,
                date: moment(invoice.created_at).tz(req.headers['tz']).format('DD-MM-YYYY')
            });
        });

    res.status(200).json({
        responseCode: 200,
        responseMessage: "",
        responseData: reports
    });
});

router.get('/profit-loss-report/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var filters = [];
    var reports = [];

    var to = new Date();
    if (req.query.to) {
        to = new Date(req.query.to);
        to.setDate(to.getDate() + 1);
    }

    var from = new Date();
    if (req.query.from) {
        from = new Date(req.query.from);
    }

    var queries = new Object();
    var sortBy = new Object();

    var specification = {};
    specification['$match'] = {
        status: "Completed",
        business: mongoose.Types.ObjectId(business),
        updated_at: { $lte: to, $gte: from }
    };
    filters.push(specification);

    var total_purchase = 0;
    await Purchase.aggregate(filters)
        .allowDiskUse(true)
        .cursor({ batchSize: 10 })
        .exec()
        .eachAsync(async function (invoice) {
            total_purchase = total_purchase + invoice.total;
        });

    await Expense.aggregate(filters)
        .allowDiskUse(true)
        .cursor({ batchSize: 10 })
        .exec()
        .eachAsync(async function (invoice) {
            total_purchase = total_purchase + invoice.total;
        });


    filters = []
    var total_sales = 0;
    var specification = {};

    specification['$match'] = {
        status: "Active",
        business: mongoose.Types.ObjectId(business),
        updated_at: { $lte: to, $gte: from }
    };
    filters.push(specification);

    var business_info = await User.findById(business).select('name email contact_no business_info account_info').exec();

    await OrderInvoice.aggregate(filters)
        .allowDiskUse(true)
        .cursor({ batchSize: 10 })
        .exec()
        .eachAsync(async function (invoice) {
            var services = await q.all(fun.getBusinessOrderItems(invoice.order, business, req.headers['tz']));
            var amount = _.sumBy(services, x => x.amount) + invoice.payment.convenience_charges;

            total_sales = total_sales + amount;

            // console.log(total_sales + " + " + amount)
        });

    await Invoice.aggregate(filters)
        .allowDiskUse(true)
        .cursor({ batchSize: 10 })
        .exec()
        .eachAsync(async function (invoice) {
            var services = invoice.services;

            var paid_total = invoice.payment.paid_total;
            var labour_cost = _.sumBy(services, x => x.labour_cost);
            var part_cost = _.sumBy(services, x => x.part_cost);
            var of_cost = _.sumBy(services, x => x.of_cost);


            var pick_up_charges = 0;
            if (invoice.payment.pick_up_charges) {
                pick_up_charges = invoice.payment.pick_up_charges;
            }

            var policy_clause = 0;
            if (invoice.payment.policy_clause) {
                policy_clause = invoice.payment.policy_clause;
            }

            var salvage = 0;
            if (invoice.payment.salvage) {
                salvage = invoice.payment.salvage;
            }

            var careager_cash = 0;
            if (invoice.payment.careager_cash) {
                careager_cash = invoice.payment.careager_cash;
            }

            var estimate_cost = parseFloat(labour_cost) + parseFloat(part_cost) + parseFloat(of_cost) + parseFloat(policy_clause) + parseFloat(salvage) + parseFloat(pick_up_charges) - parseFloat(careager_cash);

            total_sales = total_sales + estimate_cost

            // console.log(total_sales + " + " + estimate_cost)
        });

    res.status(200).json({
        responseCode: 200,
        responseMessage: "",
        responseData: {
            business: business_info,
            total_sales: total_sales,
            total_purchase: total_purchase,
        }
    });
});

router.put('/management-info/update', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /management-info/update Api Called from analytics.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

    var rules = {
        user: 'required',
        name: 'required',
        contact_no: 'required',
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR: Validation failed, All field required");
        }
        res.status(422).json({
            responseCode: 422,
            responseMessage: "All field required",
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
        var loggedInDetails = await User.findById(decoded.user).exec();
        var user = await User.findById(req.body.user).exec();
        if (user) {
            if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("DEBUG: Check for the contact no already exists or not, Contact_no:" + req.body.contact_no);
            }
            var check = await User.findOne({ contact_no: req.body.contact_no, _id: { $ne: user._id }, "account_info.type": user.account_info.type, }).exec();

            if (check) {
                if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
                    businessFunctions.logs("WARNING: Contact no already exist, Contact_no:" + req.body.contact_no + ", User:" + loggedInDetails.name);
                }
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Contact no already exist",
                    responseData: {}
                });
            }
            else {
                if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                    businessFunctions.logs("DEBUG: Updating User Basic details, Analytics_Name:" + user.name + ", User:" + loggedInDetails.name);
                }
                User.findOneAndUpdate({ _id: user._id }, {
                    $set: {
                        name: req.body.name,
                        contact_no: req.body.contact_no,
                        email: req.body.email,
                        updated_at: new Date()
                    }
                }, { new: false }, async function (err, doc) {
                    if (err) {
                        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                            businessFunctions.logs("ERROR: Error Occured while updating User's details, Name:" + user.name + ", User:" + loggedInDetails.name);
                        }
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Error Occurred",
                            responseData: err,
                        });
                    }
                    else {
                        // var role = await Management.findOne({ user: user._id, business: business }).exec();
                        // console.log("RolE = " + role.role)
                        // if (role.role != "CRE" && role.role != "Service Advisor") {
                        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                            businessFunctions.logs("DEBUG: Updating User Management Role details, Analytics_Name:" + user.name + ", User:" + loggedInDetails.name);
                        }
                        await Management.findOneAndUpdate({ user: user._id, business: business }, {
                            $set: {
                                department: req.body.department,
                                role: req.body.role,
                                updated_at: new Date()
                            }
                        }, { new: false }, function (err, doc) {
                            if (err) {
                                if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                                    businessFunctions.logs("ERROR: Error Occured while updating User's Management Role details, Name:" + user.name + ", User:" + loggedInDetails.name);
                                }
                                res.status(422).json({
                                    responseCode: 422,
                                    responseMessage: "Error Occurred",
                                    responseData: err,
                                });
                            }
                            else {
                                res.status(200).json({
                                    responseCode: 200,
                                    responseMessage: "User details updated...",
                                    responseData: {},
                                })
                                if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                                    businessFunctions.logs("INFO: User details updated, Analytics_Name:" + req.body.name + ", User:" + loggedInDetails.name);
                                }

                            }

                        });
                        // } else {
                        //     res.status(422).json({
                        //         responseCode: 422,
                        //         responseMessage: "Transfer the data before changes",
                        //         responseData: err,
                        //     });
                        // }
                    }

                });
            }
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "User not found",
                responseData: {},
            })
        }
    }
});


router.get('/converted/bookings/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var bookings = [];
    var totalResult = 0;
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
        if (req.query.query) {
            var query = parseInt(req.query.query);
        }
        else {
            var query = 7
        }

        var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
        var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    }
    else {
        var from = new Date(date.getFullYear(), date.getMonth(), 1);
        var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    }


    if (req.query.role = "CRE") {
        var converted = await Lead.find({ business: business, assignee: req.query.user, converted: true, updated_at: { $gte: from, $lte: to } }).exec();

        var id = _.map(converted, '_id');

        var query = { lead: { $in: id }, status: { $nin: ["Rejected", "Cancelled", "Inactive", "EstimateRequested"] }, updated_at: { $gte: from, $lte: to } }
    }
    else if (req.query.role = "Service Advisor") {
        var query = { business: business, advisor: req.query.user, converted: true, status: { $nin: ["Rejected", "Cancelled", "Inactive", "EstimateRequested"] }, updated_at: { $gte: from, $lte: to } }
    }

    else {
        var query = { business: business, converted: true, status: { $nin: ["Rejected", "Cancelled", "Inactive", "EstimateRequested"] }, updated_at: { $gte: from, $lte: to } }
    }

    await Booking.find(query)
        .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no email business_info" } })
        .populate({ path: 'manager', populate: { path: 'user', select: "_id id name contact_no email" } })
        .populate({ path: 'car', select: '_id id title registration_no ic rc _automaker _model', populate: { path: 'thumbnails' } })
        .sort({ updated_at: -1 })
        .cursor().eachAsync(async (booking) => {
            if (booking.address) {
                var address = await Address.findOne({ _id: booking.address }).exec();
            }
            else {
                var address = {};
            }

            var approved = _.filter(booking.services, customer_approval => customer_approval.customer_approval == true);

            var labour_cost = _.sumBy(approved, x => x.labour_cost);
            var part_cost = _.sumBy(approved, x => x.part_cost);
            var of_cost = _.sumBy(approved, x => x.of_cost);
            var discount_total = _.sumBy(approved, x => x.discount);

            var careager_cash = booking.payment.careager_cash;
            var pick_up_charges = booking.payment.pick_up_charges;
            var policy_clause = booking.payment.policy_clause;
            var salvage = booking.payment.salvage;
            var paid_total = booking.payment.paid_total;

            var payment_total = labour_cost + part_cost + of_cost + discount_total + policy_clause + salvage + pick_up_charges;

            var estimate_cost = labour_cost + part_cost + of_cost + policy_clause + salvage + pick_up_charges - careager_cash;

            var due_amount = labour_cost + part_cost + of_cost + policy_clause + salvage + pick_up_charges - (paid_total + careager_cash);

            var due = {
                due: Math.ceil(due_amount.toFixed(2))
            }

            var payment = {
                total: parseFloat(payment_total.toFixed(2)),
                estimate_cost: parseFloat(estimate_cost.toFixed(2)),
                careager_cash: careager_cash,
                of_cost: of_cost,
                labour_cost: labour_cost,
                part_cost: part_cost,
                payment_mode: booking.payment.payment_mode,
                payment_status: booking.payment.payment_status,
                discount_type: booking.payment.discount_type,
                coupon: booking.payment.coupon,
                coupon_type: booking.payment.coupon_type,
                discount_by: booking.payment.discount_by,
                discount: discount_total,
                discount_total: discount_total,
                policy_clause: policy_clause,
                salvage: salvage,
                terms: booking.payment.terms,
                pick_up_limit: booking.payment.pick_up_limit,
                pick_up_charges: pick_up_charges,
                paid_total: booking.payment.paid_total,
                discount_applied: booking.payment.discount_applied,
                transaction_id: booking.payment.coupon,
                transaction_date: booking.payment.transaction_date,
                transaction_status: booking.payment.transaction_status,
                transaction_response: booking.payment.transaction_response,
            };

            if (booking.car) {
                var car = {
                    title: booking.car._automaker + " " + booking.car._model,
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
                payment: payment,
                txnid: booking.txnid,
                __v: booking.__v,
                created_at: moment(booking.created_at).tz(req.headers['tz']).format('lll'),
                updated_at: moment(booking.updated_at).tz(req.headers['tz']).format('lll'),
            });

        });

    res.status(200).json({
        responseCode: 200,
        responseMessage: id,
        responseData: bookings,
        responseInfo: {
            totalResult: totalResult
        }
    });
});

router.get('/analytic/services-vs-segments/get', xAccessToken.token, async function (req, res, next) {
    var rules = {
        from: 'required',
        to: 'required'
    };

    var validation = new Validator(req.query, rules);

    if (validation.fails()) {
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
        var business = req.headers['business'];
        var analytics = [];
        var categories = [];

        var from = new Date(req.query.from);
        var to = new Date(req.query.to);

        await Booking.find({ status: { $in: ["JobInitiated", "JobOpen", "In-Process", "QC", "Ready", "Closed", "Completed"] }, business: business, updated_at: { $gte: from, $lte: to } })
            .populate({ path: 'car', select: '_id model', populate: { path: 'model' } })
            .cursor().eachAsync(async (booking) => {
                if (booking.car.model) {
                    analytics.push({ segment: booking.car.model.segment })
                }
            });

        // return res.json(analytics)

        var data = _.chain(analytics)
            .groupBy("segment")
            .map((value, key) => ({ segment: key, jobs: value.length, sort: segmentSort(key) }))
            .value()


        res.status(200).json({
            responseCode: 200,
            responseMessage: "",
            responseData: _.orderBy(data, ['sort'], ['desc'])
        });
    }
});

router.get('/analytic/leads-vs-conversion/get', xAccessToken.token, async function (req, res, next) {
    var rules = {
        from: 'required',
        to: 'required'
    };

    var validation = new Validator(req.query, rules);

    if (validation.fails()) {
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
        var business = req.headers['business'];
        var analytics = [];
        var categories = [];
        var c = ["Insurance", "Car", "Booking"];

        var from = new Date(req.query.from);
        var to = new Date(req.query.to);

        for (var i = 0; i < c.length; i++) {
            var count = await Lead.find({ category: c[i], business: business, updated_at: { $gte: from, $lte: to } }).count().exec();
            var converted = await Lead.find({ category: c[i], business: business, converted: true, updated_at: { $gte: from, $lte: to } }).count().exec();
            analytics.push({
                category: c[i],
                count: count,
                converted: converted
            })
        }

        res.status(200).json({
            responseCode: 200,
            responseMessage: "",
            responseData: analytics
        });
    }
});


router.get('/analytic/parts-vs-labours/get', xAccessToken.token, async function (req, res, next) {
    var rules = {
        from: 'required',
        to: 'required'
    };

    var validation = new Validator(req.query, rules);

    if (validation.fails()) {
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
        var business = req.headers['business'];
        var analytics = [];

        var from = new Date(req.query.from);
        var to = new Date(req.query.to);

        var startDate = moment(req.query.from);
        var endDate = moment(req.query.to);
        var duration = endDate.diff(startDate, 'days', true);
        var total_cost = 0
        await Invoice.find({ business: business, status: "Active", updated_at: { $gte: from, $lte: to } })
            .cursor().eachAsync(async (invoice) => {
                var pick_up_charges = invoice.payment.pick_up_charges;
                var policy_clause = invoice.payment.policy_clause;
                var salvage = invoice.payment.salvage;

                var labour_cost = _.sumBy(invoice.services, x => x.labour_cost);
                var part_cost = _.sumBy(invoice.services, x => x.part_cost);
                var of_cost = _.sumBy(invoice.services, x => x.of_cost) + pick_up_charges + policy_clause + salvage;


                var month = moment(invoice.created_at).tz(req.headers['tz']).format('MMMM YYYY');
                if (duration <= 31) {
                    month = moment(invoice.created_at).tz(req.headers['tz']).format('MMM DD');
                }

                analytics.push({
                    labour_cost: parseFloat(labour_cost.toFixed(2)),
                    // total_cot: parseFloat(labour_cost.toFixed(2)) + parseFloat(part_cost.toFixed(2)) + parseFloat(part_cost.toFixed(2)),
                    part_cost: parseFloat(part_cost.toFixed(2)),
                    other_cost: parseFloat(of_cost.toFixed(2)),
                    sort: moment(invoice.created_at).tz(req.headers['tz']).format('YYYY-MM-DD'),
                    month: month
                });
                // console.log("Total cost Of Car eager= " + total_cost + parseFloat(labour_cost.toFixed(2)) + parseFloat(part_cost.toFixed(2)) + parseFloat(part_cost.toFixed(2)),)

            });
        // console.log("Total cost =" + total_cost)
        analytics = _.orderBy(analytics, ['sort'], ['asc'])

        var data = _(analytics).groupBy('month').map((objs, key) => ({
            month: key,
            labour_cost: parseInt(_.sumBy(objs, 'labour_cost')),
            part_cost: parseInt(_.sumBy(objs, 'part_cost')),
            other_cost: parseInt(_.sumBy(objs, 'other_cost')),
            total: parseInt(_.sumBy(objs, 'labour_cost')) + parseInt(_.sumBy(objs, 'part_cost')) + parseInt(_.sumBy(objs, 'other_cost')),
        })
        ).value();
        // console.log("Toatal = " + data.labour_cost)

        res.status(200).json({
            responseCode: 200,
            responseMessage: "",
            responseData: data
        });
    }
});

router.get('/analytic/category-vs-revenue/get', xAccessToken.token, async function (req, res, next) {
    var rules = {
        from: 'required',
        to: 'required'
    };

    var validation = new Validator(req.query, rules);

    if (validation.fails()) {
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
        var business = req.headers['business'];
        var analytics = [];

        var from = new Date(req.query.from);
        var to = new Date(req.query.to);



        await Invoice.find({ business: business, status: "Active", updated_at: { $gte: from, $lte: to } })
            .cursor().eachAsync(async (invoice) => {

                var service = _.filter(invoice.services, type => type.type == "collision");
                analytics.push({
                    category: "Collision",
                    total: parseInt(_.sumBy(service, x => x.labour_cost)) + parseInt(_.sumBy(service, x => x.part_cost)) + parseInt(_.sumBy(service, x => x.of_cost)),
                    labour_cost: _.sumBy(service, x => x.labour_cost),
                    part_cost: _.sumBy(service, x => x.part_cost),
                    of_cost: _.sumBy(service, x => x.of_cost)
                })

                var service = _.filter(invoice.services, type => type.type == "services");
                analytics.push({
                    category: "Service",
                    total: parseInt(_.sumBy(service, x => x.labour_cost)) + parseInt(_.sumBy(service, x => x.part_cost)) + parseInt(_.sumBy(service, x => x.of_cost)),
                    labour_cost: _.sumBy(service, x => x.labour_cost),
                    part_cost: _.sumBy(service, x => x.part_cost),
                    of_cost: _.sumBy(service, x => x.of_cost)
                })


                var service = _.filter(invoice.services, type => type.type == "detailing");
                analytics.push({
                    category: "Detailing",
                    total: parseInt(_.sumBy(service, x => x.labour_cost)) + parseInt(_.sumBy(service, x => x.part_cost)) + parseInt(_.sumBy(service, x => x.of_cost)),
                    labour_cost: _.sumBy(service, x => x.labour_cost),
                    part_cost: _.sumBy(service, x => x.part_cost),
                    of_cost: _.sumBy(service, x => x.of_cost)
                })

                var service = _.filter(invoice.services, type => type.type == "customization");
                analytics.push({
                    category: "Customization",
                    total: parseInt(_.sumBy(service, x => x.labour_cost)) + parseInt(_.sumBy(service, x => x.part_cost)) + parseInt(_.sumBy(service, x => x.of_cost)),
                    labour_cost: _.sumBy(service, x => x.labour_cost),
                    part_cost: _.sumBy(service, x => x.part_cost),
                    of_cost: _.sumBy(service, x => x.of_cost)
                })
            });


        var data = _(analytics).groupBy('category').map((objs, key) => ({
            category: key,
            total: parseInt(_.sumBy(objs, 'total')),
            labour_cost: parseInt(_.sumBy(objs, 'labour_cost')),
            part_cost: parseInt(_.sumBy(objs, 'part_cost')),
            other_cost: parseInt(_.sumBy(objs, 'of_cost')),
        })
        ).value();



        res.status(200).json({
            responseCode: 200,
            responseMessage: "",
            responseData: data
        });
    }
});

router.get('/analytic/category-vs-service/get', xAccessToken.token, async function (req, res, next) {
    var rules = {
        from: 'required',
        to: 'required'
    };

    var validation = new Validator(req.query, rules);

    if (validation.fails()) {
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
        var business = req.headers['business'];
        var analytics = [];

        var total = 0;
        var collision = 0;
        var services = 0;
        var detailing = 0;
        var customization = 0;

        var from = new Date(req.query.from);
        var to = new Date(req.query.to);

        collision = await Invoice.find({ business: business, status: "Active", services: { $elemMatch: { type: "collision" } }, updated_at: { $gte: from, $lte: to } }).count().exec();

        services = await Invoice.find({ business: business, status: "Active", services: { $elemMatch: { type: "services" } }, updated_at: { $gte: from, $lte: to } }).count().exec();

        detailing = await Invoice.find({ business: business, status: "Active", services: { $elemMatch: { type: "detailing" } }, updated_at: { $gte: from, $lte: to } }).count().exec();

        customization = await Invoice.find({ business: business, status: "Active", services: { $elemMatch: { type: "customization" } }, updated_at: { $gte: from, $lte: to } }).count().exec();


        res.status(200).json({
            responseCode: 200,
            responseMessage: "",
            responseData: [
                {
                    category: "Collision",
                    count: collision,
                },
                {
                    category: "Services",
                    count: services,
                },
                {
                    category: "Detailing",
                    count: detailing,
                },
                {
                    category: "Customization",
                    count: customization,
                }
            ]
        });
    }
});

router.get('/analytic/non-claim-vs-claim/get', xAccessToken.token, async function (req, res, next) {
    var rules = {
        from: 'required',
        to: 'required'
    };

    var validation = new Validator(req.query, rules);

    if (validation.fails()) {
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
        var business = req.headers['business'];
        var analytics = [];

        var from = new Date(req.query.from);
        var to = new Date(req.query.to);

        var claim = await Invoice.find({ business: business, "insurance_info.claim": true, status: "Active", updated_at: { $gte: from, $lte: to } }).count().exec();

        var non_claim = await Invoice.find({
            business: business, status: "Active", $or: [
                { "insurance_info": { $exists: false } }, { "insurance_info.claim": false }], updated_at: { $gte: from, $lte: to }
        }).count().exec();


        res.status(200).json({
            responseCode: 200,
            responseMessage: "",
            responseData: [
                {
                    category: "Non Claim",
                    count: non_claim,
                },
                {
                    category: "Claim",
                    count: claim,
                }
            ]
        });
    }
});

router.get('/analytic/service-vs-rating/get', xAccessToken.token, async function (req, res, next) {
    var rules = {
        from: 'required',
        to: 'required'
    };

    var validation = new Validator(req.query, rules);

    if (validation.fails()) {
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
        var business = req.headers['business'];
        var analytics = [];
        var categories = [];

        var from = new Date(req.query.from);
        var to = new Date(req.query.to);

        for (var i = 1; i < 6; i++) {
            var review = await Review.find({ business: business, rating: i, type: "service", updated_at: { $gte: from, $lte: to } }).count().exec();
            analytics.push({
                rate: i,
                count: review
            })
        }

        res.status(200).json({
            responseCode: 200,
            responseMessage: "",
            responseData: _.orderBy(analytics, ['rate'], ['desc'])
        });
    }
});

router.get('/analytic/reason-vs-rating/get', xAccessToken.token, async function (req, res, next) {
    var rules = {
        from: 'required',
        to: 'required'
    };

    var validation = new Validator(req.query, rules);

    if (validation.fails()) {
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
        var business = req.headers['business'];
        var analytics = [];
        var categories = [];

        var from = new Date(req.query.from);
        var to = new Date(req.query.to);

        var p = await ReviewPoint.find({}).exec();
        var m = _.map(p, 'points');
        const x = [].concat(...m);

        let points = [...new Set(x)];

        for (var i = 1; i < points.length; i++) {
            var review = await Review.find({ business: business, review_points: { $in: points[i] }, type: "service", updated_at: { $gte: from, $lte: to } }).count().exec();
            analytics.push({
                reason: points[i],
                count: review
            })
        }

        res.status(200).json({
            responseCode: 200,
            responseMessage: "",
            responseData: _.orderBy(analytics, ['rate'], ['desc'])
        });
    }
});

router.get('/analytic/recommendations/get', xAccessToken.token, async function (req, res, next) {
    var rules = {
        from: 'required',
        to: 'required'
    };

    var validation = new Validator(req.query, rules);

    if (validation.fails()) {
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
        var business = req.headers['business'];
        var analytics = [];
        var categories = [];

        var from = new Date(req.query.from);
        var to = new Date(req.query.to);

        for (var i = 1; i < 6; i++) {
            var review = await Review.find({ business: business, recommendation: i, type: "service", updated_at: { $gte: from, $lte: to } }).count().exec();
            analytics.push({
                rate: i,
                count: review
            })
        }

        res.status(200).json({
            responseCode: 200,
            responseMessage: "",
            responseData: _.orderBy(analytics, ['rate'], ['desc'])
        });
    }
});

router.get('/analytic/lost-leads/get', xAccessToken.token, async function (req, res, next) {
    var rules = {
        from: 'required',
        to: 'required'
    };

    var validation = new Validator(req.query, rules);

    if (validation.fails()) {
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
        var business = req.headers['business'];
        var analytics = [];
        var categories = [];

        var reasons = await LeadStatus.findOne({ stage: "Lost" }).exec();

        var c = reasons.status;

        var from = new Date(req.query.from);
        var to = new Date(req.query.to);

        for (var i = 0; i < c.length; i++) {
            var count = await Lead.find({ "remark.reason": c[i], business: business, updated_at: { $gte: from, $lte: to } }).count().exec();

            analytics.push({
                category: c[i],
                count: count,
            })
        }

        res.status(200).json({
            responseCode: 200,
            responseMessage: "",
            responseData: analytics
        });
    }
});

router.get('/analytic/closed-leads/get', xAccessToken.token, async function (req, res, next) {
    var rules = {
        from: 'required',
        to: 'required'
    };

    var validation = new Validator(req.query, rules);

    if (validation.fails()) {
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
        var business = req.headers['business'];
        var analytics = [];
        var categories = [];

        var reasons = await LeadStatus.findOne({ stage: "Closed" }).exec();

        var c = reasons.status;

        var from = new Date(req.query.from);
        var to = new Date(req.query.to);

        for (var i = 0; i < c.length; i++) {
            var count = await Lead.find({ "remark.reason": c[i], business: business, updated_at: { $gte: from, $lte: to } }).count().exec();

            analytics.push({
                category: c[i],
                count: count,
            })
        }

        res.status(200).json({
            responseCode: 200,
            responseMessage: "",
            responseData: analytics
        });
    }
});

router.get('/analytic/leads-vs-source/get', xAccessToken.token, async function (req, res, next) {
    var rules = {
        from: 'required',
        to: 'required'
    };

    var validation = new Validator(req.query, rules);

    if (validation.fails()) {
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
        var business = req.headers['business'];
        var analytics = [];
        var categories = [];

        var from = new Date(req.query.from);
        var to = new Date(req.query.to);

        await Lead.find({ business: business, created_at: { $gte: from, $lte: to } })
            .cursor().eachAsync(async (lead) => {
                analytics.push({
                    source: lead.source,
                });
            });


        var data = _.chain(analytics)
            .groupBy("source")
            .map((value, key) => ({ source: key, length: value.length }))
            .value()

        res.status(200).json({
            responseCode: 200,
            responseMessage: "",
            responseData: data
        });
    }
});

router.get('/analytic/service-revenue/get', xAccessToken.token, async function (req, res, next) {
    var rules = {
        from: 'required',
        to: 'required'
    };

    var validation = new Validator(req.query, rules);

    if (validation.fails()) {
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
        var business = req.headers['business'];
        var analytics = [];

        var from = new Date(req.query.from);
        var to = new Date(req.query.to);

        var startDate = moment(req.query.from);
        var endDate = moment(req.query.to);
        var duration = endDate.diff(startDate, 'days', true);
        // console.log("Duration = " + duration)
        await Invoice.find({ business: business, status: "Active", updated_at: { $gte: from, $lte: to } })
            .cursor().eachAsync(async (invoice) => {
                var pick_up_charges = invoice.payment.pick_up_charges;
                var policy_clause = invoice.payment.policy_clause;
                var salvage = invoice.payment.salvage;

                var labour_cost = _.sumBy(invoice.services, x => x.labour_cost);
                var part_cost = _.sumBy(invoice.services, x => x.part_cost);
                var of_cost = _.sumBy(invoice.services, x => x.of_cost) + pick_up_charges + policy_clause + salvage;

                var month = moment(invoice.created_at).tz(req.headers['tz']).format('MMMM YYYY');
                // console.log("Month = " + month)
                if (duration <= 31) {
                    month = moment(invoice.created_at).tz(req.headers['tz']).format('MMM DD');
                    // console.log("Month <31 = " + month)
                }

                analytics.push({
                    total: labour_cost + part_cost + of_cost,
                    sort: moment(invoice.created_at).tz(req.headers['tz']).format('YYYY-MM-DD'),
                    month: month
                });
            });

        analytics = _.orderBy(analytics, ['sort'], ['asc'])

        var data = _(analytics).groupBy('month').map((objs, key) => ({
            month: key,
            total: parseInt(_.sumBy(objs, 'total')),
        })).value();


        res.status(200).json({
            responseCode: 200,
            responseMessage: duration,
            responseData: data
        });
    }
});

router.get('/analytic/order-revenue/get', xAccessToken.token, async function (req, res, next) {
    var rules = {
        from: 'required',
        to: 'required'
    };

    var validation = new Validator(req.query, rules);

    if (validation.fails()) {
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
        var business = req.headers['business'];
        var analytics = [];

        var from = new Date(req.query.from);
        var to = new Date(req.query.to);


        await OrderInvoice.find({ business: business, status: "Active", updated_at: { $gte: from, $lte: to } })
            .cursor().eachAsync(async (invoice) => {

                analytics.push({
                    total: parseInt(_.sumBy(service, x => x.labour_cost)) + parseInt(_.sumBy(service, x => x.part_cost)) + parseInt(_.sumBy(service, x => x.of_cost)),

                })
            });

        res.status(200).json({
            responseCode: 200,
            responseMessage: "",
            responseData: analytics
        });
    }
});
router.get('/analytic/monthly-revenue/get', xAccessToken.token, async function (req, res, next) {
    var rules = {
        from: 'required',
        to: 'required'
    };

    var validation = new Validator(req.query, rules);

    if (validation.fails()) {
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
        var business = req.headers['business'];
        var analytics = [];

        var from = new Date(req.query.from);
        var to = new Date(req.query.to);
        await Management.find({ business: business, role: "Service Advisor" /* department: req.query.department*/ })
            .populate({ path: 'user', select: '_id id name contact_no avatar avatar_address email created_at' })
            .cursor().eachAsync(async (management) => {
                var analytics = [];
                joiningDate = management.created_at;
                today = new Date();
                var perDayRevenue = 0
                var monthlyAverageRevenue = 0
                var total = await Invoice.find({ advisor: management.user._id, status: "Active" }).exec();
                total_revenue = parseFloat(_.sumBy(total, x => x.payment.total).toFixed(2))
                // console.log("Revenue  = " + total_revenue)
                var diff = Math.abs(new Date(today) - new Date(joiningDate));
                var days = Math.floor(diff / 1000 * 60 * 60 * 24);
                // console.log("days  = " + days)
                // var minutes = Math.floor((diff / 1000) / 60);
                perDayRevenue = total_revenue / days;
                // console.log("perDayRevenue  = " + perDayRevenue)
                monthlyAverageRevenue = perDayRevenue * 30;
                // console.log("monthlyAverageRevenue  = " + monthlyAverageRevenue)


            });

        res.status(200).json({
            responseCode: 200,
            responseMessage: "",
            responseData: analytics
        });
    }
});


module.exports = router