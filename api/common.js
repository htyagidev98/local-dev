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
//webpush = require('web-push');


var s3 = new aws.S3({
    accessKeyId: config.IAM_USER_KEY,
    secretAccessKey: config.IAM_USER_SECRET,
    Bucket: config.BUCKET_NAME
});


const xAccessToken = require('../middlewares/xAccessToken');
const destroyToken = require('../middlewares/destroyToken');
const fun = require('../api/function');
const event = require('../api/event');

//const method = require('../api/methods');
const whatsAppEvent = require('../api/whatsapp/whatsappEvent')
var salt = bcrypt.genSaltSync(10);

const AppVersion = require('../models/appVersion');
const User = require('../models/user');
const BusinessTiming = require('../models/businessTiming');
const Type = require('../models/type');
const BusinessType = require('../models/businessType');
const Category = require('../models/category');
const Automaker = require('../models/automaker');
const Model = require('../models/model');
const ModelMedia = require('../models/modelMedia');
const ModelReview = require('../models/modelReview');
const Post = require('../models/post');
const Follow = require('../models/follow');
const Booking = require('../models/booking');
const State = require('../models/state');
const BusinessPlan = require('../models/businessPlan');
const ProductCategory = require('../models/productCategory');
const BusinessProduct = require('../models/businessProduct');
const ProductImage = require('../models/productImage');
const Country = require('../models/country');
const BookmarkBusiness = require('../models/bookmarkBusiness');
const BusinessOffer = require('../models/businessOffer');
const BookmarkProduct = require('../models/bookmarkProduct');
const BookmarkOffer = require('../models/bookmarkOffer');
const BookmarkModel = require('../models/bookmarkModel');
const Car = require('../models/car');
const CarSell = require('../models/carSell');
const Like = require('../models/like');
const CarImage = require('../models/carImage');
const CarDocument = require('../models/carDocument');
const Club = require('../models/club');
const ClubMember = require('../models/clubMember');
const BookmarkCar = require('../models/bookmarkCar');
const BodyStyle = require('../models/bodyStyle');
const FuelType = require('../models/fuelType');
const Transmission = require('../models/transmission');
const Color = require('../models/color');
const Owner = require('../models/owner');
const ServiceGallery = require('../models/serviceGallery');
// const BusinessOffer = require('../models/businessOffer');
const BusinessGallery = require('../models/businessGallery');
const Variant = require('../models/variant');
const ClaimBusiness = require('../models/claimBusiness');
const Review = require('../models/review');
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
const LeadRemark = require('../models/leadRemark');
const Offer = require('../models/offer');
const Package = require('../models/package');
const UserPackage = require('../models/userPackage');
const PackageUsed = require('../models/packageUsed');
const Address = require('../models/address');
const Management = require('../models/management');
const CouponUsed = require('../models/couponUsed');
const Coupon = require('../models/coupon');
const CarHistory = require('../models/carHistory');
const Customization = require('../models/customization');
const Gallery = require('../models/gallery');
const InsuranceCompany = require('../models/insuranceCompany');
const JobInspection = require('../models/jobInspection');
const ReviewPoint = require('../models/reviewPoint');
const CarSellLead = require('../models/carSellLead');
const Invoice = require('../models/invoice');
const Tax = require('../models/tax');
const BusinessConvenience = require('../models/businessConvenience');
const BusinessSetting = require('../models/businessSetting');
const { otpSmsMail } = require('../api/event');
const OutBoundLead = require('../models/outBoundLead');
const businessFunctions = require('./erpWeb/businessFunctions');
const Parchi = require('../models/parchi');

var secret = config.secret;

const VAPID_PUBLIC = "BAswCwQh-rZ7AOz--_fz91uCUC-cr3HX4hipd0otLqULXFn7Ah9LFwDj1fY4-kMrfKfek7pI1k4OYLtrtpm6-iA";
const VAPID_PRIVATE = "ywEl_xDOgLQwyoevE87S_oJ6Wz5fT027cVhdl37iluQ";


var Log_Level = config.Log_Level
//webpush.setVapidDetails('mailto:imchandankumar.23@gmail.com', VAPID_PUBLIC, VAPID_PRIVATE)

router.get('/generate/key/hash', async function (req, res, next) {
    bcrypt.hash(req.query.key, salt, null, function (err, hash) {
        if (err) return next(err);
        res.json(hash);
    });
});

router.post('/lead', async function (req, res, next) {
    businessFunctions.logs("INFO:/lead Api Called from common.js");
    var rules = {
        mobile: 'required',
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Mobile is Required",
            responseData: {}
        })
    }
    else {
        var lead = await Lead.find({ mobile: req.body.mobile }).exec();
        if (lead.length != 0) {
            var a = moment(new Date());//now
            var b = moment(lead.created_at);
            var diff = a.diff(b, 'hours');
            if (diff >= 24) {
                await Lead.create({ mobile: req.body.mobile }).then(async function (lead) {
                    var username = encodeURIComponent("avinay.vminc@gmail.com");
                    var hash = encodeURIComponent("58fc07a01c2a0756a3abf1bb483314af8503efdf");
                    var number = encodeURIComponent("91" + lead.mobile);
                    var sender = encodeURIComponent("VMCARS");
                    var message = encodeURIComponent("Congratulations! Your Business - is now online. Show your business to the world using your web address - http://www.careager.com/d");

                    var data = "username=" + username + "&hash=" + hash + "&numbers=" + number + "&sender=" + sender + "&message=" + message;
                    request('http://api.textlocal.in/send/?' + data, function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            res.status(200).json({
                                responseCode: 200,
                                responseMessage: "Link Sent to Your Mobile No",
                                responseData: {}
                            });
                        }
                    });
                    fun.webNotification("Lead", lead);
                    // event.leadCre(lead._id, business);
                });
            }
            else {
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Already Sent To This No.",
                    responseData: {}
                });
            }
        }
        else {
            Lead.create({ mobile: req.body.mobile }).then(async function (lead) {
                var username = encodeURIComponent("avinay.vminc@gmail.com");
                var hash = encodeURIComponent("58fc07a01c2a0756a3abf1bb483314af8503efdf");
                var number = encodeURIComponent("91" + lead.mobile);
                var sender = encodeURIComponent("VMCARS");
                var message = encodeURIComponent("Congratulations! Your Business - dd is now online. Show your business to the world using your web address - http://www.careager.com/d");

                var data = "username=" + username + "&hash=" + hash + "&numbers=" + number + "&sender=" + sender + "&message=" + message;
                request('http://api.textlocal.in/send/?' + data, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Link Sent to Your Mobile No",
                            responseData: {}
                        });
                    }
                });
                fun.webNotification("Lead", lead);

            });
        }
    }
});

router.post('/username/check', async function (req, res, next) {
    businessFunctions.logs("INFO:/username/check Api Called from common.js" + "" + "Request Body :" + JSON.stringify(req.body));
    var rules = {
        username: 'required',
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR : Validation failed, username is required");
        }
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Username is Required",
            responseData: {}
        })
    }
    else {
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG :Check username" + req.body.username);
        }
        var checkUsername = await User.find({ username: req.body.username }).collation({ locale: 'en', strength: 2 }).exec();
        var regexp = /^[A-Za-z][a-zA-Z0-9._]*$/;
        var check = req.body.username;
        if (check.search(regexp) == -1) {
            if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
                businessFunctions.logs("WARNING :-Use Only Alphabet, Numbers and dot & underscore");
            }
            res.status(200).json({
                responseCode: 200,
                responseMessage: "Use Only Alphabet, Numbers and dot & underscore",
                responseData: {
                    status: false
                },
            });
        }
        else {
            if (checkUsername.length == 0) {
                if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                    businessFunctions.logs("INFO : Username available" + " Username : " + req.body.username);
                }
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Username available",
                    responseData: {
                        status: true
                    },
                });
            }
            else {
                if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
                    businessFunctions.logs("WARNING : Username not available" + " " + " Username : " + req.body.username);
                }
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Username not available",
                    responseData: {
                        status: false
                    },
                });
            }
        }
    }
});

router.post('/resend/otp', async function (req, res, next) {
    businessFunctions.logs("INFO:/resend/otp Api Called from common.js" + "" + "Request Body :" + JSON.stringify(req.body));
    var rules = {
        id: 'required',
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR : Validation failed, id is required");
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
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG:Validation successfull");
        }

        var otp = Math.floor(Math.random() * 90000) + 10000;

        var data = {
            otp: otp
        };

        var user = await User.findOne({ _id: req.body.id }).exec();

        if (user) {
            User.findOneAndUpdate({ _id: user._id }, { $set: data }, { new: true }, async function (err, doc) {
                if (err) {
                    if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                        businessFunctions.logs("ERROR : error occured while OTP update in the database" + "" + "for user :" + user._id);
                    }
                    var json = ({
                        responseCode: 400,
                        responseMessage: "Error occured",
                        responseData: {}
                    });
                    res.status(400).json(json)
                }

                var updateUser = await User.findOne({ _id: req.body.id }).exec();
                if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                    businessFunctions.logs("DEBUG :otpCarEgaer(updateUser) function called");
                }
                event.otpCarEgaer(updateUser);
                // event.otpSmsMail(updateUser);
                if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                    businessFunctions.logs("INFO :OTP sent successfully" + "" + "Phone Number : " + user.contact_no);
                }

                var json = ({
                    responseCode: 200,
                    responseMessage: "OTP Sent",
                    responseData: {}
                });
                res.status(200).json(json)
            });
        }
        else {
            if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
                businessFunctions.logs("WARNING :User Not Found with id" + req.body.id);
            }
            res.status(400).json({
                responseCode: 400,
                responseMessage: "User Not Found",
                responseData: {}
            });
        }
    }
});

router.post('/account', async function (req, res, next) {
    businessFunctions.logs("INFO : /account Api called from common.js with data, " + " " + "Request Body :" + JSON.stringify(req.body));
    var rules = {
        contact_no: 'required',
    };
    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR : Validation failed, contact_no is required");
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
        // console.log("Type- = " + req.body.type)
        var checkPhone = await User.findOne({ contact_no: req.body.contact_no, "account_info.type": req.body.type }).select('-password').exec();
        if (checkPhone) {
            if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("DEBUG :validated successfully and contact_no verified-" + req.body.contact_no);
            }

            var data = {
                otp: Math.ceil(Math.random() * 90000) + 10000,
                "account_info.status": "Active"
            };

            await User.findOneAndUpdate({ _id: checkPhone._id }, { $set: data }, { new: true }, async function (err, doc) {
                var user = await User.findOne({ _id: checkPhone._id }).exec();
                if (checkPhone.account_info.type == "user") {
                    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                        businessFunctions.logs("DEBUG :- Account type :- user, OTP sent:" + data.otp + ", " + " On contact_no:" + req.body.contact_no);
                    }
                    // console.log("User = " + user)
                    event.otpCarEgaer(user);
                    // event.otpSmsMail(user);
                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "OTP sent",
                        responseData: {
                            otp: data.otp,
                            status: "Active",
                            user: user
                        }
                    });
                } else if (checkPhone.account_info.type == "business") {
                    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                        businessFunctions.logs("DEBUG:- Account type:business ");
                    }

                    if (checkPhone.account_info.phone_verified) {
                        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                            businessFunctions.logs("DEBUG: Account type:business, " + " " + "Account Verification Status:Verified Account");
                        }
                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Verified Account",
                            responseData: {
                                otp: data.otp,
                                status: "Active",
                                user: user
                            }
                        });
                    } else {
                        if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
                            businessFunctions.logs("WARNING: Account Verification Status:Verification Required," + " " + " for contact_no:" + req.body.contact_no);
                        }
                        event.otpSms(user)
                        // event.otpSmsMail(user)
                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Verification Required",
                            responseData: {
                                otp: data.otp,
                                status: user.account_info.status,
                                user: user
                            }
                        });
                    }
                }

            });

        }
        else {
            if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("INFO :New," + " " + " contact_no:" + req.body.contact_no);
            }
            res.status(200).json({
                responseCode: 200,
                responseMessage: "success",
                responseData: {
                    status: "New",
                    user: {}
                },
            });
        }
    }
});

router.post('/phone/verification', async function (req, res, next) {
    businessFunctions.logs("INFO :/phone/verification Api called from common.js," + " " + "Request Body:" + JSON.stringify(req.body));

    var rules = {
        id: 'required',
        otp: 'required'
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR :Validation failed, Cannot get required Values in req.body.")
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
        var otp = parseInt(req.body.otp);
        var checkUser = await User.findOne({ otp: otp, _id: req.body.id }).exec();
        if (!checkUser) {
            if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
                businessFunctions.logs("WARNING: OTP not matched," + " " + "OTP :" + otp + ", " + "for user:" + req.body.id)
            }
            res.status(400).json({
                responseCode: 400,
                responseMessage: "OTP not matched",
                responseData: {}
            });
        }
        else {
            if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("DEBUG:Phone Verified," + " " + "OTP:" + otp + ", " + "for user:" + req.body.id)
            }

            var data = {
                "type": checkUser.account_info.type,
                "phone_verified": true,
                "status": "Active"
            };

            User.findOneAndUpdate({ _id: req.body.id }, { $set: { account_info: data, otp: null } }, async function (err, doc) {
                if (err) {
                    if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                        businessFunctions.logs("ERROR: Error Occured in Updating Data into Database," + " " + "For User:" + req.body.id + ", " + "Data:" + JSON.stringify(data))
                    }
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Error Occured",
                        responseData: {}
                    });
                }
                else {
                    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                        businessFunctions.logs("DEBUG: Data Updated Successfully," + " " + "For User:" + req.body.id + ", " + "Data:" + JSON.stringify(data))
                    }
                    var updated = await User.findOne({ _id: req.body.id }).exec();
                    const payload = {
                        user: updated._id
                    };

                    var token = jwt.sign(payload, secret);


                    var deviceInfo = {
                        deviceId: req.headers['deviceid'],
                        token: token,
                        fcmId: "",
                        app: req.headers['app'],
                        deviceType: req.headers['devicetype'],
                        deviceModel: req.headers['devicemodel'],
                        created_at: new Date(),
                    };



                    User.findOneAndUpdate({ _id: updated._id }, {
                        $set: {
                            "device": deviceInfo
                        }
                    }, { new: true }, async function (err, doc) {
                        if (err) {
                            if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                                businessFunctions.logs("ERROR: Something wrong when updating data," + " " + "For User:" + updated._id + ", " + "Data:" + JSON.stringify(deviceInfo))
                            }
                            var status_code = 422;
                            var response = {
                                responseCode: 422,
                                responseMessage: "failure",
                                responseData: "Something wrong when updating data",
                            }
                        }
                        else {
                            if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                                businessFunctions.logs("DEBUG: Data Updated Successfully," + " " + "For User:" + updated._id + ", " + "Data:" + JSON.stringify(deviceInfo))
                            }
                            var user = await User.findOne({ _id: updated._id }).exec();
                            if (user.account_info.type == "business") {
                                var checkManagement = await Management.find({ user: user._id }).count().exec();

                                if (checkManagement == 0) {
                                    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                                        businessFunctions.logs("DEBUG: Creating User," + " " + "For User:" + user._id)
                                    }
                                    Management.create({
                                        user: user._id,
                                        business: user._id,
                                        role: "Admin",
                                        department: "Management",
                                        created_at: new Date(),
                                        updated_at: new Date()
                                    }).then(function (management) {
                                        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                                            businessFunctions.logs("DEBUG: OTP Verified," + " " + "For User:" + user._id + ", " + "Data:" + JSON.stringify([management]))
                                        }
                                        res.status(200).json({
                                            responseCode: 200,
                                            responseMessage: "OTP verified",
                                            responseData: {
                                                token: token,
                                                user: user,
                                                management: [management]
                                            }
                                        });
                                    });
                                }
                                else {
                                    var management = await Management.find({ user: user._id }).exec();

                                    var json = ({
                                        responseCode: 200,
                                        responseMessage: "OTP verified",
                                        responseData: {
                                            token: token,
                                            user: user,
                                            management: management
                                        }
                                    });
                                    res.status(200).json(json)
                                    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                                        businessFunctions.logs("DEBUG: OTP Verified," + " " + "For User:" + user._id)
                                    }
                                }
                            }
                            else {
                                if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                                    businessFunctions.logs("DEBUG: checkWelcomePoint," + " " + "For User:" + updated._id)
                                }
                                var checkWelcomePoint = await Point.find({ user: user._id, tag: "welcome" }).count().exec();
                                if (checkWelcomePoint == 0) {
                                    if (user.agent) {
                                        if (user.agent.agent == true) {
                                            var point = {
                                                user: user._id,
                                                points: 100,
                                                activity: "coin",
                                                tag: "welcome",
                                                source: null,
                                                status: true
                                            };
                                            if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                                                businessFunctions.logs("DEBUG: addPoints(point) function called.")
                                            }
                                            fun.addPoints(point);
                                        }
                                    }
                                    else {
                                        var point = {
                                            user: user._id,
                                            points: 250,
                                            activity: "coin",
                                            tag: "welcome",
                                            source: null,
                                            status: true
                                        };
                                        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                                            businessFunctions.logs("DEBUG: addPoints(point) function called.")
                                        }
                                        fun.addPoints(point);
                                    }
                                }

                                var checkReferral = await Referral.findOne({ user: user._id }).exec();
                                if (checkReferral) {
                                    var referalOwner = await User.findById(checkReferral.owner).exec();
                                    if (referalOwner && referalOwner.account_info.type == "user") {
                                        if (referalOwner.careager_cash <= 10000) {
                                            var checkPreviousReferral = await Point.find({ user: checkReferral.owner, tag: "referNEarn" }).count().exec();

                                            if (checkPreviousReferral == 0) {
                                                var point = {
                                                    user: checkReferral.owner,
                                                    activity: "coin",
                                                    tag: "referNEarn",
                                                    points: 250,
                                                    source: user._id,
                                                    status: true
                                                };

                                                fun.addPoints(point);
                                            }
                                            else {
                                                var checkRefree = await Point.find({ user: checkReferral.owner, tag: "referNEarn", source: user._id }).count().exec();

                                                if (checkRefree == 0) {
                                                    event.referralSms(referalOwner, user);
                                                    var point = {
                                                        user: checkReferral.owner,
                                                        points: 100,
                                                        activity: "coin",
                                                        tag: "referNEarn",
                                                        source: user._id,
                                                        status: true
                                                    };

                                                    fun.addPoints(point);
                                                }
                                            }

                                            User.findOneAndUpdate({ _id: user._id }, { $set: { "account_info.added_by": checkReferral.owner } }, async function (err, doc) {
                                            });
                                        }
                                    }
                                    else {
                                        var checkWelcomePoint = await Point.find({ user: user._id, tag: "welcome" }).count().exec();
                                        if (checkWelcomePoint == 0) {
                                            var point = {
                                                user: user._id,
                                                points: 500,
                                                activity: "coin",
                                                tag: "welcome",
                                                source: null,
                                                status: true
                                            }
                                            fun.addPoints(point);
                                        }
                                    }
                                }
                                /*else
                                {
                                    var point = {
                                        user:user._id,
                                        points: 100,
                                        activity: "coin",
                                        tag: "welcome",
                                        source: null,
                                        status: true
                                    }

                                    fun.addPoints(point);
                                }*/

                                var json = ({
                                    responseCode: 200,
                                    responseMessage: "OTP verified",
                                    responseData: {
                                        token: token,
                                        user: user
                                    }
                                });
                                res.status(200).json(json)
                                if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                                    businessFunctions.logs("DEBUG: OTP verified," + " " + "for user:" + user)
                                }
                            }
                        }
                    });
                }
            });
        }
    }
});

router.post('/request/token', async function (req, res, next) {
    businessFunctions.logs("INFO : /request/token Api called from common.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));
    var checkUser = await User.findOne({ _id: req.body.id }).exec();
    const payload = {
        user: checkUser._id
    };

    var token = jwt.sign(payload, secret);

    var deviceInfo = {
        deviceId: req.headers['deviceid'],
        token: token,
        fcmId: "",
        app: req.headers['app'],
        deviceType: req.headers['devicetype'],
        deviceModel: req.headers['devicemodel']
    };
    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Update Device Info, pull deviceId," + " " + "for user:" + checkUser._id + ", " + "Data:" + JSON.stringify(deviceInfo))
    }
    await User.update(
        { '_id': checkUser._id, 'device.deviceType': deviceInfo.deviceType, 'device.deviceId': deviceInfo.deviceId },
        {
            "$pull": {
                "device": { "deviceId": deviceInfo.deviceId }
            }
        }
    );
    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Update Device Info push deviceInfo," + " " + "for user:" + checkUser._id + ", " + "Data:" + JSON.stringify(deviceInfo))
    }

    User.findOneAndUpdate({ _id: checkUser._id }, {
        $push: {
            "device": deviceInfo
        }
    }, { new: true }, async function (err, doc) {
        if (err) {
            if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                businessFunctions.logs("ERROR: Server Error while Updating Data," + " " + "for user:" + checkUser._id + ", " + "Device Info:" + JSON.stringify(deviceInfo))
            }
            res.status(422).json({
                responseCode: 422,
                responseMessage: "Server Error",
                responseData: err,
            });
        }
        else {
            if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("DEBUG: Device Info Updated Successfully," + " " + "for user:" + checkUser._id + ", " + "Device Info:" + JSON.stringify(deviceInfo))
            }
            var user = await User.findOne({ _id: checkUser._id }).exec();
            if (user.account_info.type == "business") {
                var management = await Management.find({ user: user._id }).exec();
                if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                    businessFunctions.logs("DEBUG: user:" + checkUser._id + ", " + "Account Type:business" + ", " + "Response Body :" + management)
                }
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "",
                    responseData: {
                        token: token,
                        user: user,
                        management: management
                    }
                });
            }
            else {
                if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                    businessFunctions.logs("DEBUG:user:" + checkUser._id + ", " + "Account Type:business" + ", " + "Response Body:" + user)
                }
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "",
                    responseData: {
                        token: token,
                        user: user
                    }
                });
            }
        }
    });
});

router.post('/request/otp', async function (req, res, next) {
    businessFunctions.logs("INFO : /request/otp Api called from common.js," + " " + "Request Body:" + JSON.stringify(req.body));
    var rules = {
        contact_no: 'required',
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR: Validation Failed Contact_no is required.")
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
        var otp = Math.floor(Math.random() * 90000) + 10000;

        var data = {
            otp: otp
        };

        var type = 'user';
        if (req.body.type) {
            type = req.body.type;
        }
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: find user:" + req.body.contact_no)
        }
        var user = await User.findOne({ contact_no: req.body.contact_no, "account_info.type": type }).exec();

        if (user) {
            User.findOneAndUpdate({ _id: user._id }, { $set: data }, { new: true }, async function (err, doc) {
                if (err) {
                    if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                        businessFunctions.logs("ERROR: Error occured while updating data," + " " + "for user: " + user._id + " " + "Data:" + JSON.stringify(data))
                    }
                    var json = ({
                        responseCode: 400,
                        responseMessage: "Error occured",
                        responseData: {}
                    });
                    res.status(400).json(json)
                }

                var updateUser = await User.findOne({ contact_no: req.body.contact_no, "account_info.type": type }).exec();
                if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                    businessFunctions.logs("DEBUG: otpCarEgaer(updateUser) function called ")
                }
                event.otpCarEgaer(updateUser);
                // event.otpSmsMail(updateUser);

                if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                    businessFunctions.logs("INFO: OTP Sent," + " " + "contact_no:" + req.body.contact_no)
                }
                var json = ({
                    responseCode: 200,
                    responseMessage: "OTP Sent",
                    responseData: {}
                });
                res.status(200).json(json)
            });
        }
        else {
            if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
                businessFunctions.logs("WARNING:User Not Found," + " " + "contact_no:" + req.body.contact_no)
            }
            var json = ({
                responseCode: 400,
                responseMessage: "User Not Found",
                responseData: {}
            });

            res.status(400).json(json)
        }
    }
});


router.post('/login', async function (req, res, next) {
    businessFunctions.logs("INFO:/login Api Called from common.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

    var count = await User.findOne({
        contact_no: req.body.contact_no,
    }).count().exec();
    // console.log("Login Apii")
    if (count != 0) {
        var checkPhone = await User.findOne({ contact_no: req.body.contact_no, 'account_info.type': req.body.type }).exec();
        if (checkPhone) {
            if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("DEBUG: User Found," + " " + "contact_no:" + req.body.contact_no)
            }
            // console.log("checkPhone = " + checkPhone._id)
            if (checkPhone.account_info.status == "Active") {
                if (!bcrypt.compareSync(req.body.password, checkPhone.password)) {
                    if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
                        businessFunctions.logs("Warning:Authentication failed, Wrong password");
                    }
                    res.status(400).json({
                        responseCode: 400,
                        responseMessage: "Authentication failed. Wrong password",
                        responseData: {},
                    });
                }
                else {
                    var countType = await User.findOne({ contact_no: req.body.contact_no, 'account_info.type': req.body.type }).count().exec();
                    if (countType == 0) {
                        if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
                            businessFunctions.logs("Warning:This Phone Number is already registered as a User" + ", " + "Phone Number:" + req.body.contact_no);
                        }
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
                        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10) {
                            businessFunctions.logs("DEBUG: Updating device info " + " " + "for user -" + checkPhone._id)
                        }
                        await User.findOneAndUpdate({ _id: checkPhone._id }, {
                            $set: {
                                "device": deviceInfo
                            }
                        }, { new: true }, async function (err, doc) {
                            if (err) {
                                if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                                    businessFunctions.logs("ERROR:Something wrong when updating data," + " " + "for user:" + checkPhone._id + "" + "device Info:" + JSON.stringify(deviceInfo));
                                }
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
                                    // console.log("TYpe User")
                                    if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                                        businessFunctions.logs("INFO:user logged in successfully," + " " + "Phone Number:" + req.body.contact_no + ", " + "Account Type:user");
                                    }
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
                                    if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                                        businessFunctions.logs("INFO:user logged in successfully," + " " + "Phone Number:" + req.body.contact_no + ", " + "Account Type:business");
                                    }
                                    var management = await Management.find({ user: update._id }).exec();
                                    // console.log("TYpe business = " + JSON.stringify(management))
                                    // console.log("Business  = " + JSON.stringify(management, null, '\t'))
                                    // console.log("Business = "+)
                                    var checkPlan = await BusinessPlan.findOne({ business: management[0].business }).exec();
                                    // console.log("Plan  = " + JSON.stringify(checkPlan, null, '\t'))
                                    var paln = {}
                                    if (checkPlan) {
                                        var plan = {
                                            category: checkPlan.category,
                                            short_name: checkPlan.category,
                                            plan: checkPlan.plan,
                                            name: checkPlan.name,
                                        }
                                    }

                                    res.status(200).json({
                                        responseCode: 200,
                                        responseMessage: "sucess",
                                        responseData: {
                                            status: "Active",
                                            token: token,
                                            user: update,
                                            management: management,
                                            plan: plan

                                        }
                                    })
                                }

                                else if (update.account_info.type == "admin") {
                                    // console.log("TYpe admin")
                                    if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                                        businessFunctions.logs("INFO:user logged in successfully," + " " + "Phone Number:" + req.body.contact_no + ", " + "Account Type:admin");
                                    }
                                    res.status(200).json({
                                        responseCode: 200,
                                        responseMessage: "sucess",
                                        responseData: {
                                            status: "Active",
                                            token: token,
                                            user: update,
                                            // plan: plan,
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
                    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                        businessFunctions.logs("DEBUG: otpCarEgaer(user) function called from common.js ");
                    }
                    event.otpCarEgaer(user);
                    // event.otpSmsMail(user);
                    if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                        businessFunctions.logs("INFO: OTP Sent to the user" + ", " + "Account Status:complete");
                    }
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
                // var checkPlan = await BusinessPlan.findOne({ business: checkPhone._id, }).exec();
                // var paln = {}
                // if (checkPlan) {
                //     var plan = {
                //         category: checkPlan.category,
                //         short_name: checkPlan.category,
                //         plan: checkPlan.plan,
                //         name: checkPlan.name,
                //     }
                // }
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "success",
                    responseData: {
                        status: checkPhone.account_info.status,
                        user: checkPhone,
                        // plan: plan
                    }
                });
            }
        }
    }
    else {
        if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("WARNING:The phone number doesn't match any account," + " " + "Phone Number:" + req.body.contact_no);
        }

        res.status(400).json({
            responseCode: 400,
            responseMessage: "The phone number that you've entered doesn't match any account.",
            responseData: {},
        })
    }
});

router.post('/login-with-otp', async function (req, res, next) {
    businessFunctions.logs("INFO:/login-with-otp Api Called from common.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));
    var rules = {
        contact_no: 'required',
        otp: 'required'
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR:Validation failed, Contact_no and OTP are required");
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
        var type = "user";
        if (req.body.type) {
            type = req.body.type;
        }
        // console.log("Type Of Account = " + type)
        var otp = parseInt(req.body.otp);
        var checkUser = await User.findOne({ otp: otp, contact_no: req.body.contact_no, 'account_info.type': type }).exec();
        if (!checkUser) {
            if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("WARNING:OTP not matched," + " " + "Phone Number:" + req.body.contact_no + ", " + "Unmatched OTP:" + otp);
            }
            res.status(400).json({
                responseCode: 400,
                responseMessage: "OTP not matched",
                responseData: {}
            });
        }
        else {
            if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("INFO: OTP Verified," + " " + "Phone Number:" + req.body.contact_no);
            }
            var data = {
                otp: otp,
                account_info: {
                    phone_verified: true,
                    status: 'Active',
                    approved_by_admin: checkUser.account_info.approved_by_admin,
                    verified_account: checkUser.account_info.verified_account,
                    added_by: checkUser.account_info.added_by,
                    type: checkUser.account_info.type,
                    // is_page: user.account_info.is_page,
                }
            };
            User.findOneAndUpdate({ contact_no: req.body.contact_no, 'account_info.type': type }, { $set: data }, async function (err, doc) {
                if (err) {
                    if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                        businessFunctions.logs("ERROR:Error Occured while updating user account info.");
                    }
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Error Occured",
                        responseData: {}
                    });
                }
                else {
                    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                        businessFunctions.logs("DEBUG:Account info updated successfully.");
                    }
                    var updated = await User.findOne({ _id: checkUser._id }).exec();
                    const payload = {
                        user: updated._id
                    };

                    var token = jwt.sign(payload, secret);

                    var deviceInfo = [];

                    deviceInfo = _.filter(updated.device, device => device.deviceId != req.headers['deviceid']);

                    deviceInfo.push({
                        deviceId: req.headers['deviceid'],
                        token: token,
                        fcmId: "",
                        app: req.headers['app'],
                        deviceType: req.headers['devicetype'],
                        deviceModel: req.headers['devicemodel']
                    });

                    User.findOneAndUpdate({ _id: updated._id }, {
                        $set: {
                            "device": deviceInfo
                        }
                    }, { new: true }, async function (err, doc) {
                        if (err) {
                            if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                                businessFunctions.logs("ERROR:Something wrong when updating device info," + " " + "for user:" + updated._id);
                            }
                            var status_code = 422;
                            var response = {
                                responseCode: 422,
                                responseMessage: "failure",
                                responseData: "Something wrong when updating data",
                            }
                        }
                        else {
                            var user = await User.findOne({ _id: updated._id }).exec();
                            if (user.account_info.type == "business") {
                                var business = await Management.find({ user: user._id }).exec();
                                if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                                    businessFunctions.logs("INFO: OTP Verified," + " " + "Phone Number:" + req.body.contact_no + ", " + "Account Type:business");
                                }
                                var json = ({
                                    responseCode: 200,
                                    responseMessage: "OTP verified",
                                    responseData: {
                                        token: token,
                                        user: user,
                                        business: business,
                                        management: business
                                    }
                                });
                                res.status(200).json(json)
                            }
                            else {
                                if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                                    businessFunctions.logs("INFO: OTP Verified," + " " + "Phone Number:" + req.body.contact_no);
                                }
                                var json = ({
                                    responseCode: 200,
                                    responseMessage: "OTP verified",
                                    responseData: {
                                        status: "Active",
                                        token: token,
                                        user: user
                                    }
                                });
                                res.status(200).json(json)
                            }
                        }
                    });
                }
            });
        }
    }
});

router.put('/fcm/update', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO:/fcm/update Api Called from common.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var user = await User.findById(decoded.user).exec();
    if (user) {
        var allDevices = [];
        if (req.body.deviceId) {
            allDevices = _.filter(user.device, device => device.deviceId != req.body.deviceId);

            allDevices.push({
                app: req.body.app,
                deviceId: req.body.deviceId,
                fcmId: req.body.fcmId,
                token: token,
                deviceType: req.body.deviceType,
                deviceModel: req.body.deviceModel
            });

            User.findOneAndUpdate({ _id: user._id }, {
                $set: {
                    device: allDevices
                }
            }, { new: false }, function (err, doc) {
                if (err) {
                    var status_code = 422;
                    var response = {
                        responseCode: 422,
                        responseMessage: "failure",
                        responseData: "Something wrong when updating data",
                    }
                }
                else {
                    var status_code = 200;
                    var response = {
                        responseCode: status_code,
                        responseMessage: "Device Added",
                        responseData: {},
                    }
                }

                res.status(status_code).json(response);
            });

        }
        else {
            var status_code = 200;
            var response = {
                responseCode: status_code,
                responseMessage: "'deviceid' Required",
                responseData: {},
            }
            res.status(status_code).json(response);
        }
    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "User not found",
            responseData: {},
        });
    }
});

router.put('/account/terminate', xAccessToken.token, function (req, res, next) {
    businessFunctions.logs("INFO:/account/terminate Api Called from common.js," + " " + "Request Headers:" + JSON.stringify(req.headers));
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG :find user:" + decoded.user);
    }
    User.findOneAndUpdate({ _id: decoded.user }, { $set: { "account_info.status": "Terminate", device: [], updated_at: new Date() } }, { new: true }, async function (err, doc) {
        if (err) {
            if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                businessFunctions.logs("ERROR :Error occured in updating the details, Details:Status-Terminate," + " " + "for user:" + decoded.user);
            }
            var json = ({
                responseCode: 400,
                responseMessage: "Error occured",
                responseData: {}
            });

            res.status(400).json(json)
        } else {
            if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("INFO :Account has been deactivated");
            }
            var json = ({
                responseCode: 200,
                responseMessage: "Account has been deactivated",
                responseData: {}
            });
            res.status(200).json(json)
        }
    });
});

router.put('/avatar/update', xAccessToken.token, function (req, res, next) {
    var rules = {
        media: 'required',
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "media required",
            responseData: {
                res: validation.errors.all()
            }
        })
    }
    else {
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);

        var base64 = req.body.media;
        // console.log(base64)

        const base64Data = new Buffer(base64.replace(/^data:image\/\w+;base64,/, ""), 'base64')
        const type = base64.split(';')[0].split('/')[1];
        var file = uuidv1() + '.' + type;

        const params = {
            Bucket: config.BUCKET_NAME + '/avatar',
            Key: file,
            Body: base64Data,
            ACL: 'public-read',
            ContentEncoding: 'base64', // required
            ContentType: 'image/' + type // required. Notice the back ticks
        }

        s3.upload(params, (err, data) => {
            if (err) {
                var json = ({
                    responseCode: 400,
                    responseMessage: "Error occured",
                    responseData: {}
                });
                res.status(400).json(json)
            }
            else {
                var set = {
                    avatar: file,
                };

                User.findOneAndUpdate({ _id: decoded.user }, { $set: set }, { new: true }, async function (err, doc) {

                    if (err) {
                        var json = ({
                            responseCode: 400,
                            responseMessage: "Error occured",
                            responseData: {}
                        });

                        res.status(400).json(json)
                    } else {
                        var checkUser = await User.findById(decoded.user).exec();
                        var json = ({
                            responseCode: 200,
                            responseMessage: "avatar has been updated",
                            responseData: {
                                avatar_address: checkUser.avatar_address
                            }
                        });
                        res.status(200).json(json)
                    }
                });
            }
        });
    }
});

router.put('/username/update', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    const count = await User.count({ _id: decoded.user }).exec();

    if (count == 1) {
        var data = {
            username: req.body.username,
        };

        var rules = {
            username: 'required|max:15',
        };

        var validation = new Validator(req.body, rules);

        if (validation.fails()) {
            res.status(422).json({
                responseCode: 422,
                responseMessage: "Error",
                responseData: {
                    res: validation.errors.all()
                }
            });
        }
        else {
            var format = /[ !@#$%^&*()+\-=\[\]{};':"\\|,<>\/?]/;

            if (format.test(req.body.username)) {
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Username is not appropriate",
                    responseData: {}
                });
            }
            else {
                var checkUsername = await User.find({ username: req.body.username }).collation({ locale: 'en', strength: 2 }).count().exec();
                if (checkUsername == 0) {
                    User.findOneAndUpdate({ _id: decoded.user }, { $set: data }, { new: true }, function (err, doc) {
                        if (err) {
                            var json = ({
                                responseCode: 400,
                                responseMessage: "Username already taken",
                                responseData: err
                            });

                            res.status(400).json(json)
                        } else {
                            var json = ({
                                responseCode: 200,
                                responseMessage: "Username has been updated",
                                responseData: {}
                            });
                            res.status(200).json(json)
                        }
                    })
                }
                else {
                    var json = ({
                        responseCode: 400,
                        responseMessage: "Username already taken",
                        responseData: {}
                    });

                    res.status(400).json(json)
                }
            }
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

router.get('/user/get', async function (req, res, next) {
    var rules = {
        query: 'required',
        by: 'required'
    };

    var validation = new Validator(req.query, rules);

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
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var user = null;

        if (req.query.type == "driver") {
            var type = "user"
        }
        else if (req.query.type == "business") {
            var type = "business"
        }
        else if (req.query.type == "surveyor") {
            var type = "user"
        }
        else {
            var type = "user"
        }

        if (req.query.by == "contact_no") {
            var user = await User.findOne({ contact_no: req.query.query, 'account_info.type': type }).exec();
        }
        else if (req.query.by == "username") {
            var user = await User.findOne({ username: req.query.query, 'account_info.type': type }).exec();
        }
        else if (req.query.by == "id") {
            var user = await User.findOne({ _id: req.query.query, 'account_info.type': type }).exec();
        }

        if (user) {
            var email = "";
            if (user.email) {
                email = user.email
            }

            var bookings = [];
            await Booking.find({ status: { $in: ["Approved", "Confirmed", "Pending", "Approval", "Failure", "Failed", "EstimateRequested"] }, is_services: true, user: user._id })
                .populate({ path: 'user', select: "_id id name contact_no email" })
                .populate({ path: 'manager', populate: { path: 'user', select: "_id id name contact_no" } })
                .populate({ path: 'car', select: '_id id title registration_no ic rc', populate: { path: 'thumbnails' } })
                .cursor().eachAsync(async (booking) => {
                    var address = await Address.findOne({ _id: booking.address }).exec();
                    if (booking.car) {
                        if (booking.car.thumbnails[0]) {
                            var thumbnail = [booking.car.thumbnails[0]];
                        }
                        else {
                            var thumbnail = []
                        }

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
                        var car = null
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
                            contact_no: booking.user.contact_no
                        },
                        manager: manager,
                        services: booking.services,
                        convenience: booking.convenience,
                        date: moment(booking.date).tz(req.headers['tz']).format('ll'),
                        time_slot: booking.time_slot,
                        status: _.startCase(booking.status),
                        booking_no: booking.booking_no,
                        address: address,
                        payment: booking.payment,
                        customer_requirements: booking.customer_requirements,
                        estimation_requested: booking.estimation_requested,
                        txnid: booking.txnid,
                        __v: booking.__v,
                        created_at: booking.created_at,
                        updated_at: booking.updated_at,
                    });
                });

            var data = {
                _id: user._id,
                id: user.id,
                name: user.name,
                username: user.username,
                email: email,
                contact_no: user.contact_no,
                avatar_address: user.avatar_address,
                avatar: user.avatar,
                account_info: user.account_info,
                bookings: bookings
            };

            res.status(200).json({
                responseCode: 200,
                responseMessage: "success",
                responseData: data
            })
        }
        else {
            res.status(200).json({
                responseCode: 200,
                responseMessage: "Customer not found",
                responseData: {}
            })
        }
    }
});

router.get('/users/get', async function (req, res, next) {
    businessFunctions.logs("INFO: /users/get Api Called from common.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    var rules = {
        query: 'required',
    };

    var validation = new Validator(req.query, rules);

    if (validation.fails()) {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR: Validation failed, query is required.");
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
        var data = [];
        // , business: business
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Validated successfully and Fatching user details, " + "contact_no:" + req.body.query);
        }
        await User.find({ contact_no: req.query.query })
            .cursor().eachAsync(async (user) => {
                var bookings = [];
                await Booking.find({ status: { $in: ["Approved", "Confirmed", "Pending", "Approval", "Failure", "Failed", "EstimateRequested"] }, is_services: true, user: user._id })
                    .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no email address" } })
                    .populate({ path: 'manager', populate: { path: 'user', select: "_id id name contact_no" } })
                    .populate({ path: 'car', select: '_id id title registration_no ic rc', populate: { path: 'thumbnails' } })
                    .cursor().eachAsync(async (booking) => {
                        var address = await Address.findOne({ _id: booking.address }).exec();
                        if (booking.car) {
                            if (booking.car.thumbnails[0]) {
                                var thumbnail = [booking.car.thumbnails[0]];
                            }
                            else {
                                var thumbnail = []
                            }

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
                            var car = null
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
                                contact_no: booking.user.contact_no
                            },
                            manager: manager,
                            services: booking.services,
                            convenience: booking.convenience,
                            date: moment(booking.date).tz(req.headers['tz']).format('ll'),
                            time_slot: booking.time_slot,
                            status: _.startCase(booking.status),
                            booking_no: booking.booking_no,
                            address: address,
                            payment: booking.payment,
                            customer_requirements: booking.customer_requirements,
                            estimation_requested: booking.estimation_requested,
                            txnid: booking.txnid,
                            __v: booking.__v,
                            created_at: booking.created_at,
                            updated_at: booking.updated_at,
                        });
                    });

                data.push({
                    _id: user._id,
                    id: user.id,
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    contact_no: user.contact_no,
                    avatar_address: user.avatar_address,
                    avatar: user.avatar,
                    address: user.address,
                    account_info: user.account_info,
                    bookings: bookings
                });
            });

        if (data.length > 0) {
            res.status(200).json({
                responseCode: 200,
                responseMessage: "success",
                responseData: data
            })
            if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("INFO: User details sends in response successfully, " + "contact_no:" + req.query.query);
            }
        }
        else {
            if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("INFO: No user found, " + "contact_no:" + req.query.query);
            }
            res.status(200).json({
                responseCode: 200,
                responseMessage: data.length,
                responseData: []
            })
        }
    }
});

router.get('/users/search', xAccessToken.token, async function (req, res, next) {
    var rules = {
        query: 'required',
    };

    var validation = new Validator(req.query, rules);

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
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var user = decoded.user;
        var business = req.headers['business'];
        var peoples = [];

        if (req.query.page == undefined) {
            var page = 0;
        } else {
            var page = req.query.page;
        }
        var page = Math.max(0, parseInt(page));
        req.query.query = req.query.query.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");

        var query = req.query.query;

        if (query.length >= 3) {
            var by = ['user', 'business'];
            if (req.query.by) {
                var by = [req.query.by.toLowerCase()];
            }

            await User.find({
                "account_info.status": "Active",
                "account_info.type": { $in: by },
            })
                .or([
                    {
                        $or: [
                            { 'name': { $regex: new RegExp(query, 'i') } },
                            { 'contact_no': { $regex: new RegExp(query, 'i') } }
                        ]
                    }
                ])
                .select('name username avatar avatar_address contact_no email account_info')
                .sort({ created_at: -1 })
                .cursor().eachAsync(async (user) => {
                    peoples.push({
                        _id: user._id,
                        id: user._id,
                        name: user.name,
                        username: user.username,
                        email: user.email,
                        contact_no: user.contact_no,
                        avatar_address: user.avatar_address,
                        account_info: user.account_info,
                        address: user.address,
                        created_at: user.created_at,
                        updated_at: user.updated_at,
                        joined: moment(user.created_at).tz(req.headers['tz']).format('ll'),
                    });
                });
        }

        res.status(200).json({
            responseCode: 200,
            responseInfo: {
                totalResult: peoples.length,
                query: by
            },
            responseMessage: "",
            responseData: peoples,
        });
    }
});

router.post('/phone/check', xAccessToken.token, async function (req, res, next) {
    var rules = {
        contact_no: 'required',
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
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);

        const user = await User.findOne({ _id: decoded.user }).exec();

        if (user) {
            const isItMe = await User.count({ _id: decoded.user, contact_no: req.body.contact_no }).count().exec();
            if (isItMe == 0) {
                const check = await User.count({ _id: { $ne: decoded.user }, contact_no: req.body.contact_no }).count().exec();
                if (check == 0) {
                    var data = {
                        user: user._id,
                        new: req.body.contact_no,
                        contact_no: req.body.contact_no,
                        existing: user.contact_no,
                        otp: Math.floor(Math.random() * 90000) + 10000,
                        created_at: new Date(),
                        updated_at: new Date(),
                        email: user.email
                    };

                    UpdatePhone.create(data).then(async function (doc) {

                        event.otpCarEgaer(data);
                        // event.otpSmsMail(data);

                        var json = ({
                            responseCode: 200,
                            responseMessage: "Verify Your Phone",
                            responseData: {
                                id: doc._id,
                                contact_no: doc.new
                            }
                        });
                        res.status(200).json(json)

                    });
                }
                else {
                    var json = ({
                        responseCode: 400,
                        responseMessage: "Phone number already taken",
                        responseData: {}
                    });

                    res.status(400).json(json)
                }
            }
            else {
                var json = ({
                    responseCode: 400,
                    responseMessage: "You are trying change existing number.",
                    responseData: {}
                });
                res.status(400).json(json)
            }

        } else {
            var json = ({
                responseCode: 400,
                responseMessage: "Invalid user",
                responseData: {}
            });

            res.status(400).json(json)
        }
    }
});

router.put('/phone/update', xAccessToken.token, async function (req, res, next) {
    var rules = {
        id: 'required',
        contact_no: 'required',
        otp: 'required'
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
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);

        const user = await User.findOne({ _id: decoded.user }).exec();

        if (user) {
            const checkOTP = await UpdatePhone.findOne({
                _id: req.body.id,
                user: decoded.user,
                status: false,
                new: req.body.contact_no,
                otp: parseInt(req.body.otp)
            }).exec();
            if (checkOTP) {
                var data = {
                    contact_no: req.body.contact_no,
                    otp: null,
                };

                UpdatePhone.findOneAndUpdate({ _id: req.body.id }, { $set: { status: true } }, function (err, doc) { });

                User.findOneAndUpdate({ _id: decoded.user }, { $set: data }, function (err, doc) {
                    if (err) {
                        var json = ({
                            responseCode: 400,
                            responseMessage: "Phone number already taken",
                            responseData: err
                        });

                        res.status(400).json(json)
                    } else {

                        const payload = {
                            user: user._id
                        };

                        var token = jwt.sign(payload, secret);

                        var json = ({
                            responseCode: 200,
                            responseMessage: "OTP verified",
                            responseData: {
                                token: token,
                                user: user
                            }
                        });
                        res.status(200).json(json)
                    }
                });
            }
            else {
                var json = ({
                    responseCode: 400,
                    responseMessage: "Wrong OTP",
                    responseData: {}
                });

                res.status(400).json(json)
            }
        } else {
            var json = ({
                responseCode: 400,
                responseMessage: "Invalid user",
                responseData: {}
            });

            res.status(400).json(json)
        }
    }
});

router.put('/email/update', xAccessToken.token, async function (req, res, next) {
    var rules = {
        email: 'required',
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
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);

        const count = await User.count({ _id: decoded.user }).exec();

        if (count == 1) {
            var data = {
                email: req.body.email,
            };

            var rules = {
                email: 'required',
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
                var format = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

                if (format.test(req.body.email)) {
                    User.findOneAndUpdate({ _id: decoded.user }, { $set: data }, { new: true }, function (err, doc) {
                        if (err) {
                            var json = ({
                                responseCode: 400,
                                responseMessage: "Email already taken",
                                responseData: err
                            });

                            res.status(400).json(json)
                        } else {
                            var json = ({
                                responseCode: 200,
                                responseMessage: "Email has been updated",
                                responseData: {}
                            });
                            res.status(200).json(json)
                        }
                    })

                }
                else {
                    res.status(400).json({
                        responseCode: 400,
                        responseMessage: "Email is not appropriate",
                        responseData: {}
                    });
                }
            }
        } else {
            var json = ({
                responseCode: 400,
                responseMessage: "Invalid user",
                responseData: {}
            });

            res.status(400).json(json)
        }
    }
});

router.put('/profile/update', xAccessToken.token, async function (req, res, next) {
    var rules = {
        name: 'required',
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
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);

        const count = await User.count({ _id: decoded.user }).exec();

        if (count == 1) {
            var data = {
                name: req.body.name,
                email: req.body.email,
                "optional_info.overview": req.body.overview,
            };


            var format = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

            if (format.test(req.body.email)) {
                User.findOneAndUpdate({ _id: decoded.user }, { $set: data }, { new: true }, function (err, doc) {
                    if (err) {
                        var json = ({
                            responseCode: 422,
                            responseMessage: "Server Error",
                            responseData: err
                        });

                        res.status(422).json(json)
                    }
                    else {
                        var json = ({
                            responseCode: 200,
                            responseMessage: "Saved",
                            responseData: {}
                        });
                        res.status(200).json(json)
                    }
                })

            }
            else {
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Email is not appropriate",
                    responseData: {}
                });
            }

        } else {
            var json = ({
                responseCode: 400,
                responseMessage: "Invalid user",
                responseData: {}
            });

            res.status(400).json(json)
        }
    }
});

//Use Password
router.put('/password/change', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    const count = await User.count({ _id: decoded.user }).exec();

    if (count == 1) {
        var data = {
            password: req.body.password,
            old_password: req.body.old_password
        };

        var rules = {
            old_password: 'required',
            password: 'required',
        };

        var validation = new Validator(req.body, rules);

        if (validation.fails()) {
            res.status(422).json({
                responseCode: 422,
                responseMessage: "Password Required",
                responseData: {
                    res: validation.errors.all()
                }
            })
        } else {
            const user = await User.findById(decoded.user).exec();

            var newhash = bcrypt.hashSync(req.body.password);

            bcrypt.compare(req.body.old_password, user.password, function (err, status) {
                if (status == true) {
                    if (err) return next(err);


                    var device = _.filter(user.device, device => device.token == token);



                    var updateData = {
                        password: newhash,
                        device: device,
                        updated_at: new Date()
                    }

                    User.findOneAndUpdate({ _id: decoded.user }, { $set: updateData }, { new: true }, function (err, doc) {
                        if (err) {
                            var json = ({
                                responseCode: 422,
                                responseMessage: "Please Try Again",
                                responseData: err
                            });

                            res.status(422).json(json)
                        } else {
                            var json = ({
                                responseCode: 200,
                                responseMessage: "Password has been updated",
                                responseData: {}
                            });
                            res.status(200).json(json)
                        }
                    });
                } else {
                    var json = ({
                        responseCode: 422,
                        responseMessage: "Invalid current password",
                        responseData: '',
                    });

                    res.status(422).json(json)
                }
            });
        }
    } else {
        var json = ({
            responseCode: 422,
            responseMessage: "Invalid user",
            responseData: {}
        });

        res.status(422).json(json)
    }
});

router.put('/social-info/update', xAccessToken.token, function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var data = {
        socialite: {
            youtube: req.body.youtube,
            googleplus: req.body.googleplus,
            instagram: req.body.instagram,
            linkedin: req.body.linkedin,
            twitter: req.body.twitter,
            facebook: req.body.facebook,
            website: req.body.website,
        }
    }

    User.findOneAndUpdate({ _id: decoded.user }, { $set: data }, { new: true }, function (err, doc) {
        if (err) {
            var json = ({
                responseCode: 400,
                responseMessage: "Error occured",
                responseData: {}
            });

            res.status(400).json(json)
        } else {
            var json = ({
                responseCode: 200,
                responseMessage: "Social information has been updated",
                responseData: {}
            });
            res.status(200).json(json)
        }
    });
});

router.post('/forgot/password', async function (req, res, next) {
    businessFunctions.logs("INFO: /forgot/password Api called from common.js, Request Body:" + JSON.stringify(req.body))
    var rules = {
        contact_no: 'required',
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        businessFunctions.logs("INFO: validation failed, Contact no. is required to forgot password.")
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Phone no. required",
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
        var user = await User.findOne({ contact_no: req.body.contact_no, "account_info.type": req.body.type }).exec();
        if (user) {
            if (user.account_info.status == "Active") {
                User.findOneAndUpdate({ _id: user._id }, { $set: data }, { new: true }, async function (err, doc) {
                    if (err) {
                        var json = ({
                            responseCode: 400,
                            responseMessage: "Error occured",
                            responseData: {}
                        });

                        res.status(400).json(json)
                    }

                    updateUser = await User.findOne({ _id: user._id }).exec();
                    event.otpSms(updateUser);
                    event.otpSmsMail(updateUser);

                    var json = ({
                        responseCode: 200,
                        responseMessage: "OTP sent successfully",
                        responseData: {
                            id: user._id
                        }
                    });
                    res.status(200).json(json)
                });
            }
            else {
                var json = ({
                    responseCode: 400,
                    responseMessage: "Account is not verified!",
                    responseData: {}
                });

                res.status(400).json(json)
            }
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

router.post('/reset/password/otp/verification', async function (req, res, next) {
    businessFunctions.logs("INFO: /reset/password/otp/verification Api called from common.js, Request Body:" + JSON.stringify(req.body))
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
        var count = await User.find({ _id: req.body.id, otp: parseInt(req.body.otp) }).count().exec();

        if (count == 1) {



            var user = await User.findOne({ _id: req.body.id }).exec();
            res.status(200).json({
                responseCode: 200,
                responseMessage: "verified",
                responseData: {
                    user: user._id
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
router.post('/login-with-otp/xpress', async function (req, res, next) {
    var rules = {
        id: 'required',
        otp: 'required'
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
        var type = "user";
        if (req.body.type) {
            type = req.body.type;
        }
        var otp = parseInt(req.body.otp);
        var checkUser = await User.findOne({ _id: req.body.id, otp: otp, 'account_info.type': type }).exec();
        if (!checkUser) {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "OTP not matched",
                responseData: {}
            });
        }
        else {
            User.findOneAndUpdate({ _id: req.body.id, 'account_info.type': type }, { $set: { otp: null, "account_info.status": "Active", updated_at: new Date() } }, async function (err, doc) {
                if (err) {
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Error Occured",
                        responseData: {}
                    });
                }
                else {
                    var updated = await User.findOne({ _id: req.body.id }).exec();
                    const payload = {
                        user: updated._id
                    };

                    var token = jwt.sign(payload, secret);

                    var deviceInfo = [];

                    deviceInfo = _.filter(updated.device, device => device.deviceId != req.headers['deviceid']);

                    deviceInfo.push({
                        deviceId: req.headers['deviceid'],
                        token: token,
                        fcmId: "",
                        app: req.headers['app'],
                        deviceType: req.headers['devicetype'],
                        deviceModel: req.headers['devicemodel']
                    });

                    User.findOneAndUpdate({ _id: updated._id }, {
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
                            var user = await User.findOne({ _id: updated._id }).exec();
                            if (user.account_info.type == "business") {
                                var business = await Management.find({ user: user._id }).exec();
                                var json = ({
                                    responseCode: 200,
                                    responseMessage: "OTP verified",
                                    responseData: {
                                        token: token,
                                        user: user,
                                        business: business
                                    }
                                });
                                res.status(200).json(json)
                            }
                            else {
                                var json = ({
                                    responseCode: 200,
                                    responseMessage: "OTP verified",
                                    responseData: {
                                        status: "Active",
                                        token: token,
                                        user: user
                                    }
                                });
                                res.status(200).json(json)
                            }
                        }
                    });
                }
            });
        }
    }
});


router.post('/reset/password', async function (req, res, next) {
    var rules = {
        id: "required",
        type: "required",
        password: "required",
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
        var user = await User.findOne({ _id: req.body.id }).exec();
        if (user) {
            var updateData = {
                password: bcrypt.hashSync(req.body.password)
            }

            User.findOneAndUpdate({ _id: user._id }, { $set: updateData }, { new: true }, async function (err, doc) {
                if (err) {
                    var json = ({
                        responseCode: 400,
                        responseMessage: "Please Try Again",
                        responseData: err
                    });

                    res.status(400).json(json)
                }
                else {
                    // console.log("password")
                    var data = {
                        otp: null,
                        account_info: {
                            phone_verified: user.account_info.phone_verified,
                            status: 'Active',
                            approved_by_admin: user.account_info.approved_by_admin,
                            verified_account: user.account_info.verified_account,
                            added_by: user.account_info.added_by,
                            type: user.account_info.type,
                            // is_page: user.account_info.is_page,
                        }
                    };

                    User.findOneAndUpdate({ _id: user._id }, { $set: data }, function (err, doc) { });

                    const payload = {
                        user: user._id
                    };

                    var token = jwt.sign(payload, secret);

                    var deviceInfo = [];

                    deviceInfo.push({
                        deviceId: req.headers['deviceid'],
                        token: token,
                        fcmId: "",
                        app: req.headers['app'],
                        deviceType: req.headers['devicetype'],
                        deviceModel: req.headers['devicemodel']
                    });

                    User.findOneAndUpdate({ _id: user._id }, {
                        $set: {
                            "device": deviceInfo
                        }
                    }, { new: true }, async function (err, doc) {
                        if (err) {
                            res.status(422).json({
                                responseCode: 422,
                                responseMessage: "failure",
                                responseData: "Something wrong when updating data",
                            });
                        }
                        else {
                            if (user.account_info.type == "business") {
                                var updated = await User.findById(user._id).exec();
                                var business = await Management.find({ user: user._id }).exec();

                                // var management = await Management.findOne({ user: updated._id }).exec();
                                var paln = {}
                                if (business.length > 0) {
                                    var checkPlan = await BusinessPlan.findOne({ business: business[0].business }).exec();
                                    if (checkPlan) {
                                        var plan = {
                                            category: checkPlan.category,
                                            short_name: checkPlan.category,
                                            plan: checkPlan.plan,
                                            name: checkPlan.name,
                                        }
                                    }
                                }
                                res.status(200).json({
                                    responseCode: 200,
                                    responseMessage: "Password has been updated!",
                                    responseData: {
                                        status: "Active",
                                        token: token,
                                        user: updated,
                                        management: business,
                                        plan: plan,
                                    }
                                });
                            }
                            else {
                                var updated = await User.findById(user._id).exec();



                                // var management = await Management.findOne({ user: updated._id }).exec();
                                // var paln = {}
                                // if (management) {
                                //     var checkPlan = await BusinessPlan.findOne({ business: management.business }).exec();
                                //     if (checkPlan) {
                                //         var plan = {
                                //             category: checkPlan.category,
                                //             short_name: checkPlan.category,
                                //             plan: checkPlan.plan,
                                //             name: checkPlan.name,
                                //         }
                                //     }
                                // }
                                // console.log("TYpe business = " + JSON.stringify(management))
                                // console.log("Business  = " + JSON.stringify(management, null, '\t'))
                                // console.log("Business = ")
                                // console.log("Plan  = " + JSON.stringify(checkPlan, null, '\t'))


                                res.status(200).json({
                                    responseCode: 200,
                                    responseMessage: "Password has been updated!",
                                    responseData: {

                                        status: "Active",
                                        token: token,
                                        user: updated,
                                        // plan: plan,
                                    }
                                });
                            }
                        }
                    });
                }
            });
        }
        else {
            var json = ({
                responseCode: 400,
                responseMessage: "User not found",
                responseData: {}
            });

            res.status(400).json(json)
        }

    }
});

router.get('/user/car/search', xAccessToken.token, async function (req, res, next) {
    if (!req.query.query && !req.query.by && !req.query.user) {
        var json = ({
            responseCode: 422,
            responseMessage: "Invalid equest",
            responseData: {}
        });
        res.status(422).json(json)
    }
    else {
        var result = {}
        if (req.query.by == "registration") {
            var car = await Car.findOne({ registration_no: req.query.query, status: true })
                .populate('bookmark')
                .populate('thumbnails')
                .populate({ path: 'user', select: 'name username avatar avatar_address address' })
                .populate({ path: 'variant', populate: { path: 'model' } })
                .exec();

            if (car) {
                result = {
                    __v: 0,
                    _id: car._id,
                    id: car.id,
                    title: car.title,
                    variant: car.variant._id,
                    model: car.model,
                    modelName: car.variant.model.model,
                    price: price(car.price),
                    numericPrice: car.price,
                    accidental: car.accidental,
                    body_style: car.body_style,
                    description: car.description,
                    driven: car.driven,
                    carId: car.carId,
                    fuel_type: car.fuel_type,
                    insurance_info: car.insurance_info,
                    location: car.location,
                    manufacture_year: car.manufacture_year,
                    mileage: car.mileage,
                    owner: car.owner,
                    registration_no: car.registration_no,
                    service_history: car.service_history,
                    transmission: car.transmission,
                    vehicle_color: car.vehicle_color,
                    vehicle_status: car.vehicle_status,
                    geometry: car.geometry,
                    ic_address: car.ic_address,
                    rc_address: car.rc_address,
                    link: "/car/" + slugify(car.title + " " + car._id),
                    publish: car.publish,
                    status: car.status,
                    premium: car.premium,
                    is_bookmarked: car.is_bookmarked,
                    thumbnails: car.thumbnails,
                    user: car.user,
                    created_at: moment(car.created_at).tz(req.headers['tz']).format('ll'),
                    updated_at: moment(car.updated_at).tz(req.headers['tz']).format('ll'),
                };

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Success",
                    responseData: result
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
            var car = await Car.findOne({ _id: req.query.query, status: true })
                .populate('bookmark')
                .populate('thumbnails')
                .populate({ path: 'user', select: 'name username avatar avatar_address address' })
                .populate({ path: 'variant', populate: { path: 'model' } })
                .exec();

            if (car) {
                result = {
                    __v: 0,
                    _id: car._id,
                    id: car.id,
                    title: car.title,
                    variant: car.variant._id,
                    model: car.model,
                    modelName: car.variant.model.model,
                    price: price(car.price),
                    numericPrice: car.price,
                    accidental: car.accidental,
                    body_style: car.body_style,
                    description: car.description,
                    driven: car.driven,
                    carId: car.carId,
                    fuel_type: car.fuel_type,
                    insurance_info: car.insurance_info,
                    location: car.location,
                    manufacture_year: car.manufacture_year,
                    mileage: car.mileage,
                    owner: car.owner,
                    registration_no: car.registration_no,
                    service_history: car.service_history,
                    transmission: car.transmission,
                    vehicle_color: car.vehicle_color,
                    vehicle_status: car.vehicle_status,
                    geometry: car.geometry,
                    ic_address: car.ic_address,
                    rc_address: car.rc_address,
                    link: "/car/" + slugify(car.title + " " + car._id),
                    publish: car.publish,
                    status: car.status,
                    premium: car.premium,
                    is_bookmarked: car.is_bookmarked,
                    thumbnails: car.thumbnails,
                    user: car.user,
                    created_at: moment(car.created_at).tz(req.headers['tz']).format('ll'),
                    updated_at: moment(car.updated_at).tz(req.headers['tz']).format('ll'),
                };

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Success",
                    responseData: result
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
    }
});

router.post('/car/add', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var user = decoded.user;
    var result = new Object();

    var userInfo = await User.findById(user).exec();
    var currentDate = new Date();
    var variant = await Variant.findOne({ _id: req.body.variant }).select('-service_schedule').exec();

    if (variant != null && variant) {
        var rg = req.body.registration_no;
        req.body.registration_no = rg.replace(/ /g, '');

        var reg = await Car.find({ registration_no: req.body.registration_no, status: true }).count().exec();
        if (reg == 0) {
            var count = await Car.find({}).count().exec();

            if (req.body.longitude != undefined || req.body.longitude != null && req.body.latitude != undefined || req.body.latitude != null) {
                req.body.geometry = [req.body.longitude, req.body.latitude];
            }
            else {
                req.body.geometry = [0, 0];
            }

            req.body.created_at = currentDate;
            req.body.updated_at = currentDate;

            req.body.title = variant.variant;
            req.body._variant = variant.value;
            req.body.automaker = variant.automaker;
            req.body._automaker = variant._automaker;
            req.body.model = variant.model;
            req.body._model = variant._model;
            req.body.segment = variant.segment;
            req.body.user = user;
            req.body.fuel_type = variant.specification.fuel_type;
            req.body.transmission = variant.specification.type;
            req.body.carId = Math.round(+new Date() / 1000) + Math.round((Math.random() * 9999) + 1),
                // console.log(req.body.transmission)

                await Car.create(req.body).then(async function (car) {
                    User.findOneAndUpdate({ _id: user }, {
                        $push: {
                            "cars": car._id
                        }
                    }, { new: true }, async function (err, doc) {
                        if (err) {
                            // console.log(err)
                        }
                        else {
                            // console.log(err)
                        }
                    })

                    fun.addMember(user, variant.model);

                    await Car.find({ _id: car._id })
                        .populate('bookmark')
                        .populate('thumbnails')
                        .populate({ path: 'user', select: 'name username avatar avatar_address address' })
                        .populate({ path: 'variant', populate: { path: 'model' } })
                        .cursor().eachAsync(async (doc) => {
                            result = {
                                __v: 0,
                                _id: doc._id,
                                id: doc.id,
                                title: doc.title,
                                variant: doc.variant._id,
                                model: doc.model,
                                modelName: doc.variant.model.model,
                                price: price(doc.price),
                                numericPrice: doc.price,
                                accidental: doc.accidental,
                                body_style: doc.body_style,
                                description: doc.description,
                                driven: doc.driven,
                                carId: doc.carId,
                                fuel_type: doc.fuel_type,
                                insurance_info: doc.insurance_info,
                                location: doc.location,
                                manufacture_year: doc.manufacture_year,
                                mileage: doc.mileage,
                                owner: doc.owner,
                                registration_no: doc.registration_no,
                                service_history: doc.service_history,
                                transmission: doc.transmission,
                                vehicle_color: doc.vehicle_color,
                                vehicle_status: doc.vehicle_status,
                                geometry: doc.geometry,
                                link: "/car/" + slugify(doc.title + " " + doc._id),
                                publish: doc.publish,
                                status: doc.status,
                                premium: doc.premium,
                                is_bookmarked: doc.is_bookmarked,
                                thumbnails: doc.thumbnails,
                                user: doc.user,
                                created_at: doc.created_at,
                                updated_at: doc.updated_at
                            }
                        });

                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Car has been added",
                        responseData: {
                            item: result
                        }
                    });

                });
        }
        else {
            res.status(422).json({
                responseCode: 422,
                responseMessage: "registration no already exist",
                responseData: {}
            });
        }
    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Unprocessable Entity",
            responseData: {}
        });
    }
});

router.put('/car/edit', xAccessToken.token, async function (req, res, next) {
    var rules = {
        car: "required",
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Car is required",
            responseData: { /*res: validation.errors.all()*/ }
        })
    }
    else {
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);

        var user = decoded.user;
        var result;
        var loggedInDetails = await User.findOne({ _id: user }).exec();
        var car = await Car.findOne({ _id: req.body.car, user: user }).populate('user').exec();
        var variant = await Variant.findOne({ _id: req.body.variant }).select('-service_schedule').exec();
        if (car) {
            var rg = req.body.registration_no;
            req.body.reg_no_copy = rg.replace(/ /g, '');

            var check_rn = await Car.findOne({ registration_no: req.body.registration_no, _id: { $ne: car._id }, status: true }).exec();

            if (check_rn) {
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Car registration no already exist",
                    responseData: {}
                });
            }
            else {
                if (variant) {

                    var publish = false;
                    if (req.body.publish == true) {
                        publish = true
                    }

                    var package = null;

                    if (variant.specification.type) {
                        req.body.transmission = variant.specification.type
                    }

                    req.body.geometry = [req.body.longitude, req.body.latitude];
                    req.body.automaker = variant.automaker;
                    req.body._automaker = variant._automaker;
                    req.body.model = variant.model;
                    req.body._model = variant._model;
                    req.body._variant = variant.value;
                    req.body.segment = variant.segment;
                    req.body.title = variant.variant;
                    req.body.fuel_type = variant.specification.fuel_type;
                    req.body.package = package;
                    req.body.posted_by = "user",
                        req.body.updated_at = new Date();

                    Car.findOneAndUpdate({ _id: req.body.car, user: user }, { $set: req.body }, { new: false }, async function (err, s) {
                        if (err) {
                            var json = ({
                                responseCode: 400,
                                responseMessage: "Error occured",
                                responseData: err
                            });

                            res.status(400).json(json)
                        }
                        else {
                            if (publish == true) {
                                var log = {
                                    user: loggedInDetails._id,
                                    name: loggedInDetails.name,
                                    status: "Published",
                                    remark: "",
                                    updated_at: new Date(),
                                    created_at: new Date(),
                                };

                                var sell = await CarSell.findOne({ car: car._id, sold: false }).exec();
                                if (sell) {
                                    CarSell.findOneAndUpdate({ car: car._id, sold: false }, { $set: { otp: Math.floor(Math.random() * 90000) + 10000 } }, { new: false }, async function (err, doc) {
                                        if (err) {
                                            // console.log(err)
                                        }
                                        else {
                                            event.sellerApproval(sell._id, req.headers['tz'])
                                        }
                                    })
                                }
                                else {
                                    CarSell.create({
                                        car: car._id,
                                        seller: car.user,
                                        owner: car.user,
                                        buyer: null,
                                        otp: Math.floor(Math.random() * 90000) + 10000,
                                        user_verified: true,
                                        admin_verified: false,
                                        created_at: new Date(),
                                        updated_at: new Date(),
                                    }).then(function (d) {
                                        event.sellerApproval(d._id, req.headers['tz'])
                                    });
                                }
                            }

                            fun.addMember(user, variant.model);

                            await Car.findOne({ _id: req.body.car })
                                .populate('bookmark')
                                .populate('package')
                                .populate('thumbnails')
                                .populate({ path: 'user', select: 'name username avatar avatar_address address' })
                                .populate({ path: 'variant', populate: { path: 'model' } })
                                .cursor().eachAsync(async (doc) => {
                                    result = {
                                        __v: 0,
                                        _id: doc._id,
                                        id: doc.id,
                                        title: doc.title,
                                        variant: doc.variant._id,
                                        model: doc.model,
                                        modelName: doc.variant.model.model,
                                        price: price(doc.price),
                                        numericPrice: doc.price,
                                        accidental: doc.accidental,
                                        body_style: doc.body_style,
                                        description: doc.description,
                                        driven: doc.driven,
                                        carId: doc.carId,
                                        odometer: doc.odometer,
                                        fuel_type: doc.fuel_type,
                                        insurance_info: doc.insurance_info,
                                        location: doc.location,
                                        manufacture_year: doc.manufacture_year,
                                        mileage: doc.mileage,
                                        owner: doc.owner,
                                        registration_no: doc.registration_no,
                                        service_history: doc.service_history,
                                        transmission: doc.transmission,
                                        vehicle_color: doc.vehicle_color,
                                        vehicle_status: doc.vehicle_status,
                                        geometry: doc.geometry,
                                        link: "/car/" + slugify(doc.title + " " + doc._id),
                                        publish: doc.publish,
                                        status: doc.status,
                                        premium: doc.premium,
                                        posted_by: "user",
                                        is_bookmarked: doc.is_bookmarked,
                                        thumbnails: doc.thumbnails,
                                        package: doc.package,
                                        user: doc.user,
                                        created_at: doc.created_at,
                                        updated_at: doc.updated_at
                                    }
                                });

                            var responseMessage = "Successfully updated";
                            if (publish == true) {
                                responseMessage = "Car has been sent to admin for approval";
                            }

                            res.status(200).json({
                                responseCode: 200,
                                responseMessage: responseMessage,
                                responseData: {
                                    item: result
                                }
                            });
                        }
                    });
                }
                else {
                    res.status(400).json({
                        responseCode: 400,
                        responseMessage: "Unprocessable Entity",
                        responseData: {}
                    });
                }
            }
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Unauthorized",
                responseData: {}
            });
        }
    }
});

router.delete('/car/delete', xAccessToken.token, async function (req, res, next) {
    var rules = {
        car: "required",
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Car is required",
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
        var car = await Car.findOne({ _id: req.body.car, user: user }).exec();
        if (car) {
            var data = {
                status: false,
                updated_at: new Date()
            }

            Car.findOneAndUpdate({ _id: req.body.car, user: user }, { $set: data }, { new: false }, async function (err, s) {
                if (err) {
                    res.status(400).json({
                        responseCode: 400,
                        responseMessage: "Error occured",
                        responseData: err
                    });
                }
                else {
                    var cars = [];
                    await Car.find({ user: user, status: true })
                        .cursor().eachAsync(async (car) => {
                            cars.push(mongoose.Types.ObjectId(car._id))
                        });

                    var newvalues = {
                        $set: { cars: cars }
                    }

                    User.findOneAndUpdate({ _id: user }, newvalues, { new: false }, async function (err, s) {
                        if (err) {
                            res.status(400).json({
                                responseCode: 400,
                                responseMessage: "Error occured",
                                responseData: err
                            });
                        }
                        else {
                            res.status(200).json({
                                responseCode: 200,
                                responseMessage: "Car has been deleted",
                                responseData: {}
                            });
                        }
                    });
                }
            });
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Unauthorized",
                responseData: {}
            });
        }
    }
});

router.put('/car/feature-image/add', xAccessToken.token, async function (req, res, next) {
    var rules = {
        image: "required",
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Image is required",
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
        var car = await CarImage.findOne({ _id: req.body.image }).exec();
        if (car) {
            CarImage.findOneAndUpdate({ _id: req.body.image }, { $set: { feature: true } }, { new: false }, async function (err, s) {
                if (err) {
                    res.status(400).json({
                        responseCode: 400,
                        responseMessage: "Error occured",
                        responseData: err
                    });
                }
                else {
                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Set as feature image",
                        responseData: {}
                    });
                }
            });
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Unauthorized",
                responseData: {}
            });
        }
    }
});

router.put('/car/rc/add', xAccessToken.token, function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;

    var upload = multer({
        storage: multerS3({
            s3: s3,
            bucket: config.BUCKET_NAME + '/car',
            acl: 'public-read',
            contentType: multerS3.AUTO_CONTENT_TYPE,
            // contentDisposition: 'attachment',
            key: function (req, file, cb) {
                let extArray = file.mimetype.split("/");
                let extension = extArray[extArray.length - 1];

                if (extension == 'png' || extension == 'jpg' || extension == 'jpeg' || extension == 'gif') {
                    cb(null, uuidv1() + '.' + extension);
                }
                else {
                    var json = ({
                        responseCode: 422,
                        responseMessage: "Invalid extension",
                        responseData: {}
                    });
                    res.status(422).json(json)
                }
            }
        })
    }).array('media', 1);

    upload(req, res, async function (error) {
        if (error) {
            var json = ({
                responseCode: 400,
                responseMessage: "Error occured",
                responseData: {}
            });
            res.status(400).json(json)
        }

        if (req.files.length == 0) {
            var json = ({
                responseCode: 400,
                responseMessage: "Media is required",
                responseData: err
            });
            res.status(400).json(json)
        }
        else {
            var car = await Car.findOne({ _id: req.body.id, user: user }).exec();
            if (car) {
                if (car.ic) {
                    var params = {
                        Bucket: config.BUCKET_NAME + "/car",
                        Key: car.rc
                    };
                    s3.deleteObject(params, async function (err, data) {
                        if (err) {
                            res.status(400).json({
                                responseCode: 400,
                                responseMessage: "Error occured",
                                responseData: {
                                    res: {
                                        next: "",
                                        errors: "",
                                        rld: false
                                    },
                                }
                            });
                        }
                    });
                }

                var data = {
                    rc: req.files[0].key,
                    updated_at: new Date,
                }

                Car.findOneAndUpdate({ _id: req.body.id, user: user }, { $set: data }, { new: true }, function (err, doc) { });

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "File has been uploaded",
                    responseData: {
                        file_address: 'https://s3.ap-south-1.amazonaws.com/' + config.BUCKET_NAME + '/car/' + req.files[0].key,
                    }
                })
            }
        }
    });
});

router.put('/car/ic/add', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;

    var upload = multer({
        storage: multerS3({
            s3: s3,
            bucket: config.BUCKET_NAME + '/car',
            acl: 'public-read',
            contentType: multerS3.AUTO_CONTENT_TYPE,
            // contentDisposition: 'attachment',
            key: function (req, file, cb) {
                let extArray = file.mimetype.split("/");
                let extension = extArray[extArray.length - 1];

                if (extension == 'png' || extension == 'jpg' || extension == 'jpeg' || extension == 'gif') {
                    cb(null, uuidv1() + '.' + extension);
                }
                else {
                    var json = ({
                        responseCode: 422,
                        responseMessage: "Invalid extension",
                        responseData: {}
                    });
                    res.status(422).json(json)
                }
            }
        })
    }).array('media', 1);

    upload(req, res, async function (error) {
        if (error) {
            var json = ({
                responseCode: 400,
                responseMessage: "Error occured",
                responseData: {}
            });
            res.status(400).json(json)
        }

        if (req.files.length == 0) {
            var json = ({
                responseCode: 400,
                responseMessage: "Media is required",
                responseData: {}
            });
            res.status(400).json(json)
        }
        else {
            var car = await Car.findOne({ _id: req.body.id, user: user }).exec();
            if (car) {
                if (car.ic) {
                    var params = {
                        Bucket: config.BUCKET_NAME + "/car",
                        Key: car.ic
                    };
                    s3.deleteObject(params, async function (err, data) {
                        if (err) {
                            res.status(400).json({
                                responseCode: 400,
                                responseMessage: "Error occured",
                                responseData: {
                                    res: {
                                        next: "",
                                        errors: "",
                                        rld: false
                                    },
                                }
                            });
                        }
                    });
                }

                var data = {
                    ic: req.files[0].key,
                    updated_at: new Date,
                }

                Car.findOneAndUpdate({ _id: req.body.id, user: user }, { $set: data }, { new: true }, function (err, doc) { });

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "File has been uploaded",
                    responseData: {
                        file_address: 'https://s3.ap-south-1.amazonaws.com/' + config.BUCKET_NAME + '/car/' + req.files[0].key,
                    }
                })
            }
        }
    });
});

router.delete('/car/rc/delete', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;

    if (!req.body.id) {
        var json = ({
            responseCode: 422,
            responseMessage: "Invalid Car",
            responseData: {}
        });
        res.status(422).json(json)
    }
    else {
        var car = await Car.findOne({ _id: req.body.id, user: user }).exec();
        if (car) {
            if (car.ic) {
                var params = {
                    Bucket: config.BUCKET_NAME + "/car",
                    Key: car.rc
                };
                s3.deleteObject(params, async function (err, data) {
                    if (err) {
                        res.status(400).json({
                            responseCode: 400,
                            responseMessage: "Error occured",
                            responseData: {
                                res: {
                                    next: "",
                                    errors: "",
                                    rld: false
                                },
                            }
                        });
                    }
                });
            }

            var data = {
                rc: '',
                updated_at: new Date,
            }

            Car.findOneAndUpdate({ _id: req.body.id, user: user }, { $set: data }, { new: true }, function (err, doc) { });

            res.status(200).json({
                responseCode: 200,
                responseMessage: "File has been deleted",
                responseData: {}
            })
        }
    }
});

router.delete('/car/ic/delete', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;

    if (!req.body.id) {
        var json = ({
            responseCode: 422,
            responseMessage: "Invalid Car",
            responseData: {}
        });
        res.status(422).json(json)
    }
    else {
        var car = await Car.findOne({ _id: req.body.id, user: user }).exec();
        if (car) {
            if (car.ic) {
                var params = {
                    Bucket: config.BUCKET_NAME + "/car",
                    Key: car.ic
                };
                s3.deleteObject(params, async function (err, data) {
                    if (err) {
                        res.status(400).json({
                            responseCode: 400,
                            responseMessage: "Error occured",
                            responseData: {
                                res: {
                                    next: "",
                                    errors: "",
                                    rld: false
                                },
                            }
                        });
                    }
                });
            }

            var data = {
                ic: '',
                updated_at: new Date,
            }

            Car.findOneAndUpdate({ _id: req.body.id, user: user }, { $set: data }, { new: true }, function (err, doc) { });

            res.status(200).json({
                responseCode: 200,
                responseMessage: "File has been deleted",
                responseData: {}
            })
        }
    }
});

router.post('/car/add/image', xAccessToken.token, function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var upload = multer({
        storage: multerS3({
            s3: s3,
            bucket: config.BUCKET_NAME + '/car',
            acl: 'public-read',
            contentType: multerS3.AUTO_CONTENT_TYPE,
            // contentDisposition: 'attachment',
            key: function (req, file, cb) {
                let extArray = file.mimetype.split("/");
                let extension = extArray[extArray.length - 1];

                if (extension == 'png' || extension == 'jpg' || extension == 'jpeg' || extension == 'gif') {
                    cb(null, uuidv1() + '.' + extension);
                }
                else {
                    var json = ({
                        responseCode: 422,
                        responseMessage: "Invalid extension",
                        responseData: {}
                    });
                    res.status(422).json(json)
                }
            }
        })
    }).array('media', 1);

    upload(req, res, function (error) {
        if (error) {
            var json = ({
                responseCode: 400,
                responseMessage: "Error occured",
                responseData: {}
            });
            res.status(400).json(json)
        }

        if (req.files.length == 0) {
            var json = ({
                responseCode: 400,
                responseMessage: "Media is required",
                responseData: {}
            });
            res.status(400).json(json)
        } else {
            var data = {
                car: req.body.id,
                user: decoded.user,
                file: req.files[0].key,
                created_at: new Date(),
                updated_at: new Date(),
            };

            var carImage = new CarImage(data);
            carImage.save();

            res.status(200).json({
                responseCode: 200,
                responseMessage: "File has been uploaded",
                responseData: {
                    item: carImage
                }
            })
        }
    });
});

router.delete('/car/image/delete', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var image_id = req.body.id;
    const media = await CarImage.findById(image_id).exec();

    if (media) {
        var params = {
            Bucket: config.BUCKET_NAME + "/car",
            Key: media.file
        };
        s3.deleteObject(params, async function (err, data) {
            if (err) {
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Error occured",
                    responseData: {}
                });
            }
            else {
                await CarImage.findByIdAndRemove(image_id).exec();
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "File has been deleted",
                    responseData: {},
                })
            }
        });
    } else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Wrong image",
            responseData: {},
        })
    }
});

router.post('/car/document/add/', xAccessToken.token, function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    let extension = "";
    var upload = multer({
        storage: multerS3({
            s3: s3,
            bucket: config.BUCKET_NAME + '/car',
            acl: 'public-read',
            contentType: multerS3.AUTO_CONTENT_TYPE,
            // contentDisposition: 'attachment',
            key: function (req, file, cb) {
                let extArray = file.mimetype.split("/");
                extension = extArray[extArray.length - 1];
                var filename = uuidv1() + '.' + extension;


                if (extension == 'png' || extension == 'jpg' || extension == 'jpeg' || extension == 'gif' || extension == 'pdf' || extension == 'doc' || extension == 'docx') {
                    cb(null, filename);
                }
                else {
                    var params = {
                        Bucket: config.BUCKET_NAME + "/car",
                        Key: filename
                    };
                    s3.deleteObject(params, async function (err, data) {
                        var json = ({
                            responseCode: 422,
                            responseMessage: "Invalid extension",
                            responseData: filename
                        });
                        res.status(422).json(json)
                    });
                }
            }
        })
    }).array('media', 1);

    upload(req, res, function (error) {
        if (error) {
            var json = ({
                responseCode: 400,
                responseMessage: "Error occured",
                responseData: {}
            });
            res.status(400).json(json)
        }

        if (req.files.length == 0) {
            var json = ({
                responseCode: 400,
                responseMessage: "Media is required",
                responseData: {}
            });
            res.status(400).json(json)
        } else {
            var data = {
                user: decoded.user,
                car: req.body.id,
                file_type: extension.toUpperCase(),
                caption: _.startCase(_.toLower(req.body.caption)),
                file: req.files[0].key,
                created_at: new Date(),
                updated_at: new Date(),
            };

            var carDocument = new CarDocument(data);
            carDocument.save();

            res.status(200).json({
                responseCode: 200,
                responseMessage: "File has been uploaded",
                responseData: carDocument
            })
        }
    });
});

router.delete('/car/document/delete', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var image_id = req.body.id;
    const media = await CarDocument.findById(image_id).exec();

    if (media) {
        var params = {
            Bucket: config.BUCKET_NAME + "/car",
            Key: media.file
        };
        s3.deleteObject(params, async function (err, data) {
            if (err) {
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Error occured",
                    responseData: {}
                });
            }
            else {
                await CarDocument.findByIdAndRemove(image_id).exec();
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "File has been deleted",
                    responseData: {},
                })
            }
        });
    } else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Wrong image",
            responseData: {},
        })
    }
});

router.get('/car/documents/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var document = await CarDocument.find({ user: decoded.user, car: req.query.car }).exec();

    res.status(200).json({
        responseCode: 200,
        responseMessage: "",
        responseData: document
    })
});

router.post('/car/publish', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var loggedInDetails = await User.findById(decoded.user).exec();
    var car = await Car.findById(req.body.car).populate('user').exec();

    if (car) {
        if (loggedInDetails) {
            var check_listing = await CarSell.findOne({ car: car._id, buyer: null }).exec();
            if (check_listing) {
                if (!check_listing.seller.equals(check_listing.owner)) {
                    event.otp(car.user.contact_no, check_listing.otp);

                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "OTP has been sent to owner. Kindly Verify it.",
                        responseData: {
                            sell: check_listing._id
                        }
                    })
                }
                else {
                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Admin approval pending",
                        responseData: {
                            sell: null
                        }
                    })
                }
            }
            else {
                var log = {
                    user: loggedInDetails._id,
                    name: loggedInDetails.name,
                    status: "Published",
                    remark: "",
                    updated_at: new Date(),
                    created_at: new Date(),
                };

                var user_verified = false;

                if (loggedInDetails._id.equals(car.user._id)) {
                    user_verified = true;
                }

                CarSell.create({
                    car: car._id,
                    seller: loggedInDetails._id,
                    owner: car.user._id,
                    buyer: null,
                    otp: Math.floor(Math.random() * 90000) + 10000,
                    user_verified: user_verified,
                    admin_verified: false,
                    logs: log,
                    created_at: new Date(),
                    updated_at: new Date(),
                })
                    .then(async function (sell) {
                        var variant = await Variant.findOne({ _id: car.variant }).select('-service_schedule').exec();

                        Car.findOneAndUpdate({ _id: car._id }, {
                            $set: {
                                posted_by: "user",
                                user: sell.seller,
                                variant: variant._id,
                                model: variant.model,
                                _model: variant._model,
                                segment: variant.segment,
                                automaker: variant.automaker,
                                _automaker: variant._automaker,
                                title: variant.variant,
                                publish: true,
                                updated_at: new Date()
                            }
                        }, { new: false }, function (err, doc) {
                            if (err) {
                                res.status(400).json({
                                    responseCode: 400,
                                    responseMessage: "Server Error",
                                    responseData: err
                                });
                            }
                            else {
                                if (user_verified == false) {
                                    event.otp(car.user.contact_no, check_listing.otp);
                                    res.status(200).json({
                                        responseCode: 200,
                                        responseMessage: "OTP has been sent to owner. Kindly Verify it.",
                                        responseData: {
                                            sell: sell._id
                                        }
                                    })
                                }
                                else {
                                    res.status(200).json({
                                        responseCode: 200,
                                        responseMessage: "Admin approval pending",
                                        responseData: {
                                            sell: null
                                        }
                                    })
                                }

                            }
                        });
                    });
            }
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Seller not found",
                responseData: {}
            })
        }
    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Unauthorized",
            responseData: {}
        })
    }
});

router.delete('/car/unpublish', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var loggedInDetails = await User.findById(decoded.user).exec();
    var car = await Car.findById(req.body.car).populate('user').exec();

    if (car) {
        if (loggedInDetails) {
            var check_listing = await CarSell.findOne({ car: car._id, seller: loggedInDetails._id }).exec();
            if (check_listing) {
                Car.findOneAndUpdate({ _id: car._id }, {
                    $set: {
                        user: check_listing.owner,
                        publish: false,
                        admin_approved: false,
                        updated_at: new Date()
                    }
                }, { new: false }, async function (err, doc) {
                    if (err) {
                        res.status(400).json({
                            responseCode: 400,
                            responseMessage: "Server Error",
                            responseData: err
                        })
                    }
                    else {
                        CarSell.findByIdAndRemove(check_listing._id).exec();

                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Successfully unpublished",
                            responseData: {}
                        })
                    }
                });
            }
            else {
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Unauthorized",
                    responseData: {}
                })
            }
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Seller not found",
                responseData: {}
            })
        }
    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Unauthorized",
            responseData: {}
        })
    }
});

router.put('/car/owner/update', xAccessToken.token, async function (req, res, next) {
    var rules = {
        car: "required",
        user: "required",
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

        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var business = null;

        if (req.body.business) {
            business = req.body.business;
        }

        var currentDate = new Date();
        var booking = null;
        var newOwner = await User.findOne({ _id: req.body.user }).exec();

        if (newOwner) {

            var checkCar = await Car.findOne({ _id: req.body.car }).exec();
            if (checkCar) {
                Car.findOneAndUpdate({ _id: checkCar._id }, { $set: { user: newOwner._id } }, { new: false }, function (err, doc) {
                    if (err) {
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Error Occured",
                            responseData: {}
                        });
                    }
                    else {
                        CarHistory.create({
                            car: checkCar._id,
                            previous: checkCar.user,
                            new: newOwner._id,
                            updated_by: decoded.user,
                            business: business,
                            created_at: new Date(),
                            updated_at: new Date(),
                        })

                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Done",
                            responseData: {
                                car: checkCar._id,
                                user: newOwner._id
                            }
                        });
                    }
                })
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
                responseMessage: "User not found",
                responseData: {}
            });
        }
    }
});

router.get('/car', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var car = [];

    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }

    var page = Math.max(0, parseInt(page));

    await Car.find({ user: user, status: true })
        .populate('bookmark')
        .populate('thumbnails')
        .populate({ path: 'user', select: 'name username avatar avatar_address address' })
        .populate({ path: 'variant', populate: { path: 'model' } })
        .sort({ created_at: -1 }).skip(config.perPage * page).limit(config.perPage)
        .cursor().eachAsync(async (doc) => {
            var on_booking = await Booking.find({ car: doc._id, status: { $ne: "Completed" } }).count().exec();
            car.push({
                __v: 0,
                _id: doc._id,
                id: doc.id,
                title: doc.title,
                variant: doc.variant._id,
                model: doc.model,
                modelName: doc.variant.model.model,
                price: price(doc.price),
                numericPrice: doc.price,
                accidental: doc.accidental,
                body_style: doc.body_style,
                description: doc.description,
                driven: doc.driven,
                carId: doc.carId,
                fuel_type: doc.fuel_type,
                insurance_info: doc.insurance_info,
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
                ic: doc.ic,
                rc: doc.rc,
                ic_address: doc.ic_address,
                rc_address: doc.rc_address,
                link: "/car/" + slugify(doc.title + " " + doc._id),
                publish: doc.publish,
                status: doc.status,
                admin_approved: doc.admin_approved,
                is_bookmarked: doc.is_bookmarked,
                thumbnails: doc.thumbnails,
                user: doc.user,
                isChatEnable: await q.all(fun.isChatEnable(doc.user._id, req.headers['tz'])),
                is_booked: on_booking > 0 ? true : false,
                created_at: doc.created_at,
                updated_at: doc.updated_at
            });
        });

    const totalCarCount = await Car.count({ user: user }).exec();

    const publishedCarCount = await Car.count({ user: user, publish: true }).exec();

    res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: {
            total: totalCarCount,
            published: publishedCarCount,
            stocks: car,
        }
    });
});

router.get('/cars/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;

    if (req.headers['business']) {
        var user = req.headers['business'];
    }
    var car = [];

    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }

    var page = Math.max(0, parseInt(page));

    await Car.find({ user: user, status: true })
        .populate('bookmark')
        .populate('thumbnails')
        .populate({ path: 'user', select: 'name username avatar avatar_address address' })
        .populate({ path: 'variant', populate: { path: 'model' } })
        .sort({ updated_at: -1 }).skip(config.perPage * page).limit(config.perPage)
        .cursor().eachAsync(async (doc) => {
            var on_booking = await Booking.find({ car: doc._id, status: { $ne: "Completed" } }).count().exec();
            car.push({
                __v: 0,
                _id: doc._id,
                id: doc.id,
                title: doc.title,
                modelName: doc.variant.model.model,
                variant: doc.variant._id,
                price: price(doc.price),
                numericPrice: doc.price,
                carId: doc.carId,
                fuel_type: doc.fuel_type,
                vehicle_color: doc.vehicle_color,
                registration_no: doc.registration_no,
                manufacture_year: doc.manufacture_year,
                publish: doc.publish,
                status: doc.status,
                admin_approved: doc.admin_approved,
                thumbnails: doc.thumbnails,
                is_booked: on_booking > 0 ? true : false,
                created_at: doc.created_at,
                updated_at: doc.updated_at
            });
        });

    const totalCarCount = await Car.count({ user: user, status: true }).exec();
    const publishedCarCount = await Car.count({ user: user, publish: true }).exec();
    res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: {
            total: totalCarCount,
            published: publishedCarCount,
            stocks: car,
        }
    });
});

router.get('/car/get', xAccessToken.token, async function (req, res, next) {
    if (!req.query.id) {
        var json = ({
            responseCode: 422,
            responseMessage: "Invalid equest",
            responseData: {}
        });
        res.status(422).json(json)
    }
    else {
        var result = {}
        if (req.query.by == "registration") {
            var car = await Car.findOne({ registration_no: req.query.id, status: true })
                .populate('bookmark')
                .populate('thumbnails')
                .populate('package')
                .populate({ path: 'user', select: 'name username contact_no avatar avatar_address address partner' })
                .exec();

            if (car) {
                var car_price = 0
                if (car.price) {
                    car_price = car.price
                }

                var refurbishment_cost = 0
                if (car.refurbishment_cost) {
                    refurbishment_cost = car.refurbishment_cost
                }
                var purchase_price = 0
                if (car.purchase_price) {
                    purchase_price = car.purchase_price
                }
                result = {
                    __v: 0,
                    _id: car._id,
                    id: car.id,
                    title: car.title,
                    variant: car.variant,
                    _variant: car._variant,
                    model: car.model,
                    _model: car._model,
                    _automaker: car._automaker,
                    automaker: car.automaker,
                    ic: car.ic,
                    rc: car.rc,
                    ic_address: car.ic_address,
                    rc_address: car.rc_address,
                    model: car.model,
                    price: price(car_price),
                    numericPrice: car_price,
                    refurbishment_cost: refurbishment_cost,
                    purchase_price: purchase_price,
                    _purchase_price: price(purchase_price),
                    accidental: car.accidental,
                    body_style: car.body_style,
                    description: car.description,
                    driven: car.driven,
                    carId: car.carId,
                    fuel_type: car.fuel_type,
                    insurance_info: car.insurance_info,
                    location: car.location,
                    manufacture_year: car.manufacture_year,
                    odometer: car.odometer,
                    owner: car.owner,
                    registration_no: car.registration_no,
                    service_history: car.service_history,
                    transmission: car.transmission,
                    vehicle_color: car.vehicle_color,
                    vehicle_status: car.vehicle_status,
                    geometry: car.geometry,
                    ic_address: car.ic_address,
                    insurance: car.insurance,
                    rc_address: car.rc_address,
                    link: "/car/" + slugify(car.title + " " + car._id),
                    publish: car.publish,
                    status: car.status,
                    admin_approved: car.admin_approved,
                    premium: car.premium,
                    is_bookmarked: car.is_bookmarked,
                    isChatEnable: await q.all(fun.isChatEnable(car.user._id, req.headers['tz'])),
                    thumbnails: car.thumbnails,
                    user: car.user,
                    package: car.package,
                    created_at: moment(car.created_at).tz(req.headers['tz']).format('ll'),
                    updated_at: moment(car.updated_at).tz(req.headers['tz']).format('ll'),
                };

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Success",
                    responseData: result
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
            var carId = req.query.id;

            var car = await Car.findOne({ _id: carId, status: true })
                .populate('bookmark')
                .populate('thumbnails')
                .populate('package')
                .populate({ path: 'user', select: 'name contact_no username avatar avatar_address address account_info partner' })
                .exec();

            if (car) {
                var car_price = 0
                if (car.price) {
                    car_price = car.price
                }

                var refurbishment_cost = 0
                if (car.refurbishment_cost) {
                    refurbishment_cost = car.refurbishment_cost
                }
                var purchase_price = 0
                if (car.purchase_price) {
                    purchase_price = car.purchase_price
                }
                result = {
                    _id: car._id,
                    id: car.id,
                    title: car.title,
                    variant: car.variant,
                    _variant: car._variant,
                    model: car.model,
                    _model: car._model,
                    automaker: car.automaker,
                    _automaker: car._automaker,
                    ic: car.ic,
                    rc: car.rc,
                    ic_address: car.ic_address,
                    rc_address: car.rc_address,
                    modelName: car._model,
                    price: price(car_price),
                    numericPrice: car_price,
                    refurbishment_cost: refurbishment_cost,
                    purchase_price: purchase_price,
                    _purchase_price: price(purchase_price),
                    accidental: car.accidental,
                    body_style: car.body_style,
                    description: car.description,
                    driven: car.driven,
                    carId: car.carId,
                    fuel_type: car.fuel_type,
                    insurance_info: car.insurance_info,
                    location: car.location,
                    manufacture_year: car.manufacture_year,
                    odometer: car.odometer,
                    insurance: car.insurance,
                    owner: car.owner,
                    registration_no: car.registration_no,
                    service_history: car.service_history,
                    transmission: car.transmission,
                    vehicle_color: car.vehicle_color,
                    vehicle_status: car.vehicle_status,
                    geometry: car.geometry,
                    ic_address: car.ic_address,
                    rc_address: car.rc_address,
                    link: "/car/" + slugify(car.title + " " + car._id),
                    publish: car.publish,
                    status: car.status,
                    admin_approved: car.admin_approved,
                    is_bookmarked: car.is_bookmarked,
                    isChatEnable: await q.all(fun.isChatEnable(car.user._id, req.headers['tz'])),
                    thumbnails: car.thumbnails,
                    package: car.package,
                    user: car.user,
                    created_at: moment(car.created_at).tz(req.headers['tz']).format('ll'),
                    updated_at: moment(car.updated_at).tz(req.headers['tz']).format('ll'),
                };

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Success",
                    responseData: result
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
    }
});

router.get('/editable/car/get', xAccessToken.token, async function (req, res, next) {
    if (!req.query.id) {
        var json = ({
            responseCode: 422,
            responseMessage: "Invalid equest",
            responseData: {}
        });
        res.status(422).json(json)
    }
    else {
        var result = {}
        if (req.query.by == "registration") {
            var car = await Car.findOne({ registration_no: req.query.id, status: true })
                .populate('bookmark')
                .populate('thumbnails')
                .populate({ path: 'user', select: 'name username avatar avatar_address address partner' })
                .populate({ path: 'variant', populate: { path: 'model' } })
                .exec();

            if (car) {
                var car_price = 0
                if (car.price) {
                    car_price = car.price
                }

                var refurbishment_cost = 0
                if (car.refurbishment_cost) {
                    refurbishment_cost = car.refurbishment_cost
                }
                var purchase_price = 0
                if (car.purchase_price) {
                    purchase_price = car.purchase_price
                }

                var bodyStyle = await BodyStyle.find({}).exec();
                var transmission = await Transmission.find({}).exec();
                var color = await Color.find({}).exec();
                var owner = await Owner.find({}).exec();

                var package = null;
                if (car.package) {
                    package = car.package
                }

                result = {
                    __v: 0,
                    _id: car._id,
                    id: car.id,
                    title: car.title,
                    variant: car.variant._id,
                    model: car.model,
                    ic: car.ic,
                    rc: car.rc,
                    ic_address: car.ic_address,
                    rc_address: car.rc_address,
                    model: car.model,
                    modelName: car.variant.model.model,
                    price: price(car_price),
                    numericPrice: car_price,
                    refurbishment_cost: refurbishment_cost,
                    purchase_price: purchase_price,
                    accidental: car.accidental,
                    body_style: car.body_style,
                    description: car.description,
                    carId: car.carId,
                    fuel_type: car.fuel_type,
                    insurance_info: car.insurance_info,
                    location: car.location,
                    manufacture_year: car.manufacture_year,
                    odometer: car.odometer,
                    owner: car.owner,
                    insurance: car.insurance,
                    registration_no: car.registration_no,
                    service_history: car.service_history,
                    transmission: car.transmission,
                    vehicle_color: car.vehicle_color,
                    vehicle_status: car.vehicle_status,
                    geometry: car.geometry,
                    ic_address: car.ic_address,
                    rc_address: car.rc_address,
                    link: "/car/" + slugify(car.title + " " + car._id),
                    publish: car.publish,
                    status: car.status,
                    admin_approved: car.admin_approved,
                    is_bookmarked: car.is_bookmarked,
                    thumbnails: car.thumbnails,
                    user: car.user,
                    package: package,
                    created_at: moment(car.created_at).tz(req.headers['tz']).format('ll'),
                    updated_at: moment(car.updated_at).tz(req.headers['tz']).format('ll'),
                    body_style: bodyStyle.map(e => e.value == car.body_style ? (e.selected = true, e) : e),
                    transmission: transmission.map(e => e.value == car.transmission ? (e.selected = true, e) : e),
                    vehicle_color: color.map(e => e.value == car.vehicle_color ? (e.selected = true, e) : e),
                    owner: owner.map(e => e.value == car.owner ? (e.selected = true, e) : e),
                };

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Success",
                    responseData: result
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
            var carId = req.query.id;
            var car = await Car.findOne({ _id: carId, status: true })
                .populate('bookmark')
                .populate('thumbnails')
                .populate({ path: 'user', select: 'name username avatar avatar_address address partner' })
                .populate({ path: 'variant', populate: { path: 'model' } })
                .exec();

            if (car) {
                var car_price = 0
                if (car.price) {
                    car_price = car.price
                }

                var refurbishment_cost = 0
                if (car.refurbishment_cost) {
                    refurbishment_cost = car.refurbishment_cost
                }
                var purchase_price = 0
                if (car.purchase_price) {
                    purchase_price = car.purchase_price
                }

                var bodyStyle = await BodyStyle.find({}).exec();
                var transmission = await Transmission.find({}).exec();
                var color = await Color.find({}).exec();
                var owner = await Owner.find({}).exec();
                var package = null;
                if (car.package) {
                    package = car.package
                }


                result = {
                    _id: car._id,
                    id: car.id,
                    title: car.title,
                    variant: car.variant._id,
                    model: car.model,
                    ic: car.ic,
                    rc: car.rc,
                    ic_address: car.ic_address,
                    rc_address: car.rc_address,
                    modelName: car.variant.model.model,
                    price: price(car_price),
                    numericPrice: car_price,
                    refurbishment_cost: refurbishment_cost,
                    purchase_price: purchase_price,
                    accidental: car.accidental,
                    body_style: car.body_style,
                    description: car.description,
                    driven: car.driven,
                    carId: car.carId,
                    fuel_type: car.fuel_type,
                    insurance_info: car.insurance_info,
                    location: car.location,
                    manufacture_year: car.manufacture_year,
                    odometer: car.odometer,
                    owner: car.owner,
                    insurance: car.insurance,
                    registration_no: car.registration_no,
                    service_history: car.service_history,
                    transmission: car.transmission,
                    vehicle_color: car.vehicle_color,
                    vehicle_status: car.vehicle_status,
                    geometry: car.geometry,
                    ic_address: car.ic_address,
                    rc_address: car.rc_address,
                    publish: car.publish,
                    status: car.status,
                    admin_approved: car.admin_approved,
                    is_bookmarked: car.is_bookmarked,
                    thumbnails: car.thumbnails,
                    user: car.user,
                    package: package,
                    created_at: moment(car.created_at).tz(req.headers['tz']).format('ll'),
                    updated_at: moment(car.updated_at).tz(req.headers['tz']).format('ll'),
                    body_style: bodyStyle.map(e => e.value == car.body_style ? (e.selected = true, e) : e),
                    transmission: transmission.map(e => e.value == car.transmission ? (e.selected = true, e) : e),
                    vehicle_color: color.map(e => e.value == car.vehicle_color ? (e.selected = true, e) : e),
                    owner: owner.map(e => e.value == car.owner ? (e.selected = true, e) : e),
                };

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Success",
                    responseData: result
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
    }
});

router.get('/vehicle/detail', async function (req, res, next) {
    var automaker = [];

    await Automaker.find({}).sort({ maker: 1 }).cursor().eachAsync(async (maker) => {
        var model = await Model.find({ automaker: maker._id }).select("_id model id").exec();
        automaker.push({
            _id: maker._id,
            maker: maker.maker,
            logo: maker.logo,
            value: maker.value,
            id: maker.id
        });
    });

    var models = await Model.find({}).exec();
    var bodyStyle = await BodyStyle.find({}).exec();
    var fuelType = await FuelType.find({}).exec();
    var transmission = await Transmission.find({}).exec();
    var color = await Color.find({}).exec();

    var owner = await Owner.find({}).exec();
    var category = await Category.find({}).exec();

    res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: {
            automaker: automaker,
            models: models,
            body_style: bodyStyle,
            fuel_type: fuelType,
            transmissions: transmission,
            color: color,
            owner: owner,
            categories: category,
        }
    })
});

router.get('/loggedIn/details', xAccessToken.token, async function (req, res, next) {
    var app = req.headers['app'];
    var device = req.headers['devicetype'];
    var update = false;



    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var points = 0;
    var used = 0;
    var level = 1;
    var reviews = [];
    var userId = req.query.id;
    var is_rated = false;
    var bookings = null;

    var user = await User.findOne({ _id: decoded.user }).select('-device -otp -password -social_id -social_login').exec();

    await Point.find({ user: user._id }).cursor().eachAsync(async (u) => {
        points = points + u.points;
    });


    if (points >= 0 && points <= 2999) {
        level = 1;
    }
    else if (points >= 3000 && points <= 6999) {
        level = 2;
    }
    else if (points >= 7000 && points <= 11999) {
        level = 3;
    }
    else if (points >= 12000 && points <= 15999) {
        level = 4;
    }
    else if (points >= 16000) {
        level = 5;
    }

    await Point.find({ user: user._id, type: "debit" }).cursor().eachAsync(async (u) => {
        used = used + u.points;
    });


    var pointsInfo = {
        level: level,
        points: Math.ceil(points),
        used: Math.ceil(used)
    };

    var booking = await Booking.findOne({ user: user, status: "Completed" })
        .populate({ path: 'bsuiness', populate: { path: 'user', select: "_id id name contact_no" } })
        .populate({ path: 'car', select: '_id id title registration_no', populate: { path: 'thumbnails' } }).sort({ created_at: -1 }).exec();

    if (booking) {
        if (booking.is_reviewed) {
            is_rated = true
        }
        else {
            is_rated = false
        }

        bookings = {
            _id: booking._id,
            id: booking._id,
            car: booking.car,
            business: {
                name: booking.business.name,
                _id: booking.business._id,
                id: booking.business._id,
                contact_no: booking.business.contact_no
            },
            services: booking.services,
            convenience: booking.convenience,
            date: moment(booking.date).tz(req.headers['tz']).format('ll'),
            time_slot: booking.time_slot,
            status: booking.status,
            booking_no: booking.booking_no,
            address: {},
            payment: booking.payment,
            txnid: booking.txnid,
            __v: booking.__v,
            updated_at: booking.updated_at,
            updated_at: booking.updated_at,
        };
    }


    var uuid = user.username;
    if (user.uuid != "") {
        uuid = user.uuid
    }

    var data = {
        _id: user._id,
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        contact_no: user.contact_no,
        avatar_address: user.avatar_address,
        account_info: user.account_info,
        address: user.address,
        business_info: user.business_info,
        coordinates: user.geometry,
        optional_info: user.optional_info,
        created_at: user.created_at,
        updated_at: user.updated_at,
        joined: moment(user.created_at).tz(req.headers['tz']).format('ll'),
        socialite: user.socialite,
        agent: user.agent,
        partner: user.partner,
        referral_code: user.referral_code,
        points: pointsInfo,
        update_required: update,
        version: {},
        uuid: uuid,
        rating: {
            booking: bookings,
            is_rated: is_rated
        }
    }

    res.status(200).json({
        responseCode: 200,
        responseMessage: "",
        responseData: data
    })
});

router.get('/profile/detail', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /profile/detail Api Called from common.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    var rules = {
        id: 'required',
    };

    var validation = new Validator(req.query, rules);

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
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var rating = 0;
        var data = {};
        var userId = req.query.id;

        var user = await User.findOne({ _id: userId }).populate('follow').populate('bookmark').exec();
        if (user) {
            fun.profileView(user._id, decoded.user, req.headers['tz']);

            if (user.account_info.type == "business") {
                var management = await Management.findOne({ user: user }).exec();
                if (management) {
                    // business: management.business
                    var getBusinessConvenience = await BusinessConvenience.find({}).exec();
                    if (getBusinessConvenience.length > 0) {
                        var booking_conveniences = getBusinessConvenience;
                    }
                    else {
                        var booking_conveniences = [
                            {
                                _id: null,
                                id: null,
                                convenience: "Self Drop",
                                charges: 0
                            },
                            {
                                _id: null,
                                id: null,
                                convenience: "Pickup",
                                charges: 0
                            },
                            {
                                _id: null,
                                id: null,
                                convenience: "Doorstep",
                                charges: 0
                            },
                            {
                                _id: null,
                                id: null,
                                convenience: "Towing",
                                charges: 0
                            },
                            {
                                _id: null,
                                id: null,
                                convenience: "Flatbed Towing",
                                charges: 0
                            }
                        ];
                    }

                    var rating = await Review.find({ business: management.business }).exec();
                    rating = _.meanBy(rating, (p) => p.rating);
                    // console.log("Business Details")
                    if (management.business.equals(userId)) {
                        var user = await User.findOne({ _id: management.business }).exec();
                        data = {
                            _id: user.id,
                            name: user.name,
                            username: user.username,
                            email: user.email,
                            contact_no: user.contact_no,
                            avatar: user.avatar,
                            avatar_address: user.avatar_address,
                            account_info: user.account_info,
                            address: user.address,
                            coordinates: user.geometry,
                            business_info: user.business_info,
                            joined: moment(user.created_at).tz(req.headers['tz']).format('ll'),
                            total_rating: parseFloat(rating.toFixed(1)),
                            optional_info: user.optional_info,
                            socialite: user.socialite,
                            agent: user.agent,
                            bank_details: user.bank_details,
                            is_chat_active: user.device.length > 0 ? true : false,
                            timing: await BusinessTiming.find({ business: user._id }).select('-created_at -updated_at').exec(),
                            business_gallery: await BusinessGallery.find({ business: user._id }).select('-created_at -updated_at').exec(),
                            offer_gallery: await BusinessOffer.find({ business: user._id }).select('-created_at -updated_at').exec(),
                            is_bookmarked: user.is_bookmarked,
                            booking_conveniences: booking_conveniences,
                            totalViews: await ProfileView.find({ profile: user._id }).count().exec()
                        }

                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "success",
                            responseData: data
                        });
                    }
                    else {
                        var user = await User.findOne({ _id: userId }).exec();
                        data = {
                            _id: user.id,
                            name: user.name,
                            username: user.username,
                            email: user.email,
                            contact_no: user.contact_no,
                            avatar: user.avatar,
                            avatar_address: user.avatar_address,
                            account_info: user.account_info,
                            address: user.address,
                            coordinates: user.geometry,
                            business_info: user.business_info,
                            joined: moment(user.created_at).tz(req.headers['tz']).format('ll'),
                            total_rating: rating,
                            optional_info: user.optional_info,
                            socialite: user.socialite,
                            agent: user.agent,
                            bank_details: user.bank_details,
                            is_chat_active: user.device.length > 0 ? true : false,
                            timing: await BusinessTiming.find({ business: user._id }).select('-created_at -updated_at').exec(),
                            business_gallery: await BusinessGallery.find({ business: user._id }).select('-created_at -updated_at').exec(),
                            offer_gallery: await BusinessOffer.find({ business: user._id }).select('-created_at -updated_at').exec(),
                            is_bookmarked: user.is_bookmarked,
                            booking_conveniences: booking_conveniences,
                            totalViews: await ProfileView.find({ profile: user._id }).count().exec()
                        };

                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "success",
                            responseData: data
                        });
                    }
                }
                else {
                    res.status(400).json({
                        responseCode: 400,
                        responseMessage: "User not found",
                        responseData: data
                    })
                }
            }

            if (user.account_info.type == "user") {
                var points = 0;
                var level = 1;
                var gallerySize = 0;
                var media = [];

                var ti = 0
                await Post.find({ user: user._id, status: true }).populate('thumbnails').sort({ created_at: -1 }).cursor().eachAsync(async (post) => {
                    var thumbnails = post.thumbnails;
                    gallerySize = gallerySize + thumbnails.length;

                    thumbnails.forEach(function (t) {
                        if (ti < 6) {
                            media.push({
                                _id: t._id,
                                id: t._id,
                                post: t.post,
                                caption: t.caption,
                                day: t.day,
                                file: t.file,
                                type: t.type,
                                place: t.place,
                                file_address: t.file_address,
                                preview_address: t.preview_address,
                            });
                        }

                        ti = ti + 1;
                    });
                });

                await Point.find({ user: user._id, type: "credit" }).cursor().eachAsync(async (u) => {
                    points = points + u.points;
                });

                if (points >= 50 && points <= 2999) {
                    level = 1;
                }
                else if (points >= 3000 && points <= 6999) {
                    level = 2;
                }
                else if (points >= 7000 && points <= 11999) {
                    level = 3;
                }
                else if (points >= 12000 && points <= 15999) {
                    level = 4;
                }
                else if (points >= 16000) {
                    level = 5;
                }

                data = {
                    _id: user._id,
                    id: user.id,
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    contact_no: user.contact_no,
                    avatar_address: user.avatar_address,
                    account_info: user.account_info,
                    address: user.address,
                    optional_info: user.optional_info,
                    joined: moment(user.created_at).tz(req.headers['tz']).format("MMM, YYYY"),
                    socialite: user.socialite,
                    totalViews: await ProfileView.find({ profile: user._id }).count().exec(),
                    totalPosts: await Post.find({ user: user._id }).count().exec(),
                    followers: await Follow.find({ follow: user._id }).count().exec(),
                    followings: await Follow.find({ user: user._id }).count().exec(),
                    is_following: user.is_following,
                    is_followed: await Follow.find({ user: user._id, follow: decoded.user }).count().exec() > 0 ? true : false,
                    is_chat_active: user.device.length > 0 ? true : false,
                    points: {
                        level: level,
                        points: Math.ceil(points)
                    },
                    gallerySize: gallerySize - 5,
                    gallery: media,
                    agent: user.agent,
                }

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "success",
                    responseData: data
                });
            }
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "The phone number that you've entered doesn't match any account.",
                responseData: {}
            })
        }
    }
});



/*
router.get('/profile/detail',xAccessToken.token,async function (req, res, next) {
    var rules = {
        id: 'required',
    };

    var validation = new Validator(req.query, rules);

    if(validation.fails()){
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Error",
            responseData: {
                res: validation.errors.all()
            }
        })
    }
    else
    {
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var rating = 0;
        var data = {};
        var userId = req.query.id;

        var user = await User.findOne({_id:userId}).populate('follow').populate('bookmark').exec();
        if(user)
        {
            fun.profileView(user._id, decoded.user, req.headers['tz']); 

            if(user.account_info.type=="business")
            {
                var management = await Management.findOne({user:user}).exec();
                if(management)
                {
                    // business: management.business
                    var getBusinessConvenience = await BusinessConvenience.find({}).exec();
                    if(getBusinessConvenience.length>0)
                    {
                        var booking_conveniences = getBusinessConvenience;
                    }
                    else
                    {
                        var booking_conveniences = [
                            {
                                _id: null,
                                id: null,
                                convenience: "Self Drop",
                                charges: 0
                            },
                            {
                                _id: null,
                                id: null,
                                convenience: "Pickup",
                                charges: 0
                            },
                            {
                                _id: null,
                                id: null,
                                convenience: "Doorstep",
                                charges: 0
                            },
                            {
                                _id: null,
                                id: null,
                                convenience: "Towing",
                                charges: 0 
                            },
                            {
                                _id: null,
                                id: null,
                                convenience: "Flatbed Towing",
                                charges: 0
                            }
                        ];
                    }

                    var rating = await Review.find({ business: management.business}).exec();
                    rating =  _.meanBy(rating, (p) => p.rating);

                    if(management.business.equals(userId))
                    {
                        var user = await User.findOne({_id:management.business}).exec();
                        data = {
                            _id : user.id,
                            name : user.name,
                            username : user.username,
                            email : user.email,
                            contact_no : user.contact_no,
                            avatar : user.avatar,
                            avatar_address: user.avatar_address,
                            account_info : user.account_info,
                            address : user.address,
                            coordinates : user.geometry,
                            business_info: user.business_info,
                            joined: moment(user.created_at).tz(req.headers['tz']).format('ll'),
                            total_rating: parseFloat(rating.toFixed(1)),
                            optional_info:user.optional_info,
                            socialite:user.socialite,
                            agent: user.agent,
                            bank_details: user.bank_details,
                            is_chat_active: user.device.length > 0 ? true:false,
                            timing: await BusinessTiming.find({business:user._id}).select('-created_at -updated_at').exec(),
                            business_gallery: await BusinessGallery.find({business:user._id}).select('-created_at -updated_at').exec(),
                            is_bookmarked: user.is_bookmarked,
                            booking_conveniences : booking_conveniences,
                            totalViews: await ProfileView.find({profile: user._id}).count().exec()
                        }

                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "success",
                            responseData: data
                        });
                    }
                    else
                    {
                        var user = await User.findOne({_id:userId}).exec();
                        data = {
                            _id : user.id,
                            name : user.name,
                            username : user.username,
                            email : user.email,
                            contact_no : user.contact_no,
                            avatar : user.avatar,
                            avatar_address: user.avatar_address,
                            account_info : user.account_info,
                            address : user.address,
                            coordinates : user.geometry,
                            business_info: user.business_info,
                            joined: moment(user.created_at).tz(req.headers['tz']).format('ll'),
                            total_rating: rating,
                            optional_info:user.optional_info,
                            socialite:user.socialite,
                            agent: user.agent,
                            bank_details: user.bank_details,
                            is_chat_active: user.device.length > 0 ? true:false,
                            timing: await BusinessTiming.find({business:user._id}).select('-created_at -updated_at').exec(),
                            business_gallery: await BusinessGallery.find({business:user._id}).select('-created_at -updated_at').exec(),
                            is_bookmarked: user.is_bookmarked,
                            booking_conveniences : booking_conveniences,
                            totalViews: await ProfileView.find({profile: user._id}).count().exec()
                        };

                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "success",
                            responseData: data
                        });
                    }
                }
                else
                {
                    res.status(400).json({
                        responseCode: 400,
                        responseMessage: "User not found",
                        responseData: data
                    })
                }
            }

            if(user.account_info.type=="user")
            {
                var points = 0;
                var level =1;
                var gallerySize = 0;
                var media=[];

                var ti=0
                await Post.find({user:user._id, status: true}).populate('thumbnails').sort({created_at: -1}).cursor().eachAsync(async(post) => {
                    var thumbnails =  post.thumbnails;
                    gallerySize = gallerySize + thumbnails.length;
                    
                    thumbnails.forEach(function(t){
                        if(ti<6){
                            media.push({
                                _id: t._id,
                                id: t._id,
                                post: t.post,
                                caption: t.caption,
                                day: t.day,
                                file: t.file,
                                type: t.type,
                                place: t.place,
                                file_address: t.file_address,
                                preview_address: t.preview_address,
                            });
                        }

                        ti = ti+1;
                    });  
                });
            
                await Point.find({user:user._id,type:"credit"}).cursor().eachAsync(async(u) => {
                    points = points+u.points;
                });

                if(points>=50 && points<=2999)
                {
                    level = 1;
                }
                else if(points>=3000 && points<=6999)
                {
                    level = 2;
                }
                else if(points>=7000 && points<=11999)
                {
                    level = 3;
                }
                else if(points>=12000 && points<=15999)
                {
                    level = 4;
                }
                else if(points >= 16000)
                {
                    level = 5;
                }
        
                data = {
                    _id: user._id,
                    id: user.id,
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    contact_no: user.contact_no,
                    avatar_address: user.avatar_address,
                    account_info: user.account_info,
                    address: user.address,
                    optional_info: user.optional_info,                   
                    joined: moment(user.created_at).tz(req.headers['tz']).format("MMM, YYYY"),
                    socialite:user.socialite,
                    totalViews: await ProfileView.find({profile: user._id}).count().exec(),
                    totalPosts: await Post.find({user: user._id}).count().exec(),
                    followers: await Follow.find({follow: user._id}).count().exec(),
                    followings: await Follow.find({user: user._id}).count().exec(),
                    is_following: user.is_following,
                    is_followed: await Follow.find({user:user._id,follow:decoded.user}).count().exec() > 0 ? true:false,
                    is_chat_active: user.device.length > 0 ? true:false,
                    points: {
                        level: level,
                        points: Math.ceil(points)
                    },
                    gallerySize: gallerySize-5,
                    gallery: media,
                    agent: user.agent,
                }

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "success",
                    responseData: data
                });
            }
        }
        else
        {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "The phone number that you've entered doesn't match any account.",
                responseData: {}
            })
        }
    }
});

*/

router.get('/username/detail', xAccessToken.token, async function (req, res, next) {
    var rules = {
        username: 'required',
    };

    var validation = new Validator(req.query, rules);

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
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);

        var data = [];
        var cars = [];
        var username = req.query.username;

        const user = await User.findOne({ username: username }).exec();

        if (user) {
            if (user.account_info.type == "business") {
                await Car.find({ user: user._id, status: true })
                    .populate('thumbnails')
                    .populate('bookmark')
                    .populate({ path: 'user', select: 'name username avatar avatar_address gender socialite account_info address' })
                    .cursor().eachAsync(async (doc) => {
                        cars.push({
                            __v: 0,
                            _id: doc._id,
                            id: doc.id,
                            title: doc.title,
                            variant: doc.variant,
                            model: doc.model,
                            price: doc.price,
                            accidental: doc.accidental,
                            body_style: doc.body_style,
                            description: doc.description,
                            driven: doc.driven,
                            carId: doc.carId,
                            fuel_type: doc.fuel_type,
                            insurance_info: doc.insurance_info,
                            location: doc.location,
                            manufacture_year: doc.manufacture_year,
                            mileage: doc.mileage,
                            owner: doc.owner,
                            price: doc.price,
                            registration_no: doc.registration_no,
                            service_history: doc.service_history,
                            transmission: doc.transmission,
                            vehicle_color: doc.vehicle_color,
                            vehicle_status: doc.vehicle_status,
                            geometry: doc.geometry,
                            link: "/car/" + slugify(doc.title + " " + doc._id),
                            publish: doc.publish,
                            status: doc.status,
                            premium: doc.premium,
                            is_bookmarked: doc.is_bookmarked,
                            thumbnails: doc.thumbnails,
                            user: doc.user,
                            created_at: moment(doc.created_at).tz(req.headers['tz']).format('ll'),
                            updated_at: moment(doc.updated_at).tz(req.headers['tz']).format('ll'),
                        });
                    });

                const totalStockCount = await Car.count({ user: user._id }).exec();

                const publishedStockCount = await Car.count({ user: user._id, publish: true }).exec();

                var product = await BusinessProduct.find({ business: user._id }).populate('thumbnails').populate('category').populate('business').exec();

                const totalProductCount = await BusinessProduct.count({ business: user._id }).exec();

                const publishedProductCount = await BusinessProduct.count({ business: user._id, publish: true }).exec();

                var offer = await BusinessOffer.find({ business: user._id }).exec();

                const totalOfferCount = await BusinessOffer.count({ business: user._id }).exec();

                const publishedOfferCount = await BusinessOffer.count({ business: user._id, publish: true }).exec();

                var gallery = await BusinessGallery.find({ business: user._id }).exec();

                var timing = await BusinessTiming.find({ business: user._id }).exec();

                var review = await Review.find({ business: user._id }).populate('user', 'name username avatar').exec();

                var bookmarkBusiness = await BookmarkBusiness.count({ business: user._id, user: decoded.user }).exec();

                if (bookmarkBusiness == 0) {
                    var is_bookmarked = false;
                } else {
                    var is_bookmarked = true;
                }

                data.push({
                    _id: user.id,
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    contact_no: user.contact_no,
                    avatar: user.avatar,
                    avatar_address: user.avatar_address,
                    account_info: user.account_info,
                    address: user.address,
                    coordinates: user.geometry,
                    optional_info: user.optional_info,
                    business_info: user.business_info,
                    created_at: user.created_at,
                    updated_at: user.updated_at,
                    joined: moment(user.created_at).tz(req.headers['tz']).format('ll'),
                    careager_rating: user.careager_rating,
                    business_info: user.business_info,
                    socialite: user.socialite,
                    business_stocks: {
                        total: totalStockCount,
                        published: publishedStockCount,
                        stocks: cars,
                    },
                    business_products: {
                        total: totalProductCount,
                        published: publishedProductCount,
                        products: product,
                    },
                    offers: {
                        total: totalOfferCount,
                        published: publishedOfferCount,
                        offers: offer,
                    },
                    timing: timing,
                    total_rating: 0,
                    business_ratings: review,
                    business_gallery: gallery,
                    is_bookmarked: is_bookmarked,
                });

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "success",
                    responseData: data
                })
            }

            if (user.account_info.type == "user") {
                var points = 0;
                var level = 0;
                var likeBrands = [];
                var media = [];
                var is_following = false;
                var is_liked = false;

                await Automaker.find({}).cursor().eachAsync(async (maker) => {
                    var like = await BrandLike.find({ user: user._id, automaker: maker._id }).count().exec();

                    if (like) {
                        is_liked = true;
                    }
                    else {
                        is_liked = false;
                    }

                    likeBrands.push({
                        _id: maker._id,
                        id: maker._id,
                        maker: maker.maker,
                        logo: "https://s3.ap-south-1.amazonaws.com/" + config.BUCKET_NAME + "/car/" + maker.logo,
                        value: maker.value,
                        is_liked: is_liked
                    });
                });

                var cars = await Car.find({ user: user._id, status: true }).populate('thumbnails').populate('user').exec();

                const totalStockCount = await Car.count({ user: user._id }).exec();

                var review = await Review.find({ user: user._id }).count().exec();

                var modelReview = await ModelReview.find({ user: user._id }).count().exec();

                var posts = await Post.find({ user: user._id }).count().exec();

                var bookings = await Booking.find({ user: user._id, is_services: true }).count().exec();

                var followers = await Follow.find({ user: user._id }).count().exec();

                var followings = await Follow.find({ follow: user._id }).count().exec();

                await Post.find({ user: user._id }).populate('thumbnails').cursor().eachAsync(async (post) => {
                    post.thumbnails.forEach(function (t) {
                        media.push({
                            _id: t._id,
                            id: t._id,
                            post: t.post,
                            caption: t.caption,
                            day: t.day,
                            file: t.file,
                            place: t.place,
                            file_address: t.file_address
                        });
                    });
                });

                await Follow.find({ follow: user._id, user: decoded.user }).cursor().eachAsync(async (follow) => {
                    if (follow === null) {
                        is_following = false
                    }
                    else {
                        is_following = true
                    }
                });

                await Point.find({ user: user._id, type: "credit" }).cursor().eachAsync(async (u) => {
                    points = points + user.points;
                });

                if (points >= 50 && points <= 2999) {
                    level = 1;
                }
                else if (points >= 3000 && points <= 6999) {
                    level = 2;
                }
                else if (points >= 7000 && points <= 11999) {
                    level = 3;
                }
                else if (points >= 12000 && points <= 15999) {
                    level = 4;
                }
                else if (points >= 16000) {
                    level = 5;
                }

                var pointsInfo = {
                    level: level,
                    points: points
                };


                data.push({
                    _id: user._id,
                    id: user.id,
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    contact_no: user.contact_no,
                    avatar_address: "https://s3.ap-south-1.amazonaws.com/" + config.BUCKET_NAME + "/avatar/" + user.avatar_address,
                    avatar: user.avatar,
                    account_info: user.account_info,
                    address: user.address,
                    coordinates: user.geometry,
                    optional_info: user.optional_info,
                    created_at: user.created_at,
                    updated_at: user.updated_at,
                    joined: moment(user.created_at).tz(req.headers['tz']).format('ll'),
                    socialite: user.socialite,
                    followers: followers,
                    followings: followings,
                    is_following: is_following,
                    points: pointsInfo,
                    garage: cars,
                    gallery: media,
                    likes: likeBrands,
                    totalPost: posts,
                    totalBooking: bookings,
                    businessReview: review,
                    totalModelReview: modelReview,
                    totalInGarage: totalStockCount,
                    totalBusinessAdded: 0,
                });

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "success",
                    responseData: data
                })
            }
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Unprocessable Entity",
                responseData: data
            })
        }
    }
});

router.get('/timing', xAccessToken.token, async function (req, res, next) {
    res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: {
            open: ["12:00 AM", "12:30 AM", "01:00 AM", "01:30 AM", "02:00 AM", "02:30 AM", "03:00 AM", "03:30 AM", "04:00 AM", "04:30 AM", "05:00 AM", "05:30 AM", "06:00 AM", "06:30 AM", "07:00 AM", "07:30 AM", "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM", "08:00 PM", "08:30 PM", "09:00 PM", "09:30 PM", "10:00 PM", "10:30 PM", "11:00 PM", "11:30 PM"],
            close: ["12:00 AM", "12:30 AM", "01:00 AM", "01:30 AM", "02:00 AM", "02:30 AM", "03:00 AM", "03:30 AM", "04:00 AM", "04:30 AM", "05:00 AM", "05:30 AM", "06:00 AM", "06:30 AM", "07:00 AM", "07:30 AM", "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM", "08:00 PM", "08:30 PM", "09:00 PM", "09:30 PM", "10:00 PM", "10:30 PM", "11:00 PM", "11:30 PM"]
        }
    });
});

router.get('/timing', xAccessToken.token, async function (req, res, next) {
    res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: ["12:00 AM", "12:30 AM", "01:00 AM", "01:30 AM", "02:00 AM", "02:30 AM", "03:00 AM", "03:30 AM", "04:00 AM", "04:30 AM", "05:00 AM", "05:30 AM", "06:00 AM", "06:30 AM", "07:00 AM", "07:30 AM", "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM", "08:00 PM", "08:30 PM", "09:00 PM", "09:30 PM", "10:00 PM", "10:30 PM", "11:00 PM", "11:30 PM"],
    });
});

router.post('/review/add', xAccessToken.token, async function (req, res, next) {
    var currentDate = new Date();

    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    req.body.user = decoded.user;
    req.body.business = req.body.business_id;

    req.body.created_at = currentDate;
    req.body.updated_at = currentDate;

    Review.create(req.body).then(async function (review) {
        res.status(200).json({
            responseCode: 200,
            responseMessage: "Reviewed successfully",
            responseData: {
                res: {
                    next: "",
                    errors: "",
                    rld: false
                },
            }
        });
    });
});

router.post('/claim/business', async function (req, res, next) {
    var rules = {
        business: 'required',
        phone: 'required',
        description: 'required',
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
        var currentDate = new Date();
        req.body.created_at = currentDate;
        req.body.updated_at = currentDate;
        req.body.business = req.body.business;

        ClaimBusiness.create(req.body).then(async function (claim) {
            res.status(200).json({
                responseCode: 200,
                responseMessage: "We will contact you soon",
                responseData: {
                    res: {
                        next: "",
                        errors: "",
                        rld: false
                    },
                }
            });
        });
    }
});

var upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: config.BUCKET_NAME + '/avatar',
        acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: function (req, file, cb) {
            // console.log(file)
            let extArray = file.mimetype.split("/");
            let extension = extArray[extArray.length - 1];
            if (extension == 'png' || extension == 'jpg' || extension == 'jpeg' || extension == 'gif') {
                cb(null, { fieldName: file.fieldname });
            } else {
                // res.json("Invalid")
            }
        },
        key: function (req, file, cb) {
            let extArray = file.mimetype.split("/");
            let extension = extArray[extArray.length - 1];
            cb(null, Date.now().toString() + "." + extension)
        }
    })
}).single('media');

router.post('/local-business/add', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    upload(req, res, async function (error) {
        if (error) {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Error Occured",
                responseData: {},
            });
        }
        else {
            if (req.file == undefined) {
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Upload a avatar image",
                    responseData: {},
                });
            } else {
                req.body.password = req.body.contact_no;
                req.body.socialite = "";
                req.body.avatar = req.file.key;
                req.body.avatar = "default.png";
                req.body.optional_info = "";
                var country = await Country.findOne({ _id: "5a7589744e470c7858eb454d" }).exec();

                req.body.account_info = {
                    type: "business",
                    status: "Complete",
                    added_by: decoded.user,
                    phone_verified: false,
                    verified_account: false,
                    is_page: false,
                    approved_by_admin: false,
                };
                if (req.body.longitude != '' && req.body.latitude != '') {
                    req.body.geometry = [req.body.longitude, req.body.latitude];
                }
                else {
                    req.body.geometry = [0, 0];
                }

                if (country != 0) {
                    req.body.address = {
                        country: country._id,
                        timezone: country.timezone[0],
                        location: req.body.location
                    };
                }

                req.body.username = shortid.generate();

                //req.body.username=req.body.username;
                req.body.device = [];
                req.body.otp = Math.floor(Math.random() * 90000) + 10000;
                req.body.isCarEager = false;
                req.body.uuid = uuidv1();

                req.body.business_info = {
                    business_category: req.body.category,
                    company: req.body.company
                };

                req.body.optional_info = {
                    email: req.body.secondary_email,
                    contact_no: req.body.secondary_contact_no
                };

                User.create(req.body).then(async function (user) {
                    const payload = {
                        user: user['_id']
                    };

                    var days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

                    for (var i = 0; i < 7; i++) {
                        var timing = new BusinessTiming({
                            business: user._id,
                            day: days[i],
                            open: '09:30 AM',
                            close: '03:30 PM',
                            is_closed: 0,
                            created_at: new Date(),
                            updated_at: new Date(),
                        });
                        timing.save();
                    }

                    var point = {
                        user: user._id,
                        activity: "coin",
                        tag: "addLocalBusiness",
                        points: 10,
                        source: user._id,
                        status: true
                    }

                    fun.addPoints(point);

                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Thanks for added a new business",
                        responseData: {},
                    });
                });

            }
        }
    });
});

router.get('/business-near-me', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var business = decoded.user;

    var data = [];
    var geo = [parseFloat(req.query.lng), parseFloat(req.query.lat)];

    var maxDistance = req.query.range * 100 || 100;

    // we need to convert the distance to radians
    // the raduis of Earth is approximately 6371 kilometers
    maxDistance /= 6371;


    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }
    var page = Math.max(0, parseInt(page));

    await User.find({
        geometry: {
            $near: [parseFloat(req.query.lng), parseFloat(req.query.lat)],
            $maxDistance: maxDistance
        },
        'account_info.type': 'business',
        'account_info.status': 'Active'
    })
        .sort({ created_at: -1 }).limit(config.perPage)
        .skip(config.perPage * page)
        .cursor().eachAsync(async (u) => {
            data.push({
                _id: u.id,
                name: u.name,
                username: u.username,
                email: u.email,
                contact_no: u.contact_no,
                avatar_address: u.avatar_address,
                account_info: u.account_info,
                address: u.address,
                geometry: u.geometry,
                business_info: u.business_info,
                joined: u.created_at,
                careager_rating: u.careager_rating,
            });
        });

    res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: data,
    });
});

router.get('/reviews/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }

    var page = Math.max(0, parseInt(page));
    var reviews = await Review.find({ user: decoded.user }).populate('user').sort({ created_at: -1 }).limit(config.perPage).skip(config.perPage * page).exec();

    res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: reviews,
    })
});

router.get('/bookings/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var bookings = [];
    totalResult = 0;
    if (req.query.page == undefined) {
        var page = 0;
    }
    else {
        var page = req.query.page;
    }

    var page = Math.max(0, parseInt(page));
    var userType = await User.findById(user).exec();
    var queries = new Object();
    var sortBy = new Object();

    if (userType) {
        if (req.query.sortBy) {
            if (req.query.sortBy == "date") {
                sortBy = { date: -1 }
            }
        }
        else {
            sortBy = { created_at: -1 }
        }

        var thumbnail = []

        await Booking.find({ 'user': user, status: { $in: ["Cancelled", "Confirmed", "Pending", "Rejected", "Closed", "Completed", "Failure", "In-Process", "Dissatisfied", "Approval", "Approved", "Failed", "JobInitiated", "JobOpen", "EstimatePrepared", "ApprovalAwaited", "StartWork", "CloseWork", "CompleteWork", "Rework", "Ready"] }, is_services: true })
            .populate({ path: 'business', populate: { path: 'user', select: "_id id name contact_no" } })
            .populate({ path: 'car', select: '_id id title registration_no ic rc', populate: { path: 'thumbnails' } })
            .sort(sortBy).skip(config.perPage * page).limit(config.perPage)
            .cursor().eachAsync(async (booking) => {

                var car = null;
                var address = await Address.findOne({ _id: booking.address }).exec();
                if (booking.car) {
                    var thumbnail = []
                    if (booking.car.thumbnails[0]) {
                        var thumbnail = [booking.car.thumbnails[0]];
                    }

                    car = {
                        title: booking.car.title,
                        _id: booking.car._id,
                        id: booking.car.id,
                        ic: booking.car.ic,
                        rc: booking.car.rc,
                        ic_address: booking.car.ic_address,
                        rc_address: booking.car.rc_address,
                        registration_no: booking.car.registration_no,
                        thumbnails: thumbnail
                    };
                }

                bookings.push({
                    _id: booking._id,
                    id: booking._id,
                    car: car,
                    business: {
                        name: booking.business.name,
                        _id: booking.business._id,
                        id: booking.business.id,
                        contact_no: booking.business.contact_no
                    },
                    services: booking.services,
                    convenience: booking.convenience,
                    date: moment(booking.date).tz(req.headers['tz']).format('ll'),
                    time_slot: booking.time_slot,
                    status: booking.status,
                    booking_no: booking.booking_no,
                    payment: booking.payment,
                    due: booking.due,
                    address: address,
                    txnid: booking.txnid,
                    __v: booking.__v,
                    address: address,
                    created_at: booking.created_at,
                    updated_at: booking.updated_at,
                });

            });

        res.status(200).json({
            responseCode: 200,
            responseMessage: "",
            responseData: bookings,
        });
    }
    else {
        res.status(400).json({
            totalResult: 0,
            responseCode: 400,
            responseMessage: "User not found",
            responseData: {},
        });
    }
});

router.get('/booking/details', async function (req, res, next) {
    if (req.query.by == "id") {
        var query = { _id: req.query.booking }
    }
    else if (req.query.by == "lead") {
        var query = { lead: req.query.booking };
    }
    else {
        var query = { booking_no: req.query.booking };
    }

    var bookings = [];
    var booking = await Booking.findOne(query)
        .populate({ path: 'address' })
        .populate({ path: 'manager', select: "_id id name contact_no email" })
        .populate({ path: 'advisor', select: "_id id name contact_no email" })
        .populate({ path: 'user', select: "_id id name contact_no email account_info business_info careager_cash" })
        .populate({ path: 'business', select: "_id id name contact_no email business_info address bank_details" })
        .populate({ path: 'driver', select: "_id id name contact_no email" })
        .populate({ path: 'technician', select: "_id id name contact_no email" })
        .populate({ path: 'surveyor', select: "_id id name contact_no email" })
        .populate({ path: 'lead', select: "_id id name contact_no email source category" })
        .populate({ path: 'outbound_lead', select: "_id id name contact_no email assignee category" })
        .populate({ path: 'car', select: '_id id title variant _automaker automaker registration_no ic rc vin engine_no insurance_info manufacture_year purchased_year' })
        .exec();
    // console.log("Cash Available = " + booking.user.careager_cash)
    if (booking) {
        var car = null;
        var manager = null;
        var advisor = null;
        var driver = null;
        var technician = null;
        var surveyor = null;
        var customer_requirements = [];
        var address = null;
        var recording = "";
        var lead = null;

        if (booking.car) {
            if (booking.car._automaker == "") {
                var automaker = await Automaker.findOne({ _id: booking.car.automaker }).exec();
                if (automaker) {
                    Car.findOneAndUpdate({ _id: booking.car._id }, { $set: { _automaker: automaker.maker } }, { new: false }, async function (err, doc) {
                        if (err) {
                            // console.log(err)
                        }
                    })
                }
            }

            car = {
                title: booking.car.title,
                _id: booking.car._id,
                id: booking.car.id,
                vin: booking.car.vin,
                engine_no: booking.car.engine_no,
                registration_no: booking.car.registration_no,
                ic_address: booking.car.ic_address,
                rc_address: booking.car.rc_address,
                variant: booking.car.variant,
                manufacture_year: booking.car.manufacture_year,
                purchased_year: booking.car.purchased_year,
            }
        }

        if (booking.manager) {
            var email = "";
            if (booking.manager.email) {
                email = booking.manager.email;
            }

            manager = {
                name: booking.manager.name,
                _id: booking.manager._id,
                id: booking.manager.id,
                contact_no: booking.manager.contact_no,
                email: email
            }
        }

        if (booking.advisor) {
            var email = "";
            if (booking.advisor.email) {
                email = booking.advisor.email;
            }
            advisor = {
                name: booking.advisor.name,
                _id: booking.advisor._id,
                id: booking.advisor.id,
                contact_no: booking.advisor.contact_no,
                email: email
            }
        }
        if (booking.lead) {
            lead = {
                name: booking.lead.name,
                _id: booking.lead._id,
                id: booking.lead.id,
                contact_no: booking.lead.contact_no,
                source: booking.lead.source,
            }
        }
        var outbound_lead = null
        if (booking.outbound_lead) {
            // console.log("Outbound Lead")
            var outbound = await OutBoundLead.findById(booking.outbound_lead).populate({ path: 'assignee', select: 'name contact_no id _id email' }).select('name email contact_no assignee').exec();
            if (outbound) {
                outbound_lead = {
                    name: outbound.name,
                    _id: outbound._id,
                    id: outbound.id,
                    contact_no: outbound.contact_no,
                    category: outbound.category,

                    assignee: outbound.assignee
                }
            }

        }
        if (booking.driver) {
            var email = "";
            if (booking.driver.email) {
                email = booking.driver.email;
            }
            driver = {
                name: booking.driver.name,
                _id: booking.driver._id,
                id: booking.driver.id,
                contact_no: booking.driver.contact_no,
                email: email
            }
        }

        if (booking.technician) {
            var email = "";
            if (booking.technician.email) {
                email = booking.technician.email;
            }

            technician = {
                name: booking.technician.name,
                _id: booking.technician._id,
                id: booking.technician.id,
                contact_no: booking.technician.contact_no,
                email: email
            }
        }

        if (booking.surveyor) {
            var email = "";
            if (booking.surveyor.email) {
                email = booking.surveyor.email;
            }

            surveyor = {
                name: booking.surveyor.name,
                _id: booking.surveyor._id,
                id: booking.surveyor.id,
                contact_no: booking.surveyor.contact_no,
                email: email
            }
        }

        if (booking.customer_requirements) {
            customer_requirements = booking.customer_requirements;
        }

        var tax_type = "GST";

        var bookingService = [];



        var careager_cash = await q.all(fun.getBookingCarEagerCash(booking._id));
        // var user_careager_cash = await q.all(fun.getCarEagerCash(booking._id));

        var services = booking.services;

        for (var i = 0; i < services.length; i++) {
            var part = [];
            var labours = [];
            var opening_fitting = [];

            var part_list = services[i].parts;
            var labour_list = services[i].labour;
            var of_list = services[i].opening_fitting;

            if (part_list) {
                for (var p = 0; p < part_list.length; p++) {
                    var total = 0;
                    var tax_info = await Tax.findOne({ rate: part_list[p].tax_rate, type: tax_type }).exec();
                    var tax = [];
                    var rate = part_list[p].rate;
                    var amount = (parseFloat(part_list[p].rate) * parseFloat(part_list[p].quantity));
                    var tax_rate = tax_info.detail;
                    var discount_total = 0;
                    var base = amount;

                    var dep = 0;

                    /*if(services[i].claim==true)
                    {
                        if(parseFloat(part_list[p].insurance_dep)<=0 && parseFloat(part_list[p].customer_dep)<=0)
                        {
                            dep = 0
                        }
                        else
                        {
                            if(parseFloat(part_list[p].customer_dep) <= 0 && parseFloat(part_list[p].insurance_dep<=100))
                            {
                                dep = 100
                            }
                            else
                            {
                                dep = 100-parseFloat(part_list[p].customer_dep);
                            }
                        }

                        amount = amount-(amount*dep/100);
                        dep = base - amount;
                    }*/

                    if (part_list[p].discount) {
                        discount_total = part_list[p].discount;
                        amount = amount - parseFloat(discount_total.toFixed(2))
                    }


                    if (part_list[p].amount_is_tax == "exclusive") {
                        var tax_on_amount = amount;
                        if (tax_rate.length > 0) {
                            for (var r = 0; r < tax_rate.length; r++) {
                                if (tax_rate[r].rate != tax_info.rate) {
                                    var t = tax_on_amount * (tax_rate[r].rate / 100);
                                    amount = amount + t; parseFloat
                                    tax.push({
                                        tax: tax_rate[r].tax,
                                        rate: tax_rate[r].rate,
                                        amount: parseFloat(t.toFixed(2))
                                    });
                                }
                                else {
                                    var t = tax_on_amount * (tax_rate[r].rate / 100);
                                    amount = amount + t;
                                    tax.push({
                                        tax: tax_info.tax, tax_rate: tax_info.rate,
                                        rate: tax_info.rate,
                                        amount: parseFloat(t.toFixed(2))
                                    });
                                }
                            }
                        }
                        total = total + amount;
                    }

                    if (part_list[p].amount_is_tax == "inclusive") {
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
                                        tax: tax_info.tax, tax_rate: tax_info.rate,
                                        rate: tax_info.rate,
                                        amount: parseFloat(t.toFixed(2))
                                    });
                                }
                            }
                        }

                        //base = base - discount_total - dep; 
                        total = total + amount;
                    }

                    var tax_amount = total - parseFloat(base.toFixed(2));

                    var tax_details = {
                        tax: tax_info.tax,
                        tax_rate: tax_info.rate,
                        rate: tax_info.rate,
                        amount: total,
                        detail: tax
                    }

                    if (parseFloat(part_list[p].customer_dep) == 0 && parseFloat(part_list[p].insurance_dep) == 0) {
                        var customer_dep = 100;
                        var insurance_dep = 0;
                    }
                    else {
                        var customer_dep = parseFloat(part_list[p].customer_dep);
                        var insurance_dep = parseFloat(part_list[p].insurance_dep);
                    }

                    part.push({
                        _id: part_list[p]._id,
                        item: part_list[p].item,
                        source: part_list[p].source,
                        hsn_sac: part_list[p].hsn_sac,
                        part_no: part_list[p].part_no,
                        rate: parseFloat(part_list[p].rate),
                        quantity: parseFloat(part_list[p].quantity),
                        base: parseFloat(base.toFixed(2)),
                        amount: total,
                        discount: part_list[p].discount,
                        issued: part_list[p].issued,
                        customer_dep: customer_dep,
                        insurance_dep: insurance_dep,
                        tax_amount: parseFloat(_.sumBy(tax, x => x.amount).toFixed(2)),
                        amount_is_tax: part_list[p].amount_is_tax,
                        tax: tax_info.tax,
                        tax_rate: tax_info.rate,
                        tax_info: tax_details
                    });
                }
            }

            if (labour_list) {
                for (var l = 0; l < labour_list.length; l++) {
                    var total = 0;
                    var tax_info = await Tax.findOne({ rate: labour_list[l].tax_rate, type: tax_type }).exec();
                    var tax = [];
                    var rate = labour_list[l].rate;
                    var amount = parseFloat(labour_list[l].rate) * parseFloat(labour_list[l].quantity);
                    var tax_rate = tax_info.detail;
                    var discount_total = 0;
                    var base = amount;
                    var dep = 0;

                    /* if(services[i].claim==true)
                     {       
                         if(parseFloat(labour_list[l].insurance_dep)<=0 && parseFloat(labour_list[l].customer_dep)<=0)
                         {
                             dep = 0
                         }
                         else
                         {
                             if(parseFloat(labour_list[l].customer_dep) <= 0 && parseFloat(labour_list[l].insurance_dep<=100) )
                             {
                                 dep = 100
                             }
                             else
                             {
                                 dep = 100-parseFloat(labour_list[l].customer_dep);
                             }
                         }
 
                         amount = amount-(amount*dep/100);
                         dep = base- amount;
                     }*/

                    if (labour_list[l].discount) {
                        discount_total = labour_list[l].discount;
                        amount = amount - parseFloat(discount_total.toFixed(2))
                    }


                    if (labour_list[l].amount_is_tax == "exclusive") {
                        var tax_on_amount = amount;
                        if (tax_rate.length > 0) {
                            for (var r = 0; r < tax_rate.length; r++) {
                                if (tax_rate[r].rate != tax_info.rate) {
                                    var t = tax_on_amount * (tax_rate[r].rate / 100);
                                    amount = amount + t; parseFloat
                                    tax.push({
                                        tax: tax_rate[r].tax,
                                        rate: tax_rate[r].rate,
                                        amount: parseFloat(t.toFixed(2))
                                    });
                                }
                                else {
                                    var t = tax_on_amount * (tax_rate[r].rate / 100);
                                    amount = amount + t;
                                    tax.push({
                                        tax: tax_info.tax, tax_rate: tax_info.rate,
                                        rate: tax_info.rate,
                                        amount: parseFloat(t.toFixed(2))
                                    });
                                }
                            }
                        }
                        //total = total+amount;
                    }

                    if (labour_list[l].amount_is_tax == "inclusive") {
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
                                        tax_rate: tax_info.rate,
                                        rate: tax_info.rate,
                                        amount: parseFloat(t.toFixed(2))
                                    });
                                }
                            }
                        }

                        //base = base - discount_total - dep; 


                        total = total + amount;
                    }

                    var tax_amount = total - parseFloat(base.toFixed(2));

                    var tax_details = {
                        tax: tax_info.tax,
                        rate: tax_info.rate,
                        amount: total,
                        detail: tax
                    };

                    labours.push({
                        _id: labour_list[l]._id,
                        item: labour_list[l].item,
                        source: labour_list[l].source,
                        rate: parseFloat(labour_list[l].rate),
                        quantity: parseFloat(labour_list[l].quantity),
                        base: parseFloat(base.toFixed(2)),
                        amount: amount,
                        discount: labour_list[l].discount,
                        customer_dep: parseFloat(labour_list[l].customer_dep),
                        insurance_dep: parseFloat(labour_list[l].insurance_dep),
                        tax_amount: parseFloat(_.sumBy(tax, x => x.amount).toFixed(2)),
                        amount_is_tax: labour_list[l].amount_is_tax,
                        tax: tax_info.tax,
                        tax_rate: tax_info.rate,
                        tax_info: tax_details
                    });
                }
            }

            if (of_list) {
                for (var o = 0; o < of_list.length; o++) {
                    var total = 0;
                    var tax_info = await Tax.findOne({ rate: of_list[o].tax_rate, type: tax_type }).exec();
                    var tax = [];
                    var rate = of_list[o].rate;
                    var amount = (parseFloat(of_list[o].rate) * parseFloat(of_list[o].quantity));
                    var tax_rate = tax_info.detail;
                    var discount_total = 0;
                    var base = amount;
                    var dep = 0;


                    /*if(services[i].claim == true)
                    {
                        if(parseFloat(of_list[o].insurance_dep)<=0 && parseFloat(of_list[o].customer_dep)<=0)
                        {
                            dep = 0
                        }
                        else
                        {
                            if(parseFloat(of_list[o].customer_dep) <= 0 && parseFloat(of_list[o].insurance_dep<=100) )
                            {
                                dep = 100
                            }
                            else
                            {
                                dep = 100-parseFloat(of_list[o].customer_dep);
                            }
                        }

                        amount = amount-(amount*dep/100);
                        dep = base - amount;
                    }*/

                    if (of_list[o].discount) {
                        var discount_total = of_list[o].discount;
                        amount = amount - parseFloat(discount_total.toFixed(2))
                    }



                    if (of_list[o].amount_is_tax == "exclusive") {
                        var tax_on_amount = amount;
                        if (tax_rate.length > 0) {
                            for (var r = 0; r < tax_rate.length; r++) {
                                if (tax_rate[r].rate != tax_info.rate) {
                                    var t = tax_on_amount * (tax_rate[r].rate / 100);
                                    amount = amount + t; parseFloat
                                    tax.push({
                                        tax: tax_rate[r].tax,
                                        rate: tax_rate[r].rate,
                                        amount: parseFloat(t.toFixed(2))
                                    });
                                }
                                else {
                                    var t = tax_on_amount * (tax_rate[r].rate / 100);
                                    amount = amount + t;
                                    tax.push({
                                        tax: tax_info.tax, tax_rate: tax_info.rate,
                                        rate: tax_info.rate,
                                        amount: parseFloat(t.toFixed(2))
                                    });
                                }
                            }
                        }
                        total = total + amount;
                    }

                    if (of_list[o].amount_is_tax == "inclusive") {
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
                                        tax: tax_info.tax, tax_rate: tax_info.rate,
                                        rate: tax_info.rate,
                                        amount: parseFloat(t.toFixed(2))
                                    });
                                }
                            }
                        }

                        //base = base - discount_total - dep; 

                        total = total + amount;
                    }

                    var tax_details = {
                        tax: tax_info.tax,
                        rate: tax_info.rate,
                        amount: total,
                        detail: tax
                    }

                    var tax_amount = total - parseFloat(base.toFixed(2));

                    opening_fitting.push({
                        _id: of_list[o]._id,
                        item: of_list[o].item,
                        source: of_list[o].source,
                        rate: parseFloat(of_list[o].rate),
                        quantity: parseFloat(of_list[o].quantity),
                        base: parseFloat(base.toFixed(2)),
                        amount: total,
                        discount: parseFloat(of_list[o].discount),
                        customer_dep: parseFloat(of_list[o].customer_dep),
                        insurance_dep: parseFloat(of_list[o].insurance_dep),
                        tax_amount: parseFloat(_.sumBy(tax, x => x.amount).toFixed(2)),
                        amount_is_tax: of_list[o].amount_is_tax,
                        tax: tax_info.tax, tax_rate: tax_info.rate,
                        tax_info: tax_details
                    });
                }
            }

            var parts_visible = true;
            var firstLead = await Lead.find({ contact_no: booking.user.contact_no }).exec();
            // return res.json({ abhi: firstLead })
            if (firstLead[0]) {
                lead = {
                    name: firstLead[0].name,
                    _id: firstLead[0]._id,
                    id: firstLead[0].id,
                    contact_no: firstLead[0].contact_no,
                    source: firstLead[0].source,
                }
            }
            bookingService.push({
                _id: services[i]._id,
                source: services[i].source,
                service: services[i].service,
                mileage: services[i].mileage,
                parts: part,
                labour: labours,
                opening_fitting: opening_fitting,
                hours: services[i].hours,
                parts_visible: parts_visible,
                quantity: services[i].quantity,
                discount: _.sumBy(labours, x => x.discount) + _.sumBy(part, x => x.discount) + _.sumBy(opening_fitting, x => x.discount),
                description: services[i].description,
                cost: _.sumBy(part, x => x.amount) + _.sumBy(labours, x => x.amount) + services[i].of_cost,
                labour_cost: _.sumBy(labours, x => x.amount),
                of_cost: _.sumBy(opening_fitting, x => x.amount),
                part_cost: _.sumBy(part, x => x.amount),
                exceeded_cost: parseFloat(services[i].exceeded_cost),
                part_cost_editable: services[i].part_cost_editable,
                labour_cost_editable: services[i].labour_cost_editable,
                of_cost_editable: services[i].of_cost_editable,
                type: services[i].type,
                sub_category: services[i].sub_category,
                customer_approval: services[i].customer_approval,
                surveyor_approval: services[i].surveyor_approval,
                claim: services[i].claim,
                custom: services[i].custom,
            });
        }

        /*Booking.findOneAndUpdate({_id: booking._id}, {$set:{services:bookingService}}, {new: false},async function(err, doc){
            if(err){
                // console.log(err)
            }
        });*/

        var approved = _.filter(bookingService, customer_approval => customer_approval.customer_approval == true);

        var labour_cost = _.sumBy(approved, x => x.labour_cost);
        var part_cost = _.sumBy(approved, x => x.part_cost);
        var of_cost = _.sumBy(approved, x => x.of_cost);
        var discount_total = _.sumBy(approved, x => x.discount);

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

        var logs = booking.logs;
        var logsData = [];
        for (var i = 0; i < logs.length; i++) {
            // if(logs[i].reason)
            // console.log(logs[i].activity + "At Booking get" + logs.length)
            logsData.push({
                user: logs[i].user,
                name: logs[i].name,
                stage: logs[i].stage,
                activity: logs[i].activity,
                created_at: moment(logs[i].created_at).tz(req.headers['tz']).format('lll'),
                updated_at: moment(logs[i].updated_at).tz(req.headers['tz']).format('lll'),
            })
        }

        var remarks = booking.remarks;
        var remarksData = [];
        if (remarks) {
            for (var i = 0; i < remarks.length; i++) {

                // console.log("Added by" + remarks[i].added_by)
                if (remarks[i].added_by) {
                    var added_by = await User.findById(remarks[i].added_by).exec();
                    // console.log("Added by name" + added_by.name)
                    if (added_by) {
                        remarksData.push({
                            added_by: remarks[i].user,
                            name: added_by.name,
                            remark: remarks[i].remark,
                            created_at: moment(remarks[i].created_at).tz(req.headers['tz']).format('lll'),
                            updated_at: moment(remarks[i].updated_at).tz(req.headers['tz']).format('lll'),
                        })
                    }

                }
            }
        }

        var review = new Object();
        await Review.find({ booking: booking._id })
            .populate({ path: 'user', select: 'name username avatar avatar_address account_info' })
            .cursor().eachAsync(async (r) => {
                review = {
                    _id: r._id,
                    id: r._id,
                    business: r.business,
                    booking: r.booking,
                    review_points: r.review_points,
                    rating: r.rating,
                    review: r.review,
                    recommendation: r.recommendation,
                    type: r.type,
                    created_at: moment(r.created_at).tz(req.headers['tz']).format('ll'),
                    updated_at: moment(r.updated_at).tz(req.headers['tz']).format('ll'),
                    user: r.user
                }
            });

        var insurance_info = {
            policy_holder: "",
            insurance_company: "",
            policy_no: "",
            premium: 0,
            expire: "",
            branch: "",
            gstin: "",
            claim: false,
            cashless: false,
            accident_place: "",
            accident_date: null,
            accident_time: "",
            accident_cause: "",
            driver_accident: "",
            spot_survey: "",
            fir: "",
            policy_type: "",
            claim_no: "",
        }

        if (booking.insurance_info) {
            insurance_info = booking.insurance_info
            if (insurance_info.insurance_company) {
                let insuranceCompanyDetails = await InsuranceCompany.findOne({ company: insurance_info.insurance_company }).populate({ path: 'user', select: 'contact_no' }).lean();
                if (insuranceCompanyDetails) {
                    insurance_info.contact_no = insuranceCompanyDetails.user.contact_no;
                    insurance_info.ins_company_id = insuranceCompanyDetails.user._id
                }
            }
        }

        if (booking.status == "Rework") {
            booking.status = "In-Process"
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
                business_info: booking.user.business_info,
                account_info: booking.user.account_info,
                careager_cash: booking.user.careager_cash
            },
            business: {
                name: booking.business.name,
                _id: booking.business._id,
                id: booking.business.id,
                contact_no: booking.business.contact_no,
                email: booking.business.email,
                business_info: booking.business.business_info,
                address: booking.business.address,
                bank_details: booking.business.bank_details,
            },
            outbound_lead: outbound_lead,
            advisor: advisor,
            lead: lead,
            manager: manager,
            driver: driver,
            technician: technician,
            surveyor: surveyor,
            services: bookingService,
            convenience: booking.convenience,
            date: moment(booking.date).tz(req.headers['tz']).format('ll'),
            time_slot: booking.time_slot,
            status: _.startCase(booking.status),
            _status: booking.status,
            sub_status: booking.sub_status,
            booking_no: booking.booking_no,
            job_no: booking.job_no,
            estimation_requested: booking.estimation_requested,
            customer_requirements: customer_requirements,
            insurance_info: insurance_info,
            address: booking.address,
            remarks: remarksData,
            payment: booking.payment,
            note: booking.note,
            due: booking.due,
            approved_payment: payment,
            approved_due: due,
            important: booking.important,
            fuel_level: booking.fuel_level,
            odometer: booking.odometer,
            delivery_date: moment(booking.delivery_date).tz(req.headers['tz']).format('ll'),
            delivery_time: booking.delivery_time,
            assets: booking.assets,
            qc: booking.qc,
            other_assets: booking.other_assets,
            with_tax: booking.with_tax,
            recording_address: recording,
            package: booking.package,
            settlement: booking.settlement,
            advance: booking.advance,
            booking: booking.booking,
            re_booking_no: booking.re_booking_no,
            is_rework: booking.is_rework,
            logs: _(logsData).groupBy(x => x.stage).map((value, key) => ({ stage: key, list: value })).value(),
            review: review,
            estimate_url: booking.estimate_url,
            // estimate_pdf: {
            //     url: booking.estimate_pdf.url,
            //     updated_at: moment(booking.estimate_pdf.updated_at).tz(req.headers['tz']).format('lll')
            // },
            estimate_pdf: booking.estimate_pdf,
            updated_at: booking.updated_at,
            created_at: moment(booking.created_at).tz(req.headers['tz']).format('lll'),
            // updated_at: moment(booking.updated_at).tz(req.headers['tz']).format('lll'),
        });

        res.status(200).json({
            responseCode: 200,
            responseMessage: 'Success',
            responseData: bookings,
        });
    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: 'booking not found',
            responseData: {},
        });
    }
});

router.get('/proforma/invoice', async function (req, res, next) {
    var rules = {
        booking: 'required',
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
        var labour_cost = 0;
        var part_cost = 0;
        var of_cost = 0;
        var due_amount = 0;
        var totalResult = 0;
        var bookingService = [];
        var business = req.headers['business'];
        var booking = await Booking.findById(req.query.booking)
            .populate({ path: 'address' })
            .populate({ path: 'advisor', select: "_id id name contact_no email" })
            .populate({ path: 'user', select: "_id id name contact_no email business_info" })
            .populate({ path: 'business', select: "_id id name contact_no email business_info address bank_details" })
            .populate({ path: 'car', select: '_id id title registration_no ic rc vin engine_no insurance_info' })
            .exec();

        if (booking) {

            fun.performaPdf(booking._id, booking.address, business);
            var tax_type = "GST";
            if (booking.address) {
                if (booking.address.state.toLowerCase() == booking.business.address.state.toLowerCase()) {
                    tax_type = "GST";
                }
                else {
                    tax_type = "IGST";
                }
            }
            var pick_up_charges = booking.payment.pick_up_charges;
            var policy_clause = booking.payment.policy_clause;
            var salvage = booking.payment.salvage;
            var paid_total = booking.payment.paid_total;

            var careager_cash = await q.all(fun.getBookingCarEagerCash(booking._id));

            var services = _.filter(booking.services, customer_approval => customer_approval.customer_approval == true);

            //     // console.log("6703 services.length = " + services.length)

            for (var i = 0; i < services.length; i++) {
                //        // console.log(i + " Loop")
                var part = [];
                var labours = [];
                var opening_fitting = [];

                var part_list = services[i].parts;
                var labour_list = services[i].labour;
                var of_list = services[i].opening_fitting;
                //        // console.log(i + " \nParts Length = " + part_list.length + " \labour_list Length = " + labour_list.length + " \of_list Length = " + of_list.length)

                if (part_list) {
                    for (var p = 0; p < part_list.length; p++) {
                        var total = 0;
                        var tax_info = await Tax.findOne({ rate: part_list[p].tax_rate, type: tax_type }).exec();
                        var tax = [];
                        var rate = part_list[p].rate;
                        var amount = (parseFloat(part_list[p].rate) * parseFloat(part_list[p].quantity));
                        var tax_rate = tax_info.detail;
                        var discount_total = 0;
                        var base = amount;

                        if (parseFloat(part_list[p].customer_dep) != null && parseFloat(part_list[p].insurance_dep) != null) {
                            var customer_dep = parseFloat(part_list[p].customer_dep);
                            var insurance_dep = parseFloat(part_list[p].insurance_dep)
                        }
                        else {
                            var customer_dep = 100;
                            var insurance_dep = 0;

                            part_list[p].customer_dep = 100;
                            part_list[p].insurance_dep = 0;
                        }


                        var dep = 0;

                        if (services[i].claim == true) {
                            if (parseFloat(part_list[p].insurance_dep) <= 0 && parseFloat(part_list[p].customer_dep) <= 0) {
                                dep = 0
                            }
                            else {
                                if (parseFloat(part_list[p].customer_dep) <= 0 && parseFloat(part_list[p].insurance_dep <= 100)) {
                                    dep = 100
                                }
                                else {
                                    dep = 100 - parseFloat(part_list[p].customer_dep);
                                }
                            }

                            amount = amount - (amount * dep / 100);
                            dep = base - amount;
                        }

                        if (part_list[p].discount) {
                            discount_total = part_list[p].discount;
                            amount = amount - parseFloat(discount_total.toFixed(2))
                        }


                        if (part_list[p].amount_is_tax == "exclusive") {
                            var tax_on_amount = amount;
                            if (tax_rate.length > 0) {
                                for (var r = 0; r < tax_rate.length; r++) {
                                    if (tax_rate[r].rate != tax_info.rate) {
                                        var t = tax_on_amount * (tax_rate[r].rate / 100);
                                        amount = amount + t; parseFloat
                                        tax.push({
                                            tax: tax_rate[r].tax,
                                            rate: tax_rate[r].rate,
                                            amount: parseFloat(t.toFixed(2))
                                        });
                                    }
                                    else {
                                        var t = tax_on_amount * (tax_rate[r].rate / 100);
                                        amount = amount + t;
                                        tax.push({
                                            tax: tax_info.tax, tax_rate: tax_info.rate,
                                            rate: tax_info.rate,
                                            amount: parseFloat(t.toFixed(2))
                                        });
                                    }
                                }
                            }
                            total = total + amount;
                        }

                        if (part_list[p].amount_is_tax == "inclusive") {
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
                                            tax: tax_info.tax, tax_rate: tax_info.rate,
                                            rate: tax_info.rate,
                                            amount: parseFloat(t.toFixed(2))
                                        });
                                    }
                                }
                            }

                            base = base - dep;
                            total = total + amount;
                        }

                        var tax_amount = total - parseFloat(base.toFixed(2));

                        var tax_details = {
                            tax: tax_info.tax,
                            tax_rate: tax_info.rate,
                            rate: tax_info.rate,
                            amount: total,
                            detail: tax
                        }


                        part.push({
                            _id: part_list[p]._id,
                            item: part_list[p].item,
                            source: part_list[p].source,
                            hsn_sac: part_list[p].hsn_sac,
                            part_no: part_list[p].part_no,
                            rate: parseFloat(part_list[p].rate),
                            quantity: parseFloat(part_list[p].quantity),
                            base: parseFloat(base.toFixed(2)),
                            amount: total,
                            discount: part_list[p].discount,
                            issued: part_list[p].issued,
                            customer_dep: customer_dep,
                            insurance_dep: insurance_dep,
                            tax_amount: parseFloat(_.sumBy(tax, x => x.amount).toFixed(2)),
                            amount_is_tax: part_list[p].amount_is_tax,
                            tax: tax_info.tax,
                            tax_rate: tax_info.rate,
                            tax_info: tax_details
                        });
                    }
                }

                if (labour_list) {
                    for (var l = 0; l < labour_list.length; l++) {
                        var total = 0;
                        var tax_info = await Tax.findOne({ rate: labour_list[l].tax_rate, type: tax_type }).exec();
                        var tax = [];
                        var rate = labour_list[l].rate;
                        var amount = parseFloat(labour_list[l].rate) * parseFloat(labour_list[l].quantity);
                        var tax_rate = tax_info.detail;
                        var discount_total = 0;
                        var base = amount;
                        var dep = 0;

                        if (parseFloat(labour_list[l].customer_dep) != null && parseFloat(labour_list[l].insurance_dep) != null) {
                            var customer_dep = parseFloat(labour_list[l].customer_dep);
                            var insurance_dep = parseFloat(labour_list[l].insurance_dep)
                        }
                        else {
                            var customer_dep = 100;
                            var insurance_dep = 0;

                            labour_list[l].customer_dep = 100;
                            labour_list[l].insurance_dep = 0;
                        }


                        if (services[i].claim == true) {
                            if (parseFloat(labour_list[l].insurance_dep) <= 0 && parseFloat(labour_list[l].customer_dep) <= 0) {
                                dep = 0
                            }
                            else {
                                if (parseFloat(labour_list[l].customer_dep) <= 0 && parseFloat(labour_list[l].insurance_dep <= 100)) {
                                    dep = 100
                                }
                                else {
                                    dep = 100 - parseFloat(labour_list[l].customer_dep);
                                }
                            }

                            amount = amount - (amount * dep / 100);
                            dep = base - amount;
                        }

                        if (labour_list[l].discount) {
                            discount_total = labour_list[l].discount;
                            amount = amount - parseFloat(discount_total.toFixed(2))
                        }


                        if (labour_list[l].amount_is_tax == "exclusive") {
                            var tax_on_amount = amount;
                            if (tax_rate.length > 0) {
                                for (var r = 0; r < tax_rate.length; r++) {
                                    if (tax_rate[r].rate != tax_info.rate) {
                                        var t = tax_on_amount * (tax_rate[r].rate / 100);
                                        amount = amount + t; parseFloat
                                        tax.push({
                                            tax: tax_rate[r].tax,
                                            rate: tax_rate[r].rate,
                                            amount: parseFloat(t.toFixed(2))
                                        });
                                    }
                                    else {
                                        var t = tax_on_amount * (tax_rate[r].rate / 100);
                                        amount = amount + t;
                                        tax.push({
                                            tax: tax_info.tax, tax_rate: tax_info.rate,
                                            rate: tax_info.rate,
                                            amount: parseFloat(t.toFixed(2))
                                        });
                                    }
                                }
                            }
                            //total = total+amount;
                        }

                        if (labour_list[l].amount_is_tax == "inclusive") {
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
                                            tax_rate: tax_info.rate,
                                            rate: tax_info.rate,
                                            amount: parseFloat(t.toFixed(2))
                                        });
                                    }
                                }
                            }

                            base = base - dep;

                            total = total + amount;
                        }

                        var tax_amount = total - parseFloat(base.toFixed(2));

                        var tax_details = {
                            tax: tax_info.tax,
                            rate: tax_info.rate,
                            amount: total,
                            detail: tax
                        };

                        labours.push({
                            item: labour_list[l].item,
                            source: labour_list[l].source,
                            rate: parseFloat(labour_list[l].rate),
                            quantity: parseFloat(labour_list[l].quantity),
                            base: parseFloat(base.toFixed(2)),
                            amount: amount,
                            discount: labour_list[l].discount,
                            customer_dep: parseFloat(labour_list[l].customer_dep),
                            insurance_dep: parseFloat(labour_list[l].insurance_dep),
                            tax_amount: parseFloat(_.sumBy(tax, x => x.amount).toFixed(2)),
                            amount_is_tax: labour_list[l].amount_is_tax,
                            tax: tax_info.tax,
                            tax_rate: tax_info.rate,
                            tax_info: tax_details
                        });
                    }
                }

                if (of_list) {
                    for (var o = 0; o < of_list.length; o++) {
                        var total = 0;
                        var tax_info = await Tax.findOne({ rate: of_list[o].tax_rate, type: tax_type }).exec();
                        var tax = [];
                        var rate = of_list[o].rate;
                        var amount = (parseFloat(of_list[o].rate) * parseFloat(of_list[o].quantity));
                        var tax_rate = tax_info.detail;
                        var discount_total = 0;
                        var base = amount;
                        var dep = 0;

                        if (parseFloat(of_list[o].customer_dep) != null && parseFloat(of_list[o].insurance_dep) != null) {
                            var customer_dep = parseFloat(of_list[o].customer_dep);
                            var insurance_dep = parseFloat(of_list[o].insurance_dep)
                        }
                        else {
                            var customer_dep = 100;
                            var insurance_dep = 0;

                            of_list[o].customer_dep = 100;
                            of_list[o].insurance_dep = 0;
                        }

                        if (services[i].claim == true) {
                            if (parseFloat(of_list[o].insurance_dep) <= 0 && parseFloat(of_list[o].customer_dep) <= 0) {
                                dep = 0
                            }
                            else {
                                if (parseFloat(of_list[o].customer_dep) <= 0 && parseFloat(of_list[o].insurance_dep <= 100)) {
                                    dep = 100
                                }
                                else {
                                    dep = 100 - parseFloat(of_list[o].customer_dep);
                                }
                            }

                            amount = amount - (amount * dep / 100);
                            dep = base - amount;
                        }

                        if (of_list[o].discount) {
                            var discount_total = of_list[o].discount;
                            amount = amount - parseFloat(discount_total.toFixed(2))
                        }



                        if (of_list[o].amount_is_tax == "exclusive") {
                            var tax_on_amount = amount;
                            if (tax_rate.length > 0) {
                                for (var r = 0; r < tax_rate.length; r++) {
                                    if (tax_rate[r].rate != tax_info.rate) {
                                        var t = tax_on_amount * (tax_rate[r].rate / 100);
                                        amount = amount + t; parseFloat
                                        tax.push({
                                            tax: tax_rate[r].tax,
                                            rate: tax_rate[r].rate,
                                            amount: parseFloat(t.toFixed(2))
                                        });
                                    }
                                    else {
                                        var t = tax_on_amount * (tax_rate[r].rate / 100);
                                        amount = amount + t;
                                        tax.push({
                                            tax: tax_info.tax, tax_rate: tax_info.rate,
                                            rate: tax_info.rate,
                                            amount: parseFloat(t.toFixed(2))
                                        });
                                    }
                                }
                            }
                            total = total + amount;
                        }

                        if (of_list[o].amount_is_tax == "inclusive") {
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
                                            tax: tax_info.tax, tax_rate: tax_info.rate,
                                            rate: tax_info.rate,
                                            amount: parseFloat(t.toFixed(2))
                                        });
                                    }
                                }
                            }

                            base = base - dep;

                            total = total + amount;
                        }

                        var tax_details = {
                            tax: tax_info.tax,
                            rate: tax_info.rate,
                            amount: total,
                            detail: tax
                        }

                        var tax_amount = total - parseFloat(base.toFixed(2));

                        opening_fitting.push({
                            item: of_list[o].item,
                            source: of_list[o].source,
                            rate: parseFloat(of_list[o].rate),
                            quantity: parseFloat(of_list[o].quantity),
                            base: parseFloat(base.toFixed(2)),
                            amount: total,
                            discount: parseFloat(of_list[o].discount),
                            customer_dep: parseFloat(of_list[o].customer_dep),
                            insurance_dep: parseFloat(of_list[o].insurance_dep),
                            tax_amount: parseFloat(_.sumBy(tax, x => x.amount).toFixed(2)),
                            amount_is_tax: of_list[o].amount_is_tax,
                            tax: tax_info.tax, tax_rate: tax_info.rate,
                            tax_info: tax_details
                        });
                    }
                }

                var parts_visible = true;

                bookingService.push({
                    source: services[i].source,
                    service: services[i].service,
                    mileage: services[i].mileage,
                    parts: part,
                    labour: labours,
                    opening_fitting: opening_fitting,
                    hours: services[i].hours,
                    parts_visible: parts_visible,
                    quantity: services[i].quantity,
                    discount: _.sumBy(labours, x => x.discount) + _.sumBy(part, x => x.discount) + _.sumBy(opening_fitting, x => x.discount),
                    description: services[i].description,
                    cost: _.sumBy(part, x => x.amount) + _.sumBy(labours, x => x.amount) + services[i].of_cost,
                    labour_cost: _.sumBy(labours, x => x.amount),
                    of_cost: _.sumBy(opening_fitting, x => x.amount),
                    part_cost: _.sumBy(part, x => x.amount),
                    exceeded_cost: parseFloat(services[i].exceeded_cost),
                    part_cost_editable: services[i].part_cost_editable,
                    labour_cost_editable: services[i].labour_cost_editable,
                    of_cost_editable: services[i].of_cost_editable,
                    type: services[i].type,
                    customer_approval: services[i].customer_approval,
                    surveyor_approval: services[i].surveyor_approval,
                    claim: services[i].claim,
                    custom: services[i].custom,
                });
            }

            var labour_cost = _.sumBy(bookingService, x => x.labour_cost);
            var part_cost = _.sumBy(bookingService, x => x.part_cost);
            var of_cost = _.sumBy(bookingService, x => x.of_cost);
            var discount_total = _.sumBy(bookingService, x => x.discount);


            var payment_total = labour_cost + part_cost + of_cost + discount_total + policy_clause + salvage + pick_up_charges;

            var estimate_cost = labour_cost + part_cost + of_cost + policy_clause + salvage + pick_up_charges - (careager_cash + booking.payment.additionalDiscount);

            var due_amount = _.sumBy(bookingService, x => x.labour_cost) + _.sumBy(bookingService, x => x.part_cost) + _.sumBy(bookingService, x => x.of_cost) + policy_clause + salvage + pick_up_charges - (paid_total + careager_cash + booking.payment.additionalDiscount);

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
                payment_mode: "",
                payment_status: "",
                discount_type: "",
                coupon: "",
                coupon_type: "",
                discount_by: "",
                additionalDiscount: booking.payment.additionalDiscount,
                discount: discount_total,
                discount_total: discount_total,
                policy_clause: policy_clause,
                salvage: salvage,
                terms: booking.payment.terms,
                pick_up_limit: booking.payment.pick_up_limit,
                pick_up_charges: pick_up_charges,
                paid_total: 0,
                discount_applied: false,
                transaction_id: "",
                transaction_date: "",
                transaction_status: "",
                transaction_response: "",
            };

            var data = {
                booking: booking._id,
                user: booking.user,
                car: booking.car,
                business: booking.business,
                advisor: booking.advisor,
                address: booking.address,
                job_no: booking.job_no,
                with_tax: booking.with_tax,
                booking_no: booking.booking_no,
                odometer: booking.odometer,
                with_tax: booking.with_tax,
                insurance_info: booking.insurance_info,
                note: booking.note,
                delivery_date: booking.delivery_date,
                due: due,
                services: bookingService,
                payment: payment,
                invoice_type: (req.query.type == "Insurance") ? "Insurance" : "Booking",
                status: "Active",
                tax_type: tax_type,
                started_at: booking.started_at,
                job_date: booking.created_at,
                created_at: new Date(),
                updated_at: new Date()
            };

            res.status(200).json({
                responseCode: 200,
                responseMessage: "",
                responseData: data
            });
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Booking not found",
                responseData: {}
            });
        }
    }
});

router.get('/insurance/proforma/invoice', async function (req, res, next) {
    var rules = {
        booking: 'required',
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
        var labour_cost = 0;
        var part_cost = 0;
        var of_cost = 0;
        var due_amount = 0;
        var totalResult = 0;
        var bookingService = [];

        var booking = await Booking.findById(req.query.booking)
            .populate({ path: 'address' })
            .populate({ path: 'advisor', select: "_id id name contact_no email" })
            .populate({ path: 'user', select: "_id id name contact_no email business_info" })
            .populate({ path: 'business', select: "_id id name contact_no email business_info address bank_details" })
            .populate({ path: 'car', select: '_id id title registration_no ic rc vin engine_no insurance_info' })
            .exec();

        if (booking) {
            var tax_type = "GST";

            var policy_clause = 0;
            var salvage = 0;
            var pick_up_charges = 0;
            var careager_cash = 0;
            var paid_total = 0;

            if (booking.insurance_info) {
                if (booking.insurance_info.insurance_company && booking.insurance_info.branch && booking.insurance_info.state && booking.insurance_info.gstin) {
                    if (booking.insurance_info.state.toLowerCase() == booking.business.address.state.toLowerCase()) {
                        var tax_type = "GST";
                    }
                    else {
                        var tax_type = "IGST";
                    }
                }
                else {
                    return res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Insurance Company, Branch name, Branch GSTIN, and State are required",
                        responseData: {}
                    })
                }
            }
            else {
                return res.status(422).json({
                    responseCode: 422,
                    responseMessage: "Insurance Company, Branch name, Branch GSTIN, and State are required",
                    responseData: {}
                })
            }

            var services = _.filter(booking.services, customer_approval => customer_approval.customer_approval == true && customer_approval.claim == true);


            for (var i = 0; i < services.length; i++) {
                var part = [];
                var labours = [];
                var opening_fitting = [];

                var part_list = services[i].parts;
                var labour_list = services[i].labour;
                var of_list = services[i].opening_fitting;

                if (part_list) {
                    for (var p = 0; p < part_list.length; p++) {
                        var total = 0;
                        var tax_info = await Tax.findOne({ rate: part_list[p].tax_rate, type: tax_type }).exec();
                        var tax = [];
                        var rate = part_list[p].rate;
                        var amount = (parseFloat(part_list[p].rate) * parseFloat(part_list[p].quantity));
                        var tax_rate = tax_info.detail;
                        var discount_total = 0;
                        var base = amount;

                        var dep = 0;

                        if (parseFloat(part_list[p].insurance_dep) <= 0 && parseFloat(part_list[p].customer_dep) <= 0) {
                            dep = 100
                        }
                        else {
                            if (parseFloat(part_list[p].insurance_dep) <= 0 && parseFloat(part_list[p].customer_dep <= 100)) {
                                dep = 100
                            }
                            else {
                                dep = 100 - parseFloat(part_list[p].insurance_dep);
                            }
                        }

                        amount = amount - (amount * dep / 100);

                        var dep = base - amount;

                        if (part_list[p].amount_is_tax == "exclusive") {
                            var tax_on_amount = amount;
                            if (tax_rate.length > 0) {
                                for (var r = 0; r < tax_rate.length; r++) {
                                    if (tax_rate[r].rate != tax_info.rate) {
                                        var t = tax_on_amount * (tax_rate[r].rate / 100);
                                        amount = amount + t; parseFloat
                                        tax.push({
                                            tax: tax_rate[r].tax,
                                            rate: tax_rate[r].rate,
                                            amount: parseFloat(t.toFixed(2))
                                        });
                                    }
                                    else {
                                        var t = tax_on_amount * (tax_rate[r].rate / 100);
                                        amount = amount + t;
                                        tax.push({
                                            tax: tax_info.tax, tax_rate: tax_info.rate,
                                            rate: tax_info.rate,
                                            amount: parseFloat(t.toFixed(2))
                                        });
                                    }
                                }
                            }
                            total = total + amount;
                        }

                        if (part_list[p].amount_is_tax == "inclusive") {
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
                                            tax: tax_info.tax, tax_rate: tax_info.rate,
                                            rate: tax_info.rate,
                                            amount: parseFloat(t.toFixed(2))
                                        });
                                    }
                                }
                            }

                            base = base - dep;
                            total = total + amount;
                        }

                        var tax_amount = total - parseFloat(base.toFixed(2));

                        var tax_details = {
                            tax: tax_info.tax,
                            tax_rate: tax_info.rate,
                            rate: tax_info.rate,
                            amount: total,
                            detail: tax
                        }

                        part.push({
                            item: part_list[p].item,
                            source: part_list[p].source,
                            hsn_sac: part_list[p].hsn_sac,
                            part_no: part_list[p].part_no,
                            rate: parseFloat(part_list[p].rate),
                            quantity: parseFloat(part_list[p].quantity),
                            base: parseFloat(base.toFixed(2)),
                            amount: total,
                            discount: 0,
                            //discount: part_list[p].discount,
                            issued: part_list[p].issued,
                            customer_dep: parseFloat(part_list[p].customer_dep),
                            insurance_dep: parseFloat(part_list[p].insurance_dep),
                            tax_amount: parseFloat(_.sumBy(tax, x => x.amount).toFixed(2)),
                            amount_is_tax: part_list[p].amount_is_tax,
                            tax: tax_info.tax,
                            tax_rate: tax_info.rate,
                            tax_info: tax_details
                        });
                    }
                }

                if (labour_list) {
                    for (var l = 0; l < labour_list.length; l++) {
                        var total = 0;
                        var tax_info = await Tax.findOne({ rate: labour_list[l].tax_rate, type: tax_type }).exec();
                        var tax = [];
                        var rate = labour_list[l].rate;
                        var amount = parseFloat(labour_list[l].rate) * parseFloat(labour_list[l].quantity);
                        var tax_rate = tax_info.detail;
                        var discount_total = 0;
                        var base = amount;
                        var dep = 0;


                        if (parseFloat(labour_list[l].insurance_dep) <= 0 && parseFloat(labour_list[l].customer_dep) <= 0) {
                            dep = 100
                        }
                        else {
                            if (parseFloat(labour_list[l].insurance_dep) <= 0 && parseFloat(labour_list[l].customer_dep <= 100)) {
                                dep = 100
                            }
                            else {
                                dep = 100 - parseFloat(labour_list[l].insurance_dep);
                            }
                        }

                        amount = amount - (amount * dep / 100);
                        var dep = base - amount;

                        if (labour_list[l].amount_is_tax == "exclusive") {
                            var tax_on_amount = amount;
                            if (tax_rate.length > 0) {
                                for (var r = 0; r < tax_rate.length; r++) {
                                    if (tax_rate[r].rate != tax_info.rate) {
                                        var t = tax_on_amount * (tax_rate[r].rate / 100);
                                        amount = amount + t; parseFloat
                                        tax.push({
                                            tax: tax_rate[r].tax,
                                            rate: tax_rate[r].rate,
                                            amount: parseFloat(t.toFixed(2))
                                        });
                                    }
                                    else {
                                        var t = tax_on_amount * (tax_rate[r].rate / 100);
                                        amount = amount + t;
                                        tax.push({
                                            tax: tax_info.tax, tax_rate: tax_info.rate,
                                            rate: tax_info.rate,
                                            amount: parseFloat(t.toFixed(2))
                                        });
                                    }
                                }
                            }
                            //total = total+amount;
                        }

                        if (labour_list[l].amount_is_tax == "inclusive") {
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
                                            tax_rate: tax_info.rate,
                                            rate: tax_info.rate,
                                            amount: parseFloat(t.toFixed(2))
                                        });
                                    }
                                }
                            }

                            base = base - dep;

                            total = total + amount;
                        }

                        var tax_amount = total - parseFloat(base.toFixed(2));

                        var tax_details = {
                            tax: tax_info.tax,
                            rate: tax_info.rate,
                            amount: total,
                            detail: tax
                        };

                        labours.push({
                            item: labour_list[l].item,
                            source: labour_list[l].source,
                            rate: parseFloat(labour_list[l].rate),
                            quantity: parseFloat(labour_list[l].quantity),
                            base: parseFloat(base.toFixed(2)),
                            amount: amount,
                            discount: 0,
                            //discount: labour_list[l].discount,
                            customer_dep: parseFloat(labour_list[l].customer_dep),
                            insurance_dep: parseFloat(labour_list[l].insurance_dep),
                            tax_amount: parseFloat(_.sumBy(tax, x => x.amount).toFixed(2)),
                            amount_is_tax: labour_list[l].amount_is_tax,
                            tax: tax_info.tax,
                            tax_rate: tax_info.rate,
                            tax_info: tax_details
                        });
                    }
                }

                if (of_list) {
                    for (var o = 0; o < of_list.length; o++) {
                        var total = 0;
                        var tax_info = await Tax.findOne({ rate: of_list[o].tax_rate, type: tax_type }).exec();
                        var tax = [];
                        var rate = of_list[o].rate;
                        var amount = (parseFloat(of_list[o].rate) * parseFloat(of_list[o].quantity));
                        var tax_rate = tax_info.detail;
                        var discount_total = 0;
                        var base = amount;
                        var dep = 0;


                        if (parseFloat(of_list[o].insurance_dep) <= 0 && parseFloat(of_list[o].customer_dep) <= 0) {
                            dep = 100
                        }
                        else {
                            if (parseFloat(of_list[o].insurance_dep) <= 0 && parseFloat(of_list[o].customer_dep <= 100)) {
                                dep = 100
                            }
                            else {
                                dep = 100 - parseFloat(of_list[o].insurance_dep);
                            }
                        }

                        amount = amount - (amount * dep / 100);
                        var dep = base - amount;

                        if (of_list[o].amount_is_tax == "exclusive") {
                            var tax_on_amount = amount;
                            if (tax_rate.length > 0) {
                                for (var r = 0; r < tax_rate.length; r++) {
                                    if (tax_rate[r].rate != tax_info.rate) {
                                        var t = tax_on_amount * (tax_rate[r].rate / 100);
                                        amount = amount + t; parseFloat
                                        tax.push({
                                            tax: tax_rate[r].tax,
                                            rate: tax_rate[r].rate,
                                            amount: parseFloat(t.toFixed(2))
                                        });
                                    }
                                    else {
                                        var t = tax_on_amount * (tax_rate[r].rate / 100);
                                        amount = amount + t;
                                        tax.push({
                                            tax: tax_info.tax, tax_rate: tax_info.rate,
                                            rate: tax_info.rate,
                                            amount: parseFloat(t.toFixed(2))
                                        });
                                    }
                                }
                            }
                            total = total + amount;
                        }

                        if (of_list[o].amount_is_tax == "inclusive") {
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
                                            tax: tax_info.tax, tax_rate: tax_info.rate,
                                            rate: tax_info.rate,
                                            amount: parseFloat(t.toFixed(2))
                                        });
                                    }
                                }
                            }

                            base = base - dep;
                            total = total + amount;
                        }

                        var tax_details = {
                            tax: tax_info.tax,
                            rate: tax_info.rate,
                            amount: total,
                            detail: tax
                        }

                        var tax_amount = total - parseFloat(base.toFixed(2));

                        opening_fitting.push({
                            item: of_list[o].item,
                            source: of_list[o].source,
                            rate: parseFloat(of_list[o].rate),
                            quantity: parseFloat(of_list[o].quantity),
                            base: parseFloat(base.toFixed(2)),
                            amount: total,
                            discount: 0,
                            //discount: parseFloat(of_list[o].discount),
                            customer_dep: parseFloat(of_list[o].customer_dep),
                            insurance_dep: parseFloat(of_list[o].insurance_dep),
                            tax_amount: parseFloat(_.sumBy(tax, x => x.amount).toFixed(2)),
                            amount_is_tax: of_list[o].amount_is_tax,
                            tax: tax_info.tax, tax_rate: tax_info.rate,
                            tax_info: tax_details
                        });
                    }
                }

                var parts_visible = true;

                bookingService.push({
                    source: services[i].source,
                    service: services[i].service,
                    mileage: services[i].mileage,
                    parts: part,
                    labour: labours,
                    opening_fitting: opening_fitting,
                    hours: services[i].hours,
                    parts_visible: parts_visible,
                    quantity: services[i].quantity,
                    discount: 0,
                    //discount: _.sumBy(labours, x => x.discount)+_.sumBy(part, x => x.discount)+_.sumBy(opening_fitting, x => x.discount),
                    description: services[i].description,
                    cost: _.sumBy(part, x => x.amount) + _.sumBy(labours, x => x.amount) + services[i].of_cost,
                    labour_cost: _.sumBy(labours, x => x.amount),
                    of_cost: _.sumBy(opening_fitting, x => x.amount),
                    part_cost: _.sumBy(part, x => x.amount),
                    exceeded_cost: parseFloat(services[i].exceeded_cost),
                    part_cost_editable: services[i].part_cost_editable,
                    labour_cost_editable: services[i].labour_cost_editable,
                    of_cost_editable: services[i].of_cost_editable,
                    type: services[i].type,
                    customer_approval: services[i].customer_approval,
                    surveyor_approval: services[i].surveyor_approval,
                    claim: services[i].claim,
                    custom: services[i].custom,
                });
            }

            var labour_cost = _.sumBy(bookingService, x => x.labour_cost);
            var part_cost = _.sumBy(bookingService, x => x.part_cost);
            var of_cost = _.sumBy(bookingService, x => x.of_cost);
            var discount_total = _.sumBy(bookingService, x => x.discount);

            var careager_cash = booking.payment.careager_cash;

            var payment_total = labour_cost + part_cost + of_cost + discount_total + policy_clause + salvage + pick_up_charges;

            var estimate_cost = labour_cost + part_cost + of_cost + policy_clause + salvage + pick_up_charges - careager_cash;

            var due_amount = _.sumBy(bookingService, x => x.labour_cost) + _.sumBy(bookingService, x => x.part_cost) + _.sumBy(bookingService, x => x.of_cost) + policy_clause + salvage + pick_up_charges - (paid_total + careager_cash);

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
                payment_mode: "",
                payment_status: "",
                discount_type: "",
                coupon: "",
                coupon_type: "",
                discount_by: "",
                discount: 0,
                discount_total: discount_total,
                policy_clause: policy_clause,
                salvage: salvage,
                terms: booking.payment.terms,
                pick_up_limit: booking.payment.pick_up_limit,
                pick_up_charges: 0,
                paid_total: 0,
                discount_applied: false,
                transaction_id: "",
                transaction_date: "",
                transaction_status: "",
                transaction_response: "",
            };

            var data = {
                booking: booking._id,
                user: booking.user,
                car: booking.car,
                business: booking.business,
                advisor: booking.advisor,
                address: booking.address,
                job_no: booking.job_no,
                with_tax: booking.with_tax,
                booking_no: booking.booking_no,
                odometer: booking.odometer,
                with_tax: booking.with_tax,
                insurance_info: booking.insurance_info,
                delivery_date: booking.delivery_date,
                note: booking.note,
                due: due,
                services: bookingService,
                payment: payment,
                invoice_type: "Insurance",
                status: "Active",
                tax_type: tax_type,
                started_at: booking.started_at,
                created_at: new Date(),
                updated_at: new Date()
            };

            res.status(200).json({
                responseCode: 200,
                responseMessage: "",
                responseData: data
            });
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Booking not found",
                responseData: {}
            });
        }
    }
});

router.get('/invoice/get', async function (req, res, next) {
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
        });
    }
    else {
        var data = new Object();
        var discount = 0;
        var code = "";
        var discount_type = "";
        var bookingService = [];


        var invoice = await Invoice.findOne({ _id: req.query.invoice })
            .populate({ path: 'address' })
            .populate({ path: 'advisor', select: "_id id name contact_no email" })
            .populate({ path: 'user', select: "_id id name contact_no email business_info" })
            .populate({ path: 'business', select: "_id id name contact_no email business_info bank_details address" })
            .populate({ path: 'car', select: '_id id title registration_no ic rc vin engine_no insurance_info' })
            .exec();

        if (invoice) {
            var approved = invoice.services;

            var paid_total = invoice.payment.paid_total;
            var labour_cost = _.sumBy(approved, x => x.labour_cost);
            var part_cost = _.sumBy(approved, x => x.part_cost);
            var of_cost = _.sumBy(approved, x => x.of_cost);
            var discount_total = _.sumBy(approved, x => x.discount);

            var pick_up_charges = invoice.payment.pick_up_charges;
            var policy_clause = invoice.payment.policy_clause;
            var salvage = invoice.payment.salvage;

            var careager_cash = invoice.payment.careager_cash;

            var payment_total = labour_cost + part_cost + of_cost + discount_total + policy_clause + salvage + pick_up_charges;

            var estimate_cost = labour_cost + part_cost + of_cost + policy_clause + salvage + pick_up_charges;

            // console.log(labour_cost + "+" + part_cost + "+" + of_cost + "+" + policy_clause + "+" + salvage + "+" + pick_up_charges)




            var due_amount = _.sumBy(approved, x => x.labour_cost) + _.sumBy(approved, x => x.part_cost) + _.sumBy(approved, x => x.of_cost) + policy_clause + salvage + pick_up_charges - (paid_total + careager_cash);

            var due = {
                due: Math.ceil(due_amount.toFixed(2))
            }

            var payment = {
                estimate_cost: estimate_cost,
                total: payment_total,
                careager_cash: careager_cash,
                of_cost: of_cost,
                labour_cost: labour_cost,
                part_cost: part_cost,
                payment_mode: invoice.payment.payment_mode,
                payment_status: invoice.payment.payment_status,
                coupon: invoice.payment.coupon,
                coupon_type: invoice.payment.coupon_type,
                discount_by: invoice.payment.discount_by,
                discount_type: invoice.payment.discount_type,
                discount: invoice.payment.discount,
                discount_total: discount_total,
                policy_clause: policy_clause,
                salvage: salvage,
                terms: invoice.payment.terms,
                pick_up_limit: invoice.payment.pick_up_limit,
                pick_up_charges: pick_up_charges,
                paid_total: parseFloat(invoice.payment.paid_total),
                discount_applied: invoice.payment.discount_applied,
                transaction_id: invoice.payment.transaction_id,
                transaction_date: invoice.payment.transaction_date,
                transaction_status: invoice.payment.transaction_status,
                transaction_response: invoice.payment.transaction_response
            };



            var show = {
                _id: invoice._id,
                id: invoice._id,
                car: invoice.car,
                user: invoice.user,
                business: invoice.business,
                advisor: invoice.advisor,
                services: invoice.services,
                status: _.startCase(invoice.status),
                invoice_no: invoice.invoice_no,
                job_no: invoice.job_no,
                booking: invoice.booking,
                booking_no: invoice.booking_no,
                address: invoice.address,
                payment: payment,
                due: invoice.due,
                odometer: invoice.odometer,
                insurance_info: invoice.insurance_info,
                invoice_type: invoice.invoice_type,
                with_tax: invoice.with_tax,
                note: invoice.note,
                started_at: moment(invoice.started_at).tz(req.headers['tz']).format('lll'),
                delivery_date: moment(invoice.delivery_date).tz(req.headers['tz']).format('ll'),
                delivery_time: invoice.delivery_time,
                started_at: moment(invoice.started_at).tz(req.headers['tz']).format('lll'),
                created_at: moment(invoice.created_at).tz(req.headers['tz']).format('lll'),
                updated_at: moment(invoice.updated_at).tz(req.headers['tz']).format('lll'),
            };

            res.status(200).json({
                responseCode: 200,
                responseMessage: 'Success',
                responseData: show,
            });


        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Unauthorized",
                responseData: {}
            });
        }
    }
});

router.get('/booking/services/details', xAccessToken.token, async function (req, res, next) {
    var rules = {
        booking: 'required',
    };

    var validation = new Validator(req.query, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Booking no Required",
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
        var bookings = [];

        var booking = await Booking.findOne({ '_id': req.query.booking })
            .exec();

        if (booking) {

            res.status(200).json({
                responseCode: 200,
                responseMessage: 'Success',
                responseData: booking.services,
            });
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: 'booking not found',
                responseData: {},
            });
        }
    }
});

router.get('/insurance/services/details', async function (req, res, next) {
    var rules = {
        booking: 'required',
    };

    var validation = new Validator(req.query, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Booking no Required",
            responseData: {
                res: validation.errors.all()
            }
        })
    }
    else {
        if (req.query.by == "id") {
            var query = { _id: req.query.booking }
        }
        else if (req.query.by == "lead") {
            var query = { lead: req.query.booking };
        }
        else {
            var query = { booking_no: req.query.booking };
        }



        var bookings = [];
        var booking = await Booking.findOne(query)
            .populate({ path: 'manager', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'advisor', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no email business_info" } })
            .populate({ path: 'business', populate: { path: 'user', select: "_id id name contact_no email business_info" } })
            .populate({ path: 'driver', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'technician', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'surveyor', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'car', select: '_id id title variant registration_no ic rc vin engine_no insurance_info' })
            .exec();

        if (booking) {
            var car = null;
            var manager = null;
            var advisor = null;
            var driver = null;
            var technician = null;
            var surveyor = null;
            var customer_requirements = [];
            var address = null;
            var recording = ""
            if (booking.car) {
                car = {
                    title: booking.car.title,
                    _id: booking.car._id,
                    id: booking.car.id,
                    vin: booking.car.vin,
                    engine_no: booking.car.engine_no,
                    registration_no: booking.car.registration_no,
                    ic_address: booking.car.ic_address,
                    rc_address: booking.car.rc_address,
                    variant: booking.car.variant,
                }
            }

            if (booking.manager) {
                var email = "";
                if (booking.manager.email) {
                    email = booking.manager.email;
                }

                manager = {
                    name: booking.manager.name,
                    _id: booking.manager._id,
                    id: booking.manager.id,
                    contact_no: booking.manager.contact_no,
                    email: email
                }
            }

            if (booking.advisor) {
                var email = "";
                if (booking.advisor.email) {
                    email = booking.advisor.email;
                }
                advisor = {
                    name: booking.advisor.name,
                    _id: booking.advisor._id,
                    id: booking.advisor.id,
                    contact_no: booking.advisor.contact_no,
                    email: email
                }
            }

            if (booking.driver) {
                var email = "";
                if (booking.driver.email) {
                    email = booking.driver.email;
                }
                driver = {
                    name: booking.driver.name,
                    _id: booking.driver._id,
                    id: booking.driver.id,
                    contact_no: booking.driver.contact_no,
                    email: email
                }
            }

            if (booking.technician) {
                var email = "";
                if (booking.technician.email) {
                    email = booking.technician.email;
                }

                technician = {
                    name: booking.technician.name,
                    _id: booking.technician._id,
                    id: booking.technician.id,
                    contact_no: booking.technician.contact_no,
                    email: email
                }
            }

            if (booking.surveyor) {
                var email = "";
                if (booking.surveyor.email) {
                    email = booking.surveyor.email;
                }

                surveyor = {
                    name: booking.surveyor.name,
                    _id: booking.surveyor._id,
                    id: booking.surveyor.id,
                    contact_no: booking.surveyor.contact_no,
                    email: email
                }
            }

            if (booking.customer_requirements) {
                customer_requirements = booking.customer_requirements;
            }

            if (booking.address) {
                var address = await Address.findOne({ _id: booking.address }).exec();
            }

            if (booking.recording) {
                recording = booking.recording_address;
            }

            var logs = booking.logs;
            var logsData = [];
            for (var i = 0; i < logs.length; i++) {
                logsData.push({
                    user: logs[i].user,
                    name: logs[i].name,
                    stage: logs[i].stage,
                    activity: logs[i].activity,
                    created_at: moment(logs[i].created_at).tz(req.headers['tz']).format('lll'),
                    updated_at: moment(logs[i].updated_at).tz(req.headers['tz']).format('lll'),
                })
            }

            var remarks = booking.remarks;
            var remarksData = [];
            if (remarks) {
                for (var i = 0; i < remarks.length; i++) {
                    var added_by = await User.findById(remarks[i].added_by).exec();
                    remarksData.push({
                        added_by: remarks[i].user,
                        name: added_by.name,
                        remark: remarks[i].remark,
                        created_at: moment(remarks[i].created_at).tz(req.headers['tz']).format('lll'),
                        updated_at: moment(remarks[i].updated_at).tz(req.headers['tz']).format('lll'),
                    })
                }
            }

            var review = new Object();
            await Review.find({ booking: booking._id })
                .populate({ path: 'user', select: 'name username avatar avatar_address account_info' })
                .cursor().eachAsync(async (r) => {
                    review = {
                        _id: r._id,
                        id: r._id,
                        business: r.business,
                        booking: r.booking,
                        review_points: r.review_points,
                        rating: r.rating,
                        review: r.review,
                        recommendation: r.recommendation,
                        type: r.type,
                        created_at: moment(r.created_at).tz(req.headers['tz']).format('ll'),
                        updated_at: moment(r.updated_at).tz(req.headers['tz']).format('ll'),
                        user: r.user
                    }
                });

            var approved = _.filter(booking.services, claim => claim.claim == true);
            var paid_total = 0;
            if (booking.insurance_payment) {
                paid_total = booking.insurance_payment.paid_total;
            }
            var pick_up_charges = booking.payment.pick_up_charges;

            var labour_cost = _.sumBy(approved, x => x.labour_cost);
            var part_cost = _.sumBy(approved, x => x.part_cost);
            var of_cost = _.sumBy(approved, x => x.of_cost);

            var payment_total = labour_cost + part_cost + of_cost + pick_up_charges;
            var estimate_cost = labour_cost + part_cost + of_cost + pick_up_charges;

            var due_amount = labour_cost + part_cost + of_cost + pick_up_charges - paid_total;

            var due = {
                due: parseFloat(due_amount.toFixed(2))
            }

            var insurance_payment = {
                estimate_cost: estimate_cost,
                total: payment_total,
                careager_cash: 0,
                of_cost: of_cost,
                labour_cost: labour_cost,
                part_cost: part_cost,
                payment_mode: booking.payment.payment_mode,
                payment_status: booking.payment.payment_status,
                coupon: "",
                coupon_type: "",
                discount_by: "",
                discount_type: "Package",
                discount: 0,
                discount_total: 0,
                policy_clause: 0,
                salvage: 0,
                terms: booking.payment.terms,
                pick_up_limit: booking.payment.pick_up_limit,
                pick_up_charges: booking.payment.pick_up_charges,
                paid_total: paid_total,
                discount_applied: booking.payment.discount_applied,
                transaction_id: booking.payment.transaction_id,
                transaction_date: booking.payment.transaction_date,
                transaction_status: booking.payment.transaction_status,
                transaction_response: ""
            };


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
                    business_info: booking.user.business_info,
                },
                business: {
                    name: booking.business.name,
                    _id: booking.business._id,
                    id: booking.business.id,
                    contact_no: booking.business.contact_no,
                    email: booking.business.email,
                    business_info: booking.user.business_info,
                },
                advisor: advisor,
                manager: manager,
                driver: driver,
                technician: technician,
                surveyor: surveyor,
                services: approved,
                convenience: booking.convenience,
                date: moment(booking.date).tz(req.headers['tz']).format('ll'),
                time_slot: booking.time_slot,
                status: _.startCase(booking.status),
                _status: booking.status,
                sub_status: booking.sub_status,
                booking_no: booking.booking_no,
                job_no: booking.job_no,
                estimation_requested: booking.estimation_requested,
                customer_requirements: customer_requirements,
                insurance_info: booking.insurance_info,
                address: address,
                remarks: remarksData,
                payment: booking.payment,
                due: booking.due,
                claim: booking.claim,
                cashless: booking.cashless,
                __v: booking.__v,
                important: booking.important,
                fuel_level: booking.fuel_level,
                odometer: booking.odometer,
                delivery_date: moment(booking.delivery_date).tz(req.headers['tz']).format('ll'),
                delivery_time: booking.delivery_time,
                assets: booking.assets,
                qc: booking.qc,
                other_assets: booking.other_assets,
                recording_address: recording,
                package: booking.package,
                settlement: booking.settlement,
                advance: booking.advance,
                booking: booking.booking,
                re_booking_no: booking.re_booking_no,
                is_rework: booking.is_rework,
                logs: _(logsData).groupBy(x => x.stage).map((value, key) => ({ stage: key, list: value })).value(),
                review: review,
                insurance_payment: insurance_payment,
                insurance_due: due,
                created_at: moment(booking.created_at).tz(req.headers['tz']).format('lll'),
                updated_at: moment(booking.updated_at).tz(req.headers['tz']).format('lll'),
            });

            res.status(200).json({
                responseCode: 200,
                responseMessage: 'Success',
                responseData: bookings,
            });
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: 'booking not found',
                responseData: {},
            });
        }
    }
});

router.put('/booking/reschedule/', xAccessToken.token, async function (req, res, next) {
    var rules = {
        id: 'required',
        date: 'required',
        time_slot: 'required'
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Error",
            responseData: {
                res: validation.errors.all()
            }
        });
    }
    else {
        if (req.body.package == "") {
            req.body.package = null;
        }
        // console.log("Common.js ")
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var user = decoded.user;
        var total = 0;
        var labour_cost = 0;
        var part_cost = 0;
        var bookingService = [];
        var services = req.body.services;
        var loggedInDetails = await User.findById(user).exec();
        if (loggedInDetails.account_info.type == "user") {
            var booking = await Booking.findOne({ _id: req.body.id, user: user, is_services: true }).exec();
        }
        else {
            var booking = await Booking.findOne({ _id: req.body.id, business: user, is_services: true }).exec();
        }

        if (booking) {
            var d1 = new Date(req.body.date);
            var date = new Date();
            var d2 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            var seconds = (d1.getTime() - d2.getTime()) / 1000;
            // console.log(seconds)
            if (seconds >= 172800) {
                var status = "Confirmed"
            }
            else {
                var status = "Pending"
            }

            var data = {
                date: new Date(req.body.date).toISOString(),
                time_slot: req.body.time_slot,
                status: status,
                updated_at: new Date()
            };

            Booking.findOneAndUpdate({ _id: booking._id }, { $set: data }, { new: false }, async function (err, doc) {
                if (err) {
                    var json = ({
                        responseCode: 400,
                        responseMessage: "Error occured",
                        responseData: {}
                    });
                    res.status(400).json(json)
                }
                else {
                    if (loggedInDetails.account_info.type == "user") {
                        var notify = {
                            receiver: [booking.business],
                            activity: "booking",
                            tag: "bookingReschedule",
                            source: booking._id,
                            sender: user,
                            points: 0,
                            tz: req.headers['tz']
                        };
                        fun.newNotification(notify);
                        var activity = {
                            user: loggedInDetails._id,
                            name: loggedInDetails.name,
                            stage: "Booking",
                            activity: "BookingReschedule",
                        };

                        fun.bookingLog(booking._id, activity);
                    }
                    else {
                        var notify = {
                            receiver: [booking.user],
                            activity: "booking",
                            tag: "bookingReschedule",
                            source: booking._id,
                            sender: user,
                            points: 0,
                            tz: req.headers['tz']
                        };
                        fun.newNotification(notify);

                        var activity = {
                            user: loggedInDetails._id,
                            name: loggedInDetails.name,
                            stage: "Booking",
                            activity: "BookingReschedule",
                        };

                        fun.bookingLog(booking._id, activity);
                    }

                    event.rescheduleMail(booking._id, loggedInDetails.account_info.type);

                    var activity = {
                        user: user,
                        model: "Booking",
                        activity: "bookingReschedule",
                        source: booking._id,
                        modified: moment(booking.date).tz(req.headers['tz']).format('ll') + " (" + booking.time_slot + ")" + " to " + moment(data.date).tz(req.headers['tz']).format('ll') + " (" + data.time_slot + ")",
                        created_at: data.updated_at,
                        updated_at: data.updated_at
                    }
                    fun.activityLog(activity);

                    var json = ({
                        responseCode: 200,
                        responseMessage: "Booking rescheduled",
                        responseData: {
                            date: moment(data.date).tz(req.headers['tz']).format('ll'),
                            time_slot: data.time_slot,
                            updated_at: data.updated_at
                        }
                    });
                    res.status(200).json(json)
                }
            });
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Unauthorized",
                responseData: {},
            });
        }
    }
});

router.put('/booking/status', xAccessToken.token, async function (req, res, next) {
    var rules = {
        id: 'required',
        status: 'required',
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
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var user = decoded.user;

        var check = await Booking.findOne({ _id: req.body.id, user: user, is_services: true }).exec();

        var getUser = await User.findById(user).exec();

        if (!check) {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Unauthorized",
                responseData: {},
            });
        }
        else {
            var status = check.status;
            var data = {
                status: req.body.status,
                updated_at: new Date()
            };

            Booking.findOneAndUpdate({ _id: req.body.id }, { $set: data }, { new: true }, async function (err, doc) {
                if (err) {
                    var json = ({
                        responseCode: 422,
                        responseMessage: "Error occured",
                        responseData: {}
                    });

                    res.status(422).json(json)
                }
                else {
                    var booking = await Booking.findOne({ _id: check._id }).exec();

                    var activity = {
                        user: user,
                        model: "Booking",
                        activity: "updateBookingStatus",
                        source: booking._id,
                        modified: check.status + " to " + data.status,
                        created_at: data.updated_at,
                        updated_at: data.updated_at
                    };

                    fun.activityLog(activity);
                    event.zohoLead(booking._id);

                    if (booking.payment.careager_cash > 0) {
                        var point = {
                            status: true,
                            user: user,
                            activity: "coin",
                            tag: "BookingCancelled",
                            points: booking.payment.careager_cash,
                            source: booking._id,
                            sender: null
                        };

                        fun.addPoints(point)
                    }


                    if (booking.package) {
                        var package = await UserPackage.findOne({ _id: booking.package, user: user, car: booking.car }).exec();
                        if (package) {
                            var checkPackageUsed = await PackageUsed.find({ package: booking.package, user: user, booking: booking._id, car: booking.car }).count().exec();

                            if (checkPackageUsed > 0) {
                                await PackageUsed.remove({ package: booking.package, user: user, booking: booking._id, car: booking.car }).exec();
                            }
                        }
                    }

                    if (booking.payment.coupon) {
                        var checkCouponUsed = await CouponUsed.find({ user: user, booking: booking._id }).count().exec();
                        if (checkCouponUsed > 0) {
                            await CouponUsed.remove({ user: user, booking: booking._id }).exec();
                        }
                    }

                    Booking.findOneAndUpdate({ _id: req.body.id }, { $set: { due: null } }, { new: true }, async function (err, doc) { })

                    var notify = {
                        receiver: [booking.advisor],
                        activity: "booking",
                        tag: "userCancelledBooking",
                        source: booking._id,
                        sender: user,
                        points: 0
                    }

                    fun.newNotification(notify);

                    if (booking.converted) {
                        if (booking.manager) {
                            var notify = {
                                receiver: [booking.manager],
                                activity: "booking",
                                tag: "userCancelledBooking",
                                source: booking._id,
                                sender: user,
                                points: 0
                            }
                            fun.newNotification(notify);
                        }
                    }


                    var json = ({
                        responseCode: 200,
                        responseMessage: "Booking has been " + booking.status,
                        responseData: {}
                    });
                    res.status(200).json(json)
                }
            });
        }
    }
});

router.get('/stories/add', async function (req, res, next) {
    var feed;

    var url = [
        "https://api.rss2json.com/v2/api.json?rss_url=https%3A%2F%2Fwww.zigwheels.com%2Fxml%2FnewsCar.xml&api_key=jfymhcty7gwqodovjscpjvem382u4wudqa08zubi&order_dir=desc&count=100",
        "https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.zigwheels.com%2Fxml%2Ftyreguide_guides.xml&api_key=jfymhcty7gwqodovjscpjvem382u4wudqa08zubi&order_dir=desc&count=100",
        "https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.zigwheels.com%2Fxml%2Fauto_insightCar.xml?api_key=jfymhcty7gwqodovjscpjvem382u4wudqa08zubi&order_dir=desc&count=100",

        "https://api.rss2json.com/v2/api.json?rss_url=https%3A%2F%2Fwww.zigwheels.com%2Fxml%2Ftyreguide_guides.xml&api_key=jfymhcty7gwqodovjscpjvem382u4wudqa08zubi&order_dir=desc&count=100",

        "https://api.rss2json.com/v2/api.json?rss_url=https%3A%2F%2Fwww.zigwheels.com%2Fxml%2Fcar_reviewcomparison.xml&api_key=jfymhcty7gwqodovjscpjvem382u4wudqa08zubi&order_dir=desc&count=100",

        "https://api.rss2json.com/v2/api.json?rss_url=https%3A%2F%2Fwww.zigwheels.com%2Fxml%2Fcool_cornerCar.xml&api_key=jfymhcty7gwqodovjscpjvem382u4wudqa08zubi&order_dir=desc&count=100",

        "https://api.rss2json.com/v2/api.json?rss_url=https%3A%2F%2Fwww.zigwheels.com%2Fxml%2Foil_guides.xml&api_key=jfymhcty7gwqodovjscpjvem382u4wudqa08zubi&order_dir=desc&count=100",

        "https://api.rss2json.com/v1/api.json?rss_url=http%3A%2F%2Fwww.bmwblog.com%2Ffeed&api_key=jfymhcty7gwqodovjscpjvem382u4wudqa08zubi&order_dir=desc&count=100",

        "https://api.rss2json.com/v2/api.json?rss_url=https%3A%2F%2Fwww.zigwheels.com%2Fxml%2Frecent_launchesCar.xml&api_key=jfymhcty7gwqodovjscpjvem382u4wudqa08zubi&order_dir=desc&count=100",

        "https://api.rss2json.com/v2/api.json?rss_url=https%3A%2F%2Fwww.zigwheels.com%2Fxml%2FnewsF1racer.xml&api_key=jfymhcty7gwqodovjscpjvem382u4wudqa08zubi&order_dir=desc&count=100",

        "https://api.rss2json.com/v2/api.json?rss_url=https%3A%2F%2Fwww.zigwheels.com%2Fxml%2Fcar_tips_advice.xml&api_key=jfymhcty7gwqodovjscpjvem382u4wudqa08zubi&order_dir=desc&count=100",

        "https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.zigwheels.com%2Fxml%2Fspecial_coverageCar.xml&api_key=jfymhcty7gwqodovjscpjvem382u4wudqa08zubi&order_dir=desc&count=100",

        "https://api.rss2json.com/v2/api.json?rss_url=http%3A%2F%2Fwww.forbes.com%2Fautos%2Ffeed2&api_key=jfymhcty7gwqodovjscpjvem382u4wudqa08zubi&order_dir=desc&count=100",

        "https://api.rss2json.com/v2/api.json?rss_url=https%3A%2F%2Fauto.ndtv.com%2Frss%2Fnewsrss&api_key=jfymhcty7gwqodovjscpjvem382u4wudqa08zubi&order_dir=desc&count=100",

        "https://api.rss2json.com/v2/api.json?rss_url=https%3A%2F%2Fwww.cnet.com%2Frss%2Fcar-tech&api_key=jfymhcty7gwqodovjscpjvem382u4wudqa08zubi&order_dir=desc&count=100",
    ];

    for (var i = 0; i < url.length; i++) {
        request(url[i], async function (error, response, body) {

            if (!error && response.statusCode == 200) {

                var a = JSON.parse(body);/**/

                a.items.forEach(async function (story) {
                    var check = await Story.find({ title: story.title }).count().exec();

                    if (check == 0 && story.thumbnail) {
                        var data = {
                            title: story.title,
                            post: story.description,
                            media: story.thumbnail,
                            media_type: "image",
                            source: a.feed.title,
                            source_url: story.link,
                            created_at: story.pubDate,
                            updated_at: story.pubDate
                        };

                        await Story.create(data).then(function (story) {

                        });
                    }
                })

                res.status(200).json(a.items)
            }
        })
    }
});

router.get('/stories/get', async function (req, res, next) {
    var data = [];
    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }

    var stories = Story.find({}).sort({ created_at: -1 }).limit(6).skip(6 * page);

    await stories.cursor().eachAsync(async (story) => {
        data.push({
            title: story.title,
            post: story.post,
            media: story.media,
            media_type: story.media_type,
            source: story.source,
            source_url: story.source_url,
            created_at: moment(story.created_at).fromNow(),
            updated_at: moment(story.created_at).fromNow()
        });
    });

    var json = ({
        responseCode: 200,
        responseMessage: "success",
        responseData: data
    });
    res.status(200).json(json)
});

router.get('/stories/delete', async function (req, res, next) {
    await Story.remove({ source: "Autoblog" }).exec();

    var json = ({
        responseCode: 200,
        responseMessage: "success",
        responseData: {}
    });
    res.status(200).json(json)
});

router.post('/business/bookmark', xAccessToken.token, function (req, res, next) {
    var rules = {
        id: 'required',
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
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);

        var user = decoded.user;

        BookmarkBusiness.find({ user: user, business: req.body.id }, function (err, doc) {
            if (doc.length == 0) {
                var bookmarkBusiness = new BookmarkBusiness({
                    business: req.body.id,
                    user: user,
                    created_at: new Date(),
                    updated_at: new Date(),
                });
                bookmarkBusiness.save();

                var json = ({
                    responseCode: 200,
                    responseMessage: "Business Bookmarked",
                    responseData: {
                        is_bookmarked: true
                    }
                });
            } else {
                BookmarkBusiness.remove({ user: user, business: req.body.id }).exec();
                var json = ({
                    responseCode: 200,
                    responseMessage: "Bookmark Removed",
                    responseData: {
                        is_bookmarked: false
                    }
                });
            }

            res.json(json);
        });
    }
});

router.get('/business/bookmark/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var user = decoded.user;

    var businesses = [];

    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }

    var bookmarkBusiness = await BookmarkBusiness.find({ user: user }).populate({ path: 'business', select: "name contact_no address careager_rating account_info avatar avatar business_info" }).exec();

    (bookmarkBusiness).forEach(function (u) {
        businesses.push(u.business);
    });

    var json = ({
        responseCode: 200,
        responseMessage: "success",
        responseData: businesses
    });
    res.status(200).json(json)
});

router.post('/car/bookmark', xAccessToken.token, async function (req, res, next) {
    var rules = {
        id: 'required',
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
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);

        var user = decoded.user;

        var car_id = req.body.id;

        BookmarkCar.find({ car: car_id, user: user }, function (err, doc) {
            if (doc.length == 0) {
                var bookmarkCar = new BookmarkCar({
                    user: user,
                    car: car_id,
                    created_at: new Date(),
                    updated_at: new Date(),
                });
                bookmarkCar.save();
                var json = ({
                    responseCode: 200,
                    responseMessage: "Car Bookmarked",
                    responseData: {
                        is_bookmarked: true
                    }
                });
            }
            else {
                BookmarkCar.remove({ car: car_id, user: user }).exec();

                var json = ({
                    responseCode: 200,
                    responseMessage: "Bookmark Removed",
                    responseData: {
                        is_bookmarked: false
                    }
                });
            }

            res.json(json);
        });
    }
});

router.get('/car/bookmark/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var user = decoded.user;

    var cars = [];

    if (req.query.page == undefined) {
        var page = 0;
    }
    else {
        var page = req.query.page;
    }

    await BookmarkCar.find({ user: user })
        .sort({ created_at: -1 }).limit(config.perPage).skip(config.perPage * page)
        .cursor().eachAsync(async (d) => {
            await Car.findOne({ _id: d.car })
                .populate('bookmark')
                .populate('thumbnails')
                .populate('package')
                .populate({ path: 'user', select: 'name username avatar avatar_address account_info address' })
                .cursor().eachAsync(async (doc) => {
                    cars.push({
                        __v: 0,
                        _id: doc._id,
                        id: doc.id,
                        title: doc.title,
                        variant: doc.variant,
                        model: doc.model,
                        price: doc.price,
                        body_style: doc.body_style,
                        driven: doc.driven,
                        carId: doc.carId,
                        fuel_type: doc.fuel_type,
                        manufacture_year: doc.manufacture_year,
                        mileage: doc.mileage,
                        transmission: doc.transmission,
                        geometry: doc.geometry,
                        publish: doc.publish,
                        status: doc.status,
                        premium: doc.premium,
                        is_bookmarked: doc.is_bookmarked,
                        thumbnails: doc.thumbnails,
                        user: doc.user,
                        odometer: doc.odometer,
                        package: doc.package,
                        isChatEnable: await q.all(fun.isChatEnable(doc.user._id, req.headers['tz'])),
                        created_at: moment(doc.created_at).tz(req.headers['tz']).format('ll'),
                        updated_at: moment(doc.updated_at).tz(req.headers['tz']).format('ll'),
                    });
                });
        });

    var json = ({
        responseCode: 200,
        responseMessage: "success",
        responseData: cars
    });
    res.status(200).json(json)
});

router.post('/offer/bookmark', xAccessToken.token, function (req, res, next) {
    var rules = {
        id: 'required',
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
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);

        var user = decoded.user;

        var offer_id = req.body.id;

        BookmarkOffer.find({ offer: offer_id, user: user }, function (err, doc) {
            if (doc.length == 0) {
                var bookmarkOffer = new BookmarkOffer({
                    user: user,
                    offer: offer_id,
                    created_at: new Date(),
                    updated_at: new Date(),
                });
                bookmarkOffer.save();
                // console.log(doc)
                var json = ({
                    responseCode: 200,
                    responseMessage: "Offer Bookmarked",
                    rresponseData: {
                        is_bookmarked: true
                    }
                });
            } else {
                BookmarkOffer.remove({ offer: offer_id, user: user }).exec();

                var json = ({
                    responseCode: 200,
                    responseMessage: "Bookmark Removed",
                    responseData: {
                        is_bookmarked: false
                    }
                });
            }

            res.json(json);
        });
    }
});

router.get('/offer/bookmark/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var user = decoded.user;

    var offers = [];

    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }

    await BookmarkOffer.find({ user: user })
        .sort({ created_at: -1 }).limit(config.perPage).skip(config.perPage * page)
        .cursor().eachAsync(async (d) => {
            await BusinessOffer.find({ _id: d.offer })
                .populate('bookmark')
                .populate({ path: 'business', select: 'name username avatar avatar_address address' })
                .sort({ created_at: -1 }).limit(config.perPage).skip(config.perPage * page)
                .cursor().eachAsync(async (p) => {
                    offers.push({
                        _id: p._id,
                        id: p.id,
                        offer: p.offer,
                        description: p.description,
                        file_address: p.file_address,
                        valid_till: p.valid_till,
                        is_bookmarked: p.is_bookmarked,
                        business: p.business,
                        created_at: moment(p.created_at).tz(req.headers['tz']).format('ll'),
                        updated_at: moment(p.updated_at).tz(req.headers['tz']).format('ll'),
                    })
                });
        });

    var json = ({
        responseCode: 200,
        responseMessage: "success",
        responseData: offers
    });
    res.status(200).json(json)
});

router.post('/product/bookmark', xAccessToken.token, function (req, res, next) {
    var rules = {
        id: 'required',
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
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);

        var business = decoded.user;

        var product_id = req.body.id;

        BookmarkProduct.find({ product: product_id, business: business }, function (err, doc) {
            if (doc.length == 0) {
                var bookmarkProduct = new BookmarkProduct({
                    business: business,
                    product: product_id,
                    created_at: new Date(),
                    updated_at: new Date(),
                });
                bookmarkProduct.save();

                var json = ({
                    responseCode: 200,
                    responseMessage: "Product Bookmarked",
                    responseData: {
                        is_bookmarked: true
                    }
                });
            } else {
                BookmarkProduct.remove({ product: product_id, business: business }).exec();

                var json = ({
                    responseCode: 200,
                    responseMessage: "Bookmark Removed",
                    responseData: {
                        is_bookmarked: false
                    }
                });
            }

            res.json(json);
        });
    }
});

router.get('/product/bookmark/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var user = decoded.user;

    var products = [];

    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }

    await BookmarkProduct.find({ user: user })
        .sort({ created_at: -1 }).limit(config.perPage).skip(config.perPage * page)
        .cursor().eachAsync(async (d) => {
            await BusinessProduct.findOne({ _id: d.product })
                .populate('bookmark')
                .populate('thumbnails')
                .populate({ path: 'business', select: 'name username avatar avatar_address address' })
                .sort({ created_at: -1 }).limit(config.perPage).skip(config.perPage * page)
                .populate({ path: 'category' }).cursor().eachAsync(async (p) => {
                    products.push({
                        title: p.title,
                        description: p.description,
                        price: p.price,
                        category: p.category,
                        thumbnails: p.thumbnails,
                        business: p.business,
                        bookmark: p.bookmark,
                        created_at: moment(p.created_at).tz(req.headers['tz']).format('ll'),
                        updated_at: moment(p.updated_at).tz(req.headers['tz']).format('ll'),
                    })
                });
        });

    var json = ({
        responseCode: 200,
        responseMessage: "success",
        responseData: products
    });
    res.status(200).json(json)
});

router.post('/model/bookmark', xAccessToken.token, function (req, res, next) {
    var rules = {
        id: 'required',
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
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var user = decoded.user;
        var model = req.body.id;

        BookmarkModel.find({ model: model, user: user }, function (err, doc) {
            if (doc.length == 0) {
                var bookmarkModel = new BookmarkModel({
                    user: user,
                    model: model,
                    created_at: new Date(),
                    updated_at: new Date(),
                });

                bookmarkModel.save();

                var json = ({
                    responseCode: 200,
                    responseMessage: "Model Bookmarked",
                    responseData: {
                        is_bookmarked: true
                    }
                });
            } else {
                BookmarkModel.remove({ model: model, user: user }).exec();

                var json = ({
                    responseCode: 200,
                    responseMessage: "Bookmark Removed",
                    responseData: {
                        is_bookmarked: false
                    }
                });
            }

            res.json(json);
        });
    }
});

router.get('/bookmark/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var user = decoded.user;

    var businesses = [];
    var cars = [];
    var products = [];
    var offers = [];
    var models = [];

    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }

    var bookmarkBusiness = await BookmarkBusiness.find({ user: user }).populate({ path: 'business', select: "name contact_no address careager_rating account_info avatar avatar business_info" }).exec();

    (bookmarkBusiness).forEach(function (u) {
        businesses.push(u.business);
    });

    await BookmarkCar.find({ user: user })
        .sort({ created_at: -1 }).limit(config.perPage).skip(config.perPage * page)
        .cursor().eachAsync(async (d) => {
            await Car.findOne({ _id: d.car })
                .populate('bookmark')
                .populate('thumbnails')
                .populate({ path: 'user', select: 'name username avatar avatar_address account_info address' })
                .cursor().eachAsync(async (doc) => {
                    cars.push({
                        __v: 0,
                        _id: doc._id,
                        id: doc.id,
                        title: doc.title,
                        variant: doc.variant,
                        model: doc.model,
                        price: doc.price,
                        body_style: doc.body_style,
                        driven: doc.driven,
                        carId: doc.carId,
                        fuel_type: doc.fuel_type,
                        manufacture_year: doc.manufacture_year,
                        mileage: doc.mileage,
                        transmission: doc.transmission,
                        geometry: doc.geometry,
                        link: "/car/" + slugify(doc.title + " " + doc._id),
                        publish: doc.publish,
                        status: doc.status,
                        premium: doc.premium,
                        is_bookmarked: doc.is_bookmarked,
                        thumbnails: doc.thumbnails,
                        user: doc.user,
                        created_at: moment(doc.created_at).tz(req.headers['tz']).format('ll'),
                        updated_at: moment(doc.updated_at).tz(req.headers['tz']).format('ll'),
                    });
                });
        });


    await BookmarkProduct.find({ user: user })
        .sort({ created_at: -1 }).limit(config.perPage).skip(config.perPage * page)
        .cursor().eachAsync(async (d) => {
            await BusinessProduct.findOne({ _id: d.product })
                .populate('bookmark')
                .populate('thumbnails')
                .populate({ path: 'business', select: 'name username avatar avatar_address address' })
                .sort({ created_at: -1 }).limit(config.perPage).skip(config.perPage * page)
                .populate({ path: 'category' }).cursor().eachAsync(async (p) => {
                    products.push({
                        title: p.title,
                        description: p.description,
                        price: p.price,
                        category: p.category,
                        thumbnails: p.thumbnails,
                        business: p.business,
                        bookmark: p.bookmark,
                        created_at: moment(p.created_at).tz(req.headers['tz']).format('ll'),
                        updated_at: moment(p.updated_at).tz(req.headers['tz']).format('ll'),
                    })
                });
        });

    await BookmarkOffer.find({ user: user })
        .sort({ created_at: -1 }).limit(config.perPage).skip(config.perPage * page)
        .cursor().eachAsync(async (d) => {
            await BusinessOffer.find({ _id: d.offer })
                .populate('bookmark')
                .populate({ path: 'business', select: 'name username avatar avatar_address address' })
                .sort({ created_at: -1 }).limit(config.perPage).skip(config.perPage * page)
                .cursor().eachAsync(async (p) => {
                    offers.push({
                        _id: p._id,
                        id: p.id,
                        offer: p.offer,
                        description: p.description,
                        file_address: p.file_address,
                        valid_till: p.valid_till,
                        is_bookmarked: p.is_bookmarked,
                        business: p.business,
                        created_at: moment(p.created_at).tz(req.headers['tz']).format('ll'),
                        updated_at: moment(p.updated_at).tz(req.headers['tz']).format('ll'),
                    })
                });
        });

    await BookmarkModel.find({ user: user })
        .sort({ created_at: -1 }).limit(config.perPage).skip(config.perPage * page)
        .cursor().eachAsync(async (d) => {
            await Model.find({ _id: d.model })
                .populate('bookmark')
                .sort({ created_at: -1 }).limit(config.perPage).skip(config.perPage * page)
                .cursor().eachAsync(async (model) => {
                    var variant = await Variant.findOne({ model: model._id }).exec();
                    models.push({
                        id: model._id,
                        id: model._id,
                        title: model.model,
                        model: model.value,
                        price: minMaxPrice(model.price[0].min, model.price[0].max),
                        verdict: model.verdict,
                        media_rating: model.media_rating,
                        careager_rating: model.careager_rating,
                        feature_image: "https://s3.ap-south-1.amazonaws.com/" + config.BUCKET_NAME + "/model/" + model.feature_image,
                        is_bookmarked: model.is_bookmarked,
                        specification: {
                            displacement: variant.specification.displacement,
                            fuel_type: variant.specification.fuel_type,
                            power: Math.ceil(variant.specification.power.split('PS@')[0] * 0.98) + " BHP",
                            highway_mileage: variant.specification.highway_mileage,
                        },
                    })
                });
        });

    var bookmarks = {
        businesses: businesses,
        offers: offers,
        cars: cars,
        products: products,
        models: models
    };

    var json = ({
        responseCode: 200,
        responseMessage: "success",
        responseData: bookmarks
    });
    res.status(200).json(json)
});

router.get('/all/reviews', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /all/reviews Api Called from common.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var loggedInDetails = await User.findById(decoded.user).exec();

    var user = decoded.user;
    var businesses = [];

    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }
    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Fatching All the Reviews for the User, user:" + loggedInDetails.name);
    }
    var review = await Review.find({ business: req.query.id }).populate('user', 'name username avatar').sort({ created_at: -1 }).skip(config.perPage * page).limit(config.perPage).exec();


    var json = ({
        responseCode: 200,
        responseMessage: "success",
        responseData: review
    });

    res.status(200).json(json)
    if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("INFO: All Reviews for the user send in Response Successfully, User:" + loggedInDetails.name);
    }

});

router.get('/all/cars', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /all/cars Api Called from common.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var loggedInDetails = await User.findById(decoded.user).exec();

    var user = decoded.user;
    var cars = [];

    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }
    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Fatching All Cars List, User:" + loggedInDetails.name);
    }
    await Car.find({ user: req.query.id, status: true })
        .populate('thumbnails')
        .populate('bookmark')
        .populate({ path: 'user', select: 'name username avatar avatar_address account_info address' })
        .sort({ created_at: -1 }).limit(config.perPage)
        .skip(config.perPage * page)
        .cursor().eachAsync(async (doc) => {
            var on_booking = await Booking.find({ car: doc._id, status: { $ne: "Completed" } }).count().exec();
            cars.push({
                __v: 0,
                _id: doc._id,
                id: doc.id,
                title: doc.title,
                variant: doc.variant,
                model: doc.model,
                price: doc.price,
                accidental: doc.accidental,
                body_style: doc.body_style,
                description: doc.description,
                driven: doc.driven,
                carId: doc.carId,
                fuel_type: doc.fuel_type,
                insurance_info: doc.insurance_info,
                location: doc.location,
                manufacture_year: doc.manufacture_year,
                odometer: doc.odometer,
                owner: doc.owner,
                price: doc.price,
                registration_no: doc.registration_no,
                service_history: doc.service_history,
                transmission: doc.transmission,
                vehicle_color: doc.vehicle_color,
                vehicle_status: doc.vehicle_status,
                geometry: doc.geometry,
                link: "/car/" + slugify(doc.title + " " + doc._id),
                publish: doc.publish,
                status: doc.status,
                premium: doc.premium,
                is_bookmarked: doc.is_bookmarked,
                thumbnails: doc.thumbnails,
                user: doc.user,
                on_booking: on_booking > 0 ? true : false,
                created_at: moment(doc.created_at).tz(req.headers['tz']).format('ll'),
                updated_at: moment(doc.updated_at).tz(req.headers['tz']).format('ll'),
            });
        });

    var json = ({
        responseCode: 200,
        responseMessage: "success",
        responseData: cars
    });
    res.status(200).json(json)
    if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("INFO: All Cars List with their details send in Response Successfully, User:" + loggedInDetails.name);
    }
});

router.get('/all/products', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var user = decoded.user;
    var products = [];

    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }

    await BusinessProduct.findOne({ business: req.query.id })
        .populate('bookmark')
        .populate('thumbnails')
        .populate({ path: 'business', select: 'name username avatar avatar_address address' })
        .sort({ created_at: -1 }).limit(config.perPage).skip(config.perPage * page)
        .populate({ path: 'category' }).cursor().eachAsync(async (p) => {
            products.push({
                title: p.title,
                description: p.description,
                price: p.price,
                category: p.category,
                thumbnails: p.thumbnails,
                business: p.business,
                bookmark: p.bookmark,
                created_at: moment(p.created_at).tz(req.headers['tz']).format('ll'),
                updated_at: moment(p.updated_at).tz(req.headers['tz']).format('ll'),
            })
        });


    var json = ({
        responseCode: 200,
        responseMessage: "success",
        responseData: products
    });
    res.status(200).json(json)
});
//Abhinav Tyagi
router.get('/all/offers', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var user = decoded.user;
    var offers = [];

    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }

    await BusinessOffer.find({ business: req.query.id })
        .populate('bookmark')
        .populate({ path: 'business', select: 'name username avatar avatar_address address' })
        .sort({ created_at: -1 }).limit(config.perPage).skip(config.perPage * page)
        .cursor().eachAsync(async (p) => {
            offers.push({
                _id: p._id,
                id: p.id,
                offer: p.offer,
                description: p.description,
                file_address: p.file_address,
                valid_till: p.valid_till,
                is_bookmarked: p.is_bookmarked,
                business: p.business,
                created_at: moment(p.created_at).tz(req.headers['tz']).format('ll'),
                updated_at: moment(p.updated_at).tz(req.headers['tz']).format('ll'),
            });
        });

    var json = ({
        responseCode: 200,
        responseMessage: "success",
        responseData: offers
    });
    res.status(200).json(json)
});

router.get('/bookmarked/model', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var user = decoded.user;
    var offers = [];

    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }

    await BookmarkOffer.find({ user: user })
        .sort({ created_at: -1 }).limit(config.perPage).skip(config.perPage * page)
        .cursor().eachAsync(async (d) => {
            await BusinessOffer.find({})
                .populate('bookmark')
                .populate({ path: 'business', select: 'name username avatar avatar_address address' })
                .sort({ created_at: -1 }).limit(config.perPage).skip(config.perPage * page)
                .cursor().eachAsync(async (p) => {
                    offers.push({
                        _id: p._id,
                        id: p.id,
                        offer: p.offer,
                        description: p.description,
                        file_address: p.file_address,
                        valid_till: p.valid_till,
                        bookmark: p.bookmark,
                        business: p.business,
                        created_at: moment(p.created_at).tz(req.headers['tz']).format('ll'),
                        updated_at: moment(p.updated_at).tz(req.headers['tz']).format('ll'),
                    })
                });
        });

    var json = ({
        responseCode: 200,
        responseMessage: "success",
        responseData: offers
    });
    res.status(200).json(json)
});

router.get('/explore/offers', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var business = decoded.user;

    //paginate
    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }

    var page = Math.max(0, parseInt(page));
    var maxDistance = req.query.range * 100 || 100;

    // we need to convert the distance to radians
    // the raduis of Earth is approximately 6371 kilometers
    maxDistance /= 6371;


    var offers = [];


    await BusinessOffer.find({
        geometry: {
            $near: [parseFloat(req.query.longitude), parseFloat(req.query.latitude)],
            $maxDistance: maxDistance
        }
    })
        .populate('bookmark')
        .populate({ path: 'business', select: 'name username avatar avatar_address address' })
        .sort({ created_at: -1 })
        .skip(config.perPage * page)
        .limit(config.perPage)
        .cursor().eachAsync(async (p) => {
            offers.push({
                _id: p._id,
                id: p.id,
                offer: p.offer,
                description: p.description,
                file_address: p.file_address,
                valid_till: p.valid_till,
                is_bookmarked: p.is_bookmarked,
                business: p.business,
                created_at: moment(p.created_at).tz(req.headers['tz']).format('ll'),
                updated_at: moment(p.updated_at).tz(req.headers['tz']).format('ll'),
            })
        });

    res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: offers,
    })
});

router.get('/explore/careager/offers', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var business = decoded.user;
    var offers = [];

    //paginate
    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }

    var page = Math.max(0, parseInt(page));


    await BusinessOffer.find({ isCarEager: true, publish: true })
        .populate('bookmark')
        .populate({ path: 'business', select: 'name username avatar avatar_address address' })
        .sort({ created_at: -1 })
        .skip(config.perPage * page)
        .limit(config.perPage)
        .cursor().eachAsync(async (p) => {
            offers.push({
                _id: p._id,
                id: p.id,
                offer: p.offer,
                description: p.description,
                file_address: p.file_address,
                valid_till: p.valid_till,
                is_bookmarked: p.is_bookmarked,
                business: p.business,
                created_at: moment(p.created_at).tz(req.headers['tz']).format('ll'),
                updated_at: moment(p.updated_at).tz(req.headers['tz']).format('ll'),
            })
        });

    res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: offers,
    })
});

router.get('/explore/careager/outlets', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var business = decoded.user;

    var result = [];
    var reviews = [];
    var filterBy = new Object();

    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }

    await User.find({
        'isCarEager': true,
        'visibility': true,
        'account_info.type': 'business'
    })
        .sort({ created_at: -1 })
        .select('-password')
        .cursor().eachAsync(async (u) => {

            var reviews = await Review.find({ business: u._id }).exec();

            var avg_rating = _(reviews).filter('rating').reduce(function (a, m, i, p) {
                return a + m.rating / p.length;
            }, 0);

            result.push({
                _id: u._id,
                id: u.id,
                name: u.name,
                username: u.username,
                email: u.email,
                contact_no: u.contact_no,
                avatar_address: u.avatar_address,
                account_info: u.account_info,
                address: u.address,
                geometry: u.geometry,
                business_info: u.business_info,
                joined: u.created_at,
                careager_rating: u.careager_rating,
                business_info: u.business_info,
                ratings: avg_rating,
            });
        })

    res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: result,
    });
});

router.get('/explore/business', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var business = decoded.user;

    var result = [];
    var reviews = [];
    var filterBy = new Object();

    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }

    var maxDistance = req.query.range * 100 || 100;

    maxDistance /= 6371;


    if (req.query.category == "All") {
        var query = User.find({
            geometry: {
                $near: [parseFloat(req.query.longitude), parseFloat(req.query.latitude)],
                $maxDistance: maxDistance
            },
            visibility: true,
            'account_info.type': 'business',
        });
    }
    else {
        var query = User.find({
            visibility: true,
            'account_info.type': 'business',
            'business_info.business_category': req.query.category,
            geometry: {
                $near: [parseFloat(req.query.longitude), parseFloat(req.query.latitude)],
                $maxDistance: maxDistance
            }
        })
    }

    await query.sort({ created_at: -1 })
        .limit(config.perPage)
        .skip(config.perPage * page)
        .select('-password')
        .cursor().eachAsync(async (u) => {

            var reviews = await Review.find({ business: u._id }).exec();

            var avg_rating = _(reviews).filter('rating').reduce(function (a, m, i, p) {
                return a + m.rating / p.length;
            }, 0);

            result.push({
                _id: u._id,
                id: u.id,
                name: u.name,
                username: u.username,
                email: u.email,
                contact_no: u.contact_no,
                avatar: u.avatar,
                account_info: u.account_info,
                address: u.address,
                geometry: u.geometry,
                business_info: u.business_info,
                joined: u.created_at,
                careager_rating: u.careager_rating,
                business_info: u.business_info,
                ratings: avg_rating,
            });
        });

    res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: result,
    });
});

router.get('/explore/new/car', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var specification = new Object();
    var filterBy = new Object();

    var user = decoded.user;
    var result = [];
    var query;

    if (req.query.page == undefined) {
        var page = 0;
    }
    else {
        var page = parseInt(req.query.page);
    }

    if (req.query.fuel) {
        var fuel = req.query.fuel;
        specification['specification.fuel_type'] = { $in: fuel.split(',') }
    }

    if (req.query.transmission) {
        var transmissions = req.query.transmission;
        specification['specification.type'] = { $in: transmissions.split(',') }
    }

    if (req.query.body_style) {
        var body_style = req.query.body_style;
        specification['specification.body_type'] = { $in: body_style.split(',') }
    }

    if (req.query.min != 0 && req.query.max != 0) {
        if (req.query.max >= 100) {
            filterBy['price'] = { $gte: parseInt(req.query.min) * 100000, $lte: 1000000000 }
        }
        else {
            filterBy['price'] = { $gte: parseInt(req.query.min) * 100000, $lte: parseInt(req.query.max) * 100000 }
        }
    }

    if (req.query.model) {
        var modelObject = [];
        var models = req.query.model;
        var modelArray = models.split(',')

        for (var m = 0; m < modelArray.length; m++) {
            modelObject.push(mongoose.Types.ObjectId(modelArray[m]));
        }

        filterBy['model'] = { $in: modelObject };
        filterBy['price'] = { $gte: 0, $lte: 1000000000 }
    }

    //res.json(filterBy)

    await Variant.aggregate([
        { "$match": { "$and": [filterBy] } },
        { "$unwind": "$specification" },
        { "$match": { "$and": [specification] } },
        { "$unwind": "$model" },
        {
            "$lookup": {
                "from": "Model",
                "localField": "model",
                "foreignField": "_id",
                "as": "model"
            }
        },
        { $group: { _id: '$model', data: { $push: '$$ROOT' } } },
        { $skip: config.perPage * page },
        { $limit: config.perPage }
    ])
        .allowDiskUse(true)
        .cursor({ batchSize: 10 })
        .exec()
        .eachAsync(async function (doc) {
            var count = await BookmarkModel.findOne({ model: doc.data[0].model[0]._id, user: user }).count().exec()
            var is_bookmarked = count > 0 ? true : false;

            result.push({
                _id: doc.data[0].model[0]._id,
                id: doc.data[0].model[0]._id,
                model: doc.data[0].model[0].model,
                value: doc.data[0].model[0].value,
                price: minMaxPrice(doc.data[0].model[0].price[0].min, doc.data[0].model[0].price[0].max),
                is_bookmarked: is_bookmarked,
                feature_image: "https://s3.ap-south-1.amazonaws.com/" + config.BUCKET_NAME + "/model/" + doc.data[0].model[0].feature_image,
                specification: {
                    displacement: doc.data[0].specification.displacement,
                    fuel_type: doc.data[0].specification.fuel_type,
                    power: Math.ceil(doc.data[0].specification.power.split('PS@')[0] * 0.98) + " BHP",
                    highway_mileage: doc.data[0].specification.arai_certified_mileage,
                },
            });
        });

    res.status(200).json({
        responseCode: 200,
        responseMessage: 'success',
        responseData: result
    });
});

router.get('/explore/used/car', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var filterBy = new Object();

    var business = decoded.user;
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
        posted_by: "business",
        publish: true,
        admin_approved: true,
        status: true,
    })


    if (req.query.fuel) {
        fuel = req.query.fuel;
        query = query.where('fuel_type').in(fuel.split(','));
    }

    if (req.query.transmission) {
        transmissions = req.query.transmission;
        query = query.where('transmission').in(transmissions.split(','));
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
        .populate({ path: 'user', select: 'name avatar contact_no avatar_address account_info business_info partner' })
        .sort({ created_at: -1 }).limit(config.perPage).skip(config.perPage * page)
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

                id: doc.id,
                odometer: doc.odometer,
                package: doc.package,
                isChatEnable: await q.all(fun.isChatEnable(doc.user._id, req.headers['tz'])),
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

router.get('/brand/get', async function (req, res, next) {
    var data = {};
    if (req.query.type == "Battery") {
        data = await BatteryBrand.find({}).exec()
    }

    else if (req.query.type == "Automaker") {
        data = await Automaker.find({}).sort({ maker: -1 }).exec()
    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Unprocessable Entity",
            responseData: data,
        });
    }

    res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: data,
    });
});

router.get('/makers/get', async function (req, res, next) {
    var rules = {
        query: 'required',
    };

    var validation = new Validator(req.query, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Invalid Request",
            responseData: {
                res: validation.errors.all()
            }
        })
    }
    else {
        if (req.query.query) {
            req.query.query = req.query.query.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
            var variant = [];

            await Variant.find({ variant: new RegExp(req.query.query, "i") })
                .select('-service_schedule')
                .cursor().eachAsync(async (v) => {
                    variant.push({
                        _id: v._id,
                        id: v.id,
                        variant: v.variant + " (" + v.specification.fuel_type + ")",
                        value: v.value
                    })
                });

            res.status(200).json({
                responseCode: 200,
                responseMessage: "success",
                responseData: variant
            });
        }
    }
});

router.get('/models/list/get', async function (req, res, next) {
    var models = [];
    if (req.query.query) {
        await Model.find({ model: new RegExp(req.query.query, "i") })
            .cursor().eachAsync(async (v) => {
                models.push({
                    _id: v._id,
                    id: v.id,
                    model: v.model,
                    value: v.value
                });
            });
    }
    else {
        await Model.find({})
            .cursor().eachAsync(async (v) => {
                models.push({
                    _id: v._id,
                    id: v.id,
                    model: v.model,
                    value: v.value,
                    segment: v.segment
                });
            });
    }

    res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: models
    });
});

router.get('/models/get', async function (req, res, next) {
    var rules = {
        id: 'required',
    };

    var validation = new Validator(req.query, rules);

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
        var data = [];
        var modelReview = [];

        await Model.find({ automaker: req.query.id }).populate('automaker').cursor().eachAsync(async (model) => {
            data.push({
                _id: model._id,
                id: model._id,
                value: model.model,
                automaker: model.automaker
            });
        });

        var json = ({
            responseCode: 200,
            responseMessage: "success",
            responseData: data
        });
        res.status(200).json(json)
    }
});

router.get('/model/get', async function (req, res, next) {
    var rules = {
        id: 'required',
    };

    var validation = new Validator(req.query, rules);

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
        var data = [];
        var modelReview = [];

        await Model.findById(req.query.id).populate('automaker').cursor().eachAsync(async (model) => {
            data.push({
                _id: model._id,
                id: model._id,
                title: model.model,
                model: model.value,
                automaker: model.automaker,
                careager_rating: model.careager_rating,
                media_rating: model.media_rating,
                user_review: await q.all(modelReviews(model._id, req.headers['tz'])),
                variants: await q.all(variants(model._id)),
                images: await q.all(modelMedia(model._id, "image")),
                videos: await q.all(modelMedia(model._id, "video")),
                price: model.price,
            });
        });

        var json = ({
            responseCode: 200,
            responseMessage: "success",
            responseData: data
        });
        res.status(200).json(json)
    }
});

router.get('/variants/get', async function (req, res, next) {
    var rules = {
        id: 'required',
    };

    var validation = new Validator(req.query, rules);

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
        var variant = [];
        await Variant.find({ model: req.query.id }).select('-service_schedule').cursor().eachAsync(async (v) => {
            variant.push({
                _id: v._id,
                id: v.id,
                value: v.value + " (" + v.specification.fuel_type + ")"
            })
        });

        res.status(200).json({
            responseCode: 200,
            responseMessage: "success",
            responseData: variant
        });
    }
});

router.get('/variant/get', xAccessToken.token, async function (req, res, next) {
    var rules = {
        id: 'required',
    };

    var validation = new Validator(req.query, rules);

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
        var variant = await Variant.findById(req.query.id).select('-service_schedule').populate({ path: 'model', populate: { path: 'automaker', } }).exec();

        res.status(200).json({
            responseCode: 200,
            responseMessage: "success",
            responseData: variant
        });
    }
});

router.post('/logout', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO : /logout Api called from common.js, " + " " + "Request Headers:" + JSON.stringify(req.headers) + "Request Body :" + JSON.stringify(req.body));
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = await User.findById(decoded.user).exec();
    // console.log("Logged Out");
    if (user) {
        var deviceInfo = _.filter(user.device, device => device.token != token);

        await User.update(
            { _id: user._id },
            {
                "$set": {
                    device: deviceInfo,
                    updated_at: new Date()
                }
            },
            function (err, numAffected) {
                if (!err) {
                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "You are now Logged Out",
                        responseData: {},
                    });
                }
            }
        );
    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "User not found",
            responseData: {},
        });
    }
});

router.get('/notifications/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var user = decoded.user;
    var notifications = [];

    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }
    var page = Math.max(0, parseInt(page));

    await Notification.find({ user: user })
        .populate({ path: 'user', select: "_id id name avatar_address avatar" })
        .populate({ path: 'sender', select: "_id id name avatar_address avatar" })
        .sort({ created_at: -1 }).limit(config.perPage)
        .skip(config.perPage * page)
        .cursor().eachAsync(async (n) => {
            notifications.push({
                user: n.user,
                sender: n.sender,
                activity: n.activity,
                source: n.source,
                title: n.title,
                body: n.body,
                status: n.status,
                created_at: moment(n.created_at).tz(req.headers['tz']).format('LLL'),
                updated_at: moment(n.created_at).tz(req.headers['tz']).format('LLL'),
            });
        });

    const doc = ({
        status: true,
        updated_at: Date.now(),
    });

    Notification.update({ user: user, status: false }, doc, function (err, raw) { });

    res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: notifications,
    });
});

router.post('/detailing/data', async function (req, res, next) {
    var a = req.body;
    for (var l = 0; l < a.length; l++) {
        if (req.body[l].treatment_name) {
            await Model.find({ segment: req.body[l].type })
                .populate('automaker')
                .cursor().eachAsync(async (model) => {
                    req.body[l].automaker = model.automaker._id;
                    req.body[l].maker = model.automaker.maker;
                    req.body[l].model = model._id;
                    req.body[l].for = model.value;
                    req.body[l].service = req.body[l].treatment_name;
                    req.body[l].package = req.body[l].category;
                    req.body[l].labour_cost = Math.ceil(req.body[l].labour);
                    req.body[l].part_cost = Math.ceil(req.body[l].part);
                    req.body[l].cost = Math.ceil(req.body[l].labour) + Math.ceil(req.body[l].part);
                    req.body[l].mrp = Math.ceil(req.body[l].MRP);
                    var video_links = req.body[l].video_links;


                    Detailing.create(req.body[l]).then(async function (service) {
                        video_links.forEach(async function (l) {

                            var data = {
                                source: service._id,
                                file: l,
                                type: "link",
                                category: "Detailing",
                                created_at: new Date(),
                                updated_at: new Date(),
                            };

                            var galleryImage = new Gallery(data);
                            galleryImage.save();

                        });
                    });
                });
        }
    }
    res.json(req.body[l])
});

router.post('/driver/', xAccessToken.token, async function (req, res, next) {
    var rules = {
        contact_no: 'required',
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Contact no. is required",
            responseData: {
                res: validation.errors.all()
            }
        })
    }
    else {
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var checkBooking = await Booking.findById(req.body.booking).exec();
        if (checkBooking) {
            var booking = checkBooking._id
        }
        else {
            var booking = null;
        }

        if (req.body.driver) {
            var checkDriverPhone = await User.findOne({ _id: req.body.driver }).exec();
            if (checkDriverPhone.account_info.type == "driver") {
                /*var check = await DriverVerification.findOne({user: checkDriverPhone._id}).exec();
                var data = {
                    user: checkDriverPhone._id,
                    otp:Math.floor(Math.random() * 90000) + 10000,
                    created_at: new Date(),
                    updated_at: new Date()
                }
                if(check){
                    DriverVerification.findOneAndUpdate({user:checkDriverPhone._id}, {$set:data}, {new: true},async function(err, doc){});
                    event.otp(checkDriverPhone.contact_no,data.otp);
                }
                else
                {
                    DriverVerification.create(data);
                    event.otp(checkDriverPhone.contact_no,data.otp);
                }
                */

                if (req.body.owner) {
                    var checkOwner = await User.findOne({ _id: req.body.owner }).exec();
                    if (checkOwner) {
                        if (checkOwner.account_info.added_by == null) {
                            User.findOneAndUpdate({ _id: checkOwner._id }, { $set: { "account_info.added_by": checkDriverPhone._id } }, { new: false }, async function (err, doc) { })
                        }
                    }
                }

                if (booking) {
                    Booking.findOneAndUpdate({ _id: booking }, { $set: { driver: checkDriverPhone._id } }, { new: false }, async function (err, doc) { });

                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "success",
                        responseData: {
                            contact_no: checkDriverPhone.contact_no,
                            name: checkDriverPhone.name,
                            _id: checkDriverPhone._id,
                            id: checkDriverPhone._id,
                            booking: booking
                        },
                    });
                }
                else {
                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "success",
                        responseData: {
                            contact_no: checkDriverPhone.contact_no,
                            name: checkDriverPhone.name,
                            _id: checkDriverPhone._id,
                            id: checkDriverPhone._id,
                            booking: booking
                        },
                    });
                }
            }
            else {
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Unauthorized",
                    responseData: {}
                });
            }
        }
        else {
            var checkUser = await User.findOne({ contact_no: req.body.contact_no }).exec();
            if (checkUser) {
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Contact No already exists",
                    responseData: {}
                });
            }
            else {
                var data = {};
                var country = await Country.findOne({ timezone: req.headers['tz'] }).exec();
                data.address = {
                    country: country.countryName,
                    timezone: req.headers['tz'],
                    location: data.location,
                };

                data.account_info = {
                    type: "driver",
                    added_by: null,
                    status: "Complete",
                };

                var name = req.body.name;
                name = name.substring(0, 3);
                var rand = Math.floor((Math.random() * 100000) + 1);

                data.username = name + "" + shortid.generate();
                data.contact_no = req.body.contact_no;
                data.email = req.body.email;
                data.name = req.body.name;

                var firstPart = (Math.random() * 46656) | 0;
                var secondPart = (Math.random() * 46656) | 0;
                firstPart = ("000" + firstPart.toString(36)).slice(-3);
                secondPart = ("000" + secondPart.toString(36)).slice(-3);
                data.referral_code = firstPart.toUpperCase() + secondPart.toUpperCase();

                data.geometry = [0, 0];
                data.device = [];
                data.otp = Math.floor(Math.random() * 90000) + 10000;
                req.body.uuid = uuidv1();
                data.careager_cash = 0;
                data.socialite = "";
                data.optional_info = "";
                data.business_info = "";

                User.create(data).then(async function (user) {
                    if (req.body.owner) {
                        var checkOwner = await User.findOne({ _id: req.body.owner }).exec();
                        if (checkOwner) {
                            if (checkOwner.account_info.added_by == null) {
                                User.findOneAndUpdate({ _id: checkOwner._id }, { $set: { "account_info.added_by": user._id } }, { new: false }, async function (err, doc) { });
                            }
                        }
                    }
                    var point = {
                        user: user._id,
                        points: 1000,
                        activity: "coin",
                        tag: "welcome",
                        source: null,
                        status: true,
                        created_at: new Date(),
                        updated_at: new Date(),
                    };

                    fun.addPoints(point);
                    event.otpSms(user);
                    event.otpSmsMail(user);

                    if (booking) {
                        Booking.findOneAndUpdate({ _id: booking }, { $set: { driver: user._id } }, { new: true }, async function (err, doc) { })
                    }

                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "success 1",
                        responseData: {
                            contact_no: user.contact_no,
                            name: user.name,
                            _id: user._id,
                            id: user._id,
                            booking: booking
                        },
                    });
                });
            }
        }
    }
});

router.post('/notifications/push', async function (req, res, next) {
    const subscription = { "endpoint": "https://fcm.googleapis.com/fcm/send/dVCCxzMqsNQ:APA91bEeXRyqCwaCMt2Q-qQGUnt9B7l5efTKEmbXg6ql5JNM9Po56zyqKgYz-jvf0yBY0P8imqgLtgux8XeyFSY9-cRNavROgc2J7FSF_Ap7bxMEJkMafQJeRNsvUmM9Ko6HuAgxz3p1", "expirationTime": null, "keys": { "p256dh": "BANBJGmLAUt3vSAXYT-P0qNBDUcN9jFS9BVsrANfXnTRoc8ESaRYi8c8yxafnrMIDwj-6_uXiwXoYrVooeIehgY", "auth": "-KtZyOkCCxFdPGjFw2D7Gw" } };

    const payload = JSON.stringify({ title: 'test' });

    webpush.sendNotification(subscription, payload)
        .catch(error => {
            // console.log(error);
        });
});

router.get('/insurance-company/search/get', async function (req, res, next) {
    var companies = await InsuranceCompany.find({}).exec()

    res.status(200).json({
        responseCode: 200,
        responseMessage: "companies",
        responseData: companies
    })
});

router.get('/review-points', xAccessToken.token, async function (req, res, next) {
    var rules = {
        booking: 'required',
    };

    var validation = new Validator(req.query, rules);

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
        if (req.query.booking != "null") {
            var booking = await Booking.findById(req.query.booking).exec();
            if (booking) {
                var reviewPoint = await ReviewPoint.find({ business: booking.business }).sort({ rating: 1 }).exec()

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "companies",
                    responseData: reviewPoint
                })
            }
            else {
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Booking not found",
                    responseData: {}
                })
            }
        }
        else {
            res.status(422).json({
                responseCode: 422,
                responseMessage: "Booking required",
                responseData: {
                }
            })
        }
    }
});

router.post('/car/lead', xAccessToken.token, async function (req, res, next) {
    var rules = {
        car: 'required',
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Car required",
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
        var car = await Car.findById(req.body.car).populate('user').exec();

        if (car) {
            /*var auth = await CarSellLead.findOne({user: loggedInDetails._id}).exec();
            if(auth)
            { 
                var sell = await CarSell.findOne({car: car._id, sold: false}).exec();
                var serverTime = moment.tz(new Date(), req.headers['tz']);
                var bar = auth.expired_at;
                var e = bar;
                bar = moment.tz(bar, req.headers['tz'])
                var baz = bar.diff(serverTime);
                if(baz>0)
                {
                    if(auth.verified==true)
                    {*/
            if (car.user.account_info.type == "business") {
                var checkLead = await Lead.findOne({ business: car.user._id, contact_no: loggedInDetails.contact_no, category: "Cars", "remark.status": { $in: ["Open", "Follow-Up"] } }).sort({ updated_at: -1 }).exec();

                if (checkLead) {
                    Lead.findOneAndUpdate({ _id: checkLead._id }, {
                        $set: {
                            type: "Cars",
                            follow_up: {
                                date: null,
                                time: "",
                                created_at: new Date(),
                                updated_at: new Date(),
                            },
                            remark: {
                                status: "Open",
                                resource: req.query.resource_url,
                                customer_remark: loggedInDetails.name + " " + loggedInDetails.contact_no + " " + "is interested in " + car.title,
                                assignee_remark: loggedInDetails.name + " " + loggedInDetails.contact_no + " " + "is interested in " + car.title,
                                resource: req.query.resource_url,
                                color_code: "",
                                created_at: new Date(),
                                updated_at: new Date()
                            },
                            // source: "Online",
                            source: checkLead.source,
                            updated_at: new Date()
                        }
                    }, { new: true }, async function (err, doc) {

                        LeadRemark.create({
                            lead: checkLead._id,
                            type: "Cars",
                            source: "Online",
                            resource: req.query.resource_url,
                            status: "Open",
                            customer_remark: loggedInDetails.name + " " + loggedInDetails.contact_no + " " + "is interested in " + car.title,
                            assignee_remark: loggedInDetails.name + " " + loggedInDetails.contact_no + " " + "is interested in " + car.title,
                            assignee: checkLead.assignee,
                            color_code: "",
                            created_at: new Date(),
                            updated_at: new Date()
                        }).then(function (newRemark) {
                            Lead.findOneAndUpdate({ _id: checkLead._id }, { $push: { remarks: newRemark._id } }, { new: true }, async function (err, doc) {
                            })
                        });


                        var lead = await Lead.findById(checkLead._id).populate('assignee').exec();

                        var logs = [];
                        await LeadRemark.find({ lead: lead._id })
                            .populate('assignee')
                            .sort({ created_at: -1 })
                            .cursor()
                            .eachAsync(async (l) => {
                                logs.push({
                                    source: l.source,
                                    type: l.type,
                                    reason: l.reason,
                                    status: l.status,
                                    customer_remark: l.customer_remark,
                                    assignee_remark: l.assignee_remark,
                                    assignee: {
                                        _id: l.assignee._id,
                                        id: l.assignee._id,
                                        name: l.assignee.name,
                                        email: l.assignee.email,
                                        contact_no: l.assignee.contact_no,
                                    },
                                    color_code: l.color_code,
                                    created_at: moment(l.created_at).tz(req.headers['tz']).format('lll'),
                                    updated_at: moment(l.updated_at).tz(req.headers['tz']).format('lll'),
                                })
                            })

                        var push = {
                            user: lead.user,
                            name: lead.name,
                            contact_no: lead.contact_no,
                            email: lead.email,
                            _id: lead._id,
                            id: lead.id,
                            priority: 2,
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
                            advisor: null,
                            logs: logs,
                            created_at: moment(lead.created_at).tz(req.headers['tz']).format('lll'),
                            updated_at: moment(lead.updated_at).tz(req.headers['tz']).format('lll'),
                        };


                        var notify = {
                            receiver: [lead.assignee._id, car.user._id],
                            activity: "lead",
                            tag: "assigned",
                            source: lead._id,
                            sender: lead.user,
                            points: 0
                        }

                        fun.newNotification(notify);
                        event.leadSms(car.user._id, loggedInDetails._id, req.headers['tz']);

                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "",
                            responseData: {
                                expired: false
                            }
                        });

                    });
                }
                else {
                    var assignee = await q.all(getAssignee(car.user._id));

                    var remark = {
                        assignee: assignee,
                        status: "Open",
                        reason: req.body.reason,
                        customer_remark: loggedInDetails.name + " " + loggedInDetails.contact_no + " " + "is interested in " + car.title,
                        assignee_remark: loggedInDetails.name + " " + loggedInDetails.contact_no + " " + "is interested in " + car.title,
                        color_code: "",
                        created_at: new Date(),
                        updated_at: new Date()
                    };

                    var lead = {
                        user: loggedInDetails._id,
                        name: loggedInDetails.name,
                        contact_no: loggedInDetails.contact_no,
                        email: loggedInDetails.email,
                        type: req.body.type,
                        category: "Cars",
                        follow_up: {
                            date: null,
                            time: "",
                            created_at: new Date(),
                            updated_at: new Date(),
                        },
                        business: car.user._id,
                        assignee: assignee,
                        advisor: null,
                        source: "Online",
                        remark: remark,
                        priority: 2,
                        created_at: new Date(),
                        updated_at: new Date()
                    };

                    Lead.create(lead).then(async function (l) {
                        // console.log(l)
                        var count = await Lead.find({ _id: { $lt: l._id }, business: car.user._id }).count();
                        var lead_id = count + 10000;

                        Lead.findOneAndUpdate({ _id: l._id }, { $set: { lead_id: lead_id } }, { new: true }, async function (err, doc) {
                        })

                        LeadRemark.create({
                            lead: l._id,
                            source: l.source,
                            type: l.type,
                            status: l.remark.status,
                            reason: req.body.reason,
                            customer_remark: loggedInDetails.name + " " + loggedInDetails.contact_no + " " + "is interested in " + car.title,
                            assignee_remark: loggedInDetails.name + " " + loggedInDetails.contact_no + " " + "is interested in " + car.title,
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
                                logs.push({
                                    source: l.source,
                                    type: l.type,
                                    reason: l.reason,
                                    status: l.status,
                                    customer_remark: l.customer_remark,
                                    assignee_remark: l.assignee_remark,
                                    assignee: {
                                        _id: l.assignee._id,
                                        id: l.assignee._id,
                                        name: l.assignee.name,
                                        email: l.assignee.email,
                                        contact_no: l.assignee.contact_no,
                                    },
                                    color_code: l.color_code,
                                    created_at: moment(l.created_at).tz(req.headers['tz']).format('lll'),
                                    updated_at: moment(l.updated_at).tz(req.headers['tz']).format('lll'),
                                })
                            });

                        var push = {
                            user: lead.user,
                            name: lead.name,
                            contact_no: lead.contact_no,
                            email: lead.email,
                            _id: lead._id,
                            id: lead.id,
                            priority: 2,
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
                            advisor: null,
                            logs: logs,
                            created_at: moment(lead.created_at).tz(req.headers['tz']).format('lll'),
                            updated_at: moment(lead.updated_at).tz(req.headers['tz']).format('lll'),
                        };

                        var notify = {
                            receiver: [lead.assignee._id, car.user._id],
                            activity: "lead",
                            tag: "assigned",
                            source: lead._id,
                            sender: lead.user,
                            points: 0
                        }

                        fun.newNotification(notify);
                        fun.webNotification("Lead", lead);
                        await whatsAppEvent.leadGenerate(l._id, l.business);
                        event.leadCre(l._id, l.business);
                        await whatsAppEvent.leadCre(l._id, l.business);


                        event.leadSms(car.user._id, loggedInDetails._id, req.headers['tz']);

                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "",
                            responseData: {
                                expired: false
                            }
                        });
                    });
                }
            }
            else {
                event.leadSms(car.user._id, loggedInDetails._id, req.headers['tz']);
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "",
                    responseData: {
                        expired: false
                    }
                });
            }
            /*}
            else
            {
                // console.log("true")
                event.carSellLead(loggedInDetails, car._id);
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "",
                    responseData: {
                        expired: true
                    }
                });
            }
        }
        else
        {
            event.carSellLead(loggedInDetails,car._id);
            res.status(200).json({
                responseCode: 200,
                responseMessage: "",
                responseData: {
                    expired: true
                }
            });
        }
    }
    else
    {
        event.carSellLead(loggedInDetails, car._id);
        res.status(200).json({
            responseCode: 200,
            responseMessage: "",
            responseData: {
                expired: true
            }
        });
    }*/
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Car not found",
                responseData: {}
            })
        }
    }
});

router.post('/lead/verification', xAccessToken.token, async function (req, res, next) {
    var rules = {
        otp: 'required',
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Car required",
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
        var auth = await CarSellLead.findOne({ user: loggedInDetails._id, otp: req.body.otp }).exec();

        if (auth) {
            var startdate = new Date();
            var new_date = moment(startdate, "DD-MM-YYYY").add(1, 'hours');

            var car = await Car.findById(auth.car).populate('user').exec();
            var sell = await CarSell.findOne({ car: auth.car, sold: false }).populate('user').exec();

            CarSellLead.findOneAndUpdate({ _id: auth._id, user: loggedInDetails._id }, { $set: { verified: true, otp: null, expired_at: new_date } }, { new: false }, async function (err, s) {
                if (err) {
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Server Error",
                        responseData: err
                    });
                }
                else {
                    if (car.user.account_info.type == "business") {
                        var checkLead = await Lead.findOne({ business: car.user._id, contact_no: loggedInDetails.contact_no, category: "Cars", "remark.status": { $in: ["Open", "Follow-Up"] } }).sort({ updated_at: -1 }).exec();

                        if (checkLead) {
                            Lead.findOneAndUpdate({ _id: checkLead._id }, {
                                $set: {
                                    type: "Cars",
                                    follow_up: {
                                        date: null,
                                        time: "",
                                        created_at: new Date(),
                                        updated_at: new Date(),
                                    },
                                    remark: {
                                        status: "Open",
                                        resource: req.query.resource_url,
                                        customer_remark: loggedInDetails.name + " " + loggedInDetails.contact_no + " " + "is interested in " + car.title,
                                        assignee_remark: loggedInDetails.name + " " + loggedInDetails.contact_no + " " + "is interested in " + car.title,
                                        resource: req.query.resource_url,
                                        color_code: "",
                                        created_at: new Date(),
                                        updated_at: new Date()
                                    },
                                    // source: "Online",
                                    source: checkLead.source,
                                    updated_at: new Date()
                                }
                            }, { new: true }, async function (err, doc) {

                                LeadRemark.create({
                                    lead: checkLead._id,
                                    type: "Cars",
                                    source: "Online",
                                    resource: req.query.resource_url,
                                    status: "Open",
                                    customer_remark: loggedInDetails.name + " " + loggedInDetails.contact_no + " " + "is interested in " + car.title,
                                    assignee_remark: loggedInDetails.name + " " + loggedInDetails.contact_no + " " + "is interested in " + car.title,
                                    assignee: checkLead.assignee,
                                    color_code: "",
                                    created_at: new Date(),
                                    updated_at: new Date()
                                }).then(function (newRemark) {
                                    Lead.findOneAndUpdate({ _id: checkLead._id }, { $push: { remarks: newRemark._id } }, { new: true }, async function (err, doc) {
                                    })
                                });


                                var lead = await Lead.findById(checkLead._id).populate('assignee').exec();

                                var logs = [];
                                await LeadRemark.find({ lead: lead._id })
                                    .populate('assignee')
                                    .sort({ created_at: -1 })
                                    .cursor()
                                    .eachAsync(async (l) => {
                                        var leadAssignee = {};
                                        if (l.assignee) {
                                            leadAssignee = {
                                                _id: l.assignee._id,
                                                id: l.assignee._id,
                                                name: l.assignee.name,
                                                email: l.assignee.email,
                                                contact_no: l.assignee.contact_no,
                                            }
                                        }

                                        logs.push({
                                            source: l.source,
                                            type: l.type,
                                            reason: l.reason,
                                            status: l.status,
                                            customer_remark: l.customer_remark,
                                            assignee_remark: l.assignee_remark,
                                            assignee: leadAssignee,
                                            color_code: l.color_code,
                                            created_at: moment(l.created_at).tz(req.headers['tz']).format('lll'),
                                            updated_at: moment(l.updated_at).tz(req.headers['tz']).format('lll'),
                                        })
                                    })

                                var push = {
                                    user: lead.user,
                                    name: lead.name,
                                    contact_no: lead.contact_no,
                                    email: lead.email,
                                    _id: lead._id,
                                    id: lead.id,
                                    priority: 2,
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
                                    advisor: null,
                                    logs: logs,
                                    created_at: moment(lead.created_at).tz(req.headers['tz']).format('lll'),
                                    updated_at: moment(lead.updated_at).tz(req.headers['tz']).format('lll'),
                                }

                                res.status(200).json({
                                    responseCode: 200,
                                    responseMessage: "",
                                    responseData: {
                                        expired: false
                                    }
                                });

                            });
                        }
                        else {
                            var assignee = await q.all(getAssignee(car.user._id));

                            var remark = {
                                assignee: assignee,
                                status: "Open",
                                reason: req.body.reason,
                                customer_remark: loggedInDetails.name + " " + loggedInDetails.contact_no + " " + "is interested in " + car.title,
                                assignee_remark: loggedInDetails.name + " " + loggedInDetails.contact_no + " " + "is interested in " + car.title,
                                color_code: "",
                                created_at: new Date(),
                                updated_at: new Date()
                            }


                            var lead = {
                                user: loggedInDetails._id,
                                name: loggedInDetails.name,
                                contact_no: loggedInDetails.contact_no,
                                email: loggedInDetails.email,
                                type: req.body.type,
                                category: "Cars",
                                follow_up: {
                                    date: null,
                                    time: "",
                                    created_at: new Date(),
                                    updated_at: new Date(),
                                },
                                business: car.user._id,
                                assignee: assignee,
                                advisor: null,
                                source: "Online",
                                remark: remark,
                                priority: 2,
                                created_at: new Date(),
                                updated_at: new Date()
                            };

                            await Lead.create(lead).then(async function (l) {
                                var count = await Lead.find({ _id: { $lt: l._id }, business: car.user._id }).count();
                                var lead_id = count + 10000;

                                Lead.findOneAndUpdate({ _id: l._id }, { $set: { lead_id: lead_id } }, { new: true }, async function (err, doc) {
                                })

                                LeadRemark.create({
                                    lead: l._id,
                                    source: l.source,
                                    type: l.type,
                                    status: l.remark.status,
                                    reason: req.body.reason,
                                    customer_remark: loggedInDetails.name + " " + loggedInDetails.contact_no + " " + "is interested in " + car.title,
                                    assignee_remark: loggedInDetails.name + " " + loggedInDetails.contact_no + " " + "is interested in " + car.title,
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
                                        logs.push({
                                            source: l.source,
                                            type: l.type,
                                            reason: l.reason,
                                            status: l.status,
                                            customer_remark: l.customer_remark,
                                            assignee_remark: l.assignee_remark,
                                            assignee: {
                                                _id: l.assignee._id,
                                                id: l.assignee._id,
                                                name: l.assignee.name,
                                                email: l.assignee.email,
                                                contact_no: l.assignee.contact_no,
                                            },
                                            color_code: l.color_code,
                                            created_at: moment(l.created_at).tz(req.headers['tz']).format('lll'),
                                            updated_at: moment(l.updated_at).tz(req.headers['tz']).format('lll'),
                                        })
                                    });

                                var push = {
                                    user: lead.user,
                                    name: lead.name,
                                    contact_no: lead.contact_no,
                                    email: lead.email,
                                    _id: lead._id,
                                    id: lead.id,
                                    priority: 2,
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
                                    advisor: null,
                                    logs: logs,
                                    created_at: moment(lead.created_at).tz(req.headers['tz']).format('lll'),
                                    updated_at: moment(lead.updated_at).tz(req.headers['tz']).format('lll'),
                                }
                                fun.webNotification("Lead", l);
                                await whatsAppEvent.leadGenerate(l._id, l.business);
                                event.leadCre(l._id, l.business);
                                await whatsAppEvent.leadCre(l._id, l.business);
                                res.status(200).json({
                                    responseCode: 200,
                                    responseMessage: "OTP verified",
                                    responseData: {
                                        expired: false
                                    }
                                });
                            });
                        }
                    }
                    else {
                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "OTP verified",
                            responseData: {
                                expired: false
                            }
                        });
                    }
                }
            });
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "OTP not matched",
                responseData: {}
            });
        }
    }
});

router.post('/package/add', xAccessToken.token, async function (req, res, next) {
    var rules = {
        user: 'required',
        car: 'required',
        package: 'required',
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Validation Error",
            responseData: {}
        });
    }
    else {
        var user = await User.findById(req.body.user).exec();
        if (user) {
            var car = await Car.findOne({ user: req.body.user, _id: req.body.car }).exec();
            if (car) {
                var package = await Package.findOne({ _id: req.body.package }).exec();
                if (package) {
                    var check = await UserPackage.find({ package: req.body.package, user: req.body.user, car: req.body.car, expired_at: { $gt: new Date() } }).count().exec();

                    if (check <= 0) {

                        var expired_at = new Date();
                        expired_at.setDate(expired_at.getDate() + package.validity);

                        UserPackage.create({
                            user: req.body.user,
                            car: req.body.car,
                            name: package.name,
                            booking: null,
                            business: package.business,
                            description: package.description,
                            category: package.category,
                            package: package._id,
                            payment: {
                                total: package.cost,
                                paid_total: package.cost,
                            },
                            discount: package.discount,
                            validity: package.validity,
                            expired_at: expired_at,
                            created_at: new Date(),
                            updated_at: new Date()
                        });

                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Package added successfully",
                            responseData: {}
                        });
                    }
                    else {
                        res.status(400).json({
                            responseCode: 400,
                            responseMessage: "This package is already exists",
                            responseData: {}
                        });
                    }
                }
                else {
                    res.status(400).json({
                        responseCode: 400,
                        responseMessage: "Package not found",
                        responseData: {}
                    });
                }
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
                responseMessage: "User not found",
                responseData: {}
            });
        }
    }
});

router.get('/registration-data', async function (req, res) {
    var categories = [];
    await Category.find({}).cursor().eachAsync(async (category) => {

        categories.push({
            _id: category._id,
            id: category.id,
            category: category.category,
            is_company: category.is_company
        });
    });

    res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: {
            category: categories,
            automaker: await Automaker.find({}).sort({ maker: 1 }).exec(),
            country: await Country.find({}).exec()
        }
    });
});

router.get('/referrals/get', async function (req, res, next) {
    var referrals = [];
    var total = 0, used = 0;
    await Referral.find({ owner: req.query.user }).populate('user').sort({ created_at: -1 }).cursor().eachAsync(async (referral) => {
        var user = referral.user
        referrals.push({
            _id: user._id,
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            contact_no: user.contact_no,
            avatar_address: user.avatar_address,
            avatar: user.avatar,
            account_info: user.account_info,
        });
    });

    res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: referrals
    });
});

async function getAssignee(business) {
    var advisor = null;
    var role = await Management.findOne({ user: business, business: business }).exec();
    var assigneeLead = [];
    await Management.find({ business: business, role: "CRE" })
        .cursor().eachAsync(async (a) => {
            // , $or: [{ 'follow_up.date': { $lte: new Date() } }] 
            var open = await Lead.find({ business: business, assignee: a.user, 'remark.status': { $in: ['Open',] } }).count().exec();
            var follow_up = await Lead.find({ business: business, assignee: a.user, 'remark.status': { $in: ['Follow-Up'] }, 'follow_up.date': { $lte: new Date() } }).count().exec();
            var d = open + follow_up;

            assigneeLead.push({
                user: a.user,
                count: d
            });
        });

    if (assigneeLead.length != 0) {
        assigneeLead.sort(function (a, b) {
            return a.count > b.count;
        });

        advisor = assigneeLead[0].user;
    }
    else {
        advisor = role.business
    }

    return advisor;
}

function price(value) {
    var val = Math.abs(value)
    if (val >= 10000000) {
        val = (val / 10000000).toFixed(2) + 'Cr';
    }
    else if (val >= 100000) {
        val = (val / 100000).toFixed(2) + 'L';
    }

    else if (val >= 1000) {
        val = (val / 1000).toFixed(2) + 'K';
    }
    return val.toString();
}

function minMaxPrice(val1, val2) {
    if (val1 == val2) {
        var val = Math.abs(val2)
        if (val >= 10000000) {
            val = (val / 10000000).toFixed(2) + ' Cr*';
        }
        else if (val >= 100000) {
            val = (val / 100000).toFixed(2) + ' Lac*';
        }
        return val;
    }
    else {
        var v1 = Math.abs(val1);
        if (v1 >= 10000000) {
            v1 = (v1 / 10000000).toFixed(2) + ' Cr';
        }
        else if (v1 >= 100000) {
            v1 = (v1 / 100000).toFixed(2) + ' Lac*';
        }

        var v2 = Math.abs(val2);
        if (v2 >= 10000000) {
            v2 = (v2 / 10000000).toFixed(2) + ' Cr*';
        }
        else if (v2 >= 100000) {
            v2 = (v2 / 100000).toFixed(2) + ' Lac*';
        }
        var val = v1 + "-" + v2;
        return val.replace(" Lac*-", " - ");
    }
}

function slugify(string) {
    return string
        .toString()
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]+/g, "")
        .replace(/\-\-+/g, "-")
        .replace(/^-+/, "")
        .replace(/-+$/, "");
}

router.delete('/address/delete', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /address/delete Api Called from common.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    var rules = {
        user: 'required',
        address: 'required',
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR: Validation failed, user and address are required to delete address.");
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
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Validated successfully and Fatching Address Details to delete address, UserId:" + req.query.user);
        }

        var address = await Address.findOne({ _id: req.body.address, user: req.body.user }).exec();
        if (address) {
            await Address.findByIdAndRemove(address._id).exec();
            res.status(200).json({
                responseCode: 200,
                responseMessage: "Address has been deleted",
                responseData: {}
            })
            if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("INFO: Address has been deleted Successfully for the given user, UserId:" + req.query.user);
            }
        }
        else {
            if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                businessFunctions.logs("ERROR: User Not found with the given userId, UserId:" + req.query.user);
            }
            res.status(400).json({
                responseCode: 400,
                responseMessage: "User not found",
                responseData: {}
            });
        }
    }
});
router.post('/gallery/get/', async function (req, res, next) {
    var rules = {
        user: "required",
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
        var offer = await BusinessOffer.find({ publish: true, business: req.body.user }).select('-created_at -updated_at').count().exec();
        var business_offer = await BusinessOffer.find({ publish: true, business: req.body.user }).select('-created_at -updated_at').exec();


        var business_gallery = await BusinessGallery.find({ business: req.body.user }).select('-created_at -updated_at').exec();
        var count = await BusinessGallery.find({ business: req.body.user }).select('-created_at -updated_at').count().exec();


        var service_gallery = await ServiceGallery.find({ business: req.body.user }).select('-created_at -updated_at').exec();
        var count_ser = await ServiceGallery.find({ business: req.body.user }).select('-created_at -updated_at').count().exec();

        res.status(200).json({
            responseCode: 200,
            responseMessage: {
                msg: "Gallery Data",
                business_count: count,
                offer_count: offer,
                service_count: count_ser
            },
            responseData: {
                service_Gallery: service_gallery,
                business_Gallery: business_gallery,
                offer_Gallery: business_offer
            }
        });
    }
});



router.get('/send/sms', async function (req, res, next) {
    event.testSms()

    var json = ({
        responseCode: 200,
        responseMessage: "success",
        responseData: {}
    });
    res.status(200).json(json)
});
//Abhinav tyagi //Auto Logout at 11:59PM

setInterval(() => {
    var tm = new Date();
    let hr = tm.getHours();
    let mi = tm.getMinutes();
    // let sec = tm.getSeconds();
    // console.log(hr + "-" + mi);
    if (hr == 23 && mi >= 59) {
        // if (tm.getDay >= 2) {
        User.updateMany({ "account_info.type": "business" }, { $set: { device: [] } }).exec();
        // User.updateMany({ "account_info.type": "business" }, { $set: { device: [] } }).exec();



        // console.log("Login Again")
        // console.log("Working Logout")
        // event.packageRenew();

    }
}, 50000);


//Interval Function: To Update the reminder Date(Outbound Leads) on daily basis.
setInterval(async () => {
    var tm = new Date();
    let hr = tm.getHours();
    let mi = tm.getMinutes();
    // let sec = tm.getSeconds();
    if (hr == 23 && mi >= 59) {

        await OutBoundLead.find({ category: "ServiceReminder", reminderDate: { $lte: new Date() } })
            .cursor()
            .eachAsync(async (doc) => {
                // let currentYear = new Date().getFullYear();
                // var bar = new Date(currentYear, doc.reminderDate.getMonth(), doc.reminderDate.getDate());

                let newDate = new Date(doc.reminderDate)
                newDate.setDate(newDate.getDate() + 180);
                await OutBoundLead.findOneAndUpdate(
                    { _id: doc._id }, { $set: { reminderDate: new Date(newDate) }, updated_at: new Date() }
                );
            });
        await OutBoundLead.find({ category: "Insurance", insurance_rem: { $lte: new Date() } })
            .cursor()
            .eachAsync(async (doc) => {
                let remDate = new Date(doc.insurance_rem)
                remDate.setDate(remDate.getDate() + 365);
                await OutBoundLead.findOneAndUpdate(
                    { _id: doc._id }, { $set: { insurance_rem: new Date(remDate) }, updated_at: new Date() }
                );
            });
        //console.log("Process END")

    }
}, 50000);

/* Author: vinay
 Create a function to update the approval
 awaited leads into follow up leads after 2 days*/
setInterval(async () => {
    var tm = new Date();
    let hr = tm.getHours();
    let mi = tm.getMinutes();

    let sec = tm.getSeconds();
    // console.log(hr + "-" + mi);
    if (hr == 23 && mi >= 45) {
        estimateRequestFollowUp()
    }

}, 60000);


setInterval(() => {
    // console.log(' wait 50 sec = ')
    var tm = new Date();
    let hr = tm.getHours();
    let mi = tm.getMinutes();
    // let sec = tm.getSeconds();
    // console.log(hr + "-" + mi + " - " + sec);
    if (hr == 05 && mi >= 59) {
        var data = q.all(businessFunctions.lostCustomersLeadAdd());
    }
}, 50000);




async function estimateRequestFollowUp() {
    let pastDate = new Date()
    let exactDate = new Date()
    exactDate.setDate(exactDate.getDate() - 2)
    pastDate.setDate(pastDate.getDate() - 3)
    let testingDate = new Date(exactDate)
    testingDate.setDate(testingDate.getDate() + 1)

    let todayDate = new Date()
    todayDate.setDate(todayDate.getDate() + 1)

    // console.log("Two days earlier date...", pastDate, testingDate)

    let query = [{
        $match: {
            status: { $eq: "EstimateRequested" },
            date: { $gt: pastDate, $lte: testingDate }
        }
    },
    { $sort: { date: -1 } },
    {
        $lookup: {
            from: 'User',
            localField: "user",
            foreignField: "_id",
            as: "user"
        }
    },
    {
        $lookup: {
            from: "User",
            localField: "manager",
            foreignField: "_id",
            as: "assignee"
        }
    }
    ]

    bookings = []
    // vinay populate
    let leads = await Booking.aggregate(query)
        .allowDiskUse(true)
        .cursor({ batchSize: 20 })
        .exec()
        .eachAsync(async (booking) => {
            // console.log('User through id....', mongoose.Types.ObjectId(booking.car))
            let remark = {
                customer_remark: "",
                assignee_remark: "",
                resource: "",
                status: "Follow-Up",
                color_code: "#FFFF00",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }

            let follow_up = {
                date: todayDate,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }

            let assignee = {
                name: booking.assignee[0].name,
                contact_no: booking.assignee[0].contact_no,
                email: booking.assignee[0].email,
                _id: booking.assignee[0]._id
            }

            //res.json({user: booking.user})
            let lead = {
                user: booking.user[0]._id,
                assignee: assignee,
                important: true,
                business: booking.business,
                name: booking.user[0].name,
                contact_no: booking.user[0].contact_no,
                email: booking.user[0].email,
                remark: remark,
                follow_up: follow_up,
                type: "Booking Estimate Requested",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                converted: true,
                source: 'Website',
                geometry: booking.user[0].geometry,
                contacted: false,
                priority: 1,
                advisor: booking.advisor,
                psf: false,
                category: "Booking",
                remarks: booking.remarks,
                booking: booking._id
            }
            let updatedLead = {}
            let leadExist = await Lead.findOne({ contact_no: booking.user[0].contact_no }).exec()
            if (!leadExist) {
                updatedLead = await Lead.create(lead)
                //Abhinav
                event.leadCre(updatedLead._id, booking.business);
                fun.webNotification("Lead", updatedLead);
            }

            await Booking.findOneAndUpdate({ _id: booking._id }, { lead: updatedLead._id })
            bookings.push(updatedLead)
            // console.log(updatedLead)
        })
}

// subsription/business/get
router.get('/subsription/business/get', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /subsription/business/get Api Called from common.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var pack = null;
    var business_details = null;
    var user = decoded.user;
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

    var role = await Management.findOne({ user: user, business: business })
        .populate({ path: 'business', select: 'name avatar avatar_address contact_no isCarEager uuid business_info' })
        .populate({ path: 'user', select: 'name avatar avatar_address contact_no' })
        .exec();

    if (role) {
        var def = [];
        var main = [];
        var multi = false;
        var type = "";
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
    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Unauthorized",
            responseData: {}
        });
    }
});


// router.post('/request/otp/createLead', async function (req, res, next) {
//     var rules = {
//         contact_no: 'required',
//     };

//     var validation = new Validator(req.body, rules);

//     if (validation.fails()) {
//         res.status(422).json({
//             responseCode: 422,
//             responseMessage: "Error",
//             responseData: {
//                 res: validation.errors.all()
//             }
//         })
//     }
//     else {
//         var otp = Math.floor(Math.random() * 90000) + 10000;

//         var data = {
//             otp: otp
//         };

//         var type = 'user';
//         if (req.body.type) {
//             type = req.body.type;
//         }

//         var user = await User.findOne({ contact_no: req.body.contact_no, "account_info.type": type }).exec();

//         if (user) {
//             User.findOneAndUpdate({ _id: user._id }, { $set: data }, { new: true }, async function (err, doc) {
//                 if (err) {
//                     var json = ({
//                         responseCode: 400,
//                         responseMessage: "Error occured",
//                         responseData: {}
//                     });
//                     res.status(400).json(json)
//                 }

//                 var updateUser = await User.findOne({ contact_no: req.body.contact_no, "account_info.type": type }).exec();
//                 event.otpSms(updateUser);
//                 event.otpSmsMail(updateUser);

//                 var json = ({
//                     responseCode: 200,
//                     responseMessage: "OTP Sent",
//                     responseData: {}
//                 });
//                 res.status(200).json(json)
//             });
//         }
//         else {
//             var json = ({
//                 responseCode: 400,
//                 responseMessage: "User Not Found",
//                 responseData: {}
//             });

//             res.status(400).json(json)
//         }
//     }
// });

router.post('/gallery/get/new', async function (req, res, next) {
    var rules = {
        user: "required",
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
        var offer = await BusinessOffer.find({ business: req.body.user }).select('-created_at -updated_at').count().exec();
        var business_offer = await BusinessOffer.find({ business: req.body.user }).select('-created_at -updated_at').exec();

        var business_gallery = await BusinessGallery.find({ business: req.body.user }).select('-created_at -updated_at').exec();
        var count = await BusinessGallery.find({ business: req.body.user }).select('-created_at -updated_at').count().exec();

        var service_gallery = await ServiceGallery.find({ business: req.body.user }).select('-created_at -updated_at').exec();
        var count_ser = await ServiceGallery.find({ business: req.body.user }).select('-created_at -updated_at').count().exec();
        res.status(200).json({
            responseCode: 200,
            responseMessage: {
                msg: "Gallery Data",
                business_count: count,
                offer_count: offer,
                service_count: count_ser
            },
            responseData: {
                service_Gallery: service_gallery,
                business_Gallery: business_gallery,
                offer_Gallery: business_offer
            }
        });
    }
});

router.get('/business/category/get', async function (req, res, next) {
    businessFunctions.logs("INFO:/business/category/get Api Called from common.js");
    const categories = await Category.find({}).exec();
    if (categories.length > 0) {
        res.status(200).json({
            responseCode: 200,
            responseMessage: "success",
            responseData: categories
        });
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG :Categories get successfully");
        }
    } else {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("Error :Error Occured, Unable to get categories");
        }
        res.status(200).json({
            responseCode: 200,
            responseMessage: "Error Occured",
            responseData: {}
        });
    }
});
router.get('/postals/get', async function (req, res, next) {
    businessFunctions.logs("INFO:/postals/get Api Called from common.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));
    var rules = {
        zip: 'required'
    };

    var validation = new Validator(req.query, rules);

    if (validation.fails()) {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR: validation failed,zip is required");
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
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG:validated successfully and finding zip from database," + " " + "Zip:" + req.query.zip);
        }
        console.time('looper')
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var user = decoded.user;
        var data = [];

        await Location.find({ zip: req.query.zip })
            .cursor()
            .eachAsync(async function (o) {
                data.push({
                    _id: o._id,
                    id: o._id,
                    zip: o.zip,
                    city: o.city,
                    region: o.region,
                    state: o.state,
                    latitude: o.latitude,
                    longitude: o.longitude,
                    country: o.country,
                })
            });

        console.timeEnd('looper')

        res.status(200).json({
            responseCode: 200,
            responseMessage: "",
            responseData: data
        })
        if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("INFO:Zip details get successfully," + " " + "Zip:" + req.query.zip);
        }   /**/
    }
});

router.get('/country/details/get', async function (req, res, next) {
    var request = JSON.stringify(req.headers).trim()
    businessFunctions.logs("INFO:/country/details/get Api called from common.js," + " " + "Request Headers:" + JSON.stringify(req.headers))
    // businessFunctions.logs("INFO:/country/details/get Api called from common.js," + " " + "Request Headers:" + request)
    var tz = req.headers['tz'];

    if (tz) {
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG:find country details," + " " + "Timezone:" + tz);
        }
        var country = await Country.findOne({ timezone: { $in: tz } }).exec();
        if (country) {
            if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("INFO:Successfully get country details," + " " + "country:" + country.countryName);
            }
            res.status(200).json({
                responseCode: 200,
                responseMessage: "Country Details",

                responseData: country,
            })
        }
        else {
            if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                businessFunctions.logs("ERROR:Time zone error," + " " + "Timezone:" + req.headers["tz"])
            }
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Time zone error",
                responseData: {}
            })
        }
    }
    else {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR:Cannot get timezone in the headers," + " " + "Timezone:" + tz)
        }
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Time zone error",
            responseData: {}
        })
    }
});
router.post('/pay/subscription', async function (req, res, next) {
    // router.post('/pay/subscription', async function (req, res, next) {
    res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: []
    });
});


//sumit .. for estimate generation..



router.post('/estimate/generate', xAccessToken.token, async function (req, res, next) {

    var rules = {
        booking: 'required',

    };

    var validation = new Validator(req.body, rules);
    var business = req.headers['business'];

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
        var booking = await Booking.findById(req.body.booking)
            .populate({ path: 'address' })
            .populate({ path: 'advisor', select: "_id id name contact_no email" })
            .populate({ path: 'user', select: "_id id name contact_no email business_info" })
            .populate({ path: 'business', select: "_id id name contact_no email business_info address bank_details" })
            .populate({ path: 'car', select: '_id id title registration_no ic rc vin engine_no insurance_info' })
            .exec();
        if (booking) {
            if (booking.services.length !== 0) {
                // console.log("sssssss");
                let activity = req.body.activity
                console.log("Start Time = " + new Date().toISOString())
                fun.estimatePdf(booking._id, booking.address, business, activity)
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Estimate has been created",
                });
            }
            else {
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Add some services",
                    responseData: {}
                });
            }
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Booking not found",
                responseData: {}
            });
        }
    }
});


router.post('/send/estimate/pdf', xAccessToken.token, async function (req, res, next) {
    var rules = {
        booking: 'required',
    };

    var validation = new Validator(req.body, rules);

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
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var user = decoded.user;
        var business = req.headers['business'];
        var type = req.body.type;
        var booking = await Booking.findById(req.body.booking).exec();
        var loggedInDetails = await User.findById(decoded.user).exec();
        if (booking) {
            if (booking.estimate_url) {
                // console.log("Start Time = " + new Date().toISOString())
                if (type == 'email') {

                    event.sendEstimateMail(booking._id, business);

                }
                if (type == 'whatsapp') {

                    //console.log("doneeee");
                    whatsAppEvent.estiamteSendWhatsapp(booking._id, business);

                }
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Estimate has been sent",
                    responseData: {}
                });
            }
            else {
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Estimate not found ",
                    responseData: {}
                });

            }
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Booking not found",
                responseData: {}
            });
        }
    }
})

router.get('/variant/model', async function (req, res, next) {
    var data = {}
    var variant = await Variant.findById(req.query.variant).exec();
    if (variant) {
        var model = await Model.findById(variant.model).exec();
        if (model) {
            data = {
                model_value: model.value,
            }
        }
    }
    // console.log(count)



    res.status(200).json({
        responseCode: 200,
        responseMessage: "Banners",
        responseData: data
    })
});




module.exports = router
