var mongoose = require('mongoose'),
    express = require('express'),
    { ObjectId } = require('mongodb').ObjectID,
    router = express.Router(),
    config = require('../../config'),
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
const fun = require('../function');
const event = require('../event');
const { Console, countReset } = require('console');
const BusinessSetting = require('../../models/businessSetting');
const Invoice = require('../../models/invoice');
const { referralWhatsAppEventAgent } = require('../whatsapp/whatsappEvent');
const businessFunctions = require('../erpWeb/businessFunctions.js');
var secret = config.secret;

//Abhinav: MultiOutlet
router.post('/business/list', xAccessToken.token, async function (req, res, next) {
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



module.exports = router