var mongoose = require('mongoose'),
    express = require('express'),
    {ObjectId} = require('mongodb').ObjectID,
    router = express.Router(),
    config = require('../../config'),
    bcrypt = require('bcrypt-nodejs'),
    jwt = require('jsonwebtoken'),
    aws = require('aws-sdk'),
    multerS3 = require('multer-s3'),
    uuidv1 = require('uuid/v1'),
    Validator = require('validatorjs'),
    multer = require('multer'),
    request = require('request'),
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
const Customization = require('../../models/customization');
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
const ActivityLog = require('../../models/activityLog');
const TransactionLog = require('../../models/transactionLog');
const DriverVerification = require('../../models/driverVerification');

var secret = config.secret;

/**
    * [New User API]
    * @param  {[raw json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

router.post('/', xAccessToken.token,async function (req, res, next) {  
    var rules = {
        contact_no: 'required',
        booking:'required'
    };

    var validation = new Validator(req.body, rules);

    if(validation.fails()){
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Contact no. is required",
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
        var checkBooking = await Booking.findById(req.body.booking).exec();
        if(checkBooking)
        {
            var booking = checkBooking._id
        }else
        {
            var booking = null;
        }

        
        if(req.body.driver)
        {
            var checkDriverPhone = await User.findOne({_id: req.body.driver}).exec();
            if(checkDriverPhone.account_info.type=="driver")
            {
                if(booking)
                {
                    var check = await DriverVerification.findOne({user: checkDriverPhone._id}).exec();
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

                    
                    Booking.findOneAndUpdate({_id: booking}, {$set:{driver:checkDriverPhone._id}}, {new: true},async function(err, doc){})
                    

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
                else{
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
            else{
                res.status(401).json({
                    responseCode: 401,
                    responseMessage: "Unauthorized",
                    responseData: {}
                });
            }
        }    
        else
        {
            var checkUser = await User.findOne({contact_no: req.body.contact_no}).exec();
            if(checkUser)
            {
                res.status(401).json({
                    responseCode: 401,
                    responseMessage: "Contact No already exists",
                    responseData: {}
                });
            }
            else
            {
                var data = {};
                var country = await Country.findOne({timezone: req.headers['tz']}).exec();
                data.address = {
                    country:country.countryName,
                    timezone: req.headers['tz'],
                    location:data.location,
                };

                data.account_info = {
                    type:"driver",
                    added_by: null,
                    status: "Complete",
                };

                var name = req.body.name;
                name = name.substring(0,3);
                var rand = Math.floor((Math.random() * 100000) + 1);

                data.username = name+""+shortid.generate();
                data.contact_no = req.body.contact_no;
                data.email = req.body.email;

                data.referral_code = name.toUpperCase()+""+rand;

                data.referral_code = '';
                data.geometry= [0,0];
                data.device= [];
                data.otp=Math.floor(Math.random() * 90000) + 10000;
                
                data.careager_cash = 0;
                data.socialite = "";
                data.optional_info = "";
                data.business_info = "";

                User.create(data).then(async function (user){
                    var point = {
                        user:user._id,
                        points: 1000,
                        activity: "coin",
                        tag: "welcome",
                        source: null,
                        status: true,
                        created_at: new Date(),
                        updated_at: new Date(),
                    };

                    fun.addPoints(point); 

                    DriverVerification.create({
                        user: user._id,
                        otp:Math.floor(Math.random() * 90000) + 10000,
                        created_at: new Date(),
                        updated_at: new Date()
                    }).then(async function(data){
                        event.otp(user.contact_no,data.otp);
                    })

                    if(booking)
                    {
                        Booking.findOneAndUpdate({_id: booking}, {$set:{driver:user._id}}, {new: true},async function(err, doc){})
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

router.post('/verification', xAccessToken.token,async function (req, res, next) {  
    var rules = {
        contact_no: 'required',
        user: 'required',
        otp: 'required',
        booking: 'required',
    };

    var validation = new Validator(req.body, rules);

    if(validation.fails()){
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Incomplete information",
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

        var check = await DriverVerification.findOne({user: req.body.user, otp: req.body.otp}).exec();
        if(check)
        {
            var checkUser = await User.findOne({_id: req.body.user}).exec();
            if(checkUser)
            {
                var checkBooking = await Booking.findOne({_id: req.body.booking,status:"Completed"}).exec();
                if(checkBooking)
                {
                    var checkDriverBooking = await Booking.findOne({driver:checkUser._id,status:"Completed"}).count().exec();
                    if(checkDriverBooking==1)
                    {
                        var checkPoints = await Point.findOne({ tag: "LoyalityProgram", source: checkBooking._id}).count().exec()
                        if(checkPoints==0){
                            if(checkBooking.payment.labour_cost>=5000){
                                var commision= checkBooking.payment.labour_cost*.02;
                                //var cashInterest =(20/100)*checkUser.careager_cash;

                                var cash = commision;

                                var point = {
                                    user:checkUser._id,
                                    points: cash,
                                    activity: "coin",
                                    tag: "LoyalityProgram",
                                    source: checkBooking._id,
                                    status: true
                                }

                                fun.addPoints(point); 

                                res.status(200).json({
                                    responseCode: 200,
                                    responseMessage: cash+" has been credit in your account",
                                    responseData: {},
                                });
                            }
                            else{
                                res.status(422).json({
                                    responseCode: 422,
                                    responseMessage: "Not Eligible",
                                    responseData: {},
                                });
                            }
                        }
                        else{
                            res.status(422).json({
                                responseCode: 422,
                                responseMessage: "Already Exist",
                                responseData: {},
                            });
                        }
                    }
                    else
                    {
                        var checkPoints = await Point.findOne({ tag: "LoyalityProgram", source: checkBooking._id}).count().exec()
                        if(checkPoints==0){
                            if(checkBooking.payment.labour_cost>=5000){
                                var commision= checkBooking.payment.labour_cost*.02;
                                var cashInterest = checkUser.careager_cash*.2;

                                var cash = cashInterest+commision;

                                var point = {
                                    user:checkUser._id,
                                    points: cash,
                                    activity: "coin",
                                    tag: "LoyalityProgram",
                                    source: checkBooking._id,
                                    status: true
                                }

                                fun.addPoints(point); 

                                res.status(200).json({
                                    responseCode: 200,
                                    responseMessage: cash+" has been credit in your account 2",
                                    responseData: {},
                                });
                            }

                            else{
                                res.status(422).json({
                                    responseCode: 422,
                                    responseMessage: "Not Eligible",
                                    responseData: {},
                                });
                            }
                        }
                        else{
                            res.status(422).json({
                                responseCode: 422,
                                responseMessage: "Already Exist",
                                responseData: {},
                            });
                        }
                    }

                }
                else{
                    res.status(400).json({
                        responseCode: 400,
                        responseMessage: "Booking not found",
                        responseData: {}
                    })
                } 
            }
            else{
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "User not found",
                    responseData: {}
                })
            }
        }    
        else
        {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "OTP not matched",
                responseData: {}
            })
        }   
    } 
});


module.exports = router
