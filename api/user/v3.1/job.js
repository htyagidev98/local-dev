var mongoose = require('mongoose'),
    express = require('express'),
    { ObjectId } = require('mongodb').ObjectID,
    router = express.Router(),
    config = require('../../config')
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
    nodemailer = require('nodemailer'),
    crypto = require('crypto');

global.packageDiscountOn = [];

var paytm_config = require('../../paytm/paytm_config').paytm_config;
var paytm_checksum = require('../../paytm/checksum');
var querystring = require('querystring');

var s3 = new aws.S3({
    accessKeyId: config.IAM_USER_KEY,
    secretAccessKey: config.IAM_USER_SECRET,
    Bucket: config.BUCKET_NAME
});

const xAccessToken = require('../../middlewares/xAccessToken');
const common = require('../../api/v3.1/common');
const fun = require('../../api/v3.1/function');
const event = require('../../api/v3.1/event');

var salt = bcrypt.genSaltSync(10);

const Car = require('../../models/car');
const User = require('../../models/user');
const Post = require('../../models/post');
const Like = require('../../models/like');
const Model = require('../../models/model');
const State = require('../../models/state');
const Point = require('../../models/point');
const Follow = require('../../models/follow');
const Review = require('../../models/review');
const Hashtag = require('../../models/hashtag');
const Comment = require('../../models/comment');
const BookingCategory = require('../../models/bookingCategory');
const Booking = require('../../models/booking');
const Variant = require('../../models/variant');
const ClubMember = require('../../models/clubMember');
const Club = require('../../models/club');
const Country = require('../../models/country');
const Category = require('../../models/category');
const Referral = require('../../models/referral');
const Automaker = require('../../models/automaker');
const PostMedia = require('../../models/postMedia');
const BrandLike = require('../../models/brandLike');
const ModelReview = require('../../models/modelReview');
const PostView = require('../../models/postView');
const Product = require('../../models/product');
const Service = require('../../models/service');
const Insurance = require('../../models/insurance');
const Diagnosis = require('../../models/diagnosis');
const Collision = require('../../models/collision');
const BookingService = require('../../models/bookingService');
const BusinessServicePackage = require('../../models/businessServicePackage');
const Address = require('../../models/address');
const Coupon = require('../../models/coupon');
const CouponUsed = require('../../models/couponUsed');
const Washing = require('../../models/washing');
const BusinessOffer = require('../../models/businessOffer');
const Offer = require('../../models/offer');
const Lead = require('../../models/lead');
const LeadRemark = require('../../models/leadRemark');
const LeadStatus = require('../../models/leadStatus');
const Package = require('../../models/package');
const UserPackage = require('../../models/userPackage');
const PackageUsed = require('../../models/packageUsed');
const Management = require('../../models/management');
const LeadManagement = require('../../models/leadManagement');

var secret = config.secret;


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


/**
 * [Time Slot API]
 * @param  {[raw json]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {middleware} next [description]
 * @return {[json]}        [description]
*/

router.get('/add/lead', async function (req, res, next) {
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
        await Management.find({ business: "5bfec47ef651033d1c99fbca", role: "Service Advisor" })
            .cursor().eachAsync(async (a) => {
                var d = await Booking.find({ business: "5bfec47ef651033d1c99fbca", advisor: a.user }).count().exec();
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
            business: "5bfec47ef651033d1c99fbca",
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
            await Management.find({ business: "5bfec47ef651033d1c99fbca", role: "Service Advisor" })
                .cursor().eachAsync(async (a) => {
                    var d = await Booking.find({ business: req.query.business, advisor: a.user }).count().exec();
                    advisorBooking.push({
                        user: a.user,
                        count: await Booking.find({ business: req.query.business, advisor: a.user }).count().exec()
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
                business: "5bfec47ef651033d1c99fbca",
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


/**
    * [Add Lead]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

router.get('/knowlarity/lead/add', async function (req, res, next) {
    var lead = await Lead.findOne({ contact_no: req.query.caller_id, 'remark.status': "Open", source: "Knowlarity" }).exec();
    // console.log(lead)
    if (lead) {
        var status = await LeadStatus.findOne({ status: "Open" }).exec();
        var follow_up = {};
        if (status.status == "Follow-Up") {
            var follow_up = {
                date: new Date(req.body.date).toISOString(),
                created_at: new Date(),
                updated_at: new Date()
            }
        }
        var data = {};
        data.remark = {
            status: status.status,
            resource: req.query.resource_url,
            customer_remark: "",
            assignee_remark: "",
            color_code: status.color_code,
            created_at: new Date(),
            updated_at: new Date()
        };
        data.follow_up = follow_up;
        data.business = "5bfec47ef651033d1c99fbca",
            data.source = "Knowlarity";
        data.updated_at = new Date();

        Lead.findOneAndUpdate({ _id: lead._id }, { $set: data }, { new: true }, async function (err, doc) {
            LeadRemark.create({
                lead: lead._id,
                status: status.status,
                resource: req.query.resource_url,
                customer_remark: "",
                assignee_remark: "",
                color_code: status.color_code,
                created_at: new Date(),
                updated_at: new Date()
            });

            var update = await Lead.findOne({ _id: lead._id }).exec();
            var json = ({
                responseCode: 200,
                responseMessage: "Lead",
                responseData: update
            });
            res.status(200).json(json)
        })
    }
    else {
        var managers = [];
        await LeadManagement.find({ business: "5bfec47ef651033d1c99fbca", source: "Knowlarity" })
            .cursor().eachAsync(async (a) => {
                var d = await Lead.find({ business: "5bfec47ef651033d1c99fbca", manager: a.user, 'remark.status': { $in: ['Open', 'Follow-Up'] } }).count().exec();
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

        var data = {}
        var status = await LeadStatus.findOne({ status: "Open" }).exec();
        var follow_up = {};
        if (status.status == "Follow-Up") {
            var follow_up = {
                date: new Date(req.body.date).toISOString(),
                created_at: new Date(),
                updated_at: new Date()
            }
        }
        data.user = null;
        var contact_no = req.query.caller_id;
        data.contact_no = contact_no.substring(3)
        data.type = "Knowlarity";
        data.geometry = [0, 0],
            data.remark = {
                status: status.status,
                resource: req.query.resource_url,
                customer_remark: "",
                assignee_remark: "",
                color_code: status.color_code,
                created_at: new Date(),
                updated_at: new Date()
            };
        data.follow_up = follow_up;
        data.business = "5bfec47ef651033d1c99fbca",
            data.assignee = manager,
            data.source = "Knowlarity";
        data.created_at = new Date();
        data.updated_at = new Date();

        var leads = {};

        Lead.create(data).then(async function (lead) {
            LeadRemark.create({
                lead: lead._id,
                status: status.status,
                customer_remark: "",
                assignee_remark: "",
                resource: req.query.resource_url,
                assignee: manager,
                color_code: status.color_code,
                created_at: new Date(),
                updated_at: new Date()
            });

            var leads = {
                user: lead.user,
                name: lead.name,
                contact_no: lead.contact_no,
                email: lead.email,
                _id: lead._id,
                id: lead.id,
                type: lead.type,
                date: moment(lead.created_at).tz(req.headers['tz']).format('lll'),
                status: lead.status,
                created_at: lead.created_at,
                updated_at: lead.updated_at,
                remark: lead.remark
            };

            //event.zohoLead(lead)

            var json = ({
                responseCode: 200,
                responseMessage: "Lead Added",
                responseData: leads
            });
            res.status(200).json(json)
        });
    }
});
module.exports = router
