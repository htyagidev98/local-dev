var mongoose = require('mongoose'),
    express = require('express'),
    { ObjectId } = require('mongodb').ObjectID,
    router = express.Router(),
    config = require('../config')
bcrypt = require('bcrypt-nodejs')
jwt = require('jsonwebtoken')
aws = require('aws-sdk')
multerS3 = require('multer-s3')
uuidv1 = require('uuid/v1')
Validator = require('validatorjs')
multer = require('multer')
request = require('request')
extract = require('mention-hashtag'),
    shortid = require('shortid'),
    ffmpeg = require('ffmpeg'),
    formidable = require('formidable'),
    path = require('path'),
    moment = require('moment-timezone'),
    q = require('q'),
    fs = require('fs'),
    _ = require('lodash'),
    async = require("async"),
    assert = require('assert'),
    xlstojson = require("xls-to-json-lc"),      //Abhinav
    xlsxtojson = require("xlsx-to-json-lc"),    //Abhinav
    bodyParser = require('body-parser'),        //Abhinav
    nodemailer = require('nodemailer'),
    crypto = require('crypto'),
    admin = require('firebase-admin'),
    FCM = require('fcm-node');

global.packageDiscountOn = [];

var secret = config.secret;
var paytm_config = require('../paytm/paytm_config').paytm_config;
var paytm_checksum = require('../paytm/checksum');
var querystring = require('querystring');
var salt = bcrypt.genSaltSync(10);
var s3 = new aws.S3({
    accessKeyId: config.IAM_USER_KEY,
    secretAccessKey: config.IAM_USER_SECRET,
    Bucket: config.BUCKET_NAME
});


const whatsappEvent = require('../api/whatsapp/whatsappEvent')
const xAccessToken = require('../middlewares/xAccessToken');
const whatsAppEvent = require('./whatsapp/whatsappEvent');
const fun = require('../api/function');
const event = require('../api/event');
const Car = require('../models/car');
const User = require('../models/user');
const Post = require('../models/post');
const Like = require('../models/like');
const Model = require('../models/model');
const State = require('../models/state');
const Point = require('../models/point');
const Follow = require('../models/follow');
const Review = require('../models/review');
const Hashtag = require('../models/hashtag');
const Tax = require('../models/tax');
const Comment = require('../models/comment');
const BookingCategory = require('../models/bookingCategory');
const Booking = require('../models/booking');
const Variant = require('../models/variant');
const ClubMember = require('../models/clubMember');
const Club = require('../models/club');
const Country = require('../models/country');
const Category = require('../models/category');
const Referral = require('../models/referral');
const Automaker = require('../models/automaker');
const PostMedia = require('../models/postMedia');
const BrandLike = require('../models/brandLike');
const ModelReview = require('../models/modelReview');
const PostView = require('../models/postView');
const Product = require('../models/product');
const Service = require('../models/service');
const Insurance = require('../models/insurance');
const Diagnosis = require('../models/diagnosis');
const Collision = require('../models/collision');
const BookingService = require('../models/bookingService');
const BusinessServicePackage = require('../models/businessServicePackage');
const Address = require('../models/address');
const Coupon = require('../models/coupon');
const CouponUsed = require('../models/couponUsed');
const Washing = require('../models/washing');
const BusinessOffer = require('../models/businessOffer');
const Offer = require('../models/offer');
const Lead = require('../models/lead');
const LeadGen = require('../models/leadGen');          //LeadGeneration Data
const LeadRemark = require('../models/leadRemark');
const LeadStatus = require('../models/leadStatus');
const Package = require('../models/package');
const UserPackage = require('../models/userPackage');
const PackageUsed = require('../models/packageUsed');
const Management = require('../models/management');
const LeadManagement = require('../models/leadManagement');
const Notification = require('../models/notification');
const OutBoundLead = require('../models/outBoundLead');
const QuotationOrders = require('../models/quotationOrders')
const VendorOrders = require('../models/vendorOrders')
const businessFunctions = require('./erpWeb/businessFunctions')

router.get('/booking/reminder/', async function (req, res, next) {
    var date = new Date(new Date().setHours(0, 0, 0, 0));
    var next = new Date(new Date().setHours(0, 0, 0, 0));

    next.setDate(date.getDate() + 1);

    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'tech@careager.com',
            pass: 'developers.tech@2018'
        }
    });

    await Booking.find({
        is_services: true,
        date: { $gte: date, $lt: next },
        status: "Confirmed",
    })
        .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no" } })
        .populate({ path: 'business', populate: { path: 'user', select: "_id id name contact_no" } })
        .populate({ path: 'car', select: '_id id title registration_no' })
        .cursor().eachAsync(async (booking) => {
            var services = [];
            booking.services.forEach(function (service) {
                services.push(service.service)
            });
            let mailToUser = {
                from: 'CarEager Xpress <tech@careager.com>',
                to: booking.user.email,
                subject: '[Reminder] Booking No-# ' + booking.booking_no, // Subject line
                html: '<h2 style="margin:5px 0;">' + booking.business.name.toUpperCase() + '</h2><h3 style="margin:2px 0;">' + moment(booking.date).format('ll') + ' (' + booking.time_slot + ')</h3> <h4>' + services + '</h4><p style="margin:3px 0">18/1, NH8, Sector 35, Gurugram, Haryana 122004</p> <p style="margin:3px 0">Behind Grace Toyota (Near Mercedes-Benz), 1800 843 4300</p> <p style="margin:3px 0"><a href="https://goo.gl/maps/m5SuCHXndx62">https://goo.gl/maps/m5SuCHXndx62</a></p><table><tr><td><h4 style="margin-top:5px; margin-bottom: 2px">' + booking.car.title + '(' + booking.car.fuel_type + ')</h4></td></tr><tr><th style="text-align: left">Registration #</th><td>' + booking.car.registration_no + '</td></tr><tr><th style="text-align: left">Booking No </th><td>' + booking.booking_no + '</td></tr><tr><th style="text-align: left">Service Value</th><td>' + booking.payment.total + '</td></tr><tr><th style="text-align: left">Amount Paid</th><td>' + booking.payment.paid_total + '</td></tr><tr><th style="text-align: left">Discount</th><td>' + booking.payment.discount_type + '</td></tr><tr><th style="text-align: left">Coupon Discount</th><td>' + booking.payment.discount_total + '</td></tr></table> <p style="margin:15px 0"><p style="margin:3px 0">- Android: <a href="https://goo.gl/fU5Upb">https://goo.gl/fU5Upb</a></p> <p style="margin:3px 0">- iOS App: Available on the App Store</p></p>'
            };

            transporter.sendMail(mailToUser, (error, info) => {
                if (error) {
                    // console.log(error);
                }
                // console.log('Message sent: %s', info.messageId);
            });


            var username = encodeURIComponent("avinay.vminc@gmail.com");
            var hash = encodeURIComponent("58fc07a01c2a0756a3abf1bb483314af8503efdf");
            var number = encodeURIComponent("91" + booking.user.contact_no);
            var sender = encodeURIComponent("VMCARS");
            var message = encodeURIComponent("Hi " + booking.user.name + ", you have an appointment booked for today (" + booking.time_slot + " slot) for " + booking.car.registration_no + ". Please use the CarEager Xpress App for more info/changes.");

            var data = "username=" + username + "&hash=" + hash + "&numbers=" + number + "&sender=" + sender + "&message=" + message;
            request('http://api.textlocal.in/send/?' + data, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    // console.log(message)
                }
            })
        })


    res.json("Done")
});

router.get('/add/lead', async function (req, res, next) {
    businessId = "5bfec47ef651033d1c99fbca";
    var check = await User.findOne({ contact_no: req.query.contact_no }).exec();
    var manager = await User.findOne({ "optional_info.uid": req.query.owner }).exec()
    if (check) {
        event.zohoUpdateOwner(req.query, check._id);
        var bookingService = [];
        var customer_requirements = [];
        var countBooking = await Booking.find({}).count().exec();

        if (req.query.remark) {
            customer_requirements.push({
                requirement: req.query.remark,
            });
        }

        var advisorBooking = [];
        await Management.find({ business: businessId, role: "Service Advisor" })
            .cursor().eachAsync(async (a) => {
                var d = await Booking.find({ business: businessId, advisor: a.user, status: { $in: ["JobInitiated", "JobOpen", "In-Process", "StartWork", "Rework", "EstimateRequested"] } }).count().exec();
                advisorBooking.push({
                    user: a.user,
                    count: d
                })
            });

        //res.json(advisorBooking)

        if (advisorBooking.length != 0) {
            advisorBooking.sort(function (a, b) {
                return a.count > b.count;
            });

            var advisor = advisorBooking[0].user;
        }
        else {
            var advisor = null
        }


        var payment = {
            payment_mode: "Undefined",
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
            car: null,
            advisor: advisor,
            manager: manager._id,
            business: businessId,
            user: check.id,
            services: bookingService,
            customer_requirements: customer_requirements,
            booking_no: Math.round(+new Date() / 1000),
            date: new Date(),
            time_slot: "N/a",
            convenience: "N/a",
            status: "Assigned",
            payment: payment,
            address: null,
            lead: req.query.lead_id,
            is_services: true,
            created_at: new Date(),
            updated_at: new Date()
        };

        Booking.create(bookingData).then(async function (booking) {
            var notify = {
                receiver: [booking.business],
                activity: "booking",
                tag: "assignedBooking",
                source: booking._id,
                sender: booking.user,
                points: 0
            }
            fun.newNotification(notify);

            if (booking.advisor) {
                var notify = {
                    receiver: [booking.advisor],
                    activity: "booking",
                    tag: "assignedBooking",
                    source: booking._id,
                    sender: booking.user,
                    points: 0
                }

                fun.newNotification(notify);
            }

            event.assignedBookingMail(booking._id);

            var activity = "Booking"
            fun.webNotification(activity, booking);
            await whatsAppEvent.newBookingAdvisor(booking._id);
            await whatsAppEvent.bookingWhatsApp(booking._id);
            res.status(200).json({
                responseCode: 200,
                responseMessage: "Assigned",
                responseData: booking._id
            });
        });
    }
    else {
        var data = new Object();
        data.address = {
            country: "India",
            timezone: "Asia/Kolkata",
            location: "",
        };

        data.account_info = {
            type: "user",
            status: "Complete",
        };

        var name = req.query.first_name.substring(0, 3);
        var rand = Math.floor((Math.random() * 100000) + 1);

        data.username = name + "" + shortid.generate();
        data.referral_code = name.toUpperCase() + "" + rand;
        data.geometry = [0, 0];
        data.device = [];
        data.otp = Math.floor(Math.random() * 90000) + 10000;
        data.careager_cash = 0;
        data.socialite = "";
        data.optional_info = "";
        data.business_info = "";
        data.name = req.query.first_name + " " + req.query.last_name;
        data.email = req.query.email;
        data.contact_no = req.query.contact_no;


        User.create(data).then(async function (user) {
            //event.otpSms(user);
            event.zohoUpdateOwner(req.query, user._id);

            var bookingService = [];
            var customer_requirements = [];
            var countBooking = await Booking.find({}).count().exec();

            if (req.query.remark) {
                // console.log(req.query.remark)
                customer_requirements.push({
                    requirement: req.query.remark,
                });
            }

            var advisorBooking = [];
            await Management.find({ business: businessId, role: "Service Advisor" })
                .cursor().eachAsync(async (a) => {
                    var d = await Booking.find({ business: req.query.business, advisor: a.user, status: { $in: ["JobInitiated", "JobOpen", "In-Process", "StartWork", "Rework", "EstimateRequested"] } }).count().exec();
                    advisorBooking.push({
                        user: a.user,
                        count: await Booking.find({ business: req.query.business, advisor: a.user, status: { $in: ["JobInitiated", "JobOpen", "In-Process", "StartWork", "Rework", "EstimateRequested"] } }).count().exec()
                    })
                });


            if (advisorBooking.length != 0) {
                var min = advisorBooking.reduce(function (prev, current) {
                    return (prev.count < current.count) ? prev : current
                });
                var advisor = min.user
            }
            else {
                var advisor = null
            }

            var payment = {
                payment_mode: "Undefined",
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
                car: null,
                advisor: advisor,
                manager: manager._id,
                business: businessId,
                user: user.id,
                services: bookingService,
                customer_requirements: customer_requirements,
                booking_no: Math.round(+new Date() / 1000),
                date: new Date(),
                time_slot: "N/a",
                convenience: "N/a",
                status: "Assigned",
                payment: payment,
                address: null,
                lead: lead._id,
                is_services: true,
                created_at: new Date(),
                updated_at: new Date()
            };


            Booking.create(bookingData).then(async function (booking) {
                var notify = {
                    receiver: [booking.business],
                    activity: "booking",
                    tag: "assignedBooking",
                    source: booking._id,
                    sender: booking.user,
                    points: 0
                }
                fun.newNotification(notify);

                if (booking.advisor) {
                    var notify = {
                        receiver: [booking.advisor],
                        activity: "booking",
                        tag: "assignedBooking",
                        source: booking._id,
                        sender: booking.user,
                        points: 0
                    }

                    fun.newNotification(notify);
                }

                event.assignedBookingMail(booking._id);
                var activity = "Booking"
                fun.webNotification(activity, booking);
                await whatsAppEvent.newBookingAdvisor(booking._id);
                await whatsAppEvent.bookingWhatsApp(booking._id);
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Assigned",
                    responseData: booking._id
                });
            });
        }).catch(next);
    }
});

router.get('/booking/reminder/today', async function (req, res, next) {
    var date = new Date(new Date().setHours(0, 0, 0, 0));
    var next = new Date(new Date().setHours(0, 0, 0, 0));

    next.setDate(date.getDate() + 1);

    // console.log(date + "-" + next)

    var leads = [];

    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'tech@careager.com',
            pass: 'developers.tech@2018'
        }
    });

    var html = '';

    await Booking.find({
        is_services: true,
        date: { $gte: date, $lt: next },
        status: { $ne: "Inactive" },
        $and: [{
            status: { $ne: "Completed" },
            status: { $ne: "Rejected" },
            status: { $ne: "Cancelled" },
        }],
    })
        .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no" } })
        .populate({ path: 'business', populate: { path: 'user', select: "_id id name contact_no" } })
        .populate({ path: 'car', select: '_id id title registration_no fuel_type' })
        .cursor().eachAsync(async (booking) => {
            if (booking) {
                if (booking.status == "Pending" || booking.status == "Confirmed") {
                    var services = [];
                    var description = "";
                    booking.services.forEach(function (service) {
                        services.push(service.service)
                        if (service.service == "Periodic Maintenance") {
                            description = service.description;
                        }
                    });
                    html += '<table style="border-bottom:1px solid #ddd;margin-bottom:15px;">';
                    html += '<tr><td colspan="2">#' + booking.booking_no + '-' + booking.user.name.toUpperCase() + ' / ' + moment(booking.date).format('ll') + ' / (' + booking.time_slot + ') / (' + booking.status.toUpperCase() + ')</h3></td></tr><tr><td colspan="2">' + services + '</td></tr><tr><td colspan="2">' + description + '</td></tr><tr><td colspan="2">#' + booking.car.registration_no + "-" + booking.car.title + '(' + booking.car.fuel_type + ')</h4></td></tr>';

                    html += '</table>';

                    leads.push(html)

                    let mailToUser = {
                        from: 'CarEager Xpress <tech@careager.com>',
                        to: booking.business.email,
                        subject: "[Reminder] Today's Bookings",
                        html: html
                    };

                    transporter.sendMail(mailToUser, (error, info) => {
                        if (error) {
                            // console.log(error);
                        }
                        // console.log('Message sent: %s', info.messageId);
                    });
                }
            }
        })
    res.json(leads)
});

router.get('/booking/reminder/tomorrow', async function (req, res, next) {
    var date = new Date(new Date().setHours(0, 0, 0));
    date.setDate(date.getDate() + 1);

    var next = new Date(new Date().setHours(0, 0, 0));
    next.setDate(next.getDate() + 1);

    var dayAfterTomorrow = next
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    var leads = [];
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'tech@careager.com',
            pass: 'developers.tech@2018'
        }
    });

    var html = '';

    await Booking.find({
        is_services: true,
        date: { $gte: date, $lt: dayAfterTomorrow },
        status: { $ne: "Inactive" },
        $and: [{
            status: { $ne: "Completed" },
            status: { $ne: "Rejected" },
            status: { $ne: "Cancelled" },
        }],
    })
        .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no" } })
        .populate({ path: 'business', populate: { path: 'user', select: "_id id name contact_no" } })
        .populate({ path: 'car', select: '_id id title registration_no fuel_type' })
        .cursor().eachAsync(async (booking) => {
            if (booking) {
                if (booking.status == "Pending" || booking.status == "Confirmed") {
                    var services = [];
                    var description = "";
                    booking.services.forEach(function (service) {
                        services.push(service.service)
                        if (service.service == "Periodic Maintenance") {
                            description = service.description;
                        }
                    });
                    html += '<table style="border-bottom:1px solid #ddd;margin-bottom:15px;">';
                    html += '<tr><td colspan="2">#' + booking.booking_no + '-' + booking.user.name.toUpperCase() + ' / (' + booking.time_slot + ') / (' + booking.status.toUpperCase() + ')</h3></td></tr><tr><td colspan="2">' + services + '</td></tr><tr><td colspan="2">' + description + '</td></tr><tr><td colspan="2">#' + booking.car.registration_no + "-" + booking.car.title + '(' + booking.car.fuel_type + ')</h4></td></tr>';

                    html += '</table>';


                    leads.push(html)

                    let mailToUser = {
                        from: 'CarEager Xpress <tech@careager.com>',
                        to: booking.business.email,
                        subject: "[Reminder] Tomorrow's Bookings",
                        html: html
                    };

                    transporter.sendMail(mailToUser, (error, info) => {
                        if (error) {
                            // console.log(error);
                        }
                        // console.log('Message sent: %s', info.messageId);
                    });
                }
            }
        })
    res.json(leads)
});

router.get('/missed/booking/', async function (req, res, next) {
    var date = new Date()

    var from = new Date(date - 24 * 60 * 60 * 1000);
    from.setDate(date.getDate() - 2);
    from.setHours(23, 59, 59)

    var to = new Date(date - 24 * 60 * 60 * 1000);
    to.setDate(date.getDate() - 1);
    to.setHours(23, 59, 59)

    var leads = [];

    // console.log(from + " " + to)

    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'tech@careager.com',
            pass: 'developers.t;ech@2018'
        }
    });

    var html = '';

    await Booking.find({
        is_services: true,
        date: { $gte: from, $lte: to },
    })
        .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no email" } })
        .populate({ path: 'business', populate: { path: 'user', select: "_id id name contact_no email" } })
        .populate({ path: 'car', select: '_id id title registration_no fuel_type' })
        .cursor().eachAsync(async (booking) => {
            if (booking) {
                if (booking.status == "Pending" || booking.status == "Confirmed") {
                    var services = [];
                    var description = "";
                    booking.services.forEach(function (service) {
                        services.push(service.service)
                        if (service.service == "Periodic Maintenance") {
                            description = service.description;
                        }
                    });

                    html = '#' + booking.booking_no + '-' + booking.user.name.toUpperCase() + ' / ' + moment(booking.date).format('ll') + ' / (' + booking.time_slot + ') / (' + booking.status.toUpperCase() + ') ' + services + ' / ' + booking.car.registration_no + "-" + booking.car.title + '(' + booking.car.fuel_type + ')';

                    var lead = {
                        name: booking.user.name,
                        contact_no: booking.user.contact_no,
                        email: booking.user.email,
                        remark: {
                            remark: html
                        },
                        type: "Missed Booking"
                    };
                    leads.push(html)
                    event.zohoLead(lead)
                }
            }
        })
    res.json(leads)
});

router.get('/today/delivery', async function (req, res, next) {
    var date = new Date();
    var to = moment(date, "YYYY-MM-DD").tz('Asia/Kolkata').subtract(1, 'days');

    await Booking.find({ sub_status: { $ne: "" }, status: { $nin: ["Cancelled", "Ready", "Closed", "Completed"] }, delivery_date: { $lte: to } })
        .populate('car')
        .cursor().eachAsync(async (booking) => {
            var users = [booking.business, booking.advisor];
            await User.find({ _id: { $in: users } })
                .cursor().eachAsync(async (user) => {
                    if (user) {
                        var data = {
                            user: user._id,
                            body: booking.car.registration_no + " delivered by " + moment(booking.delivery_date).tz('Asia/Kolkata').format("DD-MM-YY"),
                            title: "Today Deliveries",
                            sound: "default",
                            badge: "1",
                            source: null,
                            tag: "Booking",
                            activity: "Booking",
                            file: req.query.file,
                            created_at: new Date(),
                            updated_at: new Date()
                        };

                        if (user.device) {
                            user.device.forEach(function (device) {
                                var fcmCli = new FCM(config.server_key);
                                if (device.deviceType == "Android") {
                                    var fcmId = device.fcmId;
                                    var payloadOK = {
                                        to: fcmId,
                                        data: {
                                            title: data.title,
                                            body: data.body,
                                            sound: "default",
                                            badge: "1",
                                            source: data.source,
                                            tag: data.tag,
                                            file: data.file,
                                            activity: data.activity
                                        },
                                        priority: 'high',
                                        content_available: true,
                                    };

                                    var payloadError = {
                                        to: fcmId, //invalid registration token
                                        data: { //some data object (optional)
                                            title: data.title,
                                            body: data.body,
                                            sound: "default",
                                            badge: "1",
                                            source: data.source,
                                            tag: data.tag,
                                            file: "",
                                            activity: data.activity
                                        },
                                        content_available: true,
                                    };
                                }
                                else {
                                    var fcmId = device.fcmId;
                                    var payloadOK = {
                                        to: fcmId,
                                        data: { //some data object (optional)
                                            title: data.title,
                                            body: data.body,
                                            sound: "default",
                                            badge: "1",
                                            source: data.source,
                                            tag: data.tag,
                                            file: "",
                                            activity: data.activity
                                        },
                                        notification: {
                                            title: data.title,
                                            body: data.body,
                                            sound: "default",
                                            badge: "1",
                                            source: data.source,
                                            tag: data.tag,
                                            file: "",
                                            activity: data.activity
                                        },
                                        priority: 'high',
                                        content_available: true,
                                    };
                                    var payloadError = {
                                        to: fcmId, //invalid registration token
                                        data: { //some data object (optional)
                                            title: data.title,
                                            body: data.body,
                                            sound: "default",
                                            badge: "1",
                                            source: data.source,
                                            tag: data.tag,
                                            file: req.query.file,
                                            activity: data.activity
                                        },
                                        notification: {
                                            title: data.title,
                                            body: data.body,
                                            sound: "default",
                                            badge: "1",
                                            source: data.source,
                                            tag: data.tag,
                                            file: req.query.file,
                                            activity: data.activity
                                        },
                                        priority: 'high',
                                        content_available: true,
                                    };
                                }


                                var callbackLog = function (sender, err, res) {
                                    // console.log("\t" + sender);
                                    // console.log("err=" + err);
                                    // console.log("res=" + res);
                                    // console.log("res=" + device.fcmId);
                                    // console.log("----------------------------------\n");
                                };

                                function sendOK() {
                                    fcmCli.send(payloadOK, function (err, res) {
                                        callbackLog('sendOK', err, res);
                                    });
                                };

                                function sendError() {
                                    fcmCli.send(payloadError, function (err, res) {
                                        callbackLog('sendError', err, res);
                                    });
                                };

                                sendOK();
                            });
                        }
                    }
                });
        });

    res.json("ok")
});

router.get('/knowlarity/lead/add', async function (req, res, next) {
    businessId = "5bfec47ef651033d1c99fbca";
    var contact_no = req.query.caller_id;
    contact_no = contact_no.substring(3)
    var getUser = await User.findOne({ contact_no: contact_no }).exec();
    // event.notifyAbhinav(contact_no)

    var user = null;
    var name = "";
    var email = "";

    if (getUser) {
        user = getUser._id;
        name = getUser.name;
        email = getUser.email;
        contact = getUser.contact_no;
    }

    var checkLead = await Lead.findOne({ contact_no: contact_no, business: businessId, "remark.status": { $in: ["Open", "Follow-Up",] } }).sort({ updated_at: -1 }).exec();

    var status = await LeadStatus.findOne({ status: "Open" }).exec();

    if (checkLead) {
        await Lead.findOneAndUpdate({ _id: checkLead._id }, {
            $set: {
                type: "Knowlarity",
                follow_up: {
                    date: null,
                    time: "",
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                remark: {
                    status: status.status,
                    resource: req.query.resource_url,
                    customer_remark: "Knowlarity",
                    assignee_remark: "Knowlarity",
                    resource: req.query.resource_url,
                    color_code: status.color_code,
                    created_at: new Date(),
                    updated_at: new Date()
                },
                // source: "Knowlarity",
                source: checkLead.source,
                updated_at: new Date()
            }
        }, { new: false }, async function (err, doc) {

            await LeadRemark.create({
                lead: checkLead._id,
                type: "Knowlarity",
                source: "Knowlarity",
                resource: req.query.resource_url,
                status: status.status,
                customer_remark: "Knowlarity",
                assignee_remark: "Knowlarity",
                assignee: checkLead.assignee,
                color_code: status.color_code,
                created_at: new Date(),
                updated_at: new Date()
            }).then(async function (newRemark) {
                await Lead.findOneAndUpdate({ _id: checkLead._id }, { $push: { remarks: newRemark._id } }, { new: true }, async function (err, doc) {
                })
            });



            event.assistance(checkLead, req.headers['tz'])
            //await whatsappEvent.leadGenerate(doc.contact_no, doc.assignee, businessId)

            var json = ({
                responseCode: 200,
                responseMessage: "Pre: " + checkLead._id,
                responseData: {}
            });

            res.status(200).json(json)
        });
    }
    else {
        var data = {}
        var manager = businessId;

        var status = await LeadStatus.findOne({ status: "Open" }).exec();

        var managers = [];
        await Management.find({ business: businessId, role: "CRE" })
            .cursor().eachAsync(async (a) => {
                // var d = await Lead.find({ business: businessId, assignee: a.user, 'remark.status': { $in: ['Open', 'Follow-Up'] } }).count().exec();
                var open = await Lead.find({ business: businessId, assignee: a.user, 'remark.status': { $in: ['Open',] } }).count().exec();
                var follow_up = await Lead.find({ business: businessId, assignee: a.user, 'remark.status': { $in: ['Follow-Up'] }, 'follow_up.date': { $lte: new Date() } }).count().exec();
                var d = open + follow_up;
                managers.push({
                    user: a.user,
                    count: d
                })
            });

        if (managers.length != 0) {
            managers.sort(function (a, b) {
                return a.count > b.count;
            });

            manager = managers[0].user;
        }

        var data = {
            user: user,
            business: businessId,
            name: name,
            contact_no: contact_no,
            email: email,
            assignee: manager,
            contacted: false,
            priority: 3,
            follow_up: {

            },
            type: "Knowlarity",
            geometry: [0, 0],
            source: "Knowlarity",
            remark: {
                status: status.status,
                customer_remark: "Knowlarity",
                assignee_remark: "Knowlarity",
                assignee: manager,
                resource: req.query.resource_url,
                color_code: status.color_code,
                created_at: new Date(),
                updated_at: new Date()
            },
            created_at: new Date(),
            updated_at: new Date(),
        }

        await Lead.create(data).then(async function (lead) {
            var count = await Lead.find({ _id: { $lt: lead._id }, business: businessId }).count();
            var lead_id = count + 10000;

            await Lead.findOneAndUpdate({ _id: lead._id }, { $set: { lead_id: lead_id } }, { new: true }, async function (err, doc) {
            })
            var status = await LeadStatus.findOne({ status: "Open" }).exec();
            await LeadRemark.create({
                lead: lead._id,
                type: "Knowlarity",
                source: "Knowlarity",
                status: status.status,
                customer_remark: "Knowlarity",
                assignee_remark: "Knowlarity",
                assignee: manager,
                resource: req.query.resource_url,
                color_code: status.color_code,
                created_at: new Date(),
                updated_at: new Date()
            }).then(async function (newRemark) {
                await Lead.findOneAndUpdate({ _id: lead._id }, { $push: { remarks: newRemark._id } }, { new: true }, async function (err, doc) {
                })
            });

            event.assistance(lead, req.headers['tz'])
            fun.webNotification("Lead", lead);
            //knowlarity vinay

            await whatsAppEvent.leadGenerate(lead._id, businessId);
            event.leadCre(lead._id, businessId);
            await whatsAppEvent.leadCre(lead._id, businessId);
            var json = ({
                responseCode: 200,
                responseMessage: "New: " + lead._id,
                responseData: {}
            });

            res.status(200).json(json)
        });
    }
});

router.get('/notitfications/push', async function (req, res, next) {


    res.status(200).json({
        responseCode: 200,
        responseMessage: "Notifications Pushed",
        responseData: {}
    })
});

router.get('/validate/token', async function (req, res, next) {
    await User.find({ "account_info.type": "user" })
        .cursor().eachAsync(async (user) => {
            if (user) {
                if (user.device) {
                    user.device.forEach(function (device) {
                        admin.auth().verifyIdToken(device.fcmId)
                            .then((decodedToken) => {
                                // console.log(device.fcmId);
                            })
                            .catch((err) => {
                                LOG.error(err)
                            })
                    });
                }
            }
        });

    res.status(200).json({
        responseCode: 200,
        responseMessage: "Notifications Pushed",
        responseData: {}
    })
});

router.get('/business/user/add', async function (req, res, next) {

    await Booking.find({})
        .cursor().eachAsync(async (booking) => {
            fun.setBusinessUser(booking.business, booking.user)
        });

    await Lead.find({})
        .cursor().eachAsync(async (lead) => {
            fun.setBusinessUser(lead.business, lead.user)
        });


    res.json("done")
});

router.get('/callback/new/policy/', async function (req, res, next) {
    var rules = {
        registration_no: 'required',
        policy_no: 'required',
        cashless: 'required',
        insurance_company: 'required',
        expire: 'required',
        premium: 'required',
        policy_type: 'required',
    };

    var validation = new Validator(req.query, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Validation Error",
            responseData: {}
        });
    }
    else {
        var car = await Car.findOne({ registration_no: req.query.registration_no, status: true }).exec();
        if (car) {
            var insurance_info = {
                registration_no: req.query.registration_no,
                policy_holder: req.query.policy_holder,
                insurance_company: req.query.insurance_company,
                policy_no: req.query.policy_no,
                premium: parseInt(req.query.premium),
                expire: new Date(req.query.expire).toISOString(),
                cashless: req.query.cashless,
                policy_type: req.query.policy_type,
            };

            Car.findOneAndUpdate({ _id: car._id }, { $set: { insurance_info: insurance_info } }, { new: false }, function (err, doc) {
                if (err) {
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Server Error",
                        responseData: {}
                    });
                }
                else {
                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "success",
                        responseData: insurance_info
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
});



router.get('/justdial/lead/add', async function (req, res, next) {
    var contact_no = req.query.mobile;
    // contact_no = contact_no.substring(3)
    var getUser = await User.findOne({ contact_no: contact_no }).exec();
    // event.notifyAbhinav(contact_no);
    var user = null;
    var name = req.query.name;
    var email = req.query.email;
    var business_name = req.query.company;  //CarEager Xpress Gurugram
    var businessId = "";
    // console.log(email)
    // var source=req.query.leadtype;
    // Abhinav Check all Data of lead from Just Dial
    var leadData = {
        contact_no: req.query.mobile,
        leadId: req.query.leadid,
        category: req.query.category,
        leadtype: req.query.leadtype,
        date: new Date(req.query.date),
        city: req.query.city,
        area: req.query.area,
        brancharea: req.query.brancharea,
        dncmobile: req.query.dncmobile,
        dncphone: req.query.dncphone,
        dncphone: req.query.dncphone,
        pincode: req.query.pincode,
        company: req.query.company,
        time: req.query.time,
        branchpin: req.query.branchpin,
        parentid: req.query.parentid,
    }
    // END
    var c_remark = req.query.category;
    var mailId = "abhinav@autroid.com";
    //event.justdialData(mailId, leadData);

    var source = "JustDial";

    if (getUser) {
        user = getUser._id;
        name = getUser.name;
        email = getUser.email;
        contact = getUser.contact_no;
    }
    var business_record = await User.findOne({ "account_info.type": "business", "name": business_name }).exec();
    if (business_record) {
        businessId = business_record._id;
    }
    else {
        businessId = "5bfec47ef651033d1c99fbca";
    }
    // businessId=business_record._id;
    // console.log(businessId)
    businessId = "5bfec47ef651033d1c99fbca";
    var checkLead = await Lead.findOne({ contact_no: contact_no, business: businessId, "remark.status": { $in: ["Open", "Follow-Up",] } }).sort({ updated_at: -1 }).exec();

    var status = await LeadStatus.findOne({ status: "Open" }).exec();

    if (checkLead) {
        Lead.findOneAndUpdate({ _id: checkLead._id }, {
            $set: {
                type: req.query.leadtype,
                follow_up: {
                    date: null,
                    time: "",
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                remark: {
                    status: status.status,
                    resource: req.query.resource_url,
                    customer_remark: "Customer Requirement:- " + c_remark,
                    assignee_remark: "",
                    resource: req.query.resource_url,
                    color_code: status.color_code,
                    created_at: new Date(),
                    updated_at: new Date()
                },
                // source: source,
                source: checkLead.source,
                justDial_data: {
                    leadId: req.query.leadid,
                    category: req.query.category,
                    leadtype: req.query.leadtype,
                    date: req.query.date,
                    category: req.query.category,
                    city: req.query.city,
                    area: req.query.area,
                    brancharea: req.query.brancharea,
                    dncmobile: req.query.dncmobile,
                    dncphone: req.query.dncphone,
                    dncphone: req.query.dncphone,
                    pincode: req.query.pincode,
                    company: req.query.company,
                    time: req.query.time,
                    branchpin: req.query.branchpin,
                    parentid: req.query.parentid,
                },

                updated_at: new Date(),
                // business:businessId
            }
        }, { new: true }, async function (err, doc) {

            LeadRemark.create({
                lead: checkLead._id,
                type: req.query.leadtype,
                source: req.query.category,
                resource: req.query.resource_url,
                status: status.status,
                customer_remark: "Customer Requirement(JustDial):- " + c_remark,
                assignee_remark: "",
                assignee: checkLead.assignee,
                color_code: status.color_code,
                created_at: new Date(),
                updated_at: new Date()
            }).then(function (newRemark) {
                Lead.findOneAndUpdate({ _id: checkLead._id }, { $push: { remarks: newRemark._id } }, { new: true }, async function (err, doc) {
                })
            });


            event.assistance(checkLead, req.headers['tz'])
            //await whatsappEvent.leadGenerate(doc.contact_no, doc.assignee, businessId)
            // var json = ({
            //     responseCode: 200,
            //     responseMessage: "Pre: "+checkLead._id,
            //     responseData: {}
            // });

            res.status(200).json("RECEIVED")
        });
    }
    else {
        var data = {}
        var manager = businessId;

        var status = await LeadStatus.findOne({ status: "Open" }).exec();
        //for this business find all CREs
        //         //for each CRE find count of leads'
        //         //add this info into managers array
        //         //trying to sort this arraywith maximum lead assign to CRE on top
        //         //Create a lead and assign lead to the  CRE having least no of leads
        var managers = [];
        await Management.find({ business: businessId, role: "CRE" })
            .cursor().eachAsync(async (a) => {
                // var d = await Lead.find({ business: businessId, assignee: a.user, 'remark.status': { $in: ['Open', 'Follow-Up'] } }).count().exec();
                var open = await Lead.find({ business: businessId, assignee: a.user, 'remark.status': { $in: ['Open',] } }).count().exec();
                var follow_up = await Lead.find({ business: businessId, assignee: a.user, 'remark.status': { $in: ['Follow-Up'] }, 'follow_up.date': { $lte: new Date() } }).count().exec();
                var d = open + follow_up;
                managers.push({
                    user: a.user,
                    count: d
                })
            });

        if (managers.length != 0) {
            managers.sort(function (a, b) {
                return a.count > b.count;
            });

            manager = managers[0].user;
        }

        var data = {
            user: user,
            business: businessId,
            name: name,
            contact_no: contact_no,
            email: email,
            assignee: manager,
            contacted: false,
            priority: 1,
            follow_up: {

            },
            type: req.query.leadtype,
            geometry: [0, 0],
            source: source,
            remark: {
                status: status.status,
                customer_remark: "Customer Requirement(JustDial):- " + c_remark,
                assignee_remark: "",
                assignee: manager,
                resource: req.query.resource_url,
                color_code: status.color_code,
                created_at: new Date(),
                updated_at: new Date(),
            },
            justDial_data: {
                leadId: req.query.leadid,
                category: req.query.category,
                leadtype: req.query.leadtype,
                date: new Date(req.query.date),
                city: req.query.city,
                area: req.query.area,
                brancharea: req.query.brancharea,
                dncmobile: req.query.dncmobile,
                dncphone: req.query.dncphone,
                dncphone: req.query.dncphone,
                pincode: req.query.pincode,
                company: req.query.company,
                time: req.query.time,
                branchpin: req.query.branchpin,
                parentid: req.query.parentid,
            },

            created_at: new Date(),
            updated_at: new Date(),
        }

        Lead.create(data).then(async function (lead) {
            var count = await Lead.find({ _id: { $lt: lead._id }, business: businessId }).count();
            var lead_id = count + 10000;



            Lead.findOneAndUpdate({ _id: lead._id }, { $set: { lead_id: lead_id } }, { new: true }, async function (err, doc) {
            })
            var status = await LeadStatus.findOne({ status: "Open" }).exec();
            LeadRemark.create({
                lead: lead._id,
                type: "",
                source: source,
                status: status.status,
                customer_remark: "Customer Requirement(JustDial):- " + c_remark,
                assignee_remark: "",
                assignee: manager,
                resource: req.query.resource_url,
                color_code: status.color_code,
                created_at: new Date(),
                updated_at: new Date()
            }).then(function (newRemark) {
                Lead.findOneAndUpdate({ _id: lead._id }, { $push: { remarks: newRemark._id } }, { new: true }, async function (err, doc) {
                })
            });

            let assignee = await User.findOne({ _id: mongoose.Types.ObjectId(lead.assignee) }).exec()

            fun.webNotification("Lead", lead);



            await whatsAppEvent.leadGenerate(lead._id, businessId);
            event.leadCre(lead._id, businessId);
            await whatsAppEvent.leadCre(lead._id, businessId);
            // var json = ({
            //     responseCode: 200,
            //     responseMessage: "New: "+lead._id,
            //     responseData: {}
            // });

            res.status(200).json("RECEIVED")
        });
    }
});

//Abhinav Tyagi
//OpenLEAD from XLS file  //
router.post('/leads/upload/', async function (req, res, next) {
    var storage = multer.diskStorage({ //multers disk storage settings
        destination: function (req, file, cb) {
            cb(null, './uploads/')
        },
        filename: function (req, file, cb) {
            var datetimestamp = Date.now();
            cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1])
        }
    });
    var upload = multer({ //multer settings
        storage: storage,
        fileFilter: function (req, file, callback) { //file filter
            if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length - 1]) === -1) {
                return callback(new Error('Wrong extension type'));
            }
            callback(null, true);
        }
        // }).single('file');
    }).single('media');
    var exceltojson;
    upload(req, res, function (err) {
        if (err) {
            res.json({ error_code: 1, err_desc: err });
            return;
        }
        if (!req.file) {
            res.json({ error_code: 1, err_desc: "No file passed" });
            return;
        }

        if (req.file.originalname.split('.')[req.file.originalname.split('.').length - 1] === 'xlsx') {
            exceltojson = xlsxtojson;
        } else {
            exceltojson = xlstojson;
        }
        try {
            exceltojson({
                input: req.file.path,
                output: null,
                lowerCaseHeaders: true
            }, async function (err, result) {
                if (err) {
                    return res.json({ error_code: 1, err_desc: err, data: null });
                }
                var totalLeads = result.length;

                var businessId = req.headers['business'];
                var business_record = await User.findOne({ "account_info.type": "business", "_id": businessId }).exec();
                // if (business_record) {
                //     businessId = business_record._id;
                //     // console.log("bussiness id " + businessId)
                // }
                // else {
                //     businessId = "5bfec47ef651033d1c99fbca";
                // }
                // ---------------------------------***************----------------------------------
                // businessId="5bfec47ef651033d1c99fbca";
                var checkLead = await Lead.findOne({ contact_no: result[0].mobile, business: businessId, "remark.status": { $in: ["Open", "Follow-Up",] } }).sort({ updated_at: -1 }).exec();
                source = "Leads From File Data";
                var names = [];
                for (i = 0; i < result.length; i++) {
                    var user = null;
                    var name = result[i].name;
                    var email = "";
                    conatct = result[i].mobile;
                    names.push({
                        name: result[i].name,
                        mobile: result[i].mobile
                    });
                    var getUser = await User.findOne({ contact_no: result[i].mobile }).exec();
                    if (getUser) {
                        user = getUser._id;
                        // name = getUser.name;
                        email = getUser.email;
                        // contact = getUser.contact_no;
                    }
                    var checkLead = await Lead.findOne({ contact_no: conatct, business: businessId, "remark.status": { $in: ["Open", "Follow-Up",] } }).sort({ updated_at: -1 }).exec();
                    var status = await LeadStatus.findOne({ status: "Open" }).exec();

                    if (checkLead) {
                        Lead.findOneAndUpdate({ _id: checkLead._id }, {
                            $set: {
                                type: source,
                                name: name,
                                follow_up: {
                                    date: null,
                                    time: "",
                                    created_at: new Date(),
                                    updated_at: new Date(),
                                },
                                remark: {
                                    status: status.status,
                                    resource: req.query.resource_url,
                                    customer_remark: source,
                                    assignee_remark: source,
                                    resource: req.query.resource_url,
                                    color_code: status.color_code,
                                    created_at: new Date(),
                                    updated_at: new Date()
                                },
                                additional_info: {
                                    address: result[i].address,
                                    model: result[i].model,
                                    location: result[i].location,
                                    registration_no: result[i].reg_no,
                                    brand: result[i].brand,
                                    category: result[i].car_category,

                                },
                                // source: source,
                                source: checkLead.source,
                                updated_at: new Date()
                            }
                        }, { new: true }, async function (err, doc) {

                            LeadRemark.create({
                                lead: checkLead._id,
                                type: source,
                                source: source,
                                resource: req.query.resource_url,
                                status: status.status,
                                customer_remark: source,
                                assignee_remark: source,
                                assignee: checkLead.assignee,
                                color_code: status.color_code,
                                created_at: new Date(),
                                updated_at: new Date()
                            }).then(function (newRemark) {
                                Lead.findOneAndUpdate({ _id: checkLead._id }, { $push: { remarks: newRemark._id } }, { new: true }, async function (err, doc) {
                                })
                            });


                            //    event.assistance(checkLead,req.headers['tz'])

                            // var json = ({
                            //     responseCode: 200,
                            //     responseMessage: "Pre: "+checkLead._id,
                            //     responseData: result
                            // });

                            // res.status(200).json(json)
                        });
                    }
                    else {
                        var data = {}
                        var manager = businessId;

                        var status = await LeadStatus.findOne({ status: "Open" }).exec();

                        var managers = [];
                        await Management.find({ business: businessId, role: "CRE" })
                            .cursor().eachAsync(async (a) => {
                                // var d = await Lead.find({ business: businessId, assignee: a.user, 'remark.status': { $in: ['Open', 'Follow-Up'] } }).count().exec();

                                var open = await Lead.find({ business: businessId, assignee: a.user, 'remark.status': { $in: ['Open',] } }).count().exec();
                                var follow_up = await Lead.find({ business: businessId, assignee: a.user, 'remark.status': { $in: ['Follow-Up'] }, 'follow_up.date': { $lte: new Date() } }).count().exec();
                                var d = open + follow_up;
                                managers.push({
                                    user: a.user,
                                    count: d
                                })
                            });

                        if (managers.length != 0) {
                            managers.sort(function (a, b) {
                                return a.count > b.count;
                            });

                            manager = managers[0].user;
                        }

                        var data = {
                            user: user,
                            business: businessId,
                            name: name,
                            contact_no: result[i].mobile,
                            email: email,
                            assignee: manager,
                            contacted: false,
                            priority: 3,
                            follow_up: {

                            },
                            type: source,
                            geometry: [0, 0],
                            source: source,
                            remark: {
                                status: status.status,
                                customer_remark: source,
                                assignee_remark: source,
                                assignee: manager,
                                resource: req.query.resource_url,
                                color_code: status.color_code,
                                created_at: new Date(),
                                updated_at: new Date()
                            },
                            additional_info: {
                                address: result[i].address,
                                model: result[i].model,
                                location: result[i].location,
                                registration_no: result[i].reg_no,
                                brand: result[i].brand,
                                category: result[i].car_category,

                            },
                            created_at: new Date(),
                            updated_at: new Date(),
                        }

                        Lead.create(data).then(async function (lead) {
                            var count = await Lead.find({ _id: { $lt: lead._id }, business: businessId }).count();
                            var lead_id = count + 10000;

                            Lead.findOneAndUpdate({ _id: lead._id }, { $set: { lead_id: lead_id } }, { new: true }, async function (err, doc) {
                            })
                            var status = await LeadStatus.findOne({ status: "Open" }).exec();
                            LeadRemark.create({
                                lead: lead._id,
                                type: source,
                                source: source,
                                status: status.status,
                                customer_remark: source,
                                assignee_remark: source,
                                assignee: manager,
                                resource: req.query.resource_url,
                                color_code: status.color_code,
                                created_at: new Date(),
                                updated_at: new Date()
                            }).then(function (newRemark) {
                                Lead.findOneAndUpdate({ _id: lead._id }, { $push: { remarks: newRemark._id } }, { new: true }, async function (err, doc) {
                                })
                            });

                            // event.assistance(lead,req.headers['tz'])

                            // var json = ({
                            //     responseCode: 200,
                            //     responseMessage: "New: "+lead._id,
                            //     responseData:result
                            // });
                            // fun.webNotification("Lead", lead);
                            // return res.status(200).json(json)
                        });
                    }//Lead Create END


                    // //return res.json({error_code:0,err_desc:null, data: result});
                }
                var json = ({
                    responseCode: 200,
                    responseMessage: totalLeads + " Leads Added",
                    // responseData:result
                    responseData: {}
                });

                res.status(200).json(json);
                // var date=new Date()
                // console.log(names);
                // var lt=["Added","Updated"];
                // if(checkLead){
                email = "Abhinav@autroid.com"
                // console.log("Business Email Id " + business_record.email)
                event.leadgen(totalLeads, names, business_record.email, checkLead, req.headers['tz']);
                // }
                // else
                // {
                //     event.leadgen(totalLeads,names,Lead,lt[0],req.headers['tz']);
                // }
                // event.assistance(checkLead,req.headers['tz'])
            });
        } catch (e) {
            res.json({ error_code: 1, err_desc: "Corupted excel file" });
        }
    })
});

//Sprint 2
////////////////////////////Abhinav Tygai Updated LeadGeneration///////////////////////////////////////

router.post('/leadsGen/upload/LEADGEN_Table', async function (req, res, next) {
    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './uploads/')
        },
        filename: function (req, file, cb) {
            var datetimestamp = Date.now();
            cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1])
        }
    });
    var upload = multer({
        storage: storage,
        fileFilter: function (req, file, callback) {
            if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length - 1]) === -1) {
                return callback(new Error('Wrong extension type'));
            }
            callback(null, true);
        }
    }).single('media');
    var exceltojson;
    upload(req, res, function (err) {
        if (err) {
            res.json({ error_code: 1, err_desc: err });
            return;
        }
        if (!req.file) {
            res.json({ error_code: 1, err_desc: "No file passed" });
            return;
        }
        if (req.file.originalname.split('.')[req.file.originalname.split('.').length - 1] === 'xlsx') {
            exceltojson = xlsxtojson;
        } else {
            exceltojson = xlstojson;
        }
        try {
            exceltojson({
                input: req.file.path,
                output: null,
                lowerCaseHeaders: true
            }, async function (err, result) {
                if (err) {
                    return res.json({ error_code: 1, err_desc: err, data: null });
                }
                var totalLeads = result.length;
                var businessId = req.headers['business'];
                var business_record = await User.findOne({ "account_info.type": "business", _id: businessId }).exec();
                if (business_record) {
                    businessId = business_record._id;
                }

                source = "Google";
                var names = [];
                // console.log(businessId)
                for (i = 0; i < result.length; i++) {
                    var manager = businessId;
                    var user = null;
                    var name = result[i].name;
                    var email = "";
                    conatct = result[i].mobile;

                    names.push({
                        name: result[i].name,
                        mobile: result[i].mobile
                    });

                    var getUser = await User.findOne({ contact_no: result[i].mobile }).exec();

                    if (getUser) {
                        user = getUser._id;
                        // name = getUser.name;
                        email = getUser.email;
                        // contact = getUser.contact_no;
                    }
                    var check = await LeadGen.findOne({ contact_no: conatct, business: businessId, "remark.status": "potential", "additional_info.registration_no": result[i].reg_no }).sort({ updated_at: -1 }).exec();
                    if (check) {

                        LeadGen.findOneAndUpdate({ _id: check._id }, {
                            $set: {
                                type: source,
                                name: check.name,
                                follow_up: {},
                                date_added: new Date(result[i].date_added),
                                remark: {
                                    status: "Open",
                                    customer_remark: "Uploaded",
                                    assignee_remark: "Uploaded",
                                    resource: "",
                                    color_code: "",
                                    created_at: new Date(),
                                    updated_at: new Date()
                                },
                                additional_info: {
                                    address: result[i].address,
                                    model: result[i].model,
                                    location: result[i].location,
                                    registration_no: result[i].reg_no,
                                    brand: result[i].brand,
                                    category: result[i].car_category,
                                    date_file: result[i].DateAdded,

                                },
                                source: source,
                                updated_at: new Date()
                            }
                        }, { new: true }, async function (err, doc) {
                        })
                        // console.log("Updated....." + i);
                    }
                    else {
                        var user = null;
                        var name = result[i].name;
                        conatct = result[i].mobile;
                        names.push({
                            name: name,
                            mobile: conatct
                        });
                        var data = {}

                        var user = null
                        var data = {
                            user: user,
                            business: businessId,
                            name: name,
                            contact_no: conatct,
                            email: "",
                            assignee: manager,
                            contacted: false,
                            priority: 3,
                            follow_up: {

                            },
                            type: source,
                            geometry: [0, 0],
                            source: source,
                            date_added: new Date(result[i].date_added),
                            status: "Open",
                            remark: {
                                status: "Open",
                                customer_remark: "Uploaded",
                                assignee_remark: "Uploaded",
                                assignee: manager,
                                resource: "",
                                color_code: "",
                                created_at: new Date(),
                                updated_at: new Date()
                            },
                            additional_info: {
                                address: result[i].address,
                                model: result[i].model,
                                location: result[i].location,
                                registration_no: result[i].reg_no,
                                brand: result[i].brand,
                                category: result[i].car_category,
                                date_file: result[i].date_added,

                            },
                            business_id: businessId,
                            created_at: new Date(),
                            updated_at: new Date(),
                        }
                        // console.log("Created New  " + i)
                        await LeadGen.create(data).then(async function (lead) {
                            var count = await LeadGen.find({ _id: { $lt: lead._id }, business: businessId }).count();
                            var lead_id = count + 10000;
                            await LeadGen.findOneAndUpdate({ _id: lead._id }, { $set: { lead_id: lead_id } }, { new: true }, async function (err, doc) {
                            })
                        });
                    }
                }
                var json = ({
                    responseCode: 200,
                    responseMessage: totalLeads + " Leads Added",
                    // responseData:result
                    responseData: {}
                });

                res.status(200).json(json);
                if (business_record.email != "") {
                    b_email = business_record.email
                }
                else {
                    b_email = "care@careager.com"
                }
                b_email = "Abhinav@autroid.com"
                // console.log("Working...................")
                // console.log("Business Email Id " + business_record.email)
                event.leadgen(totalLeads, names, b_email, check, req.headers['tz']);
            });
        } catch (e) {
            res.json({ error_code: 1, err_desc: "Corupted excel file" });
        }
    })
});

router.post('/collision/services/import', async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var not_inserted = [];
    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            // cb(null,'/home/ubuntu/CarEager/uploads')
            cb(null, './uploads')
        },
        filename: function (req, file, cb) {
            var datetimestamp = Date.now();
            cb(null, uuidv1() + "." + file.originalname.split('.')[file.originalname.split('.').length - 1])
        }
    });

    var upload = multer({
        storage: storage,
        fileFilter: function (req, file, callback) {
            if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length - 1]) === -1) {
                return callback(new Error('Wrong extension type'));
            }
            callback(null, true);
        }
    }).single('media');


    upload(req, res, function (err) {
        if (err) {
            return res.status(422).json({
                responseCode: 422,
                responseMessage: "Server Error",
                responseData: err
            })
        }

        if (!req.file) {
            return res.status(422).json({
                responseCode: 422,
                responseMessage: "No File Passed",
                responseData: {}
            })
        }

        if (req.file.originalname.split('.')[req.file.originalname.split('.').length - 1] === 'xlsx') {
            exceltojson = xlsxtojson;
        }
        else {
            return res.status(422).json({
                responseCode: 422,
                responseMessage: "Error",
                responseData: {}
            })
        }

        exceltojson({
            input: req.file.path,
            output: null,
            lowerCaseHeaders: true
        }, async function (err, services) {
            if (err) {
                return res.status(422).json({
                    responseCode: 422,
                    responseMessage: "Error",
                    responseData: err
                });
            }
            else {
                var invalid_data = _.filter(services, x => x.package == "" || x.service == "" || parseFloat(x.part_cost) < 0 || parseFloat(x.labour_cost) < 0 || parseFloat(x.tax_rate) < 0 || x.hsn_sac == "" || x.amount_is_tax == "" || x.segment == "");

                if (invalid_data.length > 0) {
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Unformatted Data! Please check & upload again.",
                        responseData: {}
                    });
                }
                else {
                    /*Collision.remove({
                        business: business,
                        imported: true,
                    });*/

                    for (var i = 0; i < services.length; i++) {
                        var g = []
                        if (services[i].file != "") {
                            var images_link = services[i].images_link.split(',');

                            images_link.forEach(async function (l) {
                                g.push({
                                    file: l,
                                    file_type: "image",
                                    type: "link",
                                    created_at: new Date(),
                                    updated_at: new Date(),
                                });
                            });
                        }

                        var ser = await ServiceGallery.find({
                            package: services[i].package, segment: services[i].segment, service: services[i].service, business: business
                        }).exec();
                        // return res.send(ser.type);
                        if (ser.length) {
                            // console.log(ser.length)
                            await ServiceGallery.findOneAndUpdate({
                                publish: true, business: business, category: services[i].category, file: services[i].file,
                            }, {
                                $set: {
                                    file: services[i].file,
                                    business: business,
                                    created_at: new Date(),
                                    updated_at: new Date(),
                                    // gallery: g,
                                    publish: true,
                                    category: services[i].category,
                                }
                            }, { new: true }, async function (err, doc) {
                                // console.log("Update Collision" + i)
                                // if (err) {
                                //     res.status(422).json({
                                //         responseCode: 422,
                                //         responseMessage: "Unprocessable Entity",
                                //         responseData: {}
                                //     });
                                // }
                                // else {
                                //     var booking = await Booking.findOne({ _id: req.body.booking }).exec();
                                //     res.status(200).json({
                                //         responseCode: 200,
                                //         responseMessage: "Service Updated",
                                //         responseData: {}
                                //     });
                                // }
                            });

                        }

                        else {
                            ///

                            // console.log("New  Collision Service")
                            ServiceGallery.create({
                                business: business,
                                created_at: new Date(),
                                updated_at: new Date(),
                                gallery: g,
                                publish: true,
                                category: services[i].category,

                            });
                            // console.log("Created ", i)
                            // res.status(200).json({
                            //     responseCode: 200,
                            //     responseMessage: "Successfully Import",
                            //     responseData: {}
                            // });

                        }

                    }
                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Successfully Import",
                        responseData: {}
                    });
                }
            }
        });
    });
});
router.post('/leadsGen/upload/', async function (req, res, next) {
    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './uploads/')
        },
        filename: function (req, file, cb) {
            var datetimestamp = Date.now();
            cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1])
        }
    });
    var upload = multer({
        storage: storage,
        fileFilter: function (req, file, callback) {
            if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length - 1]) === -1) {
                return callback(new Error('Wrong extension type'));
            }
            callback(null, true);
        }
    }).single('media');
    var exceltojson;
    upload(req, res, function (err) {
        if (err) {
            res.json({ error_code: 1, err_desc: err });
            return;
        }
        if (!req.file) {
            res.json({ error_code: 1, err_desc: "No file passed" });
            return;
        }
        if (req.file.originalname.split('.')[req.file.originalname.split('.').length - 1] === 'xlsx') {
            exceltojson = xlsxtojson;
        } else {
            exceltojson = xlstojson;
        }
        try {
            exceltojson({
                input: req.file.path,
                output: null,
                lowerCaseHeaders: true
            }, async function (err, result) {
                if (err) {
                    return res.json({ error_code: 1, err_desc: err, data: null });
                }
                var totalLeads = result.length;
                var businessId = req.headers['business'];
                var token = req.headers['x-access-token'];
                var secret = config.secret;
                var decoded = jwt.verify(token, secret);
                var loggedInDetails = await User.findById(decoded.user).exec();
                var manager = await q.all(businessFunctions.getOutBoundAssignee(decoded.user, businessId));

                var source = "Google";
                var names = [];
                for (i = 0; i < result.length; i++) {
                    var user = null;
                    var name = result[i].name;
                    var email = "";
                    var contact = result[i].mobile;

                    names.push({
                        name: result[i].name,
                        mobile: result[i].mobile
                    });

                    var getUser = await User.findOne({ contact_no: result[i].mobile }).exec();

                    if (getUser) {
                        user = getUser._id;
                        email = getUser.email;
                    }
                    var check = await OutBoundLead.findOne({ contact_no: contact, business: businessId, "status": { $in: ['Open', 'Follow-Up'] }, "additional_info.registration_no": result[i].reg_no }).sort({ updated_at: -1 }).exec();
                    if (check) {

                        await OutBoundLead.findOneAndUpdate({ _id: check._id }, {
                            $set: {
                                type: source,
                                name: check.name,
                                date_added: new Date(result[i].date_added),
                                contact_no: contact,
                                category: 'DatabaseLead',
                                additional_info: {
                                    address: result[i].address,
                                    model: result[i].model,
                                    location: result[i].location,
                                    registration_no: result[i].reg_no,
                                    brand: result[i].brand,
                                    category: result[i].car_category,
                                    date_file: result[i].DateAdded,

                                },
                                source: source,
                                updated_at: new Date()
                            }
                        }, { new: true }, async function (err, doc) {
                        })
                        // console.log("Updated....." + i);

                    }
                    else {
                        var user = null;
                        var name = result[i].name;
                        contact = result[i].mobile;
                        names.push({
                            name: name,
                            mobile: contact
                        });
                        var data = {}

                        var user = null
                        var data = {
                            user: user,
                            business: businessId,
                            name: name,
                            contact_no: contact,
                            email: result[i].email,
                            assignee: manager,
                            contacted: false,
                            priority: 2,
                            follow_up: {
                            },
                            type: source,
                            category: 'DatabaseLead',
                            type: 'DatabaseLead',
                            geometry: [0, 0],
                            source: source,
                            date_added: new Date(result[i].date_added),
                            status: "Open",
                            additional_info: {
                                address: result[i].address,
                                model: result[i].model,
                                location: result[i].location,
                                registration_no: result[i].reg_no,
                                brand: result[i].brand,
                                category: result[i].car_category,
                            },
                            business_id: businessId,
                            created_at: new Date(),
                            updated_at: new Date(),
                        }
                        // console.log("Created New  " + i)
                        await OutBoundLead.create(data).then(async function (lead) {
                            var count = await OutBoundLead.find({ _id: { $lt: lead._id }, business: businessId }).count();
                            var lead_id = count + 10000;
                            await OutBoundLead.findOneAndUpdate({ _id: lead._id }, { $set: { lead_id: lead_id } }, { new: true }, async function (err, doc) {
                            })
                        });
                    }
                }

                b_email = "abhinav@autroid.com"
                event.leadgen(totalLeads, names, b_email, check, req.headers['tz']);
                var json = ({
                    responseCode: 200,
                    responseMessage: totalLeads + " Leads Added",
                    responseData: {}
                });
                res.status(200).json(json);

            });
        } catch (e) {
            res.json({ error_code: 1, err_desc: "Corupted excel file" });
        }
    })
});

//sumit...Sales & Purchase
router.post('/forgot/password/unauth', async function (req, res, next) {
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
//sumit...


router.post('/reset/password/otp/verification/unauth', async function (req, res, next) {
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
        // console.log(JSON.stringify(count));
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

//sumit vendor get unauth
router.get('/vendor/quotation/unauth/details', async function (req, res, next) {
    //var token = req.headers['x-access-token'];
    // var secret = config.secret;
    //var decoded = jwt.verify(token, secret);
    // var business = req.headers['business'];

    var order = await VendorOrders.findOne({ _id: req.query.id, status: { $in: ['Requested', 'Submitted', 'Confirmed'] } })
        .populate({ path: 'business', select: "name contact_no address" })
        .populate({ path: 'quotation', select: "quotation_no buyerRemark" })
        .populate('car')
        .exec();
    if (order) {
        res.status(200).json({
            responseCode: 200,
            responseMessage: "Sucesss",
            responseData: {
                order: order
            }
        });
    } else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Order not found",
            responseData: {

            }
        });
    }
});

// api..sumit

//sumit tax slabs
router.get('/taxes/unauth/get', async function (req, res, next) {
    var tz = req.headers['tz'];
    if (tz) {
        var country = await Country.findOne({ timezone: { $in: tz } }).exec();
        if (country) {
            var taxes = await Tax.find({ country: country._id, type: 'GST' }).sort({ count: -1 }).exec()
            result = await q.all(businessFunctions.removeDublicateDoumnets(taxes, "tax"));
            res.status(200).json({
                responseCode: 200,
                responseMessage: "Tax Slabs",
                responseInfo: {
                    taxes: _.map(result, 'rate')
                },
                responseData: result,
            })
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Tax Slabs",
                responseData: {}
            })
        }
    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Tax Slabs",
            responseData: {}
        })
    }
});



router.put('/quotation/price/unauth/update', async (req, res, next) => {
    // var token = req.headers['x-access-token'];
    // var secret = config.secret;
    //var decoded = jwt.verify(token, secret);
    //var user = decoded.user;
    //var business = req.headers['business'];
    // var loggedInDetails = await User.findById(decoded.user).exec();
    var parts = req.body.parts;
    var orderId = req.body.orderId;
    var status = req.body.status
    // console.log("parts  ", parts)
    var order = await VendorOrders.findById(orderId).exec();
    if (order) {
        var items = []
        var tax = []
        var total = 0
        // console.log("parts ", parts)
        if (parts.length > 0) {
            for (var p = 0; p < parts.length; p++) {
                if (parts[p].isChecked) {
                    if (parts[p].quantity != null) {
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
                                status: "Price Updated"
                            });

                            tax = [];
                            // }

                        } else {
                            res.status(422).json({
                                responseCode: 422,
                                responseMessage: "Please check tax",
                                responseData: {}
                            });
                        }

                    } else {
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Invalid Quantity, Tax Type , Base Amount " + parts[p].item,
                            responseData: {}
                        });
                    }
                } else {
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

                whatsAppEvent.qutationReq(doc.vendor, doc.business);
                var activity = 'Quotation Update'
                fun.webNotification(activity, doc);

            });





            res.status(200).json({
                responseCode: 200,
                responseMessage: "Successfully Saved",
                responseData: await VendorOrders.findById(orderId).exec()
            });
        }


    } else {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Error ",
            responseData: err
        });
    }

})

router.post('/tax_info/unauth/get', async function (req, res, next) {
    //  var token = req.headers['x-access-token'];
    //var business = req.headers['business'];
    // var secret = config.secret;
    //var decoded = jwt.verify(token, secret);
    let regex = req.body.tax_slab
    // console.log("Tax Rate = " + regex)
    // let regex = req.query.query.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
    var tax_info = await Tax.findOne({
        tax: regex
    }).exec()
    if (tax_info) {
        res.status(200).json({
            responseCode: 200,
            responseMessage: "Tax Details",
            responseData: tax_info
        })
    } else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Tax Details not found",
            responseData: {}
        })
    }

});



router.post('/vendor/details/get', async function (req, res, next) {

    console.log(req.body.id);

    var vendor_info = await VendorOrders.findOne({
        _id: req.body.id
    }).populate({ path: 'business', select: "name contact_no address" })
        .populate({ path: 'vendor', select: "name contact_no address" })
        .exec()
    if (vendor_info) {
        res.status(200).json({
            responseCode: 200,
            responseMessage: "Vendors Details",
            responseData: vendor_info
        })
    } else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: " Details not found",
            responseData: {}
        })
    }

});

module.exports = router
