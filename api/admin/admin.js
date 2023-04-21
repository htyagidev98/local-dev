var mongoose = require('mongoose'),
    express = require('express'),
    { ObjectId } = require('mongodb').ObjectID,
    router = express.Router(),
    config = require('./../../config'),
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
// var uniquePlan = require("custom-id")

var s3 = new aws.S3({
    accessKeyId: config.IAM_USER_KEY,
    secretAccessKey: config.IAM_USER_SECRET,
    Bucket: config.BUCKET_NAME
});

const xAccessToken = require('../../middlewares/adminToken');
const whatsAppEvent = require('../whatsapp/whatsappEvent')
var salt = bcrypt.genSaltSync(10);
const AppVersion = require('../../models/appVersion');
const User = require('../../models/user');
const BusinessTiming = require('../../models/businessTiming');
// const Type = require('../../models/type');
// const BusinessType = require('../../models/businessType');
const Category = require('../../models/category');
const Automaker = require('../../models/automaker');
const Model = require('../../models/model');
const ModelMedia = require('../../models/modelMedia');
const ModelReview = require('../../models/modelReview');
const Post = require('../../models/post');
const Follow = require('../../models/follow');
const Booking = require('../../models/booking');
const State = require('../../models/state');
const ProductCategory = require('../../models/productCategory');
const BusinessProduct = require('../../models/businessProduct');
const ProductImage = require('../../models/productImage');
const Country = require('../../models/country');
const BookmarkBusiness = require('../../models/bookmarkBusiness');
const BusinessOffer = require('../../models/businessOffer');
const BookmarkProduct = require('../../models/bookmarkProduct');
const BookmarkOffer = require('../../models/bookmarkOffer');
const BookmarkModel = require('../../models/bookmarkModel');
const Car = require('../../models/car');
const Asset = require('../../models/asset');
const Like = require('../../models/like');
const CarImage = require('../../models/carImage');
const Club = require('../../models/club');
const ClubMember = require('../../models/clubMember');
const BookmarkCar = require('../../models/bookmarkCar');
const BodyStyle = require('../../models/bodyStyle');
const FuelType = require('../../models/fuelType');
const Transmission = require('../../models/transmission');
const Color = require('../../models/color');
const Owner = require('../../models/owner');
const BusinessGallery = require('../../models/businessGallery');
const Variant = require('../../models/variant');
const ClaimBusiness = require('../../models/claimBusiness');
const Review = require('../../models/review');
const BusinessServicePackage = require('../../models/businessServicePackage');
const BrandLike = require('../../models/brandLike');
const Notification = require('../../models/notification');
const Point = require('../../models/point');
const Story = require('../../models/story');
const UpdatePhone = require('../../models/updatePhone');
const ProfileView = require('../../models/profileViews');
const Battery = require('../../models/battery');
const BatteryBrand = require('../../models/batteryBrand');
const TyreSize = require('../../models/tyreSize');
const Referral = require('../../models/referral');
const Collision = require('../../models/collision');
const Detailing = require('../../models/detailing');
const Washing = require('../../models/washing');
const BookingCategory = require('../../models/bookingCategory');
const Service = require('../../models/service');
const Lead = require('../../models/lead');
const Offer = require('../../models/offer');
const Package = require('../../models/package');
const UserPackage = require('../../models/userPackage');
const PackageUsed = require('../../models/packageUsed');
const Address = require('../../models/address');
const Management = require('../../models/management');
const CouponUsed = require('../../models/couponUsed');
const CarHistory = require('../../models/carHistory');
const Customization = require('../../models/customization');
const Gallery = require('../../models/gallery');
const ProductGallery = require('../../models/productGallery');
const ProductBrand = require('../../models/productBrand');
const ProductModel = require('../../models/productModel');
const Product = require('../../models/product');
const Tax = require('../../models/tax');
const ProductKeyword = require('../../models/productKeyword');
const QualityCheck = require('../../models/qualityCheck');
const SuitePlan = require('../../models/suitePlan');
const BusinessPlan = require('../../models/businessPlan');
const CarSell = require('../../models/carSell');
const Location = require('../../models/location');
const TransactionLog = require('../../models/transactionLog');
const fun = require('../../api/function');
const event = require('../../api/event');
const { Console, countReset } = require('console');
const BusinessSetting = require('../../models/businessSetting');
const Invoice = require('../../models/invoice');
const { referralWhatsAppEventAgent } = require('../whatsapp/whatsappEvent');
const businessFunctions = require('../../api/erpWeb/businessFunctions.js');
const InsuranceCompany = require('../../models/insuranceCompany');
var secret = config.secret;

//Abhinav: Create Super Admin Multiple users
router.post('/super-admin/user/add', xAccessToken.token, async function (req, res, next) {
    var checkPhone = await User.find({ contact_no: req.body.contact_no, "account_info.type": "admin" }).count().exec();
    // console.log("req.body.contact_no= ", req.body.contact_no)
    if (checkPhone == 0) {
        var firstPart = (Math.random() * 46656) | 0;
        var secondPart = (Math.random() * 46656) | 0;
        firstPart = ("000" + firstPart.toString(36)).slice(-3);
        secondPart = ("000" + secondPart.toString(36)).slice(-3);
        req.body.referral_code = firstPart.toUpperCase() + secondPart.toUpperCase();


        var otp = Math.floor(Math.random() * 90000) + 10000;

        req.body.username = req.body.username;

        req.body.socialite = {};
        req.body.optional_info = {};

        var address = req.body.address;
        var tz = "Asia/Calcutta"
        var country = await Country.findOne({ timezone: { $in: tz } }).exec();
        var count = await User.find({ "account_info.type": "admin", "visibility": true }).count();
        // req.body.business_id = count + 10000; //
        var rand = Math.ceil((Math.random() * 100000) + 1);

        req.body.name = _.startCase(_.toLower(req.body.name));

        var name = req.body.name;

        req.body.address = {
            country: country.countryName,
            timezone: req.headers['tz'],
            location: req.body.location,
            address: address,
            state: req.body.state,
            city: req.body.city,
            zip: req.body.zip,
            area: req.body.area,
            landmark: req.body.landmark,
        };

        req.body.bank_details = {
            ifsc: req.body.ifsc,
            account_no: req.body.account_no,
            account_holder: req.body.account_holder
        };

        req.body.account_info = {
            type: "admin",
            status: "Active",
            added_by: null,
            phone_verified: false,
            verified_account: false,
            approved_by_admin: false,
            is_password: false,
            role: req.body.role
        };

        req.body.geometry = [0, 0];
        if (req.body.longitude && req.body.latitude) {
            req.body.geometry = [req.body.longitude, req.body.latitude];
        }
        req.body.device = [];
        req.body.otp = otp;

        req.body.business_info = {
            company_name: req.body.name,
            // business_category:req.body.business_category,
            business_id: count + 10000, //
            category: req.body.category,
            company: req.body.company,
            account_no: req.body.account_no,
            gst_registration_type: req.body.gst_registration_type,
            gstin: req.body.gstin,
            is_claimed: true,
            tax_registration_no: req.body.tax_registration_no,
            pan_no: req.body.pan_no

        };
        req.body.optional_info = {
            reg_by: "Super-Admin",
        }
        // console.log("category: req.body.category,", req.body.category)
        // console.log("company_name", req.body.name)
        var started_at = null;
        if (req.body.started_at) {
            started_at = new Date(req.body.started_at).toISOString()
        }

        var expired_at = null;
        if (req.body.expired_at) {
            expired_at = new Date(req.body.expired_at).toISOString()
        }

        req.body.uuid = uuidv1();

        req.body.partner = {
            partner: req.body.carEager_partner,
            commission: req.body.partner_commision,
            package_discount: req.body.package_discount,
            started_at: started_at,
            expired_at: expired_at,
        };

        User.create(req.body).then(async function (user) {
            // var days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

            // for (var i = 0; i < 7; i++) {
            //     var timing = new BusinessTiming({
            //         business: user._id,
            //         day: days[i],
            //         open: '09:30 AM',
            //         close: '06:30 PM',
            //         is_closed: false,
            //         created_at: new Date(),
            //         updated_at: new Date(),
            //     });
            //     timing.save();
            // }

            // Type.find({}).then(function (BT){
            //     BT.forEach(function (u) {
            //         var businessType = new BusinessType({
            //             business: user._id,
            //             business_type: u._id,
            //             is_added: false,
            //         });
            //         businessType.save();
            //     });
            // });

            // Management.create({
            //     business: user._id,
            //     user: user._id,
            //     role: "Admin",
            //     created_at: new Date(),
            //     updated_at: new Date(),
            // });

            // Address.create({
            //     user: user._id,
            //     address: address,
            //     area: req.body.area,
            //     landmark: req.body.landmark,
            //     zip: req.body.zip,
            //     city: req.body.city,
            //     state: req.body.state,
            //     created_at: new Date(),
            //     updated_at: new Date()
            // });

            res.status(200).json({
                responseCode: 200,
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
//END
router.post('/login', async function (req, res, next) {
    // console.log("Username  = " + req.body.username)
    var username = await User.findOne({ username: req.body.username, 'account_info.type': "admin" }).exec();
    if (username) {
        if (!bcrypt.compareSync(req.body.password, username.password)) {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Authentication failed. Wrong password",
                responseData: {},
            });
        }
        else {
            const payload = {
                user: username._id
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

            await User.update(
                { '_id': username._id, 'device.deviceType': deviceInfo.deviceType, 'device.deviceId': deviceInfo.deviceId },
                {
                    "$pull": {
                        "device": { "deviceId": deviceInfo.deviceId }
                    }
                }
            );

            User.findOneAndUpdate({ _id: username._id }, {
                $push: {
                    "device": deviceInfo
                }
            }, { new: true }, async function (err, doc) {
                if (err) {
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "failure",
                        responseData: err
                    });
                }
                else {
                    var update = await User.findById(username._id).exec();
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
//USE
router.post('/business/registration', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    req.body['whatsAppChannelId'] = '4f1e778f-9f3b-41e0-8bf4-db6ffb15b0c2';
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var loggedInDetails = await User.findById(decoded.user).exec();

    var checkPhone = await User.find({ contact_no: req.body.contact_no, "account_info.type": "business" }).count().exec();
    // console.log("req.body.contact_no= ", req.body.contact_no)
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
        var count = await User.find({ "account_info.type": "business", "visibility": true }).count();
        // req.body.business_id = count + 10000; //
        var rand = Math.ceil((Math.random() * 100000) + 1);

        req.body.name = _.startCase(_.toLower(req.body.name));

        var name = req.body.name;

        req.body.address = {
            country: country.countryName,
            timezone: req.headers['tz'],
            location: req.body.location,
            address: address,
            state: req.body.state,
            city: req.body.city,
            zip: req.body.zip,
            area: req.body.area,
            landmark: req.body.landmark,
        };

        req.body.bank_details = {
            ifsc: req.body.ifsc,
            account_no: req.body.account_no,
            account_holder: req.body.account_holder
        };

        req.body.account_info = {
            type: "business",
            status: "Complete",
            added_by: null,
            phone_verified: false,
            verified_account: false,
            approved_by_admin: false,
            is_password: false,
        };

        req.body.geometry = [0, 0];
        if (req.body.longitude && req.body.latitude) {
            req.body.geometry = [req.body.longitude, req.body.latitude];
        }
        req.body.device = [];
        req.body.otp = otp;

        req.body.business_info = {
            company_name: req.body.name,
            // business_category:req.body.business_category,
            business_id: count + 10000, //
            category: req.body.category,
            brand: req.body.carBrand,
            company: req.body.company,
            account_no: req.body.account_no,
            gst_registration_type: req.body.gst_registration_type,
            gstin: req.body.gstin,
            is_claimed: true,
            tax_registration_no: req.body.tax_registration_no,
            pan_no: req.body.pan_no

        };
        req.body.optional_info = {
            reg_by: loggedInDetails.name,
        }
        // console.log("category: req.body.category,", req.body.category)
        // console.log("company_name", req.body.name)
        var started_at = null;
        if (req.body.started_at) {
            started_at = new Date(req.body.started_at).toISOString()
        }

        var expired_at = null;
        if (req.body.expired_at) {
            expired_at = new Date(req.body.expired_at).toISOString()
        }

        req.body.uuid = uuidv1();

        req.body.partner = {
            partner: req.body.carEager_partner,
            commission: req.body.partner_commision,
            package_discount: req.body.package_discount,
            started_at: started_at,
            expired_at: expired_at,
        };

        User.create(req.body).then(async function (user) {
            var days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

            for (var i = 0; i < 7; i++) {
                var timing = new BusinessTiming({
                    business: user._id,
                    day: days[i],
                    open: '09:30 AM',
                    close: '06:30 PM',
                    is_closed: false,
                    created_at: new Date(),
                    updated_at: new Date(),
                });
                timing.save();
            }

            // Type.find({}).then(function (BT){
            //     BT.forEach(function (u) {
            //         var businessType = new BusinessType({
            //             business: user._id,
            //             business_type: u._id,
            //             is_added: false,
            //         });
            //         businessType.save();
            //     });
            // });

            Management.create({
                business: user._id,
                user: user._id,
                role: "Admin",
                created_at: new Date(),
                updated_at: new Date(),
            });

            Address.create({
                user: user._id,
                address: address,
                area: req.body.area,
                landmark: req.body.landmark,
                zip: req.body.zip,
                city: req.body.city,
                state: req.body.state,
                created_at: new Date(),
                updated_at: new Date()
            });
            // console.log("------" + user._id);


            event.autroidReg(req.body.city, req.body.category, user._id);
            await whatsAppEvent.autroidBusinessReg(user.name, user.contact_no);

            res.status(200).json({
                responseCode: 200,
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

router.post('/agent/registration', xAccessToken.token, async function (req, res, next) {
    var checkPhone = await User.find({ contact_no: req.body.contact_no, "account_info.type": "user", "account_info.status": "Active" }).count().exec();

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


        req.body.address = {
            country: country.countryName,
            timezone: req.headers['tz'],
            location: req.body.location,
            address: address,
            state: req.body.state,
            city: req.body.city,
            zip: req.body.zip,
            area: req.body.area,
            landmark: req.body.landmark,
        };

        req.body.bank_details = {
            ifsc: req.body.ifsc,
            account_no: req.body.account_no,
            account_holder: req.body.account_holder
        };

        req.body.account_info = {
            type: "user",
            status: "Complete",
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

        req.body.business_info = {
            company_name: req.body.name,
            business_category: req.body.business_category,
            category: req.body.category,
            company: req.body.company,
            account_no: req.body.account_no,
            gst_registration_type: req.body.gst_registration_type,
            gstin: req.body.gstin,
            is_claimed: true,
            tax_registration_no: req.body.tax_registration_no,
            pan_no: req.body.pan_no
        };

        req.body.uuid = uuidv1();

        var expired_at = new Date();
        expired_at.setDate(expired_at.getDate() + 365);

        req.body.agent = {
            agent: req.body.is_agent,
            commission: req.body.agent_commission,
            started_at: new Date(),
            expired_at: expired_at,
        };

        User.create(req.body).then(async function (user) {
            event.agentSms(user, req.body.agent_commission);
            Address.create({
                user: user._id,
                address: address,
                area: req.body.area,
                landmark: req.body.landmark,
                zip: req.body.zip,
                city: req.body.city,
                state: req.body.state,
                created_at: new Date(),
                updated_at: new Date()
            });

            res.status(200).json({
                responseCode: 200,
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

router.put('/set/agent/', xAccessToken.token, async function (req, res, next) {
    var user = await User.findOne({ _id: req.body.user }).exec();
    if (user) {
        var expired_at = new Date();
        if (req.body.is_agent == true) {
            expired_at.setDate(expired_at.getDate() + 365);
        }

        var agent = {
            agent: req.body.is_agent,
            commission: req.body.agent_commission,
            started_at: new Date(),
            expired_at: expired_at,
        };

        User.findOneAndUpdate({ _id: user._id }, { $set: { agent: agent } }, { new: true }, async function (err, doc) {
            if (err) {
                res.status(422).json({
                    responseCode: 422,
                    responseMessage: "Server Error",
                    responseData: err,
                });
            }
            else {
                if (req.body.is_agent == true) {
                    event.agentSms(user, req.body.agent_commission);
                }

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Saved",
                    responseData: {},
                });
            }
        });
    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "User not found",
            responseData: {},
        });
    }
});

router.get('/agents/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var product = new Object();
    var result = [];


    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }
    var page = Math.max(0, parseInt(page));

    if (req.query.limit == undefined) {
        var limit = 50;
    } else {
        var limit = parseInt(req.query.limit);
    }

    var list = []
    req.query.query = req.query.query.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");

    if (req.query.query) {
        var query = {
            $and: [
                {
                    "agent.agent": true,
                    $or: [
                        {
                            "name": { $regex: req.query.query, $options: 'i' }
                        },
                        {
                            "contact_no": { $regex: req.query.query, $options: 'i' }
                        }
                    ]
                }
            ]
        }
    }
    else {
        var query = {
            "agent.agent": true
        }
    }

    var totalResult = await User.find(query).count();

    await User.find(query)
        .skip(limit * page).limit(limit)
        .cursor().eachAsync(async (p) => {
            result.push({
                _id: p._id,
                id: p.id,
                name: p.name,
                email: p.email,
                referral_code: p.referral_code,
                contact_no: p.contact_no,
                address: p.address,
                bank_details: p.bank_details,
                business_info: p.business_info,
                account_info: p.account_info,
                agent: p.agent,
                address: p.address
            });
        });

    res.status(200).json({
        responseCode: 200,
        responseQuery: query,
        responseInfo: {
            totalResult: totalResult
        },
        responseMessage: "success",
        responseData: result
    });
});

router.post('/referral/add', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var product = new Object();
    var result = [];

    var user = await User.findOne({ _id: req.body.user }).exec();
    if (user) {
        var check = await Referral.find({ user: req.body.user }).count().exec();
        if (check == 0) {
            var owner = await User.findOne({ referral_code: req.body.code }).exec();
            if (owner) {
                if (owner._id.equals(user._id)) {
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Unauthorized",
                        responseData: {}
                    });
                }
                else {
                    Referral.create({
                        code: owner.referral_code.toUpperCase(),
                        owner: owner._id,
                        user: user._id,
                        created_at: new Date(),
                        updated_at: new Date(),
                    }).then(async function (referral) {
                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Referral code has been added successfully",
                            responseData: {}
                        });
                    });
                }
            }
            else {
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Invalid referral code",
                    responseData: {}
                });
            }
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "User has already used a referral code.",
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
});

router.get('/suite-plans', xAccessToken.token, async function (req, res, next) {
    var plans = [];

    await SuitePlan.find({})
        .cursor().eachAsync(async (plan) => {
            plans.push({
                _id: plan._id,
                id: plan.id,
                plan: plan.plan,
                name: plan.name,
                short_name: plan.short_name,
                price: plan.price,
                default: plan.default,
                main: plan.main,
                limits: plan.limits,
                category: plan.category,
            });
        });

    res.status(200).json({
        responseCode: 200,
        responseMessage: "Suite Plans",
        responseData: _(plans).groupBy(x => x.name).map((value, key) => ({ name: key, group: value })).value()
    });
});

router.post('/business-plan/add/old', xAccessToken.token, async function (req, res, next) {
    var business = await User.findById(req.body.user).exec();
    if (business) {
        var req_plans = req.body.plans;
        var exists = await SuitePlan.find({ _id: { $in: req_plans } }).count().exec();
        if (exists == req_plans.length) {
            var plans = await BusinessPlan.find({ business: business._id, suite: { $in: req_plans } }).count().exec();
            if (plans == 0) {
                await SuitePlan.find({ _id: { $in: req_plans } })
                    .cursor().eachAsync(async (plan) => {
                        if (plan) {
                            var expired_at = new Date();
                            expired_at.setDate(expired_at.getDate() + plan.validity);
                            BusinessPlan.create({
                                suite: plan._id,
                                plan: plan.plan,
                                name: plan.name,
                                short_name: plan.short_name,
                                price: plan.price,
                                default: plan.default,
                                main: plan.main,
                                limits: plan.limits,
                                category: plan.category,
                                validity: plan.validity,
                                expired_at: expired_at,
                                created_at: new Date(),
                                updated_at: new Date(),
                                business: business._id
                            });
                        }
                    });

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Suite plans has been added.",
                    responseData: {}
                });
            }
            else {
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Some Plans already active.",
                    responseData: {}
                });
            }
        }
        else {
            res.status(422).json({
                responseCode: 422,
                responseMessage: "Please check plan before save.",
                responseData: {}
            });
        }
    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Business not found",
            responseData: {}
        });
    }
});

//USE Business
router.post('/business-plan/add', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var loggedInDetails = await User.findById(decoded.user).exec();

    var business = await User.findById(req.body.user).exec();
    var plan_no = Math.round(+new Date() / 1000) + Math.round((Math.random() * 9999) + 10)
    // plan_no = uniquePlan({
    //     name: business.name,
    //     email: business.email
    // });
    // console.log(plan_no)
    // console.log(business)
    if (business) {
        var req_plans = req.body.plans;
        // console.log("Req Plan ", req_plans)
        var exists = await SuitePlan.find({ _id: { $in: req_plans } }).count().exec();
        // console.log(exists, "   Comapre  ", req_plans.length)
        if (exists == req_plans.length) {
            var plans = await BusinessPlan.find({ business: business._id, suite: { $in: req_plans } }).count().exec();
            if (plans == 0) {
                await SuitePlan.find({ _id: { $in: req_plans } })
                    .cursor().eachAsync(async (plan) => {
                        if (plan) {
                            var expired_at = new Date();
                            var status = ""
                            if (plan.price - req.body.paid > 0) {

                                status = "Pending"
                            } else if (plan.price - req.body.paid == 0) {


                                status = "Success"

                            }
                            expired_at.setDate(expired_at.getDate() + plan.validity);
                            BusinessPlan.create({
                                suite: plan._id,
                                plan: plan.plan,
                                name: plan.name,
                                short_name: plan.short_name,
                                price: plan.price,
                                default: plan.default,
                                main: plan.main,
                                limits: plan.limits,
                                category: plan.category,
                                validity: plan.validity,
                                expired_at: expired_at,
                                "payment.paid_total": parseInt(req.body.paid),
                                "payment.due": plan.price - parseInt(req.body.paid),
                                "payment.mode": req.body.payment_mode,
                                "payment.total": plan.price,
                                "payment.price": plan.price,
                                "payment.payment_status": status,
                                "due.due": plan.price - parseInt(req.body.paid),
                                "due.pay": parseInt(req.body.paid),
                                plan_no: plan_no,
                                sold_by: loggedInDetails.name,
                                created_at: new Date(),
                                updated_at: new Date(),
                                business: business._id,

                            })


                            // .cursor().eachAsync(async (business) => {
                            TransactionLog.create({
                                user: business._id,
                                activity: "Business-Plan",
                                status: "Purchase",
                                received_by: loggedInDetails.name,
                                // source: plan._id,
                                // source: plan[0]._id,
                                source: business._id,
                                plan_no: plan_no,
                                // source: order_id,
                                business: business._id,
                                // paid_by: req.body.paid_by,
                                paid_by: "Customer",
                                // paid_total: req.body.paid,
                                paid_total: parseInt(req.body.paid),
                                total: plan.price,
                                // payment_mode: req.body.payment_mode,
                                payment_mode: req.body.payment_mode,
                                payment_status: "Success",
                                order_id: null,
                                // transaction_id: req.body.transaction_id,
                                transaction_id: req.body.transaction_id,
                                transaction_date: new Date(),
                                transaction_status: "Success",
                                transaction_response: "Success",
                                created_at: new Date(),
                                updated_at: new Date(),
                            })
                            //  .then(async function (transaction) {

                            //     // var claim = false;
                            //     // if (booking.insurance_info) {
                            //     //     if (booking.insurance_info.claim == true) {
                            //     //         claim = true
                            //     //     }
                            //     // }

                            //     // var transactions = await TransactionLog.find({ source: plan[0].suite, payment_status: { $ne: "Failure" } }).exec();
                            //     // var transactions = await TransactionLog.find({ source: plan[0]._id, payment_status: { $ne: "Failure" } }).exec();
                            //     var transactions = await TransactionLog.find({ source: req.body.business, payment_status: { $ne: "Failure" } }).exec();

                            //     // var insurance_log = _.filter(transactions, paid_by => paid_by.paid_by == "Insurance");
                            //     // var insurance_payment = parseFloat(_.sumBy(insurance_log, x => x.paid_total));

                            //     var customer_log = _.filter(transactions, paid_by => paid_by.paid_by != "Insurance");
                            //     var customer_payment = parseInt(_.sumBy(customer_log, x => x.paid_total));
                            // console.log("Paid Total+ " + customer_payment)
                            //     var paid_total = customer_payment;

                            //     var status = "";
                            //     // var due_amount = plan[0].price - paid_total;
                            //     var due_amount = plan.price - parseInt(req.body.paid);
                            //     if (due_amount == 0) {
                            //         status = "Success"
                            //     }
                            //     else {
                            //         status = "Pending";

                            //     }
                            // console.log("Due - " + due_amount + " = price =" + plan.price + " = paid =" + paid_total)
                            //     BusinessPlan.findOneAndUpdate({ _id: plan[0]._id }, {
                            //         $set: {
                            //             "payment.paid_total": plan[0].price - due_amount,
                            //             "payment.due": due_amount,
                            //             "payment.total": plan[0].price,
                            //             "payment.price": plan[0].price,
                            //             "payment.payment_status": status,
                            //             "due.due": due_amount,
                            //             updated_at: new Date()
                            //         }
                            //     },
                            //         { new: true }, async function (err, doc) {
                            //             if (err) {
                            //                 res.status(422).json({
                            //                     responseCode: 422,
                            //                     responseMessage: "Server Error",
                            //                     responseData: err
                            //                 });
                            //             }
                            //             else {
                            //                 var activity = {
                            //                     // user: loggedInDetails._id,
                            //                     // name: loggedInDetails.name,
                            //                     stage: "Payment",
                            //                     activity: "Payment Recieved " + req.body.amount,
                            //                 };

                            //                 // fun.SubscriptionLog(plan._id, activity);

                            //                 var updated = await BusinessPlan.findById(plan[0]._id).exec();
                            //                 res.status(200).json({
                            //                     responseCode: 200,
                            //                     responseMessage: "",
                            //                     responseData: updated
                            //                 });
                            //             }
                            //         });
                            // });
                            // });
                        }
                        //sumit....
                        await event.changePlanAdmin(plan.name, plan.plan, plan.price, req.body.paid, business.email, business.address.city, business.contact_no, business.name, business.business_info.category, req.body.payment_mode, "No Previouse Plan", business.optional_info.reg_by, 0);
                    });


                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Suite plans has been added.",
                    responseData: {}
                });
            }
            else {
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Some Plans already active.",
                    responseData: {}
                });
            }
        }
        else {
            res.status(422).json({
                responseCode: 422,
                responseMessage: "Please check plan before save.",
                responseData: {}
            });
        }
    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Business not found",
            responseData: {}
        });
    }
});
//Abhinav User Package Add
router.post('/partner/package/add', xAccessToken.token, async function (req, res, next) {
    var business = await User.findById(req.body.user).exec();
    if (business) {
        var expired_at = new Date();
        expired_at.setDate(expired_at.getDate() + req.body.validity);

        UserPackage.create({
            user: business._id,
            car: null,
            name: req.body.name,
            booking: null,
            business: "5bfec47ef651033d1c99fbca",
            description: req.body.description,
            category: "PartnerPackage",
            package: null,
            payment: {
                total: req.body.price,
                paid_total: 0,
            },
            discount: req.body.discount,
            validity: req.body.validity,
            expired_at: expired_at,
            created_at: new Date(),
            updated_at: new Date()
        }).then(async function (package) {
            res.status(200).json({
                responseCode: 200,
                responseMessage: "Package has been added successfully",
                responseData: {}
            });
        });

    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Business not found",
            responseData: {}
        });
    }
});

router.put('/package/edit', xAccessToken.token, async function (req, res, next) {
    var rules = {
        package: 'required',
        name: 'required',
        validity: 'required',
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
        var package = await UserPackage.findOne({ _id: req.body.package, user: req.body.user }).exec();
        if (package) {
            var expired_at = package.created_at;
            expired_at.setDate(expired_at.getDate() + req.body.validity);

            var data = {
                name: req.body.name,
                discount: req.body.discount,
                validity: req.body.validity,
                expired_at: expired_at,
                updated_at: new Date(),
            }

            UserPackage.findOneAndUpdate({ _id: req.body.package }, { $set: data }, { new: true }, async function (err, doc) {
                if (err) {
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Server Error",
                        responseData: err,
                    });
                }
                else {
                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Saved...",
                        responseData: {},
                    });
                }
            });
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


router.delete('/package/remove', xAccessToken.token, async function (req, res, next) {
    var rules = {
        package: 'required',
        user: 'required',
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
        var package = await UserPackage.findOne({ user: req.body.user, _id: req.body.package }).exec();

        if (package) {
            var expired_at = new Date();
            expired_at.setDate(expired_at.getDate() - 1);

            UserPackage.findOneAndUpdate({ _id: req.body.package }, {
                $set: {
                    validity: 0,
                    expired_at: expired_at,
                    updated_at: new Date()
                }
            }).then(async function (package) {
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Package has been removed successfully",
                    responseData: {}
                });
            });

        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Package not found",
                responseData: {}
            });
        }
    }
});

router.get('/users/get/old'/*,xAccessToken.token*/, async function (req, res, next) {
    // var token = req.headers['x-access-token'];
    // var secret = config.secret;
    // var decoded = jwt.verify(token, secret);
    // var user = decoded.user;
    var business = req.headers['business'];
    var product = new Object();
    var result = [];
    // console.log("Main ")
    // console.log("Business Id = " + business)
    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }
    var page = Math.max(0, parseInt(page));

    if (req.query.limit == undefined) {
        var limit = 50;
    } else {
        var limit = parseInt(req.query.limit);
    }

    var list = []
    let startDate = req.query.from
    let endDate = req.query.to
    // console.log(startDate, req.query.end_date)


    if (req.query.type == "business") {
        if (req.query.query) {
            // console.log("Query=  " + req.query.query)
            var query = {
                $and: [
                    {
                        "account_info.type": "business",
                        "visibility": true,
                        $or: [
                            {
                                "name": { $regex: req.query.query, $options: 'i' }
                            },
                            {
                                "contact_no": { $regex: req.query.query, $options: 'i' }
                            },
                            {
                                "business_info.gstin": { $regex: req.query.query, $options: 'i' }
                            }
                        ]
                    }
                ]
            }
            // console.log(query + " Query")
        }
        else if (req.query.location) {
            // console.log("Location  = " + req.query.location)
            var query = {
                $and: [
                    {
                        "account_info.type": "business",
                        "visibility": true,
                        $or: [
                            {
                                "address.city": new RegExp(req.query.location, "i"),
                            },
                            {
                                "address.zip": new RegExp(req.query.location, "i"),
                            },
                            // {
                            //     "address.state": new RegExp(req.query.location, "i"),
                            // },
                        ]
                    }
                ]
            }
            // console.log(query + " Query")
        } else if (req.query.active) {
            // console.log("active 1200= " + req.query.active)
            var query = {
                "account_info.type": "business",
                "visibility": true,
                "account_info.status": req.query.active
            }
        }
        //APS OR AWS
        else if (req.query.category) {
            // console.log("Category")
            result = []
            // var busi = await BusinessPlan.find({ category: req.query.category }).populate('user').sort({ created_at: -1 }).exec();
            // return res.status(200).json(busi)
            totalResult = 0
            if (req.query.category != "others") {
                // console.log("APS AWS")
                totalResult = await BusinessPlan.find({ category: req.query.category }).count().exec();
                await BusinessPlan.find({ category: req.query.category }).skip(limit * page).limit(limit).populate('business').sort({ created_at: -1 }).skip(limit * page).limit(limit).cursor().eachAsync(async (business) => {
                    // return res.status(200).json(business)
                    // totalResult = totalResult + 1
                    // console.log(" Error doucument= " + business._id)
                    result.push({
                        _id: business.business._id,
                        id: business.business._id,
                        name: business.business.name,
                        email: business.business.email,
                        referral_code: business.business.referral_code,
                        contact_no: business.business.contact_no,
                        address: business.business.address,
                        bank_details: business.business.bank_details,
                        business_info: business.business.business_info,
                        account_info: business.business.account_info,
                        agent: business.business.agent,
                        partner: business.business.partner,
                        plans_details: [business],
                        created_at: moment(business.business.created_at).tz(req.headers['tz']).format('ll'),
                        updated_at: moment(business.business.created_at).tz(req.headers['tz']).format('ll'),
                    })



                });
                return res.status(200).json({
                    responseCode: 200,
                    responseInfo: {
                        totalResult: totalResult
                    },
                    // responseQuery: query,
                    responseMessage: "success",
                    responseData: result
                });
            } else if (req.query.category == "others") {
                // console.log(" Others doucument= ")
                // var totalResult = await User.find(query).count();
                await User.find({
                    "account_info.type": "business",
                    "visibility": true
                })

                    .sort({ created_at: -1 })
                    .cursor().eachAsync(async (p) => {
                        var busi = {}
                        var busi = await BusinessPlan.find({ business: p._id }).count().exec();
                        // console.log("isPlan = " + busi)
                        if (busi == 0) {
                            totalResult = totalResult + 1
                            // console.log("Inside If isPlan = ")
                            result.push({
                                _id: p._id,
                                id: p._id,
                                name: p.name,
                                email: p.email,
                                referral_code: p.referral_code,
                                contact_no: p.contact_no,
                                address: p.address,
                                bank_details: p.bank_details,
                                business_info: p.business_info,
                                account_info: p.account_info,
                                agent: p.agent,
                                partner: p.partner,
                                plans_details: [],
                                created_at: moment(p.created_at).tz(req.headers['tz']).format('ll'),
                                updated_at: moment(p.created_at).tz(req.headers['tz']).format('ll'),
                            })
                        }

                    });
                return res.status(200).json({
                    responseCode: 200,
                    responseInfo: {
                        totalResult: totalResult
                    },
                    // responseQuery: query,
                    responseMessage: "success",
                    responseData: result
                });
            }
        }
        //
        else if (startDate && endDate) {
            // console.log(startDate + "  = Date 1207 -" + endDate)
            // filters.push({ $match: {} }
            var query = {
                "account_info.type": "business",
                "visibility": true,
                "created_at": { $gte: new Date(startDate), $lt: new Date(endDate) }
            }
        }
        else {
            // console.log("Else 1216 ")
            var query = {
                "account_info.type": "business",
                "visibility": true,
            }
        }
    }
    else {
        if (req.query.query) {
            var query = {
                $and: [
                    {
                        "account_info.type": "user",
                        $or: [
                            {
                                "name": { $regex: req.query.query, $options: 'i' }
                            },
                            {
                                "contact_no": { $regex: req.query.query, $options: 'i' }
                            },
                            {
                                "business_info.gstin": { $regex: req.query.query, $options: 'i' }
                            }
                        ]
                    }
                ]
            }
            // console.log(query + " Query")
        }
        else {
            var query = {
                "account_info.type": "user"
            }
        }
    }


    var totalResult = await User.find(query).count();
    await User.find(query)
        .skip(limit * page).limit(limit)
        .sort({ created_at: -1 })
        .cursor().eachAsync(async (p) => {
            var busi = {}
            var busi = await BusinessPlan.find({ business: p._id }).exec();

            result.push({
                _id: p._id,
                id: p._id,
                name: p.name,
                email: p.email,
                referral_code: p.referral_code,
                contact_no: p.contact_no,
                address: p.address,
                bank_details: p.bank_details,
                business_info: p.business_info,
                account_info: p.account_info,
                agent: p.agent,
                partner: p.partner,
                plans_details: busi,
                created_at: moment(p.created_at).tz(req.headers['tz']).format('ll'),
                updated_at: moment(p.created_at).tz(req.headers['tz']).format('ll'),
            })
        });
    res.status(200).json({
        responseCode: 200,
        responseInfo: {
            totalResult: totalResult
        },
        responseQuery: query,
        responseMessage: "success",
        responseData: result
    });
});

router.get('/profile/detail', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO:/profile/detail Api Called from admin.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

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

            if (user.account_info.type == "business") {


                var rating = await Review.find({ business: user._id }).exec();
                rating = _.meanBy(rating, (p) => p.rating);

                data = {
                    _id: user._id,
                    id: user.id,
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    contact_no: user.contact_no,
                    avatar: user.avatar,
                    avatar_address: user.avatar_address,
                    account_info: user.account_info,
                    bank_details: user.bank_details,
                    address: user.address,
                    coordinates: user.geometry,
                    business_info: user.business_info,
                    joined: moment(user.created_at).tz(req.headers['tz']).format('ll'),
                    total_rating: rating,
                    optional_info: user.optional_info,
                    socialite: user.socialite,
                    is_chat_active: user.device.length > 0 ? true : false,
                    timing: await BusinessTiming.find({ business: user._id }).select('-created_at -updated_at').exec(),
                    business_gallery: await BusinessGallery.find({ business: user._id }).select('-created_at -updated_at').exec(),
                    business_plan: await BusinessPlan.find({ business: user._id }).select('-created_at -updated_at').exec(),
                    package: await UserPackage.find({ user: user._id }).select('-created_at -updated_at').exec(),
                    is_bookmarked: user.is_bookmarked,
                    totalViews: await ProfileView.find({ profile: user._id }).count().exec()
                }

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "success",
                    responseData: data
                })


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
                        points: points
                    },
                    gallerySize: gallerySize - 5,
                    gallery: media,
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
                responseMessage: "No User Found",
                responseData: {}
            })
        }
    }
});
//Abhinav :Usefull
router.get('/approval/services/get', xAccessToken.token, async function (req, res, next) {
    if (req.query.page == undefined) {
        var page = 0;
    }
    else {
        var page = req.query.page;
    }
    var page = Math.max(0, parseInt(page));

    if (req.query.limit == undefined) {
        var limit = 50;
    }
    else {
        var limit = parseInt(req.query.limit);
    }

    var result = [];

    if (req.query.type == undefined) {
        var query = { admin_verified: false };
    }
    else {
        if (req.query.type == "Approved") {
            var query = { admin_verified: true };
            // var query = {publish:false};
        }
        else {
            var query = { admin_verified: false };
            // var query = {publish:false};
        }
    }

    await CarSell.find({ admin_verified: false })
        .populate({ path: 'car' })
        .populate({ path: 'seller', select: 'name username avatar avatar_address address' })
        .populate({ path: 'owner', select: 'name username avatar avatar_address address' })
        .skip(limit * page).limit(limit)
        .cursor().eachAsync(async (p) => {
            result.push({
                _id: p._id,
                id: p._id,
                car: {
                    _id: p.car._id,
                    id: p.car._id,
                    title: p.car.title,
                    _automaker: p.car._automaker,
                    _model: p.car._model,
                    registration_no: p.car.registration_no,
                },
                owner: {
                    _id: p.owner._id,
                    id: p.owner._id,
                    name: p.owner.name,
                    contact_no: p.owner.contact_no,
                    email: p.owner.email,
                },
                seller: {
                    _id: p.seller._id,
                    id: p.seller._id,
                    name: p.seller.name,
                    contact_no: p.seller.contact_no,
                    email: p.seller.email,
                },
                created_at: moment(p.created_at).tz(req.headers['tz']).format('LLL'),
                updated_at: moment(p.updated_at).tz(req.headers['tz']).format('LLL'),
            });
        });

    res.status(200).json({
        responseCode: 200,
        responseMessage: "Cars",
        responseData: result
    });
});

router.post('/car/listing/approved', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var loggedInDetails = await User.findById(decoded.user).exec();


    var listing = await CarSell.findById(req.body.sell).exec();
    if (listing) {
        var logs = listing.logs;

        logs.push({
            user: loggedInDetails._id,
            name: "Admin",
            status: "Approved",
            remark: req.body.remark,
            created_at: new Date(),
            updated_at: new Date()
        });

        CarSell.findOneAndUpdate({ _id: listing._id }, {
            $set: {
                logs: logs,
                admin_verified: true,
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
                Car.findOneAndUpdate({ _id: listing.car }, {
                    $set: {
                        publish: true,
                        admin_approved: true,
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

                        var notify = {
                            receiver: [listing.seller.toString()],
                            activity: "CarList",
                            tag: "CarListApproved",
                            source: listing.car,
                            sender: null,
                            body: req.body.remark,
                            points: 0
                        }

                        fun.newNotification(notify);

                        event.adminCarApproval(listing._id, req.body.remark, req.headers['tz'])
                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Successfully Approved",
                            responseData: {}
                        })
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
        })
    }
});

router.post('/car/listing/decline', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var loggedInDetails = await User.findById(decoded.user).exec();


    var listing = await CarSell.findById(req.body.sell).exec();
    if (listing) {
        var logs = listing.logs;

        logs.push({
            user: loggedInDetails._id,
            name: "Admin",
            status: "Decline",
            remark: req.body.remark,
            created_at: new Date(),
            updated_at: new Date()
        });

        CarSell.findOneAndUpdate({ _id: listing._id }, {
            $set: {
                logs: logs,
                admin_verified: false,
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
                Car.findOneAndUpdate({ _id: listing.car }, {
                    $set: {
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
                        var notify = {
                            receiver: [listing.seller.toString()],
                            activity: "CarList",
                            tag: "CarListRejected",
                            source: listing.car,
                            sender: null,
                            body: req.body.remark,
                            points: 0
                        }

                        fun.newNotification(notify);


                        event.adminCarReject(listing._id, req.body.remark, req.headers['tz'])
                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Declined",
                            responseData: {}
                        })
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
        })
    }
});

router.get('/cars/sell', xAccessToken.token, async function (req, res, next) {
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
                link: "",
                publish: doc.publish,
                status: doc.status,
                careager_rating: doc.careager_rating,
                video_url: doc.video_url,
                is_bookmarked: doc.is_bookmarked,
                id: doc.id,
                package: doc.package,
                thumbnails: doc.thumbnails
            });
        });

    res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: result,
    });
});

router.post('/user/info/update', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var user = await User.findById(req.body.user).exec();
    if (user) {
        var country = await Country.findOne({ timezone: { $in: req.headers['tz'] } }).exec();
        var contact = await User.findOne({ _id: { $ne: user._id }, contact_no: req.body.contact_no, "account_info.type": "user" }).exec();
        if (contact) {
            var json = ({
                responseCode: 422,
                responseMessage: "Contact no already exists",
                responseData: {}
            });
            res.status(400).json(json)

        }
        else {
            var data = {
                contact_no: req.body.contact_no,
                name: req.body.name,
                email: req.body.email,
                address: {
                    country: country.countryName,
                    timezone: req.headers['tz'],
                    location: req.body.location,
                    address: req.body.address,
                    state: req.body.state,
                    city: req.body.city,
                    zip: req.body.zip,
                    area: req.body.area,
                    landmark: req.body.landmark,
                },

                bank_details
                    : {
                    ifsc: req.body.ifsc,
                    account_no: req.body.account_no,
                    account_holder: req.body.account_holder
                },

                business_info: {
                    company_name: req.body.name,
                    account_no: req.body.account_no,
                    gst_registration_type: req.body.gst_registration_type,
                    gstin: req.body.gstin,
                    tax_registration_no: req.body.tax_registration_no,
                    pan_no: req.body.pan_no,
                    brand: req.body.carBrand,
                    category: user.business_info.category
                }
            }
            User.findOneAndUpdate({ _id: user._id }, { $set: data }, function (err, doc) {
                if (err) {
                    var json = ({
                        responseCode: 400,
                        responseMessage: "Server Error",
                        responseData: err
                    });

                    res.status(400).json(json)
                }
                else {

                    const payload = {
                        user: user._id
                    };

                    var token = jwt.sign(payload, secret);

                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "User has been updated",
                        responseData: {}
                    })
                }
            });
        }
    }
    else {
        var json = ({
            responseCode: 400,
            responseMessage: "User not found",
            responseData: req.body
        });
        res.status(400).json(json)
    }
});

router.get('/postals/get', xAccessToken.token, async function (req, res, next) {
    var rules = {
        zip: 'required'
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
        /**/
    }
});
//USE Abhinav
router.get('/business/category/get', xAccessToken.token, async function (req, res, next) {
    const categories = await Category.find({}).exec();
    res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: categories
    });
});

router.get('/users/cars/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;


    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }

    var page = Math.max(0, parseInt(page));

    var car = [];

    await Car.find({ user: req.query.user, status: true })
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
                modelName: doc._automaker + " " + doc._model,
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

router.get('/user/wallet/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var points = [];
    var total = 0, used = 0;
    var unused = await User.findOne({ _id: req.query.user }).select('careager_cash referral_code').exec();
    await Point.find({ user: req.query.user }).sort({ created_at: -1 }).cursor().eachAsync(async (point) => {
        if (point.type == "credit") {
            total = total + point.points;
        }

        if (point.type == "debit") {
            used = used + point.points;
        }

        if (point.tag == "commission") {
            var booking = await Booking.findById(point.source).populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no" } }).exec();
            if (booking) {
                var booking_no = booking.booking_no;
                if (booking.user) {
                    var name = booking.user.name
                }
                else {
                    var booking_no = "";
                    var name = "";
                }
            }
            else {
                var booking_no = "";
                var name = "";
            }
            var tag = "Commission - " + name + " - #" + booking_no;
        }

        else if (point.tag == "referNEarn") {
            var user = await User.findById(point.source).exec();
            var tag = "Refer & Earn - " + user.name;
        }
        else {
            var tag = _.startCase(point.tag)
        }

        points.push({
            _id: point._id,
            points: Math.ceil(point.points),
            type: point.type,
            tag: tag,
            status: point.status,
            activity: _.startCase(point.activity),
            user: point.user,
            month: moment(point.created_at).tz(req.headers['tz']).format('MMMM YYYY'),
            created_at: moment(point.created_at).tz(req.headers['tz']).format("Do"),
            updated_at: moment(point.updated_at).tz(req.headers['tz']).format("Do")
        });
    });

    var group = _(points).groupBy(x => x.month).map((value, key) => ({ month: key, transaction: value })).value();

    var uu = unused.careager_cash;

    res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: {
            total: Math.ceil(total),
            used: Math.ceil(used),
            unused: Math.ceil(uu),
            referral_code: unused.referral_code,
            total_refferal: await Referral.find({ owner: req.query.user }).count(),
            list: group
        }
    });
});

router.get('/user/bookings/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var user = req.headers['business'];
    var orders = [];

    var country = await Country.findOne({ timezone: { $in: req.headers['tz'] } }).exec();

    if (req.query.page == undefined) {
        var page = 0;
    }
    else {
        var page = req.query.page;
    }

    var page = Math.max(0, parseInt(page));

    var sortBy = new Object();

    if (req.query.sortBy) {
        if (req.query.sortBy == "date") {
            sortBy = { date: -1 }
        }
    }
    else {
        sortBy = { created_at: -1 }
    }

    var thumbnail = []

    await Booking.find({ 'user': req.query.user, status: { $in: ["Cancelled", "Confirmed", "Pending", "Rejected", "Closed", "Completed", "Failure", "In-Process", "Dissatisfied", "Approval", "Approved", "Failed", "JobInitiated", "JobOpen", "EstimatePrepared", "ApprovalAwaited", "StartWork", "CloseWork", "CompleteWork", "StoreApproval", "GMApproval", "Rework", "Ready"] }, is_services: true })
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

            orders.push({
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
                job_no: booking.job_no,
                payment: booking.payment,
                due: booking.due,
                address: address,
                txnid: booking.txnid,
                __v: booking.__v,
                address: address,
                created_at: booking.updated_at,
                updated_at: booking.updated_at,
                listing: "booking",
            });
        });

    res.status(200).json({
        responseCode: 200,
        responseMessage: "",
        responseData: orders
    });
});

router.post('/user/wallet/update', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var user = await User.findOne({ _id: req.body.user }).exec();

    if (req.body.type == "credit") {
        var point = {
            user: user._id,
            activity: "cash",
            tag: "credit",
            source: null,
            points: parseFloat(req.body.cash),
            status: true
        }
        fun.addPoints(point);

    }
    else {
        var point = {
            user: user._id,
            activity: "cash",
            tag: "debit",
            source: null,
            points: parseFloat(req.body.cash),
            status: true
        }
        fun.deductPoints(point);
    }


    res.status(200).json({
        responseCode: 200,
        responseMessage: _.startCase(req.body.type) + " successfully",
        responseData: {}
    })
});

router.post('/referral', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    event.referraltSms("a", "b");


    res.status(200).json({
        responseCode: 200,
        responseMessage: "",
        responseData: {}
    })
});

router.get('/referrals/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
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

router.get('/careager/packages/get', xAccessToken.token, async function (req, res, next) {
    var rules = {
        car: 'required',
    };

    var validation = new Validator(req.query, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Please select a car",
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
        var packages = [];

        var car = await Car.findOne({ _id: req.query.car }).populate('model').exec();
        if (car) {
            await Package.find({ label: "special" }).cursor().eachAsync(async (service) => {
                var serverTime = moment.tz(new Date(), req.headers['tz']);

                var bar = service.created_at;
                bar.setDate(bar.getDate() + service.validity);

                var e = bar;
                bar = moment.tz(bar, req.headers['tz'])

                var baz = bar.diff(serverTime);

                var check = await UserPackage.find({ user: car.user, package: service._id, car: req.query.car, expired_at: { $gt: new Date() } }).count().exec();

                if (check <= 0) {
                    if (baz > 0) {
                        if (service.category == "addOn") {
                            packages.push({
                                service: service.name,
                                mrp: 0,
                                discount: service.discount,
                                labour_cost: service.cost,
                                part_cost: 0,
                                of_cost: 0,
                                type: "addOn",
                                cost: service.cost,
                                id: service.id,
                                _id: service._id,
                                label: service.label,
                                doorstep: false,
                                validity: service.validity,
                                gallery: await Gallery.count({ source: service._id }).exec(),
                                doorstep: service.doorstep,
                                expired_at: moment(service.expired_at).tz(req.headers['tz']).format('ll')
                            });
                        }
                        else {
                            packages.push({
                                service: service.name,
                                mrp: 0,
                                discount: service.discount,
                                labour_cost: service.cost,
                                part_cost: 0,
                                of_cost: 0,
                                type: "package",
                                cost: service.cost,
                                id: service.id,
                                _id: service._id,
                                label: service.label,
                                doorstep: false,
                                validity: service.validity,
                                gallery: await Gallery.count({ source: service._id }).exec(),
                                doorstep: service.doorstep,
                                expired_at: moment(service.expired_at).tz(req.headers['tz']).format('ll')
                            });
                        }
                    }
                }
            });

            res.status(200).json({
                responseCode: 200,
                responseMessage: "Either you have already enjoyed the existing offers, or they are unavailable at the moment",
                responseData: packages
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

router.post('/user/package/add', xAccessToken.token, async function (req, res, next) {
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

router.get('/user/packages/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var packages = [];

    if (req.query.page == undefined) {
        var page = 0;
    }
    else {
        var page = req.query.page;
    }

    var page = Math.max(0, parseInt(page));

    var user = await User.findById(req.query.user).exec();
    if (user) {
        await UserPackage.find({ user: user, status: true })
            .populate({ path: 'car', select: '_id id title registration_no' })
            .sort({ created_at: -1 }).skip(config.perPage * page).limit(config.perPage)
            .cursor().eachAsync(async (package) => {

                var serverTime = moment.tz(new Date(), req.headers['tz']);
                var bar = package.created_at;
                bar.setDate(bar.getDate() + package.validity);

                var e = bar;
                bar = moment.tz(bar, req.headers['tz'])

                var baz = bar.diff(serverTime);

                if (baz > 0) {
                    var discounts = [];
                    package.discount.forEach(async function (discount) {
                        var remain = 0;

                        if (discount.discount != 0) {
                            if (discount.for == "specific") {
                                var label = discount.label;
                                var usedPackage = await PackageUsed.findOne({ package: package._id, user: user, label: discount.label }).count().exec();
                                remains = discount.limit - usedPackage;
                                if (remains < 0) {
                                    remains = 0
                                }
                            }
                            else {
                                var label = discount.label;
                                var usedPackage = await PackageUsed.findOne({ package: package._id, user: user, label: discount.label }).count().exec();
                                remains = discount.limit - usedPackage;
                                if (remains < 0) {
                                    remains = 0
                                }
                            }

                            discounts.push({
                                _id: discount._id,
                                for: discount.for,
                                label: label,
                                discount: discount.discount,
                                type: discount.type,
                                limit: discount.limit,
                                remains: remains
                            });
                        }
                    });


                    packages.push({
                        user: package.user,
                        category: package.category,
                        business: package.business,
                        name: package.name,
                        _id: package._id,
                        id: package._id,
                        description: package.description,
                        discount: discounts,
                        car: package.car,
                        payment: package.payment,
                        validity: package.validity,
                        created_at: moment(package.updated_at).tz(req.headers['tz']).format('lll'),
                        expired_at: moment(e).tz(req.headers['tz']).format('lll'),
                    });
                }
            });

        res.status(200).json({
            responseCode: 200,
            responseMessage: "Packages",
            responseData: packages
        });
    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "User not found",
            responseData: {},
        });
    }
});
//Abhinav Careager 
router.get('/makers/get', xAccessToken.token, async function (req, res, next) {
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
});

router.post('/user/car/add', xAccessToken.token, async function (req, res, next) {
    var rules = {
        user: 'required',
        variant: 'required',
        registration_no: 'required',
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
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var user = decoded.user;
        var business = req.headers['business'];

        var currentDate = new Date();

        var user = await User.findOne({ _id: req.body.user }).exec();
        if (user) {
            var variant = await Variant.findOne({ _id: req.body.variant }).select('-service_schedule').exec();

            if (variant != null && variant) {
                var rg = req.body.registration_no;
                req.body.registration_no = rg.replace(/ /g, '');

                var reg = await Car.find({ registration_no: req.body.registration_no, status: true }).count().exec();
                if (reg == 0) {
                    var count = await Car.find({}).count().exec();
                    req.body.geometry = [0, 0];

                    req.body.created_at = currentDate;
                    req.body.updated_at = currentDate;

                    req.body.title = variant.variant;
                    req.body.automaker = variant.automaker;
                    req.body._automaker = variant._automaker;
                    req.body.model = variant.model;
                    req.body._model = variant._model;
                    req.body.segment = variant.segment;
                    req.body.vin = req.body.vin;
                    req.body.engine_no = req.body.engine_no;
                    req.body.fuel_type = variant.specification.fuel_type;
                    req.body.transmission = variant.specification.type;
                    req.body.carId = Math.round(+new Date() / 1000) + Math.round((Math.random() * 9999) + 1),

                        Car.create(req.body).then(async function (car) {
                            User.findOneAndUpdate({ _id: req.body.user }, {
                                $push: {
                                    "cars": car._id
                                }
                            }, { new: true }, async function (err, doc) {
                                if (err) {
                                    res.status(422).json({
                                        responseCode: 422,
                                        responseMessage: "Server Error",
                                        responseData: err
                                    });
                                }
                                else {
                                    await Car.findOne({ _id: car._id })
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
                                                link: "",
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
                                        responseMessage: "Saved",
                                        responseData: {
                                            item: result
                                        }
                                    });
                                }
                            })

                        });
                }
                else {
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Registration no already exist",
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

router.put('/user/car/edit', xAccessToken.token, async function (req, res, next) {
    var rules = {
        car: "required",
        variant: "required",
        registration_no: "required",
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Car is required",
            responseData: {}
        })
    }
    else {
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);

        var user = await User.findById(req.body.user).exec();
        if (user) {
            var car = await Car.findOne({ _id: req.body.car, user: req.body.user }).populate('user').exec();
            if (car) {
                var rg = req.body.registration_no;
                req.body.registration_no = rg.replace(/ /g, '');

                var check_rn = await Car.findOne({ _id: { $ne: car._id }, registration_no: req.body.registration_no, status: true }).exec();

                if (check_rn) {
                    res.status(400).json({
                        responseCode: 400,
                        responseMessage: "Car registration no already exist",
                        responseData: {}
                    });
                }
                else {
                    var variant = await Variant.findOne({ _id: req.body.variant }).select('-service_schedule').exec();

                    if (variant) {
                        var automaker = await Automaker.findById(variant.model.automaker).exec();

                        if (variant.specification.type) {
                            req.body.transmission = variant.specification.type
                        }

                        req.body.automaker = variant.automaker;
                        req.body._automaker = variant._automaker;
                        req.body.model = variant.model;
                        req.body._model = variant._model;
                        req.body.title = variant.variant;
                        req.body.fuel_type = variant.specification.fuel_type;
                        req.body.updated_at = new Date();

                        Car.findOneAndUpdate({ _id: req.body.car, user: req.body.user }, { $set: req.body }, { new: false }, async function (err, s) {
                            if (err) {
                                res.status(400).json({
                                    responseCode: 400,
                                    responseMessage: "Error occured",
                                    responseData: err
                                });
                            }
                            else {
                                await Car.findOne({ _id: req.body.car })
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
                                            link: "",
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
                                    responseMessage: "Saved",
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

router.delete('/user/car/delete', xAccessToken.token, async function (req, res, next) {
    var rules = {
        car: "required",
        user: "required",
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

        var user = await User.findOne({ _id: req.body.user }).exec();
        if (user) {
            var car = await Car.findOne({ _id: req.body.car, user: req.body.user }).populate('user').exec();
            if (car) {
                var data = {
                    status: false,
                    updated_at: new Date()
                }

                Car.findOneAndUpdate({ _id: req.body.car, user: req.body.user }, { $set: data }, { new: false }, async function (err, s) {
                    if (err) {
                        res.status(400).json({
                            responseCode: 400,
                            responseMessage: "Error occured",
                            responseData: err
                        });
                    }
                    else {
                        var cars = [];
                        await Car.find({ user: req.body.user, status: true })
                            .cursor().eachAsync(async (car) => {
                                cars.push(mongoose.Types.ObjectId(car._id))
                            });

                        var newvalues = {
                            $set: { cars: cars }
                        }

                        User.findOneAndUpdate({ _id: req.body.user }, newvalues, { new: false }, async function (err, s) {
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
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "User Not found",
                responseData: {}
            });
        }
    }
});

router.get('/cars/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var user = decoded.user;
    var cars = [];

    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }

    await Car.find({ user: req.query.user, status: true })
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

                owner: doc.owner,
                price: doc.price,
                registration_no: doc.registration_no,
                service_history: doc.service_history,
                transmission: doc.transmission,
                vehicle_color: doc.vehicle_color,
                vehicle_status: doc.vehicle_status,
                geometry: doc.geometry,
                link: "",
                publish: doc.publish,
                status: doc.status,
                thumbnails: doc.thumbnails,
                user: doc.user,
                on_booking: on_booking > 0 ? true : false,
                created_at: moment(doc.created_at).tz(req.headers['tz']).format('ll'),
                updated_at: moment(doc.updated_at).tz(req.headers['tz']).format('ll'),
            });
        });

    var json = ({
        responseCode: 200,
        responseInfo: {
            totalResult: await Car.find({ user: req.query.user, status: true }).count(),
        },
        responseMessage: "success",
        responseData: cars
    });
    res.status(200).json(json)
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

router.get('/car/details/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);


    var doc = await Car.findById(req.query.id)
        .populate('thumbnails')
        .populate({ path: 'user', select: 'name username avatar avatar_address account_info address' })
        .exec();
    if (doc) {
        var car = {
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
            odometer: doc.odometer,
            carId: doc.carId,
            fuel_type: doc.fuel_type,
            insurance_info: doc.insurance_info,
            location: doc.location,
            manufacture_year: doc.manufacture_year,
            owner: doc.owner,
            price: doc.price,
            registration_no: doc.registration_no,
            transmission: doc.transmission,
            vehicle_color: doc.vehicle_color,
            vehicle_status: doc.vehicle_status,
            geometry: doc.geometry,
            publish: doc.publish,
            status: doc.status,
            thumbnails: doc.thumbnails,
            user: doc.user,
            created_at: moment(doc.created_at).tz(req.headers['tz']).format('ll'),
            updated_at: moment(doc.updated_at).tz(req.headers['tz']).format('ll'),
        }

        var json = ({
            responseCode: 200,
            responseMessage: "success",
            responseData: car
        });
        res.status(200).json(json)
    }
    else {
        var json = ({
            responseCode: 400,
            responseMessage: "Car not found",
            responseData: {}
        });
        res.status(400).json(json)
    }
});

router.get('/explore/cars', xAccessToken.token, async function (req, res, next) {
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
                link: "",
                publish: doc.publish,
                status: doc.status,
                careager_rating: doc.careager_rating,
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

//Abhinav:- Code Price List Update :Upload Option

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
                    var new_services = 0;
                    var updated_services = 0;
                    var business = req.body.business

                    for (var i = 0; i < services.length; i++) {
                        var automaker = null;
                        var _automaker = "";
                        var model = null;
                        var _model = "";

                        if (services[i]._model) {
                            var model = await Model.findOne({ value: services[i]._model }).exec();
                            if (model) {
                                var automaker = await Automaker.findById(model.automaker).exec();

                                model = model._id;
                                _model = model.value;
                                automaker = automaker._id;
                                _automaker = automaker.maker;

                            }
                        }


                        var tax_info = {}
                        var tax_info = await Tax.findOne({ rate: parseFloat(services[i].tax_rate), type: "GST" }).exec();
                        var tax_rate = tax_info.detail;

                        var parts = [];
                        var labours = [];
                        var opening_fitting = [];

                        if (parseFloat(services[i].part_cost) > 0) {
                            parts_visible = false;
                            var service = services[i].service;
                            var amount = Math.ceil(services[i].part_cost);
                            var base = amount;
                            var part_tax = [];

                            var x = (100 + tax_info.rate) / 100;
                            var tax_on_amount = amount / x;
                            if (tax_rate.length > 0) {
                                for (var r = 0; r < tax_rate.length; r++) {
                                    if (tax_rate[r].rate != tax_info.rate) {
                                        var t = tax_on_amount * (tax_rate[r].rate / 100);
                                        base = base - t;
                                        part_tax.push({
                                            tax: tax_rate[r].tax,
                                            rate: tax_rate[r].rate,
                                            amount: parseFloat(t.toFixed(2))
                                        });
                                    }
                                    else {
                                        base = base - t
                                        part_tax.push({
                                            tax: tax_info.tax, tax_rate: tax_info.rate,
                                            rate: tax_info.rate,
                                            amount: parseFloat(tax_on_amount.toFixed(2))
                                        });
                                    }
                                }
                            }

                            tax_detail = {
                                tax: tax_info.tax,
                                tax_rate: tax_info.rate,
                                rate: tax_info.rate,
                                base: parseFloat(base.toFixed(2)),
                                detail: part_tax
                            }

                            parts.push({
                                source: null,
                                item: services[i].service + " Material",
                                hsn_sac: services[i].part_hsn_sac,
                                part_no: "",
                                quantity: 1,
                                issued: false,
                                rate: parseFloat(services[i].part_cost),
                                base: parseFloat(base.toFixed(2)),
                                amount: parseFloat(amount),
                                tax_amount: _.sumBy(part_tax, x => x.amount),
                                amount_is_tax: "inclusive",
                                customer_dep: 100,
                                insurance_dep: 0,
                                discount: 0,
                                tax: tax_info.tax,
                                tax_rate: tax_info.rate,
                                tax_info: tax_detail
                            })
                        }

                        if (parseFloat(services[i].labour_cost) > 0) {
                            var amount = parseFloat(services[i].labour_cost);
                            var base = amount;
                            var labour_tax = [];

                            var x = (100 + tax_info.rate) / 100;
                            var tax_on_amount = amount / x;

                            if (tax_rate.length > 0) {
                                for (var r = 0; r < tax_rate.length; r++) {
                                    if (tax_rate[r].rate != tax_info.rate) {
                                        var t = tax_on_amount * (tax_rate[r].rate / 100);
                                        base = base - t
                                        labour_tax.push({
                                            tax: tax_rate[r].tax,
                                            rate: parseFloat(tax_rate[r].rate.toFixed(2)),
                                            amount: parseFloat(t.toFixed(2))
                                        });
                                    }
                                    else {
                                        base = base - t
                                        labour_tax.push({
                                            tax: tax_info.tax,
                                            rate: parseFloat(tax_info.rate.toFixed(2)),
                                            amount: parseFloat(tax_on_amount.toFixed(2))
                                        });
                                    }
                                }
                            }

                            labours.push({
                                item: services[i].service,
                                quantity: 1,
                                hsn_sac: services[i].hsn_sac,
                                rate: parseFloat(services[i].labour_cost),
                                base: parseFloat(base.toFixed(2)),
                                amount: parseFloat(amount),
                                discount: 0,
                                amount_is_tax: "inclusive",
                                customer_dep: 100,
                                insurance_dep: 0,
                                tax_amount: _.sumBy(labour_tax, x => x.amount),
                                tax: tax_info.tax,
                                tax_rate: tax_info.rate,
                                tax_info: {
                                    tax: tax_info.tax,
                                    tax_rate: tax_info.rate,
                                    rate: tax_info.rate,
                                    base: parseFloat(base.toFixed(2)),
                                    detail: labour_tax
                                }
                            })
                        }

                        var g = []
                        if (services[i].video_links != "") {
                            var video_links = services[i].video_links.split(',');
                            video_links.forEach(async function (l) {
                                g.push({
                                    file: l,
                                    type: "link",
                                    created_at: new Date(),
                                    updated_at: new Date(),
                                });
                            });
                        }
                        // if (services[i].images_link != "") {
                        //     var images_link = services[i].images_link.split(',');

                        //     images_link.forEach(async function (l) {
                        //         g.push({

                        //             file: l,
                        //             file_type: "image",
                        //             type: "link",
                        //             created_at: new Date(),
                        //             updated_at: new Date(),
                        //         });
                        //     });
                        // }

                        var margin_total = parseFloat(services[i].labour_cost) * (40 / 100);
                        var mrp = parseFloat(services[i].labour_cost) + margin_total;

                        var ser = await Collision.find({
                            package: services[i].package, segment: services[i].segment, publish: true, service: services[i].service, business: business
                        }).exec();

                        // return res.send(ser.type);\
                        console.log("Matched  -= " + ser.length + " Service = " + services[i].service)
                        // services[i].service
                        if (ser.length) {
                            updated_services += 1
                            // console.log(ser.length)
                            await Collision.findOneAndUpdate({
                                package: services[i].package, segment: services[i].segment, publish: true, service: services[i].service, business: business
                            }, {
                                $set: {
                                    // business: business,
                                    // imported: true,
                                    model: model,
                                    _model: _model,
                                    automaker: automaker,
                                    _automaker: _automaker,
                                    package: services[i].package,
                                    segment: services[i].segment,
                                    service: services[i].service,
                                    description: services[i].description,
                                    parts: parts,
                                    part_cost: parseFloat(services[i].part_cost),
                                    opening_fitting: [],
                                    of_cost: 0,
                                    labour: labours,
                                    labour_cost: parseFloat(services[i].labour_cost),
                                    cost: parseFloat(services[i].part_cost) + parseFloat(services[i].labour_cost),
                                    mrp: parseFloat(services[i].part_cost) + Math.ceil(mrp),
                                    editable: true,
                                    labour_cost_editable: false,
                                    part_cost_editable: false,
                                    of_cost_editable: true,
                                    amount_is_tax: "inclusive",
                                    profile: services[i].images_link,
                                    created_at: new Date(),
                                    updated_at: new Date(),
                                    gallery: g,
                                    tax: "18.0% GST",
                                    rate: 18,
                                    tax_info: {
                                        tax: tax_info.tax, tax_rate: tax_info.rate,
                                        rate: tax_info.rate,
                                        base: parseFloat(base.toFixed(2)),
                                        detail: labour_tax
                                    },
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
                            new_services += 1
                            console.log("New  Collision Service" + services[i].service)
                            Collision.create({
                                business: business,
                                imported: true,
                                model: model,
                                _model: _model,
                                automaker: automaker,
                                _automaker: _automaker,
                                package: services[i].package,
                                segment: services[i].segment,
                                service: services[i].service,
                                description: services[i].description,
                                parts: parts,
                                part_cost: parseFloat(services[i].part_cost),
                                opening_fitting: [],
                                of_cost: 0,
                                profile: services[i].images_link,
                                labour: labours,
                                labour_cost: parseFloat(services[i].labour_cost),
                                cost: parseFloat(services[i].part_cost) + parseFloat(services[i].labour_cost),
                                mrp: parseFloat(services[i].part_cost) + Math.ceil(mrp),
                                editable: true,
                                labour_cost_editable: false,
                                part_cost_editable: false,
                                of_cost_editable: true,
                                amount_is_tax: "inclusive",
                                created_at: new Date(),
                                updated_at: new Date(),
                                gallery: g,
                                publish: true,
                                tax: "18.0% GST",
                                rate: 18,
                                tax_info: {
                                    tax: tax_info.tax, tax_rate: tax_info.rate,
                                    rate: tax_info.rate,
                                    base: parseFloat(base.toFixed(2)),
                                    detail: labour_tax
                                },

                            });
                            // console.log("Created ", i)
                            // res.status(200).json({
                            //     responseCode: 200,
                            //     responseMessage: "Successfully Import",
                            //     responseData: {}
                            // });

                        }

                    }

                    // console.log("new_services  = " + new_services)
                    // console.log("Update Service  = " + updated_services)
                    // console.log("Total Service  = " + services.length)

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

router.post('/detailing/services/import', async function (req, res, next) {
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
                    /*Detailing.remove({
                        business: business,
                        imported: true,
                    });*/


                    // console.log("Business = " + req.body.business)
                    var business = req.body.business
                    for (var i = 0; i < services.length; i++) {
                        var automaker = null;
                        var _automaker = "";
                        var model = null;
                        var _model = "";

                        if (services[i]._model) {
                            var model = await Model.findOne({ value: services[i]._model }).exec();
                            if (model) {
                                var automaker = await Automaker.findById(model.automaker).exec();

                                model = model._id;
                                _model = model.value;
                                automaker = automaker._id;
                                _automaker = automaker.maker;

                            }
                        }


                        var tax_info = {}
                        var tax_info = await Tax.findOne({ rate: parseFloat(services[i].tax_rate), type: "GST" }).exec();
                        var tax_rate = tax_info.detail;

                        var parts = [];
                        var labours = [];
                        var opening_fitting = [];

                        if (parseFloat(services[i].part_cost) > 0) {
                            parts_visible = false;
                            var service = services[i].service;
                            var amount = Math.ceil(services[i].part_cost);
                            var base = amount;
                            var part_tax = [];

                            var x = (100 + tax_info.rate) / 100;
                            var tax_on_amount = amount / x;
                            if (tax_rate.length > 0) {
                                for (var r = 0; r < tax_rate.length; r++) {
                                    if (tax_rate[r].rate != tax_info.rate) {
                                        var t = tax_on_amount * (tax_rate[r].rate / 100);
                                        base = base - t;
                                        part_tax.push({
                                            tax: tax_rate[r].tax,
                                            rate: tax_rate[r].rate,
                                            amount: parseFloat(t.toFixed(2))
                                        });
                                    }
                                    else {
                                        base = base - t
                                        part_tax.push({
                                            tax: tax_info.tax, tax_rate: tax_info.rate,
                                            rate: tax_info.rate,
                                            amount: parseFloat(tax_on_amount.toFixed(2))
                                        });
                                    }
                                }
                            }

                            tax_detail = {
                                tax: tax_info.tax,
                                tax_rate: tax_info.rate,
                                rate: tax_info.rate,
                                base: parseFloat(base.toFixed(2)),
                                detail: part_tax
                            }

                            parts.push({
                                source: null,
                                item: services[i].service + " Material",
                                hsn_sac: services[i].part_hsn_sac,
                                part_no: "",
                                quantity: 1,
                                issued: false,
                                rate: parseFloat(services[i].part_cost),
                                base: parseFloat(base.toFixed(2)),
                                amount: parseFloat(amount),
                                tax_amount: _.sumBy(part_tax, x => x.amount),
                                amount_is_tax: "inclusive",
                                customer_dep: 100,
                                insurance_dep: 0,
                                discount: 0,
                                tax: tax_info.tax,
                                tax_rate: tax_info.rate,
                                tax_info: tax_detail
                            })
                        }

                        if (parseFloat(services[i].labour_cost) > 0) {
                            var amount = parseFloat(services[i].labour_cost);
                            var base = amount;
                            var labour_tax = [];

                            var x = (100 + tax_info.rate) / 100;
                            var tax_on_amount = amount / x;

                            if (tax_rate.length > 0) {
                                for (var r = 0; r < tax_rate.length; r++) {
                                    if (tax_rate[r].rate != tax_info.rate) {
                                        var t = tax_on_amount * (tax_rate[r].rate / 100);
                                        base = base - t
                                        labour_tax.push({
                                            tax: tax_rate[r].tax,
                                            rate: parseFloat(tax_rate[r].rate.toFixed(2)),
                                            amount: parseFloat(t.toFixed(2))
                                        });
                                    }
                                    else {
                                        base = base - t
                                        labour_tax.push({
                                            tax: tax_info.tax,
                                            rate: parseFloat(tax_info.rate.toFixed(2)),
                                            amount: parseFloat(tax_on_amount.toFixed(2))
                                        });
                                    }
                                }
                            }

                            labours.push({
                                item: services[i].service,
                                quantity: 1,
                                hsn_sac: services[i].hsn_sac,
                                rate: parseFloat(services[i].labour_cost),
                                base: parseFloat(base.toFixed(2)),
                                amount: parseFloat(amount),
                                discount: 0,
                                amount_is_tax: "inclusive",
                                customer_dep: 100,
                                insurance_dep: 0,
                                tax_amount: _.sumBy(labour_tax, x => x.amount),
                                tax: tax_info.tax,
                                tax_rate: tax_info.rate,
                                tax_info: {
                                    tax: tax_info.tax,
                                    tax_rate: tax_info.rate,
                                    rate: tax_info.rate,
                                    base: parseFloat(base.toFixed(2)),
                                    detail: labour_tax
                                }
                            })
                        }

                        var g = []
                        if (services[i].video_links != "") {
                            var video_links = services[i].video_links.split(',');

                            video_links.forEach(async function (l) {
                                g.push({
                                    file: l,
                                    type: "link",
                                    created_at: new Date(),
                                    updated_at: new Date(),
                                });
                            });
                        }
                        if (services[i].images_link != "") {
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

                        var margin_total = parseFloat(services[i].labour_cost) * (40 / 100);
                        var mrp = parseFloat(services[i].labour_cost) + margin_total;

                        var ser = await Detailing.find({
                            package: services[i].package, segment: services[i].segment, publish: true, service: services[i].service, business: business
                        }).exec();

                        // return res.send(ser.type);
                        if (ser.length) {
                            // console.log(ser.length)
                            await Detailing.findOneAndUpdate({
                                package: services[i].package, segment: services[i].segment, publish: true, service: services[i].service, business: business
                            }, {
                                $set: {
                                    // business: business,
                                    // imported: true,
                                    model: model,
                                    _model: _model,
                                    automaker: automaker,
                                    _automaker: _automaker,
                                    package: services[i].package,
                                    segment: services[i].segment,
                                    service: services[i].service,
                                    description: services[i].description,
                                    parts: parts,
                                    part_cost: parseFloat(services[i].part_cost),
                                    opening_fitting: [],
                                    of_cost: 0,
                                    labour: labours,
                                    labour_cost: parseFloat(services[i].labour_cost),
                                    cost: parseFloat(services[i].part_cost) + parseFloat(services[i].labour_cost),
                                    mrp: parseFloat(services[i].part_cost) + Math.ceil(mrp),
                                    editable: true,
                                    labour_cost_editable: false,
                                    part_cost_editable: false,
                                    of_cost_editable: true,
                                    amount_is_tax: "inclusive",
                                    profile: services[i].images_link,
                                    created_at: new Date(),
                                    updated_at: new Date(),
                                    gallery: g,
                                    tax: "18.0% GST",
                                    rate: 18,
                                    tax_info: {
                                        tax: tax_info.tax, tax_rate: tax_info.rate,
                                        rate: tax_info.rate,
                                        base: parseFloat(base.toFixed(2)),
                                        detail: labour_tax
                                    },



                                }
                            }, { new: true }, async function (err, doc) {
                                // console.log("Update Detailing" + i)
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
                            // console.log("New  Deatiling Service")
                            Detailing.create({
                                business: business,
                                imported: true,
                                model: model,
                                _model: _model,
                                automaker: automaker,
                                _automaker: _automaker,
                                package: services[i].package,
                                segment: services[i].segment,
                                service: services[i].service,
                                description: services[i].description,
                                parts: parts,
                                part_cost: parseFloat(services[i].part_cost),
                                opening_fitting: [],
                                of_cost: 0,
                                labour: labours,
                                labour_cost: parseFloat(services[i].labour_cost),
                                cost: parseFloat(services[i].part_cost) + parseFloat(services[i].labour_cost),
                                mrp: parseFloat(services[i].part_cost) + Math.ceil(mrp),
                                editable: true,
                                labour_cost_editable: false,
                                part_cost_editable: false,
                                of_cost_editable: true,
                                amount_is_tax: "inclusive",
                                profile: services[i].images_link,
                                created_at: new Date(),
                                updated_at: new Date(),
                                gallery: g,
                                tax: "18.0% GST",
                                rate: 18,
                                tax_info: {
                                    tax: tax_info.tax, tax_rate: tax_info.rate,
                                    rate: tax_info.rate,
                                    base: parseFloat(base.toFixed(2)),
                                    detail: labour_tax
                                },

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

router.post('/servicing/services/import/old', async function (req, res, next) {
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
                    /*Service.remove({
                        business: business,
                        imported: true,
                    });*/
                    var business = req.body.business

                    for (var i = 0; i < services.length; i++) {

                        var automaker = null;
                        var _automaker = "";
                        var model = null;
                        var _model = "";
                        var m = true;
                        var segment1 = services[i].segment;

                        if (services[i]._model) {
                            var model = await Model.findOne({ value: services[i]._model }).exec();

                            if (model) {
                                var automaker = await Automaker.findById(model.automaker).exec();
                                // console.log("_model = " + services[i]._model + "   Maker$$  =  " + automaker.maker + " -@ Segment @-  " + model.segment)
                                segment1 = model.segment;
                                model = model._id;
                                _model = model.value;
                                automaker = automaker._id;
                                _automaker = automaker.maker;
                                // console.log("_model = " + services[i]._model + "   Maker$$  =  " + model.segment + "  -  " + automaker.maker + " -@ Segment @-  " + segment)
                            }
                            else {
                                segment1 = services[i].segment;
                            }
                        }
                        // console.log("Segment  " + segment1)

                        var tax_info = {}
                        var tax_info = await Tax.findOne({ rate: parseFloat(18.0), type: "GST" }).exec();
                        var tax_rate = tax_info.detail;

                        var parts = [];
                        var labours = [];
                        var opening_fitting = [];

                        if (parseFloat(services[i].part_cost) > 0) {
                            parts_visible = false;
                            var service = services[i].service;
                            var amount = Math.ceil(services[i].part_cost);
                            var base = amount;
                            var part_tax = [];

                            var x = (100 + tax_info.rate) / 100;
                            var tax_on_amount = amount / x;
                            if (tax_rate.length > 0) {
                                for (var r = 0; r < tax_rate.length; r++) {
                                    if (tax_rate[r].rate != tax_info.rate) {
                                        var t = tax_on_amount * (tax_rate[r].rate / 100);
                                        base = base - t;
                                        part_tax.push({
                                            tax: tax_rate[r].tax,
                                            rate: tax_rate[r].rate,
                                            amount: parseFloat(t.toFixed(2))
                                        });
                                    }
                                    else {
                                        base = base - t
                                        part_tax.push({
                                            tax: tax_info.tax, tax_rate: tax_info.rate,
                                            rate: tax_info.rate,
                                            amount: parseFloat(tax_on_amount.toFixed(2))
                                        });
                                    }
                                }
                            }

                            tax_detail = {
                                tax: tax_info.tax,
                                tax_rate: tax_info.rate,
                                rate: tax_info.rate,
                                base: parseFloat(base.toFixed(2)),
                                detail: part_tax
                            }

                            parts.push({
                                source: null,
                                item: services[i].service,
                                hsn_sac: services[i].hsn_sac,
                                part_no: "",
                                quantity: 1,
                                issued: false,
                                rate: parseFloat(services[i].part_cost),
                                base: parseFloat(base.toFixed(2)),
                                amount: parseFloat(amount),
                                tax_amount: _.sumBy(part_tax, x => x.amount),
                                amount_is_tax: "inclusive",
                                customer_dep: 100,
                                insurance_dep: 0,
                                discount: 0,
                                tax: tax_info.tax,
                                tax_rate: tax_info.rate,
                                tax_info: tax_detail
                            })
                        }

                        if (parseFloat(services[i].labour_cost) > 0) {
                            var amount = parseFloat(services[i].labour_cost);
                            var base = amount;
                            var labour_tax = [];

                            var x = (100 + tax_info.rate) / 100;
                            var tax_on_amount = amount / x;

                            if (tax_rate.length > 0) {
                                for (var r = 0; r < tax_rate.length; r++) {
                                    if (tax_rate[r].rate != tax_info.rate) {
                                        var t = tax_on_amount * (tax_rate[r].rate / 100);
                                        base = base - t
                                        labour_tax.push({
                                            tax: tax_rate[r].tax,
                                            rate: parseFloat(tax_rate[r].rate.toFixed(2)),
                                            amount: parseFloat(t.toFixed(2))
                                        });
                                    }
                                    else {
                                        base = base - t
                                        labour_tax.push({
                                            tax: tax_info.tax,
                                            rate: parseFloat(tax_info.rate.toFixed(2)),
                                            amount: parseFloat(tax_on_amount.toFixed(2))
                                        });
                                    }
                                }
                            }

                            labours.push({
                                item: services[i].service,
                                quantity: 1,
                                hsn_sac: services[i].hsn_sac,
                                rate: parseFloat(services[i].labour_cost),
                                base: parseFloat(base.toFixed(2)),
                                amount: parseFloat(amount),
                                discount: 0,
                                amount_is_tax: "inclusive",
                                customer_dep: 100,
                                insurance_dep: 0,
                                tax_amount: _.sumBy(labour_tax, x => x.amount),
                                tax: tax_info.tax,
                                tax_rate: tax_info.rate,
                                tax_info: {
                                    tax: tax_info.tax,
                                    tax_rate: tax_info.rate,
                                    rate: tax_info.rate,
                                    base: parseFloat(base.toFixed(2)),
                                    detail: labour_tax
                                }
                            })
                        }

                        var g = []
                        if (services[i].video_links != "") {
                            var video_links = services[i].video_links.split(',');

                            video_links.forEach(async function (l) {
                                g.push({
                                    file: l,
                                    type: "link",
                                    file_type: "video",
                                    created_at: new Date(),
                                    updated_at: new Date(),
                                });
                            });
                        }
                        if (services[i].images_link != "") {
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

                        var margin_total = parseFloat(services[i].labour_cost) * (40 / 100);
                        var mrp = parseFloat(services[i].labour_cost) + margin_total;

                        //Abhinav :Update


                        var ser = await Service.find({
                            package: services[i].package, model: { $ne: null }, segment: segment1, service: services[i].service, business: business
                        }).exec();

                        // return res.send(ser.type);
                        // console.log(ser.length)
                        if (ser.length) {
                            // console.log(ser.length)
                            await Service.findOneAndUpdate({
                                package: services[i].package, model: { $ne: null }, segment: segment1, service: services[i].service, business: business
                            }, {
                                $set: {
                                    // business: business,
                                    // imported: true,
                                    model: model,
                                    _model: _model,
                                    automaker: automaker,
                                    _automaker: _automaker,
                                    package: services[i].package,
                                    // segment: services[i].segment,
                                    segment: segment1,
                                    service: services[i].service,
                                    description: services[i].description,
                                    parts: parts,
                                    part_cost: parseFloat(services[i].part_cost),
                                    opening_fitting: [],
                                    of_cost: 0,
                                    labour: labours,
                                    labour_cost: parseFloat(services[i].labour_cost),
                                    cost: parseFloat(services[i].part_cost) + parseFloat(services[i].labour_cost),
                                    mrp: parseFloat(services[i].part_cost) + Math.ceil(mrp),
                                    editable: true,
                                    labour_cost_editable: false,
                                    part_cost_editable: false,
                                    of_cost_editable: true,
                                    amount_is_tax: "inclusive",
                                    profile: services[i].images_link,
                                    created_at: new Date(),
                                    updated_at: new Date(),
                                    gallery: g,
                                    tax: "18.0% GST",
                                    rate: 18,
                                    tax_info: {
                                        tax: tax_info.tax, tax_rate: tax_info.rate,
                                        rate: tax_info.rate,
                                        base: parseFloat(base.toFixed(2)),
                                        detail: labour_tax
                                    },



                                }
                            }, { new: true }, async function (err, doc) {
                                // console.log("Update " + i + "  _model = " + services[i]._model)
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

                            // console.log("New Service  = " + i + "  _model = " + services[i]._model + "   =  " + automaker + "   ")
                            Service.create({
                                business: business,
                                imported: true,
                                model: model,
                                _model: _model,
                                automaker: automaker,
                                _automaker: _automaker,
                                package: services[i].package,
                                // segment: services[i].segment,
                                segment: segment1,
                                service: services[i].service,
                                description: services[i].description,
                                parts: parts,
                                part_cost: parseFloat(services[i].part_cost),
                                opening_fitting: [],
                                of_cost: 0,
                                labour: labours,
                                labour_cost: parseFloat(services[i].labour_cost),
                                cost: parseFloat(services[i].part_cost) + parseFloat(services[i].labour_cost),
                                mrp: parseFloat(services[i].part_cost) + Math.ceil(mrp),
                                editable: true,
                                labour_cost_editable: false,
                                part_cost_editable: false,
                                of_cost_editable: true,
                                amount_is_tax: "inclusive",
                                profile: services[i].images_link,
                                created_at: new Date(),
                                updated_at: new Date(),
                                gallery: g,
                                tax: "18.0% GST",
                                rate: 18,
                                tax_info: {
                                    tax: tax_info.tax, tax_rate: tax_info.rate,
                                    rate: tax_info.rate,
                                    base: parseFloat(base.toFixed(2)),
                                    detail: labour_tax
                                },

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

router.post('/customization/services/import', async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    // var business = "5bfec47ef651033d1c99fbca";
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
                    /*Customization.remove({
                        business: business,
                        imported: true,
                    });*/
                    var business = req.body.business
                    for (var i = 0; i < services.length; i++) {
                        var automaker = null;
                        var _automaker = "";
                        var model = null;
                        var _model = "";

                        if (services[i]._model) {
                            var model = await Model.findOne({ value: services[i]._model }).exec();
                            if (model) {
                                var automaker = await Automaker.findById(model.automaker).exec();
                                model = model._id;
                                _model = model.value;
                                automaker = automaker._id;
                                _automaker = automaker.maker;
                            }
                        }

                        var tax_info = {}
                        var tax_info = await Tax.findOne({ rate: parseFloat(services[i].tax_rate), type: "GST" }).exec();
                        var tax_rate = tax_info.detail;

                        var parts = [];
                        var labours = [];
                        var opening_fitting = [];

                        if (parseFloat(services[i].part_cost) > 0) {
                            parts_visible = false;
                            var service = services[i].service;
                            var amount = Math.ceil(services[i].part_cost);
                            var base = amount;
                            var part_tax = [];

                            var x = (100 + tax_info.rate) / 100;
                            var tax_on_amount = amount / x;
                            if (tax_rate.length > 0) {
                                for (var r = 0; r < tax_rate.length; r++) {
                                    if (tax_rate[r].rate != tax_info.rate) {
                                        var t = tax_on_amount * (tax_rate[r].rate / 100);
                                        base = base - t;
                                        part_tax.push({
                                            tax: tax_rate[r].tax,
                                            rate: tax_rate[r].rate,
                                            amount: parseFloat(t.toFixed(2))
                                        });
                                    }
                                    else {
                                        base = base - t
                                        part_tax.push({
                                            tax: tax_info.tax, tax_rate: tax_info.rate,
                                            rate: tax_info.rate,
                                            amount: parseFloat(tax_on_amount.toFixed(2))
                                        });
                                    }
                                }
                            }

                            tax_detail = {
                                tax: tax_info.tax,
                                tax_rate: tax_info.rate,
                                rate: tax_info.rate,
                                base: parseFloat(base.toFixed(2)),
                                detail: part_tax
                            }

                            parts.push({
                                source: null,
                                item: services[i].service,
                                hsn_sac: services[i].hsn_sac,
                                part_no: "",
                                quantity: 1,
                                issued: false,
                                rate: parseFloat(services[i].part_cost),
                                base: parseFloat(base.toFixed(2)),
                                amount: parseFloat(amount),
                                tax_amount: _.sumBy(part_tax, x => x.amount),
                                amount_is_tax: "inclusive",
                                customer_dep: 100,
                                insurance_dep: 0,
                                discount: 0,
                                tax: tax_info.tax,
                                tax_rate: tax_info.rate,
                                tax_info: tax_detail
                            })
                        }
                        // console.log("Labour Cost = " + services[i].labour_cost)
                        if (parseFloat(services[i].labour_cost) > 0) {
                            var amount = parseFloat(services[i].labour_cost);
                            var base = amount;
                            var labour_tax = [];

                            var x = (100 + tax_info.rate) / 100;
                            var tax_on_amount = amount / x;

                            if (tax_rate.length > 0) {
                                for (var r = 0; r < tax_rate.length; r++) {
                                    if (tax_rate[r].rate != tax_info.rate) {
                                        var t = tax_on_amount * (tax_rate[r].rate / 100);
                                        base = base - t
                                        labour_tax.push({
                                            tax: tax_rate[r].tax,
                                            rate: parseFloat(tax_rate[r].rate.toFixed(2)),
                                            amount: parseFloat(t.toFixed(2))
                                        });
                                    }
                                    else {
                                        base = base - t
                                        labour_tax.push({
                                            tax: tax_info.tax,
                                            rate: parseFloat(tax_info.rate.toFixed(2)),
                                            amount: parseFloat(tax_on_amount.toFixed(2))
                                        });
                                    }
                                }
                            }
                            labours.push({
                                item: services[i].service,
                                quantity: 1,
                                hsn_sac: services[i].hsn_sac,
                                rate: parseFloat(services[i].labour_cost),
                                base: parseFloat(base.toFixed(2)),
                                amount: parseFloat(amount),
                                discount: 0,
                                amount_is_tax: "inclusive",
                                customer_dep: 100,
                                insurance_dep: 0,
                                tax_amount: _.sumBy(labour_tax, x => x.amount),
                                tax: tax_info.tax,
                                tax_rate: tax_info.rate,
                                tax_info: {
                                    tax: tax_info.tax,
                                    tax_rate: tax_info.rate,
                                    rate: tax_info.rate,
                                    base: parseFloat(base.toFixed(2)),
                                    detail: labour_tax
                                }
                            })
                        }

                        var g = []
                        if (services[i].video_links != "") {
                            var video_links = services[i].video_links.split(',');

                            video_links.forEach(async function (l) {
                                g.push({
                                    file: l,
                                    type: "link",
                                    created_at: new Date(),
                                    updated_at: new Date(),
                                });
                            });
                        }
                        if (services[i].images_link != "") {
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

                        var margin_total = parseFloat(services[i].labour_cost) * (40 / 100);
                        var mrp = parseFloat(services[i].labour_cost) + margin_total;

                        //Abhinav :Update


                        var ser = await Customization.find({
                            package: services[i].package, segment: services[i].segment, publish: true, service: services[i].service, business: business
                        }).exec();

                        // return res.send(ser.type);
                        if (ser.length) {

                            // console.log(ser.length + " OLD Matched")
                            await Customization.findOneAndUpdate({
                                package: services[i].package, segment: services[i].segment, publish: true, service: services[i].service, business: business
                            },
                                {
                                    $set: {
                                        // business: business,
                                        // imported: true,
                                        model: model,
                                        _model: _model,
                                        automaker: automaker,
                                        _automaker: _automaker,
                                        package: services[i].package,
                                        segment: services[i].segment,
                                        service: services[i].service,
                                        description: services[i].description,
                                        parts: parts,
                                        part_cost: parseFloat(services[i].part_cost),
                                        opening_fitting: [],
                                        of_cost: 0,
                                        labour: labours,
                                        labour_cost: parseFloat(services[i].labour_cost),
                                        cost: parseFloat(services[i].part_cost) + parseFloat(services[i].labour_cost),
                                        mrp: parseFloat(services[i].part_cost) + Math.ceil(mrp),
                                        editable: true,
                                        labour_cost_editable: false,
                                        part_cost_editable: false,
                                        of_cost_editable: true,
                                        amount_is_tax: "inclusive",
                                        profile: services[i].images_link,
                                        created_at: new Date(),
                                        updated_at: new Date(),
                                        gallery: g,
                                        tax: "18.0% GST",
                                        rate: 18,
                                        tax_info: {
                                            tax: tax_info.tax, tax_rate: tax_info.rate,
                                            rate: tax_info.rate,
                                            base: parseFloat(base.toFixed(2)),
                                            detail: labour_tax
                                        },
                                    }
                                }, { new: true }, async function (err, doc) {
                                    // console.log("Update " + i)
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
                            // console.log("New Customization")

                            Customization.create({
                                business: business,
                                imported: true,
                                model: model,
                                _model: _model,
                                automaker: automaker,
                                _automaker: _automaker,
                                package: services[i].package,
                                segment: services[i].segment,
                                service: services[i].service,
                                description: services[i].description,
                                parts: parts,
                                part_cost: parseFloat(services[i].part_cost),
                                opening_fitting: [],
                                of_cost: 0,
                                labour: labours,
                                labour_cost: parseFloat(services[i].labour_cost),
                                cost: parseFloat(services[i].part_cost) + parseFloat(services[i].labour_cost),
                                mrp: parseFloat(services[i].part_cost) + Math.ceil(mrp),
                                editable: true,
                                labour_cost_editable: false,
                                part_cost_editable: false,
                                of_cost_editable: true,
                                amount_is_tax: "inclusive",
                                profile: services[i].images_link,
                                created_at: new Date(),
                                updated_at: new Date(),
                                gallery: g,
                                tax: "18.0% GST",
                                rate: 18,
                                tax_info: {
                                    tax: tax_info.tax, tax_rate: tax_info.rate,
                                    rate: tax_info.rate,
                                    base: parseFloat(base.toFixed(2)),
                                    detail: labour_tax
                                },

                            });
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
});    //END Service Price Code

//Modle Wise Price

router.post('/servicing/services/import', async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business1 = req.headers['business'];
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
                // console.log("Invalid Data Length" + invalid_data)
                // return res.json(invalid_data)
                if (invalid_data.length > 0) {
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Unformatted Data! Please check & upload again.",
                        responseData: {}
                    });
                }
                else {
                    /*Service.remove({
                        business: business,
                        imported: true,
                    });*/
                    business = req.body.business
                    var new_services = 0;
                    var updated_services = 0;
                    let modelList = []
                    // console.log("Services Length  = " + services.length)
                    let countIsModel = 0
                    let countIsNotModel = 0
                    for (var i = 0; i < services.length; i++) {
                        var automaker = null;
                        var _automaker = "";
                        var model = null;
                        var _model = "";
                        var m = true;
                        var segment1 = services[i].segment;

                        if (services[i]._model) {
                            // console.log("Business  = " + business)
                            var model = await Model.findOne({ value: services[i]._model }).exec();

                            if (model) {
                                countIsModel = countIsModel + 1
                                // console.log("Model Wise  ")
                                var automaker = await Automaker.findById(model.automaker).exec();
                                // console.log("_model = " + services[i]._model + "   Maker$$  =  " + automaker.maker + " -@ Segment @-  " + model.segment)
                                segment1 = model.segment;
                                model = model._id;
                                _model = model.value;
                                automaker = automaker._id;
                                _automaker = automaker.maker;
                                // console.log("_model = " + services[i]._model + "   Maker$$  =  " + model.segment + "  -  " + automaker.maker + " -@ Segment @-  " + segment1)
                                // console.log("Inside Model ")
                                //Model Wise
                                var tax_info = {}
                                var tax_info = await Tax.findOne({ rate: parseFloat(18.0), type: "GST" }).exec();
                                var tax_rate = tax_info.detail;

                                var parts = [];
                                var labours = [];
                                var opening_fitting = [];

                                if (parseFloat(services[i].part_cost) > 0) {
                                    parts_visible = false;
                                    var service = services[i].service;
                                    var amount = Math.ceil(services[i].part_cost);
                                    var base = amount;
                                    var part_tax = [];

                                    var x = (100 + tax_info.rate) / 100;
                                    var tax_on_amount = amount / x;
                                    if (tax_rate.length > 0) {
                                        for (var r = 0; r < tax_rate.length; r++) {
                                            if (tax_rate[r].rate != tax_info.rate) {
                                                var t = tax_on_amount * (tax_rate[r].rate / 100);
                                                base = base - t;
                                                part_tax.push({
                                                    tax: tax_rate[r].tax,
                                                    rate: tax_rate[r].rate,
                                                    amount: parseFloat(t.toFixed(2))
                                                });
                                            }
                                            else {
                                                base = base - t
                                                part_tax.push({
                                                    tax: tax_info.tax, tax_rate: tax_info.rate,
                                                    rate: tax_info.rate,
                                                    amount: parseFloat(tax_on_amount.toFixed(2))
                                                });
                                            }
                                        }
                                    }

                                    tax_detail = {
                                        tax: tax_info.tax,
                                        tax_rate: tax_info.rate,
                                        rate: tax_info.rate,
                                        base: parseFloat(base.toFixed(2)),
                                        detail: part_tax
                                    }

                                    parts.push({
                                        source: null,
                                        item: services[i].service,
                                        hsn_sac: services[i].hsn_sac,
                                        part_no: "",
                                        quantity: 1,
                                        issued: false,
                                        rate: parseFloat(services[i].part_cost),
                                        base: parseFloat(base.toFixed(2)),
                                        amount: parseFloat(amount),
                                        tax_amount: _.sumBy(part_tax, x => x.amount),
                                        amount_is_tax: "inclusive",
                                        customer_dep: 100,
                                        insurance_dep: 0,
                                        discount: 0,
                                        tax: tax_info.tax,
                                        tax_rate: tax_info.rate,
                                        tax_info: tax_detail
                                    })
                                }

                                if (parseFloat(services[i].labour_cost) > 0) {
                                    var amount = parseFloat(services[i].labour_cost);
                                    var base = amount;
                                    var labour_tax = [];

                                    var x = (100 + tax_info.rate) / 100;
                                    var tax_on_amount = amount / x;

                                    if (tax_rate.length > 0) {
                                        for (var r = 0; r < tax_rate.length; r++) {
                                            if (tax_rate[r].rate != tax_info.rate) {
                                                var t = tax_on_amount * (tax_rate[r].rate / 100);
                                                base = base - t
                                                labour_tax.push({
                                                    tax: tax_rate[r].tax,
                                                    rate: parseFloat(tax_rate[r].rate.toFixed(2)),
                                                    amount: parseFloat(t.toFixed(2))
                                                });
                                            }
                                            else {
                                                base = base - t
                                                labour_tax.push({
                                                    tax: tax_info.tax,
                                                    rate: parseFloat(tax_info.rate.toFixed(2)),
                                                    amount: parseFloat(tax_on_amount.toFixed(2))
                                                });
                                            }
                                        }
                                    }

                                    labours.push({
                                        item: services[i].service,
                                        quantity: 1,
                                        hsn_sac: services[i].hsn_sac,
                                        rate: parseFloat(services[i].labour_cost),
                                        base: parseFloat(base.toFixed(2)),
                                        amount: parseFloat(amount),
                                        discount: 0,
                                        amount_is_tax: "inclusive",
                                        customer_dep: 100,
                                        insurance_dep: 0,
                                        tax_amount: _.sumBy(labour_tax, x => x.amount),
                                        tax: tax_info.tax,
                                        tax_rate: tax_info.rate,
                                        tax_info: {
                                            tax: tax_info.tax,
                                            tax_rate: tax_info.rate,
                                            rate: tax_info.rate,
                                            base: parseFloat(base.toFixed(2)),
                                            detail: labour_tax
                                        }
                                    })
                                }

                                var g = []
                                if (services[i].video_links != "") {
                                    var video_links = services[i].video_links.split(',');

                                    video_links.forEach(async function (l) {
                                        g.push({
                                            file: l,
                                            type: "link",
                                            file_type: "video",
                                            created_at: new Date(),
                                            updated_at: new Date(),
                                        });
                                    });
                                }
                                // if (services[i].images_link != "") {
                                //     var images_link = services[i].images_link.split(',');

                                //     images_link.forEach(async function (l) {
                                //         g.push({

                                //             file: l,
                                //             file_type: "image",
                                //             type: "link",
                                //             created_at: new Date(),
                                //             updated_at: new Date(),
                                //         });
                                //     });
                                // }

                                var margin_total = parseFloat(services[i].labour_cost) * (40 / 100);
                                var mrp = parseFloat(services[i].labour_cost) + margin_total;

                                //Abhinav :Update

                                // fuel: services[i].fuel,  , fuel: services[i].fuel

                                // , fuel: services[i].fuel, 
                                console.log("Service  = " + services[i].service)
                                var ser = await Service.find({
                                    package: services[i].package, publish: true, _model: services[i]._model, segment: segment1, service: services[i].service, business: business, fuel: services[i].fuel
                                }).exec();
                                // console.log(ser)
                                // return res.json(ser)
                                // return res.send(ser.type);  count().
                                // console.log("Length  of Servi " + ser.length)
                                // console.log("parseFloat(services[i].labour_cost)= " + parseFloat(services[i].labour_cost) + "       --------------- Updated")
                                // parseFloat(services[i].labour_cost)
                                if (ser.length) {
                                    // console.log(ser.length)
                                    // , fuel: services[i].fuel
                                    await Service.findOneAndUpdate({
                                        package: services[i].package, publish: true, _model: services[i]._model, segment: segment1, service: services[i].service, business: business, fuel: services[i].fuel
                                    }, {
                                        $set: {
                                            // business: business,
                                            // imported: true,
                                            model: model,
                                            _model: services[i]._model,
                                            automaker: automaker,
                                            _automaker: services[i]._automaker,
                                            package: services[i].package,
                                            // segment: services[i].segment,
                                            segment: segment1,
                                            service: services[i].service,
                                            description: services[i].description,
                                            parts: parts,
                                            part_cost: parseFloat(services[i].part_cost),
                                            opening_fitting: [],
                                            of_cost: 0,
                                            hours: services[i].duration,
                                            labour: labours,
                                            fuel: services[i].fuel,
                                            labour_cost: parseFloat(services[i].labour_cost),
                                            cost: parseFloat(services[i].part_cost) + parseFloat(services[i].labour_cost),
                                            mrp: parseFloat(services[i].part_cost) + Math.ceil(mrp),
                                            editable: true,
                                            labour_cost_editable: false,
                                            part_cost_editable: false,
                                            of_cost_editable: true,
                                            amount_is_tax: "inclusive",
                                            profile: services[i].images_link,
                                            created_at: new Date(),
                                            updated_at: new Date(),
                                            gallery: g,
                                            tax: "18.0% GST",
                                            rate: 18,
                                            tax_info: {
                                                tax: tax_info.tax, tax_rate: tax_info.rate,
                                                rate: tax_info.rate,
                                                base: parseFloat(base.toFixed(2)),
                                                detail: labour_tax
                                            },



                                        }
                                    }, { new: true }, async function (err, doc) {
                                        // console.log("Update  Model Wise  " + i + "  _model = " + services[i]._model)
                                        if (err) {
                                            // res.status(422).json({
                                            //     responseCode: 422,
                                            //     responseMessage: "Unprocessable Entity",
                                            //     responseData: {}
                                            // });
                                            // console.log("Unprocessable Entity")
                                        }
                                        else {

                                            updated_services += 1
                                            // var booking = await Booking.findOne({ _id: req.body.booking }).exec();
                                            // res.status(200).json({
                                            //     responseCode: 200,
                                            //     responseMessage: "Service Updated",
                                            //     responseData: {}
                                            // });
                                            // console.log("Service Updated ")
                                            // console.log("Model Wise Update " + i + "Segment= " + segment1 + " , _model= " + doc._model)
                                        }
                                    });

                                }
                                else {
                                    ///
                                    // console.log("Service Created ")
                                    // console.log("Model Wise New Create " + i + "Segment= " + segment1 + " , _model= " + services[i]._model)
                                    // console.log("New Service  = " + i + "  _model = " + services[i]._model + "   =  " + automaker + "   ")
                                    Service.create({
                                        business: business,
                                        imported: true,
                                        model: model,
                                        _model: services[i]._model,
                                        automaker: automaker,
                                        automaker: automaker,
                                        _automaker: services[i]._automaker,
                                        package: services[i].package,
                                        // segment: services[i].segment,
                                        segment: segment1,
                                        service: services[i].service,
                                        description: services[i].description,
                                        parts: parts,
                                        part_cost: parseFloat(services[i].part_cost),
                                        opening_fitting: [],
                                        of_cost: 0,
                                        hours: services[i].duration,
                                        fuel: services[i].fuel,
                                        labour: labours,
                                        labour_cost: parseFloat(services[i].labour_cost),
                                        cost: parseFloat(services[i].part_cost) + parseFloat(services[i].labour_cost),
                                        mrp: parseFloat(services[i].part_cost) + Math.ceil(mrp),
                                        editable: true,
                                        labour_cost_editable: false,
                                        part_cost_editable: false,
                                        of_cost_editable: true,
                                        amount_is_tax: "inclusive",
                                        profile: services[i].images_link,
                                        created_at: new Date(),
                                        updated_at: new Date(),
                                        gallery: g,
                                        tax: "18.0% GST",
                                        rate: 18,
                                        tax_info: {
                                            tax: tax_info.tax, tax_rate: tax_info.rate,
                                            rate: tax_info.rate,
                                            base: parseFloat(base.toFixed(2)),
                                            detail: labour_tax
                                        },
                                    });
                                    new_services += 1
                                }
                            } else {
                                countIsNotModel = countIsNotModel + 1
                                services[i]['description'] = ''
                                modelList.push({
                                    _automaker: services[i]._automaker,
                                    _model: services[i]._model,
                                    // fuel: services[i].fuel,
                                    // package: services[i].package,
                                    // duration: services[i].duration,
                                    // service: services[i].service,
                                    // part_cost: services[i].part_cost,
                                    // labour_cost: services[i].labour_cost,
                                    // cost: services[i].cost,
                                })
                            }
                        }
                        //Segment Wise
                        else {
                            // console.log("Segment  " + segment1)

                            var tax_info = {}
                            var tax_info = await Tax.findOne({ rate: parseFloat(18.0), type: "GST" }).exec();
                            var tax_rate = tax_info.detail;

                            var parts = [];
                            var labours = [];
                            var opening_fitting = [];

                            if (parseFloat(services[i].part_cost) > 0) {
                                parts_visible = false;
                                var service = services[i].service;
                                var amount = Math.ceil(services[i].part_cost);
                                var base = amount;
                                var part_tax = [];

                                var x = (100 + tax_info.rate) / 100;
                                var tax_on_amount = amount / x;
                                if (tax_rate.length > 0) {
                                    for (var r = 0; r < tax_rate.length; r++) {
                                        if (tax_rate[r].rate != tax_info.rate) {
                                            var t = tax_on_amount * (tax_rate[r].rate / 100);
                                            base = base - t;
                                            part_tax.push({
                                                tax: tax_rate[r].tax,
                                                rate: tax_rate[r].rate,
                                                amount: parseFloat(t.toFixed(2))
                                            });
                                        }
                                        else {
                                            base = base - t
                                            part_tax.push({
                                                tax: tax_info.tax, tax_rate: tax_info.rate,
                                                rate: tax_info.rate,
                                                amount: parseFloat(tax_on_amount.toFixed(2))
                                            });
                                        }
                                    }
                                }

                                tax_detail = {
                                    tax: tax_info.tax,
                                    tax_rate: tax_info.rate,
                                    rate: tax_info.rate,
                                    base: parseFloat(base.toFixed(2)),
                                    detail: part_tax
                                }

                                parts.push({
                                    source: null,
                                    item: services[i].service,
                                    hsn_sac: services[i].hsn_sac,
                                    part_no: "",
                                    quantity: 1,
                                    issued: false,
                                    rate: parseFloat(services[i].part_cost),
                                    base: parseFloat(base.toFixed(2)),
                                    amount: parseFloat(amount),
                                    tax_amount: _.sumBy(part_tax, x => x.amount),
                                    amount_is_tax: "inclusive",
                                    customer_dep: 100,
                                    insurance_dep: 0,
                                    discount: 0,
                                    tax: tax_info.tax,
                                    tax_rate: tax_info.rate,
                                    tax_info: tax_detail
                                })
                            }

                            if (parseFloat(services[i].labour_cost) > 0) {
                                var amount = parseFloat(services[i].labour_cost);
                                var base = amount;
                                var labour_tax = [];

                                var x = (100 + tax_info.rate) / 100;
                                var tax_on_amount = amount / x;

                                if (tax_rate.length > 0) {
                                    for (var r = 0; r < tax_rate.length; r++) {
                                        if (tax_rate[r].rate != tax_info.rate) {
                                            var t = tax_on_amount * (tax_rate[r].rate / 100);
                                            base = base - t
                                            labour_tax.push({
                                                tax: tax_rate[r].tax,
                                                rate: parseFloat(tax_rate[r].rate.toFixed(2)),
                                                amount: parseFloat(t.toFixed(2))
                                            });
                                        }
                                        else {
                                            base = base - t
                                            labour_tax.push({
                                                tax: tax_info.tax,
                                                rate: parseFloat(tax_info.rate.toFixed(2)),
                                                amount: parseFloat(tax_on_amount.toFixed(2))
                                            });
                                        }
                                    }
                                }

                                labours.push({
                                    item: services[i].service,
                                    quantity: 1,
                                    hsn_sac: services[i].hsn_sac,
                                    rate: parseFloat(services[i].labour_cost),
                                    base: parseFloat(base.toFixed(2)),
                                    amount: parseFloat(amount),
                                    discount: 0,
                                    amount_is_tax: "inclusive",
                                    customer_dep: 100,
                                    insurance_dep: 0,
                                    tax_amount: _.sumBy(labour_tax, x => x.amount),
                                    tax: tax_info.tax,
                                    tax_rate: tax_info.rate,
                                    tax_info: {
                                        tax: tax_info.tax,
                                        tax_rate: tax_info.rate,
                                        rate: tax_info.rate,
                                        base: parseFloat(base.toFixed(2)),
                                        detail: labour_tax
                                    }
                                })
                            }

                            var g = []
                            if (services[i].video_links != "") {
                                var video_links = services[i].video_links.split(',');
                                // console.log("Vedios ")
                                video_links.forEach(async function (l) {
                                    g.push({
                                        file: l,
                                        type: "link",
                                        file_type: "video",
                                        created_at: new Date(),
                                        updated_at: new Date(),
                                    });
                                });
                            }
                            if (services[i].images_link != "") {
                                var images_link = services[i].images_link.split(',');
                                // console.log("Images ")
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

                            var margin_total = parseFloat(services[i].labour_cost) * (40 / 100);
                            var mrp = parseFloat(services[i].labour_cost) + margin_total;

                            //Abhinav :Update

                            var ser = await Service.find({
                                package: services[i].package, publish: true, segment: segment1, service: services[i].service, business: business
                            }).exec();

                            // return res.send(ser.type);
                            // console.log(ser.length)
                            if (ser.length) {
                                // console.log(ser.length)
                                // console.log(ser.length)
                                updated_services += 1
                                await Service.findOneAndUpdate({
                                    package: services[i].package, publish: true, segment: segment1, service: services[i].service, business: business
                                }, {
                                    $set: {
                                        // business: business,
                                        // imported: true,
                                        model: model,
                                        _model: _model,
                                        automaker: automaker,
                                        _automaker: _automaker,
                                        package: services[i].package,
                                        segment: services[i].segment,
                                        // segment: segment1,
                                        service: services[i].service,
                                        description: services[i].description,
                                        parts: parts,
                                        part_cost: parseFloat(services[i].part_cost),
                                        opening_fitting: [],
                                        of_cost: 0,
                                        labour: labours,
                                        labour_cost: parseFloat(services[i].labour_cost),
                                        cost: parseFloat(services[i].part_cost) + parseFloat(services[i].labour_cost),
                                        mrp: parseFloat(services[i].part_cost) + Math.ceil(mrp),
                                        editable: true,
                                        labour_cost_editable: false,
                                        part_cost_editable: false,
                                        of_cost_editable: true,
                                        amount_is_tax: "inclusive",
                                        profile: services[i].images_link,
                                        created_at: new Date(),
                                        updated_at: new Date(),
                                        gallery: g,
                                        tax: "18.0% GST",
                                        rate: 18,
                                        tax_info: {
                                            tax: tax_info.tax, tax_rate: tax_info.rate,
                                            rate: tax_info.rate,
                                            base: parseFloat(base.toFixed(2)),
                                            detail: labour_tax
                                        },



                                    }
                                }, { new: true }, async function (err, doc) {
                                    // console.log("Segment Wise Update " + i)
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
                                // console.log("Package  = " + services[i].package + ", Service = " + services[i].service + ", Segment = " + services[i].segment)
                                new_services += 1;
                                // console.log("Segment New Service  = " + i + "  _model = " + _model + "   =  " + automaker + "   ")
                                Service.create({
                                    business: business,
                                    imported: true,
                                    model: model,
                                    _model: _model,
                                    automaker: automaker,
                                    _automaker: _automaker,
                                    package: services[i].package,
                                    segment: services[i].segment,
                                    // segment: segment1,
                                    service: services[i].service,
                                    description: services[i].description,
                                    parts: parts,
                                    part_cost: parseFloat(services[i].part_cost),
                                    opening_fitting: [],
                                    of_cost: 0,
                                    labour: labours,
                                    labour_cost: parseFloat(services[i].labour_cost),
                                    cost: parseFloat(services[i].part_cost) + parseFloat(services[i].labour_cost),
                                    mrp: parseFloat(services[i].part_cost) + Math.ceil(mrp),
                                    editable: true,
                                    labour_cost_editable: false,
                                    part_cost_editable: false,
                                    of_cost_editable: true,
                                    amount_is_tax: "inclusive",
                                    profile: services[i].images_link,
                                    created_at: new Date(),
                                    updated_at: new Date(),
                                    gallery: g,
                                    tax: "18.0% GST",
                                    rate: 18,
                                    tax_info: {
                                        tax: tax_info.tax, tax_rate: tax_info.rate,
                                        rate: tax_info.rate,
                                        base: parseFloat(base.toFixed(2)),
                                        detail: labour_tax
                                    },

                                });
                                // console.log("Created ", i)
                                // res.status(200).json({
                                //     responseCode: 200,
                                //     responseMessage: "Successfully Import",
                                //     responseData: {}
                                // });

                            }
                        }
                    }
                    console.log("NEW Services = " + new_services + " \nUpdated Services = " + updated_services)
                    // console.log("Service File Uploaded ")
                    console.log("Is Model = ", countIsModel, '\nIs Not Model = ', countIsNotModel)
                    console.log("V =", JSON.stringify(modelList))
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
// var new_services = 0;
// var updated_services = 0;
//End

// Custom Services Approval

router.get('/approval/cars/get', xAccessToken.token, async function (req, res, next) {
    if (req.query.page == undefined) {
        var page = 0;
    }
    else {
        var page = req.query.page;
    }
    var page = Math.max(0, parseInt(page));

    if (req.query.limit == undefined) {
        var limit = 50;
    }
    else {
        var limit = parseInt(req.query.limit);
    }

    var result = [];

    if (req.query.type == undefined) {
        var query = { admin_verified: false };
    }
    else {
        if (req.query.type == "Approved") {
            var query = { admin_verified: true };
        }
        else {
            var query = { admin_verified: false };
        }
    }

    await CarSell.find({ admin_verified: false })
        .populate({ path: 'car' })
        .populate({ path: 'seller', select: 'name username avatar avatar_address address' })
        .populate({ path: 'owner', select: 'name username avatar avatar_address address' })
        .skip(limit * page).limit(limit)
        .cursor().eachAsync(async (p) => {
            result.push({
                _id: p._id,
                id: p._id,
                car: {
                    _id: p.car._id,
                    id: p.car._id,
                    title: p.car.title,
                    _automaker: p.car._automaker,
                    _model: p.car._model,
                    registration_no: p.car.registration_no,
                },
                owner: {
                    _id: p.owner._id,
                    id: p.owner._id,
                    name: p.owner.name,
                    contact_no: p.owner.contact_no,
                    email: p.owner.email,
                },
                seller: {
                    _id: p.seller._id,
                    id: p.seller._id,
                    name: p.seller.name,
                    contact_no: p.seller.contact_no,
                    email: p.seller.email,
                },
                created_at: moment(p.created_at).tz(req.headers['tz']).format('LLL'),
                updated_at: moment(p.updated_at).tz(req.headers['tz']).format('LLL'),
            });
        });

    res.status(200).json({
        responseCode: 200,
        responseMessage: "Cars",
        responseData: result
    });
});


//
router.put('/services-approval', xAccessToken.token, async function (req, res, next) {
    var rules = {
        package: 'required',
        name: 'required',
        validity: 'required',
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
        var package = await Service.find({ publish: false, user: req.body.user }).exec();
        if (package) {
            // var expired_at = package.created_at;
            // expired_at.setDate(expired_at.getDate() + req.body.validity);

            var data = {
                name: req.body.name,
                discount: req.body.discount,
                validity: req.body.validity,
                expired_at: expired_at,
                updated_at: new Date(),
            }

            UserPackage.findOneAndUpdate({ _id: req.body.package }, { $set: data }, { new: true }, async function (err, doc) {
                if (err) {
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Server Error",
                        responseData: err,
                    });
                }
                else {
                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Saved...",
                        responseData: {},
                    });
                }
            });
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

//Abhinav: Custom Services Get
// router.post('/booking/approval/services/get', xAccessToken.token, async function (req, res, next) {
//     var rules = {
//         category: 'required',
//     };
//     var validation = new Validator(req.body, rules);
//     if (validation.fails()) {
//         res.status(422).json({
//             responseCode: 422,
//             responseMessage: "Please Chose a Service",
//             responseData: {
//                 res: validation.errors.all()
//             }
//         })
//     }
//     else {
//         var token = req.headers['x-access-token'];
//         var secret = config.secret;
//         var decoded = jwt.verify(token, secret);
//         var user = decoded.user;

//         if (req.headers['business']) {
//             user = req.headers['business'];
//         }



//         var packages = [];

//         if (!req.body.package) {
//             req.body.package = null
//         }
//         var business = null;
//         if (req.body.business) {
//             business = req.body.business
//         }


//         var car = await Car.findOne({ _id: req.body.car, user: user }).populate('model').exec();
//         if (car) {
//             if (req.body.type == "services") {
//                 await Service.find({ business: business, segment: car.model.segment, part_cost: 0, publish: true, business: business })
//                     .cursor().eachAsync(async (service) => {


//Abhinav : Custom service Fetch Created By Business....
router.get('/custom/services/get', xAccessToken.token, async function (req, res, next) {
    // var rules = {
    //     type: 'required',
    // };

    // var validation = new Validator(req.query, rules);

    // if (validation.fails()) {
    //     res.status(422).json({
    //         responseCode: 422,
    //         responseMessage: "Please select a Service",
    //         responseData: {
    //             res: validation.errors.all()
    //         }
    //     })
    // }
    // else {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;

    if (req.headers['business']) {
        user = req.headers['business'];
    }
    // var packages = [];
    // if (!req.body.package) {
    //     req.body.package = null
    // }
    // var business = null;
    // if (req.body.business) {
    //     business = req.body.business
    // }
    var data = [];
    var count = 0;
    var status = "Custom";
    // var car = await Car.findOne({ _id: req.body.car, user: user }).populate('model').exec();
    // if (req.query.type == "customization") {
    if (req.query.status) {
        status = req.query.status
    }


    await Customization.find({ approved: false, publish: false, admin_verified: false, admin_status: "Custom" })
        .populate('business')
        .populate('user')
        .sort({ created_at: -1 })
        .cursor()
        .eachAsync(async (ser) => {
            //         


            // var count=0;
            //Working Query
            // var filters = [{ $match: { approved: false, publish: false } }];
            // await Customization.aggregate({ $match: { publish : false }})
            //     .allowDiskUse(true)
            //     .cursor({ batchSize: 10 })
            //     .sort({ updated_at: -1 })
            //     .exec()
            //     .eachAsync(async function (ser) {
            // console.log("Working Query ...", ser)
            count += 1
            if (ser.business) {
                buss = await User.findById({ _id: ser.business._id }).exec();
                var business = {
                    _id: ser.business._id,
                    id: ser.business._id,
                    name: buss.name,
                    email: buss.email,
                    contact_no: buss.contact_no,
                };
            }
            else {
                var business = {
                    _id: "",
                    id: "",
                    name: "",
                    email: "",
                    contact_no: "",
                };
            }
            if (ser.approved) {
                status = ser.apprpved
            }
            else {
                status = null
            }


            data.push({
                type: ser.type,
                sub_category: ser.package,
                segment: ser.segment,
                service: ser.service,
                part_cost: ser.part_cost,
                // part_cost: Math.ceil(service.part_cost),
                labour_cost: ser.labour_cost,
                source: ser.id,
                // id: ser.id,
                _id: ser._id,
                business: business,
                created_at: ser.created_at,
                approval: ser.approved,
                publish: ser.publish,
                admin_status: ser.admin_status,
                admin_verified: ser.admin_verified


            })
            //     packages.push({
            //         package: service.package,
            //         service: service.service,
            //         labour: labours,
            //         labour_cost: _.sumBy(labours, x => x.amount),
            //         parts: service.parts,
            //         part_cost: Math.ceil(service.part_cost),
            //         opening_fitting: service.opening_fitting,
            //         of_cost: Math.ceil(service.of_cost),
            //         exceeded_cost: 0,
            //         mrp: _.sumBy(labours, x => x.amount) + (_.sumBy(labours, x => x.amount) * (40 / 100)),
            //         cost: Math.ceil(service.part_cost) + _.sumBy(labours, x => x.amount) + service.of_cost,
            //         doorstep: service.doorstep,
            //         unit: service.unit,
            //         quantity: service.quantity,
            //         part_cost_editable: service.part_cost_editable,
            //         labour_cost_editable: service.labour_cost_editable,
            //         of_cost_editable: service.of_cost_editable,
            //         type: service.type,
            //         source: service.id,
            //         gallery: gallery.length,
            //         description: service.description,
            //         coupons: coupons,
            //         id: service.id,
            //         _id: service._id
            //     });
        });
    // console.log(count)
    // res.status(200).json({
    //     responseCode: 200,
    //     responseMessage: "Non Approved Services",
    //     responseData: {
    //         total_requests: count
    //     },
    //     data
    // });
    // }
    // else if (req.query.type == "collision") {
    await Collision.find({ approved: false, publish: false, admin_verified: false, admin_status: "Custom" })
        .populate('business')
        .populate('user')
        .sort({ created_at: -1 })
        .cursor()
        .eachAsync(async (ser) => {
            count += 1
            if (ser.business) {
                buss = await User.findById({ _id: ser.business._id }).exec();
                var business = {
                    _id: ser.business._id,
                    id: ser.business._id,
                    name: buss.name,
                    email: buss.email,
                    contact_no: buss.contact_no,
                };
            }
            else {
                var business = {
                    _id: "",
                    id: "",
                    name: "",
                    email: "",
                    contact_no: "",
                };
            }
            if (ser.approved) {
                status = ser.apprpved
            }
            else {
                status = null
            }
            data.push({
                type: ser.type,
                sub_category: ser.package,
                segment: ser.segment,
                service: ser.service,
                part_cost: ser.part_cost,
                // part_cost: Math.ceil(service.part_cost),
                labour_cost: ser.labour_cost,
                source: ser.id,
                // id: ser.id,
                _id: ser._id,
                business: business,
                created_at: ser.created_at,
                approval: ser.approved,
                publish: ser.publish,
                admin_status: ser.admin_status,
                admin_verified: ser.admin_verified
            })
        });
    // console.log(count)
    // res.status(200).json({
    //     responseCode: 200,
    //     responseMessage: "Non Approved Services",
    //     responseData: {
    //         total_requests: count
    //     },
    //     data
    // });
    // }
    // else if (req.query.type == "services") {
    await Service.find({ approved: false, publish: false, admin_verified: false, admin_status: "Custom" })
        .populate('business')
        .populate('user')
        .sort({ created_at: -1 })
        .cursor()
        .eachAsync(async (ser) => {
            count += 1
            if (ser.business) {
                buss = await User.findById({ _id: ser.business._id }).exec();
                var business = {
                    _id: ser.business._id,
                    id: ser.business._id,
                    name: buss.name,
                    email: buss.email,
                    contact_no: buss.contact_no,
                };
            }
            else {
                var business = {
                    _id: "",
                    id: "",
                    name: "",
                    email: "",
                    contact_no: "",
                };
            }
            if (ser.approved) {
                status = ser.apprpved
            }
            else {
                status = null
            }
            data.push({
                type: ser.type,
                sub_category: ser.package,
                segment: ser.segment,
                service: ser.service,
                part_cost: ser.part_cost,
                // part_cost: Math.ceil(service.part_cost),
                labour_cost: ser.labour_cost,
                source: ser.id,
                // id: ser.id,
                _id: ser._id,
                business: business,
                created_at: ser.created_at,
                approval: ser.approved,
                publish: ser.publish,
                admin_status: ser.admin_status,
                admin_verified: ser.admin_verified
            })
        });
    // console.log(count)
    // res.status(200).json({
    //     responseCode: 200,
    //     responseMessage: "Non Approved Services",
    //     responseData: {
    //         total_requests: count
    //     },
    //     data
    // });
    // }
    // else if (req.query.type == "detailing") {
    await Detailing.find({ approved: false, publish: false, admin_verified: false, admin_status: "Custom" })
        .populate('business')
        .populate('user')
        .sort({ created_at: -1 })
        .cursor()
        .eachAsync(async (ser) => {
            count += 1
            if (ser.business) {
                buss = await User.findById({ _id: ser.business._id }).exec();
                var business = {
                    _id: ser.business._id,
                    id: ser.business._id,
                    name: buss.name,
                    email: buss.email,
                    contact_no: buss.contact_no,
                };
            }
            else {
                var business = {
                    _id: "",
                    id: "",
                    name: "",
                    email: "",
                    contact_no: "",
                };
            }
            if (ser.approved) {
                status = ser.apprpved
            }
            else {
                status = null
            }
            data.push({
                type: ser.type,
                sub_category: ser.package,
                segment: ser.segment,
                service: ser.service,
                part_cost: ser.part_cost,
                // part_cost: Math.ceil(service.part_cost),
                labour_cost: ser.labour_cost,
                source: ser.id,
                // id: ser.id,
                _id: ser._id,
                business: business,
                created_at: ser.created_at,
                approval: ser.approved,
                publish: ser.publish,
                admin_status: ser.admin_status,
                admin_verified: ser.admin_verified
            })
        });
    // console.log(count)
    // res.status(200).json({
    //     responseCode: 200,
    //     responseMessage: "Non Approved Services",
    //     responseData: {
    //         total_requests: count
    //     },
    //     data
    // });
    // }

    // else {
    //     res.status(400).json({
    //         responseCode: 400,
    //         responseMessage: "Unauthorized",
    //         responseData: {},
    //     });

    // }
    // }
    res.status(200).json({
        responseCode: 200,
        responseMessage: "Services for Approvals",
        responseData: {
            total_requests: count
        },
        data
    });
});

//Approve API Usefull
router.put('/services/listing/approved', xAccessToken.token, async function (req, res, next) {
    var rules = {
        _id: 'required',
        type: 'required',
        status: 'required',   //To maintain status for search query use in future
    };
    var status = req.query.status;
    var type = req.query.type;
    // console.log(status)
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
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var remark = "";
        var decoded = jwt.verify(token, secret);
        var loggedInDetails = await User.findById(decoded.user).exec();
        if (status == "Approved") {
            if (req.query.type == "services") {
                // console.log("Inside services")
                await Service.findOneAndUpdate({ _id: req.query._id }, {
                    $set: {
                        approved: true,
                        publish: true,
                        admin_status: "Approved",
                        admin_verified: true,
                        // status:req.query.status,
                        updated_at: new Date()
                    }
                }, { new: true }, function (err, doc) {
                    if (err) {
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Error Occurred",
                            responseData: err,
                        });
                    }
                    else {
                        // console.log("Updatedd...... " + req.query._id + " Type= " + req.query.type)
                        event.adminServiceApproval(type, req.query._id, req.body.remark, req.headers['tz'])
                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Successfully Approved",
                            responseData: {}
                        })
                    }
                });

            } else if (req.query.type == "collision") {
                // console.log("Inside Collision")
                await Collision.findOneAndUpdate({ _id: req.query._id }, {
                    $set: {
                        approved: true,
                        publish: true,
                        admin_status: "Approved",
                        admin_verified: true,
                        // status:req.query.status,
                        updated_at: new Date()
                    }
                }, { new: false }, function (err, doc) {
                    if (err) {
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Error Occurred",
                            responseData: err,
                        });
                    }


                    else {
                        // console.log("Updatedd..collision.... " + req.query._id + " Type= " + req.query.type)
                        event.adminServiceApproval(type, req.query._id, req.body.remark, req.headers['tz'])
                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Successfully Approved",
                            responseData: {}
                        })
                    }
                });

            }
            else if (req.query.type == "detailing") {
                // console.log("Inside Detailing")
                await Detailing.findOneAndUpdate({ _id: req.query._id }, {
                    $set: {
                        approved: true,
                        publish: true,
                        admin_status: "Approved",
                        admin_verified: true,
                        // status:req.query.status,
                        updated_at: new Date()
                    }
                }, { new: true }, function (err, doc) {
                    if (err) {
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Error Occurred",
                            responseData: err,
                        });
                    }
                    else {
                        // console.log("Updatedd..detailing.... " + req.query._id + " Type= " + req.query.type)
                        event.adminServiceApproval(type, req.query._id, req.body.remark, req.headers['tz'])
                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Successfully Approved",
                            responseData: {}
                        })
                    }
                });

            }
            else if (req.query.type == "customization") {
                // console.log("Inside Customization")
                await Customization.findOneAndUpdate({ _id: req.query._id }, {
                    $set: {
                        approved: true,
                        publish: true,
                        admin_status: "Approved",
                        admin_verified: true,
                        // status:req.query.status,
                        updated_at: new Date()
                    }
                }, { new: true }, function (err, doc) {
                    if (err) {
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Error Occurred",
                            responseData: err,
                        });
                    }
                    else {
                        // console.log("Updatedd..customization.... " + req.query._id + " Type= " + req.query.type)
                        event.adminServiceApproval(type, req.query._id, req.body.remark, req.headers['tz'])
                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Successfully Approved",
                            responseData: {}
                        })
                    }
                });

            }
            else {
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Service not Found",
                    responseData: {}
                })
            }
        }
        else if (status == "Declined") {
            if (req.query.type == "services") {
                // console.log("Inside Declined services")
                await Service.findOneAndUpdate({ _id: req.query._id }, {
                    $set: {
                        // approved: false,
                        // publish: false,
                        // admin_status: "Declined",
                        // admin_verified: true,
                        // updated_at: new Date()
                        approved: false,
                        publish: false,
                        admin_status: "Declined",
                        admin_verified: true,
                        // status:req.query.status,
                        updated_at: new Date()
                    }
                }, { new: true }, function (err, doc) {
                    if (err) {
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Error Occurred",
                            responseData: err,
                        });
                    }
                    else {
                        // console.log("Updatedd...... " + req.query._id + " Type= " + req.query.type)
                        event.adminServiceApproval(type, req.query._id, req.body.remark, req.headers['tz'])
                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Successfully Declined",
                            responseData: {}
                        })
                    }
                });

            } else if (req.query.type == "collision") {
                // console.log("Inside  Declined Collision")
                await Collision.findOneAndUpdate({ _id: req.query._id }, {
                    $set: {
                        approved: false,
                        publish: false,
                        admin_status: "Declined",
                        admin_verified: true,
                        // status:req.query.status,
                        updated_at: new Date()
                    }
                }, { new: true }, function (err, doc) {
                    if (err) {
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Error Occurred",
                            responseData: err,
                        });
                    }


                    else {
                        // console.log("Updatedd..collision.... " + req.query._id + " Type= " + req.query.type)
                        event.adminServiceApproval(type, req.query._id, req.body.remark, req.headers['tz'])
                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Successfully Declined",
                            responseData: {}
                        })
                    }
                });

            }
            else if (req.query.type == "detailing") {
                // console.log("Inside  Declined Detailing")
                await Detailing.findOneAndUpdate({ _id: req.query._id }, {
                    $set: {
                        approved: false,
                        publish: false,
                        admin_status: "Declined",
                        admin_verified: true,
                        updated_at: new Date()
                    }
                }, { new: true }, function (err, doc) {
                    if (err) {
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Error Occurred",
                            responseData: err,
                        });
                    }
                    else {
                        // console.log("Updatedd..detailing.... " + req.query._id + " Type= " + req.query.type)
                        event.adminServiceApproval(type, req.query._id, req.body.remark, req.headers['tz'])
                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Successfully Declined",
                            responseData: {}
                        })
                    }
                });

            }
            else if (req.query.type == "customization") {
                // console.log("Inside Customization")
                await Customization.findOneAndUpdate({ _id: req.query._id }, {
                    $set: {
                        approved: false,
                        publish: false,
                        admin_status: "Declined",
                        admin_verified: true,
                        updated_at: new Date()
                    }
                }, { new: true }, function (err, doc) {
                    if (err) {
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Error Occurred",
                            responseData: err,
                        });
                    }
                    else {
                        // console.log("Updatedd..customization.... " + req.query._id + " Type= " + req.query.type)
                        event.adminServiceApproval(type, req.query._id, req.body.remark, req.headers['tz'])
                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Successfully Declined",
                            responseData: {}
                        })
                    }
                });

            }
            else {
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Service not Found",
                    responseData: {}
                })
            }
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Status not Matched",
                responseData: {}
            })

        }
    }
});

//
// Decline API Usefull
// router.post('/car/listing/decline', xAccessToken.token, async function (req, res, next) {
//     var token = req.headers['x-access-token'];
//     var secret = config.secret;
//     var decoded = jwt.verify(token, secret);

//     var loggedInDetails = await User.findById(decoded.user).exec();


//     var listing = await CarSell.findById(req.body.sell).exec();
//     if (listing) {
//         var logs = listing.logs;

//         logs.push({
//             user: loggedInDetails._id,
//             name: "Admin",
//             status: "Decline",
//             remark: req.body.remark,
//             created_at: new Date(),
//             updated_at: new Date()
//         });

//         CarSell.findOneAndUpdate({ _id: listing._id }, {
//             $set: {
//                 logs: logs,
//                 admin_verified: false,
//                 updated_at: new Date()
//             }
//         }, { new: false }, async function (err, doc) {
//             if (err) {
//                 res.status(400).json({
//                     responseCode: 400,
//                     responseMessage: "Server Error",
//                     responseData: err
//                 })
//             }
//             else {
//                 Car.findOneAndUpdate({ _id: listing.car }, {
//                     $set: {
//                         publish: false,
//                         admin_approved: false,
//                         updated_at: new Date()
//                     }
//                 }, { new: false }, async function (err, doc) {
//                     if (err) {
//                         res.status(400).json({
//                             responseCode: 400,
//                             responseMessage: "Server Error",
//                             responseData: err
//                         })
//                     }
//                     else {
//                         var notify = {
//                             receiver: [listing.seller.toString()],
//                             activity: "CarList",
//                             tag: "CarListRejected",
//                             source: listing.car,
//                             sender: null,
//                             body: req.body.remark,
//                             points: 0
//                         }

//                         fun.newNotification(notify);


//                         event.adminCarReject(listing._id, req.body.remark, req.headers['tz'])
//                         res.status(200).json({
//                             responseCode: 200,
//                             responseMessage: "Declined",
//                             responseData: {}
//                         })
//                     }
//                 });
//             }
//         });
//     }
//     else {
//         res.status(400).json({
//             responseCode: 400,
//             responseMessage: "Car not found",
//             responseData: {}
//         })
//     }
// });
//Abhinav Sprint 3 Businesses  Upload
router.post('/bussineses/accounts/upload/abhinav', function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    // var user = decoded.user;
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
        }, async function (err, business) {
            if (err) {
                return res.status(422).json({
                    responseCode: 422,
                    responseMessage: "Error",
                    responseData: err
                });
            }
            else {
                var data = [];
                for (var i = 0; i < business.length; i++) {
                    // console.log(business[i].contact_no + "    name " + business[i].location + "    name " + business[i].state, "    name " + business[i].name)
                    var contact_no = business[i].contact_no;
                    var name = business[i].name;
                    var location = business[i].location;
                    var state = business[i].state;
                    var category = business[i].category;
                    var latitude = business[i].latitude;
                    var longitude = business[i].longitude;


                    var checkPhone = await User.find({ contact_no: contact_no, "account_info.type": "business" }).count().exec();
                    // console.log(checkPhone.name)
                    if (checkPhone == 0) {
                        // console.log("Workings")
                        var firstPart = (Math.random() * 46656) | 0;
                        var secondPart = (Math.random() * 46656) | 0;
                        firstPart = ("000" + firstPart.toString(36)).slice(-3);
                        secondPart = ("000" + secondPart.toString(36)).slice(-3);
                        referral_code = firstPart.toUpperCase() + secondPart.toUpperCase();


                        var otp = Math.floor(Math.random() * 90000) + 10000;

                        username = shortid.generate();

                        socialite = {};
                        optional_info = {};

                        var address = location;

                        var country = await Country.findOne({ timezone: { $in: req.headers['tz'] } }).exec();

                        var rand = Math.ceil((Math.random() * 100000) + 1);
                        name = name;
                        name = _.startCase(_.toLower(name));



                        address = {
                            country: country.countryName,
                            timezone: req.headers['tz'],
                            location: location,
                            address: address,
                            state: state,
                            city: "",
                            zip: "",
                            area: "",
                            landmark: "",
                        };

                        // bank_details = {
                        //     ifsc: req.body.ifsc,
                        //     account_no: req.body.account_no,
                        //     account_holder: req.body.account_holder
                        // };

                        account_info = {
                            type: "business",
                            status: "Complete",
                            added_by: null,
                            phone_verified: false,
                            verified_account: false,
                            approved_by_admin: false,
                        };

                        geometry = [0, 0];
                        if (longitude && latitude) {
                            geometry = [longitude, latitude];
                        }
                        device = [];
                        otp = otp;

                        business_info = {
                            company_name: name,
                            business_category: req.body.business_category,
                            business_category: category,
                            company: business[i].company,
                            category: category,
                            // account_no: req.body.account_no,
                            // gst_registration_type: req.body.gst_registration_type,
                            // gstin: req.body.gstin,
                            is_claimed: true,
                            // tax_registration_no: req.body.tax_registration_no,
                            // pan_no: req.body.pan_no
                        };

                        var started_at = null;
                        if (req.body.started_at) {
                            started_at = new Date(req.body.started_at).toISOString()
                        }

                        var expired_at = null;
                        if (req.body.expired_at) {
                            expired_at = new Date(req.body.expired_at).toISOString()
                        }

                        uuid = uuidv1();

                        // partner = {
                        //     partner: req.body.carEager_partner,
                        //     commission: req.body.partner_commision,
                        //     package_discount: req.body.package_discount,
                        //     started_at: started_at,
                        //     expired_at: expired_at,
                        // };
                        var data = {
                            contact_no: contact_no,
                            name: name,
                            referral_code,
                            otp: otp,
                            username: username,
                            socialite: socialite,
                            optional_info: optional_info,
                            address: address,
                            account_info: account_info,
                            business_info: business_info,
                            uuid: uuid,
                            created_at: new Date()
                        }

                        await User.create(data).then(async function (user) {
                            var days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                            for (var i = 0; i < 7; i++) {
                                var timing = new BusinessTiming({
                                    business: user._id,
                                    day: days[i],
                                    open: '09:30 AM',
                                    close: '06:30 PM',
                                    is_closed: false,
                                    created_at: new Date(),
                                    updated_at: new Date(),
                                });
                                timing.save();
                                // fun.planAddBusiness(contact_no);
                            }

                            // Type.find({}).then(function (BT){
                            //     BT.forEach(function (u) {
                            //         var businessType = new BusinessType({
                            //             business: user._id,
                            //             business_type: u._id,
                            //             is_added: false,
                            //         });
                            //         businessType.save();
                            //     });
                            // });

                            await Management.create({
                                business: user._id,
                                user: user._id,
                                role: "Admin",
                                created_at: new Date(),
                                updated_at: new Date(),
                            });
                            // console.log("fgfgfgfgfgfg")
                            await Address.create({
                                user: user._id,
                                address: location,
                                // area: req.body.area,
                                // landmark: req.body.landmark,
                                // zip: req.body.zip,
                                // city: req.body.city,
                                state: state,
                                created_at: new Date(),
                                updated_at: new Date()
                            });
                            // console.log("baffff")

                            //ABHINAV PLAN ADD
                            // // for (var i = 0; i < business.length; i++) {
                            // console.log("Business NO To Create Plans")
                            // var business = await User.findOne({ contact_no: contact_no, "account_info.type": "business" }).exec();
                            // console.log(business)
                            // if (business) {

                            var req_plans = ['5fa43c304326ce585804f0cb'];
                            var exists = await SuitePlan.find({ _id: { $in: req_plans } }).count().exec();
                            // console.log("req_plans.length    length " + exists)
                            // console.log(exists, "   Comapre  ", req_plans.length)
                            if (exists == req_plans.length) {
                                var plans = await BusinessPlan.find({ business: user._id, suite: { $in: req_plans } }).count().exec();
                                // console.log("Exists pals of business" + plans)
                                if (plans == 0) {
                                    await SuitePlan.find({ _id: { $in: req_plans } })
                                        .cursor().eachAsync(async (plan) => {
                                            if (plan) {
                                                // console.log("Plans detail" + plan, business._id)
                                                var expired_at = new Date();
                                                expired_at.setDate(expired_at.getDate() + plan.validity);
                                                BusinessPlan.create({
                                                    suite: plan._id,
                                                    plan: plan.plan,
                                                    name: plan.name,
                                                    short_name: plan.short_name,
                                                    price: plan.price,
                                                    default: plan.default,
                                                    main: plan.main,
                                                    limits: plan.limits,
                                                    category: plan.category,
                                                    validity: plan.validity,
                                                    expired_at: expired_at,
                                                    created_at: new Date(),
                                                    updated_at: new Date(),
                                                    business: user._id
                                                });
                                            }
                                        });

                                    // res.status(200).json({
                                    //     responseCode: 200,
                                    //     responseMessage: "Suite plans has been added.",
                                    //     responseData: {}
                                    // });
                                    // console.log("Suite plans has been added.")
                                }
                                else {
                                    // res.status(400).json({
                                    //     responseCode: 400,
                                    //     responseMessage: "Some Plans already active.",
                                    //     responseData: {}
                                    // });
                                    // console.log("Some Plans already active.")
                                }
                            }
                            else {
                                //     // res.status(422).json({
                                //     //     responseCode: 422,
                                //     //     responseMessage: "Please check plan before save.",
                                //     //     responseData: {}
                                //     // });
                                // console.log("Please check plan before save")
                            }       // 
                            // }
                            // else {
                            //     // res.status(400).json({
                            //     //     responseCode: 400,
                            //     //     responseMessage: "Business not found",
                            //     //     responseData: {}
                            //     // });
                            // console.log("Business not found")
                            // }

                            //     ABHINAV


                            // res.status(200).json({
                            //     responseCode: 200,
                            //     responseMessage: "success",
                            //     responseData: {
                            //         user: user
                            //     },
                            // });
                            // console.log("Sucess Created Business ")
                        });
                        //For

                        // }

                    }
                    else {
                        // res.status(400).json({
                        //     responseCode: 400,
                        //     responseMessage: "Phone number already in use.",
                        //     responseData: {},
                        // });
                        // console.log("Contact Already in use")
                    }


                }

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Successfully Import",
                    responseData: {}
                });
            }

        });
    });
});
//v2.1
router.post('signUp/business/registration', xAccessToken.token, async function (req, res, next) {
    var checkPhone = await User.find({ contact_no: req.body.contact_no, "account_info.type": "business" }).count().exec();
    // console.log("req.body.contact_no= ", req.body.contact_no)
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

        req.body.address = {
            country: country.countryName,
            timezone: req.headers['tz'],
            location: req.body.location,
            address: address,
            state: req.body.state,
            city: req.body.city,
            zip: req.body.zip,
            area: req.body.area,
            landmark: req.body.landmark,
        };

        req.body.bank_details = {
            ifsc: req.body.ifsc,
            account_no: req.body.account_no,
            account_holder: req.body.account_holder
        };

        req.body.account_info = {
            type: "business",
            status: "Complete",
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

        req.body.business_info = {
            company_name: req.body.name,
            // business_category:req.body.business_category,
            category: req.body.category,
            company: req.body.company,
            account_no: req.body.account_no,
            gst_registration_type: req.body.gst_registration_type,
            gstin: req.body.gstin,
            is_claimed: true,
            tax_registration_no: req.body.tax_registration_no,
            pan_no: req.body.pan_no
        };
        // console.log("category: req.body.category,", req.body.category)
        // console.log("company_name", req.body.name)
        var started_at = null;
        if (req.body.started_at) {
            started_at = new Date(req.body.started_at).toISOString()
        }

        var expired_at = null;
        if (req.body.expired_at) {
            expired_at = new Date(req.body.expired_at).toISOString()
        }

        req.body.uuid = uuidv1();

        req.body.partner = {
            partner: req.body.carEager_partner,
            commission: req.body.partner_commision,
            package_discount: req.body.package_discount,
            started_at: started_at,
            expired_at: expired_at,
        };

        User.create(req.body).then(async function (user) {
            var days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

            for (var i = 0; i < 7; i++) {
                var timing = new BusinessTiming({
                    business: user._id,
                    day: days[i],
                    open: '09:30 AM',
                    close: '06:30 PM',
                    is_closed: false,
                    created_at: new Date(),
                    updated_at: new Date(),
                });
                timing.save();
            }

            // Type.find({}).then(function (BT){
            //     BT.forEach(function (u) {
            //         var businessType = new BusinessType({
            //             business: user._id,
            //             business_type: u._id,
            //             is_added: false,
            //         });
            //         businessType.save();
            //     });
            // });

            Management.create({
                business: user._id,
                user: user._id,
                role: "Admin",
                created_at: new Date(),
                updated_at: new Date(),
            });

            Address.create({
                user: user._id,
                address: address,
                area: req.body.area,
                landmark: req.body.landmark,
                zip: req.body.zip,
                city: req.body.city,
                state: req.body.state,
                created_at: new Date(),
                updated_at: new Date()
            });

            //ABHINAV PLAN ADD
            // // for (var i = 0; i < business.length; i++) {
            // console.log("Business NO To Create Plans")
            // var business = await User.findOne({ contact_no: contact_no, "account_info.type": "business" }).exec();
            // console.log(business)
            // if (business) {

            var req_plans = ['5fa43c304326ce585804f0cb'];                //Free Plan id to be used
            var exists = await SuitePlan.find({ _id: { $in: req_plans } }).count().exec();
            // console.log("req_plans.length    length " + exists)
            // console.log(exists, "   Comapre  ", req_plans.length)
            if (exists == req_plans.length) {
                var plans = await BusinessPlan.find({ business: user._id, suite: { $in: req_plans } }).count().exec();
                // console.log("Exists pals of business" + plans)
                if (plans == 0) {
                    await SuitePlan.find({ _id: { $in: req_plans } })
                        .cursor().eachAsync(async (plan) => {
                            if (plan) {
                                // console.log("Plans detail" + plan, business._id)
                                var expired_at = new Date();
                                expired_at.setDate(expired_at.getDate() + plan.validity);
                                BusinessPlan.create({
                                    suite: plan._id,
                                    plan: plan.plan,
                                    name: plan.name,
                                    short_name: plan.short_name,
                                    price: plan.price,
                                    default: plan.default,
                                    main: plan.main,
                                    limits: plan.limits,
                                    category: plan.category,
                                    validity: plan.validity,
                                    expired_at: expired_at,
                                    created_at: new Date(),
                                    updated_at: new Date(),
                                    business: user._id
                                });
                            }
                        });

                    // res.status(200).json({
                    //     responseCode: 200,
                    //     responseMessage: "Suite plans has been added.",
                    //     responseData: {}
                    // });
                    // console.log("Suite plans has been added.")
                }
                else {
                    // res.status(400).json({
                    //     responseCode: 400,
                    //     responseMessage: "Some Plans already active.",
                    //     responseData: {}
                    // });
                    // console.log("Some Plans already active.")
                }
            }
            else {
                //     // res.status(422).json({
                //     //     responseCode: 422,
                //     //     responseMessage: "Please check plan before save.",
                //     //     responseData: {}
                //     // });
                // console.log("Please check plan before save")
            }       // 
            // }
            // else {
            //     // res.status(400).json({
            //     //     responseCode: 400,
            //     //     responseMessage: "Business not found",
            //     //     responseData: {}
            //     // });
            // console.log("Business not found")
            // }

            res.status(200).json({
                responseCode: 200,
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
//Sprint 6
router.put('/business-plan/update', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var loggedInDetails = await User.findById(decoded.user).exec();

    var plan_no = Math.round(+new Date() / 1000) + Math.round((Math.random() * 9999) + 10)
    var business = await User.findById(req.body.user).exec();
    // console.log("Business Id " + req.body.user + "  ==--== " + req.body.plans)
    // console.log(business)
    if (business) {
        var req_plans = req.body.plans;
        // console.log("Req Plan ", req_plans)
        var exists = await SuitePlan.find({ _id: req_plans }).count().exec();
        // console.log(exists, "   Comapre  ", req_plans.length)
        // if (exists == req_plans.length) {
        if (exists) {
            var plans = await BusinessPlan.find({ business: req.body.user }).count().exec();
            // var suite_old = plans[0].suite;
            // return // console.log("OLD SUIT ID " + suite_old)
            var plans_details = await BusinessPlan.findOne({ business: req.body.user }).exec();
            // return res.json({ responseData: plans.name })
            let businessPlanPre = await BusinessPlan.findOne({ business }).exec()
            // console.log("---" + businessPlanPre.price);
            // console.log("Count = " + plans)
            if (plans != 0) {
                await SuitePlan.find({ _id: req_plans })
                    .cursor().eachAsync(async (plan) => {
                        if (plan) {
                            // console.log(plan.validity + " 5da6dd1f12203c04165caf0a Plan " + new Date() + ", found - " + plan.plan)
                            var expired_at = new Date();
                            expired_at.setDate(expired_at.getDate() + plan.validity);
                            // console.log(expired_at)
                            // console.log("Inside Update= " + req.body.user + " -- " + plan.plan + " -- " + plan.price + " - " + plan.category)
                            BusinessPlan.findOneAndUpdate({ business: req.body.user },
                                {
                                    $set:
                                    {
                                        // suite: plan._id,
                                        plan_no: plan_no,
                                        suite: req_plans,
                                        plan: plan.plan,
                                        name: plan.name,
                                        short_name: plan.short_name,
                                        price: plan.price,
                                        default: plan.default,
                                        main: plan.main,
                                        limits: plan.limits,
                                        category: plan.category,
                                        validity: plan.validity,
                                        status: "Renewal",
                                        "payment.paid_total": req.body.paid,
                                        "payment.due": plan.price - req.body.paid,
                                        "payment.total": plan.price,
                                        "payment.price": plan.price,
                                        "payment.payment_status": "Success",
                                        // "payment.order_id": order_id,
                                        "due.due": plan.price - req.body.paid,
                                        created_at: new Date(),
                                        updated_at: new Date(),
                                        expired_at: expired_at,
                                        sold_by: loggedInDetails.name,
                                        business: business._id
                                    }
                                }).exec();

                            event.changePlan(plan.name, plan.plan, business.email, business);



                            await event.changePlanAdmin(plan.name, plan.plan, plan.price, req.body.paid, business.email, business.address.city, business.contact_no, business.name, business.business_info.category, req.body.payment_mode, businessPlanPre.plan, business.optional_info.reg_by, businessPlanPre.price);

                            // console.log("__________@@" + business.business_info.category);
                            await whatsAppEvent.changePlan(plan.name, plan.plan, business.contact_no);
                            //ABhinav Logs
                            // TransactionLog.updateMany({ source: suite_old })


                            TransactionLog.create({
                                user: plan.user,
                                activity: "Business-Plan",
                                status: "Renewal",
                                received_by: loggedInDetails.name,
                                // source: plan._id,
                                // source: plan[0]._id,
                                source: req.body.user,
                                // source: order_id,
                                business: req.body.user,
                                paid_by: req.body.paid_by,
                                paid_total: req.body.paid,
                                total: plan.price,
                                payment_mode: req.body.payment_mode,
                                payment_status: "Success",
                                order_id: null,
                                transaction_id: req.body.transaction_id,
                                transaction_date: new Date(),
                                transaction_status: "Success",
                                transaction_response: "Success",
                                plan_no: plan_no,
                                created_at: new Date(),
                                updated_at: new Date(),

                            }).then(async function (transaction) {

                                // var claim = false;
                                // if (booking.insurance_info) {
                                //     if (booking.insurance_info.claim == true) {
                                //         claim = true
                                //     }
                                // }

                                var transactions = await TransactionLog.find({ source: plan._id, payment_status: { $ne: "Failure" } }).exec();
                                // var transactions = await TransactionLog.find({ source: plan[0]._id, payment_status: { $ne: "Failure" } }).exec();
                                // var transactions = await TransactionLog.find({ source: req.body.business, payment_status: { $ne: "Failure" } }).exec();

                                // var insurance_log = _.filter(transactions, paid_by => paid_by.paid_by == "Insurance");
                                // var insurance_payment = parseFloat(_.sumBy(insurance_log, x => x.paid_total));

                                var customer_log = _.filter(transactions, paid_by => paid_by.paid_by != "Insurance");
                                var customer_payment = parseInt(_.sumBy(customer_log, x => x.paid_total));
                                // console.log("Paid Total+ " + customer_payment)
                                var paid_total = customer_payment;
                                // var customer_payment = req.body.amount;


                                // var insurance_invoice = await Invoice.findOne({ booking: booking._id, invoice_type: "Insurance", status: "Active" }).exec();

                                // if (insurance_invoice) {
                                //     var bookingService = insurance_invoice.services;
                                //     var discount_total = 0;
                                //     var policy_clause = 0;
                                //     var salvage = 0;
                                //     var pick_up_charges = 0;
                                //     var careager_cash = 0;

                                //     var due_amount = _.sumBy(bookingService, x => x.labour_cost) + _.sumBy(bookingService, x => x.part_cost) + _.sumBy(bookingService, x => x.of_cost) + policy_clause + salvage + pick_up_charges - (insurance_payment + careager_cash);


                                //     Invoice.findOneAndUpdate({ _id: insurance_invoice._id }, { $set: { "due.due": due_amount, "payment.paid_total": insurance_payment } }, { new: false }, async function (err, doc) {
                                //         if (err) {
                                //             return res.status(422).json({
                                //                 responseCode: 422,
                                //                 responseMessage: "Server Error",
                                //                 responseData: err
                                //             });
                                //         }
                                //     });
                                // }

                                // var customer_invoice = await Invoice.findOne({ booking: booking._id, invoice_type: "Booking", status: "Active" }).exec();

                                // if (customer_invoice) {
                                // console.log(customer_invoice._id)
                                //     var bookingService = customer_invoice.services;

                                //     var policy_clause = customer_invoice.payment.policy_clause;

                                //     var salvage = customer_invoice.payment.salvage;

                                //     var pick_up_charges = customer_invoice.payment.pick_up_charges;

                                //     var careager_cash = await q.all(fun.getBookingCarEagerCash(booking._id));

                                //     var due_amount = _.sumBy(bookingService, x => x.labour_cost) + _.sumBy(bookingService, x => x.part_cost) + _.sumBy(bookingService, x => x.of_cost) + policy_clause + salvage + pick_up_charges - (customer_payment + careager_cash);


                                //     Invoice.findOneAndUpdate({ _id: customer_invoice._id }, { $set: { "due.due": due_amount, "payment.paid_total": customer_payment } }, { new: false }, async function (err, doc) {
                                //         if (err) {
                                //             return res.status(422).json({
                                //                 responseCode: 422,
                                //                 responseMessage: "Server Error",
                                //                 responseData: err
                                //             });
                                //         }
                                //     });
                                // }


                                // var bookingService = booking.services;
                                // var policy_clause = booking.payment.policy_clause;

                                // var salvage = booking.payment.salvage;

                                // var pick_up_charges = booking.payment.pick_up_charges;

                                // var careager_cash = await q.all(fun.getBookingCarEagerCash(booking._id));

                                // var due_amount = _.sumBy(bookingService, x => x.labour_cost) + _.sumBy(bookingService, x => x.part_cost) + _.sumBy(bookingService, x => x.of_cost) + policy_clause + salvage + pick_up_charges - (customer_payment + insurance_payment + careager_cash);
                                var status = "";
                                // var due_amount = plan.price - paid_total;

                                // console.log("Input Ammount  " + req.body.paid)
                                var due_amount = parseInt(plan.price) - parseInt(req.body.paid)
                                if (due_amount == 0) {
                                    status = "Success"
                                }
                                else {
                                    status = "Pending";

                                }
                                // console.log("Due - " + due_amount + " = price =" + plans_details.price + " = paid =" + paid_total)
                                BusinessPlan.findOneAndUpdate({ business: req.body.user }, {
                                    $set: {
                                        // "payment.paid_total": paid_total,
                                        "payment.paid_total": req.body.paid,
                                        "payment.due": due_amount,
                                        "payment.total": plan.price,
                                        "payment.price": plan.price,
                                        "payment.payment_status": status,
                                        "due.due": due_amount,
                                        "payment.payment_mode": req.body.payment_mode,
                                        updated_at: new Date()
                                    }
                                },
                                    { new: true }, async function (err, doc) {
                                        if (err) {
                                            // res.status(422).json({
                                            //     responseCode: 422,
                                            //     responseMessage: "Server Error",
                                            //     responseData: err
                                            // });
                                            // console.log("Server Error")
                                        }
                                        else {
                                            var activity = {
                                                // user: loggedInDetails._id,
                                                // name: loggedInDetails.name,
                                                stage: "Payment",
                                                activity: "Payment Recieved " + req.body.amount,
                                            };

                                            // fun.SubscriptionLog(plan._id, activity);

                                            // var updated = await BusinessPlan.findById(plan[0]._id).exec();
                                            // res.status(200).json({
                                            //     responseCode: 200,
                                            //     responseMessage: "",
                                            //     responseData: updated
                                            // });
                                            // console.log("")
                                        }
                                    });
                            });
                        }
                        else {
                            // res.status(400).json({
                            //     responseCode: 400,
                            //     responseMessage: "plan not found",
                            //     responseData: {}
                            // });
                            //ABHINAV Log
                            // console.log("Updated==")
                        }
                    });

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Suite plans has been Updated.",
                    responseData: plan_no
                });
            }
            else {
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "No Plans Exists.",
                    responseData: {}
                });
            }
        }
        else {
            res.status(422).json({
                responseCode: 422,
                responseMessage: "Please check plan before save.",
                responseData: {}
            });
        }
    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Business not found",
            responseData: {}
        });
    }
});
router.post('/business-plan/payment/get', async function (req, res, next) { //, xAccessToken.token
    var business = await User.findById(req.body.business).exec();
    // console.log("Business Id " + req.body.business)
    // console.log(business)
    if (business) {
        // var req_plans = req.body.plans;
        // console.log("Req Plan ", req_plans)
        // var exists = await SuitePlan.find({ _id: req_plans }).count().exec();
        // console.log(exists, "   Comapre  ", req_plans.length)
        // if (exists == req_plans.length) {
        var payment = {}
        var plans = await BusinessPlan.find({ business: req.body.business }).count().exec();
        if (plans) {
            await BusinessPlan.find({ business: req.body.business })
                .cursor().eachAsync(async (plan) => {
                    if (plan) {
                        payment = {
                            business: plan.business,
                            payment_mode: plan.payment.payment_mode,
                            payment_status: plan.payment.payment_status,
                            total: plan.payment.total,
                            terms: plan.payment.terms,
                            discount: plan.payment.discount,
                            discount_total: plan.payment.discount_total,
                            price: plan.payment.price,
                            paid_total: plan.payment.paid_total,
                            due: plan.payment.due,
                            transaction_id: plan.payment.transaction_id,
                            transaction_date: plan.payment.transaction_date,
                            transaction_status: plan.payment.transaction_status,
                            transaction_response: plan.payment.transaction_response,
                            _id: plan.payment._id,
                            plan_name: plan.name,
                            plan_category: plan.plan,
                            plan_no: plan.plan_no
                        }
                        // console.log(plan.validity + " 5da6dd1f12203c04165caf0a Plan " + new Date() + ", found - " + plan.plan)
                        // var expired_at = new Date();
                        // expired_at.setDate(expired_at.getDate() + plan.validity);
                        // console.log(expired_at)
                        // console.log("Inside Update= " + req.body.user)
                        // BusinessPlan.findOneAndUpdate({ business: req.body.user },
                        //     {
                        //         $set:
                        //         {
                        //             // suite: plan._id,
                        //             suite: req_plans,
                        //             plan: plan.plan,
                        //             name: plan.name,
                        //             short_name: plan.short_name,
                        //             price: plan.price,
                        //             default: plan.default,
                        //             main: plan.main,
                        //             limits: plan.limits,
                        //             category: plan.category,
                        //             validity: plan.validity,
                        //             created_at: new Date(),
                        //             updated_at: new Date(),
                        //             expired_at: expired_at,
                        //             business: business._id
                        //         }
                        //     }).exec();
                        // console.log("Payment Details")
                    }
                });

            res.status(200).json({
                responseCode: 200,
                responseMessage: "Payments Details",
                responseData: payment
            });
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "No Plans Exists.",
                responseData: {}
            });
        }
    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Business not found",
            responseData: {}
        });
    }
});
//Payments Business Plan
router.post('/subscription/payment/receive', xAccessToken.token, async function (req, res, next) {//
    var rules = {
        business: "required",
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Business Field is mandatory",
            responseData: {
                res: validation.errors.all()
            }
        })
    }
    else {
        // var business = req.headers['business'];
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var data = [];
        // var loggedInDetails = await User.findById(business).exec();
        // var suite = await SuitePlan.find({ _id: req_plans }).exec();
        var loggedInDetails = await User.findById(decoded.user).exec();
        var plan = await BusinessPlan.find({ business: req.body.business }).exec();
        // return res.json(plan.length)
        // console.log("Plan Id = " + plan[0].suite)
        // return res.json({ responseData: plan })
        if (plan.length != 0) {
            // console.log("ID= " + plan[0]._id + "" + "" + "" + req.body.date + " == " + req.body.transaction_id + " -- " + req.body.paid_by + " -- " + req.body.amount + " -- " + req.body.payment_mode)
            TransactionLog.create({
                user: plan[0].user,
                activity: "Business-Plan",
                // source: plan[0].suite,
                received_by: loggedInDetails.name,
                status: "Dues",
                // source: plan[0]._id,
                plan_no: plan[0].plan_no,
                // plan_no: Math.round(+new Date() / 1000) + Math.round((Math.random() * 9999) + 10),
                business: req.body.business,
                source: req.body.business,
                paid_by: req.body.paid_by,
                paid_total: req.body.amount,
                total: plan[0].payment.total,
                payment_mode: req.body.payment_mode,
                payment_status: "Success",
                order_id: null,
                transaction_id: req.body.transaction_id,
                // transaction_date: new Date(req.body.date).toISOString(),
                transaction_date: new Date(),
                transaction_status: "Success",
                transaction_response: "Success",
                created_at: plan[0].updated_at,
                updated_at: plan[0].updated_at,
            }).then(async function (transaction) {

                // var claim = false;
                // if (booking.insurance_info) {
                //     if (booking.insurance_info.claim == true) {
                //         claim = true
                //     }
                // }

                // var transactions = await TransactionLog.find({ source: plan[0].suite, payment_status: { $ne: "Failure" } }).exec();
                // var transactions = await TransactionLog.find({ source: plan[0]._id, payment_status: { $ne: "Failure" } }).exec();
                var transactions = await TransactionLog.find({ source: req.body.business, payment_status: { $ne: "Failure" } }).exec();

                // var insurance_log = _.filter(transactions, paid_by => paid_by.paid_by == "Insurance");
                // var insurance_payment = parseFloat(_.sumBy(insurance_log, x => x.paid_total));

                var customer_log = _.filter(transactions, paid_by => paid_by.paid_by != "Insurance");
                var customer_payment = parseInt(_.sumBy(customer_log, x => x.paid_total));
                // console.log("Paid Total+ " + customer_payment)
                var paid_total = customer_payment;
                // var customer_payment = req.body.amount;


                // var insurance_invoice = await Invoice.findOne({ booking: booking._id, invoice_type: "Insurance", status: "Active" }).exec();

                // if (insurance_invoice) {
                //     var bookingService = insurance_invoice.services;
                //     var discount_total = 0;
                //     var policy_clause = 0;
                //     var salvage = 0;
                //     var pick_up_charges = 0;
                //     var careager_cash = 0;

                //     var due_amount = _.sumBy(bookingService, x => x.labour_cost) + _.sumBy(bookingService, x => x.part_cost) + _.sumBy(bookingService, x => x.of_cost) + policy_clause + salvage + pick_up_charges - (insurance_payment + careager_cash);


                //     Invoice.findOneAndUpdate({ _id: insurance_invoice._id }, { $set: { "due.due": due_amount, "payment.paid_total": insurance_payment } }, { new: false }, async function (err, doc) {
                //         if (err) {
                //             return res.status(422).json({
                //                 responseCode: 422,
                //                 responseMessage: "Server Error",
                //                 responseData: err
                //             });
                //         }
                //     });
                // }

                // var customer_invoice = await Invoice.findOne({ booking: booking._id, invoice_type: "Booking", status: "Active" }).exec();

                // if (customer_invoice) {
                // console.log(customer_invoice._id)
                //     var bookingService = customer_invoice.services;

                //     var policy_clause = customer_invoice.payment.policy_clause;

                //     var salvage = customer_invoice.payment.salvage;

                //     var pick_up_charges = customer_invoice.payment.pick_up_charges;

                //     var careager_cash = await q.all(fun.getBookingCarEagerCash(booking._id));

                //     var due_amount = _.sumBy(bookingService, x => x.labour_cost) + _.sumBy(bookingService, x => x.part_cost) + _.sumBy(bookingService, x => x.of_cost) + policy_clause + salvage + pick_up_charges - (customer_payment + careager_cash);


                //     Invoice.findOneAndUpdate({ _id: customer_invoice._id }, { $set: { "due.due": due_amount, "payment.paid_total": customer_payment } }, { new: false }, async function (err, doc) {
                //         if (err) {
                //             return res.status(422).json({
                //                 responseCode: 422,
                //                 responseMessage: "Server Error",
                //                 responseData: err
                //             });
                //         }
                //     });
                // }


                // var bookingService = booking.services;
                // var policy_clause = booking.payment.policy_clause;

                // var salvage = booking.payment.salvage;

                // var pick_up_charges = booking.payment.pick_up_charges;

                // var careager_cash = await q.all(fun.getBookingCarEagerCash(booking._id));

                // var due_amount = _.sumBy(bookingService, x => x.labour_cost) + _.sumBy(bookingService, x => x.part_cost) + _.sumBy(bookingService, x => x.of_cost) + policy_clause + salvage + pick_up_charges - (customer_payment + insurance_payment + careager_cash);
                var status = "";
                // var due_amount = plan[0].price - paid_total;
                // var due_amount = plan[0].due.due - req.body.amount;
                var due_amount = plan[0].payment.due - req.body.amount;
                if (due_amount == 0) {
                    status = "Success"
                }
                else {
                    status = "Pending";

                }
                // console.log("Due - " + due_amount + " = price =" + plan[0].price + " = paid =" + paid_total)
                BusinessPlan.findOneAndUpdate({ _id: plan[0]._id }, {
                    $set: {
                        "payment.paid_total": plan[0].price - due_amount,
                        "payment.due": due_amount,
                        "payment.total": plan[0].price,
                        "payment.price": plan[0].price,
                        "payment.payment_status": status,
                        "due.due": due_amount,
                        updated_at: new Date()
                    }
                },
                    { new: true }, async function (err, doc) {
                        if (err) {
                            res.status(422).json({
                                responseCode: 422,
                                responseMessage: "Server Error",
                                responseData: err
                            });
                        }
                        else {
                            var activity = {
                                // user: loggedInDetails._id,
                                // name: loggedInDetails.name,
                                stage: "Payment",
                                activity: "Payment Recieved " + req.body.amount,
                            };

                            // fun.SubscriptionLog(plan._id, activity);

                            var updated = await BusinessPlan.findById(plan[0]._id).exec();
                            res.status(200).json({
                                responseCode: 200,
                                responseMessage: "",
                                responseData: updated
                            });
                        }
                    });
            });
        }
        else {

            // await SuitePlan.find({ _id: req_plans })
            // .cursor().eachAsync(async (plan) => {
            //     if (plan) {

            TransactionLog.create({
                user: req.body.business,
                activity: "Business-Plan",
                // source: plan[0].suite,
                // source: plan[0]._id,
                received_by: req.body.received_by,
                plan_no: plan[0].plan_no,
                business: req.body.business,
                source: req.body.business,
                paid_by: req.body.paid_by,
                paid_total: req.body.amount,
                total: plan[0].payment.total,
                payment_mode: req.body.payment_mode,
                payment_status: "Success",
                order_id: null,
                transaction_id: req.body.transaction_id,
                transaction_date: new Date(req.body.date).toISOString(),
                transaction_status: "Success",
                transaction_response: "Success",
                created_at: plan[0].updated_at,
                updated_at: plan[0].updated_at,
            }).then(async function (transaction) {

                // var claim = false;
                // if (booking.insurance_info) {
                //     if (booking.insurance_info.claim == true) {
                //         claim = true
                //     }
                // }

                // var transactions = await TransactionLog.find({ source: plan[0].suite, payment_status: { $ne: "Failure" } }).exec();
                // var transactions = await TransactionLog.find({ source: plan[0]._id, payment_status: { $ne: "Failure" } }).exec();
                var transactions = await TransactionLog.find({ source: req.body.business, payment_status: { $ne: "Failure" } }).exec();

                // var insurance_log = _.filter(transactions, paid_by => paid_by.paid_by == "Insurance");
                // var insurance_payment = parseFloat(_.sumBy(insurance_log, x => x.paid_total));

                var customer_log = _.filter(transactions, paid_by => paid_by.paid_by != "Insurance");
                var customer_payment = parseInt(_.sumBy(customer_log, x => x.paid_total));
                // console.log("Paid Total+ " + customer_payment)
                var paid_total = customer_payment;
                // var customer_payment = req.body.amount;


                // var insurance_invoice = await Invoice.findOne({ booking: booking._id, invoice_type: "Insurance", status: "Active" }).exec();

                // if (insurance_invoice) {
                //     var bookingService = insurance_invoice.services;
                //     var discount_total = 0;
                //     var policy_clause = 0;
                //     var salvage = 0;
                //     var pick_up_charges = 0;
                //     var careager_cash = 0;

                //     var due_amount = _.sumBy(bookingService, x => x.labour_cost) + _.sumBy(bookingService, x => x.part_cost) + _.sumBy(bookingService, x => x.of_cost) + policy_clause + salvage + pick_up_charges - (insurance_payment + careager_cash);


                //     Invoice.findOneAndUpdate({ _id: insurance_invoice._id }, { $set: { "due.due": due_amount, "payment.paid_total": insurance_payment } }, { new: false }, async function (err, doc) {
                //         if (err) {
                //             return res.status(422).json({
                //                 responseCode: 422,
                //                 responseMessage: "Server Error",
                //                 responseData: err
                //             });
                //         }
                //     });
                // }

                // var customer_invoice = await Invoice.findOne({ booking: booking._id, invoice_type: "Booking", status: "Active" }).exec();

                // if (customer_invoice) {
                // console.log(customer_invoice._id)
                //     var bookingService = customer_invoice.services;

                //     var policy_clause = customer_invoice.payment.policy_clause;

                //     var salvage = customer_invoice.payment.salvage;

                //     var pick_up_charges = customer_invoice.payment.pick_up_charges;

                //     var careager_cash = await q.all(fun.getBookingCarEagerCash(booking._id));

                //     var due_amount = _.sumBy(bookingService, x => x.labour_cost) + _.sumBy(bookingService, x => x.part_cost) + _.sumBy(bookingService, x => x.of_cost) + policy_clause + salvage + pick_up_charges - (customer_payment + careager_cash);


                //     Invoice.findOneAndUpdate({ _id: customer_invoice._id }, { $set: { "due.due": due_amount, "payment.paid_total": customer_payment } }, { new: false }, async function (err, doc) {
                //         if (err) {
                //             return res.status(422).json({
                //                 responseCode: 422,
                //                 responseMessage: "Server Error",
                //                 responseData: err
                //             });
                //         }
                //     });
                // }


                // var bookingService = booking.services;
                // var policy_clause = booking.payment.policy_clause;

                // var salvage = booking.payment.salvage;

                // var pick_up_charges = booking.payment.pick_up_charges;

                // var careager_cash = await q.all(fun.getBookingCarEagerCash(booking._id));

                // var due_amount = _.sumBy(bookingService, x => x.labour_cost) + _.sumBy(bookingService, x => x.part_cost) + _.sumBy(bookingService, x => x.of_cost) + policy_clause + salvage + pick_up_charges - (customer_payment + insurance_payment + careager_cash);
                var status = "";
                // var due_amount = plan[0].price - paid_total;
                var due_amount = plan[0].due.due - req.body.amount;
                if (due_amount == 0) {
                    status = "Success"
                }
                else {
                    status = "Pending";

                }
                // console.log("Due - " + due_amount + " = price =" + plan[0].price + " = paid =" + paid_total)
                BusinessPlan.findOneAndUpdate({ _id: plan[0]._id }, {
                    $set: {
                        "payment.paid_total": plan[0].price - due_amount,
                        "payment.due": due_amount,
                        "payment.total": plan[0].price,
                        "payment.price": plan[0].price,
                        "payment.payment_status": status,
                        "due.due": due_amount,
                        updated_at: new Date()
                    }
                },
                    { new: true }, async function (err, doc) {
                        if (err) {
                            res.status(422).json({
                                responseCode: 422,
                                responseMessage: "Server Error",
                                responseData: err
                            });
                        }
                        else {
                            var activity = {
                                // user: loggedInDetails._id,
                                // name: loggedInDetails.name,
                                stage: "Payment",
                                activity: "Payment Recieved " + req.body.amount,
                            };

                            // fun.SubscriptionLog(plan._id, activity);

                            var updated = await BusinessPlan.findById(plan[0]._id).exec();
                            res.status(200).json({
                                responseCode: 200,
                                responseMessage: "",
                                responseData: updated
                            });
                        }
                    });
            });
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Paymnet for new ",
                responseData: {}
            });
        }
    }
});
router.get('/job/payment/logs', xAccessToken.token, async function (req, res, next) {
    var business = req.headers['business'];
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    // console.log("Random No   " + Math.round(+new Date() / 1000) + Math.round((Math.random() * 9999) + 10),)
    // console.log("Plan Id = " + req.query.id)
    // console.log("business id  logs =  " + business)
    // var booking = await Booking.findById(req.query.booking).exec();
    var subs = await BusinessPlan.findOne({ business: req.query.id }).exec();
    // console.log("SUBAHMMM   =" + subs)
    // console.log("Transaction Log = " + subs.suite + " - - " + subs.plan_no)
    if (subs) {
        var logs = [];
        // await TransactionLog.find({ source: req.query.id, plan_no: subs.plan_no })
        await TransactionLog.find({ source: req.query.id })
            .sort({ updated_at: -1 })
            .cursor().eachAsync(async (log) => {
                logs.push({
                    _id: log._id,
                    id: log._id,
                    business: log.business,
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
                    plan_no: log.plan_no,
                    status: log.status,
                    received_by: log.received_by,
                    created_at: moment(log.created_at).tz(req.headers['tz']).format('lll'),
                    updated_at: moment(log.updated_at).tz(req.headers['tz']).format('lll'),
                });
            });
        res.status(200).json({
            responseCode: 200,
            responseMessage: "Transaction Log",
            responseData: logs
        });
    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Subscription not found",
            responseData: {}
        });
    }
});
router.get('/services/category/get', xAccessToken.token, async function (req, res, next) {
    var data = [];
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    // db.BookingCategory.updateMany({},{$set:{"model_file":"https://careager.s3.ap-south-1.amazonaws.com/Services(ALL)/Service/Model+Wise+Sample.xlsx","segments_file":"https://careager.s3.ap-south-1.amazonaws.com/Services(ALL)/Service/Segment+Wise+Sample.xlsx"}})
    await BookingCategory.find({})
        .sort({ position: 1 })
        .cursor().eachAsync(async (d) => {
            data.push({
                _id: d._id,
                id: d._id,
                tag: d.tag,
                position: d.position,
                icon: d.icon,
                title: d.title,
                image: d.image,
                video: d.video,
                home_visibility: d.home_visibility,
                id: d._id,
                nested: d.nested,
                enable: true,
                features: d.features,
                model_file: d.model_file,
                segments_file: d.segments_file,
            })
        });

    res.status(200).json({
        responseCode: 200,
        responseMessage: "",
        responseData: data
    })
});
router.get('/subsription/business/get', xAccessToken.token, async function (req, res, next) {
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

    var role = await Management.findOne({ user: req.query.id, business: req.query.id })
        .populate({ path: 'business', select: 'name avatar avatar_address contact_no isCarEager uuid business_info' })
        .populate({ path: 'user', select: 'name avatar avatar_address contact_no' })
        .exec();

    // if (role) {
    var def = [];
    var main = [];
    var multi = false;
    var type = "";

    var plans = await BusinessPlan.find({ business: req.query.id }).populate('suite').populate('business').exec();
    // return res.json({ plan: plans, len: plans.length })
    if (plans.length != 0) {
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
            business: plans[0].business,
            created_at: plans[0].created_at,
            sold_by: plans[0].sold_by,
            due: plans[0].due.due,
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
    } else {
        res.status(200).json({
            responseCode: 200,
            responseMessage: "No Plan Purchased",
            responseData: {}
        });
    }
    // }
    // else {
    //     res.status(400).json({
    //         responseCode: 400,
    //         responseMessage: "Unauthorized",
    //         responseData: {}
    //     });
    // }
});
router.put('/create/payment/stucture', async function (req, res, next) {
    var data = [];
    // var token = req.headers['x-access-token'];
    // var secret = config.secret;
    // var decoded = jwt.verify(token, secret);
    // var user = decoded.user;
    // db.BookingCategory.updateMany({},{$set:{"model_file":"https://careager.s3.ap-south-1.amazonaws.com/Services(ALL)/Service/Model+Wise+Sample.xlsx","segments_file":"https://careager.s3.ap-south-1.amazonaws.com/Services(ALL)/Service/Segment+Wise+Sample.xlsx"}})
    await BusinessPlan.find({})
        .sort({ position: 1 })
        .cursor().eachAsync(async (d) => {

            // await BusinessPlan.findByIdAndUpdate({})

            BusinessPlan.findOneAndUpdate({ _id: d._id }, {
                $set:
                {
                    payment: {
                        payment_mode: "",
                        payment_status: "Success",
                        total: d.price,
                        terms: "",
                        discount: 0,
                        discount_total: 0,
                        price: d.price,
                        paid_total: d.price,
                        due: 0,
                        transaction_id: "Manually",
                        transaction_date: "",
                        transaction_status: "",
                        transaction_response: "",
                        payment_log: [],

                    },
                    due: {
                        due: 0,
                        pay: d.price,
                    },
                    plan_no: Math.round(+new Date() / 1000) + Math.round((Math.random() * 9999) + 10),

                }

            }, { new: true }, function (err, doc) {

                // console.log("Created New payment Fileds")
            });

        });

    res.status(200).json({
        responseCode: 200,
        responseMessage: "Success",
        responseData: {}
    })
});
router.put('/create/businessId', async function (req, res, next) {
    var data = [];
    var count = 0;

    await User.find({
        "account_info.type": "business",
        visibility: true,
    })
        .sort({ position: 1 })
        .cursor().eachAsync(async (d) => {

            // await BusinessPlan.findByIdAndUpdate({})
            count = count + 1
            // console.log("count = " + count)
            // console.log("Name = " + d.name)
            await User.findOneAndUpdate({ _id: d._id }, {
                $set:
                {

                    business_info: {
                        business_id: count + 10000,
                    }

                }

            }, { new: true }, function (err, doc) {

                // console.log("Created New payment Fileds")
            });

        });

    res.status(200).json({
        responseCode: 200,
        responseMessage: "Success",
        responseData: {}
    })
});

//SUPER Admin new UI
router.get('/business-overview/gvm/get', /* xAccessToken.token,*/ async function (req, res, next) {
    var rules = {
        // from: 'required',
        // to: 'required'
        query: 'required'
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
        var date = new Date();
        // var business = req.headers['business'];
        var from = new Date()
        var to = new Date()
        var analytics = [];
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
            var query = 30;
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }

        // var from = new Date(req.query.from);
        // var to = new Date(req.query.to);

        // var startDate = moment(req.query.from);
        // var endDate = moment(req.query.to);
        var startDate = moment(from);
        var endDate = moment(to);
        var duration = endDate.diff(startDate, 'days', true);
        // console.log("Duration = " + duration)
        // console.log("Query = " + req.query.query + "\n from = " + from + "\n to = " + to + "\n startDate = " + startDate + "\n endDate = " + endDate)
        var count = 0
        var totalGMV = 0
        var totalRevenue = 0
        await Invoice.find({ status: "Active", updated_at: { $gte: from, $lte: to } })
            .cursor().eachAsync(async (invoice) => {
                var gmv = invoice.payment.total;
                count = count + 1
                totalGMV = totalGMV + invoice.payment.total
                // gmvAll.push(invoice.payment.total)
                // console.log(count + "====== " + invoice.payment.total)
                // var pick_up_charges = invoice.payment.pick_up_charges;
                // var policy_clause = invoice.payment.policy_clause;
                // var salvage = invoice.payment.salvage;

                // var labour_cost = _.sumBy(invoice.services, x => x.labour_cost);
                // var part_cost = _.sumBy(invoice.services, x => x.part_cost);
                // var of_cost = _.sumBy(invoice.services, x => x.of_cost) + pick_up_charges + policy_clause + salvage;


                // var month = moment(invoice.updated_at).tz(req.headers['tz']).format('MMMM YYYY');
                // if (duration <= 31) {
                //     month = moment(invoice.updated_at).tz(req.headers['tz']).format('MMM DD');
                // }
                var month = moment(invoice.updated_at).tz(req.headers['tz']).format('MMMM YYYY');
                // console.log("Month = " + month)
                if (duration <= 31) {
                    month = moment(invoice.updated_at).tz(req.headers['tz']).format('MMM DD');
                    // console.log("Month <31 = " + month)
                }


                analytics.push({
                    gmv: gmv,
                    sort: moment(invoice.updated_at).tz(req.headers['tz']).format('YYYY-MM-DD'),
                    month: month
                });


            });

        // await Invoice.find({ status: "Active", updated_at: { $gte: from, $lte: to } })
        //     .cursor().eachAsync(async (invoice) => {
        //         var gvm = invoice.payment.total;
        //         count = count + 1
        // console.log(count + "====== " + invoice.payment.total)
        //         // var pick_up_charges = invoice.payment.pick_up_charges;
        //         // var policy_clause = invoice.payment.policy_clause;
        //         // var salvage = invoice.payment.salvage;

        //         // var labour_cost = _.sumBy(invoice.services, x => x.labour_cost);
        //         // var part_cost = _.sumBy(invoice.services, x => x.part_cost);
        //         // var of_cost = _.sumBy(invoice.services, x => x.of_cost) + pick_up_charges + policy_clause + salvage;


        //         // var month = moment(invoice.updated_at).tz(req.headers['tz']).format('MMMM YYYY');
        //         // if (duration <= 31) {
        //         //     month = moment(invoice.updated_at).tz(req.headers['tz']).format('MMM DD');
        //         // }

        //         analytics.push({
        //             gvm: gvm
        //         });


        //     });
        count = 0
        await BusinessPlan.find({ updated_at: { $gte: from, $lte: to } })
            .cursor().eachAsync(async (plan) => {
                totalRevenue = totalRevenue + plan.price
                var month = moment(plan.updated_at).tz(req.headers['tz']).format('MMMM YYYY');
                // console.log("Month = " + month)
                if (duration <= 31) {
                    month = moment(plan.updated_at).tz(req.headers['tz']).format('MMM DD');
                    // console.log("Month <31 = " + month)
                }

                analytics.push({
                    revenue: plan.price,
                    sort: moment(plan.updated_at).tz(req.headers['tz']).format('YYYY-MM-DD'),
                    month: month,
                    updated_at: plan.updated_at

                });


            });
        // return res.json(analytics)
        analytics = _.orderBy(analytics, ['sort'], ['asc'])

        var data = _(analytics).groupBy('month').map((objs, key) => ({
            gmv: parseInt(_.sumBy(objs, 'gmv')),
            revenu: parseInt(_.sumBy(objs, 'revenue')),
            month: key,
            total: objs.length,

        })
        ).value();
        // console.log("Toatal = " + data.labour_cost)

        res.status(200).json({
            responseCode: 200,
            responseMessage: {
                totalGMV: parseFloat(totalGMV).toFixed(2),
                toalRevenue: parseFloat(totalRevenue).toFixed(2)
            },
            responseData: data
        });
    }
});
router.get('/business-overview/basic-counts/get', /* xAccessToken.token,*/ async function (req, res, next) {
    var rules = {
        query: 'required'
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
        var date = new Date();
        // var business = req.headers['business'];
        var from = new Date()
        var to = new Date()
        var analytics = [];
        if (parseInt(req.query.query) == 0) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
            var lastEndDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var lastStartDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query - query);
            // console.log("lastEndDate 11 ", lastEndDate)
            // console.log("lastStartDate 11 ", lastStartDate)
        }
        else if (parseInt(req.query.query) >= 1) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
            var lastEndDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query - 1);
            var lastStartDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query - query - 1);
            // console.log("Last month data end date = ", lastEndDate)
            // console.log("Last month data start = ", lastStartDate)
            // console.log("from this month data start = ", from)
            // console.log("to this month data start = ", to)
        }
        else {
            var query = 30;
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
            var lastEndDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var lastStartDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query - query);
            // console.log("lastEndDate 33 ", lastEndDate)
            // console.log("lastStartDate 33 ", lastStartDate)
        }

        // var from = new Date(req.query.from);
        // var to = new Date(req.query.to);

        // var startDate = moment(req.query.from);
        // var endDate = moment(req.query.to);
        var startDate = moment(from);
        var endDate = moment(to);
        var duration = endDate.diff(startDate, 'days', true);
        var count = 0
        var range = { $gte: from, $lte: to }
        var lastMonthRange = { $gte: lastStartDate, $lte: lastEndDate }
        var totalUsers = await User.find({ 'account_info.type': 'user', created_at: range }).count().exec();
        var totalBusiness = await User.find({ "account_info.type": "business", visibility: true, created_at: range }).count().exec();
        var NewBusiness = await User.find({ "account_info.status": "Complete", "account_info.type": "business", visibility: true, created_at: range }).count().exec();
        var ActiveBusiness = await User.find({ "account_info.status": "Active", "account_info.type": "business", visibility: true, created_at: range }).count().exec();
        var freeBusiness = await BusinessPlan.find({ plan: 'Free', created_at: range }).count().exec();
        var paidBusiness = await BusinessPlan.find({ plan: { $ne: 'Free' }, created_at: range }).count().exec();
        var totalWorkshops = await BusinessPlan.find({ category: "Workshop", created_at: range }).count().exec();
        var totalPartsDistributors = await BusinessPlan.find({ category: "Parts", created_at: range }).count().exec();
        var totalDealers = await BusinessPlan.find({ category: "Dealer", created_at: range }).count().exec();
        var totalUltimateAWS = await BusinessPlan.find({ category: "Workshop", plan: "Ultimate", created_at: range }).count().exec();
        var totalProAWS = await BusinessPlan.find({ category: "Workshop", plan: "Pro", created_at: range }).count().exec();
        var totalStandardAWS = await BusinessPlan.find({ category: "Workshop", plan: "Standard", created_at: range }).count().exec();
        var totalStarterAWS = await BusinessPlan.find({ category: "Workshop", plan: "Starter", created_at: range }).count().exec();
        var totalFreeAWS = await BusinessPlan.find({ category: "Workshop", plan: "Free", created_at: range }).count().exec();
        var totalFreeAPS = await BusinessPlan.find({ category: "Parts", plan: "Free", created_at: range }).count().exec();
        var totalStandardAPS = await BusinessPlan.find({ category: "Parts", plan: "Standard", created_at: range }).count().exec();
        var totalProAPS = await BusinessPlan.find({ category: "Parts", plan: "Pro", created_at: range }).count().exec();
        var totalPaidLastMonth = await BusinessPlan.find({ created_at: lastMonthRange, price: { $ne: 0 }, }).count().exec();
        var totalPaidThisMonth = await BusinessPlan.find({ created_at: range, price: { $ne: 0 }, }).count().exec();

        var data = {
            total_users: totalUsers,
            // freeBusiness: freeBusiness,
            // paidBusiness: paidBusiness,
            totalBusiness: totalBusiness,
            NewBusiness: NewBusiness,
            ActiveBusiness: ActiveBusiness,
            totalWorkshops: totalWorkshops,
            totalPartsDistributors: totalPartsDistributors,
            totalDealers: totalDealers,
            totalPaidLastMonth: totalPaidLastMonth,
            totalPaidThisMonth: totalPaidThisMonth,

            AWSplans: {
                Ultimate: totalUltimateAWS,
                Pro: totalProAWS,
                Standard: totalStandardAWS,
                Starter: totalStarterAWS,
                Free: totalFreeAWS
            },
            APSplans: {
                Free: totalFreeAPS,
                Standard: totalStandardAPS,
                Pro: totalProAPS
            }
        }
        res.status(200).json({
            responseCode: 200,
            responseMessage: "Basic Counts ",
            responseData: data
        });
    }
});
router.get('/business-overview/paidVSFree/get', /* xAccessToken.token,*/ async function (req, res, next) {
    var rules = {
        // from: 'required',
        // to: 'required'
        query: 'required'
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
        var date = new Date();
        // var business = req.headers['business'];
        var from = new Date()
        var to = new Date()
        var analytics = [];
        var free = [];
        var paid = [];
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
            var query = 30;
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }

        // var from = new Date(req.query.from);
        // var to = new Date(req.query.to);

        // var startDate = moment(req.query.from);
        // var endDate = moment(req.query.to);
        var startDate = moment(from);
        var endDate = moment(to);
        var duration = endDate.diff(startDate, 'days', true);
        // console.log("Duration = " + duration)
        // console.log("Query = " + req.query.query + "\n from = " + from + "\n to = " + to + "\n startDate = " + startDate + "\n endDate = " + endDate)
        var range = { $gte: from, $lte: to };
        var countFree = 0
        var countPaid = 0

        await BusinessPlan.find({ created_at: range })
            .cursor().eachAsync(async (plan) => {
                countFree = 0
                countPaid = 0
                var month = moment(plan.created_at).tz(req.headers['tz']).format('MMMM YYYY');
                // console.log("Month = " + month)
                if (duration <= 31) {
                    month = moment(plan.created_at).tz(req.headers['tz']).format('MMM DD');
                    // console.log("Month <31 = " + month)
                }
                if (plan.plan == "Free") {
                    free.push(1)
                    countFree = countFree + 1
                    analytics.push({
                        category: "Free",
                        sort: moment(plan.created_at).tz(req.headers['tz']).format('YYYY-MM-DD'),
                        month: month,
                        totalFree: countFree
                    });

                } else {
                    countPaid = countPaid + 1
                    paid.push(1)
                    analytics.push({
                        category: "Paid",
                        sort: moment(plan.created_at).tz(req.headers['tz']).format('YYYY-MM-DD'),
                        month: month,
                        totalPaid: countPaid
                    });
                }
            });

        //abhinav to get Free Business
        await User.find({ created_at: range })
            .cursor().eachAsync(async (plan) => {
                countFree = 0
                countPaid = 0
                var month = moment(plan.created_at).tz(req.headers['tz']).format('MMMM YYYY');
                // console.log("Month = " + month)
                if (duration <= 31) {
                    month = moment(plan.created_at).tz(req.headers['tz']).format('MMM DD');
                    // console.log("Month <31 = " + month)
                }
                if (plan.plan == "Free") {
                    // free.push(1)
                    // countFree = countFree + 1
                    // analytics.push({
                    //     category: "Free",
                    //     sort: moment(plan.created_at).tz(req.headers['tz']).format('YYYY-MM-DD'),
                    //     month: month,
                    //     totalFree: countFree
                    // });

                } else {
                    // countPaid = countPaid + 1
                    // paid.push(1)
                    // analytics.push({
                    //     category: "Paid",
                    //     sort: moment(plan.created_at).tz(req.headers['tz']).format('YYYY-MM-DD'),
                    //     month: month,
                    //     totalPaid: countPaid
                    // });
                }
            });
        //////////////
        // return res.json(analytics)
        analytics = _.orderBy(analytics, ['sort'], ['asc'])
        var data = _(analytics).groupBy('month').map((objs, key) => ({
            free: parseInt(_.sumBy(objs, 'totalFree')),
            paid: parseInt(_.sumBy(objs, 'totalPaid')),
            month: key,
            total: objs.length,
            // source: _(objs).groupBy(x => x.category).map((objs1, key1) => ({
            //     category: key1,
            //     total: objs1.length,
            // })),
        })
        ).value();
        // console.log("Toatal = " + data.labour_cost)

        res.status(200).json({
            responseCode: 200,
            responseMessage: {
                Totalpaid: paid.length,
                Totalfree: free.length
                // objs: parseInt(_.sumBy(data.totalFree)),
            },
            responseData: data
        });
    }
});
router.get('/business-overview/jobVSbookings/get', /* xAccessToken.token,*/ async function (req, res, next) {
    var rules = {
        // from: 'required',
        // to: 'required'
        query: 'required'
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
        var date = new Date();
        // var business = req.headers['business'];
        var from = new Date()
        var to = new Date()
        var analytics = [];
        var analyticsBooking = [];
        var bookingAll = [];
        var jobsAll = [];
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
            var query = 30;
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }

        // var from = new Date(req.query.from);
        // var to = new Date(req.query.to);

        // var startDate = moment(req.query.from);
        // var endDate = moment(req.query.to);
        var startDate = moment(from);
        var endDate = moment(to);
        var duration = endDate.diff(startDate, 'days', true);
        // console.log("Duration = " + duration)
        // console.log("Query = " + req.query.query + "\n from = " + from + "\n to = " + to + "\n startDate = " + startDate + "\n endDate = " + endDate)
        var range = { $gte: from, $lte: to };
        var countFree = 0
        var countPaid = 0
        // status: { $in: ["Confirmed", "Pending", "EstimateRequested", "JobInititated", "Cancelled"] },
        await Booking.find({ is_services: true, status: { $in: ["Confirmed", "Pending", "EstimateRequested", "JobOpen", "JobInititated", "In-Process", "CompleteWork", "QC", "StoreApproval", "Ready", "Completed", "Closed", "Cancelled"] }, created_at: range })
            .cursor().eachAsync(async (bookings) => {
                var totalBookings = 0
                var totalJobs = 0
                var month = moment(bookings.created_at).tz(req.headers['tz']).format('MMMM YYYY');
                // console.log("Month = " + month)
                if (duration <= 31) {
                    month = moment(bookings.created_at).tz(req.headers['tz']).format('MMM DD');
                    // console.log("Month <31 = " + month)
                }
                var jobsStatus = ["JobOpen", "In-Process", "CompleteWork", "QC", "StoreApproval", "Ready", "Completed", "Closed"]
                var booking = ["Confirmed", "Pending", "EstimateRequested", "JobInititated", "Cancelled"]
                // if (bookings.status == 'Confirmed' || 'Pending' || 'EstimateRequested' || 'JobInititated' || 'Cancelled') {
                if (booking.indexOf(bookings.status) != -1) {
                    // console.log(month + " = Inside Bookings = " + bookings.status)
                    bookingAll.push(1)
                    totalBookings = totalBookings + 1
                    analyticsBooking.push({
                        category: "booking",
                        sort: moment(bookings.created_at).tz(req.headers['tz']).format('YYYY-MM-DD'),
                        month: month,
                        totalBookings: totalBookings
                    });

                } else {
                    // console.log(month + " = Inside Bookings = " + bookings.status)
                    totalJobs = totalJobs + 1
                    jobsAll.push(1)
                    analytics.push({
                        category: "Jobs",
                        sort: moment(bookings.created_at).tz(req.headers['tz']).format('YYYY-MM-DD'),
                        month: month,
                        totalJobs: totalJobs
                    });
                }
            });
        // return res.json(analytics)
        analytics = _.orderBy(analytics, ['sort'], ['asc'])
        var jobsData = _(analytics).groupBy('month').map((objs, key) => ({
            // bookings: parseInt(_.sumBy(objs, 'totalBookings')),
            jobs: parseInt(_.sumBy(objs, 'totalJobs')),
            month: key,
            total: objs.length,
            // source: _(objs).groupBy(x => x.category).map((objs1, key1) => ({
            //     category: key1,
            //     total: objs1.length,
            // })),
        })
        ).value();

        analyticsBooking = _.orderBy(analyticsBooking, ['sort'], ['asc'])
        var bookingsData = _(analyticsBooking).groupBy('month').map((objs, key) => ({
            bookings: parseInt(_.sumBy(objs, 'totalBookings')),

            month: key,
            total: objs.length,
            // source: _(objs).groupBy(x => x.category).map((objs1, key1) => ({
            //     category: key1,
            //     total: objs1.length,
            // })),
        })
        ).value();
        // console.log("Toatal = " + data.labour_cost)

        res.status(200).json({
            responseCode: 200,
            responseMessage: {
                Totalbookings: bookingAll.length,
                Totaljobs: jobsAll.length
                // objs: parseInt(_.sumBy(data.totalFree)),
            },
            responseData: {
                bookings: bookingsData,
                jobs: jobsData
            }
        });
    }
});

// user businesses start
router.get('/business-overview/users/get', /* xAccessToken.token,*/ async function (req, res, next) {
    var rules = {
        // from: 'required',
        // to: 'required'
        query: 'required'
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
        var date = new Date();
        var leftDaysInMonth = date.getDate();
        // console.log("leftDaysInMonth ==> ", leftDaysInMonth)
        var from = new Date()
        var to = new Date()
        var analytics = [];
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
            var query = leftDaysInMonth;
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }
        var startDate = moment(from);
        var endDate = moment(to);
        var duration = endDate.diff(startDate, 'days', true);
        var range = { $gte: from, $lte: to };
        var businessRegUsers = []
        var selfRegUsers = []
        var sourceBusiness = ['Booking', 'Insurance Renewal']
        // console.log("from ", from)
        // console.log("to ", to)
        // console.log("duration ", duration)
        await Lead.find({ created_at: range })
            .cursor().eachAsync(async (users) => {
                // console.log("users._id ", users.user)
                // var user  =  await Booking.findOne({ is_services: true, user: users._id}).exec();
                //  var isBooking  =  await Booking.findOne({ is_services: true, user: users._id}).exec();
                // console.log("isBooking ", isBooking.user)
                if (true) {
                    // console.log("users.created_at ", users.created_at)
                    var businessUsers = 0
                    var selfUsers = 0
                    var month = moment(users.created_at).tz(req.headers['tz']).format('MMMM YYYY');

                    if (duration <= 31) {
                        month = moment(users.created_at).tz(req.headers['tz']).format('MMM DD');
                        // console.log(duration)
                    }
                    if (sourceBusiness.indexOf(users.source) != -1) {
                        // console.log(month + " = Inside Bookings = " + users.source)
                        businessRegUsers.push(1)
                        businessUsers = businessUsers + 1
                        analytics.push({
                            category: "Business",
                            sort: moment(users.created_at).tz(req.headers['tz']).format('YYYY-MM-DD'),
                            month: month,
                            businessUsers: businessUsers
                        });

                    } else {
                        // console.log(month + " = Inside SElf = " + users.source)
                        selfUsers = selfUsers + 1
                        selfRegUsers.push(1)
                        analytics.push({
                            category: "Self",
                            sort: moment(users.created_at).tz(req.headers['tz']).format('YYYY-MM-DD'),
                            month: month,
                            selfUsers: selfUsers
                        });
                    }
                }


            });
        // return res.json(analytics)
        analytics = _.orderBy(analytics, ['sort'], ['asc'])
        var data = _(analytics).groupBy('month').map((objs, key) => ({
            businessRegUsers: parseInt(_.sumBy(objs, 'businessUsers')),
            SelfRegUsers: parseInt(_.sumBy(objs, 'selfUsers')),
            month: key,
            total: objs.length,
        })
        ).value();

        res.status(200).json({
            responseCode: 200,
            responseMessage: {
                byBusiness: businessRegUsers.length,
                bySelf: selfRegUsers.length,
                totalUsers: businessRegUsers.length + selfRegUsers.length
            },
            responseData: data
        });
    }
});
// user businesses end

//Super admin API make by Kaushlesh start

router.get('/business-overview/part-listed/get',  /* xAccessToken.token,*/  async function (req, res, next) {
    var rules = {
        // from: 'required',
        // to: 'required'
        query: 'required'
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
        // var token = req.headers['x-access-token'];
        // var secret = config.secret;
        // var decoded = jwt.verify(token, secret);
        // var user = decoded.user;
        var date = new Date();
        // var business = req.headers['business'];
        var from = new Date()
        var to = new Date()
        var analytics = [];
        var partListedAll = [];

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
            var query = 30;
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }

        var startDate = moment(from);
        var endDate = moment(to);
        var duration = endDate.diff(startDate, 'days', true);
        var range = { $gte: from, $lte: to };
        var count = 0;
        var partsAll = [];
        var totalStock = 0
        var totalAvailable = 0;
        var totalConsumed = 0;
        await BusinessProduct.find({ created_at: range })
            .cursor().eachAsync(async (partListed) => {
                totalStock = totalStock + partListed.stock.total;
                totalAvailable = totalAvailable + partListed.stock.available;
                totalConsumed = totalConsumed + partListed.stock.consumed;
                var totalPartListed = 0
                var tatalPartSolds = 0
                // var totalJobs = 0
                var month = moment(partListed.created_at).tz(req.headers['tz']).format('MMMM YYYY');
                if (duration <= 31) {
                    month = moment(partListed.created_at).tz(req.headers['tz']).format('MMM DD');
                    // console.log("Month <31 = " + month)
                }
                // console.log(month + " = Inside Bookings = " + partListed.status)
                totalPartListed = totalPartListed + 1

                partsAll.push(1)
                analytics.push({

                    sort: moment(partListed.created_at).tz(req.headers['tz']).format('YYYY-MM-DD'),
                    month: month,
                    totalPartListed: totalPartListed,
                    tatalPartConsumed: partListed.stock.consumed,
                    tatalPartAvailable: partListed.stock.available,
                });

            })
        analytics = _.orderBy(analytics, ['sort'], ['asc'])
        var data = _(analytics).groupBy('month').map((objs, key) => ({
            partListed: parseInt(_.sumBy(objs, 'totalPartListed')),
            consumed: parseFloat(_.sumBy(objs, 'tatalPartConsumed')),
            available: parseFloat(_.sumBy(objs, 'tatalPartAvailable')),
            // jobs: parseInt(_.sumBy(objs, 'totalJobs')),
            month: key,
            total: objs.length,

            // source: _(objs).groupBy(x => x.category).map((objs1, key1) => ({
            //     category: key1,
            //     total: objs1.length,
            // })),
        })
        ).value();
        // console.log("Toatal = " + data.labour_cost)

        res.status(200).json({
            responseCode: 200,
            responseMessage: {
                totalStock: parseFloat(totalStock).toFixed(2),
                totalAvailable: parseFloat(totalAvailable).toFixed(2),
                totalConsumed: parseFloat(totalConsumed).toFixed(2),
                TotalParts: partsAll.length
                // objs: parseInt(_.sumBy(data.totalFree)),
            },
            responseData: data
        });
    }
});
router.get('/business-overview/paid-businesses/get', /* xAccessToken.token,*/ async function (req, res, next) {
    var rules = {
        // from: 'required',
        // to: 'required'
        query: 'required'
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
        var date = new Date();
        // var business = req.headers['business'];
        var from = new Date()
        var to = new Date()
        var analytics = [];
        var awsPlansData = []
        var apsPlansData = [];
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
            var query = 30;
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }

        // var from = new Date(req.query.from);
        // var to = new Date(req.query.to);

        // var startDate = moment(req.query.from);
        // var endDate = moment(req.query.to);
        var startDate = moment(from);
        var endDate = moment(to);
        var duration = endDate.diff(startDate, 'days', true);
        // console.log("Duration = " + duration)
        // console.log("Query = " + req.query.query + "\n from = " + from + "\n to = " + to + "\n startDate = " + startDate + "\n endDate = " + endDate)
        var range = { $gte: from, $lte: to };
        var countFree = 0
        var countPaid = 0
        // status: { $in: ["Confirmed", "Pending", "EstimateRequested", "JobInititated", "Cancelled"] },
        await BusinessPlan.find({ price: { $ne: 0 }, created_at: range })
            .cursor().eachAsync(async (plan) => {
                var totalAwsPaid = 0
                var totalApsPaid = 0

                var month = moment(plan.created_at).tz(req.headers['tz']).format('MMMM YYYY');
                // console.log("Month = " + month)
                if (duration <= 31) {
                    month = moment(plan.created_at).tz(req.headers['tz']).format('MMM DD');
                    // console.log("Month <31 = " + month)
                }
                // var booking = ["Confirmed", "Pending", "EstimateRequested", "JobInititated", "Cancelled"]
                // if (bookings.status == 'Confirmed' || 'Pending' || 'EstimateRequested' || 'JobInititated' || 'Cancelled') {
                if (plan.category == "Workshop") {
                    // console.log("plan.category ", plan.category)
                    awsPlansData.push(1)
                    totalAwsPaid = totalAwsPaid + 1
                    analytics.push({
                        category: "Workshop",
                        sort: moment(plan.created_at).tz(req.headers['tz']).format('YYYY-MM-DD'),
                        month: month,
                        totalAwsPaid: totalAwsPaid
                    });

                } else if (plan.category == "Parts") {

                    totalApsPaid = totalApsPaid + 1
                    apsPlansData.push(1)
                    analytics.push({
                        category: "Parts",
                        sort: moment(plan.created_at).tz(req.headers['tz']).format('YYYY-MM-DD'),
                        month: month,
                        totalApsPaid: totalApsPaid
                    });
                }
            });
        // return res.json(analytics)
        analytics = _.orderBy(analytics, ['sort'], ['asc'])
        var data = _(analytics).groupBy('month').map((objs, key) => ({
            aws: parseInt(_.sumBy(objs, 'totalAwsPaid')),
            aps: parseInt(_.sumBy(objs, 'totalApsPaid')),
            month: key,
            total: objs.length,
            // source: _(objs).groupBy(x => x.category).map((objs1, key1) => ({
            //     category: key1,
            //     total: objs1.length,
            // })),
        })
        ).value();
        // console.log("Toatal = " + data.labour_cost)

        res.status(200).json({
            responseCode: 200,
            responseMessage: {
                TotalAwsPaid: awsPlansData.length,
                TotalApsPaid: apsPlansData.length
                // objs: parseInt(_.sumBy(data.totalFree)),
            },
            responseData: data
        });
    }
});

router.get('/business-overview/free-businesses/get', /* xAccessToken.token,*/ async function (req, res, next) {
    var rules = {
        // from: 'required',
        // to: 'required'
        query: 'required'
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
        var date = new Date();
        // var business = req.headers['business'];
        var from = new Date()
        var to = new Date()
        var analytics = [];
        var awsPlansData = []
        var apsPlansData = [];
        var OthersPlansData = [];
        var range = { $gte: from, $lte: to }
        var lastMonthRange = { $gte: lastStartDate, $lte: lastEndDate }
        if (parseInt(req.query.query) == 0) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
            var lastEndDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var lastStartDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query - query);
        }
        else if (parseInt(req.query.query) >= 1) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
            var lastEndDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query - 1);
            var lastStartDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query - query - 1);
        }
        else {
            var query = 30;
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
            var lastEndDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var lastStartDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query - query);
        }

        // var from = new Date(req.query.from);
        // var to = new Date(req.query.to);

        // var startDate = moment(req.query.from);
        // var endDate = moment(req.query.to);
        var startDate = moment(from);
        var endDate = moment(to);
        var duration = endDate.diff(startDate, 'days', true);
        // console.log("Duration = " + duration)
        // console.log("Query = " + req.query.query + "\n from = " + from + "\n to = " + to + "\n startDate = " + startDate + "\n endDate = " + endDate)
        var range = { $gte: from, $lte: to };
        var countFree = 0
        var countPaid = 0
        // status: { $in: ["Confirmed", "Pending", "EstimateRequested", "JobInititated", "Cancelled"] },


        await User.find({
            "account_info.type": "business",
            "visibility": true, created_at: range
        })
            .cursor().eachAsync(async (user) => {

                var busi = await BusinessPlan.find({ business: user._id }).exec();
                if (busi.length != 0) {
                    // console.log("planedd " + user.name)
                    // console.log("Exists In Business Plan " + busi[0].plan)
                } else if (busi.length == 0) {
                    // console.log("non planed " + user.name)
                    var OthersFree = 0
                    var month = moment(user.created_at).tz(req.headers['tz']).format('MMMM YYYY');
                    if (duration <= 31) {
                        month = moment(user.created_at).tz(req.headers['tz']).format('MMM DD');

                    }
                    OthersPlansData.push(1)
                    OthersFree = OthersFree + 1
                    analytics.push({
                        category: "Others",
                        sort: moment(user.created_at).tz(req.headers['tz']).format('YYYY-MM-DD'),
                        month: month,
                        OthersFree: OthersFree
                    });

                }
            });

        // return res.json(analytics)
        await BusinessPlan.find({ price: { $eq: 0 }, created_at: range })
            .cursor().eachAsync(async (plan) => {
                var totalAwsFree = 0
                var totalApsFree = 0

                var month = moment(plan.created_at).tz(req.headers['tz']).format('MMMM YYYY');
                // console.log("Month = " + month)
                if (duration <= 31) {
                    month = moment(plan.created_at).tz(req.headers['tz']).format('MMM DD');
                    // console.log("Month <31 = " + month)
                }
                // var booking = ["Confirmed", "Pending", "EstimateRequested", "JobInititated", "Cancelled"]
                // if (bookings.status == 'Confirmed' || 'Pending' || 'EstimateRequested' || 'JobInititated' || 'Cancelled') {
                if (plan.category == "Workshop") {
                    // console.log("plan.category ", plan.category)
                    awsPlansData.push(1)
                    totalAwsFree = totalAwsFree + 1
                    analytics.push({
                        category: "Workshop",
                        sort: moment(plan.created_at).tz(req.headers['tz']).format('YYYY-MM-DD'),
                        month: month,
                        totalAwsFree: totalAwsFree
                    });

                } else if (plan.category == "Parts") {

                    totalApsFree = totalApsFree + 1
                    apsPlansData.push(1)
                    analytics.push({
                        category: "Parts",
                        sort: moment(plan.created_at).tz(req.headers['tz']).format('YYYY-MM-DD'),
                        month: month,
                        totalApsFree: totalApsFree
                    });
                }
            });


        //ABhinav Tyagi


        /////////
        // return res.json(analytics)
        analytics = _.orderBy(analytics, ['sort'], ['asc'])
        var data = _(analytics).groupBy('month').map((objs, key) => ({
            aws: parseInt(_.sumBy(objs, 'totalAwsFree')),
            aps: parseInt(_.sumBy(objs, 'totalApsFree')),
            others: parseInt(_.sumBy(objs, 'OthersFree')),
            month: key,
            total: objs.length,
            // source: _(objs).groupBy(x => x.category).map((objs1, key1) => ({
            //     category: key1,
            //     total: objs1.length,
            // })),
        })
        ).value();
        // console.log("Toatal = " + data.labour_cost)

        res.status(200).json({
            responseCode: 200,
            responseMessage: {
                TotalAwsFree: awsPlansData.length,
                TotalApsFree: apsPlansData.length,
                TotalOthers: OthersPlansData.length
                // objs: parseInt(_.sumBy(data.totalFree)),
            },
            responseData: data
        });
    }
});

router.get('/business-overview/revenue-fromCurrent/get', /* xAccessToken.token,*/ async function (req, res, next) {
    var rules = {
        // from: 'required',
        // to: 'required'
        query: 'required'
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
        var date = new Date();
        var leftDaysInMonth = date.getDate();
        // console.log("leftDaysInMonth ==> ", leftDaysInMonth)
        var from = new Date()
        var to = new Date()
        var analytics = [];
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
            var query = leftDaysInMonth;
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }
        var startDate = moment(from);
        var endDate = moment(to);
        var duration = endDate.diff(startDate, 'days', true);
        var count = 0
        var totalRevenue = 0
        count = 0
        await BusinessPlan.find({ created_at: { $gte: from, $lte: to } })
            .cursor().eachAsync(async (plan) => {
                totalRevenue = totalRevenue + plan.price
                var month = moment(plan.created_at).tz(req.headers['tz']).format('MMMM YYYY');

                if (duration <= leftDaysInMonth) {
                    // console.log("duration <= leftDaysInMonth ", duration)
                    month = moment(plan.created_at).tz(req.headers['tz']).format('MMM DD');
                }
                analytics.push({
                    revenue: plan.price,
                    sort: moment(plan.created_at).tz(req.headers['tz']).format('YYYY-MM-DD'),
                    month: month,
                    created_at: plan.created_at

                });
            });

        analytics = _.orderBy(analytics, ['sort'], ['asc'])
        var data = _(analytics).groupBy('month').map((objs, key) => ({
            revenu: parseInt(_.sumBy(objs, 'revenue')),
            month: key,
            total: objs.length,
        })
        ).value();

        res.status(200).json({
            responseCode: 200,
            responseMessage: {
                toalRevenue: parseFloat(totalRevenue).toFixed(2)
            },
            // responseData: data
        });
    }
});

router.get('/business-overview/last-period/counts/get', /* xAccessToken.token,*/ async function (req, res, next) {
    var rules = {
        query: 'required'
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
        var date = new Date();
        // var business = req.headers['business'];
        var from = new Date()
        var to = new Date()
        var analytics = [];
        if (parseInt(req.query.query) == 0) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
            var lastEndDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var lastStartDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query - query);
            // console.log("lastEndDate 11 ", lastEndDate)
            // console.log("lastStartDate 11 ", lastStartDate)
        }
        else if (parseInt(req.query.query) >= 1) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
            var lastEndDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query - 1);
            var lastStartDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query - query - 1);
            // console.log("Last month data end date = ", lastEndDate)
            // console.log("Last month data start = ", lastStartDate)
            // console.log("from this month data start = ", from)
            // console.log("to this month data start = ", to)
        }
        else {
            var query = 30;
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
            var lastEndDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var lastStartDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query - query);
            // console.log("lastEndDate 33 ", lastEndDate)
            // console.log("lastStartDate 33 ", lastStartDate)
        }

        // var from = new Date(req.query.from);
        // var to = new Date(req.query.to);

        // var startDate = moment(req.query.from);
        // var endDate = moment(req.query.to);
        var startDate = moment(from);
        var endDate = moment(to);
        var duration = endDate.diff(startDate, 'days', true);
        var count = 0
        var range = { $gte: from, $lte: to }
        var lastMonthRange = { $gte: lastStartDate, $lte: lastEndDate }
        var jobsStatus = ["JobOpen", "In-Process", "CompleteWork", "QC", "StoreApproval", "Ready", "Completed", "Closed"]
        var bookingStatus = ["Confirmed", "Pending", "EstimateRequested", "JobInititated", "Cancelled"]
        var totalPaidLastMonth = await BusinessPlan.find({ created_at: lastMonthRange, price: { $ne: 0 }, }).count().exec();
        var totalPaidThisMonth = await BusinessPlan.find({ created_at: range, price: { $ne: 0 }, }).count().exec();
        var jobsPre = await Booking.find({ is_services: true, status: { $in: jobsStatus }, created_at: lastMonthRange }).count().exec();

        var bookingPre = await Booking.find({ is_services: true, status: { $in: bookingStatus }, created_at: lastMonthRange }).count().exec();



        var totalStock = 0
        var totalAvailable = 0;
        var totalConsumed = 0;
        await BusinessProduct.find({ created_at: lastMonthRange })
            .cursor().eachAsync(async (partListed) => {
                totalStock = totalStock + partListed.stock.total;
                totalAvailable = totalAvailable + partListed.stock.available;
                totalConsumed = totalConsumed + partListed.stock.consumed;
            })

        var totalGMV = 0

        await Invoice.find({ status: "Active", created_at: lastMonthRange })
            .cursor().eachAsync(async (invoice) => {
                var gmv = invoice.payment.total;
                count = count + 1
                totalGMV = totalGMV + invoice.payment.total

            });

        var totalRevenue = 0;
        await BusinessPlan.find({ created_at: lastMonthRange })
            .cursor().eachAsync(async (plan) => {
                totalRevenue = totalRevenue + plan.price

            });

        var totalUsersLastMonth = await Lead.find({ created_at: lastMonthRange }).count().exec()


        var otherBusinesses = 0;
        await User.find({
            "account_info.type": "business",
            "visibility": true, created_at: lastMonthRange
        })
            .cursor().eachAsync(async (user) => {

                var busi = await BusinessPlan.find({ business: user._id }).exec();
                if (busi.length != 0) {
                    // console.log("planedd " + user.name)
                    // console.log("Exists In Business Plan " + busi[0].plan)
                } else if (busi.length == 0) {
                    otherBusinesses = otherBusinesses + 1
                }
            });

        var totalFreeLastMonth = otherBusinesses + await BusinessPlan.find({ created_at: lastMonthRange, price: { $eq: 0 }, }).count().exec();

        var data = {
            bookingGraph: {
                booking: bookingPre,
                jobs: jobsPre,
                totalStock: parseFloat(totalStock).toFixed(2),
                totalAvailable: parseFloat(totalAvailable).toFixed(2),
                totalConsumed: parseFloat(totalConsumed).toFixed(2),
            },
            gmvGraph: {
                gmv: parseFloat(totalGMV).toFixed(2),
                revenu: parseFloat(totalRevenue).toFixed(2)
            },
            busenessGraph: {
                totalPaidLastMonth: totalPaidLastMonth,
                totalPaidThisMonth: totalPaidThisMonth,
                totalFreeLastMonth: totalFreeLastMonth,
                totalBusinessesLastMonth: totalPaidLastMonth + totalFreeLastMonth,
                totalUsersLastMonth: totalUsersLastMonth

            },


        }
        res.status(200).json({
            responseCode: 200,
            responseMessage: "Basic Counts ",
            responseData: data
        });
    }
});

router.get('/business-overview/total-businesses/get', /* xAccessToken.token,*/ async function (req, res, next) {
    var rules = {
        // from: 'required',
        // to: 'required'
        query: 'required'
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
        var date = new Date();
        // var business = req.headers['business'];
        var from = new Date()
        var to = new Date()
        var analytics = [];
        var totalFreeBusinessCount = []
        var totalPaidBusinessCount = [];
        var OthersPlansData = [];
        var totalCount = [];
        var range = { $gte: from, $lte: to }
        var lastMonthRange = { $gte: lastStartDate, $lte: lastEndDate }
        if (parseInt(req.query.query) == 0) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
            var lastEndDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var lastStartDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query - query);
        }
        else if (parseInt(req.query.query) >= 1) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
            var lastEndDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query - 1);
            var lastStartDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query - query - 1);
        }
        else {
            var query = 30;
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
            var lastEndDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var lastStartDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query - query);
        }

        // var from = new Date(req.query.from);
        // var to = new Date(req.query.to);

        // var startDate = moment(req.query.from);
        // var endDate = moment(req.query.to);
        var startDate = moment(from);
        var endDate = moment(to);
        var duration = endDate.diff(startDate, 'days', true);
        // console.log("Duration = " + duration)
        // console.log("Query = " + req.query.query + "\n from = " + from + "\n to = " + to + "\n startDate = " + startDate + "\n endDate = " + endDate)
        var range = { $gte: from, $lte: to };
        var countFree = 0
        var countPaid = 0
        var totalFree = 0;
        // status: { $in: ["Confirmed", "Pending", "EstimateRequested", "JobInititated", "Cancelled"] },


        await User.find({
            "account_info.type": "business",
            "visibility": true, created_at: range
        })
            .cursor().eachAsync(async (user) => {

                var busi = await BusinessPlan.find({ business: user._id }).exec();
                if (busi.length != 0) {
                    // console.log("planedd " + user.name)
                    // console.log("Exists In Business Plan " + busi[0].plan)
                } else if (busi.length == 0) {
                    // console.log("non planed " + user.name)
                    var totalFree = 0
                    var month = moment(user.created_at).tz(req.headers['tz']).format('MMMM YYYY');
                    if (duration <= 31) {
                        month = moment(user.created_at).tz(req.headers['tz']).format('MMM DD');

                    }
                    totalCount.push(1)
                    totalFree = totalFree + 1
                    analytics.push({
                        category: "Free",
                        sort: moment(user.created_at).tz(req.headers['tz']).format('YYYY-MM-DD'),
                        month: month,
                        totalFree: 1
                    });

                }
            });

        // return res.json(analytics)
        await BusinessPlan.find({ price: { $eq: 0 }, created_at: range })
            .cursor().eachAsync(async (plan) => {

                var totalPaid = 0

                var month = moment(plan.created_at).tz(req.headers['tz']).format('MMMM YYYY');
                // console.log("Month = " + month)
                if (duration <= 31) {
                    month = moment(plan.created_at).tz(req.headers['tz']).format('MMM DD');
                    // console.log("Month <31 = " + month)
                }

                totalFree = totalFree + 1
                totalCount.push(1)
                analytics.push({
                    category: "Free",
                    sort: moment(plan.created_at).tz(req.headers['tz']).format('YYYY-MM-DD'),
                    month: month,
                    totalFree: 1
                });


            });


        await BusinessPlan.find({ price: { $ne: 0 }, created_at: range })
            .cursor().eachAsync(async (plan) => {

                var totalPaid = 0

                var month = moment(plan.created_at).tz(req.headers['tz']).format('MMMM YYYY');
                // console.log("Month = " + month)
                if (duration <= 31) {
                    month = moment(plan.created_at).tz(req.headers['tz']).format('MMM DD');
                    // console.log("Month <31 = " + month)
                }

                totalFree = totalFree + 1
                totalCount.push(1)
                analytics.push({
                    category: "Paid",
                    sort: moment(plan.created_at).tz(req.headers['tz']).format('YYYY-MM-DD'),
                    month: month,
                    totalPaid: 1
                });


            });


        //ABhinav Tyagi


        /////////
        // return res.json(analytics)
        analytics = _.orderBy(analytics, ['sort'], ['asc'])
        var data = _(analytics).groupBy('month').map((objs, key) => ({
            // aws: parseInt(_.sumBy(objs, 'totalAwsFree')),
            // aps: parseInt(_.sumBy(objs, 'totalApsFree')),
            totalFree: parseInt(_.sumBy(objs, 'totalFree')),
            totalPaid: parseInt(_.sumBy(objs, 'totalPaid')),
            total: parseInt(_.sumBy(objs, 'totalFree')) + parseInt(_.sumBy(objs, 'totalPaid')),
            month: key,
            total: objs.length,
            // source: _(objs).groupBy(x => x.category).map((objs1, key1) => ({
            //     category: key1,
            //     total: objs1.length,
            // })),
        })
        ).value();
        // console.log("Toatal = " + data.labour_cost)

        res.status(200).json({
            responseCode: 200,
            responseMessage: {
                totalCounts: totalCount.length
                // totalCount : total
                // TotalAwsFree: awsPlansData.length,
                // TotalApsFree: apsPlansData.length,
                // TotalOthers: totalFree.length  
                // objs: parseInt(_.sumBy(data.totalFree)),
            },
            responseData: data
        });
    }
});

router.get('/business-overview/gvm-plus-revenue/get', /* xAccessToken.token,*/ async function (req, res, next) {
    var rules = {
        query: 'required'
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
        var date = new Date();

        var from = new Date()
        var to = new Date()
        var analytics = [];
        var analyticsRevenue = [];

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
            var query = 30;
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }

        var startDate = moment(from);
        var endDate = moment(to);
        var duration = endDate.diff(startDate, 'days', true);
        var count = 0
        var totalGMV = 0
        var totalRevenue = 0

        await Invoice.find({ status: "Active", created_at: { $gte: from, $lte: to } })
            .cursor().eachAsync(async (invoice) => {
                var gmv = invoice.payment.total;
                count = count + 1
                totalGMV = totalGMV + invoice.payment.total
                var month = moment(invoice.created_at).tz(req.headers['tz']).format('MMMM YYYY');
                if (duration <= 31) {
                    month = moment(invoice.created_at).tz(req.headers['tz']).format('MMM DD');

                }
                analytics.push({
                    gmv: gmv,
                    sort: moment(invoice.created_at).tz(req.headers['tz']).format('YYYY-MM-DD'),
                    month: month
                });

            });


        count = 0
        await BusinessPlan.find({ price: { $ne: 0 }, created_at: { $gte: from, $lte: to } })
            .cursor().eachAsync(async (plan) => {
                // console.log("plan.price ", plan.price)
                totalRevenue = totalRevenue + plan.price
                var month = moment(plan.created_at).tz(req.headers['tz']).format('MMMM YYYY');
                // console.log("Month = " + month)
                if (duration <= 31) {
                    month = moment(plan.created_at).tz(req.headers['tz']).format('MMM DD');
                    // console.log("Month <31 = " + month)
                }

                analyticsRevenue.push({
                    revenue: plan.price,
                    sort: moment(plan.created_at).tz(req.headers['tz']).format('YYYY-MM-DD'),
                    month: month,
                    created_at: plan.created_at

                });


            });
        // return res.json(analytics)
        analytics = _.orderBy(analytics, ['sort'], ['asc'])

        var gmvData = _(analytics).groupBy('month').map((objs, key) => ({
            gmv: parseInt(_.sumBy(objs, 'gmv')),

            month: key,
            total: objs.length,

        })
        ).value();
        analyticsRevenue = _.orderBy(analyticsRevenue, ['sort'], ['asc'])
        var revenueData = _(analyticsRevenue).groupBy('month').map((objs, key) => ({

            revenu: parseInt(_.sumBy(objs, 'revenue')),
            month: key,
            total: objs.length,

        })
        ).value();

        res.status(200).json({
            responseCode: 200,
            responseMessage: {
                totalGMV: parseFloat(totalGMV).toFixed(2),
                toalRevenue: parseFloat(totalRevenue).toFixed(2)
            },
            responseData: {
                revenue: revenueData,
                gmv: gmvData
            }
        });
    }

});

//Super admin API make by Kaushlesh end

// File Upload Business Account
router.post("/bussineses/accounts/upload", function (req, res, next) {
    var token = req.headers["x-access-token"];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var not_inserted = [];
    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            // cb(null,'/home/ubuntu/CarEager/uploads')
            cb(null, "./uploads");
        },
        filename: function (req, file, cb) {
            var datetimestamp = Date.now();
            cb(
                null,
                uuidv1() +
                "." +
                file.originalname.split(".")[file.originalname.split(".").length - 1]
            );
        },
    });

    var upload = multer({
        storage: storage,
        fileFilter: function (req, file, callback) {
            if (
                ["xls", "xlsx"].indexOf(
                    file.originalname.split(".")[file.originalname.split(".").length - 1]
                ) === -1
            ) {
                return callback(new Error("Wrong extension type"));
            }
            callback(null, true);
        },
    }).single("media");

    upload(req, res, function (err) {
        if (err) {
            return res.status(422).json({
                responseCode: 422,
                responseMessage: "Server Error",
                responseData: err,
            });
        }

        if (!req.file) {
            return res.status(422).json({
                responseCode: 422,
                responseMessage: "No File Passed",
                responseData: {},
            });
        }

        if (
            req.file.originalname.split(".")[
            req.file.originalname.split(".").length - 1
            ] === "xlsx"
        ) {
            exceltojson = xlsxtojson;
        } else {
            return res.status(422).json({
                responseCode: 422,
                responseMessage: "Error",
                responseData: {},
            });
        }

        exceltojson(
            {
                input: req.file.path,
                output: null,
                lowerCaseHeaders: true,
            },
            async function (err, business) {
                if (err) {
                    return res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Error",
                        responseData: err,
                    });
                } else {


                    var invalid_data = _.filter(business, x => x.contact_no == "" || x.name == "");

                    if (invalid_data.length > 0) {
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Unformatted Data! Please check & upload again.",
                            responseData: {}
                        });
                    }
                    else {
                        var data = [];
                        // console.log(business.length);
                        var arr = []
                        var newAccounts = 0
                        var exitsAccounts = 0
                        for (var i = 0; i < business.length; i++) {
                            // console.log(business[i].contact_no + "    name " + business[i].location + "    name " + business[i].state, "    name " + business[i].name)
                            var contact_no = business[i].contact_no;
                            var name = business[i].name;
                            var location = business[i].location;
                            var state = business[i].state;
                            var category = business[i].category;
                            var brand = []
                            // console.log()
                            var loop = 0

                            // console.log("Business Brand  = " + business[i].brand)
                            if (business[i].brand != "") {
                                var brands = business[i].brand.split(',');
                                brands.forEach(async function (l) {
                                    brand.push(l)
                                });
                            }
                            var latitude = business[i].latitude;
                            var longitude = business[i].longitude;
                            var alternate_no = business[i].alternate_num;
                            var planType = business[i].plan;
                            var city = business[i].city;
                            var zip = business[i].zip;
                            if (zip) {
                                var postal = await Location.findOne({ zip: zip }).exec();
                                if (location) {

                                    if (postal) {
                                        city = postal.region
                                    } else {
                                        city = ''
                                    }

                                }
                            }



                            //   arr.push({
                            //       planT:planType,
                            //       alternate_no:alternate_no,
                            //       latitude:latitude
                            //   })
                            // console.log(i+"   -= -   "+planType);
                            // }
                            // return res.json(arr)
                            // if(true){
                            var checkPhone = await User.find({
                                contact_no: contact_no,
                                "account_info.type": "business",
                            })
                                .count()
                                .exec();
                            // console.log(checkPhone.name)
                            if (checkPhone == 0) {
                                newAccounts += 1
                                // console.log("Workings")
                                var firstPart = (Math.random() * 46656) | 0;
                                var secondPart = (Math.random() * 46656) | 0;
                                firstPart = ("000" + firstPart.toString(36)).slice(-3);
                                secondPart = ("000" + secondPart.toString(36)).slice(-3);
                                referral_code =
                                    firstPart.toUpperCase() + secondPart.toUpperCase();

                                var otp = Math.floor(Math.random() * 90000) + 10000;



                                username = shortid.generate();

                                socialite = {};
                                optional_info = {
                                    alternate_no: alternate_no,
                                    reg_by: "Upload",

                                };

                                var address = location;

                                var country = await Country.findOne({
                                    timezone: { $in: req.headers["tz"] },
                                }).exec();

                                var rand = Math.ceil(Math.random() * 100000 + 1);
                                name = name;
                                name = _.startCase(_.toLower(name));

                                geometry = [0, 0];
                                if (longitude && latitude) {
                                    geometry = [longitude, latitude];
                                }

                                address = {
                                    country: country.countryName,
                                    timezone: req.headers["tz"],
                                    location: location,
                                    address: address,
                                    state: state,
                                    city: city,
                                    zip: zip,
                                    area: "",
                                    landmark: "",
                                    geometry: geometry
                                };

                                // bank_details = {
                                //     ifsc: req.body.ifsc,
                                //     account_no: req.body.account_no,
                                //     account_holder: req.body.account_holder
                                // };

                                account_info = {
                                    type: "business",
                                    status: "Complete",
                                    added_by: null,
                                    phone_verified: false,
                                    verified_account: false,
                                    approved_by_admin: false,
                                };


                                device = [];
                                otp = otp;
                                var count = await User.find({ "account_info.type": "business", "visibility": true }).count();


                                business_info = {
                                    company_name: name,
                                    business_category: business[i].business_category,
                                    business_category: category,
                                    company: business[i].company,
                                    category: category,
                                    brand: brand,
                                    business_id: count + 10000,
                                    // account_no: req.body.account_no,
                                    // gst_registration_type: req.body.gst_registration_type,
                                    // gstin: req.body.gstin,
                                    is_claimed: true,
                                    // tax_registration_no: req.body.tax_registration_no,
                                    // pan_no: req.body.pan_no
                                };

                                var started_at = null;
                                if (req.body.started_at) {
                                    started_at = new Date(req.body.started_at).toISOString();
                                }

                                var expired_at = null;
                                if (req.body.expired_at) {
                                    expired_at = new Date(req.body.expired_at).toISOString();
                                }

                                uuid = uuidv1();

                                // partner = {
                                //     partner: req.body.carEager_partner,
                                //     commission: req.body.partner_commision,
                                //     package_discount: req.body.package_discount,
                                //     started_at: started_at,
                                //     expired_at: expired_at,
                                // };
                                var data = {
                                    contact_no: contact_no,
                                    name: name,
                                    referral_code,
                                    otp: otp,
                                    username: username,
                                    socialite: socialite,
                                    optional_info: optional_info,
                                    address: address,
                                    account_info: account_info,
                                    business_info: business_info,
                                    uuid: uuid,
                                    created_at: new Date(),
                                };
                                // console.log("outside the data ", data.contact_no);
                                // console.log("Count = " + i)
                                await User.create(data).then(async function (user) {
                                    var days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
                                    for (var i = 0; i < 7; i++) {
                                        var timing = new BusinessTiming({
                                            business: user._id,
                                            day: days[i],
                                            open: "09:30 AM",
                                            close: "06:30 PM",
                                            is_closed: false,
                                            created_at: new Date(),
                                            updated_at: new Date(),
                                        });
                                        timing.save();
                                        // fun.planAddBusiness(contact_no);
                                    }

                                    // Type.find({}).then(function (BT){
                                    //     BT.forEach(function (u) {
                                    //         var businessType = new BusinessType({
                                    //             business: user._id,
                                    //             business_type: u._id,
                                    //             is_added: false,
                                    //         });
                                    //         businessType.save();
                                    //     });
                                    // });

                                    await Management.create({
                                        business: user._id,
                                        user: user._id,
                                        role: "Admin",
                                        created_at: new Date(),
                                        updated_at: new Date(),
                                    });
                                    // console.log("fgfgfgfgfgfg")
                                    await Address.create({
                                        user: user._id,
                                        address: location,
                                        // area: req.body.area,
                                        // landmark: req.body.landmark,
                                        zip: zip,
                                        city: city,
                                        state: state,

                                        created_at: new Date(),
                                        updated_at: new Date(),
                                    });

                                    //   console.log("Plans Type = ", planType);

                                    if (planType != "others") {

                                        var freePlan = await SuitePlan.findOne({ plan: "Free", category: planType }).exec();

                                        if (freePlan) {
                                            var plans = await BusinessPlan.find({ business: user._id, suite: freePlan.id }).count().exec();
                                            if (plans == 0) {
                                                // console.log("Inside Plan = " + freePlan.id)
                                                await SuitePlan.find({ _id: freePlan.id })
                                                    .cursor().eachAsync(async (plan) => {
                                                        if (plan) {
                                                            var plan_no = Math.round(+new Date() / 1000) + Math.round((Math.random() * 9999) + 10)
                                                            // console.log("Plans detail" + plan, business._id)
                                                            var expired_at = new Date();
                                                            // var status = ""
                                                            // if (plan.price - req.body.paid > 0) {

                                                            //     status = "Pending"
                                                            // } else if (plan.price - req.body.paid == 0) {


                                                            var status = "Success"

                                                            // }
                                                            expired_at.setDate(expired_at.getDate() + plan.validity);
                                                            BusinessPlan.create({
                                                                suite: plan._id,
                                                                plan: plan.plan,
                                                                name: plan.name,
                                                                short_name: plan.short_name,
                                                                price: plan.price,
                                                                default: plan.default,
                                                                main: plan.main,
                                                                limits: plan.limits,
                                                                category: plan.category,
                                                                validity: plan.validity,
                                                                expired_at: expired_at,
                                                                "payment.paid_total": parseInt(plan.price),
                                                                "payment.due": plan.price - parseInt(plan.price),
                                                                "payment.mode": "",
                                                                "payment.total": plan.price,
                                                                "payment.price": plan.price,
                                                                "payment.payment_status": status,
                                                                "due.due": plan.price - parseInt(plan.price),
                                                                "due.pay": parseInt(plan.price),
                                                                plan_no: plan_no,
                                                                sold_by: user.name,
                                                                created_at: new Date(),
                                                                updated_at: new Date(),
                                                                business: user._id,

                                                            })


                                                            // .cursor().eachAsync(async (business) => {
                                                            TransactionLog.create({
                                                                user: user._id,
                                                                activity: "Business-Plan",
                                                                status: "Upload",
                                                                received_by: 'Upload',
                                                                // source: plan._id,
                                                                // source: plan[0]._id,
                                                                source: user._id,
                                                                plan_no: plan_no,
                                                                // source: order_id,
                                                                business: user._id,
                                                                // paid_by: req.body.paid_by,
                                                                paid_by: "Customer",
                                                                // paid_total: req.body.paid,
                                                                // paid_total: parseInt(req.body.paid),
                                                                paid_total: plan.price,
                                                                total: plan.price,
                                                                // payment_mode: req.body.payment_mode,
                                                                payment_mode: "Free Uploaded Account",
                                                                payment_status: "Success",
                                                                order_id: null,
                                                                // transaction_id: req.body.transaction_id,
                                                                transaction_id: "Free Account",
                                                                transaction_date: new Date(),
                                                                transaction_status: "Success",
                                                                transaction_response: "Success",
                                                                created_at: new Date(),
                                                                updated_at: new Date(),
                                                            })
                                                        }
                                                    });

                                                // res.status(200).json({
                                                //     responseCode: 200,
                                                //     responseMessage: "Suite plans has been added.",
                                                //     responseData: {}
                                                // });
                                                // console.log("Suite plans has been added.")
                                            }
                                            else {
                                                // res.status(400).json({
                                                //     responseCode: 400,
                                                //     responseMessage: "Some Plans already active.",
                                                //     responseData: {}
                                                // });
                                                // console.log("Some Plans already active.")
                                            }
                                        }
                                    }
                                    // console.log("Sucess Created Business ");
                                });
                                //For

                                // }
                            } else {
                                exitsAccounts += 1
                                // res.status(400).json({
                                //     responseCode: 400,
                                //     responseMessage: "Phone number already in use.",
                                //     responseData: {},
                                // });
                                // console.log(i + " , Contact Already in use = " + contact_no);
                            }
                        }

                        // console.log("New Accounts " + newAccounts)
                        //  console.log("Existing Accounts " + exitsAccounts)
                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Successfully Import",
                            responseData: {},
                        });
                    }
                }
            }
        );
    });
});
router.post("/bussineses/accounts/upload/Error", function (req, res, next) {
    var token = req.headers["x-access-token"];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var not_inserted = [];
    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            // cb(null,'/home/ubuntu/CarEager/uploads')
            cb(null, "./uploads");
        },
        filename: function (req, file, cb) {
            var datetimestamp = Date.now();
            cb(
                null,
                uuidv1() +
                "." +
                file.originalname.split(".")[file.originalname.split(".").length - 1]
            );
        },
    });

    var upload = multer({
        storage: storage,
        fileFilter: function (req, file, callback) {
            if (
                ["xls", "xlsx"].indexOf(
                    file.originalname.split(".")[file.originalname.split(".").length - 1]
                ) === -1
            ) {
                return callback(new Error("Wrong extension type"));
            }
            callback(null, true);
        },
    }).single("media");

    upload(req, res, function (err) {
        if (err) {
            return res.status(422).json({
                responseCode: 422,
                responseMessage: "Server Error",
                responseData: err,
            });
        }

        if (!req.file) {
            return res.status(422).json({
                responseCode: 422,
                responseMessage: "No File Passed",
                responseData: {},
            });
        }

        if (
            req.file.originalname.split(".")[
            req.file.originalname.split(".").length - 1
            ] === "xlsx"
        ) {
            exceltojson = xlsxtojson;
        } else {
            return res.status(422).json({
                responseCode: 422,
                responseMessage: "Error",
                responseData: {},
            });
        }

        exceltojson(
            {
                input: req.file.path,
                output: null,
                lowerCaseHeaders: true,
            },
            async function (err, business) {
                if (err) {
                    return res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Error",
                        responseData: err,
                    });
                } else {


                    var invalid_data = _.filter(business, x => x.contact_no == "" || x.name == "");

                    if (invalid_data.length > 0) {
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Unformatted Data! Please check & upload again.",
                            responseData: {}
                        });
                    }
                    else {
                        var data = [];
                        // console.log(business.length);
                        var arr = []
                        var newAccounts = 0
                        var exitsAccounts = 0
                        for (var i = 0; i < business.length; i++) {
                            // console.log(business[i].contact_no + "    name " + business[i].location + "    name " + business[i].state, "    name " + business[i].name)
                            var contact_no = business[i].contact_no;
                            var name = business[i].name;
                            var location = business[i].location;
                            var state = business[i].state;
                            var category = business[i].category;
                            var brand = []
                            // console.log()
                            var loop = 0

                            // console.log("Business Brand  = " + business[i].brand)
                            if (business[i].brand != "") {
                                var brands = business[i].brand.split(',');
                                brands.forEach(async function (l) {
                                    brand.push(l)
                                });
                            }
                            var latitude = business[i].latitude;
                            var longitude = business[i].longitude;
                            var alternate_no = business[i].alternate_num;
                            var planType = business[i].plan;
                            var city = business[i].city;
                            var zip = business[i].zip;
                            if (zip) {
                                var postal = await Location.findOne({ zip: zip }).exec();
                                if (location) {

                                    if (postal) {
                                        city = postal.region
                                    } else {
                                        city = ''
                                    }

                                }
                            }



                            //   arr.push({
                            //       planT:planType,
                            //       alternate_no:alternate_no,
                            //       latitude:latitude
                            //   })
                            // console.log(i+"   -= -   "+planType);
                            // }
                            // return res.json(arr)
                            // if(true){
                            var checkPhone = await User.find({
                                contact_no: contact_no,
                                "account_info.type": "business",
                            })
                                .count()
                                .exec();
                            // console.log(checkPhone.name)
                            if (checkPhone == 0) {
                                newAccounts += 1
                                // console.log("Workings")
                                var firstPart = (Math.random() * 46656) | 0;
                                var secondPart = (Math.random() * 46656) | 0;
                                firstPart = ("000" + firstPart.toString(36)).slice(-3);
                                secondPart = ("000" + secondPart.toString(36)).slice(-3);
                                referral_code =
                                    firstPart.toUpperCase() + secondPart.toUpperCase();

                                var otp = Math.floor(Math.random() * 90000) + 10000;



                                username = shortid.generate();

                                socialite = {};
                                optional_info = {
                                    alternate_no: alternate_no,
                                    reg_by: "Upload",

                                };

                                var address = location;

                                var country = await Country.findOne({
                                    timezone: { $in: req.headers["tz"] },
                                }).exec();

                                var rand = Math.ceil(Math.random() * 100000 + 1);
                                name = name;
                                name = _.startCase(_.toLower(name));

                                geometry = [0, 0];
                                if (longitude && latitude) {
                                    geometry = [longitude, latitude];
                                }

                                address = {
                                    country: country.countryName,
                                    timezone: req.headers["tz"],
                                    location: location,
                                    address: address,
                                    state: state,
                                    city: city,
                                    zip: zip,
                                    area: "",
                                    landmark: "",
                                    geometry: geometry
                                };

                                // bank_details = {
                                //     ifsc: req.body.ifsc,
                                //     account_no: req.body.account_no,
                                //     account_holder: req.body.account_holder
                                // };

                                account_info = {
                                    type: "business",
                                    status: "Complete",
                                    added_by: null,
                                    phone_verified: false,
                                    verified_account: false,
                                    approved_by_admin: false,
                                };


                                device = [];
                                otp = otp;
                                var count = await User.find({ "account_info.type": "business", "visibility": true }).count();


                                business_info = {
                                    company_name: name,
                                    business_category: business[i].business_category,
                                    business_category: category,
                                    company: business[i].company,
                                    category: category,
                                    brand: brand,
                                    business_id: count + 10000,
                                    // account_no: req.body.account_no,
                                    // gst_registration_type: req.body.gst_registration_type,
                                    // gstin: req.body.gstin,
                                    is_claimed: true,
                                    // tax_registration_no: req.body.tax_registration_no,
                                    // pan_no: req.body.pan_no
                                };

                                var started_at = null;
                                if (req.body.started_at) {
                                    started_at = new Date(req.body.started_at).toISOString();
                                }

                                var expired_at = null;
                                if (req.body.expired_at) {
                                    expired_at = new Date(req.body.expired_at).toISOString();
                                }

                                uuid = uuidv1();

                                // partner = {
                                //     partner: req.body.carEager_partner,
                                //     commission: req.body.partner_commision,
                                //     package_discount: req.body.package_discount,
                                //     started_at: started_at,
                                //     expired_at: expired_at,
                                // };
                                var data = {
                                    contact_no: contact_no,
                                    name: name,
                                    referral_code,
                                    otp: otp,
                                    username: username,
                                    socialite: socialite,
                                    optional_info: optional_info,
                                    address: address,
                                    account_info: account_info,
                                    business_info: business_info,
                                    uuid: uuid,
                                    created_at: new Date(),
                                };
                                // console.log("outside the data ", data.contact_no);
                                // console.log("Count = " + i)
                                await User.create(data).then(async function (user) {
                                    var days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
                                    for (var i = 0; i < 7; i++) {
                                        var timing = new BusinessTiming({
                                            business: user._id,
                                            day: days[i],
                                            open: "09:30 AM",
                                            close: "06:30 PM",
                                            is_closed: false,
                                            created_at: new Date(),
                                            updated_at: new Date(),
                                        });
                                        timing.save();
                                        // fun.planAddBusiness(contact_no);
                                    }

                                    // Type.find({}).then(function (BT){
                                    //     BT.forEach(function (u) {
                                    //         var businessType = new BusinessType({
                                    //             business: user._id,
                                    //             business_type: u._id,
                                    //             is_added: false,
                                    //         });
                                    //         businessType.save();
                                    //     });
                                    // });

                                    await Management.create({
                                        business: user._id,
                                        user: user._id,
                                        role: "Admin",
                                        created_at: new Date(),
                                        updated_at: new Date(),
                                    });
                                    // console.log("fgfgfgfgfgfg")
                                    await Address.create({
                                        user: user._id,
                                        address: location,
                                        // area: req.body.area,
                                        // landmark: req.body.landmark,
                                        zip: zip,
                                        city: city,
                                        state: state,

                                        created_at: new Date(),
                                        updated_at: new Date(),
                                    });

                                    //   console.log("Plans Type = ", planType);

                                    if (planType != "others") {

                                        var freePlan = await SuitePlan.findOne({ plan: "Free", category: planType }).exec();

                                        if (freePlan) {
                                            var plans = await BusinessPlan.find({ business: user._id, suite: freePlan.id }).count().exec();
                                            if (plans == 0) {
                                                // console.log("Inside Plan = " + freePlan.id)
                                                await SuitePlan.find({ _id: freePlan.id })
                                                    .cursor().eachAsync(async (plan) => {
                                                        if (plan) {
                                                            var plan_no = Math.round(+new Date() / 1000) + Math.round((Math.random() * 9999) + 10)
                                                            // console.log("Plans detail" + plan, business._id)
                                                            var expired_at = new Date();
                                                            // var status = ""
                                                            // if (plan.price - req.body.paid > 0) {

                                                            //     status = "Pending"
                                                            // } else if (plan.price - req.body.paid == 0) {


                                                            var status = "Success"

                                                            // }
                                                            expired_at.setDate(expired_at.getDate() + plan.validity);
                                                            BusinessPlan.create({
                                                                suite: plan._id,
                                                                plan: plan.plan,
                                                                name: plan.name,
                                                                short_name: plan.short_name,
                                                                price: plan.price,
                                                                default: plan.default,
                                                                main: plan.main,
                                                                limits: plan.limits,
                                                                category: plan.category,
                                                                validity: plan.validity,
                                                                expired_at: expired_at,
                                                                "payment.paid_total": parseInt(plan.price),
                                                                "payment.due": plan.price - parseInt(plan.price),
                                                                "payment.mode": "",
                                                                "payment.total": plan.price,
                                                                "payment.price": plan.price,
                                                                "payment.payment_status": status,
                                                                "due.due": plan.price - parseInt(plan.price),
                                                                "due.pay": parseInt(plan.price),
                                                                plan_no: plan_no,
                                                                sold_by: user.name,
                                                                created_at: new Date(),
                                                                updated_at: new Date(),
                                                                business: user._id,

                                                            })


                                                            // .cursor().eachAsync(async (business) => {
                                                            TransactionLog.create({
                                                                user: user._id,
                                                                activity: "Business-Plan",
                                                                status: "Upload",
                                                                received_by: 'Upload',
                                                                // source: plan._id,
                                                                // source: plan[0]._id,
                                                                source: user._id,
                                                                plan_no: plan_no,
                                                                // source: order_id,
                                                                business: user._id,
                                                                // paid_by: req.body.paid_by,
                                                                paid_by: "Customer",
                                                                // paid_total: req.body.paid,
                                                                // paid_total: parseInt(req.body.paid),
                                                                paid_total: plan.price,
                                                                total: plan.price,
                                                                // payment_mode: req.body.payment_mode,
                                                                payment_mode: "Free Uploaded Account",
                                                                payment_status: "Success",
                                                                order_id: null,
                                                                // transaction_id: req.body.transaction_id,
                                                                transaction_id: "Free Account",
                                                                transaction_date: new Date(),
                                                                transaction_status: "Success",
                                                                transaction_response: "Success",
                                                                created_at: new Date(),
                                                                updated_at: new Date(),
                                                            })
                                                        }
                                                    });

                                                // res.status(200).json({
                                                //     responseCode: 200,
                                                //     responseMessage: "Suite plans has been added.",
                                                //     responseData: {}
                                                // });
                                                // console.log("Suite plans has been added.")
                                            }
                                            else {
                                                // res.status(400).json({
                                                //     responseCode: 400,
                                                //     responseMessage: "Some Plans already active.",
                                                //     responseData: {}
                                                // });
                                                // console.log("Some Plans already active.")
                                            }
                                        }
                                    }
                                    // console.log("Sucess Created Business ");
                                });
                                //For

                                // }
                            } else {
                                exitsAccounts += 1
                                // res.status(400).json({
                                //     responseCode: 400,
                                //     responseMessage: "Phone number already in use.",
                                //     responseData: {},
                                // });
                                // console.log(i + " , Contact Already in use = " + contact_no);
                            }
                        }

                        // console.log("New Accounts " + newAccounts)
                        //  console.log("Existing Accounts " + exitsAccounts)
                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Successfully Import",
                            responseData: {},
                        });
                    }
                }
            }
        );
    });
});
router.put('/super-admin/remarks/add', xAccessToken.token, async function (req, res, next) {
    // return res.json("abhi")
    var token = req.headers["x-access-token"];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    // var user = decoded.user;

    var loggedInDetails = await User.findById(decoded.user).exec();
    let user = await User.findOne({ _id: req.body.id }).exec()

    let getTime = new Date()
    if (user) {
        let logs = {
            remark: req.body.remark,
            created_at: new Date(),
            added_by: loggedInDetails.name,
        }
        user.logs.push(logs)
        user.updated_at = new Date()
        // vinay query
        await user.markModified('logs')
        await user.save()
        res.status(200).json({
            responseCode: 200,
            responseMessage: "Remark Added successfully",
            responseData: {}
        });
    } else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "User not found",
            responseData: {}
        });
    }
})
router.get('/super-admin/remarks/get', xAccessToken.token, async function (req, res, next) {
    // return res.json("abhi")
    var token = req.headers["x-access-token"];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    // var user = decoded.user;

    // var loggedInDetails = await User.findById(decoded.user).exec();
    let user = await User.findOne({ _id: req.query.id }).exec()
    // console.log(" user10347 ", user)
    // user.logs =  user.logs? user.logs : []
    let getTime = new Date()
    if (user) {
        // console.log(" user1 ", user)
        // console.log(" user2 ", user.logs)
        res.status(200).json({
            responseCode: 200,
            responseMessage: "Remarks",
            responseData: user.logs.reverse()
        });
    } else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "User not found",
            responseData: {}
        });
    }
})

router.post('/send/login/link', xAccessToken.token, async function (req, res, next) {
    var token = req.headers["x-access-token"];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var loggedInDetails = await User.findById(decoded.user).exec();
    var user = await User.findOne({ _id: req.body.id }).exec();
    if (user) {
        event.loginLinkMail(user)
        event.autroidOnboardings(user)
        event.autroidSignUpSMS(user)
        await whatsAppEvent.autroidBusinessReg(user.name, user.contact_no);
        let logs = {
            remark: "Login Link Sent to : " + user.contact_no,
            created_at: new Date(),
            added_by: loggedInDetails.name,
        }
        user.logs.push(logs)
        user.updated_at = new Date()
        // vinay query
        await user.markModified('logs')
        await user.save()
        res.status(200).json({
            responseCode: 200,
            responseMessage: "Link Sent",
            responseData: user
        });


    } else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "User not found",
            responseData: {}
        });
    }

});

router.get('/users/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var product = new Object();
    var result = [];
    // console.log("Main ")
    // console.log("Business Id = " + business)
    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }
    var page = Math.max(0, parseInt(page));

    if (req.query.limit == undefined) {
        var limit = 10;
    } else {
        var limit = parseInt(req.query.limit);
    }

    var list = []
    let startDate = req.query.from
    let endDate = req.query.to
    // console.log(startDate, req.query.end_date)

    req.query.query = req.query.query.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");

    if (req.query.type == "business") {
        if (req.query.query) {
            // console.log("Query=  " + req.query.query)
            var query = {
                $and: [
                    {
                        "account_info.type": "business",
                        "visibility": true,
                        $or: [
                            {
                                "name": { $regex: req.query.query, $options: 'i' }
                            },
                            {
                                "contact_no": { $regex: req.query.query, $options: 'i' }
                            },
                            {
                                "address.location": { $regex: req.query.query, $options: 'i' }
                            },
                            // {
                            //     "business_info.gstin": { $regex: req.query.query, $options: 'i' }
                            // }
                        ]
                    }
                ]
            }
            // console.log(query + " Query")
        }
        else if (req.query.brand) {
            // console.log("active 1200= " + req.query.active)
            var query = {
                "account_info.type": "business",
                "visibility": true,
                // _id: { $ne: mongoose.Types.ObjectId(business) },
                "business_info.brand": req.query.brand
            }

        }
        else if (req.query.location) {
            // console.log("Location  = " + req.query.location)
            var query = {
                $and: [
                    {
                        "account_info.type": "business",
                        "visibility": true,
                        $or: [
                            {
                                "address.city": new RegExp(req.query.location, "i"),
                            },
                            {
                                "address.zip": new RegExp(req.query.location, "i"),
                            },
                            // {
                            //     "address.state": new RegExp(req.query.location, "i"),
                            // },
                        ]
                    }
                ]
            }
            // console.log(query + " Query")
        } else if (req.query.active) {
            // console.log("active 1200= " + req.query.active)
            var query = {
                "account_info.type": "business",
                "visibility": true,
                "account_info.status": req.query.active
            }
        }
        //APS OR AWS
        else if (req.query.category) {
            // console.log("Category")
            result = []
            // var busi = await BusinessPlan.find({ category: req.query.category }).populate('user').sort({ created_at: -1 }).exec();
            // return res.status(200).json(busi)
            totalResult = 0
            if (req.query.category != "others") {
                // console.log("APS AWS")
                totalResult = await BusinessPlan.find({ category: req.query.category }).count().exec();
                await BusinessPlan.find({ category: req.query.category }).skip(limit * page).limit(limit).populate('business').sort({ created_at: -1 }).skip(limit * page).limit(limit).cursor().eachAsync(async (business) => {
                    // return res.status(200).json(business)
                    // totalResult = totalResult + 1
                    // console.log(" Error doucument= " + business._id)
                    result.push({
                        _id: business.business._id,
                        id: business.business._id,
                        name: business.business.name,
                        email: business.business.email,
                        referral_code: business.business.referral_code,
                        contact_no: business.business.contact_no,
                        address: business.business.address,
                        bank_details: business.business.bank_details,
                        business_info: business.business.business_info,
                        account_info: business.business.account_info,
                        agent: business.business.agent,
                        partner: business.business.partner,
                        plans_details: [business],
                        created_at: moment(business.business.created_at).tz(req.headers['tz']).format('ll'),
                        updated_at: moment(business.business.created_at).tz(req.headers['tz']).format('ll'),
                    })
                });
                return res.status(200).json({
                    responseCode: 200,
                    responseInfo: {
                        totalResult: totalResult
                    },
                    // responseQuery: query,
                    responseMessage: "success",
                    responseData: result
                });
            } else if (req.query.category == "others") {
                // console.log(" Others doucument= ")
                // var totalResult = await User.find(query).count();
                await User.find({
                    "account_info.type": "business",
                    "visibility": true
                })

                    .sort({ created_at: -1 })
                    .cursor().eachAsync(async (p) => {
                        var busi = {}
                        var busi = await BusinessPlan.find({ business: p._id }).count().exec();
                        // console.log("isPlan = " + busi)
                        if (busi == 0) {
                            totalResult = totalResult + 1
                            // console.log("Inside If isPlan = ")
                            result.push({
                                _id: p._id,
                                id: p._id,
                                name: p.name,
                                email: p.email,
                                referral_code: p.referral_code,
                                contact_no: p.contact_no,
                                address: p.address,
                                bank_details: p.bank_details,
                                business_info: p.business_info,
                                account_info: p.account_info,
                                agent: p.agent,
                                partner: p.partner,
                                plans_details: [],
                                created_at: moment(p.created_at).tz(req.headers['tz']).format('ll'),
                                updated_at: moment(p.created_at).tz(req.headers['tz']).format('ll'),
                            })
                        }

                    });
                return res.status(200).json({
                    responseCode: 200,
                    responseInfo: {
                        totalResult: totalResult
                    },
                    // responseQuery: query,
                    responseMessage: "success",
                    responseData: result
                });
            }
        }
        //
        else if (startDate && endDate) {
            // console.log(startDate + "  = Date 1207 -" + endDate)
            // filters.push({ $match: {} }
            var query = {
                "account_info.type": "business",
                "visibility": true,
                "created_at": { $gte: new Date(startDate), $lt: new Date(endDate) }
            }
        }
        else {
            // console.log("Else 1216 ")
            var query = {
                "account_info.type": "business",
                "visibility": true,
            }
        }
    }
    else {
        if (req.query.query) {
            var query = {
                $and: [
                    {
                        "account_info.type": "user",
                        $or: [
                            {
                                "name": { $regex: req.query.query, $options: 'i' }
                            },
                            {
                                "contact_no": { $regex: req.query.query, $options: 'i' }
                            },
                            {
                                "business_info.gstin": { $regex: req.query.query, $options: 'i' }
                            }
                        ]
                    }
                ]
            }
            // console.log(query + " Query")
        }
        else {
            var query = {
                "account_info.type": "user"
            }
        }
    }


    var totalResult = await User.find(query).count();
    await User.find(query)
        .skip(limit * page).limit(limit)
        .sort({ created_at: -1 })
        .cursor().eachAsync(async (p) => {
            var busi = {}
            var busi = await BusinessPlan.find({ business: p._id }).exec();
            result.push({
                _id: p._id,
                id: p._id,
                name: p.name,
                email: p.email,
                referral_code: p.referral_code,
                contact_no: p.contact_no,
                address: p.address,
                bank_details: p.bank_details,
                business_info: p.business_info,
                account_info: p.account_info,
                agent: p.agent,
                partner: p.partner,
                plans_details: busi,
                created_at: moment(p.created_at).tz(req.headers['tz']).format('ll'),
                updated_at: moment(p.created_at).tz(req.headers['tz']).format('ll'),
            })
        });
    res.status(200).json({
        responseCode: 200,
        responseInfo: {
            totalResult: totalResult
        },
        responseQuery: query,
        responseMessage: "success",
        responseData: result
    });
});
router.put('/set/city/byZip' /*  , xAccessToken.token */, async function (req, res, next) {
    var count = []
    // await User.find({ "optional_info.reg_by": "Upload", "user.address.city": '' })
    await User.find({ "optional_info.reg_by": "Upload" })
        .cursor().eachAsync(async (users) => {
            count.push[1]
            // console.log("Count                               = " + count)
            if (users) {
                var location = await Location.findOne({ zip: users.address.zip }).exec();
                var user = await User.findOne({ _id: users._id }).exec();
                if (user) {

                    if (location) {
                        // user.address.city = location.city
                        user.address.city = location.region
                        await user.markModified('user.address.city')
                        await user.save()
                        // console.log("City Added Success" + user.name)
                        // res.status(200).json({
                        //     responseCode: 200,
                        //     responseMessage: "City Added",
                        //     responseData: user
                        // });
                    } else {
                        // console.log("City not found" + users.address.zip)
                        // res.status(400).json({
                        //     responseCode: 400,
                        //     responseMessage: "City not found",
                        //     responseData: {}
                        // });
                    }
                } else {
                    // console.log("User not found" + users.contact_no)
                    // res.status(400).json({
                    //     responseCode: 400,
                    //     responseMessage: "User not found",
                    //     responseData: {}
                    // });
                }

            }
            else {
                // console.log("Users not found")
                // res.status(400).json({
                //     responseCode: 400,
                //     responseMessage: "User not found",
                //     responseData: {}
                // });
            }
        })
    res.status(200).json({
        responseCode: 200,
        responseMessage: "No more Blank City Found For Uploaded Accounts",
        responseData: count.length
    });
});
// router.get('/cars/brand/get', /*xAccessToken.token,*/ async function (req, res, next) {
//     var rules = {
//         query: 'required'
//     };
//     var validation = new Validator(req.query, rules);

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
//         console.time('looper')
//         // var token = req.headers['x-access-token'];
//         // var secret = config.secret;
//         // var decoded = jwt.verify(token, secret);
//         // var user = decoded.user;
//         var data = [];
//         // data=await Automaker.find({ maker: {$ne:null}}).exec()
//         // await Automaker.find({
//         //     maker: new RegExp(req.query.query, "i")

//         // }).cursor()
//         //     .eachAsync(async function (o) {
//         //         data.push({
//         //             _id: o._id,
//         //             logo: o.logo,
//         //             maker: o.maker,
//         //         })
//         //     });
//         await Automaker.find({
//             maker: { $ne: null }
//         }).cursor()
//             .eachAsync(async function (o) {
//                 data.push({
//                     _id: o._id,
//                     logo: o.logo,
//                     maker: o.maker,
//                 })
//             });
//         console.timeEnd('looper')
//         let field = 'maker';
// console.log(data.sort((a, b) => (a[field] || "").toString().localeCompare((b[field] || "").toString())));
//         data = data.sort((a, b) => (a[field] || "").toString().localeCompare((b[field] || "").toString()))
//         res.status(200).json({
//             responseCode: 200,
//             responseMessage: "",
//             responseData: data
//         })
//         /**/
//     }
// });
router.get('/cars/brand/get',/* xAccessToken.token,*/ async function (req, res, next) {
    var rules = {
        query: 'required'
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
        console.time('looper')
        // var token = req.headers['x-access-token'];
        // var secret = config.secret;
        // var decoded = jwt.verify(token, secret);
        // var user = decoded.user;
        var data = [];
        // data=await Automaker.find({ maker: {$ne:null}}).exec()
        // await Automaker.find({
        //     maker: new RegExp(req.query.query, "i")

        // }).cursor()
        //     .eachAsync(async function (o) {
        //         data.push({
        //             _id: o._id,
        //             logo: o.logo,
        //             maker: o.maker,
        //         })
        //     });
        await Automaker.find({
            maker: { $ne: null }
        }).cursor()
            .eachAsync(async function (o) {
                data.push({
                    _id: o._id,
                    logo: o.logo,
                    maker: o.maker,
                })
            });
        console.timeEnd('looper')
        let field = 'maker';
        // console.log(data.sort((a, b) => (a[field] || "").toString().localeCompare((b[field] || "").toString())));
        data = data.sort((a, b) => (a[field] || "").toString().localeCompare((b[field] || "").toString()))
        res.status(200).json({
            responseCode: 200,
            responseMessage: "",
            responseData: data
        })
        /**/
    }
});

router.post('/cars/insert', async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business1 = req.headers['business'];
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
        }, async function (err, cars) {
            if (err) {
                return res.status(422).json({
                    responseCode: 422,
                    responseMessage: "Error",
                    responseData: err
                });
            }
            else {
                // x.segment == ""
                var invalid_data = _.filter(cars, x => x.automaker == "" || x.model == "" || x.segment == "" || parseFloat(x.min_price) < 0 || parseFloat(x.max_price) < 0);
                // console.log("Invalid Data Length" + invalid_data)
                // return res.json(invalid_data)
                if (invalid_data.length > 0) {
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Unformatted Data! Please check & upload again.",
                        responseData: {}
                    });
                }
                else {
                    /*Service.remove({
                        business: business,
                        imported: true,
                    });*/
                    v = [];
                    business = req.body.business
                    console.log("Services Length  = " + cars.length)
                    var count = 0
                    var oldModel = 0;
                    var newMOdel = 0;
                    var newVariant = 0;
                    var oldVariant = 0;
                    for (var i = 0; i < cars.length; i++) {
                        console.log("Iteration = " + i)
                        var fuel = cars[i].fuel
                        // console.log("Data =  " + JSON.stringify(cars[i], null, "\t"))

                        var automaker = await Automaker.findOne({ maker: cars[i]._automaker }).exec();
                        if (automaker) {
                            var data = {
                                price: {
                                    min: parseFloat(cars[i].min_cost),
                                    max: parseFloat(cars[i].max_cost),
                                },
                                // price: {
                                //     min: 0,
                                //     max: 0,
                                // },
                                feature_image: cars[i].image,
                                verdict: "",
                                careager_rating: 0,
                                media_rating: 0,
                                automaker: automaker._id,
                                model: automaker.maker + " " + cars[i]._model,
                                value: cars[i]._model,
                                __v: 0,
                                segment: cars[i].segment
                            }

                            var checkModel = await Model.findOne({ automaker: automaker._id, value: cars[i]._model, segment: cars[i].segment }).exec()
                            if (!checkModel) {
                                newMOdel += 1
                                await Model.create(data).then(async function (m) {
                                    v = [];
                                    if (cars[i]._variant != "") {
                                        var variants = cars[i]._variant.split(', ');
                                        for (var v = 0; v < variants.length; v++) {
                                            var checkVariant = await Variant.findOne({ automaker: automaker._id, value: variants[v], model: m._id, segment: m.segment, 'specification.fuel_type': fuel }).exec()
                                            if (!checkVariant) {
                                                newVariant += 1;
                                                var variantData = {
                                                    value: variants[v],
                                                    variant: m.model + " " + variants[v],

                                                    price: 0,
                                                    model: m._id,
                                                    specification: {
                                                        fuel_type: cars[i].fuel,
                                                    },
                                                    service_schedule: [],
                                                    _automaker: automaker.maker,
                                                    automaker: automaker._id,
                                                    segment: m.segment,
                                                    _model: m.model,
                                                    __v: 0,
                                                }
                                                await Variant.create(variantData).then(function (a) {
                                                    count += 1;
                                                })
                                            }
                                            else {
                                                oldVariant += 1
                                                // console.log("Variant Already Exists  = ")
                                            }
                                            // });
                                        }
                                    }


                                })
                            } else {
                                oldModel += 1
                                console.log("Old Model")
                                if (cars[i]._variant != "") {
                                    var variants = cars[i]._variant.split(', ');
                                    // variants.forEach(async function (l) {
                                    for (var v = 0; v < variants.length; v++) {
                                        var checkVariant = await Variant.findOne({ automaker: automaker._id, value: variants[v], model: checkModel._id, segment: checkModel.segment, 'specification.fuel_type': fuel }).exec()
                                        if (!checkVariant) {
                                            // console.log("New Variant ============================================== " + " checkModel._id = " + checkModel._id + "     NEW " + newVariant)
                                            newVariant += 1;
                                            var variantData = {
                                                value: variants[v], //
                                                variant: checkModel.model + " " + variants[v], //
                                                price: parseFloat(cars[i].price),  //
                                                // price: 0,  //
                                                model: checkModel._id,
                                                specification: {
                                                    fuel_type: fuel,//
                                                },
                                                service_schedule: [],
                                                _automaker: automaker.maker,
                                                automaker: automaker._id,
                                                segment: checkModel.segment,
                                                _model: checkModel.model,
                                                __v: 0,
                                            }


                                            await Variant.create(variantData).then(function (a) {
                                                count += 1;
                                                // console.log("New Variant  ----------------------------------------- Created = " + count)
                                            })
                                        }
                                        else {
                                            oldVariant += 1
                                            console.log("Variant Already Exists  = " + oldVariant)
                                        }
                                        // });
                                    }
                                }
                            }

                        }
                        else {
                            console.log("Automaker Not Found")
                        }
                        // */



                    }
                    console.log("Service File Uploaded ")
                    console.log("New Model " + newMOdel)
                    console.log("old Model  " + oldModel)

                    console.log("Old Variant = " + oldVariant)
                    console.log("New Variant = " + newVariant)

                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Successfully Import",
                        responseData: {
                            cars: cars,
                            // variant: v,
                            // variants: variants
                        }
                    });
                }
            }
        });

    });
});
router.post('/image/import', async function (req, res, next) {
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
            if (['png', 'jpg', 'jpeg', 'gif'].indexOf(file.originalname.split('.')[file.originalname.split('.').length - 1]) === -1) {
                return callback(new Error('Wrong extension type'));
            }
            // if (extension == 'png' || extension == 'jpg' || extension == 'jpeg' || extension == 'gif') {
            // 
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
        else {
            return res.status(422).json({
                responseCode: 422,
                responseMessage: "Error",
                responseData: res
            })
        }
    });
});
router.post("/user/accounts/upload", function (req, res, next) {
    // var token = req.headers["x-access-token"];
    // var secret = config.secret;
    // var decoded = jwt.verify(token, secret);
    // var user = decoded.user;
    var not_inserted = [];
    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            // cb(null,'/home/ubuntu/CarEager/uploads')
            cb(null, "./uploads");
        },
        filename: function (req, file, cb) {
            var datetimestamp = Date.now();
            cb(
                null,
                uuidv1() +
                "." +
                file.originalname.split(".")[file.originalname.split(".").length - 1]
            );
        },
    });

    var upload = multer({
        storage: storage,
        fileFilter: function (req, file, callback) {
            if (
                ["xls", "xlsx"].indexOf(
                    file.originalname.split(".")[file.originalname.split(".").length - 1]
                ) === -1
            ) {
                return callback(new Error("Wrong extension type"));
            }
            callback(null, true);
        },
    }).single("media");

    upload(req, res, function (err) {
        if (err) {
            return res.status(422).json({
                responseCode: 422,
                responseMessage: "Server Error",
                responseData: err,
            });
        }

        if (!req.file) {
            return res.status(422).json({
                responseCode: 422,
                responseMessage: "No File Passed",
                responseData: {},
            });
        }

        if (
            req.file.originalname.split(".")[
            req.file.originalname.split(".").length - 1
            ] === "xlsx"
        ) {
            exceltojson = xlsxtojson;
        } else {
            return res.status(422).json({
                responseCode: 422,
                responseMessage: "Error",
                responseData: {},
            });
        }

        exceltojson(
            {
                input: req.file.path,
                output: null,
                lowerCaseHeaders: true,
            },
            async function (err, business) {
                if (err) {
                    return res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Error",
                        responseData: err,
                    });
                } else {


                    var invalid_data = _.filter(business, x => x.contact_no == "" || x.name == "");

                    if (invalid_data.length > 0) {
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Unformatted Data! Please check & upload again.",
                            responseData: {}
                        });
                    }
                    else {
                        var data = [];
                        // console.log(business.length);
                        var arr = []
                        var newAccounts = 0
                        var exitsAccounts = 0
                        for (var i = 0; i < business.length; i++) {
                            // console.log(business[i].contact_no + "    name " + business[i].location + "    name " + business[i].state, "    name " + business[i].name)
                            var contact_no = business[i].contact_no;
                            var name = business[i].name;
                            var location = '';
                            var state = '';
                            var category = '';
                            var brand = []
                            // console.log()
                            var loop = 0

                            // console.log("Business Brand  = " + business[i].brand)
                            if (business[i].brand) {
                                var brands = business[i].brand.split(',');
                                brands.forEach(async function (l) {
                                    brand.push(l)
                                });
                            }
                            var latitude = '';
                            var longitude = '';
                            var alternate_no = '';
                            var planType = '';
                            var city = '';
                            var zip = '';
                            if (zip) {
                                var postal = await Location.findOne({ zip: zip }).exec();
                                if (location) {

                                    if (postal) {
                                        city = postal.region
                                    } else {
                                        city = ''
                                    }

                                }
                            }



                            //   arr.push({
                            //       planT:planType,
                            //       alternate_no:alternate_no,
                            //       latitude:latitude
                            //   })
                            // console.log(i+"   -= -   "+planType);
                            // }
                            // return res.json(arr)
                            // if(true){
                            var checkPhone = await User.find({
                                contact_no: contact_no,
                                "account_info.type": "user",
                            })
                                .count()
                                .exec();
                            // console.log(checkPhone.name)
                            if (checkPhone == 0) {
                                newAccounts += 1
                                // console.log("Workings")
                                var firstPart = (Math.random() * 46656) | 0;
                                var secondPart = (Math.random() * 46656) | 0;
                                firstPart = ("000" + firstPart.toString(36)).slice(-3);
                                secondPart = ("000" + secondPart.toString(36)).slice(-3);
                                referral_code =
                                    firstPart.toUpperCase() + secondPart.toUpperCase();

                                var otp = null;



                                username = shortid.generate();

                                socialite = {};
                                optional_info = {
                                    alternate_no: alternate_no,
                                    reg_by: "Upload",

                                };

                                var address = location;

                                var country = await Country.findOne({
                                    timezone: { $in: req.headers["tz"] },
                                }).exec();

                                var rand = Math.ceil(Math.random() * 100000 + 1);
                                name = name;
                                name = _.startCase(_.toLower(name));

                                geometry = [0, 0];
                                if (longitude && latitude) {
                                    geometry = [longitude, latitude];
                                }

                                address = {
                                    country: country.countryName,
                                    timezone: req.headers["tz"],
                                    location: location,
                                    address: address,
                                    state: state,
                                    city: city,
                                    zip: zip,
                                    area: "",
                                    landmark: "",
                                    geometry: geometry
                                };

                                // bank_details = {
                                //     ifsc: req.body.ifsc,
                                //     account_no: req.body.account_no,
                                //     account_holder: req.body.account_holder
                                // };

                                account_info = {
                                    type: "user",
                                    status: "Complete",
                                    added_by: null,
                                    phone_verified: false,
                                    verified_account: false,
                                    approved_by_admin: false,
                                    isInsCompany: true
                                };


                                device = [];
                                otp = otp;
                                var count = await User.find({ "account_info.type": "user", "visibility": true }).count();


                                // business_info = {
                                //     company_name: name,
                                //     business_category: business[i].business_category,
                                //     business_category: category,
                                //     company: business[i].company,
                                //     category: category,
                                //     brand: brand,
                                //     business_id: count + 10000,
                                //     // account_no: req.body.account_no,
                                //     // gst_registration_type: req.body.gst_registration_type,
                                //     // gstin: req.body.gstin,
                                //     is_claimed: true,
                                //     // tax_registration_no: req.body.tax_registration_no,
                                //     // pan_no: req.body.pan_no
                                // };

                                var started_at = null;
                                if (req.body.started_at) {
                                    started_at = new Date(req.body.started_at).toISOString();
                                }

                                var expired_at = null;
                                if (req.body.expired_at) {
                                    expired_at = new Date(req.body.expired_at).toISOString();
                                }

                                uuid = uuidv1();

                                // partner = {
                                //     partner: req.body.carEager_partner,
                                //     commission: req.body.partner_commision,
                                //     package_discount: req.body.package_discount,
                                //     started_at: started_at,
                                //     expired_at: expired_at,
                                // };
                                var data = {
                                    contact_no: contact_no,
                                    name: name,
                                    referral_code,
                                    otp: otp,
                                    username: username,
                                    socialite: socialite,
                                    optional_info: optional_info,
                                    address: address,
                                    account_info: account_info,
                                    business_info: {},
                                    uuid: uuid,
                                    created_at: new Date(),
                                };
                                // console.log("outside the data ", data.contact_no);
                                // console.log("Count = " + i)
                                await User.create(data).then(async (user) => {
                                    const data = {
                                        company: business[i].name,
                                        gstin: business[i].type,
                                        user: user._id,
                                        created_at: new Date(),
                                        updated_at: new Date()
                                    };
                                    await InsuranceCompany.create(data);
                                });
                                //For

                                // }
                            } else {
                                exitsAccounts += 1
                                // res.status(400).json({
                                //     responseCode: 400,
                                //     responseMessage: "Phone number already in use.",
                                //     responseData: {},
                                // });
                                // console.log(i + " , Contact Already in use = " + contact_no);
                            }
                        }

                        // console.log("New Accounts " + newAccounts)
                        //  console.log("Existing Accounts " + exitsAccounts)
                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Successfully Import",
                            responseData: {},
                        });
                    }
                }
            }
        );
    });
});




module.exports = router