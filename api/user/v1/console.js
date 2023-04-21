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
    assert = require('assert')
crypto = require('crypto');



global.servicesData = [];

var paytm_config = require('../../paytm/paytm_config').paytm_config;
var paytm_checksum = require('../../paytm/checksum');
var querystring = require('querystring');

var s3 = new aws.S3({
    accessKeyId: config.IAM_USER_KEY,
    secretAccessKey: config.IAM_USER_SECRET,
    Bucket: config.BUCKET_NAME
});

const xAccessToken = require('../../middlewares/xAccessToken');
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

var secret = config.secret;

/**
    * [Home API]
    * @param  {[raw json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

router.get('/home', async function (req, res, next) {
    res.status(200).json({
        responseCode: 200,
        responseMessage: "",
        responseData: {
            offers: await BusinessOffer.find({ isCarEager: true }).populate({ path: 'business', select: 'name username avatar avatar_address address' }).exec(),
            category: await BookingCategory.find({ home_visibility: true }).exec(),
            outlets: await User.find({ isCarEager: true }).select('name username avatar avatar_address address').sort({ created_at: -1 }).exec()
        }
    });
});

/**
    * [Home API]
    * @param  {[raw json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

router.get('/services/data', async function (req, res, next) {
    var servicesData = [];
    var labour_cost = 0;
    var part_cost = 0;
    var body = req.body;
    body.forEach(async function (d) {

        // console.log(model)

        d.fuelTypes.forEach(async function (g) {
            g.maintenanceCosts.list.forEach(async function (p) {
                var parts = [];
                var labour_cost = 0;
                var part_cost = 0;
                var inclusion = [];
                p.child.forEach(async function (s) {
                    parts.push({
                        part: s.title,
                        cost: parseInt(s.val.replace(",", ""))
                    });
                    if (s.list.child.val > 0) {
                        if (s.title != "Service Charge") {
                            part_cost = parseInt(s.val.replace(",", "")) + part_cost;
                        }
                        else {
                            labour_cost = parseInt(s.val.replace(",", ""));
                        }
                        inclusion.push(s.title)
                    }
                });

                if (parseInt(p.cost.replace(",", "")) > 0) {
                    servicesData.push({
                        model: d.model,
                        for: d.heading.replace("Service & Maintenance Schedule of ", ""),
                        fuel_type: p.fuelName,
                        service: "Periodic Maintenance",
                        mileage: parseInt(p.kilometers.replace(",", "")),
                        month: parseInt(p.months),
                        description: inclusion.toString(),
                        part_cost: parseInt(p.cost.replace(",", "")) - labour_cost,
                        labour_cost: labour_cost,
                        cost: parseInt(p.cost.replace(",", "")),
                    });
                }
            });
        });

        // console.log(servicesData)
    });

    res.json(servicesData)
});


/**
 * [Login API]
 * @param  {[null]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
*/

router.post('/login', async function (req, res, next) {
    var username = await User.findOne({ username: req.body.username }).exec();
    if (username) {
        if (username.account_info.status == "Active") {
            if (!bcrypt.compareSync(req.body.password, username.password)) {
                res.status(401).json({
                    responseCode: 401,
                    responseMessage: "Authentication failed. Wrong password",
                    responseData: {},
                });
            }
            else {
                var countType = await User.findOne({ username: req.body.username, 'account_info.type': req.body.type }).count().exec();
                if (countType == 0) {
                    res.status(401).json({
                        responseCode: 401,
                        responseMessage: "Unauthorized",
                        responseData: {}
                    });
                }
                else {
                    const payload = {
                        user: username._id
                    };
                    var token = jwt.sign(payload, secret);

                    username.password = "";

                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "sucess",
                        responseData: {
                            status: "active",
                            token: token,
                            user: username
                        }
                    });
                }
            }
        }
    }
    else {
        res.status(401).json({
            responseCode: 401,
            responseMessage: "Unauthorized",
            responseData: {},
        })
    }
});

/**
 * [Get All User API]
 * @param  {[null]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
*/

router.get('/users', async function (req, res, next) {
    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }

    var page = Math.max(0, parseInt(page));

    var users = await User.find({ 'account_info.type': "user" })
        .select('-password')
        .sort({ created_at: -1 }).skip(config.perPage * page).limit(config.perPage)
        .exec();

    return res.status(200).json({
        responseCode: 200,
        responseMessage: "Success",
        responseData: users,
    })
});


router.get('/businesses', async function (req, res, next) {
    if (req.query.page == undefined) {
        var page = 0;
    }
    else {
        var page = req.query.page;
    }

    var page = Math.max(0, parseInt(page));
    var filterBy = new Object();
    var users = [];
    if (req.query.status) {
        var status = req.query.status;
        filterBy['account_info.status'] = { $in: status.split(',') }
    }

    if (req.query.category) {
        var category = req.query.category;
        filterBy['business_info.business_category'] = { $in: category.split(',') }
    }

    if (req.query.company) {
        var company = req.query.company;
        filterBy['business_info.company'] = { $in: company.split(',') }
    }

    await User.aggregate([
        { "$match": { "account_info.type": "business" } },
        { "$match": { "$and": [filterBy] } },
        { $skip: config.perPage * page },
        { $limit: config.perPage }
    ])
        .allowDiskUse(true)
        .cursor({ batchSize: 10 })
        .exec()
        .eachAsync(async function (user) {
            users.push({
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
            })
        });

    return res.status(200).json({
        responseCode: 200,
        responseMessage: "Success",
        responseData: users,
    })
});


module.exports = router
