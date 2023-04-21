var mongoose = require('mongoose'),
    express = require('express'),
    { ObjectId } = require('mongodb').ObjectID,
    router = express.Router(),
    config = require('../../../config')
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
    assert = require('assert');


global.packageDiscountOn = [];

var paytm_config = require('../../../paytm/paytm_config').paytm_config;
var paytm_checksum = require('../../../paytm/checksum');
var querystring = require('querystring');

var s3 = new aws.S3({
    accessKeyId: config.IAM_USER_KEY,
    secretAccessKey: config.IAM_USER_SECRET,
    Bucket: config.BUCKET_NAME
});

const xAccessToken = require('../../../middlewares/xAccessTokenV2');
const fun = require('../../../api/function');
const event = require('../../../api/event');

var salt = bcrypt.genSaltSync(10);

const Car = require('../../../models/car');
const User = require('../../../models/user');
const Post = require('../../../models/post');
const Like = require('../../../models/like');
const Model = require('../../../models/model');
const State = require('../../../models/state');
const Point = require('../../../models/point');
const Follow = require('../../../models/follow');
const Review = require('../../../models/review');
const Hashtag = require('../../../models/hashtag');
const Comment = require('../../../models/comment');
const BookingCategory = require('../../../models/bookingCategory');
const Booking = require('../../../models/booking');
const Variant = require('../../../models/variant');
const ClubMember = require('../../../models/clubMember');
const Club = require('../../../models/club');
const Country = require('../../../models/country');
const Category = require('../../../models/category');
const Referral = require('../../../models/referral');
const Automaker = require('../../../models/automaker');
const PostMedia = require('../../../models/postMedia');
const BrandLike = require('../../../models/brandLike');
const ModelReview = require('../../../models/modelReview');
const PostView = require('../../../models/postView');
const Service = require('../../../models/service');
const Insurance = require('../../../models/insurance');
const Diagnosis = require('../../../models/diagnosis');
const Collision = require('../../../models/collision');
const BookingService = require('../../../models/bookingService');
const BusinessServicePackage = require('../../../models/businessServicePackage');
const Address = require('../../../models/address');
const Coupon = require('../../../models/coupon');
const CouponUsed = require('../../../models/couponUsed');
const Washing = require('../../../models/washing');
const BusinessOffer = require('../../../models/businessOffer');
const Offer = require('../../../models/offer');
const Lead = require('../../../models/lead');
const Package = require('../../../models/package');
const UserPackage = require('../../../models/userPackage');
const PackageUsed = require('../../../models/packageUsed');

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
    * [New User API]
    * @param  {[raw json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

router.post('/new/', async function (req, res, next) {
    var checkEmail = await User.find({ email: req.body.email }).count().exec();
    //res.json(checkEmail)
    if (checkEmail > 0) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Email already in use.",
            responseData: {},
        });
    }
    else {
        var checkUsername = await User.find({ username: req.body.username }).collation({ locale: 'en', strength: 2 }).exec();
        //res.json(checkUsername)
        if (checkUsername.length == 0) {
            var regexp = /^[a-zA-Z0-9._]+$/;
            var check = req.body.username;
            if (check.search(regexp) == -1) {
                res.status(422).json({
                    responseCode: 422,
                    responseMessage: "Use Only Alphabet, Numbers and dot & underscore",
                    responseData: {},
                });
            }
            else {
                var checkPhone = await User.find({ contact_no: req.body.contact_no }).count().exec();
                if (checkPhone == 0) {
                    var country = await Country.findOne({ _id: req.body.country }).exec();
                    req.body.address = {
                        country: country.countryName,
                        timezone: req.headers['tz'],
                        location: req.body.location,
                    };

                    req.body.account_info = {
                        type: "user",
                        status: "Complete",
                    };

                    var name = req.body.name.substring(0, 3);
                    var rand = Math.floor((Math.random() * 100000) + 1);

                    var email = req.body.name;

                    var referral_code = req.body.referral_code;
                    req.body.username = req.body.username.toLowerCase();


                    req.body.referral_code = name.toUpperCase() + "" + rand;
                    //req.body.referral_code = shortid.generate();
                    req.body.geometry = [0, 0];
                    req.body.device = [];
                    req.body.otp = Math.floor(Math.random() * 90000) + 10000;

                    req.body.careager_cash = 0;
                    req.body.socialite = "";
                    req.body.optional_info = "";
                    req.body.business_info = "";

                    var avatar = uuidv1() + ".jpg";


                    if (req.body.avatar) {
                        var avatar_url = req.body.avatar;
                        req.body.avatar = avatar;
                        put_from_url(avatar_url, config.BUCKET_NAME, avatar, function (err, response) {
                            if (err)
                                throw err;
                            // console.log('Uploaded data successfully!');
                        });
                    }

                    User.create(req.body).then(async function (user) {
                        event.otpSms(user);

                        if (req.body.referral_code != '') {
                            var checkReferralCode = await User.findOne({ referral_code: referral_code }).exec();
                            if (checkReferralCode) {
                                var checkPrevious = await Referral.findOne({ code: referral_code, owner: checkReferralCode._id, user: user._id }).count().exec();

                                if (checkPrevious == 0) {
                                    Referral.create({
                                        code: referral_code,
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
                                status: "Complete",
                                user: user
                            },
                        });
                    }).catch(next);
                }
                else {
                    res.status(400).json({
                        responseCode: 400,
                        responseMessage: "Phone number already in use.",
                        responseData: {},
                    });
                }
            }
        }
        else {
            res.status(422).json({
                responseCode: 422,
                responseMessage: "Username already in use.",
                responseData: {},
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

router.post('/account', async function (req, res, next) {
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
        var checkPhone = await User.findOne({ contact_no: req.body.contact_no }).select('-password').exec();
        if (checkPhone) {
            if (checkPhone.account_info.type == "user") {
                if (checkPhone.account_info.status == "Complete") {
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
            else {
                res.status(401).json({
                    responseCode: 401,
                    responseMessage: "Phone no is already in used",
                    responseData: {},
                });
            }
        }
        else {
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

/*router.post('/setup', async function (req, res, next) {
    var rules = {
        id: 'required',
        name: 'required',
        password: 'required',
        username: 'required',
        contact_no: 'required',
    };

    var validation = new Validator(req.body, rules);

    if(validation.fails()){
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Error",
            responseData: {
                res: validation.errors.all()
            }
        });
    }
    else{
        var username = await User.findOne({username:req.body.username,_id: { $ne: req.body.id }}).count().exec();
        if(username)
        {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "username already exist",
                responseData: {}
            });
        }
        else{
            bcrypt.hash(req.body.password, salt,null, function(err, hash) {
                if(err) return next(err);
                var data = {
                    name: req.body.name,
                    username: req.body.username,
                    email: req.body.email,
                    contact_no: req.body.contact_no,
                    password: hash,
                    account_info: {
                        status:"Complete"
                    }
                };
        
                User.findOneAndUpdate({_id: req.body.id}, {$set:data}, {new: true}, async function(err, doc){
                    if(err){
                        var json = ({
                            responseCode: 400,
                            responseMessage: "Error occured",
                            responseData: {}
                        });
                        res.status(400).json(json)
                    }

                    var user = await User.findOne({_id: req.body.id}).exec();

                    var json = ({
                        responseCode: 200,
                        responseMessage: "OTP sent",
                        responseData: {
                            status: "Complete",
                            user: user
                        }
                    });
                    res.status(200).json(json)
                });
            });
        }   
    }
});
*/


/**
    * [Social Login]
    * @param  {[null]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {Function} next [description]
    * @return {[type]}        [description]
*/

router.post('/social-login', async function (req, res, next) {
    var rules = {
        social_id: 'required',
        social_login: 'required',
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
        var checkUser = await User.findOne({ social_id: req.body.social_id, social_login: req.body.social_login }).select('-password').exec();
        if (checkUser) {
            if (checkUser.account_info.status == "Complete") {
                event.otpSms(checkUser);

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "OTP sent",
                    responseData: {
                        status: checkUser.account_info.status,
                        user: checkUser
                    },
                });
            }
            else if (checkUser.account_info.status == "Active") {
                const payload = {
                    user: checkUser['_id']
                };

                var token = jwt.sign(payload, secret);
                var json = ({
                    responseCode: 200,
                    responseMessage: "OTP verified",
                    responseData: {
                        status: checkUser.account_info.status,
                        token: token,
                        user: checkUser
                    }
                });
                res.status(200).json(json)
            }
        }
        else {
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



/**
    * [Get Postal data]
    * @param  {[null]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {Function} next [description]
    * @return {[type]}        [description]
*/

router.get('/postal/get', xAccessToken.token, async function (req, res, next) {
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
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var user = decoded.user;
        var data = {};

        request.get({ url: 'http://postalpincode.in/api/pincode/' + req.query.zip }, function (err, httpResponse, body) {
            if (!err) {
                var resBody = JSON.parse(body)
                data = {
                    city: resBody.PostOffice[0].Division,
                    state: resBody.PostOffice[0].State,
                }

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "",
                    responseData: data
                })
            }
        });

        /**/
    }
})

/**
    * [Add Address]
    * @param  {[null]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {Function} next [description]
    * @return {[type]}        [description]
*/

router.post('/address/add', xAccessToken.token, async function (req, res, next) {
    var rules = {
        address: 'required',
        zip: 'required',
        city: 'required',
        state: 'required'
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


        var data = {
            user: user,
            address: req.body.address,
            area: req.body.area,
            landmark: req.body.landmark,
            zip: req.body.zip,
            city: req.body.city,
            state: req.body.state,
            created_at: new Date(),
            updated_at: new Date()
        }

        Address.create(data).then(async function (address) {
            res.status(200).json({
                responseCode: 200,
                responseMessage: "Address Updated",
                responseData: address
            })
        })

    }
});


/**
    * [Get Addresses]
    * @param  {[null]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {Function} next [description]
    * @return {[type]}        [description]
*/

router.get('/address/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;

    res.status(200).json({
        responseCode: 200,
        responseMessage: "Address",
        responseData: await Address.find({ user: user }).exec()
    })
});


/**
 * [Remove Car Images (AWS S3)]
 * @param  {[null]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
*/

router.delete('/address/delete', xAccessToken.token, async function (req, res, next) {
    var rules = {
        id: 'required'
    };

    res.status(200).json({
        responseCode: 200,
        responseMessage: "Address Remove",
        responseData: {},
    });

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

        var data = await Address.findById(req.body.id).exec();
        if (data) {
            await Address.findByIdAndRemove(req.body.id).exec();
            res.status(200).json({
                responseCode: 200,
                responseMessage: "Address Remove",
                responseData: {},
            });
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Address Not Found",
                responseData: {},
            })
        }
    }
});

/**
 * [Add Post Media]
 * @param  {[null]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
*/

router.post('/post/media/add', xAccessToken.token, function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var screenshot = uuidv1();

    var form = new formidable.IncomingForm();
    form.parse(req, function (error, fields, files) {
        var old_path = files.media.path;
        // console.log(old_path);
        try {
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
                        // console.log({ status: true, message: "Video thumbnail created." });
                    }
                    else {
                        // console.log(error)
                    }
                });

            }, function (err) {
                // console.log('Error: ' + err);
            });
        } catch (e) {
            // console.log(e);
        }
    });

    var upload = multer({
        storage: multerS3({
            s3: s3,
            bucket: config.BUCKET_NAME + '/post',
            acl: 'public-read',
            contentType: multerS3.AUTO_CONTENT_TYPE,
            // contentDisposition: 'attachment',
            key: function (req, file, cb) {
                // console.log(file.mimetype)
                let extArray = file.mimetype.split("/");
                let extension = extArray[extArray.length - 1];
                let type = extArray[0];
                cb(null, uuidv1() + '.' + extension);
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
        }
        else {

            var preview = screenshot + '_1.jpg';

            var data = {
                post: null,
                caption: null,
                location: null,
                day: null,
                user: decoded.user,
                type: req.files[0].contentType.split('/')[0],
                preview: preview,
                file: req.files[0].key,
                created_at: new Date(),
                updated_at: new Date()
            };

            var postMedia = new PostMedia(data);
            postMedia.save();

            res.status(200).json({
                responseCode: 200,
                responseMessage: "File has been uploaded",
                responseData: postMedia
            })
        }
    });
});


router.delete('/post/media/delete', xAccessToken.token, async function (req, res, next) {
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

        const media = await PostMedia.findById(req.body.id).exec();
        //res.json(media.file)
        if (media) {
            var params = {
                Bucket: config.BUCKET_NAME + "/post",
                Key: media.file
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
                else {
                    await PostMedia.findByIdAndRemove(req.body.id).exec();

                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "File has been deleted",
                        responseData: {
                            res: {},
                        }
                    })
                }
            });
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Error occured",
                responseData: {
                    res: {},
                }
            });
        }
    }
});


/**
 * [My Clubs]
 * @param  {[null]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
*/

router.get('/clubs', xAccessToken.token, async function (req, res, next) {
    //res.json(generator.generate())
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var clubs = [];
    await ClubMember.find({ user: user })
        .populate({ path: 'model', select: "model feature_image" })
        .cursor().eachAsync(async (club) => {
            clubs.push({
                club: club.club,
                model: {
                    model: club.model.model,

                    _id: club.model._id,
                    feature_image: "https://s3.ap-south-1.amazonaws.com/" + config.BUCKET_NAME + "/model/" + club.model.feature_image,
                },
                user: club.user,
            });
        });

    res.status(200).json({
        responseCode: 200,
        responseMessage: "",
        responseData: clubs
    });
});

/**
 * [Post ADD]
 * @param  {[null]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
*/

router.post('/post/add', xAccessToken.token, async function (req, res, next) {
    //res.json(generator.generate())
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;

    var currentDate = new Date();

    var tags = extract(req.body.post.replace(/(\r\n|\n|\r)/gm, " "), { type: '#', symbol: false });

    if (req.body.car) {
        var model = await Model.findOne({ model: req.body.car }).exec();
        if (model) {
            req.body.model = model._id;
            req.body.car = model.model;
        }
    }

    const mentions = [];

    var fetchedMentions = extract(req.body.post.replace(/(\r\n|\n|\r)/gm, " "), {
        unique: false,
        symbol: false
    });

    for (var i = 0; i < fetchedMentions.length; i++) {
        await User.find({
            username: fetchedMentions[i]
        }).cursor().eachAsync(async (u) => {
            mentions.push({ id: u._id, _id: u._id, username: u.username, type: u.account_info.type });
        });
    }

    req.body.club = "5b6fece3206202409ad57176";
    req.body.user = user;
    req.body.pId = shortid.generate();
    req.body.mentions = mentions;
    req.body.created_at = currentDate;
    req.body.updated_at = currentDate;

    Post.create(req.body).then(async function (post) {
        for (var m = 0; m < req.body.media.length; m++) {
            var media = {
                day: req.body.media[m].day,
                post: post._id,
                caption: req.body.media[m].caption,
                place: req.body.media[m].place,
                status: true
            };
            await PostMedia.findOneAndUpdate({ _id: req.body.media[m].id }, { $set: media }, { new: true }, function (err, doc) { });
        }

        for (var i = 0; i < tags.length; i++) {
            await Hashtag.create({ post: post._id, hashtag: tags[i], created_at: new Date(), updated_at: new Date() }).then(async function (hashtag) { });
        }

        var point = {
            user: user,
            activity: "post",
            tag: "post",
            points: 10,
            source: post._id,
            status: true
        }

        fun.addPoints(point);

        if (mentions) {
            var notify = {
                receiver: _.keys(_.countBy(mentions, function (x) { return x._id })),
                activity: "post",
                tag: "mention",
                source: post._id,
                sender: user,
                points: 0
            }
            fun.newNotification(notify);
        }

        var addedPost = [];
        await Post.find({ _id: post._id, status: true })
            .populate({ path: 'user', select: 'name username avatar avatar_address account_info' })
            .populate('thumbnails')
            .populate('comments')
            .populate('likes')
            .sort({ created_at: -1 }).limit(config.perPage)
            .cursor().eachAsync(async (p) => {
                var media = _(p.thumbnails).groupBy(x => x.day).map((value, key) => ({ group: key, thumbnails: value })).value();
                addedPost.push({
                    _id: p._id,
                    id: p.id,
                    is_author: p.is_author,
                    post: p.post,
                    user: p.user,
                    car: p.car,
                    country: p.country,
                    state: p.state,
                    start: moment(p.start).tz(req.headers['tz']).format('ll'),
                    end: moment(p.end).tz(req.headers['tz']).format('ll'),
                    link: p.link,
                    type: p.type,
                    likes: p.likes.length,
                    liked: p.liked,
                    comments: p.comments.length,
                    media: media,
                    posted_on: moment(p.created_at).tz(req.headers['tz']).format('lll'),
                    posted_ago: moment(p.created_at).tz(req.headers['tz']).fromNow(),
                    mentions: p.mentions,
                    created_at: p.created_at,
                    updated_at: p.created_at,
                });
            });

        res.status(200).json({
            responseCode: 200,
            responseMessage: "Posted successfully",
            responseData: addedPost
        });
    }).catch(next);
});

/**
 * [Post GET]
 * @param  {[null]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
*/

router.get('/post/get', xAccessToken.token, async function (req, res, next) {
    var rules = {
        type: 'required',
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
        var data = [];
        var tags = [];


        if (req.query.page == undefined) {
            var page = 0;
        } else {
            var page = req.query.page;
        }
        var page = Math.max(0, parseInt(page));

        if (req.query.type == "post") {
            await Post.find({ _id: req.query.post, status: true })
                .populate({ path: 'user', select: 'name username avatar avatar_address account_info' })
                .populate({ path: 'club', populate: 'model' })
                .populate('thumbnails')
                .populate('comments')
                .populate('likes')
                .sort({ created_at: -1 }).limit(config.perPage)
                .skip(config.perPage * page)
                .cursor().eachAsync(async (p) => {
                    var media = _(p.thumbnails).groupBy(x => x.day).map((value, key) => ({ group: key, thumbnails: value })).value();

                    data.push({
                        _id: p._id,
                        id: p.id,
                        is_author: p.is_author,
                        post: p.post,
                        user: p.user,
                        car: p.car,
                        country: p.country,
                        state: p.state,
                        start: moment(p.start).tz(req.headers['tz']).format('ll'),
                        end: moment(p.end).tz(req.headers['tz']).format('ll'),
                        link: p.link,
                        type: p.type,
                        likes: p.likes.length,
                        liked: p.liked,
                        comments: p.comments.length,
                        media: media,
                        posted_on: moment(p.created_at).tz(req.headers['tz']).format('lll'),
                        posted_ago: moment(p.created_at).tz(req.headers['tz']).fromNow(),
                        mentions: p.mentions,
                        is_primary: p.is_primary,
                        club: p.club,
                        created_at: p.created_at,
                        updated_at: p.created_at,
                    });
                });
        }
        else if (req.query.type == "feed") {
            var users = [user];
            var mentionedPost = [];
            await Follow.find({ user: user }).cursor().eachAsync(async (f) => { users.push(f.follow) });

            await Post.find({ status: true })
                .or([
                    { $or: [{ user: { $in: users } }] },
                    { $or: [{ 'mentions._id': mongoose.Types.ObjectId(user) }] }
                ])
                .populate({ path: 'user', select: 'name username avatar avatar_address account_info' })
                .populate('thumbnails')
                .populate({ path: 'club', populate: 'model' })
                .populate('comments')
                .populate('likes')
                .sort({ created_at: -1 })
                .skip(config.perPage * page)
                .limit(config.perPage)
                .cursor().eachAsync(async (p) => {

                    var media = _(p.thumbnails).groupBy(x => x.day).map((value, key) => ({ group: key, thumbnails: value })).value();
                    data.push({
                        _id: p._id,
                        id: p.id,
                        is_author: p.is_author,
                        post: p.post,
                        user: p.user,
                        car: p.car,
                        country: p.country,
                        state: p.state,
                        start: moment(p.start).tz(req.headers['tz']).format('ll'),
                        end: moment(p.end).tz(req.headers['tz']).format('ll'),
                        link: p.link,
                        type: p.type,
                        likes: p.likes.length,
                        liked: p.liked,
                        comments: p.comments.length,
                        media: media,
                        posted_on: moment(p.created_at).tz(req.headers['tz']).format('lll'),
                        posted_ago: moment(p.created_at).tz(req.headers['tz']).fromNow(),
                        mentions: p.mentions,
                        is_primary: p.is_primary,
                        club: p.club,
                        created_at: p.created_at,
                        updated_at: p.created_at,
                    });
                });
        }
        else if (req.query.type == "profile") {
            await Post.find({ status: true })
                .or([
                    { $or: [{ user: req.query.id }] },
                    { $or: [{ 'mentions._id': mongoose.Types.ObjectId(req.query.id) }] }
                ])
                .populate({ path: 'user', select: 'name username avatar avatar_address account_info' })
                .populate({ path: 'club', populate: 'model' })
                .populate('thumbnails')
                .populate('comments')
                .populate('likes')
                .sort({ created_at: -1 }).limit(config.perPage)
                .skip(config.perPage * page)
                .cursor().eachAsync(async (p) => {
                    var media = _(p.thumbnails).groupBy(x => x.day).map((value, key) => ({ group: key, thumbnails: value })).value();

                    data.push({
                        _id: p._id,
                        id: p.id,
                        is_author: p.is_author,
                        post: p.post,
                        user: p.user,
                        car: p.car,
                        country: p.country,
                        state: p.state,
                        start: moment(p.start).tz(req.headers['tz']).format('ll'),
                        end: moment(p.end).tz(req.headers['tz']).format('ll'),
                        link: p.link,
                        type: p.type,
                        likes: p.likes.length,
                        liked: p.liked,
                        comments: p.comments.length,
                        media: media,
                        posted_on: moment(p.created_at).tz(req.headers['tz']).format('lll'),
                        posted_ago: moment(p.created_at).tz(req.headers['tz']).fromNow(),
                        mentions: p.mentions,
                        is_primary: p.is_primary,
                        club: p.club,
                        created_at: p.created_at,
                        updated_at: p.created_at
                    });
                });
        }
        else if (req.query.type == "hashtag") {
            var posts = [];
            await Hashtag.find({ 'hashtag': req.query.tag }).cursor().eachAsync(async (hashtag) => { posts.push(hashtag.post) });

            await Post.find({ _id: { $in: posts }, status: true })
                .populate({ path: 'user', select: 'name username avatar avatar_address account_info' })
                .populate({ path: 'club', populate: 'model' })
                .populate('thumbnails')
                .populate('comments')
                .populate('likes')
                .sort({ created_at: -1 })
                .skip(config.perPage * page)
                .limit(config.perPage)
                .cursor().eachAsync(async (p) => {
                    var media = _(p.thumbnails).groupBy(x => x.day).map((value, key) => ({ group: key, thumbnails: value })).value();

                    data.push({
                        _id: p._id,
                        id: p.id,
                        is_author: p.is_author,
                        post: p.post,
                        user: p.user,
                        car: p.car,
                        country: p.country,
                        state: p.state,
                        start: moment(p.start).tz(req.headers['tz']).format('ll'),
                        end: moment(p.end).tz(req.headers['tz']).format('ll'),
                        link: p.link,
                        type: p.type,
                        likes: p.likes.length,
                        liked: p.liked,
                        comments: p.comments.length,
                        media: media,
                        posted_on: moment(p.created_at).tz(req.headers['tz']).format('lll'),
                        posted_ago: moment(p.created_at).tz(req.headers['tz']).fromNow(),
                        mentions: p.mentions,
                        is_primary: p.is_primary,
                        club: p.club,
                        created_at: p.created_at,
                        updated_at: p.created_at,
                    });
                });
        }
        else if (req.query.type == "trending") {
            var posts = [];

            if (page <= 0) {
                page = 0;
            } else if (page <= 1) {
                page = 0
            }
            else {
                page = page - 1;
            }

            await PostView.aggregate([
                { $unwind: "$post" },
                { $match: { 'post': { $ne: mongoose.Types.ObjectId(req.query.id) } } },
                { $group: { _id: '$post' } },
            ])
                .allowDiskUse(true)
                .cursor({ batchSize: 10 })
                .exec()
                .eachAsync(async function (post) { posts.push(post._id) });


            await Post.find({ _id: { $in: posts }, status: true })
                .populate({ path: 'user', select: 'name username avatar avatar_address account_info' })
                .populate({ path: 'club', populate: 'model' })
                .populate('thumbnails')
                .populate('comments')
                .populate('likes')
                .sort({ created_at: -1 })
                .limit(config.perPage)
                .skip(config.perPage * page)
                .cursor().eachAsync((p) => {
                    var media = _(p.thumbnails).groupBy(x => x.day).map((value, key) => ({ group: key, thumbnails: value })).value();
                    data.push({
                        _id: p._id,
                        id: p.id,
                        is_author: p.is_author,
                        post: p.post,
                        user: p.user,
                        car: p.car,
                        country: p.country,
                        state: p.state,
                        start: moment(p.start).tz(req.headers['tz']).format('ll'),
                        end: moment(p.end).tz(req.headers['tz']).format('ll'),
                        link: p.link,
                        type: p.type,
                        likes: p.likes.length,
                        liked: p.liked,
                        hashtags: p.hashtags,
                        comments: p.comments.length,
                        media: media,
                        posted_on: moment(p.created_at).tz(req.headers['tz']).format('lll'),
                        posted_ago: moment(p.created_at).tz(req.headers['tz']).fromNow(),
                        mentions: p.mentions,
                        is_primary: p.is_primary,
                        club: p.club,
                        created_at: p.created_at,
                        updated_at: p.created_at,
                    });
                });
        }
        else if (req.query.type == "club") {
            var posts = [];

            await Post.find({ club: req.query.id, status: true })
                .populate({ path: 'user', select: 'name username avatar avatar_address account_info' })
                .populate({ path: 'club', populate: 'model' })
                .populate('thumbnails')
                .populate('comments')
                .populate('likes')
                .sort({ created_at: -1 })
                .skip(config.perPage * page)
                .limit(config.perPage)
                .cursor().eachAsync(async (p) => {
                    var media = _(p.thumbnails).groupBy(x => x.day).map((value, key) => ({ group: key, thumbnails: value })).value();

                    data.push({
                        _id: p._id,
                        id: p.id,
                        is_author: p.is_author,
                        post: p.post,
                        user: p.user,
                        car: p.car,
                        country: p.country,
                        state: p.state,
                        start: moment(p.start).tz(req.headers['tz']).format('ll'),
                        end: moment(p.end).tz(req.headers['tz']).format('ll'),
                        link: p.link,
                        type: p.type,
                        likes: p.likes.length,
                        liked: p.liked,
                        comments: p.comments.length,
                        media: media,
                        posted_on: moment(p.created_at).tz(req.headers['tz']).format('lll'),
                        posted_ago: moment(p.created_at).tz(req.headers['tz']).fromNow(),
                        mentions: p.mentions,
                        is_primary: p.is_primary,
                        club: p.club,
                        created_at: p.created_at,
                        updated_at: p.created_at,
                    })
                });
        }
        else if (req.query.type == "place") {
            var posts = [];
            await Post.find({ state: req.query.place, status: true, is_primary: true })
                .populate({ path: 'user', select: 'name username avatar avatar_address account_info' })
                .populate({ path: 'club', populate: 'model' })
                .populate('thumbnails')
                .populate('comments')
                .populate('likes')
                .sort({ created_at: -1 })
                .skip(config.perPage * page)
                .limit(config.perPage)
                .cursor().eachAsync(async (p) => {
                    var media = _(p.thumbnails).groupBy(x => x.day).map((value, key) => ({ group: key, thumbnails: value })).value();

                    data.push({
                        _id: p._id,
                        id: p.id,
                        is_author: p.is_author,
                        post: p.post,
                        user: p.user,
                        car: p.car,
                        country: p.country,
                        state: p.state,
                        start: moment(p.start).tz(req.headers['tz']).format('ll'),
                        end: moment(p.end).tz(req.headers['tz']).format('ll'),
                        link: p.link,
                        type: p.type,
                        likes: p.likes.length,
                        liked: p.liked,
                        comments: p.comments.length,
                        media: media,
                        posted_on: moment(p.created_at).tz(req.headers['tz']).format('lll'),
                        posted_ago: moment(p.created_at).tz(req.headers['tz']).fromNow(),
                        mentions: p.mentions,
                        is_primary: p.is_primary,
                        club: p.club,
                        created_at: p.created_at,
                        updated_at: p.created_at,
                    });
                });
        }

        res.status(200).json({
            responseCode: 200,
            responseMessage: "Post",
            responseData: data
        });
    }
});

/**
 * [Post View Add]
 * @param  {[null]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
*/

router.get('/post/view', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;


    var data = {
        post: req.query.post,
        user: user,
        timezone: req.headers['tz'],
        created_at: new Date(),
        updated_at: new Date(),
    }
    var lastView = await PostView.findOne({ post: req.query.post, user: user, timezone: req.headers['tz'] }).sort({ created_at: -1 }).exec();
    if (lastView) {
        var a = moment(new Date());//now
        var b = moment(lastView.created_at);
        var diff = a.diff(b, 'hours');
        // console.log(diff)
        if (diff >= 8) {
            PostView.create(data).then(async function (pv) { });
        }
    } else {
        PostView.create(data).then(async function (pv) { });
    }

    res.status(200).json({
        responseCode: 200,
        responseMessage: "View",
        responseData: {}
    });
})


/**
 * [Post DELETE]
 * @param  {[null]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
*/

router.delete('/post/delete', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
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
        var count = await Post.find({ _id: req.query.id, user: user }).count().exec();

        if (count == 1) {

            await Post.findOneAndUpdate({ _id: req.query.id, user: user }, { $set: { status: false } }, async function (err, doc) { });
            //await PostMedia.updateMany({post: req.query.id, user: user},{$set:{status: false}},async function(err, doc){});

            var point = {
                user: user,
                activity: "post",
                tag: "postDelete",
                points: 10,
                status: true
            }

            fun.deductPoints(point);

            res.status(200).json({
                responseCode: 200,
                responseMessage: "Deleted successfully",
                responseData: {}
            });
        }
        else {
            res.status(401).json({
                responseCode: 401,
                responseMessage: "Unauthorized",
                responseData: {}
            });
        }
    }
});

/**
 * [Comments Add]
 * @param  {[null]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
*/

router.post('/comment/add', xAccessToken.token, async function (req, res, next) {
    var rules = {
        post: 'required',
        comment: 'required',
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

        var tags = [];
        var comment;
        const mentions = [];

        var commentTag = extract(req.body.comment.replace(/(\r\n|\n|\r)/gm, " "), { type: '#', symbol: false });

        var post = await Post.findOne({ _id: req.body.post }).exec();

        if (post) {
            for (var i = 0; i < commentTag.length; i++) {
                var checkTags = await Hashtag.find({ post: post._id, hashtag: commentTag[i] }).count().exec();
                // console.log(checkTags)
                if (checkTags == 0) {
                    await Hashtag.create({ post: post._id, hashtag: commentTag[i], created_at: new Date(), updated_at: new Date() }).then(async function (hashtag) { });
                }
            }

            var fetchedMentions = extract(req.body.comment.replace(/(\r\n|\n|\r)/gm, " "), { unique: false, symbol: false });

            for (var i = 0; i < fetchedMentions.length; i++) {
                await User.find({
                    username: fetchedMentions[i]
                }).cursor().eachAsync(async (u) => {
                    mentions.push({ id: u._id, _id: u._id, username: u.username, type: u.account_info.type });
                });
            }

            req.body.user = user;
            req.body.mentions = mentions;
            req.body.created_at = new Date();
            req.body.updated_at = new Date();

            Comment.create(req.body).then(async function (comment) {
                await Comment.find({ _id: comment._id, status: true })
                    .populate({ path: 'user', select: '_id id name username avatar avatar_address account_info' })
                    .cursor().eachAsync(async (p) => {

                        //var media = _(p.thumbnails).groupBy(x => x.day).map((value, key) => ({group: key, thumbnails: value})).value();

                        if (p.user._id == user) {
                            var is_author = true;
                        } else {
                            var is_author = false;
                        }

                        comment = {
                            _id: p._id,
                            id: p.id,
                            is_author: is_author,
                            user: p.user,
                            post: p.post,
                            comment: p.comment,
                            posted_on: moment(p.created_at).tz(req.headers['tz']).format('lll'),
                            posted_ago: moment(p.created_at).tz(req.headers['tz']).fromNow(),
                            mentions: p.mentions,
                            created_at: p.created_at,
                            updated_at: p.created_at
                        }
                    });


                var notify = {
                    receiver: [post.user],
                    activity: "post",
                    tag: "comment",
                    source: post._id,
                    sender: user,
                    points: 0
                }

                fun.newNotification(notify);

                if (mentions) {
                    var notify = {
                        receiver: _.keys(_.countBy(mentions, function (x) { return x._id })),
                        activity: "post",
                        tag: "mentionInComment",
                        source: post._id,
                        sender: user,
                        points: 0
                    }

                    fun.newNotification(notify);
                }

                var count = await Comment.find({ post: req.body.post }).count().exec();

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Posted successfully",
                    responseData: {
                        count: count,
                        comment: comment
                    }
                });
            }).catch(next);
        }
        else {
            res.status(401).json({
                responseCode: 401,
                responseMessage: "Unauthorized",
                responseData: {}
            })
        }
    }
});

/**
 * [Comments GET]
 * @param  {[null]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
*/

router.get('/comments/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var data = [];
    var tags = [];


    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }
    var page = Math.max(0, parseInt(page));

    await Comment.find({ post: req.query.id, status: true })
        .populate({ path: 'user', select: '_id id name username avatar avatar_address account_info' })
        .sort({ created_at: -1 })
        .skip(config.perPage * page)
        .limit(config.perPage)
        .cursor().eachAsync(async (p) => {

            //var media = _(p.thumbnails).groupBy(x => x.day).map((value, key) => ({group: key, thumbnails: value})).value();

            if (p.user._id == user) {
                var is_author = true;
            } else {
                var is_author = false;
            }

            data.push({
                _id: p._id,
                id: p.id,
                is_author: is_author,
                user: p.user,
                post: p.post,
                comment: p.comment,
                posted_on: moment(p.created_at).tz(req.headers['tz']).format('lll'),
                posted_ago: moment(p.created_at).tz(req.headers['tz']).fromNow(),
                mentions: p.mentions,
                created_at: p.created_at,
                updated_at: p.created_at
            });
        });

    res.status(200).json({
        responseCode: 200,
        responseMessage: "",
        responseData: data
    });
});

/**
 * [Comments DELETE]
 * @param  {[null]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
*/

router.delete('/comment/delete', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;


    var count = await Comment.find({ user: user, _id: req.query.id }).count().exec();

    if (count == 1) {
        await Comment.findOneAndUpdate({ _id: req.query.id, user: user }, { $set: { status: false } }, async function (err, doc) { });
        res.status(200).json({
            responseCode: 200,
            responseMessage: "Deleted successfully",
            responseData: {}
        });
    }
    else {
        res.status(401).json({
            responseCode: 401,
            responseMessage: "Unauthorized",
            responseData: {}
        });
    }
});

/**
 * [Like]
 * @param  {[null]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
*/

router.post('/like', xAccessToken.token, async function (req, res, next) {
    var rules = {
        post: 'required',
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
        var post = await Post.findOne({ _id: req.body.post }).exec();
        if (post) {
            var count = await Like.find({ 'user': user, 'post': req.body.post }).count().exec();

            if (count == 0) {
                var currentDate = new Date();
                req.body.user = user,
                    req.body.created_at = currentDate,
                    req.body.updated_at = currentDate

                Like.create(req.body).then(async function (like) {
                    var updateCount = await Like.find({ post: req.body.post }).count().exec();

                    var notify = {
                        receiver: [post.user],
                        activity: "post",
                        tag: "like",
                        source: post._id,
                        sender: user,
                        points: 0
                    }

                    fun.newNotification(notify);

                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "You Liked It",
                        responseData: {
                            likes: updateCount,
                            isLiked: true
                        }
                    });
                }).catch(next);
            }
            else {
                Like.remove({ 'user': user, 'post': req.body.post }).exec();
                var updateCount = await Like.find({ post: req.body.post }).count().exec();
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "You Unliked It",
                    responseData: {
                        likes: updateCount,
                        isLiked: false
                    }
                });
            }
        }
        else {
            res.status(401).json({
                responseCode: 401,
                responseMessage: "Unauthorized",
                responseData: {}
            })
        }
    }
});


/**
 * [Likes GET]
 * @param  {[null]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
*/

router.get('/likes/get', xAccessToken.token, async function (req, res, next) {
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
        var users = [];
        var data = [];
        var is_following = false;

        if (req.query.page == undefined) {
            var page = 0;
        } else {
            var page = req.query.page;
        }
        var page = Math.max(0, parseInt(page));

        var post = await Post.findOne({ _id: req.query.id, status: true }).exec();

        if (post) {
            await Like.find({ 'post': req.query.id }).cursor().eachAsync(async (f) => { users.push(f.user) });
            await User.find({ _id: { $in: users } })
                .sort({ created_at: -1 })
                .skip(config.perPage * page)
                .limit(config.perPage).cursor().eachAsync(async (user) => {
                    await Follow.find({ follow: user._id, user: decoded.user }).cursor().eachAsync(async (follow) => {
                        if (follow === null) {
                            var is_following = false
                        }
                        else {
                            var is_following = true
                        }
                    });

                    data.push({
                        _id: user._id,
                        id: user.id,
                        name: user.name,
                        username: user.username,
                        email: user.email,
                        contact_no: user.contact_no,
                        avatar_address: "https://s3.ap-south-1.amazonaws.com/" + config.BUCKET_NAME + "/avatar/" + user.avatar,
                        account_info: user.account_info,
                        is_following: is_following
                    })
                });

            res.status(200).json({
                responseCode: 200,
                responseMessage: "",
                responseData: data
            })
        }
        else {
            res.status(401).json({
                responseCode: 401,
                responseMessage: "Unauthorized",
                responseData: {}
            })
        }
    }
});

/**
 * [Expore Search]
 * @param  {[null]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
*/

router.get('/search', xAccessToken.token, async function (req, res, next) {
    var rules = {
        type: 'required',
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
        var peoples = [];
        var businesses = [];
        var places = [];
        var hashtags = [];
        var trendingTags = [];
        var trendings = [];
        var posts = [];
        var media = [];

        var is_author = false;
        if (req.query.page == undefined) {
            var page = 0;
        } else {
            var page = req.query.page;
        }
        var page = Math.max(0, parseInt(page));

        var query = req.query.query;

        if (req.query.type == "trending") {
            await PostView.aggregate([
                { "$unwind": "$post" },
                {
                    "$group": {
                        "_id": "$post",
                        "count": { "$sum": 1 }
                    }
                },
                {
                    "$sort": { "count": -1 }
                },
            ])
                .allowDiskUse(true)
                .cursor({ batchSize: 10 })
                .exec()
                .eachAsync(async function (h) {
                    posts.push(mongoose.Types.ObjectId(h._id));
                });

            await Post.find({ _id: { $in: posts }, status: true })
                .populate({ path: 'user', select: 'name username avatar avatar_address account_info' })
                .populate({ path: 'club', populate: 'model' })
                .populate('thumbnails')
                .populate('comments')
                .populate('likes')
                .sort({ created_at: -1 })
                .skip(config.perPage * page)
                .limit(config.perPage)
                .cursor().eachAsync(async (p) => {
                    var media = _(p.thumbnails).groupBy(x => x.day).map((value, key) => ({ group: key, thumbnails: value })).value();

                    trendings.push({
                        _id: p._id,
                        id: p.id,
                        is_author: p.is_author,
                        post: p.post,
                        user: p.user,
                        car: p.car,
                        country: p.country,
                        state: p.state,
                        start: moment(p.start).tz(req.headers['tz']).format('ll'),
                        end: moment(p.end).tz(req.headers['tz']).format('ll'),
                        link: p.link,
                        type: p.type,
                        likes: p.likes.length,
                        liked: p.liked,
                        comments: p.comments.length,
                        media: media,
                        posted_on: moment(p.created_at).tz(req.headers['tz']).format('lll'),
                        posted_ago: moment(p.created_at).tz(req.headers['tz']).fromNow(),
                        mentions: p.mentions,
                        is_primary: p.is_primary,
                        club: p.club,
                        created_at: p.created_at,
                        updated_at: p.created_at,
                    });
                });

            /*await PostMedia.aggregate([            
                {"$match": {post: {$in: posts} } },
                {"$group": {_id: '$post', data: {$push:'$$ROOT'}, "count": { "$sum": 1 }}},
            ])
            .allowDiskUse(true)
            .cursor({batchSize: 10})
            .exec()
            .eachAsync(async function(p){
                trendings.push({
                    _id: p.data[0]._id,
                    id: p.data[0].id,
                    post: p.data[0].post,
                    file: p.data[0].file,
                    preview: p.data[0].preview,
                    file_address: "https://s3.ap-south-1.amazonaws.com/"+config.BUCKET_NAME+"/post/"+p.data[0].file,
                    preview_address: "https://s3.ap-south-1.amazonaws.com/"+config.BUCKET_NAME+"/post/"+p.data[0].preview,
                    type: p.data[0].type,
                    is_multi: p.count > 1 ? true:false
                })
            })*/
        }

        else if (req.query.type == "people") {
            await User.find({ 'account_info.type': 'user' })
                .or([{
                    $or: [
                        { 'name': { $regex: new RegExp(query, 'i') } },
                        { 'username': { $regex: new RegExp(query, 'i') } }
                    ]
                },
                ])
                .select('name username avatar avatar_address gender account_info')
                .sort({ created_at: -1 }).limit(config.perPage)
                .skip(config.perPage * page)
                .cursor().eachAsync(async (user) => {
                    peoples.push({
                        _id: user._id,
                        id: user._id,
                        name: user.name,
                        username: user.username,
                        email: user.email,
                        contact_no: user.contact_no,
                        avatar_address: "https://s3.ap-south-1.amazonaws.com/" + config.BUCKET_NAME + "/avatar/" + user.avatar,
                        account_info: user.account_info,
                        is_following: user.is_following,
                        created_at: user.created_at,
                        updated_at: user.updated_at,
                        joined: moment(user.created_at).tz(req.headers['tz']).format('ll'),
                    });
                });
        }
        else if (req.query.type == "business") {
            await User.find({ 'account_info.type': 'business' })
                .or([{
                    $or: [
                        { 'name': { $regex: new RegExp(query, 'i') } },
                        { 'username': { $regex: new RegExp(query, 'i') } }
                    ]
                },
                ])
                .select('name username avatar avatar_address gender account_info address business_info')
                .sort({ created_at: -1 }).limit(config.perPage)
                .skip(config.perPage * page)
                .cursor().eachAsync(async (user) => {
                    businesses.push({
                        _id: user._id,
                        id: user._id,
                        name: user.name,
                        username: user.username,
                        email: user.email,
                        contact_no: user.contact_no,
                        avatar_address: "https://s3.ap-south-1.amazonaws.com/" + config.BUCKET_NAME + "/avatar/" + user.avatar,
                        account_info: user.account_info,
                        business_info: user.business_info,
                        address: user.address,
                        created_at: user.created_at,
                        updated_at: user.updated_at,
                        joined: moment(user.created_at).tz(req.headers['tz']).format('ll'),
                    });
                });
        }
        else if (req.query.type == "place") {
            var place = await Post.aggregate([
                { "$match": { 'state': { $regex: new RegExp(query, 'i') } } },
                { "$limit": config.perPage },
                { "$skip": config.perPage * page },
                { "$project": { "state": 1 } },
                { "$unwind": "$state" },
                { "$group": { "_id": "$state", "count": { "$sum": 1 } } }
            ]);

            for (var p = 0; p < place.length; p++) {
                places.push({
                    place: place[p]._id,
                    count: place[p].count
                })
            }
        }
        else if (req.query.type == "hashtag") {
            var tags = await Hashtag.aggregate([
                { "$match": { 'hashtag': { $regex: new RegExp(query, 'i') } } },
                { "$limit": config.perPage },
                { "$skip": config.perPage * page },
                { "$project": { "hashtag": 1 } },
                { "$unwind": "$hashtag" },
                { "$group": { "_id": "$hashtag", "count": { "$sum": 1 } } }
            ]);

            for (var h = 0; h < tags.length; h++) {
                hashtags.push({
                    hashtag: tags[h]._id,
                    count: tags[h].count
                });
            }
        }


        res.status(200).json({
            responseCode: 200,
            responseMessage: "",
            responseData: {
                businesses: businesses,
                peoples: peoples,
                places: places,
                trendings: trendings,
                hashtags: hashtags,
            }
        });
    }
});

/**
    * [Get Club Get]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

router.get('/club/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var media = [];
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
        var clubInfo = {};

        await Club.findOne({ _id: req.query.id })
            .populate('model')
            .cursor().eachAsync(async (club) => {
                var members = await ClubMember.find({ club: req.query.id }).count().exec();
                var posts = await Post.find({ club: req.query.id, status: true }).count().exec();
                clubInfo = {
                    _id: club._id,
                    id: club._id,
                    description: "This is CarEager's official '" + club.model.model + "' owners' club.",
                    club: club.model.model,
                    cover: "https://s3.ap-south-1.amazonaws.com/" + config.BUCKET_NAME + "/model/" + club.model.feature_image,
                    members: members.toString(),
                    posts: posts.toString()
                }
            })

        return res.status(200).json({
            responseCode: 200,
            responseMessage: "success",
            responseData: clubInfo
        });
    }
});

/**
    * [Get Club Member]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

router.get('/club/members/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var media = [];
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
        if (req.query.page == undefined) {
            var page = 0;
        } else {
            var page = req.query.page;
        }

        var page = Math.max(0, parseInt(page));
        var members = [];
        var users = [];

        await ClubMember.find({ club: req.query.id }).cursor().eachAsync(async (u) => { users.push(u.user) });

        await User.find({ _id: { $in: users } })
            .sort({ created_at: -1 })
            .skip(config.perPage * page).limit(config.perPage)
            .cursor()
            .eachAsync(async (user) => {
                members.push({
                    _id: user.id,
                    id: user.id,
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    contact_no: user.contact_no,
                    avatar: "https://s3.ap-south-1.amazonaws.com/" + config.BUCKET_NAME + "/cover/" + user.avatar,
                    account_info: user.account_info,
                    joined: user.created_at,
                });
            });

        return res.status(200).json({
            responseCode: 200,
            responseMessage: "success",
            responseData: members
        });
    }
});


/**
    * [Get User Gallery]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

router.get('/gallery', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var media = [];
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
        if (req.query.page == undefined) {
            var page = 0;
        } else {
            var page = req.query.page;
        }

        var page = Math.max(0, parseInt(page));
        var posts = [];

        await Post.find({ user: req.query.id, status: true })
            .sort({ created_at: -1 })
            .cursor().eachAsync(async (post) => {
                posts.push(post._id)
            })

        await PostMedia.find({ post: { $in: posts } })
            .sort({ created_at: -1 })
            .skip(config.perPage * page)
            .limit(config.perPage)
            .cursor().eachAsync(async (t) => {
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
                    preview_address: t.preview_address
                });
            });


        return res.status(200).json({
            responseCode: 200,
            responseMessage: "success",
            responseData: media
        });
    }
});


/**
    * [Refer & Earn]
    * @param  {[null]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {Function} next [description]
    * @return {[type]}        [description]
*/

router.get('/refer-earn', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var user = await User.findById(decoded.user).exec();

    res.status(200).json({
        responseCode: 200,
        responseMessage: "",
        responseData: {
            Owner: 100,
            code: user.referral_code,
            user: 100
        }
    });
});


/**
 * [Get Booking Business API]
 * @param  {[raw json]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {middleware} next [description]
 * @return {[json]}        [description]
*/

router.post('/packages/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var packages = [];

    if (req.body.car == "") {
        req.body.car = null
    }

    await UserPackage.find({ user: user, car: req.body.car }).cursor().eachAsync(async (package) => {
        var serverTime = moment.tz(new Date(), req.headers['tz']);
        var bar = moment.tz(package.expired_at, req.headers['tz']);
        var baz = bar.diff(serverTime);
        // console.log(baz)
        if (baz > 0) {
            packages.push({
                package: package._id,
                name: package.name,
                description: package.description,
                payment: package.payment,
                discount: package.discount,
                type: "package",
                cost: package.cost,
                id: package._id,
                _id: package._id,
                category: package.category,
                label: package.label,
                validity: package.validity,
                expired_at: moment(package.expired_at).tz(req.headers['tz']).format('ll')
            });
        }
    });


    res.status(200).json({
        responseCode: 200,
        responseMessage: "",
        responseData: packages
    });
});
/**
 * [Get Booking Business API]
 * @param  {[raw json]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {middleware} next [description]
 * @return {[json]}        [description]
*/

router.post('/booking/business/get', xAccessToken.token, async function (req, res, next) {
    var rules = {
        car: 'required',
        isCarEager: 'required',
        latitude: 'required',
        longitude: "required"
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
        var bookingService = [];

        if (req.body.isCarEager == true) {
            var user = await User.find({ isCarEager: true }).select('name username avatar avatar_address gender business_info account_info address').sort({ created_at: -1 }).exec();

            res.status(200).json({
                responseCode: 200,
                responseMessage: "",
                responseData: user
            });
        }
        else {
            var car = await Car.findOne({ _id: req.body.car, user: user }).populate({ path: 'model', populate: { path: 'automaker' } });
            if (car) {
                var company = car.model.automaker.maker;
                var user = await User.find({
                    geometry: {
                        $near: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)],
                        $maxDistance: 1000,
                    }, "business_info.business_category": "Service Station (Authorised)", /*"business_info.company": company*/
                })
                    .select('name username avatar avatar_address gender business_info account_info address')
                    .exec();

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "",
                    responseData: user
                });
            }
            else {
                res.status(401).json({
                    responseCode: 401,
                    responseMessage: "Unauthorized",
                    responseData: {}
                });
            }
        }
    }
});

/**
 * [Get Booking Services API]
 * @param  {[raw json]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {middleware} next [description]
 * @return {[json]}        [description]
*/

router.get('/booking/category/get', xAccessToken.token, async function (req, res, next) {
    res.status(200).json({
        responseCode: 200,
        responseMessage: "",
        responseData: await BookingCategory.find({}).sort({ position: 1 }).exec()
    });
});

/**
 * [Get Booking Services API]
 * @param  {[raw json]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {middleware} next [description]
 * @return {[json]}        [description]
*/

router.get('/booking/category/feature/get', xAccessToken.token, async function (req, res, next) {
    res.status(200).json({
        responseCode: 200,
        responseMessage: "",
        responseData: await BookingCategory.find({ tag: req.query.tag }).exec()
    });
});

/**
 * [Get Booking Service API]
 * @param  {[raw json]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {middleware} next [description]
 * @return {[json]}        [description]
*/

router.post('/booking/services/get', xAccessToken.token, async function (req, res, next) {
    var rules = {
        car: 'required',
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
        var packages = [];

        if (!req.body.package) {
            req.body.package = null
        }

        var car = await Car.findOne({ _id: req.body.car, user: user }).exec();

        if (car) {
            if (req.body.type == "services") {
                if (car.fuel_type == "Petrol" || car.fuel_type == "Diesel") {
                    await Service.find({ model: car.model, fuel_type: car.fuel_type, })
                        .cursor().eachAsync(async (service) => {
                            var labour_cost = await q.all(packageDiscount(req.body.package, req.body.car, req.body.type, service.service, service.labour_cost, req.headers['tz']));

                            packages.push({
                                automaker: service.automaker,
                                model: service.model,
                                for: service.for,
                                package: service.package,
                                service: service.service,
                                description: service.description,
                                labour_cost: labour_cost,
                                part_cost: service.part_cost,
                                mrp: service.mrp,
                                cost: service.part_cost + labour_cost,
                                originalCost: service.part_cost + service.labour_cost,
                                is_common: service.is_common,
                                inclusions: service.inclusions,
                                fuel_type: service.fuel_type,
                                doorstep: service.doorstep,
                                type: "services",
                                id: service.id,
                                _id: service._id
                            })
                        });

                    await Service.find({ model: car.model, $or: [{ service: "Wheel Alignment" }, { service: "Wheel Balancing (cost per tyre, weights excluded)" }] }).cursor().eachAsync(async (service) => {

                        var labour_cost = await q.all(packageDiscount(req.body.package, req.body.car, req.body.type, service.service, service.labour_cost, req.headers['tz']));

                        packages.push({
                            automaker: service.automaker,
                            model: service.model,
                            for: service.for,
                            package: service.package,
                            service: service.service,
                            description: service.description,
                            labour_cost: labour_cost,
                            part_cost: service.part_cost,
                            mrp: service.mrp,
                            cost: service.part_cost + labour_cost,
                            originalCost: service.part_cost + service.labour_cost,
                            is_common: service.is_common,
                            inclusions: service.inclusions,
                            fuel_type: service.fuel_type,
                            doorstep: service.doorstep,
                            type: "services",
                            id: service.id,
                            _id: service._id
                        })
                    });

                    await Service.find({ is_common: true }).cursor().eachAsync(async (service) => {
                        var labour_cost = await q.all(packageDiscount(req.body.package, req.body.car, req.body.type, service.service, service.labour_cost, req.headers['tz']));
                        packages.push({
                            automaker: service.automaker,
                            model: service.model,
                            for: service.for,
                            package: service.package,
                            service: service.service,
                            description: service.description,
                            labour_cost: labour_cost,
                            part_cost: service.part_cost,
                            mrp: service.mrp,
                            cost: service.part_cost + labour_cost,
                            originalCost: service.part_cost + service.labour_cost,
                            is_common: service.is_common,
                            inclusions: service.inclusions,
                            fuel_type: service.fuel_type,
                            doorstep: service.doorstep,
                            type: "services",
                            id: service.id,
                            _id: service._id
                        })
                    });

                    packages = _(packages).groupBy(x => x.package).map((value, key) => ({ package: key, services: value })).value();

                    packageDiscountOn = []
                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Services",
                        responseData: packages,
                    });
                }
                else {
                    await Service.find({ model: car.model, fuel_type: 'Diesel' })
                        .cursor().eachAsync(async (service) => {
                            var labour_cost = await q.all(packageDiscount(req.body.package, req.body.car, req.body.type, service.service, service.labour_cost, req.headers['tz']));
                            packages.push({
                                automaker: service.automaker,
                                model: service.model,
                                for: service.for,
                                package: service.package,
                                service: service.service,
                                description: service.description,
                                labour_cost: labour_cost,
                                part_cost: service.part_cost,
                                mrp: service.mrp,
                                cost: service.part_cost + labour_cost,
                                originalCost: service.part_cost + service.labour_cost,
                                is_common: service.is_common,
                                inclusions: service.inclusions,
                                fuel_type: service.fuel_type,
                                doorstep: service.doorstep,
                                type: "services",
                                id: service.id,
                                _id: service._id
                            })
                        });

                    await Service.find({ is_common: true }).cursor().eachAsync(async (service) => {
                        var labour_cost = await q.all(packageDiscount(req.body.package, req.body.car, req.body.type, service.service, service.labour_cost, req.headers['tz']));
                        packages.push({
                            automaker: service.automaker,
                            model: service.model,
                            for: service.for,
                            package: service.package,
                            service: service.service,
                            description: service.description,
                            labour_cost: labour_cost,
                            part_cost: service.part_cost,
                            mrp: service.mrp,
                            cost: service.part_cost + labour_cost,
                            originalCost: service.part_cost + service.labour_cost,
                            is_common: service.is_common,
                            inclusions: service.inclusions,
                            fuel_type: service.fuel_type,
                            doorstep: service.doorstep,
                            type: "services",
                            id: service.id,
                            _id: service._id
                        })
                    });

                    await Service.find({ model: car.model, $or: [{ service: "Wheel Alignment" }, { service: "Wheel Balancing (cost per tyre, weights excluded)" }] }).cursor().eachAsync(async (service) => {
                        var labour_cost = await q.all(packageDiscount(req.body.package, req.body.car, req.body.type, service.service, service.labour_cost, req.headers['tz']));
                        packages.push({
                            automaker: service.automaker,
                            model: service.model,
                            for: service.for,
                            package: service.package,
                            service: service.service,
                            description: service.description,
                            labour_cost: labour_cost,
                            part_cost: service.part_cost,
                            mrp: service.mrp,
                            cost: service.part_cost + labour_cost,
                            originalCost: service.part_cost + service.labour_cost,
                            is_common: service.is_common,
                            inclusions: service.inclusions,
                            fuel_type: service.fuel_type,
                            doorstep: service.doorstep,
                            type: "services",
                            id: service.id,
                            _id: service._id
                        })
                    });

                    packages = _(packages).groupBy(x => x.package).map((value, key) => ({ package: key, services: value })).value();
                    packageDiscountOn = []
                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Services",
                        responseData: packages,
                    });
                }
            }
            else if (req.body.type == "collision") {
                await Collision.find({ model: car.model, paint: req.body.paint }).cursor().eachAsync(async (service) => {
                    var labour_cost = await q.all(packageDiscount(req.body.package, req.body.car, req.body.type, service.service, service.labour_cost, req.headers['tz']));
                    packages.push({
                        model: service.model,
                        model_name: service.model_name,
                        service: service.service,
                        icon: "https://s3.ap-south-1.amazonaws.com/" + config.BUCKET_NAME + "/icon/" + _.camelCase(service.service) + ".png",
                        description: service.description,
                        mrp: service.mrp,
                        labour_cost: labour_cost,
                        part_cost: service.part_cost,
                        cost: service.part_cost + labour_cost,
                        originalCost: service.part_cost + service.labour_cost,
                        paint: service.paint,
                        id: service.id,
                        doorstep: service.doorstep,
                        type: "collision",
                        _id: service._id
                    })
                });
                packageDiscountOn = []
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Collision",
                    responseData: packages
                });
            }
            else if (req.body.type == "washing") {
                await Washing.find({ model: car.model }).cursor().eachAsync(async (service) => {
                    var labour_cost = await q.all(packageDiscount(req.body.package, req.body.car, req.body.type, service.service, service.labour_cost, req.headers['tz']));

                    packages.push({
                        automaker: service.automaker,
                        brand: service.brand,
                        service: service.service,
                        description: service.description,
                        mrp: service.mrp,
                        labour_cost: labour_cost,
                        part_cost: service.part_cost,
                        type: "washing",
                        cost: service.part_cost + labour_cost,
                        originalCost: service.part_cost + service.labour_cost,
                        paint: service.paint,
                        id: service.id,
                        doorstep: service.doorstep,
                        _id: service._id
                    });

                });
                await Package.find({ category: "washing" }).cursor().eachAsync(async (service) => {
                    packages.push({
                        service: service.name,
                        description: service.description,
                        mrp: service.mrp,
                        discount: service.discount,
                        labour_cost: service.cost,
                        part_cost: 0,
                        type: "package",
                        cost: service.cost,
                        id: service.id,
                        _id: service._id,
                        label: service.label,
                        validity: service.validity,
                    });
                });
                packageDiscountOn = []
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Washing",
                    responseData: packages
                });
            }
            else if (req.body.type == "package") {
                await Package.find({ label: "special" }).cursor().eachAsync(async (service) => {
                    var serverTime = moment.tz(new Date(), req.headers['tz']);
                    var bar = moment.tz(service.expired_at, req.headers['tz']);
                    var baz = bar.diff(serverTime);
                    // console.log(baz)
                    if (baz > 0) {
                        packages.push({
                            service: service.name,
                            description: service.description,
                            mrp: service.mrp,
                            discount: service.discount,
                            labour_cost: service.cost,
                            part_cost: 0,
                            type: "package",
                            cost: service.cost,
                            id: service.id,
                            _id: service._id,
                            label: service.label,
                            validity: service.validity,
                            expired_at: moment(service.expired_at).tz(req.headers['tz']).format('ll')
                        });
                    }
                });
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Washing",
                    responseData: packages
                });

            }
        }
        else {
            res.status(401).json({
                responseCode: 401,
                responseMessage: "Unauthorized",
                responseData: {},
            });
        }
    }
});


/**
 * [Booking API]
 * @param  {[raw json]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {middleware} next [description]
 * @return {[json]}        [description]
*/

router.post('/booking/add/', xAccessToken.token, async function (req, res, next) {
    var rules = {
        car: 'required',
        services: 'required'
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
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var user = decoded.user;
        var total = 0;
        var labourCost = 0;
        var part_cost = 0;
        var bookingService = [];
        var services = req.body.services;
        var countBooking = await Booking.find({}).count().exec();
        var checkCar = await Car.find({ '_id': req.body.car, user: user }).count().exec();

        if (req.body.package == "") {
            req.body.package = null;
        }

        if (checkCar > 0) {
            var checkVendor = await User.find({ '_id': req.body.business }).count().exec();
            if (checkVendor > 0) {
                for (var i = 0; i < services.length; i++) {
                    if (services[i].type == "services") {
                        await Service.find({ _id: services[i].id }).cursor().eachAsync(async (service) => {
                            if (service) {
                                var labour_cost = await q.all(packageDiscount(req.body.package, req.body.car, services[i].type, service.service, service.labour_cost));

                                bookingService.push({
                                    type: services[i].type,
                                    source: service._id,
                                    service: service.service,
                                    description: service.description,
                                    cost: labour_cost + service.part_cost,
                                    labour_cost: labour_cost,
                                    part_cost: service.part_cost,
                                    type: "services"
                                });
                                part_cost = part_cost + service.part_cost;
                                labourCost = labourCost + labour_cost;
                            }
                            else {
                                res.status(400).json({
                                    responseCode: 400,
                                    responseMessage: "Service Not Found",
                                    responseData: {},
                                });
                            }
                        });
                    }
                    else if (services[i].type == "collision") {
                        await Collision.find({ _id: services[i].id }).cursor().eachAsync(async (service) => {
                            if (service) {
                                var labour_cost = await q.all(packageDiscount(req.body.package, req.body.car, services[i].type, service.service, service.labour_cost));
                                bookingService.push({
                                    type: services[i].type,
                                    source: service._id,
                                    service: service.service,
                                    description: service.description,
                                    cost: labour_cost + service.part_cost,
                                    labour_cost: labour_cost,
                                    part_cost: service.part_cost,
                                    type: "collision"
                                });
                                part_cost = part_cost + service.part_cost;
                                labourCost = labourCost + labour_cost;
                            }
                            else {
                                res.status(400).json({
                                    responseCode: 400,
                                    responseMessage: "Service Not Found",
                                    responseData: {},
                                });
                            }
                        });
                    }
                    else if (services[i].type == "washing") {
                        await Washing.find({ _id: services[i].id }).cursor().eachAsync(async (service) => {
                            if (service) {
                                var labour_cost = await q.all(packageDiscount(req.body.package, req.body.car, services[i].type, service.service, service.labour_cost));
                                bookingService.push({
                                    type: services[i].type,
                                    source: service._id,
                                    service: service.service,
                                    description: service.description,
                                    cost: labour_cost + service.part_cost,
                                    labour_cost: labour_cost,
                                    part_cost: service.part_cost,
                                    type: "washing"
                                });
                                part_cost = part_cost + service.part_cost;
                                labourCost = labourCost + labour_cost;
                            }
                            else {
                                res.status(400).json({
                                    responseCode: 400,
                                    responseMessage: "Service Not Found",
                                    responseData: {},
                                });
                            }
                        });
                    }

                    else if (services[i].type == "package") {
                        await Package.find({ _id: services[i].id }).cursor().eachAsync(async (service) => {
                            if (service) {

                                bookingService.push({
                                    type: services[i].type,
                                    source: service._id,
                                    service: service.service,
                                    description: service.description,
                                    cost: service.cost,
                                    labour_cost: service.cost,
                                    part_cost: 0,
                                    type: "package"
                                });
                                part_cost = part_cost + 0;
                                labourCost = labourCost + service.cost;
                            }
                            else {
                                res.status(400).json({
                                    responseCode: 400,
                                    responseMessage: "Service Not Found",
                                    responseData: {},
                                });
                            }
                        });
                    }
                }

                var payment = {
                    payment_mode: req.body.payment_mode,
                    payment_status: "Pending",
                    discount_type: "",
                    coupon: "",
                    coupon_type: "",
                    discount: 0,
                    discount_total: 0,
                    part_cost: part_cost,
                    labour_cost: labourCost,
                    paid_total: part_cost + labourCost,
                    total: part_cost + labourCost,
                    discount_applied: false,
                    transaction_id: "",
                    transaction_date: "",
                    transaction_status: "",
                    transaction_response: ""
                }



                var data = {
                    package: req.body.package,
                    car: req.body.car,
                    business: req.body.business,
                    user: user,
                    services: bookingService,
                    booking_no: 999999 + countBooking,
                    date: req.body.date,
                    time_slot: req.body.time_slot,
                    convenience: req.body.convenience,
                    status: "Inactive",
                    payment: payment,
                    address: req.body.address,
                    created_at: new Date(),
                    updated_at: new Date()
                };

                Booking.create(data).then(async function (booking) {
                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Service Request has been booked",
                        responseData: booking
                    });
                });
            }
            else {
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Business Not Found",
                    responseData: {},
                });
            }
        }
        else {
            res.status(401).json({
                responseCode: 401,
                responseMessage: "Unauthorized",
                responseData: {},
            });
        }
    }
});



/**
 * [Apply Coupon API]
 * @param  {[raw json]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {middleware} next [description]
 * @return {[json]}        [description]
*/

router.post('/booking/coin-deduction/details', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var data = new Object();
    var discount = 0;

    var booking = await Booking.findById(req.body.id).exec();
    var coupon = await Coupon.findOne({ code: req.body.coupon }).exec();

    var getCoins = await User.findById(user).select('careager_cash').exec();
    if (booking) {
        if (booking.payment.paid_total != 0) {
            if (booking.payment.discount_applied == false) {
                if (getCoins.careager_cash != 0) {
                    var coinsCalc = getCoins.careager_cash * 70;
                    if (coinsCalc < booking.payment.total) {
                        discount = getCoins.careager_cash;

                        remain = getCoins.careager_cash - discount;
                        data = {
                            payment: {
                                payment_mode: "Online",
                                discount_type: "coins",
                                coupon: "",
                                coupon_type: "price",
                                discount: discount,
                                discount_total: discount,
                                labour_cost: booking.payment.labour_cost,
                                part_cost: booking.payment.part_cost,
                                paid_total: booking.payment.part_cost + (booking.payment.labour_cost - discount),
                                total: booking.payment.total,
                                discount_applied: true,
                                transaction_id: "",
                                transaction_date: "",
                                transaction_status: "",
                                transaction_response: ""
                            }
                        }
                    }
                    else {
                        discount = Math.ceil(getCoins.careager_cash * (20 / 100));

                        remain = getCoins.careager_cash - discount;

                        data = {
                            payment: {
                                payment_mode: "Online",
                                discount_type: "coins",
                                coupon: "",
                                coupon_type: "price",
                                discount: discount,
                                discount_total: discount,
                                labour_cost: booking.payment.labour_cost,
                                part_cost: booking.payment.part_cost,
                                paid_total: booking.payment.part_cost + (booking.payment.labour_cost - discount),
                                total: booking.payment.total,
                                discount_applied: true,
                                transaction_id: "",
                                transaction_date: "",
                                transaction_status: "",
                                transaction_response: ""
                            }
                        }
                    }
                }

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Coupon Applied",
                    responseData: data.payment
                })
            }
            else {
                res.status(422).json({
                    responseCode: 422,
                    responseMessage: "Discount Already Applied",
                    responseData: {}
                });
            }
        }
        else {
            res.status(422).json({
                responseCode: 422,
                responseMessage: "Not eligible for discount",
                responseData: {}
            });
        }
    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Booking Not Found",
            responseData: {}
        });
    }
});



/**
 * [Apply Coupon API]
 * @param  {[raw json]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {middleware} next [description]
 * @return {[json]}        [description]
*/

router.post('/booking/coupon/add', xAccessToken.token, async function (req, res, next) {
    var rules = {
        id: 'required',
        type: 'required',
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Coupon Code is required",
            responseData: {
                res: validation.errors.all()
            }
        });
    }
    else {
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var user = decoded.user;
        var data = new Object();
        var discount = 0;

        var booking = await Booking.findOne({ _id: req.body.id, user: user }).exec();
        var coupon = await Coupon.findOne({ code: req.body.coupon.toUpperCase() }).exec();
        var used = await CouponUsed.findOne({ code: req.body.coupon.toUpperCase(), user: user }).count().exec();

        if (booking) {
            if (booking.payment.paid_total != 0) {
                if (req.body.type == "coupon") {
                    if (coupon) {
                        if (used == 0) {
                            var serverTime = moment.tz(new Date(), req.headers['tz']);
                            var bar = moment.tz(coupon.expired_at, req.headers['tz']);
                            var baz = bar.diff(serverTime);
                            if (baz > 0) {
                                var limit = await CouponUsed.findOne({ code: req.body.coupon.toUpperCase() }).count().exec();
                                if (limit != coupon.limit) {
                                    if (coupon.for == "general") {
                                        if (coupon.priceLimit) {
                                            checkDiscount = booking.payment.labour_cost * (coupon.discount / 100);
                                            if (checkDiscount >= coupon.priceLimit) {
                                                discount = coupon.priceLimit;
                                                data = {
                                                    payment: {
                                                        payment_mode: "Online",
                                                        discount_type: req.body.type,
                                                        coupon: req.body.coupon.toUpperCase(),
                                                        coupon_type: coupon.type,
                                                        discount: coupon.discount,
                                                        discount_total: discount,
                                                        labour_cost: booking.payment.labour_cost,
                                                        part_cost: booking.payment.part_cost,
                                                        paid_total: booking.payment.part_cost + (booking.payment.labour_cost - discount),
                                                        total: booking.payment.total,
                                                        discount_applied: true,
                                                        transaction_id: "",
                                                        transaction_date: "",
                                                        transaction_status: "",
                                                        transaction_response: ""
                                                    }
                                                }
                                            }
                                            else {
                                                discount = checkDiscount;
                                                data = {
                                                    payment: {
                                                        payment_mode: "Online",
                                                        discount_type: req.body.type,
                                                        coupon: req.body.coupon.toUpperCase(),
                                                        coupon_type: coupon.type,
                                                        discount: coupon.discount,
                                                        discount_total: discount,
                                                        labour_cost: booking.payment.labour_cost,
                                                        part_cost: booking.payment.part_cost,
                                                        paid_total: booking.payment.part_cost + (booking.payment.labour_cost - discount),
                                                        total: booking.payment.total,
                                                        discount_applied: true,
                                                        transaction_id: "",
                                                        transaction_date: "",
                                                        transaction_status: "",
                                                        transaction_response: ""
                                                    }
                                                }
                                            }
                                        }
                                        else if (coupon.type == "percent") {
                                            discount = booking.payment.labour_cost * (coupon.discount / 100);
                                            data = {
                                                payment: {
                                                    payment_mode: "Online",
                                                    discount_type: req.body.type,
                                                    coupon: req.body.coupon.toUpperCase(),
                                                    coupon_type: coupon.type,
                                                    discount: coupon.discount,
                                                    discount_total: discount,
                                                    labour_cost: booking.payment.labour_cost,
                                                    part_cost: booking.payment.part_cost,
                                                    paid_total: booking.payment.part_cost + (booking.payment.labour_cost - discount),
                                                    total: booking.payment.total,
                                                    discount_applied: true,
                                                    transaction_id: "",
                                                    transaction_date: "",
                                                    transaction_status: "",
                                                    transaction_response: ""
                                                }
                                            }
                                        }
                                        else if (coupon.type == "price") {
                                            discount = coupon.discount;
                                            data = {
                                                payment: {
                                                    payment_mode: "Online",
                                                    discount_type: req.body.type,
                                                    coupon: req.body.coupon.toUpperCase(),
                                                    coupon_type: coupon.type,
                                                    discount: coupon.discount,
                                                    discount_total: discount,
                                                    labour_cost: booking.payment.labour_cost,
                                                    part_cost: booking.payment.part_cost,
                                                    paid_total: booking.payment.part_cost + (booking.payment.labour_cost - discount),
                                                    total: booking.payment.total,
                                                    discount_applied: true,
                                                    transaction_id: "",
                                                    transaction_date: "",
                                                    transaction_status: "",
                                                    transaction_response: ""
                                                }
                                            }
                                        }

                                        if (data.payment.paid_total >= 0) {
                                            await Booking.findOneAndUpdate({ _id: req.body.id }, { $set: data }, { new: false }, async function (err, doc) {
                                                if (err) {
                                                    res.status(422).json({
                                                        responseCode: 422,
                                                        responseMessage: "Error Occurred",
                                                        responseData: {}
                                                    })
                                                }
                                                else {
                                                    res.status(200).json({
                                                        responseCode: 200,
                                                        responseMessage: "Coupon Applied",
                                                        responseData: data.payment
                                                    })
                                                }
                                            });
                                        }
                                        else {
                                            res.status(422).json({
                                                responseCode: 422,
                                                responseMessage: "Coupon cannot be applied on this booking",
                                                responseData: {}
                                            });
                                        }
                                    }
                                    else if (coupon.for == "category") {
                                        var coupon_for = _.filter(booking.services, type => type.type == coupon.label);

                                        if (Object.keys(coupon_for).length > 0) {
                                            var other = _.filter(booking.services, type => type.type != coupon.for);
                                            var coupon_labour_cost = _.sumBy(coupon_for, x => x.labour_cost);
                                            var labour_cost = _.sumBy(booking.services, x => x.labour_cost) - coupon_labour_cost;
                                            var part_cost = _.sumBy(booking.services, x => x.part_cost);

                                            if (coupon.type == "percent") {
                                                discount = coupon_labour_cost * (coupon.discount / 100);
                                                data = {
                                                    payment: {
                                                        payment_mode: "Online",
                                                        discount_type: req.body.type,
                                                        coupon: req.body.coupon.toUpperCase(),
                                                        coupon_type: coupon.type,
                                                        discount: coupon.discount,
                                                        discount_total: discount,
                                                        labour_cost: booking.payment.labour_cost,
                                                        part_cost: booking.payment.part_cost,
                                                        paid_total: part_cost + labour_cost + coupon_labour_cost - discount,
                                                        total: booking.payment.total,
                                                        discount_applied: true,
                                                        transaction_id: "",
                                                        transaction_date: "",
                                                        transaction_status: "",
                                                        transaction_response: ""
                                                    }
                                                }
                                            }
                                            else if (coupon.type == "price") {
                                                discount = coupon.discount;
                                                data = {
                                                    payment: {
                                                        payment_mode: "Online",
                                                        discount_type: req.body.type,
                                                        coupon: req.body.coupon.toUpperCase(),
                                                        coupon_type: coupon.type,
                                                        discount: coupon.discount,
                                                        discount_total: discount,
                                                        labour_cost: booking.payment.labour_cost,
                                                        part_cost: booking.payment.part_cost,
                                                        paid_total: part_cost + labour_cost + (coupon_labour_cost - discount),
                                                        total: booking.payment.total,
                                                        discount_applied: true,
                                                        transaction_id: "",
                                                        transaction_date: "",
                                                        transaction_status: "",
                                                        transaction_response: ""
                                                    }
                                                }
                                            }

                                            if (data.payment.paid_total >= 0) {
                                                await Booking.findOneAndUpdate({ _id: req.body.id }, { $set: data }, { new: false }, async function (err, doc) {
                                                    if (err) {
                                                        res.status(422).json({
                                                            responseCode: 422,
                                                            responseMessage: "Error Occurred",
                                                            responseData: {}
                                                        })
                                                    }
                                                    else {
                                                        res.status(200).json({
                                                            responseCode: 200,
                                                            responseMessage: "Coupon Applied",
                                                            responseData: data.payment
                                                        })
                                                    }
                                                });
                                            }
                                            else {
                                                res.status(422).json({
                                                    responseCode: 422,
                                                    responseMessage: "Coupon cannot be applied on this booking",
                                                    responseData: {}
                                                });
                                            }
                                        }
                                        else {
                                            res.status(422).json({
                                                responseCode: 422,
                                                responseMessage: "Not valid for this service booking",
                                                responseData: {}
                                            })
                                        }
                                    }
                                    else if (coupon.for == "specific") {
                                        var coupon_for = _.filter(booking.services, service => service.service == coupon.label);
                                        if (Object.keys(coupon_for).length > 0) {
                                            var other = _.filter(booking.services, service => service.service != coupon.for);
                                            var coupon_labour_cost = _.sumBy(coupon_for, x => x.labour_cost);
                                            var labour_cost = _.sumBy(booking.services, x => x.labour_cost) - coupon_labour_cost;
                                            var part_cost = _.sumBy(booking.services, x => x.part_cost);

                                            if (coupon.type == "percent") {
                                                discount = coupon_labour_cost * (coupon.discount / 100);
                                                data = {
                                                    payment: {
                                                        payment_mode: "Online",
                                                        discount_type: req.body.type,
                                                        coupon: req.body.coupon.toUpperCase(),
                                                        coupon_type: coupon.type,
                                                        discount: coupon.discount,
                                                        discount_total: discount,
                                                        labour_cost: booking.payment.labour_cost,
                                                        part_cost: booking.payment.part_cost,
                                                        paid_total: part_cost + labour_cost + coupon_labour_cost - discount,
                                                        total: booking.payment.total,
                                                        discount_applied: true,
                                                        transaction_id: "",
                                                        transaction_date: "",
                                                        transaction_status: "",
                                                        transaction_response: ""
                                                    }
                                                }
                                            }
                                            else if (coupon.type == "price") {
                                                discount = coupon.discount;
                                                data = {
                                                    payment: {
                                                        payment_mode: "Online",
                                                        discount_type: req.body.type,
                                                        coupon: req.body.coupon.toUpperCase(),
                                                        coupon_type: coupon.type,
                                                        discount: coupon.discount,
                                                        discount_total: discount,
                                                        labour_cost: booking.payment.labour_cost,
                                                        part_cost: booking.payment.part_cost,
                                                        paid_total: part_cost + labour_cost + (coupon_labour_cost - discount),
                                                        total: booking.payment.total,
                                                        discount_applied: true,
                                                        transaction_id: "",
                                                        transaction_date: "",
                                                        transaction_status: "",
                                                        transaction_response: ""
                                                    }
                                                }
                                            }

                                            if (data.payment.paid_total >= 0) {
                                                await Booking.findOneAndUpdate({ _id: req.body.id }, { $set: data }, { new: false }, async function (err, doc) {
                                                    if (err) {
                                                        res.status(422).json({
                                                            responseCode: 422,
                                                            responseMessage: "Error Occurred",
                                                            responseData: {}
                                                        })
                                                    }
                                                    else {
                                                        res.status(200).json({
                                                            responseCode: 200,
                                                            responseMessage: "Coupon Applied",
                                                            responseData: data.payment
                                                        })
                                                    }
                                                });
                                            }
                                            else {
                                                res.status(422).json({
                                                    responseCode: 422,
                                                    responseMessage: "Coupon cannot be applied on this booking",
                                                    responseData: {}
                                                });
                                            }
                                        }
                                        else {
                                            res.status(422).json({
                                                responseCode: 422,
                                                responseMessage: "Not valid for this service booking",
                                                responseData: {}
                                            })
                                        }
                                    }
                                }
                                else {
                                    res.status(422).json({
                                        responseCode: 422,
                                        responseMessage: "Coupon Expired",
                                        responseData: {}
                                    });
                                }
                            }
                            else {
                                res.status(422).json({
                                    responseCode: 422,
                                    responseMessage: "Coupon Expired",
                                    responseData: {}
                                })
                            }
                        }
                        else {
                            res.status(400).json({
                                responseCode: 400,
                                responseMessage: "Coupon already used",
                                responseData: data.payment
                            })
                        }
                    }
                    else {
                        res.status(400).json({
                            responseCode: 400,
                            responseMessage: "Invalid Coupon Code",
                            responseData: {}
                        })
                    }
                }
                else if (req.body.type == "coins") {
                    var coinUsed = await Point.find({ source: booking._id, activity: "usedInBooking" }).count().exec();
                    if (coinUsed == 0) {
                        var getCoins = await User.findById(user).select('careager_cash').exec();
                        /*if(getCoins.careager_cash!=0)
                        {*/
                        var coinsCalc = getCoins.careager_cash * 70;
                        if (coinsCalc < booking.payment.total) {
                            discount = getCoins.careager_cash;
                            data = {
                                payment: {
                                    payment_mode: "Online",
                                    discount_type: req.body.type,
                                    coupon: "",
                                    coupon_type: "price",
                                    discount: discount,
                                    discount_total: discount,
                                    labour_cost: booking.payment.labour_cost,
                                    part_cost: booking.payment.part_cost,
                                    paid_total: booking.payment.part_cost + (booking.payment.labour_cost - discount),
                                    total: booking.payment.total,
                                    discount_applied: true,
                                    transaction_id: "",
                                    transaction_date: "",
                                    transaction_status: "",
                                    transaction_response: ""
                                }
                            }
                        }
                        else {
                            discount = Math.ceil(getCoins.careager_cash * (20 / 100));
                            var paid_total = booking.payment.part_cost + (booking.payment.labour_cost - discount);
                            if (paid_total >= 0) {
                                data = {
                                    payment: {
                                        payment_mode: "Online",
                                        discount_type: req.body.type,
                                        coupon: "",
                                        coupon_type: "price",
                                        discount: discount,
                                        discount_total: discount,
                                        labour_cost: booking.payment.labour_cost,
                                        part_cost: booking.payment.part_cost,
                                        paid_total: paid_total,
                                        total: booking.payment.total,
                                        discount_applied: true,
                                        transaction_id: "",
                                        transaction_date: "",
                                        transaction_status: "",
                                        transaction_response: ""
                                    }
                                }
                            }
                            else {
                                data = {
                                    payment: {
                                        payment_mode: "Online",
                                        discount_type: req.body.type,
                                        coupon: "",
                                        coupon_type: "price",
                                        discount: booking.payment.labour_cost,
                                        discount_total: booking.payment.labour_cost,
                                        labour_cost: booking.payment.labour_cost,
                                        part_cost: booking.payment.part_cost,
                                        paid_total: booking.payment.part_cost,
                                        total: booking.payment.total,
                                        discount_applied: true,
                                        transaction_id: "",
                                        transaction_date: "",
                                        transaction_status: "",
                                        transaction_response: ""
                                    }
                                }
                            }
                        }

                        await Booking.findOneAndUpdate({ _id: req.body.id }, { $set: data }, { new: false }, async function (err, doc) {
                            if (err) {
                                res.status(422).json({
                                    responseCode: 422,
                                    responseMessage: "Error Occurred",
                                    responseData: {}
                                })
                            }
                            else {
                                res.status(200).json({
                                    responseCode: 200,
                                    responseMessage: "CarEager Coin Applied",
                                    responseData: data.payment
                                })
                            }
                        });

                        /*}
                        else
                        {
                            res.status(422).json({
                                responseCode: 422,
                                responseMessage: "CarEager Coin cannot be applied on this booking as your coins have low balance",
                                responseData: {}
                            })
                        }*/
                    }
                    else {
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "CarEager Coin already used",
                            responseData: {}
                        });
                    }
                }
            }
            else {

                data = {
                    payment: {
                        payment_mode: "Online",
                        discount_type: req.body.type,
                        coupon: '',
                        coupon_type: '',
                        discount: 0,
                        discount_total: 0,
                        labour_cost: booking.payment.labour_cost,
                        part_cost: booking.payment.part_cost,
                        paid_total: booking.payment.part_cost + booking.payment.labour_cost,
                        total: booking.payment.total,
                        discount_applied: true,
                        transaction_id: "",
                        transaction_date: "",
                        transaction_status: "",
                        transaction_response: ""
                    }
                }

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "",
                    responseData: data.payment
                })
            }
        }
        else {
            res.status(401).json({
                responseCode: 401,
                responseMessage: "Unauthorized",
                responseData: {}
            });
        }
    }
});


/**
 * [Apply Coupon API]
 * @param  {[raw json]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {middleware} next [description]
 * @return {[json]}        [description]
*/

router.post('/booking/coupon/remove', xAccessToken.token, async function (req, res, next) {
    var rules = {
        id: 'required',
        type: 'required',
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Coupon Code is required",
            responseData: {
                res: validation.errors.all()
            }
        });
    }
    else {
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var user = decoded.user;
        var data = new Object();
        var discount = 0;
        var booking = await Booking.findById(req.body.id).exec();
        var coupon = await Coupon.findOne({ code: req.body.coupon }).exec();

        if (booking) {
            if (booking.status == "Inactive") {
                data = {
                    payment: {
                        payment_mode: "",
                        discount_type: "",
                        coupon: "",
                        coupon_type: "",
                        discount: 0,
                        discount_total: 0,
                        labour_cost: booking.payment.labour_cost,
                        part_cost: booking.payment.part_cost,
                        paid_total: booking.payment.total,
                        total: booking.payment.total,
                        discount_applied: false,
                        transaction_id: "",
                        transaction_date: "",
                        transaction_status: "",
                        transaction_response: ""
                    }
                };

                await Booking.findOneAndUpdate({ _id: req.body.id }, { $set: data }, { new: false }, async function (err, doc) {
                    if (err) {
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Error Occurred",
                            responseData: {}
                        })
                    }
                    else {
                        if (req.body.type == "coupon") {
                            await CouponUsed.remove({ user: user, booking: req.body.id }).exec();
                        }

                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Coupon Removed",
                            responseData: data.payment
                        })
                    }
                });
            }
            else {
                res.status(401).json({
                    responseCode: 401,
                    responseMessage: "Unauthorized",
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

/**
 * [Payment Success API]
 * @param  {[raw json]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {middleware} next [description]
 * @return {[json]}        [description]
*/

router.get('/payment/checksum/generate', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var paramarray = new Object();
    var discount = 0;
    var booking = await Booking.findById(req.query.id).exec();
    var getUser = await User.findById(user).exec();
    if (booking) {
        if (booking.user == user) {
            var total = booking.payment.paid_total;
            total = total.toFixed(2);
            var paramarray = {
                MID: paytm_config.MID,
                ORDER_ID: booking.booking_no.toString(),
                CUST_ID: user.toString(),
                INDUSTRY_TYPE_ID: paytm_config.INDUSTRY_TYPE_ID,
                CHANNEL_ID: "WAP",
                TXN_AMOUNT: total.toString(),
                WEBSITE: paytm_config.WEBSITE,
                CALLBACK_URL: paytm_config.CALLBACK + 'theia/paytmCallback?ORDER_ID=' + booking.booking_no.toString(),
                EMAIL: getUser.email,
                MOBILE_NO: getUser.contact_no
            };

            paytm_checksum.genchecksum(paramarray, paytm_config.MERCHANT_KEY, function (err, data) {
                if (err) {
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "failure",
                        responseData: err
                    });
                }
                else {
                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Payment Success",
                        responseData: data
                    });
                }
            });
        }
        else {
            res.status(401).json({
                responseCode: 401,
                responseMessage: "Unauthorized",
                responseData: {}
            });
        }
    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Booking Not Found",
            responseData: {}
        });
    }
});

/**
 * [Payment Status API]
 * @param  {[raw json]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {middleware} next [description]
 * @return {[json]}        [description]
*/

router.get('/payment/transaction/status', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var paramarray = new Object();
    var discount = 0;
    var booking = await Booking.findOne({ booking_no: req.query.id }).exec();
    var getUser = await User.findById(user).exec();
    if (booking) {
        if (booking.user == user) {
            var total = booking.payment.paid_total;
            total = total.toFixed(2);



            var paramarray = {
                MID: paytm_config.MID,
                ORDER_ID: booking.booking_no.toString(),
                CUST_ID: user.toString(),
                INDUSTRY_TYPE_ID: paytm_config.INDUSTRY_TYPE_ID,
                CHANNEL_ID: "WAP",
                TXN_AMOUNT: total.toString(),
                WEBSITE: paytm_config.WEBSITE,
                CALLBACK_URL: paytm_config.CALLBACK + 'theia/paytmCallback?ORDER_ID=' + booking.booking_no.toString(),
                EMAIL: getUser.email,
                MOBILE_NO: getUser.contact_no
            };

            paytm_checksum.genchecksum(paramarray, paytm_config.MERCHANT_KEY, async function (err, result) {
                result["CHECKSUMHASH"] = encodeURIComponent(result["CHECKSUMHASH"]);
                var finalstring = "JsonData=" + JSON.stringify(result);
                request.post({ url: paytm_config.CALLBACK + 'merchant-status/getTxnStatus?' + finalstring }, async function (error, httpResponse, body) {
                    if (error) {
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "failure",
                            responseData: err
                        });
                    }
                    else {
                        var paytmRes = JSON.parse(body);
                        if (paytmRes.STATUS == "TXN_SUCCESS") {


                            var data = {
                                status: "Pending",
                                payment: {
                                    payment_mode: booking.payment.payment_mode,
                                    payment_status: booking.payment.payment_status,
                                    discount_type: booking.payment.discount_type,
                                    coupon: booking.payment.coupon,
                                    coupon_type: booking.payment.coupon_type,
                                    discount: booking.payment.discount,
                                    discount_total: booking.payment.discount_total,
                                    labour_cost: booking.payment.labour_cost,
                                    part_cost: booking.payment.part_cost,
                                    paid_total: booking.payment.paid_total,
                                    total: booking.payment.total,
                                    discount_applied: booking.payment.discount_applied,
                                    transaction_id: paytmRes.TXNID,
                                    transaction_date: paytmRes.TXNDATE,
                                    transaction_status: paytmRes.STATUS,
                                    transaction_response: paytmRes.RESPMSG
                                }
                            };

                            await Booking.findOneAndUpdate({ _id: booking._id }, { $set: data }, { new: false }, async function (err, doc) {
                                if (err) {
                                    res.status(422).json({
                                        responseCode: 422,
                                        responseMessage: "Error Occurred",
                                        responseData: {}
                                    })
                                }
                                else {

                                    booking.services.forEach(async function (service) {
                                        if (service.type == "package") {
                                            var package = await Package.findOne({ _id: service.source }).exec();
                                            var expired_at = new Date();
                                            expired_at.setDate(expired_at.getDate() + package.validity);
                                            UserPackage.create({
                                                user: user,
                                                car: booking.car,
                                                name: package.name,
                                                description: package.description,
                                                package: package._id,
                                                payment: {
                                                    total: service.cost,
                                                    paid_total: service.cost,
                                                },
                                                discount: package.discount,
                                                validity: package.validity,
                                                expired_at: expired_at,
                                                created_at: new Date(),
                                                updated_at: new Date()
                                            })
                                        }
                                    })

                                    if (booking.package) {
                                        var package = await UserPackage.findOne({ _id: booking.package, car: booking.car }).exec();
                                        if (package) {
                                            booking.services.forEach(async function (service) {
                                                package.discount.forEach(async function (dis) {
                                                    if (dis.for == "specific") {
                                                        if (dis.label == service.service) {
                                                            PackageUsed.create({
                                                                package: booking.package,
                                                                car: booking.car,
                                                                user: user,
                                                                booking: booking._id,
                                                                for: booking.specific,
                                                                label: service.service,
                                                                created_at: new Date(),
                                                                updated_at: new Date()
                                                            });
                                                        }
                                                    }
                                                });
                                            });
                                        }
                                    }

                                    if (booking.payment.discount_type == "coins") {
                                        var getCoins = await User.findById(user).select('careager_cash').exec();
                                        var remain = getCoins.careager_cash - booking.payment.discount;

                                        var point = {
                                            status: true,
                                            user: user,
                                            activity: "booking",
                                            tag: "usedInBooking",
                                            points: booking.payment.discount,
                                            source: booking._id,
                                            created_at: new Date(),
                                            updated_at: new Date(),
                                            type: "debit",
                                        };

                                        Point.create(point).then(async function (point) {
                                            await User.findOneAndUpdate({ _id: user }, { $set: { careager_cash: remain } }, { new: false }, async function (err, doc) { });
                                        })
                                    }

                                    else if (booking.payment.discount_type == "coupon" && booking.payment.discount_total != 0 && booking.payment.discount_total) {
                                        var coupon = await Coupon.findOne({ code: booking.payment.coupon }).exec();

                                        CouponUsed.create({
                                            coupon: coupon._id,
                                            code: coupon.code,
                                            booking: booking._id,
                                            user: user,
                                            created_at: new Date(),
                                            updated_at: new Date()
                                        });
                                    }

                                    var notify = {
                                        receiver: [booking.business],
                                        activity: "booking",
                                        tag: "newBooking",
                                        source: booking._id,
                                        sender: user,
                                        points: 0
                                    }

                                    fun.newNotification(notify);
                                    event.bookingMail(user, booking.business, booking._id);

                                    res.status(200).json({
                                        responseCode: 200,
                                        responseMessage: "Service has been booked",
                                        responseData: paytmRes
                                    })
                                }
                            });
                        }
                        else {
                            res.status(200).json({
                                responseCode: 200,
                                responseMessage: "Payment Failure",
                                responseData: paytmRes
                            });
                        }
                    }
                });
            });
        }
        else {
            res.status(401).json({
                responseCode: 401,
                responseMessage: "Unauthorized",
                responseData: {}
            });
        }
    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Booking Not Found",
            responseData: {}
        });
    }
});

/**
 * [Payment Success API]
 * @param  {[raw json]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {middleware} next [description]
 * @return {[json]}        [description]
*/

router.post('/payment/success', xAccessToken.token, async function (req, res, next) {

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
        var booking = await Booking.findById(req.body.id).exec();
        var coupon = await Coupon.findOne({ code: req.body.coupon }).exec();

        if (booking) {
            var data = {
                status: "Pending",
                payment: {
                    payment_mode: booking.payment.payment_mode,
                    payment_status: booking.payment.payment_status,
                    discount_type: booking.payment.discount_type,
                    coupon: booking.payment.coupon,
                    coupon_type: booking.payment.coupon_type,
                    discount: booking.payment.discount,
                    discount_total: booking.payment.discount_total,
                    labour_cost: booking.payment.labour_cost,
                    part_cost: booking.payment.part_cost,
                    paid_total: booking.payment.paid_total,
                    total: booking.payment.total,
                    discount_applied: booking.payment.discount_applied,
                    transaction_id: "",
                    transaction_date: "",
                    transaction_status: "",
                    transaction_response: ""
                }
            };
            await Booking.findOneAndUpdate({ _id: req.body.id }, { $set: data }, { new: false }, async function (err, doc) {
                if (err) {
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Error Occurred",
                        responseData: {}
                    })
                }
                else {
                    booking.services.forEach(async function (service) {
                        if (service.type == "package") {
                            var package = await Package.findOne({ _id: service.source }).exec();
                            var expired_at = new Date();
                            expired_at.setDate(expired_at.getDate() + package.validity);
                            UserPackage.create({
                                user: user,
                                car: booking.car,
                                name: package.name,
                                description: package.description,
                                package: package._id,
                                payment: {
                                    total: service.cost,
                                    paid_total: service.cost,
                                },
                                discount: package.discount,
                                validity: package.validity,
                                expired_at: expired_at,
                                created_at: new Date(),
                                updated_at: new Date()
                            })
                        }
                    })

                    if (booking.package) {
                        var package = await UserPackage.findOne({ _id: booking.package, car: booking.car }).exec();
                        if (package) {
                            booking.services.forEach(async function (service) {
                                package.discount.forEach(async function (dis) {
                                    if (dis.for == "specific") {
                                        if (dis.label == service.service) {
                                            PackageUsed.create({
                                                package: booking.package,
                                                car: booking.car,
                                                user: user,
                                                booking: booking._id,
                                                for: booking.specific,
                                                label: service.service,
                                                created_at: new Date(),
                                                updated_at: new Date()
                                            });
                                        }
                                    }
                                });
                            });
                        }
                    }

                    if (booking.payment.discount_type == "coins") {
                        var getCoins = await User.findById(user).select('careager_cash').exec();
                        var remain = getCoins.careager_cash - booking.payment.discount;

                        var point = {
                            status: true,
                            user: user,
                            activity: "booking",
                            tag: "usedInBooking",
                            points: booking.payment.discount,
                            source: booking._id,
                            created_at: new Date(),
                            updated_at: new Date(),
                            type: "debit",
                        };

                        Point.create(point).then(async function (point) {
                            await User.findOneAndUpdate({ _id: user }, { $set: { careager_cash: remain } }, { new: false }, async function (err, doc) { });
                        })
                    }

                    else if (booking.payment.discount_type == "coupon" && booking.payment.discount_total != 0 && booking.payment.discount_total) {
                        var coupon = await Coupon.findOne({ code: booking.payment.coupon }).exec();

                        CouponUsed.create({
                            coupon: coupon._id,
                            code: coupon.code,
                            booking: booking._id,
                            user: user,
                            created_at: new Date(),
                            updated_at: new Date()
                        });
                    }

                    var notify = {
                        receiver: [booking.business],
                        activity: "booking",
                        tag: "newBooking",
                        source: booking._id,
                        sender: user,
                        points: 0
                    }

                    fun.newNotification(notify);
                    event.bookingMail(user, booking.business, booking._id);

                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Service has been booked",
                        responseData: {}
                    })
                }
            });
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Booking not found",
                responseData: {}
            })
        }
    }
});


/**
 * [Payment Failure API]
 * @param  {[raw json]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {middleware} next [description]
 * @return {[json]}        [description]
*/

router.get('/payment/failure', xAccessToken.token, async function (req, res, next) {
    res.status(200).json({
        responseCode: 200,
        responseMessage: "Payment Success",
        responseData: {
        }
    });
    /*var rules = {
        car: 'required',
        business: 'required',
        services: 'required',
        time_slot: 'required',
        date: 'required',
        convenience: 'required',
        payment_mode: 'required',
    };

    var validation = new Validator(req.body, rules);

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
    }   */
});


/**
 * [Point Transaction API]
 * @param  {[raw json]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {middleware} next [description]
 * @return {[json]}        [description]
*/

router.get('/coins/transaction/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;

    var points = [];
    var total = 0, used = 0;
    var unused = await User.findOne({ _id: user }).select('careager_cash').exec();
    await Point.find({ user: user }).sort({ created_at: -1 }).cursor().eachAsync(async (point) => {
        if (point.type == "credit") {
            total = total + point.points;
        }

        if (point.type == "debit") {
            used = used + point.points;
        }

        points.push({
            _id: point._id,
            points: point.points,
            type: point.type,
            tag: _.startCase(point.tag),
            status: point.status,
            activity: _.startCase(point.activity),
            user: point.user,
            month: moment(point.created_at).tz(req.headers['tz']).format('MMMM YYYY'),
            created_at: moment(point.created_at).tz(req.headers['tz']).format("Do"),
            updated_at: moment(point.updated_at).tz(req.headers['tz']).format("Do")
        });
    });

    var group = _(points).groupBy(x => x.month).map((value, key) => ({ month: key, transaction: value })).value();

    res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: {
            total: total,
            used: used,
            unused: unused.careager_cash,
            list: group
        }
    });
});


/**
 * [Follow API]
 * @param  {[raw json]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {middleware} next [description]
 * @return {[json]}        [description]
*/

router.post('/follow', xAccessToken.token, async function (req, res, next) {
    var rules = {
        follow: 'required'
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
        var userInfo = await User.findOne({ _id: user }).exec();
        var checkFollow = await User.findOne({ _id: req.body.follow }).exec();
        if (checkFollow) {
            if (user != checkFollow._id) {
                var get = await Follow.find({ user: user, follow: req.body.follow }).count().exec();
                if (get == 1) {
                    Follow.remove({ 'user': user, 'follow': checkFollow._id }).exec();
                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "You unfollow " + checkFollow.name,
                        responseData: {
                            _id: checkFollow._id,
                            id: checkFollow._id,
                            is_following: false
                        },
                    });

                }
                else {
                    Follow.create({ user: user, follow: checkFollow._id, created_at: new Date(), updated_at: new Date() }).then(async function (follow) {


                        var notify = {
                            receiver: [req.body.follow],
                            activity: "profile",
                            tag: "follow",
                            source: follow.user,
                            sender: user,
                            points: 0
                        }

                        fun.newNotification(notify);

                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "You follow " + checkFollow.name,
                            responseData: {
                                _id: checkFollow._id,
                                id: checkFollow._id,
                                is_following: true
                            },
                        });
                    }).catch(next);
                }
            }
            else {
                res.status(422).json({
                    responseCode: 422,
                    responseMessage: "Cannot follow yourself",
                    responseData: {}
                });
            }
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "User Not Foud",
                responseData: {}
            });
        }
    }
});


router.post('/upload', xAccessToken.token, async function (req, res, next) {
    var avatar = uuidv1() + ".jpeg";
    put_from_url(req.body.avatar, 'careager', avatar, function (err, response) {
        if (err)
            throw err;
        // console.log('Uploaded data successfully!');
    });
});

router.get('/followers', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var followers = [];
    var users = [];

    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }
    var page = Math.max(0, parseInt(page));

    await Follow.find({ follow: req.query.id }).cursor().eachAsync(async (u) => { users.push(u.user) });

    await User.find({ _id: { $in: users } })
        .sort({ created_at: -1 }).skip(config.perPage * page).limit(config.perPage)
        .cursor()
        .eachAsync(async (user) => {
            followers.push({
                _id: user.id,
                id: user.id,
                name: user.name,
                username: user.username,
                email: user.email,
                contact_no: user.contact_no,
                avatar: "https://s3.ap-south-1.amazonaws.com/" + config.BUCKET_NAME + "/avatar/" + user.avatar,
                account_info: user.account_info,
                joined: user.created_at,
            });
        });

    res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: followers,
    });
});

router.get('/following', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var followers = [];
    var users = [];

    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }
    var page = Math.max(0, parseInt(page));

    await Follow.find({ user: req.query.id }).cursor().eachAsync(async (u) => { users.push(u.follow) });

    await User.find({ _id: { $in: users } })
        .sort({ created_at: -1 }).skip(config.perPage * page).limit(config.perPage)
        .cursor()
        .eachAsync(async (user) => {
            followers.push({
                _id: user.id,
                id: user.id,
                name: user.name,
                username: user.username,
                email: user.email,
                contact_no: user.contact_no,
                avatar: "https://s3.ap-south-1.amazonaws.com/" + config.BUCKET_NAME + "/avatar/" + user.avatar,
                account_info: user.account_info,
                joined: user.created_at,
            });
        });

    res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: followers,
    });
});


/**
 * [Like Brand API]
 * @param  {[raw json]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {middleware} next [description]
 * @return {[json]}        [description]
*/

router.post('/like-brand', xAccessToken.token, async function (req, res, next) {
    var rules = {
        maker_id: 'required'
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
        var automaker = await Automaker.findById(req.body.maker_id).exec();
        if (automaker) {
            var get = await BrandLike.find({ 'automaker': automaker._id, user: user }).count().exec();
            if (get == 0) {
                BrandLike.create({ 'automaker': automaker._id, user: user }).then(async function (data) {
                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "You like " + automaker.maker,
                        responseData: {
                            _id: automaker._id,
                            id: automaker._id,
                            is_liked: true
                        }
                    });
                }).catch(next);
            }
            else {
                BrandLike.remove({ 'automaker': automaker._id, user: user }).exec();
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "You dislike " + automaker.maker,
                    responseData: {
                        _id: automaker._id,
                        id: automaker._id,
                        is_liked: false
                    }
                });
            }
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Error Occurred",
                responseData: {}
            });
        }
    }
});


/**
 * [Review API]
 * @param  {[raw json]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {middleware} next [description]
 * @return {[json]}        [description]
*/

router.post('/review/add', xAccessToken.token, async function (req, res, next) {
    var rules = {
        business: 'required',
        rating: 'required',
        type: 'required',
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
        var businessReview = new Object();

        var get = await User.find({ _id: req.body.business }).count().exec();
        if (get == 0) {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Business Not Found",
                responseData: {}
            });
        }
        else {
            if (req.body.type == "profile") {
                var check = await Review.find({ user: user, business: req.body.business, type: "profile" }).count().exec();
                if (check > 0) {
                    await Review.remove({ user: user, business: req.body.business, type: "profile" }).exec();
                }
            }
            req.body.user = user;
            req.body.created_at = new Date();
            req.body.updated_at = new Date();

            await Review.create(req.body).then(async function (data) {
                await Review.find({ _id: data._id })
                    .populate({ path: 'user', select: 'name username avatar avatar_address account_info' })
                    .cursor().eachAsync(async (review) => {
                        businessReview = {
                            _id: review._id,
                            id: review._id,
                            business: review.business,
                            rating: review.rating,
                            review: review.review,
                            type: review.type,
                            created_at: moment(review.created_at).tz(req.headers['tz']).format('ll'),
                            updated_at: moment(review.updated_at).tz(req.headers['tz']).format('ll'),
                            user: review.user
                        }
                    });

                // console.log(businessReview)


                if (data.type == "services") {
                    var point = {
                        user: user,
                        activity: "profile",
                        tag: "businessReview",
                        points: 10,
                        status: true
                    }
                    fun.addPoints(point);
                }

                var notify = {
                    receiver: [data.business],
                    sender: data.user,
                    activity: "profile",
                    tag: "review",
                    points: data.rating,
                }

                fun.newNotification(notify);

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Thank You For Your Review",
                    responseData: businessReview
                });
            }).catch(next);
        }
    }
});

router.post('/model/review/add', xAccessToken.token, async function (req, res, next) {
    var rules = {
        model: 'required',
        rating: 'required',
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
        var info = new Object();

        var get = await Model.find({ _id: req.body.model }).count().exec();
        if (get == 0) {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Model Not Found",
                responseData: {}
            });
        }
        else {
            req.body.user = user;
            req.body.created_at = new Date();
            req.body.updated_at = new Date();

            ModelReview.create(req.body).then(async function (data) {

                await ModelReview.find({ _id: data._id }).populate({ path: 'user', select: 'name username avatar avatar_address account_info' }).cursor().eachAsync(async (review) => {

                    info = {
                        user: review.user,
                        _id: review._id,
                        id: review._id,
                        model: review.model,
                        rating: review.rating,
                        review: review.review,
                        created_at: moment(review.created_at).tz(req.headers['tz']).format('ll')
                    };

                    // console.log(info)
                });

                var point = {
                    user: user,
                    activity: "modelReview",
                    points: 10,
                    status: true
                }

                fun.addPoints(point);

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Thank You For Your Review",
                    responseData: info
                });
            }).catch(next);
        }
    }
});

/**
    * [Update Profile]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

router.put('/profile/update', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    const count = await User.count({ _id: decoded.user }).exec();

    if (count == 1) {
        var data = {
            name: req.body.name,
            optional_info: {
                overview: req.body.overview,
            }
        };

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
        } else {
            User.findOneAndUpdate({ _id: decoded.user }, { $set: data }, { new: true }, function (err, doc) {
                if (err) {
                    var json = ({
                        responseCode: 400,
                        responseMessage: "Error Occurred",
                        responseData: err
                    });

                    res.status(400).json(json)
                } else {
                    var json = ({
                        responseCode: 200,
                        responseMessage: "Profile has been updated",
                        responseData: {}
                    });
                    res.status(200).json(json)
                }
            })
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



router.post('/roadside/claim-imitation', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    const count = await User.count({ _id: decoded.user }).exec();

    if (count == 1) {
        var data = {
            user: decoded.user,
            geometry: [req.body.longitude, req.body.latitude],
            created_at: new Date(),
            updated_at: new Date()
        }

        ClaimIntimation.create(data).then(async function (claim) {
            event.assistance(claim, req.headers['tz'])

            var json = ({
                responseCode: 200,
                responseMessage: "Location details are shared with our Roadside Assistance Team. You'll be contacted as soon as possible. Alternatively, you can also call us at 1800 843 4300",
                responseData: {}
            });
            res.status(200).json(json)

        });
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



/**
 * [Lead API]
 * @param  {[raw json]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {middleware} next [description]
 * @return {[json]}        [description]
*/



router.post('/callback/request', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var data = {}
    var details = await User.findById(decoded.user).exec();

    data.user = decoded.user;
    data.name = details.name;
    data.contact_no = details.contact_no;
    data.email = details.email;
    data.type = "Callback Request";
    data.geometry = [];
    data.source = req.headers['devicetype'];
    data.created_at = new Date();
    data.updated_at = new Date();

    Lead.create(data).then(async function (lead) {
        event.callbackRequest(lead, req.headers['tz'])
        var json = ({
            responseCode: 200,
            responseMessage: "Your details are shared with our Assistance Team. You'll be contacted as soon as possible. Alternatively, you can also call us at 1800 843 4300",
            responseData: {}
        });
        res.status(200).json(json)
    });
});





//----------------------------------------------------
/*
function serviceCharges(id) {
   return new Promise((resolve, reject) => {
       BusinessServicePackage.find({"_id": mongoose.Types.ObjectId(id)}).exec().then(function (category) {
           resolve(category)
       })
   })
};
*/

var put_from_url = function (url, bucket, key, callback) {
    request({
        url: url,
        encoding: null
    }, function (err, res, body) {
        if (err)
            return callback(err, res);
        s3.putObject({
            Bucket: bucket,
            Key: 'avatar/' + key,
            Body: body, // buffer
            ContentType: 'image/jpg',
            ACL: 'public-read',
        }, callback);
    })
}


/**
    * [Package Discount]
    * @param  {[raw json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @param  [{c- Category|s - Service|lc -  Labour Cost}]
    * @return {[json]}        [description]
*/

async function packageDiscount(p, car, cat, s, lc, tz) {
    var labour_cost = lc;
    var package = await UserPackage.findOne({ _id: p, car: car }).exec();
    // console.log(p)
    if (package) {
        var packageUsed = await PackageUsed.find({ user: package.user, label: s, car: car }).count().exec();
        var serverTime = moment.tz(new Date(), tz);
        var bar = moment.tz(package.expired_at, tz);
        var baz = bar.diff(serverTime);
        if (baz > 0) {
            package.discount.forEach(async function (dis) {
                if (dis.for == "category") {
                    if (dis.label == cat) {
                        // console.log(cat)
                        if (!packageDiscountOn.includes(s)) {
                            // console.log(cat)
                            labour_cost = lc - lc * (dis.discount / 100);
                        }
                    }
                }
                else if (dis.for == "specific") {
                    if (dis.label == s) {
                        // console.log(s)
                        if (dis.limit > packageUsed) {

                            packageDiscountOn.push(s)
                            labour_cost = lc - lc * (dis.discount / 100);
                        }
                    }
                }
            });

        }
    }
    // console.log(packageDiscountOn)
    return labour_cost;
}


function findObjectByKey(array, key, value) {
    for (var i = 0; i < array.length; i++) {
        if (array[i][key] == value) {
            return array[i];
        }
    }
    return array.length;
}


function isLiked(user, post) {
    return new Promise((resolve, reject) => {
        Like.find({ user: user, post: post }).count().exec().then(function (like) {
            resolve(like)
        })
    })
};

function getMedia(media) {
    var data = media;
    var result = _(data).groupBy(x => x.day).map((value, key) => ({ group: key, thumbnails: value })).value();
    return result;
}


module.exports = router
