var mongoose = require('mongoose'),
    express = require('express'),
    { ObjectId } = require('mongodb').ObjectID,
    router = express.Router(),
    config = require('./../../config')
bcrypt = require('bcrypt-nodejs')
jwt = require('jsonwebtoken')
aws = require('aws-sdk')
multerS3 = require('multer-s3')
uuidv1 = require('uuid/v1')
Validator = require('validatorjs')
multer = require('multer')
FCM = require('fcm-node')
request = require('request')
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



const xAccessToken = require('../../middlewares/xAccessToken');
const event = require('../../api/v2/event');
const fun = require('../../api/v2/function');
const userController = require('../../api/v2/user');

var salt = bcrypt.genSaltSync(10);

const User = require('../../models/user');
const BusinessTiming = require('../../models/businessTiming');
const Type = require('../../models/type');
const BusinessType = require('../../models/businessType');
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
const TyreBrand = require('../../models/tyreBrand');
const TyreSize = require('../../models/tyreSize');
const Referral = require('../../models/referral');
const Collision = require('../../models/collision');
const Customization = require('../../models/customization');
const Washing = require('../../models/washing');
const BookingCategory = require('../../models/bookingCategory');
const Service = require('../../models/service');
const Lead = require('../../models/lead');
const Offer = require('../../models/offer');
const Package = require('../../models/package');
const Gallery = require('../../models/gallery');
const Detailing = require('../../models/detailing');
var secret = config.secret;


/**
 * [Lead API]
 * @param  {[raw json]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {middleware} next [description]
 * @return {[json]}        [description]
*/



router.post('/lead', async function (req, res, next) {
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
            // console.log(diff)
            if (diff >= 24) {
                Lead.create({ mobile: req.body.mobile }).then(async function (lead) {

                    var username = encodeURIComponent("avinay.vminc@gmail.com");
                    var hash = encodeURIComponent("58fc07a01c2a0756a3abf1bb483314af8503efdf");
                    var number = encodeURIComponent("91" + lead.mobile);
                    var sender = encodeURIComponent("VMCARS");
                    var message = encodeURIComponent("Congratulations! Your Business - dd is now online. Show your business to the world using your web address - http://www.careager.com/d");

                    var data = "username=" + username + "&hash=" + hash + "&numbers=" + number + "&sender=" + sender + "&message=" + message;
                    request('http://api.textlocal.in/send/?' + data, function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            return res.status(200).json({
                                responseCode: 200,
                                responseMessage: "Link Sent to Your Mobile No",
                                responseData: {}
                            });
                        }
                    });
                });
            }
            else {
                return res.status(400).json({
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
                        return res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Link Sent to Your Mobile No",
                            responseData: {}
                        });
                    }
                });
            });
        }
    }
});


/**
 * [signup API]
 * @param  {[raw json]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {middleware} next [description]
 * @return {[json]}        [description]
*/

router.post('/username/check', async function (req, res, next) {
    var rules = {
        username: 'required',
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Username is Required",
            responseData: {}
        })
    }
    else {
        var checkUsername = await User.find({ username: req.body.username }).collation({ locale: 'en', strength: 2 }).exec();
        //res.json(checkUsername)
        var regexp = /^[A-Za-z][a-zA-Z0-9._]*$/;
        var check = req.body.username;
        if (check.search(regexp) == -1) {
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
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Username available",
                    responseData: {
                        status: true
                    },
                });
            }
            else {
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



/**
    * [Resend OTP API]
    * @param  {[null]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {Function} next [description]
    * @return {[type]}        [description]
*/

router.post('/resend/otp', async function (req, res, next) {
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
        var otp = Math.floor(Math.random() * 90000) + 10000;

        var data = {
            otp: otp
        };

        var user = await User.findOne({ _id: req.body.id }).exec();

        if (user) {
            await User.findOneAndUpdate({ _id: user._id }, { $set: data }, { new: true }, async function (err, doc) {
                if (err) {
                    var json = ({
                        responseCode: 400,
                        responseMessage: "Error occured",
                        responseData: {}
                    });
                    res.status(400).json(json)
                }

                var updateUser = await User.findOne({ _id: req.body.id }).exec();
                event.otpSms(updateUser);

                var json = ({
                    responseCode: 200,
                    responseMessage: "OTP Sent",
                    responseData: {}
                });
                res.status(200).json(json)
            });
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

/**
 * [Verify OTP API]
 * @param  {[null]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
*/

router.post('/phone/verification', async function (req, res, next) {
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
        var otp = Math.max(0, parseInt(req.body.otp));
        var checkUser = await User.findOne({ otp: otp, _id: req.body.id }).exec();
        if (!checkUser) {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "OTP not matched",
                responseData: {}
            });
        }
        else {

            var data = {
                "type": checkUser.account_info.type,
                "phone_verified": true,
                "status": "Active"
            };

            await User.findOneAndUpdate({ _id: req.body.id }, { $set: { account_info: data, otp: null } }, async function (err, doc) {
                if (err) {
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Error Occured",
                        responseData: {}
                    });
                }
            });

            var user = await User.findOne({ _id: req.body.id }).exec();
            var point = {
                user: user._id,
                points: 100,
                activity: "coin",
                tag: "welcome",
                source: null,
                status: true
            }

            fun.addPoints(point);

            var checkReferral = await Referral.findOne({ user: user._id }).exec();

            if (checkReferral) {
                var point = {
                    user: checkReferral.owner,
                    activity: "coin",
                    tag: "referral",
                    points: 100,
                    source: user._id,
                    status: true
                }
                fun.addPoints(point);
            }

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
    }
});

/**
 * [Login API]
 * @param  {[null]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
*/

router.post('/login', async function (req, res, next) {
    var count = await User.findOne({
        contact_no: req.body.contact_no,
    }).count().exec();

    if (count != 0) {
        var checkPhone = await User.findOne({ contact_no: req.body.contact_no }).exec();
        if (checkPhone) {
            if (checkPhone.account_info.status == "Active") {
                if (!bcrypt.compareSync(req.body.password, checkPhone['password'])) {
                    res.status(400).json({
                        responseCode: 400,
                        responseMessage: "Authentication failed. Wrong password",
                        responseData: {},
                    });
                }
                else {
                    var countType = await User.findOne({ contact_no: req.body.contact_no, 'account_info.type': req.body.type }).count().exec();
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

                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "sucess",
                            responseData: {
                                status: "active",
                                token: token,
                                user: checkPhone
                            }
                        })
                    }
                }
            }
            else if (checkPhone.account_info.status == "Complete") {
                event.otpSms(checkPhone);

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "OTP sent",
                    responseData: {
                        status: checkPhone.account_info.status,
                        user: checkPhone
                    }
                });
            }
            else {
                res.status(200).json({
                    responseCode: 200,
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
            responseMessage: "No user found",
            responseData: {},
        })
    }
});

/**
 * [Generate New Token]
 * @param  {[null]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
*/

router.post('/create/token', xAccessToken.token, async function (req, res, next) {
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

        // var user = decoded.user;

        var user = await User.findById(req.body.id).exec();
        const payload = {
            user: req.body.id
        };
        var token = jwt.sign(payload, secret);

        var status_code = 200;
        var response = {
            responseCode: status_code,
            responseMessage: "sucess",
            responseData: {
                token: token,
                user: user
            },
        }
        return res.status(200).json(response);
    }
});

/**
 * [Register FCM Token and Device ID]
 * @param  {[null]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
*/

router.put('/fcm/update', xAccessToken.token, async function (req, res, next) {
    if (req.headers['devicetype']) {
        if (req.headers['deviceid']) {
            var token = req.headers['x-access-token'];
            var secret = config.secret;
            var decoded = jwt.verify(token, secret);

            var user = decoded.user;

            var count = await User.find({ '_id': user, 'device.deviceType': req.headers['devicetype'], 'device.deviceId': req.headers['deviceid'], fcmId: req.body.fcmId }).exec();

            if (count == 0) {
                User.findOneAndUpdate({ _id: user }, {
                    $push: {
                        "device": {
                            deviceId: req.headers['deviceid'],
                            fcmId: req.body.fcmId,
                            deviceType: req.headers['devicetype']
                        }
                    }
                }, { new: true }, function (err, doc) {
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
                    return res.status(status_code).json(response);
                });
            }
            else {
                var status_code = 200;
                var response = {
                    responseCode: status_code,
                    responseMessage: "Device Already Added",
                    responseData: {},
                }
                return res.status(status_code).json(response);
            }
        }
        else {
            var status_code = 422;
            var response = {
                responseCode: status_code,
                responseMessage: "'deviceid' Required",
                responseData: {},
            }
            return res.status(status_code).json(response);
        }
    }
    else {
        var status_code = 422;
        var response = {
            responseCode: status_code,
            responseMessage: "'devicetype' Required",
            responseData: {},
        }
        return res.status(status_code).json(response);
    }
});

/**
 * [Update Avatar API]
 * @param  {[null]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
*/

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

/**
 * [Update avatar API]
 * @param  {[null]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
*/
/*router.post('/avatar/update',xAccessToken.token, function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var upload = multer({
        storage: multerS3({
            s3: s3,
            bucket: config.BUCKET_NAME+'/avatar',
            acl: 'public-read',
            contentType: multerS3.AUTO_CONTENT_TYPE,
            // contentDisposition: 'attachment',
            key: function (req, file, cb) {
                let extArray = file.mimetype.split("/");
                let extension = extArray[extArray.length - 1];

                if(extension == 'png' || extension == 'jpg' || extension == 'jpeg' || extension == 'gif'){
                    cb(null, uuidv1() + '.' +extension);
                }
                else{
                    var json = ({
                        responseCode: 400,
                        responseMessage: "Invalid extension",
                        responseData: {}
                    });9
                    res.status(400).json(json)
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

        if(req.files.length == 0){
            var json = ({
                responseCode: 400,
                responseMessage: "Media is required",
                responseData: {}
            });
            res.status(400).json(json)
        }else{
            var data = {
                avatar: req.files[0].key,
            };

            User.findOneAndUpdate({_id: decoded.user}, {$set:data}, {new: true}, function(err, doc){
                if(err){
                     var json = ({
                        responseCode: 400,
                        responseMessage: "Error occured",
                        responseData: {}
                    });
        
                    res.status(400).json(json)
                }else{
                    var json = ({
                        responseCode: 200,
                        responseMessage: "avatar has been updated",
                        responseData: {
                            avatar:"https://s3.ap-south-1.amazonaws.com/"+config.BUCKET_NAME+"/avatar/"+doc.avatar
                        }
                    });
                    res.status(200).json(json)
                }
            });
        }
    });
});
*/

/**
    * [Update Username]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

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
        } else {
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
    } else {
        var json = ({
            responseCode: 400,
            responseMessage: "Invalid user",
            responseData: {}
        });
        res.status(400).json(json)
    }
});


/**
    * [Update Phone]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

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
                        updated_at: new Date()
                    };

                    UpdatePhone.create(data).then(async function (doc) {

                        event.otpSms(data);

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


/**
    * [Update Phone]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

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

                await UpdatePhone.findOneAndUpdate({ _id: req.body.id }, { $set: { status: true } }, function (err, doc) { });

                await User.findOneAndUpdate({ _id: decoded.user }, { $set: data }, function (err, doc) {
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


/**
    * [Update Email]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

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

/**
    * [Update Password]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/
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

            //var hash = bcrypt.hashSync();
            var newhash = bcrypt.hashSync(req.body.password);

            bcrypt.compare(req.body.old_password, user.password, function (err, status) {
                if (status == true) {
                    if (err) return next(err);

                    var updateData = {
                        password: newhash,
                    }

                    User.findOneAndUpdate({ _id: decoded.user }, { $set: updateData }, { new: true }, function (err, doc) {
                        if (err) {
                            var json = ({
                                responseCode: 400,
                                responseMessage: "Please Try Again",
                                responseData: err
                            });

                            res.status(400).json(json)
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

                    res.status(400).json(json)
                }
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
});



/**
    * [Social Info Update]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

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



/**
    * [Resend OTP API]
    * @param  {[null]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {Function} next [description]
    * @return {[type]}        [description]
*/

router.post('/forgot/password', async function (req, res, next) {
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
        var otp = Math.floor(Math.random() * 90000) + 10000;
        var data = {
            otp: otp,
        };
        var user = await User.findOne({ contact_no: req.body.contact_no, "account_info.type": req.body.type }).exec();
        if (user) {
            await User.findOneAndUpdate({ _id: user._id }, { $set: data }, { new: true }, async function (err, doc) {
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

                var json = ({
                    responseCode: 200,
                    responseMessage: "OTP send successfully",
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
                responseMessage: "User Not Found",
                responseData: {}
            });

            res.status(400).json(json)
        }
    }
});

/**
    * [Change Password]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

router.post('/reset/password/otp/verification', async function (req, res, next) {
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
        var count = await User.find({ _id: req.body.id, otp: req.body.otp }).count().exec();
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

/**
    * [Change Password]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

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
    } else {
        var count = await User.find({ _id: req.body.id, "account_info.type": req.body.type }).count().exec();

        if (count == 1) {

            var user = await User.findOne({ _id: req.body.id }).exec();
            if (user.account_info.type == req.body.type) {
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
                        await User.findOneAndUpdate({ _id: user._id }, { $set: { otp: null } }, function (err, doc) { });

                        const payload = {
                            user: user._id
                        };

                        var token = jwt.sign(payload, secret);

                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Password has been updated",
                            responseData: {
                                token: token,
                                user: user
                            }
                        });
                    }
                });
            }
            else {
                var json = ({
                    responseCode: 401,
                    responseMessage: "Unauthorized",
                    responseData: {}
                });

                res.status(401).json(json)
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


//-------------------------START OF CAR API----------------------------

/**
 * [Add Car API]
 * @param  {[null]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
*/

router.post('/car/add', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var user = decoded.user;
    var result = new Object();

    var userInfo = await User.findById(user).exec();

    var currentDate = new Date();

    var variant = await Variant.findOne({ _id: req.body.variant }).populate('model').select('-service_schedule').exec();

    if (variant != null && variant) {
        var reg = await Car.find({ registration_no: req.body.registration_no, status: true }).exec();
        if (Object.keys(reg).length == 0) {
            var count = await Car.find({}).count().exec();

            if (req.body.longitude != undefined || req.body.longitude != null && req.body.latitude != undefined || req.body.latitude != null) {
                req.body.geometry = [req.body.longitude, req.body.latitude];
            }
            else {
                req.body.geometry = userInfo.geometry;
            }



            req.body.created_at = currentDate;
            req.body.updated_at = currentDate;

            req.body.title = variant.variant;
            req.body.automaker = variant.model.automaker;
            req.body.model = variant.model._id;
            req.body.user = user;
            req.body.fuel_type = variant.specification.fuel_type;
            req.body.transmission = variant.specification.type;
            req.body.carId = 1000000 + count,
                // console.log(req.body.transmission)

                await Car.create(req.body).then(async function (car) {

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
                                insurance: doc.insurance,
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

                    return res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Car has been added",
                        responseData: {
                            item: result
                        }
                    });

                }).catch(next);
        }
        else {
            return res.status(422).json({
                responseCode: 422,
                responseMessage: "registration no already exist",
                responseData: {}
            });
        }
    }
    else {
        return res.status(400).json({
            responseCode: 400,
            responseMessage: "Unprocessable Entity",
            responseData: {}
        });
    }
});

/**
 * [Edit Car API]
 * @param  {[null]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
*/

router.put('/car/edit', xAccessToken.token, async function (req, res, next) {
    var rules = {
        car_id: "required",
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
        var car = await Car.findOne({ _id: req.body.car_id, user: user }).exec();
        var variant = await Variant.findOne({ _id: req.body.variant }).select('-service_schedule').exec();
        if (car) {
            if (variant) {
                req.body.geometry = [req.body.longitude, req.body.latitude];
                req.body.model = variant.model;
                req.body.title = variant.variant;
                req.body.fuel_type = variant.specification.fuel_type;
                req.body.transmission = variant.specification.type;
                req.body.registration_no = car.registration_no;
                req.body.updated_at = new Date();

                await Car.findOneAndUpdate({ _id: req.body.car_id, user: user }, { $set: req.body }, { new: false }, async function (err, s) {
                    if (err) {
                        var json = ({
                            responseCode: 400,
                            responseMessage: "Error occured",
                            responseData: {}
                        });

                        res.status(400).json(json)
                    }
                    else {

                        fun.addMember(user, variant.model);

                        await Car.findOne({ _id: req.body.car_id })
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
                                    insurance: doc.insurance,
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

                        return res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Car has been edited",
                            responseData: {
                                item: result
                            }
                        });
                    }
                });

            }
            else {
                return res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Unprocessable Entity",
                    responseData: {}
                });
            }
        }
        else {
            return res.status(401).json({
                responseCode: 401,
                responseMessage: "Unauthorized",
                responseData: {}
            });
        }
    }
});
/**
 * [Edit Car API]
 * @param  {[null]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
*/

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
        var car = await Car.find({ _id: req.body.car, user: user }).count().exec();
        if (car == 1) {
            req.body.status = false;
            req.body.updated_at = new Date();

            await Car.findOneAndUpdate({ _id: req.body.car, user: user }, { $set: req.body }, { new: false }, async function (err, s) {
                if (err) {
                    return res.status(400).json({
                        responseCode: 400,
                        responseMessage: "Error occured",
                        responseData: {}
                    });

                }
                else {
                    return res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Car has been deleted",
                        responseData: {}
                    });
                }
            });
        }
        else {
            return res.status(401).json({
                responseCode: 401,
                responseMessage: "Unauthorized",
                responseData: {}
            });
        }
    }
});


/**
    * [Add Business Car Image]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

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


/**
 * [Remove Car Images (AWS S3)]
 * @param  {[null]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
*/

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

/**
    * [Publish Car]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

router.put('/car/publish', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var user = decoded.user;

    var car_id = req.body.id;

    var car = await Car.findOne({ _id: car_id, user: user }).exec();

    if (car) {
        if (car.publish == true) {
            var data = {
                publish: false,
                updated_at: new Date()
            };
        }
        else {
            var data = {
                publish: true,
                updated_at: new Date()
            };
        }

        await Car.findOneAndUpdate({ _id: req.body.id, user: user }, { $set: data }, { new: true }, function (err, doc) { });

        if (data.publish == true) {
            var status = 'published';
            var isPublished = true;
        } else {
            var status = "unpublished";
            var isPublished = false;
        }

        const totalCarCount = await Car.count({ user: user }).exec();

        const publishedCarCount = await Car.count({ user: user, publish: true }).exec();

        var json = ({
            responseCode: 200,
            responseMessage: "Car has been " + status,
            responseData: {
                total: totalCarCount,
                published: publishedCarCount,
                publish: isPublished,
            }
        });
        res.status(200).json(json)
    }
    else {
        var json = ({
            responseCode: 401,
            responseMessage: "Unauthorized",
            responseData: {}
        });
        res.status(401).json(json)
    }
});

/**
    * [Business Car]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

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
                insurance: doc.insurance,
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

router.get('/car/get', xAccessToken.token, async function (req, res, next) {
    var carId = req.query.id;
    var result = [];

    await Car.findOne({ _id: carId, status: true })
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
                insurance: doc.insurance,
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
                created_at: moment(doc.created_at).tz(req.headers['tz']).format('ll'),
                updated_at: moment(doc.updated_at).tz(req.headers['tz']).format('ll'),
            };
        });

    //res.json(result)
    if (result) {
        return res.status(200).json({
            responseCode: 200,
            responseMessage: "Success",
            responseData: result
        });
    }
    else {
        return res.status(400).json({
            responseCode: 400,
            responseMessage: "No Car Found",
            responseData: {}
        });
    }

});

/**
    * [vehicle Details]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

router.get('/vehicle/detail', async function (req, res, next) {
    var automaker = [];
    // var userId = req.query.id;
    // const user = await User.find({_id:userId}).exec();

    await Automaker.find({}).cursor().eachAsync(async (maker) => {
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
    var color = [
        { value: "White" },
        { value: "Silver" },
        { value: "Black" },
        { value: "Grey" },
        { value: "Blue" },
        { value: "Red" },
        { value: "Brown" },
        { value: "Green" }
    ];

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

    return res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: {
            category: categories,
            automaker: await Automaker.find({}).sort({ maker: 1 }).exec(),
            country: await Country.find({}).exec()
        }
    });
});


/**
    * [vehicle Details]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

router.get('/master-data', async function (req, res, next) {

    var automaker = [];
    // var userId = req.query.id;
    // const user = await User.find({_id:userId}).exec();

    await Automaker.find({}).sort({ maker: 1 }).cursor().eachAsync(async (maker) => {
        var model = await Model.find({ automaker: maker._id }).select("_id model id").exec();
        automaker.push({
            _id: maker._id,
            maker: maker.maker,
            logo: maker.logo,
            value: maker.value,
            id: maker.id,
            model: model
        });
    });

    var models = await Model.find({}).sort({ value: 1 }).exec();
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


//-----------------------END OF CAR API------------------------------------

/**
    * [Profile Information]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

router.get('/loggedIn/details', xAccessToken.token, async function (req, res, next) {

    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var points = 0;
    var level = 1;
    var reviews = [];
    var userId = req.query.id;

    var user = await User.findOne({ _id: decoded.user }).select('-device -otp -password -social_id -social_login').exec();
    await Point.find({ user: user._id, type: "credit" }).cursor().eachAsync(async (u) => {
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

    var pointsInfo = {
        level: level,
        points: points
    };
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
        points: pointsInfo
    }

    res.status(200).json({
        responseCode: 200,
        responseMessage: "",
        responseData: data
    })
});

/**
    * [Profile Information]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

router.get('/profile/detail', xAccessToken.token, async function (req, res, next) {

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


                var rating = await Review.find({ business: user._id }).exec();
                rating = _.meanBy(rating, (p) => p.rating);

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
                    is_chat_active: user.device.length > 0 ? true : false,
                    timing: await BusinessTiming.find({ business: user._id }).select('-created_at -updated_at').exec(),
                    business_gallery: await BusinessGallery.find({ business: user._id }).select('-created_at -updated_at').exec(),
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




/**
    * [Profile Information]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
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

        //res.json(user)

        if (user) {
            if (user.account_info.type == "business") {
                await Car.find({ user: user._id })
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
                            insurance: doc.insurance,
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

                var cars = await Car.find({ user: user._id }).populate('thumbnails').populate('user').exec();

                const totalStockCount = await Car.count({ user: user._id }).exec();

                var review = await Review.find({ user: user._id }).count().exec();

                var modelReview = await ModelReview.find({ user: user._id }).count().exec();

                var posts = await Post.find({ user: user._id }).count().exec();

                var bookings = await Booking.find({ user: user._id }).count().exec();

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


/**
    * [Get Business Timing]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

router.get('/timing', xAccessToken.token, async function (req, res, next) {
    return res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: {
            open: ["12:00 AM", "12:30 AM", "01:00 AM", "01:30 AM", "02:00 AM", "02:30 AM", "03:00 AM", "03:30 AM", "04:00 AM", "04:30 AM", "05:00 AM", "05:30 AM", "06:00 AM", "06:30 AM", "07:00 AM", "07:30 AM", "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM", "08:00 PM", "08:30 PM", "09:00 PM", "09:30 PM", "10:00 PM", "10:30 PM", "11:00 PM", "11:30 PM"],
            close: ["12:00 AM", "12:30 AM", "01:00 AM", "01:30 AM", "02:00 AM", "02:30 AM", "03:00 AM", "03:30 AM", "04:00 AM", "04:30 AM", "05:00 AM", "05:30 AM", "06:00 AM", "06:30 AM", "07:00 AM", "07:30 AM", "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM", "08:00 PM", "08:30 PM", "09:00 PM", "09:30 PM", "10:00 PM", "10:30 PM", "11:00 PM", "11:30 PM"]
        }
    });

});

/**
 * [Review Business API]
 * @param  {[null]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
*/

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
        return res.status(200).json({
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
    }).catch(next);
});

/**
 * [Claim Business API]
 * @param  {[null]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
*/

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
            return res.status(200).json({
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
        }).catch(next);
    }
});

/**
 * [Add Local Business API User API]
 * @param  {[raw json]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {middleware} next [description]
 * @return {[json]}        [description]
*/

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
                req.body.otp = Math.floor(Math.random() * 90000) + 10000;;
                req.body.isCarEager = false;


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
                }).catch(next);

            }
        }
    });

});


/*router.post('/search/username', async function (req, res, next) {
    var get =  await User.find({'username' : req.query.username}).count().exec();
    if(get==0)
    {
        res.status(200).json({
            responseCode: 200,
            responseMessage: "username is available",
            responseData: get,
        });
    }
    else{
        res.status(200).json({
            responseCode: 200,
            responseMessage: "username is not available",
            responseData: get,
        });    
    }
});*/


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

/**
 * [Expore BusinessAPI]
 * @param  {[null]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
*/

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


/*
 * [Bookings API]
 * @param  {[raw json]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {middleware} next [description]
 * @return {[json]}        [description]
*/

router.get('/bookings/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var bookings = [];
    if (req.query.page == undefined) {
        var page = 0;
    }
    else {
        var page = req.query.page;
    }

    var page = Math.max(0, parseInt(page));
    var userType = await User.findById(user).exec();
    if (userType.account_info.type == "business") {
        await Booking.find({ 'business': user, 'status': req.query.status })
            .populate({ path: 'user', populate: { path: 'user', select: "_id id name" } })
            .populate({ path: 'car', select: '_id id title', populate: { path: 'thumbnails' } })
            .sort({ created_at: -1 }).skip(config.perPage * page).limit(config.perPage)
            .cursor().eachAsync(async (booking) => {
                if (booking.car.thumbnails[0]) {
                    var thumbnail = [booking.car.thumbnails[0]];
                }
                else {
                    var thumbnail = []
                }
                bookings.push({
                    _id: booking._id,
                    id: booking._id,
                    car: {
                        title: booking.car.title,
                        _id: booking.car._id,
                        id: booking.car.id,
                        registration_no: booking.car.registration_no,
                        thumbnails: thumbnail
                    },
                    user: {
                        name: booking.user.name,
                        _id: booking.user._id,
                        id: booking.user.id,
                    },
                    services: booking.services,
                    convenience: booking.convenience,
                    date: moment(booking.date).tz(req.headers['tz']).format('ll'),
                    time_slot: booking.time_slot,
                    status: booking.status,
                    booking_no: booking.booking_no,
                    payment: booking.payment,
                    txnid: booking.txnid,
                    __v: booking.__v,
                    updated_at: booking.updated_at,
                    updated_at: booking.updated_at,
                });
            });
    }
    else {
        await Booking.find({ 'user': user, 'status': { $ne: "Inactive" } })
            .populate({ path: 'business', populate: { path: 'user' }, select: "_id id name" })
            .populate({ path: 'car', populate: { path: 'thumbnails' } })
            .sort({ created_at: -1 }).skip(config.perPage * page).limit(config.perPage)
            .cursor().eachAsync(async (booking) => {
                if (booking.car.thumbnails[0]) {
                    var thumbnail = [booking.car.thumbnails[0]];
                }
                else {
                    var thumbnail = [];
                }
                bookings.push({
                    _id: booking._id,
                    id: booking._id,
                    car: {
                        title: booking.car.title,
                        _id: booking.car._id,
                        id: booking.car.id,
                        registration_no: booking.car.registration_no,
                        thumbnails: thumbnail
                    },
                    business: {
                        name: booking.business.name,
                        _id: booking.business._id,
                        id: booking.business.id,
                    },
                    services: booking.services,
                    convenience: booking.convenience,
                    date: moment(booking.date).tz(req.headers['tz']).format('ll'),
                    time_slot: booking.time_slot,
                    status: booking.status,
                    booking_no: booking.booking_no,
                    payment: booking.payment,
                    txnid: booking.txnid,
                    __v: booking.__v,
                    updated_at: booking.updated_at,
                    updated_at: booking.updated_at,
                });
            });
    }

    res.status(200).json({
        responseCode: 200,
        responseMessage: "",
        responseData: bookings,
    });
});


/*
 * [Bookings API]
 * @param  {[raw json]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {middleware} next [description]
 * @return {[json]}        [description]
 */


router.get('/booking/details', xAccessToken.token, async function (req, res, next) {
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

        var userType = await User.findById(user).exec();

        if (userType.account_info.type == "business") {
            var booking = await Booking.findOne({ 'booking_no': req.query.booking })
                .populate({ path: 'manager', populate: { path: 'user', select: "_id id name contact_no email" } })
                .populate({ path: 'advisor', populate: { path: 'user', select: "_id id name contact_no email" } })
                .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no email" } })
                .populate({ path: 'business', populate: { path: 'user', select: "_id id name contact_no email" } })
                .populate({ path: 'car', select: '_id id title registration_no ic rc' })
                .exec();

            if (booking) {
                if (booking.car) {
                    var car = {
                        title: booking.car.title,
                        _id: booking.car._id,
                        id: booking.car.id,
                        registration_no: booking.car.registration_no,
                        ic_address: booking.car.ic_address,
                        rc_address: booking.car.rc_address,
                    }
                }
                else {
                    var car = {}
                }

                if (booking.manager) {
                    var manager = {
                        name: booking.manager.name,
                        _id: booking.manager._id,
                        id: booking.manager.id,
                        contact_no: booking.manager.contact_no,
                        email: booking.manager.email
                    }
                }
                else {
                    var manager = {}
                }

                if (booking.address) {
                    var address = await Address.findOne({ _id: booking.address }).exec();
                }
                else {
                    var address = {};
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
                        email: booking.user.email
                    },
                    business: {
                        name: booking.business.name,
                        _id: booking.business._id,
                        id: booking.business.id,
                        contact_no: booking.business.contact_no,
                        email: booking.business.email
                    },
                    advisor: {
                        name: booking.advisor.name,
                        _id: booking.advisor._id,
                        id: booking.advisor.id,
                        contact_no: booking.advisor.contact_no,
                        email: booking.advisor.email
                    },
                    manager: manager,
                    services: booking.services,
                    convenience: booking.convenience,
                    date: moment(booking.date).tz(req.headers['tz']).format('ll'),
                    time_slot: booking.time_slot,
                    status: booking.status,
                    booking_no: booking.booking_no,
                    estimation_requested: booking.estimation_requested,
                    address: address,
                    payment: booking.payment,
                    __v: booking.__v,
                    updated_at: booking.updated_at,
                    updated_at: booking.updated_at,
                });

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "",
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
        else {
            var booking = await Booking.findOne({ 'booking_no': req.query.booking })
                .populate({ path: 'business', populate: { path: 'user' }, select: "_id id name" })
                .populate({ path: 'car', populate: { path: 'thumbnails' } })
                .exec();

            if (booking) {
                if (booking.car.thumbnails[0]) {
                    var thumbnail = [booking.car.thumbnails[0]];
                }
                else {
                    var thumbnail = [];
                }

                bookings.push({
                    _id: booking._id,
                    id: booking._id,
                    car: {
                        title: booking.car.title,
                        _id: booking.car._id,
                        id: booking.car.id,
                        registration_no: booking.car.registration_no,
                        thumbnails: thumbnail
                    },
                    business: {
                        name: booking.business.name,
                        _id: booking.business._id,
                        id: booking.business.id,
                    },
                    services: booking.services,
                    convenience: booking.convenience,
                    date: moment(booking.date).tz(req.headers['tz']).format('ll'),
                    time_slot: booking.time_slot,
                    status: booking.status,
                    booking_no: booking.booking_no,
                    payment: booking.payment,
                    txnid: booking.txnid,
                    __v: booking.__v,
                    updated_at: booking.updated_at,
                    updated_at: booking.updated_at,
                });


                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "",
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
    }
});


/*
 * [Booking Status API]
 * @param  {[raw json]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {middleware} next [description]
 * @return {[json]}        [description]
*/

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
        if (req.body.status == "Confirmed" || req.body.status == "Completed" || req.body.status == "Reject") {
            var check = await Booking.findOne({ _id: req.body.id, business: user }).exec();
        }
        else if (req.body.status == "Cancelled") {
            var check = await Booking.findOne({ _id: req.body.id, user: user }).exec();
        }

        if (!check) {
            res.status(401).json({
                responseCode: 401,
                responseMessage: "Unauthorized",
                responseData: {},
            });
        }
        else {
            var status = check.status;
            var data = {
                status: req.body.status,
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

                    if (req.body.status == "Confirmed") {
                        var notify = {
                            receiver: [booking.user],
                            activity: "booking",
                            tag: "bookingConfirmation",
                            source: check._id,
                            sender: user,
                            points: 0
                        };

                        fun.newNotification(notify);
                        event.bookingStatusMail(booking.user, booking._id)
                    }

                    else if (req.body.status == "Completed") {
                        var point = {
                            user: check.user,
                            activity: "coin",
                            tag: "bookingCompleted",
                            source: check._id,
                            sender: user,
                            points: 10,
                            status: true
                        }

                        fun.addPoints(point)
                    }

                    else if (req.body.status == "Cancelled") {
                        if (status == "Confirmed") {
                            var notify = {
                                receiver: [booking.user],
                                activity: "booking",
                                tag: "userCancelledBooking",
                                source: check._id,
                                sender: user,
                                points: 0
                            }

                            fun.newNotification(notify);
                            event.bookingStatusMail(booking.user, booking._id)

                            /*var point = {
                                user: booking.user,
                                activity: "booking",
                                tag: "bookingCancelled",
                                points: 10,
                                status: true
                            }
                            fun.deductPoints(point); */
                        }
                        else {
                            var notify = {
                                receiver: [booking.business],
                                activity: "booking",
                                tag: "userCancelledBooking",
                                source: booking._id,
                                sender: user,
                                points: 0
                            }

                            fun.newNotification(notify);
                            event.bookingStatusMail(booking.business, booking._id)
                        }
                        await CouponUsed.remove({ user: user, booking: booking._id }).exec();
                    }

                    var json = ({
                        responseCode: 200,
                        responseMessage: "Booking has been " + req.body.status,
                        responseData: {}
                    });
                    res.status(200).json(json)
                }
            });
        }
    }
});


/**
 * [Booking Status API]
 * @param  {[raw json]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {middleware} next [description]
 * @return {[json]}        [description]
 **/

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


/**
 * [Booking Get API]
 * @param  {[raw json]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {middleware} next [description]
 * @return {[json]}        [description]
*/

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


/**
 * [Bookmark Business API]
 * @param  {[null]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
*/

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

/**
    * [Get Bookmarked Cars]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/
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


/**
    * [Bookmark Car]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/
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

/**
    * [Get Bookmarked Cars]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/
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

    var json = ({
        responseCode: 200,
        responseMessage: "success",
        responseData: cars
    });
    res.status(200).json(json)
});

/**
    * [Bookmark Offer]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/
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

/****
    * [Get Bookmarked Offers]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/
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

/**
    * [Bookmark Product]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/
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

/**
    * [Get Bookmarked Product]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/
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


/**
    * [Bookmark Product]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

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


/**
    * [Get Bookmarked Model]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/
router.get('/model/bookmark/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var user = decoded.user;

    var models = [];

    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }

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

    var json = ({
        responseCode: 200,
        responseMessage: "success",
        responseData: models
    });
    res.status(200).json(json)
});


/**
 * [Get Bookmarks API]
 * @param  {[null]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
*/

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

/**
 * [Get All Profile Reviews API]
 * @param  {[null]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
*/

router.get('/all/reviews', xAccessToken.token, async function (req, res, next) {
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

    var review = await Review.find({ business: req.query.id }).populate('user', 'name username avatar').sort({ created_at: -1 }).skip(config.perPage * page).limit(config.perPage).exec();


    var json = ({
        responseCode: 200,
        responseMessage: "success",
        responseData: review
    });

    res.status(200).json(json)
});


/**
 * [Get All Profile Cars API]
 * @param  {[null]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
*/

router.get('/all/cars', xAccessToken.token, async function (req, res, next) {
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
                insurance: doc.insurance,
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
});


/**
 * [Get All Profile Products API]
 * @param  {[null]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
*/

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


/**
 * [Get All Profile Offers API]
 * @param  {[null]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
*/

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

/**
 * [Get Bookmarked Model API]
 * @param  {[null]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
*/

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

/**
 * [Latest offers API]
 * @param  {[null]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
*/

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


/**
 * [Latest offers API]
 * @param  {[null]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
*/

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


    await BusinessOffer.find({ isCarEager: true })
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


/**
 * [Expore BusinessAPI]
 * @param  {[null]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
*/

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

/**
 * [Expore BusinessAPI]
 * @param  {[null]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
*/

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

    // we need to convert the distance to radians
    // the raduis of Earth is approximately 6371 kilometers
    maxDistance /= 6371;


    if (req.query.category == "All") {
        var query = User.find({
            geometry: {
                $near: [parseFloat(req.query.longitude), parseFloat(req.query.latitude)],
                $maxDistance: maxDistance
            },
            'account_info.type': 'business',
        });
    }
    else {
        var query = User.find({
            'account_info.type': 'business',
            'business_info.business_category': req.query.category,
            geometry: {
                $near: [parseFloat(req.query.longitude), parseFloat(req.query.latitude)],
                $maxDistance: maxDistance
            }
        })
    }


    /*if(req.query.company){
        query = query.where('business_info.company').eq(req.query.company);
    }*/

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
        })

    res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: result,
    });
});

/* [Expore New Car]
 * @param  {[null]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
*/

/*router.get('/explore/new/car',xAccessToken.token,async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var filterBy = new Object();
    var filter = new Object();

    var user = decoded.user;
    var result=[];
    var query;

    if(req.query.page == undefined){
        var page = 0;
    }
    else{
        var page = req.query.page;
    }

    var query = Variant.find();


    if(req.query.fuel){
        fuel = req.query.fuel;
        query = query.where('specification.fuel_type').in(fuel.split(','));
    }

    if(req.query.transmission){
        transmissions = req.query.transmission;
        query = query.where('specification.type').in(transmissions.split(','));
    }

    if(req.query.body_style){
        body_style = req.query.body_style;
        query = query.where('specification.body_type').in(body_style.split(','));
    }   

    if(req.query.model){
        models = req.query.model;
        filterBy.model = models.split(','); 
        query = query.where('model').in(models.split(','));
    } 

    if(req.query.min && req.query.max){
        query = query.where('price').gte(req.query.min*100000).lte(req.query.max*100000);
    }

    await query.select('-service_schedule')
    .populate({path: 'model',populate: {path: 'automaker'}})
    .sort({price: 1})
    .limit(config.perPage).skip(config.perPage * page)
    .lean()
    .cursor().eachAsync(async(doc) => {
        result.push({
            id: doc.model._id,
            id: doc.model.id,
            title: doc.model.model,
            model: doc.model.value,
            automaker:  doc.model.automaker, 
            price: price(doc.price),
            variants: {
                id: doc._id,
                id: doc.id,
                variant: doc.variant,
                value: doc.value,
                specification: {
                    type: doc.specification.type,
                    power: doc.specification.power,
                    gears: doc.specification.gears,
                    fuel_type: doc.specification.fuel_type,
                    body_type: doc.specification.body_type,
                    length: doc.specification.length,
                    displacement: doc.specification.displacement,
                    highway_mileage: doc.specification.highway_mileage,
                    city_mileage: doc.specification.city_mileage
                }
            },
            images: await q.all(modelMedia(doc.model._id,"image")),
            colors: await q.all(colors(doc.model._id,"image")),
            is_bookmarked: doc.model.is_bookmarked
        });
    });

    //var result = _(result).groupBy(x => x.model).map((value, key) => ({group: value, variant: variants})).value();
        
    res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: result,
    });
});
*/

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

/**
 * [Expore Used Car]
 * @param  {[null]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
*/

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

    if (req.query.longitude && req.query.latitude) {
        var query = Car.find({
            geometry: {
                $near: [parseFloat(req.query.longitude), parseFloat(req.query.latitude)],
                $maxDistance: parseInt(req.query.range),
            },
            'publish': true,
            'status': true
        })
    }


    if (req.query.fuel) {
        fuel = req.query.fuel;
        query = query.where('fuel_type').in(fuel.split(','));
    }

    if (req.query.transmission) {
        transmissions = req.query.transmission;
        query = query.where('transmission').in(transmissions.split(','));
    }

    if (req.query.body_style) {
        body_style = req.query.body_style;
        query = query.where('body_style').in(body_style.split(','));
    }

    if (req.query.model) {
        models = req.query.model;
        filterBy.model = models.split(',');
        query = query.where('model').in(models.split(','));
    }

    if (req.query.min && req.query.max) {
        query = query.where('price').gte(req.query.min * 100000).lte(req.query.max * 100000);
    }

    await query
        .populate({ path: 'thumbnails' })
        .populate('bookmark')
        .populate({ path: 'user', select: 'name username avatar avatar_address adress' })
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
                insurance: doc.insurance,
                location: doc.location,
                manufacture_year: doc.manufacture_year,
                mileage: doc.mileage,
                owner: doc.owner,
                registration_no: doc.registration_no,
                service_history: doc.service_history,
                transmission: doc.transmission,
                variant_id: doc.variant_id,
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
                premium: doc.premium,
                careager_rating: doc.careager_rating,
                video_url: doc.video_url,
                is_bookmarked: doc.is_bookmarked,
                id: doc.id,
                thumbnails: doc.thumbnails
            });
        });



    res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: result,
    });
});


/** [Automaker Specification]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]} [description]
*/

router.get('/maker/specification', async function (req, res, next) {
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
        });
    }
    else {
        var data = [];
        var modelReview = [];

        await Model.find({ automaker: req.query.id }).populate('automaker').cursor().eachAsync(async (model) => {
            data.push({
                id: model._id,
                id: model._id,
                title: model.model,
                automaker: model.automaker,
                price: minMaxPrice(model.price[0].min, model.price[0].max),
                variants: await q.all(variants(model._id)),
                images: await q.all(modelMedia(model._id, "image")),
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

/** [Model Specification]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]} [description]
*/

router.get('/model/specification', xAccessToken.token, async function (req, res, next) {
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
        var data = new Object();
        var modelReview = [];

        await Model.find({ _id: req.query.id })
            .populate('bookmark')
            .populate('rating')
            .cursor().eachAsync(async (model) => {
                //res.json(model)

                data = {
                    id: model._id,
                    id: model._id,
                    title: model.model,
                    model: model.value,
                    is_bookmarked: model.is_bookmarked,
                    feature_image: "https://s3.ap-south-1.amazonaws.com/" + config.BUCKET_NAME + "/model/" + model.feature_image,
                    price: minMaxPrice(model.price[0].min, model.price[0].max),
                    verdict: model.verdict,
                    media_rating: model.media_rating,
                    user_rating: model.user_rating,
                    count_rating: model.rating.length,
                    careager_rating: model.careager_rating,
                    colors: await q.all(colors(model._id)),
                    user_review: await q.all(modelReviews(model._id, req.headers['tz'])),
                    variants: await q.all(variants(model._id)),
                    images: await q.all(modelMedia(model._id, "image")),
                    videos: await q.all(modelMedia(model._id, "video")),
                }
            });

        var json = ({
            responseCode: 200,
            responseMessage: "success",
            responseData: data
        });
        res.status(200).json(json)
    }
});


router.get('/model/reviews/get', xAccessToken.token, async function (req, res, next) {
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
        var modelReview = [];

        if (req.query.page == undefined) {
            var page = 0;
        } else {
            var page = req.query.page;
        }

        await ModelReview.find({ model: req.query.id })
            .populate({ path: 'user', select: 'name username avatar avatar avatar avatar_address account_info' })
            .sort({ created_at: -1 }).limit(config.perPage).skip(config.perPage * page)
            .cursor().eachAsync(async (review) => {
                modelReview.push({
                    user: review.user,
                    _id: review._id,
                    id: review._id,
                    model: review.model,
                    rating: review.rating,
                    review: review.review,
                    created_at: moment(review.created_at).tz(req.headers['tz']).format('ll')
                });
            });

        var json = ({
            responseCode: 200,
            responseMessage: "success",
            responseData: modelReview
        });
        res.status(200).json(json)
    }
});



/** [Get Variant Specification]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

router.get('/variant/specification', xAccessToken.token, async function (req, res, next) {
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
        await Variant.findById(req.query.id).select('-service_schedule').populate({ path: 'model', populate: { path: 'automaker' } }).cursor().eachAsync(async (v) => {
            variant.push({
                id: v._id,
                id: v._id,
                price: price(v.price),
                title: v.variant,
                model: v.model,
                specification: [{
                    heading: "Body",
                    body: [{
                        key: "Seating Capacity",
                        value: v.specification.seating_capacity
                    },
                    {
                        key: "Body Type",
                        value: v.specification.body_type
                    },
                    {
                        key: "Doors",
                        value: v.specification.doors
                    }]
                },
                {
                    heading: "Engine",
                    body: [{
                        key: "Cylinder Configuration",
                        value: v.specification.cylinder_configuration
                    },
                    {
                        key: "Cylinders",
                        value: v.specification.cylinders
                    },
                    {
                        key: "Valves Per Cylinder",
                        value: v.specification.valves_per_cylinder
                    },
                    {
                        key: "Displacement",
                        value: v.specification.displacement
                    },
                    {
                        key: "Power",
                        value: v.specification.power
                    },
                    {
                        key: "Torque",
                        value: v.specification.torque
                    }]
                },
                {
                    heading: "Safety Feature",
                    body: [{
                        key: "Number Of Airbags",
                        value: v.specification.number_of_airbags
                    },
                    {
                        key: "Airbags",
                        value: v.specification.airbags
                    },
                    {
                        key: "Hill Assist",
                        value: v.specification.hill_assist
                    },
                    {
                        key: "Engine Immobilizer",
                        value: v.specification.engine_immobilizer
                    },
                    {
                        key: "ASR / Traction Control",
                        value: v.specification.asr_traction_control
                    },
                    {
                        key: "Child Safety Locks",
                        value: v.specification.child_safety_locks
                    }]
                },
                {
                    heading: "Interior Feature",
                    body: [{
                        key: "Cylinder Configuration",
                        value: v.specification.cylinder_configuration
                    },
                    {
                        key: "Cylinders",
                        value: v.specification.cylinders
                    },
                    {
                        key: "Valves Per Cylinder",
                        value: v.specification.valves_per_cylinder
                    },
                    {
                        key: "Displacement",
                        value: v.specification.displacement
                    },
                    {
                        key: "Power",
                        value: v.specification.power
                    },
                    {
                        key: "Torque",
                        value: v.specification.torque
                    }]
                },
                {
                    heading: "Dimensions and Weights",
                    body: [{
                        key: "Length",
                        value: v.specification.length
                    },
                    {
                        key: "Width",
                        value: v.specification.width
                    },
                    {
                        key: "Height",
                        value: v.specification.height
                    },
                    {
                        key: "Wheelbase",
                        value: v.specification.wheelbase
                    },
                    {
                        key: "Ground Clearance",
                        value: v.specification.ground_clearance
                    },
                    {
                        key: "Kerb Weight",
                        value: v.specification.kerb_weight
                    },
                    {
                        key: "Gross Vehicle Weight",
                        value: v.specification.gross_vehicle_weight
                    },
                    {
                        key: "Boot Space",
                        value: v.specification.boot_space
                    },
                    {
                        key: "Minimum Turning Radius",
                        value: v.specification.minimum_turning_radius
                    }]
                }],
                images: await q.all(modelMedia(v.model._id, "image"))
            });
        });

        return res.status(200).json({
            responseCode: 200,
            responseMessage: "success",
            responseData: variant
        });
    }
});

/**
    * [List brand]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

router.get('/brand/get', async function (req, res, next) {
    var data = {};
    if (req.query.type == "Battery") {
        data = await BatteryBrand.find({}).exec()
    }
    else if (req.query.type == "Tyre") {
        data = await TyreBrand.find({}).exec()
    }
    else if (req.query.type == "Automaker") {
        data = await Automaker.find({}).exec()
    }
    else {
        return res.status(400).json({
            responseCode: 400,
            responseMessage: "Unprocessable Entity",
            responseData: data,
        });
    }

    return res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: data,
    });
});

/*
    * [Get Models]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]} [description]
*/
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

/*
    * [Get Model Details]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]} [description]
*/

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

/**
    * [Get Variants]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

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

        return res.status(200).json({
            responseCode: 200,
            responseMessage: "success",
            responseData: variant
        });
    }
});

/**
    * [Get Variant Details]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

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
        var variant = await Variant.findById(req.query.id).select('-service_schedule')
            .populate({
                path: 'model',
                populate: {
                    path: 'automaker',
                }
            }).exec();

        return res.status(200).json({
            responseCode: 200,
            responseMessage: "success",
            responseData: variant
        });
    }
});

/**
    * [Variant Comparison]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

router.get('/variants/compare', xAccessToken.token, async function (req, res, next) {
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
        var string = req.query.id
        var array = string.split(',');

        var variants = [];
        await Variant.find({ '_id': { $in: array } }).select('-service_schedule').cursor().eachAsync(async (v) => {
            variants.push({
                _id: v._id,
                id: v.id,
                value: v.value
            })
        });

        return res.status(200).json({
            responseCode: 200,
            responseMessage: "success",
            responseData: variants
        });
    }
});

router.post('/logout', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;

    // console.log(user)
    await User.update(
        { _id: user },
        {
            "$pull": {
                "device": { "deviceId": req.headers['deviceid'] }
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
});

/**
    * [Notifications]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

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

router.post('/notifications/push', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var user = decoded.user;

    var validDeviceRegistrationToken = req.body.fcmId;



    var fcmCli = new FCM(config.server_key);

    var payloadOK = {
        to: validDeviceRegistrationToken,
        data: { //some data object (optional)
            title: 'HELLO', body: 'World!', sound: "default", badge: "1"
        },
        priority: 'high',
        content_available: true,
        notification: {
            title: 'HELLO', body: 'World!', sound: "default", badge: "1"
        }
    };

    var payloadError = {
        to: validDeviceRegistrationToken, //invalid registration token
        data: {
            url: "news"
        },
        priority: 'high',
        content_available: true,
        notification: { title: 'TEST HELLO', body: '123', sound: "default", badge: "1" }
    };


    var callbackLog = function (sender, err, res) {
        // console.log("\n__________________________________")
        // console.log("\t" + sender);
        // console.log("----------------------------------")
        // console.log("err=" + err);
        // console.log("res=" + res);
        // console.log("----------------------------------\n>>>");
    };

    function sendOK() {
        fcmCli.send(payloadOK, function (err, res) {
            callbackLog('sendOK', err, res);
        });
    }

    function sendError() {
        fcmCli.send(payloadError, function (err, res) {
            callbackLog('sendError', err, res);
        });
    }

    sendOK();
});

async function modelReviews(model, tz) {
    /*return new Promise((resolve, reject) => {*/
    var modelReview = [];
    await ModelReview.find({ model: model }).populate({ path: 'user', select: 'name username avatar avatar avatar avatar_address account_info' }).cursor().eachAsync(async (review) => {
        modelReview.push({
            user: review.user,
            _id: review._id,
            id: review._id,
            model: review.model,
            rating: review.rating,
            review: review.review,
            created_at: moment(review.created_at).tz(tz).format('ll')
        });
    });
    return modelReview;
    /*});*/
};

async function modelMedia(model, type) {
    var modelMedia = [];
    await ModelMedia.find({ model: model, type: type }).cursor().eachAsync(async (media) => {
        modelMedia.push({
            _id: media._id,
            id: media._id,
            file_address: media.file_address,
            created_at: media.created_at
        });
    });
    return modelMedia;
};

async function colors(model) {
    /*return new Promise((resolve, reject) => {*/
    var colors = [];
    await Color.find({ model: model }).cursor().eachAsync(async (color) => {
        colors.push({
            _id: color._id,
            id: color._id,
            value: color.value,
            color_code: color.color_code
        });
    });

    /*modelMedia.push({
        _id: "5b290623e9367455c048ef9a",
        id: "5b290623e9367455c048ef9a",
        file_address: "https://cdn.autoportal.com/img/new-cars-gallery/skoda/rapid/photo34/skoda-rapid-5129d7ac.jpg",
        created_at: "2018-06-08T11:31:25.988Z"
    });*/
    return colors;
    //resolve(modelMedia)
    /*})*/
};

async function is_model_bookmarked(model, user) {
    var variants = [];
    var count = await BookmarkModel.find({ model: model, user: user }).count().exec();
    if (count == 0) {
        return false;
    } else {
        return true;
    }
};

async function variants(model) {
    var variants = [];
    await Variant.find({ model: model }).cursor().eachAsync(async (variant) => {
        variants.push({
            _id: variant._id,
            id: variant.id,
            variant: variant.variant,
            value: variant.value,
            price: price(variant.price),
            specification: {
                type: variant.specification.type,
                power: variant.specification.power,
                gears: variant.specification.gears,
                fuel_type: variant.specification.fuel_type,
                body_type: variant.specification.body_type,
                length: variant.specification.length,
                displacement: variant.specification.displacement,
                highway_mileage: variant.specification.highway_mileage,
                city_mileage: variant.specification.city_mileage,
            }
        });
    });

    return variants;
};

async function userTimeZone(model, user) {
    var variants = [];
    var user = await User.findById(loggedInUser).select('address').exec();
    return user.address.timezone;
};



function price(value) {
    var val = Math.abs(value)
    if (val >= 10000000) {
        val = (val / 10000000).toFixed(2) + ' Cr*';
    }
    else if (val >= 100000) {
        val = (val / 100000).toFixed(2) + ' Lac*';
    }
    return val;
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
            v1 = (v1 / 10000000).toFixed(2) + ' Cr*';
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

/*-----------------------------------------------------------*/


router.post('/product-category', xAccessToken.token, async function (req, res, next) {
    for (var i = 0; i < req.body.length; i++) {
        var data = {
            category: req.body[i].category,
            parent_id: req.body[i].parent_id,
        }

        ProductCategory.create(data).then(async function (user) { });
    }

    res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: {},
    });
});

router.get('/model-image', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var user = decoded.user;
    var notifications = [];
    var images = ["kodiaq_By4ekTTWuZX.png",
        "kodiaq_B11paZdZm.jpg",
        "kodiaq_rkgkaaW_Z7.jpeg",
        "kodiaq_S1bk66bdb7.jpeg",
        "kodiaq_SkfJTTZdbQ.jpeg",
        "kodiaq_rk7yT6ZOZX.jpeg",
        "kodiaq_BJ4y6Tb_Zm.jpeg",
        "kodiaq_r1Hy6TZdZX.jpeg",
        "kodiaq_SJUyTaW_bm.jpeg",
        "kodiaq_SJw166ZdWX.jpeg",
        "kodiaq_r1d1T6ZuZm.jpeg",
        "kodiaq_BytJpaZdbm.png",
        "kodiaq_S1516pW_ZX.jpeg",
        "kodiaq_SJiy6pWOZQ.jpeg",
        "kodiaq_Bkhy6pZObm.jpeg",
        "kodiaq_ByTJTpbdbX.jpeg",
        "kodiaq_HkC1aTZdZm.jpeg",
        "kodiaq_SykxJ66ZdZm.jpeg",
        "kodiaq_r1gg1ppZ_W7.jpeg",
        "kodiaq_rJbxJ6aWObQ.jpeg",
        "kodiaq_ByGe16aZubQ.jpeg",
        "kodiaq_Sy7g16TWubX.jpeg",
        "kodiaq_BJSx16pW_WX.jpeg",
        "kodiaq_HkIg16aZ_W7.jpeg",
        "kodiaq_SkveJTpWdZ7.jpeg",
        "kodiaq_ByulkT6WdZ7.jpeg",
        "kodiaq_B1YgJppZuZ7.jpeg"
    ];

    for (var i = 0; i < images.length; i++) {
        var data = {
            model: "5b290623e9367455c048ef9e",
            file: images[i],
            type: "image"
        }
        ModelMedia.create(data).then(async function (user) { });
    }

    res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: notifications,
    });
});

router.get('/insert/car', async function (req, res, next) {
    req.body.forEach(async function (m) {
        await Model.create(m).then(async function (modelInfo) {
            await Club.create({ model: modelInfo._id, name: modelInfo.model }).then(async function (club) { });
            m.variants.forEach(async function (v) {

                var variant = {
                    model: modelInfo._id,
                    variant: modelInfo.model + " " + v.variant,
                    value: v.variant,
                    price: v.price,
                    specification: {
                        "type": _.startCase(_.toLower(v.type)),
                        "fuel_type": _.startCase(_.toLower(v.fuel_type)),
                        "power": v.power,
                        "length": v.length,
                        "width": v.width,
                        "height": v.height,
                        "arai_certified_mileage": v.arai_mileage,
                    },
                };

                // console.log(variant)


                await Variant.create(variant).then(async function (variantInfo) {
                });
            });

            var priceArray = _.keys(_.countBy(price, function (x) { return x.price }))


            var min = Math.min.apply(null, priceArray),
                max = Math.max.apply(null, priceArray);

            var pricerange = {
                min: min,
                max: max
            }

            Model.findOneAndUpdate({ _id: modelInfo._id }, { $push: { price: pricerange } }, { new: true }, function (err, doc) { })
            price = [];
        });
    })
    res.json("inset")
});


router.get('/insert/variant', async function (req, res, next) {
    req.body.model.forEach(async function (m) {
        var mdl = m.model;
        var modelInfo = await Model.findOne({ value: mdl.replace(req.body.brand, "").trim() }).exec();

        m.variant.forEach(async function (v) {
            var varValue = v.variant_info.name;

            var variant = {
                model: modelInfo._id,
                variant: v.variant_info.name,
                value: _.replace(varValue, modelInfo.model, "").trim(),
                price: v.variant_info.price,
                specification: v.variant_info.specification,
            }

            await Variant.create(variant).then(async function (variantInfo) {
            });
        });
    });

    // console.log(variant)
    res.json("variant Insert")
});

router.get('/unique', async function (req, res, next) {
    var keys = [];
    for (var i = 0; i < req.body.s.length; i++) {
        Object.keys(req.body.s[i]).forEach(function (key) {
            if (keys.indexOf(key) == -1) {
                keys.push(key);
            }
        });
    }
    res.json(keys);
});

router.get('/get-unique-cat', async function (req, res, next) {
    var x = req.body;
    /*lookup ={}
    var keys = [];
    for(var i = 0;i<x.length;i++)
    {   
        var category = x.category;

        if (!(category in lookup)) {
            lookup[category] = 1;
            keys.push(category);
        }
    }
    res.json(keys);
*/
    var key = _.keys(_.countBy(x, function (x) { return x.contact_no; }));
    res.json(key.length);
});


router.post('/createClub', async function (req, res, next) {
    var models = ["5b290623e9367455c048ef9c", "5b290623e9367455c048ef9d", "5b290623e9367455c048ef9e", "5b659ff503e74658eb65e330"]
    for (var l = 0; l < models.length; l++) {
        await Club.create({ model: models[l] }).then(async function (club) { });
    }

    res.json("inset")
});


router.post('/ffmpeg', async function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (error, fields, files) {
        var old_path = files.media.path;
        // console.log(old_path);
        try {
            var screenshot = uuidv1();
            var process = new ffmpeg(old_path);
            process.then(function (video) {
                video.fnExtractFrameToJPG('/tmp/', {
                    frame_rate: 1,
                    number: 1,
                    file_name: screenshot
                }, function (error, file) {
                    if (!error) {
                        // console.log(screenshot)
                        s3.upload({
                            bucket: config.BUCKET_NAME + '',
                            Key: 'post/' + screenshot + '_1.jpg',
                            Body: fs.createReadStream('/tmp/' + screenshot + '_1.jpg'),
                            ContentType: 'image/jpg',
                            ACL: 'public-read',
                            CacheControl: 'max-age=0',
                        }).promise();
                        res.json({ status: true, message: "Video thumbnail created." });
                    }
                    else {
                        res.json(error)
                    }
                });

            }, function (err) {
                res.json('Error: ' + err);
            });
        } catch (e) {
            res.json(e);
        }
    })


    //res.json(old_path);
    /**/
});


router.post('/insertUser', async function (req, res, next) {
    for (var l = 0; l < req.body.length; l++) {
        var check = await User.findOne({ contact_no: req.body[l].contact_no }).count().exec();

        if (req.body[l].name != "") {
            var otp = Math.floor(Math.random() * 90000) + 10000;

            req.body[l].password = req.body[l].contact_no;
            req.body[l].socialite = "";
            req.body[l].optional_info = "";
            var country = await Country.findOne({ _id: "5a7589744e470c7858eb454d" }).exec();

            req.body[l].account_info = {
                type: "business",
                status: "Incomplete",
                phone_verified: false,
                verified_account: false,
                approved_by_admin: false,
            };
            if (req.body[l].longitude != '' && req.body[l].latitude != '') {
                req.body[l].geometry = [req.body[l].longitude, req.body[l].latitude];
            }
            else {
                req.body[l].geometry = [0, 0];
            }

            if (country != 0) {
                req.body[l].address = {
                    country: country._id,
                    timezone: country.timezone[0],
                    location: req.body[l].location
                };
            }

            req.body[l].username = shortid.generate();

            //req.body[l].username=req.body[l].username;
            req.body[l].device = [];
            req.body[l].otp = otp;
            req.body[l].isCarEager = false;

            var business_category = await Category.findOne({ category: req.body[l].category }).exec();

            req.body[l].business_info = {
                business_category: business_category.category,
                company: req.body[l].company
            };

            req.body[l].optional_info = {
                email: req.body[l].secondary_email,
                contact_no: req.body[l].secondary_contact_no
            };

            User.create(req.body[l]).then(async function (user) {
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

                await Type.find({}).then(function (BT) {
                    BT.forEach(function (u) {
                        var businessType = new BusinessType({
                            business: user._id,
                            business_type: u._id,
                            is_added: false,
                        });
                        businessType.save();
                    });
                });
                var businessService = [
                    {
                        service: "Basic",
                        inclusions: "",
                        type: "Customization",
                        service_charges: 0
                    },
                    {
                        service: "Advance",
                        inclusions: "",
                        type: "Customization",
                        service_charges: 0
                    },
                    {
                        service: "Prime",
                        inclusions: "",
                        type: "Customization",
                        service_charges: 0
                    },
                    {
                        service: "Basic",
                        inclusions: "",
                        type: "Diagnosis",
                        service_charges: 0
                    },
                    {
                        service: "Advance",
                        inclusions: "",
                        type: "Diagnosis",
                        service_charges: 0
                    },
                    {
                        service: "Prime",
                        inclusions: "",
                        type: "Diagnosis",
                        service_charges: 0
                    },
                    {
                        service: "Basic",
                        inclusions: "",
                        type: "Collision Repair",
                        service_charges: 0
                    },
                    {
                        service: "Advance",
                        inclusions: "",
                        type: "Collision Repair",
                        service_charges: 0
                    },
                    {
                        service: "Prime",
                        inclusions: "",
                        type: "Collision Repair",
                        service_charges: 0
                    },
                    {
                        service: "Basic",
                        inclusions: "",
                        type: "Washing And Detailings",
                        service_charges: 0
                    },
                    {
                        service: "Advance",
                        inclusions: "",
                        type: "Washing And Detailings",
                        service_charges: 0
                    },
                    {
                        service: "Prime",
                        inclusions: "",
                        type: "Washing And Detailings",
                        service_charges: 0
                    }
                ];

                var servicePackageData = {
                    business: user._id,
                    packages: businessService,
                    status: false,
                    created_at: new Date(),
                    updated_at: new Date(),
                }


                await BusinessServicePackage.create(servicePackageData).then(async function (service) {
                    /*await businessService.forEach(async function(bs){
                        await BusinessServicePackage.findOneAndUpdate({_id: service._id}, {
                            $push: {
                               "packages": { _id:mongoose.Types.ObjectId(),service: bs.service, inclusions: bs.inclusions, type: bs.type, service_charges:bs.service_charges } 
                            }    
                        },
                    {upsert: true}, function(err, doc){});
                    })*/
                });
            }).catch(next);
        }
    }
    res.json("insert")
});

router.post('/service/data', async function (req, res, next) {

    /*var data = [];
    await Service.find({}).cursor()
    .eachAsync(async(ser)=>{
        data.push({
            for: ser.for,     
            fuel_type: ser.fuel_type,       
            package: ser.package,
            service: ser.service,
            description: ser.description,
            mrp: ser.mrp,
            labour_cost: ser.labour_cost,
            cost: ser.cost,
            part_cost: ser.part_cost,
        });
    });

    res.json(data)*/

    /*
        var data = {};
        await Model.find({automaker: "5bb78fda9400270f421a54e1"})
        .cursor()
        .eachAsync(async(model)=>{
            var form = {
                "categoryid": "regularservices",
                "serviceid": "periodicservice",
                "view": "list",
                "userLocation": {
                    "lat": 12.971599,
                    "lng": 77.594563
                },
                "filter": {
                    "internal": true
                },
                "vehicle": {
                    "_id": model.model,
                    "name": model.model,
                    "nickname": model.model,
                    "make": model.model,
                    "model": model.value,
                    "segment": "",
                    "bodystyle": "ss",
                    "fuelType": "diesel"
                },
                "searchText": "Cartisan Car Service"
            };
            
            request.post({url:'https://payments.cartisan.in/cartisan/0.1.0/dealerservices', form: form}, function(err,httpResponse,body){ 
                if(body){
                    var resBody = JSON.parse(body)
                    resBody.forEach(async function(d){
                        await CarService.create({
                            automaker: model.automaker,
                            for: model.value,
                            model: model._id,
                            package: d.servicesOffered[0].name,
                            service: d.servicesOffered[0].packages[0].name,
                            description:  d.servicesOffered[0].packages[0].description,
                            cost:  d.servicesOffered[0].packages[0].cost.amount,
                            inclusions: d.servicesOffered[0].packages[0].keywords,
                            fuel_type: form.vehicle.fuelType
                        }).then(async function (service) {}); 
                    });
                }
            });
        });*/

    var a = req.body;
    for (var l = 0; l < a.length; l++) {
        var model = await Model.findOne({ _id: req.body[l].model }).exec();
        req.body[l].automaker = model.automaker;
        req.body[l].model = model._id;

        Service.create(req.body[l]).then(async function (service) { });

    }
    res.json("insert")
});

router.post('/washing/data', async function (req, res, next) {
    /*var a = req.body;
    for(var l= 0; l<a.length; l++)
    {   
        var model = await Model.findOne({value:req.body[l].for}).exec();
        req.body[l].automaker = model.automaker;
        req.body[l].model = model._id;

        Washing.create(req.body[l]).then(async function (service) {}); 
    
    }
    res.json("insert")
*/
    /*var data = await Washing.find({}).sort({maker: 1}).exec();
    var body = req.body;
    var data = {};

    body.forEach(async function(d){
        var automaker = await Automaker.findOne({maker: d.maker}).exec();
        await Model.find({automaker:automaker._id}).cursor().eachAsync(async(model) => {
            data = {
                automaker : model.automaker,
                maker: automaker.maker,
                model: model._id,
                for: model.value,
                service : d.package,
                description : d.job_features,
                mrp : d.mrp,
                labour_cost: d.cxp,
                part_cost: 0,
                cost: d.cxp
            };

            Washing.create(data)
        });
        
    });*/

    /*body.forEach(async function(d){
        var maker = await Automaker.findOne({maker: d.maker}).exec();
        var model = await Model.findOne({value: d.model}).exec()
        data = {
            automaker : maker._id,
            maker: maker.maker,
            model: model._id,
            for: model.value,
            service : d.package,
            description : d.job_features,
            mrp : d.mrp,
            labour_cost: d.cxp,
            part_cost: 0,
            cost: d.cxp
        };

        Washing.create(data);
    });
    res.json("insert")   */

    var a = req.body;
    for (var l = 0; l < a.length; l++) {
        var model = await Model.findOne({ _id: req.body[l].model }).exec();
        req.body[l].automaker = model.automaker;
        req.body[l].model = model._id;

        Washing.create(req.body[l]).then(async function (service) { });

    }
    res.json("insert")
});

router.post('/detailing/data', async function (req, res, next) {
    /*var a = req.body;
     for(var l= 0; l<a.length; l++)
     {      
         await Model.find({_id: req.body[l].id})
         .populate('automaker')
         .cursor().eachAsync(async(model) => {
             if(req.body[l].careager_price){    
                 req.body[l].automaker = model.automaker._id;
                 req.body[l].maker = model.automaker.maker;
                 req.body[l].model = model._id;
                 req.body[l].for = model.value;
                 req.body[l].service = req.body[l].treatment;
                 req.body[l].package = req.body[l].category;
                 req.body[l].labour_cost = req.body[l].careager_price;
                 req.body[l].part_cost = 0;
                 req.body[l].cost = req.body[l].careager_price;
 
                 var video_links = req.body[l].video_links;
             
                 // console.log(req.body[l])
                 Detailing.create(req.body[l]).then(async function (service) {
                     video_links.forEach(async function(l){
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
             }
         });
     }
     res.json(req.body[l])*/

    var a = req.body;
    for (var l = 0; l < a.length; l++) {
        await Automaker.find({ maker: req.body[l].maker })
            .cursor().eachAsync(async (maker) => {
                if (maker) {
                    await Model.find({ automaker: maker._id })
                        .cursor().eachAsync(async (model) => {
                            req.body[l].automaker = maker._id;
                            req.body[l].maker = maker.maker;
                            req.body[l].model = model._id;
                            req.body[l].for = model.value;
                            req.body[l].service = req.body[l].treatment_name;
                            req.body[l].package = req.body[l].category;
                            req.body[l].labour_cost = req.body[l].careager_price;
                            req.body[l].part_cost = 0;
                            req.body[l].cost = req.body[l].careager_price;
                            req.body[l].mrp = Math.ceil(req.body[l].mrp);
                            var video_links = req.body[l].video_links;

                            // console.log(maker)
                            // console.log(req.body[l])
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
                else {
                    // console.log(req.body[l].maker)
                }
            });
    }
    res.json(req.body[l])
});

router.post('/customization/data', async function (req, res, next) {
    /*var a = req.body;
    for(var l= 0; l<a.length; l++)
    {   
        var model = await Model.findOne({value:req.body[l].for}).exec();
        req.body[l].automaker = model.automaker;
        req.body[l].model = model._id;

        Washing.create(req.body[l]).then(async function (service) {}); 
    
    }
    res.json("insert")*/

    //var data = await Washing.find({}).sort({maker: 1}).exec();
    var body = req.body;
    var data = {};

    body.forEach(async function (d) {
        var automaker = await Automaker.findOne({ maker: d.maker }).exec();
        await Model.find({ automaker: automaker._id }).cursor().eachAsync(async (model) => {
            data = {
                automaker: automaker._id,
                maker: automaker.maker,
                model: model._id,
                for: model.value,
                service: d.service,
                package: d.package,
                description: d.description,
                mrp: d.mrp,
                labour_cost: d.cxp,
                part_cost: 0,
                cost: d.cxp,
                unit: "unit"
            };

            Customization.create(data)
        });



    });

    res.json("insert")

    /*body.forEach(async function(d){
        var maker = await Automaker.findOne({maker: d.maker}).exec();
        var model = await Model.findOne({value: d.model}).exec()
        data = {
            automaker : maker._id,
            maker: maker.maker,
            model: model._id,
            for: model.value,
            service : d.service,
            package : d.package,
            description : d.description,
            mrp : d.mrp,
            labour_cost: d.cxp,
            part_cost: 0,
            cost: d.cxp
        };

        Customization.create(data);
    });
    res.json("insert")   */

    /* var a = req.body;
     for(var l= 0; l<a.length; l++)
     {   
         var model = await Model.findOne({_id:req.body[l].model}).exec();
         req.body[l].automaker = model.automaker;
         req.body[l].model = model._id;
 
         Washing.create(req.body[l]).then(async function (service) {}); 
     
     }
     res.json("insert")*/
});

router.post('/collision/data', async function (req, res, next) {
    /*body.forEach(async function(d){
        
        var model = await Model.findOne({value: d.model}).exec();
        
        data = {
            model : model._id,
            for: model.value,
            service : d.panel,
            description : d.description,
            mrp : d.general_mrp,
            labour_cost: d.general_cxp,
            cost: d.general_cxp,
            part_cost: 0,
            paint : "general"
        };
        Collision.create(data)    
    });
    
    body.forEach(async function(d){
        var automaker = await Automaker.findOne({maker: d.maker}).exec();
        await Model.find({automaker:automaker._id}).cursor().eachAsync(async(model) => {
            data = {
                model : model._id,
                for: model.value,
                service : d.panel,
                description : d.description,
                mrp : d.general_mrp,
                labour_cost: d.general_cxp,
                cost: d.general_cxp,
                part_cost: 0,
                paint : "general"
            };

            Collision.create(data)
        });
    });
    */
    //res.json("data Insert")

    /*var a = req.body;
   for(var l= 0; l<a.length; l++)
   {   
       var model = await Model.findOne({value:req.body[l].model}).exec();
       req.body[l].automaker = model.automaker;
       req.body[l].model = model._id;

       Collision.create(req.body[l]).then(async function (service) {}); 
   
   }
   res.json("insert")*/

    var a = req.body;
    for (var l = 0; l < a.length; l++) {  /* 
        var model = await Model.findOne({_id:req.body[l].model}).exec();
        req.body[l].automaker = model.automaker;
        req.body[l].model = model._id;
*/
        Collision.create(req.body[l]).then(async function (service) { });

    }
    res.json("insert")
});


router.post('/service/data/individual', async function (req, res, next) {

    /*var data = await CarService.find({automaker: "5bc36fa049564e174779ff2e"}).select("-_id -automaker").exec();
    res.json(data);*/

    var form = { "categoryid": "regularservices", "serviceid": "periodicservice", "view": "list", "userLocation": { "lat": 12.971599, "lng": 77.594563 }, "filter": { "internal": true }, "vehicle": { "_id": "Premier Rio", "name": "Premier Rio", "nickname": "Premier Rio", "make": "Premier", "model": "Rio", "segment": "Mass", "bodystyle": "SUV", "fueltype": "diesel" }, "searchText": "Cartisan Car Service" };

    request.post({ url: 'https://payments.cartisan.in/cartisan/0.1.0/dealerservices', form: form }, function (err, httpResponse, body) {
        if (body) {
            var resBody = JSON.parse(body)
            resBody.forEach(async function (d) {
                await CarService.create({
                    automaker: "5bc33f1c49564e174779fad8",
                    for: "Rio",
                    model: "5bc33f1c49564e174779fad9",
                    package: d.servicesOffered[0].name,
                    service: d.servicesOffered[0].packages[0].name,
                    description: d.servicesOffered[0].packages[0].description,
                    cost: d.servicesOffered[0].packages[0].cost.amount,
                    inclusions: d.servicesOffered[0].packages[0].keywords,
                    fuel_type: "diesel"
                }).then(async function (service) { });
            });
        }
    });
});

router.post('/battery/data', async function (req, res, next) {
    for (var l = 0; l < req.body.length; l++) {
        var check = await Model.findOne({ model: req.body[l].model }).exec();
        var data = {
            model: check._id,
            fuel_type: req.body[l].fuel_type,
            capacity: req.body[l].capacity,
            orientation: req.body[l].orientation
        };

        var checkBattery = await Battery.find(data).count().exec();
        if (checkBattery == 0) {
            await Battery.create(data).then(async function (battery) { });
        }
    }
    res.json("insert")
});

router.post('/battery-company', async function (req, res, next) {

    for (var l = 0; l < req.body.length; l++) {
        var checkBattery = await BatteryBrand.find({ value: req.body[l] }).count().exec();
        if (checkBattery == 0) {

            await BatteryBrand.create({ value: req.body[l] }).then(async function (battery) { });
        }
    }
    res.json("insert")
});


router.post('/service/add', async function (req, res, next) {
    /* var body = req.body;
     var data = {};
     var parts =[];
     body.forEach(async function(d){
         await Model.find({value:d.model}).cursor().eachAsync(async(model) => {
             parts = [
                 {
                     part: 'Engine Oil',
                     cost: d.Engine_Oil
                 },
                 {
                     part: 'Oil Filter',
                     cost: d.Oil_Filter
                 },
                 {
                     part: 'AC Filter',
                     cost: d.AC_Filter
                 },
                 {
                     part: 'Air Filter',
                     cost: d.Air_Filter
                 },
                 {
                     part: 'Fuel Filter',
                     cost: d.Fuel_Filter
                 },
                 {
                     part: 'Brake Oil',
                     cost: d.Brake_Oil
                 },
                 {
                     part: 'Differential Oil',
                     cost: d.Differential_Oil
                 }
             ];
                 
     
             data = {
                 model : model.automaker,
                 model : model._id,
                 for: model.value,
                 package : "Xpress Service",
                 service : d.service,
                 mileage : d.mileage,
                 description : d.description,
                 mrp : d.mrp,
                 labour_cost: d.labour_cost,
                 cost: d.cxp,
                 parts: parts,
                 part_cost: d.part_cost,
                 fuel_type : d.fuel_type
             };
 
             // console.log(data)
 
             Service.create(data).then(async function (service) {}); 
         });
         
     })*/
    /*var a = req.body;
    for(var l= 0; l<a.length; l++)
    {   
        if(req.body[l].maker)
        {
            var maker = await Automaker.findOne({maker: req.body[l].maker}).exec();
            var model = await Model.findOne({value: req.body[l].for}).exec();
            req.body[l].automaker = maker._id;
            req.body[l].model = model._id;

            Service.create(req.body[l]).then(async function (service) {}); 
        }
    }*/

    var a = req.body;
    for (var l = 0; l < a.length; l++) {
        var model = await Model.findOne({ _id: req.body[l].model }).exec();
        req.body[l].automaker = model.automaker;
        req.body[l].model = model._id;

        Service.create(req.body[l]).then(async function (service) { });

    }
    res.json("insert")
});


router.post('/tyreBrand', async function (req, res, next) {
    for (var l = 0; l < req.body.length; l++) {
        var tyre = await TyreBrand.find({ value: req.body[l] }).count().exec();
        if (tyre == 0) {
            await TyreBrand.create({ value: req.body[l] }).then(async function (battery) { });
        }
    }
    res.json("insert")
});


router.post('/offer', async function (req, res, next) {
    var s = [{
        "doorstep": false,
        "service": "CarEager Elite",
        "description": "",
        "mrp": 2235,
        "labour_cost": 3480,
        "part_cost": 0,
        "cost": 3480,
        "__v": 0,
    },
    {
        "doorstep": false,
        "service": "Free Wash N Vaccum",
        "description": "",
        "mrp": 1235,
        "labour_cost": 3480,
        "part_cost": 0,
        "cost": 3480,
        "__v": 0,
    }];

    for (var l = 0; l < s.length; l++) {
        Offer.create(s[l]).then(async function () { });
    }
    res.json("insert")
});


router.post('/tyreSize', async function (req, res, next) {
    for (var l = 0; l < req.body.length; l++) {
        var tyre = await TyreSize.find({ value: req.body[l] }).count().exec();
        if (tyre == 0) {

            await TyreSize.create({ value: req.body[l] }).then(async function (battery) { });
        }
    }
    res.json("insert")
});

router.post('/mail', async function (req, res, next) {
    event.mail();
});


function modelPriceRange(model) {
    return new Promise((resolve, reject) => {
        var price = Variant.aggregate([{ $match: { $and: [{ 'model': model }] } }, { "$group": { "_id": 0, "max": { "$max": "$price" }, "min": { "$min": "$price" } } }])
        resolve(price)
    })
};
router.post('/insert/car/variants', async function (req, res, next) {










    // req.body.forEach(async function (m) {
    //     await Model.create(m).then(async function (modelInfo) {
    //         await Club.create({ model: modelInfo._id, name: modelInfo.model }).then(async function (club) { });
    //         m.variants.forEach(async function (v) {

    //             var variant = {
    //                 model: modelInfo._id,
    //                 variant: modelInfo.model + " " + v.variant,
    //                 value: v.variant,
    //                 price: v.price,
    //                 specification: {
    //                     "type": _.startCase(_.toLower(v.type)),
    //                     "fuel_type": _.startCase(_.toLower(v.fuel_type)),
    //                     "power": v.power,
    //                     "length": v.length,
    //                     "width": v.width,
    //                     "height": v.height,
    //                     "arai_certified_mileage": v.arai_mileage,
    //                 },
    //             };

    //             // console.log(variant)


    //             await Variant.create(variant).then(async function (variantInfo) {
    //             });
    //         });

    //         var priceArray = _.keys(_.countBy(price, function (x) { return x.price }))


    //         var min = Math.min.apply(null, priceArray),
    //             max = Math.max.apply(null, priceArray);

    //         var pricerange = {
    //             min: min,
    //             max: max
    //         }

    //         Model.findOneAndUpdate({ _id: modelInfo._id }, { $push: { price: pricerange } }, { new: true }, function (err, doc) { })
    //         price = [];
    //     });
    // })
    res.json("inset")
});


module.exports = router
