var mongoose = require('mongoose'),
    express = require('express'),
    { ObjectId } = require('mongodb').ObjectID,
    router = express.Router(),
    config = require('./../config'),
    bcrypt = require('bcrypt-nodejs'),
    jwt = require('jsonwebtoken'),
    aws = require('aws-sdk'),
    multerS3 = require('multer-s3'),
    uuidv1 = require('uuid/v1'),
    Validator = require('validatorjs'),
    multer = require('multer'),
    FCM = require('fcm-node'),
    request = require('request'),
    extract = require('mention-hashtag'),
    shortid = require('shortid'),
    child_process = require('child_process'),
    ffmpeg = require('ffmpeg'),
    formidable = require('formidable'),
    path = require('path'),
    moment = require('moment-timezone'),

    q = require('q'),
    fs = require('fs'),
    _ = require('lodash'),
    async = require("async"),
    assert = require('assert');

var s3 = new aws.S3({
    accessKeyId: config.IAM_USER_KEY,
    secretAccessKey: config.IAM_USER_SECRET,
    Bucket: config.BUCKET_NAME
});


const xAccessToken = require('../middlewares/xAccessToken');
const fun = require('../api/function');
const event = require('../api/event');

var salt = bcrypt.genSaltSync(10);
// const whatsappEvent = require('../api/whatsapp/whatsappEvent')
const whatsAppEvent = require('./whatsapp/whatsappEvent');

const AppVersion = require('../models/appVersion');
const User = require('../models/user');
const BusinessTiming = require('../models/businessTiming');
const Type = require('../models/type');
const BusinessType = require('../models/businessType');
const Category = require('../models/category');
const ServicesCart = require('../models/servicesCart')
const Automaker = require('../models/automaker');
const Model = require('../models/model');
const ModelMedia = require('../models/modelMedia');
const ModelReview = require('../models/modelReview');
const Post = require('../models/post');
const Follow = require('../models/follow');
const Booking = require('../models/booking');
const State = require('../models/state');
const ProductCategory = require('../models/productCategory');
const BusinessProduct = require('../models/businessProduct');
const ProductImage = require('../models/productImage');
const Country = require('../models/country');
const BookmarkBusiness = require('../models/bookmarkBusiness');
const BusinessOffer = require('../models/businessOffer');
const ProductOffer = require('../models/productOffer');
const BookmarkProduct = require('../models/bookmarkProduct');
const BookmarkOffer = require('../models/bookmarkOffer');
const BookmarkModel = require('../models/bookmarkModel');
const Car = require('../models/car');
const Like = require('../models/like');
const CarImage = require('../models/carImage');
const Club = require('../models/club');
const ClubMember = require('../models/clubMember');
const BookmarkCar = require('../models/bookmarkCar');
const BodyStyle = require('../models/bodyStyle');
const FuelType = require('../models/fuelType');
const Transmission = require('../models/transmission');
const Color = require('../models/color');
const Owner = require('../models/owner');
const BusinessGallery = require('../models/businessGallery');
const Variant = require('../models/variant');
const ClaimBusiness = require('../models/claimBusiness');
const Review = require('../models/review');
const BusinessServicePackage = require('../models/businessServicePackage');
const BrandLike = require('../models/brandLike');
const Notification = require('../models/notification');
const Point = require('../models/point');
const Story = require('../models/story');
const UpdatePhone = require('../models/updatePhone');
const ProfileView = require('../models/profileViews');
const Battery = require('../models/battery');
const BatteryBrand = require('../models/batteryBrand');
const TyreSize = require('../models/tyreSize');
const Referral = require('../models/referral');
const Collision = require('../models/collision');
const Detailing = require('../models/detailing');
const Washing = require('../models/washing');
const BookingCategory = require('../models/bookingCategory');
const Service = require('../models/service');
const Lead = require('../models/lead');
const Offer = require('../models/offer');
const Package = require('../models/package');
const UserPackage = require('../models/userPackage');
const PackageUsed = require('../models/packageUsed');
const Address = require('../models/address');
const Management = require('../models/management');
const CouponUsed = require('../models/couponUsed');
const CarHistory = require('../models/carHistory');
const Customization = require('../models/customization');
const Gallery = require('../models/gallery');
const LeadRemark = require('../models/leadRemark');
const LeadStatus = require('../models/leadStatus');
const LeadManagement = require('../models/leadManagement');
var secret = config.secret;


/**
    * [New User API]
    * @param  {[raw json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

router.post('/roadside-assistance', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var user = await User.findOne({ _id: decoded.user }).exec();

    if (user) {
        var lead = await Lead.findOne({ contact_no: user.contact_no, "remark.status": { $in: ["Open", "Follow-Up", "Assigned"] } }).sort({ updated_at: -1 }).exec();

        var status = await LeadStatus.findOne({ status: "Open" }).exec();

        if (lead) {
            Lead.findOneAndUpdate({ _id: lead._id }, {
                $set: {
                    priority: 3,
                    contacted: false,
                    type: "Roadside Assistance",
                    follow_up: {
                    },
                    geometry: [req.body.longitude, req.body.latitude],
                    remark: {
                        status: status.status,
                        customer_remark: "Roadside Assistance",
                        assignee_remark: "Roadside Assistance",
                        color_code: status.color_code,
                        created_at: new Date(),
                        updated_at: new Date()
                    },
                    //source:lead.remark.status,
                    // source: "Roadside Assistance",
                    updated_at: new Date()
                }
            }, { new: false }, async function (err, doc) {

                LeadRemark.create({
                    lead: lead._id,
                    type: "Roadside Assistance",
                    source: "Roadside Assistance",
                    status: status.status,
                    customer_remark: "Roadside Assistance",
                    assignee_remark: "Roadside Assistance",
                    assignee: lead.assignee,
                    color_code: status.color_code,
                    created_at: new Date(),
                    updated_at: new Date()
                });


                event.assistance(lead, req.headers['tz'])

                var json = ({
                    responseCode: 200,
                    responseMessage: "Location details are shared with our Roadside Assistance Team. You'll be contacted as soon as possible. Alternatively, you can also call us at 1800 843 4300",
                    responseData: {}
                });

                res.status(200).json(json)
            });
        }
        else {
            var data = {}
            var manager = null;

            var status = await LeadStatus.findOne({ status: "Open" }).exec();

            var managers = [];
            await LeadManagement.find({ business: "5bfec47ef651033d1c99fbca", source: "Roadside Assistance" })
                .cursor().eachAsync(async (a) => {
                    var d = await Lead.find({ business: "5bfec47ef651033d1c99fbca", assignee: a.user, 'remark.status': { $in: ['Open', 'Follow-Up'] } }).count().exec();
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
                user: user._id,
                business: "5bfec47ef651033d1c99fbca",
                name: user.name,
                contact_no: user.contact_no,
                email: user.email,
                assignee: manager,
                contacted: false,
                priority: 3,
                follow_up: {

                },
                type: "Roadside Assistance",
                geometry: [req.body.longitude, req.body.latitude],
                source: "Roadside Assistance",
                remark: {
                    status: status.status,
                    customer_remark: "Roadside Assistance",
                    assignee_remark: "Roadside Assistance",
                    assignee: manager,
                    color_code: status.color_code,
                    created_at: new Date(),
                    updated_at: new Date()
                },
                created_at: new Date(),
                updated_at: new Date(),
            }

            await Lead.create(data).then(async function (lead) {
                var count = await Lead.find({ _id: { $lt: l._id }, business: "5bfec47ef651033d1c99fbca", 'remark.status': { $in: ['Open', 'Follow-Up'] } }).count();
                var lead_id = count + 10000;

                Lead.findOneAndUpdate({ _id: l._id }, { $set: { lead_id: lead_id } }, { new: true }, async function (err, doc) {
                })
                var status = await LeadStatus.findOne({ status: "Open" }).exec();
                LeadRemark.create({
                    lead: lead._id,
                    type: "Roadside Assistance",
                    source: "Roadside Assistance",
                    status: status.status,
                    customer_remark: "Roadside Assistance",
                    assignee_remark: "Roadside Assistance",
                    assignee: manager,
                    color_code: status.color_code,
                    created_at: new Date(),
                    updated_at: new Date()
                });

                event.assistance(lead, req.headers['tz'])

                var json = ({
                    responseCode: 200,
                    responseMessage: "Location details are shared with our Roadside Assistance Team. You'll be contacted as soon as possible. Alternatively, you can also call us at 1800 843 4300",
                    responseData: {}
                });
                fun.webNotification("Lead", lead);

                await whatsAppEvent.leadGenerate(lead._id, business);
                event.leadCre(lead._id, business);
                await whatsAppEvent.leadCre(lead._id, business);
            });
        }
    }
    else {
        var json = ({
            responseCode: 400,
            responseMessage: "Invalid user",
            responseData: {}
        });

        res.status(400).json(json)
    }
});


router.post('/insurance-renewal', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var user = await User.findOne({ _id: decoded.user }).exec();

    if (user) {
        var lead = await Lead.findOne({ contact_no: user.contact_no, "remark.status": { $in: ["Open", "Follow-Up", "Assigned"] } }).sort({ updated_at: -1 }).exec();

        var status = await LeadStatus.findOne({ status: "Open" }).exec();

        if (lead) {
            Lead.findOneAndUpdate({ _id: lead._id }, {
                $set: {
                    priority: 3,
                    contacted: false,
                    type: "Insurance Renewal",
                    category: "Insurance",
                    follow_up: {
                    },
                    geometry: [0, 0],
                    remark: {
                        status: status.status,
                        customer_remark: "Insurance Renewal",
                        assignee_remark: "Insurance Renewal",
                        color_code: status.color_code,
                        created_at: new Date(),
                        updated_at: new Date()
                    },
                    // source: "Insurance Renewal",
                    //source:lead.remark.status
                    updated_at: new Date()
                }
            }, { new: false }, async function (err, doc) {

                LeadRemark.create({
                    lead: lead._id,
                    type: "Insurance Renewal",
                    source: "Insurance Renewal",
                    status: status.status,
                    customer_remark: "Insurance Renewal",
                    assignee_remark: "Insurance Renewal",
                    assignee: lead.assignee,
                    color_code: status.color_code,
                    created_at: new Date(),
                    updated_at: new Date()
                }).then(function (newRemark) {
                    Lead.findOneAndUpdate({ _id: lead._id }, { $push: { remarks: newRemark._id } }, { new: true }, async function (err, doc) {
                    })
                });


                event.assistance(lead, req.headers['tz'])

                // console.log(lead._id)
                var json = ({
                    responseCode: 200,
                    responseMessage: "Location details are shared with our Insurance Renewal Team. You'll be contacted as soon as possible. Alternatively, you can also call us at 1800 843 4300",
                    responseData: {}
                });

                res.status(200).json(json)
            });
        }
        else {
            var data = {}
            var manager = "5bfec47ef651033d1c99fbca";
            var status = await LeadStatus.findOne({ status: "Open" }).exec();
            var managers = [];
            var business = "5bfec47ef651033d1c99fbca";

            await Management.find({ business: business, role: "CRE" })
                .cursor().eachAsync(async (a) => {
                    // var d = await Lead.find({ business: "5bfec47ef651033d1c99fbca", assignee: a.user, 'remark.status': { $in: ['Open', 'Follow-Up'] } }).count().exec();
                    var open = await Lead.find({ business: business, assignee: a.user, 'remark.status': { $in: ['Open',] } }).count().exec();
                    var follow_up = await Lead.find({ business: business, assignee: a.user, 'remark.status': { $in: ['Follow-Up'] }, 'follow_up.date': { $lte: new Date() } }).count().exec();
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
                user: user._id,
                business: "5bfec47ef651033d1c99fbca",
                name: user.name,
                contact_no: user.contact_no,
                email: user.email,
                assignee: manager,
                contacted: false,
                priority: 3,
                follow_up: {

                },
                category: "Insurance",
                type: "Insurance Renewal",
                geometry: [0, 0],
                source: "Insurance Renewal",
                remark: {
                    status: status.status,
                    customer_remark: "Insurance Renewal",
                    assignee_remark: "Insurance Renewal",
                    assignee: manager,
                    color_code: status.color_code,
                    created_at: new Date(),
                    updated_at: new Date()
                },
                created_at: new Date(),
                updated_at: new Date(),
            }

            await Lead.create(data).then(async function (lead) {
                var count = await Lead.find({ _id: { $lt: lead._id }, business: "5bfec47ef651033d1c99fbca" }).count();
                var lead_id = count + 10000;

                Lead.findOneAndUpdate({ _id: lead._id }, { $set: { lead_id: lead_id } }, { new: true }, async function (err, doc) {
                })


                var status = await LeadStatus.findOne({ status: "Open" }).exec();
                LeadRemark.create({
                    lead: lead._id,
                    type: "Insurance Renewal",
                    source: "Insurance Renewal",
                    status: status.status,
                    customer_remark: "Insurance Renewal",
                    assignee_remark: "Insurance Renewal",
                    assignee: manager,
                    color_code: status.color_code,
                    created_at: new Date(),
                    updated_at: new Date()
                }).then(function (newRemark) {
                    Lead.findOneAndUpdate({ _id: lead._id }, { $push: { remarks: newRemark._id } }, { new: true }, async function (err, doc) {
                    })
                });

                event.assistance(lead, req.headers['tz'])

                var json = ({
                    responseCode: 200,
                    responseMessage: "Location details are shared with our Insurance Renewal Team. You'll be contacted as soon as possible. Alternatively, you can also call us at 1800 843 4300",
                    responseData: {}
                });
                fun.webNotification("Lead", lead);

                await whatsAppEvent.leadGenerate(lead._id, business);
                event.leadCre(lead._id, business);
                await whatsAppEvent.leadCre(lead._id, business);
                res.status(200).json(json)
            });
        }
    }
    else {
        var json = ({
            responseCode: 400,
            responseMessage: "Invalid user",
            responseData: {}
        });

        res.status(400).json(json)
    }
});


router.post('/products/offers/add', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var business = await User.findById(decoded.user).exec();


    req.body.valid_till = new Date(req.body.valid_till).toISOString();
    req.body.business = business._id;
    req.body.image = "";
    req.body.isCarEager = business.isCarEager;
    req.body.created_at = new Date();
    req.body.updated_at = new Date();

    ProductOffer.create(req.body).then(function (offer) {
        res.status(200).json({
            responseCode: 200,
            responseMessage: "Offer has been added",
            responseData: {
                item: offer,
            }
        });
    }).catch(next);
});

// New Route added to add leads
router.post('/lead/add', async function (req, res, next) {
    // businessId = "5bfec47ef651033d1c99fbca";
    var business_name = "CarEager Xpress Gurugram";
    var userName = "";
    var userEmail = "";
    var message = "";
    if (req.body.company) {
        business_name = req.body.company;
    }
    if (req.body.name) {
        userName = req.body.name;
    }
    if (req.body.email) {
        userEmail = req.body.email;
    }
    if (req.body.message) {
        message = req.body.messagel;
    }

    var contact_no = req.body.contact_no;
    //contact_no = contact_no.substring(3)
    var getUser = await User.findOne({ contact_no: contact_no }).exec();

    var user = null;
    var name = userName;
    var email = userEmail;
    let source = 'Website';
    if (getUser) {
        user = getUser._id;
        name = getUser.name;
        email = getUser.email;
        contact = getUser.contact_no;
    }

    var business_record = await User.findOne({ "account_info.type": "business", "name": business_name }).exec();
    if (business_record) {
        businessId = business_record._id;
        // console.log('BusinessId', businessId);
    } else {
        businessId = '5bfec47ef651033d1c99fbca'
    }

    var checkLead = await Lead.findOne({ contact_no: contact_no, business: businessId, "remark.status": { $in: ["Open", "Follow-Up",] } }).sort({ updated_at: -1 }).exec();

    var status = await LeadStatus.findOne({ status: "Open" }).exec();

    if (checkLead) {
        // console.log("OLd Lead ")
        Lead.findOneAndUpdate({ _id: checkLead._id }, {
            $set: {
                type: source,
                follow_up: {
                    date: null,
                    time: "",
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                remark: {
                    status: status.status,
                    color_code: status.color_code,
                    customer_remark: message,
                    created_at: new Date(),
                    updated_at: new Date()
                },
                geometry: [0, 0],
                // source: source,
                updated_at: new Date()
            }
        }, { new: true }, async function (err, doc) {

            LeadRemark.create({
                lead: checkLead._id,
                type: source,
                source: source,
                resource: req.body.resource_url,
                status: status.status,
                customer_remark: message,
                assignee_remark: "",
                assignee: checkLead.assignee,
                color_code: status.color_code,
                created_at: new Date(),
                updated_at: new Date()
            }).then(function (newRemark) {
                Lead.findOneAndUpdate({ _id: checkLead._id }, { $push: { remarks: newRemark._id } }, { new: true }, async function (err, doc) {
                })
            });


            // event.assistance(checkLead, req.headers['tz'])
            event.appLink(checkLead);
            // console.log("Contact   " + checkLead.contact_no)
            var json = ({
                responseCode: 200,
                responseMessage: "Pre: " + checkLead._id,
                responseData: {}
            });

            res.status(200).json(json)
        });
    }
    else {
        // console.log("New  Lead ")
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
        //Abhinav Alternate
        var alternate_no = ""
        var additional_info = {
            alternate_no: alternate_no
        }
        if (req.body.alternate_no) {
            var additional_info = {
                alternate_no: alternate_no
            }
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
            type: source,
            geometry: [0, 0],
            source: source,
            remark: {
                status: status.status,
                customer_remark: message,
                assignee_remark: "",
                assignee: manager,
                resource: req.body.resource_url,
                color_code: status.color_code,
                created_at: new Date(),
                updated_at: new Date()
            },
            additional_info: additional_info,
            created_at: new Date(),
            updated_at: new Date(),
        }

        await Lead.create(data).then(async function (lead) {
            var count = await Lead.find({ _id: { $lt: lead._id }, business: businessId }).count();
            var lead_id = count + 10000;

            await Lead.findOneAndUpdate({ _id: lead._id }, { $set: { lead_id: lead_id } }, { new: true }, async function (err, doc) {
            })
            var status = await LeadStatus.findOne({ status: "Open" }).exec();
            LeadRemark.create({
                lead: lead._id,
                type: source,
                source: source,
                status: status.status,
                customer_remark: message,
                assignee_remark: "",
                assignee: manager,
                resource: req.body.resource_url,
                color_code: status.color_code,
                created_at: new Date(),
                updated_at: new Date(),
                geometry: [0, 0]
            }).then(function (newRemark) {
                Lead.findOneAndUpdate({ _id: lead._id }, { $push: { remarks: newRemark._id } }, { new: true }, async function (err, doc) {
                })
            });

            event.assistance(lead, req.headers['tz'])
            event.appLink(contact_no);
            fun.webNotification("Lead", lead);

            await whatsAppEvent.leadGenerate(lead._id, businessId);
            event.leadCre(lead._id, businessId);
            await whatsAppEvent.leadCre(lead._id, businessId);

            var json = ({
                responseCode: 200,
                responseMessage: "New: " + lead._id,
                responseData: {
                    message: "Lead Added Successfully"
                }
            });

            res.status(200).json(json)
        });
    }
});

//Abhinav SignUp
router.post('/user/registration', xAccessToken.token, async function (req, res, next) {
    // console.log(req.body.name, req.body.contact_no)
    var checkPhone = await User.find({ contact_no: req.body.contact_no, "account_info.type": "user" }).count().exec();
    if (checkPhone == 0) {

        var firstPart = (Math.random() * 46656) | 0;
        var secondPart = (Math.random() * 46656) | 0;
        firstPart = ("000" + firstPart.toString(36)).slice(-3);
        secondPart = ("000" + secondPart.toString(36)).slice(-3);
        req.body.referral_code = firstPart.toUpperCase() + secondPart.toUpperCase();


        var otp = Math.floor(Math.random() * 90000) + 10000;

        req.body.username = shortid.generate();

        req.body.socialite = {};
        req.body.optional_info = {};

        var address = req.body.address;

        var country = await Country.findOne({ timezone: { $in: req.headers['tz'] } }).exec();

        var rand = Math.ceil((Math.random() * 100000) + 1);

        req.body.name = _.startCase(_.toLower(req.body.name));

        var name = req.body.name;

        // return res.send({
        //     message: "Hwll"
        // })
        // req.body.password = sha1(req.body.password);
        // console.log(sha1(req.body.password));
        // req.body.user_pass = bcrypt.hashSync(req.body.password);
        // console.log(req.body.user_pass)
        req.body.password = req.body.password;
        // req.body.address = {
        //     country: country.countryName,
        // timezone: req.headers['tz'],
        //     location: req.body.location,
        //     address: address,
        //     state: req.body.state,
        //     city: req.body.city,
        //     zip: req.body.zip,
        //     area: req.body.area,
        //     landmark: req.body.landmark,
        // };

        // req.body.bank_details = {
        //     ifsc: req.body.ifsc,
        //     account_no: req.body.account_no,
        //     account_holder: req.body.account_holder
        // };

        req.body.account_info = {
            type: "user",
            status: "Active",
            added_by: null,
            phone_verified: false,
            verified_account: false,
            approved_by_admin: false,
        };

        req.body.geometry = [0, 0];
        if (req.body.longitude && req.body.latitude) {
            req.body.geometry = [req.body.longitude, req.body.latitude];
        }
        req.body.device = [];
        req.body.otp = otp;

        // req.body.business_info = {
        //     company_name: req.body.name,
        //     // business_category:req.body.business_category,
        //     category: req.body.category,
        //     company: req.body.company,
        //     account_no: req.body.account_no,
        //     gst_registration_type: req.body.gst_registration_type,
        //     gstin: req.body.gstin,
        //     is_claimed: true,
        //     tax_registration_no: req.body.tax_registration_no,
        //     pan_no: req.body.pan_no
        // };

        // var started_at = null;
        // if (req.body.started_at) {
        //     started_at = new Date(req.body.started_at).toISOString()
        // }

        // var expired_at = null;
        // if (req.body.expired_at) {
        //     expired_at = new Date(req.body.expired_at).toISOString()
        // }

        req.body.uuid = uuidv1();

        // req.body.partner = {
        //     partner: req.body.carEager_partner,
        //     commission: req.body.partner_commision,
        //     package_discount: req.body.package_discount,
        //     started_at: started_at,
        //     expired_at: expired_at,
        // };

        User.create(req.body).then(async function (user) {
            res.status(200).json({
                reponseCode: 200,
                responseMessage: "success",
                responseData: {
                    user: user
                },
            });
        });
    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Phone number already in use.",
            responseData: {},
        });
    }
});


//Login
router.post('/login', xAccessToken.token, async function (req, res, next) {
    var count = await User.findOne({
        contact_no: req.body.contact_no,
    }).count().exec();

    if (count != 0) {
        var checkPhone = await User.findOne({ contact_no: req.body.contact_no, 'account_info.type': "user" }).exec();
        if (checkPhone) {
            if (checkPhone.account_info.status == "Active") {
                var pass = bcrypt.hashSync(req.body.password)
                // var pass = sha1(req.body.password)
                // console.log(pass, " -- " + checkPhone.password)

                // return // console.log(sha1(req.body.password), " -- " + checkPhone.password)
                // console.log(!bcrypt.compareSync(req.body.password, checkPhone.password))
                // if (!bcrypt.compareSync(req.body.password, checkPhone.user_pass)) {
                if (!bcrypt.compareSync(req.body.password, checkPhone.password)) {
                    //

                    //
                    res.status(400).json({
                        responseCode: 400,
                        responseMessage: "Authentication failed. Wrong password Abhi",
                        responseData: {},
                    });
                }
                else {
                    var countType = await User.findOne({ contact_no: req.body.contact_no, 'account_info.type': "user" }).count().exec();
                    if (countType == 0) {
                        res.status(400).json({
                            responseCode: 400,
                            responseMessage: "This Phone Number is already registered as a User",
                            responseData: {}
                        })
                    }
                    else {
                        const payload = {
                            user: checkPhone._id
                        };
                        var token = jwt.sign(payload, secret);

                        var deviceInfo = [];

                        deviceInfo = _.filter(checkPhone.device, device => device.deviceId != req.headers['deviceid']);

                        deviceInfo.push({
                            deviceId: req.headers['deviceid'],
                            token: token,
                            fcmId: "",
                            app: req.headers['app'],
                            deviceType: req.headers['devicetype'],
                            deviceModel: req.headers['devicemodel']
                        });


                        User.findOneAndUpdate({ _id: checkPhone._id }, {
                            $set: {
                                "device": deviceInfo
                            }
                        }, { new: true }, async function (err, doc) {
                            if (err) {
                                var status_code = 422;
                                var response = {
                                    responseCode: 422,
                                    responseMessage: "failure",
                                    responseData: "Something wrong when updating data",
                                }
                            }
                            else {
                                var update = await User.findById(checkPhone._id).exec();
                                if (update.account_info.type == "user") {
                                    res.status(200).json({
                                        responseCode: 200,
                                        responseMessage: "sucess",
                                        responseData: {
                                            status: "Active",
                                            token: token,
                                            user: update
                                        }
                                    })
                                }
                                else if (update.account_info.type == "business") {
                                    var management = await Management.find({ user: update._id }).exec();
                                    res.status(200).json({
                                        responseCode: 200,
                                        responseMessage: "sucess",
                                        responseData: {
                                            status: "Active",
                                            token: token,
                                            user: update,
                                            management: management
                                        }
                                    })
                                }

                                else if (update.account_info.type == "admin") {
                                    res.status(200).json({
                                        responseCode: 200,
                                        responseMessage: "sucess",
                                        responseData: {
                                            status: "Active",
                                            token: token,
                                            user: update
                                        }
                                    })
                                }
                            }
                        });
                    }
                }
            }
            else if (checkPhone.account_info.status == "Complete") {
                var data = {
                    otp: Math.ceil(Math.random() * 90000) + 10000,
                };

                User.findOneAndUpdate({ _id: checkPhone._id }, { $set: data }, { new: true }, async function (err, doc) {
                    var user = await User.findOne({ _id: checkPhone._id }).select('-password').exec();
                    event.otpCarEgaer(user);
                    // event.otpSmsMail(user);


                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "OTP sent",
                        responseData: {
                            status: "Complete",
                            //status: user.account_info.status,
                            user: user
                        }
                    });
                });
            }
            else {
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "success",
                    responseData: {
                        status: checkPhone.account_info.status,
                        user: checkPhone
                    }
                });
            }
        }
    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "The phone number that you've entered doesn't match any account.",
            responseData: {},
        })
    }
});



// Abhinav Services Description
router.get('/services/description/get', async function (req, res, next) {

    // console.log("Service description get body...", req.body)

    var rules = {
        type: 'required',
    };

    var validation = new Validator(req.query, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Validation Error",
            responseData: {
                res: validation.errors.all()
            }
        })
    }
    else {
        // var token = req.headers['x-access-token'];
        // var secret = config.secret;
        // var decoded = jwt.verify(token, secret);
        // var user = decoded.user;
        var business = req.headers['business'];
        carId = "5b290623e9367455c048efb3"    //Only to get Description of car Segments
        var totalResult = 0;
        var car = await Variant.findById(carId).populate('model').exec();
        if (car) {
            var packages = [];

            if (req.query.type == "services") {
                await Service.find({ segment: car.model.segment, part_cost: 0, publish: true, business: business })
                    .cursor().eachAsync(async (service) => {
                        packages.push({
                            package: service.package,
                            service: service.service,
                            type: service.type,
                            source: service.id,
                            description: service.description,
                            id: service.id,
                            _id: service._id,
                            profile: service.profile,
                        });

                        packageDiscountOn = []
                    });

                await Service.find({ model: car.model._id, part_cost: { $gt: 0 }, publish: true, business: business })
                    .cursor().eachAsync(async (service) => {

                        packages.push({
                            package: service.package,
                            service: service.service,
                            type: service.type,
                            source: service.id,
                            // gallery: gallery.length,
                            description: service.description,
                            id: service.id,
                            _id: service._id,
                            profile: service.profile,
                        });
                    });
            }

            else if (req.query.type == "collision") {
                // console.log("Working.....")
                await Collision.find({ segment: car.model.segment, publish: true, business: business })
                    .cursor().eachAsync(async (service) => {
                        packages.push({
                            package: service.package,
                            service: service.service,
                            type: service.type,
                            source: service.id,
                            description: service.description,
                            id: service.id,
                            _id: service._id,
                            profile: service.profile,
                        });

                        packageDiscountOn = []
                    });

            }

            else if (req.query.type == "customization") {
                await Customization.find({ segment: car.model.segment, publish: true, business: business })
                    .cursor().eachAsync(async (service) => {

                        packages.push({
                            package: service.package,
                            service: service.service,
                            type: service.type,
                            source: service.id,
                            description: service.description,
                            id: service.id,
                            _id: service._id,
                            profile: service.profile,
                        });

                        packageDiscountOn = []
                    });
            }

            else if (req.query.type == "detailing") {
                await Detailing.find({ segment: car.model.segment, publish: true, business: business })
                    .cursor().eachAsync(async (service) => {
                        packages.push({
                            package: service.package,
                            service: service.service,
                            type: service.type,
                            source: service.id,
                            description: service.description,
                            id: service.id,
                            _id: service._id,
                            profile: service.profile,
                        });

                        packageDiscountOn = []
                    });
            }

            packages = _(packages).groupBy(x => x.package).map((value, key) => ({ package: key, services: value })).value();

            res.status(200).json({
                responseCode: 200,
                responseMessage: "",
                responseData: packages
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




router.get('/services/description/get/3Jan', async function (req, res, next) {
    var rules = {
        type: 'required',
    };

    var validation = new Validator(req.query, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Validation Error",
            responseData: {
                res: validation.errors.all()
            }
        })
    }
    else {
        // var token = req.headers['x-access-token'];
        // var secret = config.secret;
        // var decoded = jwt.verify(token, secret);
        // var user = decoded.user;
        var business = req.headers['business'];
        carId = "5b290623e9367455c048efb3"    //Only to get Description of car Segments
        var totalResult = 0;
        var car = await Variant.findById(carId).populate('model').exec();
        if (car) {
            var packages = [];

            if (req.query.type == "services") {
                await Service.find({ segment: car.model.segment, part_cost: 0, publish: true, business: business })
                    .cursor().eachAsync(async (service) => {
                        packages.push({
                            package: service.package,
                            service: service.service,
                            type: service.type,
                            source: service.id,
                            description: service.description,
                            id: service.id,
                            _id: service._id,
                            profile: service.profile,
                        });

                        packageDiscountOn = []
                    });

                await Service.find({ model: car.model._id, part_cost: { $gt: 0 }, publish: true, business: business })
                    .cursor().eachAsync(async (service) => {

                        packages.push({
                            package: service.package,
                            service: service.service,
                            type: service.type,
                            source: service.id,
                            // gallery: gallery.length,
                            description: service.description,
                            id: service.id,
                            _id: service._id,
                            profile: service.profile,
                        });
                    });
            }

            else if (req.query.type == "collision") {
                // console.log("Working.....")
                await Collision.find({ segment: car.model.segment, publish: true, business: business })
                    .cursor().eachAsync(async (service) => {
                        packages.push({
                            package: service.package,
                            service: service.service,
                            type: service.type,
                            source: service.id,
                            description: service.description,
                            id: service.id,
                            _id: service._id,
                            profile: service.profile,
                        });

                        packageDiscountOn = []
                    });

            }

            else if (req.query.type == "customization") {
                await Customization.find({ segment: car.model.segment, publish: true, business: business })
                    .cursor().eachAsync(async (service) => {

                        packages.push({
                            package: service.package,
                            service: service.service,
                            type: service.type,
                            source: service.id,
                            description: service.description,
                            id: service.id,
                            _id: service._id,
                            profile: service.profile,

                        });

                        packageDiscountOn = []
                    });
            }

            else if (req.query.type == "detailing") {
                await Detailing.find({ segment: car.model.segment, publish: true, business: business })
                    .cursor().eachAsync(async (service) => {
                        packages.push({
                            package: service.package,
                            service: service.service,
                            type: service.type,
                            source: service.id,
                            description: service.description,
                            id: service.id,
                            _id: service._id,
                            profile: service.profile,
                        });

                        packageDiscountOn = []
                    });
            }

            packages = _(packages).groupBy(x => x.package).map((value, key) => ({ package: key, services: value })).value();

            res.status(200).json({
                responseCode: 200,
                responseMessage: "",
                responseData: packages
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


router.post('/service/price/otp', async function (req, res, next) {
    var contact_no = req.body.contact_no;
    var email = req.body.email;
    var user = null;
    var name = "";
    var source = "Website Check Price";
    var businessId = "5bfec47ef651033d1c99fbca";
    var getUser = await User.findOne({ contact_no: contact_no }).exec();
    if (getUser) {
        user = getUser._id;
        name = getUser.name;
        email = getUser.email;
        contact = getUser.contact_no;
    }
    if (req.body.contact_no) {
        var checkPhone = await User.find({ contact_no: req.body.contact_no, "account_info.type": "user" }).count().exec();
        if (checkPhone == 0) {
            var countryName = "India"
            var country = await Country.findOne({ timezone: { $in: req.headers['tz'] } }).exec();
            if (country) {
                countryName = country.countryName
            }

            req.body.address = {
                country: countryName,
                timezone: req.headers['tz'],
                location: req.body.location,
            };

            req.body.account_info = {
                type: "user",
                status: "Active",
            };
            // var name = req.body.name.substring(0, 3);
            var rand = Math.ceil((Math.random() * 100000) + 1);
            var email = req.body.email;
            var referral_code = req.body.referral_code;
            req.body.username = shortid.generate();
            req.body.name = _.startCase(_.toLower(req.body.name));

            var firstPart = (Math.random() * 46656) | 0;
            var secondPart = (Math.random() * 46656) | 0;
            firstPart = ("000" + firstPart.toString(36)).slice(-3);
            secondPart = ("000" + secondPart.toString(36)).slice(-3);

            req.body.referral_code = firstPart.toUpperCase() + secondPart.toUpperCase();

            req.body.geometry = [0, 0];
            req.body.device = [];
            req.body.otp = Math.ceil(Math.random() * 90000) + 10000;

            req.body.careager_cash = 0;
            req.body.socialite = {};
            req.body.optional_info = {};
            req.body.business_info = {};
            req.body.uuid = uuidv1();

            var avatar = uuidv1() + ".jpg";

            if (req.body.avatar) {
                var avatar_url = req.body.avatar;
                req.body.avatar = avatar;
                put_from_url(avatar_url, config.BUCKET_NAME, avatar, function (err, response) {
                    if (err)
                        throw err;
                });
            }

            User.create(req.body).then(async function (user) {
                event.otpCarEgaer(user);
                // console.log("Xpresss :", email)
                // event.otpSmsMailXpress(req.body.email, user);

                if (referral_code) {
                    var checkReferralCode = await User.findOne({ referral_code: referral_code.toUpperCase() }).exec();
                    if (checkReferralCode) {
                        var checkPrevious = await Referral.findOne({ code: referral_code, owner: checkReferralCode._id, user: user._id }).count().exec();

                        if (checkPrevious == 0) {
                            Referral.create({
                                code: referral_code.toUpperCase(),
                                owner: checkReferralCode._id,
                                user: user._id,
                                created_at: new Date(),
                                updated_at: new Date()
                            });
                        }
                    }
                }

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "success",
                    responseData: {
                        status: "Active",
                        user: user._id,
                        contact_no: contact_no
                    },
                });
            });
        }
        else {

            var otp = Math.floor(Math.random() * 90000) + 10000;

            var data = {
                otp: otp
            };

            var type = 'user';
            if (req.body.type) {
                type = req.body.type;

            }

            var user = await User.findOne({ contact_no: req.body.contact_no, "account_info.type": type }).exec();

            if (user) {
                User.findOneAndUpdate({ _id: user._id }, { $set: data }, { new: true }, async function (err, doc) {
                    if (err) {
                        var json = ({
                            responseCode: 400,
                            responseMessage: "Error occured",
                            responseData: {}
                        });
                        res.status(400).json(json)
                    }

                    var updateUser = await User.findOne({ contact_no: req.body.contact_no, "account_info.type": type }).exec();
                    event.otpCarEgaer(updateUser);
                    // event.otpSmsMailXpress(req.body.email, updateUser);
                    // console.log("Xpresss Update:", req.body.email,)

                    var json = ({
                        responseCode: 200,
                        responseMessage: "OTP Sent",
                        responseData: {
                            status: "Active",
                            user: updateUser._id,
                            contact_no: contact_no
                        }
                    });
                    res.status(200).json(json)
                });
            }
            // res.status(422).json({
            //     responseCode: 422,
            //     responseMessage: "Phone number already in use.",
            //     responseData: {},
            // });
        }

        var getUser = await User.findOne({ contact_no: contact_no }).exec();
        var user = null;
        var name = req.body.name;
        var email = req.body.email;
        // var business_name = req.query.company;  //CarEager Xpress Gurugram
        // var businessId = "";
        // var source=req.query.leadtype;
        var source = "Website Check Price";
        businessId = "5bfec47ef651033d1c99fbca";

        if (getUser) {
            user = getUser._id;
            name = getUser.name;
            email = getUser.email;
            contact = getUser.contact_no;
        }


        var checkLead = await Lead.findOne({ contact_no: contact_no, business: businessId, "remark.status": { $in: ["Open", "Follow-Up",] } }).sort({ updated_at: -1 }).exec();

        var status = await LeadStatus.findOne({ status: "Open" }).exec();

        if (checkLead) {
            Lead.findOneAndUpdate({ _id: checkLead._id }, {
                $set: {
                    type: "",
                    follow_up: {
                        date: null,
                        time: "",
                        created_at: new Date(),
                        updated_at: new Date(),
                    },
                    remark: {
                        status: status.status,
                        resource: req.query.resource_url,
                        customer_remark: "",
                        assignee_remark: "",
                        resource: req.query.resource_url,
                        color_code: status.color_code,
                        created_at: new Date(),
                        updated_at: new Date()
                    },
                    // source: source,
                    updated_at: new Date(),
                    // business:businessId
                }
            }, { new: true }, async function (err, doc) {

                LeadRemark.create({
                    lead: checkLead._id,
                    type: "",
                    source: source,
                    resource: req.query.resource_url,
                    status: status.status,
                    customer_remark: "",
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
                type: req.query.leadtype,
                geometry: [0, 0],
                source: source,
                remark: {
                    status: status.status,
                    customer_remark: "",
                    assignee_remark: "",
                    assignee: manager,
                    resource: req.query.resource_url,
                    color_code: status.color_code,
                    created_at: new Date(),
                    updated_at: new Date(),
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


                event.assistance(lead, req.headers['tz'])
                fun.webNotification("Lead", lead);
                await whatsAppEvent.leadGenerate(lead._id, businessId);
                event.leadCre(lead._id, businessId);
                await whatsAppEvent.leadCre(lead._id, businessId);

            });
        }
    }
    else {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Phone is required",
            responseData: {},
        });
    }

});

// async function getPackageService(label) {
//     var bookingService = [];
//     if (label == "Wheel Alignment" || label == "Wheel Balancing (cost per tyre, weights excluded)") {
//         var cond = { service: label };
//     }
//     else {
//         var cond = { service: label };
//     }

//     await Service.findOne(cond).cursor().eachAsync(async (service) => {
//         if (service) {
//             bookingService.push({
//                 source: service._id,
//                 service: service.service,
//                 type: "services"
//             });
//         }
//     });

//     await Collision.findOne({ service: label }).cursor().eachAsync(async (service) => {
//         if (service) {
//             bookingService.push({
//                 source: service._id,
//                 service: service.service,
//                 description: service.description,
//                 type: "collision"
//             });
//         }
//     });

//     await Detailing.findOne({ service: label }).cursor().eachAsync(async (service) => {
//         if (service) {
//             bookingService.push({
//                 source: service._id,
//                 service: service.service,
//                 description: service.description,
//                 type: "detailing"
//             });
//         }

//     });

//     await Customization.findOne({ service: label }).cursor().eachAsync(async (service) => {
//         if (service) {
//             bookingService.push({
//                 source: service._id,
//                 service: service.service,
//                 description: service.description,
//                 type: "customization"
//             });
//         }
//     });

//     await Washing.findOne({ service: label }).cursor().eachAsync(async (service) => {
//         if (service) {
//             bookingService.push({
//                 source: service._id,
//                 service: service.service,
//                 description: service.description,
//                 type: "washing"
//             });
//         }
//     });
//     return bookingService;
// }

// router.post('/bookings/time-slot/', async function (req, res, next) {
//     var rules = {
//         business: 'required',
//         date: 'required',
//     };
//     // console.log("Called   ==  " + req.body.booking)
//     var validation = new Validator(req.body, rules);

//     if (validation.fails()) {
//         res.status(422).json({
//             responseCode: 422,
//             responseMessage: "Service not mention",
//             responseData: {
//                 res: validation.errors.all()
//             }
//         })
//     }
//     else {
//         if (req.body.booking) {
//             var booking = await Booking.findById(req.body.booking).exec();
//             if (booking) {
//                 var body = booking.services;
//                 if (body.length <= 0) {
//                     body.push({
//                         type: "services"
//                     });
//                 }
//             }
//         }
//         else if (req.body.label) {
//             var body = await q.all(getPackageService(req.body.label));
//         }
//         else {
//             var body = req.body.services;
//         }

//         body = _.uniqBy(body, 'type');



//         var slots = [];
//         var date = new Date(new Date(req.body.date).setHours(0, 0, 0, 0));
//         var next = new Date(new Date(req.body.date).setHours(0, 0, 0, 0));
//         next.setDate(date.getDate() + 1);

//         var business = req.body.business;

//         for (var i = 0; i < body.length; i++) {
//             if (body[i].type == "addOn") {
//                 body[i].type = "services"
//             }

//             var check = await BookingTiming.find({ business: business }).count().exec();

//             if (check > 0) {
//                 await BookingTiming.find({ business: business, category: body[i].type })
//                     .sort({ sort: 1 })
//                     .cursor().eachAsync(async (timing) => {

//                         var slot = await Booking.find({
//                             time_slot: timing.slot,
//                             is_services: true,
//                             business: business,
//                             date: { $gte: date, $lt: next },
//                             services: { $elemMatch: { type: body[i].type } },
//                             status: { $nin: ["Inactive", "Rejected", "Cancelled", "Completed", "Closed"] },
//                         }).count().exec();

//                         if (slot < timing.booking_per_slot) {
//                             slot = timing.booking_per_slot - slot
//                             slots.push({
//                                 slot: timing.slot,
//                                 count: slot,
//                                 sort: timing.sort,
//                                 type: timing.category,
//                                 status: true
//                             });
//                         }
//                         else {
//                             slots.push({
//                                 slot: timing.slot,
//                                 count: slot,
//                                 sort: timing.sort,
//                                 type: timing.category,
//                                 status: false
//                             });
//                         }

//                     });
//             }
//             else {
//                 var a = await BookingTiming.find({ business: null, category: body[i].type }).exec();

//                 await BookingTiming.find({ business: null, category: body[i].type })
//                     .sort({ sort: 1 })
//                     .cursor().eachAsync(async (timing) => {
//                         var slot = await Booking.find({
//                             time_slot: timing.slot,
//                             is_services: true,
//                             business: business,
//                             date: { $gte: date, $lt: next },
//                             services: { $elemMatch: { type: body[i].type } },
//                             status: { $nin: ["Inactive", "Rejected", "Cancelled", "Completed", "Closed"] },
//                         }).count().exec();

//                         if (slot < timing.booking_per_slot) {
//                             slot = timing.booking_per_slot - slot
//                             slots.push({
//                                 slot: timing.slot,
//                                 count: slot,
//                                 sort: timing.sort,
//                                 type: timing.category,
//                                 status: true
//                             });
//                         }
//                         else {
//                             slots.push({
//                                 slot: timing.slot,
//                                 count: slot,
//                                 sort: timing.sort,
//                                 type: timing.category,
//                                 status: false
//                             });
//                         }
//                     });
//             }
//         }

//         slots = _.orderBy(slots, 'count', 'desc');
//         slots = _.uniqBy(slots, 'slot');
//         slots = _.orderBy(slots, 'sort', 'asc');

//         res.status(200).json({
//             responseCode: 200,
//             responseMessage: "",
//             responseData: slots
//         })
//     }
// });

router.get('/offers/banner', async function (req, res, next) {
    var data = [];
    var business = req.headers['business'];;
    var status = '';
    var count = 0;
    // console.log("Working");
    await BusinessOffer.find({ business: business, publish: true, })
        .sort({ created_at: -1 })
        .cursor().eachAsync(async (offer) => {
            if (offer) {
                var serverTime = moment.tz(new Date(), req.headers['tz']);
                var bar = moment.tz(new Date(offer.valid_till), req.headers['tz']);
                var baz = bar.diff(serverTime);
                // console.log(baz);

                if (baz > 0) {
                    if (offer.featured_image) {
                        var f_image = "https://s3.ap-south-1.amazonaws.com/careager/offer/" + offer.featured_image;
                        // console.log("Image = " + f_image)
                        if (offer.publish == true && baz > 0) {
                            if (data.indexOf(f_image) === -1) {
                                data.push(f_image)
                            }
                        }
                        count += 1;
                    }
                }

            }
        })
    // console.log(count)



    res.status(200).json({
        responseCode: 200,
        responseMessage: "Banners",
        responseData: data
    })
});



// Vinay add to cart
router.post("/cart/add/services", async (req, res, next) => {
    // console.log("Services add into car...", req.body)
    var token = req.headers['x-access-token'];
    let business = req.headers['business']
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    let cartServices = req.body.services


    let getUser = await ServicesCart.findOne({ user: mongoose.Types.ObjectId(user) }).exec()
    // console.log("Cart user data....", cartServices)
    if (getUser) {

        let updatedData = await ServicesCart.findOneAndUpdate({ user: mongoose.Types.ObjectId(user) },
            { services: cartServices, total: cartServices.length }).exec()
        let cartData = await ServicesCart.findOne({ user: mongoose.Types.ObjectId(user) }).exec()

        // console.log("User Cart Data if calledd....", updatedData)
        if (updatedData) {
            return res.json({
                responseCode: 200,
                total: cartData.services.length,
                cart: cartData
            })
        }

    } else {
        let cartBody = {
            total: cartServices.length,
            services: cartServices,
            user: user,
            business: business
        }
        await ServicesCart.create(cartBody).then(result => {
            return res.json({
                responseCode: 200,
                total: cartServices.length,
                cart: result
            })
        })
    }

})

router.put("/remove/cart/data", async (req, res, next) => {
    var token = req.headers['x-access-token'];
    let business = req.headers['business']
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    let service = req.body.serviceId
    let removedElement = {}
    let cartData = await ServicesCart.findOne({ user: mongoose.Types.ObjectId(user) }).exec()

    for (let i = 0; i < cartData.services.length; i++) {
        if (cartData.services[i]._id == service) {
            removedElement = cartData.services[i]
            cartData.services.splice(i, 1)
            break;
        }
    }



    await ServicesCart.findOneAndUpdate({ user: mongoose.Types.ObjectId(user) }, { services: cartData.services, total: cartData.services.length }).exec()
    let newCartData = await ServicesCart.findOne({ user: mongoose.Types.ObjectId(user) }).exec()

    res.json({
        responseCode: "200",
        cart: newCartData,
        removedElement: removedElement
    })

})

router.get("/get/cart/data", async (req, res, next) => {

    var token = req.headers['x-access-token'];
    let business = req.headers['business']
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    let cartData = await ServicesCart.findOne({ user: mongoose.Types.ObjectId(user) }).exec()

    if (cartData) {
        res.json({
            responseCode: 200,
            total: cartData.services.length,
            cartData: cartData
        })
    } else {
        res.json({
            responseCode: 404,
            total: 0,
            cartData: {}
        })
    }

})

module.exports = router